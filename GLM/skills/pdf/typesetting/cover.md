# Cover Design V4.0 — ReportLab Cover Engine

> The cover is the first impression. Either skip it, or build it like architecture.

**As of V4.0 all covers are rendered with ReportLab** (pure Python), via
`scripts/cover_render.py`. HTML/Playwright/Chromium is **no longer used or required**
for covers. The Creative route still composes its cover inside the same HTML document
(see `briefs/creative.md`); everything else (Report, Academic) uses the ReportLab engine.

---

## ⚠️ Critical Rules (Read First)

1. **Cover is OPTIONAL.** Do NOT force a cover on documents that don't need one. When in doubt, skip.
2. **Unified ReportLab cover engine.** Report route uses templates **01–05**; Academic route uses **06–08** (dark, scholarly) and **09** (institutional, white + black frame). All are produced by `cover_render.py` and merged as page 1 via pypdf.
3. **Single PDF output.** Never deliver a separate cover PDF.
   - **Report**: cover PDF (`cover_render.py`) + body PDF (ReportLab) → merged via pypdf.
   - **Academic**: cover PDF (`cover_render.py`) + body PDF (Tectonic) → merged via pypdf.
   - **Creative**: cover is part of the same HTML document → single PDF inherently.
4. **Page isolation.** The cover must NEVER share a page with TOC or body content. The pypdf merge makes this inherent for Report/Academic.

---

## When to Include a Cover

| Document Type | Cover Needed | Notes |
|---------------|-------------|-------|
| Formal report (annual, research, white paper) | ✅ Required | Conveys professionalism |
| Proposal / plan | ✅ Required | First impression matters |
| Resume | ❌ Not needed | Content itself is the cover |
| Menu / flyer / card | ❌ Not needed | Single page / functional |
| Invitation | ❌ Not needed | The front side IS the cover |
| Lab report / academic paper | ⚠️ Situational | Add when template requires it |
| Portfolio / lookbook | ✅ Required | Cover sets the tone |

---

## Usage (the only supported path)

```bash
# Render one cover to a single-page A4 PDF
python3 "$PDF_SKILL_DIR/scripts/cover_render.py" 03 --out cover.pdf --content content.json
# Or from Python:
#   from cover_render import render_cover, detect_fonts
#   render_cover("03", content_dict, "cover.pdf", palette=palette_dict)
# Then merge as page 1 of the body PDF (see briefs/report.md → insert_cover()).
```

`content.json` keys by template family:

- **Report (01–05)**: `kicker`, `hero`, `summary`, `meta`, optional `footer` / `footer_left` / `footer_right`, `year`, `word`.
- **Academic (06–08)**: `label`, `title`, `subtitle`, `authors`, `institution`, `keywords_lines` (list, template 08), `footer_left`, `footer_right`.
- **Institutional (09)**: `institution`, `doc_type`, `title`, `fields` (list of `[label, value]`), `date`, optional `style: "kai"` for a KaiTi (楷体) traditional look.

**Palette:** pass a dict overriding `DEFAULT_PALETTE` (keys: `primary`, `secondary`, `text`, `muted`, `bg`, and for dark academic covers `ac_bg`, `ac_accent`, `ac_gold`, `ac_text`, `ac_muted`, `ac_foot`). Generate via `pdf.py palette.cascade --format json` and map into these keys. Cover colors MUST match the body theme.

---

# PART 0: ENGINE ARCHITECTURE (Mandatory)

These principles are baked into `cover_render.py`. Understand them before customizing.

## A0.0 — Coordinate system

ReportLab uses a **bottom-left origin**. The engine works on an A4 page (595.28 × 841.89 pt)
but expresses positions as fractions of a 794 × 1123 px design canvas (A4 @ 96 dpi), converting
px → pt (× 0.75) for positions/line-widths and mapping CSS-pt font sizes 1:1. Helpers:  
`X(px)`, `LW(px)`, `VH(px)`, `YT(px)` (top-px → bottom-left y), `FSpx(px)`.

## A0.1 — Absolute anchor grid (no flow layout)

Every block gets an **absolute Y-anchor** (fraction of page height). Blocks grow only within
their own bounding box; they never push or compress neighbors. This eliminates squished/overflow bugs.

## A0.2 — Typography weight & spacing system

| Role | Size | Weight | Letter-spacing | Line-height | Purpose |
|------|------|--------|----------------|-------------|---------|
| Kicker / Footer | 16pt | Regular | 3pt | — | Wide + muted → recessive |
| Summary | 16–18pt | Regular | normal | 1.6 | Fills mid-page void (2–4 lines) |
| Meta / Subtitle | 16–22pt | Light/Regular | normal | 1.4–1.8 | Secondary hierarchy |
| Hero Title | 45–66pt (CJK) | Heavy | normal | 1.15 | Dominates the page |

**Data-to-drawer binding (iron rule):** Hero Title = company/entity name (largest, heaviest).  
Kicker = report type/subtitle (small decorative). Never reverse.

