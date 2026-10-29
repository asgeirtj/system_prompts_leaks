# Privacy Scrub (Remove Personal Metadata)

## Goal
Produce a `.docx` suitable for external sharing by removing common personal /  
machine metadata:
- Core properties: creator, lastModifiedBy
- Custom properties: docProps/custom.xml (if present)
- Word revision session IDs (rsid* attributes) in story parts

This does **not** remove semantic content (text/images) and does not redact PII in the content. For content redaction, use `redact_docx.py`.

## Scrub a doc
```bash
python scripts/privacy_scrub.py input.docx --out scrubbed.docx
```

## Verify
```bash
python render_docx.py scrubbed.docx --output_dir out_scrubbed
```

## Pitfalls
- Some viewers may cache author info outside the file; always check the resulting `docProps/core.xml` if this is high-stakes.
- If you need to keep custom properties (e.g., templates), do not run this.
