# Scene: Academic / Thesis

## Palette

**Academic Dark** (Cool + Heavy + Calm) — Academic papers use **pure black body text**. Palette only for cover decoration and minimal title scenarios.

```js
const palette = {
  primary: "#000000",   // Title — pure black
  body: "#000000",      // Body — pure black
  secondary: "#333333", // Header/caption — dark grey
  accent: "#8B7E5A",    // Cover decoration line — cover only
  surface: "#F5F7FA",   // Table header light bg — three-line tables only
};
```

⚠️ **Body text color must be pure black `"000000"`**. No decorative dark-blue-grey. Academic papers require print-friendly, black-and-white clarity.

→ Placeholder convention & universal prohibitions — see `references/common-rules.md`  
→ **Note:** This scene uses Profile A fonts with academic-specific overrides below.

---

## Page Layout

| Property | Value | Twips |
|----------|-------|-------|
| Top margin | 2.54 cm | 1440 |
| Bottom margin | 2.54 cm | 1440 |
| Left margin | 3.00 cm | 1701 |
| Right margin | 2.50 cm | 1417 |
| Header distance | 1.5 cm | 850 |
| Footer distance | 1.75 cm | 992 |

```js
page: {
  size: { width: 11906, height: 16838 },
  margin: { top: 1440, bottom: 1440, left: 1701, right: 1417, header: 850, footer: 992 },
}
```

For binding margin, add 0.5–1.0 cm to left (i.e., left: 1985–2268).

---

## Font Specifications

| Element | CN Font | EN Font | Size | half-pt | Style |
|---------|---------|---------|------|---------|-------|
| Thesis title | SimHei | Times New Roman | Xiao Er 18pt | 36 | Bold, centered |
| H1 | SimHei | Times New Roman | San Hao 16pt | 32 | Bold, centered |
| H2 | SimHei | Times New Roman | Xiao San 15pt | 30 | Bold, left |
| H3 | SimHei | Times New Roman | Si Hao 14pt | 28 | Bold, left |
| Body | SimSun | Times New Roman | Xiao Si 12pt | 24 | Normal, justified |
| Abstract title | SimHei | Times New Roman Bold | San Hao 16pt | 32 | Bold, centered |
| Abstract body | SimSun | Times New Roman | Xiao Si 12pt | 24 | Normal, justified |
| Keywords label | SimHei | Times New Roman Bold | Xiao Si 12pt | 24 | Bold |
| Keywords content | SimSun | Times New Roman | Xiao Si 12pt | 24 | Normal |
| Header | SimSun | Times New Roman | Xiao Wu 9pt | 18 | Centered, color 333333 |
| Page number | — | Times New Roman | Xiao Wu 10.5pt | 21 | Centered |
| Footnote | SimSun | Times New Roman | Xiao Wu 9pt | 18 | Normal |
| Figure/table caption | SimSun | Times New Roman | Wu Hao 10.5pt | 21 | Centered |

### Paragraph Format
- Body: justified, first-line indent 2 chars (`firstLine: 480`, SimSun Xiao Si = 480 twips)
- Line spacing: 1.5x (`line: 360`); if school requires fixed 22pt, use `line: 440, lineRule: "exact"`
- Body paragraph spacing: before/after 0pt; heading spacing per styles below

```js
styles: {
  default: {
    document: {
      run: { font: { ascii: "Times New Roman", eastAsia: "SimSun" }, size: 24, color: "000000" },
      paragraph: { spacing: { line: 360 } },
    },
    heading1: {
      run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, bold: true, color: "000000" },
      paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 480, after: 360, line: 360 } },
    },
    heading2: {
      run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 30, bold: true, color: "000000" },
      paragraph: { spacing: { before: 360, after: 240, line: 360 } },
    },
    heading3: {
      run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, bold: true, color: "000000" },
      paragraph: { spacing: { before: 240, after: 120, line: 360 } },
    },
  },
}
```

---

## Heading Numbering System (Mandatory)

### Format

| Level | Format | Example |
|-------|--------|---------|
| H1 | Chapter X + title | 第一章 绪论 (Chapter 1 Introduction) |
| H2 | X.X + section title | 1.1 Research Background |
| H3 | X.X.X + subsection | 1.1.1 Domestic Research Status |

