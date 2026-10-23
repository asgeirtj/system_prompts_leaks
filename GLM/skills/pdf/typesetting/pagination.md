# Pagination & Flow Control

> Core rules for multi-page document layout quality. Must be followed every time a multi-page PDF is generated.  
>  
> Related:  
> - `typesetting/overflow.md` — the comprehensive overflow prevention system covering all three routes (ReportLab, LaTeX, Playwright).  
> - `typesetting/fill-engine.md` — the **anti-void** adaptive engine (handles pages with too little content: font floor, fill ratio, paragraph inflation, Y-axis golden-ratio anchoring).

---

## 1. Last Page Blank Control (Anti-Orphan Page)

**Problem**: The last page has only one or two lines of content with large blank areas — looks terrible.

**Mandatory Rules**:

- After generating multi-page content, **you must check the content fill ratio of the last page**
- When last page content ratio < 25%, **you must backtrack and adjust**
- Adjustment strategies (by priority):
  1. **Compress preceding page spacing**: Reduce margin-bottom between sections (decrease 2-4px each)
  2. **Tighten line height**: Body line-height from 1.7 → 1.55 (no lower than 1.5)
  3. **Reduce font size**: Body from 16px → 15px (no lower than 14px)
  4. **Trim content**: Remove dispensable descriptive text without affecting core information
  5. **Merge small sections**: Combine adjacent sections with little content

**Checking Method (Playwright HTML route)**:
```css
/* Check min-content on the last .page element */
/* If content is less than 25% of page, backtracking is needed */
```

**Practical Standards**:
- Last page content ratio >= 40% → ✅ Pass
- Last page content ratio 25%-40% → ⚠️ Acceptable but optimization recommended
- Last page content ratio < 25% → ❌ Must adjust

---

## 2. Table Cross-Page Integrity

**Problem**: Table header and first data row split across two pages; table cut in the middle.

**Mandatory Rules**:

### Playwright HTML Route
```css
/* Prevent table splitting */
table, .table-wrapper {
  break-inside: avoid;     /* Preferred: keep entire table together */
  page-break-inside: avoid;
}

/* If table is too long and must split, ensure header repeats */
thead {
  display: table-header-group;  /* Repeat header on each page */
}

/* Don't cut table rows in the middle */
tr {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Bind header + at least 2 data rows together */
thead + tbody tr:first-child,
thead + tbody tr:nth-child(2) {
  break-before: avoid;
  page-break-before: avoid;
}
```

### ReportLab Route
```python
# Use Table's repeatRows parameter
table = Table(data, repeatRows=1)  # Repeat header on each page

# Or use KeepTogether to wrap small tables
from reportlab.platypus import KeepTogether
elements.append(KeepTogether([table_title, table]))
```

**Additional Rules**:
- Table rows ≤ 8: Entire table `break-inside: avoid`, no page splitting allowed
- Table rows > 8: Splitting allowed, but must use `thead { display: table-header-group }` to repeat header on each page
- All card-grid / flex-grid layouts follow the same rule: `break-inside: avoid`

---

## 3. CJK Punctuation Placement Rules

**Problem**: Commas, periods, enumeration commas, etc. appearing at line start, violating CJK typesetting standards.

**Mandatory Rules**:

### Playwright HTML Route (Recommended)
```css
/* Global CJK punctuation rules */
body {
  line-break: strict;         /* Strict line-break rules */
  word-break: normal;         /* Don't force word breaks */
  overflow-wrap: break-word;  /* Allow long words to break */
  hanging-punctuation: allow-end;  /* Allow punctuation to hang past line end */
}

/* For body paragraphs */
p, .body-text, td, li {
  line-break: strict;
  text-align: justify;        /* Justify to reduce line-end gaps */
}
```

**Effect of `line-break: strict`**:
- Prevents line-start: ，。、；：！？）】》…—
- Prevents line-end: （【《
- Natively supported by Chromium engine, no extra JS needed

### ReportLab Route
```python
# Set in ReportLab Paragraph style
from reportlab.lib.enums import TA_JUSTIFY
style = ParagraphStyle(
    'Body',
    alignment=TA_JUSTIFY,
    wordWrap='CJK',  # CJK line-break mode
)
```

**Verification Checklist**:
- [ ] No comma/period appears as the first character of any line
- [ ] Left parenthesis / left quotation mark does not appear at line end
- [ ] Ellipsis is not broken in the middle

---

