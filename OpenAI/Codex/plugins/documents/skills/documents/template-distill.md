# Distill a DOCX template

Use this workflow only when a retained reference DOCX or an attached DOCX is
intended to control a new document's structure and appearance. Do not use it
for document review, content extraction, or a narrow edit to the reference.

The retained DOCX stays unchanged and authoritative. Write one task-local
`$TMP_DIR/artifact.md` as the execution contract used alongside the reference.

## Inputs

Load the workspace dependency runtime and set `PYTHON_BIN` to its Python path.
Prepend that interpreter's directory to `PATH` because packaged helpers may
spawn `python`. Set `SKILL_DIR` to this skill directory, `TMP_DIR` to a writable
task-specific temporary directory, and `REFERENCE_DOCX` to the absolute
retained reference path. Create `TMP_DIR` if needed.

## Inspect the reference

1. Render every page and inspect it at 100% zoom:

   ```bash
   "$PYTHON_BIN" "$SKILL_DIR/render_docx.py" "$REFERENCE_DOCX" \
     --output_dir "$TMP_DIR/template-reference-render"
   ```

2. Capture section and style evidence without modifying the reference:

   ```bash
   "$PYTHON_BIN" "$SKILL_DIR/scripts/section_audit.py" "$REFERENCE_DOCX"
   "$PYTHON_BIN" "$SKILL_DIR/scripts/style_lint.py" "$REFERENCE_DOCX" \
     --json "$TMP_DIR/template-style-evidence.json"
   ```

   Run the packaged heading, image, field, footnote, and content-control audits  
   too when the reference contains those features. Inventory content controls  
   by tag with  
   `"$PYTHON_BIN" "$SKILL_DIR/scripts/content_controls.py" "$REFERENCE_DOCX" list --json`.

3. Inspect the DOCX package read-only when rendered or high-level evidence is
   insufficient. Check the relevant styles, theme, numbering, section,
   header/footer, relationship, drawing, and table XML. Do not rewrite the
   package during distillation.

4. Review every distinct section and page pattern. A first-page sample is not
   enough when later pages, landscape sections, tables, headers, or footers use
   different rules.

## Write `artifact.md`

Record only evidence needed to recreate the document:

- **Reference:** absolute retained DOCX path, SHA-256, page count, section count,
  and the render/evidence paths used.
- **Page system:** exact page sizes, orientation, margins, columns,
  header/footer distances, first/odd/even-page behavior, and section breaks.
- **Typography:** named paragraph roles and exact font family, size, color,
  weight, capitalization, alignment, spacing, line spacing, keep behavior,
  indents, tabs, borders, and rules.
- **Lists and tables:** numbering definitions, nesting, marker and hanging
  indents, table widths, column grids, cell margins, fills, borders, row rules,
  alignment, and repeating headers.
- **Components:** title blocks, metadata, callouts, figures, captions, quotes,
  headers, footers, page numbers, recurring rules, and image treatment.
- **Content flow:** ordered sections and the purpose and density of each.
- **Slot map:** each editable source location, its semantic purpose, allowed
  content, capacity, and whether it must be rewritten, preserved, or removed.
- **Text coverage:** inspect body paragraphs, table cells, headers, footers,
  text boxes, fields, and content controls. `Document.paragraphs` alone is not a
  complete DOCX slot inventory.
- **Stable locators:** identify slots by package part plus structural path,
  style, bookmark, content-control tag, or relationship ID; do not rely on
  copied prose alone.
- **Package preservation:** a path, size, and SHA-256 inventory of package parts
  and relationships, classifying `customXml`, styles, numbering, headers,
  footers, drawings, comments, controls, and other opaque parts as editable or
  preserve-only.
- **Fidelity gates:** source features that must remain unchanged and the visual
  comparisons required before delivery.

Do not paste the full source text or broad labels such as "professional." Use
exact measurements and roles. If an important value cannot be established,
mark it unresolved rather than inventing it.

## Distillation gate

Do not continue until `artifact.md` accounts for every distinct page/section
pattern, every recurring element, and every intended edit slot. The retained
DOCX must still exist at the recorded path and remain byte-for-byte unchanged.
