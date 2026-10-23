# Scene: Exam Paper

## Overview

Exam papers are among the most critical document types in education. Unlike general documents, they require high precision in layout, print compatibility, and subject-specific formatting. This specification covers the complete workflow from page framework to subject-specific features.

→ Universal prohibitions — see `references/common-rules.md`  
→ **Note:** Exam papers use their OWN font/layout specs (not Profile A defaults). All text is pure black/white/grey for photocopy clarity.

---

## 1. Page Setup & Framework

### Paper Specifications

| Type | Paper | Orientation | Use Case |
|------|-------|-------------|----------|
| Practice / Unit quiz | A4 | Portrait | Daily practice, homework, quizzes |
| Formal exam | A3 | Landscape + 2-column | Midterm / final / standardized (requires OOXML) |
| Answer sheet | A4 | Portrait | Standalone answer card |

### Margins

```js
// A4 portrait — no seal line
page: { size: { width: 11906, height: 16838 },
  margin: { top: 850, bottom: 850, left: 1200, right: 1200 } }

// A4 portrait — with seal line (left binding area reserved)
page: { size: { width: 11906, height: 16838 },
  margin: { top: 850, bottom: 850, left: 2200, right: 850 } }

// A3 landscape dual-column (requires OOXML)
// ⚠️ A3 dual-column may render slightly differently in WPS vs Word. Test in both before batch printing.
page: { size: { width: 23812, height: 16838, orientation: PageOrientation.LANDSCAPE },
  margin: { top: 850, bottom: 850, left: 2200, right: 850 } }
```

### Section Handling

Different parts should use section breaks (`SectionType.NEXT_PAGE`):
- **Header area (full-width):** Title, instructions, score table (no columns)
- **Content area:** Questions (may use columns)
- **Composition / answer sheet:** Independent section, independent format
- **Attachment pages:** Large maps/diagrams for geography/biology can be separate pages

```js
sections: [
  { properties: { /* Header section — no columns */ }, children: [...] },
  { properties: { type: SectionType.CONTINUOUS, column: { count: 2, space: 720 } }, children: [...] },
  { properties: { type: SectionType.NEXT_PAGE }, children: [...] }, // Composition
]
```

### Template-First Principle

⚠️ **Build framework first, fill content second.** Before writing questions, determine:
1. Paper size + margins
2. Whether seal line is needed
3. Whether columns are used
4. Question type structure and point allocation
5. Whether composition grid / answer sheet is needed

---

## 2. Seal Line & Student Information Area

### When to Use Seal Line

| Scenario | Seal Line | Student Info Position |
|----------|-----------|---------------------|
| Formal standardized exam | ✅ Required | Left vertical info column |
| Midterm / Final | ✅ Recommended | Left vertical info column |
| Unit quiz | ❌ Optional | Header horizontal info row |
| Daily practice | ❌ Skip | Header horizontal info row |

### Seal Line Implementation

#### Method 1: Header horizontal prompt (simple)
```js
headers: { default: new Header({ children: [
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({
      text: ".............. Seal ...... Line ...... Do ...... Not ...... Answer ...... Inside ..............",
      size: 16, color: "999999", font: "SimSun" })] })
] }) }
```

#### Method 2: Vertical text box (OOXML advanced)
```xml
<w:txbxContent>
  <w:p><w:pPr><w:jc w:val="center"/></w:pPr>
    <w:r><w:rPr><w:sz w:val="18"/><w:color w:val="999999"/></w:rPr>
      <w:t>Name:________  Class:________  ID:________</w:t></w:r>
  </w:p>
  <w:p><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="CCCCCC"/></w:rPr>
      <w:t>- - - - - - - - - Seal Line - - - - - - - - -</w:t></w:r>
  </w:p>
</w:txbxContent>
```

### Student Info Row

```js
// Horizontal info row (when no seal line) — borderless 3-column table
new Table({
  alignment: AlignmentType.CENTER, columnWidths: [2800, 2800, 2800],
  rows: [new TableRow({ children: [
    cell("Name: ______________"),
    cell("Class: ______________", AlignmentType.CENTER),
    cell("ID: ______________", AlignmentType.RIGHT),
  ] })]
})
```

Fill lines should be moderate length (10–14 underscore chars). Label order: Name → Class → Student ID.

