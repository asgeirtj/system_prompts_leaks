#!/usr/bin/env node
// Convert a React design system into the claude.ai/design DS-project layout.
// Two source shapes feed the same Source seam (see lib/source-*.mjs):
// storybook (.storybook/ + storybook-static) and package (dist + .d.ts,
// enriched from src/ when present). The output is identical regardless: root
// _ds_bundle.js (IIFE → window.<Namespace> with a first-line `/* @ds-bundle:
// {...} */` header), root styles.css, per-component .d.ts/.prompt.md/<Name>.html.
// The claude.ai/design app's self-check regenerates the adherence config and
// ds_manifest.
//
// lib/emit.mjs + lib/bundle.mjs are the app contract surface — agent never
// edits. Discovery (lib/source-*.mjs) is heuristic; each heuristic has a
// cfg override (grep ASSUMPTION) so non-matching repos write config, not code.
//
// Usage:
//   node package-build.mjs --config .design-sync/config.json \
//     --node-modules ./node_modules \
//     --entry ./dist/index.js \
//     --storybook-static ./storybook-static \
//     --out ./ds-bundle

import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

// Repo-local script overrides: a repo can commit `.design-sync/overrides/<name>.mjs`
// to fork a single adapter for its own quirks. Resolved relative to this
// script's own ./lib/ so cwd doesn't matter.
const BUNDLED_LIB = new URL('./lib/', import.meta.url);
const REPO_LIB = resolve('.design-sync', 'overrides');
// Scanned up front (not accumulated via loadLib) so the [OVERRIDE*]
// cross-check below sees forks whose loadLib runs after it.
const forkedLibs = new Set(
  existsSync(REPO_LIB) ? readdirSync(REPO_LIB).filter((f) => f.endsWith('.mjs')) : [],
);
if (forkedLibs.has('sync-hashes.mjs')) {
  console.error('[OVERRIDE_FORBIDDEN] sync-hashes.mjs cannot be forked — the sidecar, the grading harnesses, and remote-diff must share one recipe or carry-forward becomes unsound');
  process.exit(1);
}
if (forkedLibs.has('preview-gen-package.mjs')) {
  console.error('[OVERRIDE_DEAD] .design-sync/overrides/preview-gen-package.mjs is never loaded — the package-shape generated-preview tier is gone. Author .design-sync/previews/<Name>.tsx instead; delete the fork (and its cfg.libOverrides entry). NOTE: any fork add/delete moves the grade contract for every component — pair the deletion with a full build and expect a one-time full re-verify on the next sync.');
}
// Repo-local fork (.design-sync/overrides/<name>.mjs) wins, else the bundled copy.
async function loadLib(name) {
  if (forkedLibs.has(`${name}.mjs`)) {
    return import(pathToFileURL(join(REPO_LIB, `${name}.mjs`)).href);
  }
  return import(new URL(`${name}.mjs`, BUNDLED_LIB).href);
}
const { gitWorkspaceRoot, validateConfig } = await loadLib('common');
const { bundleExportEvidence, bundleToIife, reactShim, resolveDistEntry, stampHeader, tsconfigPathsPlugin } = await loadLib('bundle');
const { copyTokens, extractFonts, rewriteBundleFontFaces, writeStylesCss } = await loadLib('css');
const { exportedNames, findTypesRoot, isComponentName, jsdocFor, loadDts, partitionSubcomponents, propsBodyFor, smartDefaultProps } = await loadLib('dts');
const { emitBuildMeta, emitPerComponent, emitReadme, emitReviewPage, vendorReact } = await loadLib('emit');
const { buildPreviews, writePreviewFiles } = await loadLib('previews');
const { discoverDocs, emitGuidelines, ingestDoc } = await loadLib('docs');
const { detectShape } = await loadLib('detect');
const { resolvePackage } = await loadLib('source-kit');
const { bundlePreviewDecorators, resolveStorybook } = await loadLib('source-storybook');

