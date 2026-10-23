# Scene: Report / Proposal

## Goal

Generate a complete, formal, well-structured report ready for Word delivery. Must simultaneously meet:
- Complete structure, clear logic, formal language, definitive conclusions
- Objective data presentation, proper Word formatting
- Ready for presentation, filing, review, submission, or internal communication

**Forbidden:** Producing outlines-only / summaries / template annotations / half-finished drafts; outputting chat-style explanations or filler phrases like "here is the report content".

→ Font profile: **A (Formal)** — see `references/common-rules.md`  
→ Default layout: standard margins — see `references/common-rules.md`  
→ Placeholder convention — see `references/common-rules.md`  
→ Universal prohibitions & quality checks — see `references/common-rules.md`

---

## Report Type Routing

Auto-select structure and expression style based on user intent. If not explicit, infer from topic.

```js
function selectReportType(keywords, topic) {
  if (/analysis|competitor|industry|operations|data/.test(keywords)) return "analysis";
  if (/experiment|lab|algorithm|engineering/.test(keywords)) return "experiment";
  if (/test|QA|performance|security|compatibility/.test(keywords)) return "testing";
  if (/survey|questionnaire|interview|market research/.test(keywords)) return "research";
  if (/review|retrospective|post-mortem|summary/.test(keywords)) return "review";
  if (/proposal|feasibility|implementation|optimization/.test(keywords)) return "proposal";
  return "analysis"; // default
}
```

### 6 Report Types

| Type | Use Case | Structure Focus | Expression Focus |
|------|----------|----------------|-----------------|
| analysis | Industry/competitor/operations/data analysis | Background → Dimensions → Findings → Diagnosis → Recommendations | Conclusion-first, clear dimensions, chart-supported, actionable advice |
| experiment | Scientific/academic/algorithm/engineering experiments | Objective → Environment → Method → Results → Error → Conclusion | Precise process, clear conditions, objective results, conclusion ties to hypothesis |
| testing | Functional/performance/security/compatibility testing | Overview → Scope → Plan → Results → Defects → Risks → Conclusion | Data-driven, traceable, reproducible, supports go/no-go decisions |
| research | User/market/survey/interview research | Background → Subjects & Method → Sample → Findings → Synthesis → Recommendations | Clear sample boundaries, layered findings, recommendations match findings |
| review | Project/incident retrospective, phase summary | Goals → Review → Results → Issues → Lessons → Actions | Clear facts, restrained attribution, specific action items |
| proposal | Project/optimization proposal, feasibility study | Status → Goals → Solution → Roadmap → Resources → Risks → Benefits | Strong argumentation, executable plan, clear boundaries |

---

## Standard Template Structures

### Template A: Analysis Report
1. Executive Summary
2. Background & Objectives
3. Scope, Data Sources & Methodology
4. Core Findings
5. Problem Diagnosis & Root Cause
6. Conclusions & Recommendations
7. Appendices (if needed)

### Template B: Experiment Report
1. Abstract
2. Objective & Hypothesis
3. Environment & Materials
4. Procedure & Method
5. Data & Results
6. Error Analysis & Discussion
7. Conclusions
8. Appendices (if needed)

### Template C: Testing Report
1. Test Overview
2. Test Scope & Environment
3. Test Plan & Case Design
4. Test Results Summary
5. Defect Analysis & Distribution
6. Risk Assessment & Outstanding Issues
7. Test Conclusions
8. Appendices (if needed)

### Template D: Research Report
1. Research Summary
2. Background & Objectives
3. Subjects & Methodology
4. Sample & Data Description
5. Core Findings
6. Problem Synthesis
7. Recommendations & Action Direction
8. Appendices (if needed)

### Template E: Review / Summary Report
1. Overview
2. Goals & Scope
3. Process Review
4. Results Summary
5. Issues & Root Cause Analysis
6. Lessons Learned
7. Follow-up Action Plan
8. Appendices (if needed)

### Template F: Proposal / Feasibility Report
1. Executive Summary
2. Current State & Problem Analysis
3. Goals & Expected Outcomes
4. Solution Design
5. Implementation Roadmap & Milestones
6. Resource Requirements & Budget
7. Risk Analysis & Mitigation
8. Expected Benefits & Evaluation
9. Appendices (if needed)

**If the user provides a company/school/course template or fixed chapter requirements, always follow those first.**

---

## Input Recognition & Completion

### User May Provide
Report topic, type, use case, audience, industry, length requirements, data sources, structure requirements, output purpose (presentation/filing/audit/review/external submission/coursework), template files, company/department/project/author/date, etc.

