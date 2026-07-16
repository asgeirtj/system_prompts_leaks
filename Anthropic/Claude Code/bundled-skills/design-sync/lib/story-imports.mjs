// How story modules resolve at preview-compile time. Small on purpose and
// FORKABLE: copy to .design-sync/overrides/story-imports.mjs (declare in
// cfg.libOverrides) when a repo's layout needs different rules — this seam
// owns ALL resolution policy, so a fork never touches generation or build
// orchestration. Lighter tweaks need no fork: cfg.storyImports.shim /
// cfg.storyImports.bundle are substring patterns matched against resolved
// paths (any import style — relative, tsconfig alias, bare workspace name)
// that force a module to the bundle global / to source bundling, and
// cfg.storyImports.loaders merges over STORY_LOADERS.
//
// Rules:
// 1. Package + extraEntries imports → `window.<GLOBAL>` (the shipped bundle).
//    Subpaths whose last segment is an exported component (`<pkg>/Button`)
//    shim with that export as the default; every other subpath
//    (`<pkg>/locales/en.json`, `<pkg>/utils`) bundles normally — a wrong
//    shim is silent, a missing module is loud (and the fix is named:
//    cfg.extraEntries merges a subpath's exports onto the global).
// 2. ANY import that RESOLVES to an EXPORTED component's module →
//    `window.<GLOBAL>` too, however it was spelled (relative `../Button` —
//    the dominant story convention — tsconfig alias, or monorepo path). This
//    keeps previews rendering the SHIPPED bundle instead of a duplicate
//    source copy — which breaks React context identity (consumers throw
//    their missing-provider errors) and drops co-located styles. Story files
//    themselves and anything under node_modules are never redirected.
//    Default imports get the matched export as `default` (default-importing
//    the component is a common story convention; a bare namespace shim
//    renders "Element type is invalid" in every such cell).
// 3. Every other import (fixtures, helpers, internal contexts) bundles from
//    source; component imports INSIDE those modules recurse through rule 2.
//    The honest residue: a story needing a component-PRIVATE context that
//    must share identity with the global component renders a cell error and
//    falls to grading/hand-fix — no shim can fix that, by construction.
// 4. @storybook/* runtime → functional stubs. manager/preview/client-api get
//    real no-op hooks (useGlobals/useArgs/addons — module-scope
//    `addons.register()` or a decorator calling `useGlobals()` on an empty
//    stub takes the whole module down); everything else gets an inert
//    callable proxy so the canonical CSF idiom — `args: { onClick: fn() }`,
//    `action('click')` at module scope — evaluates instead of throwing.
// 5. Styles/assets → LOADERS below (styles ship via _ds_bundle.css/styles.css;
//    images inline as data URLs so fixtures keep working offline). Exception:
//    `.module.css` falls through to esbuild's local-css default — class names
//    resolve and the compiled stylesheet lands at _preview/<Name>.css, which
//    the emitted html links when present.

import { existsSync, realpathSync } from 'node:fs';
import { relative, resolve } from 'node:path';

// Storybook's preview-api also re-exports React-compatible hooks for use in
// render functions — those delegate to the page's React (an inert stub there
// is a guaranteed render crash: destructuring a non-iterable).
const MANAGER_API_STUB =
  'const noopChannel={on(){},off(){},once(){},emit(){},removeListener(){}};' +
  'const addons={register(){},add(){},getChannel(){return noopChannel},setConfig(){},getConfig(){return{}}};' +
  'const R=function(){return window.React||{}};' +
  'module.exports={addons,types:{},useGlobals(){return[{},function(){}]},useArgs(){return[{},function(){},function(){}]},useParameter(){},useStorybookApi(){return{}},' +
  'useState(){return R().useState.apply(null,arguments)},useCallback(){return R().useCallback.apply(null,arguments)},useRef(){return R().useRef.apply(null,arguments)},' +
  'useMemo(){return R().useMemo.apply(null,arguments)},useEffect(){return R().useEffect.apply(null,arguments)},useReducer(){return R().useReducer.apply(null,arguments)},' +
  'useChannel(){return function(){}}};';

