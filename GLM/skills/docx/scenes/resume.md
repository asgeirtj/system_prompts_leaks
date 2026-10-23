# Scene: Resume / CV

## Goal

Generate a complete, authentic, well-structured, position-targeted resume with stable Word formatting. Must simultaneously meet:
- Authentic and credible content, clear position targeting
- ATS-friendly, stable Word layout
- Clean structure, professional visual design, easy to scan

**Execution priority** (when conflicting): Position relevance > Information readability > ATS compatibility > Visual decoration

**Forbidden:** Producing advice-only / fragments / half-finished drafts; outputting chat-style explanations.

→ Font profile: **B (Visual)** — see `references/common-rules.md`  
→ Placeholder convention & universal prohibitions — see `references/common-rules.md`

---

## Scope

Default: generate a position-oriented general resume. Switch to English resume, academic CV, international format, or design portfolio style only when explicitly requested by the user.

---

## Resume Type Routing

Auto-select module order based on user background and target:

### General Resume (default)
Name & Contact → Target Position → Profile Summary (optional) → Core Skills → Work Experience → Projects → Education → Certifications / Awards

### New Graduate Resume
Name & Contact → Target Position → Education → Internship Experience → Projects → Campus Activities / Competitions / Awards → Skills & Certifications

### Technical Role Resume
Name & Contact → Target Direction → Profile Summary (optional) → Tech Stack / Core Skills → Work Experience → Projects → Education → Open Source / Papers / Patents / Competitions

### Academic CV
Name & Contact → Research Direction / Target → Education → Research Experience → Papers / Patents / Projects / Grants → Teaching / Academic Service → Awards / Skills / Languages

---

## Input Processing Rules

1. If user provides a target position or JD → **must reorganize and rewrite content around position requirements**
2. If user provides a raw draft → prioritize restructuring, phrasing refinement, and priority reordering; do not rewrite into an unfamiliar career
3. **Never fabricate** companies, positions, degrees, projects, certifications, awards, papers, patents, data results, or achievements
4. If critical data is missing → use conservative expressions or placeholder `【Please fill in: ______】`; never fabricate precise numbers
5. A single resume should generally serve only one primary career direction

---

## Content Quality Constraints

### Core Principles
1. Resume must revolve around the target position — do not spread all experiences equally
2. Most relevant experiences, projects, and skills must be **placed first and detailed**
3. Terminology, company names, position titles, date formats, and skill names must be consistent
4. Must demonstrate: **personal positioning → capability tags → relevant experience → provable results**
5. No piling of vague self-praise; no inspirational writing or chronological dumps

### Experience Writing Standards

Each experience bullet should demonstrate: **Action + Object/Context + Method + Result/Impact**

**Recommended verbs:** Led, built, drove, optimized, refactored, designed, delivered, coordinated, improved, reduced, achieved

**Rules:**
- "Responsible for" / "participated in" are not absolutely forbidden, but must include scope and results
- Each bullet is concise — one core contribution per bullet
- Quantify when possible, but do not force-bold all numbers
- Recent experience gets detail; low-relevance/low-value experience gets compressed or removed
- Reverse chronological order — most recent and relevant first
- Expand the most recent 2 experiences; compress earlier ones

### Profile Summary / Self-Assessment
1. Not mandatory
2. If included, frame as "Profile Summary" — **3–4 lines max**
3. Focus on: years of experience, career direction, core capabilities, representative achievements, position fit
4. **Forbidden** as main content: "hardworking", "strong sense of responsibility", "team player", "quick learner", "outgoing personality"

### Truthfulness & Risk Control
1. Never fabricate experiences, achievements, education, awards, or certifications
2. Never upgrade "participated in" to "led" unless user information supports it
3. Never attribute team results entirely to the individual
4. Never fabricate revenue, conversion rates, headcount, budgets, or technical metrics
5. If no data available, use restrained expressions: "improved delivery efficiency", "shortened processing cycle", "supported core business launch"

---

## Length Control

