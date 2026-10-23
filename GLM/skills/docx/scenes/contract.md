# Scene: Contract / Agreement

## Goal

Generate a complete, formal, well-structured legal document with clear clauses, rigorous logic, and proper formatting. Must simultaneously meet:
- Complete structure, clear clauses, formal language, explicit responsibilities
- Identifiable risk boundaries, proper Word formatting
- Ready for review, revision, circulation, or signing preparation

**Forbidden:** Producing outlines-only / sample clauses / drafting advice / risk summaries; outputting chat-style explanations or filler phrases.

→ Font profile: **A (Formal)** — see `references/common-rules.md`  
→ Default layout: standard margins — see `references/common-rules.md`  
→ Placeholder convention & universal prohibitions — see `references/common-rules.md`

---

## Contract Type Routing

```js
function selectContractType(keywords, topic) {
  if (/confidential|NDA|non-disclosure/.test(keywords)) return "nda";
  if (/transfer|equity|asset|rights/.test(keywords)) return "transfer";
  if (/framework|strategic|cooperation agreement/.test(keywords)) return "framework";
  if (/terms|platform rules|user agreement|privacy/.test(keywords)) return "terms";
  return "bilateral"; // default: bilateral commercial contract
}
```

### 5 Contract Types

| Type | Use Case | Structure Focus |
|------|----------|----------------|
| bilateral | Service/sale/development/procurement contracts | Subject → Consideration → Performance → Acceptance → Breach → Dispute |
| transfer | Equity/debt/asset/rights transfer | Subject → Consideration → Closing & Registration → Representations → Tax |
| nda | Non-disclosure agreements | Definition of Confidential Info → Obligations → Use Restrictions → Exceptions → Duration |
| framework | Cooperation framework / strategic alliance | Scope → Division of Work → Mechanism → Subsequent Agreements |
| terms | Platform rules / Terms of Service / User agreements | Definitions → Services → Rights & Obligations → Liability Limits → Amendments |

---

## Standard Template Structures

### Template A: Bilateral Commercial Contract
1. Header (title, contract number, date, location)
2. Party Information (Party A, Party B)
3. Recitals ("Whereas" clauses)
4. Definitions & Interpretation
5. Subject Matter & Scope of Services/Delivery
6. Contract Price & Payment Terms
7. Rights & Obligations of Both Parties
8. Timeline, Delivery & Acceptance
9. Invoicing, Tax & Settlement
10. Intellectual Property & Confidentiality
11. Representations & Warranties (if applicable)
12. Liability for Breach
13. Force Majeure
14. Termination & Dissolution
15. Notices & Service
16. Dispute Resolution
17. Miscellaneous
18. Signature Block

### Template B: Rights Transfer Agreement
1. Header & Parties
2. Recitals
3. Definitions & Interpretation
4. Subject of Transfer
5. Consideration & Payment Arrangement
6. Closing & Registration/Transfer
7. Representations & Warranties
8. Tax Allocation
9. Liability for Breach
10. Dispute Resolution
11. Miscellaneous
12. Signature Block

### Template C: Non-Disclosure Agreement (NDA)
1. Header & Parties
2. Recitals
3. Definition of Confidential Information
4. Confidentiality Obligations
5. Use Restrictions
6. Return, Deletion & Destruction of Information
7. Exceptions
8. Confidentiality Period
9. Liability for Breach
10. Dispute Resolution
11. Miscellaneous
12. Signature Block

### Template D: Framework / Cooperation Agreement
1. Header & Parties
2. Recitals
3. Purpose & Principles
4. Scope of Cooperation
5. Division of Work & Responsibilities
6. Project Advancement Mechanism
7. Commercial Arrangements / Subsequent Agreements
8. Confidentiality, IP & Compliance
9. Term, Amendment & Termination
10. Liability for Breach
11. Dispute Resolution
12. Miscellaneous
13. Signature Block

### Template E: Unilateral Terms / Platform Rules
1. Document Title
2. Definitions & Scope
3. Service/Rule Content
4. User Rights & Obligations / Platform Rights & Obligations
5. Liability Limitations & Disclaimers
6. Fees & Payment (if applicable)
7. Intellectual Property
8. Termination, Suspension & Amendment
9. Notices & Service
10. Dispute Resolution
11. Miscellaneous

**Note:** Unilateral/boilerplate terms require special attention to adhesion clause risks — avoid creating extremely one-sided documents.

**If the user provides an existing template, historical agreement, or company standard, always follow it first.**

---

## Input Recognition & Completion

