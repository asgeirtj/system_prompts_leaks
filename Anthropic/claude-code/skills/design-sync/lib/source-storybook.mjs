// Storybook source adapter. Builds (or copies) storybook-static, parses
// index.json into the component list, resolves each component's story SOURCE
// file, and pairs index story names to the module's export keys — the inputs
// preview-gen-storybook.mjs needs to compile story modules as previews.
// Story args are never evaluated here: stories run only in the browser,
// against the shipped bundle.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { IIFE_IMPORT_META_DEFINE, titleParts } from './common.mjs';
import { findStorybookDirs } from './detect.mjs';
import { storybookStubPlugin } from './story-imports.mjs';

function pickStorybookDir({ INPUTS, PKG, SB_CONFIG_DIR }) {
  if (SB_CONFIG_DIR) return SB_CONFIG_DIR;
  // Many repos name the config dir via `storybook dev -c <dir>` in
  // package.json scripts — that's authoritative when present.
  try {
    const scripts = JSON.parse(readFileSync(join(INPUTS, 'package.json'), 'utf8')).scripts ?? {};
    for (const s of Object.values(scripts)) {
      const m = typeof s === 'string' && s.match(/\bstorybook\s+(?:dev|build)\b[^;&|]*?(?:-c|--config-dir)[= ]+(\S+)/);
      if (m) return resolve(INPUTS, m[1]);
    }
  } catch {}
  const found = findStorybookDirs(INPUTS);
  if (found.length > 1) {
    const pkgTail = PKG.split('/').pop();
    const ranked = found
      .map((d) => {
        const sib = join(dirname(d), 'package.json');
        let name = '';
        try { name = JSON.parse(readFileSync(sib, 'utf8')).name ?? ''; } catch {}
        return { d, score: name === PKG ? 2 : d.includes(pkgTail) ? 1 : 0, depth: d.split(sep).length };
      })
      .sort((a, b) => b.score - a.score || a.depth - b.depth);
    console.error(
      `[MULTI_STORYBOOK] ${found.length} .storybook/ dirs under --inputs; picked ${ranked[0].d}. ` +
        `Override with --storybook-config <dir> if wrong. Found: ${found.join(', ')}`,
    );
    return ranked[0].d;
  }
  return found[0] ?? (existsSync(join(INPUTS, '.storybook')) ? join(INPUTS, '.storybook') : undefined);
}

// Storybook derives a story's display name from its export key (startCase);
// squash-compare pairs them back without re-implementing the exact algorithm.
// storyName overrides break the pairing for that story → it stays unpaired
// and its cell is omitted; a component with no paired stories shows the
// floor card.
const squash = (s) => String(s ?? '').replace(/[^a-z0-9]/gi, '').toLowerCase();

// Module export keys WITHOUT evaluating the module: esbuild parses the file
// (bundle:false) and reports exports in the metafile. ~10ms per story file.
async function storyModuleExports(absPath) {
  const { build } = await import('esbuild');
  try {
    const r = await build({
      entryPoints: [absPath], bundle: false, write: false, metafile: true,
      format: 'esm', platform: 'neutral', logLevel: 'silent', jsx: 'preserve',
      // JSX-in-.js story files are a common convention; jsx is a strict
      // syntax superset of js, so this is safe for plain files too.
      loader: { '.js': 'jsx' },
    });
    const out = Object.values(r.metafile.outputs)[0];
    return (out?.exports ?? []).filter((e) => e !== 'default');
  } catch (e) {
    console.error(`  ! story parse failed: ${relative(process.cwd(), absPath)}: ${String(e?.errors?.[0]?.text ?? e?.message ?? e).split('\n')[0]}`);
    return [];
  }
}

