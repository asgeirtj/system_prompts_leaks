# FAQ — Common Bugs and Fixes

## Bug: Table text touching cell borders

**Symptom**: Text is cramped against table cell edges, no padding.

**Fix**: Set `margins` at the TableCell level:
```js
new TableCell({
  margins: { top: 60, bottom: 60, left: 120, right: 120 },
  children: [/* ... */],
})
```

---

## Bug: Numbered list doesn't restart

**Symptom**: Second numbered list continues from where the first left off (e.g., starts at 4 instead of 1).

**Fix**: Each separate numbered list MUST use a unique `reference` name in numbering config:
```js
numbering: { config: [
  { reference: "list-A", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1." }] },
  { reference: "list-B", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1." }] },
]}
```

---

## Bug: Cover and content on same page

**Symptom**: Cover page content flows directly into main content without page break.

**Fix**: Add a PageBreak paragraph at the end of cover content:
```js
coverChildren.push(new Paragraph({ children: [new PageBreak()] }));
```

---

## Bug: Three-line table shows all borders

**Symptom**: Table intended to be three-line shows full grid borders.

**Fix**: Set table-level borders to NONE, then override only specific cell borders:
```js
// Table level: all borders NONE
borders: { top: { style: BorderStyle.SINGLE, size: 4 }, bottom: { style: BorderStyle.SINGLE, size: 4 },
  left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
  insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } }
// Header cells: bottom border only
headerCell.borders = { bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" } }
```

---

## Bug: User requests Chinese font size name (e.g. Wu Hao) but output is wrong

**Symptom**: Font size doesn't match expected Chinese size name.

**Fix**: Use the correct half-point value. `size` in docx-js is in half-points:
- Wu Hao 五号 = 10.5pt → `size: 21`
- Xiao Si 小四 = 12pt → `size: 24`
- Si Hao 四号 = 14pt → `size: 28`

See SKILL.md for complete conversion table.

---

## Bug: Black table cells

**Symptom**: Table cells appear solid black in Word.

**Fix**: Use `ShadingType.CLEAR` not `ShadingType.SOLID`:
```js
// ❌ WRONG
shading: { type: ShadingType.SOLID, fill: "F1F5F9" }
// ✅ CORRECT
shading: { type: ShadingType.CLEAR, fill: "F1F5F9" }
```

---

## Bug: Chinese characters garbled in matplotlib charts

**Symptom**: Chinese text shows as empty boxes □□□ in generated PNG charts.

**Fix**: Configure SimHei font before plotting:
```python
from matplotlib.font_manager import FontProperties
zh_font = FontProperties(fname="/path/to/SimHei.ttf")
plt.title("中文标题", fontproperties=zh_font)
plt.rcParams["axes.unicode_minus"] = False
```

---

## Bug: Image stretched/squashed in document

**Symptom**: Embedded image appears distorted.

**Fix**: Calculate display height from width using original aspect ratio:
```js
const aspectRatio = originalHeight / originalWidth;
const displayWidth = 500;
const displayHeight = Math.round(displayWidth * aspectRatio);
new ImageRun({ data: buf, transformation: { width: displayWidth, height: displayHeight }, type: "png" });
```

---

## Bug: TOC shows empty in generated document

→ See `references/toc.md` — "5 Common TOC Bugs" section for diagnosis and fixes.

---

## Bug: PageBreak standalone crashes Word

**Symptom**: Document fails to open or renders incorrectly.

**Fix**: PageBreak must always be wrapped in a Paragraph:
```js
// ❌ WRONG — standalone
children: [new PageBreak()]
// ✅ CORRECT — inside Paragraph
children: [new Paragraph({ children: [new PageBreak()] })]
```

---

## Bug: Quotation marks break JavaScript syntax — ⚠️ #1 MOST COMMON BUG

**This is the single most frequent code generation error.** Chinese text routinely uses curly quotes `""` for emphasis, proper nouns, and event names (e.g., "双11", "前低后高", "618"大促). These MUST be Unicode-escaped — bare curly quotes silently break JS syntax.

**Rule: scan ALL Chinese text for `""''` and replace with `\u201c \u201d \u2018 \u2019` BEFORE writing the string.**

```js
// ❌ WRONG — curly quotes in Chinese text break syntax (extremely common)
para("行业增速呈现"前低后高"的态势，在"618"大促拉动下增长。")
"他说"你好""       // \u201c \u201d
'It's a test'      // \u2019

// ✅ CORRECT — Unicode escapes for ALL curly quotes
para("行业增速呈现\u201c前低后高\u201d的态势，在\u201c618\u201d大促拉动下增长。")
"他说\u201c你好\u201d"
"It\u2019s a test"

// ✅ Straight quotes: escape or use alternate delimiters
"He said \"hello\""
'He said "hello"'
```

---

## Bug: Unwanted blank pages in document

**Common causes:**

1. **Trailing PageBreak at end of last section** — pagination should use section breaks or be at the start of the next section
2. **Empty Paragraph overflow** — empty paragraphs at page bottom push to a new page
3. **PageBreak right after Table** — Table already at page bottom, PageBreak creates extra page

**Fix:**
```js
// Post-generation check: last section's children should not end with PageBreak
function removeTrailingPageBreak(section) {
  const children = section.children;
  if (!children.length) return;
  const last = children[children.length - 1];
  // If last element is a Paragraph containing only PageBreak, remove it
  if (last instanceof Paragraph) {
    const runs = last.root?.filter(c => c instanceof PageBreak);
    if (runs?.length && !last.root?.some(c => c instanceof TextRun)) {
      children.pop();
    }
  }
}
```

