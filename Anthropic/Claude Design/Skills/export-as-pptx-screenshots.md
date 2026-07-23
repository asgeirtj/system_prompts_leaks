# Export as PPTX (screenshots)

Export an HTML slide deck to a `.pptx` as full-bleed PNG images. Pixel-perfect, not editable. One `gen_pptx` tool call.

## Steps

1. `show_to_user` the deck.
2. Call `gen_pptx`:

```jsonc
{
  "mode": "screenshots",
  "width": 1920, "height": 1080,
  "slides": [
    { "showJs": "goToSlide(0)", "selector": "body" },  // selector unused in screenshot mode but required
    { "showJs": "goToSlide(1)", "selector": "body" }
  ],
  "hideSelectors": [".nav", ".progress"],
  // If the deck wraps slides in a transform:scale() container, name it here so
  // the deck is forced to width × height inside the locked iframe.
  "resetTransformSelector": ".slide-container",
  "filename": "my-deck"
}
```

If — and only if — the user asked for Google Slides, also pass `"offer_google_slides": true`: the export dialog gains a 'Send to Google Slides' button, and the upload happens only if they click it.

`slides[].delay` defaults to 600ms — bump if transitions are slower.

### If the deck uses the `<deck-stage>` starter component

- `resetTransformSelector: "deck-stage"` — same as editable mode; the component drops its shadow-DOM `transform: scale()` so the slides fill the locked iframe.
- `slides[N].showJs`: `"document.querySelector('deck-stage').goTo(N)"` — 0-indexed, so slide 1 is `goTo(0)`.
- `hideSelectors` is unnecessary — the overlay and tap-zones live in shadow DOM and aren't captured.

## Validation

Same flags as editable mode. Watch for `duplicate_adjacent` (showJs didn't navigate) and `reset_selector_miss` / `slide_size_mismatch` (your `resetTransformSelector` matched nothing or didn't size to width × height).

Speaker notes from `#speaker-notes` are attached automatically. Page reloads after.