## 4. Major Section Page-Break Rule (3/4 Threshold)

**Problem**: A major section (H1/一级标题) ends at ~75% of the page, and the next major section's title gets squeezed into the remaining 25%. This looks cramped and ugly — the new section deserves a fresh page.

**Iron Rule**: When a major section (H1-level heading, e.g., "一、""二、" or "Chapter 1") is about to start, check remaining page space:

| Remaining space | Action |
|----------------|--------|
| **≥ 25% of page height** | Continue on same page — enough room for heading + meaningful content |
| **< 25% of page height** | Force page break — start the new section on a fresh page |

**Why 25% (not 50%)?** A major heading needs at least its title + 2-3 lines of body text to look intentional. If there's only enough room for a title and a line or two, it looks like an accident.

### ReportLab Implementation
```python
from reportlab.platypus import CondPageBreak

# Before every H1-level heading, insert a conditional page break.
# CondPageBreak(height) breaks to next page if remaining space < height.
# Use 75% of available page height as threshold.
available_height = page_height - top_margin - bottom_margin
threshold = available_height * 0.25  # break if less than 25% remains

# In story building:
story.append(CondPageBreak(threshold))  # ← goes before H1 heading
story.append(h1_paragraph)
```

### Playwright / CSS @page Implementation
```css
/* H1-level headings always prefer starting on a new page
   unless there's substantial room remaining */
h1, .major-section-title {
  break-before: auto;       /* Default: don't force */
  page-break-before: auto;
}
```

```javascript
// Post-render check: if an H1 starts in the bottom 25% of the viewport,
// force a page-break-before to avoid orphan headings
document.querySelectorAll('h1, .major-section-title').forEach(h => {
  const rect = h.getBoundingClientRect();
  // In print context, check if heading is too far down the page
  // This can be verified after Playwright render via page.evaluate()
  const pageHeight = window.innerHeight;
  const relativeY = rect.top / pageHeight;
  if (relativeY > 0.75) {
    h.style.breakBefore = 'page';
  }
});
```
```

### LaTeX Implementation
```latex
% Before each \section{} (H1-level), check remaining space
\needspace{0.25\textheight}  % requires needspace package
\section{New Major Section}
```

**Scope**: This rule applies to **H1-level headings only** (major sections, chapters, top-level numbered items like "一、""二、"). Sub-sections (H2, H3) follow the standard heading-body binding rule (no orphan headings at page bottom) but do NOT force page breaks.

---

## 5. Other Anti-Split Rules

### Heading–Body Binding
```css
h1, h2, h3, h4, .section-title {
  break-after: avoid;       /* Don't page-break after heading */
  page-break-after: avoid;
}
```

### Image / Card Protection
```css
figure, .card, .kpi-card, .project-card {
  break-inside: avoid;
  page-break-inside: avoid;
}
```

> **⚠️ Image `max-height` is critical.** `break-inside: avoid` alone can cause images to occupy an entire page when the image is tall. Always pair with `max-height` from overflow.md (`img { max-height: 45vh }`) to prevent single images from consuming a full page.

### List Item Binding
```css
li {
  break-inside: avoid;
}
/* Keep at least 2 list items on the same page */
li:last-child {
  break-before: avoid;
}
```

---

## Quick Checklist (After every multi-page PDF generation)

```
□ Last page content ≥ 40%?
□ Major sections (H1) not starting in bottom 25% of a page?
□ Table header and data rows not separated?
□ No punctuation appearing at line start?
□ No heading orphaned at page bottom?
□ No card/image cut in half?
□ Page numbering follows the standard scheme (see Section 6)?
```

---

## 6. Standard Page Numbering Scheme

All multi-page documents MUST follow this five-zone page numbering convention unless the user explicitly requests otherwise.

### Zone Definitions

| Zone | Section | Numbering Style | Starts At | Visibility |
|------|---------|----------------|-----------|------------|
| **1. Cover** | Title page | — | Logical page 1 | **Hidden** (no visible page number, but counts as page 1 internally) |
| **2. Front Matter** | Table of Contents, Preface, Abstract, Acknowledgments | **Lowercase Roman** (i, ii, iii, iv, v…) | i | Visible, centered footer |
| **3. Body** | Main content chapters/sections | **Arabic** (1, 2, 3…) | **Resets to 1** | Visible, centered or outer-edge footer |
| **4. Appendix** | Appendices (A, B, C…) | **Arabic, continues** from body | Continues | Visible |
| **5. References / Bibliography** | Works cited, bibliography | **Arabic, continues** from body/appendix | Continues | Visible |

### Key Rules

0. **NEVER use "Page X of Y" format (denominator is FORBIDDEN).** Footer must show only the page number itself (e.g., `1`, `2`, `iii`). Do NOT display total page count. No `Page 3 of 12`, no `第3页/共12页`, no `3 / 12`. Just the bare number.

1. **Cover page is ALWAYS page 1 internally** but the page number is **never displayed**. This is achieved by suppressing the footer/header on the first page, not by excluding it from the page count.

2. **Front matter uses a separate Roman numeral sequence.** When front matter exists (TOC, abstract, preface), it forms its own numbering sequence starting at `i`. This sequence is independent of the body numbering.

3. **Body numbering resets to Arabic 1.** The first page of actual content (Chapter 1, Introduction, etc.) is always page `1` regardless of how many front matter pages precede it.

4. **Appendix and references continue the body sequence.** There is NO reset between body → appendix → references. If the body ends on page 42, Appendix A starts on page 43.

5. **Documents without front matter** skip zone 2 entirely. Cover = hidden page 1, body starts at visible page 1.

6. **Documents without a cover** start the body (or front matter if present) at page 1 directly.

### ReportLab Implementation

```python
from reportlab.platypus import SimpleDocTemplate, PageBreak, NextPageTemplate, PageTemplate
from reportlab.lib.units import inch
from reportlab.platypus.frames import Frame