### Processing Rules
1. If user provides a template, historical agreement, or company standard → **always follow it first**
2. If information is incomplete, fill conservatively — must be **restrained, natural, professional, consistent with transaction logic**
3. **Never fabricate** unrealistic commercial terms, regulatory requirements, approval conclusions, qualification status, tax treatment results, payment facts, or performance facts
4. If critical info is missing → use standardized placeholders
5. If user does not specify jurisdiction → default to PRC commercial writing conventions, but avoid making specific legal conclusions

---

## Legal Writing Standards

### Register
1. Use formal legal document register
2. Use clear party designations: "Party A", "Party B", "both parties", "either party", "non-breaching party", "breaching party"
3. **Forbidden:** Colloquial expressions ("you", "me", "they", "pay up", "cancel the contract", "handle ASAP")
4. Preferred terms: "pay consideration", "perform obligations", "constitute a breach", "terminate the contract", "assume liability for damages", "written notice", "deliver and accept", "representations and warranties"

### Precision
1. Eliminate vague adjectives: avoid "quality", "reasonable", "enormous", "appropriate", "ASAP" unless necessary for legal flexibility
2. Each obligation must specify: who, when, how, what
3. Consistent legal phrasing:
   - Mandatory obligation → "shall"
   - Right authorization → "has the right to"
   - Prohibition → "shall not"
   - Discretionary → "may"
4. Amounts, dates, percentages, deadlines, business days vs. calendar days must be as specific as possible

### Clear Subjects
1. Every clause must have an explicit responsible party — avoid vague subjects ("relevant parties", "relevant personnel", "when necessary")
2. Joint obligations: explicitly write "both parties agree" or "both parties shall"
3. Unilateral obligations: explicitly write "Party A shall" or "Party B shall"

---

## Transaction Closure & Risk Control

A contract must not only describe the transaction — it must ensure logical closure. Check the following:

1. If a performance deadline is specified → specify consequences of delay
2. If payment milestones are specified → specify payment conditions, method, invoice requirements
3. If a delivery obligation exists → specify delivery standards, method, acceptance rules, objection period
4. If termination rights exist → specify conditions, notice, effective date, post-termination settlement
5. If breach liability exists → must correspond to main obligations in preceding clauses
6. If IP/technology/data/trade secrets are involved → separately address ownership, license scope, use restrictions
7. If confidentiality obligations exist → define scope, exceptions, duration, breach consequences
8. If force majeure clause exists → specify notice obligation, mitigation duty, subsequent negotiation mechanism
9. If notice/service arrangements exist → specify address, contact person, email, or other delivery method
10. If user requests significantly one-sided adhesion/disclaimer clauses → add a note near the clause:  
    `[Note: This clause may involve adhesion terms or liability limitations. Manual review recommended for the specific transaction.]`

---

## Truthfulness & Legal Caution

1. **Never fabricate** specific statute article numbers, judicial interpretation numbers, or regulatory document numbers
2. Legal bases should use general references, e.g.: "In accordance with the Civil Code of the PRC and relevant laws and regulations..."
3. **Never** pretend to provide formal legal opinions, litigation success predictions, or definitive validity/invalidity conclusions
4. **Never** state definitive legality conclusions for high-risk clauses (adhesion terms, penalty clauses, disclaimers, non-compete, exclusivity, unilateral interpretation rights)
5. **Never** fabricate that regulatory approvals are obtained, title is unencumbered, tax compliance is assured, or third-party consent is secured
6. When critical info is insufficient → use placeholders, never present as confirmed fact
7. For high-risk areas (equity, debt, licenses, data compliance, labor, personal information, cross-border) → maintain restrained language, do not add rigid commitments without user confirmation

---

## Special Clause Requirements

### Definitions Clause
If the document repeatedly uses specialized terms ("deliverables", "service results", "confidential information", "source code", "project milestones", "acceptance criteria", "trade secrets"), include a "Definitions & Interpretation" clause near the beginning.

### Dispute Resolution
1. Must be explicit
2. Choose between litigation OR arbitration — never mix both
3. Litigation → specify jurisdictional connection point
4. Arbitration → specify arbitration institution
5. If user hasn't specified → use placeholder for confirmation

### Tax Clause
1. If the transaction involves taxes → specify which party bears them, whether price includes tax, invoice type and conditions
2. Avoid vague "taxes borne as required by law" without transaction-specific detail

### Breach Liability
1. Must correspond to main obligations in preceding clauses
2. Penalty amounts should be restrained — avoid obviously exaggerated or severely imbalanced figures
3. If fundamental breach exists → consider corresponding termination rights and damages

### Appendices
1. For complex subjects/pricing/technical requirements/deliverables → use "Appendix 1, Appendix 2..." format
2. Explicitly state appendix-contract relationship (typically: "Appendices form an integral part of this contract")
3. If appendix content is unknown → use placeholder

---

## Palette

