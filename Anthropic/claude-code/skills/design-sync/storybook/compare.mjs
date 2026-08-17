#!/usr/bin/env node
// Capture harness for matching self-contained previews (<Name>.html rendering
// from _ds_bundle.js) against the repo's own storybook render — the fidelity
// ground truth. This script captures the TWO TRUE IMAGES per story and pairs
// them; it does NOT judge visual similarity and computes no similarity
// heuristics (pixel diffs and text/font scores mislead whenever layout or
// framing legitimately differs — the agent's eyes on the real screenshots are
// the judge). Grading is the working agent's job: Read the sheet PNG
// (storybook | preview), decide match/close/mismatch per story, and record it
// in the grade file (see GRADE FILES below). The only verdicts this script
// emits are factual: the story didn't render in storybook (sb-error), no
// preview cell pairs with the story (unpaired), the cell threw (error).
//
// Per paired story it captures, at full native resolution:
//   <out>/_screenshots/compare/raw/<base>__sb.png   storybook root screenshot
//   <out>/_screenshots/compare/raw/<base>__ds.png   preview cell screenshot
// and a sheet PNG per component (<out>/_screenshots/compare/<group>__<Name>.png,
// storybook | preview per story; images are shrunk to fit — the raw/ PNGs are
// the full-resolution authority when in doubt). Sheets and shots are transient
// (package-build wipes <out>).
//
// ALL state is campaign-local and gitignored (.design-sync/.cache/compare/):
//   <Name>.grade.json  the grading agent's verdicts (see GRADE FILES below)
//   <Name>.json        capture facts — pairing, shot paths, srcSha,
//                      spot-check anchors. Reconstructible.
// Nothing is committed — CROSS-MACHINE carry-forward is derived from the
// uploaded project instead (lib/remote-diff.mjs vs its _ds_sync.json):
// a component unchanged vs the upload was already verified at upload time.
//
// LIFECYCLE — one invariant: grades follow the user's SOURCES. The grade
// key is the build-stamped sourceKey (story files, owned preview source,
// story set, preview-affecting config, committed forks — lib/sync-hashes.mjs).
// Styling, bundle, and pipeline-internal churn (compiled bytes, generated
// html, toolchain) never invalidate: artifact churn on source-stable
// components is verified by a sampled [SPOT_CHECK], not wholesale re-grading.
// - Grade key unchanged + fully graded match/close → skipped outright
//   ("carried forward"); no capture.
// - Grade key changed → recapture, grade cleared, re-grade from the fresh
//   sheet. [STORY_CHANGED] marks the stories whose contract moved (an owned
//   preview must be edited); without it, re-grading is usually all that's
//   needed. Screenshot bytes are never compared — pixel jitter is irrelevant.
// - [SPOT_CHECK]: full runs re-capture a couple of carried-forward
//   components (grades kept) when shared inputs changed, so the lockstep
//   assumption keeps earning trust. --spot-check N tunes it (0 disables);
//   --spot-check-components A,B names the picks explicitly with the same
//   semantics, and is honored on scoped runs too (the §7 step-4 audit).
// - --force recaptures everything AND clears all grades (fresh verdicts) —
//   for systemic re-verification, not casual sheet regeneration.
//
// GRADE FILES — written by the agent after Reading the images:
//   {"stories": {"<story name>": {"verdict": "match|close|mismatch", "note": "…"}}}
//
// Safe for parallel subagents when scoped via --components to disjoint sets:
// per-component outputs don't collide, and the aggregate report
// (<out>/.compare-report.json, full runs only) is skipped.
//
// Usage:
//   node storybook/compare.mjs --out ./ds-bundle \
//     --storybook-static .design-sync/sb-reference \
//     [--components Button,Tabs] [--max-stories 6] [--force] [--spot-check 2]
//     [--spot-check-components Button,Tabs]

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { escapeHtml, exportName, hypothesisLine } from '../lib/common.mjs';
import { KEY_RECIPE, gradeKeyFrom, renderHashFor, sbBaseShaFor } from '../lib/sync-hashes.mjs';
import { serveDir } from './http-serve.mjs';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i < 0 ? d : argv[i + 1]; };
// Unconsumed argv is silently dead otherwise — `--components A B` runs only A.
{
  const VALUE_FLAGS = ['out', 'components', 'max-stories', 'storybook-static', 'spot-check', 'spot-check-components'];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--force') continue;
    if (argv[i].startsWith('--') && VALUE_FLAGS.includes(argv[i].slice(2))) { i++; continue; }
    console.error(`(unrecognized argument "${argv[i]}" — ignored; multi-component scoping is comma-separated: --components A,B)`);
  }
}
const OUT = flag('out') && resolve(flag('out'));
const ONLY = flag('components') ? new Set(flag('components').split(',').map((s) => s.trim()).filter(Boolean)) : null;
const SPOT_PICKS = flag('spot-check-components') ? flag('spot-check-components').split(',').map((s) => s.trim()).filter(Boolean) : [];
const MAX_STORIES = Number(flag('max-stories', '6')) || 6;
const FORCE = argv.includes('--force');
if (!OUT || !existsSync(join(OUT, '.stories-map.json'))) {
  console.error('usage: node storybook/compare.mjs --out <ds-bundle> --storybook-static <dir> [--components A,B]');
  console.error('(requires <out>/.stories-map.json — run package-build.mjs first)');
  process.exit(2);
}
const manifest = JSON.parse(readFileSync(join(OUT, '.stories-map.json'), 'utf8'));
// A manifest stamped under a different recipe can't vouch for its keys —
// drop them so every consumer below (key derivation, shim, capture-json
// provenance) falls back to the render-contract keying, same as the other
// recipe-gated consumers (remote-diff, preview-rebuild).
if (manifest.keyRecipe !== KEY_RECIPE) for (const c of manifest.components ?? []) delete c.sourceKey;
const SB = resolve(flag('storybook-static', manifest.storybookStatic ?? ''));
if (!SB || !existsSync(join(SB, 'iframe.html'))) {
  console.error(`[SB_REFERENCE_MISSING] ${SB || '(unset)'} has no iframe.html — build the reference storybook first (npx storybook build -o .design-sync/sb-reference) and pass --storybook-static.`);
  process.exit(2);
}

