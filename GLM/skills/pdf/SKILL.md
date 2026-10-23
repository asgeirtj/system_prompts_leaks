---
name: pdf
metadata:
  author: Z.AI
  version: "1.1"
description: "Professional PDF toolkit covering four production workflows: reports, creative visuals, academic LaTeX, and existing PDF processing. Routes automatically by document type and supports reports, posters, papers, resumes, extraction, merging, splitting, and form filling. Use this skill for any conversion whose output is a PDF: Office → PDF (.docx/.doc/.pptx/.ppt/.xlsx/.xls/.odt/.odp/.ods/.rtf/.csv/.txt → PDF), HTML → PDF, and LaTeX/.tex → PDF; also PDF → images, PDF → text, and PDF → tables when reading a PDF apart. Trigger when the user asks to convert, export, render, print, or turn a file into a PDF, or to merge/split/extract from one — including phrasings like 'Word转PDF', 'PPT转PDF', 'Excel转PDF', 'html转pdf', '导出为PDF', 'save/export as PDF', or 'PDF转图片/文字'."
license: Proprietary. LICENSE.txt has complete terms
---

# PDF - Document Production Workbench

## Quick Setup

```bash
bash "$PDF_SKILL_DIR/scripts/setup.sh"          # Interactive environment check + install
python3 "$PDF_SKILL_DIR/scripts/pdf.py" env.check  # Detailed dependency status (JSON: add -j)
python3 "$PDF_SKILL_DIR/scripts/pdf.py" env.fix     # Auto-install missing CORE Python packages
```

> **Core vs optional.** Only the **core** deps are needed up front: Python 3 + `reportlab`, `pypdf`,  
> `PyMuPDF`, `pikepdf`, `pdfplumber`, and a TrueType CJK font. These cover the Report route and all  
> covers (rendered with ReportLab). **Playwright/Chromium** (Creative/poster/HTML→PDF) and **Tectonic**  
> (Academic/LaTeX) are **optional** — do NOT install them at first run. Install them **on demand, and  
> only after asking the user** (they are large downloads / long first-run waits). See the per-route  
> preflight blocks in `briefs/creative.md`, `briefs/poster.md`, `briefs/process.md`, `briefs/academic.md`.

> **Local-font-first.** Inspect fonts available in the user's local environment and prefer a suitable  
> installed font. Use bundled or downloaded fonts only as fallbacks; do not install fonts without the  
> user's confirmation.

## Triage

Determine task weight to control how much context to load:

| Weight | Triggers | What to Load |
|--------|----------|--------------|
| **Light** | Format conversion, form fill, text extract, merge/split, simple certificate | SKILL.md + `briefs/process.md` only |
| **Standard** | Multi-page report, poster, academic paper, resume, reformat - any document with design decisions | SKILL.md + matched brief + typesetting assets on demand |

Light tasks skip typesetting files entirely. Standard tasks load them on demand per the brief's instructions.

### ⚠️ Pre-Routing Checks (run BEFORE matching brief)

1. **Emoji Check** - Scan user content for intentional emoji (decorative 📊🎯🔥, not OS-level emoji input). If found → **force Creative brief** regardless of document type. ReportLab renders emoji as □ squares; LaTeX drops them entirely.
2. **CJK Check** - Chinese/Japanese/Korean content needs font coverage. Report brief must use `UniSong`/`UniHei` registered fonts; Creative brief must load Google Fonts Noto Sans SC with `font-display: swap`; Academic brief must use `\usepackage{ctex}`.
3. **Size Check** - Non-standard page sizes (not A4/Letter/A3) → prefer Creative brief (Playwright handles any dimension). ReportLab can do custom sizes but pagination is manual.
4. **Character Safety Check** - Before writing any content string, scan for Japanese kana (の、が、は etc.), unusual Unicode symbols, or non-CJK characters that may corrupt during encoding transit ( Especially when code is written via heredoc/base64/LLM output). Replace with plain Chinese equivalents: `の`→`之/的/缔`, `々`→omit or write full character. **If content must preserve Japanese, use only standard CJK Unified Ideographs (U+4E00-U+9FFF) and common kana; avoid rare/private-use codepoints.**

---

## Briefing

Match the user's intent to a production brief. Each brief contains the full workflow, tech stack specifics, and references to shared typesetting assets.

```
User Request
│
├─ Work with existing PDF? ─────────────┬─ Extract/merge/split/fill/convert → briefs/process.md
│                                       ├─ Reformat/redesign → briefs/process.md (extract) → delegate to report or creative brief
│                                       └─ User provides a PDF template/reference to match style
│                                          → briefs/process.md "Template-Guided Reformat" → delegate to matched brief
│
├─ Report / proposal / white paper / contract / analysis?
│  └─ ────────────────────────────────── → briefs/report.md   (ReportLab)
│
├─ Poster / invitation / infographic / dashboard / creative layout?
│  └─ ────────────────────────────────── → briefs/creative.md  (Playwright)
│
├─ Academic paper / thesis / math / IEEE / ACM / LaTeX?
│  └─ ────────────────────────────────── → briefs/academic.md  (Tectonic)
│
├─ Math-heavy doc / TikZ diagram / algorithm pseudocode / Beamer slides?
│  └─ ────────────────────────────────── → briefs/academic.md  (Tectonic, Scenarios A-D)
│
├─ Document needs complex embedded diagrams (flowcharts, architecture, neural nets)?
│  └─ Route by target brief:
│     ├─ Report → Playwright+CSS → PNG → ReportLab Image() flowable
│     ├─ Creative → directly in HTML (CSS flexbox/grid + connectors)
│     └─ Academic → complexity-based:
│        ├─ Simple (≤6 nodes, linear/tree) → TikZ native (vector)
│        └─ Complex (>6 nodes, branches, annotations) → Playwright+CSS → PNG → \includegraphics
│
└─ Resume / CV?
   ├─ ATS-safe / corporate ─────────── → briefs/report.md     (resume sub-section)
   ├─ Creative / design industry ────── → briefs/creative.md   (resume sub-section)
   └─ Academic CV / publications ────── → briefs/academic.md   (resume sub-section)
```

### Detection Keywords

| Brief | Keywords |
|-------|----------|
| Report | 报告, report, 分析, analysis, 白皮书, white paper, 提案, proposal, 合同, contract, 方案, 规划, 发票, invoice, 收据, receipt, 试卷, exam, quiz, test paper, 练习, exercise, worksheet, 考试, 测验 |
| Creative | 海报, poster, 邀请函, invitation, 信息图, infographic, 仪表盘, dashboard, 传单, flyer, 证书, certificate, 菜单, menu, 名片, business card, 奖状, award, 标签, label, 信封, envelope, 贺卡, greeting card |
| Creative (Poster) | 海报, poster, 传单, flyer, 宣传页, 宣传单 → additionally load `briefs/poster.md` scene layer rules |
| Academic | 论文, paper, 学术, academic, LaTeX, 数学, math, IEEE, ACM, 毕业, thesis, 研究, research, Beamer, slides, 开题报告, 学位, dissertation, proposal |
| Process | 提取, extract, 合并, merge, 拆分, split, 填写, fill, 转换, convert, OCR, 重排, reformat, 重新排版, redesign, 模板, template, 参照, 照着这个做, match this style, 压缩, compress, 水印, watermark, 加密, encrypt, 签名, sign |

### Complete Scenario Routing Matrix

Below is an exhaustive map of every known PDF request type to its handling strategy. If a scenario is not listed, route to the closest match or ask the user.

#### 📄 Creation (Generate PDF from scratch)

| Scenario | Route | Notes |
|----------|-------|-------|
| Report / white paper / analysis | report.md | ReportLab structured document |
| Report with emoji | **creative.md** | 🚨 Emoji rule override |
| Business proposal | report.md | Structured + data tables |
| Contract / legal document | report.md | Add signature placeholders (dotted line + label) |
| Invoice / receipt | report.md | Table-heavy, precision alignment |
| Exam / quiz / test paper / worksheet | report.md | Indented options, answer space reservation, structured numbering (see Exam Paper Rules in report.md) |
| Math exam / math worksheet (with formulas/equations) | academic.md | LaTeX for proper math typesetting. See §Exam Paper Rules in academic.md |
| Poster / flyer | creative.md + **poster.md** | Visual design + poster density/sizing rules |
| Invitation / greeting card | creative.md | Non-standard size, decorative |
| Certificate / award | creative.md | Single page, centered layout, decorative border |
| Business card | creative.md | Tiny size (90×54mm), Playwright native support |
| Envelope / label | creative.md | Non-standard size, simple layout |
| Menu / price list | creative.md | Visual layout + may contain emoji |
| Resume (ATS) | report.md | Plain text structure |
| Resume (creative) | creative.md | Visual design |
| Resume (academic CV) | academic.md | Publication list + BibTeX |
| Academic paper | academic.md | LaTeX/Tectonic |
| Math-heavy document | academic.md | LaTeX typesetting |
| Presentation / PPT-style | creative.md | Landscape (1280×720), one topic per page |
| Book / long document | report.md | Add TOC + chapter numbering, validate with toc_validate.py |
| CJK vertical text | creative.md | HTML `writing-mode: vertical-rl` + `text-orientation: upright` + `white-space: nowrap` + Playwright |
| RTL document (Arabic/Hebrew) | creative.md | HTML `dir="rtl"` + Playwright |
| Batch generation (mail merge) | report.md | Python loop + template variable substitution |
| Infographic | creative.md | Data visualization + design |
| Calendar / schedule | creative.md | Grid layout + custom dimensions |

