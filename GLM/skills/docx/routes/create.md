# Route: Create New Document

## Workflow

```
0. Check if user provided a reference template (PDF/docx) → if yes, use Template-Following Mode below
1. Load `references/design-system.md` → select palette and cover recipe
2. Load `references/common-rules.md` → shared layout, font, placeholder rules
3. Check user keywords → load scene file if applicable
4. Load `references/docx-js-core.md`
5. If complex → also load `references/docx-js-advanced.md`
6. Plan document structure (outline)
7. Write JS/TS using docx library
   ⚠️ **BEFORE writing any string**: scan ALL Chinese text for curly quotes `""''` and replace with `\u201c \u201d \u2018 \u2019` — bare curly quotes break JS syntax (see docx-js-advanced.md § Quotes Escaping)
8. Run with `bun run generate.js` (or `node generate.js`)
9. If TOC → run `python3 "$DOCX_SCRIPTS/add_toc_placeholders.py" output.docx --auto`
10. Run post-generation checklist (see SKILL.md)
```

## Template-Following Mode

When the user provides a reference document (PDF/docx) as a **formatting template** (e.g., "generate following this template format", "refer to this sample"), switch to template-following mode instead of the standard recipe-based workflow:

1. **Extract the template's structure** — cover layout, section order, heading hierarchy, page breaks, special pages (e.g., advisor comments page, approval form)
2. **Replicate structure exactly** — every major structural unit becomes a **separate section** (cover, body, appendix/form pages) with appropriate margins and page breaks
3. **Fill content** from the user's content source, or generate per user instructions
4. **Preserve template-specific elements** — school-specific forms, signature areas, stamp placeholders, advisor comment blocks → reproduce as-is with placeholder text (e.g., "Advisor (signature):")
5. **Maintain formatting fidelity** — font choices, table layouts, spacing, and alignment should match the template, not the standard design-system palettes

⚠️ **Do NOT apply standard cover recipes (R1–R7) when a user-provided template defines its own cover format.** Follow the template's cover layout instead. Standard `common-rules.md` constraints (e.g., `WidthType.PERCENTAGE`, `allNoBorders` for cover wrapper, `Rule 8` line spacing) still apply for cross-engine compatibility.

⚠️ **Each distinct page type = separate section.** Cover section (margin: 0), body section (standard margins), appendix/form pages (may need different margins or orientation). Never place cover + body + appendix in a single section.

---

## Decision Tree

### Cover Page?
- **YES**: Reports, theses, proposals, plans, or 3+ page docs with clear title/author
- **NO**: Resumes, contracts, official documents, exam papers, short memos

### Cover Style Selector — Recipe Router

Covers use **7 validated layout recipes (R1–R7)**, auto-selected by `selectCoverRecipe()` in `references/design-system.md` (the **authoritative source** — do NOT duplicate the function).

**Quick Reference:**

| docType | Recipe | Default Palette |
|---------|--------|-----------------|
| contract / official / exam / resume | null (no cover) | — |
| academic | R5 (Clean White) | ACADEMIC |
| proposal_report (thesis proposal) | R5 (Clean White) | ACADEMIC |
| lesson_plan (STEM) | R4 (Top Color Block) | DM-1 |
| lesson_plan (arts/general) | R6 (Editorial Warm) | ED-1 |
| creative / branding / design | R3 (Centered Card Frame) | SN-2 |
| cultural / newsletter / internal | R6 (Editorial Warm) | ED-1 |
| activity / event | R6 (Editorial Warm) | ED-1 |
| trend/research (cultural/creative/brand) | R7 (Swiss Tech) | ST-1 |
| whitepaper | R2 (Double-Rule Frame) | IG-1 / CM-2 |
| consulting | R2 (Double-Rule Frame) | MIN-1 |
| proposal / plan | R4 (Top Color Block) | GO-1 |
| report | R1 (Pure Paragraph Left) | by industry |
| default | R1 (Pure Paragraph Left) | DS-1 |

⚠️ **Long title routing:** After selecting recipe, apply `applyLongTitleOverride(result, titleLength)`. Titles >20 chars on R3/R4/R6 → fall back to R1. Titles >30 chars on R2 → fall back to R1. R5 is never overridden.

⚠️ **Academic thesis cover:** Use `buildAcademicCover()` from `scenes/academic.md`.

⚠️ **Thesis proposal report (开题报告):** Use `buildProposalCover()` from `scenes/academic.md`. Cover MUST be an independent section. Keywords: "开题报告" (Chinese), "thesis proposal", "research proposal" — NOT the same as business proposals (which use R4).

### Table of Contents?
- **YES**: 3+ major sections (H1 headings)
- **NO**: Resumes, exam papers, short docs, contracts (<20 clauses)

→ See `references/toc.md` for the complete TOC reference (3-step process, code examples, common bugs).

### Headers/Footers?
- **YES** by default (page numbers minimum)
- **NO**: cover page section, official docs (special format)

### Load Math Formulas?
When: exam papers, academic papers, physics/math/chemistry → load `references/math-formulas.md`

### Load Chart Templates?
When: data visualization, reports with charts → load `references/chart-templates.md`

## Outline Rules

**User provides outline** → Follow EXACTLY. No additions, deletions, or reordering.

