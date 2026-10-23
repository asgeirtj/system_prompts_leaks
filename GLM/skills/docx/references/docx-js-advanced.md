# docx-js Advanced Features

Advanced API for complex document scenarios. Load this when creating documents with TOC, cover pages, footnotes, multi-section layouts, or post-processing needs.

## Table of Contents (TOC)

**→ See `references/toc.md` for the complete TOC reference** (3-step process, code examples, page numbering, common bugs, checklist).

## Cover Page Design (Vertical Centering)

Use large `spacing.before` to push content down for visual centering:

```js
// Approximate vertical center on A4:
// Total printable height ≈ 14000 twips
// For title at ~40% from top: before = 5600
const coverSection = {
  properties: {
    page: { /* standard A4 */ },
    // No headers/footers on cover page
  },
  children: [
    new Paragraph({ spacing: { before: 5600 } }), // spacer
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: title,
        font: { ascii: "Calibri", eastAsia: "SimHei" },
        size: 52, bold: true, color: palette.primary,
      })],
    }),
    // ... subtitle, author, date
  ],
};
```

For multi-section documents, put the cover in its own section so it can have different headers/footers.

## Footnotes

```js
const { FootnoteReferenceRun, Footnote } = require("docx");

const doc = new Document({
  footnotes: {
    1: { children: [new Paragraph({ children: [new TextRun({ text: "Smith, J. (2024). Research Methods. Academic Press, pp. 45-67.", size: 18 })] })] },
    2: { children: [new Paragraph({ children: [new TextRun({ text: "Zhang, W. (2023). \u201c数据分析方法研究\u201d. 科学通报, 68(12), 1234-1250.", size: 18 })] })] },
  },
  sections: [{
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: "According to recent studies" }),
          new FootnoteReferenceRun(1), // superscript [1]
          new TextRun({ text: ", data analysis methods have evolved" }),
          new FootnoteReferenceRun(2), // superscript [2]
          new TextRun({ text: "." }),
        ],
      }),
    ],
  }],
});
```

### Academic Reference Pattern

For sequential references [1][2][3]..., pre-define all footnotes in the `footnotes` object with numeric keys, then reference them inline with `FootnoteReferenceRun(n)`.

## keepNext — Element Binding

Prevent page breaks between related elements:

```js
// Heading stays with next paragraph
new Paragraph({
  heading: HeadingLevel.HEADING_2,
  keepNext: true, // don't break after this
  children: [new TextRun({ text: "Table 1: Results" })],
})
// Table immediately follows on same page

// Caption stays with image
new Paragraph({
  keepNext: true,
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Figure 1: Architecture Diagram", italics: true, size: 20 })],
})
// ImageRun paragraph follows
```

Use `keepNext: true` for:
- Heading → first paragraph of section
- Table caption → table
- Image → image caption
- "Figure X" label → image

## Page Break Rules

Follow the document type strategy defined in SOUL.md Rule 1.

**Structural breaks (always):**
- Cover page → TOC
- TOC → main content
- Main content → back cover

**Content breaks (by document type):**
- Academic / teaching → `new Paragraph({ children: [new PageBreak()] })` before each H1 chapter
- Business report → PageBreak before each H1; H2 flows naturally
- Resume / contract / letter → No content page breaks
- Short article → No content page breaks

**Anti-tear (mandatory):**
```js
// Heading stays with next paragraph
new Paragraph({
  heading: HeadingLevel.HEADING_1,
  keepNext: true,
  children: [new TextRun("Chapter Title")],
})

// Table caption stays with table
new Paragraph({
  keepNext: true,
  children: [new TextRun({ text: "Table 1: Summary", italics: true })],
})

// Image caption stays with image
new Paragraph({
  keepNext: true,
  children: [new TextRun({ text: "Figure 1: Architecture", italics: true })],
})
```

**Never:**
- PageBreak inside tables
- PageBreak as standalone element (must be inside Paragraph)
- PageBreak at the END of the last section (causes blank page)

```js
// Correct: page break between cover and TOC
new Paragraph({ children: [new PageBreak()] })
```

## Quotes Escaping in JS Strings

**⚠️⚠️⚠️ CRITICAL — #1 MOST COMMON BUG ⚠️⚠️⚠️**

Bare Chinese curly quotation marks (`""` `''`) in JS string literals **WILL break syntax and crash document generation**. This bug occurs most often in **Chinese body text** where curly quotes are used for emphasis, proper nouns, event names, or quoted speech — e.g., `"双11"`, `"前低后高"`, `"618"大促`. **Every single occurrence** of `""''` in text content MUST be Unicode-escaped. No exceptions.