#### 🔧 Processing (Manipulate existing PDF)

| Scenario | Route | Command / Method |
|----------|-------|------------------|
| Merge multiple PDFs | process.md | `pages.merge a.pdf b.pdf -o out.pdf` |
| Split PDF | process.md | `pages.split input.pdf -o ./output/` |
| Extract text | process.md | `extract.text input.pdf` |
| Extract tables | process.md | `extract.table input.pdf` |
| Extract images | process.md | `extract.image input.pdf` |
| Fill forms | process.md | `form.fill input.pdf` |
| Office → PDF | process.md | `convert.office input.docx` |
| HTML → PDF (documents) | process.md | `convert.html input.html` or `node html2pdf-next.js` |
| HTML → PDF (posters) | poster.md | `node html2poster.js poster.html` |
| Image → PDF | process.md | pikepdf: one image per page, embed as XObject |
| PDF → image | process-advanced.md | pypdfium2 render each page to PNG |
| Encrypt / decrypt | process-advanced.md | pikepdf encryption |
| Add watermark | process.md | pikepdf overlay: create watermark page → merge onto each page |
| Compress PDF | process.md | Ghostscript: `gs -sDEVICE=pdfwrite -dPDFSETTINGS=/screen` |
| OCR scanned PDF | process-advanced.md | ocrmypdf or Tesseract |
| Rotate pages | process.md | `pages.rotate input.pdf 90 -o out.pdf` |
| Crop pages | process.md | `pages.crop input.pdf l,b,r,t -o out.pdf` |
| Remove blank pages | process.md | `pages.clean input.pdf` |
| Reformat by template | process.md → delegate | Extract content → regenerate via report/creative |
| PDF diff / compare | process.md | `diff-pdf` CLI or Python per-page text comparison |
| Digital signature | process.md | `pyhanko` library (requires extra install) |
| Edit metadata | process.md | `meta.set input.pdf -o out.pdf -d '{...}'` |

### Special Routing Rules

**🚨 Emoji rule (CRITICAL - check FIRST)**: Content with intentional emoji (📊🎯🔥💡 etc.) → force **briefs/creative.md** regardless of document type. ReportLab renders emoji as □ squares; LaTeX silently drops them. This rule overrides all other routing. Even if the user says "report" - if the content has emoji, use Creative pipeline.

**Non-standard page size rule**: Dimensions other than A4/Letter/A3 → strongly prefer **briefs/creative.md**. Playwright handles any arbitrary page size natively. ReportLab requires manual pagination math.

**Academic auto-detect**: Papers, theses, or heavy math → **briefs/academic.md** even without explicit "LaTeX" mention.

**Template-guided rule**: When the user uploads a PDF and says "match this template" / "follow this style" / "reformat like this" → **briefs/process.md** Template-Guided Reformat section. This is a Standard triage (not Light), because it involves design decisions.

**Resume routing**: Default to Report brief (ATS-safe). Creative industry → Creative brief. Academic CV with publications → Academic brief.

---

## Shared Assets

These are referenced by multiple briefs. **Do not load upfront** - each brief tells you when and what to load.

| Asset | Path | Used By | Purpose |
|-------|------|---------|---------|
| Palette & Typography | `typesetting/palette.md` | Report, Creative | Color system, font rules, anti-patterns, spacing |
| Cover Engine V4.0 | `typesetting/cover.md` | **Report + Academic** | 9 ReportLab templates (01–05 report/light, 06–08 academic/dark, 09 institutional), absolute anchor grid, layer order, typography weight system, mandatory Summary block, host-detected style-driven fonts. **Pure ReportLab via `scripts/cover_render.py` — no HTML/Playwright.** (Creative composes its cover inside its own HTML.) |
| Chart Styling & Anti-Stacking | `typesetting/charts.md` | Report, Creative, Academic | Chart defaults, collision prevention, axis/grid/legend rules |
| Overflow Prevention | `typesetting/overflow.md` | Report, Creative, Academic | Bounding box system, text/image/table overflow prevention, fallback strategies |
| **Fill Engine (Anti-Void)** | `typesetting/fill-engine.md` | **Report, Creative, Academic** | **Anti-Void Engine V2.0: font floor enforcement, fill ratio calculation, paragraph inflation, component elevation, Y-axis golden-ratio anchoring** |
| Pagination & Flow Control | `typesetting/pagination.md` | Report, Creative | Cross-page integrity, orphan/widow control, CJK punctuation rules |
| Typography System | `typesetting/typography.md` | Report, Creative | Font size scale, line-height, spacing hierarchy |
| Geometric Anchors | `typesetting/geometry.md` | Creative + Report | Decorative geometric elements, anchor placement rules |
| Cover Backgrounds | `typesetting/cover-backgrounds.md` | **Report + Creative + Academic** | Cover background rendering, transparency constraints |
| Visual Framework | `configs/visual_framework.md` | Creative | Palette mode, color harmony, SVG background params |
| Components Library | `configs/components.md` | Creative | Non-grid composition components (floating cards, oversized text, etc.) |
| Font Stacks | `configs/fonts.md` | All pipelines | Font families per pipeline (Google Fonts, ReportLab, LaTeX) |

---

## Content Rules

- **Language**: Match user's query language. Chinese query → Chinese PDF.
- **Page/word count**: Respect explicit constraints (±20%). Unspecified → completeness over brevity.
- **Outline**: User-provided outlines are sacred. No reordering without asking.
- **Citations**: No fabrication. Chinese → GB/T 7714, English → APA. Search to verify.
- **Multi-part requests**: Generate ALL parts - never silently drop a component.
- **Original file preserved**: User-provided input files are read-only by default. Deliverables go to new files (`<stem>_updated.pdf` next to the input); edit an original in place only when the user explicitly asks — and then copy it to `<stem>_backup.pdf` next to it (never `/tmp`) first. Every `-o` target must be a new path; never pass the input path to `-o`. See `briefs/process.md`.

### HTML Image Source Path Rules

When embedding images in HTML documents (Creative pipeline, Playwright-rendered diagrams, or any HTML→PDF flow):

| Image location | `<img src>` value | Example |
|---|---|---|
| **Local file** | **Relative path** from the HTML file's directory | `<img src="images/chart.png">` or `<img src="./diagram.png">` |
| **Remote URL** | Full URL (no change needed) | `<img src="https://example.com/photo.jpg">` |

**Iron rules:**
1. **NEVER use absolute paths** for local files in HTML `<img>`, `<source>`, CSS `url()`, or any other asset reference (e.g. `/Users/alice/project/img.png`). Absolute paths break portability across machines and environments.
2. **Always use relative paths** anchored to the HTML file's own directory. If the image lives in a subdirectory, use `images/foo.png` or `./images/foo.png`.
3. **Remote URLs (`http://` / `https://`) are fine as-is** — do not convert them to local paths.
4. When generating HTML from a script or blueprint, ensure all referenced assets are either (a) in the same directory as the output HTML, or (b) in a clearly named subdirectory (e.g. `assets/`, `images/`), and referenced with relative paths.
5. If a build script needs to resolve paths programmatically, compute relative paths at generation time (e.g. `os.path.relpath(image_path, html_dir)`) rather than embedding absolute filesystem paths.

---

## Figure & Diagram Embedding (All Briefs)

### Iron Rule: Figures Are Block-Level

Figures, diagrams, and charts MUST be independent block elements occupying full width. **Never** float/wrap figures alongside body text - this causes the text-diagram overlap badcase.

| Brief | Correct embedding | Forbidden |
|-------|-------------------|-----------|
| Report (ReportLab) | `story.append(Image(...))` as standalone Flowable | Placing images inside Paragraph text, simulating float |
| Creative (Playwright) | `<figure style="display:block; width:100%; margin:2em auto">` | `float:right`, `display:flex` with text, `wrapfigure`-style CSS |
| Academic (LaTeX) | `\begin{figure}[t] ... \end{figure}` | Bare `\includegraphics` in text body (no figure env), bare `tikzpicture` in multi-column |

### Complex Diagram Strategy

When a diagram has **>12 nodes, >3 subgroups, or intricate connections**, do NOT try to render it as one giant figure. Instead:

1. **Table for details** - structured data (phases, components, specs) goes into a proper table
2. **Simplified overview diagram** - a stripped-down flowchart/Mermaid showing only the top-level flow (≤8 nodes)
3. **Cross-reference** - table caption + diagram caption reference each other

This "table + simple diagram" pattern prevents:
- Diagrams overflowing page boundaries
- Text becoming unreadably small to fit everything
- Layout engines mishandling oversized graphics

### Diagram Content Quality Rules (Cross-reference: charts)

The rules above handle **how** to embed diagrams in PDF. For **what the diagram itself looks like** (node layout, connector routing, color, readability), follow the `charts` skill rules:

