# Common Rules

Shared rules referenced by all scene files. Scene-specific overrides take precedence.

## Default Page Layout

A4 portrait. Unless the scene specifies otherwise, use:

| Property | Value | Twips |
|----------|-------|-------|
| Page width | 21.0 cm | 11906 |
| Page height | 29.7 cm | 16838 |
| Top margin | 2.54 cm | 1440 |
| Bottom margin | 2.54 cm | 1440 |
| Left margin | 3.0 cm | 1701 |
| Right margin | 2.5 cm | 1417 |

```js
page: {
  size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
  margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
}
```

**Scene overrides:**
- **Official doc (GB/T 9704 red-header):** top 2098, bottom 1984, left 1588, right 1474
- **Exam:** top/bottom 1134 (2 cm), left/right 1134 (2 cm)

## Default Font Specifications

Two font profiles exist. Each scene declares which profile it uses.

### Profile A: Formal (report, academic, contract, official-doc, exam)

| Element | CN Font | EN Font | Size | Notes |
|---------|---------|---------|------|-------|
| H1 | SimHei | Times New Roman | 16 pt (size: 32) | Bold, centered |
| H2 | SimHei | Times New Roman | 15 pt (size: 30) | Bold |
| H3 | SimHei | Times New Roman | 14 pt (size: 28) | Bold |
| Body | SimSun | Times New Roman | 12 pt (size: 24) | |
| Caption | SimSun | Times New Roman | 10.5 pt (size: 21) | |

- Text color: always **pure black `"000000"`** (never dark-blue-grey)
- First-line indent: **480 twips** (2 chars at SimSun 12pt)
- Line spacing: **312** (1.3x).
- **Color routing for non-report documents**: When the document is a short-form text (essay, evaluation, letter, speech, application, reflection, etc.) rather than a structured report/whitepaper/proposal/consulting deliverable, heading color MUST use pure black `"000000"` instead of `palette.primary`. Colored headings are reserved for documents that need brand/professional identity (reports with covers, whitepapers, proposals, consulting deliverables).

### Profile B: Visual (resume, copywriting)

| Element | CN Font | EN Font | Size |
|---------|---------|---------|------|
| Name/Title | Microsoft YaHei | Calibri | Varies |
| Body | Microsoft YaHei | Calibri | 10–11 pt |
| Caption | Microsoft YaHei | Calibri | 9 pt |

- First-line indent: **420 twips** (2 chars at YaHei)
- Color: per design-system palette

### Official-Doc Font Override (GB/T 9704)

When `needsRedHeader() = true`:

| Element | Font | Size |
|---------|------|------|
| Red header org name | STXiaoBiaoSong (or SimSun bold) | 26 pt (size: 52) |
| Title | STXiaoBiaoSong (or SimHei) | 22 pt (size: 44) |
| Body | FangSong | 16 pt (size: 32) |
| Section heading | FangSong_GB2312 bold (or HeiTi) | 16 pt (size: 32) |

- Line spacing: **560** (28 pt fixed)
- First-line indent: **640 twips** (2 chars at FangSong 16pt)

## Chinese Font Size Reference

| Name | Points | Half-points (size:) |
|------|--------|---------------------|
| Chu Hao (initial) | 42 | 84 |
| Xiao Chu | 36 | 72 |
| Yi Hao (1st) | 26 | 52 |
| Xiao Yi | 24 | 48 |
| Er Hao (2nd) | 22 | 44 |
| Xiao Er | 18 | 36 |
| San Hao (3rd) | 16 | 32 |
| Xiao San | 15 | 30 |
| Si Hao (4th) | 14 | 28 |
| Xiao Si | 12 | 24 |
| Wu Hao (5th) | 10.5 | 21 |
| Xiao Wu | 9 | 18 |
| Liu Hao (6th) | 7.5 | 15 |

## Placeholder Convention

When required information is missing, use standardized placeholders so users can Find & Replace in Word.

**Format:** Always use full-width brackets `【 】`.

