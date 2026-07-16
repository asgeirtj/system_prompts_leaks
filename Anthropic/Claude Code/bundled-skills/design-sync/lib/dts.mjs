// .d.ts extraction via ts-morph (real TS checker). Resolves the apparent
// structural type of each <Name>Props — unwraps Omit/Pick, follows extends
// chains and intersections, resolves `(typeof X)[number]` / mapped types to
// literal unions.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { Project, Node, ts } from 'ts-morph';

export function findTypesRoot(pkgDir, pkgJson) {
  // Workspace/monorepo packages often point dev `types` at src/*.ts (no .d.ts
  // tree there); publishConfig carries the published .d.ts entry — prefer it
  // when it exists on disk.
  const pubTypes = pkgJson.publishConfig?.types;
  if (pubTypes && existsSync(join(pkgDir, pubTypes))) return dirname(join(pkgDir, pubTypes));
  const t = pkgJson.types || pkgJson.typings;
  if (t) return dirname(join(pkgDir, t));
  const hasDts = (d) => { try { return readdirSync(d).some((f) => f.endsWith('.d.ts')); } catch { return false; } };
  for (const c of ['build/ts', 'dist/types', 'types', 'lib', 'dist']) {
    const p = join(pkgDir, c);
    if (existsSync(p) && (c !== 'dist' || hasDts(p))) return p;
  }
  return pkgDir;
}

// *Props are prop interfaces; ALL-CAPS are object constants; *Manager /
// *Placements / *Context are utility singletons; use* are hooks — none
// renderable. (dts.nonComponents also catches React.Context by symbol kind;
// the suffix check is belt-and-suspenders for DSes where that misses.)
export const isComponentName = (n) => !n.endsWith('Props') && !/^[A-Z][A-Z0-9_]+$/.test(n)
  && !/(?:Manager|Placements|Context)$/.test(n) && !/^use[A-Z]/.test(n);

// Partition into roots and subcomponents. A name is a subcomponent ONLY when
// another name is a PascalCase prefix of it AND the suffix is an actual
// namespace member of that prefix per the `compounds` map (i.e. Table.Row
// exists, so top-level TableRow is the same subpart). Name shape alone
// can't distinguish TableRow (only renders inside Table) from ButtonGroup
// (standalone) — the compounds membership is the reliable signal. For DSes
// that export subparts top-level only (no `Table.Row` namespace), this
// conservatively does nothing.
export function partitionSubcomponents(names, compounds) {
  const set = new Set(names);
  const parentOf = new Map();
  for (const n of names) {
    const parts = n.match(/[A-Z][a-z0-9]*/g) ?? [];
    // Try longest prefix first, keep trying shorter ones — `ListItemText`
    // with compounds {List: ['ItemText']} must reach `List` even if
    // `ListItem` is itself a top-level name.
    for (let i = parts.length - 1; i >= 1; i--) {
      const prefix = parts.slice(0, i).join('');
      if (!set.has(prefix)) continue;
      const suffix = parts.slice(i).join('');
      if ((compounds?.get(prefix) ?? []).includes(suffix)) { parentOf.set(n, prefix); break; }
    }
  }
  // Flatten transitively — TableRowCell → TableRow → Table becomes
  // TableRowCell → Table, so the caller's per-root bucketing doesn't lose
  // subs whose immediate parent is itself a sub. Terminates: each parent has
  // strictly fewer PascalCase parts than its child.
  for (const [n] of parentOf) {
    let p = parentOf.get(n);
    while (parentOf.has(p)) p = parentOf.get(p);
    parentOf.set(n, p);
  }
  return { parentOf };
}

// One Project per package — loadDts/exportedNames share it.
const projects = new Map();

