# topic.editing

## Editing — beyond the basics

Notation, `C`, ids and the reads (outline · `view` + `parentId` · `search`) as `topic.index`; ids from its "Q3
launch plan" example — use your own reads' ids. Ops ride the prose `update` (ex.1's envelope: `ref` + `engine
"prose"` + `container` + `payload.ops`), several per call, applied in order. Examples ex.1–4 at the end.

- Every read prints `h='…'` (8 hex) per block = what `ifHash` names (ex.2): a text block's letters; a
  list/quote/table/row/cell's type, attrs + direct child ids, not their text (typing inside a child keeps it);
  `search` hits carry char ranges; `{"kind":"view","atRev":N}` = the doc at rev N (ex.4).
- Keep up to date (people edit the doc while you work and between your turns — assume it changed):
  - Bookmark = your last read's `rev` (none yet: last ack's). A later turn that touches the doc
    starts with `read( …, payload = {"kind":"view","sinceRev":12} )` (12 = the bookmark) → only the blocks
    changed since (unchanged runs fold into `<gap/>`, deleted blocks show `<gone id=…/>`), fresh ids and `h`;
    act on those, no full re-read. Between your own consecutive writes no read: the ack (`session`, the
    `xml` of what you wrote) anchors the next call.
  - `guard_mismatch` = that block changed after your read; the refusal shows it as it stands. Their
    edit wins: a placeholder you were filling now holds their text → drop that op (add yours beneath theirs only if
    it still adds something; say you kept their text); your pending block is gone (`block_gone`, `data.op`
    "remove") → they do not want that section: drop it, never re-create it; a block you were rewriting → redo
    it from what stands (a `<gap …/>` in it, or a list/table → read it first), guarded on `data.h` + `data.rev`
    (or that read's). Never your text over theirs, never resend with force.
    `find_none` / `char_gone` on words you quoted = the same: read that block, work with what it says now.
  - A read shows a person as `<mention user label? self?/>` (`self='true'` = the person you act for): mention
    someone else only with that `user` id; outside the doc write `@` + the label, else "@[person]".
  - Comments: `query( … )` again with `"afterSeq": <last seq you saw>` → only newer comments, replies, resolves.
- Asked to add or expand sections of an existing doc → plant the plan first (WHILE THEY WATCH): ONE `insert` at the spot
  (`"side":"after"` a block id, or `{"kind":"root"}` + `"side":"end"`) whose markdown is `<?claude block s1?>\n\n<?claude block s2?>`
  with `"blocks":{"s1":{"type":"pending","intent":"Risks: what could slip and the fallback"},"s2":{…}}`; then fill each as
  after a birth: `replace` its pending id with `## <heading>` + body.
- Rewrite a block = `replace` by id (ex.1): `"as":"text"` re-words in place, keeping chips, breaks, bold, links,
  level (a chip or break inside the changed words → refused: `find` around it); `"as":"markdown"` re-creates it
  from your markdown ALONE (chip map `blocks` BESIDE `from`), dropping what it does not re-spell
  (`refusal.dropped`): read it first (`view` + `parentId`). Guards on EVERY whole-block `replace`/`delete`:
  `"ifHash"` = its newest `h` + `"ifRev"` = the `rev` of the READ that showed it — an ack's only
  for a block that ack wrote whole; several ids: `ifRev` alone; all judged on the doc as it stood before the
  call's first op. find/chars targets take NO `ifHash`.
- `anchors_affected` refusal = the change removes words a comment hangs on → narrow the edit around those words (target the rest by `find`), or ask in that thread whether they should go; `"allowDetach":true` beside `"op"` (never on the payload) only when a person asked for a change that removes them → the thread stays open, detached (ack notices): off the page, in the Comments list; say so where you were asked, and what it was on. The thread `answering` names: same flag when the person you act for sent it to Claude and is alone in it, else still refused → propose it there. Never resolve a thread a person wrote in to clear the way.
- In-doc link: `[Intro](#<bid>)` = heading block id off a read/ack (a `~slug` the viewer appends stays); heading
  born in the same fill → `[Intro](#intro)` (GFM slug).
- `delete` (ex.1): find target = exactly the quoted words, leading space included (so none doubles up), or a block
  id + both guards, several ids + `"ifRev"` (a list, quote or table goes whole: items, rows, their ids; its `ifHash`
  refuses once one was added, removed or moved since your read); never `replace` with empty content (refused).
  A tab keeps one block: deleting its LAST is refused (`last_block`) — to clear a tab, `replace` that block (same guard) with
  `<?claude block empty?>` (+ `"blocks":{"empty":{"type":"paragraph"}}`), the one empty paragraph an editor leaves.
- `move` (ex.1): block ids + `to` = an insert target + `side` (`{"kind":"root"}` + `"end"` = bottom of the tab).
- List kind in place (items, ids, threads stay): `set` `"attrs":{"kind":"bullet"|"ordered"|"check"}` on the list
  id (ex.2); tick an item: `"attrs":{"checked":true}` on its listItem id — its first paragraph then shows struck
  through and dimmed: words meant to be read go in a paragraph under it, or the item stays unticked. Never
  delete + re-insert a list for this (retires every id in it, detaches its comments).
- Block kind in place (words keep their ids, so threads stay) = the way, in a plain edit, to reshape a block that holds a
  `<comment …/>` (no `ifHash` on these ops): heading → paragraph: `set` `"attrs":{"heading":null}` (without it, a `wrap`
  leaves a heading); two adjacent blocks → one, of the first's kind:
  `{"op":"join","target":{"kind":"blocks","ids":["<first>","<next>"]}}` (adds no space: add one by `find`); adjacent
  paragraphs → bullets, one each:
  `{"op":"wrap","target":{"kind":"blocks","ids":[…]},"in":{"type":"list","kind":"bullet"}}` (a quote:
  `"in":{"type":"blockquote"}`; blocks apart: a `wrap` each); a list, item or quote → paragraphs: `unwrap` its id; then
  re-word by `find` around the commented words. Re-sent as markdown in another kind, the words get new ids: refused, or
  threads detach.