| Type | Format | Example |
|------|--------|---------|
| General field | `【field name】` | Name: `【company name】` |
| Monetary amount | `【RMB in words: yuan (lowercase: ¥)】` | Amount: `【RMB in words】` |
| Date field | `【____/____/____】` | Signing date: `【____/____/____】` |
| Long text | `【Please fill in: ______】` | Delivery criteria: `【Please fill in: ______】` |
| Attachment ref | `【See Appendix 1: ______】` | |

**Rules:**
1. Placeholder format must be consistent throughout the entire document
2. Each placeholder must specify exactly what is needed (never use vague "TBD" or "to be completed")
3. Never hard-code unconfirmed critical facts; use a placeholder instead
4. Never use sloppy expressions like "to be refined", "omitted", "user fills in later"

## Title Orphan Prevention (All Scenes)

Body headings (H1/H2/H3) and cover titles must avoid leaving 1–2 characters alone on the last line. This rule applies to ALL document types.

**For cover titles:** Always use `calcTitleLayout()` + `splitTitleLines()` from `design-system.md` — these handle orphan prevention automatically (merges ≤2-char last lines into the previous line).

**For body headings (H1/H2/H3):** When a heading text is long enough to wrap, apply the same `splitTitleLines()` logic. If the heading would cause a single-character orphan in Word's auto-wrapping, manually split into multiple `TextRun` elements with a `Break` (soft line break) at a semantic boundary.

```js
const { Break } = require("docx");

// Check if heading needs manual line break to prevent orphan
function buildHeadingRuns(text, maxCharsPerLine, runProps) {
  // If text fits in one line, no action needed
  if (text.length <= maxCharsPerLine) {
    return [new TextRun({ text, ...runProps })];
  }
  // Use splitTitleLines to find semantic break points
  const lines = splitTitleLines(text, maxCharsPerLine);
  const runs = [];
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) runs.push(new TextRun({ break: 1, ...runProps, text: "" })); // soft line break
    runs.push(new TextRun({ text: lines[i], ...runProps }));
  }
  return runs;
}
```

**Estimation for maxCharsPerLine:** For centered headings, estimate available width = page width - left margin - right margin. For SimHei at a given pt size, each CJK char ≈ pt × 20 twips wide. Divide available width by char width to get `maxCharsPerLine`.

---

## Undefined / Null Value Prevention (Mandatory)

Generated code MUST guard against outputting literal `undefined`, `null`, `NaN`, or empty strings for any visible text field. This is a **hard requirement** — these are never acceptable in a delivered document.

```js
// ✅ MANDATORY: Safe text helper — use for ALL user-facing text values
function safeText(value, placeholder) {
  if (value === undefined || value === null || value === "" || String(value) === "NaN" || String(value) === "undefined") {
    return placeholder || "【Please fill in】";
  }
  return String(value);
}

// Usage:
new TextRun({ text: safeText(config.contact, "【Contact person】") })
new TextRun({ text: safeText(row.phone, "【Phone number】") })
```

**Rules:**
1. Every `TextRun` displaying user-provided or config-derived data MUST use `safeText()` or equivalent guard
2. If a field is optional and not provided, use `【Please fill in: field_name】` placeholder (full-width brackets)
3. Table cells with missing data: show `【Please fill in】`, never leave as empty string or undefined
4. This applies to ALL scenes — contracts, reports, academic, exams, etc.

---

## WPS / Office Word Compatibility (Mandatory)

Generated .docx files must render consistently in both Microsoft Office Word and WPS Office. The following OOXML features have known compatibility issues — avoid or use carefully.

### Features to AVOID (high incompatibility risk)

