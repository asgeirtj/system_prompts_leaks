#!/usr/bin/env node
// resync.mjs — THE re-sync path: one driver for the mechanical whole of a
// re-sync, emitting ONE machine-readable verdict (stdout + <out>/.resync-verdict.json):
//
//   package-build → remote-diff → package-validate → capture(new + contract-changed)
//
// Trust model: grades follow the user's SOURCES (gradeKey = H(sourceKey) —
// story files, owned previews, preview-affecting config, committed forks).
// DS source edits, CSS/token changes, and shared bundle changes re-upload
// bytes without re-grading; pipeline churn (skill/toolchain updates moving
// compiled artifacts while sources hold) keeps grades and triggers a sampled
// spot-check canary instead. Only components whose sources moved or that are
// new get captured and land in pendingGrade.
// For a deliberate audit of carried-forward grades, run the capture harness
// directly afterwards (compare.mjs / package-capture.mjs --components A,B
// --spot-check-components A,B).
//
// The agent runs the judgment half: fetch the anchor before this (DesignSync
// get_file → a local file), run the repo's own build when source may have
// changed, grade whatever pendingGrade lists, check validate's warn lines
// against NOTES.md's known list (a warn not recorded there is new — look),
// and do the attended upload when upload.any is true. A no-change re-sync
// skips capture entirely and uploads nothing.
//
// Usage:
//   node resync.mjs --config .design-sync/config.json --node-modules <nm>
//     --out ./ds-bundle [--remote <saved-sidecar.json>] [--entry <dist-entry>]
//     [--storybook-static <dir>] [--render-sample N] [--max-stories N]
//     [--no-render-check]
//
// Exit code: 0 when every mechanical stage passed — pendingGrade is NOT a
// failure (grading is the agent's job). Exception: an unfolded
// .design-sync/learnings/ file fails the verdict (exit 1) with every stage
// green — the learnings gate (see learningsUnmerged below). A failed stage stops the chain;
// later stages get skipped:"prior_failure"; the verdict is still written and
// the exit code mirrors the first failure — except a child's exit 2, which
// is clamped to 1 so that 2 stays the usage-error discriminator (exit 2 =
// no verdict).
//
// Verdict schema v2 (the CI contract — additive changes only):
// {
//   version: 2, ok, shape,
//   anchor,         // ok|not_provided|unreadable|malformed|shape_changed|unknown
//                   // ("unknown" = --remote was given but the diff artifact
//                   // is missing or predates this field)
//   learningsUnmerged, // unfolded .design-sync/learnings/*.md names — non-empty fails ok
//   stages: { build|diff|validate|capture: { ok, exit, skipped } },
//                   // skipped: null (ran) | "prior_failure" | "empty_worklist"
//   verification: { unchanged, changed, added, removed,
//                   pendingGrade,         // capture ran for these; grade their sheets
//                   canary },             // null, or {picks, churned, trigger}: sources
//                                         // held while artifacts (or the reference
//                                         // storybook) churned — grades kept; confirm
//                                         // the picks' [SPOT_CHECK] sheets
//   upload: { any, components, deletePaths, bundle, styling, aux } | null
//                   // null when the diff never produced an artifact — ok is
//                   // false then; fix the failed stage, don't upload
// }

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { validateConfig } from './lib/common.mjs';
import { sbBaseShaFor } from './lib/sync-hashes.mjs';