### Processing Rules
1. If the user provides a template, existing document, company standard, or format example, **always follow it first**
2. If information is incomplete, fill in conservatively — completions must be **restrained, natural, credible, professional**
3. **Never fabricate** unrealistic data, conclusions, test results, business metrics, project statuses, policy backgrounds, or customer feedback
4. If critical information is missing and cannot be safely inferred, use standardized placeholders
5. If no real data is available, prefer low-hallucination approaches: "status description → analysis framework → problem synthesis → recommendations"

---

## Content Quality Constraints

### Logic & Structure
1. Report must revolve around a clear topic, objective, audience, and through-line
2. Must not just pile up background/concepts/vague statements — must demonstrate analysis, synthesis, judgment, comparison, or review value
3. Terminology must be consistent throughout — concepts must not drift
4. Abstract, body, conclusions, and recommendations must be consistent — no self-contradiction
5. Must form a complete loop: "background → objective → method/basis → process/status → findings/results → problems/judgment → recommendations/conclusions"
6. Each major chapter must have a clear core conclusion or topic sentence — no information dump

### Language Style
1. Formal, objective, restrained, professional
2. No colloquial expressions, chat tone, hyperbole, emotional language, or propaganda style
3. For management/decision-maker audience: conclusion-first, highlight key points, actionable recommendations
4. For technical/testing reports: clear basis, reproducible process, verifiable results, stated risks

### Data Expression
1. Never use vague expressions as main conclusions: "significantly improved", "obviously optimized", "performed well", "has certain issues"
2. If data exists, express quantitatively (e.g., "average response time under 200 ms" not "fast response")
3. First occurrence of a term: write full name with abbreviation, e.g., "Application Programming Interface (API)"
4. Without real data backing, never fabricate precise figures
5. Statements about facts, data, status, and results must be internally consistent

### Truthfulness & Conservative Generation
1. Never fabricate test results, experiment data, growth rates, customer counts, interview conclusions, sample distributions, or launch decisions
2. Never present speculation as proven fact
3. Never fabricate meeting minutes, regulatory bases, customer feedback, or system logs
4. When information is insufficient, use placeholders — never pretend information is complete
5. Conclusions must be restrained — do not overstate effects, risks, or value
6. Recommendations must be grounded in preceding analysis — no conclusions from thin air

---

## Chapter Content Requirements

### (1) Cover
1. Formal reports should have a cover page
2. Cover includes: title, subtitle (if any), organization/department, author, date, classification (if requested)
3. Cover must be a separate section
4. Cover does not display page numbers
5. Use `selectCoverRecipe()` for recipe + palette (see design-system.md)
6. Common recipes: general report R1, whitepaper R2, consulting R3, proposal R4

### (2) Executive Summary
1. Formal reports **must have** a summary opening — never jump directly into details
2. Summary should briefly state: background, objective, key methodology, key findings, main recommendations
3. Suitable for quick reading by management — generally 200–400 words
4. Must not read like a TOC description or pile of background filler

### (3) Table of Contents
1. Medium-to-long formal reports should include a TOC
2. TOC must be generated from real heading styles (Heading + TOC field) — never write a fake TOC
3. TOC page is typically a separate page
4. TOC depth: usually 2–3 levels

### (4) Background & Objectives
1. Must explain why this report exists
2. Must state what problem/scenario/audience the report serves
3. If scope boundaries exist, state what the report does NOT cover
4. Must not be vague/grand background — must relate directly to this report's task

### (5) Methodology / Scope / Basis
1. Must state what materials, criteria, methods, and time range the report is based on
2. Analysis: data sources, analysis dimensions, criteria definitions
3. Experiment: environment, materials, samples, procedure principles
4. Testing: scope, version, environment, methods, coverage/rounds
5. Research: sample source, sample size, research method, time range
6. Reader must understand how conclusions were derived

### (6) Core Content / Process / Status / Results
1. Organized by logical or dimensional order — no chaotic piling
2. Each section should lead with its conclusion, then expand with evidence
3. Results must be specific — never just "performed well" or "has certain issues"
4. Data, metrics, phenomena, and comparisons must be clearly stated
5. If charts are needed but cannot be generated, use chart placeholders (see below)

### (7) Analysis / Discussion / Problem Diagnosis
1. Must not merely repeat earlier results
2. Must explain what results mean, what patterns they reveal, what problems they expose
3. May include: comparative analysis, root cause analysis, mechanism analysis, anomaly explanation, limitations, risk boundaries
4. Analysis must be consistent with preceding data and facts

