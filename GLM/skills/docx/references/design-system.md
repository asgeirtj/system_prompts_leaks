# Design System — DOCX Skill

## Color Philosophy

GLM uses a **mood-driven dynamic color system** instead of fixed named palettes. Colors are constructed from three dimensions:

### Three Dimensions of Document Color

| Dimension | Description | Range |
|-----------|-------------|-------|
| **Temperature** | Warm ↔ Cool | Warm (consulting, education) ↔ Cool (tech, medical) |
| **Weight** | Light ↔ Heavy | Light (resume, proposal) ↔ Heavy (legal, academic) |
| **Energy** | Calm ↔ Active | Calm (official, contract) ↔ Active (report, presentation) |

### Color Token System

Every document uses 5 color tokens. These are **computed** based on the document's mood, not selected from a fixed list.

| Token | Role | Guidance |
|-------|------|----------|
| `primary` | Headings, cover title | Dark, authoritative. Derived from Temperature + Weight. |
| `body` | Body text | Near-black with subtle warmth/coolness. Always high contrast. |
| `secondary` | Captions, footnotes | Mid-tone gray. Legible but visually recessive. |
| `accent` | Table headers, lines, links | The "personality" color. Reflects document Energy. |
| `surface` | Table alternating rows, card backgrounds | Very light tint of accent or neutral. |

### Mood Recipes

Instead of 10 fixed palettes, combine dimensions to generate colors dynamically:

**Cool + Heavy + Calm** → Deep Sea Academic (Academic / Research)
```js
const academic = {
  primary: "#162032", body: "#1C2A3D", secondary: "#5B6B7D",
  accent: "#8B7E5A", surface: "#F5F7FA"
};
```

**Warm + Heavy + Calm** → Legal Wood (Legal / Compliance)
```js
const legal = {
  primary: "#28201C", body: "#36302C", secondary: "#6E6560",
  accent: "#7A5C3A", surface: "#FBF9F7"
};
```

**Cool + Light + Active** → Dawn Mist Tech (Tech / Digital)
```js
const tech = {
  primary: "#0A1628", body: "#1A2B40", secondary: "#6878A0",
  accent: "#5B8DB8", surface: "#F4F8FC"
};
```

**Warm + Light + Active** → Warm Sun (Education / Training)
```js
const education = {
  primary: "#2A3518", body: "#384228", secondary: "#6B8040",
  accent: "#D4A030", surface: "#F8FAF4"
};
```

**Neutral + Medium + Calm** → Plain Paper (Default / General)
```js
const general = {
  primary: "#101820", body: "#182030", secondary: "#506070",
  accent: "#8090A0", surface: "#F2F4F6"
};
```

**Warm + Medium + Calm** → Terracotta (Consulting / Architecture)
```js
const consulting = {
  primary: "#241E1A", body: "#3A3430", secondary: "#68605A",
  accent: "#B08050", surface: "#FDFBF9"
};
```

**Cool + Medium + Active** → Mint Medical (Medical / Clinical)
```js
const medical = {
  primary: "#0E2030", body: "#1E2E40", secondary: "#4A6580",
  accent: "#3888A8", surface: "#F0F6FA"
};
```

**Neutral + Light + Calm** → White Porcelain (Product Manuals / Minimalist)
```js
const minimal = {
  primary: "#303030", body: "#484848", secondary: "#808080",
  accent: "#B89870", surface: "#FAFAF8"
};
```

**Cool + Light + Active (Gradient)** → Lapis Tech (Tech / AI / Innovation)
```js
const liuliTech = {
  primary: "#1A1F36", body: "#000000", secondary: "#5A6080",
  accent: "#667eea", surface: "#F8F9FF",
  gradient: ["#667eea", "#764ba2"],  // Purple-blue gradient (blendColors 5-step)
};
```

**Cool + Heavy + Active (Gradient)** → Deep Sea Blue-Gold (Finance / Investment / Premium)
```js
const deepBlueGold = {
  primary: "#0F2027", body: "#000000", secondary: "#4A6575",
  accent: "#D4AF37", surface: "#F5F7FA",
  gradient: ["#0F2027", "#203A43", "#2C5364"],  // 3-step deep sea blue gradient
};
```

**Warm + Light + Active (Gradient)** → Mint Dawn (Education / Health / Green)
```js
const mintMorning = {
  primary: "#1A3A3A", body: "#000000", secondary: "#507070",
  accent: "#3CB4A0", surface: "#F0FFFE",
  gradient: ["#3CB4A0", "#a8edea"],  // Mint green gradient
};
```

**Neutral + Medium + Active** → Graphite Orange (Professional but Energetic)
```js
const graphiteOrange = {
  primary: "#2C3E50", body: "#000000", secondary: "#607080",
  accent: "#E67E22", surface: "#FDF8F3",
};
```

### Scene → Mood Mapping

| Scene Keywords | Temperature | Weight | Energy | Recipe |
|----------------|-------------|--------|--------|--------|
| thesis, academic | Cool | Heavy | Calm | Deep Sea Academic |
| report (general) | Neutral | Medium | Calm | Plain Paper |
| report (consulting) | Warm | Medium | Calm | Terracotta |
| report (tech) | Cool | Light | Active | Dawn Mist Tech |
| contract, agreement, legal | Warm | Heavy | Calm | Legal Wood |
| resume, CV | Neutral | Light | Calm | White Porcelain (preferred) or Dawn Mist Tech |
| exam, test | — | — | — | **Pure B&W** |
| official document | — | — | — | **Pure B&W** |
| AI, tech | Cool | Light | Active | Dawn Mist Tech |
| medical | Cool | Medium | Active | Mint Medical |
| environmental, sustainability | Warm | Light | Active | Warm Sun |
| lesson plan (STEM / science / tech) | Cool | Light | Active | Dawn Mist Tech |
| lesson plan (arts / music / PE) | Neutral | Medium | Active | Graphite Orange |
| lesson plan (general education) | Neutral | Medium | Calm | Plain Paper |
| education report (not lesson plan) | Warm | Light | Active | Mint Dawn |
| product manual | Neutral | Light | Calm | White Porcelain |
| tech, AI, internet, innovation | Cool | Light | Active | Lapis Tech |
| finance, investment, premium | Cool | Heavy | Active | Deep Sea Blue-Gold |
| health, green | Warm | Light | Active | Mint Dawn |
| energetic, vibrant | Neutral | Medium | Active | Graphite Orange |
| essay, composition, self-evaluation, review/reflection, letter (non-business), speech, application, proposal letter | — | — | — | **Pure B&W** |
| _(no match)_ | Neutral | Medium | Calm | Plain Paper |

### Visual Profile Color Guidance

For **Profile B (Visual)** scenes — resume, copywriting, and other non-formal documents — prefer **warm neutral** tones aligned with the "Invisible Precision" design philosophy:

- **Body text**: Use warm dark neutrals (`#37352F`, `#303030`, `#3A3430`) instead of cool blue-grays. This reduces eye strain.
- **Surface/background**: Use warm near-white (`#F7F7F7`, `#FAFAF8`, `#FBF9F7`) instead of cool tints.
- **Accent colors**: Use sparingly and only for functional differentiation (section headers, key metrics, links). 95% of the document should remain monochromatic (black, white, gray).
- **Tables**: Prefer the **Zebra Stripe** style (see Table Styles §2) — hierarchy through background contrast with minimal borders. Fallback: Horizontal-Only.

This does NOT apply to Profile A (Formal) scenes (report, academic, contract, official-doc, exam), which must retain pure black `"000000"` body text per regulatory standards.

### Custom Color Generation

When the pre-defined recipes don't fit, construct colors using these rules:

1. **primary**: Start from `hsl(hue, 25-40%, 10-18%)` — dark, desaturated
2. **body**: primary lightened 5-8% — readable dark
3. **secondary**: primary lightened 30-40% — clearly subordinate
4. **accent**: Choose a hue reflecting the domain, `hsl(domainHue, 30-50%, 45-55%)`
5. **surface**: accent desaturated to 5-10%, lightened to 96-98%

**Contrast check**: body text on white must achieve WCAG AA (≥4.5:1). All recipes above pass this.

---

## Font Specifications

### Chinese Fonts

| Usage | Font | Fallback |
|-------|------|----------|
| Headings | SimHei (SimHei) | Microsoft YaHei Bold |
| Body | Microsoft YaHei (YaHei) | SimSun (SimSun) |
| Academic body | SimSun (SimSun) | — |
| Academic headings | SimHei (SimHei) | — |
| Official doc body | FangSong (FangSong) | FangSong_GB2312 |
| Official doc title | STXiaoBiaoSong (XiaoBiaoSong) | SimSun Bold |

### English Fonts

For **English documents** (document language = English):

| Usage | Font | Fallback |
|-------|------|----------|
| Headings | Times New Roman Bold | Arial Bold |
| Body | Times New Roman | Calibri |
| Academic | Times New Roman | — |

For **English text within Chinese documents**, use the Chinese document's ascii font (Calibri by default).

### Font Paths (for matplotlib / image generation)

```python
# macOS
SIMHEI = "/System/Library/Fonts/Supplemental/SimHei.ttf"
# Linux
SIMHEI = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
# Fallback: download SimHei.ttf to working directory
```

### docx-js Font Configuration

