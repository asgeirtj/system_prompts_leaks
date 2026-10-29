# UI mockup variants and design controls

## Variant carousel

- Show one complete design at a time. Make the named designs meaningfully different in layout and interaction, beyond recoloring one design. Keep side-by-side layouts when the user explicitly asks for simultaneous comparison.
- Use one `.viz-carousel` root with an `aria-label` and one direct child per design, each labeled with a unique, short `data-variant` name. Start with only the first design visible and mark the others `hidden`.
- The runtime supplies previous/next buttons, a count, and a named picker at the bottom center. It switches designs without replacing their DOM, so local interactions and state survive. Do not generate carousel JavaScript, navigation markup, or CSS.
- Keep the carousel outside product-scoped mockup styles. The carousel is an exception to the mockup utility rule; use product-specific styles inside each variant. The carousel reserves bottom space for its controls. Give every variant the same responsive stage height, sized for the tallest design, so navigation stays in place when switching. At narrow widths, increase the shared stage height or reflow the product content so nothing clips.
- Use stable, descriptive names without numeric or ordinal prefixes (for example, `Compact`, never `01 · Compact`); the runtime already displays the count. Names should be easy to reference in feedback. Do not submit feedback on navigation or start animation or audio when a variant becomes visible.
- For another language, set `data-previous-label` and `data-next-label` on the root. The count and names update automatically. Navigation stays local; it does not persist a selection or submit it to the model.

```html
<div class="viz-carousel" aria-label="Music player designs">
  <section data-variant="Minimal" aria-label="Minimal music player">
    <!-- Complete interactive player with product-specific styles -->
  </section>
  <section data-variant="Editorial" aria-label="Editorial music player" hidden>
    <!-- A distinct design, with its own controls and state -->
  </section>
  <section data-variant="Studio" aria-label="Studio music player" hidden>
    <!-- A third design -->
  </section>
</div>
```

## Design controls

The app supplies a small `Tweak` object-binding helper. It sends controls to the host and applies returned values to your bound objects; it does not render the Tweak.js panel. Do not import Tweak.js or generate host API wiring, callback IDs, DOM event listeners, theme synchronization, or a controls launcher.

Render the mock's initial state first. Guard the optional helper so the same HTML still works in hosts and standalone renderers without design controls:

```js
const state = { radius: 18, accent: "#7c3aed", playing: true };
const player = document.getElementById("music-player");

function render() {
  player.style.borderRadius = `${state.radius}px`;
  player.style.setProperty("--player-accent", state.accent);
  player.querySelector("button").textContent = state.playing ? "Pause" : "Play";
}
render();

if (globalThis.Tweak) {
  const tweak = new Tweak({ container: player, onChange: render });
  tweak.addSlider(state, "radius", { label: "Corner radius", min: 0, max: 40, unit: "px" });
  tweak.addColorPicker(state, "accent", { label: "Accent", reference: "--player-accent" });
  tweak.addToggle(state, "playing", { label: "Playing" });
}
```

Give each component a descriptive `aria-label` for its group heading. Use a separate `Tweak` instance for each independently editable element; the host combines the groups in one panel. Keep the registered element alive and update its styles or descendants in `onChange` rather than replacing it.

For a variant carousel, bind `Tweak` to the independently editable components inside each variant, with matching descriptive `aria-label` values. The host shows controls for the visible variant and keeps edits when switching designs. Controls bound outside variants stay visible; use them for shared settings and apply those changes to every affected design. Do not also add a Tweak select for the active variant.

- `addSlider(object, property, { min, max, step = 1, unit?, label?, reference? })` binds a number. `unit` is display context in the label, not part of the numeric value.
- `addColorPicker(object, property, { label?, reference? })` binds a hex color string.
- `addToggle(object, property, { label?, reference? })` binds a boolean.
- `addSelect(object, property, { options, label?, reference? })` binds a string. Options can be strings or `{ label, value }` objects.

The helper updates the bound property before calling `onChange`, including reset and temporary original preview. Make `onChange` a deterministic local render function, not a network write or irreversible action. Initial values are the current mock state. Use at most 12 controls per component and 12 options per select. Optional `reference` hints identify a token or state property, for example `--player-accent` or `player.radius`; use no spaces or punctuation other than `_ - . / : @ $ #`.

The host owns opening, closing, reset, and submitting changes. Missing annotation support is inert (`tweak.supported` is false). Page cleanup is automatic; call `tweak.dispose()` only if removing the component before navigation.