const comps = manifest.components.filter((c) => c.stories.length && (!ONLY || ONLY.has(c.name) || SPOT_PICKS.includes(c.name)));
// A valid pick must not mask a mistyped --components scope — [ZERO_MATCH]
// checks the scope on its own before picks widen comps.
if (ONLY && !comps.some((c) => ONLY.has(c.name))) {
  console.error(`[ZERO_MATCH] none of ${[...ONLY].join(', ')} have stories in .stories-map.json`);
  process.exit(2);
}
if (!comps.length) {
  console.error(ONLY ? `[ZERO_MATCH] none of ${[...ONLY].join(', ')} have stories in .stories-map.json` : '[ZERO_MATCH] no components with stories — compare needs the storybook shape');
  process.exit(2);
}

let pw;
try { pw = await import('playwright'); }
catch {
  console.error('[NO_CHROMIUM] compare requires playwright — npm i playwright && npx playwright install chromium');
  process.exit(2);
}

const squash = (s) => String(s ?? '').replace(/[^a-z0-9]/gi, '').toLowerCase();

// Input fingerprinting for the skip rule: BASE = the whole reference
// storybook + everything shared in the bundle (by exclusion, so a new asset
// dir is automatically covered — no list to maintain); per-component adds its
// preview js, its component dir, and its story set. Hashing is IO-bound — a
// second or two even for big builds, paid once per run. Same machine +
// unchanged inputs ⇒ identical renders, so skipping capture is sound; any
// instability (e.g. cross-machine sb rebuild) just forces a recapture, never
// a stale verdict. Dot-entries are excluded everywhere: they're converter/
// compare scratch that changes every run.
function hashFile(h, p, label) {
  h.update(label);
  try { h.update(readFileSync(p)); } catch { h.update('∅'); }
}
function hashDir(h, dir, prefix, skip) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { h.update('∅'); return; }
  for (const e of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (e.name.startsWith('.') || skip?.has(e.name)) continue;
    if (e.isDirectory()) hashDir(h, join(dir, e.name), `${prefix}${e.name}/`);
    else hashFile(h, join(dir, e.name), `${prefix}${e.name}`);
  }
}
// The grade key is the sourceKey package-build STAMPED into the manifest —
// the same value it wrote into the uploaded _ds_sync.json sidecar, so local
// grade carry-forward and remote verified-by-upload can never disagree, and
// the key always describes the artifacts this build produced. Styling,
// bundle, and pipeline internals are NOT part of it — only the user's
// sources re-grade. A manifest from pre-sourceKey scripts falls back to the
// old render-contract key (unknown ⇒ today's behavior).
const oldGradeKeyFor = (c) => gradeKeyFrom(renderHashFor(OUT, c, { stories: c.stories, srcSha: c.srcSha ?? null }));
const gradeKeyFor = (c) => (c.sourceKey ? gradeKeyFrom(c.sourceKey) : oldGradeKeyFor(c));
// Recorded to power the [REFERENCE_STALE?] hint and the driver's
// reference-drift spot-check trigger. Not a skip input.
const SB_BASE_SHA = sbBaseShaFor(SB);
const outH = createHash('sha256');
hashDir(outH, OUT, 'out/', new Set(['_screenshots', '_preview', 'components', '_ds_sync.json']));
const OUT_BASE_SHA = outH.digest('hex');

const { srv: sbSrv, port: sbPort } = await serveDir(SB);
const { srv: outSrv, port: outPort } = await serveDir(OUT);
const cmpDir = join(OUT, '_screenshots', 'compare');
const rawDir = join(cmpDir, 'raw');
const cacheDir = resolve('.design-sync', '.cache', 'compare');
mkdirSync(rawDir, { recursive: true });
mkdirSync(cacheDir, { recursive: true });
// Self-defending: even a sloppy `git add .design-sync` can't commit the cache.
writeFileSync(join(resolve('.design-sync', '.cache'), '.gitignore'), '*\n');

