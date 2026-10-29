---
name: google-docs
description: Create and edit native Google Docs through connected tools.
---

# Google Docs

Create and edit native Google Docs through connector tools, which handle authentication. For content edits, `batch_update_document` calls Google's `documents.batchUpdate` API. Verify connector capabilities before claiming a feature is unsupported.

## Choose the route

- **New document:** create a native Google Doc with the Drive create action and `application/vnd.google-apps.document`.
- **Edit an existing document:** edit the specified document in place. Read the target and surrounding structure with the Google Docs tools before writing. For large responses or complex native controls, optionally use the [file-backed read helper](references/reference-trusted-read-wrapper.md) to save a searchable outline and control inventory. Do not write through an opaque control range you cannot inspect.
- **Use a template:** when creating a new document from a template, copy it natively to preserve its formatting and embedded features. When adapting a past document, update task-relevant content across every retained tab; preserving structure does not mean carrying forward old people, dates, links, or approvals. Edit an existing document in place when that is what the user requests.
- **Convert Word to Google Docs:** only when the user supplies a Word file and asks to convert it. Call `mcp__codex_apps__google_drive_import_document` with `source_file` set to its absolute local path, the desired `title`, and `upload_mode: "native_google_docs"`. Preserve the source file. Verify the response identifies a native Google Doc (`application/vnd.google-apps.document`) and supplies its ID or URL, then read it back to check content, headings, lists, tables, and embedded elements against the source. When layout fidelity matters, compare an exported PDF with the source rendering. Repair conversion drift with scoped edits that preserve the source formatting, and report any remaining fidelity loss.

Place new documents and template copies in `ChatGPT` at My Drive root unless the user specifies another location. Edit existing documents in place.

## Edit without losing structure

`batch_update_document` applies direct edits, not tracked suggestions.

1. Resolve the destination document ID, target `tabId`, and current structure. A URL pointing at one tab does not describe the whole document. Inspect all tabs when copying or editing the whole document; a targeted edit needs only its relevant scope.
2. Resolve paragraph, table-cell, and native-element ranges from connector readback. Docs indexes are UTF-16 code units, not character counts. Requests in a batch execute sequentially, so earlier inserts and deletions change later indexes.
3. Batch compatible edits in one `batch_update_document` call, accounting for sequential index shifts. Combine text insertion and its formatting when ranges can be calculated from the inserted text. Make scoped edits. Do not rebuild a document for a small correction or replace a table/control with its visible text. Match nearby peer styles when adding content to an existing structure.
4. Use `write_control.requiredRevisionId` for edits that should fail on concurrent changes. Use a returned revision for the next guarded batch when available. Read again only when a later edit needs positions or native IDs you cannot reliably derive, a revision conflict occurs, or a write outcome is uncertain; reconcile that outcome before retrying. Do not read after every tool call.
5. After the planned edits, read back the changed area once to verify content, location, native element types, and preservation of nearby structure. Use PDF rendering when page fit or image placement matters; connector metadata alone cannot prove rendered layout. Export and inspect the relevant PDF pages for that check; HTML and thumbnails do not prove page fit.

### Formatting and native features

For new documents, use Google Docs' supplied named styles, fonts, spacing, and margins unless the user requests a different design. Use `TITLE` for a visible title, `HEADING_1` for main sections, and `HEADING_2` for subsections; keep peer sections at the same level. For existing documents and template copies, preserve their formatting and match nearby peers when adding content.

Use named paragraph styles for headings and native list requests for lists. Set only `namedStyleType` for a heading unless the user requests overrides or a sampled peer requires them. Changing a paragraph to `NORMAL_TEXT` may leave explicit character formatting intact; reset unintended inherited styling on inserted body text to match its intended body style.

Smart chips are optional unless requested or needed to match an existing field. Preserve chips, links, and controls outside the edit scope rather than converting them globally.

### Dropdowns

Preserve dropdowns when editing nearby content. To create or update them, pass dropdown request objects to the connector's `batch_update_document` tool; see the [dropdown example and readback checks](references/reference-smart-chips-and-building-blocks.md#dropdowns).

## References: read as needed

| When to read | Reference |
| --- | --- |
| Composing requests for text, formatting, lists, tables, hyperlinks, or images | [Connector examples](references/reference-direct-request-composition.md) |
| Working with smart chips, dropdowns, or existing building blocks | [Smart chips, dropdowns, and building blocks](references/reference-smart-chips-and-building-blocks.md) |
| Creating Calendar-backed meeting notes using a complete request example | [Meeting-notes example](references/reference-meeting-notes-direct.md) |
| Using the optional helper to inspect a large or complex document response | [File-backed read helper](references/reference-trusted-read-wrapper.md) |

## Output delivery

These citation directives are only for the final chat response to the user. Never insert them into the Google Doc. For source references inside the document, use ordinary hyperlinks or the citation style requested by the user.

- **`purpose="output"`:** use for each final Google Doc created or edited for the user. Cite it exactly once, on its own line in its own paragraph, outside prose and list items. Briefly describe the result separately without repeating its filename, path, or link. Do not use output citations for unchanged files or read-only answers.
- **`purpose="source"`:** use for each document whose contents you summarize or use to support an answer. Place the citation inline where the document is referenced, in place of its filename. Do not write the filename separately and append its citation. Files merely inspected but not used in the answer need no citation.
- Include only `path` and `purpose` inside each directive. Do not add a description, title, label, `mode`, or other attributes. Any explanatory prose belongs outside the directive.
- Emit `:codex-file-citation{...}` directly, without backticks, code fences, or a Markdown-link wrapper. Use verified targets only. No need to cite or reference intermediate work.

Set `path` to the verified native Google Docs URL returned by the connector. Citation directives are exempt from "Return web URLs as Markdown links."

Examples below use placeholders; actual responses use verified URLs and no code fences.

```text
:codex-file-citation{path="https://docs.google.com/document/d/<verified-file-id>" purpose="output"}
```

```text
The review of :codex-file-citation{path="https://docs.google.com/document/d/<verified-file-id>" purpose="source"} is due Friday.
```
