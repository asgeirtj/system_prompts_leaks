# Working with existing PDFs

- This guide covers PDFs the user already has, such as uploads under `~/workspace/your_files/` or attachments. A new PDF is still authored as HTML and rendered through the [PDF workflow](workflow.md).

- Poppler is installed.

## Pick the tool for the task

- Read text with `muse.read`, which opens a PDF as paged Markdown. Use `pdftotext -bbox-layout` only when you need per-word coordinates as XML.

- Look at pages with `pdftoppm -png -r 150 file.pdf page`, then read the images. `-f N -l M` bounds the page range and `-r 300` suits fine print.

- List embedded images with `pdfimages -list file.pdf` and extract them with `pdfimages -all file.pdf out/img`.

- Merge documents with `pdfunite a.pdf b.pdf out.pdf`.

- Split into pages or extract a range with `pdfseparate -f 2 -l 5 file.pdf page-%d.pdf`, then `pdfunite` the pages you keep.

- Fill a form, stamp an overlay, crop or decrypt with a known password through `pypdf`.

- Extracted text never proves layout. For anything visual, such as alignment, what sits next to what or whether a value landed in its box, read rendered page images.

## Inspect a form before filling it

- First find out whether the PDF has real fillable (AcroForm) fields. Inspect both representations: the canonical `/AcroForm/Fields` tree and each page's `/Widget` annotations, following `/Parent` and `/Kids`.

- A widget can paint a value from its appearance stream while the canonical field is missing or stale, so a clean render alone never proves a fill.

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

## Fill fillable fields

- Keep the result interactive by default. Flatten only when the user explicitly asks for a completed static form, and never flatten a signed PDF without an explicit decision. Preserve the source PDF, and keep the unflattened copy when the user may revise the form.

- Inspect each field's type and states before writing:
  - A text field takes a string.
  - A checkbox takes its own checked export value. Read the field's states: `/Off` is unchecked and the other state, often `/Yes` or `/On`, checks it.
  - A radio group takes one of its options' export values.

- Call `reattach_fields()` only when an expected field is missing from `get_fields()` and inspection confirms a genuinely orphaned widget. Its orphan test is "a widget carrying `/FT` that is not in the top-level `/Fields` array", and it does not follow `/Kids`. On a well-formed form it therefore appends properly parented kid widgets, such as every radio kid, to the root `/Fields`, and value checks alone will not catch the broken tree.

- If a widget and a canonical field share a name but are distinct objects with no `/Parent` relationship, reattach neither. Report the ambiguity or deliver a flattened static result instead.

- Two `pypdf` limitations affect flattening. Radio-group kids share one flattened appearance name (`/Fm_<field>`), so a flattened group paints every option with the first kid's look and silently loses the selection. The pre-paint walk also crashes on a `/Btn` widget with no `/AP`, which is legal when the form shipped `NeedAppearances`.

- Flatten only forms with no radio groups whose buttons all carry `/AP`. Otherwise deliver the interactive fill and say why.

```python
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject

writer = PdfWriter()
writer.clone_document_from_reader(PdfReader(input_pdf))
fields = writer.get_fields() or {}
missing = set(expected_values) - set(fields)
if missing:
    raise ValueError(f"fields missing; inspect the field tree before repair: {sorted(missing)}")

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

## Verify the saved output

- Check the reopened output file, not the writer.

- For an interactive result, confirm that:
  - every expected field is in `get_fields()` with the expected `/V`
  - every page widget's effective value, its own `/V` or its `/Parent`'s, agrees
  - each updated widget has a non-empty `/AP` `/N` appearance
  - no root `/Fields` entry carries `/Parent`, which would mean a kid widget was promoted to the root

- Then rasterize and read every page for stale or clipped appearances. Neither `/NeedAppearances` nor a clean page image proves the field data changed. The reopened field tree does.

- For a flattened result, confirm that no `/Widget` annotations and no `/AcroForm` field tree remain, and that every value, radio selections above all, shows on the rendered pages.

## Fill a form without fields

- Place a text overlay on the existing page:
  - Locate each blank. `pdftotext -bbox-layout` gives every label's exact coordinates in PDF points with the origin at the top left. The entry area starts where the label ends and runs to the next label or rule.
  - For a scanned PDF with no text layer, rasterize at high resolution and read the images, cropping tight regions (`gm convert page.png -crop WxH+X+Y out.png`) to pin down positions. Convert pixels back to points by the ratio of page size to image size.
  - Build a transparent overlay: one HTML page per filled page, sized exactly to the PDF page, with each value absolutely positioned. Render it through the normal PDF pipeline.
  - Stamp it with `pypdf` by calling `page.merge_page(overlay_page)` for each page, then write the file.
  - Rasterize the output and read every page. Text on the wrong line or over a label means the coordinates need fixing, not the approach.

- Do not guess unknown answers onto a form. Fill what the request supplies and leave the rest blank.

## Handle encrypted or damaged files

- `PdfReader.is_encrypted` and `reader.decrypt(password)` handle a file whose password the user supplied. Never try to bypass a password the user does not have.

- If Poppler tools reject a file as damaged, say so and ask for a re-export rather than repairing the binary by hand.

## Check the result

- Rasterize every produced or modified PDF with `pdftoppm` and read each page image before returning a link, following the [artifact verification guide](/opt/muse/assets/artifacts/references/verification.md).
