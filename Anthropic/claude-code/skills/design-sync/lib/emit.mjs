// Output emitters: vendor React, per-component files (.jsx / .d.ts /
// .prompt.md / <Name>.html), README.md, .ds-build-meta.json.
// Previews are self-contained (render from window.<GLOBAL>) — the compiled
// preview .tsx module (owned .design-sync/previews/ or the generated
// .cache/previews/) when its build succeeded, else the
// floor card (one render attempt with crash-prevention props; a deliberate
// typographic block when the root stays empty).

import { build } from 'esbuild';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { escapeHtml, IIFE_IMPORT_META_DEFINE, readText } from './common.mjs';
import { previewExamples } from './docs.mjs';

// React ≤18 ships UMD; React 19 dropped it, so we bundle our own IIFE.
export async function vendorReact({ nodeModules, out }) {
  // Hoisted monorepos (yarn node-modules linker, npm workspaces) keep react
  // — or just react-dom, when it's only a peerDependency — in the REPO-ROOT
  // node_modules; the synced package's own dir is sparse. Fail fast with the
  // remedy rather than walking up: the rest of the pipeline (esbuild
  // nodePaths, token/css scrapes) runs against the same root, so healing
  // only this read would leave the build half-resolved.
  const readOrRemedy = (rel) => {
    try {
      return readFileSync(join(nodeModules, rel), 'utf8');
    } catch (e) {
      if (e?.code !== 'ENOENT') throw e;
      throw new Error(
        `${rel.split('/')[0]} not found under --node-modules (no ${join(nodeModules, rel)}). ` +
        'In a hoisted monorepo the package\'s own node_modules is sparse — pass the repo-root node_modules instead.',
      );
    }
  };
  const reactPkg = JSON.parse(readOrRemedy('react/package.json'));
  // Both branches assign under a temp global then `||=`-merge so a host
  // page's existing React isn't clobbered.
  const noClobber =
    ';window.React=window.React||window.__dsReact;' +
    'window.ReactDOM=window.ReactDOM||window.__dsReactDOM;' +
    'try{delete window.__dsReact;delete window.__dsReactDOM;}catch(e){}';
  const reactUmd = join(nodeModules, 'react/umd/react.development.js');
  if (existsSync(reactUmd)) {
    writeFileSync(
      join(out, '_vendor', 'react.js'),
      ';(function(){var __r=window.React,__rd=window.ReactDOM;' +
      readFileSync(reactUmd, 'utf8') + '\n' +
      readOrRemedy('react-dom/umd/react-dom.development.js') + '\n' +
      ';window.__dsReact=window.React;window.__dsReactDOM=window.ReactDOM;' +
      'if(__r)window.React=__r;if(__rd)window.ReactDOM=__rd;})();' + noClobber,
    );
  } else {
    console.error(`  react@${reactPkg.version} has no UMD — bundling via esbuild`);
    await build({
      stdin: {
        contents:
          'window.__dsReact=require("react");' +
          'window.__dsReactDOM=require("react-dom");' +
          'try{Object.assign(window.__dsReactDOM,require("react-dom/client"))}catch(e){}',
        resolveDir: nodeModules,
      },
      bundle: true, format: 'iife', outfile: join(out, '_vendor', 'react.js'),
      platform: 'browser',
      define: { 'process.env.NODE_ENV': '"development"', ...IIFE_IMPORT_META_DEFINE },
      logLevel: 'error', footer: { js: noClobber },
    });
  }
  writeFileSync(join(out, '_vendor', 'react-dom.js'), '/* merged into react.js */');
}

// Serialize the floor card's crash-prevention props to a JS expression.
// {$jsx: 'Item', text} becomes `h(C.Item,{},text)`; everything else
// JSON-stringifies (with `<` escaped — this lands in a <script> block).
function scaffoldPropsExpr(props, mount) {
  const esc = (s) => (JSON.stringify(s) ?? 'null').replace(/</g, '\\u003c');
  // $raw values from smartDefaultProps are a small closed set of literal
  // expressions — whitelist-gate them so nothing upstream can inject
  // arbitrary JS into the emitted <script> block.
  const RAW_OK = /^(?:\(\)=>null|new Date\(\))$/;
  const pairs = Object.entries(props).map(([k, v]) => {
    const key = JSON.stringify(k);
    if (v && typeof v === 'object' && v.$jsx && /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(v.$jsx)) {
      return `${key}:h(${mount}.${v.$jsx},{},${esc(v.text ?? '')})`;
    }
    if (v && typeof v === 'object' && typeof v.$raw === 'string' && RAW_OK.test(v.$raw)) {
      return `${key}:${v.$raw}`;
    }
    return `${key}:${esc(v)}`;
  });
  return `{${pairs.join(',')}}`;
}