| Candidate Type | Target Pages |
|---------------|-------------|
| New graduate / <3 years experience | **1 page** |
| 3–10 years experience | 1–2 pages |
| Senior manager / researcher / academic CV | May exceed 2 pages, but must maintain information density |

**Compression rules:**
- Experiences >5 years old with low relevance should be compressed
- Experiences >10 years old and irrelevant may be omitted
- Never pad low-value experiences just to "look comprehensive"

---

## ATS & Structure Constraints

1. Core information must be plain text — never rely on images, icons, text boxes, or headers/footers for key content
2. No embedded charts, objects, SmartArt, or WordArt
3. Experience descriptions use consistent bullet symbols — no complex auto-numbering
4. Bullets within the same position should be compact — no excess blank lines

**Table layout vs. ATS balance:** The 3 visual templates (A/B/C) use Table-based layouts for Word visual quality. In strict ATS scenarios (user explicitly says "ATS priority"), prefer Template B (single-column) with reduced table dependency. Default: visual quality first.

---

## Module Naming

Use only standard, universal, recruiter-familiar names:
- Personal Info, Target Position, Profile Summary, Core Skills, Work Experience, Projects, Education, Certifications, Awards, Languages

**Forbidden fancy names:** "My Growth Journey", "Self-Appreciation", "Shining Moments", "Life Motto"

---

## Template Disease Prevention

1. Do not include irrelevant identity tags (political affiliation, hometown, etc.) unless user explicitly requests
2. Do not place low-priority modules (hobbies, languages, personality traits) before work experience
3. Do not combine cover letter and resume in one document (unless user explicitly requests)
4. Do not let template feel overpower actual personal information
5. Do not let "self-assessment" occupy the golden area of the page (should come after core skills/experience)

---

## Template Selection

Three templates are provided, auto-selected based on user needs:

| Template | Layout | Best For | Color Style |
|----------|--------|----------|-------------|
| A | Left sidebar + right body | General purpose, tech roles | Dark grey sidebar + blue bar headings |
| B | Dark header banner + single column | Content-heavy / senior candidates | Dark blue header + underline headings |
| C | Left sidebar + vertical-line headings | International / bilingual / foreign companies | Blue sidebar + left-border headings |

**Selection logic:**
- Default: Template A
- Lots of content (expected > 1 page) → Template B (no sidebar, better space utilization)
- User explicitly requests bilingual / English → Template C

### Industry Color Suggestions

| Career Direction | Sidebar BG | Accent Color | Recommended Template |
|-----------------|-----------|-------------|---------------------|
| Tech / Internet | `#1A1F36` (deep blue-purple) | `#667eea` (amethyst) | A or C |
| Finance / Consulting | `#0F2027` (deep sea blue) | `#D4AF37` (gold) | A or B |
| Design / Creative | `#2D1B30` (deep purple) | `#f5576c` (coral pink) | A or C |
| Education / Training | `#1A3A3A` (dark green) | `#3CB4A0` (mint green) | A |
| Medical / Health | `#0E2030` (dark cyan) | `#3888A8` (medical blue) | B |
| General / Default | `#303030` (warm dark neutral) | `#B89870` (warm accent) | A |

When industry is unspecified, use default warm neutral palette. This aligns with the Visual Profile warm-neutral guidance in `design-system.md`.

## Key Rules

- **NO cover page / NO TOC**
- **Target: 1 page** (2 pages max for senior roles)
- **Compact spacing**: `line: 276` (1.15x)
- All templates use **bilingual section headings** (e.g., "Work Experience 工作经历")

---

## Template A: Left Sidebar + Color Bar Headings

### Color Palette
```js
const S = {
  bg: "3B4F5C",      // sidebar background (dark grey-blue)
  text: "D8E2E8",    // sidebar text
  label: "8BA0AD",   // sidebar secondary text
  accent: "2F97B8",  // accent color (blue-cyan)
  title: "1A2D38",   // body heading
  body: "2C3E4A",    // body content
  sec: "6B8592",     // secondary info (dates etc.)
};
```