---

## 3. Paper Header & Title Area

### Structure

```
School name (16pt SimHei, centered)
Exam title (14pt SimHei, centered) — e.g., "2025–2026 Academic Year Second Semester Midterm"
Subject title (14pt SimHei, centered) — e.g., "Grade 7 Mathematics"
Student info row
Instructions (10pt SimSun, centered, grey)
Score table (as needed)
```

### Font Specifications

| Element | Font | Size | Style |
|---------|------|------|-------|
| School name | SimHei | 16pt (size:32) | Bold, centered |
| Exam title | SimHei | 14pt (size:28) | Bold, centered |
| Subject title | SimHei | 14pt (size:28) | Bold, centered |
| Instructions | SimSun | 10pt (size:20) | Grey 333333, centered |
| Student info | SimSun | 10.5pt (size:21) | Normal |

### Instructions Content

Should include: total score, exam duration, answer method, special requirements (e.g., calculator allowed).

### Score Table
- Header row: light grey background F0F0F0, centered
- Columns: Question type | Section names... | Total
- Rows: Points | Section points... | Total points
- Row: Score | blank... | blank
- Table centered, 80% page width

⚠️ **Header area should not be too full** — title + info + instructions + score table should not exceed 1/3 of the page.

---

## 4. Content Layout Rules

### Color Palette

```js
// Exam papers use only black/white/grey for clear photocopying
const C = {
  title: "000000", body: "000000", section: "333333",
  seal: "999999", answerLine: "CCCCCC", headerBg: "F0F0F0", gridLine: "DDDDDD",
};
```

### Column Usage

| Subject / Question Type | Recommendation |
|------------------------|----------------|
| Math multiple choice + fill-in | ✅ Suitable for columns |
| Physics multiple choice | ✅ Suitable for columns |
| Chinese reading / composition | ❌ Not suitable |
| English cloze / reading | ❌ Not suitable |
| History source-based | ❌ Not suitable |
| Geography map reading | ❌ Not suitable |

### Question Numbering

Entire paper uses consistent three-level numbering:
- **Major sections:** I, II, III, IV... (Chinese: 一、二、三、四…)
- **Questions:** 1. 2. 3. ... (Arabic + period)
- **Sub-questions:** (1) (2) (3) ... (parenthesized)

⚠️ **No extra symbols before question numbers** (no `•`, `▸`, `▪`, `-`, `*`). The number itself is the only marker. **Never use docx numbering/bullet list styles** for question numbers — must use plain TextRun manual numbering.

```js
// ✅ Correct — plain TextRun manual numbering
new Paragraph({ spacing: { before: 120, after: 60, line: 360 },
  children: [new TextRun({ text: `${i+1}. ${question}`, size: 21, font: { eastAsia: "SimSun" } })] })

// ❌ Wrong — numbering causes Word to add bullets
new Paragraph({ numbering: { reference: "xxx", level: 0 }, // ← Forbidden!
  children: [new TextRun({ text: question })] })
```

### Question Spacing

```js
sectionTitle: { before: 300, after: 150 }  // Major section headers
question: { before: 120, after: 80 }       // Between questions
subQuestion: { before: 60, after: 40 }     // Between sub-questions
```

### Page Break Control

⚠️ Key principles:
- **Question stem and answer area must not split** across pages
- **Source material and questions on same page**
- **Figures adjacent to their questions**
- **Avoid orphan lines** — question stem, options, answer area appear as a group

```js
new Paragraph({ keepNext: true, keepLines: true, children: [...] })
```

⚠️ **Answer question page break rule (mandatory):**

Complete combination (stem + figure + answer lines) must be considered as a unit. If remaining space cannot fit stem + figure + at least 3 answer lines, push entire question to next page.

Use `keepNext: true` to chain: stem → figure → first 3 answer lines.

---

## 5. Font & Paragraph Standards

### Underline Formatting for "Underlined Parts" (Mandatory)

When a question references "underlined part" (划线部分), the relevant text MUST use actual underline formatting (`underline: { type: UnderlineType.SINGLE }`). **Never** show "划线部分为 XXX" as plain text annotation — the underline must be visually rendered.

