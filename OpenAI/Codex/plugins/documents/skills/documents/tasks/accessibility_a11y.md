# Accessibility (A11y) Audit + Quick Fixes

## Goal
Given a `.docx`, produce an **accessibility audit report** and (optionally) apply **safe, mechanical fixes** that reduce common A11y failures.

This is **not** a full WCAG compliance engine. It targets the highest-ROI checks you can do reliably in OOXML:
- Heading hierarchy (no skipping levels)
- Images missing alt text (`descr`)
- Tables missing a header row flag
- Hyperlink text that is non-descriptive ("click here", raw URLs)

## Audit
```bash
python scripts/a11y_audit.py input.docx
```

This prints a JSON-ish report to stdout and exits non-zero if **high severity** issues exist.

To write the report to a file instead:
```bash
python scripts/a11y_audit.py input.docx --out_json a11y_report.json
```

## Apply quick fixes (optional)
### 1) Fill missing image alt text using filenames
This is a pragmatic baseline that is better than empty alt text.
```bash
python scripts/a11y_audit.py input.docx --fix_image_alt from_filename --out a11y_fixed.docx
```

### 2) Mark first row as a table header
Only do this when the first row *is actually* a header.
```bash
python scripts/a11y_audit.py input.docx --fix_table_headers first_row --out a11y_fixed.docx
```

You can combine fixes:
```bash
python scripts/a11y_audit.py input.docx \
  --fix_image_alt from_filename \
  --fix_table_headers first_row \
  --out a11y_fixed.docx
```

## Verification loop
1) Apply fixes (if any)
2) **Render → inspect PNGs** to confirm nothing drifted visually:
```bash
python render_docx.py a11y_fixed.docx --output_dir out_a11y
```

## Pitfalls
- "Fixing" headings is rarely mechanical; it usually requires editorial judgement. This tool **reports** heading issues but does not rewrite styles.
- Setting table header flags can change repeated header rendering across page breaks. Always re-render and review.
- Alt text generated from filenames is a baseline; replace it with meaningful descriptions for real accessibility.