function projectFor(pkgDir, typesRoot) {
  if (projects.has(pkgDir)) return projects.get(pkgDir);
  // Derive node_modules for cross-package resolution (React, peer deps).
  // Normalize separators — pkgDir may have backslashes on Windows.
  const posix = pkgDir.split('\\').join('/');
  const i = posix.lastIndexOf('/node_modules/');
  let nodeModules = i >= 0 ? join(pkgDir.slice(0, i), 'node_modules') : join(pkgDir, '..');
  // Workspace packages live outside node_modules — walk up to the hoisted
  // root node_modules so @types/react resolves (otherwise React utility types
  // collapse to `any` and inherited props drop out of the emitted bodies).
  if (!existsSync(join(nodeModules, '@types', 'react'))) {
    for (let d = pkgDir; ; d = dirname(d)) {
      if (existsSync(join(d, 'node_modules', '@types', 'react'))) { nodeModules = join(d, 'node_modules'); break; }
      if (dirname(d) === d) break;
    }
  }
  const pj = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
  // Same publishConfig preference as findTypesRoot — keep the two in sync.
  const pubEntry = pj.publishConfig?.types;
  const entry = join(pkgDir, (pubEntry && existsSync(join(pkgDir, pubEntry)) ? pubEntry : null) || pj.types || pj.typings || 'index.d.ts');
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
      skipLibCheck: true,
      strict: false,
    },
  });
  // Add the package's own .d.ts tree plus @types/react (otherwise
  // `ComponentPropsWithoutRef<…>` is `any` and intersection types collapse).
  const reactTypes = join(nodeModules, '@types', 'react', 'index.d.ts');
  // The negation must be absolute-scoped to match the positive pattern —
  // ts-morph's fast-glob ignores bare `!**/node_modules/**` otherwise.
  const root = typesRoot ?? dirname(entry);
  project.addSourceFilesAtPaths([`${root}/**/*.d.ts`, `!${root}/**/node_modules/**`]);
  console.error(`  [DTS] parsed ${project.getSourceFiles().length} .d.ts files from ${root}`);
  // ts-morph StandardizedFilePath is always forward-slash; normalize pkgDir
  // once so fp.startsWith(pkgDir) in isOwnProp/propsBodyFor works on Windows.
  // Trailing slash so a sibling node_modules package whose name is a prefix of
  // this one (foo vs foo-icons) isn't mis-classified as in-package.
  const pkgDirStd = pkgDir.split('\\').join('/').replace(/\/?$/, '/');
  if (existsSync(reactTypes)) project.addSourceFileAtPath(reactTypes);
  else console.error(
    '\n[DTS_REACT] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '[DTS_REACT] @types/react not found in node_modules. React utility types\n' +
    '[DTS_REACT] (ComponentPropsWithoutRef, FC, …) will resolve to `any`, so\n' +
    '[DTS_REACT] components whose props extend them will emit EMPTY bodies.\n' +
    '[DTS_REACT] Fix: `npm i -D @types/react` then rebuild.\n' +
    '[DTS_REACT] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
  );
  if (existsSync(entry)) project.addSourceFileAtPath(entry);
  const ctx = { project, entry, pkgDir: pkgDirStd };
  projects.set(pkgDir, ctx);
  return ctx;
}

// Keep a prop unless its declaration lives in React/DOM types or a CSS-in-JS
// style-system base (hundreds of token-typed style props from the component
// library's styled-props layer). The small KEEP_PROP set passes regardless so
// structural props survive when inherited from React. ts-morph's getFilePath()
// returns StandardizedFilePath (forward-slash), so the substring checks are
// cross-platform.
const KEEP_PROP = /^(children|className|style|as|asChild|ref|id)$/;
// Style-system bases are detected by SHAPE, two-tier (canonical contract —
// the call sites point here):
// - EXTERNAL packages: >STYLE_SYSTEM_THRESHOLD CSS/token-named props,
//   counted per package directory (the node_modules/<pkg>/ boundary), so a
//   style system split across small per-category .d.ts files still crosses
//   the bar in aggregate. Paths with no node_modules/ segment fall back to
//   per-file counting at the in-package bar.
// - IN-PACKAGE files: >IN_PACKAGE_FILE_THRESHOLD CSS-named props in ONE
//   file. Hand-written API layers (tens of CSS-named props) are the DS's
//   own API and are never filtered; only a generated style system crosses
//   this bar. Left unfiltered, printing hundreds of token-typed unions per
//   component costs minutes of build time and tens of GB of retained
//   checker cache, and bloats every emitted .d.ts.
// All props declared in a flagged file/package are filtered (KEEP_PROP
// passes regardless). ASSUMPTION: when inherited shorthands are real API,
// override per component with cfg.dtsPropsFor.<Name>.
const CSS_PROP_NAME =
  /^(m[tblrxy]?$|p[tblrxy]?$|margin|padding|bg|background|color|border|width|height|flex|grid|gap|font|text|display|position|top|left|right|bottom|z|opacity|overflow|shadow|rounded|space)/;