| Feature | Issue | Alternative |
|---------|-------|------------|
| **Text-character decorative lines** (e.g., `───`, `━━━`, `═══`, `——————`) | Character-drawn lines depend on font metrics and rendering engine — they appear different widths/lengths in MS Office vs WPS, often truncated or misaligned. They cannot span a controlled width. | **Always use paragraph borders** (`border.top`, `border.bottom`) for horizontal decorative lines. Paragraph borders render consistently across engines and respect indent for precise width control. See recipe R2 for correct implementation. |
| **Default table borders on cover wrapper tables** (forgetting `allNoBorders`) | docx-js default table borders are `single/auto/sz=4`. On the 16838-high cover wrapper, these borders add ~8 twips of extra height per edge. MS Office includes border thickness in height calculation, causing content to overflow by a few twips → **blank page 2**. WPS is more lenient and may absorb the overflow. | **Every cover wrapper table MUST explicitly set `borders: allNoBorders`** (all 6 border positions = NONE). Never rely on defaults. Define the `allNoBorders` constant and use it consistently. |
| `verticalAlign: "center"` or `"bottom"` in exact-height TableRow | WPS ignores vertical alignment in exact-height rows; content may clip or shift | Use `verticalAlign: "top"` + `spacing.before` to position content. Avoid `margins.top`/`margins.bottom` in exact-height cells — they reduce available height unpredictably across engines |
| `characterSpacing` (large values) | WPS renders differently from Word; letter spacing may collapse or expand | Keep `characterSpacing` ≤ 80; for cover English labels, test both renderers |
| `margins.top`/`margins.bottom` inside exact-height cells | MS Office and WPS calculate remaining height differently when cell margins are present | Use `spacing.before` on the first paragraph for vertical positioning; only use `margins.left`/`margins.right` |
| Complex nested Tables inside exact-height cells | WPS height calculation differs from Word; content may overflow or clip | Wrap everything in a single 16838 outer wrapper cell (R1 architecture). Nested tables inside are acceptable when the outer wrapper provides a safety net |
| Large font without explicit `spacing.line` | Paragraph inherits small line spacing from document default (e.g., 560tw for body); font taller than line height → top of characters clipped | Always set `spacing: { line: fontPt * 23, lineRule: "atLeast" }` on paragraphs with font size > body text |
| `ShadingType.SOLID` | WPS shows solid black instead of intended color | Always use `ShadingType.CLEAR` |
| OOXML raw XML for columns (`w:cols`) | WPS column rendering may differ | Use only when explicitly needed (A3 exam papers); test output |
| `titlePage: true` with complex headers/footers | WPS may not properly suppress first-page header/footer | Use separate sections instead of titlePage flag |
| Tab stops for alignment | WPS tab width may differ from Word | Use borderless Tables for alignment instead |

### Features that are SAFE (consistent rendering)

| Feature | Notes |
|---------|-------|
| Borderless Tables for layout | Both renderers handle well |
| `ShadingType.CLEAR` with fill color | Consistent |
| `rule: "exact"` on single-level TableRow | Works in both (avoid with nested Tables) |
| Paragraph borders (left, bottom, etc.) | Consistent |
| `spacing.before` / `spacing.after` | Consistent |
| Standard fonts (SimHei, SimSun, YaHei, TNR, Calibri) | Available on both platforms |
| `PageBreak` inside Paragraph | Consistent |
| Section breaks (`SectionType.NEXT_PAGE`) | Consistent |

### Mandatory Compatibility Checks (Post-Generation)

Add to quality self-check:
- [ ] No `ShadingType.SOLID` anywhere (search codebase)
- [ ] No `verticalAlign: "center"` or `"bottom"` in exact-height rows
- [ ] No tab-stop alignment for party info or data alignment (use Tables)
- [ ] Covers use the 16838 outer wrapper architecture (R1 pattern) with `spacing.before` for positioning; no `margins.top`/`margins.bottom` in exact-height cells
- [ ] **Cover section margin = `{ top: 0, bottom: 0, left: 0, right: 0 }`** — non-zero margins cause wrapper to shrink away from page edges
- [ ] **Cover wrapper row has `height: { value: 16838, rule: "exact" }`** — without this, content overflows or leaves whitespace
- [ ] **Cover is in a separate section from body content** — cover and body must not share a section
- [ ] **Cover wrapper table uses explicit `allNoBorders`** — never rely on default table borders (causes blank page 2 in MS Office)
- [ ] **No text-character decorative lines** (`───`, `━━━`, `═══`, `——————`) — use paragraph borders instead
- [ ] `characterSpacing` values ≤ 80 throughout
- [ ] TOC: follow `references/toc.md` checklist (heading style, TableOfContents element, PageBreak, post-processing script)
- [ ] All tables use `WidthType.PERCENTAGE` for column widths (WPS tblGrid bug; if DXA is unavoidable, set `columnWidths` explicitly)

