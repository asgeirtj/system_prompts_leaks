# Merge DOCXs (Append Body Content)

## Goal
Append the body content of one `.docx` to another **while preserving OOXML fidelity** better than text-only copying.

This helper is intentionally scoped:
- **Preserves** paragraphs, runs, tables, numbering, and most formatting *inside the body*.
- **Does not** merge headers/footers/section settings across documents (it keeps the base document's section settings).
- **Does not** copy relationships for images/objects by default (safe). You can enable a looser mode if you know both docs are text-only.

## Append doc B to doc A
```bash
python scripts/merge_docx_append.py base.docx append.docx --out merged.docx
```

## Allow drawings/images (optional, less safe)
If you know both documents have compatible relationships and you are okay with best-effort behavior:
```bash
python scripts/merge_docx_append.py base.docx append.docx --out merged.docx --allow_drawings
```

## Verify
Always render and inspect:
```bash
python render_docx.py merged.docx --output_dir out_merged
```

## Pitfalls
- If `append.docx` contains images or embedded objects, merging body XML alone is **not sufficient** unless you also merge relationships and binary parts. This script defaults to **refusing** drawings unless `--allow_drawings` is set.
- If styles/numbers in `append.docx` rely on definitions absent from `base.docx`, Word may substitute defaults.
- If either document contains tracked changes or comments, merge first *then* run the tracked-changes / comments tasks.
