---
description: Format Markdown documents with readable headings, lists, tables and links that survive export.
builders: file
kinds: markdown, pdf, document
---

# Markdown documents

- These rules apply to artifact Markdown: `.md` deliverables, reports and any artifact content that may be exported to PDF or Word.

## Make the structure easy to follow

- Use descriptive headings in sentence case, such as `## Key findings`, unless the heading is a proper title. Keep heading levels consistent and put a blank line before the content under each heading.

- Use paragraphs for explanation and lists for steps or parallel points.

- Put a blank line between top-level bullets when each item carries a description or runs longer than a few words. Keep sub-bullets tight under their parent.

- Nest lists at most two levels deep. When a third level seems necessary, restructure into sections with headings.

- Use emphasis to help the reader find a meaningful word or choice. Avoid adding a bold label and colon to every bullet.

## Keep tables readable

- Use a table when shared columns make values or options easier to compare.

- Keep cells to short phrases, keywords or values of roughly 25 characters, not full sentences. Move longer detail into a note below the table without dropping a qualification the reader needs.

- Keep a table to three or four columns at the intended page width. Split a wider one into several tables or a definition list.

- Right-align numeric columns with `---:`. Keep units and currency clear and use the same precision for comparable values.

- Keep URLs out of table cells and put them in a sources section or notes below the table.

## Check the exported result

- Use plain text headings and standard list markers. Leave emoji out of files intended for PDF or Word, including emoji-prefixed headings, because most PDF engines render them as boxes or missing glyphs.

- Give links descriptive text and check that they still work after export.

- Add a callout or horizontal rule only when it separates information the reader needs to notice. Ordinary prose should not need a series of note and warning labels. When a callout is warranted, use `> [!NOTE]`, `> [!WARNING]` or `> [!TIP]` for Markdown rendered on GitHub and a short bold lead word for portable output.

- Inspect the rendered file for broken tables, missing characters, lost links and awkward page breaks, and follow the format's production guide for export.
