# Accept / Reject Tracked Changes (produce a clean DOCX)

## Goal
Given a `.docx` with tracked changes (redlines), produce a **final clean** copy with changes accepted (or rejected), and verify visually.

## What tracked changes are (OOXML)
Tracked changes are usually wrappers in `word/document.xml`:
- `w:ins` — inserted content
- `w:del` — deleted content
- sometimes: `w:moveTo` / `w:moveFrom` for moved text

Many "looks wrong" reports come from:
- leaving revisions in place (Word shows redlines; LO export may hide/show inconsistently)
- stale renders (you didn't re-render after patching)

## Steps
1. **Inspect** how many revisions exist:
   ```bash
   python scripts/accept_tracked_changes.py input.docx --mode report
   ```
2. **Accept** all tracked changes into a clean copy:
   ```bash
   python scripts/accept_tracked_changes.py input.docx --mode accept --out accepted.docx
   ```
   (Or reject):
   ```bash
   python scripts/accept_tracked_changes.py input.docx --mode reject --out rejected.docx
   ```
3. **Render → PNG review** (required):
   ```bash
   python render_docx.py accepted.docx --output_dir out_accept
   ```

## Render → PNG review checklist
Open all `out_accept/page-*.png` at 100% zoom:
- No redlines/strikethrough remain
- No missing words (especially around the edited region)
- No spacing drift caused by removed wrappers
- Headers/footers still correct

## Pitfalls
- This is a pragmatic helper, not a perfect Word revision engine.
- Always re-run `--mode report` on the output; it should be zero.
- If Word-specific revision constructs remain, fall back to "Open in Word → Accept All → Save As" and re-render.