### Layout Structure
```
┌──────────┬──────────────────────┐
│ [Photo]  │ ██ Profile ██        │  ← Blue bar heading
│          │ Summary text...      │
│ Name     │                      │
│ Title    │ ██ Work Experience ██│
│          │ Company  Role  Date  │
│ ──────── │ ▸ Achievement...     │
│ Basic    │ ▸ Achievement...     │
│ Info     │                      │
│          │ ██ Projects ██       │
│ ──────── │ ...                  │
│ Contact  │                      │
│          │ ██ Education ██      │
│ ──────── │ ...                  │
│ Skills   │                      │
│ Java ●●●●○│                     │
│ Go   ●●●○○│                     │
│          │                      │
│ ──────── │                      │
│ Certs    │                      │
└──────────┴──────────────────────┘
     30%             70%
```

### Implementation Notes

**Page setup:**
```js
page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } }
// Use Table to simulate columns: columnWidths: [3400, 8506]
// ⚠️ Row height must use "exact" with safety margin to prevent overflow blank pages
// Row height: height: { value: 16038, rule: "exact" }
// 16038 = 16838(A4 height) - 1200(safety margin for cross-engine compatibility)
```

**Sidebar element order:**
1. Photo placeholder (rectangle + border, width 2400 DXA, height 1800)
2. Name (32pt bold white SimHei) + Title (18pt accent)
3. Basic info (DOB / degree / school)
4. Contact info (phone / email / address)
5. Skill ratings (name + ●○ dot rating, 5 levels each)
6. Certificates list

**Right-side section headings (color bar style):**
```js
// Full-width bar background + white Chinese text + lighter English text
new Table({ columnWidths:[7600], rows:[new TableRow({ children:[
  new TableCell({
    shading: { fill: S.accent, type: ShadingType.CLEAR },
    margins: { top:40, bottom:40, left:200, right:100 },
    children: [new Paragraph({ children: [
      new TextRun({ text: "Work Experience  ", size:22, bold:true, color:"FFFFFF", font:"SimHei" }),
      new TextRun({ text: "Experience", size:18, color:"C8E8F0", font:"Times New Roman", italics:true }),
    ] })],
  })
] })] });
```

**Experience entry format:**
```js
// Line 1: Company(bold) + Title(accent) + Date(right-aligned)
new Paragraph({
  tabStops: [{ type: TabStopType.RIGHT, position: 7200 }],
  children: [
    new TextRun({ text: "Company Name", size:22, bold:true, color:S.title }),
    new TextRun({ text: "    Role Title", size:20, color:S.accent }),
    new TextRun({ text: "\t2023.06 — Present", size:17, color:S.sec }),
  ]
});
// Line 2+: ▸ bullet points
```

---

## Template B: Dark Header Banner + Single Column

### Color Palette
```js
const C = {
  dark: "1A3352",    // header background (dark blue)
  accent: "2980B9",  // accent color
  title: "1A2636",   // heading
  body: "2C3E50",    // body text
  sec: "6B8599",     // secondary info
  light: "E8EFF5",   // light background
};
```

### Layout Structure
```
┌────────────────────────────────┐
│ ██████████████████████████████ │  ← Dark blue background banner
│ █  Name    Title             █ │    Contains name / title /
│ █  Phone | Email | Location  █ │    contact / basic info
│ █  DOB | Degree | School     █ │
│ ██████████████████████████████ │
│                                │
│ Profile                        │  ← Underline heading
│ ─────────────────────────────  │
│ Summary text...                │
│                                │
│ Work Experience                │
│ ─────────────────────────────  │
│ Company | Role        Date     │
│ • Achievement...               │
│ ...                            │
│                                │
│ Skills                         │
│ ─────────────────────────────  │
│ Programming ●●●●○  Java/Go/...│  ← Rating + details
└────────────────────────────────┘
```

### Implementation Notes

