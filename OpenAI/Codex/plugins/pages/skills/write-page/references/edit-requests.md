# Page edit workflow

Read this before editing an existing Page. Choose the tool, operation and batch mode below, then use the selected tool's active schema for the full field definitions.

## Choose the tool

A **literal text edit** changes text inside one existing block without changing its structure, such as correcting a typo, date or table-cell value. A **structural edit** adds, removes, moves, splits or combines blocks, such as turning a paragraph into a heading plus bullets or adding a list item. Choose by the resulting structure, not the length of the edit; a newline within a block is not necessarily a new block.

- **`patch_page`:** use for literal text-only changes within existing blocks when partial success is acceptable. It cannot add/remove blocks or change the Page title.
- **`edit_page`:** use for structural edits, titles, metadata, or an all-or-nothing change. It also supports literal patches, but that mode permits partial success; choosing `edit_page` alone does not make patches atomic.

## Choose an operation

Use only operations exposed by the active tool schema.

| Intended change | Operation | Available in | Batch behavior |
| --- | --- | --- | --- |
| Correct a word, number or table cell without changing block boundaries | `patch_block_markdown` in `edit_page`, or a literal patch through `patch_page` | Both: `edit_page`, `patch_page` | Partial success. In `edit_page`, may include at most one `set_title`, no other operation types. |
| Add paragraphs, headings or list items at a requested location | `insert_markdown` | `edit_page` only | Atomic non-patch batch |
| Rewrite an existing block or change its structure | `replace_block_markdown` with the complete new block Markdown | `edit_page` only | Atomic non-patch batch |
| Remove an entire block | `delete_block`, not a patch to empty text | `edit_page` only | Atomic non-patch batch |
| Reorder an existing block | `move_block`, not delete and recreate | `edit_page` only | Atomic non-patch batch |
| Rename the Page | `set_title`, guarded by the observed title hash | `edit_page` only | Atomic with non-patch operations; partial when combined with patches |
| Change block layout or other supported metadata | `set_block_metadata`, changing only the intended keys | `edit_page` only | Atomic non-patch batch |
| Insert a reference to another Page | `insert_page_link` with the target Page ID | `edit_page` only | Atomic non-patch batch |

## Examples

| Example | Tool + operation |
| --- | --- |
| Fix a typo and add a paragraph as an all-or-nothing change | One `edit_page` call with `replace_block_markdown` and `insert_markdown`. Do not use `patch_page` or mix a patch with insertion. |
| Correct dates in several existing paragraphs; independent successes are acceptable | `patch_page` with literal replacements for the affected blocks. |
| Correct dates in several paragraphs, but only if every edit can be applied | One `edit_page` call with `replace_block_markdown` for each block. Do not use literal patches. |
| Rename the Page and fix a typo; partial success is acceptable | One `edit_page` call with `set_title` and `patch_block_markdown`. |
| Rename the Page and fix a typo as one all-or-nothing change | One `edit_page` call with `set_title` and `replace_block_markdown`. |
| Add a heading and checklist below an existing paragraph | `edit_page` with `insert_markdown` at the observed boundary after that paragraph. Do not insert them through a literal text replacement. |

## Batch caveats

