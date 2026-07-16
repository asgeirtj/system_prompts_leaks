// Preview .tsx files — one per component; named exports become labeled cells
// in <Name>.html, compiled to ds-bundle/_preview/<Name>.js (IIFE →
// window.__dsPreview) by buildPreviews. Two homes: .design-sync/previews/
// (user-authored, committed, markerless, always wins) and
// .design-sync/.cache/previews/ (generated, gitignored, marker-carrying,
// regenerated every build).

import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { IIFE_IMPORT_META_DEFINE, hypothesisLine } from './common.mjs';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// The ownership marker embeds a sha12 of the body-after-line-1 so an edit
// below the marker is detected (not silently overwritten). BOM-stripped and
// prefix-matched — Windows editors can prepend U+FEFF. A marker without a
// hash is treated as generated and regenerates once.
const MARKER_TAIL = '— generated; to OWN it, copy to .design-sync/previews/ and delete this line there.';
export const MARKER_RE = /^\uFEFF?\/\/ @ds-preview generated(?:\s+([0-9a-f]{12}))?\b/;
const bodyHash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12);
const markerLine = (body) => `// @ds-preview generated ${bodyHash(body)} ${MARKER_TAIL}`;

// Apply the two-home rule per component. Ownership is by LOCATION:
// .design-sync/previews/ holds the USER'S files (committed — the creative
// work a sync can't regenerate); anything there wins and the machine NEVER
// writes or deletes there. genDir (.design-sync/.cache/previews/,
// gitignored) holds the GENERATED wrappers — deterministic outputs of
// stories + config, regenerated every build — except that a modified cache
// file (markerless, or edited under its marker) is preserved, never
// clobbered. The marker's only job is that cache-side regeneration guard.
export function writePreviewFiles({ components, previewDir, genDir, gen }) {
  mkdirSync(previewDir, { recursive: true });
  mkdirSync(genDir, { recursive: true });
  const names = new Set(components.map((c) => c.name));
  let generated = 0, overrides = 0, modified = 0;
  const markered = [];
  const readNorm = (p) => {
    // CRLF-normalize so a Windows checkout hashes the same as the commit.
    try { return readFileSync(p, 'utf8').replace(/\r\n/g, '\n'); } catch { return null; }
  };
  for (const c of components) {
    const genPath = join(genDir, `${c.name}.tsx`);
    const ownedTxt = readNorm(join(previewDir, `${c.name}.tsx`));
    if (ownedTxt !== null) {
      overrides++;
      console.error(`  (preview override: ${c.name})`);
      // A leftover marker line is only a cosmetic mistake (it's a JS
      // comment, the file compiles fine): warn once after the loop, don't act.
      const nl = ownedTxt.indexOf('\n');
      if (MARKER_RE.test(nl < 0 ? ownedTxt : ownedTxt.slice(0, nl))) {
        markered.push(c.name);
      }
      // Drop the generated twin — but only when it's provably machine
      // output. A modified cache file is user content even while an owned
      // file shadows it.
      const twin = readNorm(genPath);
      if (twin !== null) {
        const tnl = twin.indexOf('\n');
        const tm = (tnl < 0 ? twin : twin.slice(0, tnl)).match(MARKER_RE);
        if (tm && (!tm[1] || tm[1] === bodyHash(tnl < 0 ? '' : twin.slice(tnl + 1)))) {
          rmSync(genPath);
        } else {
          console.error(`  (modified cache twin kept: ${c.name} — the owned .design-sync/previews/${c.name}.tsx wins; delete .design-sync/.cache/previews/${c.name}.tsx yourself if it is no longer wanted)`);
        }
      }
      continue;
    }
    const genTxt = readNorm(genPath);
    if (genTxt !== null) {
      const nl = genTxt.indexOf('\n');
      const m = (nl < 0 ? genTxt : genTxt.slice(0, nl)).match(MARKER_RE);
      if (!m || (m[1] && m[1] !== bodyHash(nl < 0 ? '' : genTxt.slice(nl + 1)))) {
        modified++;
        console.error(`  (preview modified in the cache: ${c.name} — NOT regenerating over it; it is gitignored AND outside the grade key, so edits here never re-grade — move it to .design-sync/previews/${c.name}.tsx, minus any marker line, to own it durably and re-key it)`);
        continue;
      }
    }
    const body = gen(c);
    if (body == null) {
      // Generator declined (nothing paired) — the html shows the floor card
      // instead. Remove our stale generated file if one exists.
      if (genTxt !== null) {
        rmSync(genPath);
        console.error(`  (stale preview removed: ${c.name})`);
      }
      continue;
    }
    writeFileSync(genPath, `${markerLine(body)}\n${body}`);
    generated++;
  }
  if (markered.length) {
    const shown = markered.slice(0, 8).join(', ');
    const more = markered.length > 8 ? ` (+${markered.length - 8} more)` : '';
    console.error(`  (note: ${markered.length} owned preview(s) in .design-sync/previews/ still carry the generated marker on line 1 — delete the line; owned files are markerless: ${shown}${more})`);
  }
  // Stale: file for a component that's no longer exported. previews/ is the
  // user's dir — log only, never delete. In the cache, machine-clean files
  // are removed (keeps re-sync idempotent); modified ones are kept.
  for (const f of readdirSync(previewDir)) {
    if (!f.endsWith('.tsx')) continue;
    const n = f.slice(0, -4);
    if (!names.has(n)) console.error(`  (stale preview: ${n} — component no longer exported)`);
  }
  for (const f of readdirSync(genDir)) {
    if (!f.endsWith('.tsx')) continue;
    const n = f.slice(0, -4);
    if (names.has(n)) continue;
    const p = join(genDir, f);
    let txt;
    // A junk entry (unreadable file, .tsx-named directory) must not abort
    // the build — skip it; it can't be proven machine-clean, so keep it.
    try { txt = readFileSync(p, 'utf8').replace(/\r\n/g, '\n'); } catch { continue; }
    const nl = txt.indexOf('\n');
    const m = (nl < 0 ? txt : txt.slice(0, nl)).match(MARKER_RE);
    if (m && (!m[1] || m[1] === bodyHash(nl < 0 ? '' : txt.slice(nl + 1)))) {
      rmSync(p);
      console.error(`  (stale preview removed: ${n})`);
    } else {
      console.error(`  (stale preview kept: ${n} — component no longer exported; modified in the cache, never deleted)`);
    }
  }
  const extras = [overrides && `${overrides} user-owned`, modified && `${modified} modified-in-cache`].filter(Boolean);
  console.error(`  previews: ${generated} generated → .design-sync/.cache/previews/${extras.length ? ` (${extras.join(', ')})` : ''}`);
}

