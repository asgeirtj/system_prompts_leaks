## Geometric Decoration System — Pure docx-js Decorations

### Design Philosophy

Uses only docx-js native capabilities for visual decoration — no external tools (like Playwright screenshots). Suitable for covers, chapter separators, page background enhancement.

**When to fall back to Playwright?**  
Only when gradients, complex illustrations, or brand visuals are needed that pure OOXML cannot express. Default: prefer native solutions below.

### Decoration Element Library

#### 1. Color Strip — Table Simulation

Single-row single-column borderless table + background color to create horizontal color strips.

```js
function colorStrip(color, height = 80) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: NB, bottom: NB, left: NB, right: NB,
               insideHorizontal: NB, insideVertical: NB },
    rows: [new TableRow({
      height: { value: height, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: color.replace("#", "") },
        borders: { top: NB, bottom: NB, left: NB, right: NB },
        children: [new Paragraph({ children: [] })],
      })],
    })],
  });
}

// ══════════════════════════════════════════════════════════════
// R6 — Editorial Warm (minimal, warm white bg, no decorations)
// ══════════════════════════════════════════════════════════════
// Suitable for: lesson plans (non-STEM), cultural/creative, newsletters,
//   event planning, internal reports, light-weight documents
// NOT for: formal business, consulting, finance, government, academic
// Title constraint: single line only (≤20 chars). Longer titles → route to R1.
//
// Structure: 2-row wrapper table (no border, warm bg shading)
//   Row 1 (content): category → title → subtitle → fields
//   Row 2 (footer):  left English title + right label
// All spacing via paragraph indent (WPS safe, no cell margins).

function buildCoverR6(config) {
  const P = config.palette;
  const PAD_L = 1300, PAD_R = 1100;
  const ind = { left: PAD_L, right: PAD_R };
  const FOOTER_H = 900;
  const CONTENT_H = 16838 - FOOTER_H;
  const shading = { fill: P.bg || "F7F7F5", type: ShadingType.CLEAR };

  // ⚠️ R6 uses a simplified title layout: prefer single line, shrink font to fit
  const availW = 11906 - PAD_L - PAD_R;
  const { titlePt, titleLines } = calcTitleLayoutR6(config.title, availW, 36, 22);
  const titleSize = titlePt * 2;
  const lineH = Math.ceil(titlePt * 23 * 1.3);

  // Dynamic top spacing
  const titleH = titleLines.length * (titleSize * 10 + 200);
  const categoryH = 22 * 10 + 900;
  const subtitleH = config.subtitle ? (28 * 10 + 1200) : 0;
  const fieldsH = (config.metaLines || []).length * (24 * 10 + 100);
  const contentH = categoryH + titleH + subtitleH + fieldsH;
  const remaining = Math.max(CONTENT_H - 1200 - contentH, 400);
  const topSpacing = Math.floor(remaining * 0.55);

  const children = [];

  // 1. Top spacer (dynamic)
  children.push(new Paragraph({ indent: ind, spacing: { before: topSpacing } }));

  // 2. Category label (small, wide letter-spacing)
  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: ind, spacing: { after: 900 },
      children: [new TextRun({
        text: config.englishLabel, size: 22,
        color: P.cover.metaColor || "9A9A9A",
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
        characterSpacing: 60,
      })],
    }));
  }

  // 3. Title (single line preferred, dynamic font size)
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: ind,
      spacing: { after: i < titleLines.length - 1 ? 60 : 300, line: lineH, lineRule: "atLeast" },
      children: [new TextRun({
        text: titleLines[i], size: titleSize,
        color: P.cover.titleColor || "2C2C2C",
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
        characterSpacing: 30,
      })],
    }));
  }

  // 4. Subtitle
  if (config.subtitle) {
    children.push(new Paragraph({
      indent: ind, spacing: { after: 1200 },
      children: [new TextRun({
        text: config.subtitle, size: 28,
        color: P.cover.subtitleColor || "6B6B6B",
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
        characterSpacing: 15,
      })],
    }));
  }

  // 5. Meta fields (tab-aligned label + value)
  for (const line of (config.metaLines || [])) {
    // Expect "label：value" format or plain text
    const sep = line.indexOf("：") !== -1 ? "：" : (line.indexOf(":") !== -1 ? ":" : null);
    const label = sep ? line.split(sep)[0].trim() : line;
    const value = sep ? line.split(sep).slice(1).join(sep).trim() : "";
    children.push(new Paragraph({
      indent: ind, spacing: { after: 100 },
      tabStops: [{ type: TabStopType.LEFT, position: PAD_L + 1600 }],
      children: [
        new TextRun({ text: label, size: 22, color: P.cover.metaColor || "9A9A9A",
          font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, characterSpacing: 20 }),
        ...(value ? [
          new TextRun({ text: "\t" }),
          new TextRun({ text: value, size: 24, color: P.cover.subtitleColor || "6B6B6B",
            font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, characterSpacing: 8 }),
        ] : []),
      ],
    }));
  }

  // 6. Footer (2-column borderless table)
  const footerLeft = config.footerLeft || "";
  const footerRight = config.footerRight || "";
  // Adaptive font size for long English footer text
  const flSize = footerLeft.length > 60 ? 14 : (footerLeft.length > 40 ? 16 : 18);
  const flSpacing = footerLeft.length > 60 ? 5 : (footerLeft.length > 40 ? 10 : 20);

  const footerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED, borders: allNoBorders,
    rows: [new TableRow({
      children: [
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE }, borders: noBorders, shading,
          children: [new Paragraph({
            indent: { left: PAD_L },
            children: [new TextRun({ text: footerLeft, size: flSize,
              color: P.cover.footerColor || "9A9A9A",
              font: { ascii: "Calibri" }, characterSpacing: flSpacing })],
          })],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE }, borders: noBorders, shading,
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT, indent: { right: PAD_R },
            children: [new TextRun({ text: footerRight, size: 18,
              color: P.cover.footerColor || "9A9A9A",
              font: { ascii: "Calibri" }, characterSpacing: 20 })],
          })],
        }),
      ],
    })],
  });

  // 7. 2-row wrapper (content + footer)
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED, borders: allNoBorders,
    rows: [
      new TableRow({
        height: { value: CONTENT_H, rule: "exact" },
        children: [new TableCell({
          shading, borders: noBorders,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          verticalAlign: VerticalAlign.TOP,
          children,
        })],
      }),
      new TableRow({
        height: { value: FOOTER_H, rule: "exact" },
        children: [new TableCell({
          shading, borders: noBorders,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          verticalAlign: VerticalAlign.CENTER,
          children: [footerTable],
        })],
      }),
    ],
  })];
}

// R6 title layout: prefer FEWER lines over larger font size (single line best)
function calcTitleLayoutR6(title, availableWidthTw, preferredPt, minPt) {
  const step = 2;
  // Try to fit in 1 line (shrink font if needed)
  for (let pt = preferredPt; pt >= minPt; pt -= step) {
    const charWidthTw = pt * 23 * 0.5; // CJK ~50% em width
    const charsPerLine = Math.floor(availableWidthTw / charWidthTw);
    if (title.length <= charsPerLine) return { titlePt: pt, titleLines: [title] };
  }
  // Can't fit in 1 line, try 2 lines at largest possible font
  for (let pt = preferredPt; pt >= minPt; pt -= step) {
    const charWidthTw = pt * 23 * 0.5;
    const charsPerLine = Math.floor(availableWidthTw / charWidthTw);
    const lines = splitTitleLines(title, charsPerLine);
    if (lines.length <= 2) return { titlePt: pt, titleLines: lines };
  }
  // Fallback: minPt, up to 3 lines
  const charWidthTw = minPt * 23 * 0.5;
  const charsPerLine = Math.floor(availableWidthTw / charWidthTw);
  return { titlePt: minPt, titleLines: splitTitleLines(title, charsPerLine) };
}

// Usage: cover top decoration
// children: [colorStrip(P.accent, 120), ...]
```