```js
// ✅ Correct — percentage widths, WPS-safe
new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [new TableRow({ children: [
    new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [...] }),
    new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [...] }),
  ]})],
});

// ❌ WRONG — DXA widths cause WPS tblGrid mismatch (all gridCol=100)
new TableCell({ width: { size: 3000, type: WidthType.DXA }, ... })
```

---

## Universal Prohibitions

These apply to ALL scenes. Scene files may add scene-specific prohibitions.

1. **No outlines-only** — always produce a complete, finished document
2. **No chat-style output** — the document must not read like a conversation or explanation
3. **No fake TOC / page numbers / headers** — use proper docx-js structures
4. **No excessive blank lines** to pad layout
5. **No dirty formatting** — no stray annotations, template fragments, broken hyperlinks, garbled markers
6. **No sloppy placeholders** — "TBD", "omitted", "略", "to be refined" are forbidden; use proper `【】` placeholders
7. **No fabricated data** — do not invent statistics, citations, legal references, or facts to appear professional
8. **No inconsistent heading/numbering** — one numbering system per document, no level-skipping
9. **No Markdown artifacts** — no `#`, `**`, `-` list markers, `>` blockquotes, and **no Markdown table syntax** (`| col1 | col2 |`, `|---|---|`) in the final docx. Any tabular data MUST be rendered as a proper docx `Table` object — never as plain-text pipe-delimited lines. This applies to ALL scenes including exam paper data tables, report statistics, and academic result tables.
10. **No bullet-list documents** — body text must be proper paragraphs, not endless bullet points

## Letter / Correspondence Format (Universal)

When generating any letter-style document (invitation letter, thank-you letter, cover letter, recommendation letter, English essay in letter format, etc.), the following layout rules apply regardless of scene:

1. **Complimentary close and sender name MUST be right-aligned** — e.g., "Yours sincerely,", "Best regards,", "Yours,", and the sender name below it must use `alignment: AlignmentType.RIGHT`
2. **Date** — if placed at the top of the letter, right-aligned; if at the bottom, right-aligned with the closing
3. **Salutation** ("Dear Mr. Smith," / "Dear Mike,") — left-aligned, followed by a blank line or `spacing.after`
4. **Body paragraphs** — left-aligned (English) or justified (CJK), with appropriate `spacing.after` between paragraphs

```js
// ✅ Correct — closing and sender right-aligned
new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 400 },
  children: [new TextRun({ text: "Yours sincerely,", size: 24 })] }),
new Paragraph({ alignment: AlignmentType.RIGHT,
  children: [new TextRun({ text: "Li Hua", size: 24 })] }),

// ❌ WRONG — closing left-aligned (default)
new Paragraph({
  children: [new TextRun({ text: "Yours sincerely," })] }),
```

## Quality Self-Check (Universal)

→ See **SKILL.md § Post-Generation — Two-Layer Verification** for the complete checklist.

Scene files add scene-specific checks on top of that universal checklist.

## Execution Priority

When rules conflict, follow this precedence (highest first):

1. **User-provided template or explicit instructions** — always override defaults
2. **Scene-specific rules** — override common rules and design-system defaults
3. **Common rules** (this file) — override design-system aesthetic defaults
4. **Design-system defaults** — baseline aesthetics

## Cover Recipes

See `references/design-system.md` for the 7 validated cover recipes (R1–R7) and 14 color palettes.