**Legal Wood** (Warm + Heavy + Calm) — for decorative elements only; body text must be pure black.

```js
const palette = { primary:"#28201C", body:"#000000", secondary:"#6E6560", accent:"#7A5C3A", surface:"#FBF9F7" };
```

⚠️ **ALL visible text in contracts must be pure black `"000000"`.** This includes:
- Contract title (SimHei, black, NOT accent color)
- Contract number (black)
- Clause headings (black)
- Body text (black)
- Party information (black)
- Signature block text (black)

**The only exception** is red-header official documents (红头文件), which follow their own GB/T 9704 color rules. For standard contracts, NO colored text is permitted — no red, no accent color, no dark-blue-grey.

```js
// ✅ Contract title — always pure black
new Paragraph({ alignment: AlignmentType.CENTER,
  spacing: { line: Math.ceil(22 * 23), lineRule: "atLeast" },  // ★ Rule 8: prevent clipping
  children: [new TextRun({ text: "Training Cooperation Framework Agreement",
    size: 44, bold: true, color: "000000",  // ← MUST be "000000"
    font: { eastAsia: "SimHei", ascii: "Times New Roman" } })]
})

// ❌ FORBIDDEN — accent/palette color on contract text
new TextRun({ text: "Training Cooperation Framework Agreement", color: palette.accent }) // ← WRONG
new TextRun({ text: "Contract No.:", color: palette.primary }) // ← WRONG (if primary ≠ "000000")
```

---

## Scene-Specific Font Overrides

Beyond Profile A defaults:

| Element | Font | Size | Style |
|---------|------|------|-------|
| Contract title | SimHei | Er Hao 22pt (size: 44) | Bold, centered |
| Contract number | SimSun | Wu Hao 10.5pt (size: 21) | Right-aligned |
| Clause heading | SimHei | Xiao Si 12pt (size: 24) | Bold |
| Monetary amount | SimSun | Xiao Si 12pt (size: 24) | Bold |

---

## Document Structure

1. **Title**: "XXX Contract" or "XXX Agreement" — Er Hao SimHei, centered
2. **Contract number**: right-aligned, Wu Hao
3. **Preamble**: Party information with placeholders
4. **Recitals** (summarize transaction background and purpose)
5. **Definitions** (if specialized terms recur)
6. **Substantive clauses** (per selected template)
7. **Signature block**
8. **Appendices** (if any)

---

## Clause Numbering System

Use stable, consistent, pure-text numbering suitable for Chinese legal documents.

```
Article 1  Subject Matter
  1.1  xxxxxxxxxx
  1.2  xxxxxxxxxx
    (1) xxxxxxxxxx
    (2) xxxxxxxxxx
      ① xxxxxxxxxx
      ② xxxxxxxxxx
Article 2  Price and Payment
  2.1  ...
```

**Numbering discipline:**
1. No level-skipping
2. **Forbidden:** Using Markdown list markers (`-` `*` `1.`) for clause hierarchy
3. No switching from "Article X" to `-` or `*` or auto-list mid-document
4. Numbering style must be consistent throughout the entire document
5. Clause headings should be clean and simple

---

## Party Information Layout (Table-Based Alignment — Mandatory)

Party A and Party B information MUST be laid out using a **borderless table** so that labels align vertically. Never use plain paragraphs with indentation — this causes misalignment between parties.

```js
// ✅ Correct — borderless table ensures "统一社会信用代码：", "地址：", "法定代表人：" align
function partyInfoBlock(partyLabel, partyName, fields) {
  // fields: [["Unified Social Credit Code", value], ["Address", value], ["Legal Representative", value]]
  const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const noBorders = { top: NB, bottom: NB, left: NB, right: NB };

  const headerPara = new Paragraph({ spacing: { before: 200, after: 120 },
    children: [new TextRun({ text: `${partyLabel}: ${safeText(partyName, "【Company full name】")}`,
      size: 24, font: { eastAsia: "SimSun", ascii: "Times New Roman" } })]
  });

  const infoTable = new Table({
    width: { size: 90, type: WidthType.PERCENTAGE },
    borders: { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB },
    rows: fields.map(([label, value]) => new TableRow({
      children: [
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: noBorders,
          margins: { top: 40, bottom: 40, left: 420, right: 60 },
          children: [new Paragraph({
            children: [new TextRun({ text: `${label}:`, size: 24,
              font: { eastAsia: "SimSun", ascii: "Times New Roman" } })],
          })],
        }),
        new TableCell({
          borders: noBorders,
          margins: { top: 40, bottom: 40, left: 60, right: 120 },
          children: [new Paragraph({
            children: [new TextRun({ text: safeText(value, `【Please fill in: ${label}】`), size: 24,
              font: { eastAsia: "SimSun", ascii: "Times New Roman" } })],
          })],
        }),
      ],
    })),
  });

  return [headerPara, infoTable];
}

// Usage:
const partyAChildren = partyInfoBlock("Party A (甲方)", config.partyA?.name, [
  ["Unified Social Credit Code (统一社会信用代码)", config.partyA?.creditCode],
  ["Address (地址)", config.partyA?.address],
  ["Legal Representative (法定代表人/负责人)", config.partyA?.legalRep],
]);
```