// Pre-pass (no browser): each component's contract state, computed once.
const pre = new Map();
const migrationPool = [];
for (const c of comps) {
  const gradeKey = gradeKeyFor(c);
  let prevCapture = null;
  let grade = null;
  try { prevCapture = JSON.parse(readFileSync(join(cacheDir, `${c.name}.json`), 'utf8')); } catch { /* first capture */ }
  try { grade = JSON.parse(readFileSync(join(cacheDir, `${c.name}.grade.json`), 'utf8')); } catch { /* ungraded */ }
  // Adoption shim — pre-recipe capture jsons carry old-recipe gradeKeys;
  // without adoption the first post-flip run would clear every grade.
  // Removable once pre-recipe local state has aged out.
  if (c.sourceKey && prevCapture && prevCapture.gradeKey !== gradeKey && (prevCapture.keyRecipe ?? 0) !== KEY_RECIPE) {
    const adopt = () => {
      prevCapture = { ...prevCapture, gradeKey, sourceKey: c.sourceKey, keyRecipe: KEY_RECIPE };
      writeFileSync(join(cacheDir, `${c.name}.json`), JSON.stringify(prevCapture, null, 2));
    };
    if (prevCapture.gradeKey === oldGradeKeyFor(c)) {
      // The artifacts are byte-identical to the verified capture — adopt.
      adopt();
    } else if (prevCapture.srcSha != null && c.srcSha != null && prevCapture.srcSha === c.srcSha &&
        !existsSync(resolve('.design-sync', 'previews', `${c.name}.tsx`))) {
      // Artifacts churned but story sources provably didn't (and no OWNED
      // preview, which srcSha can't vouch for) — adopt; sampled below. A
      // null srcSha means story-source resolution FAILED — identity unknown
      // is not evidence of stability, so null===null must not adopt.
      adopt();
      migrationPool.push(c.name);
    }
    // else: no evidence of source stability — normal rules, re-grades once.
  }
  // Grade keys must equal story names EXACTLY (spaces and all) — a PascalCase
  // or export-style key silently never joins, surfacing much later as a
  // confusing "awaiting grade".
  if (grade?.stories) {
    const known = new Set(c.stories.map((s) => s.name));
    const unknown = Object.keys(grade.stories).filter((k) => !known.has(k));
    if (unknown.length) {
      console.error(`  (grade key(s) matching no story for ${c.name}: ${unknown.slice(0, 4).join(', ')} — keys must equal story names exactly, e.g. ${JSON.stringify(c.stories[0]?.name ?? '')})`);
    }
  }
  const storyNames = c.stories.slice(0, MAX_STORIES).map((s) => s.name);
  const fullyGraded = !!grade?.stories && storyNames.length > 0 &&
    storyNames.every((n) => ['match', 'close'].includes(grade.stories[n]?.verdict));
  pre.set(c.name, { gradeKey, prevCapture, grade, fullyGraded });
}

// Spot checks — the lockstep assumption (shared rebuilds render the same
// preview↔story relationship on both sides) should keep earning trust, not
// be trusted blindly after the first sync. On full runs, re-capture a couple
// of carried-forward components whose shared inputs changed since their
// capture, WITHOUT clearing their grades: the agent confirms the fresh sheet
// still matches the recorded verdicts. Their contracts are unchanged, so a
// divergence can't be a component bug — it's systemic by construction. And
// because a systemic failure shows up in any component, a RANDOM sample is
// the right pick: no rotation state, no filesystem assumptions.
const SPOT_CHECK_N = Number(flag('spot-check', '2'));
const spotChecks = new Set();
// Manual picks (--spot-check-components A,B): the sampler's semantics —
// re-capture, grades KEPT, confirm the fresh sheet against the recorded
// verdicts — but with explicit names, and honored on scoped runs where the
// sampler is off (the §7 step-4 audit names its picks explicitly).
// A pick that isn't a fully-graded carried-forward component falls through
// to the normal rules — captured, graded fresh — which is what that state
// needs anyway (there are no trusted verdicts to confirm against).
if (FORCE && SPOT_PICKS.length) {
  console.error('  (--force demands fresh verdicts everywhere — --spot-check-components picks are captured and re-graded like everything else)');
}
for (const name of SPOT_PICKS) {
  const p = pre.get(name);
  // Unknown names warn even under --force — a typo should never be silent.
  if (!p) { console.error(`(spot-check pick "${name}" has no stories in .stories-map.json — ignored)`); continue; }
  if (FORCE) continue;
  if (p.fullyGraded && p.prevCapture?.gradeKey === p.gradeKey) spotChecks.add(name);
  else console.error(`  (spot-check pick ${name} is not a fully-graded carried-forward component — captured under the normal rules instead)`);
}
if (spotChecks.size) {
  console.error(`◉ [SPOT_CHECK] re-verifying ${spotChecks.size} requested carried-forward component(s): ${[...spotChecks].join(', ')} — grades kept; Read their fresh sheets and confirm they still match the recorded grades. Divergence remediation scales with the churned set: a couple of components diverge — re-grade just those; widespread — stop, diagnose, then --force a full pass.`);
}
if (!ONLY && !FORCE && SPOT_CHECK_N > 0) {
  const candidates = comps.filter((c) => {
    const p = pre.get(c.name);
    return !spotChecks.has(c.name) && p.fullyGraded && p.prevCapture?.gradeKey === p.gradeKey &&
      (p.prevCapture.sbBaseSha !== SB_BASE_SHA || p.prevCapture.outBaseSha !== OUT_BASE_SHA);
  });
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const sampled = candidates.slice(0, SPOT_CHECK_N).map((c) => c.name);
  for (const n of sampled) spotChecks.add(n);
  if (sampled.length) {
    console.error(`◉ [SPOT_CHECK] re-verifying ${sampled.length} carried-forward component(s) after shared-input changes: ${sampled.join(', ')} — Read their fresh sheets and confirm they still match the recorded grades. Divergence remediation scales with the churned set: a couple of components diverge — re-grade just those; widespread — stop, diagnose, then --force a full pass.`);
  }
}
// Migration canary: adopted-on-evidence components get a one-time sampled
// confirmation — min(5, pool), portal pick mandatory (the render check never
// exercises a single-mode card's non-primary stories). The rest carries on
// trust — an uncapped check would be the storm adoption exists to avoid.
if (migrationPool.length && !FORCE) {
  const eligible = migrationPool.filter((n) => {
    const p = pre.get(n);
    return p.fullyGraded && p.prevCapture?.gradeKey === p.gradeKey && !spotChecks.has(n);
  });
  const picks = new Set(eligible.filter((n) => pre.get(n).prevCapture?.portal).slice(0, 1));
  const rest = eligible.filter((n) => !picks.has(n));
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  for (const n of rest) { if (picks.size >= 5) break; picks.add(n); }
  for (const n of picks) spotChecks.add(n);
  console.error(`◉ [SPOT_CHECK] grade-key migration: adopted ${migrationPool.length} component(s) whose artifacts churned while their sources held${picks.size ? `; re-verifying ${picks.size} of them: ${[...picks].join(', ')} — grades kept; Read their fresh sheets and confirm they still match the recorded grades` : ''}.`);
}

