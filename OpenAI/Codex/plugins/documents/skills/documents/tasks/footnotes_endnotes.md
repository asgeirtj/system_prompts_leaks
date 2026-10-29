# True Footnotes / Endnotes (OOXML parts, numbering, refs)

## Goal
Add or audit **true** footnotes/endnotes in a `.docx` and verify they render correctly.

## What footnotes/endnotes are (OOXML)
Footnotes and endnotes are **not** "text in the footer." They live in separate parts:
- `word/footnotes.xml`
- `word/endnotes.xml`

And the body refers to them using references:
- `w:footnoteReference w:id="N"`
- `w:endnoteReference w:id="N"`

The note parts also contain required separators (`w:id=-1` and `w:id=0`).

## Audit
Use the reporter to see what a doc contains:
```bash
python scripts/footnotes_report.py input.docx
```

## Insert a note (minimal helper)
This repo includes `insert_note.py` which patches OOXML to insert a note.

1. Add a marker into the document where you want the reference:
- `[[FN]]` for a footnote
- `[[EN]]` for an endnote

2. Insert the note:
```bash
python scripts/insert_note.py input.docx --kind footnote --marker "[[FN]]" --text "Footnote text" --out with_fn.docx
python scripts/insert_note.py input.docx --kind endnote  --marker "[[EN]]" --text "Endnote text"  --out with_en.docx
```

3. Render → PNG review:
```bash
python render_docx.py with_fn.docx --output_dir out_fn
```

## Render → PNG review checklist
- Footnote/endnote marker appears in the body where expected
- Footnote text appears at page bottom (footnotes) or note section (endnotes)
- Numbering is correct (no duplicates, starts at 1)
- Long notes wrap nicely (no overlap/clipping)

## Pitfalls
- Some consumers are strict about separator entries in footnotes.xml/endnotes.xml.
- If the marker appears but note text doesn't, run `footnotes_report.py` to confirm:
  - reference IDs exist in `document.xml`
  - note IDs exist in `footnotes.xml`/`endnotes.xml`
- For high-stakes deliverables, verify in Microsoft Word in addition to LO rendering.