```js
// ✅ Correct — actual underline on the referenced text
new Paragraph({ children: [
  new TextRun({ text: "1. It is ", size: 21, font: { ascii: "Times New Roman" } }),
  new TextRun({ text: "a butterfly", size: 21, font: { ascii: "Times New Roman" },
    underline: { type: UnderlineType.SINGLE, color: "000000" } }),
  new TextRun({ text: ". (Ask about the underlined part)", size: 21, font: { ascii: "Times New Roman" } }),
]})

// ❌ Wrong — underlined part described as annotation text
new TextRun({ text: "1. It is a butterfly. (对划线部分提问) 注：划线部分为 a butterfly" })
```

### Font Hierarchy

| Element | Font | Size | Style |
|---------|------|------|-------|
| Section title | SimHei | 11pt (size:22) | Bold |
| Question content | SimSun | 10.5pt (size:21) | Normal |
| Points annotation | SimSun | 10pt (size:20) | In parentheses |
| Reading material | KaiTi/SimSun | 10.5pt (size:21) | KaiTi to differentiate |
| Notes/source | SimSun | 9pt (size:18) | Grey 666666 |
| Seal line | SimSun | 8pt (size:16) | Grey 999999 |
| Page number | SimSun | 9pt (size:18) | Centered |

### Line Spacing
```js
line: 360  // ~1.5x for readability
answerLine: 500  // Answer line spacing for writing room
```

### Paragraph Rules
- ⚠️ **Never use consecutive returns for whitespace** — use `spacing.before/after`
- Chinese questions use Chinese punctuation; English materials use English punctuation
- Mixed CN/EN: use Times New Roman or Calibri for English text

---

## 6. Multiple Choice Layout

### Core Rule

⚠️ **Options must NEVER be aligned with spaces!** Must use borderless tables.

### Option Layout — Borderless Table

```js
// Short options: 4 columns in 1 row
new Table({
  columnWidths: [2200, 2200, 2200, 2200],
  rows: [new TableRow({ children: ["A","B","C","D"].map((label, i) =>
    new TableCell({ borders: NBs, width: { size: 2200, type: WidthType.DXA },
      margins: { top: 0, bottom: 0, left: 60, right: 60 },
      children: [new Paragraph({ spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: `${label}. ${options[i]}`, size: 21, font: "SimSun" })] })]
    })
  ) })]
})
// Medium options: 2 columns, 2 rows
// Long options: 1 column, 4 rows
```

### Option Length Detection
```js
function getOptionLayout(options) {
  const maxLen = Math.max(...options.map(o => o.length));
  if (maxLen <= 6) return "4col";
  if (maxLen <= 15) return "2col";
  return "1col";
}
```

---

## 7. Fill-in-the-Blank Layout

```js
// Blank line length matches expected answer:
// Short answer (number/word): 8 underscores
// Medium (phrase): 14 underscores
// Long (sentence): 20 underscores
new Paragraph({ spacing: { before: 140, after: 80, line: 400 },
  children: [new TextRun({ text: `${num}. Question text ________________.`, size: 21, font: "SimSun" })] })
```

⚠️ Fill-in lines must not break across lines — if line is too long, put the blank on the next line.

---

## 8. Short Answer / Problem-Solving Layout

### Question + Points
```js
new Paragraph({ spacing: { before: 200, after: 60, line: 360 }, keepNext: true,
  children: [new TextRun({ text: `${num}. (${points} pts) ${question}`, size: 21, font: "SimSun" })] })
```

### Answer Lines
```js
// Light grey answer lines (CCCCCC), NOT black
// ⚠️ Answer lines are ONLY for writing space within each question — never as dividers between questions
function answerLines(count) {
  return Array(count).fill(null).map(() =>
    new Paragraph({ spacing: { before: 0, after: 0, line: 500 },
      borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
      children: [new TextRun({ text: " ", size: 21 })] })
  );
}
```

⚠️ **Separation between questions:**

Use **only spacing** (`spacing.before: 200`) for visual separation between questions. **Forbidden:**
- ❌ Grey horizontal lines (borders)
- ❌ Color block dividers (Table-simulated separators)
- ❌ Symbol dividers (e.g., `───────`)
- ❌ Any visual separator decoration

### Answer Space vs. Points