**Before generating ANY flowchart/diagram for PDF embedding, check these:**

1. **Connectors must not pass through nodes** - If 3+ layers exist, connect adjacent layers only (top→mid, mid→bottom). Never draw top→bottom lines through middle nodes. Use detour paths if cross-layer links are needed.
2. **Multiple arrows into one node must not pile up** - Distribute entry points evenly along target edge, or use merge-then-enter pattern (sources converge to a vertical merge line, then single arrow to target).
3. **Low-saturation fills only** - Node backgrounds must be pale (`#EFF6FF`, `#F0FDF4`). High-saturation colors (`#3B82F6`, `#10B981`) only for borders or small accents. No children's-art color schemes.
4. **Phase titles vs sub-steps must be visually distinct** - Different background color, font size, and font weight. Never same-style boxes for both.
5. **Font sizes must be readable at final output size** - Sizes depend on the embedding context:
   | Output context | Node title min | Description min | Label min |
   |---------------|----------------|-----------------|-----------|
   | Standalone PNG (web/presentation, ≥1200px wide) | 14px | 12px | 11px |
   | Embedded in A4 PDF (ReportLab/LaTeX, ~450pt content width) | 10pt | 8pt | 7pt |
   | Embedded in slide deck (landscape, ~720pt wide) | 12pt | 10pt | 9pt |

   **Principle**: After embedding, the smallest text in the diagram must still be legible when the document is viewed at 100% zoom. If the diagram is scaled down to fit page width, recalculate: `effective_size = original_size × (display_width / canvas_width)`. If effective size drops below the minimum, either increase original font size or reduce diagram complexity.
6. **Legend/annotations must not overlap content** - Separate container, ≥ 40px gap from last node, fully within canvas bounds.

**For Playwright-rendered diagrams**: Use low-saturation fills (`#EFF6FF`, `#F0FDF4`), CSS flexbox/grid for node layout, SVG `<line>`/`<path>` for connectors, and verify no overlap at final render size.  
**For ReportLab-drawn diagrams**: Same principles apply - use `Drawing()` with explicit coordinates, check node bounding boxes for overlap before finalizing.

### Diagram Generation Strategy (Per-Brief)

Diagram rendering depends on the target brief - **NOT** a one-size-fits-all TikZ pipeline.

| Target Brief | Diagram Method | Rationale |
|---|---|---|
| **Report** (ReportLab) | Playwright+CSS → PNG → `Image()` | No LaTeX compiler in this route; HTML/CSS handles any layout natively |
| **Creative** (Playwright) | Directly in HTML (CSS flexbox/grid + JS connectors) | Already in browser context |
| **Academic** (Tectonic) - simple (≤6 nodes) | TikZ native `tikzpicture` | Vector output, font consistency, LaTeX-native |
| **Academic** (Tectonic) - complex (>6 nodes) | Playwright+CSS → PNG @2× → `\includegraphics` | TikZ branch logic is error-prone for models; 300dpi PNG is publication-ready |

**Playwright+CSS diagram pipeline (Report & Academic-complex):**

```bash
# 1. Write diagram HTML (CSS grid/flexbox + connectors)
cat > diagram.html << 'EOF'
<!-- LLM generates: nodes as divs, arrows as SVG/CSS -->
EOF

# 2. Screenshot at 2× for print quality (300dpi equivalent)
python3 "$PDF_SKILL_DIR/scripts/pdf.py" convert.blueprint diagram.html --device-scale-factor 2 --output diagram.png
# Or via Playwright directly:
# page.screenshot(path='diagram.png', scale='device', device_scale_factor=2)

# 3a. Embed in ReportLab (Report brief)
from reportlab.platypus import Image
img = Image('diagram.png', width=450)  # auto height via aspect ratio
story.append(img)

# 3b. Embed in LaTeX (Academic brief, complex diagrams only)
# \includegraphics[width=\columnwidth]{diagram.png}
```

**🚫 FORBIDDEN for Report/Creative briefs:** Do NOT use TikZ standalone → compile → pdftoppm → PNG pipeline. This route has no LaTeX compiler and the extra compilation steps are error-prone.

**TikZ remains valid ONLY for:**
- Academic brief with simple diagrams (≤6 nodes, linear/hierarchical)
- Direct `tikzpicture` embedding in LaTeX documents
- Math-annotated diagrams where LaTeX math rendering matters

See `briefs/academic.md` Scenario B for TikZ templates (simple diagrams only).

---

## Vector Rendering Iron Rule

**The final PDF MUST be generated via `page.pdf()` (Playwright) or ReportLab/LaTeX native output - NEVER via screenshot-to-PDF.**

| Scenario | Correct Method | Forbidden |
|----------|---------------|-----------|
| Creative pipeline (single/multi-page) | `page.pdf()` via `convert.blueprint` or `html2pdf-next.js` | `page.screenshot()` → image → wrap as PDF |
| Report cover (ReportLab) | `cover_render.py` → merge via pypdf | Screenshot cover → embed as image |
| Academic cover (ReportLab) | `cover_render.py` → merge via pypdf | Screenshot → `\includegraphics` for cover |
| Full-page posters/infographics | `html2poster.js` (auto overflow:hidden + height measurement + `page.pdf()`) | Any raster pipeline for the final output |

**Why:** `page.pdf()` produces vector text + vector shapes. Text remains selectable, sharp at any zoom, and file size is smaller. Screenshot-based PDFs are raster images - blurry when zoomed, unsearchable, and 3-5× larger.

**The ONLY place screenshot/PNG embedding is acceptable:**
- **Diagrams** embedded as sub-elements inside a larger document (e.g., flowcharts in a Report). These use `page.screenshot()` at 2× device scale factor for 300dpi print quality, then embed via `Image()` (ReportLab) or `\includegraphics` (LaTeX).
- **Chart images** generated by matplotlib/plotly saved as PNG, then embedded.

These are sub-elements, not the document itself. The document-level PDF output must always be vector.

**Quick test:** Open the generated PDF, zoom to 400%. If text is blurry, you used a screenshot pipeline. Fix it.

### HTML→PDF Engine Selection Rules

There are **two dedicated scripts** for HTML→PDF. Choose based on document type:

| Document type | Script | Reason |
|---------------|--------|--------|
| **Posters, infographics, long-image single-page designs** | `html2poster.js` | Auto overflow:hidden, auto height measurement, zero margin, single-page output |
| **Cover pages (Report/Academic route)** | *(none — use ReportLab)* | Covers now render with `scripts/cover_render.py` (pure ReportLab). Do NOT use HTML for Report/Academic covers. |
| **Multi-page documents, reports, academic papers, resumes** | `html2pdf-next.js` | A4/custom pagination, 20mm margin fallback, cover adaptation, pdf-lib metadata |
| **Creative pipeline (Blueprint → HTML → PDF)** | `html2pdf-next.js` via `convert.blueprint` | Called internally by design_engine pipeline |

#### Poster / Single-Page Long-Image → `html2poster.js`

```bash
node "$PDF_SKILL_DIR/scripts/html2poster.js" poster.html --output poster.pdf --width 720px
```

`html2poster.js` automatically:
- Forces `overflow: hidden` on `.poster` / `.page` containers (clips decorative overflow)
- Injects `@page { margin: 0 }` (zero margins always)
- Syncs `html/body` background with poster background color
- Measures `.poster` scrollHeight and uses it as PDF height
- Generates a single-page vector PDF with exact content dimensions

**Use this for ANY fixed-width, dynamic-height, single-page design.**

#### Documents / Multi-Page → `html2pdf-next.js`

```bash
node "$PDF_SKILL_DIR/scripts/html2pdf-next.js" input.html --output output.pdf --width 210mm --height 297mm
# Or via pdf.py wrapper:
python3 "$PDF_SKILL_DIR/scripts/pdf.py" convert.html input.html --output output.pdf
```

Pre-render hooks auto-handle @page injection, overflow detection, cover adaptation, font loading, and pdf-lib metadata.

#### ⚠️ Iron Rule: No Hand-Written Playwright Scripts

Common issues with hand-written Python `page.pdf()` (the dedicated scripts handle these automatically):
1. **Missing `@page` rule** → browser default margin causes content overflow to second page or white edges
2. **Oversized elements not fixed** → large elements with `break-inside: avoid` block pagination, content gets truncated
3. **Rendering before fonts are loaded** → Chinese text displays as squares or falls back to wrong font
4. **No overflow detection** → content exceeds page boundary without awareness
5. **No metadata** → PDF title, author, and other info missing

**Iron rule: Posters and cover pages use `html2poster.js`, multi-page documents use `html2pdf-next.js`. Do not write hand-written Python Playwright scripts.**

> **⚠️ Cover page note:** Report/Academic covers are rendered with ReportLab (`scripts/cover_render.py`), NOT HTML — so this gotcha no longer applies to them. It remains relevant only if you hand-author a full-page fixed HTML layout (rare): such a layout uses `position: absolute`, which `html2pdf-next.js` would convert to `static` flow and break — use `html2poster.js` for that case.

