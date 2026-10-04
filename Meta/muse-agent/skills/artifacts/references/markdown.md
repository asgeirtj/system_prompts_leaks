---
description: Formatting rules for artifact markdown, covering .md deliverables, reports, and content exported to PDF or Word.
builders: file
kinds: markdown, pdf, document
---

# Markdown formatting for artifact files

These rules apply to artifact markdown: `.md` deliverables, reports, and any artifact content
that may be exported to PDF or Word.

**Tables:**
- Cap cell content at ~25 characters. If a cell needs more, abbreviate or move details to a footnote below the table.
- No full sentences in cells. Use short phrases, keywords, or values only.
- No URLs in table cells. Put links in a "Sources" section or footnotes below.
- 3-4 columns max. If you need more, split into multiple tables or use a definition list.
- Right-align numeric columns with `---:` for scannability.

**Lists:**
- One blank line between top-level bullets when each item has a sub-description or is longer than a few words.
- No blank line between sub-bullets; keep them tight under their parent.
- **Bold the lead phrase**, then follow with the description: `**Thing**: explanation here`.
- Max 2 levels of nesting. If you need a third level, restructure into sections with headers.

**Emojis:**
- No emojis in exportable documents (`.md` files intended for PDF/Word conversion). They render as boxes or missing glyphs in most PDF engines.
- Use text markers instead: `**Note:**` for callouts, `-->` for flow, plain `*` bullets, `---` for dividers.
- Section headers in `.md` files: use plain text (`## Design`), not emoji-prefixed (`## 🎨 Design`).

**General:**
- Use `---` horizontal rules between major sections for visual breathing room.
- Use `> [!NOTE]` / `> [!WARNING]` / `> [!TIP]` for callouts on GitHub. For portable output, use `**Note:**` bold prefixes.
- Sentence case for headings (`## Key findings`), not title case unless it's a proper title.