// Preview rendered from the compiled preview .tsx (either home) — its
// IIFE assigns named exports to window.__dsPreview. Three render modes:
//   default          labeled grid, one cell per export (one card = the component)
//   ?story=<Export>  ONLY that story, full-bleed — the capture harnesses drive
//                    this for per-story capture (no cell interference: portals,
//                    shared radio-group names, focus, container measurement);
//                    unknown query params (serving tokens etc.) are ignored
//   cardMode:single  the default render is one story (cfg primaryStory or the
//                    first export) instead of the grid — for portal/overlay
//                    components whose stories paint over each other in a grid
//   cardMode:column  the grid at one cell per row — for stories wider than a
//                    multi-column cell (data tables, full-width bars): every
//                    story keeps full card width, primaryStory renders first
//                    (the product folds the card at ~500px; below the fold is
//                    hover-scroll), nothing is dropped the way single drops
//                    non-primary stories
// Single-story renders sit in a transformed wrapper, which makes it the
// containing block for position:fixed descendants — fixed bars/overlays render
// inside the card instead of escaping to the page viewport. Grid cells get the
// same transform plus overflow clipping: the product renders this grid LIVE
// (often narrower than the capture viewport), and an uncontained story that's
// wider than its cell paints over its neighbors there — clipping at the cell
// edge degrades to a cropped preview instead of a broken card. Captures are
// unaffected: the harnesses drive ?story= (full-bleed .ds-single, no clip).
// window.__dsCells always lists every export so the harness can pair stories
// without depending on the default render mode.
// Exported (with providerWrapper below) so lib/preview-rebuild.mjs can
// re-emit a single component's html without a full package-build.
export function previewHtmlModule(group, name, GLOBAL, providerWrap, decoratorScript, bundleCssLink, previewCssLink = '', card = {}) {
  const viewportAttr = card.viewport ? ` viewport="${escapeHtml(card.viewport)}"` : '';
  return `<!-- @dsCard group="${escapeHtml(group)}"${viewportAttr} -->
<!doctype html>
<html><head><meta charset="utf-8">
  <link rel="stylesheet" href="../../../styles.css">${bundleCssLink}${previewCssLink}
  <style>
    body{margin:0;padding:24px;background:#fff}
    /* auto-fit (not auto-fill): empty tracks collapse, so a 1-2 story card
       fills the width instead of stranding stories in a half-width left
       column beside phantom empty columns */
    .ds-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px;align-items:start}
    .ds-grid.ds-col{grid-template-columns:1fr}
    .ds-cell{border:1px solid #e5e7eb;border-radius:8px;padding:12px;min-width:0;overflow:hidden;transform:translateZ(0)}
    .ds-cell>h4{margin:0 0 8px;font:600 12px system-ui;color:#6b7280;text-transform:uppercase;letter-spacing:.04em}
    .ds-single{transform:translateZ(0)}
  </style>
</head><body>
  <div class="ds-grid" id="g"></div>
  <script src="../../../_vendor/react.js"></script>
  <script src="../../../_vendor/react-dom.js"></script>
  <script src="../../../_ds_bundle.js"></script>${decoratorScript}
  <script src="../../../_preview/${name}.js"></script>
  <script>
    var h=React.createElement, g=document.getElementById('g');
    var E=[]; for (var k in (window.__dsPreview||{})) {
      if (typeof window.__dsPreview[k]==='function' && /^[A-Z]/.test(k)) E.push(k);
    }
    window.__dsCells=E.slice();
    var q=null; try{q=new URLSearchParams(location.search).get('story')}catch(e){}
    var MODE=${JSON.stringify(card.cardMode === 'single' ? 'single' : card.cardMode === 'column' ? 'column' : 'grid')};
    window.__dsMode=MODE;
    var PRIMARY=${JSON.stringify(card.primaryStory ?? '')};
    if(MODE==='column'){
      g.className+=' ds-col';
      // primaryStory renders first — it's what shows above the product's fold.
      var cpi=PRIMARY?E.indexOf(PRIMARY):-1;
      if(cpi>0){E.splice(cpi,1);E.unshift(PRIMARY)}
    }
    function mount(id,key){try{ReactDOM.createRoot(document.getElementById(id)).render(${providerWrap('h(window.__dsPreview[key])')})}catch(e){document.getElementById(id).textContent='⚠ '+(e&&e.message||e)}}
    var pick=null;
    if(q){for(var j=0;j<E.length;j++){if(E[j]===q||E[j].toLowerCase()===q.toLowerCase()){pick=E[j];break}}}
    else if(MODE==='single'&&E.length){pick=E.indexOf(PRIMARY)>=0?PRIMARY:E[0]}
    if(q&&!pick){g.textContent='⚠ no export named '+q}
    else if(pick){
      var s=document.createElement('div'); s.className='ds-single'; s.id='r0';
      // The PRODUCT's default single render is full-bleed: a full-viewport
      // story root (100vh / Grommet full) plus body padding guarantees a
      // permanent 48px whitespace scrollbar in the card otherwise. Gated on
      // !q so ?story= captures keep the padding gutter — the graded framing
      // (and its edge-shadow room vs the storybook reference) stays
      // byte-identical to what every existing verdict was minted on.
      if(!q)document.body.style.padding='0';
      g.parentNode.replaceChild(s,g); mount('r0',pick);
    } else {
      for(var i=0;i<E.length;i++){
        var cell=document.createElement('section'); cell.className='ds-cell';
        cell.innerHTML='<h4>'+E[i]+'</h4><div id="r'+i+'"></div>'; g.appendChild(cell);
        mount('r'+i,E[i]);
      }
      if(E.length===0){g.textContent='⚠ no PascalCase exports in _preview/${name}.js'}
    }
  </script>
</body></html>
`;
}

