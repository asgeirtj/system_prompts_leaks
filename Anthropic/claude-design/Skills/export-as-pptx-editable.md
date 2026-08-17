# Export as PPTX (editable)

Export an HTML slide deck to a `.pptx` with native PowerPoint objects (editable text, shapes, images). One `gen_pptx` tool call does everything: capture, font handling, generation, download.

## What you do

1. **Know the deck.** You probably wrote it. If not, `read_file` the HTML to find: the slide selector, how to navigate (function name? class toggle?), what fonts it uses, whether there's a scaling wrapper.
2. **`show_to_user`** the deck so it's in the user's preview.
3. **Call `gen_pptx`** with the inputs below.
4. **Read the validation flags** in the result and decide if you need to retry.

## gen_pptx inputs

```jsonc
{
  "width": 1920, "height": 1080,   // CSS px — match the deck's slide size
  "slides": [                      // one entry per slide, in order
    { "showJs": "goToSlide(0)", "selector": ".slide.active" },
    { "showJs": "goToSlide(1)", "selector": ".slide.active" }
    // For decks where all slides are in DOM at once and you don't need to navigate:
    //   { "selector": ".slide:nth-child(1)" }, { "selector": ".slide:nth-child(2)" }
  ],
  "hideSelectors": [".nav", ".progress", "[data-omelette-chrome]", "[data-noncommentable]"],
  // If the deck wraps slides in a transform:scale() container, name it here.
  // gen_pptx clears the transform AND forces width/height onto this element.
  "resetTransformSelector": ".slide-container",
  // Font handling — pick ONE strategy based on the directive at the bottom.
  // Substitution happens BEFORE capture so layout reflows correctly.
  "googleFontImports": ["Poppins", "Lora"],
  "fontSwaps": [{ "from": "BrandSans", "to": "Poppins" }],
  // Or fontSwaps: [{from:"BrandSans", to:"Arial"}] for web-safe.
  // Or omit both to keep brand fonts as-is.
  "filename": "my-deck"
}
```

If — and only if — the user asked for Google Slides, also pass `"offer_google_slides": true`: the export dialog gains a 'Send to Google Slides' button, and the upload happens only if they click it.

`slides[].showJs` runs inside the iframe as a sync expression — don't `await`. If your deck's nav function is async, call it without await; the per-slide `delay` (default 600ms) covers the transition. Bump `delay` for decks with longer CSS transitions.

### If the deck uses the `<deck-stage>` starter component

- `resetTransformSelector: "deck-stage"` — the exporter sets the `noscale` attribute on it, which the component observes and responds to by dropping its shadow-DOM `transform: scale()`. You cannot reach the scaled canvas any other way.
- `slides[N].showJs`: `"document.querySelector('deck-stage').goTo(N)"` — 0-indexed, so slide 1 is `goTo(0)`.
- `slides[N].selector`: `"deck-stage > [data-deck-active]"`.
- `hideSelectors` is unnecessary — the overlay and tap-zones live in shadow DOM and aren't captured.

## Speaker notes

Read automatically from `<script type="application/json" id="speaker-notes">` and attached by index. You don't pass them.

## Validation flags

The result lists flags. **These are warnings, not errors** — read each message and decide if it's expected for THIS deck:

- `duplicate_adjacent` / `duplicate_majority` — slides captured identically. Almost always means `showJs` didn't navigate. Check the function name, try a longer `delay`, or check if the deck uses 0-indexed vs 1-indexed slides.
- `slide_size_mismatch` — captured rect doesn't match width/height. The selector is probably matching a wrapper, or you need a `resetTransformSelector`.
- `notes_uniform_nonempty` — every speaker note is the same string. Likely a placeholder. Fine if intentional.
- `notes_count_mismatch` — #speaker-notes length ≠ slides length. Notes attach by index so the tail will be wrong.
- `no_speaker_notes` — deck has no #speaker-notes tag. Expected if there are no notes.
- `fonts_timeout` — fonts.ready took >8s. Font URLs may be unreachable.
- `font_swap_failed` — one or more `fontSwaps` targets never loaded (misspelled family, or Google Fonts doesn't serve it), so the deck was laid out with a fallback while the file names the swap font. Retry with a corrected or different family, or fall back to web-safe fonts. Whatever you do next, tell the user plainly which fonts couldn't be applied — e.g. "Heads up: Poppins couldn't be loaded during export, so the deck uses a stand-in font and text may wrap differently. Want me to try a different font?"
- `images_failed` — images didn't decode before capture. Usually a 404 or CORS.
- `reset_selector_miss` — your `resetTransformSelector` matched nothing.

If the flags look like real problems, fix the inputs and retry. If they're expected (deck genuinely has no notes, two slides really are identical), tell the user the download fired and move on.

**Talking to the user about flags:** these names and messages are internal diagnostics — do NOT relay them verbatim. If everything is expected, don't mention validation at all; just confirm the download. If something looks genuinely wrong, describe it in plain language without the flag identifier or technical specifics — e.g. "Uh oh, the speaker notes may not be exporting properly." rather than "I received the no_speaker_notes flag", or "A couple of slides may have captured identically — let me fix navigation and retry." rather than quoting `duplicate_adjacent`.

The page reloads automatically after capture — DOM mutations (hidden chrome, font swaps) are reverted.

## Font strategy

Read the directive at the end of this prompt and translate it to inputs:

| Directive | Inputs |
|---|---|
| brand fonts as-is | omit `googleFontImports` and `fontSwaps` |
| web-safe substitutes | `fontSwaps: [{from:"EachCustomFont", to:"Arial"}]` (or Georgia for serifs, Courier New for monospace) |
| Google Fonts substitutes | `googleFontImports: ["Poppins","Lora"]` + `fontSwaps: [{from:"EachCustomFont", to:"Poppins"}]` |

System fonts (Arial, Helvetica, Georgia, Times, Courier, sans-serif, etc.) — leave alone.