def footer_with_arabic(canvas, doc):
    """Standard Arabic page number in footer."""
    canvas.saveState()
    canvas.setFont('Helvetica', 9)
    canvas.drawCentredString(doc.pagesize[0] / 2, 0.5 * inch,
                             str(doc.page))
    canvas.restoreState()

def footer_with_roman(canvas, doc):
    """Roman numeral page number for front matter."""
    roman_map = {1:'i',2:'ii',3:'iii',4:'iv',5:'v',6:'vi',7:'vii',8:'viii',9:'ix',10:'x'}
    page_num = roman_map.get(doc.page, str(doc.page))
    canvas.saveState()
    canvas.setFont('Helvetica', 9)
    canvas.drawCentredString(doc.pagesize[0] / 2, 0.5 * inch, page_num)
    canvas.restoreState()

def no_footer(canvas, doc):
    """Cover page — no visible page number."""
    pass

# Define page templates:
# - 'cover': no footer
# - 'frontmatter': Roman numeral footer
# - 'body': Arabic footer (page counter resets)
```

### Playwright / HTML + CSS Implementation

```css
/* Zone 1: Cover — suppress page number */
.page-cover {
  /* No footer content */
}

/* Zone 2: Front matter — Roman numerals via CSS counter */
@page :nth(2) { /* Adjust range based on front matter pages */ }

/* For Playwright, page numbers are typically added via:
   1. A footer element on each .page div, or
   2. Post-processing with pypdf after PDF generation */
```

**Practical approach for Playwright route**: Since CSS `@page` counters with Roman/Arabic switching are poorly supported, the recommended pattern is:
1. Generate the PDF without page numbers
2. Use pypdf to stamp page numbers in post-processing:
   - Skip page 1 (cover)
   - Roman numerals for front matter pages
   - Arabic starting from 1 for body pages

### LaTeX Implementation

```latex
% Cover: no page number displayed
\begin{titlepage}
  \thispagestyle{empty}  % Suppress page number
  % ... cover content ...
\end{titlepage}

% Front matter: Roman numerals
\pagenumbering{roman}    % Switches to i, ii, iii...
\tableofcontents
\newpage

% Body: Arabic, reset to 1
\pagenumbering{arabic}   % Switches to 1, 2, 3... (auto-resets counter)
\section{Introduction}
% ...

% Appendix: continues Arabic numbering (no reset)
\appendix
\section{Appendix A}     % Page number continues from body

% References: continues Arabic numbering (no reset)
\bibliographystyle{plain}
\bibliography{refs}
```

### When to Deviate

- **Single-page documents** (certificates, letters, posters): No page numbering at all.
- **Short documents (≤3 pages)**: Simple Arabic `1, 2, 3` throughout, no cover/frontmatter distinction.
- **User explicitly requests a different scheme**: Follow the user's instructions.
- **Exam papers**: Sequential Arabic numbering on every page, including page 1.