// ── flags + config ───────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function flag(name, dflt) {
  const i = argv.indexOf(`--${name}`);
  if (i < 0) return dflt;
  return argv[i + 1];
}
const CONFIG_PATH = flag('config');
let cfg = {};
if (CONFIG_PATH) {
  try { cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8')); }
  catch (e) { console.error(`[CONFIG] ${CONFIG_PATH}: ${e.message}`); process.exit(1); }
  // Strict key validation (the driver pre-flights this too; repeated here so
  // direct invocations get the same contract). A forked common.mjs from
  // before the validator simply skips the check.
  const cfgErrors = validateConfig?.(cfg) ?? [];
  if (cfgErrors.length) {
    for (const e of cfgErrors) console.error(`✗ config: ${e}`);
    console.error(`[CONFIG] ${CONFIG_PATH}: ${cfgErrors.length} error(s) — fix the config and re-run`);
    process.exit(1);
  }
}
// CLI flags override config values.
const NODE_MODULES = flag('node-modules') && resolve(flag('node-modules'));
const INPUTS = flag('inputs', NODE_MODULES ? dirname(NODE_MODULES) : '.');
const PKG = cfg.pkg;
const TOKENS_PKG = cfg.tokensPkg;
let GLOBAL = cfg.globalName; // normalized to a valid id below, derived from pkg name if unset
const OUT = flag('out');
const PROVIDER = cfg.provider ?? null; // {component, props, inner?}
const TOKENS_GLOB = cfg.tokensGlob ?? null;
// cwd-relative like cfg.entry/cfg.storybookStatic — NOT config-file-relative
// (most other cfg paths are package-relative via cfgPath) — so the value
// survives the config's move into .design-sync/ (a committed root-relative
// value resolves identically from either location).
const SB_CONFIG_DIR = flag('storybook-config', null)
  ?? (cfg.storybookConfigDir ? resolve(cfg.storybookConfigDir) : null);
const SB_STATIC = flag('storybook-static', cfg.storybookStatic);
// Package shape reads src/ directly; set cfg.srcDir to override.
const OVERRIDES = cfg.overrides ?? {};
const TITLE_MAP = cfg.titleMap ?? {};
// cfg.libOverrides declares which .design-sync/overrides/ forks exist and why.
// Cross-check so an undocumented fork (or a declared-but-missing one) is loud.
const LIB_OVERRIDES = cfg.libOverrides ?? {};
for (const f of forkedLibs) {
  // Dead fork already diagnosed above — an affirmative "[OVERRIDE] using"
  // line for a module that is never loaded would be a lie.
  if (f === 'preview-gen-package.mjs') continue;
  console.error(LIB_OVERRIDES[f]
    ? `[OVERRIDE] using .design-sync/overrides/${f} — ${LIB_OVERRIDES[f]}`
    : `[OVERRIDE_UNDECLARED] .design-sync/overrides/${f} is forked but not in cfg.libOverrides — add it with a one-line reason`);
}
for (const f of Object.keys(LIB_OVERRIDES)) {
  if (!forkedLibs.has(f)) console.error(`[OVERRIDE_MISSING] cfg.libOverrides declares "${f}" but .design-sync/overrides/${f} doesn't exist`);
}

if (!NODE_MODULES || !PKG || !OUT) {
  console.error('required: --config --node-modules --out');
  process.exit(1);
}

// Derive window.<Namespace> from a DS/package name — mirrors the
// claude.ai/design app's namespace derivation so a CLI-built bundle and an
// app-rebuilt one land on the same global. PascalCase the alnum runs; prefix
// `Ds` if it would start with a digit; fall back to `Ds`. globalName
// (config/--global) overrides the source string but is still normalized, so
// the header and the IIFE global agree.
function toNamespace(name) {
  const ns = String(name ?? '')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');
  return !ns ? 'Ds' : /^[0-9]/.test(ns) ? 'Ds' + ns : ns;
}

// In the DS's own source repo, node_modules/<pkg> doesn't exist (npm won't
// self-install). --entry points at the built dist directly; we then walk up
// to find its package.json.
const ENTRY_OVERRIDE = flag('entry', cfg.entry);
// --skip-dts: skip the per-component ts-morph type resolution (the slow part of
// emit on large DSes). Component discovery/filtering still runs; emitted .d.ts
// bodies are stubs, so package-validate hard-fails [DTS_STUBBED] — intermediate
// fix-loop builds only, never the final build before the upload gate.
const SKIP_DTS = process.argv.includes('--skip-dts');
let PKG_DIR;
if (ENTRY_OVERRIDE) {
  // Walk up to the package's REAL package.json — one with a name. Skip the
  // type-marker stubs ({"type":"module"} files dropped into dist/esm|cjs
  // subtrees): stopping at one truncates the walk inside dist/, reporting
  // version 0.0.0 and hiding src/ and the shipped stylesheet.
  let d = dirname(resolve(ENTRY_OVERRIDE));
  let named = null, first = null;
  while (d !== dirname(d)) {
    try {
      const j = JSON.parse(readFileSync(join(d, 'package.json'), 'utf8'));
      first ??= d;
      if (j.name) { named = d; break; }
    } catch { /* missing or unparsable — keep walking */ }
    d = dirname(d);
  }
  PKG_DIR = named ?? first ?? dirname(resolve(ENTRY_OVERRIDE));
} else {
  PKG_DIR = join(NODE_MODULES, PKG);
}
const pkgJson = existsSync(join(PKG_DIR, 'package.json'))
  ? JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
  : { name: PKG };
// VERSION goes into README.md which reaches the design agent — semver-only.
const VERSION = /^\d+\.\d+\.\d+[\w.+-]*$/.test(pkgJson.version ?? '') ? pkgJson.version : '0.0.0';
// Generic pkg names (e.g. "app") → prefer the DS dir's own name.
const GENERIC_PKG = new Set(['app', 'root', 'frontend', 'web', 'www', 'monorepo', '']);
const pkgNameForNs = GENERIC_PKG.has((pkgJson.name ?? '').toLowerCase()) ? basename(PKG_DIR) : pkgJson.name;
GLOBAL = toNamespace(GLOBAL || pkgNameForNs || PKG);
console.error(`» ${PKG}@${VERSION} → ${OUT} (window.${GLOBAL})`);

// ── reset out dir ────────────────────────────────────────────────────────
// Guard: refuse to rm -rf cwd, $HOME, /, anything in the durable
// .design-sync/ tree (user previews/notes/forks live there — no marker file
// can ever authorize wiping it), or a non-empty dir that isn't a prior
// bundle (no _ds_bundle.js and no .ds-bundle marker). --out is user-supplied.
{
  const outAbs = resolve(OUT);
  const durable = resolve('.design-sync');
  const unsafe = [resolve('/'), resolve(process.env.HOME ?? '/nonexistent'), process.cwd(), durable].includes(outAbs)
    || outAbs.startsWith(durable + sep)
    || (existsSync(outAbs) && statSync(outAbs).isDirectory() && !existsSync(join(outAbs, '_ds_bundle.js')) && !existsSync(join(outAbs, '.ds-bundle')) && readdirSync(outAbs).length > 0)
    || (existsSync(outAbs) && !statSync(outAbs).isDirectory());
  if (unsafe) { console.error(`[OUT_UNSAFE] refusing to rm ${outAbs} — point --out at an empty dir or a prior bundle (never inside .design-sync/)`); process.exit(1); }
}
rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, '_vendor'), { recursive: true });
mkdirSync(join(OUT, 'components'), { recursive: true });
// Marker written early so a mid-run failure (which leaves OUT populated
// before _ds_bundle.js exists) doesn't trip [OUT_UNSAFE] on the next self-heal
// iteration. The guard above treats either file as "prior bundle output".
writeFileSync(join(OUT, '.ds-bundle'), '');
mkdirSync(join(OUT, 'tokens'), { recursive: true });
mkdirSync(join(OUT, 'guidelines'), { recursive: true });

// ── shape detect → adapter → Source ──────────────────────────────────────
await vendorReact({ nodeModules: NODE_MODULES, out: OUT });

const autodetected = detectShape({ INPUTS, SB_STATIC, SB_CONFIG_DIR });
const shape = cfg.shape ?? autodetected;
if (shape !== 'storybook' && shape !== 'package') {
  console.error(`[CONFIG] cfg.shape must be 'storybook' or 'package', got ${JSON.stringify(cfg.shape)}`);
  process.exit(1);
}
console.error(`  source shape: ${shape}${cfg.shape ? ' (from cfg.shape)' : ''}`);
if (cfg.shape && cfg.shape !== autodetected)
  console.error(`[CONFIG] cfg.shape=${cfg.shape} overrides auto-detected '${autodetected}'`);

// Storybook shape generates previews from story modules. The package shape
// has no generated tier — previews are authored (.design-sync/previews/) or
// the component ships the floor card.
const { generatePreviewSource } = shape === 'storybook'
  ? await loadLib('preview-gen-storybook')
  : { generatePreviewSource: () => null };

// Storybook bundles the package's real dist entry; package shape resolves its
// own (dist if present, else synth from src/).
const distEntry =
  shape === 'storybook'
    ? resolveDistEntry({ pkgDir: PKG_DIR, pkgJson, override: ENTRY_OVERRIDE, pkgName: PKG })
    : null;
if (distEntry) console.error(`  entry: ${relative(NODE_MODULES, distEntry)}`);

// Compute the package's export set up front so the storybook adapter's
// titleParts can match 3-level titles (Category/Component/Story) against it.
const exportedSet = exportedNames(PKG_DIR, pkgJson);

const adapters = { storybook: resolveStorybook, package: resolvePackage };
const src = await adapters[shape]({
  INPUTS, SB_CONFIG_DIR, SB_STATIC, NODE_MODULES, OUT,
  PKG, PKG_DIR, pkgJson, ENTRY_OVERRIDE, entry: distEntry,
  titleMap: TITLE_MAP, exportedSet, cfg,
});

