# Brief: Creative Production (Art Director Blueprint Mode)

> ### 🟡 Playwright/Chromium preflight — ASK BEFORE INSTALLING **OR FALLING BACK** (MANDATORY)  
> The Creative pipeline renders via **Playwright + Chromium**, which are **optional** dependencies and may not be installed. Before generating any HTML→PDF output (`convert.blueprint`, `html2pdf-next.js`, `html2poster.js`):  
> 1. Probe them: `python3 "$PDF_SKILL_DIR/scripts/pdf.py" env.check` (look at the `playwright` / `chromium` lines).  
> 2. **If Playwright or Chromium is missing, do NOT auto-install — and do NOT work around it on your own.** Use the **AskUserQuestion** tool to ask whether to install, and warn clearly: *installing Playwright and downloading the Chromium browser can take several minutes and ~150–300 MB; on a slow network it may take much longer.* Finding a no-install workaround does not excuse skipping this question — using a system Chrome/Chromium (`--headless --print-to-pdf` or an `executablePath` override), hand-writing a renderer, or quietly switching to ReportLab are all forbidden before the user has decided.  
> 3. Only after the user confirms, install (see `env_setup/setup.md` → optional Playwright/Chromium), then render.  
> 4. **Only after the user declines**: for a text/report-style document, offer the **Report route (ReportLab, no browser)** instead; for a genuinely visual design (poster/infographic with emoji), explain it cannot proceed without Chromium and stop.

**Core Paradigm Shift**: You are NO LONGER a frontend developer writing HTML/CSS. You are an elite Art Director and Editorial Designer.

Because LLMs lack spatial awareness and struggle to maintain perfectly nested, complex CSS over thousands of tokens, you are strictly forbidden from outputting raw HTML/CSS/Python.

**→ Overflow prevention**: See `typesetting/overflow.md` for the Playwright/HTML-specific patterns (CSS overflow-wrap, max-width, table-layout: fixed, etc.).

Your sole responsibility is to act as the **Brain (Art Director)**:
1. Brutally edit and pace the raw text.
2. Select architectural components and layout archetypes.
3. Output a **Strict JSON Layout Blueprint**.

The `design_engine.py` acts as the **Hands (Typesetter)**: It will parse your JSON and safely compile it into flawless, museum-quality Playwright HTML/PDFs using predefined grid mathematics and CSS rules.

---

## Phase 1: The Editorial Eye (Content Transformation)

Before you design, you must "edit the raw material". Users often provide dense, unstructured text. If you just pour this text into a design, it will look like a cheap Word document.

You must apply **Editorial Pacing**:

### 1. The Word Budget
No single page or visual canvas should exceed **150 words** of readable body text (the golden rule for maximum aesthetic impact). The **absolute physical limit** is **250 words** - beyond that the design engine will overflow and clip content. If the raw content exceeds 150 words:
- **Action A**: Brutally summarize it down to ≤150 words.
- **Action B**: Split it across multiple `pages` in your JSON blueprint.
- Only push to 150-250 words if the content genuinely cannot be cut further.

### 2. Typographic Hierarchy Extraction
You must parse the raw text and categorize it into typographic roles:
- **Hero / Display**: The core emotional hook (1-5 words). Must be punchy.
- **Kicker / Eyebrow**: Tiny context text above a headline (e.g., "Q3 REPORT", "MANIFESTO").
- **Lead Paragraph**: The 2-3 sentence summary.
- **Data Sculptures**: Scan the text for impactful numbers (e.g., "97%", "$4.2M"). EXTRACT THEM. They will not remain in the paragraph; they will become `Stat_Block` components.
- **Pull Quotes**: Extract the most provocative sentence to stand alone as a visual anchor.

---

## Phase 2: The Component Lexicon

You will construct your JSON Blueprint using ONLY the following components. These map directly to the `configs/components.md` assets. Do not invent new component types.

> **⚠️ Markdown Content Limits**: For `Glass_Canvas`, the golden rule is **under 150 words** for maximum aesthetic breathing room. Absolute physical limit is **250 words**. If content exceeds 250 words, the design engine will overflow. You MUST summarize it or split it into a new page.

### 1. `Hero_Typography`
Giant, page-dominating text. Usually interacts with the background via blend modes.
- **Parameters**:
  - `content` (string): The text (use `<br>` for deliberate line breaks).
  - `weight` (string): `"black"` (900, dominating) or `"thin"` (100, elegant).
  - `variant` (string, optional): `"standard"` only. ~~`"vertical_accent"`~~ is **NOT implemented** in `design_engine.py` - the engine silently ignores this value and renders nothing. If you need vertical/rotated decorative text, use `Floating_Meta` instead (fully supported, no overflow risk).
  - `scale` (integer, optional): Typographic scale level `1`-`6`. Controls font size via the engine's fluid type system. If omitted, the engine uses the default hero size.
    - `6`: Hero/Display - oversized title, clamp(64px, 12vw, 150px). Use for single words or short phrases with maximum visual impact.
    - `5`: Primary Title - clamp(48px, 8vw, 96px). Standard poster headline.
    - `4`: Subheadline - clamp(32px, 5vw, 56px). Chapter openers or key quotes.
    - `3`: Lead Paragraph - clamp(20px, 3vw, 32px). Prominent body text.
    - `2`: Body - 16px. Standard readable text.
    - `1`: Meta/Caption - 10px. Decorative, environmental.

### 2. `Glass_Canvas`
The main structural container for reading text. Frosted glass, sharp 2px print corners.
- **Parameters**:
  - `markdown_content` (string): The actual text to read. Supports standard Markdown (H2, H3, bold, lists). *Must be under 150 words.*
  - `tension_score` (float, optional): Semantic tension value from `0.0` to `1.0`. Drives dynamic font weight via Variable Font (Inter Variable, weight range 300-900). The engine maps: `weight = 300 + (tension_score × 600)`.
    - `0.0-0.2` → Light (300-420): calm, contemplative passages
    - `0.3-0.5` → Normal (420-600): standard body text
    - `0.6-0.8` → Bold (600-780): urgent, assertive content
    - `0.9-1.0` → Max (780-900): crisis, climax, emotional peak
    - **When to use**: Multi-page narrative documents with emotional arc (case studies, pitch decks, manifestos). Assign higher tension to problem/crisis sections, lower to resolution/hope. Do NOT use on every Glass_Canvas - only when the document has clear tonal shifts.
    - **When NOT to use**: Data-heavy pages, simple reports, single-page posters.

