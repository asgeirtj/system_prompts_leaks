#!/usr/bin/env node
// Two-partition diff: fresh local build vs the uploaded project's
// _ds_sync.json sidecar. The partitions answer DIFFERENT questions:
//
//   VERIFICATION (sourceKeys, falling back to renderHashes): which
//   components need their previews re-captured and re-graded. A component
//   verified at the last upload whose SOURCES are unchanged needs no
//   re-verification; artifact churn on a source-stable component
//   (renderChurned) keeps its grades and gets a sampled spot-check instead.
//   Either side missing sourceKeys, or a keyRecipe mismatch, falls back to
//   the renderHashes partition — today's behavior, never something worse.
//
//   UPLOAD (sourceHashes + bundleSha12 + styleSha): which files the project
//   is missing. This is a SUPERSET concern — renderHash deliberately ignores
//   .d.ts/.prompt.md edits and lockstep bundle changes, all of which still
//   must ship. Never scope uploads by the verification partition.
//
// The agent fetches the remote sidecar (DesignSync get_file — only it has
// auth) and saves it to a file; this script does the deterministic part.
// No --remote (project empty / never synced / fetch failed) → everything is
// unverified and everything uploads: full first-sync scope.
//
// Usage: node remote-diff.mjs --local <ds-bundle dir> [--remote <saved-sidecar.json>]
// Writes <ds-bundle>/.sync-diff.json:
//   {
//     styleChanged,                      // styling surface moved → re-ships (upload.styling); never re-verifies
//     unchanged: [..], changed: [..],    // verification scope (capture + grading)
//     added: [..], removed: [..],
//     renderChurned: [..],               // sources stable, artifacts moved — grades
//                                        // kept; the driver spot-checks a sample
//     keyedBy,                           // 'sourceKeys' | 'renderHashes' (fallback)
//     upload: {
//       any,                             // false ⇒ nothing to upload at all
//       components: [..],                // informational — components whose upload files
//                                        // changed; feeds upload.any and the narration.
//                                        // NOT a write scope: the skill mandates full
//                                        // writes on every upload (storybook SKILL.md §6,
//                                        // non-storybook SKILL.md §5).
//       deletePaths: [..],               // exact remote paths to delete (removed/regrouped/orphaned)
//       bundle,                          // _ds_bundle.js (+ sidecar) must upload
//       styling,                         // styles.css/_ds_bundle.css/tokens/**/fonts/**
//                                        // AND _vendor/preview-decorators.js must upload
//       aux,                             // guidelines/**, README.md must upload
//     }
//   }

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(`--${n}`); return i < 0 ? null : argv[i + 1]; };
{
  const VALUE_FLAGS = ['local', 'remote'];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--') && VALUE_FLAGS.includes(argv[i].slice(2))) { i++; continue; }
    console.error(`(unrecognized argument "${argv[i]}" — ignored; usage: remote-diff.mjs --local <ds-bundle> [--remote <saved-sidecar.json>])`);
  }
}
const OUT = flag('local') && resolve(flag('local'));
if (!OUT) { console.error('usage: remote-diff.mjs --local <ds-bundle dir> [--remote <saved-sidecar.json>]'); process.exit(2); }

const validSidecar = (s) =>
  s && typeof s === 'object' && typeof s.styleSha === 'string' &&
  s.renderHashes && typeof s.renderHashes === 'object' && !Array.isArray(s.renderHashes) &&
  s.sourceHashes && typeof s.sourceHashes === 'object' && !Array.isArray(s.sourceHashes);

let local;
try { local = JSON.parse(readFileSync(join(OUT, '_ds_sync.json'), 'utf8')); }
catch (e) { console.error(`✗ ${OUT}/_ds_sync.json unreadable (${e.message}) — run package-build.mjs first`); process.exit(1); }
if (!validSidecar(local)) { console.error('✗ local _ds_sync.json malformed (styleSha/renderHashes/sourceHashes) — rebuild'); process.exit(1); }

// Local self-check: a sidecar from an older build than the bundle would
// vouch for hashes that don't describe what's on disk.
let liveBundleSha;
try { liveBundleSha = createHash('sha256').update(readFileSync(join(OUT, '_ds_bundle.js'))).digest('hex').slice(0, 12); }
catch { console.error(`✗ ${OUT}/_ds_bundle.js unreadable — run package-build.mjs first`); process.exit(1); }
if (local.bundleSha12 !== liveBundleSha) {
  console.error('✗ local _ds_sync.json is stale (bundleSha mismatch with _ds_bundle.js) — rebuild before diffing');
  process.exit(1);
}

