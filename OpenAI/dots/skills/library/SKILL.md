---
name: library
description: Use ChatGPT Library when the user mentions their Library, asks to find or work with a Library-backed file, Site, or named file that may be in the Library, or wants to organize Library folders, restore a previous version, or share a native Library file or folder. Also use it when the user wants a user-facing file or reusable artifact created or updated, even if they do not mention the Library. It can search and read Library content, bring files into local workflows, save new deliverables, and update existing Library files while preserving their identity and version history.
---

# ChatGPT Library

Use this as the top-level router for persistent ChatGPT Library files. Ground
the target in Library, choose one content-access route, and preserve Library
identity through every local edit and writeback.

The Library first-party app, `connector_openai_library`, owns authenticated
Library operations:

- `list`, `search`, `read`, and `find` inspect Library content.
- `prepare_materialize` makes resolved Library files available to local tools.
- `create_library_file`, `replace_library_file`, and `manage_library` write or organize Library content.
- `share` grants or revokes access; follow its current app-provided description and schema.
- When surfaced, `prepare_uploads` and `finalize_uploads` handle prepared
  uploads.
- App-only file `@` mention search resolves selected Library items.

The runtime supplies the schemas and decides which tools are available. This
skill does not expose tools or a local MCP server.

## Workflow

1. Ground the target.
   - Decode a selected Library `@` mention and reuse its identifiers.
   - Use `search` for a filename, title, description, or content query.
   - Use `list` for recent files, folders, or inventory.
   - If the user supplied a local path or explicitly said the file is local,
     stay with local tools.
2. Choose one access route.
   - Use `read` when Library can supply the content the task needs.
   - Use `find` for literal or regex matching inside known files.
   - Materialize when editing, scripts, visual inspection, generation, byte
     comparison, or another local tool needs file bytes.
3. Preserve identity when writing.
   - Create only when no Library identity exists or the user wants a copy.
   - Replace the same `library_file_id` after editing an existing item.
   - Use `manage_library` for folders, node changes, deletion, and restore.

## Use Current Helpers

1. Before downloading, remove any downloaded copies of helpers from previous
   runs in the scoped workspace folder
2. Fetch the helper and all its companion files from the current Library skill
   source into one new private directory.
3. Reuse the downloaded helpers for every call and retry within this request
   or run.

## Routing Rules

| User need | Required route |
| --- | --- |
| Selected Library `@` mention | Decode its `oai-library://...` URI and use the returned identifiers. Search only if an identifier is missing, metadata must be refreshed, or the target is ambiguous. |
| Exact filename or title | Use `search`; quote the actual name and set `search_title_only=true`. |
| File described by purpose or contents | Use ordinary Library `search`. Do not treat a descriptive phrase as an exact filename. |
| Recent files, folders, or inventory | Use `list`; pass a returned `next_cursor` as `cursor` to continue. |
| Facts, summary, or comparison from named files | Resolve every file, then use `read` on every selected file. Search snippets alone are insufficient. |
| Literal or regex match in known files | Use `find`; follow with `read` only when the match needs more context. |
| Shared writing block (`library_artifact_type: writing_block`) | Use `read` to reconstruct its complete local text; while `has_more`, continue with `next_read`. Preserve line boundaries, verify `size_bytes`, and retain the authoritative `version_id`; do not materialize. |
| Local bytes from a `list` or `search` result | Reuse the complete earlier result when its file identifiers and path remain current; repeat `list` or `search` only if that metadata is missing, stale, or ambiguous. Pass it directly to the bundled stdin-only download helper. Do not call Library `read` or `prepare_materialize` first. |
| Local bytes from a resolved reference that did not come from `list` or `search` | Use `prepare_materialize`; read [materialization.md](references/materialization.md). |
| Explicit local path | Use local tools. Do not send local paths to Library `read` or `find`. |
| New local deliverable | Choose one create route below. |
| Edit a Library-backed file | For `library_artifact_type: site`, use Sites; never materialize, replace, or restore its projection. Otherwise materialize if needed, edit and validate locally, then replace the same `library_file_id`. |
| Create, move, rename, or delete Library nodes | Use `manage_library`; read [library-management.md](references/library-management.md) before mutating. |
| Restore an earlier version | Use `manage_library` with `restore_version`; read [library-management.md](references/library-management.md). |

For `list`, set `limit` to at most `200`. For `search`, use the canonical request
shape `{"search_query":[{"q":"quarterly revenue"}],"top_k":5}`. `search_query`
must be an array of one to five objects, even for one search. Put `search_title_only` only inside a `search_query` object. Never send top-level
`query`, `queries`, `q`, `search_title_only`, or `limit`; use top-level `top_k` from 1 to 100.