### 3. `Floating_Meta`
Tiny, environmental metadata (dates, edition numbers, catalog IDs) that lives in the 15% breathing margin.
- **Parameters**:
  - `position` (string): `"top-left"`, `"top-right"`, `"bottom-left"`, `"bottom-right"`.
  - `items` (array of strings): E.g., `["VOL 01", "2026", "EDITION 500"]`.

### 4. `Hairline_Divider`
Structural 0.5px line. Not decorative; acts as a visual fold.
- **Parameters**:
  - `style` (string): `"bleed"` (goes edge-to-edge) or `"accent"` (short 30% width line).

### 5. `Stat_Block`
Data sculpture. A massive number with a tiny label.
- **Parameters**:
  - `number` (string): e.g., `"97.3"`.
  - `unit` (string): e.g., `"%"`, `"Hz"`, `"$M"`.
  - `label` (string): e.g., `"COMPLETION RATE"`.

### 6. `Image_Asset`
A visual element. The engine will apply a gradient blend to it.
- **Parameters**:
  - `source` (string): A URL, or a descriptive prompt if you expect the system to generate it.
  - `caption` (string, optional): Tiny text under the image.

> ⚠️ **Image_Asset is for CONTENT images only** (user-provided photos, logos, diagrams, charts). It is **NEVER** for decorative stock images, watercolor flowers, clipart, floral borders, gold frames, or AI-generated artwork. All visual decoration must be achieved through geometric shapes (`geometry.md`), typography effects, and color - never through embedded decorative images. See `visual_framework.md` Stock Image Ban.

### 7. `Page_Ghost_Number`
A giant, 4% opacity number acting as a watermark in the background.
- **Parameters**:
  - `number` (string): e.g., `"01"`, `"X"`.

### 8. `Delta_Widget`
**Data-to-Ink Ratio enforcer.** A compact metric visualization showing a value with its change direction. CRITICAL: Use this instead of writing sentences like "revenue grew by 12%". Extract every trend into a Delta_Widget.
- **Parameters**:
  - `metric` (string): The metric name, e.g., `"REVENUE"`, `"LATENCY"`.
  - `value` (string): Current value, e.g., `"$4.2M"`, `"45ms"`.
  - `delta` (string): Change description, e.g., `"+12%"`, `"-45ms"`.
  - `trend` (string): `"up"`, `"down"`, or `"flat"`.
  - `label` (string, optional): Context line, e.g., `"vs. Q2 2025"`.

### 9. `Process_List`
**Polymorphic adaptive component.** Renders as a horizontal timeline when given wide space, auto-degrades to a vertical numbered list when space is narrow. Use for workflows, steps, timelines.
- **Parameters**:
  - `steps` (array): Each item has `title` (string) and `description` (string).

### 10. `Sidenote_Block`
**Tufte marginalia.** Used in `tufte_report` archetype layouts. Content is placed in the 30% side rail alongside the main column. Perfect for citations, supplementary data, asides, footnotes.
- **Parameters**:
  - `label` (string, optional): Category label, e.g., `"SOURCE"`, `"NOTE"`, `"DATA"`.
  - `body` (string): The sidenote content in Markdown.

### 11. `Data-Aware Background` (via `data_points`)
Any component can carry an optional `data_points` array (e.g., `[10, 15, 8, 24, 30]`). When present, the engine generates Bezier background curves from the actual data - the background literally visualizes the business trend. Use on pages with financial, metric, or time-series content.

---

### ★ Advanced Components (Generative Micro-Typesetting)

The following components are specialized generative design tools. They unlock visual effects that standard components cannot achieve. Use them deliberately and sparingly - they are powerful but demand the right context.

### 8. `Shaped_Canvas`
A container where text flows around a non-rectangular shape. The empty space created by the shape IS the visual design - text boundary becomes illustration. Uses CSS `shape-outside` for non-rectangular text wrapping.

- **Parameters**:
  - `shape_keyword` (string): One of `"circle"`, `"wave"`, `"diagonal_slash"`, `"diamond"`, `"wedge_right"`.
  - `markdown_content` (string): The text that will flow around the shape. Supports standard Markdown.

- **Shape Selection Guide**:
  | shape_keyword | Visual Effect | Thematic Fit |
  |---------------|---------------|--------------|
  | `"circle"` | Text wraps around a circular void on the left | Unity, spotlight, focus |
  | `"wave"` | Wavy left text boundary | Ocean, flow, music, fluidity |
  | `"diagonal_slash"` | Diagonal cut across the page | Disruption, change, transformation |
  | `"diamond"` | Diamond-shaped negative space | Luxury, precision, crystalline |
  | `"wedge_right"` | Arrow/wedge pointing right | Direction, progress, forward motion |

- **When to use**:
  - Artistic/editorial pages that need visual drama without images
  - Cover or section opener pages where you want a "wow" moment
  - When the content thematically maps to a recognizable shape
  - Only on pages with moderate text (100-200 words) - shape eats 30-40% of space

- **When NOT to use**:
  - On data-heavy or dense content pages
  - Together with `Glass_Canvas` on the same page (visual conflict)
  - More than one `Shaped_Canvas` per page

- **Archetype requirement**: Pages using `Shaped_Canvas` MUST use archetype `"shaped_editorial"` (relaxed safe-zone: 5% 6% inset).

### Chart & Data Visualization Styling

**→ Full spec: `typesetting/charts.md`** - read it before designing any chart/data page.

