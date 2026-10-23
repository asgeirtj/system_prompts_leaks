# Scene: Official Document (Government Notice / Letter / Reply / Minutes)

## Goal

Generate a complete, formal, properly structured official document ready for Word delivery. Must simultaneously meet:
- Correct document type, complete structure, clear elements
- Formal government register, stable hierarchy, reliable layout
- Ready for approval, circulation, filing, issuance, or formal internal communication

**Forbidden:** Producing outlines-only / sample paragraphs / writing advice / half-finished drafts; outputting chat-style explanations.

→ Placeholder convention & universal prohibitions — see `references/common-rules.md`  
→ **Note:** This scene uses its OWN font and layout specs (not Profile A defaults), because official documents follow GB/T 9704 standards.

---

## Scope & Document Type Boundaries

This scene covers:
1. **Notice** — assigning work, communicating requirements, forwarding documents
2. **Official Letter** — between non-subordinate organizations: negotiation, inquiry, assistance requests, replies
3. **Reply (to Request)** — superior authority answering a subordinate's formal request
4. **Meeting Minutes** — recording key outcomes and agreed items

**Important boundaries:**
- "Red header" is a format/layout, not a document type — it typically carries notices, letters, or replies
- **Not all official documents need red headers / document numbers / colophons** — only enable when user explicitly requests "red header format", "GB/T 9704 format", or "formal issuance format"
- Internal enterprise notices, business letters, meeting minutes often do NOT use full GB/T standard format
- This scene does NOT cover: speeches, press releases, promotional materials, papers, summary reports, contracts, or legal opinions

---

## Document Type Routing

```js
function selectOfficialType(keywords, purpose) {
  if (/minutes|meeting/.test(keywords)) return "minutes";
  if (/reply|respond to request/.test(keywords)) return "reply";
  if (/letter|inquiry|negotiation/.test(keywords)) return "letter";
  return "notice"; // default
}
```

### Red Header Activation

```js
function needsRedHeader(userRequest) {
  // Only activate when explicitly requested
  return /red header|GB\/T 9704|formal issuance|official format/.test(userRequest);
}
```

**Rules:**
- `needsRedHeader = true` → Enable red header, document number, colophon (full formal elements)
- `needsRedHeader = false` → Maintain formal style but no mandatory red header; keep only title + addressee + body + signature

---

## Standard Template Structures

### Template A: Notice
1. Red header area (if applicable)
2. Document number (if applicable)
3. Title
4. Addressee
5. Reason for issuance
6. "The relevant matters are hereby notified as follows:"
7. Notice items (expanded by hierarchy)
8. Requirements
9. Attachment notes (if any)
10. Signature (if applicable)
11. Date (if applicable)
12. Colophon (if applicable)

**Closing phrase:** "This notice is hereby given." or "Please implement accordingly."

### Template B: Official Letter
1. Red header area (if applicable)
2. Document number (if applicable)
3. Title
4. Addressee
5. Reason / reference to incoming letter
6. Negotiation / inquiry / reply items
7. Closing
8. Signature (if applicable)
9. Date (if applicable)
10. Colophon (if applicable)

**Closing phrases:** "Please reply by letter." / "This letter is hereby sent." / "This is in reply."

### Template C: Reply
1–11. Similar to Notice structure
- Addressee is typically the single requesting organization
- Must reference the incoming request document
- "After review, the reply is as follows:"
- Closing: "This is the reply."

### Template D: Meeting Minutes
1. Title (meeting name + "Minutes")
2. Meeting overview (time, place, chair, attendees)
3. Agreed items
4. Responsibility assignments / follow-up requirements (if applicable)
5. Distribution scope (if applicable)

**Notes:**
- Minutes record "agreed items", not a transcript of speeches
- Minutes generally do NOT follow standard red header format
- Unless user explicitly requests organizational template compliance

---

## Input Recognition & Completion

### Processing Rules
1. If user provides a template, historical document, or organizational standard → **always follow it first**
2. If information is incomplete → fill conservatively, formally, and appropriately for the government context
3. **Never fabricate** policy bases, incoming document numbers, leadership directives, meeting decisions, or official organization names
4. If critical info is missing → use standardized placeholders
5. Never present a draft as if it were already formally issued

---

## Title Drafting Rules

The title is the most critical identifying element — must accurately, concisely reflect the issuing body, subject matter, and document type.

| Type | Format | Example |
|------|--------|---------|
| Notice | Issuing body + "regarding" + subject + "notice" | XX Municipal Government Notice on Issuing the XX Management Measures |
| Letter | Issuing body + "regarding" + subject + "letter" | XX Company Letter Regarding Land Use for XX Project |
| Reply | Issuing body + "regarding" + subject + "reply" | XX Bureau Reply on Approving Establishment of XX Branch |
| Minutes | Meeting name + "minutes" | XX Company Third General Manager Meeting Minutes |

**Rules:**
1. Title must specify the subject — no vague titles ("Notice on Relevant Matters")
2. Titles generally do not use periods
3. Title length should be moderate — avoid excessive length