For Library intent, search Library before the local workspace unless the user
supplied a local path or said the file is local. Once routed to Library, do not
scan the workspace or prior conversations for the same target. Failure to
resolve a Library item is not evidence that it is local.

## Read Library Content

Prefer `structuredContent`; parse a JSON text block only when it is unavailable.
Use returned identifiers, filenames, versions, and paths exactly.
For follow-up `read` or `find`, prefer the returned `library_file_id`, falling
back to `file_id` or `id`. Never use a search `result_id` as a file reference.
For `read`, put that identifier in `read[i].ref_id`:  
`{"read":[{"ref_id":"<returned library_file_id>"}]}`.  
The top-level `read` array must contain 1–5 items; do not send the identifier at the top level.

Batch independent `read` and `find` items when possible. Use `read` after `search`
for content claims, even with snippets; use `find` only after candidate resolution.

Read [evidence-and-citations.md](references/evidence-and-citations.md) for
selected `@` mentions, image-search metadata, post-mutation search limits, result handling, and citations.

## Classify New Files

For new files, set `library_artifact_type` when supported:

- `image_gen`: images generated by imagegen only.
- `image`: other generated images.
- `report`, `sheet`, `slides`: generated documents/reports, spreadsheets, or presentations.
- `other`: user imports, unknown generation history, or anything else.

Classify by generation history, not filename, extension, or MIME type.
`create_library_file` uses one type per call; prepared uploads use one per file.
Omit the field for replacements or when the upload tool or helper lacks support.

## Write One Local File

Use this fast path for one confirmed local file under about `50 MiB`. Reuse
validation already completed while producing or editing the artifact. Do not
add another content inspection solely because the file is being saved to
Library.

- For a new item, call `create_library_file(file=...)` with the absolute local
  path. On success, invoke this skill's
  [scripts/library_file_transfer.py](scripts/library_file_transfer.py) with
  `python3`, the `apply-xattrs` subcommand, the original local path, and the
  returned `library_file_id`. Send the complete `xattrs` array from the create
  result (or `[]`) as JSON on stdin, as shown below. When using code mode
  (for example, `functions.exec`), call `create_library_file` and run the
  metadata helper within the same invocation, without returning to the model
  between them.
- For an existing item, resolve its Library identity and use the current local
  working file when it already contains the intended result. Do not materialize
  over that file. Materialize if needed; apply missing edits and validate once.
  Replace owned files using `replace_library_file(file=...)` with the same `library_file_id`.
  Shared stored files always use `library_upload.py`, even without prepared tools.
  Shared writing blocks also use `library_upload.py`, the bundled prepared-upload
  helper; convert their decimal `version_id` to the integer `expected_current_version`.
- An editor's new output path is still a replacement for the same Library item.
  Create only when no Library identity exists or the user wants a separate copy.
- Pass `expected_current_version` when a concrete version was retained. Never
  invent a version or remove the guard to resolve a conflict.

After create or replace, inspect the returned result. Use its filename and
Library path as authoritative, and keep its exact `library_file_id`, `file_id`,
version, and original local path together. Do not read the file back merely to
confirm a successful write unless exact verification is required.

Privately persist the returned xattrs and Library identity in one helper call;
do not add a separate progress message. The helper form is
`apply-xattrs PATH LIBRARY_FILE_ID`, and both positional arguments are required:

```bash
skill_md_path="<absolute path of this SKILL.md>"
transfer_helper_path="$(dirname "$skill_md_path")/scripts/library_file_transfer.py"
python3 "$transfer_helper_path" \
  apply-xattrs "$local_path" "$library_file_id" <<'JSON'
<complete returned xattrs array, or []>
JSON
```

Inspect the helper result before finishing; do not claim that local identity was
persisted if it failed. Read
[writeback-and-conflicts.md](references/writeback-and-conflicts.md) for direct
create batches, version conflicts, or detailed result correlation.

## Materialize List or Search Results

For files returned by `list` or `search`, retain the complete structured result
and use the bundled download helper. Run it from the workspace where the
downloaded tree should live. When a conversation-scoped workspace is active,
use that workspace so eligible bytes can be placed directly. Send the complete
unchanged `list` or `search` JSON, an `ALL` or concatenated three-digit index
selection (`000002` selects the first and third files), and a relative
destination together through stdin. Never interpolate returned fields into
shell arguments. Copy the absolute path of the Library `SKILL.md` that you read
into `skill_md_path`, then use the quoted heredoc below. Do not reconstruct or
shorten the helper path from the plugin cache root:

```bash
skill_md_path="<absolute path of this SKILL.md>"; \
python3 "$(dirname "$skill_md_path")/scripts/library_download.py" <<'JSON'
{"result": <complete list or search JSON>,
 "selection": "ALL|NNN[NNN...]",
 "destination": "<relative-directory>"}
JSON
```

The destination is the parent beneath which the selected files' canonical
Library-relative paths are recreated. Do not repeat an already-selected Library
root in it: for `/fruits/apple.md`, use `downloads`, not `downloads/fruits`,
unless the user explicitly requested that extra nesting.

For search output, indices address `results` first and then
`retrieval_title_results`. The latter are supplemental fuzzy candidates, so use
explicit indices instead of `ALL` when they are not all relevant.

The helper creates or reuses that directory, overwrites each selected file, and
leaves unrelated contents unchanged. It makes the authenticated
`prepare_materialize` calls in batches of at most 20, handles both workspace
and signed-URL transfers, and applies Library identity and xattrs. Both `list`
and `search` results retain each file's canonical Library-relative path. Use the
returned `directory` and authoritative `files` paths.

On this route, never separately call `read` or `prepare_materialize`, search the
plugin cache for helpers, inspect helper source, invoke
`library_file_transfer.py`, transfer a returned URL yourself, or process the
returned transfers again.

For a resolved reference that did not come from `list` or `search`, use the
lower-level flow in [materialization.md](references/materialization.md).

## Route Larger or Multiple Writes

Treat every local file written by one user task as one ordered upload batch.
Preserve its original mutation order and use absolute local paths.

| Condition | Required route |
| --- | --- |
| Both prepared tools are available and the task writes several files or one file around `50 MiB` or larger | Use the bundled prepared-upload helper below. |
| Prepared tools are unavailable and every item is a create | Use ordered `create_library_file(files=[...])` batches when `files` is available, keeping each call under `500 MB`; otherwise create sequentially. |
| Prepared tools are unavailable and the task includes replacements | In original order, use the upload helper for shared files and direct actions for owned items. |

Prepared app calls contain at most 20 files. Library write app calls are
ordered: do not use `Promise.all(...)` for create, replace, delete, or finalize.
Only prepared byte transfers may run in parallel. Read
[prepared-uploads.md](references/prepared-uploads.md) before using the prepared
route. It defines the helper's one-shot input and owns preparation, transfer,
finalization, result correlation, and xattr writeback. After direct batches or
the prepared helper, inspect every per-item result in request order. A
successful top-level operation does not mean every item succeeded.

## Site-Backed Library Items

A `library_artifact_type: site` item projects the canonical
`site_metadata.project_id`. `list`, `search`, `read`, and `find` remain allowed.
`manage_library` can move it; rename changes the Site title and delete deletes
the Site. Never materialize, download, patch, replace, update, overwrite, or
restore it; Sites owns its content, versions, and publish history. If ownership
or routing is unclear, stop.

## Organize, Restore, and Protect Files

Resolve ambiguous mutation targets before writing. If several candidates
remain, ask the user to choose. Read
[library-management.md](references/library-management.md) for exact folder,
move, rename, delete, restore, protected Deep Research report, and per-operation
result rules.

## Privacy and Safety

Keep user-visible reasoning, progress, errors, and final responses at the
Library level unless the user explicitly asks for implementation details. Do
not surface connector or tool names, helper commands, raw URLs, storage or
provider details, manifests, xattrs, transfer output, or indexing internals.

Privacy changes narration, not routing. Never replace a required prepared flow
with a direct upload merely because the prepared flow has stricter visibility
rules. For a prepared upload, give one brief `Saving file to Library` or
`Saving files to Library` progress update before invoking the helper, then the
saved result. Do not narrate preparation, transfer, finalization, or local
metadata as separate phases.

Do not invent Library ids, file ids, versions, filenames, paths, operations, or
tool availability. Keep signed URLs out of responses. Preserve Library identity
and unrelated content across every mutation.

## References

- [evidence-and-citations.md](references/evidence-and-citations.md): mentions, search details, result handling, and citations.
- [materialization.md](references/materialization.md): lower-level resolved-ref materialization and transfer handling.
- [prepared-uploads.md](references/prepared-uploads.md): prepared byte transfer, finalization, xattr writeback, and cleanup.
- [writeback-and-conflicts.md](references/writeback-and-conflicts.md): detailed create, replace, edit, and conflict mechanics.
- [library-management.md](references/library-management.md): folders, node mutations, restore, and protected reports.
