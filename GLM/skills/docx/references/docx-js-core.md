# docx-js API Reference

Complete API for creating .docx documents with the `docx` npm package. For advanced features (TOC details, footnotes, PDF conversion), see `docx-js-advanced.md`.

## Setup

```js
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  PageOrientation, TabStopType, TabStopPosition, ExternalHyperlink,
  InternalHyperlink, Bookmark, LevelFormat, TableOfContents,
} = require("docx");
const fs = require("fs");
```

## Document Creation + Export

```js
const doc = new Document({
  styles: { /* see Styles section */ },
  numbering: { config: [ /* see Lists section */ ] },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1417, bottom: 1417, left: 1701, right: 1417 },
      },
    },
    headers: { default: new Header({ children: [/* */] }) },
    footers: { default: new Footer({ children: [/* */] }) },
    children: [ /* Paragraphs, Tables, etc. */ ],
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync("output.docx", buffer);
```

## Paragraph + TextRun

```js
new Paragraph({
  heading: HeadingLevel.HEADING_1, // or HEADING_2, HEADING_3
  alignment: AlignmentType.JUSTIFIED,
  spacing: { before: 240, after: 120, line: 312 }, // 1.3x mandatory
  indent: { firstLine: 480 }, // 2-char CJK indent (480 SimSun / 420 YaHei)
  children: [
    new TextRun({
      text: "Hello",
      bold: true,
      italics: true,
      size: 24, // 12pt = Xiao Si
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
      color: "000000", // Pure black for Profile A; for Profile B use palette.body
    }),
  ],
});

// Additional text formatting options
new TextRun({ text: "Underlined", underline: { type: UnderlineType.SINGLE } })
new TextRun({ text: "Highlighted", highlight: "yellow" })
new TextRun({ text: "Strikethrough", strike: true })
new TextRun({ text: "x²", superScript: true })
new TextRun({ text: "H₂O", subScript: true })
new SymbolRun({ char: "2022", font: "Symbol" }) // Bullet •
```

## Table

**⚠️ CRITICAL**: Always set `margins` on TableCell (or at Table level for global default). Without margins, text touches borders.

**⚠️ CRITICAL**: Use `ShadingType.CLEAR` — never `ShadingType.SOLID` (causes black cells).

**⚠️ CRITICAL — Table Cross-Page Control**:
- Header row MUST set `tableHeader: true` (auto-repeat header on page break)
- All rows MUST set `cantSplit: true` (prevent row content split across pages)
- Title paragraph before table MUST set `keepNext: true` (keep title with table)

```js
// ⚠️ Title before table — keepNext keeps title with table
new Paragraph({
  keepNext: true,  // ← critical
  children: [new TextRun({ text: "Table 1 Feature Comparison", bold: true, size: 21 })],
}),

new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.SINGLE, size: 2, color: "9AA6B2" },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: "9AA6B2" },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
    insideVertical: { style: BorderStyle.NONE },
  },
  rows: [
    // ⚠️ Header row — tableHeader + cantSplit
    new TableRow({
      tableHeader: true,   // auto-repeat on page break
      cantSplit: true,      // prevent row split
      children: ["Header 1", "Header 2"].map(text =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 21 })] })],
          shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          width: { size: 50, type: WidthType.PERCENTAGE },
        })
      ),
    }),
    // ⚠️ Data rows — cantSplit
    new TableRow({
      cantSplit: true,      // prevent row split
      children: ["Data 1", "Data 2"].map(text =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, size: 21 })] })],
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          width: { size: 50, type: WidthType.PERCENTAGE },
        })
      ),
    }),
  ],
});
```

### Column Widths

```js
// Fixed widths (twips)
width: { size: 3000, type: WidthType.DXA }
// Percentage
width: { size: 50, type: WidthType.PERCENTAGE }
```

## ImageRun

**⚠️ CRITICAL**: Always include `type` parameter. Always preserve aspect ratio.

```js
const imageBuffer = fs.readFileSync("chart.png");
// Calculate dimensions preserving aspect ratio
const displayWidth = 500;
const aspectRatio = originalHeight / originalWidth;
const displayHeight = Math.round(displayWidth * aspectRatio);

new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [
    new ImageRun({
      data: imageBuffer,
      transformation: { width: displayWidth, height: displayHeight },
      type: "png", // REQUIRED: "png", "jpg", "gif", "bmp"
    }),
  ],
});
```