---

## Addressee & CC

### Addressee
1. The primary recipient of the document
2. On its own line, between title and body
3. Followed by full-width colon
4. Replies typically address only one requesting organization
5. Meeting minutes generally do not have a standard addressee

### CC (Carbon Copy)
1. CC recipients are NOT addressees — do not mix them
2. CC information typically appears in the colophon area
3. Non-red-header documents should not mechanically add "CC:" lines

---

## Writing Style & Register

### Language Style
1. Must be **solemn, plain, precise, rigorous, concise**
2. **Forbidden:** Literary devices (metaphor, personification, hyperbole, rhetorical questions, exclamations)
3. **Forbidden:** Vague expressions ("approximately", "recently", "relevant departments", "as soon as possible") — unless user explicitly requires vague wording
4. Time, location, organization, scope, milestones should be as specific as possible
5. No sloganeering filler or obvious "AI boilerplate" feel

### Common Phrase Patterns

**Purpose phrases:**
- "In order to implement..."
- "To further standardize..."
- "To effectively carry out..."

**Basis phrases:**
- "In accordance with the provisions of..."
- "As required by..."
- "Pursuant to relevant regulations"

**Transition phrases:**
- Notice: "The relevant matters are hereby notified as follows:"
- Letter: "The following is hereby communicated:"
- Reply: "After review, the reply is as follows:"
- Minutes: "The agreed items of the meeting are recorded as follows:"

**Closing phrases (must match document type):**
- Notice: "This notice is hereby given."
- Letter: "Please reply." / "This is hereby communicated." / "This is in reply."
- Reply: "This is the reply."
- Minutes: generally no fixed closing phrase

### Conciseness
1. Use "because" not "due to the reason that..."
2. Use "to" not "for the purpose of..."
3. Name specific entities — not "relevant parties" or "related departments"
4. Name responsible units — not "all units should ensure implementation" (vague ending)

---

## Body Hierarchy & Numbering

Official document body must strictly follow the standard Chinese government numbering system:

```
I. General matters
  (1) Sub-items
    1. Specific points
      (1) Detail supplements
```

Original Chinese numbering:
```
一、General matters
  （一）Sub-items
    1. Specific points
      （1）Detail supplements
```

**Rules:**
1. No level-skipping
2. **Forbidden:** Markdown list markers (`-` `*`)
3. No switching between numbering styles at the same level
4. Level 1: major tasks; Level 2: sub-items; Levels 3–4: only when truly necessary

---

## Truthfulness & Caution
1. **Never fabricate** issuing bodies, incoming organizations, document numbers, leadership directives, meeting decisions, or policy bases
2. **Never** write "per the spirit of XX meeting" or "per XX directive" unless user explicitly provides these
3. **Never** fabricate titles and numbers of referenced documents in replies or letters
4. **Never** present a draft as already formally issued
5. When information is insufficient → use placeholders, never pretend elements are complete

---

## Attachment Notes
1. Placed after body text, before signature
2. "Attachment:" followed by attachment name
3. Multiple attachments: numbered sequentially (Attachment 1, Attachment 2...)
4. Attachment names must be clear and specific — never fabricate unknown attachments

---

## Signature & Date

1. Document types requiring signatures should have issuing body name and date
2. Not all types mechanically require signatures (minutes typically do not)
3. Formal document dates must use Chinese numeral format with proper "〇" character
   - Example: March 31, 2026 → 二〇二六年三月三十一日
4. Document numbers use tortoiseshell brackets "〔〕" (not square brackets "[]")
   - Example: X政发〔2026〕1号
5. Date format must be consistent throughout

---

## Palette

**NO decorative colors.** Pure black text on white background. The only color is red header text.

```js
const palette = { primary:"#000000", body:"#000000", accent:"#000000", surface:"#FFFFFF" };
const RED_HEADER = "FF0000"; // Only for red header text
```

---

## Page Layout (GB/T 9704-2012 Standard)

**Only for formal GB/T red-header documents.** Non-GB/T scenarios may use standard margins.

| Property | Value | Twips |
|----------|-------|-------|
| Top margin | 3.7 cm | 2098 |
| Bottom margin | 3.5 cm | 1984 |
| Left margin | 2.8 cm | 1588 |
| Right margin | 2.6 cm | 1474 |

```js
// GB/T red header layout
page: { size: { width: 11906, height: 16838 }, margin: { top: 2098, bottom: 1984, left: 1588, right: 1474 } }
// Non-GB/T formal documents may use standard margins:
// margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 }
```

---

## Font Specifications (GB/T 9704)

