---
name: "google_docs"
description: "Read, create, and edit the user's Google Docs."
icon: "google_docs"
metadata: { "includeInPrompt": false }
---

# Google Docs

## Purpose
Manage Google Docs through `hatch_gws_cli`; the vendored Google Workspace CLI is the only implementation path.

## Tooling
Use `exec` to run:

```sh
hatch_gws_cli docs <resource> <method> [flags]
```

### Connection management

```sh
hatch_gws_cli docs status
hatch_gws_cli docs disconnect
```

### Docs operations

Core patterns:
- `hatch_gws_cli docs status`
- `hatch_gws_cli docs disconnect`
- `hatch_gws_cli schema docs.documents.get`
- `hatch_gws_cli schema docs.documents.create`
- `hatch_gws_cli schema docs.documents.batchUpdate`

Common raw API calls:
- `hatch_gws_cli docs documents get --params '{"documentId":"<document_id>"}'`
- `hatch_gws_cli docs documents create --json '{"title":"Project Brief"}'`
- `hatch_gws_cli docs documents batchUpdate --params '{"documentId":"<document_id>"}' --json '{"requests":[{"insertText":{"location":{"index":1},"text":"Hello, world!"}}]}'`

Vendored helpers are also available:
- `hatch_gws_cli docs +write --document <document_id> --text 'Hello, world!'`

JSON output contract:
- `status`: parse `status`, `connect_url`, and `disconnect_url`
- `disconnect`: parse `ok`, `action`, `status`, and `disconnect_url`

## Composing document content

Never compose a document body through `batchUpdate` inserts or `docs +write`, whether new, rewritten, or reconstructed. Inserted plain text arrives unformatted. Build it as a document artifact first. The artifacts tool renders a styled `.docx` under `~/workspace/your_files/<artifact-slug>/`. Then put it in Google:

1. Mint the empty doc with `hatch_gws_cli docs documents create --json '{"title":"<title>"}'`.
2. Fill it from the built file: `hatch_gws_cli drive files update --params '{"fileId":"<document_id>"}' --upload "$JARVIS_HOME/workspace/your_files/<artifact-slug>/<name>.docx"`. Drive converts the upload into the Google Doc in place, formatting intact. The path must be absolute and inside the home directory. Relative and `/tmp` paths fail.
3. Read it back with `documents.get` and confirm the styling landed before you call it ready. A successful upload proves Drive converted the file, not that the page reads correctly.
4. To revise, edit the artifact and re-upload to the same document ID. The artifact is the working copy. The upload replaces the whole body, so it discards any edits made in Google since, including the user's. Read the published copy back first. If it changed, say so and wait for a yes.

## Auth
Authentication is handled by the wrapper's `status` and `disconnect` subcommands. Do not hand-write credential files or run raw `gws auth ...`.

## First-use setup flow
1. Run `hatch_gws_cli docs status`.
2. If `status` is `unavailable`, tell the user that Google Docs is not available on this device. Do not offer alternative integration approaches or ask the user for credentials.
3. If `status` is `not_connected` and `connect_url` is present, replace `<connect_url>` with the returned URL and share exactly this Markdown link: `[Connect Google Docs](<connect_url>)`; do not paste the raw URL separately. Wait for the user to reconnect.
4. Once `status` is `connected`, proceed with Docs operations.

## Operating Rules
1. Use `schema` before unfamiliar Docs methods so `--params` and `--json` match the current vendored CLI contract.
2. Creating a document and editing a document owned only by the user may proceed from a clear request. Confirm before editing a shared document because its contents can be exposed to or changed for other people.
3. Treat document IDs as opaque strings and only use IDs returned by prior commands or explicit user input.
4. Prefer `documents.get` before updating so you understand the current structure.
5. Run `hatch_gws_cli docs disconnect`. After running it, when `disconnect_url` is present, replace `<disconnect_url>` with the returned URL and share exactly this Markdown link: `[Disconnect Google Docs](<disconnect_url>)`; do not paste the raw URL separately.
6. Use `documents.batchUpdate` to change part of an existing document, and `docs +write` only to append plain text. To compose a body, follow "Composing document content" above.
7. After a read or write action, confirm the user-visible result only. Do not surface raw API identifiers (document IDs) or other internal response fields (revision IDs, raw JSON) in text shown to the user unless the user asks for them or you need them to troubleshoot a failure; keep using them internally to chain follow-up commands.
