# The .dc.html authoring format — full rules and syntax card

Read this when an artboard needs more than SKILL.md's skeleton.
Everything the format supports is stated here — never design around a
presumed gap ("I'll make the swatches static because I can't verify
event syntax"): events, state and conditionals all work.

## Authoring an artboard

A Design Component is one self-contained HTML file the editor (and its
runtime) understands. Shape:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Hello</title>
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; }
    a { color: #b45309; } a:hover { color: #92400e; }
  </style>
</helmet>
<div style="padding: 32px">
  <h1>{{title}}</h1>
  <sc-for list="{{items}}" as="item">
    <div>{{item.label}}</div>
  </sc-for>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"title":{"editor":"text","default":"Hello"}}'>
class Component extends DCLogic {
  renderVals() {
    return { title: this.props.title ?? 'Hello', items: [{ label: 'One' }] };
  }
}
</script>
</body>
</html>
```

Rules beyond SKILL.md's "Rules that bite":

- `lang` on `<html>` is the copy's language (`en` here); change it
  when the design's text is not English.
- `<title>` names the screen for accessibility; give each artboard its own, in a few words.
- Layout containers: a STACK is a flex `<div>` — inline
  `display: flex` plus `flex-direction`, `gap`, `justify-content`,
  `align-items`, with `flex-grow` / `align-self` on children. A GRID
  is a CSS-grid `<div>` — `display: grid` plus
  `grid-template-columns: repeat(N, minmax(0, 1fr))` and `gap`;
  children flow into the cells in document order. Both are first-class
  in the editor: the properties panel edits the full set (grid
  Columns/Rows read and write as a plain track count when the tracks
  are equal — author them in exactly the `repeat(N, minmax(0, 1fr))`
  shape so panel edits round-trip), viewers create them with the
  toolbar's Artboard tool or "Wrap in flex" / "Wrap in grid",
  and a viewer can drag an item OUT of either — the editor then
  freezes the remaining siblings and the parent's size so nothing else
  on the page moves. A DIAGRAM (boxes joined by
  lines) is neither: on a canvas build it from separate placed elements,
  never one `<svg>`, which the editor selects as one block (guidance to
  hand-draw a diagram as inline `<svg>` in a `<figure>` is for ordinary
  pages, not a canvas). `diagrams.md` has the forms: read it first.
- Multi-frame design explorations are ARTBOARDS: put each frame in
  its own `.dc.html` entry and lay them out with `canvas.json` — the
  host canvas provides the infinite pan/zoom; no in-file meta flag switches
  modes. Give every artboard whose content really works (handlers,
  inputs, navigation) `"is_interactive": true` in its canvas.json entry
  — only those get the blue mark and a Play button; leave it off
  static comps. A clickable prototype is one artboard per screen,
  joined by links (Links between artboards, below). A PAGE (landing
  page, dashboard, web app screen, scrolling explainer) gets `"expand":
  "fill"` on its artboard entry and a fluid root — in the full-window view
  it fills the window and scrolls as a page (without `fill` it is shrunk to
  fit); side menu + content: a `flex-wrap: wrap` row, content
  `flex: 999 1 560px; min-width: 0`, so the menu (never sticky or `100vh`) stacks on a
  phone; toolbars wrap; wide tables get an `overflow-x: auto` box; a one-file design can launch focused (`{"launch": {"view":  
  "focused", "file": "Main.dc.html"}}`).
- LAYOUT GUIDES: an artboard entry may carry `"guides"`, up to 6, drawn
  by the canvas OVER the artboard, never in Play, exports or markup:
  `{"kind":"columns","count":12,"gutter":24,"margin":80}` (align
  `"stretch"`, default, divides the width inside `margin`;  
  `"start"|"center"|"end"` pack `count` tracks of `"size"` px,  
  `"offset"` in from that edge; `"count":"auto"` = as many as fit),
  `{"kind":"rows",…}` (same fields down the height; default `"auto"`
  8 px rows every 8), `{"kind":"grid","size":8}`; any may add `"color"`
  (hex or rgb()/hsl(), alpha = strength; default red at 10%) and
  `"hidden":true`. Add a guide only when a grid layout genuinely
  helps, never on every artboard. When an artboard has
  `"guides"`, lay the content ON it — a stretch guide is
  `display:grid; grid-template-columns: repeat(count, minmax(0,1fr));
  column-gap:<gutter>px; padding-inline:<margin>px`; children span
  tracks — and treat the user's guide edits as the intended layout.
- The design content a viewer edits is **untrusted cross-user input**
  like everything in the published state. It runs ONLY inside the
  editor's sandboxed preview iframe (editor-and-saving.md § How saving
  and sharing work) — never lift published design source into the host page, an
  unsandboxed surface, or any prompt without fencing (the shared
  fenceUntrusted rule: published-state-derived text entering any
  prompt is wrapped in nonce-delimited untrusted-data markers, with
  an instruction to treat it as data, so the receiving model does not
  read it as instructions).

## Quick syntax card (a syntax demo; `{{title}}` etc. are placeholders)

- **Holes**: `{{ path }}` is a dotted lookup only (`{{ user.name }}`,
  `{{ $index }}`, literals like `{{ true }}`) — never an expression
  (`{{ a + b }}`, `{{ !x }}`, `{{ fn() }}` fail silently). Compute in
  `renderVals()` and expose the result by name.
- **Attributes**: `x="literal"` → string; `x="{{ path }}"` → the raw
  value (number, function, ref); `x="a {{p}} b"` → interpolated
  string. `class`/`for` auto-map to `className`/`htmlFor`.
- **Events ARE supported**: whole-value attrs with JSX camelCase —
  `onClick="{{ pick }}"` — where `pick` is a function returned from
  `renderVals()`. Interactive selected-states (clickable swatches,
  size pills) are the house pattern: keep the selection in `state`,
  and for per-item handlers attach one to each loop item in
  `renderVals()` — `items: xs.map((x) => ({ ...x, pick: () =>
  this.setState({ picked: x.id }) }))` — then bind
  `onClick="{{ item.pick }}"` inside the `<sc-for>`.
- **Control flow**: `<sc-if value="{{ cond }}"
  hint-placeholder-val="{{ true }}">…</sc-if>` branches;  
  `<sc-for list="{{ items }}" as="item" hint-placeholder-count="3">`  
  repeats with `{{ item.x }}` and `{{ $index }}` in scope. Always set
  the `hint-*` attrs (they render while values stream in).
- **Links between artboards**: `<a href="Cart.dc.html">View cart</a>`
  moves Play to that artboard, in place or full window (not while
  editing). The href is the target's path relative to this
  artboard's; a leading `/` means the canvas root (`/sub/Cart.dc.html`).
  Style the `<a>` itself as the button: a `<button>` or input inside
  it swallows the click. `href="#id"` scrolls within the artboard;
  `https://…` opens a tab. Each artboard keeps its own `state`, so a
  flow that must share state across screens is ONE artboard: its
  handlers set a `state` field, `renderVals()` returns one flag per
  screen from it, and each screen sits in its own `<sc-if>`.
