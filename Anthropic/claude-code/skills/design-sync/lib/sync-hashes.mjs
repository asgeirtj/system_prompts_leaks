// The hash recipes — single source of truth for every consumer that must
// agree byte-for-byte: package-build.mjs writes the recipe outputs into
// _ds_sync.json (the uploaded sidecar future syncs diff against) and stamps
// per-component sourceKeys into .stories-map.json; package-capture.mjs /
// compare.mjs key their local grade lifecycle on the stamped sourceKey;
// lib/preview-rebuild.mjs re-stamps after targeted recompiles;
// lib/remote-diff.mjs compares a fetched sidecar against a fresh build.
// "Verified" carry-forward is sound only because all of them compute the
// same hashes from the same recipe — never fork this logic into a harness.
//
// Factorization, by what a change should cost:
//   - sourceKey (KEY_RECIPE) — the GRADE contract: the user's own inputs
//     (story files, owned previews, story set, preview-affecting config,
//     committed forks). A change re-grades that component.
//   - renderHash — the per-component ARTIFACT fingerprint: feeds the upload
//     partition and the churn detector (artifacts moved while sourceKey
//     held ⇒ pipeline churn ⇒ sampled spot-check, never a re-grade storm).
//   - styleSha — the global styling surface, upload partition only.
// gradeKey = H(sourceKey).

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function hashFile(h, p, label) {
  h.update(label);
  try { h.update(readFileSync(p)); } catch { h.update('∅'); }
}
function hashDir(h, dir, prefix, skip) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { h.update('∅'); return; }
  for (const e of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (e.name.startsWith('.') || skip?.has(e.name)) continue;
    if (e.isDirectory()) hashDir(h, join(dir, e.name), `${prefix}${e.name}/`, skip);
    else hashFile(h, join(dir, e.name), `${prefix}${e.name}`);
  }
}