// Extra packages to merge into window.<GLOBAL> alongside the DS entry.
// Auto-detect icon sibling packages (same scope, name ends in /icons or
// /icons-react, installed) — otherwise icon components the design agent
// reaches for aren't on the global. cfg.extraEntries is the manual override.
// Match any dep whose name ends in `icons`/`icon`/`icons-react` AND whose
// scope either matches the DS scope OR squash-matches the DS name (covers
// unscoped DSes with scoped icon siblings, e.g. `<pkg>` → `@<pkg>/icons`).
const scope = PKG.startsWith('@') ? PKG.split('/')[0] : null;
const pkgSquash = PKG.replace(/^@/, '').replace(/[^a-z0-9]/gi, '').toLowerCase();
const depNames = Object.keys({ ...pkgJson.dependencies, ...pkgJson.peerDependencies });
const iconSiblings = depNames.filter((d) => {
  if (d === PKG || !/(?:^|[\/-])icons?(?:-react)?$/i.test(d)) return false;
  if (!existsSync(join(NODE_MODULES, d, 'package.json'))) return false;
  if (scope && d.startsWith(scope + '/')) return true;
  if (pkgSquash.length < 3) return false;  // too broad to squash-match safely
  const dScope = d.startsWith('@') ? d.split('/')[0] : d;
  return dScope.replace(/^@/, '').replace(/[^a-z0-9]/gi, '').toLowerCase().startsWith(pkgSquash);
});
const extraEntries = [...new Set([...(cfg.extraEntries ?? []), ...iconSiblings])];

// cfg.* path fields (cssEntry, tsconfig, extraFonts) come from
// .design-sync/config.json, which is part of the synced repo and so
// untrusted when syncing a third-party DS. Each resolved path must land
// inside a fixed root: absolute paths, ../ escapes past the root, and
// symlinks pointing outside it are rejected rather than read/copied.
// workspaceRoot = the git repo enclosing dirname(NODE_MODULES), else
// dirname(NODE_MODULES) itself (not INPUTS — --inputs can point at a source
// subtree that doesn't contain PKG_DIR; see gitWorkspaceRoot in lib/common.mjs
// for why the git repo is the right ceiling). realpath + path.relative so
// Windows case-insensitivity and symlink targets are handled by node.
// Per-field bounds: cssEntry stays bounded to PKG_DIR (its content is
// uploaded verbatim, so a path anywhere under workspaceRoot would let a
// malicious dep's config exfiltrate project-root files); tsconfig,
// extraFonts, docsDir, and guidelinesGlob are bounded to workspaceRoot —
// guideline .md/.mdx files and docsDir bodies DO reach the upload
// (near-)verbatim, so this bound is the only thing standing between a
// hostile config and shipping repo files: it admits only
// explicitly-configured paths, only inside this git repo, only doc and
// font content types, and nothing is ever scanned ambiently at this root.
const workspaceRoot = gitWorkspaceRoot(realpathSync(dirname(NODE_MODULES)));
const pkgRoot = realpathSync(PKG_DIR);
const outside = (real, root) => {
  const r = relative(root, real);
  return r.startsWith('..') || isAbsolute(r);
};
function cfgPath(rel, field, root) {
  if (rel == null) return undefined;
  const p = resolve(PKG_DIR, rel);
  if (!existsSync(p)) { console.error(`  ! ${field}: ${rel} not found — skipped`); return undefined; }
  if (outside(realpathSync(p), root)) {
    console.error(`  ! ${field}: ${rel} resolves outside ${root === pkgRoot ? 'the package' : 'the workspace root'} — skipped`);
    return undefined;
  }
  // Return the resolved path, not the realpath: downstream dirname-relative
  // resolution (tsconfig baseUrl, extractFonts srcDir) must match the
  // non-canonical paths the rest of the build uses, or e.g. `@/lib/utils`
  // aliases break on macOS where /var is a symlink to /private/var.
  return p;
}

let bundleEntry = src.entry;
if (extraEntries.length) {
  for (const p of iconSiblings) console.error(`  [ICON_PKG] auto-including sibling icon package ${p}`);
  // ESM drops ambiguous star re-exports to undefined, so an icon named `Tag`
  // would clobber the `Tag` component. Export main's full namespace as a
  // marker (`__dsMainNs`) and let bundleToIife's footer Object.assign it over
  // the IIFE global at runtime — types are already erased by then.
  //
  // Entry forms: a bare specifier resolves from node_modules; an explicit
  // ./ or ../ entry is a repo file (package-relative, workspaceRoot-bounded
  // like the other cfg paths — .bundle-entry.mjs lives in OUT, so a relative
  // specifier emitted verbatim could never reach the repo). Its content gets
  // bundled and shipped, the same exposure class as docsDir/guidelines.
  const mainAbs = JSON.stringify(resolve(src.entry));
  const specs = [];
  for (const p of extraEntries) {
    // Path-form (explicit relative OR absolute) routes through containment;
    // only bare specifiers go to node_modules resolution. An absolute entry
    // emitted verbatim would let an untrusted config bundle any readable
    // file on disk — same threat model as the other cfg path fields.
    if (p.startsWith('./') || p.startsWith('../') || isAbsolute(p)) {
      const bounded = cfgPath(p, 'extraEntries', workspaceRoot);
      if (bounded) specs.push(resolve(bounded));
    } else {
      specs.push(p);
    }
  }
  bundleEntry = join(OUT, '.bundle-entry.mjs');
  writeFileSync(bundleEntry,
    specs.map((p) => `export * from ${JSON.stringify(p)};`).join('\n') + '\n' +
    `export * from ${mainAbs};\n` +
    `export * as __dsMainNs from ${mainAbs};\n`);
}

// ── bundle → IIFE at window.<GLOBAL> ─────────────────────────────────────
const TSCONFIG_PATH = cfgPath(cfg.tsconfig, 'tsconfig', workspaceRoot);
const { bundleJs, bundleCss, inlinedExternals } = await bundleToIife({
  entry: bundleEntry,
  globalName: GLOBAL,
  nodePaths: NODE_MODULES,
  out: OUT,
  tsconfig: TSCONFIG_PATH,
});
// Same entry the runtime bundle was just built from — the provider gate
// checks against this export list (ground truth), falling back to the
// .d.ts/regex scan only when this pass returns null. The gate is the sole
// consumer, so skip the second esbuild pass entirely when no provider is
// configured (the documented common case).
const exportEvidence = PROVIDER ? await bundleExportEvidence({
  entry: bundleEntry,
  nodePaths: NODE_MODULES,
  tsconfig: TSCONFIG_PATH,
}) : null;

// Auto-apply .storybook/preview decorators as the preview wrapper when no
// cfg.provider is set. Best-effort; cfg.provider remains the override.
let hasDecorators = false;
if (PROVIDER) console.error('  (decorator auto-detect skipped — cfg.provider is set)');
else if (!src.sbDir) console.error('  (decorator auto-detect skipped — no .storybook/ dir found)');
else hasDecorators = await bundlePreviewDecorators({ sbDir: src.sbDir, OUT, NODE_MODULES, PKG, PKG_DIR, GLOBAL });