const STYLE_SYSTEM_THRESHOLD = 15;
const IN_PACKAGE_FILE_THRESHOLD = 100;
// The package that owns a path: its deepest node_modules/<pkg>/ boundary
// (trailing slash), or null for workspace paths. Identity comparison against
// ownerOf(pkgDir) is the single in-package/external discriminator.
function ownerOf(p) {
  const m = /^(.*\/node_modules\/(?:@[^/]+\/)?[^/]+)\//.exec(p);
  return m ? m[1] + '/' : null;
}
function detectStyleSystemDirs(props, pkgDir, declFile) {
  const pkgOwner = ownerOf(pkgDir);
  const cssByDir = new Map();
  for (const p of props) {
    if (!CSS_PROP_NAME.test(p.getName())) continue;
    const d = p.getDeclarations()[0];
    if (!d) continue;
    const fp = d.getSourceFile().getFilePath();
    // Key shape encodes the tier (see the canonical contract above
    // CSS_PROP_NAME): external packages → node_modules/<pkg>/ prefix key
    // (trailing slash); in-package declarations → exact FILE key. The
    // DEEPEST node_modules boundary decides: a dep nested under the
    // package's own node_modules (un-hoisted version conflict) is external.
    // One principle, no orientation cases: a declaration is IN-PACKAGE iff
    // the package that OWNS its file is the package being synced.
    // ownerOf() = deepest node_modules package boundary, null for
    // workspace paths. This derives every layout — nested dep under the
    // package's own node_modules (different owner → external), dual-publish
    // nested manifest (same owner → in-package even though pkgDir sits
    // below the boundary), DS synced from inside a host package's
    // node_modules (host files have a shallower owner → external).
    // In-package files key per-FILE; external files key per owning package.
    // Ownerless externals (sibling workspace packages) key per-file at the
    // in-package bar — the documented out-of-scope fallback in the
    // canonical block above.
    const owner = ownerOf(fp);
    const inPackage = owner === pkgOwner && (owner !== null || fp.startsWith(pkgDir));
    const key = inPackage ? fp : (owner ?? fp);
    // Never flag the file that declares the component's own Props: in a
    // rolled-up single-file .d.ts the generated style layer co-lives with
    // the API interfaces, and a per-FILE flag would drop the component's
    // own props. Separate generated files still filter; rollups fall back
    // to unfiltered (slow but correct). External dir keys are unaffected.
    if (key === declFile) continue;
    cssByDir.set(key, (cssByDir.get(key) ?? 0) + 1);
  }
  // Per-tier bars — rationale in the canonical block above CSS_PROP_NAME.
  const keys = [];
  for (const [k, n] of cssByDir) {
    const bar = k.endsWith('/') ? STYLE_SYSTEM_THRESHOLD : IN_PACKAGE_FILE_THRESHOLD;
    if (n > bar) keys.push(k);
  }
  return keys;
}
function isOwnProp(p, pkgDir, styleSystemDirs) {
  const name = p.getName();
  if (KEEP_PROP.test(name)) return true;
  const d = p.getDeclarations()[0];
  if (!d) return true;
  const fp = d.getSourceFile().getFilePath();
  // Same owner-identity discriminator as detectStyleSystemDirs, same order
  // of authority: a flagged in-package FILE drops first (exact match); then
  // owner-equality keeps the DS's own API — checked BEFORE dir keys because
  // a flagged dir key can be an ANCESTOR of pkgDir (DS synced from inside a
  // host package's node_modules) and must not swallow in-package files;
  // then flagged external packages drop by prefix.
  if (styleSystemDirs.some((k) => !k.endsWith('/') && fp === k)) return false;
  const owner = ownerOf(fp);
  if (owner === ownerOf(pkgDir) && (owner !== null || fp.startsWith(pkgDir))) return true;
  if (styleSystemDirs.some((k) => k.endsWith('/') && fp.startsWith(k))) return false;
  if (fp.includes('/@types/react/') || fp.includes('/typescript/lib/')) return false;
  // DOM-noise name filters apply only to props inherited from other packages.
  if (/^(on[A-Z]|aria-)/.test(name)) return false;
  return true;
}

