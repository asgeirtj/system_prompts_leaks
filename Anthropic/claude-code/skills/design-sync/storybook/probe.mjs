// One chromium page visit against the reference storybook-static: fiber-walk
// provider detection. Fallback diagnostic for when
// the .storybook/preview decorator bundle fails (or doesn't exist) and
// previews show context/provider errors — it infers the provider chain the
// repo's own storybook wraps stories in, as a cfg.provider suggestion.
// Provider match is name-based (displayName/name) — the storybook page's
// React is a separate bundled copy, so identity-matching against our
// _ds_bundle.js wouldn't work.
//
// Standalone usage (prints a cfg.provider suggestion as JSON on stdout):
//   node storybook/probe.mjs --storybook-static .design-sync/sb-reference \
//     [--story-id <id>] [--names Button,ThemeProvider,…]

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { serveDir } from './http-serve.mjs';

// Walk fibers from the story's leaf node upward, recording every named
// component. `names` (when non-empty) filters to that set — pass the DS's
// exported names so story-internal wrappers don't pollute the chain; with no
// filter, every PascalCase-named fiber is recorded (diagnostic mode).
const FIBER_WALK_STORE = `((names) => {
  const set = new Set(names);
  const root = document.querySelector('#storybook-root') || document.querySelector('#root');
  // Descend to the leaf, skipping injected metadata elements — CSS-in-JS
  // runtimes often put a <style>/<script> as the first child, which has no
  // fiber and would dead-end provider detection.
  const SKIP = /^(STYLE|SCRIPT|LINK|META|TEMPLATE)$/;
  const content = (el) => [...el.children].find((c) => !SKIP.test(c.tagName));
  let n = root && content(root);
  while (n) { const c = content(n); if (!c) break; n = c; }
  if (!n || n === root) return (window.__dsChain = []).length;
  const fkey = Object.keys(n).find((k) => k.startsWith('__reactFiber$'));
  let fiber = fkey ? n[fkey] : null;
  const out = [];
  while (fiber) {
    const t = fiber.type || fiber.elementType;
    const nm = t && (t.displayName || t.name);
    if (nm && /^[A-Z]/.test(nm) && (set.size === 0 || set.has(nm))) out.push({ component: nm, liveProps: fiber.memoizedProps || {} });
    fiber = fiber.return;
  }
  return (window.__dsChain = out.reverse()).length;
})`;

const RESOLVE_PROPS = `(() => {
  // Primitives pass through; objects become a $hint of their top-level keys
  // (the user sets the real value via cfg.provider).
  const ser = (v) => {
    if (v == null || typeof v !== 'object') return typeof v === 'function' ? undefined : v;
    if (v.$$typeof) return undefined;
    return { $hint: Object.keys(v).slice(0, 5).map((k) => String(k).replace(/[^\\w]/g, '_')).join(',') };
  };
  // The chain runs outermost-first. Keep only the outermost component plus
  // any immediately-nested one whose name suggests it's part of the provider
  // shell (Provider/Theme/Root/App) — layout components like Box/Grid deeper
  // in are story-specific, not provider.
  const chain = window.__dsChain || [];
  const shell = chain.slice(0, 1).concat(
    chain.slice(1).filter((c, i) => i < 1 && /Provider|Theme|Root|App|Config|Styles|Reset|Base/i.test(c.component)),
  );
  return shell.map((c) => {
    const props = {};
    for (const [k, v] of Object.entries(c.liveProps)) {
      if (k === 'children') continue;
      const s = ser(v);
      if (s !== undefined) props[k] = s;
    }
    return { component: c.component, props };
  });
})`;

// `sbStatic` is served directly — the reference storybook build, not an
// uploaded artifact.
export async function probe({ sbStatic, firstStoryId, exportedNames = [] }) {
  let pw;
  try { pw = await import('playwright'); }
  catch {
    console.error('[NO_CHROMIUM] provider detection skipped — set cfg.provider manually if the DS needs one');
    return { provider: null };
  }
  const { srv, port } = await serveDir(sbStatic);
  let browser;
  try {
    browser = await pw.chromium.launch(
      process.env.DS_CHROMIUM_PATH ? { executablePath: process.env.DS_CHROMIUM_PATH } : {},
    );
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${port}/iframe.html?id=${encodeURIComponent(firstStoryId)}&viewMode=story`, { waitUntil: 'networkidle', timeout: 30_000 });
    // Storybook 7+ renders into #storybook-root; v6 into #root. Wait for
    // CONTENT, not any child — CSS-in-JS runtimes inject <style> first and
    // waitForSelector locks onto the first match.
    await page.waitForSelector(':is(#storybook-root, #root) > :not(style,script,link,meta,template)', { timeout: 10_000 }).catch(() => {});
    await page.evaluate(`(${FIBER_WALK_STORE})(${JSON.stringify(exportedNames)})`).catch(() => 0);
    const chain = await page.evaluate(`(${RESOLVE_PROPS})()`).catch(() => []);
    const provider = chain.length
      ? chain.reduceRight((inner, p) => ({ component: p.component, props: p.props, ...(inner ? { inner } : {}) }), null)
      : null;
    if (provider) console.error(`[PROVIDER_DETECTED] ${chain.map((p) => p.component).join(' > ')}`);
    return { provider };
  } catch (e) {
    console.error(`  ! probe: ${String(e).split('\n')[0]}`);
    return { provider: null };
  } finally {
    await browser?.close().catch(() => {});
    srv.close();
  }
}

// ── standalone CLI ─────────────────────────────────────────────────────────
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const argv = process.argv.slice(2);
  const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i < 0 ? d : argv[i + 1]; };
  const sbStatic = flag('storybook-static') && resolve(flag('storybook-static'));
  if (!sbStatic || !existsSync(join(sbStatic, 'iframe.html'))) {
    console.error('usage: node storybook/probe.mjs --storybook-static <dir> [--story-id <id>] [--names A,B]');
    process.exit(2);
  }
  let storyId = flag('story-id');
  if (!storyId) {
    const idx = JSON.parse(readFileSync(join(sbStatic, 'index.json'), 'utf8'));
    storyId = Object.values(idx.entries ?? idx.stories ?? {}).find((e) => !e.type || e.type === 'story')?.id;
  }
  if (!storyId) { console.error('no story entries in index.json — pass --story-id'); process.exit(2); }
  const names = (flag('names') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const { provider } = await probe({ sbStatic, firstStoryId: storyId, exportedNames: names });
  // The cfg.provider suggestion — paste into .design-sync/config.json after
  // resolving each $hint: literals for small scalars; for data the repo
  // already owns (locale JSON, theme objects), prefer a 2-line module via
  // cfg.extraEntries referenced with {"$ref": "<export>"} (repo files need
  // an explicit ./ or ../ package-relative entry; bare names resolve from
  // node_modules) — an inlined copy duplicates into every card and rots
  // when the source file changes, so anything sizable or evolving belongs
  // behind a $ref.
  console.log(JSON.stringify({ provider }, null, 2));
  process.exit(0);
}