### Mandatory Rules
1. **H1 must use "第X章" format** — not "一、", not "Chapter 1", not "第1章"
2. **H2/H3 use Arabic decimal numbering** (1.1, 1.1.1) — no "(一)", "1)"
3. **No mixing multiple numbering systems**
4. **No level-skipping** (cannot jump from H1 to H3)
5. **All body headings must use `heading: HeadingLevel.HEADING_X`** (TOC depends on this)

```js
// ✅ Correct
new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text: "第一章 绪论", bold: true, size: 32, font: { eastAsia: "SimHei", ascii: "Times New Roman" } })]
})
new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text: "1.1 研究背景", bold: true, size: 30, font: { eastAsia: "SimHei", ascii: "Times New Roman" } })]
})
```

### Non-Body Headings
Abstract, Table of Contents, References, Appendices, Acknowledgments:
- Use H1 style (San Hao SimHei centered) for TOC indexing
- But **no numbering** (write directly: "摘　要", "参考文献", etc. — these are non-numbered standalone section headings)

---

## Document Structure & Multi-Section Architecture

Theses must use **multi-section structure** for independent page numbering and header/footer per section.

### Complete Structure

```
Section 1: Cover           → No page number, no header/footer
Section 2: Chinese Abstract → Roman numerals starting from i
Section 3: English Abstract → Roman numerals continued
Section 4: Table of Contents → Roman numerals continued
Section 5: Body (all chapters) → Arabic numerals from 1
Section 6: References       → Arabic numerals continued
Section 7: Appendices (if any) → Arabic numerals continued
Section 8: Acknowledgments (if any) → Arabic numerals continued
```

### Page Number Implementation

```js
const { NumberFormat } = require("docx");

// Section 1: Cover — no page number
{
  properties: {
    page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } },
    titlePage: true,
  },
  children: buildCover(...),
}

// Section 2: Abstract — Roman numerals from i
{
  properties: {
    type: SectionType.NEXT_PAGE,
    page: {
      margin: { top: 1440, bottom: 1440, left: 1701, right: 1417, header: 850, footer: 992 },
      pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
    },
  },
  headers: { default: buildHeader("Thesis Title") },
  footers: { default: buildPageNumberFooter() },
  children: buildAbstractCN(...),
}

// Section 3: English Abstract — Roman numerals continued (no reset)
{
  properties: {
    type: SectionType.NEXT_PAGE,
    page: {
      margin: { top: 1440, bottom: 1440, left: 1701, right: 1417, header: 850, footer: 992 },
      pageNumbers: { formatType: NumberFormat.UPPER_ROMAN },  // no start → continues from previous
    },
  },
  headers: { default: buildHeader("Thesis Title") },
  footers: { default: buildPageNumberFooter() },
  children: buildAbstractEN(...),
}

// Section 5: Body — Arabic numerals from 1
{
  properties: {
    type: SectionType.NEXT_PAGE,
    page: {
      margin: { top: 1440, bottom: 1440, left: 1701, right: 1417, header: 850, footer: 992 },
      pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
    },
  },
  headers: { default: buildHeader("Thesis Title") },
  footers: { default: buildPageNumberFooter() },
  children: buildMainContent(...),
}
// Section 6+: References/Appendices/Acknowledgments — Arabic continued
```

### Header & Footer Helpers

```js
function buildHeader(title) {
  return new Header({ children: [
    new Paragraph({ alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" } },
      children: [new TextRun({ text: title, size: 18, color: "333333",
        font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
    }),
  ] });
}

function buildPageNumberFooter() {
  return new Footer({ children: [
    new Paragraph({ alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "- ", size: 21 }),
        new TextRun({ children: [PageNumber.CURRENT], size: 21 }),
        new TextRun({ text: " -", size: 21 }),
      ],
    }),
  ] });
}
```

### Page Break Rules
- Cover is a separate section (no PageBreak needed)
- Chinese abstract, English abstract, TOC each in their own section
- All body chapters in **one section** (no forced page breaks between chapters unless user requests)
- References, appendices, acknowledgments each in their own section
- **Never use blank lines instead of section breaks**

---

## Cover

### Information Fields

Cover must include (use placeholders for missing info):