// Keep well-known aliases as-written instead of expanding to their full union.
const KEEP_ALIAS = /^(ReactNode|ReactElement|CSSProperties|JSX\.Element|Key|Ref|RefObject)$/;

function typeText(t, at) {
  const alias = t.getAliasSymbol()?.getName();
  if (alias && KEEP_ALIAS.test(alias)) return `React.${alias}`;
  if (t.isBoolean()) return 'boolean';
  let s;
  if (t.isUnion()) {
    // Render each member so ReactNode/boolean collapse while literal unions
    // stay expanded; dedup, drop `undefined` (optionality is the `?`).
    const parts = t.getUnionTypes().map((u) => typeText(u, at)).filter((p) => p !== 'undefined');
    let uniq = [...new Set(parts)];
    if (uniq.length === 2 && uniq.includes('true') && uniq.includes('false')) return 'boolean';
    // Collapse the structural expansion of React.ReactNode (string | number |
    // ReactElement<…> | Iterable<ReactNode> | ReactPortal | Promise<…>) back to
    // the alias — when the alias symbol is lost, the expansion blows past the
    // length cap below and would truncate into invalid TS.
    if (uniq.includes('ReactPortal') && uniq.some((u) => u.startsWith('Iterable<ReactNode>'))) {
      const RN_MEMBER = /^(string|number|bigint|boolean|ReactPortal|Iterable<ReactNode>.*|ReactElement<.*|Promise<.*)$/;
      uniq = [...new Set([...uniq.filter((u) => !RN_MEMBER.test(u)), 'React.ReactNode'])];
    }
    // Function-type members are invalid un-parenthesized inside a union
    // (`string | (x) => void` doesn't parse) — wrap them.
    if (uniq.length > 1) uniq = uniq.map((u) => (u.includes('=>') ? `(${u})` : u));
    // Cap very wide unions (icon-name sets can be 600+ members).
    if (uniq.length > 24) uniq = [...uniq.slice(0, 16), `(string & {}) /* +${uniq.length - 16} more */`];
    s = uniq.join(' | ').replace(/\bfalse \| true\b/, 'boolean');
  } else {
    s = t.getText(at, ts.TypeFormatFlags.NoTruncation).replace(/import\("[^"]*"\)\./g, '');
  }
  // Never hard-slice an over-long type — a cut generic/object literal is
  // invalid TS and fails the validator's [DTS_PARSE] check (and the app's
  // API-contract parse). Fall back to a safe wide type instead; the JSDoc
  // line above the prop carries the human-readable detail.
  return s.length > 240 ? 'unknown' : s;
}

// PascalCase value exports from the entry module. The checker knows value vs
// type, so type-only exports never enter the set.
export function exportedNames(pkgDir, pkgJson) {
  const { project, entry } = projectFor(pkgDir, findTypesRoot(pkgDir, pkgJson));
  const sf = project.getSourceFile(entry);
  const names = new Set();
  if (!sf) return names;
  for (const [name, decls] of sf.getExportedDeclarations()) {
    if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) continue;
    const hasValue = decls.some((d) =>
      Node.isVariableDeclaration(d) || Node.isFunctionDeclaration(d) ||
      Node.isClassDeclaration(d) || Node.isSourceFile(d));
    if (hasValue) names.add(name);
  }
  return names;
}

