// Shared filesystem + string helpers used across the converter modules.
// Pure functions only — no process globals, no CLI parsing. One exception:
// gitWorkspaceRoot reads HOME/USERPROFILE for its containment guard, so the
// home bound has a single definition instead of one per caller.

import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, join, parse, relative, resolve, sep } from 'node:path';

// Normalize to `/` so downstream regexes and split('/') are platform-agnostic.
// Node fs functions accept `/` on Windows, so the normalized form is usable
// everywhere.
export const slash = (p) => (sep === '/' ? p : p.split(sep).join('/'));

// readdirSync order is filesystem-dependent; sort for reproducible output.
export const ls = (d, o) =>
  readdirSync(d, o).sort((a, b) => (a.name ?? a).localeCompare(b.name ?? b));

// Containment bound for config-supplied paths (docsDir, tsconfig, cssEntry,
// extraFonts…). dirname(node_modules) alone is too narrow in monorepos —
// pnpm installs per-package, and docs/tsconfig commonly live in sibling
// packages or at the repo root — so widen to the enclosing git repo when one
// exists (`.git` may be a file: worktrees, submodules). Never $HOME or /
// even when they carry .git (dotfiles repos must not turn the whole home
// dir into "the repo"); callers keep realpath as the symlink vet.
export function gitWorkspaceRoot(base) {
  const homeEnv = process.env.HOME ?? process.env.USERPROFILE;
  // realpath so the comparison sees the same form as the realpath'd walk
  // (a symlinked /home segment would otherwise make the guard silently inert).
  let home = null;
  if (homeEnv) { try { home = realpathSync(homeEnv); } catch { home = resolve(homeEnv); } }
  let d = base;
  while (true) {
    // relative() instead of string equality — case-insensitive on Windows,
    // where the realpath-fallback home and the realpath'd walk can disagree
    // purely on casing.
    // parse(d).root === d is true at any filesystem root — '/', 'C:\\',
    // UNC shares — where resolve('/') is only the CWD-DRIVE root on Windows
    // and would let a stray D:\.git become the ceiling on another drive.
    if ((home && relative(home, d) === '') || parse(d).root === d) return base;
    if (existsSync(join(d, '.git'))) return d;
    const up = dirname(d);
    if (up === d) return base;
    d = up;
  }
}

export const readText = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');

export const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Export name from a story name: PascalCase the alnum runs; prefix S if it
// would start with a digit. Dedup with a counter. Shared by preview-gen
// (writes the export) and storybook/compare.mjs (pairs a story to its cell),
// so the two can never drift.
export function exportName(storyName, used) {
  let n = String(storyName ?? 'Default').split(/[^A-Za-z0-9]+/).filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1)).join('') || 'Default';
  if (/^[0-9]/.test(n)) n = 'S' + n;
  if (!used) return n;
  let out = n, i = 2;
  while (used.has(out)) out = `${n}${i++}`;
  used.add(out);
  return out;
}

// Storybook title → {name, group}. titleMap remaps a derived name to the
// real export name (e.g. {"Toast": "ToastNotification"}). With `exportedSet`,
// scan segments right-to-left for the first that's a known export — handles
// 3-level titles like `Media/Carousel/Simple` where the last segment is the
// story variant, not the component.
export function titleParts(title, titleMap = {}, exportedSet = null) {
  const parts = title.split('/');
  const segs = parts.map((s) => s.replace(/\s+/g, ''));
  let idx = segs.length - 1;
  if (exportedSet) {
    for (let i = segs.length - 1; i >= 0; i--) {
      if (exportedSet.has(titleMap[segs[i]] ?? segs[i])) { idx = i; break; }
    }
  }
  let name = segs[idx];
  // Explicit null = exclude (non-visual utilities etc.), mirroring
  // componentSrcMap's {Name: null} convention. Callers skip name === null.
  if (Object.prototype.hasOwnProperty.call(titleMap, name) && titleMap[name] === null) {
    return { name: null, group: 'misc' };
  }
  name = titleMap[name] ?? name;
  const group =
    (parts[idx - 1] || 'misc').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'misc';
  return { name, group };
}


