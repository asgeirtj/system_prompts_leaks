# Scene: Copywriting / Script

## Scope

Broadcast scripts, product promotion copy, livestream scripts, presentation scripts, speeches, hosting scripts, short video scripts — any document where the goal is **spoken delivery**.

→ Placeholder convention & universal prohibitions — see `references/common-rules.md`  
→ Font profile: **B (Visual)** — see `references/common-rules.md`

---

## 1. Core Principles

⚠️ **A broadcast script is NOT a report, NOT a spec sheet, NOT an encyclopedia.**

The goal is for the audience to **understand on first listen, remember key points, and take action.** Therefore:

1. **Highlight selling points, don't pile specs:** Each paragraph covers only 1–2 core points with relatable scenario descriptions
2. **Conversational tone:** Use "you" not "the user"; use natural speech, not corporate jargon
3. **Rhythm:** Alternate long and short sentences, insert pause markers, avoid wall-of-text paragraphs
4. **Length discipline:** ~250–300 words per minute of speech; a 5-minute script should not exceed 1500 words
5. **Information consistency:** All data, model numbers, prices must be consistent throughout — no self-contradiction

---

## 2. Document Structure

Completely different from reports:

```
Title (centered, short and punchy)
────────────────────
[Opening]     ← Grab attention, 1–2 sentences
[Core Para 1] ← One selling point/opinion + scenario
[Core Para 2] ← One selling point/opinion + scenario
[Core Para 3] ← One selling point/opinion + scenario (max 3–5 paras)
[Closing]     ← Summary + Call to Action (CTA)
────────────────────
[Notes]       ← Supplementary info, data sources (optional, small grey text)
```

### Decisions
- **Cover:** ❌ Not needed
- **TOC:** ❌ Not needed
- **Header/footer:** Optional, minimal
- **Sections:** Single section sufficient
- **Line spacing:** `line: 400` (slightly larger than standard 1.5x for reading/marking ease)

---

## 3. Layout Standards

### Font Specifications

| Element | Font | Size | Style |
|---------|------|------|-------|
| Title | SimHei | 18pt (size:36) | Bold, centered |
| Section heading / highlight | SimHei | 14pt (size:28) | Bold |
| Body | Microsoft YaHei | 12pt (size:24) | Left-aligned |
| Rhythm markers | Microsoft YaHei | 10.5pt (size:21) | Grey 999999, italic |
| Notes | Microsoft YaHei | 10pt (size:20) | Grey 666666 |

### Paragraph Spacing
```js
// Generous spacing between paragraphs for reading/breathing pauses
spacing: { before: 200, after: 200, line: 400 }
// Larger gap between core sections
sectionGap: { before: 400, after: 200 }
```

### Key Point Highlighting
Use **bold** or **accent-colored text** to mark key selling points:
```js
new TextRun({ text: "Key selling point", bold: true, color: c(P.accent) })
```

### Rhythm Markers (optional)
Insert small grey markers where pauses, emphasis, or tone changes are needed:
```js
new Paragraph({ spacing: { before: 60, after: 60 },
  children: [new TextRun({ text: "[Pause 2 sec]", size: 21, color: "999999", italics: true })] })
// Or inline: new TextRun({ text: " [emphasis] ", size: 18, color: "999999", italics: true })
```

---

## 4. Content Quality Rules

### Information Density Guide

| Script Type | Duration | Word Count | Core Paragraphs |
|-------------|----------|-----------|----------------|
| Short video | 30–60 sec | 150–300 | 1–2 |
| Product promotion | 2–3 min | 500–800 | 3–4 |
| Presentation / Speech | 5–10 min | 1200–2500 | 5–8 |
| Hosting script | Per agenda | Per segment | Per segment |

### Scene-Specific Prohibitions

1. **No spec dumping:** Do not list all product specifications in tables. Select 2–3 most persuasive data points and express them through scenarios
2. **No information contradiction:** Model numbers, prices, data appearing multiple times must be perfectly consistent
3. **No report tone:** No "in conclusion", "research indicates", "as mentioned above" — this is spoken word
4. **No lengthy citations:** Broadcast scripts do not need quotes, footnotes, or references
5. **No dense layout:** Paragraphs must have visible spacing — no screen-filling text walls

### Product Promotion Specific Rules
- **Opening:** Lead with pain point / scenario ("Does your washing machine still smell after a cycle?"), not self-introduction
- **Product intro:** Compare only 1–2 competitive dimensions at a time — not a full review
- **Price anchor:** State original/market price first, then discount price — create contrast
- **CTA:** Explicitly state the action ("Click the link below", "Type 1 in comments")

---

## 5. Palette

Broadcast scripts use clean, simple colors — no complex visual design needed:

```js
const P = {
  primary: "#1A1A1A",    // Title
  body: "#333333",       // Body
  secondary: "#666666",  // Notes
  accent: "#E85D3A",     // Key highlight (warm, energetic)
  surface: "#FFF8F5",    // Background (if needed)
};
```

---

## 6. Scene-Specific Quality Checks

In addition to universal checks (see `references/common-rules.md`):

- [ ] Total word count within target range (not exceeding)
- [ ] Each core paragraph has only 1–2 selling points (no dumping)
- [ ] Conversational tone present (not report/formal style)
- [ ] Information consistent throughout (model, price, data — no contradictions)
- [ ] Paragraph spacing sufficient (visually not crowded)
- [ ] Clear attention-grabbing opening + closing CTA