// Builds the context propsBodyFor/jsdocFor read from. `nonComponents` /
// `compounds` are derived from the checker's symbol kinds.
export function loadDts(typesRoot) {
  // typesRoot is always under <nm>/<pkg>/… — walk up to the real package
  // root: the nearest package.json with a `name` field, skipping stubs
  // (`{"type":"module"}` in esm/ or dist/). dirname-fixed-point is the
  // cross-platform root test (`/` vs `C:\`).
  let walk = typesRoot;
  for (; walk !== dirname(walk); walk = dirname(walk)) {
    const pj = join(walk, 'package.json');
    if (existsSync(pj)) {
      try { if (JSON.parse(readFileSync(pj, 'utf8')).name) break; } catch {}
    }
  }
  // projectFor normalizes pkgDir to forward-slashes (ts-morph's
  // StandardizedFilePath) — use that for every fp.startsWith() downstream.
  const { project, entry, pkgDir } = projectFor(walk, typesRoot);
  const sf = project.getSourceFile(entry);
  const nonComponents = new Set();
  const compounds = new Map();
  if (sf) for (const [name, decls] of sf.getExportedDeclarations()) {
    if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) continue;
    // Declaration-merged names (`interface Button {}` + `const Button: …`)
    // return both decls — prefer the value decl so the merge isn't
    // misclassified as type-only by whichever the checker listed first.
    const d = decls.find((x) =>
      Node.isVariableDeclaration(x) || Node.isFunctionDeclaration(x) ||
      Node.isClassDeclaration(x) || Node.isSourceFile(x)) ?? decls[0];
    // Namespace export (`export * as X`) → compound with its own value members.
    if (Node.isSourceFile(d)) {
      const members = [...d.getExportedDeclarations().entries()]
        .filter(([n, ds]) => /^[A-Z][a-z]/.test(n) && ds.some((x) => !Node.isInterfaceDeclaration(x) && !Node.isTypeAliasDeclaration(x)))
        .map(([n]) => n);
      if (members.length) compounds.set(name, members);
      else nonComponents.add(name);
      continue;
    }
    // Type-only / enum / Context / abstract-class are not components.
    if (Node.isInterfaceDeclaration(d) || Node.isTypeAliasDeclaration(d) || Node.isEnumDeclaration(d)) {
      nonComponents.add(name);
      continue;
    }
    if (Node.isClassDeclaration(d) && d.isAbstract()) { nonComponents.add(name); continue; }
    if (Node.isClassDeclaration(d)) continue;  // always renderable; compounds via statics aren't handled here
    if (!Node.isVariableDeclaration(d) && !Node.isFunctionDeclaration(d)) continue;
    // `const X: FC<…> & { Sub: … }` (possibly through an alias/Omit) —
    // PascalCase callable properties declared in-package are compound members
    // (React.Component lifecycle names have underscores / fail the full match).
    const t = d.getType();
    const members = [];
    // PascalCase props can't be style-system CSS-shorthands, so the empty
    // list is correct here — detectStyleSystemDirs would contribute nothing.
    const noStyle = [];
    for (const p of t.getProperties()) {
      const pn = p.getName();
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(pn) || !isOwnProp(p, pkgDir, noStyle)) continue;
      if (p.getTypeAtLocation(d).getCallSignatures().length) members.push(pn);
    }
    if (members.length) compounds.set(name, members);
    // Only provably-not-renderable consts are filtered: a plain object/record
    // type whose every property is a primitive (token/enum
    // objects like Colors or Sizes). Anything with a call signature, construct signature, or a
    // non-primitive property stays — class components and forwardRef wrappers
    // without call sigs on the instance type must not be dropped here.
    if (t.isObject() && !t.getCallSignatures().length && !t.getConstructSignatures().length && !members.length && !t.isAny()) {
      const props = t.getProperties();
      if (props.length && props.every((p) => {
        const pt = p.getTypeAtLocation(d);
        return pt.isString() || pt.isNumber() || pt.isStringLiteral() || pt.isNumberLiteral();
      })) nonComponents.add(name);
    }
  }
  return { project, entry, pkgDir, nonComponents, compounds };
}