// The FLOOR CARD — used whenever no compiled preview exists (nothing
// authored in the package shape; compile failure in either shape). One
// honest render attempt with the crash-prevention props; if the root comes
// up empty (component needs composition/state/providers we can't guess), the
// card swaps to a deliberate typographic block instead of showing a broken
// render. The component is fully importable either way — the card says so.
// data-ds-fallback lets the validator count typographic floors separately
// from broken renders.
function previewHtmlFloorCard(group, name, GLOBAL, providerWrap, rootMember, decoratorScript, bundleCssLink, smart) {
  // Namespace export (e.g. Dialog) — `h(C,{})` on a namespace object throws;
  // mount the Root sub-component instead.
  const mount = rootMember ? `C.${rootMember}` : 'C';
  const props = smart?.props ?? {};
  return `<!-- @dsCard group="${escapeHtml(group)}" -->
<!doctype html>
<html><head><meta charset="utf-8">
  <link rel="stylesheet" href="../../../styles.css">${bundleCssLink}
  <style>body{margin:0;padding:24px;background:#fff}</style>
</head><body>
  <div id="root"></div>
  <template id="ds-fallback">
    <div data-ds-fallback="" style="border:1px solid #e5e7eb;border-radius:12px;padding:28px 24px;max-width:520px;font-family:system-ui">
      <div data-ds-eyebrow="" style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af"></div>
      <div style="font-size:20px;font-weight:600;color:#111827;margin-top:6px">${escapeHtml(name)}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:14px;line-height:1.5">Preview not yet authored. The component is fully importable — its API is in <code>${escapeHtml(name)}.d.ts</code> and usage in <code>${escapeHtml(name)}.prompt.md</code>.</div>
    </div>
  </template>
  <script src="../../../_vendor/react.js"></script>
  <script src="../../../_vendor/react-dom.js"></script>
  <script src="../../../_ds_bundle.js"></script>${decoratorScript}
  <script>
    var h=React.createElement, C=window.${GLOBAL}.${name};
    var r=document.getElementById('root');
    function dsFallback(){
      r.innerHTML=document.getElementById('ds-fallback').innerHTML;
      // Group comes from the @dsCard marker line so the hashed body stays
      // group-free (a pure regroup must not read as a contract change).
      var c=document.childNodes[0], m=c&&c.nodeType===8?/group="([^"]*)"/.exec(c.nodeValue):null;
      var e=r.querySelector('[data-ds-eyebrow]'); if(e&&m)e.textContent=m[1];
    }
    try {
      ReactDOM.createRoot(r).render(${providerWrap(`h(${mount},${scaffoldPropsExpr(props, mount)})`)});
    } catch (e) { dsFallback(); }
    // React render errors don't throw here — they leave the root empty. An
    // intentionally-empty render (returns null) earns the fallback too, and
    // so does a mount that's no more informative than the floor: a bare echo
    // of the stub children (the component name floating in white space) or a
    // visually collapsed render (invisible/headless output).
    setTimeout(function(){
      var t=(r.textContent||'').trim();
      if (!r.childElementCount && !t) return dsFallback();
      if (t === ${JSON.stringify(name)} || r.getBoundingClientRect().height < 2) dsFallback();
    }, 350);
  </script>
</body></html>
`;
}