// Inert callable proxy: every member access yields another inert callable, so
// `fn()`, `action("x")`, `expect.anything()`, `userEvent.click(...)` all
// evaluate to harmless values at module scope. Named imports are copied by
// esbuild's CJS interop from own enumerable props, so the common API surface
// is materialized explicitly (Object.assign keeps them as own props of the
// callable default — do not change the proxy target's own-property shape);
// everything else resolves through the get trap. The DEFAULT export is a
// children-passthrough component: stories render addon defaults as JSX
// (@storybook/addon-links `<LinkTo>…</LinkTo>`), and an object default
// throws "Element type is invalid" the instant React mounts it. Both traps
// hand back the REAL `prototype` — React's shouldConstruct() probes
// `.prototype.isReactComponent`, and a truthy proxy answer classifies the
// stub as a CLASS component, silently swallowing the children.
const INERT_STUB =
  'var inert=new Proxy(function(){},{' +
  'get:function(t,k){if(k==="then")return void 0;if(k==="prototype")return t.prototype;if(k==="valueOf"||k==="toString"||k===Symbol.toPrimitive)return function(){return""};return inert},' +
  'apply:function(){return inert},construct:function(){return{}}});' +
  'var m={};"fn action actions expect userEvent within waitFor screen fireEvent spyOn mocked jest vi configureActions decorateAction setupWorker http HttpResponse graphql rest".split(" ").forEach(function(k){m[k]=inert});' +
  'var def=function(p){return p&&p.children!==void 0?p.children:null};Object.assign(def,m);' +
  'module.exports=new Proxy(def,{get:function(t,k){if(k==="then")return void 0;if(k==="prototype")return t.prototype;return k in m?m[k]:k==="__esModule"?void 0:inert}});';

export const STORY_FILE_RE = /\.stor(?:y|ies)\.[cm]?[jt]sx?$/;

export const STORY_LOADERS = {
  // jsx is a strict syntax superset of js — JSX-in-.js story files are a
  // common convention and plain .js parses identically.
  '.js': 'jsx',
  '.css': 'empty', '.scss': 'empty', '.sass': 'empty', '.less': 'empty', '.styl': 'empty',
  '.png': 'dataurl', '.jpg': 'dataurl', '.jpeg': 'dataurl', '.gif': 'dataurl',
  '.webp': 'dataurl', '.avif': 'dataurl', '.svg': 'dataurl', '.ico': 'dataurl',
  '.woff': 'dataurl', '.woff2': 'dataurl', '.ttf': 'dataurl', '.eot': 'empty',
  '.md': 'text', '.mdx': 'empty', '.mp4': 'empty', '.webm': 'empty', '.mov': 'empty',
};

// Which exported component (if any) does a resolved file path look like the
// source module of? Matches `<...>/Button/Button.tsx`, `<...>/Button/index.ts`,
// and bare `<...>/Button.tsx`; returns the export name or null. A helper
// coincidentally named like an export (`utils/Text.ts`) would false-positive —
// that's what cfg.storyImports.bundle is for; over-shimming surfaces
// immediately as undefined-component cell errors, never as silent wrong
// renders.
function exportedComponentFor(p, exported) {
  const segs = p.replace(/\\/g, '/').split('/');
  const file = (segs[segs.length - 1] ?? '').replace(/\.[cm]?[jt]sx?$/, '');
  const dir = segs[segs.length - 2] ?? '';
  if (exported.has(file)) return file;
  if ((file === 'index' || file === dir) && exported.has(dir)) return dir;
  return null;
}

// The @storybook/* stub plugin alone — also used by the decorator bundler.
export function storybookStubPlugin() {
  return {
    name: 'sb-stub',
    setup(b) {
      b.onResolve({ filter: /^(@storybook\/|storybook(\/|$)|msw(\/|$)|@mswjs\/)/ }, (a) => ({ path: a.path, namespace: 'sb-stub' }));
      b.onLoad({ filter: /.*/, namespace: 'sb-stub' }, (a) => ({
        contents: /(^|\/)(manager|preview|client)-api$/.test(a.path) ? MANAGER_API_STUB : INERT_STUB,
        loader: 'js',
      }));
    },
  };
}