### (8) Conclusions / Recommendations / Next Steps
1. Conclusions must respond to report objectives
2. Recommendations must be executable — not just principle slogans
3. Recommendations should state: who executes, what to do, when, expected improvement
4. Testing/review: clear verdict (pass / conditional pass / fail)
5. Retrospective/summary: specific follow-up action items

### (9) Appendices
1. Supplementary material valuable to the report but not suitable for the main body
2. Includes: raw data excerpts, detailed parameters, supplementary tables, sample screenshots
3. Appendices should be on separate pages with proper headings

---

## Chart Placeholder Convention

When charts are needed but cannot be directly generated:

```
[Chart Placeholder: Bar chart; Topic: Q1-Q4 2025 revenue comparison; X-axis: Quarter; Y-axis: Revenue (10K CNY); Style: clean business]
```

**Rules:**
- Specify: chart type, topic, axis meanings, key dimensions, optional palette suggestion
- Placeholder must be a standalone paragraph — never inline
- Never use vague placeholders like "insert chart here"

**Prefer direct generation:** Charts that can be produced via matplotlib should be generated as embedded PNGs. Placeholders are a fallback only.

---

## Content-to-Word Mapping

### Heading Levels
1. Strict hierarchy — no level-skipping
2. Headings must be informative — never "Background", "Content", "Other" (use "Project Background & Report Objectives" instead)
3. Do not mix multiple numbering systems
4. Normal paragraphs must not masquerade as headings

### Paragraphs
1. Do not use consecutive blank lines for visual spacing
2. Each paragraph should be a complete semantic unit — not too long or too fragmented

### Lists
1. Use lists only when genuinely needed — an entire report must not be bullet points
2. Nesting depth ≤ 3 levels
3. Consistent punctuation within a list (all complete sentences or all fragments)
4. Combine "key points" with "analysis paragraphs" — never just list without explaining

### Tables
1. Use tables only for structured data (statistics, comparisons, parameter lists)
2. Every table must have a header row — headers must not be blank
3. Avoid heavily merged-cell complex nested tables
4. Tables must have introductory and explanatory text before/after
5. Cell content should be concise — avoid long paragraphs inside cells

### Emphasis
1. Bold only for key conclusions, critical metrics, first occurrence of key terms
2. Never bold entire paragraphs
3. Avoid italic, strikethrough, and other unstable styles

---

## Palette Selection

| Report Type | Suggested Palette |
|-------------|-------------------|
| General | Neutral calm (primary: #101820) |
| Consulting | Warm terracotta |
| Tech | Cool dawn mist |
| Environment / Education | Warm sunshine |
| Medical | Cool mint |

See `references/design-system.md` for full palette definitions.

---

## Document Structure

1. **Cover** — via `selectCoverRecipe()` (see design-system.md)
   - Separate section, page margin typically 0
   - Common: general R1, whitepaper R2, consulting R3, proposal R4

2. **Table of Contents** — H1–H3, separate section

3. **Executive Summary** — 1 page max

4. **Body** — Chapters per selected template (A–F)

5. **Conclusions & Recommendations**

6. **Appendices** — Raw data, detailed tables

---

## Professional Elements

- **Page numbers**: bottom center, size 18, color "808080"
- **Header**: report title (abbreviated), size 18, color "808080"
- **Figure/table numbering**: sequential (Figure 1 / Table 1)
- **Cover**: no page number, no header/footer
- **TOC**: optional Roman numerals or no page numbers
- **Body**: Arabic numerals, continuous

---

## Scene-Specific Quality Checks

In addition to universal checks (see `references/common-rules.md`):

### Format
- [ ] Executive summary ≤ 1 page
- [ ] Figures/tables have captions ("Figure X: description" / "Table X: description")
- [ ] Cover recipe matches report type
- [ ] Data charts use palette accent color

### Content
- [ ] Has executive summary — not starting directly with details
- [ ] Heading names are specific and meaningful
- [ ] Complete loop: background → basis → content → analysis → conclusions/recommendations
- [ ] No fabricated or exaggerated details
- [ ] Abstract and conclusions are consistent
- [ ] Terminology consistent throughout
- [ ] Data expressions are quantified, not vague
- [ ] Recommendations are actionable with owners and timeline

### Structure
- [ ] Heading hierarchy has no level-skipping
- [ ] List nesting ≤ 3 levels
- [ ] Tables have headers with intro/explanation text
- [ ] Bold used sparingly for emphasis only