| Element | Font | Size | Style |
|---------|------|------|-------|
| Red header org name | STXiaoBiaoSong / SimSun Bold | As determined by org | Red (#FF0000), centered |
| Document title | STXiaoBiaoSong / SimSun Bold | Er Hao 22pt (size: 44) | Centered |

**Font fallback for STXiaoBiaoSong:** This font is not installed by default on all systems. WPS ships FZXiaoBiaoSong-S13 instead. Use this fallback chain:
- Preferred: `STXiaoBiaoSong` (华文小标宋)
- Fallback 1: `FZXiaoBiaoSong-S13` (方正小标宋, available in WPS)
- Fallback 2: `SimSun` with Bold (宋体加粗, universally available)

In code, set primary font and note the fallback:
```js
font: { eastAsia: "STXiaoBiaoSong" }
// Fallback: FZXiaoBiaoSong-S13 → SimSun Bold. User may need to install STXiaoBiaoSong for exact rendering.
```
| Addressee | FangSong | San Hao 16pt (size: 32) | Left-aligned |
| Body | FangSong | San Hao 16pt (size: 32) | Justified, indent 640 |
| Level 1 heading | SimHei | San Hao 16pt (size: 32) | Bold |
| Level 2 heading | KaiTi | San Hao 16pt (size: 32) | Normal |
| Level 3 heading | FangSong | San Hao 16pt (size: 32) | Bold |
| Attachment notes | FangSong | San Hao 16pt (size: 32) | Left-aligned |
| Signature/date | FangSong | San Hao 16pt (size: 32) | Right-aligned |
| Page number | FangSong | Si Hao 14pt (size: 28) | Centered, "— X —" |

```js
styles: {
  default: {
    document: {
      run: { font: { ascii: "Times New Roman", eastAsia: "FangSong" }, size: 32, color: "000000" },
      paragraph: { spacing: { line: 560 } }, // Fixed 28pt line spacing
    },
    heading1: {
      run: { font: { eastAsia: "SimHei" }, size: 32, bold: true, color: "000000" },
    },
    heading2: {
      run: { font: { eastAsia: "KaiTi" }, size: 32, color: "000000" },
    },
  },
}
```

**Note:** For "formal administrative style" (not strict GB/T), retain the style logic but do not rigidly require every GB/T element.

---

## Code Examples

### Red Header (red-header documents only)

```js
new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200, line: Math.ceil(26 * 23), lineRule: "atLeast" },
  children: [new TextRun({ text: "XX Municipal Government", font: { eastAsia: "SimSun" },
    size: 52, bold: true, color: "FF0000" })] })
new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "FF0000" } },
  spacing: { after: 40 }, children: [] })
```

### Page Number Footer

```js
footers: { default: new Footer({ children: [new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [
    new TextRun({ text: "\u2014 ", size: 28 }),
    new TextRun({ children: [PageNumber.CURRENT], size: 28 }),
    new TextRun({ text: " \u2014", size: 28 }),
  ],
})] }) }
```

---

## Style Rules

1. **Strictly follow official document format — no decorative elements**
2. NO cover page
3. NO TOC
4. NO headers (only page numbers in footer)
5. NO colors except red header (red-header documents only)
6. NO images or charts (unless integral to document content)
7. NO fancy fonts — only FangSong, SimHei, KaiTi, STXiaoBiaoSong
8. Line spacing: fixed 28pt (`line: 560`) — **NOT** the default 1.5x

---

## Scene-Specific Prohibitions

In addition to universal prohibitions (see `references/common-rules.md`):

1. Must not write official documents as chat replies, promotional copy, speeches, or papers
2. Must not use Markdown headings/lists/bold/italic for document hierarchy
3. Must not apply red header/document number/colophon to all document types indiscriminately
4. Must not format meeting minutes as a standard red-header notice
5. Must not use literary rhetoric, colloquial expressions, or strongly emotional language
6. Must not fabricate incoming documents, policies, document numbers, meeting decisions, or superior directives
7. Must not use excessive blank lines to create "formal appearance"
8. Must not let the document read like a report, paper, or marketing copy

---

## Scene-Specific Quality Checks

In addition to universal checks (see `references/common-rules.md`):

### Format
- [ ] Red header text is #FF0000 and only red header uses color (red-header scenarios)
- [ ] Line spacing fixed at 28pt (line: 560)
- [ ] FangSong / SimHei / KaiTi correctly applied
- [ ] Signature right-aligned, date format correct
- [ ] No cover page, no TOC, no header
- [ ] Page number format "— X —"
- [ ] Red header / document number / colophon only where appropriate

### Content
- [ ] Document type correctly identified, structure matches
- [ ] Title is accurate, specific, document type clear (not vague)
- [ ] Addressee, attachments, signature, colophon used appropriately
- [ ] Closing phrase matches document type
- [ ] Body hierarchy strictly follows: 一、(Level 1) →（一）(Level 2) → 1. (Level 3) →（1）(Level 4)
- [ ] No Markdown headings/lists/bold/italic mixed in
- [ ] Meeting minutes not incorrectly given standard document signature and colophon
- [ ] Date uses Chinese numerals with proper "〇" character
- [ ] Document number uses tortoiseshell brackets "〔〕"
- [ ] No fabricated incoming documents / policy bases / organizational elements
- [ ] Register is solemn and plain — no colloquial / literary / promotional tone