**Prevention rules:**
- Place PageBreak at the **start of the next section**, not the end of the previous one
- Or use separate sections for pagination (no PageBreak needed)
- The last section of a document must NEVER end with a PageBreak

---

## Bug: Different rendering in WPS vs Microsoft Word

**Symptom**: Document looks correct in Word but renders differently in WPS (or vice versa) — misaligned tables, shifted content, clipped text in cells, black cells, or broken covers.

**Root causes and fixes:**

### 1. `ShadingType.SOLID` shows black in WPS
```js
// ❌ WPS shows solid black
shading: { type: ShadingType.SOLID, fill: "F1F5F9" }
// ✅ Both renderers show correct color
shading: { type: ShadingType.CLEAR, fill: "F1F5F9" }
```

### 2. `verticalAlign: "center"` in exact-height rows shifts content
WPS ignores vertical centering in `rule: "exact"` rows — content stays at top, creating visual mismatch.
```js
// ❌ Inconsistent between Word and WPS
new TableRow({ height: { value: 800, rule: "exact" },
  children: [new TableCell({ verticalAlign: VerticalAlign.CENTER, ... })] })
// ✅ Use top alignment + margins/spacing for positioning
new TableRow({ height: { value: 800, rule: "exact" },
  children: [new TableCell({ verticalAlign: VerticalAlign.TOP,
    margins: { top: 200 }, ... })] })
```

### 3. Tab stops misalign in WPS
Tab widths differ between Word and WPS. Never use tabs for alignment.
```js
// ❌ Tab-based alignment — breaks in WPS
new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: 8000 }],
  children: [new TextRun({ text: "Party A:\tCompany Name" })] })
// ✅ Borderless table for alignment — consistent everywhere
new Table({ borders: allNoBorders, rows: [new TableRow({ children: [
  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Party A:" })] })] }),
  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Company Name" })] })] }),
] })] })
```

### 4. Nested tables in exact-height cells overflow differently
Word calculates nested table heights more accurately than WPS. Use stacked tables instead.
```js
// ❌ Nested table inside exact-height cell
new TableRow({ height: { value: 16838, rule: "exact" },
  children: [new TableCell({ children: [nestedTable1, nestedTable2] })] })
// ✅ Stacked approach — content table + filler table
[contentTable, fillerTable]  // both at top level, heights sum to 16838
```

### 5. `characterSpacing` renders differently
Large `characterSpacing` values cause inconsistent letter spacing. Keep ≤ 80.

### 6. `titlePage: true` header/footer suppression
WPS may not correctly hide first-page headers when using `titlePage: true`. Use a separate section for the cover instead.

---

## Bug: Cover spills to second page

**Symptom**: Cover content overflows, with some elements (date, footer, accent strip) appearing on page 2.

**Root cause**: Total content height exceeds 16838 twips (A4 page height). Common when:
- Title is very long (3+ lines at large font size)
- Fixed spacing values assume short title
- Multiple meta lines + subtitle + English label

**Fix**: Always use `calcTitleLayout()` + `calcCoverSpacing()` from `design-system.md`. These dynamically adjust font sizes and spacing to fit within the page. See `design-system.md § Cover Content Overflow Prevention` for the complete checklist.

---

## Bug: Blank page 2 after cover in MS Office (but not WPS)

**Symptom**: Cover displays correctly in WPS but produces a blank second page in MS Office Word.

**Root cause**: The cover wrapper table uses **default docx-js table borders** (`single/auto/sz=4`) instead of explicitly setting `allNoBorders`. Default borders add ~8 twips per edge. MS Office includes border thickness in the exact-height row calculation, pushing total height past 16838 twips → overflow to page 2. WPS is more lenient and absorbs the extra pixels.

**Fix**: Every cover wrapper table MUST explicitly set `borders: allNoBorders`:
```js
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB,
                       insideHorizontal: NB, insideVertical: NB };

new Table({
  borders: allNoBorders,  // ← MANDATORY
  rows: [new TableRow({
    height: { value: 16838, rule: "exact" },
    // ...
  })],
});
```

**Prevention**: Add to post-generation check — search for any `new Table` in cover code that does not explicitly set `borders`.

---

## Bug: Cover decorative lines appear truncated or misaligned

**Symptom**: Horizontal decorative lines on the cover (accent strips, divider rules) display at different widths in MS Office vs WPS, or appear truncated / not spanning the intended width.

**Root cause**: Lines were implemented using text characters (`───`, `━━━`, `═══`, `——————`) instead of paragraph borders. Character-drawn lines depend on font metrics (character width × count), which vary across rendering engines.

**Fix**: Always use **paragraph borders** for decorative lines:
```js
// ✅ Paragraph border — renders consistently in both MS Office and WPS
new Paragraph({
  indent: { left: 1000, right: 1000 },
  border: { top: { style: BorderStyle.SINGLE, size: 18, color: accentColor, space: 20 } },
  children: [],
})

// ❌ NEVER use text characters for decorative lines
new TextRun({ text: "───────────────" })  // width varies across engines
```

**Note**: This applies to ALL cover recipes (R1–R5). Recipe R2 uses `border.top` and `border.bottom` for its double-rule frame — follow this pattern.

---

## Bug: "undefined" appears in document text

**Symptom**: Fields like "Contact: undefined" or "Location: undefined" in generated documents.

**Root cause**: JavaScript outputs the string `"undefined"` when accessing a property that doesn't exist on the config object.

**Fix**: Use `safeText()` helper for ALL user-facing text values:
```js
function safeText(value, placeholder) {
  if (value === undefined || value === null || value === "" ||
      String(value) === "NaN" || String(value) === "undefined") {
    return placeholder || "【Please fill in】";
  }
  return String(value);
}
// Usage: new TextRun({ text: safeText(config.contact, "【Contact person】") })
```