#### 2. Side Ribbon

Uses left border to create vertical ribbon effect.

```js
function sideRibbon(content, color, width = 14) {
  return new Paragraph({
    border: {
      left: { style: BorderStyle.SINGLE, size: width, color: color.replace("#", ""), space: 12 },
    },
    indent: { left: 240 },
    spacing: { before: 100, after: 100 },
    children: content,
  });
}

// Usage: emphasis quotes, chapter tips
// sideRibbon([new TextRun({ text: "Key Insight", bold: true })], P.accent)
```

#### 3. Border Compositions

```js
// Top thick line + bottom thin line — title area frame
function frameTitle(titleRuns) {
  return new Paragraph({
    border: {
      top: { style: BorderStyle.SINGLE, size: 18, color: c(P.accent) },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) },
    },
    spacing: { before: 400, after: 200 },
    alignment: AlignmentType.CENTER,
    children: titleRuns,
  });
}

// L-shape border — left + bottom
function lShapeBorder(content) {
  return new Paragraph({
    border: {
      left: { style: BorderStyle.SINGLE, size: 12, color: c(P.accent), space: 10 },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: c(P.accent) },
    },
    indent: { left: 300 },
    spacing: { before: 200, after: 300 },
    children: content,
  });
}

// Double-line frame — top and bottom double lines
function doubleLine(content) {
  return new Paragraph({
    border: {
      top: { style: BorderStyle.DOUBLE, size: 6, color: c(P.accent) },
      bottom: { style: BorderStyle.DOUBLE, size: 6, color: c(P.accent) },
    },
    spacing: { before: 200, after: 200 },
    alignment: AlignmentType.CENTER,
    children: content,
  });
}
```

