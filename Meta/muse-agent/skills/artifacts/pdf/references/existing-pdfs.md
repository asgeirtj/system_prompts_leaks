# Working with existing PDFs

Reading, reorganizing, and filling PDFs the user already has (uploads under
`~/workspace/your_files/` or attachments). A NEW pdf deliverable is still
authored as HTML and rendered; this reference is for operating on PDF files
that already exist. Poppler ships in the cell; `pypdf` does not, so install
it on demand when a task below names it:  
`pip install --break-system-packages pypdf`.

| Task | Path |
|---|---|
| Read text | `muse.read` opens a PDF directly (converted to markdown, paged); `pdftotext -bbox-layout` only when you need per-word coordinates as XML |
| Look at pages | `pdftoppm -png -r 150 file.pdf page` then read the images; `-f N -l M` bounds the range, `-r 300` for fine print |
| List or extract embedded images | `pdfimages -list file.pdf`; `pdfimages -all file.pdf out/img` |
| Merge documents | `pdfunite a.pdf b.pdf out.pdf` |
| Split into pages / extract a range | `pdfseparate -f 2 -l 5 file.pdf page-%d.pdf`, then `pdfunite` the kept pages |
| Fill a form, stamp an overlay, crop, decrypt with a known password | `pypdf` (install on demand) |

Text extraction never proves layout: for anything visual (alignment,
what sits next to what, whether a value actually landed in a box), look
at rendered page images, not extracted text.

## Filling forms

First find out whether the PDF has real fillable (AcroForm) fields, and
inspect both representations: the canonical `/AcroForm/Fields` tree and
each page's `/Widget` annotations (follow `/Parent` and `/Kids`). A
widget can paint a value from its appearance stream while the canonical
field is missing or holds a stale value, so a clean render alone never
proves a fill.

```python
from pypdf import PdfReader
reader = PdfReader("form.pdf")
fields = reader.get_fields()  # canonical /AcroForm/Fields tree
widgets = [
    annot
    for page in reader.pages
    for annot in (page.get("/Annots") or [])
    if annot.get_object().get("/Subtype") == "/Widget"
]
```

**Fillable fields.** Keep the result interactive by default; flatten only
when the user explicitly asks for a completed static form, and never
flatten a signed PDF without an explicit decision. Preserve the source
PDF, and keep the unflattened copy when the user may revise the form.
Inspect each field's type and states before writing: a text field takes a
string; a checkbox must be set to its own checked export value (read the
field's states; `/Off` is unchecked, the other state, often `/Yes` or
`/On`, checks it); a radio group takes one of its options' export values.

Call `reattach_fields()` only when an expected field is actually missing
from `get_fields()`, never as routine repair: its orphan test is "widget
carrying `/FT` that is not in the TOP-LEVEL `/Fields` array", it never
follows `/Kids`, so on a well-formed form it appends properly parented
kid widgets (every radio kid, for instance) to the root `/Fields`,
shipping a spec-violating tree that value checks alone will not catch.
If a widget and a canonical field share a name but are distinct objects
with no `/Parent` relationship, do not reattach either: report the
ambiguity or deliver a flattened static result instead.

Two verified pypdf flatten edges: radio-group kids share one flattened
appearance name (`/Fm_<field>`), so a flattened radio group paints every
position with the first kid's look and the selection is silently lost;
and the pre-paint walk crashes on a `/Btn` widget with no `/AP` (legal
when the form shipped `NeedAppearances`). Flatten only forms with no
radio groups whose buttons all carry `/AP`; otherwise deliver the
interactive fill and say why.

```python
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject

writer = PdfWriter()
writer.clone_document_from_reader(PdfReader(input_pdf))
fields = writer.get_fields() or {}
if set(expected_values) - set(fields):
    writer.reattach_fields()  # recover genuinely orphaned widgets only
    fields = writer.get_fields() or {}
missing = set(expected_values) - set(fields)
if missing:
    raise ValueError(f"fields not found after repair: {sorted(missing)}")

values = dict(expected_values)
if flatten:
    # Paint every existing value before removing the widgets below.
    values = {
        name: field.get("/V", "/Off" if field.get("/FT") == "/Btn" else "")
        for name, field in fields.items()
    } | expected_values

# auto_regenerate=None leaves the input's NeedAppearances flag alone;
# True/False both overwrite it, and clearing it can stop untouched
# prefilled values from rendering in appearance-strict viewers.
writer.update_page_form_field_values(
    None, values, auto_regenerate=None, flatten=flatten
)
if flatten:
    # flatten=True paints appearances but leaves the widgets in place.
    writer.remove_annotations(subtypes="/Widget")
    writer.root_object.pop(NameObject("/AcroForm"), None)
with open(output_pdf, "wb") as stream:
    writer.write(stream)
```

**Verify on the reopened output, not the writer.** For an interactive
result: every expected field is present in `get_fields()` with the
expected `/V`, every page widget's effective value (its own `/V` or the
inherited `/Parent` one) agrees, each updated widget has a non-empty
`/AP` `/N` appearance, and no root `/Fields` entry carries `/Parent` (a
kid widget promoted to root is the reattach corruption above). Then
rasterize and read every page for stale or clipped appearances. Neither
`/NeedAppearances` nor a clean PNG render proves the logical field data
updated; the reopened field tree does. For a flattened result: zero
`/Widget` annotations and no `/AcroForm` field tree remain, and every
value, radio selections above all, is visible on the rendered pages.

**No fillable fields.** The form is just page content, so place text on
top of it:

1. Locate each blank. `pdftotext -bbox-layout` gives every label's exact
   coordinates (origin top-left, PDF points), and the entry area starts
   where the label ends and runs to the next label or rule. For scanned
   PDFs with no text layer, rasterize at high resolution and read the
   images, cropping tight regions (`gm convert page.png -crop WxH+X+Y
   out.png`) to pin down positions; convert pixels back to points by the
   ratio of page size to image size.
2. Build a transparent overlay: author an HTML page per filled page,
   sized exactly to the PDF page, with each value absolutely positioned;
   render it through the normal pdf pipeline.
3. Stamp with pypdf: `page.merge_page(overlay_page)` for each page, then
   write.
4. Verify by rasterizing the output and reading every page; text sitting
   on the wrong line or overlapping a label means the coordinates, not
   the approach, need fixing.

Do not guess unknown answers onto a form: fill what the request supplies
and leave the rest blank.

## Encrypted or damaged inputs

`PdfReader.is_encrypted` plus `reader.decrypt(password)` handles a file
whose password the user supplied; never attempt to bypass a password the
user does not have. If poppler tools reject a file as damaged, say so and
ask for a re-export rather than hand-repairing the binary.

## Verify

Any produced or modified PDF ends with the render check in
`/opt/hatch/skills/artifacts/testing/SKILL.md`: rasterize with pdftoppm and read
every page image before returning a link.