// JSDoc `/** … */` block immediately preceding `name`'s own declaration,
// `* ` gutters stripped, empty string when no match. Walks backward from the
// decl so a multi-export file picks the nearest doc, not the first-in-file.
export function leadingJsdoc(text, name) {
  const declRx = name
    ? new RegExp(`(?:export\\s+)?(?:declare\\s+)?(?:const|let|function|class|interface|type)\\s+${name}\\b`)
    : /(?:export|declare|const|function|class|interface)/;
  const dm = declRx.exec(text);
  if (!dm) return '';
  const before = text.slice(0, dm.index);
  const end = before.lastIndexOf('*/');
  if (end < 0 || before.slice(end + 2).trim() !== '') return '';
  const start = before.lastIndexOf('/**', end);
  if (start < 0) return '';
  return before.slice(start + 3, end).split('\n').map((l) => l.replace(/^\s*\*\s?/, '')).join('\n').trim();
}

// Recursive directory walk, skipping node_modules. `accept(name)` filters
// which file basenames to collect; default keeps everything.
export function walk(dir, accept = () => true, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of ls(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, accept, out);
    else if (accept(e.name)) out.push(slash(p));
  }
  return out;
}

// ── Config schema: known top-level keys ────────────────────────────────
// esbuild lowers `import.meta` to {} under format:'iife', so the standard
// cross-bundler asset idiom `new URL('img.png', import.meta.url)`
// (webpack/Vite/parcel) throws at the URL constructor — at module init for
// top-level refs, blanking every preview cell (or a whole Vite-built dist
// bundle). Every iife compile spreads this define so the module loads: the
// asset 404s (demo images don't ship) but the component renders. `.invalid`
// is RFC-reserved — never resolves, fails fast. Known trade-off: a dist
// guard like `typeof import.meta.url === 'string' ? … : fallback` now takes
// the URL branch instead of its fallback — inherent to defining the value
// at all, and the unguarded idiom (a hard crash before this) is the
// dominant real-world shape.
export const IIFE_IMPORT_META_DEFINE = {
  'import.meta.url': '"https://ds-preview.invalid/"',
  // Vite-convention env — `import.meta.env.MODE` under iife throws at module
  // init without it. Same trade-off as .url: feature-detecting code takes the
  // env branch with these synthetic values instead of its fallback.
  'import.meta.env': '{"MODE":"development","DEV":true,"PROD":false,"SSR":false,"BASE_URL":"/"}',
};