const report = [];
const blockedHosts = new Set();
let warnedStaleRef = false;
let browser;
try {
  browser = await pw.chromium.launch(
    process.env.DS_CHROMIUM_PATH ? { executablePath: process.env.DS_CHROMIUM_PATH } : {},
  );
  const sbPage = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const dsPage = await browser.newPage({ viewport: { width: 900, height: 700 } });
  // Sandboxed shells (Claude Code's Bash sandbox, CI egress policies) are
  // inherited by this browser: external story assets (CDN images/fonts) fail
  // to load on BOTH panels, so grades can pass while claude.ai/design users
  // see different output — the same oracle-blind class as missing fonts.
  // Track failed external requests and warn loudly at the end.
  for (const p of [sbPage, dsPage]) {
    p.on('requestfailed', (r) => {
      if (r.failure()?.errorText === 'net::ERR_ABORTED') return; // benign (navigation aborts)
      try {
        const u = new URL(r.url());
        if (u.hostname !== '127.0.0.1' && u.hostname !== 'localhost') blockedHosts.add(u.hostname);
      } catch { /* non-URL request */ }
    });
  }
  // Render stabilization — for GRADING comparability, not hashing (grades
  // are keyed to contracts, never to pixels): reduced-motion and a frozen
  // Date (timers still run — setFixedTime, not install) make both panels
  // show the same settled frame — same date rendered on both sides, spinners
  // at a consistent state — so the agent judges content, not animation
  // timing. Verification-only: shipped previews are untouched and fully
  // animated.
  for (const p of [sbPage, dsPage]) {
    await p.emulateMedia({ reducedMotion: 'reduce' }).catch(() => {});
    await p.clock?.setFixedTime(new Date('2030-01-15T12:00:00Z')).catch(() => {});
  }
  // Fast-forward finite animations, reset infinite ones (spinners) to their
  // initial state — playwright-native, no CSS injection that could strand
  // fill-mode entrance animations at opacity 0.
  const SHOT = { animations: 'disabled', timeout: 8_000 };
  // Webfont activation and image decode can land after networkidle — settle
  // both before shooting so neither panel is caught mid-font-swap or with
  // undecoded images (the sheets must show the settled rendering).
  async function settleRender(page) {
    await page.evaluate(() => Promise.all([
      document.fonts?.ready,
      ...[...document.images].map((i) => i.decode().catch(() => {})),
    ])).catch(() => {});
  }
  let dsErrs = [];
  dsPage.on('pageerror', (e) => dsErrs.push(String(e).split('\n')[0]));

  // Capture one storybook story: the true root screenshot. Storybook 7+
  // renders into #storybook-root; v6 into #root. CSS-in-JS runtimes often
  // inject <style>/<script> as the first root child and waitForSelector
  // locks onto the first match — wait for CONTENT, not any child.
  const SB_ROOT = '#storybook-root, #root';
  const SB_CONTENT = `:is(${SB_ROOT}) > :not(style,script,link,meta,template)`;
  async function captureStory(id) {
    try {
      await sbPage.goto(`http://127.0.0.1:${sbPort}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`, { waitUntil: 'networkidle', timeout: 20_000 });
    } catch { /* fall through to the selector wait — slow asset ≠ broken story */ }
    const loaded = await sbPage.waitForSelector(SB_CONTENT, { timeout: 8_000 }).then(() => true).catch(() => false);
    if (!loaded) {
      // .sb-errordisplay is always present as a display:none template — only
      // report its text when it's actually visible.
      const err = await sbPage.evaluate(() => {
        const e = document.querySelector('.sb-errordisplay');
        return e && getComputedStyle(e).display !== 'none' ? e.textContent?.slice(0, 160) : 'no storybook root content';
      }).catch(() => '?');
      return { err };
    }
    await settleRender(sbPage);
    let png = null;
    try {
      const el = await sbPage.$(SB_ROOT);
      png = await el.screenshot(SHOT);
    } catch { /* full-page fallback below */ }
    if (!png || png.length < 200) {
      try { png = await sbPage.screenshot({ ...SHOT, fullPage: false }); } catch { /* keep null */ }
    }
    return { png };
  }

  for (const c of comps) {
    const gradePath = join(cacheDir, `${c.name}.grade.json`);
    const capturePath = join(cacheDir, `${c.name}.json`);
    const { gradeKey, prevCapture, fullyGraded } = pre.get(c.name);
    // Mutable: the clear block below nulls it, so a non-null grade further
    // down is always one that survived this capture.
    let { grade } = pre.get(c.name);

    // Skip rule — fully graded + grade key unchanged ⇒ the judgment those
    // grades encode is still valid: same story contract, same preview source.
    // Styling, bundle, and storybook rebuilds alone don't invalidate (both
    // sides consume the same CSS and compiled code — lockstep). No capture;
    // sheets may have been wiped by a rebuild, but a graded component doesn't
    // need them (--force regenerates everything). Spot-check picks are
    // captured anyway — grades kept — so the lockstep claim gets re-verified.
    if (!FORCE && fullyGraded && prevCapture?.gradeKey === gradeKey && !spotChecks.has(c.name)) {
      // Refresh the pendingGrade bit: grading happens AFTER capture, so a
      // component graded since its last capture still carries pending:true
      // in its json — without this, a post-grading re-run (the grade →
      // re-verify → clean loop) could never report it done.
      if (prevCapture.pendingGrade !== false) {
        writeFileSync(capturePath, JSON.stringify({ ...prevCapture, pendingGrade: false }, null, 2));
        prevCapture.pendingGrade = false;
      }
      report.push({ ...prevCapture, skipped: true });
      console.error(`↻ [COMPARE] ${c.name}: sources unchanged & fully graded — carried forward (--force to recapture)`);
      continue;
    }
    // The bundle changed but the reference storybook didn't — if the DS
    // source changed, the reference is stale and the sheets you're about to
    // grade would show the OLD design. Warn once.
    if (!warnedStaleRef && prevCapture &&
        prevCapture.sbBaseSha === SB_BASE_SHA && prevCapture.outBaseSha !== OUT_BASE_SHA) {
      warnedStaleRef = true;
      console.error('! [REFERENCE_STALE?] the bundle changed but .design-sync/sb-reference did not — if the DS source changed, rebuild the reference first (a stale reference makes compare grade against the OLD design)');
    }
    // Capture feasibility BEFORE touching the grade: a missing build artifact
    // makes gradeKeyFor hash '∅' — a phantom "contract change" that would
    // destroy a valid grade and then error out without producing a new sheet.
    const rel = `components/${c.group}/${c.name}/${c.name}.html`;
    if (!existsSync(join(OUT, rel))) {
      report.push({ name: c.name, group: c.group, verdict: 'error', reason: `${rel} missing — run package-build.mjs` });
      console.error(`✗ [COMPARE] ${c.name}: ${rel} missing`);
      continue;
    }
    // Clear the old grade only when the render contract it judged actually
    // changed (or on --force, where the point is a fresh verdict). A PARTIAL
    // grade on an unchanged contract stays — those verdicts are still valid;
    // the component is only being recaptured because it isn't fully graded
    // yet. Styling/bundle changes never reach this branch (not in the key).
    if (grade && (FORCE || prevCapture?.gradeKey !== gradeKey)) {
      rmSync(gradePath, { force: true });
      grade = null;
      console.error(`  (grade cleared for ${c.name} — ${FORCE ? '--force requested fresh verdicts' : 'contract changed'}; re-grade from the fresh sheet)`);
    }
    dsErrs = [];
    let pageErr = null;
    // Both sides capture at the card's declared viewport when the html
    // carries one (single-mode cards declare the size the product renders
    // at), else the default — same artifact the product reads, no separate
    // config plumbing.
    const vpMatch = /viewport="(\d+)x(\d+)"/.exec(readFileSync(join(OUT, rel), 'utf8').split('\n', 1)[0] ?? '');
    const vp = vpMatch
      ? { width: Math.min(+vpMatch[1], 2000), height: Math.min(+vpMatch[2], 2000) }
      : { width: 900, height: 700 };
    await sbPage.setViewportSize(vp);
    await dsPage.setViewportSize(vp);
    try {
      await dsPage.goto(`http://127.0.0.1:${outPort}/${rel}`, { waitUntil: 'networkidle', timeout: 20_000 });
    } catch (e) {
      // networkidle timeout ≠ broken page — a hanging asset connection still
      // leaves the DOM rendered; settle and proceed like the sb side does.
      if (/Timeout/i.test(String(e.message ?? e))) console.error(`  (networkidle timeout on ${c.name} — capturing after settle)`);
      else pageErr = e.message.split('\n')[0];
    }
    // previewKind: 'module' (compiled .design-sync/previews/<Name>.tsx, cells
    // keyed by export name) vs 'fallback' (the floor card — no compiled
    // preview module). Fallback still renders, but the
    // fix for a mismatch lives in the .tsx, so surface the kind loudly.
    const pv = pageErr ? null : await dsPage.evaluate(() => {
      const kind = document.querySelector('script[src*="_preview/"]') ? 'module' : 'fallback';
      // Module previews list every export in __dsCells (capture happens
      // per-story via ?story=, so pairing must not depend on the default
      // render mode — a single-mode card shows only one story). Fallback
      // previews keep the DOM-cell path.
      const dsCells = Array.isArray(window.__dsCells) ? window.__dsCells.slice() : null;
      const cells = dsCells
        ? dsCells.map((label, i) => ({ i, label }))
        : [...document.querySelectorAll('section.ds-cell')].map((s, i) => {
            const mount = s.querySelector('div[id^="r"]');
            const box = (mount ?? s).getBoundingClientRect();
            return {
              i, label: s.querySelector('h4')?.textContent?.trim() ?? '',
              // w/h only gate the element-vs-section screenshot fallback; text only
              // feeds the cell-threw error message. Neither is a similarity signal.
              w: Math.round(box.width), h: Math.round(box.height),
              text: (mount?.textContent ?? '').trim().slice(0, 200),
              caught: (mount?.textContent ?? '').trim().startsWith('⚠'),
            };
          });
      // Portal content (Dialog/Tooltip/Toast) renders outside the cells —
      // cell crops would miss it, so pair shots fall back to full-page. Only
      // counts foreign body children that actually hold content; empty
      // injected containers (toast roots, style mounts) don't trip it.
      const portal = [...document.body.children].some((el) =>
        !el.matches('.ds-grid, .ds-single, section, script, style, link, h4, div[id]') &&
        (el.childElementCount > 0 || (el.textContent ?? '').trim().length > 0));
      return { kind, cells, portal, perStory: !!dsCells, mode: window.__dsMode ?? 'grid' };
    }).catch((e) => { pageErr = String(e).split('\n')[0]; return null; });

    if (pageErr || !pv) {
      report.push({ name: c.name, group: c.group, verdict: 'error', reason: `preview page failed: ${pageErr}` });
      console.error(`✗ [COMPARE] ${c.name}: preview page failed — ${pageErr}`);
      continue;
    }

    // Pair stories → cells: squashed export-name equality first. The order
    // fallback (covers renamed/dedup-suffixed exports) engages only when the
    // leftover counts agree 1:1 — otherwise structurally-unrelated extras
    // (an authored Preview export, a Variants grid, a fallthrough Default)
    // would mispair with stories whose exports were dropped at generation
    // time, hiding genuinely-unpaired stories behind wrong sheets.
    const stories = c.stories.slice(0, MAX_STORIES);
    if (c.stories.length > MAX_STORIES) {
      console.error(`  [STORY_CAP] ${c.name}: comparing first ${MAX_STORIES} of ${c.stories.length} stories — pass --max-stories ${c.stories.length} to cover all`);
    }
    const cellByLabel = new Map(pv.cells.map((cell) => [squash(cell.label), cell]));
    const usedCells = new Set();
    const pairs = stories.map((s) => {
      // Exact emitted-label first (the generator dedupes colliding keys to
      // "Default"/"Default2" — fuzzy matching maps both stories to one cell);
      // squash fallback covers hand-owned previews with renamed exports.
      const cell =
        (s.emitted != null ? cellByLabel.get(squash(s.emitted)) : undefined) ??
        cellByLabel.get(squash(s.exportKey ?? exportName(s.name)));
      if (cell && !usedCells.has(cell.i)) { usedCells.add(cell.i); return { story: s, cell, pairedBy: 'name' }; }
      return { story: s, cell: null, pairedBy: null };
    });
    const freeCells = pv.cells.filter((cell) => !usedCells.has(cell.i));
    const unmatched = pairs.filter((p) => !p.cell);
    if (unmatched.length && unmatched.length === freeCells.length) {
      for (const p of unmatched) {
        const cell = freeCells.shift();
        p.cell = cell; p.pairedBy = 'order'; usedCells.add(cell.i);
      }
    }
    // Cells for stories beyond MAX_STORIES are explained by the cap — don't
    // report them as unexplained extras.
    const overCap = new Set(c.stories.slice(MAX_STORIES).map((s) => squash(s.emitted ?? s.exportKey ?? exportName(s.name))));
    const extraCells = pv.cells
      .filter((cell) => !usedCells.has(cell.i) && !overCap.has(squash(cell.label)))
      .map((cell) => cell.label);
    if (extraCells.length) {
      // Logged (not just recorded) so §7's triage-by-log flow can see it —
      // an owned export whose story was deleted upstream shows up here.
      console.error(`  (extra cells not matching any story for ${c.name}: ${extraCells.join(', ')})`);
    }

    // Overlay/portal content in a grid card paints over sibling cells in the
    // PRODUCT too (the app renders this same html whole) — single-story cards
    // are the fix, not a harness workaround.
    if (pv.portal && pv.mode !== 'single') {
      console.error(`  [PORTAL?] ${c.name}: overlay/portal content renders outside its cells — consider cfg.overrides ${c.name}: {"cardMode": "single"}`);
    }

    // Capture. Module previews: navigate ?story=<export> per story — each
    // story renders ALONE (no portal stacking, shared radio-group names,
    // focus contention, or container-measurement interference) at the full
    // capture viewport, mirroring how storybook frames the reference side.
    // Fallback previews: cell crops from the grid page.
    await settleRender(dsPage);
    const cellLocators = pv.perStory ? [] : await dsPage.$$('section.ds-cell');
    async function cellShot(cell) {
      if (pv.portal) return dsPage.screenshot({ ...SHOT, fullPage: false });
      const sec = cellLocators[cell.i];
      const mount = sec ? await sec.$('div[id^="r"]') : null;
      try {
        if (mount && cell.w >= 4 && cell.h >= 4) return await mount.screenshot(SHOT);
        if (sec) return await sec.screenshot(SHOT);
      } catch { /* fall through */ }
      return dsPage.screenshot({ ...SHOT, fullPage: false });
    }
    async function storyShot(label) {
      try {
        await dsPage.goto(`http://127.0.0.1:${outPort}/${rel}?story=${encodeURIComponent(label)}`, { waitUntil: 'networkidle', timeout: 20_000 });
      } catch (e) {
        // Hanging asset connection ≠ broken story — settle and capture anyway.
        if (!/Timeout/i.test(String(e.message ?? e))) {
          return { png: null, caught: true, text: String(e.message ?? e).split('\n')[0] };
        }
      }
      await settleRender(dsPage);
      const info = await dsPage.evaluate(() => {
        const t = (document.getElementById('r0')?.textContent ?? document.body.textContent ?? '').trim();
        return { caught: t.startsWith('⚠'), text: t.slice(0, 200) };
      }).catch(() => ({ caught: false, text: '' }));
      const png = await dsPage.screenshot({ ...SHOT, fullPage: false }).catch(() => null);
      return { png, ...info };
    }

    const storyResults = [];
    for (const p of pairs) {
      const sb = await captureStory(p.story.id);
      // Keyed by story ID — names can repeat across a component's story files.
      const base = `${c.group}__${c.name}__${squash(p.story.id) || squash(p.story.name) || 'story'}`;
      if (sb.png) writeFileSync(join(rawDir, `${base}__sb.png`), sb.png);
      if (sb.err) {
        storyResults.push({ story: p.story.name, id: p.story.id, verdict: 'sb-error', reasons: [sb.err] });
        continue;
      }
      if (!p.cell) {
        storyResults.push({
          story: p.story.name, id: p.story.id, verdict: 'unpaired',
          reasons: [pv.kind === 'fallback'
            ? 'preview is the floor card (no compiled preview) — author this story in .design-sync/previews/' + c.name + '.tsx'
            : `no cell labeled ${p.story.exportKey ?? exportName(p.story.name)} — the .tsx export for this story is missing or renamed`],
        });
        continue;
      }
      let dsPng = null;
      let caught = false;
      let caughtText = '';
      if (pv.perStory) {
        const shot = await storyShot(p.cell.label);
        dsPng = shot.png;
        caught = shot.caught;
        caughtText = shot.text;
      } else {
        try { dsPng = await cellShot(p.cell); } catch { /* leave null */ }
        caught = !!p.cell.caught;
        caughtText = p.cell.text ?? '';
      }
      if (dsPng) writeFileSync(join(rawDir, `${base}__ds.png`), dsPng);
      storyResults.push({
        story: p.story.name, id: p.story.id, export: p.cell.label, pairedBy: p.pairedBy,
        // Factual error only (the story threw). Visual judgment belongs to the
        // grading agent — record it in the .grade.json, not here.
        verdict: caught ? 'error' : 'needs-grade',
        reasons: caught ? [`story threw: ${caughtText.slice(0, 120)}`] : [],
        sbShot: sb.png ? `_screenshots/compare/raw/${base}__sb.png` : null,
        dsShot: dsPng ? `_screenshots/compare/raw/${base}__ds.png` : null,
      });
    }
    // Dedup: per-story navigation re-fires module-load errors once per visit.
    if (dsErrs.length) storyResults.push({ story: '(page)', verdict: 'error', reasons: [...new Set(dsErrs)].slice(0, 3) });

    // [STORY_CHANGED] — the story FILE (srcSha) moved since the last capture.
    // This is the signal that an OWNED preview must be edited; a recapture
    // without it means lockstep re-rendering or styling/preview changes,
    // where re-grading the fresh sheet is usually all that's needed.
    // File-level granularity on purpose: the story module compiles whole, so
    // its file hash IS the contract. A capture json without the field at all
    // (foreign or hand-edited — this harness always writes it, null when
    // unknown) is treated as "unknown", never as "changed": comparing absence
    // against a present hash would fire a spurious [STORY_CHANGED] for every
    // component.
    const srcChanged = !!(prevCapture && prevCapture.srcSha !== undefined &&
      (prevCapture.srcSha ?? null) !== (c.srcSha ?? null) && (prevCapture.srcSha || c.srcSha));
    for (const r of storyResults) r.storyChanged = srcChanged;
    // Ownership is by location: a file in .design-sync/previews/ is the
    // user's, whatever its content. (A modified file in the generated cache
    // gets its own loud per-build warning from package-build — not re-warned
    // here.)
    const ownedPreview = existsSync(resolve('.design-sync', 'previews', `${c.name}.tsx`));
    const storyChanged = storyResults.filter((r) => r.storyChanged).map((r) => r.story);
    if (storyChanged.length) {
      console.error(`! [STORY_CHANGED] ${c.name}: ${storyChanged.join(', ')} — the story itself changed${ownedPreview
        ? `; preview is OWNED (.design-sync/previews/${c.name}.tsx) — update it to mirror the new story`
        : '; preview is generated and re-derives on the next full package-build'}`);
    }

    // Sheet: the two true images side by side per story — the artifact the
    // grading agent Reads. Images shrink to fit the sheet; the raw/ PNGs are
    // the full-resolution authority when the sheet is too small to judge.
    const rows = storyResults.map((r) => {
      const base = `${c.group}__${c.name}__${squash(r.id ?? r.story) || 'story'}`;
      const img = (suffix) => existsSync(join(rawDir, `${base}__${suffix}.png`))
        ? `<img src="./raw/${base}__${suffix}.png" style="max-width:480px;max-height:420px;display:block">`
        : '<div style="width:480px;height:80px;display:flex;align-items:center;justify-content:center;color:#999">(no shot)</div>';
      const color = r.verdict === 'needs-grade' ? '#555' : '#d33';
      return `<tr><td style="vertical-align:top;padding:8px;font:600 14px system-ui">${escapeHtml(r.story)}<br><span style="color:${color}">${r.verdict}</span><br><span style="font-weight:400;font-size:12px;color:#555">${(r.reasons ?? []).map(escapeHtml).join('<br>')}</span></td>` +
        `<td style="vertical-align:top;padding:8px;border-left:1px solid #eee">${img('sb')}</td>` +
        `<td style="vertical-align:top;padding:8px;border-left:1px solid #eee">${img('ds')}</td></tr>`;
    }).join('\n');
    const sheetHtml = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#fff;width:1180px;font-family:system-ui">` +
      `<div style="font:600 18px system-ui;padding:10px">${escapeHtml(c.name)} — storybook (left) vs preview (right)${pv.kind === 'fallback' ? ' — ⚠ FALLBACK preview (no compiled .tsx)' : ''}${pv.portal && !pv.perStory ? ' — portal content: preview side is full-page' : ''}</div>` +
      `<table style="border-collapse:collapse"><tr style="font:600 13px system-ui;color:#555"><td style="padding:8px">story</td><td style="padding:8px">storybook</td><td style="padding:8px">preview</td></tr>${rows}</table></body></html>`;
    writeFileSync(join(cmpDir, `.sheet-${c.group}__${c.name}.html`), sheetHtml);
    try {
      await dsPage.goto(`http://127.0.0.1:${outPort}/_screenshots/compare/.sheet-${c.group}__${c.name}.html`, { waitUntil: 'networkidle', timeout: 15_000 });
      await dsPage.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
      await dsPage.screenshot({ path: join(cmpDir, `${c.group}__${c.name}.png`), fullPage: true });
    } catch (e) { console.error(`  (sheet skipped for ${c.name} — ${String(e).split('\n')[0]})`); }

    const counts = { 'needs-grade': 0, error: 0, unpaired: 0, 'sb-error': 0 };
    for (const r of storyResults) counts[r.verdict] = (counts[r.verdict] ?? 0) + 1;
    // pendingGrade: the post-capture grade state, written here so consumers
    // (the resync driver) read one bit instead of re-implementing this
    // harness's verdict vocabulary. The clear block above nulls `grade`, so
    // non-null here means the grade survived this capture.
    const gradable = storyResults.filter((r) => r.story !== '(page)');
    const pendingGrade = !(gradable.length > 0 && gradable.every((r) => ['match', 'close'].includes(grade?.stories?.[r.story]?.verdict)));
    const entry = {
      name: c.name, group: c.group, previewKind: pv.kind, portal: pv.portal, pendingGrade,
      srcSha: c.srcSha ?? null,
      sourceKey: c.sourceKey ?? null, keyRecipe: c.sourceKey ? KEY_RECIPE : undefined,
      sbBaseSha: SB_BASE_SHA, outBaseSha: OUT_BASE_SHA, gradeKey, counts, extraCells, stories: storyResults,
      sheet: `_screenshots/compare/${c.group}__${c.name}.png`,
      grade: `.design-sync/.cache/compare/${c.name}.grade.json`,
    };
    writeFileSync(capturePath, JSON.stringify(entry, null, 2));
    report.push(entry);
    const summary = Object.entries(counts).filter(([, n]) => n).map(([k, n]) => `${n} ${k}`).join(', ');
    const mark = counts.error || counts.unpaired || counts['sb-error'] ? '✗' : '○';
    // Grade keys verbatim — graders must use these EXACT strings (the story
    // display names), not export names; a mismatched key never joins.
    const keyHint = counts['needs-grade']
      ? ` — grade keys: ${storyResults.filter((r) => r.verdict === 'needs-grade').map((r) => JSON.stringify(r.story)).join(', ')}`
      : '';
    console.error(`${mark} [COMPARE] ${c.name}: ${summary}${pv.kind === 'fallback' ? ' (fallback preview)' : ''}${keyHint}`);
    // Printed only when a signature matches — never a hint without its
    // corroborating error.
    if (counts.error) {
      const firstErr = storyResults.find((r) => r.verdict === 'error')?.reasons?.[0];
      const hyp = hypothesisLine(firstErr);
      if (firstErr && hyp) {
        console.error(`    first error: ${firstErr}`);
        console.error(hyp);
      }
    }
  }
} finally {
  await browser?.close().catch(() => {});
  sbSrv.close();
  outSrv.close();
}

