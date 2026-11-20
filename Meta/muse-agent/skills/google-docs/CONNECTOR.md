# Google Docs

- Google Docs holds the user's documents, including notes and notebooks they keep as Docs. Run `/opt/hatch/bin/hatch_gws_cli docs <resource> <method>`, the only supported path, with query and path values in a `--params` JSON object and request bodies in `--json`.

- Check an unfamiliar method's shape first with `/opt/hatch/bin/hatch_gws_cli schema docs.documents.get`, `docs.documents.create` or `docs.documents.batchUpdate`.

## Connect

- Run `docs status` and read `status`, `connect_url` and `disconnect_url` from its JSON. If `status` is `not_connected`, share exactly `[Connect Google Docs](<connect_url>)`, without the raw URL, and wait for the user to reconnect.

- If `docs status` fails, say Google Docs is not available on this device, without offering another integration or asking for credentials. Continue once `status` is `connected`.

- To disconnect, run `docs disconnect`, whose JSON has `ok`, `action`, `status` and `disconnect_url`, and share exactly `[Disconnect Google Docs](<disconnect_url>)`. Authentication runs only through `status` and `disconnect`, never through hand-written credential files or raw `gws auth`.

## Find and read a document

- Find a document by title or contents with the [Google Drive](/opt/hatch/connectors/google_drive/CONNECTOR.md) connector, and use its file ID as the `documentId`. Notes and shared notebooks are often ordinary Google Docs.

- Read the document with `documents get` before changing it, so you understand its current structure.

```sh
/opt/hatch/bin/hatch_gws_cli docs documents get --params '{"documentId":"<document_id>"}'
```

## Edit part of a document

- Use `documents batchUpdate` for a targeted change to an existing document, and `+write` only to append plain text:

```sh
/opt/hatch/bin/hatch_gws_cli docs documents batchUpdate --params '{"documentId":"<document_id>"}' --json '{"requests":[{"insertText":{"location":{"index":1},"text":"Hello, world!"}}]}'
/opt/hatch/bin/hatch_gws_cli docs +write --document <document_id> --text 'Hello, world!'
```

- Creating a document, or editing one that only the user owns, can proceed from a clear request. Confirm before editing a shared document, because other people can see or are affected by the change.

## Write a whole document

- Never compose a new, rewritten or rebuilt body through `batchUpdate` inserts or `+write`, because inserted plain text arrives unformatted. Build it first as a document artifact with `artifact.create_file`, following the [Word document guide](/opt/muse/skills/documents/document/GUIDE.md), which renders a styled `.docx` under `~/workspace/your_files/<artifact-slug>/`.

- Create the empty document, then fill it from the built file through Drive, which converts it in place with its formatting intact. The path must be absolute and inside the home directory:

```sh
/opt/hatch/bin/hatch_gws_cli docs documents create --json '{"title":"<title>"}'
/opt/hatch/bin/hatch_gws_cli drive files update --params '{"fileId":"<document_id>"}' --upload "$JARVIS_HOME/workspace/your_files/<artifact-slug>/<name>.docx"
```

- Read it back with `documents get` and check that the styling landed before calling it ready. A successful upload proves only that Drive converted the file, not that the page reads correctly.

- To revise, edit the artifact, which stays the working copy, and upload it again to the same document ID. The upload replaces the whole body and discards any edits made in Google since, including the user's, so read the published copy first and, if it changed, say so and wait for a yes.

## Report results plainly

- Treat document IDs as opaque, and use only IDs from earlier commands or from the user.

- After a read or write, confirm the visible result only. Keep document IDs, revision IDs and raw JSON out of replies unless the user asks or a failure needs troubleshooting, and keep using them internally.

## Related skills

- [Documents](/opt/muse/skills/documents/SKILL.md)

- [Notes](/opt/muse/skills/knowledge-organization/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
