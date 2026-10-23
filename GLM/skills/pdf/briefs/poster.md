# Poster Scene Rules — Creative Pipeline (Poster-Specific Constraints)

> 🟡 **Playwright/Chromium preflight applies here too.** Posters render via Playwright/Chromium (optional deps). Before rendering, probe availability and — if missing — use **AskUserQuestion** to warn about the long install/download and get confirmation before installing. See `briefs/creative.md` top for the full preflight.


> When poster / 海报 / 传单 / flyer / 宣传页 keywords are detected, load these rules on top of `creative.md`.  
> These rules take priority over `creative.md` generic rules; in case of conflict, this file prevails.  
>  
> **Positioning**: This is a scene-layer patch on `creative.md` (the generic Creative pipeline) — only covers poster-specific constraints, does not repeat generic rules.

---

## 1. Page Count & Dimensions

### 1.1 Default Single Page
- When the user does not explicitly request multiple pages, **default to a single-page poster**
- Single-page poster `total_pages: 1`, never split into multiple pages on your own

### 1.2 Sizing Strategy

| Text Volume | Recommended Size | Aspect Ratio | Notes |
|--------|---------|--------|------|
| ≤ 50 chars | 720 × 960 | 3:4 | Title poster / social media cover / card |
| 50–200 chars | 720 × 960 | 3:4 | Standard promotional poster |
| > 200 chars | 720 × min-height 960 | Adaptive | Long poster (H5 style), content stretches height |
| User-specified landscape | Adjust as needed | As needed | Width and height can be swapped |

### 1.3 Canvas Variables
```json
{
  "canvas": { "width": 720, "height": 960 }
}
```
Default dimensions can be overridden via the `canvas` field in the Blueprint. `design_engine.py` will automatically inject `--canvas-w` and `--canvas-h` CSS variables.

---

## 2. Information Density & Page Fill

### 2.1 Core Iron Rule: Content Must Fill the Page

> **The biggest visual disaster for a poster is not content overflow, but content only occupying half the page with a blank bottom half.**

| Text Volume | Content Area / Page Ratio | Notes |
|--------|----------------|------|
| ≤ 50 chars | 70–80% | Enlarged cards, large font sizes, generous decorative whitespace is intentional |
| 50–200 chars | 75–85% | Content modules distributed evenly, must not be crammed in the top half |
| > 200 chars | 80–90% | Content-dominant, whitespace only at margins |

### 2.2 Anti-Top-Heavy

- All components' `grid_area` **must cover the full 1→13 rows**, never stop at row 10 or 11
- The last component's `grid_area` row endpoint must be `13`
- **No large blank space at top/header** — the first content component's `grid_area` should start at row 1, not row 3 or 4
- **No large blank space on left/right sides** — components should utilize full column width (most should span 1→13 columns)
- If content is insufficient to fill 12 rows, use these strategies (by priority):
  1. **Increase font size**: Hero from scale 5 → 6, body font +2pt
  2. **Increase component spacing**: grid gap from 16px → 24px
  3. **Insert decorative components**: `Hairline_Divider`, `Page_Ghost_Number`
  4. **Expand stat block / hero grid row count**

### 2.3 Grid Area Allocation Iron Rule

```
✅ Correct: Components cover all rows 1→13
Page: [Hero 1→4] [Stats 4→7] [Glass 7→10] [Meta 10→13]

❌ Wrong: Components only reach row 10, rows 11-13 empty
Page: [Hero 1→3] [Stats 3→5] [Glass 5→8] [Meta 8→10] [??? 10→13 void]
```

### 2.4 ★★★ Content-Proportional Row Allocation (Anti-Overlap Iron Rule)

> **When two or more text components share a page, rows must be allocated proportionally to content volume — never split evenly!**

**Problem reproduction:**
```
Attractions: 450 chars (3 attractions × 150 chars description)
Food:        250 chars (2 foods × 125 chars description)
Available rows: 8 rows (5→13)

❌ Even split: Attractions 5→9, Food 9→13 → 4 rows each
   → Attractions content far exceeds 4-row capacity, overflows into Food area, text overlaps!

✅ Proportional split:
   Attractions: 8 × 450/700 ≈ 5 rows → 5→10
   Food:        8 × 250/700 ≈ 3 rows → 10→13
```

