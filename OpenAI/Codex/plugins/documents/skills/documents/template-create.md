# Create a document from a distilled template

Use this workflow with the retained DOCX, `$TMP_DIR/artifact.md`, and the user's
content. If `artifact.md` is missing, unresolved, or describes another
reference, run `template-distill.md` first.

Before running commands, set `SKILL_DIR`, `TMP_DIR`, and `REFERENCE_DOCX` as in
`template-distill.md`, and set `FINAL_DOCX` to an absolute output path different
from `REFERENCE_DOCX`.

Verify the retained DOCX against the path and SHA-256 recorded in
`artifact.md` before editing. A mismatch requires fresh distillation.

Explicit user changes take precedence. Otherwise the retained DOCX controls
layout and formatting, and `artifact.md` explains how to use it. Generic
document presets do not replace the template's visual system.

## Build from the reference

1. Make a working copy of the retained DOCX. Do not start from a blank
   document, apply a generic style pack, or alter the retained file.
2. Map each supported piece of user content to an editable slot in
   `artifact.md`. Leave unsupported optional slots empty or remove them only
   when the slot contract permits it; never invent facts to fill space.
3. Edit the copied source elements in place. Preserve untouched sections,
   styles, numbering, relationships, headers, footers, images, tables, and
   page furniture.
4. Reuse the source's real styles and components. When content exceeds a slot,
   shorten it, use another documented source pattern, or add a cloned pattern
   that `artifact.md` permits. Do not silently shrink text or overlay a second
   design system.
5. For an existing text or relationship-backed slot, prefer a task-local
   package patch built on `scripts/docx_ooxml_patch.py`; this preserves untouched
   package parts byte-for-byte. Use `python-docx` only when the planned edit
   needs its object model and the preserve-only package comparison still passes.
   Do not rebuild unaffected package parts.
6. Use `scripts/content_controls.py list` to locate content controls, but do not
   use its `fill` command in template-following mode because it reconstructs the
   control content. For a verified plain-text control, use a task-local package
   patch that changes only the intended text nodes while preserving the
   existing control, paragraph, run properties, bookmarks, and every untouched
   package part byte-for-byte. Preserve rich-text, repeating-section, image,
   and table controls; if the intended edit requires changing their structure
   or a plain-text control cannot be patched without rebuilding it, stop and
   report the fidelity blocker. If the field inventory contains `TOC`, `REF`,
   `PAGEREF`, `PAGE`, or `NUMPAGES`, follow `tasks/fields_update.md`. Refresh
   fields in Word when available. Do not use a headless LibreOffice save as the
   refresh step in template-following mode because it can rewrite or remove
   unrelated package parts. If Word refresh is unavailable, set
   `w:updateFields` to `true` through a settings-only package patch and record
   that cached field text will refresh when the document opens in Word.

## Verify fidelity

Set `QA_RUN_DIR` to a new path that has never been used by a prior iteration,
such as `$TMP_DIR/template-fidelity-diff-$ITERATION`. Produce a reference/final
diff, then inspect every final page under its `b_render` directory at 100% zoom:

```bash
"$PYTHON_BIN" "$SKILL_DIR/scripts/render_and_diff.py" \
  "$REFERENCE_DOCX" "$FINAL_DOCX" \
  --outdir "$QA_RUN_DIR"
```

Content changes will produce expected pixel differences. Treat the diff as a
scope check: unexplained movement outside intended slots, changed page
geometry, altered recurring chrome, or unexpected pagination is a failure.

Before delivery, confirm:

- rerun the section/style audits and every feature-specific audit used during
  distillation, then compare the preserve-only structures recorded in  
  `artifact.md`;
- compare the final package-part inventory with the baseline and fail if any
  preserve-only part or relationship changed or disappeared;
- section count and page geometry still match the contract unless explicitly  
  changed;
- typography, paragraph rhythm, lists, tables, headers, footers, page numbers,
  images, and recurring components remain recognizably source-derived;
- every intended slot is filled, intentionally blank, or intentionally  
  removed;
- no text clips, overlaps, wraps unexpectedly, or leaves a broken page/table;
- refreshed TOC, reference, page, and page-count fields agree with the final
  document when Word refresh is available; otherwise `w:updateFields` is set and
  the deferred refresh is recorded;
- every deviation from `artifact.md` follows an explicit user request;
- the retained DOCX still matches the SHA-256 recorded before authoring.

The image diff is not sufficient by itself: fields, relationships, bookmarks,
comments, content controls, numbering, and drawing anchors can regress without
changing a rendered page. Any unexplained structural loss is a failure.

Revise and rerender until both document correctness and visual fidelity pass.
