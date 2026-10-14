# Editing existing Word documents

A `.docx` (and a `.dotx` template, handled identically) is a ZIP archive of
XML parts. Route by what the edit needs:

| Edit | Path |
|---|---|
| Content changes on a doc you generated | Revise the `.src/` generator and regenerate |
| Simple content changes on an uploaded doc | Open it with `python-docx`, edit, save |
| Tracked changes (redlines), comments, format-preserving surgical edits | Raw XML: unpack, edit `word/document.xml`, repack (`python-docx` cannot express these) |
| Read or extract content | `muse.read` opens a .docx directly (converted to markdown, paged); iterate with `python-docx` when you need structure the markdown flattens |
| Legacy `.doc` | Convert first: `soffice --headless --convert-to docx file.doc`, then treat as above |

## The raw-XML round trip

```bash
unzip -q doc.docx -d unpacked/
find unpacked -type l -delete   # ZIP entries from outside parties can be symlinks; strip before touching the tree
# edit unpacked/word/document.xml IN PLACE
(cd unpacked && rm -f ../out.docx && zip -Xr ../out.docx .)
```

- Never pretty-print or reindent the XML: added whitespace text nodes
  perturb `xml:space`-sensitive content and change rendering.
- Repack from inside the unpacked directory so part paths are
  archive-root-relative (`word/document.xml`, not `unpacked/word/...`);
  Word refuses an archive with prefixed paths.
- `rm -f` the output first: `zip` appends into an existing archive, so a
  part you deleted from the tree survives without it. `-X` drops
  uid/gid/timestamp extra fields.
- When extracting with Python instead, reject symlink entries
  (`stat.S_ISLNK(info.external_attr >> 16)`) and entries that resolve
  outside the destination before extraction.

## Run fragmentation

Word splits visible text across many `<w:r>` runs (revision ids,
spell-check markers, editing history), so a phrase you can read in the
document often does not exist as a contiguous string in the XML, and a
find-and-replace silently misses. Before string edits, coalesce adjacent
runs whose `<w:rPr>` serialize byte-identically (both absent also
matches); that criterion provably leaves rendering unchanged. `rsid*`
attributes and `<w:proofErr>` elements are pure metadata and safe to
strip. Never merge across two different `<w:ins>`/`<w:del>` wrappers:
that rewrites tracked-change structure and collapses separate revisions.

## Tracked changes (redlining)

Wrap changed runs in `<w:ins>`/`<w:del>`, each carrying `w:id`,
`w:author`, and `w:date`.

- Inside `<w:del>` the text element is `<w:delText>`, never `<w:t>`;
  field instructions become `<w:delInstrText>`.
- A deleted paragraph MARK
  (`<w:pPr><w:rPr><w:del .../></w:rPr></w:pPr>`) means "merge this
  paragraph into the next". Deleting a whole paragraph is that plus a
  `<w:del>` around every run; either half alone is a different edit.
- Inside `w:rPr` the `<w:del/>` child comes BEFORE the other children;
  rPr child order is schema-enforced.
- To reject another author's insertion, nest your `<w:del>` inside their
  `<w:ins>`; never edit or unwrap their wrapper. To restore their
  deletion, add your own `<w:ins>` after their `<w:del>`. A change is
  identified by (kind, author, date, text), so rewriting someone else's
  wrapper reads as a brand-new change.
- The silent failure mode is an edit made OUTSIDE any wrapper: invisible
  in the accepted view and recorded nowhere. After redlining, re-read the
  XML and confirm every text difference against the original sits inside
  a `<w:ins>`/`<w:del>` you authored. The document body is where this
  discipline applies; headers, footers, and footnotes are separate parts,
  so check them separately if you touched them.

To hand back a clean all-accepted copy, drive headless LibreOffice with a
StarBasic macro dispatching `.uno:AcceptAllTrackedChanges`, then verify by
unpacking the output and grepping that no `w:ins`/`w:del` remain. Two
gotchas: soffice can hang after storing (a timeout is not a failure;
verify the output content instead of the exit), and a fully-deleted
paragraph followed by an empty spacer paragraph can survive as an emptied
paragraph, showing up as a stray empty bullet when auto-numbered. That
bullet is an artifact of the accepted view; judge paragraph deletions in
the XML.

## Comments

Comments span six cross-linked locations: `word/comments.xml`,
`word/commentsExtended.xml`, `word/commentsIds.xml`,
`word/commentsExtensible.xml`, their four `Relationship` entries in
`word/_rels/document.xml.rels`, and four `Override` entries in
`[Content_Types].xml`. The ID chain: `w:comment` carries `w:id` and a
paragraph `w14:paraId`; commentsExtended keys on that paraId;
commentsIds maps paraId to a `durableId`; commentsExtensible keys on the
durableId.

- Parts alone show nothing: anchor with `<w:commentRangeStart w:id="N"/>`
  ... `<w:commentRangeEnd w:id="N"/>` plus a
  `<w:commentReference w:id="N"/>` run. Range markers are direct children
  of `<w:p>`, never inside a `<w:r>`.
- A reply's `w15:commentEx` sets `w15:paraIdParent` to the parent
  comment's paraId, and its markers nest inside the parent's range.
- ID ceilings: `w14:paraId` is hex below `0x80000000`, `durableId` below
  `0x7FFFFFFF`; generate with `randint(0, 0x7FFFFFFE)` formatted `%08X`.
  durableId is decimal in `numbering.xml` and hex everywhere else.
- Declare the full Word namespace set (plus `mc:Ignorable`) on each new
  part's root element up front, so appended children never hit
  undeclared-prefix errors.

## Verify

Every edit ends with the render gate in
`/opt/hatch/skills/artifacts/testing/SKILL.md`: convert to PDF with headless
LibreOffice, rasterize with pdftoppm, and read every page image before
returning a link.