// JSON with sorted object keys, so config slices hash stably across
// key-order churn. undefined collapses to null.
function canonical(v) {
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  if (v && typeof v === 'object') {
    return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}`;
  }
  return JSON.stringify(v) ?? 'null';
}

// Global styling surface — feeds the upload partition only (upload.styling),
// never grades. The package shape includes the compiled DS bundle body (a DS
// recompile re-ships the styling surface); the storybook shape excludes it
// (the bundle ships via bundleSha12 → upload.bundle).
export function styleShaFor(OUT, { includeBundleBody }) {
  const h = createHash('sha256');
  if (includeBundleBody) {
    // Body only — the first-line @ds-bundle header embeds per-file hashes,
    // so including it would invalidate everything whenever anything changes.
    h.update('bundlejs');
    try {
      const src = readFileSync(join(OUT, '_ds_bundle.js'), 'utf8');
      h.update(src.slice(src.indexOf('\n') + 1));
    } catch { h.update('∅'); }
  }
  hashFile(h, join(OUT, '_ds_bundle.css'), 'bundlecss');
  hashFile(h, join(OUT, 'styles.css'), 'styles');
  hashDir(h, join(OUT, 'fonts'), 'fonts/');
  hashDir(h, join(OUT, 'tokens'), 'tokens/');
  // The whole vendor runtime, not just the decorators: every preview card
  // loads _vendor/react.js, so a React version bump must flip the styling
  // surface and re-ship _vendor/** (upload.styling).
  hashDir(h, join(OUT, '_vendor'), '_vendor/');
  return h.digest('hex');
}

// Per-component render contract. The card html is hashed MINUS its first-line
// @dsCard marker — the marker embeds the display group, and a pure regroup
// must not read as a contract change (the viewport attr does belong: capture
// honors it). For storybook components the story contract (names/export keys,
// NOT the title-embedding storybook id) and the story-file fingerprint join —
// an owned preview doesn't recompile when its story file changes, but the
// contract must move either way.
export function renderHashFor(OUT, c, { stories, srcSha } = {}) {
  const h = createHash('sha256');
  hashFile(h, join(OUT, '_preview', `${c.name}.js`), 'preview');
  hashFile(h, join(OUT, '_preview', `${c.name}.css`), 'previewcss');
  h.update('html');
  try {
    const html = readFileSync(join(OUT, 'components', c.group, c.name, `${c.name}.html`), 'utf8');
    const nl = html.indexOf('\n');
    h.update(/viewport="[^"]*"/.exec(html.slice(0, nl))?.[0] ?? '');
    h.update(html.slice(nl + 1));
  } catch { h.update('∅'); }
  if (stories) h.update(JSON.stringify(stories.map((s) => [s.name, s.exportKey ?? null, s.emitted ?? null])));
  if (srcSha !== undefined) h.update(String(srcSha ?? ''));
  return h.digest('hex').slice(0, 16);
}

// Auxiliary docs surface — guidelines/, README.md. Neither affects renders
// (no verification impact) but both upload, and without a hash a docs-only
// edit would be invisible to the diff and never ship.
export function auxShaFor(OUT) {
  const h = createHash('sha256');
  hashDir(h, join(OUT, 'guidelines'), 'guidelines/');
  hashFile(h, join(OUT, 'README.md'), 'readme');
  return h.digest('hex').slice(0, 16);
}

export function gradeKeyFrom(key) {
  return createHash('sha256').update(key).digest('hex').slice(0, 16);
}

// ── sourceKey: the grade contract, keyed on what the user expressed ───────
// Versioned: the sidecar and capture jsons record keyRecipe, so a recipe
// change reads as "unknown — re-verify", never as source churn. ANY change
// to what feeds these hashes MUST bump this constant in the same commit —
// same number over different bytes makes every existing anchor read as
// total source churn (a full grade-wipe storm) instead of taking the
// render-hash fallback. The golden-key test in resync-driver.test.ts
// enforces the pairing.
// Recipe 7: cardMode/primaryStory left the per-component override slice —
// they only pick what the DEFAULT card view shows, but grading captures
// every story solo via ?story=, so flipping them never changes a graded
// pixel. viewport and skip stay keyed (capture viewport / story set).
export const KEY_RECIPE = 7;

// Config slices in the grade contract: the knobs that change the preview's
// DOM/mount semantics, plus committed lib forks. Asset-surface knobs
// (cssEntry/tokensPkg/extraFonts/runtimeFontPrefixes) stay in the styling
// trust class — deliberately NOT keyed; auto-detected siblings are derived
// state whose churn rides renderHash into the spot-check tier. Computed at
// BUILD time and stamped — consumers read the stamp, never live config, so
// the key always describes the artifacts on disk.
export function configSlicesFor(cfg = {}, designSyncDir = resolve('.design-sync')) {
  const g = createHash('sha256');
  g.update('provider');
  g.update(canonical(cfg.provider ?? null));
  g.update('storyImports');
  g.update(canonical(cfg.storyImports ?? null));
  g.update('extraEntries');
  g.update(canonical(cfg.extraEntries ?? null));
  // cfg.libOverrides is deliberately NOT keyed: its values are declaration
  // prose with no render effect, and fork behavior is fully keyed by the
  // fork file bytes below (loading keys off file existence, not the map).
  let forks = [];
  try { forks = readdirSync(join(designSyncDir, 'overrides')).filter((f) => f.endsWith('.mjs')).sort(); } catch { /* no forks */ }
  for (const f of forks) hashFile(g, join(designSyncDir, 'overrides', f), `fork:${f}`);
  const global = g.digest('hex');
  const titleMap = cfg.titleMap ?? {};
  const overrides = cfg.overrides ?? {};
  return {
    global,
    componentFor(name) {
      const h = createHash('sha256');
      h.update('override');
      // Presentation-only knobs (cardMode/primaryStory) are excluded: they
      // arrange the default card view, not any solo-captured story, so a
      // layout flip carries grades forward. An override left empty by the
      // strip canonicalizes to null — same key as no override at all.
      const ov = overrides[name];
      let graded = null;
      if (ov && typeof ov === 'object' && !Array.isArray(ov)) {
        const { cardMode, primaryStory, ...rest } = ov;
        graded = Object.keys(rest).length ? rest : null;
      } else if (ov !== undefined && ov !== null) {
        graded = ov; // malformed (non-object) override — key it as-is
      }
      h.update(canonical(graded));
      // Only remaps INTO this component are its identity; {title: null}
      // exclusions remove the component from the manifest entirely.
      h.update('titlemap');
      h.update(canonical(Object.entries(titleMap).filter(([, v]) => v === name).sort()));
      return h.digest('hex');
    },
  };
}


// Per-component grade contract. The owned preview is read at stamp time —
// normally right after its bytes were compiled, but a multi-target rebuild's
// stamp can trail the compile by the rest of the pipeline (accepted
// limitation; see preview-rebuild's KNOWN LIMITATION note). The package
// shape passes no stories/srcSha. `emitted` labels are generator dedup
// output — excluded.
export function sourceKeyFor(name, { globalSlice, componentSlice, stories = null, srcSha = undefined, designSyncDir = resolve('.design-sync') } = {}) {
  const h = createHash('sha256');
  h.update(`recipe:${KEY_RECIPE}`);
  h.update('global');
  h.update(globalSlice ?? '');
  h.update('component');
  h.update(componentSlice ?? '');
  h.update('src');
  h.update(String(srcSha ?? ''));
  hashFile(h, join(designSyncDir, 'previews', `${name}.tsx`), 'owned');
  if (stories) {
    h.update('stories');
    h.update(JSON.stringify(stories.map((s) => [s.name, s.exportKey ?? null])));
  }
  return h.digest('hex').slice(0, 16);
}

// Reference-storybook fingerprint — compare's [REFERENCE_STALE?]/sampler and
// the driver's drift trigger must agree on one recipe. project.json carries
// a generatedAt timestamp — excluded.
export function sbBaseShaFor(sbDir) {
  const h = createHash('sha256');
  hashDir(h, sbDir, 'sb/', new Set(['project.json']));
  return h.digest('hex');
}

// Staged-scripts fingerprint, recorded in the sidecar so a spot-check event
// can be traced to a skill release. Informational — never a partition input.
export function scriptsShaFor() {
  const libDir = fileURLToPath(new URL('.', import.meta.url));
  const root = fileURLToPath(new URL('..', import.meta.url));
  const h = createHash('sha256');
  hashDir(h, libDir, 'lib/');
  for (const f of ['package-build.mjs', 'package-validate.mjs', 'package-capture.mjs', 'resync.mjs',
    'storybook/compare.mjs', 'storybook/http-serve.mjs', 'storybook/probe.mjs']) {
    hashFile(h, join(root, f), f);
  }
  return h.digest('hex').slice(0, 16);
}