### No overflow:hidden on Fixed-Size Pages (html2pdf-next.js only)

When using `html2pdf-next.js` for documents, **NEVER set `overflow: hidden` on `html`, `body`, or the main page container**.

> **Note:** This rule does NOT apply to posters rendered via `html2poster.js` — that script automatically adds `overflow: hidden` to `.poster`/`.page` containers to clip decorative overflow. You don't need to add or remove it manually.

| Problem | Cause | Fix |
|---------|-------|-----|
| Browser preview cuts off bottom content, can't scroll | `overflow: hidden` on container + viewport < design height | Remove `overflow: hidden` |
| html2pdf-next.js "Fixed vertical overflow" warning, layout may break | Pre-render detects `scrollHeight > clientHeight` + hidden overflow, force-expands container | Remove `overflow: hidden` |

**Always pair fixed-size pages with `@media screen` auto-scale** so the full page is visible in any browser window without scrolling. See `briefs/creative.md` § 0.5 for the CSS pattern.

### Full-Bleed Rule (No White Margins)

When generating HTML for Playwright `page.pdf()`, the content **MUST fill the entire page** with zero margins. White side margins = broken layout.

**Mandatory CSS for any HTML → PDF:**
```css
@page {
  size: <width> <height>;  /* e.g., 720px 960px, or A4 */
  margin: 0;
}
html, body {
  margin: 0;
  padding: 0;
}
```

**Common causes of white margins:**
1. Missing `@page { margin: 0 }` - browser default margins kick in (~1cm each side)
2. Content width doesn't match page width - e.g., canvas is 720px but page is A4 (794px)
3. Missing `@page { size }` declaration in the HTML
4. Content has explicit `max-width` that's narrower than the page

**For blueprint pipeline:** `design_engine.py` now injects `@page { size: var(--canvas-w) var(--canvas-h); margin: 0; }` automatically.  
**For raw HTML:** YOU must include the `@page` rule. No exceptions.  
**For direct Playwright:** Pass `margin: { top: 0, right: 0, bottom: 0, left: 0 }` to `page.pdf()`.

### Background Color Consistency (No Color Mismatch)

**`html` / `body` background color must match the content canvas background color.**

Playwright `page.pdf({ printBackground: true })` renders the body background color. If body is white while the content area is gray/colored, color-inconsistent borders/gaps will appear in the PDF.

#### Single-color documents (all pages same background)

```css
/* MANDATORY: body background = content background */
html, body {
  margin: 0;
  padding: 0;
  background: var(--c-bg);  /* Same color as content canvas */
}
```

#### Multi-page documents with mixed backgrounds (e.g. dark cover + white body pages)

**Root cause:** Playwright resolves `.page { width: 210mm }` and `@page { size: 210mm }` to slightly different sub-pixel values (e.g. 793.688px vs 793.701px). This creates a <1px gap at the right/bottom edge of each `.page` div where `body`'s background shows through. On dark pages, a white `body` background makes this gap visible as a white edge.

**Fix — set `body` background to the document's dominant dark color:**

```css
:root {
  --primary: #0f172a;  /* darkest page background */
}
html, body {
  margin: 0;
  padding: 0;
  width: 210mm;  /* match @page size */
  background: var(--primary);  /* fallback for sub-pixel gaps */
}
```

**Why this works and doesn't break white pages:**
- Dark pages: sub-pixel gap reveals dark `body` → gap invisible.
- White pages: `.page-white { background: #ffffff }` fully covers `body` → dark body never visible.
- The gap is <1px — even on white pages, the dark body at the extreme pixel edge is imperceptible after anti-aliasing.

**Rule: when generating multi-page HTML with mixed backgrounds, always set `html, body { background }` to the darkest page's background color.** If all pages are light/white, use the lightest content background (e.g. `#f8fafc`). Never leave `body` background unset (browser default = white = guaranteed white edges on dark pages).
```

### Content Centering (No Left/Right Drift)

**After HTML-to-PDF conversion, content must be centered, no left or right drift allowed.**

Common drift causes:
1. `@page { margin }` not 0 — browser default margin causes drift
2. `.safe-zone` or content container `inset` / `padding` left-right asymmetric
3. Content container has `max-width` but no `margin: 0 auto`
4. Grid components only occupy partial column width (e.g. `1/1 → X/7` only uses left half)
5. **Decorative elements overflow page boundary** — elements with `width > 100%` or negative offsets (e.g. glow circles, gradient overlays) inflate `scrollWidth` beyond page width. Playwright shrinks all content to fit, causing left-shift. **Fix: add `overflow: hidden` to `.page` containers.** See `typesetting/overflow.md` §3.5 for horizontal flex overflow rules.

### Anti-Void Edges (No Large Blank Margins)

**Content should not have large meaningless whitespace at page edges, top, or bottom.**

- Content should make full use of page area; do not cram all content in the top half while leaving the bottom blank
- For multi-page documents, each page's fill rate should be ≥ 60% (see `pagination.md` last page ≥ 40% rule)
- For single-page posters/infographics, fill rate should be ≥ 70%

---

## Preflight (Quality Assurance)

Every PDF must pass preflight checks before delivery. Each brief specifies the exact commands.

### HTML Pre-Render Validation (MANDATORY for ALL HTML→PDF paths)

**Before** calling `html2pdf-next.js`, `html2poster.js`, `convert.blueprint`, or any Playwright `page.pdf()`, run:

```bash
python3 "$PDF_SKILL_DIR/scripts/poster_validate.py" check-html <your_file>.html
```

| Result | Action |
|--------|--------|
| **PASS** (no errors) | Proceed to PDF generation |
| **ERROR** items | Must fix before generating PDF. Use `--fix --output <file>.html` for auto-repair |
| **WARNING** items | Review; non-blocking but should be addressed |

**Key checks:**
- `OVERFLOW_HIDDEN_CONTAINER` (error): `overflow:hidden` on html/body/.page clips content in browser preview and triggers html2pdf-next.js auto-fix that may break layout
- `FIXED_SIZE_NO_SCREEN_ADAPT` (warning): fixed-size page without `@media screen` auto-scale — browser preview requires scrolling
- `SCREEN_ADAPT_NO_SCALE` (warning): `@media screen` exists but lacks scale/transform/zoom
- `FONT_NO_FALLBACK` (error): font-family without generic fallback
- `COLOR_CONTRAST` (warning): text/background contrast ratio < 3:1
- Plus: remote images, absolute paths, missing margin reset, tiny fonts, background mismatch, etc.

This applies to **all three HTML routes**: Creative blueprint pipeline, Report HTML covers, and bypass/custom HTML.

### Overflow Prevention System

**→ Full spec: `typesetting/overflow.md`** - read it for any document with tables, images, or multi-column layouts.

Core principles:
1. **Measure first, draw second** - never render content without pre-calculating its dimensions
2. **Bounding Box constraint** - every element's width ≤ its parent container's `Max_Width`
3. **Text: use font metrics**, not character count, for width calculation
4. **Images: proportional scaling** - never insert at original size
5. **Tables: weight-based column width** + `Paragraph()` wrapping (never plain strings)
6. **Fallback ladder**: wrap → shrink font (max -3pt) → reduce padding → split element → log warning
7. **Vertical: KeepTogether** for heading+body, chart+caption; `repeatRows=1` for long tables

### Table Overflow Prevention (ReportLab)

**Most common layout bug: table columns exceed page margins.**

Before building any ReportLab Table:
1. Calculate `available_width = page_width - left_margin - right_margin`
2. Use proportional colWidths (`[0.25, 0.40, 0.20, 0.15]` × available_width) or fixed+flex pattern
3. `sum(colWidths)` must be ≤ `available_width` - **verify this in code**
4. Long text columns must use `Paragraph()` wrapping, not plain strings (plain strings don't wrap)
5. CJK text is wider: budget ~12pt per character at 10pt font size

See `briefs/report.md` § "Table Width Management" for code patterns.

### Table Overflow Prevention (LaTeX/Academic)

**Most common bug in dual-column papers: wide tables overflow single-column width.**

Before writing any LaTeX table:
1. Count data columns - ≤ 4 fits single column; 5-6 needs `\small`; 7-8 needs `\resizebox`; ≥ 9 use `table*` (full width)
2. Use `tabular*{\columnwidth}` or `tabularx{\columnwidth}` instead of plain `tabular` for 5+ columns
3. Never use plain `tabular` with 8+ columns in twocolumn layout - guaranteed overflow
4. `\resizebox{\columnwidth}{!}` as last resort - verify smallest text ≥ 6pt after scaling

See `briefs/academic.md` § "Table width management" for LaTeX patterns.

### Playwright PDF CSS Blacklist
These CSS properties **silently break** in Playwright's PDF renderer:
- `backdrop-filter` / `-webkit-backdrop-filter` - **drops entire element content**. Use solid `rgba()` backgrounds.
- `overflow: hidden` on content containers - clips content. Only safe on small decorative elements (< 200px).

After generating any Playwright PDF, **verify every page has content** (pypdf text extraction, check non-empty).

### PDF Metadata (all briefs)
ALL PDFs must have: Title, Author (default "Z.ai"), Creator, Subject.

### Delivery Summary (all briefs)
Report to user: file path, size, page count. Academic adds word/image count. Creative adds per-page verification.

**HTML→PDF route deliverables (MANDATORY — applies to ALL briefs that use Playwright/HTML to generate PDF):**  
Whenever the HTML→PDF pipeline is used (Creative route, Report cover bypass, Direct HTML Flow posters, or any Playwright `page.pdf()` path), you MUST deliver **both files** to the user:
1. **HTML** — the source HTML file, so the user can edit and reuse the design
2. **PDF** — the final vector PDF (`page.pdf()` output)

Optionally also provide:
3. **Image** — a full-page screenshot/preview image (PNG or JPG) for quick sharing on chat/social media

All file paths must be reported to the user. **Never deliver only the PDF without the HTML source.**

---

## Tooling Reference

### CLI: `python3 "$PDF_SKILL_DIR/scripts/pdf.py" <command>`

```bash
# Environment
env.check                    # Check deps
env.fix                      # Auto-install missing

