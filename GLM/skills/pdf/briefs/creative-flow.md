# Brief: Creative Flow (Designed Long Documents)

**When to use this brief:** Text-heavy documents that need design flair but content flows naturally across pages — guides, handbooks, catalogs, introductions, collections, illustrated manuals. The content is the star; design supports readability.

**How it differs from `creative.md`:** `creative.md` (Blueprint Mode) treats each page as a self-contained fixed-size visual canvas. This brief lets content flow continuously, with Chromium's `@page` auto-paginating at page boundaries.

**→ MUST READ: `typesetting/overflow.md`** for Playwright/HTML-specific overflow patterns.

---

## Core Principle: Content Flows, Design Wraps

You write raw HTML/CSS directly (no JSON Blueprint, no `design_engine.py`). The document is one continuous HTML body, and the browser's print engine splits it into pages automatically.

**⚠️ Iron rule: All HTML→PDF conversions MUST use `html2pdf-next.js` — do NOT write custom Python Playwright scripts.** It automatically handles @page injection, overflow detection, font waiting, Mermaid/KaTeX rendering, PDF metadata, etc.

```bash
node "$PDF_SKILL_DIR/scripts/html2pdf-next.js" input.html --output output.pdf --width 720px --height 1020px
```

---

## Pagination Model

### The Iron Rules

1. **NO fixed height on content containers.** Let content flow naturally. The browser decides where to cut pages.
2. **NO `.page` divs for content sections.** Use a single `<div class="main-content">` with padding for all body content.
3. **NO `break-before: page` between content sections.** This is the #1 cause of blank space — when the previous section doesn't fill a page, the remainder becomes a void. Use `margin-top` for visual chapter separation instead.
4. **`break-inside: avoid`** on individual cards, items, and guide entries to prevent them from being split across pages.
5. **`break-after: avoid`** on chapter headers (tag + title + divider group) to keep them attached to the first content block below.
6. **Fixed-height containers ONLY for cover and ending pages** that must occupy a full page:

```css
/* Cover: fixed height, standalone page */
.cover {
    width: 720px;
    height: 1020px;
    box-sizing: border-box;
    break-after: page;
    overflow: hidden;  /* OK here — clips decorative elements on cover only */
    /* ⚠️ Use justify-content: center (NOT flex-end) to avoid top-heavy blank */
    /* Add decorative elements (circles, lines) + bottom edition label for visual balance */
}

/* Ending: fixed height, standalone page */
.ending {
    width: 720px;
    height: 1020px;
    box-sizing: border-box;
    break-before: page;
    overflow: hidden;
}

/* Content: flows naturally, NO fixed height */
.main-content {
    padding: 60px 65px 40px 65px;
    /* NO height property */
    /* NO overflow: hidden */
}
```

### What NOT to Do (Common Mistakes)

| Mistake | Why it breaks | Fix |
|---------|--------------|-----|
| `.content { height: 1020px; }` | Content that exceeds the height gets clipped or overflows | Remove fixed height |
| Multiple `<div class="content">` each with `padding: 60px` | Double padding (60+60=120px) between sections creates voids | One container, chapters separated by `margin-top` |
| `break-before: page` on chapter headers | Previous chapter doesn't fill the page → blank space before new chapter | Use `margin-top: 36px` instead |
| `overflow: hidden` on content container | Clips content at page boundaries | Only use on fixed-height cover/ending |
| `justify-content: flex-end` on cover | Title sinks to bottom, 60%+ blank above | Use `center` + decorative anchors for balance |
| Chapter with < 3 paragraphs of content | Leaves half a page blank before next chapter | Write enough content to fill at least 50% of a page |
| `margin-top: 50px+` on chapters | Compounds with `break-inside: avoid`, creates large voids | Keep chapter `margin-top` ≤ 30px |

---

## CSS Template

```css
@page {
    size: 720px 1020px;   /* Concrete px values — CSS variables NOT supported in @page */
    margin: 0;
}
:root {
    --c-bg: #0d0d0d;
    --c-text: #e8e6e3;
    --c-accent: #ff4757;
}
html, body {
    margin: 0;
    padding: 0;
    width: 720px;
    background: var(--c-bg);
    color: var(--c-text);
    font-family: 'Noto Sans SC', sans-serif;
}
@media screen {
    html {
        height: auto;
        display: flex;
        justify-content: center;
        background: #222;
    }
    body {
        transform-origin: top center;
        margin: 20px auto;
    }
}
```

**⚠️ @page rules do NOT resolve CSS variables** (`var(--x)` is silently ignored, falls back to A4). Always use concrete `px` values in `@page`.

---

## HTML Structure Template

```html
<body>

<!-- Cover: fixed height, occupies one full page -->
<div class="cover">
    <div class="tag">CATEGORY</div>
    <div class="title">Document Title</div>
    <div class="subtitle">Description text</div>
</div>

<!-- All body content in ONE continuous container -->
<div class="main-content">

    <!-- Chapter 1 -->
    <div class="section-tag">Chapter 1</div>
    <div class="section-title">Title</div>
    <div class="divider"></div>
    <div class="body-text">Paragraph content...</div>
    <div class="body-text">More paragraphs...</div>

    <!-- Chapter 2: separated by margin-top, NOT break-before -->
    <div class="chapter-header">
        <div class="section-tag">Chapter 2</div>
        <div class="section-title">Title</div>
        <div class="divider"></div>
    </div>

    <!-- Cards / items with break-inside: avoid -->
    <div class="card">Card content...</div>
    <div class="card">Card content...</div>

</div>

<!-- Ending: fixed height, occupies one full page -->
<div class="ending">
    <div class="big-text">Closing text</div>
</div>

</body>
```

