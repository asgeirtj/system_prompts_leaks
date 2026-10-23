# Table of Contents (TOC) — Complete Reference

> **This is the single source of truth for all TOC rules.** Other files should reference this file instead of duplicating TOC instructions.

## Overview

DOCX TOC is a **3-step process**: Code → Post-process → User opens Word.

```
Step A: docx-js code generates empty TOC field structure
Step B: add_toc_placeholders.py fills it with visible placeholder entries
Step C: User opens Word → "Update Field" → real page numbers replace placeholders
```

All 3 steps are **mandatory**. Skipping any step results in a broken or empty TOC.

## When to Add TOC

- **Recommended**: Long or complex documents with many headings (reports, theses, papers, manuals)
- **Do NOT add**: Resumes, contracts, letters, exam papers, short documents
- **postcheck rule**: If document contains a "目录" title but no `TableOfContents` element → error

## Step A: Code Generation (docx-js)

Insert **4 elements** in sequence:

```js
const { TableOfContents, Paragraph, TextRun, PageBreak, AlignmentType } = require("docx");

// 1. TOC title — ⛔ DO NOT use HeadingLevel (or TOC will index itself!)
new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 480, after: 360 },
  children: [new TextRun({
    text: "目  录",  // or "Table of Contents" for English docs
    bold: true, size: 32,
    font: { eastAsia: "SimHei", ascii: "Times New Roman" }
  })],
}),

// 2. TOC field element — ⚠️ first parameter is NOT displayed, it's internal name only
new TableOfContents("Table of Contents", {
  hyperlink: true,
  headingStyleRange: "1-3",  // match HeadingLevel range used in document
}),

// 3. ★ MANDATORY Refresh Hint — tells user how to update page numbers
new Paragraph({
  spacing: { before: 200 },
  children: [new TextRun({
    text: "Note: This Table of Contents is generated via field codes. To ensure page number accuracy after editing, please right-click the TOC and select \"Update Field.\"",
    italics: true, size: 18, color: "888888"
  })]
}),

// 4. ★ MANDATORY PageBreak after TOC — prevents TOC and body merging on same page
new Paragraph({ children: [new PageBreak()] }),
```

### Heading Requirements

**⚠️ CRITICAL**: TOC only picks up paragraphs with `heading: HeadingLevel.HEADING_X`.

```js
// ✅ Correct — Heading style, TOC can index
new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text: "第一章 引言", bold: true, size: 32, color: c(P.primary) })]
})

// ❌ Wrong — manual bold + large font, TOC cannot detect
new Paragraph({
  children: [new TextRun({ text: "第一章 引言", bold: true, size: 32, color: c(P.primary) })]
})
```

**Exceptions:**
- Cover title: does NOT need Heading style (should not appear in TOC)
- "目录" title: **MUST NOT** use Heading style (prevents TOC from indexing itself)

## Step B: Post-Processing Script

**MUST** run after generating the DOCX file:

```bash
python3 "$DOCX_SCRIPTS/add_toc_placeholders.py" output.docx --auto
```

### What the script does

1. Extracts Heading 1-3 from the document as TOC entries
2. Fixes docx-js fldChar structure bug (begin+instrText+separate merged in one `<w:r>`)
3. Patches `settings.xml` with `updateFields=true` (Word prompts to refresh on open)
4. Ensures Heading styles have `outlineLvl` (required for TOC field update)
5. Ensures TOC 1/2/3 styles exist in `styles.xml`
6. Injects placeholder entries with HYPERLINK + PAGEREF between `separate` and `end` fldChars
7. Handles duplicate heading texts (each gets its own bookmark)

### Error handling

The script **exits with code 1** if:
- No TOC field structure found (missing `TableOfContents` element)
- TOC field has `begin` but no `separate` fldChar (malformed structure)
- Field structure exists but no TOC instrText detected

**If exit code = 1 → the generated code is wrong. Fix the code and regenerate.**

### Options

```bash
# Auto mode (recommended — default behavior)
python3 "$DOCX_SCRIPTS/add_toc_placeholders.py" output.docx --auto

# Manual entries
python3 "$DOCX_SCRIPTS/add_toc_placeholders.py" output.docx \
  --entries '[{"level":1,"text":"Chapter 1","page":"1"},{"level":2,"text":"Section 1.1","page":"2"}]'
```

## Step C: User Opens in Word/WPS

- **Word**: Detects `updateFields=true` → prompts "Update field?" → click Yes → real page numbers
- **WPS**: May NOT auto-prompt. User must: right-click TOC → "Update Field" → "Update entire table"

The placeholder entries ensure TOC is **not blank** even without updating — users see heading titles with approximate page numbers.

## Multi-Section Page Numbering

When a document has a TOC, the TOC MUST be in its own section so that body page numbering starts from 1. This applies to **all document types with a TOC** (reports, whitepapers, PRDs, academic papers, etc.) — not just academic papers.

**Mandatory 3-section architecture for documents with cover + TOC:**

```js
sections: [
  { /* Section 1: Cover — no page number, no footer */
    properties: {
      page: { size: pgSize, margin: pgMargin },
      // ⚠️ Do NOT set page.pageNumbers here — docx-js emits empty <pgNumType/> which confuses WPS
    },
  },
  { /* Section 2: Front matter (abstract, TOC) — Roman numerals */
    properties: {
      type: SectionType.NEXT_PAGE,
      page: {
        size: pgSize, margin: pgMargin,
        pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },  // I, II, III...
      },
    },
    footers: { default: pageNumFooter() },  // see footer rules below
    children: [/* abstract + TOC title + TableOfContents + PageBreak */]
  },
  { /* Section 3: Body — Arabic numerals starting from 1 */
    properties: {
      type: SectionType.NEXT_PAGE,
      page: {
        size: pgSize, margin: pgMargin,
        pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },  // 1, 2, 3...
      },
    },
    footers: { default: pageNumFooter() },
    children: [/* body content */]
  },
]
```