Cover recipe selection: `selectCoverRecipe(docType, industry, titleLength)` — defined in `references/design-system.md` (authoritative source).

---

## Cover Title Layout Rules (Mandatory)

These rules apply to ALL cover recipes (R1–R7). They prevent the most common cover quality issues: title overflow, content spilling to page 2, and mid-word line breaks.

### Rule 1: Always use `calcTitleLayout()`

Every cover MUST call `calcTitleLayout(title, availableWidth)` from `design-system.md` to determine:
- **Font size** (dynamically calculated, never hardcoded above 40pt)
- **Line breaks** (semantically split, never mid-word)

**Forbidden:** Passing the full title as a single long TextRun and letting Word auto-wrap. This causes uncontrolled line breaks at arbitrary character positions.

### Rule 2: No single-character orphan lines

If the last line of a title contains only 1–2 characters, merge it into the previous line. The `splitTitleLines()` function handles this automatically.

### Rule 3: No mid-word breaks for CJK text

Line breaks must occur at semantic boundaries: after particles (e.g., de/yu/he/ji/zhi), punctuation, connectors, spaces, or underscores. Never split a compound term (e.g., a 4-character term like a management specification must not be split into 3+1 characters).

For mixed Chinese+English titles (e.g., "基于Transformer架构的..."), use `estimateTextWidth()` instead of character count for line break calculation. Chinese characters are ~2× wider than English characters at the same font size.

### Rule 4: Maximum 3 title lines on cover

Cover titles must not exceed 3 lines. If the title is too long, reduce font size (down to minimum 24pt) before adding more lines. If it still exceeds 3 lines at 24pt, force 3 lines with longer line lengths.

### Rule 5: Always use `calcCoverSpacing()` for whitespace

Spacing values (`spacing.before`) in cover elements must be dynamically calculated, not hardcoded. Fixed values like `before: 4500` assume a specific title length and will cause overflow with longer titles.

### Rule 6: Cover height budget validation

Before generating, verify that total content height stays within 15638 twips (16838 page height minus 1200 twips safety margin — MS Office renders large fonts taller than calculated). Each recipe in `design-system.md` includes height budget annotations — verify during generation.

### Rule 7: R5 meta info table (academic covers)

Academic cover meta info must use a 2-column table with **percentage widths only** (NOT DXA — WPS breaks with DXA widths):
- **Table width:** adaptive 55–75% of page, calculated by `calcR5MetaLayout()` in `design-system.md`. Table is centered via `alignment: CENTER`.
- **Label column:** adaptive 25–45% of table width, **LEFT aligned**, plain text label + "：". NO full-width space padding, NO right-alignment, NO distributed alignment.
- **Value column:** remaining percentage, **LEFT aligned**, `bottom border single sz=4` = fixed-length underline (same length for all rows regardless of value text length).
- **Label column borders:** none (NO bottom border on label cells).
- ⚠️ Do NOT use DXA widths, full-width space padding (`\u3000`), spacer columns, or tab stops — these render inconsistently between MS Office and WPS.

### Rule 8: Large font paragraphs must set explicit line spacing

When a paragraph uses a font size larger than the document body text (e.g., cover titles at 36pt+), it **MUST** set explicit `spacing.line` to prevent clipping. Without it, the paragraph inherits the document/style default line spacing (often 560 twips for body text), which is smaller than the font height → the top of characters gets clipped.

**Formula:** `spacing.line = Math.ceil(fontPt * 23)` with `lineRule: "atLeast"`

**Example:** A 36pt title needs `spacing: { line: 828, lineRule: "atLeast" }`. Without this, the inherited `line=560` clips the top 160 twips of the text.

This applies to ALL large-font paragraphs (cover titles, chapter headings, decorative text), not just covers.

### Rule 9: Every TextRun on a colored background MUST set explicit `color`

⚠️ **CRITICAL:** When a TextRun is inside a cell/area with a dark or colored background (shading), it **MUST** explicitly set the `color` property. Omitting `color` defaults to black (`#000000`), which is invisible on dark backgrounds.

