# Compare / Diff Two DOCXs (visual + structural)

## Goal
Given two `.docx` files, produce an easy QA bundle:
- renders of both docs (`page-*.png`)
- per-page diff images for changed pages
- a text-level unified diff

This is high-ROI for regression testing and reviewer confidence.

## Steps
1. Run the helper:
   ```bash
   python scripts/render_and_diff.py a.docx b.docx --outdir diff_out
   ```

2. Inspect:
   - `diff_out/a_render/page-*.png`
   - `diff_out/b_render/page-*.png`
   - `diff_out/diff_pages/diff-page-*.png`
   - `diff_out/text_diff.txt`

## Render → PNG review checklist
- Confirm page counts match expectations
- Open **each changed page** in both A and B at 100% zoom
- Verify the visual diff highlights only intended changes
- Spot-check unchanged pages if the edit is layout-sensitive (tables/images/sections)

## Pitfalls
- LO headless rendering can differ from Word; this tool catches visual diffs in *your* render loop, which is what you ship.
- If pagination differs, many pages may show as changed. Use the text diff to confirm content-level changes.
- If you see changes that are *only* anti-aliasing noise, increase render DPI and re-run.
