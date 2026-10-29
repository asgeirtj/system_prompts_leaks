# Restrict Editing / Make Read-Only (Document Protection)

## Goal
Set Word's **document protection** flags in `settings.xml` so a `.docx` opens as:
- read-only, or
- comments-only, or
- tracked-changes-only, or
- forms-only

This is useful for:
- shipping a template that should not be casually modified
- forcing reviewers to comment instead of edit

## Set protection mode
```bash
python scripts/set_protection.py input.docx --mode readOnly --out protected.docx
python scripts/set_protection.py input.docx --mode comments --out comments_only.docx
python scripts/set_protection.py input.docx --mode trackedChanges --out tc_only.docx
python scripts/set_protection.py input.docx --mode forms --out forms_only.docx
```

## Remove protection
```bash
python scripts/set_protection.py input.docx --mode off --out unprotected.docx
```

## Verification
Render to PNGs (layout should be unchanged):
```bash
python render_docx.py protected.docx --output_dir out_protected
```

## Pitfalls
- Protection is enforced by Word; some viewers may ignore it.
- Password protection is intentionally not implemented (high complexity, low ROI).
- Some docs may not have `word/settings.xml`; this helper creates it.