- Table rows (ex.2): `insert` `"as":"blocks"`, every cell spelled, one per column; `side` `"end"` on the table id
  → appended, `"after"` + a row id → below that row. A cell's words: find → `replace` `"as":"text"`; the whole
  table `"as":"markdown"` works too but re-types every row. Whole cell: `replace` + the cell target
  (topic.index IDS) + `"with"` + `"ifRev":<rev of the read row/col came from, not a later ack's>` (bare →
  `missing_guard`) — rows/columns changed since → refused `guard_mismatch` + the table's shape now: re-aim, resend.
- Cell colour: `set` `"attrs":{"background":"<hex>"}` on the cell target (`null` clears it). ONLY the seven in the
  editor's menu: gray #f0efec, red #fbebeb, orange #f9ece7, yellow #f9eeda, green #e5f4e4, blue #e7f1fb,
  purple #efedff.
- Table column (ex.3): ONE `insert`, `"each":true` = a copy of the source at EVERY listed row id (≤ 4,096 a
  call); `side` `"end"` | `"start"` → last | first column, or each row's neighbour cell + `"after"` | `"before"`;
  header row → header cell; `""` = blank cell; words fill every copy alike. An id twice → `same_anchor`; several
  ids without `"each"` → `place_arity`. Remove a column: ONE `delete` naming every cell of it + `"ifRev"` (your read's
  `rev`).
- Merge cells: ONE call a merge, by id: one `move` per other non-empty cell (its blocks → the top-left cell's `"end"`), `set` on
  that one `"attrs":{"colspan":2}` (`"rowspan"` = down; cells print `colwidth` → + a px per column spanned,
  `"colwidth":[224,150]`), `delete` the other cells. Split: span `null` + `insert` the freed cells, a row's in ONE op. Merged  
  table: ids only, row/col → `cell_none`.
- Deleted text is in the doc's history — never retype it or ask for it (ex.4): `atRev` read (step back until the
  text is there; `latest` = the rev now), then re-insert the words with an ordinary `insert`; or `restore`, the
  only op in its call, `payload.ifRev` = that `latest` → rewinds the whole tab, only when nothing else changed
  since.
- Words inside `<ins s=…>` / `<del s=…>` are an open suggestion; a plain edit over them is refused →  
  `guide( items = ["topic.suggestions"] )`.

### Examples

ex.1 — one call, in order: words out by quote · bullets + a link after a block · guarded rewrite with chips ·
guarded delete of a whole list · the table to the bottom:
```
update( ref = {"object":"node","id":"be1476b2-62c1"}, engine = "prose", container = C, payload = {"ops":[
  {"op":"delete","target":{"kind":"find","text":" if legal review runs long"}},
  {"op":"insert","target":{"kind":"blocks","ids":["mq2x81a0kfd.16"]},"side":"after",
   "source":{"as":"markdown","from":{"kind":"inline","content":"- Launch retro on Oct 6\n- [Vendor pricing](https://example.com/pricing)"}}},
  {"op":"replace","target":{"kind":"blocks","ids":["mq2x81a0kfd.16"]},"ifHash":"cddc588b","ifRev":12,
   "with":{"as":"markdown","blocks":{"me":{"type":"mention","user":"me"},"due":{"type":"date","value":"2026-10-06"}},
           "from":{"kind":"inline","content":"Owner <?claude block me?>, launch moved to <?claude block due?>."}}},
  {"op":"delete","target":{"kind":"blocks","ids":["mq2x81a0kfd.60"]},"ifHash":"1d9a3f0c","ifRev":12},
  {"op":"move","target":{"kind":"blocks","ids":["mq2x81a0kfd.90"]},"to":{"target":{"kind":"root"},"side":"end"}} ]} )
```
ex.2 — one table read whole, then a row appended and a list made a checklist:
```
read( …, payload = {"kind":"view","parentId":"mq2x81a0kfd.90"} )
→ <doc rev='12' …><table id='mq2x81a0kfd.90' h='c8d95136'><row id='.91' h='89de16c2'><cell id='.92' header='true'>… <row id='.123' …>…
update( …, payload = {"ops":[
  {"op":"insert","target":{"kind":"blocks","ids":["mq2x81a0kfd.90"]},"side":"end",
   "source":{"as":"blocks","from":{"kind":"inline","content":[{"type":"row","content":[
     {"type":"cell","content":[{"type":"paragraph","content":[{"type":"text","text":"Oct 6"}]}]},
     {"type":"cell","content":[{"type":"paragraph","content":[{"type":"text","text":"Launch retro"}]}]}]}]}}},
  {"op":"set","target":{"kind":"blocks","ids":["mq2x81a0kfd.40"]},"attrs":{"kind":"check"}} ]} )
```
ex.3 — a column = a blank cell at the end of EVERY row (row ids from the view):
```
{"op":"insert","target":{"kind":"blocks","ids":["mq2x81a0kfd.91","mq2x81a0kfd.123"]},"side":"end","each":true,
 "source":{"as":"text","from":{"kind":"inline","content":""}}}
```
ex.4 — bring back: `read( …, payload = {"kind":"view","atRev":9} )` → rev 9 of the doc as it read then, `latest: 14` (the
rev now) beside the xml → re-insert the words (an `insert` as in ex.1), or rewind:  
`update( …, payload = {"ifRev":14,"ops":[{"op":"restore","rev":9}]} )`.