let remote = null;
// anchorReason travels into .sync-diff.json so downstream consumers (the
// resync driver's verdict, CI) can tell "verified against the last upload"
// from "full first-sync scope" without parsing stderr.
let anchorReason = 'not_provided';
const remotePath = flag('remote');
if (remotePath) {
  anchorReason = 'unreadable';
  try { remote = JSON.parse(readFileSync(remotePath, 'utf8')); }
  catch (e) { console.error(`! remote sidecar unreadable (${e.message}) — treating as no anchor`); }
  if (remote && !validSidecar(remote)) {
    console.error('! remote sidecar malformed — treating as no anchor');
    remote = null;
    anchorReason = 'malformed';
  } else if (remote && remote.shape !== local.shape) {
    console.error(`! source shape changed (${remote.shape} → ${local.shape}) — hashes are not comparable across recipes; full re-verification`);
    remote = null;
    anchorReason = 'shape_changed';
  } else if (remote) {
    anchorReason = 'ok';
  }
}

// components/<group>/<Name>/<file> — the per-name view of sourceHashes paths
// powers regroup/move detection (key changes) and delete derivation.
function byName(sourceHashes) {
  const m = new Map();
  for (const path of Object.keys(sourceHashes)) {
    const seg = path.split('/');
    if (seg[0] !== 'components' || seg.length < 4) continue;
    const name = seg[2];
    if (!m.has(name)) m.set(name, { group: seg[1], paths: [] });
    m.get(name).paths.push(path);
  }
  return m;
}

const localNames = Object.keys(local.renderHashes ?? {});
const out = {
  styleChanged: false,
  anchorUsed: !!remote, anchorReason,
  keyedBy: 'renderHashes',
  unchanged: [], changed: [], added: [], removed: [], renderChurned: [],
  upload: { any: true, components: [], deletePaths: [], bundle: true, styling: true, aux: true },
};