// JS expression that wraps `expr` in the config's provider chain (if any).
// `{"$ref": "X"}` in a prop value emits `G.X` instead of a JSON literal —
// for providers that need a bundle export (e.g. `theme={LIGHT_THEME}`).
// `hasDecorators` → auto-detected .storybook/preview decorators were bundled
// to _vendor/preview-decorators.js which defines window.__dsDecorate; an
// explicit PROVIDER still wins so cfg.provider remains the manual override.
export function providerWrapper(PROVIDER, GLOBAL, hasDecorators) {
  if (!PROVIDER && hasDecorators) {
    return (expr) => `(window.__dsDecorate?window.__dsDecorate(${expr}):${expr})`;
  }
  // p.component and props reach a `<script>` block — validate as identifier
  // paths and escape `<` in stringified values.
  for (let p = PROVIDER; p; p = p.inner) {
    // Per-segment (see package-build's gate): a bare dot in the class admits
    // member-expression SyntaxErrors like `Theme..Provider`.
    if (!/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(p.component)) {
      console.error(`[PROVIDER_INVALID] cfg.provider component "${p.component}" isn't a valid identifier path`);
      return (e) => e;
    }
  }
  const providerProps = (props, G) => {
    const pairs = Object.entries(props ?? {}).map(([k, v]) => {
      // $hint reaches a /* */ comment inside a <script> block — strip */ and
      // < so it can neither terminate the comment nor open a tag.
      const san = (s) => String(s).replace(/\*\//g, '* /').replace(/</g, '\\u003c');
      if (v && typeof v.$ref === 'string') {
        if (/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(v.$ref)) return `${JSON.stringify(k)}:${G}.${v.$ref}`;
        console.error(`[PROVIDER_INVALID] $ref "${v.$ref}" isn't a valid identifier path`);
        return `${JSON.stringify(k)}:undefined`;
      }
      const val = v && typeof v.$hint === 'string'
        ? `undefined /* your ${san(k)} — storybook applies an object with keys: ${san(v.$hint)} */`
        : JSON.stringify(v).replace(/</g, '\\u003c');
      return `${JSON.stringify(k)}:${val}`;
    });
    return `{${pairs.join(',')}}`;
  };
  return (expr, G = `window.${GLOBAL}`) => {
    // Collect the chain so we can wrap innermost-first (N-deep, matches
    // providerJsx's walk).
    const chain = [];
    for (let p = PROVIDER; p; p = p.inner) chain.push(p);
    let out = expr;
    for (let i = chain.length - 1; i >= 0; i--) {
      const p = chain[i];
      out = `h(${G}.${p.component},${providerProps(p.props, G)},${out})`;
    }
    return out;
  };
}

// Story-source snippets for .prompt.md — slice each paired story's export
// block out of the story file verbatim: real JSX a human wrote, a better
// usage reference for the design agent than reconstructed prop strings.
// Line-based (export-to-next-export), capped, fence-sanitized.
function storySnippets(c, visibleStoryIds) {
  // Stories may be split across files — slice each snippet from the story's
  // OWN module (s.storySrc), parsed once per file.
  const parsed = new Map();
  const parseFile = (p) => {
    if (parsed.has(p)) return parsed.get(p);
    const src = readText(p);
    if (!src) { parsed.set(p, null); return null; }
    const lines = src.split('\n');
    const starts = new Map();
    lines.forEach((l, i) => {
      const m = /^export (?:const|function) (\w+)/.exec(l);
      if (m && !starts.has(m[1])) starts.set(m[1], i);
    });
    const entry = { lines, starts, boundaries: [...starts.values()].sort((a, b) => a - b) };
    parsed.set(p, entry);
    return entry;
  };
  const out = [];
  for (const s of visibleStoryIds.slice(0, 3)) {
    const file = s.storySrc ?? c.storySrc;
    if (!s.exportKey || !file) continue;
    const f = parseFile(file);
    if (!f || !f.starts.has(s.exportKey)) continue;
    const begin = f.starts.get(s.exportKey);
    const end = f.boundaries.find((i) => i > begin) ?? f.lines.length;
    let block = f.lines.slice(begin, Math.min(end, begin + 40)).join('\n').trimEnd();
    if (end > begin + 40) block += '\n// …';
    out.push(`// ${String(s.name ?? '').replace(/[`\r\n]/g, ' ')}\n${block.replace(/```/g, '')}`);
  }
  return out;
}