| Points | Suggested Lines | Description |
|--------|----------------|-------------|
| 2–4 | 3–4 lines | Simple calculation / short answer |
| 5–8 | 6–8 lines | Medium problem |
| 10–12 | 8–10 lines | Complex problem |
| 14–20 | 10–14 lines | Comprehensive / essay question |

---

## 9. Source-Based / Reading Question Layout

### Material vs. Question Separation

```js
// Material area — indented + KaiTi to differentiate
new Paragraph({ indent: { left: 420, right: 420 }, spacing: { before: 100, after: 100, line: 380 },
  children: [new TextRun({ text: materialText, size: 21, font: "KaiTi" })] })
// Source attribution
new Paragraph({ alignment: AlignmentType.RIGHT, indent: { right: 420 },
  children: [new TextRun({ text: "— from \"XXX\"", size: 18, color: "666666", font: "SimSun" })] })
```

### Key Principles
- Material title, source, body, and notes use different fonts
- Long materials: increase line spacing (line: 380–400)
- Material and corresponding questions on same page
- Sub-question numbers (1)(2)(3) clearly correspond to material
- **Data tables in materials MUST use proper docx `Table` objects** — never render tabular data as Markdown plain text (`| col | col |`). This includes statistics tables, climate data tables, comparison tables, and any structured data within question materials. Use bordered tables (see § 13 Table Usage Standards) with appropriate header row styling.

---

## 10. Composition / Writing Area

### Grid Count Calculation

⚠️ **Grid count must exceed required word count by 20–30%** (for title, paragraph indents, line breaks).

| Required Words | Min Grid Count | Recommended Layout |
|---------------|---------------|-------------------|
| 400 | 500 | 25 rows × 20 cols |
| 600 | 750 | 38 rows × 20 cols |
| 800 | 1000 | 50 rows × 20 cols |
| 1000 | 1250 | 63 rows × 20 cols |

```js
function calcGridSize(requiredWords, colsPerRow = 20) {
  const totalCells = Math.ceil(requiredWords * 1.25);
  const rows = Math.ceil(totalCells / colsPerRow);
  return { rows, colsPerRow, totalCells: rows * colsPerRow };
}
```

### Chinese Composition Grid

```js
function compositionGrid(rows, colsPerRow) {
  const cellSize = Math.floor(8800 / colsPerRow);
  return new Table({
    columnWidths: Array(colsPerRow).fill(cellSize),
    rows: Array(rows).fill(null).map(() =>
      new TableRow({
        height: { value: cellSize, rule: HeightRule.EXACT },
        children: Array(colsPerRow).fill(null).map(() =>
          new TableCell({ borders: thinBs("DDDDDD"), width: { size: cellSize, type: WidthType.DXA },
            children: [new Paragraph({ children: [] })] })
        )
      })
    )
  });
}
```

### English Writing Area (Horizontal Lines) — MANDATORY for English Writing Questions

⚠️ **Every English writing/composition question MUST include ruled horizontal lines.** A blank area without lines is FORBIDDEN — students need lines to write on.

```js
function writingLines(count) {
  return Array(count).fill(null).map(() =>
    new Paragraph({ spacing: { before: 0, after: 0, line: 560 },
      borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
      children: [new TextRun({ text: " ", size: 21 })] })
  );
}
```

**Line count by word requirement:**
| Required Words | Lines |
|---------------|-------|
| ≤50 | 8 |
| 50–80 | 10 |
| 80–120 | 12 |
| 120+ | 15 |