// Resolve each component's story source file(s) and pair its index stories
// to module export keys (c.storySrc / c.srcSha / c.storyIds[].exportKey).
// A component's stories may live in ONE file or be split across many files
// sharing a title — each story pairs against the exports of its OWN file
// (its index.json importPath). index.json importPaths are relative to the
// storybook PROJECT root — the .storybook dir's parent when we know it; cwd
// and the static dir's parent as fallbacks (--storybook-static-only runs).
async function resolveStorySources(csfComponents, sbDir, sbStatic) {
  const bases = [...new Set([
    ...(sbDir ? [dirname(sbDir)] : []),
    process.cwd(),
    ...(sbStatic ? [dirname(sbStatic)] : []),
  ])];
  let paired = 0, total = 0;
  for (const c of csfComponents) {
    const srcByIp = new Map();
    for (const ip of c.importPaths ?? []) {
      const abs = bases.map((b) => resolve(b, ip)).find(existsSync);
      if (abs) srcByIp.set(ip, abs);
    }
    const srcs = [...new Set(srcByIp.values())];
    if (!srcs.length) continue;
    c.storySrc = srcs[0];
    // srcSha spans ALL story files — an edit to any of them is a contract
    // change for the component.
    const h = createHash('sha256');
    for (const f of srcs) h.update(readFileSync(f));
    c.srcSha = h.digest('hex').slice(0, 12);
    const keysByFile = new Map();
    for (const f of srcs) {
      keysByFile.set(f, new Map((await storyModuleExports(f)).map((k) => [squash(k), k])));
    }
    for (const s of c.storyIds ?? []) {
      total++;
      const f = srcByIp.get(s.importPath) ?? srcs[0];
      // Display name first; fall back to the story ID's tail — storybook
      // derives it from the export key, so it survives `name:` overrides
      // ("button--my-story" pairs to export MyStory whatever the name says).
      const k = keysByFile.get(f)?.get(squash(s.name))
        ?? keysByFile.get(f)?.get(squash(String(s.id ?? '').split('--').pop() ?? ''));
      if (k) { s.exportKey = k; s.storySrc = f; paired++; }
    }
  }
  console.error(`  story sources: ${paired}/${total} stories paired to module exports`);
}