- **Atomic** means any rejected operation aborts the batch. Deleted-block no-ops are not rejections; inspect receipts before claiming every requested change happened.
- **Partial success** means valid operations can commit while others are rejected; see [recovery](#check-results-and-recover).
- Keep an intended atomic change in one non-patch batch. Do not automatically split it into writes or insert new content inside an unrelated replacement.

## Shared inputs and request shape

Retain a current `read_page`'s `structuredContent` as `p` and the target block as `b` from `p.content.blocks` or `p.block_excerpts`. Copy IDs, hashes and any sequence from that read; never invent them. Carry `p.metadata.stream_kind` into edits and follow-up reads. Omit `base_sequence` unless the read supplies it. Leave already-correct content unchanged.

In Code Mode, use `store`/`load` to retain these objects across cells rather than retyping IDs or hashes.

Use `p.content.page_id` for `page_id`, and `b.id`/`b.hash` for a target's `block_id`/`expected_hash`. For `set_title`, copy `p.content.title_hash` into `expected_title_hash`. For insertion between blocks, use adjacent canonical neighbors from the read; null denotes an actual Page boundary, not an excerpt boundary. The combined replacement/insertion example below shows the complete location shape.

## Literal patches

Use `replacements`, not `patches`; `expected_hash` is required even with `base_sequence`.

### Matching rules

- Copy `old` verbatim from that block's Markdown, not rendered text, a summary, or joined excerpt windows. Preserve whitespace, Unicode and line endings. If the needed text is not fully visible, read the target block before editing.
- Every `old` must be nonempty and match exactly once in the full block. For repeated text, include unchanged surrounding text in both `old` and `new`. Selected spans must not overlap.
- Put all replacements for a block in one group using its original hash. Every `old` selects the original text, not a preceding replacement's `new`. Omit unchanged `old == new` replacements; if nothing remains, make no write.
- Preserve block boundaries and avoid adding blank-line wrappers. For structural changes, use the [operation guide](#choose-an-operation).

### Matching examples

Original block: `Launch is in June. Training is in June.`

To move only the launch to July, use `{"old":"Launch is in June","new":"Launch is in July"}`. Using `old:"June"` is ambiguous: it occurs twice. Keep the surrounding words in `new` so they are not deleted.

To move both dates, group these replacements in one patch for that block:

```json
[
  {"old": "Launch is in June", "new": "Launch is in July"},
  {"old": "Training is in June", "new": "Training is in August"}
]
```

Replacements are not sequential: to change June to August, replace it directly, not `June` to `July` followed by `July` to `August`. Do not combine `old:"Launch is in June"` and `old:"Launch"` in one patch: they cover some of the same original characters. Overlapping occurrences also count when checking uniqueness: `old:"ana"` matches twice in `banana`.

### Complete patch requests

For `edit_page`, use `operations` and the discriminator `op`, not `type`:

```javascript
{page_id: p.content.page_id, stream_kind: p.metadata.stream_kind,
 operations: [{op: "patch_block_markdown", block_id: b.id, expected_hash: b.hash,
               replacements: [{old: oldText, new: newText}]}]}
```

For `patch_page`, use `changes`:

```javascript
{page_id: p.content.page_id, stream_kind: p.metadata.stream_kind,
 changes: [{block_id: b.id, expected_hash: b.hash,
            replacements: [{old: oldText, new: newText}]}]}
```

## Whole-block and structural edits

Use complete new block Markdown in `edit_page`. Build it from the observed block, preserving unrelated content, links, checkbox state and metadata. Incomplete excerpts are not complete replacement text. Before writing, check each target and replacement against the user's request.

### Update text and add a heading/list in one call

User request: "Change our launch from June to July and add a Launch checklist with Finish testing immediately after that paragraph, as one change."

Suppose the read returned paragraph `b` with Markdown `Our launch is planned for June.`. Use one atomic `edit_page` batch, not a literal patch that introduces new blocks. Here `nextBlock` is the immediately following canonical block from the same read, or null only when `b` is confirmed to be the last block (not merely the last visible excerpt).

```javascript
{page_id: p.content.page_id, stream_kind: p.metadata.stream_kind,
 operations: [
   {op: "replace_block_markdown", block_id: b.id, expected_hash: b.hash,
    markdown: "Our launch is planned for July."},
   {op: "insert_markdown",
    at: {kind: "between_blocks", preceding_block_id: b.id,
         following_block_id: nextBlock === null ? null : nextBlock.id},
    markdown: "## Launch checklist\n\n- Finish testing"}
 ]}
```

For different source text, preserve unrelated content rather than copying this example's paragraph.

## Size limits

The 256 KiB UTF-8 edit budget counts all supplied Markdown plus both `old` and `new` across the batch, not just net growth. Prefer short unique spans for small corrections. Do not delete unrelated content or automatically split an all-or-nothing change to fit a limit; ask the user when the intended edit cannot fit.

## Check results and recover

Read this for an error, partial rejection, or deleted-target no-op. Inspect commit status and every operation receipt, and follow returned `recovery.message` when present. Unknown commit status takes priority over individual rejection reasons.

| Outcome | Next step |
| --- | --- |
| Invalid arguments | Check the active schema and make one corrected attempt. A schema error alone needs no reread. |
| Hash mismatch or stale sequence | Another writer or your own earlier write may have changed the target. Reread affected blocks on the same stream and rebuild only unapplied edits using current IDs, hashes and text. Preserve intervening user changes; never remove guards or replay the original batch. |
| `patch_literal_missing` | Reread the target block and copy the intended `old` span exactly. Do not repeat the same missing selector or assume a concurrent edit: ID/hash patches check the hash before matching text. |
| Block-structure rejection | Rebuild the unapplied change with the appropriate non-patch operation from the [operation table](#choose-an-operation). Repeating the same patch will not repair it. |
| Unknown commit outcome | The write may have committed. Read back on the same stream and reconcile before any new write. |
| Mixed results | Keep confirmed successes. Follow recovery advice to decide whether and how to rebuild rejected edits; never replay applied operations. |
| `ignored_reason:block_deleted` | The target was already deleted, possibly concurrently. No change was made even if status says applied. Reread the same stream; do not retry the ignored operation or recreate the deleted block automatically. |
| Internal error | Do not change tool arguments to repair a connector/service bug. Report the failure when no safe recovery is provided. |

Stop if the corrected request is rejected or the operation is unsupported; report the gap.

### Verify the saved result

An applied operation receipt is not proof that the intended content changed; check commit status and ignored-operation reasons. Read back new Pages, broad rewrites, and preservation-sensitive edits to check the title, content, and structure; avoid redundant full-Page reads after small confirmed patches. When a preview is available, inspect new Pages and layout changes for clear hierarchy, readable tables, clipping, and loaded media. Fix issues within scope and check again. Otherwise state what remains unverified: saved Markdown alone does not prove that the layout, image, or embed rendered correctly.