**No outline** → Create from scene template:
- **Academic:** Abstract → TOC → Body → References
- **Report:** Use `selectReportType()` to determine type, then follow template A–F:
  - analysis → Template A (Executive Summary → Background → Scope & Method → Findings → Diagnosis → Conclusions)
  - experiment → Template B (Abstract → Objective & Hypothesis → Environment → Procedure → Results → Error Analysis → Conclusions)
  - testing → Template C (Overview → Scope & Environment → Test Plan → Results → Defects → Risks → Conclusions)
  - research → Template D (Summary → Background → Subjects & Method → Sample → Findings → Synthesis → Recommendations)
  - review → Template E (Overview → Goals → Review → Results → Issues → Lessons → Action Plan)
  - proposal → Template F (Summary → Status → Goals → Solution → Roadmap → Resources → Risks → Benefits)
- **Contract:** Use `selectContractType()` then follow template A–E:
  - bilateral → Template A (Header → Parties → Recitals → Definitions → Subject → Price → Rights → Delivery → Tax → IP → Breach → Force Majeure → Termination → Notices → Dispute → Miscellaneous → Signature)
  - transfer → Template B (Header → Recitals → Definitions → Subject → Consideration → Closing → Representations → Tax → Breach → Dispute → Signature)
  - nda → Template C (Header → Recitals → Definition → Obligations → Use Restrictions → Return/Destroy → Exceptions → Duration → Breach → Dispute → Signature)
  - framework → Template D (Header → Recitals → Purpose → Scope → Division → Mechanism → Commercial → Confidentiality → Term → Breach → Dispute → Signature)
  - terms → Template E (Title → Definitions → Services → Rights → Liability → Fees → IP → Termination → Notices → Dispute → Miscellaneous)
- **Official:** Use `selectOfficialType()` + `needsRedHeader()`:
  - notice → Template A ([Red header] → [Doc number] → Title → Addressee → Reason → Items → Requirements → [Attachments] → [Signature] → [Date] → [Colophon])
  - letter → Template B ([Red header] → [Doc number] → Title → Addressee → Reason → Negotiation/Reply → Closing → [Signature] → [Date])
  - reply → Template C ([Red header] → [Doc number] → Title → Addressee → Reference → Reply → "This is the reply." → Signature → Date)
  - minutes → Template D (Title → Meeting Overview → Agreed Items → Responsibilities → [Distribution]) — typically no red header
- Present outline to user before generating when possible

## Scene Completeness

Include ALL elements a scene specifies:
- **Academic thesis:** Cover (`buildAcademicCover()` in its own section), abstract, TOC, references
- **Thesis proposal report (thesis proposal / 开题报告):** Cover (`buildProposalCover()` in its own section), body sections per proposal template. Cover MUST be a separate section.
- **Report:** Cover, executive summary, conclusions
- **Contract:** Party info, recitals, complete clause closure, signature block, uniform `【】` placeholders
- **Official:** Correct document type, specific title, closing phrase matching type, proper numbering hierarchy, red header only when requested
- **Exam:** Student info area, scoring criteria

Generate complete, substantive content — not skeletons.

## Content Guidelines

- **Length**: "detailed report" = 3000+ words. "brief summary" = 500–1000.
- **Data**: Use user's data, or generate realistic placeholders
- **Charts**: Use `references/chart-templates.md` matplotlib templates → PNG → embed
- **Math**: Use `references/math-formulas.md` LaTeX → docx-js Math mapping
- **Tables**: For structured data, not layout
- **Numbering**: Figures, tables numbered sequentially with cross-references

## Code Architecture

### Heading Style Rule (Mandatory)

**All body chapter headings MUST use `heading: HeadingLevel.HEADING_X`** — never simulate with bold + large font (TOC cannot detect simulated headings).

**Exception:** Cover title and TOC title ("目录") heading MUST NOT use Heading style.

### Blank Page Prevention

→ See SKILL.md § Post-Generation checklist for the full set of rules.

Key rules:
1. No double page breaks (SectionType.NEXT_PAGE + PageBreak = blank page)
2. PageBreak paragraphs should have visible text content
3. No more than 3 consecutive empty paragraphs
4. Cover section: ≤2 trailing empty paragraphs, no trailing PageBreak

### Builder Pattern Example

```js
const { Document, Packer, Paragraph, TextRun, Header, Footer,
        AlignmentType, HeadingLevel, PageNumber } = require("docx");
const fs = require("fs");

// 1. Palette
const P = { primary: "#101820", body: "#182030", secondary: "#506070", accent: "#8090A0" };
const c = (hex) => hex.replace("#", "");

// 2. Component builders
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : 240, after: 120 },
    children: [new TextRun({ text, bold: true, color: c(P.primary), font: { ascii: "Calibri", eastAsia: "SimHei" } })]
  });
}

function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312 },
    children: [new TextRun({ text, size: 24, color: c(P.body) })],
  });
}

// 3. Assembly — cover + body in separate sections
const doc = new Document({
  styles: { default: { document: {
    run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 24, color: c(P.body) },
    paragraph: { spacing: { line: 312 } },
  }}},
  sections: [
    { properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: buildCoverR1(config) },  // ← use recipe from design-system.md
    { properties: { page: { margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: [PageNumber.CURRENT], size: 18 })] })] }) },
      children: [heading("Chapter 1"), body("Content...")] },
  ],
});

Packer.toBuffer(doc).then(buf => { fs.writeFileSync("output.docx", buf); });
```

## Post-Generation

→ See SKILL.md § Post-Generation for the complete two-layer verification checklist.

```bash
python3 "$DOCX_SCRIPTS/postcheck.py" output.docx
```
⚠️ **Running postcheck.py is MANDATORY.** Fix all ❌ errors before delivering.
