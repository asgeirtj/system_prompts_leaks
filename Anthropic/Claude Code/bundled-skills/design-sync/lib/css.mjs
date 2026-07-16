// CSS handling: token-file copy, @font-face extraction, and the final
// styles.css writer (the styles entry point — an @import list, never inlined CSS).
// Storybook-only fallbacks live in css-fallback.mjs.

import { cpSync, existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { ls } from './common.mjs';

// Parse @font-face blocks from `cssPath` → resolve url() paths relative to
// `srcDir` → copy .woff2/.woff/.ttf/.otf to fonts/ → return rewritten rules.
// `roots` bounds the resolved path so a `url(../../etc/passwd)` can't escape —
// one or more directories the font file may legitimately be under.
export function extractFonts(cssPath, srcDir, { fontsOut, roots }) {
  // Bounds and targets are REALPATHED (a font-named symlink inside the
  // workspace pointing outside must not smuggle an arbitrary file into the
  // uploadable fonts/ — same containment rule as cfg.extraFonts), and the
  // check is relative()-based, not a startsWith prefix: case-insensitive on
  // win32 where a pnpm junction can realpath to canonical D:\ while a
  // symlink-free root keeps user-typed d:\ (failure direction of the prefix
  // form is false-rejection — legit brand fonts silently skipped).
  const realOf = (p) => { try { return realpathSync(p); } catch { return null; } };
  const rootsReal = (Array.isArray(roots) ? roots : [roots]).map((r) => realOf(resolve(r)) ?? resolve(r));
  const insideRoots = (p) => rootsReal.some((root) => {
    const rel = relative(root, p);
    return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
  });
  if (!existsSync(cssPath)) return [];
  const css = readFileSync(cssPath, 'utf8');
  const rules = [];
  for (const m of css.matchAll(/@font-face\s*\{([^}]+)\}/g)) {
    const body = m[1];
    const fam = body.match(/font-family\s*:\s*['"]?([^;'"\n]+)['"]?/)?.[1]?.trim();
    const urls = [...body.matchAll(/url\(\s*['"]?([^'")]+?\.(?:woff2?|ttf|otf))['"]?\s*\)/gi)].map((u) => u[1]);
    if (!fam || !urls.length) continue;
    let rewritten = body;
    for (const u of urls) {
      if (/^(https?:|data:)/.test(u)) continue; // CDN / inline — leave as-is
      const src = resolve(srcDir, u.replace(/^\.\//, ''));
      const real = realOf(src);
      if (!real || !insideRoots(real)) continue;
      const name = basename(src);
      mkdirSync(fontsOut, { recursive: true });
      cpSync(real, join(fontsOut, name));
      rewritten = rewritten.split(u).join(`./${name}`);
    }
    rules.push(`@font-face{${rewritten}}`);
  }
  return rules;
}

// Copy a tokens package's shipped CSS verbatim into OUT/tokens/. tokensGlob
// supports a single trailing `**` segment for deep recursion.
export function copyTokens({ tokensPkg, tokensGlob, nodeModules, out }) {
  const tokenFiles = [];
  if (!tokensPkg) return tokenFiles;
  const tdir = join(nodeModules, tokensPkg);
  const tjson = JSON.parse(readFileSync(join(tdir, 'package.json'), 'utf8'));
  if (tokensGlob) {
    const parts = tokensGlob.split('/');
    const pat = parts.pop();
    const rx = new RegExp('^' + pat.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
    const deep = parts.includes('**');
    const base = join(tdir, ...parts.filter((p) => p !== '**'));
    (function collect(d, rel = '') {
      if (!existsSync(d)) return;
      for (const e of ls(d, { withFileTypes: true })) {
        const r = rel ? `${rel}/${e.name}` : e.name;
        if (e.isDirectory() && deep) collect(join(d, e.name), r);
        else if (e.isFile() && rx.test(e.name)) {
          // Preserve subdir structure so @import './sub/x.css' inside a
          // copied file keeps resolving.
          mkdirSync(dirname(join(out, 'tokens', r)), { recursive: true });
          cpSync(join(d, e.name), join(out, 'tokens', r));
          tokenFiles.push(r);
        }
      }
    })(base);
  } else {
    for (const sub of ['dist/css', 'css', 'dist', '.']) {
      const d = join(tdir, sub);
      if (!existsSync(d)) continue;
      for (const f of ls(d)) {
        if (f.endsWith('.css')) {
          cpSync(join(d, f), join(out, 'tokens', f));
          tokenFiles.push(f);
        }
      }
      if (tokenFiles.length) break;
    }
  }
  console.error(`  tokens: ${tokenFiles.length} files from ${tokensPkg}@${tjson.version}`);
  return tokenFiles;
}

// _ds_bundle.css enters the styles.css closure (rendered designs load it),
// so its @font-face blocks must not carry package-relative url()s: the font
// binaries aren't uploaded at those paths, and a dead-src face declared
// AFTER fonts/fonts.css shadows the working copy of the same family
// (browsers don't fall back to an earlier duplicate face) — brand fonts
// silently degrade to system fonts. Rewrite urls to the fonts/ copies
// extractFonts made (matched by basename, same flattening); drop any face
// still referencing an unresolvable relative url (a dead src is worse than
// no face — and it recurs as an app-side error on every compile).
export function rewriteBundleFontFaces({ out, bundleCss }) {
  const p = bundleCss ?? join(out, '_ds_bundle.css');
  let css;
  try { css = readFileSync(p, 'utf8'); } catch { return; }
  if (!/@font-face/i.test(css)) return;
  let dropped = 0, rewrote = 0;
  const next = css.replace(/@font-face\s*\{[^}]*\}/gi, (block) => {
    let b = block;
    for (const m of block.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) {
      const u = m[1];
      if (/^(?:https?:|data:|\.\/fonts\/)/.test(u)) continue;
      const name = basename(u.split(/[?#]/)[0]);
      if (existsSync(join(out, 'fonts', name))) { b = b.split(u).join(`./fonts/${name}`); rewrote++; }
    }
    if (/url\(\s*['"]?(?!https?:|data:|\.\/fonts\/)/i.test(b)) { dropped++; return '/* @ds-font-face-dropped: unresolvable src */'; }
    return b;
  });
  if (rewrote || dropped) {
    writeFileSync(p, next);
    console.error(`  _ds_bundle.css fonts: ${rewrote} url(s) rewritten to fonts/${dropped ? `, ${dropped} dead @font-face block(s) dropped` : ''}`);
  }
}

// styles.css — the styles entry point. The claude.ai/design app's
// contract: rendered designs consume ONLY this file's transitive @import
// closure (plus the JS bundle) — `_ds_bundle.css` is not loaded by anything
// app-side, so component CSS left out of this closure never reaches a design
// built with the DS (the DS-pane cards link it directly, which masks the
// gap). Import it LAST, after tokens/fonts. Token pollution: the app's
// scope filter is a permissive heuristic — :root/theme containers, but also
// single lowercase class selectors (`.btn { --btn-pad: … }`) and data-attr
// selectors register as token scopes — so public component vars from the
// bundle DO enter the token list. That's tolerable (they're real, usable
// vars) and the price of designs actually receiving component CSS.
export function writeStylesCss({ out, tokenFiles, bundleCss, fontRules, remoteImports }) {
  let hasBundleCss = false;
  try {
    // The CSS-in-JS placeholder (@ds-css-runtime) isn't real CSS — importing
    // it would also suppress the [CSS_RUNTIME] message below.
    const css = readFileSync(bundleCss ?? join(out, '_ds_bundle.css'), 'utf8');
    hasBundleCss = css.trim().length > 0 && !css.startsWith('/* @ds-css-runtime');
  } catch { /* absent */ }
  const styleImports = [
    ...tokenFiles.map((f) => `@import "./tokens/${f}";`),
    ...(fontRules.length ? ['@import "./fonts/fonts.css";'] : []),
    ...remoteImports.map((u) => `@import url("${u}");`),
    ...(hasBundleCss ? ['@import "./_ds_bundle.css";'] : []),
  ];
  if (styleImports.length) {
    writeFileSync(join(out, 'styles.css'), styleImports.join('\n') + '\n');
    console.error(`  styles.css: ${styleImports.length} @import(s)${hasBundleCss ? ' (incl. _ds_bundle.css — component styles ship to designs via this closure)' : ''}`);
    return;
  }
  writeFileSync(
    join(out, 'styles.css'),
    '/* @ds-styles: runtime — this design system injects its styles at runtime (CSS-in-JS); no static stylesheet to import. */\n',
  );
  console.error('[CSS_RUNTIME] no static CSS found (tokens/component/fonts/remote all empty) — wrote a self-styling styles.css. Expected for CSS-in-JS DSes; if this DS does ship a stylesheet, set cfg.cssEntry to it. If cfg.cssEntry is ALREADY set and renders verify, this line refers only to the scrape — do not chase it.');
}
