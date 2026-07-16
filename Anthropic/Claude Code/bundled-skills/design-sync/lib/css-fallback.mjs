// Storybook-only CSS fallbacks — storybook-static's iframe.html is the source
// for both the compiled-stylesheet fallback (when _ds_bundle.css is a
// bundler-resolve-only stub) and remote webfont <link> scraping.

import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

// Brand fonts shipped via .storybook/preview-head.html land inline in the
// built iframe.html, often as base64 data-URI @font-face that no filename
// search finds. Harvest faces that are FULLY self-contained (every src is a
// data: URI — storybook's own UI fonts use file URLs and are skipped) for
// families nothing else shipped.
export function inlineFontFacesFromStorybook(sbStatic, existingRules) {
  if (!sbStatic) return [];
  let html;
  try { html = readFileSync(join(sbStatic, 'iframe.html'), 'utf8'); } catch { return []; }
  const familyOf = (block) => /font-family:\s*['"]?([^'";}]+)/i.exec(block)?.[1].trim().toLowerCase();
  const have = new Set(existingRules.map(familyOf).filter(Boolean));
  const out = [];
  for (const m of html.matchAll(/@font-face\s*\{[^}]*\}/gi)) {
    const block = m[0];
    const urls = [...block.matchAll(/url\(\s*['"]?([^'")]+)/gi)].map((u) => u[1]);
    if (!urls.length || !urls.every((u) => u.startsWith('data:'))) continue;
    const fam = familyOf(block);
    if (!fam || have.has(fam)) continue;
    out.push(block);
  }
  if (out.length) console.error(`  [FONTS_FROM_PREVIEW_HEAD] harvested ${out.length} data-URI @font-face rule(s) from the storybook reference`);
  return out;
}

// Utility-CSS / CSS-in-JS DSes often ship a dist/styles.css
// that's a stub `@import "@scope/styles"` meant for a bundler to resolve.
export function isPlaceholderCss(p) {
  if (!existsSync(p)) return false;
  const sz = statSync(p).size;
  if (sz > 500) return false;
  const txt = readFileSync(p, 'utf8');
  // Only @import/@charset/comments/whitespace → no real rules.
  const stripped = txt.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@(import|charset)\b[^;]*;/g, '').trim();
  return stripped.length === 0;
}

// If bundleCss is a placeholder stub, replace it with storybook-static's own
// compiled CSS (the largest local <link rel=stylesheet> in iframe.html).
// Relative url()s are NOT rewritten — sbStatic isn't uploaded, so pointing
// into it would break post-upload. They'll 404 in the preview (images missing)
// but class rules still apply. Returns the new srcDir for extractFonts, which
// DOES copy font files into the bundle.
export function fallbackCssFromStorybook({ bundleCss, sbStatic, out }) {
  // A MISSING _ds_bundle.css counts too — DSes that ship styles in a sibling
  // package (compiled JS imports no CSS) emit no css file at all.
  if ((existsSync(bundleCss) && !isPlaceholderCss(bundleCss)) || !sbStatic || !existsSync(join(sbStatic, 'iframe.html'))) return null;
  const iframeHtml = readFileSync(join(sbStatic, 'iframe.html'), 'utf8');
  const links = [...iframeHtml.matchAll(/<link\b[^>]*>/gi)]
    .map((m) => m[0])
    .filter((t) => /\brel\s*=\s*["']stylesheet["']/i.test(t))
    .map((t) => t.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1])
    .filter((h) => h && !/^(https?:|\/\/)/.test(h))
    .map((h) => join(sbStatic, h.replace(/^\.\//, '')))
    .filter((p) => p.startsWith(sbStatic + sep) && existsSync(p))
    .sort((a, b) => statSync(b).size - statSync(a).size);
  if (links[0]) {
    const was = existsSync(bundleCss) ? `a ${statSync(bundleCss).size}B placeholder` : 'missing';
    const kb = (statSync(links[0]).size / 1024).toFixed(0);
    const srcDir = dirname(links[0]);
    const css = readFileSync(links[0], 'utf8');
    const assets = [...new Set([...css.matchAll(/url\(\s*(['"]?)(?!data:|https?:|\/\/|\/)([^'")]+)\1\s*\)/gi)].map((m) => m[2]))];
    writeFileSync(bundleCss, css);
    console.error(`[CSS_FROM_STORYBOOK] _ds_bundle.css was ${was} — replaced with ${relative(out, links[0])} (${kb} KB).`);
    if (assets.length) {
      console.error(`[CSS_ASSETS] ${assets.length} relative url() ref(s) in the fallback CSS won't resolve post-upload (fonts are copied separately via extractFonts; images will 404): ${assets.slice(0, 5).join(', ')}${assets.length > 5 ? ', …' : ''}`);
    }
    return srcDir;
  }
  console.error(`[CSS_PLACEHOLDER] _ds_bundle.css is missing or a stub (@import-only, <500B) and no storybook CSS found to fall back to — set cfg.cssEntry to the compiled stylesheet.`);
  return null;
}

// Remote stylesheet links (webfonts, etc.) from the storybook iframe. CSS-in-JS
// DSes emit no static stylesheet, but commonly inject a remote webfont <link>
// via .storybook/preview-head.html — that link
// is then the ONLY static style source. Returns absolute URLs to @import url().
export function scrapeRemoteImports(sbStatic) {
  if (!sbStatic || !existsSync(join(sbStatic, 'iframe.html'))) return [];
  const iframeHtml = readFileSync(join(sbStatic, 'iframe.html'), 'utf8');
  const out = [...new Set(
    [...iframeHtml.matchAll(/<link\b[^>]*>/gi)]
      .map((m) => m[0])
      .filter((t) => /\brel\s*=\s*["']stylesheet["']/i.test(t))
      .map((t) => t.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1])
      .filter((h) => h && /^(https?:|\/\/)/.test(h))
      .map((h) => (h.startsWith('//') ? 'https:' + h : h)),
  )];
  if (out.length) {
    console.error(`  remote stylesheet(s) from storybook: ${out.length} → styles.css @import url(...)`);
  }
  return out;
}