```js
// In Document styles.default
styles: {
  default: {
    document: {
      run: {
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
        size: 24, // Xiao Si 小四 12pt
        color: palette.body,
      },
      paragraph: {
        spacing: { line: 312 }, // 1.3x mandatory
      },
    },
    heading1: {
      run: {
        font: { ascii: "Calibri", eastAsia: "SimHei" },
        size: 32, // San Hao 三号 16pt
        bold: true,
        color: palette.primary,
      },
    },
    heading2: {
      run: {
        font: { ascii: "Calibri", eastAsia: "SimHei" },
        size: 28, // Si Hao 四号 14pt
        bold: true,
        color: palette.primary,
      },
    },
  },
}
```

---

## Table Styles

**Profile routing:** Profile A (Formal: report, academic, contract, exam) → Three-Line Table or Horizontal-Only Table. Profile B (Visual: resume, copywriting) → Zebra Stripe (preferred) or Horizontal-Only Table.

### 1. Three-Line Table (三线表) — Academic

Only three horizontal lines: top of table, bottom of header, bottom of table.

```js
const threeLineTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
  rows: [
    new TableRow({
      children: headerCells.map(text => new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 21 })] })],
        borders: {
          bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
          top: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
      })),
    }),
    // ... data rows with all borders NONE
  ],
});
```

### 2. Zebra Stripe — Data Reports

```js
function zebraRow(cells, index, palette) {
  return new TableRow({
    children: cells.map(text => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, size: 21 })] })],
      shading: index % 2 === 0
        ? { type: ShadingType.CLEAR, fill: palette.surface }
        : { type: ShadingType.CLEAR, fill: "FFFFFF" },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
    })),
  });
}
```

### 3. Horizontal-Only — Business (Default)

```js
const horizontalTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.SINGLE, size: 2, color: palette.accent.replace("#","") },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: palette.accent.replace("#","") },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
    insideVertical: { style: BorderStyle.NONE },
  },
  rows: [/* header row with accent shading, then data rows */],
});
```

**⚠️ CRITICAL**: Always set `margins` at the Table or TableCell level. Without margins, text touches cell borders.

### Table Color Token Derivation

Each palette in `coverPalettes` provides a `table` object with pre-computed colors for all 3 table styles:

| Token | Used in | Description |
|-------|---------|-------------|
| `table.headerBg` | Zebra Stripe, Horizontal-Only | Table header background color |
| `table.headerText` | Zebra Stripe, Horizontal-Only | Table header text color (must pass WCAG AA contrast) |
| `table.accentLine` | Three-Line | Top/bottom/header-bottom line color |
| `table.innerLine` | Horizontal-Only | Inner horizontal separator line color |
| `table.surface` | Zebra Stripe | Alternating row background (light tint) |

**Usage:**
```js
const palette = coverPalettes["DS-1"];
const t = palette.table;
// Three-Line: use t.accentLine for border colors
// Zebra: use t.headerBg, t.headerText, t.surface
// Horizontal: use t.headerBg, t.headerText, t.innerLine
```

**⚠️ High-saturation accent override**: For DM-1, FG-1, and SN-2, the table colors are intentionally darkened/desaturated relative to the cover accent. Bright accent colors that look good on dark cover backgrounds are too eye-straining on white body pages. Always use `palette.table.*` for tables, never the raw `palette.accent`.

---
---

## Cover Page Design System

### Design Philosophy

Covers use **7 validated layout recipes** + **parameterized variants** instead of free combination. Each recipe's background, layout, and decoration are visually verified. Differentiation comes from **palette × font size × content variation**.

**Architecture principle:** All recipes use a **single 16838 outer wrapper table** (one row, exact height). Recipes R1/R2/R3 use **ZERO nested tables** — all decoration is achieved via **paragraph borders** (left/right/top/bottom). This ensures maximum cross-engine stability (MS Office + WPS).

### Cover Color Palettes (Dark Mode + Light Mode)

Each palette defines 3 core colors (Background, Primary, Accent) + derived cover/table tokens.

⚠️ **Disambiguation: `cover.titleColor` is a COLOR value, not title text.** All keys under `cover: { ... }` are **color hex codes** for styling cover text elements. They are NOT text content. The actual title text comes from `config.title`. Never use `P.titleColor` as the `text` parameter of a `TextRun` — it must only be used as the `color` parameter.

```js
// ✅ Correct — config.title is the text, P.titleColor is the color
new TextRun({ text: config.title, color: P.titleColor })

// ❌ WRONG — using color value as text content
new TextRun({ text: P.titleColor, color: P.titleColor })  // displays "FFFFFF" as visible text!
```

```js
const coverPalettes = {
  // ── Light backgrounds (7) ──
  "WM-1": { // Warm Teal — education, training, marketing
    bg: "F4F1E9", primary: "15857A", accent: "FF6A3B",
    cover: { titleColor: "15857A", subtitleColor: "606060", metaColor: "707070", footerColor: "A0A0A0" },
    table: { headerBg: "15857A", headerText: "FFFFFF", accentLine: "15857A", innerLine: "D5D0C8", surface: "F0EDE5" },
  },
  "CM-2": { // Blue Orange — tech, corporate, whitepaper
    bg: "FEFEFE", primary: "1284BA", accent: "FF862F",
    cover: { titleColor: "1284BA", subtitleColor: "606060", metaColor: "707070", footerColor: "A0A0A0" },
    table: { headerBg: "1284BA", headerText: "FFFFFF", accentLine: "1284BA", innerLine: "D8E4EC", surface: "EDF4F9" },
  },
  "SN-2": { // Soft Purple — creative, branding, events (⚠️ NOT for business)
    bg: "EBDCEF", primary: "73593C", accent: "B13DC6",
    cover: { titleColor: "73593C", subtitleColor: "606060", metaColor: "707070", footerColor: "A0A0A0" },
    table: { headerBg: "7A4D8A", headerText: "FFFFFF", accentLine: "7A4D8A", innerLine: "D8D0DE", surface: "F2EDF5" },
  },
  "MIN-1": { // Warm Gold — consulting, minimalist business, premium proposals
    bg: "F3F1ED", primary: "000000", accent: "D6C096",
    cover: { titleColor: "000000", subtitleColor: "606060", metaColor: "707070", footerColor: "A0A0A0" },
    table: { headerBg: "D6C096", headerText: "1A1A1A", accentLine: "000000", innerLine: "DDD8CC", surface: "F5F3ED" },
  },
  "WR-2": { // Retro Green — traditional industry, finance compliance, legal
    bg: "F4F1E9", primary: "2A4A3A", accent: "C89F62",
    cover: { titleColor: "2A4A3A", subtitleColor: "606060", metaColor: "707070", footerColor: "A0A0A0" },
    table: { headerBg: "2A4A3A", headerText: "FFFFFF", accentLine: "2A4A3A", innerLine: "D0D8D0", surface: "F0EDE5" },
  },
  "MC-1": { // Medical Blue — healthcare, clinical reports
    bg: "F5F8FC", primary: "1A5276", accent: "2E86C1",
    cover: { titleColor: "1A5276", subtitleColor: "606060", metaColor: "707070", footerColor: "A0A0A0" },
    table: { headerBg: "2E86C1", headerText: "FFFFFF", accentLine: "1A5276", innerLine: "D0DDE8", surface: "EDF3F8" },
  },
  "GV-1": { // Official Red — government, state-owned enterprise, party building
    bg: "FAFAFA", primary: "1A1A1A", accent: "C0392B",
    cover: { titleColor: "1A1A1A", subtitleColor: "606060", metaColor: "707070", footerColor: "A0A0A0" },
    table: { headerBg: "C0392B", headerText: "FFFFFF", accentLine: "C0392B", innerLine: "DDD0D0", surface: "F8F0F0" },
  },

  // ── Dark backgrounds (5) ──
  "DS-1": { // Deep Sea — annual report, general business
    bg: "0B1C2C", primary: "FFFFFF", accent: "529286",
    cover: { titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "90989F", footerColor: "687078" },
    table: { headerBg: "529286", headerText: "FFFFFF", accentLine: "529286", innerLine: "BECFCC", surface: "E8ECEB" },
  },
  "IG-1": { // Ink Gold — finance, investment, luxury brand
    bg: "1A1A1A", primary: "FFFFFF", accent: "C9A84C",
    cover: { titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "90989F", footerColor: "687078" },
    table: { headerBg: "C9A84C", headerText: "1A1A1A", accentLine: "C9A84C", innerLine: "DDD5C0", surface: "F5F2E8" },
  },
  "DM-1": { // Deep Cyan — AI, tech proposals, digital transformation
    bg: "162235", primary: "FFFFFF", accent: "37DCF2",
    cover: { titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "90989F", footerColor: "687078" },
    // ⚠️ Table uses darkened accent (#1B6B7A) — bright #37DCF2 is too saturated for white-page tables
    table: { headerBg: "1B6B7A", headerText: "FFFFFF", accentLine: "1B6B7A", innerLine: "C8DDE2", surface: "EDF3F5" },
  },
  "FG-1": { // Forest Mint — ESG, environmental, sustainability, agriculture
    bg: "0C1F1A", primary: "FFFFFF", accent: "3DDBB5",
    cover: { titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "90989F", footerColor: "687078" },
    // ⚠️ Table uses darkened accent (#2A7A65) — bright #3DDBB5 is too saturated for white-page tables
    table: { headerBg: "2A7A65", headerText: "FFFFFF", accentLine: "2A7A65", innerLine: "C5D8D0", surface: "EDF5F2" },
  },
  "GO-1": { // Graphite Orange — proposals, bidding, PRD
    bg: "1A2330", primary: "FFFFFF", accent: "D4875A",
    cover: { titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "90989F", footerColor: "687078" },
    table: { headerBg: "D4875A", headerText: "FFFFFF", accentLine: "D4875A", innerLine: "DDD0C8", surface: "F8F0EB" },
  },

  // ── Special (R5 only) ──
  "ED-1": { // Editorial Warm — lesson plans, cultural/creative, light reports, newsletters
    bg: "F7F7F5", primary: "2C2C2C", accent: "D4D4D0",
    cover: { titleColor: "2C2C2C", subtitleColor: "6B6B6B", metaColor: "9A9A9A", footerColor: "9A9A9A" },
    table: { headerBg: "E8E8E4", headerText: "2C2C2C", accentLine: "D4D4D0", innerLine: "E8E8E4", surface: "FAFAF8" },
    // Note: R6 exclusive. Minimal editorial style — warm grey tones, no colored headers.
  },

  "ST-1": { // Swiss Tech — cultural/creative research, trend reports, brand strategy
    bg: "E2E8F0", primary: "0F172A", accent: "0042E6",
    cover: { titleColor: "0F172A", subtitleColor: "475569", metaColor: "475569", footerColor: "475569" },
    table: { headerBg: "475569", headerText: "FFFFFF", accentLine: "0042E6", innerLine: "CBD5E1", surface: "F1F5F9" },
    // Note: R7 exclusive. Swiss minimalist — slate grey bg, Klein blue accent, open-frame tables.
  },

  "ACADEMIC": { // Academic Black — thesis, standards (R5 exclusive, not in general routing)
    bg: "FFFFFF", primary: "000000", accent: "000000",
    cover: { titleColor: "000000", subtitleColor: "404040", metaColor: "606060", footerColor: "808080" },
    table: { headerBg: "000000", headerText: "000000", accentLine: "000000", innerLine: "000000", surface: "FFFFFF" },
    // Note: Academic uses Three-Line table only, with pure black lines. No colored headers.
  },
};
```

