# Troubleshooting: run splitting ("why isn't my replace working?")

## Reality
Word splits text into runs unpredictably (style changes, proofing boundaries, fields, etc.).  
So searching for a substring and replacing it "as text" often fails.

## Practical strategies
- Work at the `<w:r>` / `<w:t>` level, not the paragraph text level.
- When you must replace a token, consider inserting a hidden marker run first (during `python-docx` authoring) so you can reliably locate the target later when patching OOXML.
- For tracked changes replacements, wrap **exact runs** you want deleted as `<w:del>`, then insert new `<w:ins>` adjacent.

## Helper script
`scripts/docx_ooxml_patch.py` contains utilities that:
- find paragraphs by simple predicates (e.g., indentation)
- replace the Nth tracked insertion inside a paragraph