# Quality
code.sanitize <script>       # Sanitize forbidden Unicode
content.sanitize <file> [--apply]  # Fix content issues (CJK, encoding)
meta.brand <pdf>             # Add Z.ai metadata
font.check <pdf>             # Scan for missing glyphs
toc.check <pdf>              # Validate TOC

# Conversion
convert.blueprint <llm_json_response.md> -o final.pdf  # CRITICAL FOR CREATIVE: Auto-extracts JSON, compiles, and renders PDF.
convert.html <html>          # HTML → PDF (Playwright)
convert.latex <tex>           # LaTeX → PDF (Tectonic). Bundled binary is macOS arm64 only; see academic.md for other-platform install.
convert.office <file>         # Office → PDF (LibreOffice)

# Processing
extract.text <pdf>            # Extract text
extract.table <pdf>           # Extract tables
extract.image <pdf>           # Extract images
pages.merge a.pdf b.pdf -o out.pdf
pages.split <pdf>
pages.clean <pdf>             # Remove blank pages
form.info <pdf>               # Inspect form fields
form.fill <pdf>               # Fill form
form.annotate <pdf>           # Fill via annotations
meta.get <pdf>
meta.set <pdf> -o out.pdf -d '{"Title": "..."}'
```

### Poster/HTML/LaTeX Validator: `python3 "$PDF_SKILL_DIR/scripts/poster_validate.py"`
```bash
check-html <html>                              # Pre-render validation (overflow:hidden, @media screen, fonts, contrast, etc.)
check-html <html> --fix --output <fixed.html>  # Auto-fix errors (remove overflow:hidden, add font fallback)
check-pdf <pdf> --source-html <html>           # Post-render validation
check-pdf <pdf> --poster                       # Poster mode: suppress ORPHAN_PAGE warning
check-tex <tex>                                # LaTeX source validation (table overflow, image width, etc.)
```

**check-html checks include:**
- `OVERFLOW_HIDDEN_CONTAINER` (error): overflow:hidden on html/body/.page/.poster — clips content
- `FIXED_SIZE_NO_SCREEN_ADAPT` (warning): fixed-size page without @media screen auto-scale
- `SCREEN_ADAPT_NO_SCALE` (warning): @media screen exists but lacks scale/transform/zoom
- `FONT_NO_FALLBACK` (error): font-family without generic fallback (sans-serif/serif)
- `COLOR_CONTRAST` (warning): text/background contrast ratio < 3:1
- `BG_COLOR_MISMATCH` (warning): body background differs from .canvas/.poster background
- `SCREEN_BG_MISMATCH` (warning): @media screen html background differs from body/canvas background
- `MULTIPAGE_BODY_BG_MISSING` (warning): multi-page document with dark `.page` backgrounds but no `html/body` background color. Sub-pixel gaps at page edges reveal white body, causing visible white edges on dark pages. Resolves `var()` references via `:root` variables.
- `SCREEN_NO_BG` (warning): fixed-size page's @media screen block lacks html background color
- `OVERFLOW_DECORATION` (warning): negative position values may cause black edges
- `NO_PAGE_SIZE` / `MISSING_MARGIN_RESET` / `WHITE_BACKGROUND` / `TINY_FONT` / etc.

**check-tex checks include:**
- `BARE_TABULAR_OVERFLOW` (error): `\begin{tabular}` with 5+ columns in two-column layout, not wrapped in resizebox/adjustbox/table*
- `RESIZEBOX_TEXTWIDTH` (error): `\resizebox{\textwidth}` used inside single-column float in two-column layout. `\textwidth` = full page width, but `table` float is one column. Fix: use `\resizebox{\columnwidth}` or `table*`
- `TABULAR_OVERFLOW_RISK` (warning): 4-column tabular in two-column layout without width constraint
- `TABULAR_WIDE` (warning): 7+ column tabular in single-column layout without width constraint
- `TABULAR_NO_FLOAT` (warning): tabular not inside table/table* float environment
- `TABULARX_NOT_LOADED` (warning): document has tabular but tabularx package not loaded
- `IMAGE_NO_WIDTH` (warning): `\includegraphics` without width/height/scale constraint
- `EQUATION_DUAL_ON_LINE` (warning): `equation` environment has 2+ equations joined by `\quad` without line breaks. Guaranteed overflow in dual-column
- `EQUATION_OVERFLOW_RISK` (warning): equation body has >80 math characters. Likely overflows single column
- `ALGORITHM_NO_SMALL_FONT` (warning): `algorithm` environment in dual-column without `\SetAlFnt{\small}`
- `ALGORITHM_LONG_IO` (warning): Algorithm Input/Output line >120 chars. Will overflow narrow column
- `CJK_ASCII_QUOTES` (error): ASCII `"` found adjacent to CJK characters. LaTeX interprets `"` as right double quote, so `"北漂"` renders incorrectly. Skips verbatim/lstlisting/minted environments and `\texttt{}`/`\url{}`/`\href{}{}`/`\verb||` inline commands.

### Design Engine: `python3 "$PDF_SKILL_DIR/scripts/design_engine.py"`
```bash
compile --blueprint <json_file> --output poster.html  # CRITICAL: Compile JSON blueprint to HTML
derive "document title or description"         # Auto-derive intent from content
palette --intent calm --mode dark               # Generate HSL-locked palette
palette-cascade --intent cold --mode minimal    # Generate role-based cascade palette (V2, preferred)
svg --intent flow --dimensions 720x960         # Generate SVG background
full --intent energy --mode dark --dimensions 720x960 --output-dir ./assets/
audit --palette-json palette.json              # Check palette constraints
```

### Palette Generator (for Report route): `python3 "$PDF_SKILL_DIR/scripts/pdf.py" palette.generate`
```bash
palette.generate --title "document title" --mode minimal   # Output: ready-to-paste ReportLab Python code
palette.generate --title "..." --format json               # Output: raw JSON
palette.generate --title "..." --format css                # Output: CSS custom properties
palette.generate --title "..." --mode dark --harmony complementary --seed 42
```

### Cascade Palette (V2 - Preferred): `python3 "$PDF_SKILL_DIR/scripts/pdf.py" palette.cascade`
```bash
palette.cascade --title "document title" --mode minimal    # Output: summary table with all 12 roles
palette.cascade --title "..." --format json                # Full structured JSON (roles + cover + body + charts + semantic)
palette.cascade --title "..." --format css                 # CSS custom properties by tier
palette.cascade --title "..." --format reportlab           # Ready-to-paste ReportLab Python code
```
**⚠️ Cascade palette is the preferred palette system.** It enforces area ∝ 1/saturation (larger areas = lower saturation) and outputs unified color subsets for cover, body, and charts from one base hue. Use `palette.cascade` instead of `palette.generate` for new documents.

**⚠️ Report route MUST call `palette.cascade` (or `palette.generate`) before writing any ReportLab code.** The output is copy-paste ready - no manual hex picking allowed.

> **Note**: `design_engine.py compile` produces **HTML** from a JSON blueprint. To get a **PDF**, use `pdf.py convert.blueprint` which internally calls `compile` → Playwright render → PDF output. In the Creative pipeline, always use `convert.blueprint` for the final PDF.

### Tech Stack per Brief

| Brief | Primary Tool | Secondary | Emoji Support | Custom Page Size |
|-------|-------------|-----------|---------------|-----------------|
| Report | ReportLab + pypdf | **ReportLab cover (`cover_render.py`)** | ❌ (tofu □) | Manual pagination |
| Creative | Playwright *(optional)* | html2pdf-next.js (pdf-lib for post-processing) | ✅ native | ✅ any size |
| Academic | Tectonic *(optional)* + pypdf | **ReportLab cover (`cover_render.py`)** | ❌ (dropped) | Template-dependent |
| Process | pikepdf, pdfplumber | LibreOffice (soffice) *(install on demand — not substitutable)* | N/A | N/A |

> **Cover System (V4.0)**: Report and Academic covers are rendered with **ReportLab** via  
> `scripts/cover_render.py` (templates 01–05 report, 06–08 academic dark, 09 institutional) and  
> merged as page 1 via pypdf — **no HTML/Playwright/Chromium**. Creative composes its cover inside  
> its own HTML document. Fonts are auto-detected from the host and chosen by cover style (see  
> `typesetting/cover.md` Part 3).  
>  
> **Optional engines**: Playwright/Chromium (Creative/poster/HTML→PDF) and Tectonic (Academic/LaTeX)  
> are optional — probe first and ask the user before installing (large downloads / long waits).  
>  
> **LibreOffice (Office→PDF) is different — you MUST install it, not substitute it.** Using Word,  
> WPS, Keynote or Pages *instead of* installing is forbidden, and a large download is **not** a reason  
> to skip it. Required: explain the necessity to the user (only engine that preserves  
> themes/layouts/master slides faithfully), say the package is large, then install it — **preferred  
> source is the Tsinghua TUNA mirror**  
> `https://mirrors.tuna.tsinghua.edu.cn/libreoffice/libreoffice/stable/26.8.0/` (pick the  
> platform/arch subdirectory; if that version is gone, take the newest under  
> `.../libreoffice/stable/`), with `brew install --cask libreoffice` /  
> `sudo apt install libreoffice-core` / `winget install TheDocumentFoundation.LibreOffice` as  
> fallbacks. **Then register the binary on `PATH` and re-verify `soffice --version`** — an install  
> left off the executable search path reads as "not installed" to the next probe and causes a  
> redundant multi-hundred-MB reinstall; the mechanism differs per OS (Linux/macOS symlink into  
> `/usr/local/bin`, Windows `setx` the program dir onto the user `PATH`). So **probe before  
> installing**: a binary already on disk but off-`PATH` needs registering, not reinstalling.  
> Another program is permitted **only after** an  
> install attempt has actually failed. **No install attempt = no substitute program.**  
> See `briefs/process.md` and `env_setup/setup.md` (→ *"Register the binary on PATH"*) for the full  
> procedure.  
>  
> **Fallback**: If Report brief content has emoji → reroute to Creative.

