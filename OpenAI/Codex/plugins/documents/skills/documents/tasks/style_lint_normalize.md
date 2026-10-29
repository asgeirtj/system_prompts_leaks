# Task: Style lint + normalize (format consistency)

## When to use
Use this when the user asks for:
- "Make formatting consistent"
- "Apply our style guide"
- "Remove random bold/Calibri/spacing changes"
- "Why do headings look inconsistent?"

This bundle provides:
- `scripts/style_lint.py` — report likely inconsistencies
- `scripts/style_normalize.py` — conservative cleanup (optional)

## The reliable workflow
1. **Render to PNGs** (baseline) and inspect a few problem areas.
2. Run the **lint** to see what is causing drift.
3. Apply **normalization** only if it matches the user's intent.
4. **Re-render and inspect all pages**.

## 1) Lint
```bash
python scripts/style_lint.py input.docx --json /mnt/data/style_report.json
```
What to look for:
- Lots of `run_direct_formatting`: common cause of "why is this one different".
- Multiple fonts/sizes in `Normal` body text.
- "Heading-like" paragraphs that are not actually Heading styles.

## 2) Normalize (conservative)
`style_normalize.py` always clears **run-level** direct formatting overrides (bold/italic/underline/font/size/color) so styles drive appearance.

### A) Default normalization (recommended starting point)
```bash
python scripts/style_normalize.py input.docx out_normalized.docx
```


> Tip: `style_normalize.py` also accepts `--out` as an alias:
> ```bash
> python scripts/style_normalize.py input.docx --out out_normalized.docx
> ```

### B) Also clear paragraph-level overrides (use sparingly)
This can change layout. Use only when the user wants style-driven spacing/indents:
```bash
python scripts/style_normalize.py input.docx out_normalized.docx --clear_paragraph_format
```

### C) Enforce a simple heading spacing rule
Useful when headings are visually inconsistent (space-after drift):
```bash
python scripts/style_normalize.py input.docx out_normalized.docx --enforce_heading_spacing
```

## Visual QA gate
```bash
python render_docx.py out_normalized.docx --output_dir /mnt/data/out_norm
```
Success criteria:
- No clipped/overlapping text
- Headings and body text are consistent
- Tables remain aligned

## Pitfalls / gotchas
- **Clearing run overrides can remove intentional emphasis.** If the user wants to keep bold/italic emphasis, don't normalize globally; instead normalize only certain styles/sections.
- Some docs intentionally mix fonts (e.g., code blocks). Consider whitelisting styles rather than global clearing.

## Deliverables
- Deliver **only the final DOCX** requested by the user.
- PNGs / optional PDFs are internal QA only unless explicitly requested.