// Failure-signature → hypothesis lines, printed under the raw error they
// annotate (stderr-only, never persisted). High-specificity signatures only —
// a wrong named remedy anchors harder than none. Order matters: glob/scheme
// must match before the generic module-miss entry.
export const ERROR_REMEDIES = [
  [/could not resolve "[^"]*\*[^"]*"/i,
    'glob import (a bundler-specific idiom esbuild cannot resolve) — verify: the specifier in the error contains * — if confirmed: fork story-imports.mjs to stub that module'],
  [/could not resolve "node:[^"]*"/i,
    'Node builtin imported in a browser-platform bundle (esbuild cannot resolve it) — verify: the specifier starts with node: — if confirmed: fork story-imports.mjs to stub it, or drop the import in an owned .tsx'],
  // 2+ chars before the colon — a single letter is a Windows drive path.
  [/could not resolve "[a-z][\w.+-]+:[^"]*"/i,
    'custom URL-scheme import (bundler plugin territory) — verify: the specifier carries a scheme prefix (not a drive letter or node:) — if confirmed: fork story-imports.mjs to resolve or stub it'],
  [/importing with (a type|the "[^"]+") attribute .{0,40}is not supported|import attribute/i,
    'build-time macro import (evaluated by the repo\'s own bundler) — esbuild cannot evaluate it; fork story-imports.mjs to stub the macro module, or skip those stories'],
  // Covers the major libraries' provider-error phrasings.
  [/must be used within|outside (of )?(a |the )?\w* ?provider|provider was not found|could not find .{0,60}context value|forgot to wrap|wrapped in a <\w*provider/i,
    'missing context provider — verify: storybook shape: node .ds-sync/storybook/probe.mjs --storybook-static .design-sync/sb-reference (detects the actual chain); package shape: check the repo\'s own usage examples — if confirmed: set cfg.provider'],
  [/cannot find module|could not resolve/i,
    'runtime module miss — verify: the named module is package API (a story-only helper should bundle via cfg.storyImports.bundle instead) — if confirmed: add it via cfg.extraEntries'],
  [/invalid hook call|multiple copies of react/i,
    'two React instances — verify: the erroring module imports react directly instead of the shared global — if confirmed: cfg.storyImports.shim it'],
  [/failed to fetch|networkerror|net::err/i,
    'live network call in a story (offline capture cannot serve it) — verify: the story fetches an external URL — if confirmed: cfg.overrides.<Name>.skip that story, or accept close'],
];
export const remedyFor = (t) => ERROR_REMEDIES.find(([re]) => re.test(String(t ?? '')))?.[1] ?? '';
// The one rendering of a hypothesis — format lives in exactly one place.
export const hypothesisLine = (t) => {
  const h = remedyFor(t);
  return h ? `    hypothesis: ${h}` : '';
};

// The single source of truth for what .design-sync/config.json accepts.
// Strict on key NAMES only — interiors (provider.props, overrides entries)
// are deliberately freeform, and type mistakes already fail loudly in the
// build. Strictness is the migration trigger: when a breaking change
// removes a key, it moves to REMOVED_CONFIG_KEYS with a pointer to where
// the value lives now, so a stale config fails with the fix named instead
// of being silently misread (skill-mediated migration; scripts carry no
// compat code).
export const CONFIG_KEYS = new Set([
  // identity + wiring
  'pkg', 'shape', 'projectId', 'buildCmd', 'globalName', 'entry',
  'storybookConfigDir', 'storybookStatic', 'srcDir', 'tsconfig',
  // styling + assets
  'cssEntry', 'tokensPkg', 'tokensGlob', 'extraFonts', 'runtimeFontPrefixes',
  // bundling
  'extraEntries', 'libOverrides', 'storyImports', 'replaces', 'provider',
  // curation + docs
  'titleMap', 'overrides', 'componentSrcMap', 'dtsPropsFor',
  'docsDir', 'docsMap', 'guidelinesGlob', 'readmeHeader',
]);
// name → where the value lives now. Seed on removal; prune after a few
// releases once stale configs have cycled through a sync.
export const REMOVED_CONFIG_KEYS = new Map([
  ['previewArgs', 'the generated-preview tier is gone — author .design-sync/previews/<Name>.tsx instead (it fully replaces previewArgs), then delete this key'],
]);

// Returns ALL violations at once (the consumer is usually an agent — a
// one-pass repair beats whack-a-mole re-runs). Empty array = valid.
export function validateConfig(cfg) {
  if (typeof cfg !== 'object' || cfg === null || Array.isArray(cfg)) {
    return ['config root must be a JSON object'];
  }
  const errors = [];
  for (const k of Object.keys(cfg)) {
    if (CONFIG_KEYS.has(k)) continue;
    if (REMOVED_CONFIG_KEYS.has(k)) {
      errors.push(`"${k}" — ${REMOVED_CONFIG_KEYS.get(k)}`);
      continue;
    }
    const near = [...CONFIG_KEYS].find((n) => n.toLowerCase() === k.toLowerCase());
    errors.push(`unknown key "${k}"${near ? ` — did you mean "${near}"?` : ''}`);
  }
  return errors;
}