---

## File Map

```
SKILL.md                            ← You are here
briefs/
  report.md                         ← Report production: ReportLab workflow + API + resume(ATS)
  creative.md                       ← Creative production: 5-phase generative design workflow
  poster.md                          ← Poster scene rules: density, font sizing, fill constraints (overlay on creative.md)
  academic.md                       ← Academic production: LaTeX workflow + templates + resume(CV)
  process.md                        ← PDF processing: extract/merge/split/form/convert/reformat
  process-advanced.md               ← Advanced reference (encrypted/corrupted/OCR/batch/perf) - load on demand
configs/
  visual_framework.md               ← Palette mode, color harmony, SVG background params
  components.md                     ← Non-grid composition components (floating cards, etc.)
  fonts.md                          ← Font stacks per pipeline (Creative/Report/Academic)
typesetting/
  palette.md                        ← Color system + typography + anti-patterns + spacing
  cover.md                          ← ReportLab cover engine V4.0 (templates 01–09) + selection matrix + font strategy + color rules
  cover-backgrounds.md              ← Cover background rendering rules + transparency constraints
  charts.md                         ← Chart styling + anti-stacking rules + axis/grid/legend treatment
  overflow.md                       ← Bounding box system, text/image/table overflow prevention
  pagination.md                     ← Cross-page integrity, orphan/widow control, CJK punctuation
  typography.md                     ← Font size scale, line-height, spacing system
  geometry.md                       ← Geometric anchor system (decorative elements, lines, shapes)
  fill-engine.md                    ← Adaptive anti-void layout engine V2.0
scripts/
  pdf.py                            ← CLI tool (30 subcommands)
  cover_render.py                   ← ReportLab cover engine (templates 01–09, host font detection). Report/Academic covers.
  pdf_qa.py                         ← PDF quality checker (metadata, fonts, overflow, margins, tables, formulas)
  design_engine.py                  ← Generative SVG + palette engine (palette/svg/compile/derive/audit)
  poster_validate.py                ← HTML/PDF validator
  toc_validate.py                   ← TOC validator
  html2pdf-next.js                  ← Playwright + pdf-lib HTML→PDF converter for documents (no Paged.js)
  html2poster.js                    ← Playwright HTML→PDF converter for posters/single-page (auto overflow:hidden, dynamic height)
  cover_validate.js                 ← (legacy) HTML cover overlap detection — NOT used by the ReportLab cover engine; kept only for hand-authored HTML covers.
references/
  resume-altacv.tex                 ← AltaCV dual-column resume template (creative/tech)
  resume-academic.tex               ← Academic CV template (PhD/academic)
```

### Loading Protocol

1. **Always read**: This file (SKILL.md)
2. **Read ONE brief**: The matched brief file - it contains the complete workflow
3. **Read typesetting on demand**: Only when the brief says to (standard tasks)
4. **Never load all files upfront** - briefs reference what they need

### Script Path Setup (MANDATORY before any script call)

All paths are relative to `$PDF_SKILL_DIR` — the single root variable for this skill. Resolve it once before calling any script:

```bash
PDF_SKILL_DIR="<skill_directory>"   # ← parent directory of this SKILL.md

# Then all commands use $PDF_SKILL_DIR:
python3 "$PDF_SKILL_DIR/scripts/pdf.py" code.sanitize generate_pdf.py
python3 "$PDF_SKILL_DIR/scripts/pdf.py" meta.brand output.pdf
python3 "$PDF_SKILL_DIR/scripts/pdf.py" font.check output.pdf
python3 "$PDF_SKILL_DIR/scripts/pdf.py" toc.check output.pdf
python3 "$PDF_SKILL_DIR/scripts/pdf.py" pages.clean output.pdf -o output_clean.pdf
python3 "$PDF_SKILL_DIR/scripts/pdf_qa.py" output.pdf
python3 "$PDF_SKILL_DIR/scripts/poster_validate.py" check-html page.html
python3 "$PDF_SKILL_DIR/scripts/poster_validate.py" check-pdf output.pdf
```

**For Python imports** (when generation code needs to import skill modules):

```python
import sys, os
PDF_SKILL_DIR = "<skill_directory>"
_scripts = os.path.join(PDF_SKILL_DIR, "scripts")
if _scripts not in sys.path:
    sys.path.insert(0, _scripts)
```

**⚠️ NEVER use bare `python3 scripts/pdf.py ...`** - it only works if cwd happens to be the skill directory. Always use `$PDF_SKILL_DIR/scripts/` as the absolute prefix.

---

## 8. Quality Checklist (Mandatory after every PDF generation)

> The following checks come from the `typesetting/` spec files and are **mandatory** quality gates.

### Automated Detection (Must Run)

```bash
python3 "$PDF_SKILL_DIR/scripts/pdf_qa.py" <output.pdf>
python3 "$PDF_SKILL_DIR/scripts/pdf_qa.py" --poster <output.pdf>   # poster mode: skip content fill ratio, check all pages for full-bleed
python3 "$PDF_SKILL_DIR/scripts/pdf_qa.py" --skip-cover --formulas <output.pdf>   # academic mode: skip cover for margin check, enable formula overflow
python3 "$PDF_SKILL_DIR/scripts/pdf_qa.py" --no-tables <output.pdf>   # creative mode: skip table centering check
```

> **Dependency**: Requires `pymupdf` (`pip install pymupdf`). If not installed, skip automated detection and use the manual checklist below.

Run `pdf_qa.py` after generating a PDF. It auto-detects: metadata completeness, page size consistency, blank pages, CJK punctuation placement, color count, font embedding status, content overflow, content fill ratio, cover full-bleed, margin symmetry, table centering, formula overflow.
- **`--poster` mode**: skips content fill ratio check (poster last page naturally has less content), checks ALL pages for full-bleed (not just cover)
- **`--skip-cover`**: skips page 1 when checking margin symmetry (for documents with separately-generated covers)
- **`--no-tables`**: disables table centering check (for creative/poster documents that rarely have traditional tables)
- **`--formulas`**: enables formula overflow detection (checks if formula-like content extends past right content margin)
- Result PASS → deliver directly
- Result WARN → evaluate whether fix is needed, non-blocking
- Result FAIL → **must fix and regenerate**

### Pagination & Layout (pagination.md)

- [ ] **Last page fill ratio ≥ 40%**: No large blank areas on the final page. If insufficient, backtrack to compress spacing/line-height/font-size
- [ ] **Major section 3/4 threshold**: H1-level headings must NOT start in the bottom 25% of a page. If remaining space < 25%, force page break and start on fresh page. Use `CondPageBreak(available_height * 0.25)` in ReportLab, `\needspace{0.25\textheight}` in LaTeX
- [ ] **Tables don't split across pages**: Table header and data rows must stay together. Small tables: `break-inside: avoid`. Large tables: `thead { display: table-header-group }`
- [ ] **Punctuation placement rules**: Commas, periods, etc. must not appear at line start. Set `line-break: strict` in CSS
- [ ] **No orphan headings**: Headings must not appear alone at page bottom. Use `break-after: avoid`
- [ ] **Cards/images not cut**: `break-inside: avoid`

### Overflow Prevention (overflow.md)