// Returns { body, generics, extendsClause, prelude } for emit.mjs. Types are
// fully resolved into `body`, so extendsClause/prelude stay empty.
export function propsBodyFor(name, ctx) {
  if (ctx.dtsPropsFor?.[name]) {
    return { body: ctx.dtsPropsFor[name], generics: '', extendsClause: '', prelude: '' };
  }
  const { project, entry, pkgDir } = ctx;
  // Find <Name>Props across the package's own files (not @types/react).
  // Skip deprecated/legacy/experimental dirs so a stale copy doesn't shadow
  // the live one.
  let decl = null;
  for (const sf of project.getSourceFiles()) {
    const fp = sf.getFilePath();
    if (!fp.startsWith(pkgDir)) continue;
    if (/\/(deprecated|legacy|experimental)\//i.test(fp)) continue;
    decl = sf.getInterface(`${name}Props`) ?? sf.getTypeAlias(`${name}Props`);
    if (decl) break;
  }
  // Fallback: derive from the component symbol's first call signature.
  // Prefer the value decl (declaration-merging — see loadDts).
  if (!decl) {
    const decls = project.getSourceFile(entry)?.getExportedDeclarations().get(name) ?? [];
    const exp = decls.find((d) =>
      Node.isVariableDeclaration(d) || Node.isFunctionDeclaration(d) || Node.isClassDeclaration(d)) ?? decls[0];
    if (!exp || Node.isSourceFile(exp)) return null;
    const sig = exp.getType().getCallSignatures()[0];
    const p0 = sig?.getParameters()[0];
    if (!p0) return null;
    return emitBody(p0.getTypeAtLocation(exp), exp, '', pkgDir);
  }
  const generics = decl.getTypeParameters?.().length
    ? `<${decl.getTypeParameters().map((p) => p.getText()).join(', ')}>`
    : '';
  return emitBody(decl.getType(), decl, generics, pkgDir);
}

let loggedStyleSystemDirs;
function emitBody(type, at, generics, pkgDir) {
  const lines = [];
  const props = type.getApparentType().getProperties();
  // `at` is the component's own Props declaration site — its file is exempt
  // from per-FILE flagging (see detectStyleSystemDirs).
  const styleSystemDirs = detectStyleSystemDirs(props, pkgDir, at.getSourceFile().getFilePath());
  // Surface a one-shot [DTS_STYLE_SYSTEM] line per flagged package so the
  // self-heal loop routes to cfg.dtsPropsFor when the heuristic guesses
  // wrong. ASSUMPTION: props from the named packages are token-typed
  // style shorthands; override a component's contract with cfg.dtsPropsFor.
  loggedStyleSystemDirs ??= new Set();
  for (const dir of styleSystemDirs) {
    if (loggedStyleSystemDirs.has(dir)) continue;
    loggedStyleSystemDirs.add(dir);
    const isDirKey = dir.endsWith('/');
    const pkg = /\/node_modules\/((?:@[^/]+\/)?[^/]+)\/$/.exec(dir)?.[1]
      ?? (dir.startsWith(pkgDir) ? dir.slice(pkgDir.length) : dir);
    const bar = isDirKey ? STYLE_SYSTEM_THRESHOLD : IN_PACKAGE_FILE_THRESHOLD;
    console.error(
      `[DTS_STYLE_SYSTEM] filtering ${pkg} props (>${bar} CSS-shorthand-named props) — override a component with cfg.dtsPropsFor.<Name> if these are real API`,
    );
  }
  for (const p of props) {
    if (!isOwnProp(p, pkgDir, styleSystemDirs)) continue;
    const optional = p.hasFlags(ts.SymbolFlags.Optional) ? '?' : '';
    const pt = p.getTypeAtLocation(at);
    let tt = typeText(pt, at);
    // Structural hint when the type text hides the shape (aliased functions /
    // arrays) — smartDefaultProps reads these to pick the right required-stub.
    const members = pt.isUnion() ? pt.getUnionTypes() : [pt];
    if (members.some((u) => u.getCallSignatures().length)) tt += ' /* @fn */';
    // Tuples are not @arr — `[]` has the wrong length and `[0]` access crashes
    // either way; optional tuples are safer left unset.
    else if (members.some((u) => u.isArray())) tt += ' /* @arr */';
    // Leading JSDoc on the prop declaration, if any.
    const d = p.getDeclarations()[0];
    const doc = d?.getJsDocs?.()?.[0]?.getDescription()?.trim();
    if (doc) lines.push(`  /** ${doc.replace(/\s+/g, ' ').slice(0, 120)} */`);
    const pn = p.getName();
    // Hyphenated/index-signature names (`data-*`, `aria-*`) must be quoted.
    const key = /^[a-zA-Z_$][\w$]*$/.test(pn) ? pn : JSON.stringify(pn);
    lines.push(`  ${key}${optional}: ${tt};`);
  }
  if (!lines.length) return null;
  return { body: lines.join('\n'), generics, extendsClause: '', prelude: '' };
}

// Scaffold-preview defaults from the resolved props body. Conservative: fill
// only what's needed for a meaningful first render (children + variant axis +
// visibility toggles + required arrays). Optional string/number/Date props are
// left unset — filling them with placeholder values crashes more than it
// helps.
//
// Void-element-ish components — a string `children` would throw at render.
const VOID_LIKE = /^(Text|Number|Search|Password|File|Masked)?Input$|^(TextField|TextArea|Textarea|Img|Image|Avatar|Hr|Br|Spacer|Divider|Separator|Slider|Progress|ProgressBar)$/;
// Ordered preference for the variant axis — earlier wins. `type` is last so
// the HTML `type` attr ("button"|"submit"|"reset") doesn't beat `variant`.
const VARIANT_RANK = ['variant', 'intent', 'kind', 'appearance', 'tone', 'status', 'size', 'color', 'type'];
export function smartDefaultProps(name, pb) {
  const body = pb?.body ?? '';
  const props = {};
  let variants = null;
  // Matches the 2-space indent emitBody writes — keep the two in sync.
  // `.+` (not `[^;]+`) so object-param types with inner semicolons still match.
  for (const m of body.matchAll(/^ {2}([a-zA-Z_$][\w$]*)(\??)\s*:\s*(.+);$/gm)) {
    const [, prop, q, t] = m;
    if (prop in props) continue;
    const req = !q;
    // Union of string literals, optionally with a `string & {}` escape-hatch
    // member (the "autocomplete these, accept any string" TS pattern).
    if (/^(?:(?:"[^"]*"|\(?string\s*&\s*\{\}\)?)\s*\|?\s*)+$/.test(t)) {
      const lits = [...t.matchAll(/"([^"]*)"/g)].map((l) => l[1]).filter(Boolean);
      if (lits.length >= 2) {
        const rank = VARIANT_RANK.indexOf(prop.toLowerCase());
        // Displace on strictly better rank (prop names are unique, so no ties).
        if (!variants || (rank >= 0 && (variants.rank < 0 || rank < variants.rank))) {
          variants = { prop, values: lits.slice(0, 4), rank };
        }
        if (req) props[prop] = lits[0];
        continue;
      }
    }
    // Structural hints (/* @fn */, /* @arr */) from emitBody are authoritative
    // over the text regexes — `(() => void)[]` has @arr, so the `=>` in the
    // element type must not flip it to isFn. The text regexes cover
    // cfg.dtsPropsFor overrides with no hints.
    const hasFn = t.includes('/* @fn */'), hasArr = t.includes('/* @arr */');
    const isFn = hasFn || (!hasArr && /=>|\)\s*:/.test(t));
    const isArr = !isFn && (hasArr || /\[\]|Array</.test(t));
    if (prop === 'children' && /React\.ReactNode|ReactElement/.test(t) && !isFn && !VOID_LIKE.test(name)) props.children = name;
    // Visibility toggles — an overlay/dialog with open=false renders nothing.
    else if (/^(open|isOpen|visible|show|defaultOpen|expanded|checked|active|selected)$/.test(prop) && t === 'boolean') props[prop] = true;
    // Callable (required or optional) — optional stays unset (DSes guard
    // optional callbacks); required gets a noop.
    else if (isFn) { if (req) props[prop] = { $raw: '()=>null' }; }
    // Arrays (required or optional). `[]` is crash-safe but renders nothing.
    // Props that look like data/option lists get a small sample so the
    // preview has visible rows; element shape is best-effort from the type
    // text (string[] → strings; otherwise {id,label,value}).
    else if (isArr) {
      const isList = /^(items|options|tabs|rows|columns|data|actions|fields|links|steps|choices|values)$/i.test(prop);
      const elT = t.replace(/\/\*.*?\*\//g, '').trim();
      const elIsString = /^(?:readonly\s+)?string\[\]|^ReadonlyArray<string>|^Array<string>/.test(elT);
      // Over-provision keys — extra ones are ignored, and this covers the
      // common {id|key} + {label|text|name|title} + value conventions.
      props[prop] = isList
        ? elIsString
          ? ['Item 1', 'Item 2', 'Item 3']
          : [1, 2, 3].map((i) => {
            const s = String(i), l = `Item ${i}`;
            return { id: s, key: s, value: s, label: l, text: l, name: l, title: l };
          })
        : [];
    }
    // Optional everything-else stays unset — the component's own defaults are
    // safer than a placeholder.
    else if (!req) continue;
    // Required props get a type-appropriate stub so the render doesn't crash
    // on `undefined.…` / `undefined()`. `$raw` values are emitted verbatim by
    // scaffoldPropsExpr (not JSON-stringified).
    else if (/\bDate\b/.test(t)) props[prop] = { $raw: 'new Date()' };
    else if (/ElementType|ComponentType|JSXElementConstructor/.test(t)) props[prop] = 'div';
    else if (/React\.ReactNode|ReactElement/.test(t)) props[prop] = name;
    else if (/^string\b/.test(t)) props[prop] = name;
    else if (/^number\b/.test(t)) props[prop] = 0;
    else if (/^boolean\b/.test(t)) props[prop] = false;
    else if (/^\{/.test(t) || /Record<|Partial<|Pick<|Omit</.test(t)) props[prop] = {};
    // Fallback: required prop of unrecognized shape — `{}` is the least likely
    // to crash `.foo` access.
    else props[prop] = {};
  }
  return { props, variants };
}

// One-line JSDoc from the component's own declaration.
export function jsdocFor(name, ctx) {
  const decls = ctx.project?.getSourceFile(ctx.entry)?.getExportedDeclarations().get(name) ?? [];
  const exp = decls.find((d) =>
    Node.isVariableDeclaration(d) || Node.isFunctionDeclaration(d) || Node.isClassDeclaration(d)) ?? decls[0];
  if (!exp || Node.isSourceFile(exp)) return '';
  const doc = exp.getJsDocs?.()?.[0]?.getDescription()
    ?? exp.getSymbol?.()?.compilerSymbol.getDocumentationComment?.(undefined)?.[0]?.text;
  if (!doc) return '';
  return doc.split('\n').find((l) => l.trim() && !l.trim().startsWith('@'))
    ?.trim().replace(/\s+/g, ' ').replace(/[^\w\s.,()'/:+-]/g, '').slice(0, 140) ?? '';
}