// .sb-state.json (the driver's reference-drift baseline) is deliberately NOT
// written here: a scoped run verifies only its own components, so writing
// the new reference hash would consume the drift signal on behalf of the
// whole carried set. The driver owns that state (resync.mjs).

// Aggregate only on full runs — parallel --components invocations must not
// clobber each other's view of the world. Grade files are joined in so the
// report answers "what's still ungraded / what did the grader say".
const hard = report.filter((r) => !r.skipped && (r.verdict === 'error' || (r.counts && (r.counts.error || r.counts.unpaired || r.counts['sb-error']))));
if (!ONLY) {
  // Prune state for components that left the sync (excluded, renamed, story
  // files deleted) — stale jsons read as phantom worklist entries. Full runs
  // only: a scoped run must never touch other components' state.
  const live = new Set(manifest.components.map((c) => c.name));
  for (const f of readdirSync(cacheDir)) {
    // Dot-entries are harness state (.sb-state.json), not component jsons.
    if (f.startsWith('.')) continue;
    const m = /^(.+?)(\.grade)?\.json$/.exec(f);
    if (!m || live.has(m[1])) continue;
    rmSync(join(cacheDir, f), { force: true });
    console.error(`  (pruned stale ${f} — component no longer in the sync)`);
  }
  const withGrades = report.map((r) => {
    if (!r.grade) return r;
    try { return { ...r, grades: JSON.parse(readFileSync(join(cacheDir, `${r.name}.grade.json`), 'utf8')) }; }
    catch { return { ...r, grades: null }; }
  });
  writeFileSync(join(OUT, '.compare-report.json'), JSON.stringify({ components: withGrades }, null, 2) + '\n');
  // Subagent learnings left unmerged are insight lost to the next sync. Nag on
  // every full (orchestrator-facing) run so the fold into NOTES.md can't be
  // overlooked — the skill treats this line as an upload blocker. Scoped runs
  // skip it: a subagent's own in-progress learnings file is expected.
  try {
    const pendingLearnings = readdirSync(resolve('.design-sync', 'learnings')).filter((f) => f.endsWith('.md'));
    if (pendingLearnings.length) {
      console.error(`[LEARNINGS_UNMERGED] ${pendingLearnings.length} file(s) in .design-sync/learnings/ — promote [GENERAL] bullets into .design-sync/NOTES.md, then delete the folder. Do not upload while this prints.`);
    }
  } catch { /* no learnings dir — nothing pending */ }
}
if (blockedHosts.size) {
  console.error(`! [ASSETS_BLOCKED] external assets failed to load during capture: ${[...blockedHosts].slice(0, 8).join(', ')}${blockedHosts.size > 8 ? ', …' : ''}. If this shell sandboxes network egress, BOTH panels rendered without these assets and grades can falsely pass while claude.ai/design users see different output. Re-run package-validate.mjs and compare.mjs --force from a shell with egress to these hosts (approve running the command without the sandbox when prompted, or add the hosts to the sandbox allowlist).`);
}
const skipped = report.filter((r) => r.skipped);
const pending = report.filter((r) => !r.skipped && r.counts?.['needs-grade'] && !hard.includes(r));
console.error(`\ncompare: ${report.length} component(s) — ${skipped.length} carried forward unchanged, ${report.length - skipped.length} captured, ${hard.length} with factual failures, ${pending.length} awaiting your grade`);
console.error('Grade from the true images: Read each _screenshots/compare/<group>__<Name>.png sheet (raw/ PNGs are the full-res authority), then Write the verdicts to .design-sync/.cache/compare/<Name>.grade.json (a recapture clears the old grade — its contract changed).');
process.exit(hard.length ? 1 : 0);
