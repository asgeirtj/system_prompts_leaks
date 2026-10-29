# OOXML: Relationships and content types (the plumbing)

These files are the most common reason a "patched" DOCX opens but features don't work.

## Key files
- `word/_rels/document.xml.rels` (relationships for the main document)
- `[Content_Types].xml` (MIME types for parts)

## Relationships: `word/_rels/document.xml.rels`
- Namespace: `http://schemas.openxmlformats.org/package/2006/relationships`
- Each `Relationship` has:
  - `Id` (e.g., `rIdComments1`)
  - `Type` (e.g., comments, hyperlinks, footer)
  - `Target` (e.g., `comments.xml`)

Example relationship for comments:
```xml
<Relationship Id="rIdComments1"
  Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments"
  Target="comments.xml"/>
```

## Content types: `[Content_Types].xml`
- Namespace: `http://schemas.openxmlformats.org/package/2006/content-types`
- For new parts (like `comments.xml`), add an `Override`:

```xml
<Override PartName="/word/comments.xml"
  ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/>
```

## Troubleshooting checklist
If Word says the doc is corrupted or features don't appear:
- Check that the part exists in the ZIP at the expected path
- Check `document.xml.rels` has the correct `Type` and `Target`
- Check `[Content_Types].xml` contains the `Override`
- Check namespace prefixes are correct (Word is picky)
