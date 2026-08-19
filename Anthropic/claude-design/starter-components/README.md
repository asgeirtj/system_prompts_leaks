# Starter components

Verbatim sources for every `copy_starter_component` kind. Each lands at the project root (or the `directory` you pass) under the filename in the second column.

```
copy_starter_component({ kind: "deck_stage.js" })  →  lands as deck-stage.js (1916 lines)
```

| kind | lands as | lines |
|---|---|---|
| `deck_stage.js` | `deck-stage.js` | 1916 |
| `ios_frame.jsx` | `ios-frame.jsx` | 350 |
| `android_frame.jsx` | `android-frame.jsx` | 227 |
| `macos_window.jsx` | `macos-window.jsx` | 200 |
| `browser_window.jsx` | `browser-window.jsx` | 125 |
| `animations_v3.jsx` | `animations-v3.jsx` | 1348 |
| `tweaks_panel.jsx` | `tweaks-panel.jsx` | 542 |
| `image_slot.js` | `image-slot.js` | 644 |
| `doc_page.js` | `doc-page.js` | 454 |
| `three_d_stage.js` | `three-d-stage.js` | 435 |

Notes:
- Web components (`.js`) load with a plain `<script src>`; JSX starters load with `<script type="text/babel" src>`. In DC projects, mount web components and the deck shell through `<x-import component-from-global-scope=… from=…>`.
- `design_canvas.jsx` is **not** available in this project — present options as `<section>`-per-turn stacks (see the Options skill).
- `animations_v2.jsx` is no longer offered; `animations_v3.jsx` replaces it. Projects already built on v2 keep it, and the two engines must never be loaded in the same document (shared `window` globals).
- Calling the tool again overwrites an existing copy with the current version — the supported way to upgrade a stale starter. Copy to the SAME path the page's existing import references; overwriting discards local edits.
