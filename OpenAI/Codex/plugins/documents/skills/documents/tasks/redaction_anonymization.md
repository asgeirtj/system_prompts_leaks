# Task: Redaction / anonymization (layout-preserving)

## When to use
Use this when the user wants to remove or anonymize sensitive information while keeping the document usable and visually stable:
- remove emails, names, IDs
- anonymize customer/company names
- produce a shareable version of a report

This bundle provides `scripts/redact_docx.py`, which redacts by editing OOXML text nodes while attempting to preserve layout:
- default mode replaces matches with a fixed-length mask (`█` repeated), so line breaks and pagination drift less

## Golden path
1. Create a copy of the input DOCX (don't mutate the only copy).
2. Run `redact_docx.py` with carefully scoped patterns.
3. Render to PNGs and inspect the redacted areas.
4. Ensure no sensitive info remains (spot-check and use text search).

## Run it
### Mask common patterns (examples)
```bash
python scripts/redact_docx.py /mnt/data/input.docx \
  --output /mnt/data/redacted.docx \
  --pattern "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}" \
  --pattern "\b\d{3}[-. ]\d{3}[-. ]\d{4}\b"
```

### Replace with a stable token (length-preserving)
If you want a visible label but still preserve length, repeat/truncate the label to the match length:
```bash
python scripts/redact_docx.py /mnt/data/input.docx \
  --output /mnt/data/redacted.docx \
  --pattern "Acme Corp" \
  --replacement "[REDACTED]" \
  --preserve_length
```

### Include comments (optional)
```bash
python scripts/redact_docx.py /mnt/data/input.docx \
  --output /mnt/data/redacted.docx \
  --pattern "secret" \
  --include_comments
```

## Pitfalls (learned the hard way)
- **Regex too broad:** you can accidentally redact normal prose. Prefer specific patterns.
- **Matches spanning paragraphs:** this tool only redacts *within a single paragraph* (`w:p`). Keep patterns local.
- **Non-text content:** images of text, embedded objects, charts, and tracked changes deletions may contain sensitive info. Masking text nodes won't remove those.

## QA checklist
- Render and visually inspect pages that contain redactions.
- Use a text-search pass to confirm strings are gone.
- Confirm headers/footers and footnotes/endnotes were redacted (this script patches them by default).

## Deliverables
- Deliver **only the final DOCX** requested by the user.
- PNGs / optional PDFs are internal QA only unless explicitly requested.
