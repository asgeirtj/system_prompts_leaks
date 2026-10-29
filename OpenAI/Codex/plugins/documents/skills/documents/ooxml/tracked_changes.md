# OOXML: Tracked changes (true redlines)

## When to use
Use OOXML patching when the user needs *real* Word tracked changes, i.e. redlines that appear as insertions/deletions in Word.

`python-docx` does **not** provide a first-class API for tracked changes.

## Minimum wiring
Tracked changes typically involve:
- `word/settings.xml`: add `<w:trackRevisions/>` to enable tracking mode
- `word/document.xml`: wrap inserted runs with `<w:ins ...>` and deletions with `<w:del ...>`

## Key rules (to avoid broken docs)
- IDs: `w:id` should be an integer string and **must not collide** with existing ids in the document
- `w:author` and `w:date` are strongly recommended
- Deletions must use `<w:delText>` (not `<w:t>`) inside `<w:del>`
- Word can split text into many runs; operate at run granularity

## Example pattern: replace a word via tracked delete + tracked insert
Pseudo-structure:

```xml
<w:del w:id="202" w:author="ChatGPT" w:date="...">
  <w:r><w:delText> old text </w:delText></w:r>
</w:del>
<w:ins w:id="203" w:author="ChatGPT" w:date="...">
  <w:r><w:t> new text </w:t></w:r>
</w:ins>
```

## Recommended: use the helper script
See `scripts/docx_ooxml_patch.py` for a runnable patcher that:
- enables `<w:trackRevisions/>`
- converts an existing `<w:ins>` to `<w:del>` and inserts a new `<w:ins>`

The CLI defaults to auto-generated `w:id` values (`--del-id auto --ins-id auto`) by scanning existing ids and choosing new ones.

## Verification
- Render to PDF/PNG for layout sanity (`tasks/verify_render.md`)
- Confirm Word shows the change as tracked
- Be aware: renders usually show redlines, but always verify the OOXML is correct too