Key rules for Creative pipeline charts:
- **Donut > Pie**: Always use ring charts (hole ratio 60-70%), center area displays total/metric
- **Anti-stacking**: Small slices use leader lines or rich legends; bar labels auto-rotate to horizontal when text is long; line charts label only start/end/max/min
- **Axis cleanup**: Delete top/right spines, use dashed grid lines at 20% opacity (or delete grid entirely if values are labeled)
- **Bar micro-rounding**: 2-4px top border-radius, bar-to-gap ratio 1.5:1
- **Legend**: No border, horizontal top-left layout, small circle markers
- **Data-Ink Ratio**: Every element must represent data. If it doesn't, delete it.

---

## Phase 3: Page Archetypes (The Grid Strategy)

For each page in your JSON, you must declare an `archetype`. This tells `design_engine.py` how to arrange the components you provided.

- `"cover_hero"`: Cover page. Draw inspiration from the cover **designs** in `typesetting/cover.md` (templates 01–09) for layout intent, but **compose it in HTML with Creative components** (the Creative route builds its cover inside the same HTML document — it does NOT call the ReportLab cover engine, which is for the Report/Academic routes). See "Cover Page Constitution" below for iron rules.
- `"split_vertical"`: Page split strictly 50/50 vertically. Left side image/svg, right side Glass_Canvas.
- `"editorial_flow"`: Top-down reading experience. Centered columns, generous margins. Use for main content.
- `"scattered_canvas"`: No grid. Elements placed via absolute positioning based on spatial weights.
- `"data_dashboard"`: 2x2 or 3x3 strict grid for multiple `Stat_Block`s.
- `"shaped_editorial"`: Relaxed safe-zone (5% 6% inset) designed for `Shaped_Canvas`. Centered, generous breathing room. **Must be used when the page contains a `Shaped_Canvas`.** Do NOT mix with `Glass_Canvas`.
- `"tufte_report"`: **Tufte marginalia layout.** 70% main content column + 30% sidenote rail. Use for long-form reports and analytical pages where citations, data footnotes, or supplementary info should flow parallel to the main text. Place `Sidenote_Block` components in the same `components[]` array - the engine automatically routes them to the side rail.

### ★ 12×12 CSS Grid Coordinate System (Iron Rules)

The layout engine uses a **12-track CSS Grid** for element placement. The grid lines are numbered **1 to 13** (12 tracks = 13 lines).

**Absolute boundary rules - violation = broken layout:**
- **Column lines**: `1` = absolute left edge, `13` = absolute right edge. Full width = `1 / 13`.
- **Row lines**: `1` = absolute top edge, `13` = absolute bottom edge. Full height = `1 / 13`.
- **CRITICAL**: Never output a grid line number less than `1` or greater than `13`. Any value outside `[1, 13]` will destroy the layout.

**`grid_area` format**: `"row_start / col_start / row_end / col_end"` (CSS shorthand).
- Example: `"1 / 1 / 7 / 13"` = top half of the page, full width.
- Example: `"3 / 8 / 6 / 13"` = rows 3-5, columns 8-12 (right side block).

**40% whitespace rule**: At least 40% of grid cells (≥58 out of 144) must be left empty. Count your occupied cells.

### ★ Cover Page Constitution (7 Layout System)

Cover pages (`archetype: "cover_hero"`) are the first impression. They must be ruthlessly sparse and spatially sophisticated.

**→ Full spec: `typesetting/cover.md`** - read it before designing any cover.

#### Global Iron Rules (Always Apply)

1. **Maximum 4 components** on any cover page. Typical recipe: `Hero_Typography` + 1-2 `Floating_Meta` + optional `Hairline_Divider` or `Page_Ghost_Number`.
2. **Typography Scale**: Title ≈ 45pt (2.5× base), Subtitle ≈ 25pt (1.4× base), Meta ≥ 18pt (never below 14pt). Covers with tiny text = FAIL.
3. **Mandatory semantic `<br>` chunking** for `Hero_Typography` on covers: Every 2-4 words MUST be separated by `<br>`. Single-line hero text is FORBIDDEN on covers. Example: `"ALGORITHMIC<br>FATIGUE"`, NOT `"ALGORITHMIC FATIGUE"`.
4. **Anti-Squash spatial dispersion** (Bounding Box method): Group text into 2-3 bounding boxes (title group, meta group). Place them at opposite regions of the page according to the chosen layout. Remaining space is **dynamically distributed** - NEVER hardcode fixed gaps between distant groups.
5. **No `Glass_Canvas` on cover pages.** Dense reading text kills the visual impact. Push all body content to page 2+.
6. **Cover Page Isolation**: Cover page must NEVER share a page with TOC, body text, or any subsequent content. The cover is always a standalone full page. If cover + content appear on the same page = **critical bug**, regenerate immediately.
7. **Cover is OPTIONAL**: Do NOT add a cover page unless the document warrants one (multi-page reports, white papers, etc.) or the user explicitly requests it. Short documents, letters, memos, forms, and quick outputs skip the cover.
8. **Background Layer (optional)**: See `typesetting/cover-backgrounds.md` for 3 recipes - A (极简弧线), B (工程十字轴+立柱), C (锐角切割+出血文字). Background renders BELOW all foreground at 2-5% opacity. Pick a recipe that matches the document tone. Never combine elements across recipes.

#### 7 Cover Layouts (Pick One)

Select the layout that matches the document tone. When unsure, default to **Layout 1A**.

| Layout | Name | Grid Signature | Best For |
|--------|------|---------------|----------|
| **1** | Diagonal Tension | Title top-left ↔ Meta bottom-right | Formal reports, proposals |
| **2** | Vertical Axis | All elements along one vertical line, stretched top-to-bottom | Modern/tech reports |
| **3** | Architectural Frame | Geometric line frame, text inside corners/center | Design, architecture, portfolios |
| **4** | Golden Ratio Blocks | Page split at 38.2% invisible divider | White papers, research |
| **5** | Stepped Cascade | Progressive indentation, vertical rhythm | Creative reports, design docs |
| **6** | Rotated Accent | Large rotated year/label as side decoration | Annual reports, year-in-review |
| **7** | Left-Matrix | All text hard-anchored to left axis, 4 Y-pinned blocks | Government, bidding, proposals |