**Header banner:**
```js
// Table single row single column, dark background, height 2400 DXA
new Table({ columnWidths:[11906], rows:[new TableRow({
  height: { value:2400, rule:"exact" },
  children:[new TableCell({
    shading: { fill: C.dark },
    margins: { top:300, bottom:200, left:800, right:800 },
    verticalAlign: VerticalAlign.TOP, // Never use CENTER in exact-height rows (WPS incompatible)
    children: [
      // Line 1: Name(48pt white) + Title
      // Line 2: Phone | Email | Location
      // Line 3: DOB | Degree | School
    ]
  })]
})] });
```

**Section headings (underline style):**
```js
new Paragraph({
  borders: { bottom: { style: BorderStyle.SINGLE, size: 2, color: C.accent } },
  children: [
    new TextRun({ text: "Work Experience", size:24, bold:true, color:C.accent, font:"SimHei" }),
    new TextRun({ text: "  Experience", size:18, color:C.sec, italics:true }),
  ]
});
```

**Skills display (rating + details):**
```js
// Name(bold) + ●○ rating + specific tools list
new Paragraph({ children: [
  new TextRun({ text: "Programming  ", size:19, bold:true, color:C.title }),
  new TextRun({ text: "●●●●○  ", size:13, color:C.accent }),
  new TextRun({ text: "Java / Go / Python / TypeScript", size:18, color:C.sec }),
] });
```

---

## Template C: Blue Sidebar + Vertical-Line Headings

### Color Palette
```js
const C = {
  side: "4A7C8F",     // sidebar background (teal-blue)
  text: "FFFFFF",     // sidebar text
  label: "A0C4D0",   // sidebar secondary text
  accent: "357A8F",   // accent color
  dot: "2F8FAD",      // skill dot fill color
  dotDim: "B8D4DE",   // skill dot empty color
  title: "1A3040",    // body heading
  body: "2C4050",     // body content
  sec: "6B8A98",      // secondary info
};
```

### Sidebar-Specific Elements

**Circular photo placeholder:**
```js
new Paragraph({ alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "◯", size:80, color:C.label })]
});
```

**Language proficiency matrix:**
```js
"English  ● ● ● ● ○"
"Japanese ● ● ○ ○ ○"
```

**Right-side section headings (left-border style):**
```js
new Paragraph({
  borders: { left: { style: BorderStyle.SINGLE, size:8, color:C.accent, space:8 } },
  indent: { left: 120 },
  children: [
    new TextRun({ text: "Work Experience", size:24, bold:true, color:C.title, font:"SimHei" }),
    new TextRun({ text: "  Experience", size:18, color:C.sec, italics:true }),
  ]
});
```

**Experience entry format (differs from A):**
```js
// Line 1: Company name (bold)
// Line 2: Role (accent color) + Date
// Line 3+: ▸ bullet points
```

---

## Universal Rules

### Font Specifications
| Element | Font | Size | Style |
|---------|------|------|-------|
| Name (sidebar) | SimHei | 32pt (size:64) | Bold, white |
| Name (header) | SimHei | 24pt (size:48) | Bold, white |
| Section heading | SimHei | 11pt (size:22) | Bold |
| Company / School | Microsoft YaHei | 11pt (size:22) | Bold |
| Role title | Microsoft YaHei | 10pt (size:20) | accent color |
| Date range | Microsoft YaHei | 8.5pt (size:17) | sec color |
| Bullet description | Microsoft YaHei | 9.5pt (size:19) | body color |
| Skill dots | Default | 6.5pt (size:13) | accent / dimColor |

### Bullet Symbols
- Template A / C: `▸` (small triangle)
- Template B: `•` (round dot)

### Skill Rating Rules
- 1–5 levels using filled ● and empty ○ dots
- One skill per line, name on the left, dots on the right
- Filled dot color: accent; empty dot color: dimColor

### JD Matching Logic
When user provides a job description:
1. Extract key requirements (skills, experience, education)
2. Prioritize matching experience items to the top
3. Naturally incorporate JD keywords into descriptions
4. Highlight relevant skills

### Multi-Page Handling