// ── css / fonts / tokens ─────────────────────────────────────────────────
// Many DSes ship CSS as a separate import rather than
// importing it from the JS entry. cfg.cssEntry overrides; else the shape
// default; else common dist layouts.
let bundleCssSrcDir = PKG_DIR;
const explicitCss = cfgPath(cfg.cssEntry, 'cssEntry', pkgRoot);
if (explicitCss && existsSync(bundleCss)) {
  // The esbuild bundle already emitted some CSS (often just an icon @font-face
  // that rode in via the JS module graph) — don't silently drop the explicitly
  // configured stylesheet on top of it; append it so the DS's real component
  // styles still ship in _ds_bundle.css.
  appendFileSync(bundleCss, `\n/* appended from cfg.cssEntry */\n${readFileSync(explicitCss, 'utf8')}`);
  bundleCssSrcDir = dirname(explicitCss);
  console.error(`  css: ${relative(INPUTS, explicitCss)} (${(statSync(explicitCss).size / 1024).toFixed(0)} KB, appended — bundle already had CSS)`);
} else if (!existsSync(bundleCss)) {
  // explicitCss (cfg.cssEntry/--css, contained); else src.cssEntry (shape
  // default, already absolute); else common dist layouts under PKG_DIR.
  const cand = explicitCss
    ? [explicitCss]
    : src.cssEntry
      ? [src.cssEntry]
      : ['build/esm/styles.css', 'dist/styles.css', 'dist/style.css', 'styles.css'].map((c) => join(PKG_DIR, c));
  for (const p of cand) {
    if (existsSync(p)) {
      cpSync(p, bundleCss);
      bundleCssSrcDir = dirname(p);
      console.error(`  css: ${relative(INPUTS, p)} (${(statSync(p).size / 1024).toFixed(0)} KB, copied)`);
      break;
    }
  }
}
let sbFallback = null, remoteStyleImports = [];
if (src.sbStatic) {
  const { fallbackCssFromStorybook, scrapeRemoteImports } = await loadLib('css-fallback');
  sbFallback = fallbackCssFromStorybook({ bundleCss, sbStatic: src.sbStatic, out: OUT });
  remoteStyleImports = scrapeRemoteImports(src.sbStatic);
}
if (sbFallback) bundleCssSrcDir = sbFallback;
// styles.css @imports _ds_bundle.css and the cards link it — always emit
// so neither reference 404s.
// Marker lets package-validate.mjs report [CSS_RUNTIME] not [CSS_PLACEHOLDER].
if (!existsSync(bundleCss)) {
  writeFileSync(bundleCss,
    '/* @ds-css-runtime: no extracted CSS — styles are runtime-generated */\n');
}
// Containment roots for extractFonts: PKG_DIR always; sbStatic too when the
// fallback fired (fonts live under storybook-static/, not under the package).
const fontRoots = sbFallback ? [PKG_DIR, src.sbStatic] : [PKG_DIR];

const fontsOut = join(OUT, 'fonts');
const fontRules = [
  ...extractFonts(bundleCss, bundleCssSrcDir, { fontsOut, roots: fontRoots }),
  ...(explicitCss ? extractFonts(explicitCss, dirname(explicitCss), { fontsOut, roots: PKG_DIR }) : []),
];
// cfg.extraFonts: explicit paths (package-relative; may point outside the
// package, e.g. a sibling typography package) to @font-face .css files or
// bare font files for brand families the DS's CSS references but doesn't
// itself ship. CSS entries reuse extractFonts; url() refs resolve from the
// CSS file's directory and are copied when they land anywhere under
// workspaceRoot (a typography package's sibling fonts dir is a common
// layout). Containment: see cfgPath above.
// A bare string here iterates char-by-char — coerce to a one-element list.
for (const rel of (typeof cfg.extraFonts === 'string' ? [cfg.extraFonts] : cfg.extraFonts) ?? []) {
  const p = cfgPath(rel, 'extraFonts', workspaceRoot);
  if (!p) continue;
  // extractFonts' startsWith roots-check isn't realpath-aware; workspaceRoot
  // is realpath'd, so srcDir must be too or macOS /var → /private/var
  // rejects every url().
  const pReal = realpathSync(p);
  if (/\.css$/i.test(p)) {
    fontRules.push(...extractFonts(pReal, dirname(pReal), { fontsOut, roots: workspaceRoot }));
  } else if (/\.(woff2?|ttf|otf)$/i.test(p)) {
    mkdirSync(fontsOut, { recursive: true });
    cpSync(pReal, join(fontsOut, basename(p)));
    console.error(`  extraFonts: copied ${basename(p)} — add a matching @font-face (e.g. an extraFonts .css) to use it`);
  } else {
    console.error(`  ! extraFonts: ${rel} isn't a .css or font file — skipped`);
  }
}
// Brand fonts shipped via .storybook/preview-head.html land inline in the
// built iframe.html as data-URI @font-face — invisible to every other font
// path here. Harvest them for families nothing above provided, so the bundle
// renders with the same fonts the reference storybook does.
if (src.sbStatic) {
  const { inlineFontFacesFromStorybook } = await loadLib('css-fallback');
  fontRules.push(...inlineFontFacesFromStorybook(src.sbStatic, fontRules));
}
if (fontRules.length) {
  mkdirSync(fontsOut, { recursive: true });
  writeFileSync(join(fontsOut, 'fonts.css'), [...new Set(fontRules)].join('\n') + '\n');
  console.error(`  fonts: ${fontRules.length} @font-face rule(s) → fonts/`);
}

// ASSUMPTION: when cfg.tokensPkg is unset, a same-scope (or squash-matched, for
// unscoped DSes) dependency whose name contains "tokens" or "theme" is the
// tokens package. Override with cfg.tokensPkg.
let tokensPkg = TOKENS_PKG;
if (!tokensPkg) {
  const tokenSibling = depNames.find((d) => {
    if (d === PKG || !/(?:^|[\/-])(?:tokens?|themes?)(?:$|[\/-])/i.test(d)) return false;
    if (!existsSync(join(NODE_MODULES, d, 'package.json'))) return false;
    if (scope && d.startsWith(scope + '/')) return true;
    if (pkgSquash.length < 3) return false;
    const dScope = d.startsWith('@') ? d.split('/')[0] : d;
    return dScope.replace(/^@/, '').replace(/[^a-z0-9]/gi, '').toLowerCase().startsWith(pkgSquash);
  });
  if (tokenSibling) {
    tokensPkg = tokenSibling;
    console.error(`  [TOKENS_PKG] auto-detected sibling tokens package ${tokenSibling} (override with cfg.tokensPkg)`);
  }
}
let tokenFiles = copyTokens({ tokensPkg, tokensGlob: TOKENS_GLOB, nodeModules: NODE_MODULES, out: OUT });
// Adapter-supplied token CSS when no tokens-pkg given.
if (!tokenFiles.length && src.tokensCss?.length) {
  for (const p of src.tokensCss) {
    if (!existsSync(p)) continue;
    const name = basename(p);
    cpSync(p, join(OUT, 'tokens', name));
    tokenFiles.push(name);
  }
  if (tokenFiles.length) console.error(`  tokens: ${tokenFiles.length} file(s) from source shape default`);
}