## PageBreak

**⚠️ CRITICAL**: PageBreak MUST be inside a Paragraph. Standalone PageBreak crashes Word.

**⚠️ Best Practice**: Attach PageBreak to the end of a **paragraph with text content**. Avoid empty paragraph + PageBreak (may cause blank pages). If using multi-section structure, prefer section breaks over PageBreak.

```js
// ✅ Recommended — PageBreak attached to content paragraph
new Paragraph({
  children: [
    new TextRun({ text: "End of section" }),
    new PageBreak()
  ]
})

// ✅ Acceptable — but prefer section breaks
new Paragraph({ children: [new PageBreak()] })

// ✅ Best — use section breaks instead of PageBreak
// Place content in different sections — auto page break
```

## Headers & Footers + Page Numbers

```js
headers: {
  default: new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Document Title", size: 18, color: "888888" })],
      }),
    ],
  }),
},
footers: {
  default: new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
        ],
      }),
    ],
  }),
},
```

> ⚠️ **Denominator FORBIDDEN** — never use `PageNumber.TOTAL_PAGES` or "X / Y" format. Show only current page number.

## Styles Definition

The example below is for **Chinese documents** (default). For **English documents**, replace `font` with `"Times New Roman"` throughout.

```js
styles: {
  default: {
    document: {
      run: {
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
        size: 24, color: "000000", // Pure black for Profile A; for Profile B use palette.body
      },
      paragraph: {
        spacing: { line: 312 }, // 1.3x mandatory
      },
    },
    heading1: {
      run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, bold: true, color: "0B1220" },
      paragraph: { spacing: { before: 360, after: 160, line: 312 } },
    },
    heading2: {
      run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, bold: true, color: "0B1220" },
      paragraph: { spacing: { before: 240, after: 120, line: 312 } },
    },
    heading3: {
      run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 24, bold: true, color: "0B1220" },
      paragraph: { spacing: { before: 200, after: 100, line: 312 } },
    },
  },
}
```

## Lists

**⚠️ CRITICAL**: Each separate numbered list MUST use a unique `reference` name. Reusing the same reference causes numbering to continue instead of restarting.

```js
// In Document numbering config
numbering: {
  config: [
    {
      reference: "list-features",  // unique name!
      levels: [{
        level: 0,
        format: LevelFormat.DECIMAL,
        text: "%1.",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    },
    {
      reference: "list-benefits",  // different name for second list!
      levels: [{ /* same config */ }],
    },
  ],
},

// Usage in paragraphs
new Paragraph({
  numbering: { reference: "list-features", level: 0 },
  children: [new TextRun({ text: "First item" })],
})
```

### Bullet Lists

```js
new Paragraph({
  bullet: { level: 0 },
  children: [new TextRun({ text: "Bullet item" })],
})
```

## Hyperlinks

### External Link

```js
new ExternalHyperlink({
  children: [new TextRun({ text: "Click here", style: "Hyperlink" })],
  link: "https://example.com",
})
```

### Internal Link (Bookmark)

```js
// Define bookmark at target
new Paragraph({
  children: [
    new Bookmark({ id: "section1", children: [new TextRun("Section 1")] }),
  ],
})

// Link to bookmark
new InternalHyperlink({
  children: [new TextRun({ text: "Go to Section 1", style: "Hyperlink" })],
  anchor: "section1",
})
```
## Table of Contents (TOC)

**→ See `references/toc.md` for the complete TOC reference.**

Quick reminder: (1) Add `TableOfContents` element + PageBreak, (2) Run `python3 "$DOCX_SCRIPTS/add_toc_placeholders.py" output.docx --auto`, (3) Check exit code.

## Tabs

```js
new Paragraph({
  tabStops: [
    { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
  ],
  children: [new TextRun("Left"), new TextRun("\t"), new TextRun("Right")]
})
```

## Constants Quick Reference

- **Underlines:** `SINGLE`, `DOUBLE`, `WAVY`, `DASH`
- **Borders:** `SINGLE`, `DOUBLE`, `DASHED`, `DOTTED`
- **Numbering:** `DECIMAL` (1,2,3), `UPPER_ROMAN` (I,II,III), `LOWER_LETTER` (a,b,c)
- **Symbols:** `"2022"` (•), `"00A9"` (©), `"00AE"` (®), `"2122"` (™)