- [ ] **All table cells use Paragraph() wrapping** (ReportLab): Never plain strings - they don't wrap and overflow
- [ ] **sum(colWidths) ≤ available_width**: Verified in code, not assumed
- [ ] **Images/charts proportionally scaled**: Never inserted at original dimensions; always `fit_image()` or `max-width: 100%`
- [ ] **Long tables have repeatRows=1**: Table header repeats on every page when table breaks across pages
- [ ] **Heading + first paragraph in KeepTogether**: Prevents orphan headings at page bottom
- [ ] **Chart + caption in KeepTogether**: Prevents chart on one page, caption on next
- [ ] **CJK text uses wordWrap='CJK'**: Required for proper line-breaking of Chinese/Japanese/Korean
- [ ] **URLs/long strings have word-break**: `overflow-wrap: break-word` (HTML) or manual splitting (ReportLab)
- [ ] **Font degradation fallback**: Tight columns can shrink font by up to 3pt before clipping

### Color (palette.md) - Report & Creative only

> **Academic (LaTeX) documents are exempt** from this color system. LaTeX uses template-defined styling.
- [ ] **Entire document ≤ 5 colors**: Primary + secondary + accent + neutral + background
- [ ] **All colors traceable to primary**: Secondary and accent derived via lightness/saturation/micro-hue shift
- [ ] **Sibling elements not differentiated by different hues**: Use opacity/lightness/borders instead
- [ ] **Gradient endpoints hue difference < 20°**: No warm-to-cool gradients
- [ ] **No high-saturation color blocks**: Avoid eye strain

### Cover V2 (cover.md)

- [ ] **Evaluate whether a cover is needed**: Reports, proposals, analysis, white papers, manuals ≥ 3 pages → **always add cover (default ON)**. Skip cover ONLY for: resumes, CVs, letters, memos, forms, checklists, invoices, internal notes, or documents ≤ 2 pages
- [ ] **Single PDF output**: Cover is merged into the final PDF as page 1. **Report/Academic**: cover rendered by `cover_render.py` (ReportLab) → merged as page 1 via pypdf. **Creative**: cover is part of the same HTML document. NEVER deliver a separate cover file
- [ ] **Page isolation**: Cover NEVER shares a page with TOC or body content. **Report/Academic**: inherent via pypdf merge (separate PDFs). **Creative**: CSS page-break ensures isolation
- [ ] **Absolute Anchor Grid**: All elements use percentage Y-anchors (Part 0, A0.1). NO flow-based layout
- [ ] **Z-Index Layers**: Render in strict order: Layer 0 (bg fill) → Layer 1 (decorative, CLIPPED) → Layer 2 (structure lines) → Layer 3 (text)
- [ ] **Typography Weight System**: Use weight/spacing/opacity hierarchy per A0.2 (Kicker: 16pt+3pt spacing+60% opacity; Hero: 45-65pt Heavy; Meta: 20-22pt; Summary: 16-18pt Regular line-height 1.6)
- [ ] **Mandatory Summary Block** 🆕: Every cover MUST include a Summary/Description drawer (2-4 lines). If user provides none, auto-generate placeholder text (S3.5)
- [ ] **Safety checks**: Hero title overflow (max 3 lines, auto-reduce font S3.1); Zone collision detection (S3.2); Uppercase lock for Latin kickers/footers/watermarks (S3.3); Hard width boundary enforcement (S3.4); Summary auto-generation (S3.5); **Background watermark full-display enforcement (S3.6)**
- [ ] **Background watermark complete** 🆕: All background layer watermark text (year, document type, sidebar text) must be 100% visible within page bounds - auto-shrink font if needed, NEVER clip/truncate
- [ ] **Data binding correct** 🆕: Hero Title = company/entity name (biggest, heaviest text); Kicker = report type/subtitle (small decorative text). NEVER reverse this mapping
- [ ] **Fill Engine applied** 🆕: Font floor enforced (body ≥ 14pt single-col / 12pt dual-col, H1 ≥ 32pt, H2 ≥ 24pt, H3 ≥ 18pt); Fill Ratio calculated; inflation triggered when < 65%; Y-axis golden-ratio anchor when < 40%
- [ ] **Selected one of templates 01–09**: Report templates 01–05 (light) + Academic 06–08 (dark) + Institutional 09. Autonomously select the best-fit template by analyzing document intent (Calm/Tension/Energy/Authority/Warmth) and document type per Part 2 Intent × Type matrix. Thesis proposals/dissertations/institutional submissions → **default Template 09**. No global default - every selection must be a deliberate design decision
- [ ] **Typography weight hierarchy**: Hero 45-65pt Heavy, Meta 20-22pt Regular, Kicker/Footer 16pt with 3pt letter-spacing + 60% opacity, Summary 16-18pt Regular
- [ ] **Base spacing unit**: `U = W * 0.05` - all spacing should be multiples of U
- [ ] **Bounding box via absolute anchors**: Each block anchored to fixed Y%, grows only within its own zone, never pushes adjacent blocks
- [ ] **Safe zone margin**: 8-12% on all sides per template spec (corner marks for Template 04 at 8%)
- [ ] **Cover whitespace ≥ 60%**: Restraint > clutter (but Summary block fills mid-page void intentionally)
- [ ] **Cover colors consistent with body**: No independent color scheme; white/light backgrounds only
- [ ] **Clip-path on Layer 1**: All background decorative elements must be clipped to page bounds
- [ ] **Clip scope = Layer 1 ONLY** �F: `saveState()`/`clipPath()` must `restoreState()` BEFORE rendering Layer 2 lines and Layer 3 text. Text rendered inside clip scope = text gets cut off
- [ ] **No page border/frame** �F: Cover page must have `showBoundary=0`, no `canvas.rect(0,0,W,H)`, no CSS border/outline on cover container
- [ ] **Line-to-text minimum gap** �F: Decorative lines (Layer 2) must be at least `U` (= `W * 0.05`) away from any text content
- [ ] **No dark/gradient backgrounds**: No dark fills, no gradients, no high-saturation schemes
- [ ] **Hard width enforcement**: Text wraps vertically at zone boundary, NEVER bleeds horizontally past assigned width
- [ ] **✅ Report/Academic covers use ReportLab** — render via `scripts/cover_render.py` (templates 01–09) and merge as page 1 via pypdf. Do NOT build Report/Academic covers with HTML/Playwright. (Creative composes its cover inside its own HTML document.) Pick a template per `typesetting/cover.md` Part 2; pass a palette from `palette.cascade`.
- [ ] **Line-length alignment (S3.7)**: Vertical lines match text block height (± 1U); horizontal lines ≥ widest text element width (never shorter than text)
- [ ] **Vertical balance (S3.8)**: No >40% dead whitespace at bottom; sparse content uses centered distribution; CJK titles 15-20% larger than Latin equivalent
- [ ] **Percentage positioning safety (S3.9)**: Every element with `top: XX%` must have a containing block with deterministic height (`height: 100%`, `inset: 0`, or `top+bottom` pair). Wrappers without explicit height + percentage-positioned children = overlap bug. Prefer px values over percentages
- [ ] **Cover colors from palette system**: All `:root` CSS variables populated by `palette.cascade` output. Template HTML uses `--c-bg`, `--c-accent`, `--c-text`, `--c-muted` — no hardcoded hex values in generated HTML

### Geometric Anchors (geometry.md)

- [ ] **Anchors use only the primary color**: Layer via opacity, don't mix colors
- [ ] **Strokes over fills**: Solid elements ≤ 30%
- [ ] **Ultra-thin lines**: stroke-width 0.3-0.8px
- [ ] **Asymmetric placement**: Offset creates tension
- [ ] **Elements ≤ 8**: Restraint, don't clutter

### Charts (charts.md)

- [ ] **No text stacking/overlap**: All chart labels, values, and legends must be collision-free
- [ ] **Chart-to-text separation**: Minimum 24pt gap above and below charts; 8pt between chart and caption; 30pt between consecutive charts
- [ ] **Legend-to-chart non-overlap**: Legend MUST NOT overlap chart data area. Use `bbox_to_anchor` or external placement
- [ ] **Value label anti-collision**: Adjacent value labels that overlap must be staggered, rotated, or selectively hidden
- [ ] **Pie charts → Donut by default**: hole_ratio 60-70%, center shows total/core metric
- [ ] **Small pie slices handled**: Slices < 5% use leader lines, < 3% merge to "Others", or strip labels to rich legend
- [ ] **Bar chart auto-rotation**: If X-axis labels avg > 5 CJK chars (or 10 Latin), auto-convert to horizontal bars
- [ ] **Line chart labeling**: Only label start, end, max, min points - NOT every data point
- [ ] **Axis cleanup**: Top/right spines deleted, grid lines dashed at 0.5pt/20% opacity (or hidden if values labeled)
- [ ] **Bar micro-rounding**: Top border-radius 2-4px, bar-to-gap ratio 1.5:1 or 2:1
- [ ] **Legend de-boxed**: No border on legend, horizontal layout, small circle markers
- [ ] **Chart title hierarchy**: Bold main title left-aligned above chart, lighter subtitle below it

### Global Layout

