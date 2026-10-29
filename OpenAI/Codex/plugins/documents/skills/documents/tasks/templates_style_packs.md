# Templates / Style Packs (DOTX) — apply consistent styles

## Goal
Apply a `.dotx` (or template `.docx`) style pack onto an existing report to improve professionalism and reduce bespoke styling.

## Key idea
A Word template is mostly:
- `word/styles.xml` (style definitions)
- `word/theme/theme1.xml` (colors/fonts)
- optional: `word/fontTable.xml`, `word/numbering.xml`

Direct formatting (manual bold/size/etc. on runs) can override style packs and cause inconsistent results.

## Steps
1. Apply the template parts to your doc:
   ```bash
   python scripts/apply_template_styles.py --template template.dotx --target report.docx --out report_styled.docx
   ```

2. Render and review:
   ```bash
   python render_docx.py report_styled.docx --output_dir out_styled
   ```

## Render → PNG review checklist
- Typography looks consistent (headings/body)
- Spacing and margins still acceptable
- Tables didn't reflow in a way that breaks readability
- Page count changes are acceptable

## Pitfalls
- Style packs can change pagination. That's expected.
- If the report contains heavy direct formatting, consider normalizing by re-applying paragraph styles (Heading 1/2/3, Normal) before applying the template.
- Custom style IDs in the target may be overwritten.