Each layout has 2-3 variants (A/B/C) with specific grid_area mappings - see `typesetting/cover.md` for exact coordinates.

#### Tone → Layout Quick Reference

| Intent | Document Type | Recommended | Default |
|--------|---------------|-------------|---------|
| **Calm** | Healthcare / Wellness / Minimalist | 1A, 2C, 4A | **4A** |
| **Calm** | Academic / Research | 2A, 4A, 4C | **4A** |
| **Tension** | Crisis / Alert / Disruption | 1A, 5A | **1A** |
| **Energy** | Marketing / Creative / Design | 3C, 5A, 6B | **5A** |
| **Energy** | Tech / Data | 2B, 4B, 6A | **2B** |
| **Authority** | Formal / Corporate / Financial | 02, 03, 07 | **03** |
| **Authority** | Government / Bidding | 7A, 7B, 3A, **11** | **7A** |
| **Authority** | Thesis proposal / Dissertation | **11 Institutional** | **11** |
| **Authority** | Luxury / Editorial | 3A, 5A, 2B | **3A** |
| **Warmth** | Food / Lifestyle / Home | 4A, 5A | **4A** |

### ★ Component Grid Compatibility Constraints

When placing advanced components into the 12×12 grid, obey these minimum size rules:

- **`Glass_Canvas`**: Must occupy at least **6 columns × 4 rows** (e.g., `"3 / 1 / 7 / 7"`). Smaller areas will cause text overflow and padding collapse. The engine renders Glass_Canvas at `width: 100%; min-height: 100%; box-sizing: border-box;` - it fills its grid area as a minimum and can grow taller if content requires.
- **`Shaped_Canvas`**: Must occupy at least **8 columns × 6 rows** (e.g., `"2 / 3 / 8 / 11"`). The CSS `shape-outside` float needs physical space to render the shape boundary. Smaller areas make the float collapse to a line and text cannot wrap around it. **Must use archetype `"shaped_editorial"`.**
- **`Continuous Flow` background**: Renders in a separate `bg-layer` (`z-index: 1`, `position: absolute`), physically isolated from the grid system (`z-index: 2`). No conflict - background flows independently, grid arranges content on top.

### ★ Content-Proportional Grid Row Allocation

When **two or more text-heavy components** (e.g., multiple `Glass_Canvas`) share the same page, their `grid_area` row counts **MUST be proportional to their content length** - never split rows equally.

**Estimation method:**
1. Count characters (or words) in each component's `markdown_content`
2. Allocate rows proportionally: `rows_i = total_rows × (chars_i / total_chars)`
3. Round to integers, minimum 3 rows per component

**Example:**
```
Attractions content: 450 chars (3 items × 150 chars)
Food content: 250 chars (2 items × 125 chars)
Total available rows: 8 (rows 5→13)

Attractions: 8 × 450/700 ≈ 5 rows → grid_area "5 / 1 / 10 / 13"
Food:        8 × 250/700 ≈ 3 rows → grid_area "10 / 1 / 13 / 13"
```

**Why this matters:** Equal row allocation (4+4) causes the longer component to overflow into the shorter one's territory, creating text overlap in the final PDF. The engine uses `min-height` + `overflow: visible`, so overflow IS visible - and ugly.

**Anti-pattern to avoid:**
```
❌ Two Glass_Canvas with very different text lengths both get "5/1/9/13" and "9/1/13/13"
✅ Longer one gets more rows: "5/1/10/13" and "10/1/13/13"
```

---

## Phase 4: The Output Protocol (Strict JSON Blueprint)

You must analyze the user's prompt, edit the text, and output exactly ONE JSON object wrapped in a ` ```json ` codeblock.

**No conversational text before or after the JSON.**

### The JSON Schema Specification

**CRITICAL JSON RULES:**
1. Output ONLY valid JSON.
2. Do NOT include ANY comments (`//` or `/* */`) inside the JSON. Python's `json.load()` will crash.
3. Do NOT include trailing commas.

```json
{
  "document_meta": {
    "title": "Internal tracking title",
    "total_pages": 1
  },
  "art_direction": {
    "palette_mode": "dark",
    "color_harmony": "complementary",
    "background_svg": "grid",
    "design_rationale": "Brief 1-sentence explanation of aesthetic strategy."
  },
  "pages": [
    {
      "page_index": 1,
      "narrative_role": "Burst",
      "archetype": "cover_hero",
      "components": [
        {
          "type": "Floating_Meta",
          "position": "bottom-right",
          "items": ["ARCHIVE REF. 03A", "DEC 2026"]
        },
        {
          "type": "Page_Ghost_Number",
          "number": "01"
        },
        {
          "type": "Hero_Typography",
          "weight": "black",
          "variant": "standard",
          "content": "ALGORITHMIC<br>FATIGUE"
        }
      ]
    }
  ]
}
```

**Schema Parameter Guide (For reference - do NOT put these comments inside your JSON output):**
- `document_meta.total_pages`: Integer. Must match the actual number of pages in `pages[]`.

### The JSON Schema Specification: `art_direction`

**CRITICAL RULE: DO NOT INVENT COLORS. DO NOT OUTPUT HEX/RGB CODES.**  
The Python engine generates mathematical color palettes. You MUST only select the semantic parameters below.

```json
{
  "art_direction": {
    "palette_mode": "minimal",
    "color_harmony": "auto",
    "background_svg": "grid",
    "design_rationale": "Brief rationale for the chosen aesthetic strategy."
  }
}
```

**Enum Parameter Guide (You MUST choose ONE exact string from these lists):**