const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(`--${n}`); return i < 0 ? null : argv[i + 1]; };
{
  const VALUE_FLAGS = ['config', 'remote', 'node-modules', 'entry', 'out', 'storybook-static', 'render-sample', 'max-stories'];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--no-render-check') continue;
    if (argv[i].startsWith('--') && VALUE_FLAGS.includes(argv[i].slice(2))) { i++; continue; }
    console.error(`(unrecognized argument "${argv[i]}" — ignored)`);
  }
}
const CONFIG = flag('config');
const OUT = flag('out') && resolve(flag('out'));
const NM = flag('node-modules');
const REMOTE = flag('remote') && resolve(flag('remote'));
if (!CONFIG || !OUT || !NM) {
  console.error('usage: node resync.mjs --config <.design-sync/config.json> --node-modules <nm> --out <ds-bundle> [--remote <saved-sidecar.json>] …');
  process.exit(2);
}
// cwd sanity — the capture harnesses resolve .design-sync/ from cwd; a driver
// run from the wrong directory would scatter campaign state somewhere no
// later run will find it.
if (!existsSync(resolve(CONFIG))) {
  console.error(`✗ ${CONFIG} not found from ${process.cwd()} — run the driver from the repo root (the directory the --config path is relative to)`);
  process.exit(2);
}
if (!existsSync(resolve('.design-sync'))) {
  console.error(`✗ no .design-sync/ under ${process.cwd()} — run the driver from the repo root`);
  process.exit(2);
}
// Usage-class errors fail in usage-class time — a typo'd --node-modules
// would otherwise burn the whole build stage before an esbuild resolution
// error that never names the flag.
if (!existsSync(resolve(NM))) {
  console.error(`✗ --node-modules ${NM} does not exist`);
  process.exit(2);
}
// Config-shape pre-flight: a well-formed config with unknown or removed
// keys fails usage-class (exit 2, no verdict) before any stage spends time.
// Unparseable JSON is deliberately left to the build stage, which reports
// it with full context — the stale-artifact gating relies on that path
// staying a stage failure.
{
  let cfg, parsed = false;
  try { cfg = JSON.parse(readFileSync(resolve(CONFIG), 'utf8')); parsed = true; } catch { /* build reports it */ }
  if (parsed) {
    const errs = validateConfig(cfg);
    if (errs.length) {
      for (const e of errs) console.error(`✗ config: ${e}`);
      console.error(`✗ ${CONFIG}: fix the config and re-run — nothing was built`);
      process.exit(2);
    }
  }
}

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
// Every stage record passes through exactly one of runStage/skipStage, so
// "ran" is always `skipped === null`.
const stages = {};
let firstFailExit = null;

// Children: stdout piped to OUR stderr (the driver's stdout is verdict-only —
// a CI step parses it), stderr inherited so every [TAG] diagnostic streams
// live.
function runStage(name, script, args) {
  const r = spawnSync(process.execPath, [here(script), ...args], {
    cwd: process.cwd(), encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    // Piped stdout defaults to a 1MB cap — a chatty child would die with
    // ENOBUFS mid-stage. 64MB is effectively unbounded for build logs.
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.stdout) process.stderr.write(r.stdout);
  const exit = r.status ?? 1;
  stages[name] = { ok: exit === 0, exit, skipped: null };
  // The verdict's stages[].exit reports the child's TRUE code, but the
  // DRIVER's own exit clamps a child's 2 to 1 — 2 is reserved for usage
  // errors (no verdict written), and compare/package-capture legitimately
  // exit 2 for stage-class failures ([SB_REFERENCE_MISSING], [ZERO_MATCH]).
  if (exit !== 0 && firstFailExit === null) firstFailExit = exit === 2 ? 1 : exit;
  return exit === 0;
}
function skipStage(name, why) {
  stages[name] = { ok: null, exit: null, skipped: why };
}

const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };

// ── Stage 1-3: build → diff → validate. Each failure stops the chain.
let aborted = false;
{
  const buildArgs = ['--config', resolve(CONFIG), '--node-modules', resolve(NM), '--out', OUT];
  if (flag('entry')) buildArgs.push('--entry', resolve(flag('entry')));
  if (flag('storybook-static')) buildArgs.push('--storybook-static', resolve(flag('storybook-static')));
  if (!runStage('build', './package-build.mjs', buildArgs)) aborted = true;
}
if (aborted) { skipStage('diff', 'prior_failure'); } else {
  const args = ['--local', OUT];
  if (REMOTE) args.push('--remote', REMOTE);
  if (!runStage('diff', './lib/remote-diff.mjs', args)) aborted = true;
}
// The diff artifact scopes both the validate stage (render-check tiering
// below) and the capture stage. Gated on the diff having succeeded THIS run:
// a build that dies before package-build's OUT wipe leaves the PREVIOUS
// run's artifacts on disk, and reading them would scope this run by a prior
// run's diff.
const syncDiff = stages.diff?.ok ? readJson(join(OUT, '.sync-diff.json')) : null;

