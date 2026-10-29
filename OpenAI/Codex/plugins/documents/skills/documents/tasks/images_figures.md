# Task: Images/figures placement + anchoring pitfalls

## Goal
Keep images and captions where you expect across Word/LibreOffice/PDF exports.

## Key reality
Image placement is the #1 LO-vs-Word mismatch.

## Inline vs floating
- **Inline** (`wp:inline`): behaves like a big character in the text flow. Most reliable for automation.
- **Floating/anchored** (`wp:anchor`): supports text wrapping, precise positioning, and "keep with paragraph" effects — also most likely to render differently between apps.

## Recommendations
1. Prefer **inline** images for automation unless you truly need wrap-around.
2. Use high-resolution sources and let Word scale down (avoid scaling up low-DPI images).
3. Keep a caption in a separate paragraph immediately after the image.

## Audit
```bash
python scripts/images_audit.py /mnt/data/input.docx
```

If you see `anchor` rows, treat as high-risk and inspect renders closely.

## Render → PNG review checklist (images)
- Images appear on the intended page(s)
- No overlap with text, tables, or margins
- Captions remain adjacent to their figures
- Images aren't blurry/pixelated (zoom to 200% to check)
- No unexpected cropping/stretching

## Common pitfalls
- Floating images shifting pages after small text edits
- Wrap modes causing overlap in LibreOffice exports
- Copy/pasted images with huge DPI metadata leading to surprising sizes