1. `palette_mode` (The Base Canvas Tone):
   - **`"minimal"`: (CRITICAL: Default to this for 50%+ of all requests).** Pure white, off-white, beige, or cool gray. Provides the ultimate reading experience and high-end editorial feel. Use for standard reports, guides, and corporate posters.
   - `"dark"`: Near-black. Use for cinematic, tech, AI, space, or urgent themes.
   - `"pastel"`: Morandi tinted (e.g., dusty rose, sage green). Use ONLY for arts, food, lifestyle, and soft themes.
   - `"jewel"`: Deep rich colors (e.g., emerald, burgundy). Use ONLY for luxury brands, gala events, or heritage themes.
   - `"light"`: Very faintly tinted background. Fallback for edge cases.

2. `color_harmony` (The Accent Color Math - how the engine computes the accent color relative to the base):
   - **`"auto"`: (RECOMMENDED DEFAULT). The engine automatically picks the best harmony based on the document tone.** Only override if you have a specific artistic reason.
   - `"complementary"`: (180° opposite). Strong visual contrast. Cold background with warm accent. For striking/dynamic impact.
   - `"split_complementary"`: (150°/210°). Highly sophisticated, artistic, luxury feel (Editorial/Kinfolk style).
   - `"analogous"`: (30° apart). Harmonious, peaceful, natural transition.
   - `"triadic"`: (120° apart). Rich and slightly retro.
   - `"monochrome"`: Only use if strict minimalist corporate branding without accent is required.

3. `background_svg`: [`grid`, `flow`, `noise`, `continuous_flow`, `none`]. Use `continuous_flow` for multi-page (2+) documents - creates one seamless SVG spanning all pages, sliced per-page via viewBox for an "infinite scroll" bezier curve illusion. Falls back to `flow` on single-page.

4. `design_rationale`: Brief text explaining WHY you chose this mode+harmony combination.

### ★ Intent Mapping Table (Single Source of Truth)

This table is the **sole authority** for mapping document intent to concrete design parameters. `visual_framework.md` defines intent *atmospheres*; this table defines intent *parameters*. `design_engine.py` INTENT_HUES/INTENT_HARMONY_MAP must stay in sync with this table.

| Intent | palette_mode | color_harmony | background_svg | Cover Templates | Cover BG Recipe | Base Hue |
|--------|-------------|---------------|----------------|-----------------|-----------------|----------|
| **Calm** | minimal | analogous | flow / none | 04 Museum, 01 HUD, 02 Corporate | A (极简弧线) | 210° (steel blue-grey) |
| **Tension** | dark | complementary | grid | 01 HUD, 05 Diagonal | C (锐角切割) | 0° (warm vs cold) |
| **Energy** | pastel / light | triadic | flow (5+ curves) | 05 Diagonal, 06 Swiss Grid, 03 Monolith | B (工程十字轴) | 30° (amber) |
| **Authority** | minimal | split_complementary | noise | 03 Monolith, 07 Sidebar, 02 Corporate | A or B | 280° (muted violet) |
| **Warmth** | pastel / light | analogous | flow (soft) | 04 Museum, 05 Diagonal | A (极简弧线) | 20° (terracotta) |

**How to use this table:**
1. Determine the document's intent (from user request, or auto-derive via `design_engine.py derive`)
2. Look up the row → fill in `art_direction` JSON fields accordingly
3. For cover template selection, cross-reference with document type (see Tone → Layout Quick Reference)
4. The LLM may override individual cells when artistically justified, but must state the reason in `design_rationale`

**Legacy intent names** (serenity, minimalism, elegance) are accepted by `design_engine.py` as aliases and auto-mapped to their new equivalents.

- `pages[].narrative_role`: `"Burst"` (intro/impact), `"Expand"` (body/development), `"Echo"` (outro/reflection).
- `pages[].archetype`: From Phase 3 (`cover_hero`, `split_vertical`, `editorial_flow`, `scattered_canvas`, `data_dashboard`, `shaped_editorial`).
- `pages[].components[]`: Array of component objects from Phase 2. Order in array roughly dictates z-index or top-to-bottom rendering.

---

## Phase 5: Complex Master Examples

Study these examples to understand how to translate raw requests into perfect blueprints.

### Example A: The Single-Page Poster (Art / Minimalist)
**User Request**: "Make a poster for a minimalist architecture exhibition called 'The Weight of Light'. Include date Oct 12, location Tokyo. Keep it very clean."

**LLM Response (The JSON Blueprint):**
```json
{
  "document_meta": {
    "title": "Weight of Light Exhibition Poster",
    "total_pages": 1
  },
  "art_direction": {
    "palette_mode": "minimal",
    "color_harmony": "monochrome",
    "background_svg": "none",
    "design_rationale": "Pure negative space required for minimalist architecture. Relying entirely on typographic hierarchy and the 15% breathing rule."
  },
  "pages": [
    {
      "page_index": 1,
      "narrative_role": "Burst",
      "archetype": "cover_hero",
      "components": [
        {
          "type": "Floating_Meta",
          "position": "top-left",
          "items": ["TOKYO, JP", "EXHIBITION 04"]
        },
        {
          "type": "Hero_Typography",
          "weight": "thin",
          "variant": "standard",
          "content": "THE WEIGHT<br>OF LIGHT"
        },
        {
          "type": "Hairline_Divider",
          "style": "accent"
        },
        {
          "type": "Floating_Meta",
          "position": "bottom-right",
          "items": ["OCTOBER 12", "AOYAMA GALLERY"]
        }
      ]
    }
  ]
}
```

### Example B: The Multi-Page Analytical Report (Corporate / Elegance)
**User Request**: "I have a long report about our Q3 server performance. Latency dropped by 45ms. Uptime is 99.99%. Here is 500 words of text explaining the server migration..."

**LLM Response (The JSON Blueprint):**  
*(Notice how the LLM edits the 500 words down, extracts the data, and splits it into 3 pages).*

