# Task: Forms / content controls (SDTs)

## When to use
Use this when the user wants a **fillable DOCX template** (fields, dropdowns, checkboxes) or when you need to **populate** an existing template that contains Word content controls.

`python-docx` does not support SDTs. Use the helper script:
- `scripts/content_controls.py`

This task doc focuses on **plain-text SDTs** (the most common case for templates).

## Golden path
1. **Make placeholders visible (authoring step)**
   - Write placeholders like `{{NAME}}`, `{{DATE}}`, `{{EMAIL}}` in the DOCX where values should go.
   - If you control authoring, keep each placeholder contiguous (a single token).

2. **Wrap placeholders into SDTs**
```bash
python scripts/content_controls.py /mnt/data/template.docx wrap_placeholders \
  --output /mnt/data/template_sdt.docx
```

3. **Populate SDTs by tag**
```bash
python scripts/content_controls.py /mnt/data/template_sdt.docx fill \
  --set NAME="Ada Lovelace" \
  --set EMAIL="ada@example.com" \
  --output /mnt/data/filled.docx
```

4. **Render for QA**
```bash
python render_docx.py /mnt/data/filled.docx --output_dir /mnt/data/out_forms
```

Inspect `page-<N>.png` at 100% zoom.

## Listing / debugging
List all SDTs (tag, alias, visible text, part location):
```bash
python scripts/content_controls.py /mnt/data/template_sdt.docx list --json
```

## Pitfalls / lessons learned
- **Markers split across runs:** if Word splits `{{NAME}}` into multiple runs (common when styling is applied mid-token), the wrapper may miss it. Fix by retyping the placeholder so it is one contiguous token.
- **SDTs in footnotes/comments:** this helper patches document.xml + headers/footers. If a template uses SDTs in other parts, you may need a custom patch.
- **Rich content controls** (dropdown, checkbox, date picker): those require additional SDT properties/parts. This bundle does not attempt full fidelity.

## Deliverables
- Deliver **only the final DOCX** requested by the user.
- PNGs / optional PDFs are for internal QA only unless explicitly requested.
