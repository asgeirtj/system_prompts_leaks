# Task: Captions + cross-references (SEQ + REF)

## When to use
Use this when the user wants:
- **Figure/Table captions** ("Figure 1", "Table 2"…)
- **Cross-references** ("see Figure 3")
- **Stable numbering** for headless rendering/QA

Word implements captions/cross-references using fields:
- `SEQ` for numbering (e.g., `SEQ Table` / `SEQ Figure`)
- `REF` to reference a bookmark (cross-reference target)

`python-docx` does not provide a high-level API for these fields, so this bundle uses OOXML-level helpers:
- `scripts/captions_and_crossrefs.py` — insert caption paragraphs + optional bookmarks around the caption number
- `scripts/insert_ref_fields.py` — replace `[[REF:bookmark]]` markers with real `REF` fields
- `scripts/fields_materialize.py` — materialize `SEQ/REF` *display text* so headless renders show the correct numbers

## The practical gotcha
Fields **do not reliably update** in headless environments. If you only insert field codes (`SEQ`/`REF`), the rendered number may be blank or stale.

For deterministic automation / QA, the reliable pattern is:
1) insert field codes, then
2) **materialize** the field display text

A human can still open the document later and update fields, but for automation you want deterministic visuals.

---

## Workflow

### 1) Add captions (and bookmarks)
This adds captions for tables and/or figures that don't already have a `Caption` paragraph immediately after them.

```bash
python scripts/captions_and_crossrefs.py \
  /mnt/data/in.docx \
  /mnt/data/with_captions.docx \
  --tables --figures \
  --caption_text "Caption" \
  --bookmarks
```

What it does:
- Inserts a `Caption`-styled paragraph after each table / figure paragraph.
- Uses a `SEQ Table` / `SEQ Figure` field for numbering.
- If `--bookmarks` is set, wraps the *caption number* in a bookmark:
  - tables: `tbl1`, `tbl2`, …
  - figures: `fig1`, `fig2`, …

### 2) Insert cross-references (REF)
**Authoring trick:** put explicit markers into the doc where you want a cross-ref, e.g.
- `See [[REF:tbl1]] for details.`
- `As shown in [[REF:fig1]] …`

Then replace markers with real `REF` fields:

```bash
python scripts/insert_ref_fields.py \
  /mnt/data/with_captions.docx \
  /mnt/data/with_refs.docx
```

Notes:
- This script replaces markers in `document.xml` and headers/footers.
- Multiple `[[REF:...]]` markers inside a single text run are supported.
- **Limitation:** the marker must be fully contained in a single text run (`<w:t>`). If Word split the marker across runs, retype it as a single contiguous token.

### 3) Materialize (freeze) SEQ/REF results for deterministic renders
```bash
python scripts/fields_materialize.py \
  /mnt/data/with_refs.docx \
  --out /mnt/data/with_refs_materialized.docx
```

Implementation note: `fields_materialize.py` materializes `SEQ` values before `REF` values so cross-references see the updated caption numbers.

If you only want to materialize one type:
```bash
python scripts/fields_materialize.py /mnt/data/with_refs.docx --out /mnt/data/out.docx --only REF
```

### 4) Render and visually QA
```bash
python render_docx.py /mnt/data/with_refs_materialized.docx --output_dir /mnt/data/out_caps
```
Inspect the PNGs.

---

## Pitfalls / tips
- **Caption style availability:** if the document doesn't define a `Caption` style, captions may appear as Normal text. If the user cares, apply a template/style pack first.
- **Figures detection:** this script treats paragraphs containing a `<w:drawing>`/`<w:pict>` as a "figure paragraph".
- **Edits after materializing:** if you insert/remove figures/tables later, re-run `fields_materialize.py` to recompute numbering.

## Deliverables
- Deliver **only the final DOCX** requested by the user.
- PNGs / optional PDFs are internal QA only unless explicitly requested.