if (aborted) { skipStage('validate', 'prior_failure'); } else {
  const args = [OUT];
  if (flag('render-sample')) args.push('--render-sample', flag('render-sample'));
  if (argv.includes('--no-render-check')) args.push('--no-render-check');
  const userScoped = argv.includes('--render-sample') || argv.includes('--no-render-check');
  // No explicit render flag → scope the render check by what the diff proved.
  // With a healthy anchor, bundle+styling hashes equal, and nothing
  // changed/added/render-churned, every preview's render inputs are
  // byte-identical to the last upload: the diff pins the anchor to the fresh
  // sidecar, and remote-diff's fatal bundle-sha check plus validate's
  // always-on [SYNC_STALE] recompute pin the sidecar to disk. Re-rendering
  // identical bytes tests the local chromium environment, not the artifacts.
  // Nothing to upload → skip the render check; only render-inert files to
  // ship (docs/anchor refresh — a .d.ts/.prompt.md edit re-ships the
  // bundle via its header hashes and takes the full check) → sample. Anything render-affecting
  // moved, or no healthy anchor → full, as before.
  if (!userScoped && syncDiff?.anchorReason === 'ok' && syncDiff.upload && !syncDiff.upload.bundle && !syncDiff.upload.styling
      && !(syncDiff.changed?.length || syncDiff.added?.length || syncDiff.renderChurned?.length)) {
    if (!syncDiff.upload?.any) {
      args.push('--no-render-check');
      console.error('render check: skipped — anchored no-change re-sync (nothing uploads; [SYNC_STALE] and the file-shape checks still run). Pass --render-sample 0 to force the full pass.');
    } else {
      args.push('--render-sample', '10');
      console.error('render check: sampled (~10) — anchor ok, no component moved; nothing that affects rendering ships. Pass --render-sample 0 to force the full pass.');
    }
  }
  if (!runStage('validate', './package-validate.mjs', args)) aborted = true;
}

// ── Stage 4: capture, scoped to the diff's worklist (new + contract-changed).
// Artifact reads are gated on their producing stage having succeeded THIS
// run (syncDiff above is gated the same way): a build that dies before
// package-build's OUT wipe (malformed config, [OUT_UNSAFE]) leaves the
// PREVIOUS run's artifacts on disk, and reading them would dress a failed
// run in the prior run's anchor and partitions.
const sidecar = stages.build.ok ? readJson(join(OUT, '_ds_sync.json')) : null;
const shape = sidecar?.shape ?? 'storybook';
const gradeCacheDir = shape === 'storybook'
  ? resolve('.design-sync', '.cache', 'compare')
  : resolve('.design-sync', '.cache', 'review');