// Compile each .design-sync/previews/<Name>.tsx → ds-bundle/_preview/<Name>.js
// (IIFE assigning named exports to window.__dsPreview). react/react-dom and the
// DS package are externalized to the window globals already on the page;
// import resolution (package shim, relative-component redirect, storybook
// stubs, asset loaders) comes from the caller-supplied story-imports plugin
// set, so .design-sync/overrides/story-imports.mjs forks apply everywhere previews
// compile. Per-file build so one bad file doesn't sink the rest.
export async function buildPreviews({ components, previewDir, genDir, OUT, reactShim, NODE_MODULES, pathsPlugin, importPlugins, loaders }) {
  const built = new Set();
  const outDir = join(OUT, '_preview');
  mkdirSync(outDir, { recursive: true });
  // Same nodePaths + tsconfig-paths plugin bundleToIife uses, so a user-owned
  // preview that imports `@/lib/utils` or a workspace dep resolves the same way.
  // pathsPlugin registers LAST: the story-imports policy plugin resolves alias
  // specifiers via b.resolve (which consults pathsPlugin) and then applies the
  // exported-component shim rules to the result — a paths plugin registered
  // first would short-circuit resolution and bypass the policy.
  const plugins = [reactShim, ...(importPlugins ?? []), ...(pathsPlugin ? [pathsPlugin] : [])];
  for (const c of components) {
    const owned = join(previewDir, `${c.name}.tsx`);
    const entry = existsSync(owned) ? owned : join(genDir, `${c.name}.tsx`);
    if (!existsSync(entry)) continue;
    try {
      await build({
        entryPoints: [entry], outfile: join(outDir, `${c.name}.js`),
        bundle: true, format: 'iife', globalName: '__dsPreview',
        jsx: 'automatic', platform: 'browser', charset: 'utf8',
        nodePaths: NODE_MODULES ? [NODE_MODULES] : undefined,
        plugins,
        ...(loaders ? { loader: loaders } : {}),
        // __DEV__ is a React-ecosystem convention (dev-only guards) — leaving
        // it undefined crashes any story module that touches it.
        define: {
          'process.env.NODE_ENV': '"development"', __DEV__: 'true',
          ...IIFE_IMPORT_META_DEFINE,
        },
        logLevel: 'silent',
      });
      built.add(c.name);
    } catch (e) {
      // Surface esbuild's location info so the agent can fix the .tsx, not
      // just "build failed".
      const err = e?.errors?.[0];
      const loc = err?.location;
      const where = loc ? ` (${loc.file}:${loc.line}:${loc.column})` : '';
      const msg = err?.text ?? e?.message ?? String(e);
      // Match exactly the printed line — never a hint under a line that
      // lacks its signature.
      const firstLine = String(msg).split('\n')[0];
      console.error(`  ! preview build failed: ${c.name}: ${firstLine}${where}`);
      if (loc?.lineText) console.error(`    ${loc.lineText}\n    ${' '.repeat(loc.column)}^`);
      const hyp = hypothesisLine(firstLine);
      if (hyp) console.error(hyp);
    }
  }
  return built;
}
