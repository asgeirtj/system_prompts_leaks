# ZCode page API

The host installs the bridge before your fragment's scripts run. Do not load another bridge or MCP client.

```html
<label class="form-label" for="count">Count</label>
<input class="form-range" id="count" type="range" min="1" max="20" />
<output id="value"></output>
<button class="btn btn-primary" id="ask">Explain this scenario</button>
<p role="status" id="status"></p>
<script>
  const count = document.getElementById("count");
  const value = document.getElementById("value");
  const status = document.getElementById("status");
  function restore() {
    const saved = window.zcode.widgetState?.modelContent?.count;
    count.value = typeof saved === "number" && saved >= 1 && saved <= 20 ? saved : 5;
    value.textContent = count.value;
  }
  restore();
  window.addEventListener("zcode:set_globals", (event) => {
    // event.detail.globals contains widgetState and theme.
    restore();
  });
  count.oninput = () => {
    value.textContent = count.value;
  };
  count.onchange = async () => {
    try {
      await window.zcode.setWidgetState({
        modelContent: { count: Number(count.value) },
        privateContent: null,
      });
    } catch {
      status.textContent = "Could not save. Try again.";
    }
  };
  document.getElementById("ask").onclick = async () => {
    try {
      await window.zcode.sendFollowUpMessage({
        prompt: `Explain the scenario with count ${count.value}`,
        title: "Count explorer",
      });
    } catch {
      status.textContent = "Message was cancelled or could not be sent.";
    }
  };
</script>
```

`widgetState` is a snapshot or `null`. Saving replaces the whole `{modelContent, privateContent}` object; omitted fields become `null`. Both must be JSON values. The combined serialized size is at most 16 KiB. The host includes only `modelContent` as untrusted data on the next submitted input. No `callTool`, resource reader or full Desktop preload is available. Theme and size synchronize automatically.

## External links

Prefer a normal link for navigation:

```html
<a class="btn btn-primary" href="https://example.com/subscribe" target="_blank" rel="noopener noreferrer">Subscribe</a>
```

The inline host opens the destination through the current client's browser entrypoint and keeps the card in place. `target` does not choose a particular browser or tab. Use an absolute `http:` or `https:` URL; `#fragment` links remain within the page. Downloads and other protocols are unsupported.

For a scripted action, `window.zcode.openExternal({ href: string }): Promise<void>` resolves after the host accepts the open operation and rejects on failure. Call it directly from a user click or keyboard activation, not on page load or a timer:

```js
document.getElementById("subscribe").onclick = async () => {
  try {
    await window.zcode.openExternal({ href: "https://example.com/subscribe" });
  } catch {
    document.getElementById("status").textContent = "Could not open the link. Try again.";
  }
};
```

The host requires an active, visible card and consumes a native user gesture. When replacing an anchor's default behavior with an explicit API call, call `event.preventDefault()` to avoid a second request. Normal anchor failures emit the existing `zcode:error` event with a string in `event.detail`. External links do not send an Agent message.

## Local design controls

The source contract is [tweak.md](../tweak.md). The example below uses the same API with the ZCode bridge.

Render the initial mockup first. Use a separate Tweak group for each editable component and give its root a descriptive `aria-label`. The optional helper binds objects and supplies host controls; it does not render a Tweak.js panel.

```html
<div id="player" aria-label="Music player">Play</div>
<style>
  #player {
    --player-accent: #7c3aed;
    padding: 20px;
    background: light-dark(#f5f3ff, #282235);
    color: light-dark(#24212d, #f5f3ff);
  }
</style>
<script>
  const state = { radius: 18, accent: "#7c3aed", playing: true, density: "normal" };
  const player = document.getElementById("player");
  function render() {
    player.style.borderRadius = `${state.radius}px`;
    player.style.setProperty("--player-accent", state.accent);
    player.textContent = state.playing ? "Pause" : "Play";
    player.style.padding = state.density === "compact" ? "12px" : "20px";
  }
  render();
  if (globalThis.Tweak) {
    const tweaks = new Tweak({ container: player, onChange: render });
    tweaks.addSlider(state, "radius", { label: "Corner radius", min: 0, max: 40, unit: "px" });
    tweaks.addColorPicker(state, "accent", { label: "Accent", reference: "--player-accent" });
    tweaks.addToggle(state, "playing", { label: "Playing" });
    tweaks.addSelect(state, "density", {
      label: "Density",
      options: [
        { label: "Comfortable", value: "normal" },
        { label: "Compact", value: "compact" },
      ],
    });
  }
</script>
```

- `new Tweak({ container, onChange })` creates a component group; `supported` reports support.
- `addSlider(object, property, { min, max, step = 1, unit?, label?, reference? })` binds a number. Units label it; values remain numeric.
- `addColorPicker(object, property, { label?, reference? })` binds a six-digit hex color.
- `addToggle(object, property, { label?, reference? })` binds a boolean.
- `addSelect(object, property, { options, label?, reference? })` binds a string; options may be strings or `{label,value}`.
- Up to 12 controls per group and 12 options per select. A reference is a token/property hint using letters, digits, `_ - . / : @ $ #` and no spaces.
- The bound object changes before `onChange`, including reset and temporary original preview. Keep the callback a deterministic local render; do not perform network writes or send messages there. Preserve the registered root, changing its styles or descendants.
- The host combines groups, owns the launcher/panel, reset, original preview, and explicit submit. Changes alone never send an Agent message. Call `dispose()` if permanently removing a component before page cleanup.

Only the object-binding signature is supported. Keep the component container connected; removing it disposes its registration and previews. A page may register up to 64 components and each component up to 12 controls. Registrations are acknowledged in order before their previews become active.