**Rules:**
1. Lines must appear immediately after the writing prompt paragraph
2. Line color: light grey `CCCCCC` (print-friendly, not visually heavy)
3. Line spacing: `line: 560` (provides adequate writing room)
4. Chinese composition uses grid (`compositionGrid`), English uses lines (`writingLines`) — never mix them up
```

### Composition Area Requirements
- Independent section or clear separation
- Title space reserved (for self-chosen topics)
- Word count prompt visible ("No fewer than 800 words" / "About 120 words")
- Grid/line colors light — must not interfere with writing
- Pages continuous, not split

---

## 11. Answer Key (参考答案)

### Output Rules

1. **Default (user does not request answers in the same file):** Generate the answer key as a **separate .docx file** (e.g., `exam.docx` + `exam_answers.docx`). This prevents students from accidentally seeing answers.
2. **User explicitly requests answers in the same file:** Place the answer key on an **independent page** using `SectionType.NEXT_PAGE`. Answer key MUST NOT appear on the same page as any exam question.

### Separate File Format (Default)

The answer key file should include:
- Title: "《{exam title}》参考答案" (SimHei, 14pt/size:28, bold, centered)
- Same question numbering as the exam
- Concise answers (letter choices, key words, short solutions)
- Font: SimSun 10.5pt (size: 21)

### Same File Format (When User Requests)

```js
// Answer key as a separate section — MUST use SectionType.NEXT_PAGE
{
  properties: { type: SectionType.NEXT_PAGE,
    page: { margin: { top: 850, bottom: 850, left: 1200, right: 1200 } } },
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 300 },
      children: [new TextRun({ text: "参考答案", size: 28, bold: true,
        font: { eastAsia: "SimHei" } })],
    }),
    // ... answer content paragraphs
  ],
}
```

### Rules
1. ⚠️ **Never place answer content directly after the last question without a page/section break**
2. Answer content should be concise — no answer lines, no grid, plain text only
3. Calculation/proof questions: show key steps, not just final answer
4. If the exam has figures, answers may reference "see Figure X" without re-embedding

---

## 12. Figures & Illustrations

### Image Insertion
```js
new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 60 },
  children: [new ImageRun({ data: imageBuffer, transformation: { width: 300, height: 200 }, type: "png" })] })
new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
  children: [new TextRun({ text: "(Figure 1)", size: 18, color: "666666", font: "SimSun" })] })
