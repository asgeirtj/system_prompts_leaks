// generatePreviewSource (storybook shape) — emits the preview wrapper body
// (written to the generated cache, .design-sync/.cache/previews/<Name>.tsx)
// for one component by IMPORTING THE STORY MODULE itself and
// exposing each story as a component. The whole module comes along — hooks,
// fixtures, local helper components — so a render that closes over
// story-local refs works as-is. Component identifiers still resolve to the SHIPPED bundle:
// lib/story-imports.mjs redirects package and relative component imports to
// window.<GLOBAL> at compile time, so the preview proves the real artifact.
//
// A component's stories may live in one module or be split across several
// (one-story-per-file layouts) — the wrapper imports every module that has a
// paired story; each story composes from its own module.
//
// The generated file carries the standard ownership marker; to hand-edit it
// (pin args, drop a story, inline a provider) copy it to
// .design-sync/previews/<Name>.tsx minus line 1 — owned copies win and
// re-syncs leave them alone. Fork seam: resolution policy lives in
// lib/story-imports.mjs.

import { relative } from 'node:path';
import { exportName } from './common.mjs';

// The composeStories-equivalent embedded in every wrapper. Storybook
// semantics, minimally: merged args (meta ← story), render precedence
// (story.render → CSF2 function story → meta.render → meta.component), and
// meta+story decorators applied story-innermost with a minimal context
// carrying the standard field names (decorators that read ctx.kind/globals
// get empty-shaped values instead of crashing). Decorators needing real
// storybook runtime state degrade per-story to a cell error — grading
// residue, not a build failure.
const COMPOSE = `function compose(S: any, key: string) {
  const meta: any = S.default ?? {};
  const st: any = S[key];
  const args: any = { ...(meta.args ?? {}), ...(st && st.args ? st.args : {}) };
  // Storybook resolves argTypes.mapping (control value -> real arg) before
  // rendering; mirror that so mapped args don't render raw.
  const at: any = { ...(meta.argTypes ?? {}), ...(st && st.argTypes ? st.argTypes : {}) };
  for (const k of Object.keys(args)) {
    const m = at[k] && at[k].mapping;
    if (m && typeof m === 'object' && args[k] in m) args[k] = m[args[k]];
  }
  const title: string = typeof meta.title === 'string' ? meta.title : '';
  const ctx: any = {
    args, name: key, title, kind: title, id: '', componentId: '',
    globals: {}, viewMode: 'story',
    parameters: (st && st.parameters) ?? meta.parameters ?? {},
  };
  let render: (() => any) | null = null;
  if (st && typeof st.render === 'function') render = () => st.render(args, ctx);
  else if (typeof st === 'function') render = () => st(args, ctx);
  else if (typeof meta.render === 'function') render = () => meta.render(args, ctx);
  else {
    const C = (st && st.component) || meta.component;
    if (C) render = () => React.createElement(C, args);
  }
  if (!render) return () => null;
  // [].concat: a single function is legal CSF decorator shorthand. A
  // decorator returning undefined (stubbed addon) falls through to the inner
  // render — otherwise one unrecognized addon blanks the cell silently.
  const decorators: any[] = ([] as any[]).concat((st && st.decorators) ?? []).concat(meta.decorators ?? []);
  return decorators.reduce((inner: any, dec: any) => () => {
    const out = dec(inner, ctx);
    return out === undefined ? inner() : out;
  }, render);
}`;

// Generate the preview .tsx body for one component — or null when nothing
// paired, in which case no wrapper is written and the html shows the floor
// card (the same floor as a wrapper that fails to compile). Pairing failures
// are loud and fixable, so the floor card is the only fallback.
export function generatePreviewSource(c, opts) {
  // Story-module tier: needs the story source path and at least one visible
  // story paired to a module export (pairing happens in source-storybook.mjs
  // — c.storyIds[].exportKey).
  const skipSet = new Set(opts.skip ?? []);
  const visible = (c.storyIds ?? []).filter((s) => !skipSet.has(s.id));
  const paired = visible.filter((s) => s.exportKey);
  if (!c.storySrc || paired.length === 0) {
    if (c.storySrc && visible.length > 0) {
      console.error(`  (preview: ${c.name} — no story exports paired (storyName overrides?); showing the floor card)`);
    }
    return null;
  }
  // Location-independent import: `@ds-stories/<path relative to the repo
  // root>` (forward slashes for machine portability), resolved by the
  // story-imports plugin set. A relative spec would bake in the wrapper's
  // directory depth — and the promote flow copies wrappers from the
  // generated cache into .design-sync/previews/ (one level shallower), so
  // the same file must compile from either home. One import per distinct
  // story module, in first-paired order; S is the first (and for
  // single-module components the only) one.
  const toSpec = (p) => {
    const rel = relative(process.cwd(), p).replace(/\\/g, '/');
    return JSON.stringify(`@ds-stories/${rel}`.replace(/\.[cm]?[jt]sx?$/, ''));
  };
  const modVars = new Map(); // story source path -> import identifier
  const modVarFor = (p) => {
    if (!modVars.has(p)) modVars.set(p, modVars.size === 0 ? 'S' : `S${modVars.size + 1}`);
    return modVars.get(p);
  };
  // Emitted export names are PascalCased via exportName (the html mount loop
  // only renders /^[A-Z]/ exports; CSF allows camelCase keys) — compare's
  // squash pairing is case-insensitive, so pairing is unaffected. compose()
  // still receives the RAW module key. Squash collisions (two index stories
  // pairing to one export of the same module, e.g. via a storyName override)
  // emit once.
  // Each story records the EXACT export name its cell is emitted under
  // (s.emitted, carried into the stories-map) — labels are deduped when the
  // same key appears in several modules ("Default" + "Default2"), so compare
  // must pair on the emitted label, not a fuzzy match of the raw key.
  const seen = new Set();
  const used = new Set();
  const lines = [];
  for (const s of paired) {
    const mod = modVarFor(s.storySrc ?? c.storySrc);
    const dupKey = `${mod}:${s.exportKey}`;
    if (seen.has(dupKey)) {
      console.error(`  (preview: ${c.name} — story "${s.name}" pairs to already-emitted export ${s.exportKey}; skipping duplicate)`);
      continue;
    }
    seen.add(dupKey);
    const label = exportName(s.exportKey, used);
    s.emitted = label;
    lines.push(`export const ${label} = /* ${s.name} */ compose(${mod}, ${JSON.stringify(s.exportKey)});`);
  }
  const imports = [...modVars.entries()]
    .map(([p, v]) => `import * as ${v} from ${toSpec(p)};`)
    .join('\n');
  return `import * as React from 'react';
${imports}

${COMPOSE}

${lines.join('\n')}
`;
}