**Rules:**
1. Party A and Party B info blocks must use the **same table column widths** — labels align across both blocks
2. Use `safeText()` for all field values — never output `undefined`
3. Label column width should accommodate the longest label (e.g., "统一社会信用代码")
4. The indent (`margins.left: 420`) simulates sub-level nesting under the party name

---

## Signature Block

Left-right symmetric, structured, easy to adjust in Word. Never write as scattered paragraphs.

Required fields for each party:
- Party name (seal)
- Legal representative / Authorized representative
- Contact person
- Contact information
- Signing location
- Date: `【____/____/____】`

Use a borderless 2-column table for symmetry. **Every field value must use `safeText()`** — never output `undefined` or empty string. If a field is not provided, use the appropriate `【Please fill in】` placeholder.

```js
// ✅ Correct signature block — safeText for all values
function buildSignatureBlock(partyA, partyB) {
  const fields = ["Party (Seal)", "Legal Rep / Authorized Rep (Signature)", "Contact Person", "Contact Info", "Signing Location", "Date"];
  const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const noBorders = { top: NB, bottom: NB, left: NB, right: NB };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB },
    rows: fields.map((label, i) => {
      const aVal = i === fields.length - 1 ? "【____/____/____】" : safeText(partyA?.[i], "");
      const bVal = i === fields.length - 1 ? "【____/____/____】" : safeText(partyB?.[i], "");
      const displayA = i === 0 ? `Party A (甲方): ${aVal}` : `${label}: ${aVal}`;
      const displayB = i === 0 ? `Party B (乙方): ${bVal}` : `${label}: ${bVal}`;
      return new TableRow({
        children: [
          new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders: noBorders,
            margins: { top: 80, bottom: 80, left: 120, right: 60 },
            children: [new Paragraph({ children: [new TextRun({ text: displayA, size: 24, color: "000000" })] })] }),
          new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders: noBorders,
            margins: { top: 80, bottom: 80, left: 60, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: displayB, size: 24, color: "000000" })] })] }),
        ],
      });
    }),
  });
}
```

---

## Monetary Amount Format

Contracts must show amounts in **both uppercase Chinese and numeric format**:

```
Contract amount: RMB One Million Two Hundred Thirty-Four Thousand Five Hundred Sixty-Seven Yuan (¥1,234,567.00)
```

---

## Style Rules

- **NO cover page** — title page is the first page (title + contract number at top)
- **NO TOC** unless >20 clauses
- **NO decorative elements** — contracts must be formal and clean
- **Line spacing**: 1.5x (line: 360) — ⚠️ scene override (Profile A default is 1.3x/312; contracts use 1.5x for readability and annotation space)
- **Body**: Justified, first-line indent 480 twips
- **Color**: pure black "000000" throughout — no colored text

---

## Scene-Specific Quality Checks

In addition to universal checks (see `references/common-rules.md`):

### Format
- [ ] Party information complete (full name / address / legal representative / contact)
- [ ] Signature block properly formatted, symmetrical, all fields present
- [ ] Monetary amounts shown in both uppercase and numeric format
- [ ] Clause numbering sequential with no gaps
- [ ] No cover page (title page is first page)
- [ ] No Markdown list markers mixed into clause hierarchy

### Content
- [ ] Clause numbering system consistent, no mixing
- [ ] Transaction closure complete (subject → consideration → performance → acceptance → breach → dispute)
- [ ] Breach liability corresponds to main obligations
- [ ] Dispute resolution explicitly stated (or placeholder for confirmation)
- [ ] All unconfirmed variables use `【】` placeholders consistently
- [ ] Language is formal, restrained, subjects are explicit
- [ ] No fabricated statute numbers or overreaching legal conclusions
- [ ] High-risk clauses include manual review notes
- [ ] Terminology consistent throughout
- [ ] Appendix-contract relationship explicitly stated

### Closure
- [ ] Performance deadline → delay consequences specified
- [ ] Payment milestones → conditions and invoice requirements specified
- [ ] Delivery obligation → acceptance rules and objection period specified
- [ ] Termination right → conditions and post-termination handling specified
- [ ] Confidentiality obligation → scope, exceptions, duration, breach consequences specified
- [ ] Force majeure → notice and mitigation duties specified