if (!remote) {
  out.added = localNames;
  out.upload.components = localNames;
  console.error(`no remote anchor — full scope (${localNames.length} component(s) verify + upload)`);
} else {
  // ── Verification partition (capture + grading scope). Source-key
  // inequality when both sidecars carry comparable keys; styling changes
  // never re-verify either way. styleChanged drives the upload partition.
  const keysOk = (s) => s.sourceKeys && typeof s.sourceKeys === 'object' && !Array.isArray(s.sourceKeys);
  const useSourceKeys = keysOk(local) && keysOk(remote) &&
    local.keyRecipe !== undefined && remote.keyRecipe === local.keyRecipe;
  if (keysOk(remote) && keysOk(local) && !useSourceKeys) {
    console.error(`! source-key recipe changed (remote keyRecipe ${remote.keyRecipe} → local ${local.keyRecipe}) — falling back to the render-hash partition (full re-verification of changed artifacts)`);
  }
  out.keyedBy = useSourceKeys ? 'sourceKeys' : 'renderHashes';
  out.styleChanged = remote.styleSha !== local.styleSha;
  for (const n of localNames) {
    if (!(n in remote.renderHashes)) { out.added.push(n); continue; }
    // A name missing from either sourceKeys map is unknown — re-verify.
    const changed = useSourceKeys
      ? remote.sourceKeys[n] === undefined || local.sourceKeys[n] === undefined || remote.sourceKeys[n] !== local.sourceKeys[n]
      : remote.renderHashes[n] !== local.renderHashes[n];
    if (changed) { out.changed.push(n); continue; }
    out.unchanged.push(n);
    // Sources held, artifacts moved: grades carry, the driver spot-checks a
    // sample, and the fresh artifacts still re-ship (renderChurned joins the
    // upload set below — else the anchor never refreshes and this re-fires).
    if (useSourceKeys && remote.renderHashes[n] !== local.renderHashes[n]) out.renderChurned.push(n);
  }
  out.removed = Object.keys(remote.renderHashes).filter((n) => !(n in local.renderHashes));

  // ── Upload partition (what the project is missing).
  const localBy = byName(local.sourceHashes);
  const remoteBy = byName(remote.sourceHashes);
  const uploadSet = new Set();
  // Added/changed components re-ship their card/preview files; so do
  // renderChurned ones — their grades carry but their artifacts moved.
  for (const n of [...out.added, ...out.changed, ...out.renderChurned]) uploadSet.add(n);
  // Source files moved (path OR content): catches .d.ts/.prompt.md/.jsx-only
  // edits that the render hash deliberately ignores, and regroups (path keys
  // change even when content doesn't). Only components/ keys carry names.
  for (const [path, sha] of Object.entries(local.sourceHashes)) {
    if (!path.startsWith('components/')) continue;
    if (remote.sourceHashes[path] !== sha) {
      const name = path.split('/')[2];
      if (name) uploadSet.add(name);
    }
  }
  out.upload.components = [...uploadSet].sort();
  // Deletes: every remote component path that no longer exists locally —
  // removed components entirely, the OLD group's paths after a regroup, and
  // residue files a kept component no longer emits (sourceHashes is
  // existence-filtered at build time, so a dropped .prompt.md leaves a
  // remote orphan). The card html and compiled preview aren't in
  // sourceHashes; derive them.
  const localPathSet = new Set(Object.keys(local.sourceHashes));
  for (const [name, info] of remoteBy) {
    const localInfo = localBy.get(name);
    if (!localInfo) {
      out.upload.deletePaths.push(
        ...info.paths,
        `components/${info.group}/${name}/${name}.html`,
        `_preview/${name}.js`, `_preview/${name}.css`,
      );
      continue;
    }
    out.upload.deletePaths.push(...info.paths.filter((p) => !localPathSet.has(p)));
    if (localInfo.group !== info.group) {
      out.upload.deletePaths.push(`components/${info.group}/${name}/${name}.html`);
    }
  }
  // A remote component present in renderHashes but absent from sourceHashes
  // has no derivable paths — its deletes can't be computed. Loud, not silent.
  for (const n of Object.keys(remote.renderHashes)) {
    if (!(n in local.renderHashes) && !remoteBy.has(n)) {
      console.error(`! removed component "${n}" has no sourceHashes coverage in the remote sidecar — its remote files can't be derived for deletion; list_files and clean up by hand once`);
    }
  }
  out.upload.bundle = remote.bundleSha12 !== local.bundleSha12;
  out.upload.styling = out.styleChanged;
  // A sidecar missing auxSha (malformed or hand-produced off-envelope) can't
  // vouch for the docs surface — treat as changed so guidelines/README ship.
  out.upload.aux = remote.auxSha === undefined || local.auxSha === undefined || remote.auxSha !== local.auxSha;
  out.upload.any = out.upload.components.length > 0 || out.upload.deletePaths.length > 0 || out.upload.bundle || out.upload.styling || out.upload.aux;
  // Recipe UPGRADE with byte-identical artifacts: nothing above triggers, so
  // the new-recipe sidecar would never ship and the fallback window never
  // closes (a later pipeline churn then costs a full re-verify instead of
  // the grades-kept canary). Flip upload.any: the upload is full-writes by
  // doctrine (idempotent; identical bytes are cheap) and always ships
  // _ds_sync.json last — one routine upload closes the window for good.
  // Direction-gated: recipes are forward-only, so only a LOCAL-newer flip
  // refreshes — an older-skill machine must never downgrade a newer anchor
  // (mixed-version fleets would ping-pong full uploads otherwise), and a
  // keyRecipe-less local sidecar (foreign generator) must never loop.
  if (!useSourceKeys && keysOk(local) && keysOk(remote) && !out.upload.any &&
      typeof local.keyRecipe === 'number' && typeof remote.keyRecipe === 'number' &&
      local.keyRecipe > remote.keyRecipe) {
    out.upload.any = true;
  }

  console.error(`verify: ${out.unchanged.length} verified-by-upload (skip capture/grade), ${out.changed.length} changed, ${out.added.length} new, ${out.removed.length} removed${out.renderChurned.length ? `, ${out.renderChurned.length} artifact-churned with stable sources (grades kept — spot-check)` : ''} [keyed on ${out.keyedBy}]`);
  console.error(out.upload.any
    ? ((out.upload.components.length || out.upload.deletePaths.length || out.upload.bundle || out.upload.styling || out.upload.aux)
      ? `upload: ${out.upload.components.length} component(s), ${out.upload.deletePaths.length} delete(s)${out.upload.bundle ? ', bundle' : ''}${out.upload.styling ? ', styling' : ''}${out.upload.aux ? ', docs' : ''} (+ _ds_sync.json last)`
      : 'upload: anchor refresh — artifacts match but the anchor is on an older key recipe; the routine upload (storybook SKILL.md §6 / non-storybook §5, _ds_sync.json last) closes the fallback window')
    : 'upload: nothing — the project already matches this build');
}
writeFileSync(join(OUT, '.sync-diff.json'), JSON.stringify(out, null, 2) + '\n');
console.error(`→ ${join(OUT, '.sync-diff.json')}`);