**Steps:**
1. Write all `markdown_content` first
2. Count the **character count** of each text component (including titles/paragraphs/lists)
3. Allocate rows proportionally: `rows_i = total_rows × (chars_i / total_chars)`
4. Round off, each component **minimum 3 rows**
5. Verify: all component grid_area endpoints connect end-to-end, covering full 1→13

**Applicable scenarios:**
- Multiple `Glass_Canvas` on the same page (most common)
- `Glass_Canvas` + `Process_List` on the same page
- Any two or more components containing text paragraphs

**Not applicable:**
- `Hero_Typography` (very large font, 1-3 lines occupying 2-3 grid rows is reasonable)
- `Stat_Block` (number + label, fixed height, typically 2 rows)
- `Floating_Meta` (short labels, typically 2-3 rows)

---

## 3. Font Size System (Poster-Specific)

### 3.1 Minimum Font Size (Hard Floor)

| Element | Min Font Size | Recommended | Notes |
|------|---------|---------|------|
| **Page main title** | **50px** | 56–72px | Poster title must have visual impact |
| **Body text** | **24px** | 24–28px | Posters are not reports — body font must be large |
| **Subtitle / card title** | **28px** | 32–40px | Secondary headings |
| **Floating Meta** | **16px** | 16–20px | Metadata text |
| **Stat Number** | **48px** | 56–72px | Data sculptures must be eye-catching |
| **Stat Label** | **14px** | 14–16px | Data labels |

> Compared to `fill-engine.md`'s generic red line (body ≥ 14pt), the poster body floor is **24px** — posters are a distance-reading medium, font sizes must be larger.

### 3.2 Emphasis Hierarchy

- Use **font size + font weight** to create hierarchy, **not color differentiation**
- Emphasis text (keyword/number highlights) font size must be smaller than titles
- Hero title recommended `weight: "black"` (900), subtitle `weight: "thin"` (100), creating extreme contrast

---

## 4. Color Rules (Poster-Specific)

### 4.1 Color Palette System

**Primary palette: Material Design 3 with low-medium saturation.** Default to medium-saturation colors; for light themes, use gradient backgrounds with white/light text on top.

| Area | Proportion | Role |
|------|------|------|
| 60% Ground | Background/margins/whitespace | Main color (low saturation) |
| 30% Structure | Cards/dividers/secondary areas | Derived from main by adjusting lightness |
| 10% Emphasis | Titles/key numbers/single accent | Adjusted purity/brightness of main color |

**Color derivation rules:**
- Title/subtitle text color: Adjust main color's purity and brightness (not a separate random color)
- Auxiliary colors: **Maximum 2**, derived from primary by adjusting lightness/saturation
- Keep consistent color palette throughout — do NOT change main color between sections
- Default recommendation: **Light theme with medium saturation**, or gradient background + white fonts

### 4.2 Poster Additional Constraints