// ── component list filtering (storybook: must be public exports) ─────────
const exported = src.exported ?? exportedSet;
// Synth-entry has no .d.ts — the entry IS the export list.
if (src.synthEntry) for (const c of src.components) exported.add(c.name);
// extraEntries exports are merged onto window.<GLOBAL>, so treat them as
// exported — the relative-import redirect and provider gate both check
// against this set.
// Starts lossy when the MAIN scan resolved no names (no .d.ts anywhere —
// exportedNames returns an empty set either way); only the synth path
// legitimately begins empty. The extraEntries loop below adds its own
// loss paths.
let exportScanLossy = !src.synthEntry && exported.size === 0;
for (const ep of extraEntries) {
  // Path-form entries are repo files, not packages — a node_modules
  // package.json probe on them builds a garbage path and silently merges
  // nothing, so the provider gate would false-fire on their exports.
  if (ep.startsWith('./') || ep.startsWith('../') || isAbsolute(ep)) {
    const bounded = cfgPath(ep, 'extraEntries', workspaceRoot);
    if (!bounded) continue;
    try {
      // Source-scan the module's export names (the guidance's 2-line $ref
      // modules: `export const X`, `export { default as Y } from …`). A
      // heuristic for the build-time gates only — runtime truth is the
      // bundle merge itself. Star re-exports are followed within the same
      // workspace bound (a 1-line `export * from './providers.mjs'` is a
      // natural spelling of the recommended module), depth-capped and
      // cycle-guarded.
      const names = new Set();
      const seen = new Set();
      // Literal path first, then esbuild's default resolveExtensions — the
      // dominant spelling is extensionless (`from './providers'`), and the
      // gate should see exactly what esbuild will bundle.
      const resolveHop = (abs) => {
        for (const cand of [abs, `${abs}.tsx`, `${abs}.ts`, `${abs}.jsx`, `${abs}.js`,
          join(abs, 'index.tsx'), join(abs, 'index.ts'), join(abs, 'index.jsx'), join(abs, 'index.js')]) {
          try { if (statSync(cand).isFile()) return cand; } catch { /* keep probing */ }
        }
        return null;
      };
      const scan = (file, depth) => {
        const real = realpathSync(file);
        if (seen.has(real)) return;
        // esbuild has no depth limit — a deeper chain's names still reach
        // the runtime global, the scan just can't prove them.
        if (depth > 3) { exportScanLossy = true; return; }
        seen.add(real);
        const src2 = readFileSync(file, 'utf8');
        for (const m of src2.matchAll(/export\s+(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
        // `export * as Ns from …` binds ONE name (the namespace object).
        for (const m of src2.matchAll(/export\s*\*\s*as\s+([A-Za-z_$][\w$]*)\s*from/g)) { if (m[1] !== 'default') names.add(m[1]); }
        for (const m of src2.matchAll(/export\s*\{([^}]*)\}/g)) {
          for (const part of m[1].split(',')) {
            const alias = part.trim().match(/(?:[\w$]+\s+as\s+)?([A-Za-z_$][\w$]*)\s*$/);
            if (alias && alias[1] !== 'default') names.add(alias[1]);
          }
        }
        for (const m of src2.matchAll(/export\s*\*\s*from\s*['"]([^'"]+)['"]/g)) {
          const target = m[1];
          // Bare → node_modules: the runtime re-exports it, the scan can't
          // follow — the gates must not treat absence as proof.
          if (!target.startsWith('./') && !target.startsWith('../')) { exportScanLossy = true; continue; }
          // Per-hop try/catch: one unresolvable hop must not discard the
          // names already collected from the entry module itself.
          try {
            const hop = resolveHop(resolve(dirname(file), target));
            if (!hop || outside(realpathSync(hop), workspaceRoot)) {
              console.error(`  ! extraEntries: star hop ${target} in ${ep} skipped (unresolvable or outside the workspace) — its names are unknown to the export gates`);
              exportScanLossy = true;
              continue;
            }
            scan(hop, depth + 1);
          } catch (e) {
            console.error(`  ! extraEntries: star hop ${target} in ${ep} failed (${String(e.message ?? e).split('\n')[0]}) — its names are unknown to the export gates`);
            exportScanLossy = true;
          }
        }
      };
      scan(bounded, 0);
      const collisions = [...names].filter((n) => exported.has(n));
      if (collisions.length) {
        console.error(`! [EXPORT_COLLISION] ${ep} exports ${collisions.length} name(s) the main package also exports: ${collisions.slice(0, 6).join(', ')}${collisions.length > 6 ? ', …' : ''} — stories importing these from ${ep} render the main package's binding. Fix: rename the export in ${ep}.`);
      }
      for (const n of names) exported.add(n);
    } catch (e) {
      // EISDIR (cfgPath can't reject directories), unreadable target of a
      // star hop, etc. — loud skip, same contract as every other cfg path
      // field. The gates just won't know these exports; runtime still does.
      console.error(`  ! extraEntries: ${ep} export scan failed (${String(e.message ?? e).split('\n')[0]}) — skipped for the export gates`);
      exportScanLossy = true;
    }
    continue;
  }
  try {
    const dir = join(NODE_MODULES, ep);
    const pj = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    const names = exportedNames(dir, pj);
    // Empty scan usually means no .d.ts resolved (exportedNames returns an
    // empty set either way) — the bundle still `export * from`s this entry,
    // so the runtime global may carry names the gate can't see.
    if (names.size === 0) exportScanLossy = true;
    // Main-package names win collisions in the global merge (bundle.mjs) —
    // a story importing the LOSING name from this sibling gets the main
    // package's binding through the shim (icon sets use bare nouns, so
    // List/Menu/Table-style collisions with component names are common).
    const collisions = [...names].filter((n) => exported.has(n));
    if (collisions.length) {
      console.error(`! [EXPORT_COLLISION] ${ep} exports ${collisions.length} name(s) the main package also exports: ${collisions.slice(0, 6).join(', ')}${collisions.length > 6 ? ', …' : ''} — stories importing these from ${ep} render the main package's binding. Fix: cfg.storyImports.bundle: ["${ep}"] (bundle the sibling from source).`);
    }
    for (const n of names) exported.add(n);
  } catch {
    // Not installed, or the scan itself threw — dsShim still resolves it at
    // runtime, so its names are unknown to the gates.
    exportScanLossy = true;
  }
}
console.error(`  exported PascalCase symbols: ${exported.size}${!PROVIDER ? '' : exportEvidence ? `; bundle export list: ${exportEvidence.exports.size}` : ' (bundle export evidence unavailable — scan fallback)'}`);
// Validate the provider chain at build time — everything downstream
// (providerWrapper, prompt.md notes, the README section) trusts it.
// - Invalid identifier path → always fatal (can never work in a <script>).
// - Absent from the evidence → fatal ONLY when absence is provable.
//   Tier 1 (exportEvidence): esbuild's own export list for the very entry
//   the runtime bundle was built from — absence is proof, EXCEPT when a
//   bundled CJS input is present (`export * from <cjs>` names aren't
//   statically enumerable, so they're missing from the list).
//   Tier 2 (evidence pass failed): the .d.ts/regex scan — heuristic, so
//   the accumulated exportScanLossy loss paths downgrade fatal to warn.
//   The warn path trusts the config and still emits the wrap
//   (pre-validation builds silently dropped it, which hid typos behind
//   unthemed-but-rendering cards).
for (let p = PROVIDER; p; p = p.inner) {
  // Per-segment: a bare character-class dot admits `Theme..Provider` /
  // `Theme.` / `Theme.1x`, which parse-kill every preview <script>.
  if (!/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(String(p.component ?? ''))) {
    console.error(`[PROVIDER_INVALID] cfg.provider component "${p.component}" isn't a valid identifier path (Name or Name.SubName) — fix cfg.provider.`);
    process.exit(1);
  }
  const head = String(p.component).split('.')[0];
  if (exportEvidence) {
    // Union pass: the bundle's export list proves every statically-reachable
    // ESM name; the .d.ts scan covers the one class the list can't — names
    // re-exported from CJS (runtime __reExport) that types DO enumerate.
    if (exportEvidence.exports.has(head) || exported.has(head)) continue;
    // Absent from both. scan-lossy flags don't soften this tier (the
    // evidence pass enumerated every ESM path the scan might have lost),
    // but the non-PascalCase trust carve-out stays: fatality for the
    // unstable_X convention is a policy question, not an evidence one.
    if (!exportEvidence.cjsPresent && /^[A-Z][A-Za-z0-9]*$/.test(head)) {
      console.error(`[PROVIDER_UNEXPORTED] cfg.provider component "${p.component}" is not a bundle export (absent from the bundle's own export list) — every preview would fail with "Element type is invalid". Check the exact exported name, or export it via cfg.extraEntries.`);
      process.exit(1);
    }
    console.error(`! [PROVIDER_UNVERIFIED] cfg.provider component "${p.component}" isn't in the bundle's export list (a bundled CJS module's re-exports can't be enumerated, or a non-PascalCase convention name) — proceeding on trust; if every preview fails with "Element type is invalid", the name is wrong.`);
    continue;
  }
  if (exported.has(head)) continue;
  if (/^[A-Z][A-Za-z0-9]*$/.test(head) && !exportScanLossy) {
    // Set-eligible name, complete scan, still absent: a real typo. Every
    // preview card would render "Element type is invalid", and the docs
    // emitters would ship confident wrap guidance for a broken chain.
    console.error(`[PROVIDER_UNEXPORTED] cfg.provider component "${p.component}" is not a bundle export — every preview would fail with "Element type is invalid". Check the exact exported name, or export it via cfg.extraEntries.`);
    process.exit(1);
  }
  console.error(`! [PROVIDER_UNVERIFIED] cfg.provider component "${p.component}" isn't in the scanned export set (non-PascalCase name or a skipped export scan) — proceeding on trust; if every preview fails with "Element type is invalid", the name is wrong.`);
}

// _adherence.oxlintrc.json rules: map raw HTML elements to the DS component
// that should replace them. One rule per raw element — the first name the DS
// actually exports wins. Weak-semantic elements (p/span/h1-h6) are excluded.
const REPLACES_BY_ELEMENT = {
  button: ['Button'],
  a: ['Link', 'Anchor'],
  input: ['TextField', 'TextInput', 'Input'],
  textarea: ['Textarea', 'TextArea'],
  select: ['Select', 'Picker', 'Dropdown'],
  'input[type=checkbox]': ['Checkbox'],
  'input[type=radio]': ['RadioButton', 'Radio'],
  'input[type=range]': ['Slider'],
  img: ['Image'],
  ul: ['List'],
  form: ['Form'],
  table: ['Table', 'DataTable'],
  dialog: ['Modal', 'Dialog'],
  ...(cfg.replaces ?? {}),
};
const REPLACES = {};
for (const [el, names] of Object.entries(REPLACES_BY_ELEMENT)) {
  const n = (Array.isArray(names) ? names : [names]).find((c) => exported.has(c));
  if (n) REPLACES[n] = el;
}

if (!src.components.length && !src.tokensOnly) {
  console.error(`[ZERO_MATCH] ${shape === 'storybook' ? 'no story-type entries in storybook-static/index.json (only docs, or empty) — check the storybook config stories glob' : 'no components discovered'}.`);
  process.exit(1);
}
let components = src.shape === 'storybook'
  ? src.components.filter((c) => exported.has(c.name))
  : src.components;
if (src.shape === 'storybook') {
  const unmapped = src.components.filter((c) => !exported.has(c.name)).map((c) => c.name);
  if (unmapped.length) {
    console.error(
      `[TITLE_UNMAPPED] ${unmapped.length} storybook title(s) don't match a package export — dropped: ` +
        `${unmapped.slice(0, 10).join(', ')}${unmapped.length > 10 ? ', …' : ''}. ` +
        `Add cfg.titleMap {<title-name>: <export-name>} if these are real components under different names.`,
    );
  }
  console.error(`  ${components.length}/${src.components.length} storybook components are public exports`);
}
// Dedup by name + sort.
const seen = new Set();
components = components.filter((c) => !seen.has(c.name) && seen.add(c.name));
components.sort((a, b) => a.name.localeCompare(b.name));
console.error(`  components: ${components.length}`);

// ── per-component types from shipped .d.ts ───────────────────────────────
const dts = loadDts(findTypesRoot(PKG_DIR, pkgJson));
for (const n of dts.nonComponents) exported.delete(n);
{
  const before = components.length;
  components = components.filter((c) => !dts.nonComponents.has(c.name) && isComponentName(c.name));
  console.error(
    `  (excluded ${before - components.length} enum/type/context/hook exports; ${components.length} components)`,
  );
}
// Subcomponents (TableRow when Table exists) don't get a standalone preview
// — they typically need the parent to render. Still in `exported` (importable)
// and listed under the parent. cfg.componentSrcMap pins (non-null) force a
// name to be treated as a root.
{
  const pinned = new Set(Object.entries(cfg.componentSrcMap ?? {}).filter(([, v]) => v !== null).map(([k]) => k));
  const { parentOf } = partitionSubcomponents(components.map((c) => c.name), dts.compounds);
  for (const k of pinned) parentOf.delete(k);
  if (parentOf.size) {
    const byParent = new Map();
    for (const [sub, parent] of parentOf) (byParent.get(parent) ?? byParent.set(parent, []).get(parent)).push(sub);
    for (const c of components) if (byParent.has(c.name)) c.subcomponents = byParent.get(c.name).sort();
    components = components.filter((c) => !parentOf.has(c.name));
    const sample = [...byParent].slice(0, 3).map(([p, s]) => `${p}←${s.slice(0, 3).join(',')}${s.length > 3 ? ',…' : ''}`).join('; ');
    console.error(`  (grouped ${parentOf.size} subcomponents under ${byParent.size} parents; ${components.length} roots: ${sample}${byParent.size > 3 ? '; …' : ''})`);
  }
}

// ── per-component docs + guidelines ──────────────────────────────────────
// Probe for a doc file per component (sibling .md → docsDir → stories.mdx, with
// cfg.docsMap overrides). Ingest the matched ones; frontmatter `category` sets
// c.group when the component doesn't already have a non-generic one. cfg paths
// (docsDir / docsMap / guidelinesGlob) route through the same cfgPath/outside
// validation as tsconfig/cssEntry/extraFonts above, bounded to workspaceRoot.
// Runs AFTER the .d.ts non-component filter so the docs:N/M count and
// [DOCS_UNMAPPED] lines reflect the components actually emitted.
const wsCfgPath = (rel, field) => cfgPath(rel, field, workspaceRoot);
const guidelineFiles = emitGuidelines({ cfg, PKG_DIR, OUT, cfgPath: wsCfgPath, workspaceRoot });
discoverDocs({ components, PKG_DIR, cfg, cfgPath: wsCfgPath });
// A NAMED grouping where EVERY component shares one group carries no
// information — a global storybook titlePrefix ("All components/",
// "Components/") produces exactly that. Blank it to misc so per-component
// doc categories take over below (misc is already overridable); doc-less
// components stay in misc, which says "ungrouped" honestly instead of a
// two-item "all-components". A uniform general/misc/empty group is left
// alone (already doc-overridable; renaming is churn — package-shape builds
// default everything to general), and so is a uniform named group when NO
// doc category ever applies: with nothing to take precedence, blanking
// would regress a deliberately single-group library (Forms/Input,
// Forms/Select, no docs) to misc. The decision therefore lands AFTER the
// ingest loop, once it's known whether any category actually replaced the
// group.
const uniformNamed = (() => {
  const groups = new Set(components.map((c) => c.group || ''));
  const only = groups.size === 1 ? [...groups][0] : null;
  return components.length > 1 && only && only !== 'general' && only !== 'misc' ? only : null;
})();
// Applied-ness is tracked per component, NOT inferred from the group value
// afterward: a doc whose category normalizes to exactly the uniform group
// name ("Components/" titlePrefix + `category: Components`) has explicitly
// placed its component there and must not be blanked with the leftovers.
const categoryApplied = new Set();
for (const c of components) {
  if (!c.docPath) continue;
  const d = ingestDoc(c.docPath);
  c.docBody = d.body;
  c.docKeywords = d.keywords;
  if (d.category && (!c.group || c.group === 'general' || c.group === 'misc' || c.group === uniformNamed)) {
    const g = d.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (g) { c.group = g; categoryApplied.add(c); }
  }
}
if (uniformNamed && categoryApplied.size > 0) {
  console.error(`  (single flat group "${uniformNamed}" across all components — doc frontmatter categories take precedence; doc-less components go to misc)`);
  for (const c of components) if (!categoryApplied.has(c)) c.group = 'misc';
}

// ── preview files: .design-sync/previews/ (owned) + .cache/previews/ (generated) ──
// Generated wrappers regenerate into the gitignored cache each run; to own one
// the user copies it to .design-sync/previews/ minus its marker line, and the
// owned copy wins from then on. Compiled to OUT/_preview/<Name>.js for the
// html to load; build failures fall back to the floor-card html.
const previewDir = resolve('.design-sync', 'previews');
const genPreviewDir = resolve('.design-sync', '.cache', 'previews');
mkdirSync(resolve('.design-sync', '.cache'), { recursive: true });
// Self-defending: even a sloppy `git add .design-sync` can't commit the cache.
writeFileSync(join(resolve('.design-sync', '.cache'), '.gitignore'), '*\n');
writePreviewFiles({
  components, previewDir, genDir: genPreviewDir,
  gen: (c) => generatePreviewSource(c, {
    exported, pkg: PKG,
    skip: OVERRIDES[c.name]?.skip,
  }),
});

// Import resolution policy for preview compiles — a forkable seam
// (.design-sync/overrides/story-imports.mjs + cfg.storyImports patterns).
const { storyImportPlugins } = await loadLib('story-imports');
const storyImports = storyImportPlugins({ PKG, GLOBAL, extraEntries, exported, cfg, pkgDir: PKG_DIR });
const builtPreviews = await buildPreviews({
  components, previewDir, genDir: genPreviewDir, OUT, reactShim, NODE_MODULES,
  pathsPlugin: TSCONFIG_PATH ? tsconfigPathsPlugin(TSCONFIG_PATH) : null,
  importPlugins: storyImports.plugins,
  loaders: storyImports.loaders,
});

// ── emit ─────────────────────────────────────────────────────────────────
emitPerComponent({
  src, components, OUT, GLOBAL, PKG, VERSION, OVERRIDES, REPLACES, PROVIDER, hasDecorators, builtPreviews,
  propsBodyFor: (n) => SKIP_DTS
    ? (cfg.dtsPropsFor?.[n]
      ? { body: cfg.dtsPropsFor[n], generics: '', extendsClause: '', prelude: '' }
      : { body: '  [prop: string]: unknown; // stub — built with --skip-dts', generics: '', extendsClause: '', prelude: '' })
    : propsBodyFor(n, { ...dts, dtsPropsFor: cfg.dtsPropsFor }),
  compoundsFor: (n) => dts.compounds.get(n),
  smartDefaultProps,
});

// sourceKeys — the grade contract (lib/sync-hashes.mjs), computed once and
// stamped into the manifest + sidecar. Harnesses read the stamp, never live
// config, so the key always describes the artifacts this build produced.
const { KEY_RECIPE, configSlicesFor, scriptsShaFor, sourceKeyFor } = await loadLib('sync-hashes');
const cfgSlices = configSlicesFor(cfg);
const sourceKeys = Object.fromEntries(components.map((c) => [
  c.name,
  sourceKeyFor(c.name, {
    globalSlice: cfgSlices.global,
    componentSlice: cfgSlices.componentFor(c.name),
    ...(shape === 'storybook' ? { stories: c.visibleStoryIds ?? [], srcSha: c.srcSha ?? null } : {}),
  }),
]));

// .stories-map.json — LOCAL build manifest for the incremental tooling
// (storybook/compare.mjs pairs stories to preview cells; lib/preview-rebuild.mjs
// recompiles single previews without re-deriving config). Carries the values
// package-build resolved (auto-detected icon extraEntries, absolute pkgDir)
// so the small scripts can't drift from the build. Not uploaded (dot-prefixed).
// Empty `stories` for the package shape — compare has no storybook ground
// truth there and skips those components.
writeFileSync(
  join(OUT, '.stories-map.json'),
  JSON.stringify({
    global: GLOBAL,
    pkg: PKG,
    pkgDir: PKG_DIR,
    extraEntries,
    // For preview-rebuild's story-import resolution policy (the provider
    // gate no longer reads it — cfg.provider is validated at build time).
    exported: [...exported].sort(),
    storybookStatic: src.sbStatic ?? null,
    keyRecipe: KEY_RECIPE,
    // Stamped slices keep preview-rebuild's re-stamp on this build's basis.
    cfgSliceGlobal: cfgSlices.global,
    components: components.map((c) => ({
      name: c.name,
      group: c.group,
      // srcSha fingerprints the STORY FILE — the "does the owned preview need
      // editing?" signal. A storybook render can move because component
      // internals changed (srcSha stable — both sides re-render the new code
      // in lockstep, just re-grade) or because the story code changed (srcSha
      // differs — the preview must follow). exportKey is the module export
      // each story composes from; emitted is the exact (deduped) export name
      // its cell renders under — compare pairs on it, falling back to a
      // fuzzy exportKey match for hand-owned previews.
      srcSha: c.srcSha ?? null,
      sourceKey: sourceKeys[c.name],
      cfgSlice: cfgSlices.componentFor(c.name),
      stories: (c.visibleStoryIds ?? []).map((s) => ({ id: s.id, name: s.name, exportKey: s.exportKey ?? null, emitted: s.emitted ?? null })),
    })),
  }, null, 2) + '\n',
);

emitReviewPage({ OUT, components });

rewriteBundleFontFaces({ out: OUT, bundleCss });
writeStylesCss({ out: OUT, tokenFiles, bundleCss, fontRules, remoteImports: remoteStyleImports });

stampHeader(bundleJs, { namespace: GLOBAL, components, inlinedExternals });

// cfg.readmeHeader: repo-authored conventions/header file, prepended
// verbatim to the generated README (and thus inlined first into the
// consumer's agent prompt). Resolved relative to the CONFIG's home (the
// directory containing .design-sync/) — the file lives beside the config
// by the skill's own convention, and that base is correct in every flow
// (package checkouts, monorepos, published-dist scratch dirs) where
// PKG_DIR-relative is not. workspaceRoot-contained like docsDir: the
// content reaches the upload verbatim, same exposure class.
let readmeHeaderPath;
if (cfg.readmeHeader != null && CONFIG_PATH) { // cfg keys exist only when CONFIG_PATH was read; the guard keeps that invariant local instead of imported
  // Config home = the directory the .design-sync/ convention hangs off.
  // Canonical layout: <home>/.design-sync/config.json → one hop up from the
  // config's dir. The legacy root layout (the pre-migration config name at
  // the repo root — see base SKILL.md's migration step) has no .design-sync/
  // parent — the config's own directory IS the home; an unconditional '..' would anchor resolution
  // and containment on the repo's PARENT.
  const cfgDir = realpathSync(dirname(CONFIG_PATH));
  const cfgHome = basename(cfgDir) === '.design-sync' ? dirname(cfgDir) : cfgDir;
  // Containment ceiling = the git repo enclosing the CONFIG HOME — not the
  // node_modules-derived workspaceRoot, which in the §2.7 scratch-dir flow
  // is a disjoint tree (no .git ancestor → the scratch dir itself) and
  // would guaranteed-reject the canonical config value. The conventions
  // file is repo-committed content in the same trust class as the config
  // that names it; this ceiling still forbids escaping the config's repo.
  const headerRoot = gitWorkspaceRoot(cfgHome);
  const cand = resolve(cfgHome, cfg.readmeHeader);
  if (!existsSync(cand)) {
    console.error(`  ! readmeHeader: ${cfg.readmeHeader} not found at the config home — skipped`);
  } else if (outside(realpathSync(cand), headerRoot)) {
    console.error(`  ! readmeHeader: ${cfg.readmeHeader} resolves outside the config's repo — skipped`);
  } else if (!statSync(cand).isFile()) {
    console.error(`  ! readmeHeader: ${cfg.readmeHeader} is not a regular file — skipped`);
  } else if (statSync(cand).size <= 1_000_000 && readFileSync(cand, 'utf8').trim().length === 0) {
    // trim-empty, matching emitReadme's own is-present test — a whitespace-only
    // file must not earn the positive "stitching" line.
    console.error(`  ! readmeHeader: ${cfg.readmeHeader} is empty — skipped`);
  } else if (statSync(cand).size > 1_000_000) {
    // The consumer inlines only the first 32,000 README chars — anything
    // past that is dead weight by design, so a cap loses nothing and keeps
    // the field's warn-and-skip degradation contract (vs an
    // ERR_STRING_TOO_LONG crash at the end of an expensive build).
    console.error(`  ! readmeHeader: ${cfg.readmeHeader} is ${statSync(cand).size} bytes — too large to be a prompt header, skipped`);
  } else {
    readmeHeaderPath = cand;
    console.error(`  readmeHeader: stitching ${cfg.readmeHeader}`);
  }
}
emitReadme({
  OUT, GLOBAL, PKG, VERSION, TOKENS_PKG, components, tokenFiles,
  // Pre-validated by the fatal [PROVIDER_UNEXPORTED] gate above.
  hasProvider: !!PROVIDER,
  PROVIDER, hasDecorators,
  jsdocFor: (n) => (SKIP_DTS ? '' : jsdocFor(n, dts)),
  compoundsFor: (n) => dts.compounds.get(n),
  guidelineCount: guidelineFiles.length,
  headerText: readmeHeaderPath ? readFileSync(readmeHeaderPath, 'utf8') : '',
});

const count = emitBuildMeta({ OUT, GLOBAL, PKG, VERSION, PROVIDER, OVERRIDES, components, shape: src.shape, cfg });
if (SKIP_DTS) {
  const metaPath = join(OUT, '.ds-build-meta.json');
  writeFileSync(metaPath, JSON.stringify({ ...JSON.parse(readFileSync(metaPath, 'utf8')), dtsStubbed: true }, null, 2) + '\n');
  console.error('  [DTS_STUBBED] .d.ts bodies are stubs (--skip-dts) — validate will refuse this bundle for upload; run the final build without the flag');
}

// _ds_sync.json — the verification anchor future syncs diff against (small
// sidecar, so re-syncs never download the full bundle). sourceKeys use the
// SAME recipe the grading harnesses key on (lib/sync-hashes.mjs): a component
// whose sourceKey matches the uploaded sidecar has unchanged sources, so its
// grades carry forward and it needs no re-verification; renderHashes detect
// artifact churn on source-stable components (spot-check + re-ship);
// styleSha/bundleSha12/auxSha drive the upload partition only. Uploaded in
// the same fenced plan as the bundle; off-script layout generators must
// produce it too. Written LAST so every hashed surface (README — auxSha)
// exists.
{
  const { auxShaFor, styleShaFor, renderHashFor } = await loadLib('sync-hashes');
  const styleSha = styleShaFor(OUT, { includeBundleBody: shape !== 'storybook' });
  const renderHashes = Object.fromEntries(components.map((c) => [
    c.name,
    renderHashFor(OUT, c, shape === 'storybook'
      ? { stories: (c.visibleStoryIds ?? []).map((s) => ({ name: s.name, exportKey: s.exportKey ?? null, emitted: s.emitted ?? null })), srcSha: c.srcSha ?? null }
      : {}),
  ]));
  // sourceHashes verbatim from the stamped header (one parse — the sidecar
  // and the header can't disagree), so the incremental-upload diff also
  // works from this 2KB file instead of downloading the bundle.
  const bundleBuf = readFileSync(bundleJs);
  const headerMeta = JSON.parse(/^\/\* @ds-bundle: (.*) \*\//.exec(bundleBuf.toString('utf8').split('\n', 1)[0])[1].replace(/\*\\\//g, '*/'));
  // Hash the raw bytes — validate and remote-diff hash Buffers, and a
  // utf8 round-trip diverges on any invalid byte.
  const bundleSha12 = createHash('sha256').update(bundleBuf).digest('hex').slice(0, 12);
  // sourceKeys/keyRecipe/scriptsSha are additive — pre-sourceKey consumers
  // validate styleSha/renderHashes/sourceHashes and ignore extras.
  writeFileSync(join(OUT, '_ds_sync.json'), JSON.stringify({ shape, styleSha, renderHashes, sourceKeys, keyRecipe: KEY_RECIPE, scriptsSha: scriptsShaFor(), sourceHashes: headerMeta.sourceHashes, auxSha: auxShaFor(OUT), bundleSha12 }, null, 2) + '\n');
  console.error(`  _ds_sync.json: ${components.length} render hash(es) + source key(s) (verification anchor)`);
}

// The upload rejects files over 12 MB — surface offenders at BUILD time, not
// after grading (a post-grade slim changes contracts and clears grades).
{
  const MAX = 12 * 1024 * 1024;
  const big = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && statSync(p).size > MAX) big.push([relative(OUT, p), statSync(p).size]);
    }
  };
  try { walk(OUT); } catch { /* best-effort */ }
  for (const [p, sz] of big) {
    console.error(`! [FILE_TOO_LARGE] ${p} is ${(sz / 1024 / 1024).toFixed(1)} MB — the upload rejects files over ${MAX / 1024 / 1024} MB. Slim it NOW (before grading): heavy dev-only deps (syntax highlighters, icons-as-code) usually don't belong in a preview or decorator bundle.`);
  }
}

console.error(`✓ wrote ${OUT}: _ds_bundle.js + styles.css + ${count} component previews`);