**Mandatory Summary block:** every report cover includes a 2–4 line summary. If the user gives
none, auto-generate a neutral one — a title-only cover looks barren.

## A0.3 — Z-index layers (render order in ReportLab)

Draw strictly in order; there is no CSS clip — just draw background elements first and keep
decorative fills within page bounds:

1. **Layer 0** — background fill (white / light gray / dark for academic). Full page, drawn first.
2. **Layer 1** — decorative (grids, watermark letters, sidebar pillar). Clip to page via `canvas.clipPath` when an element could exceed bounds (e.g. template 05 sidebar watermark).
3. **Layer 2** — structure (thin lines, dividers, corner marks).
4. **Layer 3** — text content, drawn last, always on top.

**No page border/frame** except template 09's intentional black frame. Never `canvas.rect(0,0,W,H)` a border on other templates.

**Minimum line-to-text gap = U = W × 0.05** (~40px). Decorative lines must not touch text.

---

# PART 1: NINE COVER TEMPLATES

Rendered by `cover_render.py`. Positions below are fractions of the design canvas.

## 01 — HUD Data Terminal *(light · sans)*
Ultra-thick 6px left vertical anchor line at x=0.12W (0.10H→0.90H) + faint 2% grid. Content left edge x=0.12W+30px. Kicker@0.15H, Hero@0.28H (66pt heavy), Summary@0.48H (w 0.6W), 1pt meta separator@0.72H, Meta@0.74H.  
**Best for:** technology reports, data analysis, dashboards, technical white papers.

## 02 — Corporate Editorial *(light · sans)*
Top bar (15px, primary, edge-to-edge) + giant year watermark (180pt, right edge, 5% opacity) + 4px right accent line (0.88W, 0.75H→0.88H). Title group left@0.12W/0.15H (kicker→hero 60pt). Summary@0.50H (w 0.5W). Meta right-aligned to 0.88W−20 @0.70H.  
**Best for:** annual reports, financial summaries, investor / governance docs.

## 03 — Monolith *(light · sans)*
Hard-left everything + right-side vertical watermark word (rotated, ~4% opacity) as counterweight. Color dash 50×5px@0.12W/0.15H. Kicker@0.20H, Hero@0.28H (60pt), Summary@0.45H (w 0.55W, must not collide with watermark), Meta@0.70H with 2px vertical accent line, Footer@0.90H right-aligned.  
**Best for:** white papers, proposals, government documents, technical standards.

## 04 — Museum Minimal *(light · sans)*
Four inward L-shaped corner crop marks (inset M=0.08W, arm 30px, 2px, 60% opacity) form a force-field box; all content vertically centered and center-aligned. Kicker→Title→Summary→Meta pre-composed and centered as one block. Summary width ≤ 0.6W; kicker/hero/meta up to 0.84W.  
**Best for:** portfolios, gallery catalogs, exhibition materials, luxury/editorial.

## 05 — Solid Sidebar *(light · sans)*
Massive left solid pillar (width 0.1W, full height, primary) with a rotated watermark inside (white 15%, clipped to sidebar). Content block left edge = 0.1W+40px, vertically centered. Bottom 1px line@0.90H (30% opacity); footer left/right on it.  
**Best for:** government/institutional reports, legal docs, bidding documents.