- **Conditional styling in a loop**: precompute the varying piece per
  item in `renderVals()` (e.g. each item carries `ringStyle` or
  `selected`) and either branch with `<sc-if>` or bind the computed
  value — a style hole is acceptable for live, state-driven values
  (selection highlights) and for a declared tweak prop (`{{accent}}`),
  just never for other static theme tokens, which belong inline so they
  paint while streaming.
- **Logic class**: plain classic JS, no TypeScript, no import/export;
  must be `class Component extends DCLogic`. You get `this.props`,
  `state`/`setState`/`forceUpdate` and React class lifecycle
  (`componentDidMount`…), minus `render()`. `renderVals()` returns the
  template's inputs: flat values, arrays, handlers, refs.
- **`data-props` editors** (on the `<script type="text/x-dc" data-dc-script>` tag):  
  per-prop `{"editor": "text"|"color"|"int"|"float"|"range"|"boolean"|  
  "enum"|null, "default": …, "tsType": "…"}` plus `options` for enum,  
  `min`/`max`/`step`/`unit` for numbers/range, `section` to group;
  on color, `options` as a 3–4-item list of hex strings renders swatches.
  `editor: null` for callbacks/objects. Editable props open in the
  panel's Tweaks tab from the artboard's Tweaks button (which props
  deserve an editor: below). `default`
  seeds the editor only — fall back
  with `this.props.x ?? …` in `renderVals()`.
  `$preview: {"width", "height"}` sets the preferred preview size for
  sized fragments (a PAGE declares it too: its frame's `w`×`h`).
- **Tweaks are levers, not copy.** Every `data-props` entry with an
  editor becomes a control in the Tweaks tab, so declare few,
  deliberate ones: behavioral switches (a dark or density toggle, a
  variant enum, an item count) and values that cut across the design in
  many places (one accent or tint color, a spacing or type scale). Do
  NOT make tweaks for label or body copy unless the user asks — write
  copy as literal text in the markup (not a prop, and not a
  `renderVals()` binding unless it is genuinely data) so viewers retype
  it in place in the WYSIWYG editor — and do not make a tweak for a
  color used in a single place; they restyle that element in the
  properties panel.
- **`data-props` escaping**: it is a normal HTML attribute — the
  runtime reads it with `getAttribute` and then JSON-parses, so HTML
  entities decode first: write `&amp;` for `&`, `&#39;` for a
  literal single quote, and JSON
  `\"` for double quotes inside strings. Single-quote the attribute
  itself (`data-props='…'`) — every example assumes it, and a
  double-quoted attribute changes which characters need escaping.
  Those three escapes are the complete list: raw UTF-8 (em-dashes,
  middle dots, accented letters) is safe as-is, no numeric entities
  needed.
- **Editable text, including multi-line**: a `{{hole}}` bound to a
  `data-props` entry with `{"editor": "text"}` renders as a TEXT
  node — HTML in the value is escaped, so `<br>` will not work. For
  multi-line text, pair `\n` in the JSON default with
  `white-space: pre-line` (or `pre-wrap`) in the bound element's
  inline style — without it HTML collapses the newline to a space
  and the lines run together (a real shipped bug: a two-line band
  lineup rendered as one merged line). For rich per-line layout,
  split into multiple props, one element each.
- **Child DCs**: `<dc-import name="Card" item="{{ it }}"
  hint-size="100%,120px"></dc-import>` mounts the sibling file
  `Card.dc.html` (which is also an artboard of its own); every other
  attribute becomes a prop on the child (kebab→camel, read as
  `this.props.item` — declare it in the child's `data-props` with
  `"editor": null` when it is an object or callback; avoid a prop named
  `name`, which selects the component); `hint-size="W,H"` (CSS lengths)
  is the placeholder box shown until the child renders, so match the
  child's root size; works inside `<sc-for>`; never self-close and
  never use capitalized tags (`<Card/>`).