- [ ] **Margin symmetry**: `left_margin == right_margin` - asymmetric margins cause off-center content (ReportLab, LaTeX, HTML all checked)
- [ ] **Full-bleed enforcement (Playwright)**: HTML includes `@page { size: <w> <h>; margin: 0; }` and `html,body { margin:0; padding:0; }`. No white side margins in the output PDF
- [ ] **Background color consistency (Playwright)**: `html, body { background }` set explicitly. Single-color docs: match content canvas. Multi-page mixed docs: use the darkest page's background color. Mismatch or missing = sub-pixel white edges on dark pages
- [ ] **Content centering (Playwright)**: Content is centered in PDF, not drifting left or right. Check: symmetric inset/padding, full-width grid columns, no unbalanced max-width
- [ ] **Anti-void edges**: No large meaningless blank areas at top, bottom, or sides. Content fills ≥ 60% of page (multi-page) or ≥ 70% (single-page poster/infographic)
- [ ] **Fill Engine applied**: Pages with < 80% fill ratio trigger the fill engine (see `fill-engine.md`)
- [ ] **Table centering**: ALL tables must be horizontally centered on the page. ReportLab: use `hAlign='CENTER'` on Table flowable. LaTeX: use `\centering` inside table environment. HTML: use `margin: 0 auto` on table element. NEVER let tables float left with right-side whitespace
- [ ] **Table column width**: Table total width should be 85-100% of content area width. Avoid narrow tables (< 60% width) that look lost on the page. If table is narrow, expand column widths proportionally or use `colWidths` to fill available space

### Exam / Quiz / Test Paper Rules

- [ ] **Question numbering**: Use hierarchical numbering (一、二、三 for sections; 1. 2. 3. for questions; (1)(2)(3) or A B C D for sub-questions/options)
- [ ] **Option indentation**: Multiple-choice options MUST be indented relative to the question stem. Minimum `leftIndent = 24pt` (2em). Options must NEVER start at the same X position as the question number
- [ ] **Option layout**: ≤4 short options (≤4 chars each) → 2×2 grid or single row. >4 options or long text → vertical list, one per line. Each option on its own line gets consistent indentation
- [ ] **Answer space reservation**: MUST reserve blank space for handwritten answers. Calculation: short answer = 2-3 blank lines (40-60pt); paragraph/essay = 8-15 blank lines (160-300pt); math work = 6-10 blank lines (120-200pt); fill-in-the-blank = inline underline (min 80pt width). Use `Spacer(1, height)` in ReportLab
- [ ] **Answer line style**: Use light gray dashed or dotted horizontal lines for answer areas, NOT solid black lines. Line weight ≤ 0.5pt, color = #cccccc or lighter
- [ ] **Score marking area**: Each question should have a score indicator in the margin or after the question number, e.g., "(10分)" or "[10 pts]"
- [ ] **Page density**: Exam papers should NOT be cramped. Minimum `spaceBefore=12pt` between questions. Section headers get `spaceBefore=24pt`

### Design Restraint (Anti-Gaudy)

- [ ] **Decorative elements ≤ 3 per page**: Maximum 3 decorative/non-functional visual elements per page (lines, shapes, icons, patterns). Cover page exempt
- [ ] **No gratuitous icons/emoji in headers**: Section headers should use typography hierarchy (size, weight, color) for emphasis — NOT emoji, icons, or decorative bullets unless the user explicitly requested them
- [ ] **No rainbow/multi-color schemes**: Stick to the single-family palette system. If you find yourself using 4+ distinct hue families in one document, STOP and simplify
- [ ] **No decorative borders on body pages**: Body content pages must NOT have decorative borders, corner ornaments, or page frames. Clean margins only. (Cover template 09 border is the sole exception)
- [ ] **No texture/pattern backgrounds on body pages**: Body pages use solid white or ultra-light tinted backgrounds only. No dot grids, crosshatch, diagonal lines, or any pattern fills
- [ ] **Whitespace is design**: Empty space between elements is intentional and valuable. Do NOT fill every gap with decorative elements, horizontal rules, or filler content
- [ ] **Typography over decoration**: Create visual hierarchy through font size, weight, spacing, and color — not through adding more visual elements. If a design looks busy, REMOVE elements rather than rearranging them
- [ ] **2-typeface maximum**: Entire document uses at most 2 font families (one serif, one sans-serif). No mixing 3+ fonts for "variety"
- [ ] **🚫 NO stock images / clipart / AI-generated decorations**: NEVER embed watercolor flowers, floral borders, gold frames, stock photos, clipart illustrations, or AI-generated artwork for decoration. Use geometric shapes (CSS/SVG from geometry.md) + typography for all visual design. Only user-provided content images (photos, logos, diagrams) are allowed. See `visual_framework.md` Stock Image Ban

### LaTeX-Specific (academic.md)

- [ ] **Curly quotes**: No straight `"` quotes - use `` ``text'' `` for double and `` `text' `` for single
- [ ] **Title page isolation**: `\end{titlepage}` followed by `\newpage`/`\clearpage` - TOC/body NEVER on same page as title
- [ ] **Resume column overlap**: AltaCV `paracol` entries checked for vertical overflow; max 3-4 bullets per `\cvevent`; explicit `\newpage` for 2-page resumes
- [ ] **`\geometry` symmetry**: `left=X, right=X` must be equal values

### Output Cleanliness (All Pipelines)

- [ ] **No process artifacts in output**: NEVER include version numbers ("V3"), iteration markers, draft labels ("DRAFT"), "CONFIDENTIAL"/"机密" stamps, "Generated by AI"/"本文档由AI生成", or internal comments in the final PDF unless the user explicitly requested them
- [ ] **No auto-generated boilerplate labels**: Do not add ANY watermarks, generation notices, version numbers, timestamps, or tool names that the user didn't ask for
- [ ] **No debug output in content**: Console logs, file paths, generation timestamps, tool names, or error messages must never appear in the PDF body
- [ ] **Clean metadata only**: PDF metadata (author, title, subject) should reflect the document content, not the generation process
- [ ] **Original input untouched**: the user's original input file is untouched at its original path (unless the user explicitly asked for in-place editing); any backup you created stays next to it — these are NOT temp/retry artifacts
- [ ] **Deliverable is a new file** (`<stem>_updated.pdf`), not the input path overwritten; intermediates from chained operations are cleaned up

## Final response citations

Place `::zcode-file-citation{...}` inline in prose, not in a trailing list. Use `purpose="source"` for Q&A/no-op and `purpose="output"` for create/edit.

- [HARD REQUIREMENT] Create/edit: cite each final file exactly once with a plain output citation. Summarize representative changes; do not cite every section/page or add a separate filename, path, or Markdown link. Example: `Created ::zcode-file-citation{path="/abs/path/launch-plan.docx" purpose="output"}, highlighting the rollout and owners.`
- Q&A: do not edit/re-export.

### Document

For page-specific evidence, use a page number verified against the latest render/inspection.

Locators support only `page_number`; otherwise use a plain citation. Do not guess or add object, label, paragraph, table, or cell IDs. Do not cite intermediates unless asked. Inspect complete relevant pages and preserve material headings, question/table labels, footnotes, sources, and sample sizes; cite each needed page once.

```text
::zcode-file-citation{path="/abs/path/file.docx" purpose="source" artifact_kind="document" page_number=4}
```

### PDF
Citations currently support only plain file citations. Do not add `artifact_kind`, `page_number`, or other locators. Never cite rendered PNGs, scratch files, builders, or QA intermediates unless asked. Inspect the complete relevant pages, preserve material headings, table/figure labels, footnotes, sources, and sample sizes, and cite each source PDF once with a plain source citation.

For non-in-place edits, preserve the source and export a copy; if unchanged, cite the source plainly.

### Presentation

inspect the complete relevant slide, including callouts, question wording, chart/table titles, totals/sample sizes, and source/methodology footers. Answer directly, group same-slide claims, and cite that slide once. For concrete chart/table/image/diagram/callout evidence, include exact inspected `slide_id`, `object_id`, and a useful label when available.

For non-in-place edits, preserve the source and export a copy; if unchanged, cite the source plainly.

Use only locators verified against the latest render/inspection:

```text
::zcode-file-citation{path="/abs/path/deck.pptx" purpose="source" artifact_kind="presentation" slide_number=3}
::zcode-file-citation{path="/abs/path/deck.pptx" purpose="source" artifact_kind="presentation" slide_number=1 slide_id="sl/gs5z1kshq0xv" object_id="ch/pz9t1r3ka8vn" label="ARR by segment chart"}
```

If IDs are not exact, stop at `slide_number`; never guess or cite intermediates unless asked.

### Spreadsheets

- Cite whole-workbook claims plainly; otherwise use the narrowest reliable `sheet` + `range` (the exact cell for a discrete value). Cite discontiguous cells separately. For objects, use `sheet` + exact inspected `object_id`; add `object_kind`/`label` only when useful. Never cite a sheet alone or guess locators.
- Calculations: cite only distinct inputs, drivers, formulas, or results the answer needs.

```text
::zcode-file-citation{path="/abs/path/book.xlsx" purpose="source" artifact_kind="workbook" sheet="Revenue Model" range="C27"}
```

Never cite intermediates unless asked.