| Field | Format | Placeholder |
|-------|--------|-------------|
| University name | Er Hao SimHei, centered | ×××University |
| Thesis title (CN) | Xiao Er SimHei, centered | (user-provided) |
| Thesis title (EN) | San Hao Times New Roman, centered | (translated from CN) |
| College | Si Hao SimSun | ×××College |
| Major | Si Hao SimSun | ×××Major |
| Author | Si Hao SimSun | ××× |
| Student ID | Si Hao SimSun | ××××××× |
| Advisor | Si Hao SimSun | ×××Professor |
| Date | Si Hao SimSun | 2026/XX |

### Cover Style

Use Recipe R5 (Clean White) or academic-specific `buildAcademicCover()` — never use commercial-style covers.

### Cover Layout Order (Mandatory)

The visual order on academic covers must follow this hierarchy from top to bottom:

1. School name (top)
2. Document type label (e.g., "Undergraduate Thesis", "Thesis Proposal Report")
3. **Thesis title** (prominent, centered)
4. Thesis English title (if bilingual)
5. **Author information table** (college, major, author, student ID, advisor)
6. Date (bottom)

⚠️ **Title MUST appear ABOVE the author info table.** The screenshot issue of info table appearing above the title is caused by incorrect element ordering. The `buildAcademicCover()` and `buildProposalCover()` functions below enforce correct order.

⚠️ **Layout must be vertically balanced** — use dynamic spacing to distribute whitespace evenly. Do not cram all elements into the top half or let large gaps appear between elements.

```js
function buildAcademicCover(info) {
  const { school, title, titleEN, college, major, author, studentId, advisor, date } = info;

  // ⚠️ Use safeText() for all values — never output "undefined"
  const infoRows = [
    ["College", safeText(college, "【College】")],
    ["Major", safeText(major, "【Major】")],
    ["Author", safeText(author, "【Author】")],
    ["Student ID", safeText(studentId, "【Student ID】")],
    ["Advisor", safeText(advisor, "【Advisor】")],
  ];

  const infoTable = new Table({
    width: { size: 60, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    borders: { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB },
    rows: infoRows.map(([label, value]) => new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, top: NB, left: NB, right: NB },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: label + ":", size: 28, font: { eastAsia: "SimHei", ascii: "Times New Roman" } })],
          })],
        }),
        new TableCell({
          borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, top: NB, left: NB, right: NB },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: value, size: 28, font: { eastAsia: "SimSun", ascii: "Times New Roman" } })],
          })],
        }),
      ],
    })),
  });

  // ⚠️ Correct order: school → doc type → TITLE → info table → date
  // ★ Rule 8: All large-font paragraphs must set explicit line spacing
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1200, after: 400, line: Math.ceil(22 * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: safeText(school, "【University Name】"), size: 44, bold: true, font: { eastAsia: "SimHei" } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 800, line: Math.ceil(18 * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: "Undergraduate Thesis", size: 36, font: { eastAsia: "SimHei" } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200, line: Math.ceil(18 * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: safeText(title, "【Thesis Title】"), size: 36, bold: true, font: { eastAsia: "SimHei", ascii: "Times New Roman" } })] }),
    titleEN ? new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1200, line: Math.ceil(16 * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleEN, size: 32, font: { ascii: "Times New Roman" } })] })
      : new Paragraph({ spacing: { after: 1200 }, children: [] }),
    infoTable,
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1200, line: Math.ceil(14 * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: safeText(date, "2026/XX"), size: 28, font: { eastAsia: "SimSun" } })] }),
  ];
}
```

### Thesis Proposal Report Cover (开题报告)

Thesis proposal reports use a similar cover layout but with different document type label. The key layout rule is the same: **title above author info, evenly spaced**.

⚠️ **CRITICAL — Proposal cover MUST be an independent section:**  
The proposal cover MUST be placed in its **own section** (with margin: 0 and a 16838 wrapper table), completely separate from the body content. The body content starts in the **next section** (with `SectionType.NEXT_PAGE` or as a separate section entry). **Never place the cover elements and body content in the same section** — this causes them to render on the same page without any page break, which is the #1 proposal report formatting failure.