export function emitPerComponent({ src, components, OUT, GLOBAL, PKG, VERSION, OVERRIDES, REPLACES, PROVIDER, hasDecorators, builtPreviews, propsBodyFor, compoundsFor, smartDefaultProps }) {
  // PROVIDER arrives pre-validated by package-build's gate: invalid
  // identifier paths and provably-unexported heads exit the build
  // ([PROVIDER_INVALID]/[PROVIDER_UNEXPORTED]); unprovable heads proceed
  // with an explicit [PROVIDER_UNVERIFIED] warning. Either way a non-null
  // PROVIDER is used as-is — one check site, no per-emitter drift.
  const wrap = providerWrapper(PROVIDER, GLOBAL, hasDecorators);
  const decoratorScript = hasDecorators ? '\n  <script src="../../../_vendor/preview-decorators.js"></script>' : '';
  // One-line context reminder for every .prompt.md head. The full provider
  // chain lives in README.md, but agents routinely jump straight to a
  // component's prompt.md — without this line they compose provider-less.
  const providerNote = PROVIDER
    ? ` Wrap the tree in \`<${PROVIDER.component}>\` (full provider chain in README.md — components read theme/i18n from that context).`
    : hasDecorators
      ? ` Components expect the context this repo's \`.storybook/preview\` decorators provide (theme/i18n) — see README.md.`
      : '';
  // _ds_bundle.css is optional (CSS-in-JS / headless DSes have none).
  const bundleCssLink = existsSync(join(OUT, '_ds_bundle.css'))
    ? '\n  <link rel="stylesheet" href="../../../_ds_bundle.css">' : '';
  let done = 0;
  for (const c of components) {
    if (++done % 20 === 0 || done === components.length) console.error(`  [DTS] ${done}/${components.length} components`);
    // One dir per component — the self-check's cardByDir stores the first
    // @dsCard .html per directory, so the .jsx and .html must be the only
    // pair in their dir.
    const dir = join(OUT, 'components', c.group, c.name);
    mkdirSync(dir, { recursive: true });
    // Apply cfg.overrides.<Component>.skip once so the preview grid,
    // .prompt.md variants, JSX examples, and asset subtitle all agree.
    const skip = new Set(OVERRIDES[c.name]?.skip ?? []);
    const visibleStoryIds = (c.storyIds ?? []).filter((s) => !skip.has(s.id));
    c.visibleStoryIds = visibleStoryIds;

    // .jsx — one-line re-export into window scope.
    writeFileSync(
      join(dir, `${c.name}.jsx`),
      `// Re-export of ${PKG}@${VERSION} ${c.name}. Implementation is in the root _ds_bundle.js (window.${GLOBAL}).\n` +
        `Object.assign(window, { ${c.name}: window.${GLOBAL}.${c.name} });\n`,
    );

    // .d.ts — props interface from shipped types + @replaces JSDoc.
    const pb = propsBodyFor(c.name);
    const members = compoundsFor?.(c.name);
    const replaces = REPLACES[c.name] ? ` * @replaces ${REPLACES[c.name]}\n` : '';
    // Prelude (inlined type refs) goes AFTER the Props interface — the app's
    // parser takes the first interface in the file, and TS hoists type decls.
    const dts =
      `import * as React from 'react';\n\n` +
      `/**\n * ${c.name} — from ${PKG}@${VERSION}${c.importPaths?.size ? ` (${[...c.importPaths][0]})` : ''}.\n${replaces} */\n` +
      `export interface ${c.name}Props${pb?.generics ?? ''}${pb?.extendsClause ?? ''} {\n${pb?.body ?? '  [key: string]: unknown;'}\n}\n\n` +
      (pb?.prelude ?? '') +
      // A namespace-only export (`export * as Dialog` — Root present,
      // no own Props) isn't itself callable — declare as just the member map.
      (members?.includes('Root') && !pb
        ? `export declare const ${c.name}: {\n${members.map((m) => `  ${m}: React.ComponentType<any>;`).join('\n')}\n};\n`
        : `export declare const ${c.name}: React.ComponentType<${c.name}Props>` +
          (members?.length ? ` & {\n${members.map((m) => `  ${m}: React.ComponentType<any>;`).join('\n')}\n}` : '') +
          `;\n`);
    // Strip structural hints — they're for smartDefaultProps, not the .d.ts reader.
    writeFileSync(join(dir, `${c.name}.d.ts`), dts.replace(/ \/\* @(?:fn|arr) \*\//g, ''));

    // .prompt.md — first line is the element-index summary the design agent
    // reads; the body is the matched doc (cfg.docsDir / sibling .md) when one
    // exists, else a synthesized doc (## Props / ## Examples / ## Related)
    // built from what the converter already knows.
    const kw = c.docKeywords?.length ? ` Keywords: ${c.docKeywords.join(', ')}.` : '';
    const head = `${c.name} from ${PKG}. Use via \`window.${GLOBAL}.${c.name}\` (bundle loaded from the root \`_ds_bundle.js\`).${providerNote}${kw}\n`;
    // Flat-sibling related components (DialogBody/MenuItem/TabPanel are
    // separate exports, not dotted) — surface the <Name>-prefixed siblings.
    const siblings = components
      .filter((s) => s !== c && s.name.startsWith(c.name) && s.name.length > c.name.length && /^[A-Z]/.test(s.name.slice(c.name.length)))
      .map((s) => `\`${s.name}\``);
    let prompt;
    if (c.docBody) {
      prompt = head + '\n' + c.docBody + '\n';
      // Append the synthesized ## Props when the doc body doesn't carry its
      // own props table/section — keeps .prompt.md format consistent.
      if (pb?.body && !/##\s*Props\b|\|\s*Prop\s*\|/i.test(c.docBody)) {
        const bodyClean = pb.body.replace(/ \/\* @(?:fn|arr) \*\//g, '');
        prompt += `\n## Props\n\n\`\`\`ts\ninterface ${c.name}Props {\n${bodyClean}\n}\n\`\`\`\n`;
      }
    } else {
      // Synthesized doc.
      const parts = [head];
      if (c.doc) parts.push(c.doc + '\n');
      if (members?.length) {
        const subs = members.map((m) => `\`${c.name}.${m}\``).join(', ');
        parts.push(`Sub-components: ${subs}. See the DS docs for composition — e.g. items like \`${c.name}.Item\` go inside \`<${c.name}>\`; containers like \`${c.name}.Group\` wrap multiple \`<${c.name}>\`s.\n`);
      }
      if (visibleStoryIds.length) {
        const variantNames = visibleStoryIds.map((s) => s.name);
        parts.push(`Variants (see \`${c.name}.html\`): ${variantNames.join(', ')}.\n`);
      }
      // ## Props — always include the section.
      if (pb?.body) {
        const bodyClean = pb.body.replace(/ \/\* @(?:fn|arr) \*\//g, '');
        parts.push(`## Props\n\n\`\`\`ts\ninterface ${c.name}Props {\n${bodyClean}\n}\n\`\`\`\n`);
      }
      // ## Examples — verbatim story-source snippets first; then any preview
      // .tsx exports, owned .design-sync/previews/ first else the generated
      // cache (gracefully empty when neither exists).
      const exParts = [];
      const snippets = storySnippets(c, visibleStoryIds);
      if (snippets.length) exParts.push('```jsx\n' + snippets.join('\n\n') + '\n```');
      const ownedTsx = resolve('.design-sync', 'previews', `${c.name}.tsx`);
      const genTsx = resolve('.design-sync', '.cache', 'previews', `${c.name}.tsx`);
      exParts.push(...previewExamples(existsSync(ownedTsx) ? ownedTsx : genTsx));
      if (exParts.length) parts.push(`## Examples\n\n${exParts.join('\n\n')}\n`);
      // ## Related.
      if (siblings.length || members?.length) {
        const rel = [...siblings, ...(members ?? []).map((m) => `\`${c.name}.${m}\``)];
        parts.push(`## Related\n\n${rel.join(', ')}\n`);
      }
      prompt = parts.join('\n');
    }
    writeFileSync(join(dir, `${c.name}.prompt.md`), prompt);

    // <Name>.html — self-contained; same rendering for both shapes.
    const rootMember = members?.includes('Root') && !pb ? 'Root' : null;
    // Scaffold props for the fallback path (builtPreviews takes precedence):
    // .d.ts smart-defaults. When those produce a bad floor card, the fix is
    // an authored preview — there is no props-override config tier.
    const smart = smartDefaultProps?.(c.name, pb);
    // Precedence: compiled preview .tsx (hand-authored in
    // .design-sync/previews/ or generated in the cache) → floor card when the preview build was
    // skipped or failed. Story-local css modules compile to a sibling
    // _preview/<Name>.css (esbuild local-css) — link it when present.
    const previewCssLink = existsSync(join(OUT, '_preview', `${c.name}.css`))
      ? `\n  <link rel="stylesheet" href="../../../_preview/${c.name}.css">` : '';
    // Single/column cards declare a viewport so the product renders the card
    // at a verified size. BOTH mode defaults are 900x700 — the harness
    // capture viewport. The declared viewport drives the solo ?story=
    // captures too, so a mode default that diverged from 900x700 would
    // silently move capture geometry under carried grades (cardMode isn't in
    // the grade key precisely because flipping it must not change a graded
    // pixel; an explicit ov.viewport IS keyed and re-grades). The product
    // fits the card to its ≤728px column / 500px fold by scaling; content
    // below the fold is hover-scrollable.
    const ov = OVERRIDES?.[c.name] ?? {};
    // Unknown cardMode values fall through to grid silently — and the strict
    // config validation is key-name-only, so a typo'd value ("Column",
    // "singe") would otherwise render as grid with zero diagnostics.
    if (ov.cardMode && ov.cardMode !== 'single' && ov.cardMode !== 'column') {
      console.error(`  ! cfg.overrides.${c.name}.cardMode "${ov.cardMode}" isn't "single" or "column" — rendering as a plain grid`);
    }
    const card = ov.cardMode === 'single'
      ? { cardMode: 'single', primaryStory: ov.primaryStory, viewport: ov.viewport ?? '900x700' }
      : ov.cardMode === 'column'
        ? { cardMode: 'column', primaryStory: ov.primaryStory, viewport: ov.viewport ?? '900x700' }
        : ov.viewport ? { viewport: ov.viewport } : {};
    const html = builtPreviews?.has(c.name)
      ? previewHtmlModule(c.group, c.name, GLOBAL, wrap, decoratorScript, bundleCssLink, previewCssLink, card)
      : previewHtmlFloorCard(c.group, c.name, GLOBAL, wrap, rootMember, decoratorScript, bundleCssLink, smart);
    writeFileSync(join(dir, `${c.name}.html`), html);
  }
}

// .review.html — one local page iframing every component card (the REAL
// html the product renders, not screenshots), grouped and labeled, for the
// human review pass: serve the bundle dir and open /.review.html. Dot-
// prefixed → never uploaded.
export function emitReviewPage({ OUT, components }) {
  const groups = new Map();
  for (const c of components) {
    if (!groups.has(c.group)) groups.set(c.group, []);
    groups.get(c.group).push(c);
  }
  const sections = [...groups.entries()].map(([g, cs]) =>
    `<h2 style="font:600 16px system-ui;margin:28px 0 10px;color:#374151">${escapeHtml(g)}</h2>\n` +
    `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(460px,1fr));gap:16px">` +
    cs.map((c) =>
      `<figure style="margin:0;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">` +
      `<figcaption style="font:600 13px system-ui;padding:8px 12px;background:#f9fafb;border-bottom:1px solid #e5e7eb">${escapeHtml(c.name)}</figcaption>` +
      `<iframe src="components/${encodeURIComponent(c.group)}/${encodeURIComponent(c.name)}/${encodeURIComponent(c.name)}.html" loading="lazy" style="width:100%;height:340px;border:0" title="${escapeHtml(c.name)}"></iframe>` +
      `</figure>`).join('\n') +
    `</div>`).join('\n');
  const html = `<!doctype html>\n<html><head><meta charset="utf-8"><title>Design-system preview review</title></head>\n` +
    `<body style="margin:0;padding:24px;background:#fff;font-family:system-ui">\n` +
    `<h1 style="font:600 20px system-ui;margin:0 0 4px">Preview review — ${components.length} component${components.length === 1 ? '' : 's'}</h1>\n` +
    `<p style="font:13px system-ui;color:#6b7280;margin:0">Each card below is the live preview html exactly as the app will render it. Tell the agent which ones look wrong.</p>\n` +
    `${sections}\n</body></html>\n`;
  writeFileSync(join(OUT, '.review.html'), html);
}

// Provider JSX line for README (from cfg.provider chain).
function providerJsx(PROVIDER) {
  if (!PROVIDER) return '';
  let open = '', close = '';
  for (let p = PROVIDER; p; p = p.inner) {
    const props = Object.entries(p.props ?? {})
      .map(([k, v]) =>
        v && typeof v.$ref === 'string' ? ` ${k}={${v.$ref}}`
        : v && typeof v.$hint === 'string' ? ` ${k}={/* your ${k} — keys: ${String(v.$hint).replace(/\*\//g, '* /')} */}`
        : ` ${k}={${JSON.stringify(v)}}`).join('');
    open += `<${p.component}${props}>`;
    close = `</${p.component}>` + close;
  }
  return `${open}{children}${close}`;
}

export function emitReadme({ OUT, GLOBAL, PKG, VERSION, TOKENS_PKG, components, tokenFiles, hasProvider, PROVIDER, hasDecorators = false, jsdocFor, compoundsFor, guidelineCount = 0, headerText = '' }) {
  const tokenNames = new Set();
  for (const f of tokenFiles) {
    const css = readText(join(OUT, 'tokens', f));
    for (const m of css.matchAll(/(?<![\w-])(--[A-Za-z][\w-]*)\s*:/g)) tokenNames.add(m[1]);
  }
  // Monolithic stylesheets (a single compiled CSS via cfg.cssEntry) declare
  // their custom properties inside _ds_bundle.css with no separate tokens/ —
  // surface those instead of claiming the DS has no tokens.
  const bundleCssText = readText(join(OUT, '_ds_bundle.css'));
  const hasBundleCss = bundleCssText.trim().length > 0 && !bundleCssText.startsWith('/* @ds-css-runtime');
  let tokensInBundle = false;
  if (tokenNames.size === 0 && hasBundleCss) {
    for (const m of bundleCssText.matchAll(/(?<![\w-])(--[A-Za-z][\w-]*)\s*:/g)) tokenNames.add(m[1]);
    tokensInBundle = tokenNames.size > 0;
  }
  const tokenFamilies = { color: [], spacing: [], typography: [], radius: [], shadow: [], other: [] };
  for (const t of tokenNames) {
    const k = /color|bg-|fg-|text-|fill|border-(?!radius|width)|surface/i.test(t) ? 'color'
      : /space|gap|pad|margin|inset|-p-|-m-/i.test(t) ? 'spacing'
      : /font|line-height|letter|weight|tracking/i.test(t) ? 'typography'
      : /radius|rounded/i.test(t) ? 'radius'
      : /shadow|elevation/i.test(t) ? 'shadow'
      : 'other';
    tokenFamilies[k].push(t);
  }
  const tokenOverview = Object.entries(tokenFamilies)
    .filter(([, v]) => v.length)
    .map(([k, v]) => `- **${k}** (${v.length}): \`${v.slice(0, 3).join('`, `')}\`${v.length > 3 ? ', …' : ''}`)
    .join('\n');
  const byGroup = new Map();
  for (const c of components) {
    if (!byGroup.has(c.group)) byGroup.set(c.group, []);
    byGroup.get(c.group).push(c);
  }
  const componentIndex = [...byGroup.entries()]
    .map(([g, cs]) => `### ${g}\n${cs.map((c) => {
      const doc = jsdocFor(c.name);
      const members = compoundsFor?.(c.name) ?? [];
      const memberNote = members.length
        ? ` (compound: ${members.slice(0, 6).map((m) => `\`${c.name}.${m}\``).join(', ')}${members.length > 6 ? ', …' : ''})`
        : '';
      return `- \`${c.name}\`${doc ? ` — ${doc}` : ''}${memberNote}`;
    }).join('\n')}`)
    .join('\n\n');
  const readme = `# ${GLOBAL} (${PKG}@${VERSION})

This design system is the published ${PKG} React library, bundled as a single
browser global. All ${components.length} components are the real upstream code.

## Where things are

- \`_ds_bundle.js\` — the whole-DS bundle at the project root; loads every component to \`window.${GLOBAL}\`. First line is a \`/* @ds-bundle: … */\` metadata header.
- \`styles.css\` — the single stylesheet entry${hasBundleCss ? ': it `@import`s the tokens, fonts, and component styles (`_ds_bundle.css`)' : ' (tokens and fonts; this DS injects component styles at runtime)'}. Link this one file.
- \`components/<group>/<Name>/<Name>.prompt.md\` (example JSX + variants), \`<Name>.d.ts\` (types), \`<Name>.html\` (variant grid).
- \`tokens/*.css\` — CSS custom properties, names verbatim from upstream.
- \`fonts/\` — \`@font-face\` files + \`fonts.css\` (when the package ships fonts).
${guidelineCount ? `- \`guidelines/\` — the design system's own usage guidance (${guidelineCount} doc(s), see \`guidelines/index.md\`). Read these before composing larger layouts.\n` : ''}
For a specific component, \`read_file("components/<group>/<Name>/<Name>.prompt.md")\`.

## Loading

Add these two lines to your page once (React must be on the page first):

\`\`\`html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
\`\`\`

Components are then available at \`window.${GLOBAL}.*\`. Mount into a dedicated child node (e.g. \`<div id="ds-root">\`), not the host page's own React root, so the two trees don't collide:

\`\`\`jsx
const { ${components[0]?.name ?? 'Component'} } = window.${GLOBAL};
ReactDOM.createRoot(document.getElementById('ds-root')).render(<${components[0]?.name ?? 'Component'} />);
\`\`\`
${hasProvider ? `
Wrap the tree in the provider — most components read theme/i18n from context:

\`\`\`jsx
${providerJsx(PROVIDER)}
\`\`\`
` : hasDecorators ? `
This DS's storybook wraps every story in decorators from \`.storybook/preview\`
(bundled for the preview cards as \`_vendor/preview-decorators.js\`). Components
likely need equivalent context — theme/i18n providers — in your tree too. The
exact chain hasn't been distilled into config, so check the DS's documented
provider setup before composing.
` : ''}
## Tokens

${tokenNames.size} CSS custom properties from ${TOKENS_PKG ?? PKG}. Names are
preserved verbatim from upstream. ${tokensInBundle
    ? 'They are declared inside `_ds_bundle.css` (this DS ships one compiled stylesheet rather than separate token files).'
    : tokenNames.size ? 'See `tokens/` for the full list.' : 'None detected — this DS may compute styles at runtime (CSS-in-JS).'}

${tokenOverview}

## Components

${componentIndex}
`;
  // Repo-authored header (cfg.readmeHeader) rides at the very top so it
  // survives the consumer's 32,000-char inline truncation, which cuts the
  // TAIL. Verbatim concat — the header is repo-committed content in the
  // same trust class as the README body.
  const assembled = headerText.trim() ? headerText.trimEnd() + '\n\n' + readme : readme;
  if (assembled.length > 31_900) {
    // One frame, two overflow sides — naming the wrong side once inverted
    // the budget guidance (the header survives tail-truncation only while
    // it fits the 32,000-char inline window itself).
    const side = headerText.length > 31_900
      ? `the readmeHeader alone is ${headerText.length} chars, so the header itself gets tail-truncated and the generated body contributes ZERO — trim the HEADER below ~31,900`
      : `the prepended header survives; the END of the generated body is what gets lost (typically the component index tail) — accept that deliberately, or reduce the synced surface (package shape: componentSrcMap exclusions / narrower tokensGlob; storybook shape: sync fewer stories)`;
    console.error(`  ! README.md is ${assembled.length} chars — the app inlines only the first 32,000 into the agent prompt (${side}); see the base SKILL.md Budget guidance.`);
  }
  writeFileSync(join(OUT, 'README.md'), assembled);
}

// .ds-build-meta.json — LOCAL build metadata only. The validator reads
// `componentCount` / `skippedStoryIds` / `runtimeFontPrefixes`; it is NOT
// uploaded.
export function emitBuildMeta({ OUT, GLOBAL, PKG, VERSION, PROVIDER, OVERRIDES, components, shape, cfg }) {
  const skippedStoryIds = [...new Set(Object.values(OVERRIDES).flatMap((o) => o?.skip ?? []))];
  // Fence so consumers don't read a half-uploaded tree (see the Upload section of the skill).
  // The app's self-check reads `by` to set the manifest's `source`.
  writeFileSync(join(OUT, '_ds_needs_recompile'), JSON.stringify({ by: 'design-sync-cli' }));
  writeFileSync(
    join(OUT, '.ds-build-meta.json'),
    JSON.stringify(
      {
        namespace: GLOBAL,
        source: `${PKG}@${VERSION}`,
        shape,
        provider: PROVIDER?.component ?? null,
        componentCount: components.length,
        skippedStoryIds,
        runtimeFontPrefixes: cfg?.runtimeFontPrefixes ?? [],
      },
      null,
      2,
    ) + '\n',
  );
  return components.length;
}