- 1 page content: Sidebar templates (A/C) or single-column template (B)
- Over 1 page: Prefer Template B; if using A/C, switch page 2 to full-width layout with a name bar at the top (Name | Title)

⚠️ **Multi-page resumes must use multi-section structure:**

Page 1 and Page 2 must be **different sections** for independent margin and layout control:

```js
sections: [
  {
    // Page 1 section — margin 0 (sidebar layout needs full-page)
    properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
    children: [page1Table],
  },
  {
    // Page 2 section — normal margins with header bar
    properties: { page: { margin: { top: 800, bottom: 600, left: 800, right: 800 } } },
    children: [pageHeader(name, title), ...page2Content],
  },
]
```

⚠️ **Template B multi-page handling:**

Template B header banner uses Table simulation:
1. Banner `columnWidths` must equal **page content area width** (pageWidth - marginLeft - marginRight), not full page width
2. If banner needs full page width → set page 1 section margin to 0, banner columnWidths to 11906
3. Page 2+ must be independent sections, margin.top ≥ 800

⚠️ **Page 2+ top spacing rules (mandatory):**

1. **Page margin.top must be ≥ 800 twips** (~1.4 cm), never 0
2. **Page 2+ needs a header info bar:** concise `Name | Title` bar, height ~400–600 twips, separated from body with light background or bottom line
3. **200–300 twips spacing between header bar and body content**
4. **Forbidden: content touching the very top of page 2**

```js
// Concise header bar for page 2+
function pageHeader(name, title) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB,
               bottom: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" } },
    rows: [new TableRow({
      cantSplit: true,
      height: { value: 500, rule: "atLeast" },
      children: [new TableCell({
        margins: { top: 60, bottom: 60, left: 200, right: 200 },
        borders: { top: NB, left: NB, right: NB, bottom: NB },
        children: [new Paragraph({
          children: [
            new TextRun({ text: name, size: 20, bold: true, color: S.title || C.title }),
            new TextRun({ text: `  |  ${title}`, size: 18, color: S.sec || C.sec }),
          ]
        })],
      })],
    })],
  });
}
```

---

## Scene-Specific Quality Checks

In addition to universal checks (see `references/common-rules.md`):

### Format
- [ ] Fits within 1 page (senior ≤ 2 pages)
- [ ] **Single-page fill rate ≥ 85%** (bottom whitespace ≤ 15%, ~2500 twips)
- [ ] Section headings are bilingual
- [ ] Skill rating dots correct (●○)
- [ ] Experience in reverse chronological order
- [ ] No cover page, no TOC
- [ ] Line spacing 1.15x (line: 276)
- [ ] No extra blank pages
- [ ] **Table row height uses `rule: "exact"` with value ≤ 16038** (prevent overflow blank pages)
- [ ] **Multi-page: page 2+ has header info bar + proper top spacing**

### Content
- [ ] Clearly organized around target position
- [ ] No vague self-assessments ("hardworking", "responsible", "team player")
- [ ] No fabricated data or exaggerated results
- [ ] Most relevant experience placed first and detailed
- [ ] Each bullet demonstrates action + object + method + result
- [ ] No long narrative blocks / excessive long sentences / information density imbalance
- [ ] Module names are standardized
- [ ] Contact info is plain text, clearly positioned
- [ ] Header area forms visual center
- [ ] Work experience and projects are the visual main body
- [ ] Page count matches candidate seniority

### Single-Page Fill Rules

Single-page resumes must fully utilize page space — **large bottom whitespace is forbidden:**

1. If content is insufficient → **proactively expand:**
   - Add project details, skill keywords, achievement data
   - Add supplementary modules: profile summary, interests, awards
2. Use section spacing (`spacing.before/after`) to **distribute content evenly**
3. Sidebar templates (A/C): sidebar height should approach full page
   - If sidebar content is sparse, increase element spacing
   - Or add supplementary modules: "Languages", "Interests"
4. Assessment: after generation, check last content element position; if >2500 twips from page bottom, adjust