#### 4. Gradient Simulation

Multiple narrow color strips to simulate gradient effect.

```js
function gradientStrip(startColor, endColor, steps = 5, totalHeight = 200) {
  const rows = [];
  const h = Math.floor(totalHeight / steps);
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const blended = blendColors(startColor, endColor, ratio);
    rows.push(new TableRow({
      height: { value: h, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: blended },
        borders: { top: NB, bottom: NB, left: NB, right: NB },
        children: [new Paragraph({ children: [] })],
      })],
    }));
  }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: NB, bottom: NB, left: NB, right: NB,
               insideHorizontal: NB, insideVertical: NB },
    rows,
  });
}

function blendColors(hex1, hex2, ratio) {
  const r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * ratio), g = Math.round(g1 + (g2 - g1) * ratio), b = Math.round(b1 + (b2 - b1) * ratio);
  return `${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}
```

#### 5. Symbol Ornaments

```js
// Section divider line — for chapter separation
function ornamentDivider(symbol = "◆", count = 3) {
  const ornament = Array(count).fill(symbol).join("   ");
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 400 },
    children: [new TextRun({ text: ornament, size: 20, color: c(P.accent) })],
  });
}

// Common decoration symbols
// ◆ ◇ ● ○ ★ ☆ ■ □ ▲ △ ─ ━ ═ ║ ╔ ╗ ╚ ╝
// Ornamental: ❧ ❦ ✦ ✧ ✿ ❀ ❁ ※
```

#### 6. Info Card — Table Implementation

```js
function infoCard(title, items, accentColor) {
  const ac = accentColor.replace("#", "");
  const headerRow = new TableRow({
    children: [new TableCell({
      columnSpan: 2,
      shading: { type: ShadingType.CLEAR, fill: ac },
      margins: { top: 80, bottom: 80, left: 160, right: 160 },
      borders: { top: NB, bottom: NB, left: NB, right: NB },
      children: [new Paragraph({
        children: [new TextRun({ text: title, bold: true, size: 24, color: "FFFFFF" })],
      })],
    })],
  });

  const dataRows = items.map(([label, value]) => new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        margins: { top: 60, bottom: 60, left: 160, right: 80 },
        shading: { type: ShadingType.CLEAR, fill: "F8F9FA" },
        borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                   top: NB, left: NB, right: NB },
        children: [new Paragraph({ children: [new TextRun({ text: label, size: 21, color: "666666" })] })],
      }),
      new TableCell({
        margins: { top: 60, bottom: 60, left: 80, right: 160 },
        borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                   top: NB, left: NB, right: NB },
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 21 })] })],
      }),
    ],
  }));

  return new Table({
    width: { size: 80, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    borders: { top: NB, bottom: NB, left: NB, right: NB,
               insideHorizontal: NB, insideVertical: NB },
    rows: [headerRow, ...dataRows],
  });
}
```


// R7 — Swiss Tech Minimalist (slate grey bg, Klein blue accent, asymmetric layout)  
// Suitable for: cultural/creative research, trend reports, brand strategy, design deliverables  
// Palette: ST-1 (exclusive)  
// Layout: left-aligned title (upper 20%), right-shifted subtitle with top rule,  
//         right-aligned info block with accent right border, Swiss cross anchor  
// Key features: ■ square accent dot, open-frame tables, large whitespace  
//  
// ⚠️ MANDATORY: All cover non-negotiables apply (margin=0, 16838 exact, allNoBorders)  
// ⚠️ Title uses calcTitleLayout() with maxPt=36 (not 40 — R7 uses lighter visual weight)

function buildCoverR7(config) {
  ```js
  const P = palettes[config.palette || "ST-1"];
  const C = P.cover;
  const padL = 600;

  // Title layout — R7 uses 36pt max (lighter than R1-R4's 40pt)
  const availW = 11906 - padL - 600;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availW, 36, 24);
  const titleSize = titlePt * 2;
  const lineH = Math.ceil(titlePt * 23);

  // Dynamic spacing based on title lines
  const topSpacer = titleLines.length <= 2 ? 1200 : 800;
  const subtitleSpacer = titleLines.length <= 2 ? 1400 : 800;
  const infoSpacer = titleLines.length <= 2 ? 2200 : 1200;

  const children = [];

  // 1. Swiss cross anchor — top-left decorative element
  children.push(new Paragraph({
    spacing: { before: 600 },
    indent: { left: padL },
    children: [new TextRun({
      text: "\uFF0B",  // ＋ fullwidth plus
      size: 40, bold: true, color: C.titleColor,
      font: { ascii: "Arial", eastAsia: "SimHei" },
    })],
  }));

  // 2. Top spacer
  children.push(new Paragraph({ spacing: { before: topSpacer } }));

  // 3. Title lines — left-aligned, last line has accent ■
  titleLines.forEach((line, i) => {
    const isLast = i === titleLines.length - 1;
    const runs = [new TextRun({
      text: line, size: titleSize, color: C.titleColor,
      font: { ascii: "Arial", eastAsia: "Noto Sans SC" },
    })];
    if (isLast) {
      runs.push(new TextRun({
        text: " \u25A0",  // ■ black square
        size: 24, color: P.accent,
        font: { ascii: "Arial" },
      }));
    }
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: isLast ? 200 : 80, line: lineH, lineRule: "atLeast" },
      children: runs,
    }));
  });

  // 4. Subtitle spacer
  children.push(new Paragraph({ spacing: { before: subtitleSpacer } }));

  // 5. Subtitle — right-shifted, top border rule, wide character spacing
  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: 3800, right: 600 },
      border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.titleColor, space: 14 } },
      spacing: { after: 200 },
      children: [new TextRun({
        text: config.subtitle, size: 26, color: C.subtitleColor,
        font: { ascii: "Arial", eastAsia: "Noto Sans SC" },
        characterSpacing: 40,
      })],
    }));
  }

  // 6. Decorative horizontal line
  children.push(new Paragraph({
    spacing: { before: 600 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "C8D0DC", space: 0 } },
  }));

  // 7. Info spacer
  children.push(new Paragraph({ spacing: { before: infoSpacer } }));

  // 8. Info footer — right-aligned, 4 label+value pairs, accent right border
  // Standard fields: ORGANIZATION, RESPONSIBILITY, REPORT NUMBER, DATE & EDITION
  const metaEntries = config.metaEntries || [
    { label: "ORGANIZATION", value: config.organization || "" },
    { label: "RESPONSIBILITY", value: config.responsibility || "" },
    { label: "REPORT NUMBER", value: config.reportNumber || "" },
    { label: "DATE & EDITION", value: config.dateEdition || "" },
  ];

  for (const entry of metaEntries) {
    // Label — 7pt uppercase English
    children.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      indent: { right: 800 },
      border: { right: { style: BorderStyle.SINGLE, size: 12, color: P.accent, space: 16 } },
      spacing: { after: 20 },
      children: [new TextRun({
        text: entry.label, size: 14, color: C.metaColor,
        font: { ascii: "Arial" },
        characterSpacing: 20,
      })],
    }));
    // Value — 11pt bold
    children.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      indent: { right: 800 },
      border: { right: { style: BorderStyle.SINGLE, size: 12, color: P.accent, space: 16 } },
      spacing: { after: 280 },
      children: [new TextRun({
        text: entry.value, size: 22, bold: true, color: C.titleColor,
        font: { ascii: "Arial", eastAsia: "Noto Sans SC" },
      })],
    }));
  }

  // Wrap in 16838 exact wrapper table
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: P.bg },
        borders: noBorders,
        verticalAlign: VerticalAlign.TOP,
        children,
      })],
    })],
  })];
  ```
}

### Decoration Usage Scenarios

| Scenario | Recommended Decoration | Combination |
|------|----------|----------|
| Report cover | Color strip + L-frame border | Top strip → Title area → L-frame author info |
| Proposal cover | Gradient simulation + double-line frame | Gradient bg → Double-line title |
| Chapter separator | Symbol ornament + side ribbon | Symbol divider → New chapter title with ribbon |
| Summary card | Info card | Standalone card displaying key metrics |
| Academic cover | Color strip + info table | Top strip → School name → Title → Info table |

---