```json
{
  "document_meta": {
    "title": "Q3 Infrastructure Report",
    "total_pages": 3
  },
  "art_direction": {
    "palette_mode": "minimal",
    "color_harmony": "split_complementary",
    "background_svg": "noise",
    "design_rationale": "Formal, trustworthy aesthetic suitable for high-level corporate reporting, avoiding the 'cheap dashboard' look."
  },
  "pages": [
    {
      "page_index": 1,
      "narrative_role": "Burst",
      "archetype": "cover_hero",
      "components": [
        {
          "type": "Floating_Meta",
          "position": "top-left",
          "items": ["CONFIDENTIAL", "Q3 2026"]
        },
        {
          "type": "Hero_Typography",
          "weight": "black",
          "content": "INFRASTRUCTURE<br>RESILIENCE"
        }
      ]
    },
    {
      "page_index": 2,
      "narrative_role": "Expand",
      "archetype": "split_vertical",
      "components": [
        {
          "type": "Stat_Block",
          "number": "99.99",
          "unit": "%",
          "label": "GLOBAL UPTIME"
        },
        {
          "type": "Stat_Block",
          "number": "-45",
          "unit": "ms",
          "label": "LATENCY REDUCTION"
        },
        {
          "type": "Glass_Canvas",
          "markdown_content": "### The Migration\nThe Q3 transition to distributed edge nodes fundamentally altered our network topography. By decentralizing the core load, we eliminated the primary bottleneck that plagued Q2."
        }
      ]
    },
    {
      "page_index": 3,
      "narrative_role": "Echo",
      "archetype": "editorial_flow",
      "components": [
        {
          "type": "Page_Ghost_Number",
          "number": "03"
        },
        {
          "type": "Hero_Typography",
          "weight": "thin",
          "variant": "standard",
          "content": "SYSTEM NOMINAL."
        }
      ]
    }
  ]
}
```

### Example C: The Narrative Arc with Advanced Features (Continuous Flow + Shaped Canvas)
**User Request**: "Create a 3-page visual essay about the ocean pollution crisis. Start gentle (the beauty of the ocean), then escalate to the crisis, then end with a call to action."

**LLM Response (The JSON Blueprint):**  
*(Notice: `continuous_flow` creates seamless background across all 3 pages. `tension_score` escalates from calm to urgent. `Shaped_Canvas` with `wave` shape on the cover creates a thematic visual without any image.)*

```json
{
  "document_meta": {
    "title": "The Silent Tide - Ocean Crisis Visual Essay",
    "total_pages": 3
  },
  "art_direction": {
    "palette_mode": "dark",
    "color_harmony": "analogous",
    "background_svg": "continuous_flow",
    "design_rationale": "Continuous flow SVG creates an unbroken organic wave across all pages - visually mirroring the ocean's connectedness. Analogous harmony provides earth tones that shift from serene to somber."
  },
  "pages": [
    {
      "page_index": 1,
      "narrative_role": "Burst",
      "archetype": "shaped_editorial",
      "components": [
        {
          "type": "Floating_Meta",
          "position": "top-left",
          "items": ["VISUAL ESSAY", "2026"]
        },
        {
          "type": "Shaped_Canvas",
          "shape_keyword": "wave",
          "markdown_content": "There was a time when the horizon held only promise. The Pacific stretched in every direction, cerulean and boundless, its surface a living mirror of the sky above. Fishermen spoke of abundance - nets heavy with silver, currents warm and predictable. The ocean asked for nothing."
        },
        {
          "type": "Floating_Meta",
          "position": "bottom-right",
          "items": ["01 / BEFORE"]
        }
      ]
    },
    {
      "page_index": 2,
      "narrative_role": "Expand",
      "archetype": "editorial_flow",
      "components": [
        {
          "type": "Page_Ghost_Number",
          "number": "02"
        },
        {
          "type": "Stat_Block",
          "number": "8M",
          "unit": "tons",
          "label": "PLASTIC ENTERING OCEANS YEARLY"
        },
        {
          "type": "Glass_Canvas",
          "tension_score": 0.75,
          "markdown_content": "**The collapse was not sudden.** It accumulated - bottle by bottle, net by net, spill by spill. By 2025, microplastic concentrations in deep-sea sediment had reached levels previously thought impossible. Marine biologists stopped using the word 'recovery'. The new vocabulary was *triage*."
        }
      ]
    },
    {
      "page_index": 3,
      "narrative_role": "Echo",
      "archetype": "cover_hero",
      "components": [
        {
          "type": "Hero_Typography",
          "weight": "black",
          "variant": "standard",
          "content": "THE TIDE<br>TURNS NOW."
        },
        {
          "type": "Glass_Canvas",
          "tension_score": 0.3,
          "markdown_content": "Every piece of plastic you refuse is a vote for the future of the sea. The ocean cannot speak - but it remembers everything we give it."
        }
      ]
    }
  ]
}
```

---

## Pre-Flight Checklist (Self-Correction before generating output)