**MANDATORY RULE: Before writing ANY `TextRun`, `para()`, or string containing Chinese text, scan the text for `""''` characters and replace ALL of them with `\u201c \u201d \u2018 \u2019`.**

| Character | Unicode | Escape method |
|-----------|---------|---------------|
| `"` `"` | `\u201c` `\u201d` | Unicode escape `\u201c` `\u201d` |
| `'` `'` | `\u2018` `\u2019` | Unicode escape `\u2018` `\u2019` |
| `"` | U+0022 | `\"` or wrap string in single quotes / template literal |
| `'` | U+0027 | `\'` or wrap string in double quotes / template literal |

```js
// ❌ WRONG — curly quotes in Chinese text break JS syntax (VERY COMMON MISTAKE)
content.push(para("2025年四个季度行业增速呈现"前低后高"的态势。在"618"大促、"双11""双12"活动拉动下增长显著。"));
new TextRun({ text: "他说"你好"" })
new TextRun({ text: 'It's a test' })

// ✅ CORRECT — ALL curly quotes replaced with Unicode escapes
content.push(para("2025年四个季度行业增速呈现\u201c前低后高\u201d的态势。在\u201c618\u201d大促、\u201c双11\u201d\u201c双12\u201d活动拉动下增长显著。"));
new TextRun({ text: "他说\u201c你好\u201d" })
new TextRun({ text: "It\u2019s a test" })

// ✅ CORRECT — straight quotes escaped or use alternate delimiters
new TextRun({ text: "He said \"hello\"" })
new TextRun({ text: 'He said "hello"' })
new TextRun({ text: `He said "hello"` })
```

## Multi-Section Documents

Different headers/footers per section:

```js
const doc = new Document({
  sections: [
    {
      // Section 1: Cover — no header/footer
      properties: { page: { /* ... */ } },
      children: coverChildren,
    },
    {
      // Section 2: Front matter — Roman page numbers
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          /* size, margin... */
          pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
        },
      },
      headers: { default: new Header({ children: [] }) },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT], size: 18 })],
          })],
        }),
      },
      children: tocAndAbstract,
    },
    {
      // Section 3: Main content — Arabic page numbers
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          /* size, margin... */
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: docTitle, size: 18, color: "888888" })],
          })],
        }),
      },
      footers: { default: footerWithPageNumbers },
      children: mainContent,
    },
  ],
});
```

## Converting DOCX to PDF

> 🔴 **LibreOffice not installed? You MUST install it — do not substitute.** Using Word/WPS *instead  
> of* installing is forbidden, and a large download is **not** a reason to skip it. Required: explain  
> the necessity to the user (it preserves styles, layout, fonts and pagination faithfully), say the  
> package is large, then install it — **preferred source is the Tsinghua TUNA mirror**  
> `https://mirrors.tuna.tsinghua.edu.cn/libreoffice/libreoffice/stable/26.8.0/` (pick the  
> platform/arch subdirectory; if that version is gone, take the newest under  
> `.../libreoffice/stable/`; full commands in `env_setup/setup.md`), with  
> `brew install --cask libreoffice` / `sudo apt install libreoffice-core` /  
> `winget install TheDocumentFoundation.LibreOffice` as fallbacks. Only  
> after an install attempt has **failed** may you use another program. **No install attempt = no  
> substitute program.** After installing, **register `soffice` on `PATH` and re-verify  
> `soffice --version`** (per-OS commands: `env_setup/setup.md` → *"Register the binary on PATH"*) —  
> an install left off the search path reads as "not installed" next time and gets reinstalled  
> needlessly. Note this is separate from the TOC rule below, which is about field  
> recalculation, not about avoiding LibreOffice.

```bash
# Using LibreOffice (headless)
libreoffice --headless --convert-to pdf output.docx

# ⚠️ TOC Rule: If document has TOC, warn user that:
# 1. LibreOffice conversion may show empty TOC
# 2. User should open in Word first, update fields (Ctrl+A → F9), save, then convert
# 3. Or use Word's "Save as PDF" for best results
```

## Converting DOCX to Images

```bash
# Step 1: Convert to PDF
libreoffice --headless --convert-to pdf output.docx

# Step 2: Convert PDF to images
pdftoppm -png -r 200 output.pdf output_page

# This generates output_page-1.png, output_page-2.png, etc.
# Use -r 200 for good quality (200 DPI)
```

Useful for generating preview thumbnails or when user needs images instead of document files.