### ⚠️ Page Number API — Correct Nesting (CRITICAL)

Page number settings MUST be nested inside `page.pageNumbers`, NOT at properties top level:

```js
// ❌ WRONG — docx-js ignores these, pgNumType will be empty
properties: {
  pageNumberStart: 1,
  pageNumberFormatType: NumberFormat.DECIMAL,
}

// ✅ CORRECT — docx-js writes start= and fmt= attributes
properties: {
  page: {
    pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
  },
}
```

### ⚠️ Footer Field Instruction — WPS Compatibility (CRITICAL)

WPS may ignore `pgNumType fmt` in the section properties. To ensure correct display, the footer PAGE field **MUST** include an explicit format switch via **post-processing**:

After generating the docx, unzip and patch each footer XML:
- **Roman numeral footer**: replace `PAGE` with `PAGE \* ROMAN \\** MERGEFORMAT`
- **Arabic numeral footer**: replace `PAGE \* arabic \* MERGEFORMAT`

**⚠️ NEVER use `\* decimal` in instrText** — `decimal` is a docx-js API enum value (`NumberFormat.DECIMAL` for `pgNumType` XML attribute), NOT a valid Word field format switch. Using it causes page numbers to render as "1decimal", "2decimal". The correct Word field switch for Arabic numerals is always `\* arabic`.

```js
// Post-process footer XML:
footerXml = footerXml.replace(
  /(<w:instrText[^>]*>)\s*PAGE\s*(<\/w:instrText>)/g,
  '$1 PAGE \\* ROMAN \\** MERGEFORMAT $2'  // or "arabic" for body section
);
```

Also remove any empty `<w:pgNumType/>` from the cover section (docx-js emits these even when no pageNumbers is set):
```js
docXml = docXml.replace(/<w:pgNumType\/>/g, "");
```

### Page Numbering Rules

| Section | Content | Format | Start | Footer |
|---------|---------|--------|-------|--------|
| Cover | Title page | None | — | No footer |
| Front matter | Abstract, TOC | Roman (I, II, III) | 1 | `PAGE \* ROMAN` |
| Body | Main content | Arabic (1, 2, 3) | 1 | `PAGE \* arabic` |

⚠️ **The body section MUST set `pageNumbers: { start: 1 }`** — otherwise page numbers continue from the front matter pages, causing TOC page references to be offset. This is the #1 cause of "TOC page numbers are wrong".

### Common Causes of Incorrect Page Numbers

| Cause | Fix |
|-------|-----|
| `pageNumberStart` at properties top level | Move to `page: { pageNumbers: { start: 1 } }` |
| Cover section emits empty `<pgNumType/>` | Post-process to remove it |
| Footer uses bare `PAGE` without format switch | Post-process to add `\* roman` or `\* arabic` |
| Cover and body in same section | Separate cover into its own section |
| Multiple sections without pageNumbers.start | Explicitly set on each section needing independent counting |
| headingStyleRange doesn't match headings | Ensure `headingStyleRange: "1-3"` covers all HeadingLevel values used |
| Cover section has header/footer | Don't set header/footer on cover section |

## TOC Refresh Hint (MANDATORY)

**⚠️ When the document contains a TOC, you MUST add the following hint paragraph between the `TableOfContents` element and the PageBreak (so it appears on the TOC page, not the body page).** This ensures users know how to refresh page numbers after editing.

```js
new Paragraph({
  spacing: { before: 200 },
  children: [new TextRun({
    text: "Note: This Table of Contents is generated via field codes. To ensure page number accuracy after editing, please right-click the TOC and select \"Update Field.\"",
    italics: true, size: 18, color: "888888"
  })]
}),
```

## 5 Common TOC Bugs

| # | Bug | Symptom | Fix |
|---|-----|---------|-----|
| 1 | "目录" heading uses `HeadingLevel.HEADING_1` | TOC includes "目录" as an entry | Remove `heading:` from TOC title paragraph |
| 2 | No `PageBreak` after `TableOfContents` | TOC and body text on same page | Add `new Paragraph({ children: [new PageBreak()] })` after TOC |
| 3 | Missing `TableOfContents` element | Script cannot inject placeholders, TOC is empty | Always include `new TableOfContents(...)` in code |
| 4 | Headings use bold+large instead of `HeadingLevel` | TOC is empty even after running script | Change all body headings to `heading: HeadingLevel.HEADING_X` |
| 5 | Script not run or exit code ignored | TOC page shows only title + blank space | Always run script; if exit code = 1, fix code and regenerate |

## Checklist (for self-check during generation)

- [ ] Document has 3+ H1 → TOC is included
- [ ] "目录" heading does NOT use `HeadingLevel` (prevents self-indexing)
- [ ] `new TableOfContents(...)` element present (not just plain text)
- [ ] `PageBreak` exists after TOC element (prevents merging with body)
- [ ] All body chapter headings use `heading: HeadingLevel.HEADING_X`
- [ ] `add_toc_placeholders.py --auto` runs after generation
- [ ] Script exit code checked — if 1, fix code and regenerate
- [ ] TOC page has visible placeholder content (not empty)
- [ ] **TOC Refresh Hint present** — italic gray note after TOC PageBreak telling user to right-click → "Update Field"
- [ ] `outlineLevel: 0` for H1, `1` for H2, etc. (needed for TOC field update)