let worklist = [];
let brokenAuthored = [];
// The learnings fold gate (read unconditionally here, enforced at verdict
// assembly) must be known BEFORE the drift-baseline refresh in the capture
// section: a learnings-failed verdict is not acted on, so it must preserve
// the one-shot drift signal for the post-fold retry — same contract as a
// failed capture.
let learningsUnmerged = [];
try { learningsUnmerged = readdirSync(resolve('.design-sync', 'learnings')).filter((f) => f.endsWith('.md')).sort(); } catch { /* no dir — nothing unfolded */ }
let canary = null;
let canaryPicks = [];
if (aborted) {
  skipStage('capture', 'prior_failure');
} else if (!syncDiff) {
  // diff exited 0 but its artifact is unreadable — treat as a failure, not a skip.
  skipStage('capture', 'prior_failure');
  if (firstFailExit === null) firstFailExit = 1;
  aborted = true;
  console.error('✗ .sync-diff.json unreadable after a clean diff stage — cannot scope the capture');
} else {
  worklist = [...(syncDiff.changed ?? []), ...(syncDiff.added ?? [])];
  const manifest = shape === 'storybook' ? readJson(join(OUT, '.stories-map.json')) : null;
  // What the capture harness can actually capture: compare.mjs needs stories
  // in the manifest; package-capture needs a compiled _preview/<Name>.js
  // (floor-card components are the deliberate baseline, not gradable work).
  const isCapturable = shape === 'storybook'
    ? (manifest
      ? (() => { const s = new Set((manifest.components ?? []).filter((c) => (c.stories ?? []).length).map((c) => c.name)); return (n) => s.has(n); })()
      : null)
    : (n) => existsSync(join(OUT, '_preview', `${n}.js`));
  if (worklist.length && isCapturable) {
    // Passing an uncapturable member through would either fail the stage
    // ([ZERO_MATCH]) or — since no capture json is ever written for it —
    // leave it forever in pendingGrade with no sheet to grade. The dropped
    // members still re-ship via the upload partition.
    {
      const dropped = worklist.filter((n) => !isCapturable(n));
      // An AUTHORED preview with no compiled output is not a deliberate
      // floor card — its compile failed this build (package-build warns
      // `! preview build failed` but exits 0). Dropping it silently would
      // ship the floor-card regression under an ok:true verdict and anchor
      // it as verified-by-upload. Surface it as pending instead.
      // PACKAGE shape only: storybook's capturable means "has manifest
      // stories", not "preview compiled" — there, a story-less component
      // with an owned preview (all stories skipped via cfg.overrides) is a
      // legitimate state, and flagging it would park it in pendingGrade
      // with no capture json ever coming to clear it.
      const broken = shape !== 'storybook' ? dropped.filter((n) => existsSync(resolve('.design-sync', 'previews', `${n}.tsx`))) : [];
      const floor = dropped.filter((n) => !broken.includes(n));
      if (broken.length) console.error(`(${broken.join(', ')}: authored preview exists but did not compile this build — see '! preview build failed' in the build log; listed in pendingGrade until it compiles)`);
      if (floor.length) console.error(`(${floor.join(', ')}: nothing to capture — re-ships via the upload partition, no grading needed)`);
      worklist = worklist.filter((n) => isCapturable(n));
      brokenAuthored = broken;
    }
  }

  // ── Tier-1 canary: sources held but artifacts churned (renderChurned) or
  // the reference storybook moved since the last capture (missing
  // .sb-state.json ⇒ no drift trigger — parity; nothing samples that today).
  // Grades stay; min(5, pool) is re-captured via --spot-check-components for
  // the agent to confirm. The single-mode/portal pick is mandatory — the
  // render check never exercises a single-mode card's non-primary stories.
  let sbCur = null;
  let refDrift = false;
  {
    const churned = (syncDiff.renderChurned ?? []).filter((n) => isCapturable?.(n));
    if (shape === 'storybook') {
      const sbDir = flag('storybook-static') ? resolve(flag('storybook-static')) : manifest?.storybookStatic;
      if (sbDir && existsSync(join(sbDir, 'iframe.html'))) {
        sbCur = sbBaseShaFor(resolve(sbDir));
        const state = readJson(join(gradeCacheDir, '.sb-state.json'));
        if (state?.sbBaseSha) refDrift = sbCur !== state.sbBaseSha;
      }
    }
    const pool = [...new Set([...churned, ...(refDrift ? (syncDiff.unchanged ?? []).filter((n) => isCapturable?.(n)) : [])])]
      .filter((n) => !worklist.includes(n));
    if (pool.length) {
      const cfgObj = readJson(resolve(CONFIG)) ?? {};
      const capJson = new Map();
      const capOf = (n) => { if (!capJson.has(n)) capJson.set(n, readJson(join(gradeCacheDir, `${n}.json`))); return capJson.get(n); };
      // Prefer picks with recorded verdicts to confirm against; one without
      // is captured fresh and surfaces in pendingGrade (bounded by K).
      const clean = (n) => capOf(n)?.pendingGrade === false;
      // Non-grid card modes (single/column) render a different default view
      // than the solo-graded stories — keep at least one in the picks.
      const single = (n) => ['single', 'column'].includes(cfgObj.overrides?.[n]?.cardMode) || capOf(n)?.portal === true;
      const picks = new Set();
      const singles = pool.filter(single);
      if (singles.length) picks.add(singles.find(clean) ?? singles[0]);
      const rest = pool.filter((n) => !picks.has(n));
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      rest.sort((a, b) => Number(clean(b)) - Number(clean(a))); // stable: random within clean/unclean
      for (const n of rest) { if (picks.size >= 5) break; picks.add(n); }
      canaryPicks = [...picks];
      canary = { picks: canaryPicks, churned, trigger: refDrift && churned.length ? 'both' : refDrift ? 'reference_drift' : 'render_churn' };
      console.error(`◉ canary: ${churned.length ? `${churned.length} component(s) re-rendered with unchanged sources` : ''}${churned.length && refDrift ? '; ' : ''}${refDrift ? 'the reference storybook changed under carried grades' : ''} — spot-checking ${canaryPicks.length} with grades kept: ${canaryPicks.join(', ')}`);
    }
  }

  if (!worklist.length && !canaryPicks.length) {
    skipStage('capture', 'empty_worklist');
    console.error('capture skipped — no capturable changed or added components');
  } else {
    // A canary with an empty worklist still runs — scoped to the picks so
    // the harness keeps its scoped-run semantics (no prune/report/sampler).
    const args = ['--out', OUT, '--components', (worklist.length ? worklist : canaryPicks).join(',')];
    if (canaryPicks.length) args.push('--spot-check-components', canaryPicks.join(','));
    if (shape === 'storybook') {
      const sb = flag('storybook-static');
      if (sb) args.push('--storybook-static', resolve(sb));
      if (flag('max-stories')) args.push('--max-stories', flag('max-stories'));
      runStage('capture', './storybook/compare.mjs', args);
    } else {
      runStage('capture', './package-capture.mjs', args);
    }
  }

  // The reference-drift baseline is owned HERE, not by compare: a scoped
  // compare run verifies only its own components and must not consume the
  // drift signal for the carried set. A clean (or no-drift) driver run is
  // the designed one-shot consumption — seed/refresh the baseline; a failed
  // capture preserves the signal for the retry — and so does a verdict that
  // will fail on the learnings gate when drift was sampled (the post-fold
  // re-run is the one acted on); seeding and no-drift refreshes destroy no
  // signal and proceed regardless.
  // Consume-aware: a drifted run refreshes the baseline only if it actually
  // sampled the carried set — an anchor-less run has an empty unchanged
  // partition (empty pool), and writing there would destroy the one-shot
  // drift signal while locally-cached grades carried unverified. First-time
  // seeding and no-drift refreshes are unaffected.
  if (sbCur && stages.capture.ok !== false && (!refDrift || (canaryPicks.length && learningsUnmerged.length === 0))) {
    try {
      mkdirSync(gradeCacheDir, { recursive: true });
      writeFileSync(join(gradeCacheDir, '.sb-state.json'), JSON.stringify({ sbBaseSha: sbCur }, null, 2));
    } catch { /* best-effort */ }
  }
}