Key CSS for chapter headers and cards:
```css
.chapter-header {
    break-after: avoid;    /* Keep header with first content block */
    break-inside: avoid;
    margin-top: 28px;      /* ≤ 30px! Larger values compound with break-inside: avoid → blank pages */
}
.card {
    break-inside: avoid;   /* Don't split a single card across pages */
    margin-bottom: 14px;   /* ≤ 16px! Every px of margin is lost space if card is pushed to next page */
}
```

---

## Body Background Rule

Set `html, body { background }` to the document's dominant/darkest color. This prevents sub-pixel gap artifacts between content and page boundaries.

- All pages same dark color → `body { background: <that color> }`
- Mixed dark cover + light body → `body { background: <darkest color> }` (dark body is invisible under white content pages)
- All pages white/light → `body { background: <lightest content bg> }` (e.g. `#f8fafc`)

---

## Shared Rules with creative.md

The following rules apply identically to both Creative Flow and Creative Blueprint pipelines:

### Character Encoding Safety
Never use Japanese kana (の, が, は), rare symbols, or Private Use Area characters. They corrupt to U+FFFD (�) during LLM→file write→read transit. Replace with plain Chinese equivalents: `の`→`之/的/缔`.

### Vertical Chinese Text
When using `writing-mode: vertical-rl`:
```css
writing-mode: vertical-rl;
text-orientation: upright;
white-space: nowrap;
letter-spacing: 12px;
```

### Font Coverage
For CJK content, always load Google Fonts via `<link>` tag in `<head>` (NOT `@import`):
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&family=Noto+Serif+SC:wght@400;700;900&display=swap" rel="stylesheet">
```

### Post-Generation Text Verification
After Playwright renders the PDF, extract text and scan for `?` or `\ufffd`. If found, fix encoding-corrupted characters in the source HTML.

### HTML Pre-Render Validation (MANDATORY)
Before calling `html2pdf-next.js`, run the validator:
```bash
python3 "$PDF_SKILL_DIR/scripts/poster_validate.py" check-html <file>.html
```
- **ERROR** → must fix before PDF generation. Use `--fix --output <file>.html` for auto-repair.
- **WARNING** → review and fix where appropriate.

---

## Quality Checklist — Creative Flow

### Layout & Pagination
- [ ] **No fixed height on content containers** (only cover/ending pages)
- [ ] **No `break-before: page` between content sections**
- [ ] **`break-inside: avoid`** on all cards/items/guide entries
- [ ] **Chapter headers have `break-after: avoid`** to stay with first content block
- [ ] **Single `<div class="main-content">`** wraps all body content
- [ ] **No double padding** between sections (one container, not multiple)

### Full-Bleed & Background
- [ ] **`@page { margin: 0 }`** with concrete px size values
- [ ] **`html, body { margin: 0; padding: 0 }`**
- [ ] **Body background matches dominant page color**
- [ ] **No white edge artifacts** on dark pages

### Cover Page Design
- [ ] **Cover `justify-content: center`** (not `flex-end`) — `flex-end` pushes content to the bottom and leaves 60%+ blank at top, making the page feel empty
- [ ] **Add visual anchors** to fill the cover: decorative elements (circles, lines), edition/date label at bottom, badge at top. A cover with only title+subtitle will look hollow.
- [ ] **Cover padding ≤ 70px** — excessive padding shrinks the visual footprint further

### Content Density (Anti-Blank-Page)
- [ ] **Each chapter must have enough content to fill at least 50% of a page.** If a chapter (text + quote + cards) occupies < 50% of a page, it will leave a large blank area before the next chapter. Solution: expand the content (add 1-2 more paragraphs, examples, or context).
- [ ] **Chapter `margin-top` ≤ 30px.** Larger values (50px+) compound with `break-inside: avoid` on cards, pushing content to the next page and leaving voids on the current page.
- [ ] **Card/callout `margin` ≤ 16px.** Every pixel of vertical margin inside a `break-inside: avoid` block is space that cannot be reclaimed if the block is pushed to the next page.
- [ ] **After generating PDF, visually check every page** for >30% trailing blank space. If found, either: (a) add more content to that chapter, (b) reduce margins/padding, or (c) reorder elements so a smaller block fills the gap.

### Design Quality
- [ ] **Entire document ≤ 5 colors**: Primary + secondary + accent + neutral + background
- [ ] **2-typeface maximum**: At most 2 font families
- [ ] **Decorative elements ≤ 3 per page** (cover exempt)
- [ ] **No stock images / clipart / AI-generated decorations** unless user-provided

### Output
- [ ] **Vector PDF** via `html2pdf-next.js` (not screenshot)
- [ ] **HTML source file** delivered alongside PDF
- [ ] **PDF metadata** set via `pdf.py meta.brand`
- [ ] **QA passed** via `pdf_qa.py --no-tables`