**Common mistake:** Subtitle or meta text on R1/R2/R4 dark cover blocks without `color` → appears as invisible black text on dark bg.

**Rule:** For any TextRun inside a shaded cell:
- Use `P.cover.titleColor` for title text
- Use `P.cover.subtitleColor` for subtitle text
- Use `P.cover.metaColor` for meta info text
- Use `P.cover.footerColor` for footer text
- **NEVER** rely on default color when background is not white

### Rule 10: Page number API nesting and 3-section numbering

⚠️ **CRITICAL:** Page number settings MUST be nested inside `page.pageNumbers`:

```js
// ❌ WRONG — docx-js ignores top-level pageNumberStart/pageNumberFormatType
properties: { pageNumberStart: 1, pageNumberFormatType: NumberFormat.DECIMAL }

// ✅ CORRECT
properties: { page: { pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } } }
```

**Standard page numbering (5-zone convention):**

All multi-section documents MUST follow this five-zone page numbering scheme unless the user explicitly requests otherwise.

| Zone | Section | pageNumbers | Footer instrText | Notes |
|------|---------|-------------|-----------------|-------|
| 1. Cover | Title page | None (no footer) | — | Always logical page 1, but number is **hidden** |
| 2. Front matter | Abstract, TOC, Preface | `{ start: 1, formatType: UPPER_ROMAN }` | `PAGE \* ROMAN \* MERGEFORMAT` | Separate Roman numeral sequence (i, ii, iii…) |
| 3. Body | Main content | `{ start: 1, formatType: DECIMAL }` | `PAGE \* arabic \* MERGEFORMAT` | **Resets to 1** |
| 4. Appendix | Appendices (A, B, C…) | Continues body (no reset) | Same as body | No section break needed unless different headers required |
| 5. References | Bibliography | Continues body (no reset) | Same as body | If body ends on p.42, references continue from p.43 |

**Key rules:**
0. **NEVER use "Page X of Y" denominator format.** Footer must show only the current page number (e.g., `1`, `2`, `iii`). Do NOT display total page count. No `Page 3 of 12`, no `3 / 12`, no `第3页/共12页`. Just the bare number. `PageNumber.TOTAL_PAGES` / `NUMPAGES` is **FORBIDDEN** in footers.
1. **Cover is always page 1 internally** but the page number is never displayed. Suppress footer in cover section.
2. **Front matter uses independent Roman numerals** starting at `i`. This sequence is separate from the body.
3. **Body resets to Arabic 1.** The first page of main content is always page `1`.
4. **Appendix and references continue the body sequence.** No reset between body → appendix → references.
5. **Documents without front matter** skip zone 2 (cover hidden, body starts at Arabic 1).
6. **Documents without cover** start body (or front matter) at page 1 directly.
7. **Short documents (≤3 pages):** simple Arabic 1, 2, 3 throughout, no cover/frontmatter distinction.
8. **Single-page documents** (certificates, letters): no page numbering at all.

**3-section docx-js implementation (for documents with TOC):**

At minimum, implement zones 1–3 as separate docx sections:

```js
// Section 1: Cover — no page number
properties: { page: { /* no pageNumbers */ } }
// No footer children, or empty footer

// Section 2: Front matter — Roman numerals
properties: { page: { pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN } } }
// Footer: PAGE \* ROMAN \* MERGEFORMAT

// Section 3: Body — Arabic, reset to 1
properties: { page: { pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } } }
// Footer: PAGE \* arabic \* MERGEFORMAT

// Appendix and References: same section as body (continues numbering)
// Only create a new section if different header/footer content is needed
```

**Post-processing required** (WPS compatibility):
1. Remove empty `<w:pgNumType/>` from cover section XML
2. Patch footer instrText: replace bare `PAGE` with format-specific `PAGE \* ROMAN` or `PAGE \* arabic`

See `toc.md` § Page Number API for full details.