```js
// ✅ Correct — cover and body in separate sections
sections: [
  {
    properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
    children: buildProposalCover(info),  // standalone cover section
  },
  {
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 } } },
    children: [...bodyContent],  // body starts here
  },
]

// ❌ WRONG — cover and body in same section (no page separation!)
sections: [
  {
    children: [...coverElements, ...bodyContent],  // everything on one continuous flow
  },
]
```

```js
function buildProposalCover(info) {
  const { school, year, title, subtitle, college, major, author, studentId, advisor, date } = info;

  // ⚠️ Use safeText() for all values
  const infoRows = [
    ["姓名 (Name)", safeText(author, "XXX")],
    ["专业 (Major)", safeText(major, "XXX")],
    ["入学时间 (Enrollment)", safeText(info.enrollment, "XXX")],
  ];

  const infoTable = new Table({
    width: { size: 60, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    borders: { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB },
    rows: infoRows.map(([label, value]) => new TableRow({
      children: [
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, top: NB, left: NB, right: NB },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: label, size: 28, bold: true, font: { eastAsia: "SimHei", ascii: "Times New Roman" } })],
          })],
        }),
        new TableCell({
          borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, top: NB, left: NB, right: NB },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: value, size: 28, font: { eastAsia: "SimSun", ascii: "Times New Roman" } })],
          })],
        }),
      ],
    })),
  });

  // ⚠️ Correct order: doc type label → info table → "论文题目" label → TITLE → subtitle
  // Layout balanced: upper 40% for header + info, middle 20% for title, lower 40% for whitespace
  // ★ Rule 8: All large-font paragraphs must set explicit line spacing
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1500, after: 600, line: Math.ceil(18 * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: safeText(year, "2025") + " 届本科毕业论文开题报告",
        size: 36, bold: true, font: { eastAsia: "SimHei", ascii: "Times New Roman" } })] }),
    infoTable,
    new Paragraph({ spacing: { before: 1200 } }),  // Balanced whitespace
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
      children: [new TextRun({ text: "论文题目", size: 28, font: { eastAsia: "SimSun", ascii: "Times New Roman" } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200, line: Math.ceil(16 * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: safeText(title, "【Thesis Title】"), size: 32, bold: true,
        font: { eastAsia: "SimHei", ascii: "Times New Roman" } })] }),
    subtitle ? new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 800 },
      children: [new TextRun({ text: "——" + subtitle, size: 28,
        font: { eastAsia: "SimSun", ascii: "Times New Roman" } })] })
      : new Paragraph({ spacing: { after: 800 }, children: [] }),
  ];
}
```

### ⚠️ WPS Compatibility Notes for Academic Covers

Both thesis cover and proposal cover use info tables. These MUST follow the cross-engine rules:
- Table uses **percentage widths** (`WidthType.PERCENTAGE`), NOT DXA — WPS renders DXA widths differently in nested contexts
- Table width: adaptive 55–75%, centered via `alignment: CENTER` (calculated by `calcR5MetaLayout()`)
- Label column: **LEFT aligned**, plain text + "：", NO full-width space padding, NO borders
- Value column: **LEFT aligned**, `bottom: single sz=4` border = fixed-length underline
- Cell `margins.top/bottom: 60` is acceptable (small values) but avoid larger values
- All paragraphs with font size > 12pt (body) must set `spacing: { line: Math.ceil(fontPt * 23), lineRule: "atLeast" }` to prevent top clipping (Rule 8)
- ⚠️ Do NOT use DXA widths, full-width space padding (`\u3000`), tab stops, or right-alignment for meta info