// Build the esbuild plugin set for compiling preview .tsx files (generated
// story-module wrappers AND hand-authored previews — same rules for both).
// IMPORTANT for callers: any tsconfig-paths plugin must be registered AFTER
// these (buildPreviews does this) — the policy plugin resolves aliases via
// b.resolve, so a paths plugin registered first would bypass rule 2.
export function storyImportPlugins({ PKG, GLOBAL, extraEntries = [], exported, cfg, pkgDir }) {
  // Path-form entries (./, ../, absolute) are repo files bundled by path —
  // they must never enter import-SPECIFIER matching below, where a story's
  // relative import could coincidentally equal the config string and get
  // wrongly shimmed to the global. Bare package specifiers only.
  extraEntries = extraEntries.filter((e) => !/^(\.\.?\/|\/|[A-Za-z]:[\\/])/.test(e));
  const escRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pkgRx = new RegExp(`^(?:${[PKG, ...extraEntries].map(escRx).join('|')})(?:/.*)?$`);
  const force = cfg?.storyImports ?? {};
  const matches = (p, pats) => Array.isArray(pats) && pats.some((s) => typeof s === 'string' && p.includes(s));
  // ESM facade shim, NOT CJS: in a `"type":"module"` repo esbuild applies
  // node's ESM-CJS interop to the importing file — `default` becomes the
  // whole exports object and `__esModule` is ignored — which breaks every
  // `import Button from '<pkg>/Button'` (the style most docs examples use).
  // An ESM module binds `default` explicitly under BOTH interop modes; the
  // star re-export of the raw CJS global keeps dynamic named access working
  // (hooks, constants — anything on the global beyond the component list).
  const shimFor = (name) =>
    `export * from "__ds_raw__";var g=window.${GLOBAL};export default ${
      name ? `g[${JSON.stringify(name)}]!==void 0?g[${JSON.stringify(name)}]:g` : `"default" in g?g.default:g`
    };`;
  const shimResult = (name) => ({ path: name ? `ds:${name}` : 'ds', namespace: 'ds-shim' });

  const dsShim = {
    name: 'ds-global',
    setup(b) {
      const entryNames = new Set([PKG, ...extraEntries]);
      b.onResolve({ filter: pkgRx }, (a) => {
        if (matches(a.path, force.bundle)) return null; // explicit bundle wins
        if (!entryNames.has(a.path)) {
          // Subpath import: a named component shims default-aware; anything
          // else bundles normally — a wrong root-namespace shim is silent
          // (undefined members), a missing module is loud, and the loud
          // path's fix is named (cfg.extraEntries / node_modules symlink in
          // the package's own source repo).
          const name = (a.path.split('/').pop() ?? '').replace(/\.[cm]?[jt]sx?$/, '');
          return exported.has(name) ? shimResult(name) : null;
        }
        return shimResult(null);
      });
      b.onLoad({ filter: /.*/, namespace: 'ds-shim' }, (a) => ({
        contents: shimFor(a.path.startsWith('ds:') ? a.path.slice(3) : null),
        loader: 'js',
      }));
      // Location-independent story imports emitted by the preview generator:
      // `@ds-stories/<repo-root-relative path>` resolves against cwd, so the
      // same wrapper compiles from the generated cache or from
      // .design-sync/previews/ after a promote. Extensionless — esbuild
      // appends its resolve extensions.
      b.onResolve({ filter: /^@ds-stories\// }, (a) => {
        const base = resolve(process.cwd(), a.path.slice('@ds-stories/'.length));
        for (const ext of ['', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs', '.mdx']) {
          if (existsSync(base + ext)) return { path: base + ext };
        }
        return { errors: [{ text: `@ds-stories path not found: ${a.path} (resolved against ${process.cwd()})` }] };
      });
      // The raw CJS module the ESM facade star-re-exports — dynamic names
      // (everything on the global) without a static export list.
      b.onResolve({ filter: /^__ds_raw__$/ }, () => ({ path: '__ds_raw__', namespace: 'ds-raw' }));
      b.onLoad({ filter: /.*/, namespace: 'ds-raw' }, () => ({
        contents: `module.exports=window.${GLOBAL};`,
        loader: 'js',
      }));
    },
  };

  // Rule 2: resolve every remaining import and shim the ones that land on an
  // exported component's module — regardless of how the import was spelled.
  // Returning the b.resolve result (instead of null) keeps resolution single-pass.
  // The package's own source BARREL (src/index.* under the build cwd OR under
  // the package dir — monorepos build from the repo root while the barrel
  // lives at packages/<x>/src/) shims to the root namespace: `import { X }
  // from "../src"` would otherwise bundle a second copy of the whole library
  // with its own React contexts.
  const CWD = process.cwd().replace(/\\/g, '/');
  // realpath both roots — esbuild's resolver returns symlink-resolved paths,
  // and a merely-resolve()'d root (symlinked tmpdir, symlinked package dir)
  // would never prefix-match them.
  const real = (p) => { try { return realpathSync(p).replace(/\\/g, '/'); } catch { return null; } };
  const barrelRoots = [...new Set([CWD, real(process.cwd()), pkgDir && resolve(pkgDir).replace(/\\/g, '/'), pkgDir && real(pkgDir)].filter(Boolean))];
  const policyRedirect = {
    name: 'ds-import-policy',
    setup(b) {
      b.onResolve({ filter: /.*/ }, async (a) => {
        if (a.pluginData === 'ds-resolving') return null; // our own re-entry
        if (a.kind === 'entry-point' || (a.namespace && a.namespace !== 'file')) return null;
        const r = await b.resolve(a.path, {
          kind: a.kind, resolveDir: a.resolveDir, importer: a.importer,
          pluginData: 'ds-resolving',
        });
        if (r.errors.length > 0 || !r.path) return null;
        if (r.namespace && r.namespace !== 'file') return r;  // claimed by another plugin
        const p = r.path.replace(/\\/g, '/');
        if (STORY_FILE_RE.test(p)) return r;                  // never the story itself
        if (matches(p, force.bundle)) return r;               // explicit bundle wins
        if (matches(p, force.shim)) return shimResult(exportedComponentFor(p, exported));
        if (p.includes('/node_modules/')) return r;           // third-party stays put
        // relative() instead of a startsWith prefix — case-insensitive on
        // win32, where the pkgDir roots carry user-typed casing (a lowercase
        // d:\ drive from --node-modules) while p carries cwd casing, and JS
        // realpathSync never canonicalizes case. Outside-root ('../') and
        // cross-drive (absolute) remainders can never match the anchor.
        // Known limit: darwin's default case-insensitive APFS still compares
        // case-sensitively here (path.posix.relative) — a blanket lowercase
        // compare would be wrong on case-SENSITIVE volumes, so mis-cased
        // --node-modules on mac remains the user's to fix.
        if (barrelRoots.some((root) => /^src\/index\.[cm]?[jt]sx?$/.test(relative(root, p).replace(/\\/g, '/')))) {
          return shimResult(null);                            // package source barrel
        }
        const name = exportedComponentFor(p, exported);
        return name ? shimResult(name) : r;
      });
    },
  };

  // Bare `import console from "console"` (and node:console) appears in real
  // story files; node builtins can't bundle for the browser, but this one has
  // an exact page-global equivalent.
  const consoleStub = {
    name: 'node-console-stub',
    setup(b) {
      b.onResolve({ filter: /^(node:)?console$/ }, () => ({ path: 'console', namespace: 'node-console' }));
      b.onLoad({ filter: /.*/, namespace: 'node-console' }, () => ({ contents: 'module.exports=console;', loader: 'js' }));
    },
  };

  return {
    plugins: [dsShim, storybookStubPlugin(), consoleStub, policyRedirect],
    loaders: { ...STORY_LOADERS, ...(force.loaders ?? {}) },
  };
}