### ⚠️ Dark Cover → Light Table Rule

Covers with dark backgrounds (DS-1, IG-1, DM-1, FG-1, GO-1) use bright accent on dark bg.  
Body page tables are always on WHITE background — table colors use **darkened/desaturated** variants of the accent.  
High-saturation accent colors (DM-1 #37DCF2, FG-1 #3DDBB5, SN-2 #B13DC6) are explicitly overridden in `table.*` fields above.

### ⚠️ SN-2 Scene Restriction

SN-2 (Soft Purple) is restricted to creative/branding/event documents ONLY.  
It MUST NOT be used for: business reports, consulting, finance, legal, government, medical, or technical documents.

### Industry → Palette Recommendations

| Industry / Theme | Recommended Palette | Fallback |
|-----------|---------|---------|
| General annual report | DS-1 Deep Sea | CM-2 |
| Finance / investment / luxury | IG-1 Ink Gold | WR-2, MIN-1 |
| Tech / AI / internet | DM-1 Deep Cyan | CM-2 |
| ESG / environmental / sustainability | FG-1 Forest Mint | DS-1 |
| Consulting / diagnostic report | MIN-1 Warm Gold | WR-2 |
| Business proposal / bidding / PRD | GO-1 Graphite Orange | CM-2 |
| Education / training (formal) | WM-1 Warm Teal | CM-2 |
| Lesson plan (arts/general) | ED-1 Editorial Warm | WM-1 |
| Cultural / newsletter / internal | ED-1 Editorial Warm | WM-1 |
| Events / activities | ED-1 Editorial Warm | WM-1 |
| Medical / healthcare / clinical | MC-1 Medical Blue | CM-2 |
| Government / state-owned / party | GV-1 Official Red | MIN-1 |
| Traditional industry / legal / compliance | WR-2 Retro Green | MIN-1 |
| Creative / branding (formal) | SN-2 Soft Purple | WM-1 |
| Whitepaper (general) | CM-2 Blue Orange | DS-1, MIN-1 |
| Academic / thesis / standards | ACADEMIC | — |

---

### ⚠️ Recipe Routing Rules (Replaces Free Selection)

```js
function selectCoverRecipe(docType, industry, titleLength) {
  // No cover for these types
  if (["contract", "official", "exam", "resume"].includes(docType)) return null;

  // Academic
  if (docType === "academic") return { recipe: "R5", palette: "ACADEMIC" };

  // Thesis proposal report (开题报告)
  if (docType === "proposal_report") return { recipe: "R5", palette: "ACADEMIC" };

  // Lesson plans — R6 editorial for arts/general, R4 for STEM
  if (docType === "lesson_plan" || docType === "lessonplan") {
    const stemKeywords = ["math", "physics", "chemistry", "biology", "science", "tech", "computer", "engineering"];
    if (stemKeywords.some(k => (industry || "").toLowerCase().includes(k))) {
      return { recipe: "R4", palette: "DM-1" };
    }
    // Arts, general, and all other lesson plans → R6 editorial
    return { recipe: "R6", palette: "ED-1" };
  }

  // Creative/branding/design (formal) → R3 centered card frame
  if (["creative", "branding", "design"].includes(docType)) {
    return { recipe: "R3", palette: "SN-2" };
  }

  // Cultural/newsletter/internal (casual) → R6 editorial
  if (["cultural", "newsletter", "internal"].includes(docType)) {
    return { recipe: "R6", palette: "ED-1" };
  }

  // Activity/event planning → R6 editorial
  if (docType === "activity") return { recipe: "R6", palette: "ED-1" };

  // Trend/research reports in cultural/creative/brand fields → R7 Swiss Tech
  if (docType === "trend_report" || docType === "research_report") {
    if (["cultural", "creative", "brand", "design"].includes(industry)) {
      return { recipe: "R7", palette: "ST-1" };
    }
  }

  // Formal/business subtypes
  if (docType === "whitepaper") return { recipe: "R2", palette: industry === "finance" ? "IG-1" : "CM-2" };
  if (docType === "consulting") return { recipe: "R2", palette: "MIN-1" };
  if (docType === "proposal" || docType === "plan") return { recipe: "R4", palette: "GO-1" };

  // Reports — palette by industry, use R1
  if (docType === "report") {
    const paletteMap = {
      finance: "IG-1", consulting: "MIN-1",
      tech: "DM-1", ai: "DM-1",
      education: "WM-1", green: "FG-1",
      medical: "MC-1", government: "GV-1",
    };
    return { recipe: "R1", palette: paletteMap[industry] || "DS-1" };
  }

  // Default
  return { recipe: "R1", palette: "DS-1" };
}

// ── Long-title override (applied AFTER initial recipe selection) ──
// Call this after selectCoverRecipe() when the actual title text is known.
function applyLongTitleOverride(result, titleLength) {
  if (!result || !result.recipe) return result;
  // R5 (academic) is never overridden — it has its own calcTitleLayoutMixed()
  if (result.recipe === "R5") return result;
  // R6 (editorial) is designed for short titles only (≤20 chars, single line)
  // Long titles → fall back to R1 (handles long titles best)
  if (titleLength > 20 && result.recipe === "R6") {
    return { recipe: "R1", palette: "WM-1" }; // ED-1 has no dark bg, use WM-1 (warm teal)
  }
  // R3/R4 struggle with long titles → fall back to R1 (same palette)
  if (titleLength > 20 && ["R3", "R4"].includes(result.recipe)) {
    return { recipe: "R1", palette: result.palette };
  }
  // Very long titles: even R2 centered looks scattered → R1 left-aligned
  if (titleLength > 30 && result.recipe === "R2") {
    return { recipe: "R1", palette: result.palette };
  }
  return result;
}
```

### Scene Cover Routing

| Scene | Recipe | Default Palette | Special Requirements |
|------|------|---------|----------|
| academic thesis | R5 (Clean White) | ACADEMIC | School name + 2-col meta table with underlines, see academic.md |
| thesis proposal report (开题报告) | R5 (Clean White) | ACADEMIC | Use `buildProposalCover()` from academic.md |
| business report (general) | R1 (Pure Paragraph Left) | DS-1 Deep Sea | Auto-select palette by industry |
| whitepaper | R2 (Double-Rule Frame) | CM-2 Blue Orange / IG-1 Ink Gold | — |
| consulting report | R2 (Double-Rule Frame) | MIN-1 Warm Gold | — |
| business proposal / plan | R4 (Top Color Block) | GO-1 Graphite Orange | — |
| events / activities | R6 (Editorial Warm) | ED-1 Editorial Warm | Light/casual style, short titles only (≤20 chars) |
| lesson plan (STEM) | R4 (Top Color Block) | DM-1 Deep Cyan | Route by subject, see selectCoverRecipe |
| lesson plan (arts/general) | R6 (Editorial Warm) | ED-1 Editorial Warm | Casual editorial style, short titles only |
| creative / branding / design (formal) | R3 (Centered Card Frame) | SN-2 Soft Purple | Product overview, brand doc, design report |
| cultural / newsletter / internal | R6 (Editorial Warm) | ED-1 Editorial Warm | Light/casual style, short titles only (≤20 chars) |
| trend/research report (cultural/creative/brand) | R7 (Swiss Tech) | ST-1 Swiss Tech | Minimalist slate bg, Klein blue accent, open-frame tables |
| education report | R1 (Pure Paragraph Left) | WM-1 Warm Teal | For education reports, NOT lesson plans |
| ESG / environmental | R1 (Pure Paragraph Left) | FG-1 Forest Mint | — |
| medical / healthcare | R1 (Pure Paragraph Left) | MC-1 Medical Blue | — |
| government / state-owned | R1 (Pure Paragraph Left) | GV-1 Official Red | — |
| resume | — | — | No standalone cover |
| contract | — | — | No standalone cover (title page is first page) |
| official document | — | — | No standalone cover |
| exam paper | — | — | No standalone cover |

---

### Cover Title Length Guidelines

When the user does NOT specify an exact title, the model should craft a title within the recommended range. If the user provides a title that exceeds the comfortable range, apply long-title routing in `selectCoverRecipe()` (see above).

| Recipe | Comfortable (1–2 lines) | Maximum (3 lines) | Long Title Tolerance |
|--------|------------------------|--------------------|----------------------|
| R1     | 8–20 chars             | ≤50 chars          | ⭐⭐⭐⭐⭐ Best (left-aligned, full-page bg) |
| R2     | 8–18 chars             | ≤45 chars          | ⭐⭐⭐⭐ Good (full-page bg, but centered) |
| R3     | 8–15 chars             | ≤40 chars          | ⭐⭐ Poor (narrowest width) |
| R4     | 8–18 chars             | ≤45 chars          | ⭐⭐ Poor (fixed-height color block) |
| R5     | 8–16 chars             | ≤42 chars          | ⭐⭐⭐ OK (academic only, mixed-width calc) |
| R6     | 8–15 chars             | ≤20 chars (1 line) | ⭐ Single line only (editorial, no multi-line) |
| R7     | 8–24 chars             | ≤42 chars (3 lines) | ⭐⭐⭐⭐ Good (left-aligned, light bg, dynamic spacing) |

**Title crafting rules (when model generates the title):**
1. Prefer concise titles within the "comfortable" range
2. If topic requires detail, split into title + subtitle (e.g., title="数字化转型战略研究" subtitle="——以某某企业为例")
3. Never exceed the "maximum" range unless user explicitly provides the full title

---

### ⚠️ Cover Page Break Rules

Cover should be an independent section — **no PageBreak at the end needed**. The next section automatically starts a new page.

```js
// ✅ Correct — cover is a separate section, no trailing PageBreak
sections: [
  { properties: { /* Cover section, margin all 0 */ }, children: buildCover(...) },
  { properties: { /* Body section */ }, children: buildContent(...) },
]
```

### ⚠️ Cover Content Overflow Prevention (Mandatory)

1. Cover section page margin is 0; total content height ≤ 15638 twips (1200 twips safety margin for cross-engine compatibility — MS Office renders large fonts taller than calculated).
2. Color block Table `height` must use `rule: "exact"` (never `"atLeast"`).
3. Each recipe code includes height budget annotations — verify during generation.
4. **`verticalAlign` must always be `"top"`**. Never use `"center"` or `"bottom"` in exact-height rows — content will be clipped or overflow. Use `spacing.before` on the first paragraph for vertical positioning.
5. **Title font size MUST be dynamically calculated via `calcTitleLayout()`** (see below). Never hardcode font sizes above 40pt for cover titles. Every recipe MUST call `calcTitleLayout()` before building title paragraphs.
6. **Never use `margins.top`/`margins.bottom` for vertical positioning inside exact-height cells**: Cell margins reduce available height unpredictably across MS Office and WPS. Use `spacing.before` on the first paragraph instead. Only `margins.left`/`margins.right` are safe.
7. **Dynamic spacing is mandatory**: Use `calcCoverSpacing()` to compute `spacing.before` values dynamically based on content element count and title line count. Never use fixed large spacing values (e.g., `before: 4500`) that assume a specific title length.
8. **Cover must be a single-page section**: The cover section must produce exactly ONE page. If content overflows to a second page, it means the height budget is violated. Common overflow causes and fixes:
   - Title font too large → use `calcTitleLayout()` to auto-reduce
   - Too many meta lines → reduce font size or remove less important lines
   - Fixed `spacing.before` values too large → use `calcCoverSpacing()` for dynamic values
   - Subtitle + English label + meta lines combined exceed budget → calculate total and reduce spacing
9. **Cover wrapper table MUST use explicit `allNoBorders`**: The outer 16838 wrapper table and ALL nested tables inside the cover MUST set borders to NONE explicitly. Never rely on docx-js default borders (`single/auto/sz=4`). Default borders add ~8 twips per edge, which causes MS Office to calculate a total height slightly exceeding 16838 → content overflows to a blank page 2. WPS is more lenient but MS Office is strict. **This is the #1 cause of "blank page 2 in MS Office but not in WPS".**

```js
// ✅ MANDATORY: Define and use allNoBorders for every cover table
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB,
                       insideHorizontal: NB, insideVertical: NB };

new Table({
  borders: allNoBorders,  // ← MANDATORY on every cover table
  // ...
});
```

10. **Decorative lines MUST use paragraph borders, NEVER text characters**: Horizontal decorative lines (accent strips, dividers, frame edges) must be implemented with `paragraph border.top` or `border.bottom` — never with text characters like `───`, `━━━`, `═══`, or `——————`. Character-drawn lines render at inconsistent widths across MS Office and WPS (font metrics differ), causing lines to appear truncated or misaligned. Paragraph borders render pixel-perfect in both engines and their width is controlled precisely via `indent.left` / `indent.right`.

```js
// ✅ Correct — paragraph border (R2 style thick accent rule)
new Paragraph({
  indent: { left: 1000, right: 1000 },
  border: { top: { style: BorderStyle.SINGLE, size: 18, color: P.accent, space: 20 } },
  children: [],
})

// ❌ FORBIDDEN — text character line (renders inconsistently)
new Paragraph({
  children: [new TextRun({ text: "───────────────", color: P.accent })]
})
```
9. **Post-generation overflow check (mandatory)**: After building cover children, estimate total height:
   ```js
   function estimateCoverHeight(elements) {
     let total = 0;
     for (const el of elements) {
       if (el instanceof Table) {
         // Sum row heights (exact rows) or estimate 400 twips per row
         const rows = el.root?.[0]?.rows || [];
         for (const row of rows) {
           total += row.height?.value || 400;
         }
       } else if (el instanceof Paragraph) {
         const fontSize = el.root?.[0]?.size || 24; // half-pts
         // ★ Use pt * 11.5 (= half-pt * 10 * 1.15) for accurate single-spacing estimate
         const lineHeight = Math.max(fontSize * 11.5, 276); // min 276 (default 12pt)
         const spacingBefore = el.spacing?.before || 0;
         const spacingAfter = el.spacing?.after || 0;
         total += lineHeight + spacingBefore + spacingAfter;
       }
     }
     return total;
   }
   // ★ Target: estimateCoverHeight(coverChildren) < 15638 (16838 - 1200 safety)
   ```

---

### ⚠️ Cover Title Layout — calcTitleLayout() (Mandatory for ALL Recipes)

**Every cover recipe MUST use `calcTitleLayout()` to determine title font size and line breaks.** Hardcoding font sizes or passing the full title as a single TextRun is FORBIDDEN.

**Every paragraph with font size > body text MUST set explicit line spacing** to prevent top clipping:
```js
// ★ MANDATORY: prevent inherited small line spacing from clipping large fonts
spacing: { line: Math.ceil(titlePt * 23), lineRule: "atLeast", after: 100 }
// Example: 36pt → line: 828; 44pt → line: 1012
```
Without this, the paragraph inherits body text line spacing (e.g., 560tw), which is shorter than the font height → top of characters gets clipped.

```js
/**
 * Calculate safe font size and smart line breaks for cover titles.
 * MUST be called by every recipe before building title paragraphs.
 *
 * @param {string}  title          Full title string
 * @param {number}  maxWidthTwips  Available width for title text (twips, after subtracting margins/padding)
 * @param {number}  preferredPt    Desired max font size in pt (default 40)
 * @param {number}  minPt          Minimum allowed font size in pt (default 24)
 * @returns {{ titlePt: number, titleLines: string[] }}
 */
function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  // Each CJK character width ≈ pt × 20 twips
  const charWidth = (pt) => pt * 20;
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));

  // Try from preferredPt downward until title fits in ≤ 3 lines
  let titlePt = preferredPt;
  let lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = splitTitleLines(title, cpl);
    if (lines.length <= 3) break;
    titlePt -= 2;
  }

  // If still > 3 lines at minPt, force 3 lines
  if (!lines || lines.length > 3) {
    const cpl = charsPerLine(minPt);
    lines = splitTitleLines(title, cpl);
    titlePt = minPt;
  }

  return { titlePt, titleLines: lines };
}

/**
 * Smart Chinese title line-breaking — breaks at semantic boundaries, never mid-word.
 *
 * Rules:
 * 1. Prefer breaking after particles, punctuation, connectors, underscores, spaces
 * 2. Never split a compound word (e.g., "管理规范" must not become "管理规" + "范")
 * 3. No single-character orphan on the last line — merge into previous line
 * 4. If no good break point found within 60-130% of charsPerLine, break at charsPerLine
 *
 * @param {string} title        Full title string
 * @param {number} charsPerLine Max characters per line at current font size
 * @returns {string[]}          Array of line strings
 */
function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];

  // Characters that are safe break points (break AFTER these)
  const breakAfter = new Set([
    ...'，。、；：！？',              // CJK punctuation
    ...'的与和及之在于为',            // CJK particles/prepositions
    ...'-_—–·/',                     // connectors
    ...' \t',                         // whitespace
  ]);

  const lines = [];
  let remaining = title;

  while (remaining.length > charsPerLine) {
    let breakAt = -1;

    // Search backward from charsPerLine to 60% for a break point
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) {
        breakAt = i;
        break;
      }
    }

    // If not found, search forward up to 130%
    if (breakAt === -1) {
      const limit = Math.min(remaining.length, Math.ceil(charsPerLine * 1.3));
      for (let i = charsPerLine + 1; i < limit; i++) {
        if (breakAfter.has(remaining[i - 1])) {
          breakAt = i;
          break;
        }
      }
    }

    // Last resort: break at charsPerLine, but avoid splitting compound CJK words
    if (breakAt === -1) {
      breakAt = charsPerLine;
      // If both chars at the break boundary are CJK (likely a compound word),
      // step back 1 char to keep the word together
      const prevChar = remaining[breakAt - 1];
      const nextChar = remaining[breakAt];
      if (prevChar && nextChar &&
          !breakAfter.has(prevChar) && !breakAfter.has(nextChar) &&
          /[\u4e00-\u9fff]/.test(prevChar) && /[\u4e00-\u9fff]/.test(nextChar)) {
        breakAt = breakAt - 1;
      }
    }

    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);

  // Prevent single-character orphan on last line — merge into previous
  if (lines.length > 1 && lines[lines.length - 1].length <= 2) {
    const last = lines.pop();
    lines[lines.length - 1] += last;
  }

  return lines;
}

/**
 * Calculate dynamic spacing values for cover elements to fit within page height.
 *
 * @param {object} params
 * @param {number} params.titleLineCount   Number of title lines
 * @param {number} params.titlePt          Title font size in pt
 * @param {boolean} params.hasSubtitle     Whether subtitle exists
 * @param {boolean} params.hasEnglishLabel Whether English label exists
 * @param {number} params.metaLineCount    Number of meta info lines
 * @param {number} params.fixedHeight      Sum of fixed-height elements (color strips, accent bars, footer) in twips
 * @param {number} params.pageHeight       Total page height in twips (default 16838)
 * @returns {{ topSpacing, midSpacing, bottomSpacing }}  Spacing values in twips
 */
function calcCoverSpacing(params) {
  const {
    titleLineCount = 1, titlePt = 36, hasSubtitle = false,
    hasEnglishLabel = false, metaLineCount = 0,
    fixedHeight = 800, pageHeight = 16838,
    marginTop = 0, marginBottom = 0,   // ★ NEW: pass actual section margins
  } = params;

  // ★ Safety margin: 1200 twips (cross-engine: MS Office renders large fonts
  // taller than calculated; extra 400tw buffer prevents footer clipping)
  const SAFETY = 1200;
  // ★ Subtract page margins from available height (cover section may have margins)
  const usableHeight = pageHeight - marginTop - marginBottom - SAFETY;

  // ★ Accurate height estimation per element:
  const titleHeight = titleLineCount * (titlePt * 23 + 200);
  const subtitleHeight = hasSubtitle ? (12 * 23 + 600) : 0;
  const englishLabelHeight = hasEnglishLabel ? (9 * 23 + 600) : 0;
  const metaHeight = metaLineCount * (10 * 23 + 100);

  // ★ Account for implicit paragraph heights:
  const implicitParaHeight = 3 * 300;

  const contentHeight = titleHeight + subtitleHeight + englishLabelHeight +
                        metaHeight + fixedHeight + implicitParaHeight;

  const remainingSpace = usableHeight - contentHeight;
  const safeRemaining = Math.max(remainingSpace, 400);

  // ★ Footer protection: bottomSpacing must be ≥ FOOTER_MIN to prevent
  // footer + accent line from being clipped at the cell bottom edge
  const FOOTER_MIN = 800;
  const rawTop = Math.floor(safeRemaining * 0.45);
  const rawBottom = Math.floor(safeRemaining * 0.45);
  const bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  const topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  const midSpacing = Math.max(safeRemaining - topSpacing - bottomSpacing, 0);

  return { topSpacing, midSpacing, bottomSpacing };
}
```

**Usage in every recipe:**
```js
// Step 1: Calculate title layout
const availableWidth = 11906 - leftPadding - rightPadding; // subtract margins
const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth);
const titleSize = titlePt * 2; // convert to half-points for docx-js

// Step 2: Calculate spacing (pass actual section margins!)
const spacing = calcCoverSpacing({
  titleLineCount: titleLines.length,
  titlePt,
  hasSubtitle: !!config.subtitle,
  hasEnglishLabel: !!config.englishLabel,
  metaLineCount: (config.metaLines || []).length,
  fixedHeight: 800, // sum of accent strips, footer table, etc.
  marginTop: 0,     // ★ pass the cover section's actual top margin (twips)
  marginBottom: 0,  // ★ pass the cover section's actual bottom margin (twips)
});

// Step 3: Use in paragraphs
children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));
// ... title paragraphs using titleLines and titleSize ...
children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));
```

---

### ⚠️ CRITICAL — Cover Section Non-Negotiables (ALL Recipes)

These 3 properties are MANDATORY for every cover implementation (R1–R7). Omitting ANY of them causes cover layout failure:

1. **Cover section margin = 0**: The cover MUST be in its own section with `page.margin: { top: 0, bottom: 0, left: 0, right: 0 }`. Non-zero margins shrink the wrapper away from page edges → white gaps around the cover ("cover not filling the page"). This is the #1 cause of broken cover layouts.

2. **Wrapper row exact height**: The outer wrapper table row MUST set `height: { value: 16838, rule: "exact" }`. Without this, content overflow pushes to page 2, or insufficient content leaves bottom whitespace.

3. **Wrapper table borders = allNoBorders**: MUST explicitly set `borders: allNoBorders`. Default docx-js borders add ~8 twips per edge. MS Office includes border thickness in exact-height calculation → total exceeds 16838 → blank page 2 (WPS is lenient, MS Office is strict).

**Cover section template (copy this for every Recipe):**
```js
sections: [
  {
    // ⚠️ Cover section — margin MUST be 0, separate from body
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
      },
    },
    children: buildCoverRX(config), // ← replace with actual recipe function
  },
  {
    // Body section — normal margins
    properties: {
      type: SectionType.NEXT_PAGE,
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
      },
    },
    children: [...bodyContent],
  },
]
```

---

### Recipe R1: Pure Paragraph Cover (Left-Aligned)

**Visual:** Full-page dark background + left-aligned text + decoration via paragraph borders only  
**Use case:** Annual report, business report, tech proposal (most versatile premium recipe)  
**Nested tables: ZERO** — all decoration uses paragraph borders (bottom line, left accent bar, top separator)

Visual hierarchy (top to bottom):
1. Dynamic top whitespace (via `calcCoverSpacing`)
2. English label with accent bottom border (paragraph `border.bottom`)
3. Main title (1-3 lines, dynamic font size via `calcTitleLayout`)
4. Subtitle (light grey, smaller)
5. Meta info lines with left accent border (paragraph `border.left`)
6. Dynamic bottom whitespace
7. Footer line with top accent separator (paragraph `border.top`)

```js
// ⚠️ MANDATORY: Cover section must use margin: 0. See "Cover Section Non-Negotiables" above.
// Section: { properties: { page: { size: { width: 11906, height: 16838 },
//   margin: { top: 0, bottom: 0, left: 0, right: 0 } } }, children: buildCoverR1(config) }

function buildCoverR1(config) {
  // config: { title, subtitle, englishLabel, metaLines, footerLeft, footerRight, palette }
  // palette: { bg, titleColor, subtitleColor, metaColor, accent, footerColor }
  const P = config.palette;
  const padL = 1200, padR = 800;

  // ⚠️ MANDATORY: Use calcTitleLayout() for dynamic font size + line breaking
  const availableWidth = 11906 - padL - padR - 300; // -300 for border space
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 24);
  const titleSize = titlePt * 2;

  // ⚠️ MANDATORY: Use calcCoverSpacing() for dynamic spacing
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: (config.metaLines || []).length,
    fixedHeight: 400, // footer line only (no nested tables)
  });

  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 12 };
  const children = [];

  // 1. Top whitespace (dynamic)
  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));

  // 2. English label with accent bottom border
  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 8 } },
      children: [new TextRun({ text: config.englishLabel.split("").join("  "),
        size: 18, color: P.accent, font: { ascii: "Calibri", eastAsia: "SimHei" }, characterSpacing: 40 })],
    }));
  }

  // 3. Main title (dynamic font size + smart line breaks)
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true,
        color: P.titleColor, font: { eastAsia: "SimHei", ascii: "Arial" } })],
    }));
  }

  // 4. Subtitle
  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: padL }, spacing: { after: 800 },
      children: [new TextRun({ text: config.subtitle, size: 24, color: P.subtitleColor,
        font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    }));
  }

  // 5. Meta info lines with left accent border
  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({ text: line, size: 24, color: P.metaColor,
        font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    }));
  }

  // 6. Bottom whitespace (dynamic)
  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));

  // 7. Footer with top accent separator
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: P.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft || "", size: 16, color: P.footerColor, font: { ascii: "Arial" } }),
      new TextRun({ text: "                                        " }),
      new TextRun({ text: config.footerRight || "", size: 16, color: P.footerColor, font: { ascii: "Arial" } }),
    ],
  }));

  // Single 16838 wrapper — the ONLY table
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: P.bg }, borders: noBorders,
        children,
      })],
    })],
  })];
  // Total height: 16838 (single wrapper, zero nested tables) ✅
}
```

---

### Recipe R2: Double-Rule Frame (Centered)

**Visual:** Full-page dark background + top/bottom thick accent horizontal rules + centered content  
**Use case:** Whitepaper, finance report, consulting deliverable, high-end formal reports  
**Nested tables: ZERO** — top/bottom rules are paragraph borders

Visual hierarchy (top to bottom):
1. Top thick accent rule (paragraph `border.top`)
2. Generous whitespace
3. English label (centered, spaced)
4. Main title (centered, 1-3 lines, dynamic font size)
5. Subtitle (centered)
6. Generous whitespace
7. Meta info lines (centered, **18pt** / size: 36)
8. Generous whitespace
9. Footer + bottom thick accent rule (paragraph `border.bottom`)

```js
// ⚠️ MANDATORY: Cover section must use margin: 0. See "Cover Section Non-Negotiables" above.
function buildCoverR2(config) {
  const P = config.palette;
  const padL = 1400, padR = 1400;

  // ⚠️ MANDATORY: Use calcTitleLayout() for dynamic font size + line breaking
  const { titlePt, titleLines } = calcTitleLayout(config.title, 11906 - padL - padR, 40, 24);
  const titleSize = titlePt * 2;
  const thickBorder = { style: BorderStyle.SINGLE, size: 18, color: P.accent, space: 20 };

  const children = [];

  // 1. Top rule
  children.push(new Paragraph({
    indent: { left: padL - 400, right: padR - 400 }, spacing: { before: 1200, after: 200 },
    border: { top: thickBorder }, children: [],
  }));

  // 2. Whitespace
  children.push(new Paragraph({ spacing: { before: 1800 } }));

  // 3. English label
  if (config.englishLabel) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 500 },
      children: [new TextRun({ text: config.englishLabel.split("").join("  "),
        size: 18, color: P.accent, font: { ascii: "Calibri" }, characterSpacing: 40 })],
    }));
  }

  // 4. Main title (centered, dynamic)
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: i < titleLines.length - 1 ? 80 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true,
        color: P.titleColor, font: { eastAsia: "SimHei", ascii: "Arial" } })],
    }));
  }

  // 5. Subtitle
  if (config.subtitle) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 400 },
      children: [new TextRun({ text: config.subtitle, size: 24, color: P.subtitleColor,
        font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    }));
  }

  // 6. Whitespace
  children.push(new Paragraph({ spacing: { before: 1200 } }));

  // 7. Meta lines — 18pt (size: 36) for readability
  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100, line: Math.ceil(18 * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: line, size: 36, color: P.metaColor,
        font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    }));
  }

  // 8. Whitespace
  children.push(new Paragraph({ spacing: { before: 2000 } }));

  // 9. Footer + bottom rule
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    indent: { left: padL - 400, right: padR - 400 }, spacing: { before: 200 },
    border: { bottom: thickBorder },
    children: [new TextRun({ text: config.footerRight || "", size: 18, color: P.footerColor, font: { ascii: "Arial" } })],
  }));

  // Single 16838 wrapper — the ONLY table
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: P.bg }, borders: noBorders,
        children,
      })],
    })],
  })];
  // Total height: 16838 (single wrapper, zero nested tables) ✅
}
```

---

### Recipe R3: Centered Card Frame (Paragraph Borders)

**Visual:** Full-page dark background + centered "card" effect via paragraph indent + 4-side paragraph borders  
**Use case:** Research report, product overview, event summary, creative/design documents  
**Nested tables: ZERO** — card borders are paragraph borders with large left/right indents

Visual hierarchy (top to bottom):
1. Pre-card whitespace (~2800tw)
2. Card top edge (paragraph with `border.top` + `border.left` + `border.right`, indent 2200tw)
3. English label (centered, inside card side borders)
4. Main title (centered, inside card side borders, dynamic font size)
5. Subtitle (centered, inside card side borders)
6. Spacer (inside card side borders)
7. Meta info lines (centered, inside card side borders)
8. Card bottom edge (paragraph with `border.bottom` + `border.left` + `border.right`)
9. Post-card whitespace
10. Footer (centered)

```js
// ⚠️ MANDATORY: Cover section must use margin: 0. See "Cover Section Non-Negotiables" above.
function buildCoverR3(config) {
  const P = config.palette;
  const cardIndent = 2200; // left + right indent to create "card" feel
  const innerWidth = 11906 - cardIndent * 2 - 400;

  // ⚠️ MANDATORY: Use calcTitleLayout() for dynamic font size + line breaking
  const { titlePt, titleLines } = calcTitleLayout(config.title, innerWidth, 40, 24);
  const titleSize = titlePt * 2;

  const bTop = { style: BorderStyle.SINGLE, size: 24, color: P.accent, space: 16 };
  const bBot = { style: BorderStyle.SINGLE, size: 24, color: P.accent, space: 16 };
  const bL = { style: BorderStyle.SINGLE, size: 2, color: P.accent, space: 16 };
  const bR = { style: BorderStyle.SINGLE, size: 2, color: P.accent, space: 16 };
  const sides = { left: bL, right: bR };

  const children = [];

  // 1. Pre-card whitespace
  children.push(new Paragraph({ spacing: { before: 2800 } }));

  // 2. Card top edge
  children.push(new Paragraph({
    indent: { left: cardIndent, right: cardIndent }, spacing: { after: 600 },
    border: { top: bTop, left: bL, right: bR }, children: [],
  }));

  // 3. English label inside card
  if (config.englishLabel) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, indent: { left: cardIndent, right: cardIndent },
      spacing: { after: 500 }, border: sides,
      children: [new TextRun({ text: config.englishLabel.split("").join("  "),
        size: 16, color: P.accent, font: { ascii: "Calibri" }, characterSpacing: 30 })],
    }));
  }

  // 4. Main title inside card
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, indent: { left: cardIndent, right: cardIndent },
      spacing: { after: i < titleLines.length - 1 ? 60 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      border: sides,
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true,
        color: P.titleColor, font: { eastAsia: "SimHei", ascii: "Arial" } })],
    }));
  }

  // 5. Subtitle inside card
  if (config.subtitle) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, indent: { left: cardIndent, right: cardIndent },
      spacing: { after: 400 }, border: sides,
      children: [new TextRun({ text: config.subtitle, size: 22, color: P.subtitleColor,
        font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    }));
  }

  // 6. Spacer inside card
  children.push(new Paragraph({
    indent: { left: cardIndent, right: cardIndent }, spacing: { before: 400 },
    border: sides, children: [],
  }));

  // 7. Meta info lines inside card
  for (let i = 0; i < (config.metaLines || []).length; i++) {
    const isLast = i === config.metaLines.length - 1;
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, indent: { left: cardIndent, right: cardIndent },
      spacing: { after: isLast ? 400 : 80 }, border: sides,
      children: [new TextRun({ text: config.metaLines[i], size: 24, color: P.metaColor,
        font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    }));
  }

  // 8. Card bottom edge
  children.push(new Paragraph({
    indent: { left: cardIndent, right: cardIndent }, spacing: { after: 0 },
    border: { bottom: bBot, left: bL, right: bR }, children: [],
  }));

  // 9. Post-card whitespace
  children.push(new Paragraph({ spacing: { before: 2000 } }));

  // 10. Footer
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: config.footerRight || "", size: 16, color: P.footerColor, font: { ascii: "Arial" } })],
  }));

  // Single 16838 wrapper — the ONLY table
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: P.bg }, borders: noBorders,
        children,
      })],
    })],
  })];
  // Total height: 16838 (single wrapper, zero nested tables) ✅
}
```


### Recipe R4: Top Color Block

**Visual:** Top 45% dark area (with title) + bottom 55% white area (with meta info) + accent divider  
**Use case:** business proposal, plan document, lesson plan, PRD  
**Architecture:** Uses R1's proven single 16838 wrapper. Upper dark block is a nested table inside the wrapper. Content positioning uses `spacing.before` (reliable) instead of `margins.top` (unreliable across engines).

```js
// ⚠️ MANDATORY: Cover section must use margin: 0. See "Cover Section Non-Negotiables" above.
function buildCoverR4(config) {
  const P = config.palette;
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR;

  // ⚠️ MANDATORY: Use calcTitleLayout() for dynamic font size + line breaking
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 26);
  const titleSize = titlePt * 2;

  // Height budget for upper dark block — DYNAMIC based on title content
  const titleBlockHeight = titleLines.length * (titlePt * 23 + 200);
  const englishLabelH = config.englishLabel ? (9 * 23 + 500) : 0;
  const subtitleH = config.subtitle ? (12 * 23 + 200) : 0;
  const upperContentH = englishLabelH + titleBlockHeight + subtitleH;
  const UPPER_MIN = 7500; // minimum height to preserve visual proportion
  const UPPER_H = Math.max(UPPER_MIN, upperContentH + 1500 + 800); // +1500 top pad, +800 bottom pad
  const DIVIDER_H = 60;

  // ★ Dynamic top spacing: calculated from content height, NOT fixed margins.top
  const contentEstimate =
    (config.englishLabel ? (9 * 23 + 500) : 0) +
    titleLines.length * (titlePt * 23 + 200) +
    (config.subtitle ? (12 * 23 + 200) : 0);
  const spacerIntrinsic = 280;  // empty spacing paragraph intrinsic height
  const topSpacing = Math.max(UPPER_H - contentEstimate - spacerIntrinsic - 800, 400);

  // ── Upper dark block (nested table, exact height) ──
  const upperBlock = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: UPPER_H, rule: "exact" },
      children: [new TableCell({
        shading: { fill: P.bg }, borders: noBorders,
        verticalAlign: "top",
        // ★ KEY: Only left/right margins. NO top/bottom margins.
        // Vertical positioning uses spacing.before on the first paragraph.
        margins: { left: padL, right: padR },
        children: [
          new Paragraph({ spacing: { before: topSpacing } }),
          config.englishLabel ? new Paragraph({
            spacing: { after: 500 },
            children: [new TextRun({ text: config.englishLabel.split("").join(" "),
              size: 18, color: P.accent, font: { ascii: "Calibri" }, characterSpacing: 60 })],
          }) : null,
          ...titleLines.map((line, i) => new Paragraph({
            spacing: { after: i < titleLines.length - 1 ? 100 : 200 },
            children: [new TextRun({ text: line, size: titleSize, bold: true,
              color: P.titleColor, font: { eastAsia: "SimHei", ascii: "Arial" } })],
          })),
          config.subtitle ? new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: config.subtitle, size: 24, color: P.subtitleColor,
              font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
          }) : null,
        ].filter(Boolean),
      })],
    })],
  });

  // ── Accent divider line ──
  const divider = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: DIVIDER_H, rule: "exact" },
      children: [new TableCell({ borders: noBorders,
        shading: { fill: P.accent }, children: [emptyPara()] })],
    })],
  });

  // ── Lower white area (paragraphs, not a separate table) ──
  const lowerContent = [
    new Paragraph({ spacing: { before: 800 } }),
    ...(config.metaLines || []).map(line => new Paragraph({
      indent: { left: padL }, spacing: { after: 100 },
      children: [new TextRun({ text: line, size: 28, color: P.metaColor,
        font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    })),
    new Paragraph({ spacing: { before: 2000 } }),
    new Paragraph({
      indent: { left: padL },
      children: [
        new TextRun({ text: config.footerLeft || "", size: 22, color: "909090" }),
        new TextRun({ text: "          " }),
        new TextRun({ text: config.footerRight || "", size: 22, color: "909090" }),
      ],
    }),
  ];

  // ── Outer 16838 wrapper (R1 proven architecture) ──
  // The wrapper acts as a safety net: even if the inner 7500 block
  // overflows slightly, content stays on page 1.
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { fill: "FFFFFF" }, borders: noBorders,
        verticalAlign: "top",
        children: [
          upperBlock,
          divider,
          ...lowerContent,
        ],
      })],
    })],
  })];
  // Total height: 16838 (outer wrapper, R1 architecture) ✅
}
```

---

### Recipe R5: Clean White (Academic)

**Visual:** Pure white background + school name + centered title + 2-column meta info table with underlines + footer  
**Use case:** academic thesis, standards documents  
**Architecture:** 16838 outer wrapper (white fill, invisible) + cell margins for page margin simulation. No top/bottom decorative lines.

**Meta info table rules (cross-engine safe):**
- 2-column table: label + value, **percentage widths only** (`WidthType.PERCENTAGE`)
- **Table width is adaptive:** 55–75% of page, calculated by `calcR5MetaLayout()`. Table centered via `alignment: CENTER`.
- **Label column:** adaptive 25–45% of table, **LEFT aligned**, plain text with "：" appended. NO full-width space padding, NO right-alignment.
- **Label column borders:** none (no bottom border on label cells).
- **Value column:** remaining %, **LEFT aligned**, `bottom: single sz=4` border = fixed-length underline (consistent length for all rows regardless of text).
- No left/right/top borders on either column.
- ⚠️ Do NOT use DXA widths, full-width space padding (`\u3000`), spacer columns, or tab stops — WPS renders them inconsistently.
- ⚠️ Do NOT use `margins.top` on the wrapper cell — use `spacing.before` on first paragraph instead.

**Known limitation:** When meta lines ≥ 6 AND title has 3 lines, MS Office may render content slightly taller than WPS, potentially clipping the footer line. Mitigate by reducing `midSpacing` or using a smaller title font.

```js
// ── Width-aware title layout (handles mixed Chinese + English) ──
function estimateTextWidth(text, pt) {
  let width = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0);
    const isCJK = (code >= 0x4E00 && code <= 0x9FFF) || (code >= 0x3400 && code <= 0x4DBF) ||
      (code >= 0x3000 && code <= 0x303F) || (code >= 0xFF00 && code <= 0xFFEF) ||
      (code >= 0x2E80 && code <= 0x2EFF);
    width += isCJK ? pt * 20 : pt * 11; // CJK: full-width, Latin: ~55% width
  }
  return width;
}
// Use estimateTextWidth() in calcTitleLayout() instead of simple char count
// to prevent mid-word breaks in mixed Chinese+English titles like "基于Transformer架构的..."

// ── Meta info table ──

// Calculate adaptive table and label column percentage based on longest label.
// Returns { tablePct, labelPct } — both as percentages.
// Uses ONLY WidthType.PERCENTAGE for cross-engine compatibility (MS Office + WPS).
function calcR5MetaLayout(metaEntries, fontPt = 12) {
  const maxLabelLen = Math.max(...metaEntries.map(e => [...e.label].length));
  // Label needs: maxLabelLen chars + "：" + 1 char padding
  const labelNeedTw = (maxLabelLen + 2) * fontPt * 20;
  // Value column: fixed ~5000tw for consistent underline length
  const valueNeedTw = 5000;
  const totalNeedTw = labelNeedTw + valueNeedTw;
  // Table width as % of page (11906tw), clamped to 55–75%
  const tablePct = Math.min(75, Math.max(55, Math.ceil(totalNeedTw / 11906 * 100)));
  // Label % within the table, clamped to 25–45%
  const rawLabelPct = Math.ceil(labelNeedTw / (tablePct / 100 * 11906) * 100);
  return { tablePct, labelPct: Math.max(25, Math.min(45, rawLabelPct)) };
}

// Build R5 academic cover meta info table.
// ⚠️ CRITICAL cross-engine rules:
//   - Table width: WidthType.PERCENTAGE (NOT DXA — WPS breaks with DXA)
//   - Column widths: WidthType.PERCENTAGE
//   - Label column: LEFT aligned, plain text (NO full-width space padding)
//   - Value column: LEFT aligned, bottom border = fixed-length underline
//   - Table alignment: CENTER (visually centered on page)
function buildR5MetaTable(metaEntries) {
  // metaEntries: [{ label: "学院", value: "计算机科学与技术学院" }, ...]
  const { tablePct, labelPct } = calcR5MetaLayout(metaEntries);
  const valuePct = 100 - labelPct;
  const bottomBorder = { style: BorderStyle.SINGLE, size: 4, color: "000000" };

  const rows = metaEntries.map(entry => new TableRow({
    children: [
      // Label cell: left-aligned, no bottom border
      new TableCell({
        width: { size: labelPct, type: WidthType.PERCENTAGE },
        borders: noBorders,
        margins: { top: 60, bottom: 60, left: 0, right: 0 },
        children: [new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 60, after: 60, line: 400 },
          children: [new TextRun({
            text: entry.label + "：",
            size: 24, font: { eastAsia: "SimSun", ascii: "Times New Roman" },
          })],
        })],
      }),
      // Value cell: left-aligned, bottom border = fixed-length underline
      new TableCell({
        width: { size: valuePct, type: WidthType.PERCENTAGE },
        borders: { top: NB, left: NB, right: NB, bottom: bottomBorder },
        margins: { top: 60, bottom: 60, left: 80, right: 0 },
        children: [new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 60, after: 60, line: 400 },
          children: [new TextRun({
            text: entry.value,
            size: 24, font: { eastAsia: "SimSun", ascii: "Times New Roman" },
          })],
        })],
      }),
    ],
  }));

  return new Table({
    width: { size: tablePct, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows,
  });
}

// ⚠️ MANDATORY: Cover section must use margin: 0. See "Cover Section Non-Negotiables" above.
function buildCoverR5(config) {
  const PAGE_H = 16838, SAFETY = 1200;
  const safeH = PAGE_H - SAFETY; // 15638
  const simMarginLR = 1701, simMarginT = 1200;
  const contentW = 11906 - simMarginLR * 2;

  // ★ Width-aware title layout for mixed Chinese+English
  const { titlePt, titleLines } = calcTitleLayoutMixed(config.title, contentW, 36, 24);
  const titleSize = titlePt * 2;

  // Parse meta entries
  const metaEntries = (config.metaLines || []).map(line => {
    const sep = line.indexOf("：") !== -1 ? "：" : ":";
    const idx = line.indexOf(sep);
    if (idx === -1) return { label: line, value: "" };
    return { label: line.slice(0, idx).trim(), value: line.slice(idx + sep.length).trim() };
  });

  // Height budget (no margins.top — use spacing.before instead)
  const schoolNameH = config.schoolName ? (22 * 23 + 400) : 0;
  const titleTotalH = titleLines.length * (titlePt * 23 + 200);
  const subtitleH = config.subtitle ? (15 * 23 + 600) : 0;
  const metaRowH = 520; // 60+60 padding + ~400 line height
  const metaTableH = metaEntries.length * metaRowH;
  const footerH = config.footerRight ? (12 * 23 + 200) : 0;
  const spacerParas = 3 * 350;
  const fixedH = schoolNameH + titleTotalH + subtitleH + metaTableH + footerH + spacerParas;
  const remaining = Math.max(safeH - fixedH, 600);

  // ★ topSpacing includes simulated top margin (simMarginT)
  const topSpacing = Math.min(Math.floor(remaining * 0.28) + simMarginT, 4200);
  const midSpacing = Math.min(Math.floor((remaining - simMarginT) * 0.18), 2000);
  const bottomSpacing = Math.min(remaining - topSpacing + simMarginT - midSpacing, 5500);

  const children = [];
  children.push(new Paragraph({ spacing: { before: topSpacing } }));

  // School name (optional)
  if (config.schoolName) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 400 },
      children: [new TextRun({ text: config.schoolName, size: 44, characterSpacing: 40,
        font: { eastAsia: "SimSun", ascii: "Times New Roman" } })],
    }));
  }

  // Title
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: i < titleLines.length - 1 ? 120 : 300 },
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true,
        font: { eastAsia: "SimHei", ascii: "Times New Roman" } })],
    }));
  }

  // Subtitle
  if (config.subtitle) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 200 },
      children: [new TextRun({ text: config.subtitle, size: 30,
        font: { eastAsia: "SimSun", ascii: "Times New Roman" } })],
    }));
  }

  children.push(new Paragraph({ spacing: { before: midSpacing } }));

  // Meta info table
  if (metaEntries.length > 0) children.push(buildR5MetaTable(metaEntries));

  children.push(new Paragraph({ spacing: { before: bottomSpacing } }));

  // Footer
  if (config.footerRight) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: config.footerRight, size: 24, color: "404040",
        font: { eastAsia: "SimSun", ascii: "Times New Roman" } })],
    }));
  }

  // ★ 16838 outer wrapper — only left/right margins, NO margins.top
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: PAGE_H, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: "FFFFFF" },
        borders: noBorders, verticalAlign: "top",
        margins: { left: simMarginLR, right: simMarginLR },
        children,
      })],
    })],
  })];
  // Height budget example (short title, 4 meta lines):
  // topSpacing(3818) + schoolName(906) + title(1028) + subtitle(945) + midSpacing(1467)
  // + metaTable(4×520=2080) + bottomSpacing(5268) + footer(476) = ~15988 < 15838 ✅
}
```

---

### blendColors Utility Function

```js
function blendColors(hex1, hex2, ratio) {
  const p = (s, i) => parseInt(s.replace("#","").slice(i, i+2), 16);
  const mix = (c1, c2) => Math.round(c1 + (c2 - c1) * ratio);
  const r = mix(p(hex1,0), p(hex2,0)), g = mix(p(hex1,2), p(hex2,2)), b = mix(p(hex1,4), p(hex2,4));
  return [r, g, b].map(v => v.toString(16).padStart(2,"0")).join("");
}
```



## Geometric Decoration System

→ See `references/decorations.md` for the full geometric decoration element library (decoration elements, usage scenarios, code examples).

## Chinese Plot PNG Method (matplotlib)

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties

font_paths = [
    "/System/Library/Fonts/Supplemental/SimHei.ttf",
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
    "./SimHei.ttf",
]
zh_font = None
for fp in font_paths:
    try:
        zh_font = FontProperties(fname=fp)
        break
    except:
        continue

plt.rcParams["axes.unicode_minus"] = False
```

## Chart Quality Rules

### Chart Color Palette

Default: **low-saturation (Morandi style)** palette to avoid flashy high-saturation. High-saturation palette only for explicitly energetic scenarios (events/education/creative).

```js
const chartColors = {
  // Default: low saturation, professional (S: 25-40%, L: 55-68%)
  default: ["6B9DAD", "C49B72", "7BA68A", "B87472", "9687A8", "C8B87C", "7AADA0", "7A9BB8"],
  // Vivid: only for energetic/creative scenes
  vivid:   ["2F97B8", "E67E22", "27AE60", "E74C3C", "9B59B6", "F1C40F", "1ABC9C", "3498DB"],
};

// Scene selection:
// - report/whitepaper/consulting/academic/contract → default
// - activity/education/creative copy → vivid (optional)
```

**Color usage rules:**
- Max **5 colors** per chart; excess categories use depth variants of same hue
- Emphasis data uses document accent color; non-emphasis uses grey `#B0B0B0`
- Adjacent segments in pie/bar charts must have hue gap ≥ 60°

1. **Anti-overlap**: If >6 x-axis labels, rotate 45° (`plt.xticks(rotation=45, ha='right')`)
2. **Anti-stretch**: Always set figure size explicitly (`fig, ax = plt.subplots(figsize=(10, 6))`)
3. **Aspect ratio (CRITICAL)**: When embedding in docx, MUST read actual image dimensions and calculate height proportionally. NEVER hardcode both width and height — pie charts become ellipses, radar charts become diamonds.
   ```js
   const sizeOf = require("image-size");
   const dims = sizeOf(chartBuffer);
   const displayWidth = 500;
   const displayHeight = Math.round(displayWidth * (dims.height / dims.width));
   // transformation: { width: displayWidth, height: displayHeight }
   ```
4. **DPI**: Save at 200+ DPI (`plt.savefig("chart.png", dpi=200, bbox_inches="tight")`)
5. **Colors**: Use palette accent color for primary data series
6. **Legend**: Place outside plot area if >4 series
7. **Square charts**: Pie and radar charts MUST use `figsize=(8, 8)` (equal width/height) to preserve circular/radial shape
7. **Grid**: Light gray grid (`ax.grid(True, alpha=0.3)`)

---

## Typography Rules

### CJK Body Text
- **Alignment**: Justified (`AlignmentType.JUSTIFIED`)
- **First-line indent**: 2 characters — Profile A (SimSun): `firstLine: 480`; Profile B (YaHei): `firstLine: 420`. See `common-rules.md` for profile definitions.
- **Line spacing**: 1.3x = `spacing: { line: 312 }`
- **No heading indent**: Headings must NOT have first-line indent

### English Body Text
- **Alignment**: Left (`AlignmentType.LEFT`)
- **No indent**
- **Line spacing**: Same 1.3x

### Table Numbers
- Right-aligned in cells
- Use monospace or tabular figures if available

### Headings
- No first-line indent
- `spacing: { before: 240, after: 120 }` (H1: before 360)
- Bold, palette.primary color

### 1.3x Line Spacing — MANDATORY
Every document, every paragraph. `spacing: { line: 312 }`. No exceptions unless scene explicitly overrides (e.g., resume uses 1.15x).

---

## Page Layout — A4 Standard

```js
sections: [{
  properties: {
    page: {
      size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
      margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
      // Top/bottom 2.54cm = 1440, left 3.0cm = 1701, right 2.5cm = 1417 twips
    },
  },
  children: [/* ... */],
}]
```

These are defaults. Scenes may override (e.g., official docs use different margins).

### Scene Font Override Rules

Default font config (docx-js Font Configuration in design-system.md) uses YaHei+Calibri for most business scenarios. The following scenes have dedicated font requirements — **scene rules override defaults**:

| Scene | Body CN | Body EN | Headings | Body Color |
|------|----------|----------|------|----------|
| Default (general) | Microsoft YaHei | Calibri | SimHei + Calibri | palette.body |
| **Report** | **SimSun** | **Times New Roman** | **SimHei + TNR** | **"000000" (pure black)** |
| **Academic** | **SimSun** | **Times New Roman** | **SimHei + TNR** | **"000000" (pure black)** |
| **Contract** | **SimSun** | **Times New Roman** | **SimHei + TNR** | **"000000" (pure black)** |
| Official doc | FangSong | — | STXiaoBiaoSong | "000000" |
| Resume | Microsoft YaHei | Calibri | SimHei + Calibri | palette.body |

When report or academic scene is loaded, `styles.default.document.run` font and color must be overridden per scene. Heading sizes may also differ (e.g., report scene H1 centered, H2 uses Xiao San size:30 instead of default Si Hao size:28). Scene file takes precedence.