Before you output the JSON block, verify:  
0a. **🚨 PLAYWRIGHT/CHROMIUM PREFLIGHT:** Did I run `env.check`? If `node`/`playwright`/`chromium` were not all ✓, did I ask the user via AskUserQuestion instead of picking a fallback myself? See the preflight at the top of this file.  
0b. **🚨 VECTOR OUTPUT IRON RULE:** The final PDF MUST be generated via `page.pdf()` / `convert.blueprint` - NEVER `page.screenshot()` → image → wrap as PDF. Screenshot PDFs are blurry raster images. `page.pdf()` produces vector text that stays sharp at any zoom level.
1. **Did I write ANY HTML or CSS?** If yes, delete it. Only output JSON.
2. **Is any `Glass_Canvas` markdown content too long?** Count the words. Over 150? Summarize it or push to the next page.
3. **Is the JSON perfectly formatted?** Missing commas or unescaped quotes will crash the `design_engine.py` parser.
4. **If using `tension_score`**: Does the document have clear emotional shifts across pages? If all pages are the same tone, remove it.
5. **If using `continuous_flow`**: Is this multi-page (2+)? If single-page, switch to `"flow"`.
6. **If using `Shaped_Canvas`**: Is the archetype `"shaped_editorial"`? Is there at most one per page? No `Glass_Canvas` on the same page?
7. **Grid boundary check**: Are ALL `grid_area` values within `[1, 13]`? Any number < 1 or > 13 = FATAL ERROR.
8. **Component minimum size check**: `Glass_Canvas` ≥ 6col×4row? `Shaped_Canvas` ≥ 8col×6row?
9. **Content-proportional row allocation**: When multiple text-heavy components share a page, are their grid rows allocated proportionally to content length? Equal rows for unequal content = text overlap. (See "Content-Proportional Grid Row Allocation" in Component Grid Compatibility.)
9. **40% whitespace check**: Count occupied grid cells. At least 58 of 144 cells must be empty.
10. **Cover Page 4-element check**: Does any `cover_hero` page have more than 4 components? If yes, remove or merge components.
11. **Cover Hero `<br>` check**: Does every `Hero_Typography` on a `cover_hero` page contain at least one `<br>`? Single-line hero text on covers = FAIL.
12. **Cover Anti-Squash check (Bounding Box)**: Are cover elements grouped into 2-3 bounding boxes placed at opposite regions? Is remaining space dynamically distributed (not hardcoded gaps)? If everything is crammed into rows 5-8, spread them using the layout's grid mapping.  
13a. **Cover Typography Scale check**: Is the hero title ≥ 45pt? Is subtitle ≥ 25pt? Is meta text ≥ 18pt (never below 14pt)? Tiny cover text = FAIL.  
13b. **Cover Layout Selection**: Did I pick a layout (1-7) that matches the document tone? If unsure, default to Layout 1A (Diagonal Tension). For government/bidding documents, use Layout 7 (Left-Matrix).
14. **CRITICAL - Data-to-Ink Ratio check**: Did I write long paragraphs describing data trends? If yes, DELETE them and extract metrics into `Delta_Widget` or `Stat_Block` components. Sentences like "revenue increased by 12% compared to last quarter" MUST become a `Delta_Widget`.
15. **Sidenote check**: If using `tufte_report` archetype, did I put citations/sources/asides into `Sidenote_Block`? They must NOT be inline in `Glass_Canvas`.
16. **Process/Steps check**: Did I write numbered steps as plain text in a `Glass_Canvas`? Convert to `Process_List` component instead.
17. **Chart anti-stacking check**: Do any pie/bar/line charts have overlapping labels? Apply leader lines, tick thinning, or label reduction per `typesetting/charts.md`.
18. **Chart axis cleanup check**: Are top/right spines deleted? Grid lines dashed at 20% opacity (or hidden)? No solid grid lines.
19. **Donut default check**: Are pie charts rendered as donuts (hole ratio 60-70%)? Solid pies = FAIL unless explicitly requested.
20. **🚨 Triple Delivery check (MANDATORY)**: Creative pipeline must deliver **three files** to the user: (1) PDF - the final vector PDF; (2) HTML - the compiled `*_rendered.html` file; (3) Image - a full-page screenshot preview (PNG/JPG). After `convert.blueprint` generates the PDF and HTML, take a screenshot of the HTML for preview. Report all three file paths to the user.
21. **🚨 HTML Pre-Render Validation (MANDATORY for ALL HTML→PDF paths)**: Before calling `html2pdf-next.js`, `html2poster.js`, or `convert.blueprint`, run `poster_validate.py check-html` on the HTML file. This catches overflow:hidden on containers, missing @media screen auto-scale, font fallback gaps, contrast issues, and more. **Any ERROR-level issue must be fixed before generating the PDF.** Warnings are non-blocking but should be reviewed.
    ```bash
    python3 "$PDF_SKILL_DIR/scripts/poster_validate.py" check-html page.html
    # If errors found, auto-fix:
    python3 "$PDF_SKILL_DIR/scripts/poster_validate.py" check-html page.html --fix --output page.html
    ```

22. **\u26a0\ufe0f MANDATORY: Post-Generation Checks (Creative)**: After HTML\u2192PDF conversion, run these checks:
    ```bash
    # Check for content overflow and full-bleed issues
    python3 "$PDF_SKILL_DIR/scripts/pdf_qa.py" output.pdf --no-tables

    # Add metadata
    python3 "$PDF_SKILL_DIR/scripts/pdf.py" meta.brand output.pdf
    ```

Execute the design.

---

## CJK & Vertical Text Rules (When Bypassing design_engine.py)

When writing raw HTML/CSS for Playwright (bypassing the JSON Blueprint pipeline - e.g., resumes, menus, invitations, business cards, certificates, Japanese/Chinese vertical layouts):

**⚠️ Iron rule: All bypass-scenario HTML→PDF conversions MUST use `html2pdf-next.js` — do NOT write custom Python Playwright scripts.** `html2pdf-next.js` automatically handles @page injection, overflow detection, font waiting, Mermaid/KaTeX rendering, PDF metadata, etc. See the "HTML→PDF Engine Selection Rules" section in SKILL.md.

```bash
node "$PDF_SKILL_DIR/scripts/html2pdf-next.js" input.html --output output.pdf --width 210mm --height 297mm
```

0. **Full-Bleed CSS (MANDATORY)**: Every HTML file for Playwright PDF MUST include:
   ```css
   @page { size: 800px 1200px; margin: 0; }  /* CONCRETE values only - CSS variables NOT supported in @page */
   html, body { margin: 0; padding: 0; width: 800px; height: 1200px; }
   ```
   **⚠️ @page rules do NOT resolve CSS variables** (`var(--x)` is silently ignored, falls back to A4). Always use concrete `px` values.  
   **⚠️ html/body must have explicit width + min-height** matching the canvas size. Use `min-height` (not `height`) so content taller than the design height expands naturally into a single long-page PDF.  
   **⚠️ Poster = seamless pagination.** When content exceeds `@page` height, `html2pdf-next.js` lets Playwright paginate at page boundaries - each page has the same dimensions, content flows seamlessly across pages (like scrolling a long image). Do NOT expand to a single oversized page.  
   `design_engine.py` handles this automatically via `override_css`.