⚠️ **Proposal cover must fit on one page.** Use the same height-budget approach as commercial covers — total content height must stay within 15638 twips (1200 twips safety margin). If the title is very long, reduce font size (minimum 24pt).
```

---

## Section Content Standards

### Chinese Abstract
**Format:**
- Title: "摘　要" (space in middle), San Hao SimHei centered, H1 style
- Body: Xiao Si SimSun, justified, first-line indent 480 twips
- Keywords: "关键词：" SimHei bold + content SimSun normal, 3–8 keywords, semicolon-separated

**Content structure (mandatory):**
1. Research background (1–2 sentences)
2. Research problem/purpose (1 sentence)
3. Research method (1–2 sentences)
4. Main results/findings (2–3 sentences)
5. Research significance/value (1 sentence)

⚠️ **Abstract is NOT a TOC summary.** Must not read as "Chapter 1 introduces... Chapter 2 analyzes..."

### English Abstract
- Title: "Abstract", San Hao Times New Roman Bold, centered, H1 style
- Body: Xiao Si Times New Roman, justified
- Keywords: bold label + normal content, 3–8 keywords, comma-separated
- **Must be consistent with Chinese abstract** — no significant shrinkage
- Use formal academic English, avoid Chinglish

### Table of Contents
- Title: "目　录", San Hao SimHei centered
- Use `TableOfContents` field for auto-generation, display at least H1–H2, recommend H3
- Run `"$DOCX_SCRIPTS/add_toc_placeholders.py" --auto` after generation
- TOC on its own page

---

## Body Chapter Structure

### Standard Structure (6-chapter)

```
Chapter 1: Introduction  
  1.1 Research Background  
  1.2 Research Purpose & Significance  
  1.3 Literature Review (Domestic & International)  
  1.4 Research Content & Methods  
  1.5 Thesis Structure

Chapter 2: Theoretical Framework & Literature Review  
  2.1 Core Concept Definitions  
  2.2 Theoretical Basis  
  2.3 Literature Review  
  2.4 Research Gap & Entry Point

Chapter 3: Research Design / Method / Model  
  3.1 Research Framework  
  3.2 Method Design / System Architecture / Algorithm  
  3.3 Variables / Data Sources / Experimental Environment

Chapter 4: Empirical Analysis / Case Study / Results  
  4.1 Data Analysis / Case Description / Experiment Process  
  4.2 Results Presentation  
  4.3 Results Interpretation

Chapter 5: Discussion  
  5.1 Key Findings  
  5.2 Comparison with Existing Research  
  5.3 Limitations

Chapter 6: Conclusions & Outlook  
  6.1 Research Conclusions  
  6.2 Contributions  
  6.3 Limitations  
  6.4 Future Research Directions
```

### Chapter Content Requirements

**Chapter 1 (Introduction):** Must state background, purpose, significance, methods, content, structure.

**Chapter 2 (Literature Review):** Must be systematically organized by theme/method/stage — **never a chronological dump of papers**. Must identify contributions, gaps, and research opportunities.

**Chapter 3 (Method):** Must explain why this method was chosen and its rationale. Content must be understandable, executable, reproducible.

**Chapter 4 (Results):** Must be specific, not vague. Must be consistent with Chapter 3 design.

**Chapter 5 (Discussion):** Must not merely repeat Chapter 4 results. Must explain what results mean and what conclusions they support.

**Chapter 6 (Conclusions):** Must summarize concisely, state contributions, acknowledge limitations, propose future directions. Must end formally — no abrupt ending.

---

## Discipline-Adaptive Routing

Auto-adjust research methods and chapter emphasis by discipline. **When user doesn't specify method, choose the most appropriate research paradigm for the discipline — never mechanically apply "empirical + survey + regression" template.**

### 1. Humanities & Social Sciences (Literature, History, Philosophy, Arts)
**Preferred methods:** Literature analysis, theoretical research, text analysis, comparative studies, historical research
**Adjustments:** Ch.2 focuses on theoretical lineage; Ch.4 becomes text analysis/case argumentation; minimize "variables", "hypotheses", "regression" terminology

### 2. Management / Economics / Public Administration
**Preferred methods:** Case analysis, surveys, model analysis, institutional research, empirical research
**Adjustments:** Ch.3 focuses on hypotheses, variables, framework; Ch.4 on data collection & analysis; Ch.5 adds management implications/policy recommendations

### 3. Computer Science / Engineering / IT
**Preferred methods:** Method design, system architecture, experimental comparison, performance evaluation, algorithm analysis
**Adjustments:** Ch.3 becomes system/algorithm design; Ch.4 becomes experiments (environment, parameters, control experiments, metric comparison); minimize "interviews", "surveys"

### 4. Education / Linguistics / Communication
**Preferred methods:** Teaching experiments, text analysis, survey research, interview research, case studies
**Adjustments:** Ch.3 focuses on subjects, dimensions, samples; Ch.4 on teaching practice/communication case analysis; Ch.5 adds educational implications/communication strategies

### 5. Law / Marxism / Policy Studies
**Preferred methods:** Normative analysis, statutory interpretation, case studies, institutional comparison, theoretical analysis
**Adjustments:** Ch.2 focuses on legal/policy framework; Ch.4 becomes case analysis/institutional comparison; Ch.5 focuses on normative evaluation, reform recommendations

---

## Figure/Table/Formula Numbering (By Chapter)

### Numbering Rules

| Type | Format | Example |
|------|--------|---------|
| Figure | Figure X-Y | Figure 3-1, Figure 4-2 |
| Table | Table X-Y | Table 2-1, Table 4-3 |
| Formula | Eq. (X-Y) | Eq. (3-1), Eq. (5-2) |

Where X = chapter number, Y = sequential number within chapter.

### Figures
- Caption **below** figure, Wu Hao SimSun, centered
- Format: "Figure X-Y Description"
- Must be referenced in text: "as shown in Figure 3-1"

```js
new Paragraph({ alignment: AlignmentType.CENTER,
  children: [new ImageRun({ data: imgBuf, transformation: { width: w, height: h }, type: "png" })] }),