- **No pure white (#FFFFFF) background** — use at least `#f5f4f2` or warmer off-white
- **No transparent background**
- **Page base color (`<body>` / `<html>` background) must match poster content background** — `printBackground: true` renders body background. If body is white but poster content is gray, white borders/gaps appear in the PDF. Ensure `html, body { background: var(--c-bg); }` matches the poster canvas exactly
- **Do not use a single image to fill the background** — use grid textures, gradients, geometric shapes, and other generative backgrounds
- Long posters (>200 chars) must not use full-image backgrounds
- **Gradients** or **large blurred circles/symbols** can be used sparingly as background accents
- Maximum 2 auxiliary colors, derived from primary by adjusting lightness/saturation
- Background accents: grid textures, organic shapes, large blurred circles/symbols — NOT a single image
- **Overall bright and vibrant color combinations** — the poster should feel visually striking, not muted/dull

### 4.3 palette_mode Mapping

| Poster Style | Recommended palette_mode | color_harmony |
|---------|-------------------|---------------|
| Business/Formal | `minimal` | `auto` |
| Tech/AI | `dark` | `complementary` |
| Lifestyle/Food/Artistic | `pastel` | `analogous` |
| Luxury/Ceremony | `jewel` | `split_complementary` |
| Other | `minimal` (default) | `auto` |

---

## 4.5 ★★★ Anti-Modularization Iron Rule (Anti-Card / Anti-Dashboard)

> **A poster is a complete composition, not a dashboard, not an APP interface, not a report.**

### Root Cause

LLMs naturally tend to "classify information → put each category in a box → stack them vertically", because that is report/document organization logic. But poster visual logic is the exact opposite — **information is unified, hierarchy is established through typographic rhythm (font size, weight, spacing, whitespace), not through borders and background colors**.

### Comparison

| Report/UI Thinking ❌ | Poster Thinking ✅ |
|---|---|
| Each info block wrapped in `border + border-radius + background` as a card | Information placed directly on the canvas, no borders no background |
| Clear visual boundaries between modules | Modules naturally separated by **whitespace and thin lines** |
| Looks like a mobile APP interface | Looks like a design piece |
| Hierarchy via "different colored boxes" | Hierarchy via **font size gradient + weight contrast + color lightness** |
| Stacked Glass_Canvas components = card wall | Pure typography + occasional Hairline_Divider |

### Mandatory Rules

1. **Single-page posters must not have more than 3 containers with `background` + `border`.** If information needs grouping, use whitespace (margin/padding) and thin lines (1px, opacity < 10%) instead of bordered cards.
2. **No 2×2 / 2×3 grid card layouts** (unless it's a pure data scenario with `data_dashboard` archetype). Information flows in a single column; multiple items in the same row use `flex + gap` horizontal layout without borders.
3. **Information hierarchy must be established through typography properties**, not through "different colored/backgrounded boxes":
   - Primary information: large font (≥48px) + heavy weight (900)
   - Secondary information: medium font (18-24px) + medium weight (700)
   - Tertiary information: small font (12-14px) + light weight (300-400) + reduced opacity
4. **Glass_Canvas may be used at most once in a single-page poster.** If multiple text sections are needed, use direct HTML typography instead of wrapping each paragraph in a Glass_Canvas.
5. **Bottom action information (price/address/QR code) should not be wrapped in a separate color block.** Use larger font + heavier weight to emphasize, keeping it unified with the overall composition.

### Correct Example (Direct HTML Flow)

```html
<!-- ❌ Wrong: card wall -->
<div class="card" style="background:rgba(255,255,255,0.5); border-radius:12px; border:1px solid #ddd;">
  <h3>📅 展期</h3>
  <p>7.15 — 8.30</p>
</div>
<div class="card" style="background:rgba(255,255,255,0.5); border-radius:12px; border:1px solid #ddd;">
  <h3>📍 地点</h3>
  <p>城市艺术中心</p>
</div>

<!-- ✅ Correct: pure typography, no borders -->
<div class="info-row" style="display:flex; gap:48px;">
  <div>
    <div style="font-size:10px; letter-spacing:3px; opacity:0.45;">展期</div>
    <div style="font-size:20px; font-weight:700;">7.15 — 8.30</div>
  </div>
  <div>
    <div style="font-size:10px; letter-spacing:3px; opacity:0.45;">地点</div>
    <div style="font-size:20px; font-weight:700;">城市艺术中心</div>
  </div>
</div>
```

### Blueprint Route Additional Constraints

When using Blueprint JSON (not Direct HTML):
- Single-page posters may have at most 1 `Glass_Canvas`, used only for text that truly needs reading
- Prefer combining `Stat_Block` (data), `Floating_Meta` (metadata), `Hero_Typography` (titles) instead of multiple Glass_Canvas
- Information data (dates, locations, headcounts) should use `Floating_Meta` or `Stat_Block`, not Glass_Canvas

---

## 5. Layout Strategy

### 5.1 Composition Priority
1. **Vertical composition** (vertical flow) — most common, information flows top to bottom
2. **Left-right composition** (split vertical) — image and text split, `archetype: "split_vertical"`
3. **Centered composition** (centered) — suitable for title cards with ≤ 50 chars

### 5.2 Card Rules
- Cards **must never overlap**
- Card content should be well-distributed, **no large internal whitespace**
- Text within cards **vertically centered**
- Glass Canvas `align-items` must be `stretch` (built into the engine)

### 5.3 Breathing Margins

| Scenario | safe-zone inset | Notes |
|------|----------------|------|
| Cover / title poster (≤50 chars) | `12% 14%` | Generous whitespace is intentional |
| Standard poster (50-200 chars) | `8% 10%` | Balance whitespace and content |
| Long poster (>200 chars) | `6% 8%` | Maximize content area |

> Max content width = 80% of page width (consistent with original prompt)

---

## 5.5 Visual Impact Rules

### 5.5.1 Emphasis & Contrast
- Create visual contrast with **oversized and small elements** — hero numbers/titles vs tiny metadata
- Highlight core points with large fonts or numbers for strong visual contrast
- **Emphasized text must remain smaller than headings/titles** — never let a highlight be bigger than the heading
- Texts that need emphasis can be highlighted with color, weight, or circled with hand-drawn lines
- **Do not insert multiple small pictures as embellishments** — this won't enhance visual appeal

### 5.5.2 Alignment & Spacing
- Allow blocks to resize based on content, align appropriately, optimize space utilization
- If excess whitespace exists, **enlarge fonts or modules** to balance the layout
- Cards cannot overlap; content should fill the card area without excessive empty space
- Use **flexbox** layouts to prevent footer from moving up (with top and bottom margin settings)
- For visual variety: encourage diverse and creative layouts beyond standard grids, while maintaining alignment and hierarchy

---

## 6. Design Style Library

Based on content theme, the model should autonomously select one of the following styles. Explain the selection rationale in the Blueprint's `design_rationale`.

| Style | Characteristics | Applicable Scenarios |
|------|------|---------|
| **Modern Minimal** | Clean colors, organic shapes, flowing curves, rounded cards, clear hierarchy | Business, tech, education |
| **Neo-Brutalism** | Flat elements, illustrations, patterns, large text blocks, special font designs, thick borders | Creative, events, youth |
| **Artistic Gradient** | Diffused light, gradient glow, semi-transparent elements, blur effects, glass texture | Art, music, branding |
| **Collage** | Contrasting color design, material collage, large text, irregular layout | Trends, fashion, exhibitions |
| **Playful UI** | Bright colors, interesting shapes, energetic | Children, games, social |

### Special Forms for Text Volume ≤ 50 Characters

When content is minimal, prioritize the following compact forms:

| Form | Description | archetype |
|------|------|-----------|
| **Centered Card** | Calendar-like effect, key content centered as note/card | `cover_hero` |
| **Bookmark Page** | Narrow tall ratio (e.g. 360×960), vertical reading | `cover_hero` |
| **Minimal Text** | Title + whitespace only, no additional information | `cover_hero` |
| **Sticky Note** | Content displayed as floating sticky notes above background | `cover_hero` |
| **Polaroid Card** | Photo-style card with caption below | `cover_hero` |

### Special Forms for Text Volume ≤ 100 Characters

| Form | Description |
|------|------|
| **Floating Card System** | Content as cards floating above organic shape backgrounds |
| **Notebook Style** | Lined-paper aesthetic with handwritten-feel content |
| **Fortune Stick** | Vertical strip with centered calligraphy text |

> **Key constraint**: If the user only provides a title with no other requirements, **do not expand content on your own** — just place the title.

---

## 6.5 Icons and Illustrations

- Use **Material Design Icons** (Google Fonts method):
  ```html
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <!-- Usage: -->
  <i class="material-icons">icon_name</i>
  ```
- Icon color: Use the **theme color** (not random colors)
- Icon size and position: Aligned with surrounding elements, never stretched
- If positioned beside text: **center-aligned with the first line of text**
- **Emoji can be used as icons** — 🌸 🍴 🏙️ etc. (but remember ReportLab can't render emoji — only use in HTML/Playwright route)
- For logos/emblems: Use text "Your Logo" or icons, **never** search for logo images

---

## 7. Text Readability

### 7.1 Iron Rules
- **Line height ≥ 130%** (`line-height: 1.3` or above)
- **No text shadow/glow effects**
- **When text overlays images**, a semi-transparent mask layer is required
- **Do not use images with lots of text/charts/numbers as text background**
- **No `text-align: justify`** (CJK characters get stretched letter-spacing, terrible result) — always use `text-align: left`

### 7.2 Contrast
- Text on light background: `color: #242220` or darker
- Text on dark background: `color: #f5f4f2` or lighter
- Text on medium background (L 0.30–0.70): **forbidden** — do not place text on mid-tone backgrounds

---

## 8. Image Usage Rules

### 8.0 Image Recommendations

When creating posters, actively use images to enrich visual effects. Good images can significantly enhance the poster's visual impact.

- Priority: **installed image generation skill** > web image search
- Image style must match the poster theme
- Download images locally first, then embed into the poster
- Local images must be converted to base64 data URI in HTML (Playwright cannot load local absolute paths)

### 8.1 Core Principles
- Don't force images when none are suitable, but images improve results when available
- Each image must be **unique** in the design, no reuse
- Prefer clear, high-resolution, watermark-free, text-free images
- Images should have rounded corners, sized consistently with the overall design
- You can try adding **irregularly shaped masks** (CSS `clip-path`) to images for visual interest

### 8.2 Prohibited Behaviors
- ❌ Placing images directly in corners
- ❌ Images obscuring text or overlapping with other modules
- ❌ Multiple images scattered randomly as decoration
- ❌ Searching for images when logo/badge is needed — use text "Your Logo" or icons instead

---

## 9. Chart Rules (Poster Scene)

- Large numerical datasets → consider creating visual charts
- Chart style should match the poster theme
- Use **Bento Grid** layout for multiple charts
- Chart containers **must have height constraints** to prevent infinite growth

---

## 10. Prohibited Items (Poster-Specific)

### 10.0 HTML Rendering Iron Rules (Applicable to All HTML → PDF Routes)

| Rule | Description |
|------|------|
| **No `overflow: hidden` on content components** | Truncates text. Only allowed on page-level `.canvas` and decorative background layers |
| **Use `min-height` instead of `height` for content containers** | `height:100%` locks height, content gets clipped when too much; `min-height:100%` allows natural expansion |
| **Exceptions where `overflow: hidden` is allowed** | `.canvas` (page boundary), `.poster` (auto-injected by `html2poster.js`), `.floating-meta` (short label ellipsis), cover Layer 1 (decorative clipping), SVG/img (fill container) |
| **Absolutely no `backdrop-filter`** | **Playwright PDF rendering silently discards entire element content!** Use fixed rgba() background color for cards instead |
| **Absolutely no `text-align: justify`** | CJK character spacing gets abnormally stretched, always use `text-align: left` |
| **`overflow: hidden` on `.page` containers** | **MANDATORY for multi-page documents.** Decorative elements (glow, gradient circles, oversized backgrounds) with `width > 100%` or negative offsets cause `scrollWidth > clientWidth`, triggering Playwright to shrink the entire page → content drifts left. `.page { overflow: hidden }` clips decorative overflow without affecting visible content |
| **Horizontal flex rows must have `flex-wrap`** | ≥3 inline items (flow bars, step lists, tag rows) without `flex-wrap: wrap` will overflow the page right edge when content is long. See `typesetting/overflow.md` §3.5 for full rules |

| Prohibited | Reason |
|--------|------|
| ❌ Timeline graphics | Complex connecting lines easily misalign in PDF rendering |
| ❌ Complex SVG-drawn structure/flow diagrams | Unless user explicitly requests |
| ❌ Code-drawn maps or flags | Poor quality |
| ❌ Base64 images (when exceeding 10MB) | File too large. Small image base64 is acceptable (Playwright cannot load local paths) |
| ❌ Content truncation | Must adjust container height to ensure all content fully displayed |
| ❌ Pure white background (#FFFFFF) | Lacks design quality |
| ❌ Transparent background | PDF output cannot be transparent |

---

## 11. Poster Font Recommendations

### 11.1 CJK Font Recommendations

**For Chinese posters (serious/formal scenes):**

| Purpose | Recommended Font | Google Fonts / CDN Name | Style |
|------|---------|-------------------|------|
| CJK title (serious) | DingTalk JinBuTi | `DingTalk JinBuTi` (letter-spacing: -5%) | Bold, impactful |
| CJK title (alt) | Douyin Sans / Alimama FangYuanTi VF Bold | Via CDN | Modern Chinese |
| CJK title (serif) | Swei B2 Serif CJKtc Bold | Via CDN | Elegant serif |
| CJK body | HarmonyOS Sans SC | `HarmonyOS Sans SC` | Clear, readable |
| CJK body (fallback) | Noto Sans SC Regular | `Noto Sans SC:wght@400` | Google Fonts guaranteed |
| CJK artistic | Noto Serif SC Bold | `Noto Serif SC:wght@700` | Elegant, artistic |
| Handwritten | ZhanKuKuaiLeTi2016XiuDingBan-2 | Via CDN | Casual, playful |
| Pixel/dot-matrix | DottedSongtiSquareRegular | Via CDN | Retro, xiangsuti |

**For English posters:**

| Purpose | Recommended Font | Google Fonts Name | Style |
|------|---------|-------------------|------|
| English/number title | Futura | System / `Futura` | Classic geometric |
| English body | PingFang HK | System | Clean, modern |
| English title (Google) | Inter Black | `Inter:wght@900` | Modern geometric |
| English serif | Playfair Display | `Playfair+Display:wght@900` | Classic editorial |
| Number emphasis | Inter Black | `Inter:wght@900` | Data sculpture |

### 11.2 Font Usage Constraints
- Entire poster **maximum 3 fonts**
- Title and body may use different fonts, but must be visually harmonious
- **Never reduce font size or line height to squeeze in more content**
- Font content in cards should be **vertically centered** within the card
- You may use different style fonts for entertaining or artistic scenes

---

## 12. Coordination with design_engine.py

### 12.0 ★★★ Stable Layout Selection Strategy (Anti-Overflow Core Rule)

> **Content-heavy posters must bypass the Blueprint 12×12 Grid and use a pure flow-based HTML approach.**

**Why:** The Blueprint 12×12 Grid allocates space with fixed row heights and cannot predict actual text rendering height, causing:
- Text overflowing Glass Canvas containers
- CJK character spacing stretched by `text-align: justify`
- Inaccurate row allocation for multiple components, text overlap

**Route selection:**

| Scenario | Recommended Route | Notes |
|------|---------|------|
| Title poster (≤ 50 chars) | Blueprint JSON | Few components, little content, Grid sufficient |
| Standard poster (50-150 chars) | Blueprint JSON | Grid mostly sufficient, mind row allocation |
| **Info-dense poster (>150 chars or multiple sections)** | **★ Direct HTML Flow** | **Strongly recommended — completely avoids overflow** |
| **Multi-page info poster** | **★ Direct HTML Flow** | **Strongly recommended** |
| Poster with images | Direct HTML Flow | Image embedding is more stable |

### 12.1 Direct HTML Flow Approach (Recommended Default)

**Core idea: No Grid, no fixed height, content flows naturally, never overflows.**

Write HTML directly, convert to PDF via `html2poster.js`. The poster is a **single continuous `<div class="poster">` container** — NOT split into separate `<div class="page">` blocks.

#### ★★★ Single-Canvas vs Multi-Page (Iron Rule)

| Approach | When to Use | HTML Structure |
|----------|-------------|----------------|
| **Single Canvas** (default) | All content forms one unified poster | One `<div class="poster">`, no `page-break` |
| **Multi-Page** (exception) | User explicitly requests separate pages (e.g., "make a 4-page booklet") | Multiple `<div class="page">` with `page-break-after: always` |

> **Default = Single Canvas.** A poster is ONE design composition, not a paginated report. Multi-page is only for booklets/multi-page documents where the user explicitly asks for page separation.

#### ★★★ Dynamic Height (Anti-Blank-Bottom Iron Rule)

**NEVER hardcode `@page { size: W H }` or `.poster { min-height: Xpx }` with a fixed height.** This creates blank space at the bottom when content is shorter than the hardcoded value.

**Correct approach — use `html2poster.js`:**

`html2poster.js` automatically handles all of this — you just need to write the HTML correctly and call one command:

```bash
node "$PDF_SKILL_DIR/scripts/html2poster.js" poster.html --output poster.pdf --width 720px
```

It will automatically:
1. Add `overflow: hidden` to `.poster` container (clips decorative overflow)
2. Inject `@page { margin: 0 }` (zero margins)
3. Sync `html/body` background with `.poster` background
4. Measure `.poster` scrollHeight (actual content height)
5. Generate single-page vector PDF with exact dimensions

**⚠️ Do NOT use `html2pdf-next.js` for posters.** It is designed for multi-page documents and will inject 20mm margins / A4 pagination.

**⚠️ Do NOT write hand-written Playwright scripts for posters.** `html2poster.js` handles everything.

```css
/* ✅ CORRECT CSS for poster HTML (html2poster.js handles the rest): */
html, body { margin: 0; padding: 0; background: var(--c-bg); }
.poster { width: 720px; position: relative; background: var(--c-bg); }
/* Note: overflow:hidden on .poster is auto-injected by html2poster.js,
   but including it in CSS is fine too */
```

**CSS iron rules:**
```css
html, body { margin: 0; padding: 0; background: var(--c-bg); }

/* Single poster canvas — NO fixed height */
.poster {
  width: 720px;
  position: relative;
  overflow: hidden;
  background: var(--c-bg);
  /* Height is determined by content, measured at render time */
}

/* Card/content block */
.card {
  background: rgba(255,255,255,0.7);
  border-radius: 12px;
  padding: 24px 28px;
  margin-bottom: 20px;
  /* No height, no max-height, no overflow:hidden */
}

/* CJK text iron rules */
.card, .card p, .card li {
  text-align: left;          /* Absolutely no justify! CJK stretches letter-spacing */
  line-height: 1.6;
  word-break: break-all;     /* CJK natural line break */
}

/* Image */
.hero-image {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 20px;
  display: block;
}
```

**HTML structure template (Single Canvas):**
```html
<div class="poster">
  <!-- Hero section -->
  <div class="hero"> ... </div>

  <!-- City 1 -->
  <div class="city-section">
    <h2>南京</h2>
    <div class="items-row"> ... attractions ... </div>
    <div class="food-row"> ... food ... </div>
  </div>

  <!-- City separator (thin line, NOT page-break) -->
  <div class="city-sep"></div>

  <!-- City 2 -->
  <div class="city-section"> ... </div>

  <!-- Footer -->
  <div class="poster-footer"> ... </div>
</div>
```

**Why it's stable:**
- No fixed height — content naturally defines poster size
- No `overflow: hidden`, text always fully displayed
- `text-align: left` avoids CJK letter-spacing stretch
- Single canvas = one unified composition, not chopped pages
- PDF height measured at render time = zero blank space

**Convert to PDF and PNG:**
```bash
# PDF (vector, single-page, zero margins, auto-height):
node "$PDF_SKILL_DIR/scripts/html2poster.js" poster.html --output poster.pdf --width 720px

# PNG preview (screenshot):
# Use Playwright screenshot with measured height
```

> **⚠️ Do NOT write hand-written Playwright `page.pdf()` scripts.** Use `html2poster.js` which handles overflow:hidden, margin:0, background sync, and height measurement automatically.

### 12.2 Blueprint Grid Approach (Only for Simple Posters)

| Behavior | Status | Notes |
|------|------|------|
| Dynamic inset | ✅ Fixed | More content → smaller inset (`8% 10%`), less content → default (`10% 12%`) |
| Glass Canvas overflow | ✅ Fixed | `min-height:100%` replaces `height:100%`, removed `overflow:hidden` |
| Glass Canvas / Process List stretch | ✅ Fixed | Auto `align-items: stretch` |

### 12.3 Poster Marker in Blueprint

Add `scene: "poster"` marker in `art_direction` so `design_engine.py` can identify poster scenes and apply specific logic in the future:

```json
{
  "art_direction": {
    "scene": "poster",
    "palette_mode": "minimal",
    "color_harmony": "auto",
    "background_svg": "flow",
    "design_rationale": "..."
  }
}
```

---

---

## 14. PDF Conversion Iron Rules

### 14.1 Background Color Consistency
```css
/* Must ensure html/body background = poster canvas background */
html, body {
  background: var(--c-bg);  /* Same color as .canvas background */
}
```
- Playwright `page.pdf({ printBackground: true })` renders body background color
- If body is white but poster is gray, white borders appear in the PDF
- `design_engine.py` already auto-injects `background: var(--c-bg)`, but if bypassing the engine and writing HTML directly, **you must ensure manually**

**Multi-page posters / brochures with mixed page backgrounds:**
- When pages alternate between dark and light backgrounds, set `body { background }` to the **darkest page color** (see SKILL.md "Background Color Consistency" for full rationale)
- This eliminates sub-pixel white edges on dark pages without affecting light pages

### 14.2 Content Centering (Anti-Drift)

**Poster content must be centered in the PDF, no left or right drift allowed.**

Common drift causes and fixes:
| Cause | Fix |
|------|------|
| `@page { margin }` not 0 | Must be `@page { size: <w> <h>; margin: 0; }` |
| `.safe-zone` `inset` left-right asymmetric | Ensure `inset: Y% X%` uses same X% for left and right |
| Component `grid_area` only uses partial columns | Most components should span `1 / 1 / X / 13` (full width) |
| Content container has `max-width` but no `margin: 0 auto` | Add `margin: 0 auto` to center |
| Playwright PDF default margin | Pass `margin: { top: 0, right: 0, bottom: 0, left: 0 }` |

### 14.3 Anti-Blank Edges (Dynamic Height Iron Rule)

**Poster edges, top, and bottom should not have large meaningless whitespace.**

**★★★ CRITICAL: Never hardcode poster height.** The poster is a single continuous canvas — its height is defined by content, not by a fixed CSS value.

| Pattern | Status | Result |
|---------|--------|--------|
| `@page { size: 720px 3600px }` | ❌ FORBIDDEN | Creates 853px+ blank space at bottom if content is shorter |
| `.poster { min-height: 3600px }` | ❌ FORBIDDEN | Same problem — blank bottom |
| `.poster { width: 720px }` (no height) | ✅ CORRECT | Content defines height naturally |
| `node html2poster.js poster.html --width 720px` | ✅ CORRECT | Auto-measures height, zero blank space |

**The 720×960 dimension is for multi-page documents with `page-break-after: always` only — NOT for single-canvas posters.**

- Content must make full use of page area, no more than 20% unused space within safe-zone
- If excess whitespace exists, enlarge font sizes or modules to balance the layout
- Checklist:
  - [ ] Poster height defined by content (no hardcoded height)?
  - [ ] PDF generated via `html2poster.js` (not html2pdf-next.js)?
  - [ ] First component starts from the top?
  - [ ] Last component reaches the bottom with proper padding?
  - [ ] Left-right margins symmetric?
  - [ ] No blank space at bottom of PDF?

---

## 15. Preflight Checklist (Poster-Specific)

Before outputting JSON Blueprint, verify the following items:

```
□ ★ Single-canvas check: poster is ONE continuous <div>, not split into separate pages? (unless user explicitly requests multi-page)
□ ★ Dynamic height check: no hardcoded @page size height or .poster min-height? PDF generated via html2poster.js?
□ ★ Anti-modularization check: ≤ 3 containers with background+border in single-page poster? No 2×2 card grid? Hierarchy via font size/weight not border colors?
□ Emphasis elements (price/date/address) highlighted via font size+weight, not wrapped in separate color blocks?
□ Overall looks like a design piece, not an APP interface or dashboard?
□ total_pages = 1 (single canvas)? (unless user explicitly requests multi-page booklet)
□ No hardcoded @page height or .poster min-height? Content defines height?
□ Left-right margins symmetric? (no left/right drift)
□ html/body background = poster canvas background? (no color mismatch)
□ No bottom blank space in PDF? (height measured dynamically)
□ Page main title ≥ 50px? Body text ≥ 24px?
□ Text volume ≤ 150 chars? (single Glass Canvas)
□ palette_mode not #FFFFFF pure white?
□ No single image filling the background?
□ No overlap between cards?
□ No Timeline / complex SVG structure diagrams?
□ All content fully displayed, not truncated?
□ Emphasis text font size < title font size?
□ Entire design ≤ 3 fonts?
□ cover_hero page ≤ 4 components?
□ Hero_Typography has <br> line breaks?
□ @page { margin: 0 } set? (prevents PDF drift)
```