0.25. **Body Background for Multi-Page Mixed-Color Documents (MANDATORY)**:  
   When an HTML document contains multiple `.page` divs with **different background colors** (e.g. dark cover + white body + dark specs page), Playwright's sub-pixel rounding creates <1px gaps at `.page` edges where `body` background shows through. On dark pages, a white `body` = visible white edges.

   **Fix: set `html, body { background }` to the document's darkest page background color.**

   ```css
   :root { --primary: #0f172a; }  /* darkest page color */
   html, body {
     margin: 0; padding: 0;
     width: 210mm;                 /* match @page size */
     background: var(--primary);   /* fills sub-pixel gaps with dark color */
   }
   ```

   **Why this doesn't break white pages:** White `.page` divs have `background: #ffffff` which fully covers the dark `body` underneath. The dark body only shows through the <1px sub-pixel gap at the extreme page edge - imperceptible on white pages after anti-aliasing.

   **Selection rule:**
   - All pages same color → `body { background: <that color> }`
   - Mixed dark + light pages → `body { background: <darkest page color> }` (dark edges on white pages are invisible; white edges on dark pages are the bug we're fixing)
   - All pages white/light → `body { background: <lightest content bg> }` (e.g. `#f8fafc`)

0.5. **No overflow:hidden + Browser Preview Adaptive Scaling (MANDATORY)**:  
   For fixed-size single-page designs (posters, infographics, certificates, etc.), **absolutely never** set `overflow: hidden` on `html`, `body`, or the main container. Reasons:
   - When opening the HTML directly in a browser, the viewport is much smaller than the design size (e.g., a 1400px-tall page in a 900px viewport). `overflow: hidden` clips the bottom content and prevents scrolling.
   - `html2pdf-next.js`'s pre-render check detects `scrollHeight > clientHeight` + `overflow: hidden` and triggers auto-fix (force-expanding the container), which may break the layout.

   **`design_engine.py` handles this automatically**: During blueprint compilation, it auto-injects `@media screen` centering + scaling code, and the `html` background color uses `var(--c-bg)` matching the poster's main color. No manual addition needed.

   **Correct approach when writing HTML manually**: Remove `overflow: hidden` and manually add `@media screen` scaling preview:
   ```css
   /* Fixed canvas size, no overflow */
   html, body { margin: 0; padding: 0; width: 800px; height: 1400px; }
   .page { width: 800px; height: 1400px; position: relative; }

   /* Auto-scale to viewport in browser preview for full-page view */
   @media screen {
     html {
       height: auto;
       display: flex;
       justify-content: center;
       background: #0a0a1a; /* Surround color — must match poster's main background */
     }
     body {
       transform-origin: top center;
       scale: min(1, calc(100vw / 800), calc(100vh / 1400)); /* Consider both width and height */
       margin: 0 auto;
       box-shadow: 0 0 60px rgba(0,0,0,0.3); /* Optional: shadow to distinguish canvas in preview */
     }
   }
   ```
   `@media screen` rules only apply in browser preview; `page.pdf()` uses print media and is unaffected.  
   **Every fixed-size HTML must include this `@media screen` adaptive code.**

0.75. **Page Container Overflow Clipping (MANDATORY for multi-page documents)**:  
   Every `.page` div MUST have `overflow: hidden`. Decorative elements (glow circles, gradient overlays) commonly use `width: 120%` or negative offsets - without clipping, they inflate `scrollWidth` beyond page width, causing Playwright to shrink all content and shift it left.
   ```css
   .page { overflow: hidden; }  /* Clips decorative overflow, prevents Playwright shrink */
   ```
   For horizontal flex layouts (≥3 items), always add `flex-wrap: wrap`. See `typesetting/overflow.md` §3.5.

1. **Character Encoding Safety**: Never use Japanese kana (の, が, は), rare symbols, or Private Use Area characters in content strings. They corrupt to U+FFFD (�) during LLM→file write→read transit. Replace with plain Chinese equivalents: `の`→`之/的/缔/省略`.
2. **Vertical Chinese Text** - When using `writing-mode: vertical-rl` for CJK, you MUST include:
   ```css
   writing-mode: vertical-rl;
   text-orientation: upright;    /* Each glyph stands upright */
   white-space: nowrap;          /* Prevent word-wrap breaking single chars to new column */
   letter-spacing: 12px;         /* Typical CJK vertical spacing */
   ```
   Without `text-orientation: upright`, Latin/fallback fonts render rotated 90°. Without `white-space: nowrap`, CJK characters may wrap into unexpected multi-column layouts (e.g., 3 chars on one line + 1 char alone on next).
3. **Font Coverage**: For CJK content via Playwright, always load Google Fonts Noto Serif SC or Noto Sans SC via `<link>` tag in `<head>` (NOT `@import` in CSS - `@import` must be the very first rule in a stylesheet or it's silently ignored). Example:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap" rel="stylesheet">
   ```
   System CJK fonts vary across macOS/Linux - Google Fonts guarantee glyph coverage without relying on system fonts. `design_engine.py` already handles this automatically via `<link>` tag.
4. **Post-Generation Text Verification**: After Playwright renders the PDF, extract text from every page and scan for `?` or `\ufffd`. If found, the source HTML has encoding-corrupted characters that must be replaced in the Python source.
5. **🚨 HTML Pre-Render Validation (MANDATORY)**: After writing the HTML file and before running `html2pdf-next.js`, always run the HTML validator:
   ```bash
   python3 "$PDF_SKILL_DIR/scripts/poster_validate.py" check-html <your_file>.html
   ```
   - **ERROR** items (e.g. `OVERFLOW_HIDDEN_CONTAINER`, `FONT_NO_FALLBACK`) → must fix before PDF generation. Use `--fix --output <file>.html` for auto-repair.
   - **WARNING** items (e.g. `FIXED_SIZE_NO_SCREEN_ADAPT`, `SCREEN_ADAPT_NO_SCALE`, `COLOR_CONTRAST`) → review and fix where appropriate.
   - This catches the most common bypass HTML bugs: `overflow:hidden` on containers, missing `@media screen` auto-scale for fixed-size pages, font-family without generic fallback, low contrast text, etc.
