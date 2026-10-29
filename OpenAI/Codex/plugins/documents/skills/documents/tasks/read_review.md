# Task: Read / review an existing DOCX

## What to review
- Layout: page breaks, margins, clipping/overlap
- Typography: heading hierarchy, font consistency, line spacing
- Tables/figures: alignment, legibility, truncation
- Redlines: do tracked insertions/deletions show up?
- Comments: do they exist (structurally), even if they don't render?

## Primary method: DOCX → PNG(s) (internally via PDF)

### Preferred: use the packaged renderer
This is the "golden path" because it handles the container-safe LibreOffice profile + HOME automatically and normalizes output names to `page-<N>.png`.

```bash
python render_docx.py /mnt/data/input.docx --output_dir /mnt/data/out
# If debugging LibreOffice:
python render_docx.py /mnt/data/input.docx --output_dir /mnt/data/out --verbose
# Optional: also write <input_stem>.pdf to --output_dir (for debugging/archival):
python render_docx.py /mnt/data/input.docx --output_dir /mnt/data/out --emit_pdf
```

### Manual method (only if debugging)
Use a unique LibreOffice profile + writable HOME (containers are prone to profile permission/locking issues):

```bash
OUTDIR=/mnt/data/out
INPUT=/mnt/data/input.docx
BASENAME=$(basename "$INPUT" .docx)
LO_PROFILE=/mnt/data/.lo_profile_${BASENAME}_$$
mkdir -p "$OUTDIR" "$LO_PROFILE"

HOME="$LO_PROFILE" soffice --headless -env:UserInstallation=file://"$LO_PROFILE" \
  --convert-to pdf --outdir "$OUTDIR" "$INPUT"

# Manual naming: produces "$OUTDIR/$BASENAME-1.png", "$OUTDIR/$BASENAME-2.png", ...
pdftoppm -png "$OUTDIR/$BASENAME.pdf" "$OUTDIR/$BASENAME"
```

### Success criteria
- Page images exist for each page
- Spot-check page count and representative pages

**Note:** LibreOffice sometimes prints scary-looking stderr (e.g., `error : Unknown IO error`) even when output is correct. Prefer file existence + visual inspection over stderr content.

### Visually inspect every page
Focus on:
- clipped/overlapping text
- tables that wrap unexpectedly
- inconsistent fonts/sizes
- misplaced headers/footers

## Notes on redlines vs comments
- **Tracked changes** (insertions/deletions) often show up in PDF renders.
- **Comments frequently do NOT show up in PDF/image renders** (especially via headless LibreOffice).
  - Rendering is not proof of comments.
  - To verify comments, do a structural check (see `ooxml/comments.md`) or use `pandoc --track-changes=all` to confirm comment markup is present.

## If the doc is huge
Render and inspect key pages first (title, TOC, sections with tables, appendices), then spot-check.