```

### Key Principles
- Images set as inline (default) to prevent floating
- Resolution sufficient for print clarity
- **B&W print compatible:** images must remain distinguishable when printed in grayscale
- Figure numbers and captions complete
- Figures adjacent to corresponding questions
- Maps must have: scale bar, north arrow, legend
- Coordinate graphs must have: axis labels, tick marks, units

### ⚠️ Figure-Text Order (Strictly Enforced)

**For questions with figures, element order must be:**
```
1. Question stem (keepNext: true)
2. Figure (centered, keepNext: true)
3. Answer lines / answer area
```

**Forbidden:** answer lines between stem and figure, or figure after answer lines.

### Figure Content Matching
- **Figures must be semantically consistent with question stem:** if question says "triangle ABC", figure must label vertices A, B, C
- Geometry annotations must match described angles, side lengths
- Function graphs must mark key points mentioned in the question
- Physics experiment diagrams must match described apparatus
- Figure width: geometry ≤ 50% page width, data/experiment ≤ 70%

### ⚠️ Figure Diversity Rule (Mandatory)

**No duplicate figures in the entire paper.** Even if two questions involve the same type (e.g., both triangles), each must have a distinct figure:
1. Different labels (different vertex letters, angles, side lengths)
2. Different shapes (acute vs. right vs. obtuse triangle)
3. Different styling (if applicable)

If using matplotlib, each call must use **different parameters and data** — never copy the same generation code.

### Subject-Specific Figure Requirements

| Subject | Common Types | Special Requirements |
|---------|-------------|---------------------|
| Math | Geometry, functions, coordinates | No distortion, clear labels |
| Physics | Circuits, mechanics, apparatus | Standard symbols, correct arrows |
| Chemistry | Apparatus, molecular structures | Reagent names labeled |
| Biology | Cell, organ, ecosystem diagrams | Labels not too small |
| Geography | Maps, contour lines, statistics | Legend + scale + north arrow |

---

## 13. Formulas & Special Symbols

### Formulas
Math/physics/chemistry formulas use **LaTeX → docx-js Math mapping** (see `references/math-formulas.md`):
- Basic (fractions, sub/superscript, roots) → docx-js Math components
- Complex (3+ nesting, matrices) → matplotlib PNG fallback
- Never hand-type Unicode formula approximations

### Common Unicode Math Symbols
```
× ÷ ± ∓ ≠ ≈ ≤ ≥ ∞ √ ∑ ∏ ∫ ∂ ∆ ∇
α β γ δ ε θ λ μ π σ φ ω
⊂ ⊃ ∈ ∉ ∪ ∩ ∅ ∀ ∃
→ ← ↑ ↓ ⇒ ⇔  ° ' " ‰  ² ³ ⁴ ⁿ ₁ ₂ ₃
```

### Chemical Formulas
Subscripts/superscripts must be correct: H₂O, CO₂, Fe₂O₃, Ca(OH)₂  
Reaction arrows: → ⇌ ↑ ↓

---

## 14. Table Usage Standards

### Borderless Tables (for alignment)
For: option alignment, info rows, question number + points alignment
```js
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NBs = { top: NB, bottom: NB, left: NB, right: NB };
```

### Bordered Tables (for data display)
For: score tables, data tables, statistics
```js
const thinB = (c="000000") => ({ style: BorderStyle.SINGLE, size: 1, color: c });
const thinBs = (c="000000") => ({ top: thinB(c), bottom: thinB(c), left: thinB(c), right: thinB(c) });
```

### Table Standards
- Cell padding moderate (margins: top/bottom 40–60, left/right 60–80)
- Consistent border thickness
- Header row: light grey F0F0F0 background
- Avoid cross-page tables
- Tables centered (`alignment: AlignmentType.CENTER`)

---

## 15. Headers & Footers

### Page Numbers
```js
footers: { default: new Footer({ children: [
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "SimSun" }),
    ] })
] }) }
```

⚠️ **Denominator FORBIDDEN** — never use `PageNumber.TOTAL_PAGES` or "Page X of Y". Show only current page number.

### Headers
- May contain seal line prompt or subject name
- Small font (8–9pt), grey color (999999)
- Should not be visually heavy — must not compete with content

---

## 16. Subject-Specific Standards

### Chinese Language
- Reading, classical poetry, composition: **no columns**
- Poetry preserves original line breaks
- Classical text needs annotation area (smaller font, indented)
- Composition grid in independent section, grid count via `calcGridSize` (800 words → 50×20 = 1000 cells)
- Dictation questions: horizontal lines, moderate length
- Reading materials: use KaiTi to differentiate

### Mathematics
- Multiple choice, fill-in: suitable for neat layout
- Formulas: Unicode symbols or OOXML
- Geometry/function graphs must be clear, undistorted
- Problem-solving: sufficient working space
- Coordinate graphs: labeled axes, tick marks

### English
- English font: Times New Roman, moderate character spacing
- Cloze: numbers in text, options after passage
- Reading comprehension: material + questions as groups
- Writing area: horizontal lines, not grid
- Listening (if any): numbers aligned with options

### Physics / Chemistry / Biology
- Experiment/apparatus diagrams must be clear and accurate
- Unit symbols standardized (m/s, kg, mol/L, etc.)
- Chemical formula subscripts correct
- Calculation and experiment analysis: sufficient answer space
- Biology structure diagrams: labels not too small

### History / Politics
- Source-based questions are lengthy — **no columns**
- Dates, figures, events clearly labeled
- Essay questions: more whitespace than multiple choice
- Historical sources cite provenance
- Chart materials in logical order

### Geography
- Maps are the focus — must be clear
- Legend, scale bar, north arrow required
- Map and question close together — avoid page turns
- Map reading questions: balance figure and text space
- Contour line values clearly labeled

---

## Final Review Checklist

After generating an exam paper, check every item:

- [ ] Question numbers sequential, points correct, total correct
- [ ] Question stems match options / materials / illustrations one-to-one
- [ ] **Figures come after stem, before answer area** (strict order)
- [ ] **Figure content matches question semantics** (labels, symbols match)
- [ ] **Composition grid count ≥ required words × 1.25** (800 words → at least 1000 cells)
- [ ] Options aligned with borderless tables (not spaces)
- [ ] No wrong pages, missing pages, **no extra blank pages**
- [ ] Images / tables / formulas positioned correctly
- [ ] **No Markdown table syntax in document** — all data tables use proper docx Table objects
- [ ] Fonts, sizes, line spacing consistent
- [ ] Answer space matches difficulty and point value
- [ ] Clear when printed in B&W
- [ ] Subject-specific layout handled properly
- [ ] Seal line / page numbers / headers formatted correctly
- [ ] Header info complete (school, subject, duration, total score)
- [ ] **No extra PageBreak at end of last section**
- [ ] **Answer key is either a separate file (default) or on a separate page (if user requested in same file)** — never on the same page as questions
