# Components — Art Direction JSON Lexicon

This file defines the strict component vocabulary for the Creative pipeline.

**CRITICAL RULE: DO NOT OUTPUT HTML OR CSS.**  
You are an Art Director. You only output JSON. To use these components, insert their corresponding JSON objects into the `components` array of your page blueprint. The `design_engine.py` will automatically compile them into gallery-grade visual assets.

---

## 1. Glass_Canvas
The primary container for readable body text. Simulates printed text on frosted acrylic.

**JSON Blueprint Structure:**
```json
{
  "type": "Glass_Canvas",
  "markdown_content": "### The Divide\nYour text goes here. Supports standard Markdown.",
  "tension_score": 0.8
}
```

**Parameters:**
- `markdown_content`: (Required) The actual text. **Recommended under 150 words; absolute max 250 words.**
- `tension_score`: (Optional, 0.0 to 1.0) Semantic tension. Drives dynamic font weight (300 to 900). Use `0.1` for calm/light text, `0.9` for crisis/heavy text. Do NOT use on data-heavy pages.

---

## 2. Hero_Typography
Massive, page-dominating title text that physically interacts with the background via blend modes.

**JSON Blueprint Structure:**
```json
{
  "type": "Hero_Typography",
  "content": "THE WEIGHT<br>OF SILENCE",
  "weight": "black",
  "variant": "standard",
  "scale": 6
}
```

**Parameters:**
- `content`: (Required) The text. Use `<br>` for deliberate typographic line breaks.
- `weight`: (Required) `"black"` (900 weight, dominating) or `"thin"` (100 weight, whisper-quiet/elegant).
- `variant`: (Optional) `"standard"` (default) only. ~~`"vertical_accent"`~~ is **NOT implemented** in `design_engine.py` — the engine silently ignores this parameter. Use `Floating_Meta` component instead for rotated/vertical decorative text.
- `scale`: (Optional, integer 1–6) Typographic scale level. The engine maps this to fluid CSS `clamp()` sizes:
  - `6` → `clamp(64px, 12vw, 150px)` — Hero/Display, maximum impact
  - `5` → `clamp(48px, 8vw, 96px)` — Primary Title
  - `4` → `clamp(32px, 5vw, 56px)` — Subheadline
  - `3` → `clamp(20px, 3vw, 32px)` — Lead Paragraph
  - `2` → `16px` — Body
  - `1` → `10px` — Meta/Caption  
  If omitted, the engine uses the default hero font size from CSS.

---

## 3. Floating_Meta
Small-text metadata positioned vertically in corners, mimicking art monograph indexes.

**JSON Blueprint Structure:**
```json
{
  "type": "Floating_Meta",
  "position": "bottom-right",
  "items": [
    "CATALOG NO. 2026.031",
    "EDITION 1/500"
  ]
}
```

**Parameters:**
- `position`: (Required) `"top-left"`, `"top-right"`, `"bottom-left"`, or `"bottom-right"`.
- `items`: (Required) Array of short strings (dates, edition numbers, refs).

---

## 4. Stat_Block
Data sculpture. Transforms boring numbers into massive visual objects.

**JSON Blueprint Structure:**
```json
{
  "type": "Stat_Block",
  "number": "97.3",
  "unit": "%",
  "label": "COMPLETION RATE"
}
```

**Parameters:**
- `number`: The core massive digit.
- `unit`: Tiny unit attached to the number.
- `label`: Metadata label below the number.

---

## 5. Hairline_Divider
Ultra-thin separator lines. Structural, like fold lines in print.

**JSON Blueprint Structure:**
```json
{
  "type": "Hairline_Divider",
  "style": "accent"
}
```

**Parameters:**
- `style`: `"bleed"` (full width edge-to-edge) or `"accent"` (short centered 30% line).

---

## 6. Page_Ghost_Number
Giant, 4% opacity watermark numbers that become part of the page's atmosphere.

**JSON Blueprint Structure:**
```json
{
  "type": "Page_Ghost_Number",
  "number": "03"
}
```

---

## 7. Shaped_Canvas (Advanced Semantic Shape-Wrapping)
A container where text flows around a non-rectangular shape. The empty space created by the shape IS the visual design.

**JSON Blueprint Structure:**
```json
{
  "type": "Shaped_Canvas",
  "shape_keyword": "wave",
  "markdown_content": "The ocean stretched endlessly... (recommended under 150 words, absolute max 250)"
}
```

**Parameters & Shape Presets:**
- `shape_keyword`: MUST be one of the following:
  - `"circle"`: Unity, spotlight, focus.
  - `"wave"`: Ocean, flow, fluidity.
  - `"diagonal_slash"`: Disruption, change, energy.
  - `"diamond"`: Luxury, precision, crystalline.
  - `"wedge_right"`: Direction, progress, forward motion.
- `markdown_content`: Text to wrap around the shape.

**CRITICAL Layout Constraint:**  
If a page contains a `Shaped_Canvas`, that page's `archetype` MUST be set to `"shaped_editorial"` in the JSON. Never mix `Shaped_Canvas` and `Glass_Canvas` on the same page.

---

## Blueprint Assembly Guidelines

When constructing the JSON `pages` array, keep these layering and composition rules in mind:

1. **Backgrounds**: Do NOT try to place background SVGs as components. Backgrounds are declared globally in the `art_direction.background_svg` field (`"flow"`, `"grid"`, `"noise"`, or `"continuous_flow"`).
2. **Layering**: The order of objects in the `components` array roughly dictates their top-to-bottom rendering.
3. **Breathing Room**: Less is more. A page with just one `Hero_Typography` and one `Floating_Meta` is highly sophisticated. Cramming 5 components on a page communicates desperation.