new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 200 },
  children: [new TextRun({ text: "图3-1 System Architecture", size: 21,
    font: { eastAsia: "SimSun", ascii: "Times New Roman" } })] }),
```

### Tables
- Caption **above** table, Wu Hao SimSun, centered, `keepNext: true`
- Format: "Table X-Y Description"
- Must use three-line table (mandatory for academic papers)
- Must be referenced in text: "as shown in Table 2-1"

### Formulas
- Formula centered, number **right-aligned**
- Use Tab for center + right alignment
- Text reference: "from Eq. (3-1)"

```js
new Paragraph({
  alignment: AlignmentType.CENTER,
  tabStops: [
    { type: TabStopType.CENTER, position: 4500 },
    { type: TabStopType.RIGHT, position: 9000 },
  ],
  children: [
    new TextRun({ text: "\t" }),
    new TextRun({ text: "E = mc²" }),
    new TextRun({ text: "\t(3-1)" }),
  ],
}),
```

### Mandatory Rules
1. Figures/tables/formulas **must be referenced in text** — never placed without explanation
2. Must have introductory and analytical text before/after
3. Must not exceed page margins
4. Insert only when analytically valuable — not for decoration

---

## Citation & Reference System

### In-Text Citation (Sequential Numbering)

Default: **GB/T 7714 sequential numbering** — `[1]`, `[2]` in text, references listed in order of appearance.

```js
new TextRun({ text: "[1]", superScript: true, size: 18, font: { ascii: "Times New Roman" } })
```

### Citation Rules
1. In-text numbers must **correspond one-to-one** with reference list
2. **Same source reused keeps the same number**
3. **Do not mix footnote citations and endnote references** (unless user explicitly requests)
4. Footnotes are for supplementary notes only, not primary citations

### Reference Format (GB/T 7714)
```
[1] Author. Title[J]. Journal, Year, Vol(No): Pages.
[2] Author. Book Title[M]. Place: Publisher, Year: Pages.
[3] Author. Title[D]. Location: Institution, Year.
[4] Author. Title[EB/OL]. (Published)[Cited]. URL.
```

### Reference Formatting
```js
// Reference title — H1 style
new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "References", bold: true, size: 32, font: { eastAsia: "SimHei" } })] }),
// Each entry — hanging indent
new Paragraph({
  indent: { left: 420, hanging: 420 },
  spacing: { line: 360 },
  children: [new TextRun({ text: "[1] Author. Title[J]. Journal, 2024, 59(3): 45-62.",
    size: 21, font: { eastAsia: "SimSun", ascii: "Times New Roman" } })],
}),
```

### Reference Count Guidelines

| Thesis Type | Suggested Count |
|------------|----------------|
| Course paper (3000–5000 words) | 10–15 |
| Undergraduate thesis | 15–30 |
| Master's thesis | 40–80 |
| Doctoral dissertation | 80–150 |

If user specifies APA, MLA, Chicago, or school-specific format, follow that instead.

---

## Three-Line Table (Mandatory for Academic Papers)

All tables in academic papers **must use three-line tables** — no full-border tables.

```js
const threeLineTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
  },
  rows: [
    new TableRow({
      tableHeader: true, cantSplit: true,
      children: headerCells.map(text => new TableCell({
        borders: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
          top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text, bold: true, size: 21, font: { eastAsia: "SimSun", ascii: "Times New Roman" } })] })],
      })),
    }),
    ...dataRows, // All borders NONE
  ],
});
```

---

## Content Quality Constraints (Mandatory)

### Truthfulness & Conservatism
1. **Never fabricate** unverifiable statistics, survey response counts, significance levels, interview subject identities, experimental precision, government document numbers
2. **Never invent** non-existent classic theories, authoritative scholar opinions, regulation names, core data sources
3. When user provides no real data → prefer **theoretical analysis, literature research, case studies, comparative analysis** (low-risk methods)
4. If example data must be constructed → keep scale reasonable, results conservative; never produce "significantly superior" or "dramatically improved" high-risk claims
5. Research conclusions must be **restrained** — do not overstate contributions, effects, or applicability
6. Research limitations must be **honestly disclosed**

### Language Style
1. Formal academic register throughout
2. **Forbidden:** "I think", "everyone knows", "obviously", "it is well known" (subjective expressions)
3. **Forbidden:** Sloganeering, propaganda, advertising-style expressions
4. First occurrence of CN/EN terms should include English original
5. CN/EN punctuation, spacing, and number formats must be consistent throughout

### Structural Consistency
1. Abstract, body, and conclusions **must be consistent** — no self-contradiction
2. Must form complete loop: "research question → method → analysis → findings → conclusions & outlook"
3. Terminology consistent throughout — no concept drift
4. All chapters balanced and substantive — no padding

### Document Cleanliness
1. **No residual** comments, tracked changes, field codes, template default text
2. **No** "TBD", "omitted", "user modifies", "insert figure here" expressions
3. **No** Markdown syntax, HTML tags, code blocks wrapping body text
4. **No** consecutive blank lines, abnormal page breaks, chaotic numbering
5. Final document must be clean, well-formatted, ready for submission

---

## School Standard Override Rule

⚠️ **When user specifies school/journal-specific format requirements, those requirements OVERRIDE all defaults above.**

Common override items:
- Margins (binding margin left 3.5 cm common)
- Body font (some schools require FangSong)
- Line spacing (some schools require fixed 28pt)
- Cover layout (varies significantly by school)
- Reference format (APA, MLA, etc.)
- Heading numbering (some schools use "1", "2" instead of "Chapter 1", "Chapter 2")

### Common Variants

| Thesis Type | Common Differences |
|------------|-------------------|
| Top universities | Strict GB/T 7714, often require STXiaoBiaoSong cover |
| Regular undergraduate | More flexible, SimSun/SimHei sufficient |
| Master's thesis | Requires English abstract, longer lit review, innovation statement |
| Doctoral dissertation | Requires innovation statement, publication list, originality declaration |

---

## Scene-Specific Quality Checks

In addition to universal checks (see `references/common-rules.md`):

### Structure & Content
- [ ] Cover, abstract, English abstract, TOC, body, references all present
- [ ] Cover info complete (school/title/EN title/college/major/name/ID/advisor/date)
- [ ] Abstract contains 5 elements: background + problem + method + results + significance
- [ ] English abstract consistent with Chinese abstract
- [ ] All chapters balanced, substantive, logical loop complete
- [ ] Literature review is thematic, not chronological dump
- [ ] Conclusions respond to research questions

### Format & Layout
- [ ] Heading numbering consistent (Chapter X / X.X / X.X.X), no mixing
- [ ] All body headings use `heading: HeadingLevel.HEADING_X`
- [ ] Body text pure black `"000000"`
- [ ] Three-line tables used consistently (no full-border tables)
- [ ] Figure captions below, table captions above, numbered by chapter
- [ ] Formulas centered, numbers right-aligned
- [ ] In-text citations match reference list one-to-one
- [ ] References use hanging indent, consistent format
- [ ] Page numbers: front matter Roman, body Arabic from 1
- [ ] Cover has no page number
- [ ] Headers formal and concise
- [ ] No extra blank pages

### Cleanliness
- [ ] No comment/revision residuals
- [ ] No "TBD" / "omitted" expressions
- [ ] No Markdown/HTML/code block residuals
- [ ] No consecutive blank lines or abnormal page breaks
- [ ] No fabricated high-risk data or exaggerated conclusions