export async function resolveStorybook(ctx) {
  const { INPUTS, STORIES_ROOT, SB_CONFIG_DIR, SB_STATIC, PKG, PKG_DIR, OUT, entry, titleMap, exportedSet } = ctx;
  const sbDir = pickStorybookDir({ STORIES_ROOT, INPUTS, PKG, SB_CONFIG_DIR });
  let sbStatic = SB_STATIC ? resolve(SB_STATIC) : null;
  if (sbStatic && !existsSync(join(sbStatic, 'index.json'))) {
    console.error(`--storybook-static ${sbStatic} has no index.json`);
    sbStatic = null;
  }
  // storybook-static is parsed for index.json (component list + story source
  // pairing) and the CSS fallback, then discarded — previews render
  // self-contained from the bundle. Built into a dot-prefixed dir so it's
  // never uploaded.
  if (!sbStatic && sbDir) {
    sbStatic = resolve(OUT, '.sb-static');
    console.error(`  running: npx storybook build -c ${sbDir} -o ${sbStatic}`);
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync(
      'npx', ['storybook', 'build', '-c', sbDir, '-o', sbStatic, '--quiet'],
      { cwd: dirname(sbDir), stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 600_000, shell: process.platform === 'win32' },
    );
    if (r.error || r.signal || r.status !== 0 || !existsSync(join(sbStatic, 'index.json'))) {
      console.error(`[SB_BUILD_FAIL] storybook build exited ${r.status ?? r.signal ?? r.error?.code}:\n${(r.stderr || r.stdout || '').slice(-2000)}`);
      sbStatic = null;
    }
  }
  const csfComponents = [];
  if (sbStatic) {
    const idx = JSON.parse(readFileSync(join(sbStatic, 'index.json'), 'utf8'));
    // Multi-package Storybooks can have a 'TextField' from each sibling
    // package. Prefer stories whose importPath is under the target
    // package's own directory.
    const sbRoot = sbDir ? resolve(dirname(sbDir)) : null;
    // Same relative()+realpath treatment as story-imports' barrel rule:
    // startsWith is case-sensitive (win32 drive-letter casing makes it
    // silently inert) and raw resolve() misses pnpm-style symlinked package
    // dirs. A wrong isOwn lets a sibling package's same-named stories win.
    const realOf = (p) => { try { return realpathSync(p); } catch { return p; } };
    const pkgReal = realOf(resolve(PKG_DIR));
    // Memoized per importPath: the sort comparator below calls isOwn
    // O(n log n) times, and a comparator's view of an entry must not
    // re-derive syscalls mid-sort.
    const ownCache = new Map();
    const isOwn = (e) => {
      if (!sbRoot || !e.importPath) return false;
      if (!ownCache.has(e.importPath)) {
        const rel = relative(pkgReal, realOf(resolve(sbRoot, e.importPath)));
        ownCache.set(e.importPath, rel !== '' && !rel.startsWith('..') && !isAbsolute(rel));
      }
      return ownCache.get(e.importPath);
    };
    const idxEntries = Object.values(idx.entries ?? {}).sort((a, b) => isOwn(b) - isOwn(a));
    const byComp = new Map();
    for (const e of idxEntries) {
      if (e.type === 'docs') continue;
      // Skip stories the DS marks deprecated/hidden so v1-API stories don't
      // render the v2 export with wrong props.
      if ((e.tags ?? []).includes('!dev') || (e.tags ?? []).includes('deprecated')) continue;
      if (/deprecated/i.test(e.importPath ?? '')) continue;
      const { name: compName, group } = titleParts(e.title, titleMap, exportedSet);
      if (compName === null) continue; // titleMap {Name: null} = excluded
      if (!byComp.has(compName)) byComp.set(compName, { name: compName, group, own: isOwn(e), storyIds: [], importPaths: new Set() });
      const comp = byComp.get(compName);
      if (comp.own && !isOwn(e)) continue; // own-package stories win the name
      comp.storyIds.push({ id: e.id, name: e.name, importPath: e.importPath });
      if (e.importPath) comp.importPaths.add(e.importPath);
    }
    for (const c of byComp.values()) csfComponents.push(c);
    console.error(
      `  storybook-static: ${Object.keys(idx.entries ?? {}).length} entries → ${csfComponents.length} components`,
    );
    await resolveStorySources(csfComponents, sbDir, sbStatic);
  } else {
    console.error(`[SB_BUILD_FAIL] no storybook-static and no .storybook/ dir found — pass --storybook-static <dir> or run from a repo with .storybook/.`);
  }
  return { shape: 'storybook', entry, components: csfComponents, sbStatic, sbDir };
}