// ── Verdict assembly — artifacts only, never stderr.
// pendingGrade — each harness writes a `pendingGrade` bit into its fresh
// capture json (its own post-capture verdict-state, in its own vocabulary),
// so the driver reads one bit instead of re-implementing either harness's
// grading predicate. Missing json or missing bit (stale staged scripts) is
// conservatively pending. Scans worklist ∪ canary picks: a demoted pick must
// surface here, not accumulate as silent pending state.
const scanSet = [...new Set([...worklist, ...canaryPicks])];
// Capture never ran → nothing is freshly pending; ran and failed → the whole
// scope is pending (the verdict is ok:false anyway); ran clean → derive.
const pendingGrade = [...new Set([
  ...(stages.capture.skipped !== null ? [] : (stages.capture.ok
    ? scanSet.filter((name) => readJson(join(gradeCacheDir, `${name}.json`))?.pendingGrade !== false)
    : scanSet)),
  // Authored previews whose compile failed this build: nothing was captured
  // for them, but they are NOT done — the floor card is currently shipping
  // in place of the authored preview.
  ...brokenAuthored,
])];

// The driver is the §4d closing receipt, but its capture is scoped, so
// compare's full-run-only [LEARNINGS_UNMERGED] advisory can never fire here.
// Check the learnings dir directly: an unfolded learnings file means the
// mandatory §4c fold was missed — fail the verdict rather than let it ship.
if (learningsUnmerged.length) {
  console.error(`✗ [LEARNINGS_UNMERGED] unfolded learnings file(s): ${learningsUnmerged.join(', ')} — fold into NOTES.md and delete them (your shape's between-waves fold step), then re-run`);
}
const ok = learningsUnmerged.length === 0 && Object.values(stages).every((s) => (s.skipped === null ? s.ok : s.skipped !== 'prior_failure'));
const verdict = {
  version: 2,
  ok,
  shape,
  anchor: syncDiff?.anchorReason ?? (REMOTE ? 'unknown' : 'not_provided'),
  learningsUnmerged,
  stages,
  verification: {
    unchanged: syncDiff?.unchanged ?? [],
    changed: syncDiff?.changed ?? [],
    added: syncDiff?.added ?? [],
    removed: syncDiff?.removed ?? [],
    pendingGrade,
    canary,
  },
  upload: syncDiff?.upload ?? null,
};

// stdout is the verdict's primary channel; the file copy is best-effort.
// Two deliberate non-writes: when the build never created OUT (creating it
// here would leave a dir holding only this file, tripping package-build's
// [OUT_UNSAFE] guard on the very re-run the verdict asks for), and when the
// write itself fails (unwritable path, OUT is a regular file) — neither may
// swallow the stdout verdict or change the exit code.
try {
  if (existsSync(OUT)) {
    writeFileSync(join(OUT, '.resync-verdict.json'), JSON.stringify(verdict, null, 2) + '\n');
  } else {
    console.error('(.resync-verdict.json not written — the build never created --out; verdict on stdout only)');
  }
} catch (e) {
  console.error(`(.resync-verdict.json not written: ${String(e.message ?? e).split('\n')[0]} — verdict on stdout only)`);
}
process.stdout.write(JSON.stringify(verdict, null, 2) + '\n');
process.exit(ok ? 0 : (firstFailExit ?? 1));
