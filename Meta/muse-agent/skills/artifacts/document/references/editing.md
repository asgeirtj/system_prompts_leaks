# Edit an existing Word document

- A `.docx` (and a `.dotx` template, handled the same way) is a ZIP archive of XML parts. Choose the route that preserves what the edit touches:
  - For a document generated here, edit its `.src/` generator and regenerate.
  - For simple content changes to an uploaded document, open it with `python-docx`, edit and save.
  - For tracked changes, comments or edits that must keep precise formatting, edit the raw XML. `python-docx` cannot express these.
  - To read or extract content, `muse.read` opens a `.docx` as paged Markdown. Use `python-docx` when you need structure the Markdown flattens.
  - Convert a legacy `.doc` first with `soffice --headless --convert-to docx file.doc`, then treat it as above.

## Unpack and repack safely

- Unpack the archive into `$WORK`. An uploaded document is not in `project_dir` yet, so copy it to `$DIR/$FILE` first:

```bash
FILE="<the deliverable's file name, as the output contract names it>"
DIR="$JARVIS_HOME/<project_dir from the build task, without its leading ~/>"
WORK="$DIR/.src/unpacked"
rm -rf "$WORK" && mkdir -p "$WORK" || exit 1
unzip -q "$DIR/$FILE" -d "$WORK" || exit 1
find "$WORK" -type l -delete   # an outside archive can contain symlinks
```

- Edit `$WORK/word/document.xml`, then run this block to repack `$WORK` into the deliverable. Re-running it keeps your edit.

```bash
FILE="<the deliverable's file name, as the output contract names it>"
DIR="$JARVIS_HOME/<project_dir from the build task, without its leading ~/>"
WORK="$DIR/.src/unpacked"
OUT="$DIR/.src/repacked-$FILE"
rm -f "$OUT" || exit 1
(cd "$WORK" && zip -qXr "$OUT" .) || exit 1
python3 -c 'import sys, zipfile, xml.dom.minidom; xml.dom.minidom.parseString(zipfile.ZipFile(sys.argv[1]).read("word/document.xml"))' "$OUT" || exit 1
mv "$OUT" "$DIR/$FILE"
```

- Word refuses parts under an extra folder, and `zip` appends to an existing archive, so a part you deleted would survive. `-X` drops extra file metadata.

- Never pretty-print or reindent the XML. Added whitespace nodes change `xml:space`-sensitive content and its rendering.

- When extracting with Python instead, reject symlink entries (`stat.S_ISLNK(info.external_attr >> 16)`) and any entry that resolves outside the destination.

## Find text split across runs

- Word splits visible text across many `<w:r>` runs, so a phrase you can read often is not one string in the XML and a plain find-and-replace misses it.

- Before a string edit, merge adjacent runs whose `<w:rPr>` serializes byte-for-byte the same, or that both lack one. That merge leaves rendering unchanged. `rsid*` attributes and `<w:proofErr>` elements are metadata and safe to remove.

- Never merge across two different `<w:ins>` or `<w:del>` wrappers. That rewrites the revision history and collapses separate changes into one.

## Make tracked changes

- Wrap each changed run in `<w:ins>` or `<w:del>` carrying `w:id`, `w:author` and `w:date`.

- Inside `<w:del>`, text goes in `<w:delText>`, never `<w:t>`, and field instructions go in `<w:delInstrText>`.

- A deleted paragraph mark (`<w:pPr><w:rPr><w:del .../></w:rPr></w:pPr>`) merges the paragraph into the next one. Deleting a whole paragraph needs both the deleted mark and a `<w:del>` around every run.

- Inside `w:rPr`, put `<w:del/>` before the other children. The schema enforces that order.

- To reject another author's insertion, nest your `<w:del>` inside their `<w:ins>`. To restore their deletion, add your own `<w:ins>` after their `<w:del>`. Never edit or unwrap their wrappers, because a rewritten wrapper reads as a brand-new change.

- An edit made outside any wrapper is invisible in the accepted view and recorded nowhere. After redlining, compare the XML with the original and confirm every text change sits inside a wrapper you authored.

- Headers, footers and footnotes are separate parts. Check each one you touched.

## Hand back an accepted copy

- For a clean copy with every change accepted, run headless LibreOffice with a StarBasic macro that dispatches `.uno:AcceptAllTrackedChanges`.

- Unpack the result and confirm no `w:ins` or `w:del` remains. LibreOffice can hang after saving, so judge a timeout by the output file, not the exit status.

- A fully deleted paragraph followed by an empty spacer paragraph can survive as an empty paragraph, which shows as a stray bullet when numbering is on. Judge paragraph deletions in the XML, not in the accepted view.

## Keep comments connected

- A comment spans six linked places: `word/comments.xml`, `word/commentsExtended.xml`, `word/commentsIds.xml`, `word/commentsExtensible.xml`, four `Relationship` entries in `word/_rels/document.xml.rels`, and four `Override` entries in `[Content_Types].xml`.

- The IDs chain together. A `w:comment` carries `w:id` and a paragraph `w14:paraId`. The extended part keys on that paragraph ID, the IDs part maps it to a `durableId`, and the extensible part keys on the durable ID.

- The parts alone show nothing. Anchor each comment with `<w:commentRangeStart w:id="N"/>`, `<w:commentRangeEnd w:id="N"/>` and a `<w:commentReference w:id="N"/>` run. Range markers are direct children of `<w:p>`, never inside a `<w:r>`.

- A reply's `w15:commentEx` sets `w15:paraIdParent` to the parent comment's paragraph ID, and its markers nest inside the parent's range.

- Keep `w14:paraId` below `0x80000000` and `durableId` below `0x7FFFFFFF`. `randint(0, 0x7FFFFFFE)` formatted as `%08X` satisfies both. `durableId` is decimal in `numbering.xml` and hexadecimal everywhere else.

- Declare the full Word namespace set and `mc:Ignorable` on each new part's root element before adding children, so later elements never hit an undeclared prefix.

## Check the delivered file

- Render the final document through headless LibreOffice, rasterize it with `pdftoppm` and read every page image for missing content, broken layout and wrong revisions. The [artifact verification guide](/opt/muse/assets/artifacts/references/verification.md) lists what to check.