## 06 — Academic Vertical Anchor *(dark · serif title)*
Dark bg (#162032). Left 2.5px gold vertical accent (76→H−76). Label@132px (9pt, accent, tracked), Title@228px (30pt serif), Subtitle@560px (12pt muted), Authors@700px, Institution@740px, footer split bottom. Bottom 0.5px accent hairline.  
**Best for:** arXiv preprints, technical reports.

## 07 — Academic Symmetric *(dark · serif title)*
Dark bg. Two 2px accent rules top (114px) and bottom (H−114). Centered block: Label → Title (28pt serif) → Subtitle → short divider → Authors → Institution. Centered footer.  
**Best for:** IEEE/ACM papers, English theses.

## 08 — Academic Journal *(dark · serif title)*
Like 07 with a dedicated keywords block (`keywords_lines`) instead of authors/institution, and a wider (152px) divider. Title 30pt serif.  
**Best for:** CJK journal submissions, theses with keywords.

## 09 — Institutional *(white + black frame)*
2.5px black border frame (inset 40px L/R, 56px T/B). Centered stack with flex-style spacing: Institution (30pt serif, tracked) → 70%-width 2px divider → Doc type (22pt, tracked) → Title (24pt serif, max-width 520px) → wide gap → structured fields (label + centered underline value, 5–7 rows) → Date pinned near the bottom. Set `style: "kai"` for a KaiTi (楷体) traditional-thesis look.  
**Best for:** thesis proposals (开题报告), dissertations, government/official submissions.

---

# PART 2: TEMPLATE SELECTION GUIDE

Two-dimensional: **Intent** × **Document Type**. No global default — choose deliberately.

| Intent | Document Type | Recommended | Default |
|--------|---------------|-------------|---------|
| Calm | Healthcare / Wellness / Minimalist | 04, 01 | **04** |
| Calm | Academic / Research | 07, 03 | **07** |
| Tension | Crisis / Alert / Disruption | 01, 03 | **01** |
| Energy | Marketing / Creative / Design | 04, 02 | **04** |
| Energy | Technology / Data | 01, 03 | **01** |
| Authority | Formal / Corporate / Financial | 02, 03 | **03** |
| Authority | Government / Bidding | 05, 03, **09** | **05** |
| Authority | Thesis proposal / Dissertation cover | **09** | **09** |
| Authority | Luxury / Editorial | 03, 04 | **03** |
| Warmth | Food / Lifestyle / Home | 04, 02 | **04** |

Academic paper selection: arXiv/preprint → **06**; IEEE/ACM/English thesis → **07**; CJK journal / thesis with keywords → **08**; institutional/proposal/government → **09**.

> **Migration note (V4.0):** the old HTML templates were renumbered and two were removed —  
> old *05 Floating Diagonal* and *06 Swiss Grid* are **gone**. Old 07→**05**, 08→**06**, 09→**07**,  
> 10→**08**, 11→**09**. Anything that previously selected the Diagonal or Swiss Grid should use  
> **03 Monolith** (structured/authoritative) or **01 HUD** (data/energy) instead.

---

# PART 3: FONTS (host-detected, style-driven)

`cover_render.detect_fonts()` picks **embeddable** fonts present on the host, by role:

| Role | Used by | Priority (first embeddable wins) |
|------|---------|-----------------------------------|
| **sans** | Report covers 01–05 (hero/body), academic meta | SimHei → Microsoft YaHei → Heiti SC → WenQuanYi Zen Hei → Arial Unicode → `fc-list` fallback |
| **serif** | Academic titles 06–08, institutional 09 | Songti SC → SimSun → STSong → AR PL UMing → `fc-list` fallback |
| **kai** | Institutional 09 when `style:"kai"` | KaiTi / SimKai → Kaiti SC |
| **latin** | Latin runs | Times New Roman → (falls back to the CJK face, which covers Latin) |

**Iron rules:**
- **ReportLab can only embed TrueType-outline fonts.** CFF/PostScript-outline fonts —  
  **PingFang, Hiragino, Noto Sans/Serif CJK OTC, Source Han** — cannot be embedded via  
  `TTFont` and are automatically skipped by `_try_register()`.
- **Heavy weight:** report heroes need a Black/Heavy look. When no heavy face exists, the engine
  applies **faux-bold** (same-color multi-offset overprint) — do not hand-stroke text.
- **Missing font role:** fall back per the priority chain; if a whole role is unavailable, the
  engine reuses another available CJK face rather than rendering tofu. If *no* embeddable CJK
  font exists at all, `detect_fonts()` raises with an install hint (do not silently emit boxes).
- **Style follows the cover:** sans covers (01–05) use the sans face; academic/institutional  
  (06–09) use the serif (or kai) face. This mapping is fixed in the templates.

---

# PART 4: COVER COLOR RULES

```
Cover primary    = Body theme color
Cover secondary  = Primary lightness variant (±20% L)
Cover background = White / very light gray / (academic 06–08: dark scholarly bg)
```

**Forbidden (light covers 01–05, 09):** dark large-area fills, gradients as large fills,
high-saturation schemes, rainbow palettes, dense textures, >2 typefaces, clip-art/stock imagery.

**Academic exemption:** templates 06–08 use dark backgrounds by design (scholarly convention).  
Template 09 is white with a black frame by design.

Generate colors with `pdf.py palette.cascade --title "<title>" --format json` and map into the
palette dict; never hand-pick hex.

---

# PART 5: SAFETY (enforced in the engine)

- **Hero overflow:** hero wraps within its width (CJK any-char); keep ≤ 3 lines, floor 40pt.
- **Hard width:** text may add lines (grow vertically) but must never exceed its horizontal width.
- **Summary auto-fill:** generate placeholder summary if none provided.
- **Watermark full-display:** background watermark text must be 100% on-page; scale down, never crop.
- **Line-length alignment:** vertical lines ≈ adjacent text-block height; horizontal lines ≥ widest text in zone.
- **Vertical balance:** center sparse content; no >40% dead whitespace at the bottom.

---

# PART 6: CHANGELOG

| Version | Date | Changes |
|---------|------|---------|
| V3.0 | 2026-04-07 | HTML/Playwright unified cover system (11 templates). |
| **V4.0** | **2026-08-17** | **ReportLab cover engine.** All Report/Academic covers now rendered by `scripts/cover_render.py` (pure Python) — HTML/Playwright/Chromium no longer used for covers. Templates renumbered to **01–09**; removed *Floating Diagonal* and *Swiss Grid*. Host-detected, style-driven fonts (CFF fonts skipped; faux-bold for missing heavy weights). Selection matrix remapped. |