// Bundle .storybook/preview.{tsx,ts,jsx,js} decorators into
// _vendor/preview-decorators.js so each preview can wrap its mount in the same
// provider chain Storybook does. Best-effort: bail (return false) if there's
// no decorator array or the bundle fails — cfg.provider remains the manual
// fallback. Imports of the DS package itself are shimmed to window.<GLOBAL>
// so the decorator's provider components are the same instances the
// previews use.
export async function bundlePreviewDecorators({ sbDir, OUT, NODE_MODULES, PKG, PKG_DIR, GLOBAL }) {
  if (!sbDir) return false;
  const sbPreview = ['tsx', 'ts', 'jsx', 'js'].map((e) => join(sbDir, `preview.${e}`)).find(existsSync);
  if (!sbPreview) {
    console.error(`  (preview decorators: no preview.{tsx,ts,jsx,js} in ${sbDir} — nothing to bundle; cfg.provider is the manual path)`);
    return false;
  }
  // \bdecorators\b (not just `decorators:` / `decorators=`) — re-export forms
  // like `export { decorators }` are real; a false positive is harmless (the
  // wrapper finds no array at runtime and __dsDecorate stays null).
  if (!/\bdecorators\b/.test(readFileSync(sbPreview, 'utf8'))) {
    console.error(`  (preview decorators: ${sbPreview} never mentions decorators — nothing to bundle; if providers live elsewhere, set cfg.provider)`);
    return false;
  }
  const { build } = await import('esbuild');
  const entry = join(OUT, '.preview-decorators-entry.mjs');
  // The decorator receives (Story, ctx). We pass a Story fn that returns the
  // already-built inner element and a minimal ctx whose globals are seeded
  // from globalTypes defaultValues / initialGlobals — theming decorators read
  // ctx.globals.theme et al, and storybook's own default render uses exactly
  // these values. Single-function decorators are legal CSF ([].concat).
  // A decorator returning undefined (an addon stub, a manager-side noop)
  // falls through to the inner render with one console warning — otherwise
  // one unrecognized addon silently blanks every preview.
  writeFileSync(entry, `import * as pv from ${JSON.stringify(sbPreview)};
var ds = [].concat((pv.default && pv.default.decorators) || pv.decorators || []).filter(function(d){return typeof d==="function"});
if (!ds.length) console.warn("[ds] preview decorators: the preview module mentions decorators but exposed none at runtime (indirect export?) — previews render without the provider chain; set cfg.provider if components need one");
var GT = (pv.default && pv.default.globalTypes) || pv.globalTypes || {};
var G = {};
for (var k in GT) { if (GT[k] && GT[k].defaultValue !== undefined) G[k] = GT[k].defaultValue; }
var IG = (pv.default && pv.default.initialGlobals) || pv.initialGlobals || {};
for (var k2 in IG) { G[k2] = IG[k2]; }
var ctx = {args:{},argTypes:{},globals:G,parameters:{},viewMode:"story",loaded:{},id:"",name:"",title:"",kind:"",componentId:""};
// reduce (not reduceRight): Storybook composes first-in-array = innermost.
// The chain runs inside a rendered component so decorator hooks have a
// dispatcher — calling decorators eagerly (outside render) would null it.
window.__dsDecorate = !ds.length ? null : function(el){
  return window.React.createElement(function(){
    return ds.reduce(function(inner,d){
      var out = d(function(){return inner}, ctx);
      if (out === undefined) {
        if (!window.__dsDecoratorWarned) { window.__dsDecoratorWarned = 1; console.warn("[ds] a preview decorator returned undefined — skipped (addon stub?)"); }
        return inner;
      }
      return out;
    }, el);
  });
};`);
  // Shim the DS package (by name, or by a relative path that resolves under
  // PKG_DIR — e.g. `../src` from .storybook/) to window.<GLOBAL> so we don't
  // re-bundle the whole DS and the provider's Context matches the bundle's.
  const pkgRoot = resolve(PKG_DIR);
  const dsShim = {
    name: 'ds-global',
    setup(b) {
      const escPkg = PKG.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Exact match only — subpath imports (<pkg>/locales/en.json) must bundle
      // normally, not shim to a nonexistent window.<GLOBAL>.<subpath>.
      b.onResolve({ filter: new RegExp(`^${escPkg}$`) }, () => ({ path: 'ds', namespace: 'ds-shim' }));
      b.onResolve({ filter: /^\.\.?\// }, (a) => {
        const abs = resolve(a.resolveDir, a.path);
        if (abs === pkgRoot || abs === join(pkgRoot, 'src') || abs === join(pkgRoot, 'src', 'index')) {
          return { path: 'ds', namespace: 'ds-shim' };
        }
        return undefined;
      });
      b.onLoad({ filter: /^ds$/, namespace: 'ds-shim' }, () => ({
        contents: `module.exports=window.${GLOBAL};`, loader: 'js',
      }));
    },
  };
  // Storybook-runtime/addon/msw packages are preview-time only. Stubbed (not
  // externalized — `external` in IIFE output leaves a bare require() that
  // throws in-browser); manager-api gets functional no-ops. One definition,
  // shared with preview compilation, lives in story-imports.mjs.
  const stubEmpty = storybookStubPlugin();
  // React shim for the decorator bundle: read window.React/ReactDOM at USE
  // time (getters), not via `var R = window.React` at thunk-define time —
  // esbuild can hoist the CJS thunk call before the page global is live.
  const reactGlobal = {
    name: 'react-global',
    setup(b) {
      // Catch every subpath (react/jsx-runtime, react-dom/client,
      // react-dom/server, …) so a transitive package's own `import React`
      // can't bundle a second copy alongside the page's window.React.
      b.onResolve({ filter: /^react(-dom)?($|\/)/ }, (a) =>
        ({ path: a.path.startsWith('react-dom') ? 'rd' : 'r', namespace: 'rg' }));
      // ownKeys + getOwnPropertyDescriptor so esbuild's __toESM/__copyProps
      // (which enumerate via getOwnPropertyNames) see every React export —
      // otherwise `import {useState} from 'react'` is undefined.
      const proxy = (g, extra) => `new Proxy(${extra},{
  get:function(o,k){return k in o?o[k]:(${g}||{})[k]},
  ownKeys:function(o){return Array.from(new Set(Object.keys(o).concat(Object.keys(${g}||{}))))},
  getOwnPropertyDescriptor:function(o,k){return{enumerable:true,configurable:true,get:function(){return k in o?o[k]:(${g}||{})[k]}}}
})`;
      b.onLoad({ filter: /^r$/, namespace: 'rg' }, () => ({
        loader: 'js',
        contents: `function jsx(t,p,k){return window.React.createElement(t,k===void 0?p:Object.assign({key:k},p))}
module.exports=${proxy('window.React', '{jsx:jsx,jsxs:jsx,jsxDEV:jsx,Fragment:undefined}')};`,
      }));
      b.onLoad({ filter: /^rd$/, namespace: 'rg' }, () => ({
        loader: 'js',
        contents: `module.exports=${proxy('window.ReactDOM', '{}')};`,
      }));
    },
  };
  try {
    await build({
      entryPoints: [entry], outfile: join(OUT, '_vendor', 'preview-decorators.js'),
      bundle: true, format: 'iife', platform: 'browser', target: 'es2020',
      jsx: 'automatic', loader: { '.js': 'jsx', '.json': 'json' },
      nodePaths: [NODE_MODULES], plugins: [reactGlobal, dsShim, stubEmpty],
      // Same defines as the preview compile — provider chains routinely guard
      // on NODE_ENV/__DEV__, and esbuild leaves undefined identifiers to
      // throw at load time.
      define: {
        'process.env.NODE_ENV': '"development"', __DEV__: 'true',
        ...IIFE_IMPORT_META_DEFINE,
      },
      logLevel: 'silent',
    });
    console.error(`  preview-decorators.js: bundled from ${relative(pkgRoot, sbPreview)}`);
    return true;
  } catch (e) {
    {
      // A decorator bundle failure always means the provider chain needs
      // manual config, so that line prints unconditionally.
      // esbuild rejections carry the signature in e.errors[0].text, not String(e).
      const err = e?.errors?.[0];
      const firstLine = String(err?.text ?? e?.message ?? String(e)).split('\n')[0];
      console.error(`  ! preview decorator bundle failed: ${firstLine}`);
      // No hypothesis line here: the resolve-class remedies name the
      // story-imports fork seam, which this bundle's hardcoded plugins never
      // consult — the only actionable remedy is the unconditional line below.
      console.error('    decorators will not wrap previews — set cfg.provider to supply the context they provided');
    }
    return false;
  } finally {
    rmSync(entry, { force: true });
  }
}
