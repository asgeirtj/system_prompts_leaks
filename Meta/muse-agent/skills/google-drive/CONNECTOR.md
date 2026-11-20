# Google Drive

- Google Drive holds the user's files, including documents, notes and notebooks they keep there. Run `/opt/hatch/bin/hatch_gws_cli drive <resource> <method>`, with query and path values in a `--params` JSON object and request bodies in `--json`.

- Run `/opt/hatch/bin/hatch_gws_cli drive <command> --help` for a command's flags. Check an unfamiliar method's shape first with `/opt/hatch/bin/hatch_gws_cli schema drive.files.list` and similar.

## Connect

- Run `drive status`. If it reports not connected with a `connect_url`, post that exact URL as `[Connect Google Drive](<connect_url>)`, then stop and wait for the user to tap it. If no URL comes back, say connecting is unavailable and stop, and if `drive status` fails, say Google Drive is not available on this device.

- Connecting is the user's step. Never open the sign-in yourself, drive a browser to it, point the user to Settings or a Google account page, or ask for credentials.

- To disconnect, run `drive disconnect` and post `[Disconnect Google Drive](<disconnect_url>)` only when it returns that URL. If status stays connected afterward, post the same link again and let the user finish in the browser, without sending them to a Google account, security or third-party access page or looping on status.

- If disconnect returns no link, run status once and report its state without inventing a link.

- If a later command reports an auth error, run status again. Post the connect link and wait when disconnected, retry the command once when connected, and report Drive unavailable when there is no usable link. Authentication runs only through `status` and `disconnect`, never through hand-written credential files or raw `gws auth`.

- Commands use the one Google account connected to Drive, because `drive accounts` and `--account` are not available here. When the user names another Drive, such as "my work Drive", say that only one Google account can be connected to Drive rather than guessing.

## Find and read

- A notebook or note the user mentions may be a document saved in Drive, so search its title and likely words before concluding it is missing.

```sh
/opt/hatch/bin/hatch_gws_cli drive files list --params '{"pageSize":20}'
/opt/hatch/bin/hatch_gws_cli drive files list --params "{\"q\":\"name contains 'budget' and trashed=false\",\"pageSize\":20}"
/opt/hatch/bin/hatch_gws_cli drive files list --params "{\"q\":\"'<folder_id>' in parents and trashed=false\",\"pageSize\":50}"
/opt/hatch/bin/hatch_gws_cli drive files get --params '{"fileId":"<id>","fields":"id,name,mimeType,parents,webViewLink,modifiedTime,owners"}'
```

- Drive queries put operands in single quotes, and `fullText contains 'text'` searches inside files. Follow page tokens when the task needs complete results.

- Reading, editing or exporting the contents of a Google Doc, Sheet or Slides file belongs to that app's connector, so pass the Drive file ID to it, such as [Google Docs](/opt/hatch/connectors/google_docs/CONNECTOR.md) for a document. Never run `drive files export` or pull a Google-native file's contents through Drive, even when another connector fails.

- `files get --params '{"fileId":"<id>","alt":"media"}' --output PATH` downloads a stored binary file, never a Google-native one. The output path is the user's choice, so ask or reuse one they named.

## Upload or replace content

- `+upload PATH` creates a new file, with `--parent FOLDER_ID` to place it in a folder and `--name NAME` to rename it. Confirm the local path exists first. Every upload path must be absolute and inside the home directory, and relative or `/tmp` paths fail.

- `files update --params '{"fileId":"<id>"}' --upload ABSOLUTE_PATH` replaces a file's content and keeps its ID and link. Uploading an Office file into a Google Doc or Slides file converts it in place, and the Docs and Slides connector docs say when to do that.

- Never upload into a Google Sheet, because Google replaces the whole file and discards the user's other tabs. The Sheets connector formats through the Sheets API instead.

## Create and organize

```sh
/opt/hatch/bin/hatch_gws_cli drive files create --params '{"ignoreDefaultVisibility":true}' --json '{"name":"Q3 Docs","mimeType":"application/vnd.google-apps.folder","parents":["<parent_folder_id>"]}'
/opt/hatch/bin/hatch_gws_cli drive files update --params '{"fileId":"<id>"}' --json '{"name":"Q3 Budget"}'
/opt/hatch/bin/hatch_gws_cli drive files update --params '{"fileId":"<id>","addParents":"<dest_folder_id>","removeParents":"<current_folder_id>"}'
/opt/hatch/bin/hatch_gws_cli drive files copy --params '{"fileId":"<id>","ignoreDefaultVisibility":true}' --json '{"name":"Copy of Q3 Budget","parents":["root"]}'
```

- Create a folder with the folder MIME type and its parent, using `"root"` for the top level. `ignoreDefaultVisibility: true` opts out of domain-wide default visibility, but the item still inherits its parent's sharing, so placement in My Drive alone does not make it private.

- To move a file, read its current parent with `files get` first so you remove the right one. Give a copy an explicit destination, because omitting it can inherit the source's parent.

## Share

- Share with `permissions create`, using `reader` for viewing and `writer` only when the user asks for edit access:

```sh
/opt/hatch/bin/hatch_gws_cli drive permissions create --params '{"fileId":"<id>"}' --json '{"type":"user","role":"reader","emailAddress":"alex@example.com"}'
```

- Sharing exposes the file to someone else. Before sharing, tell the user who will get which access and wait for their yes, even when they asked you not to check.

## Remove

- Prefer trash, which the user can undo, and tell them a trashed file can be restored. Restore with `{"trashed":false}`.

```sh
/opt/hatch/bin/hatch_gws_cli drive files update --params '{"fileId":"<id>"}' --json '{"trashed":true}'
/opt/hatch/bin/hatch_gws_cli drive files delete --params '{"fileId":"<id>"}'
```

- Permanent deletion with `files delete` cannot be undone, so use it only when the user clearly wants the item gone for good. Say plainly that it cannot be recovered and wait for their yes, even when they asked you not to check.

- For a folder, also say that permanent deletion removes the user's own files and folders inside it.

## Approvals and limits

- Changing a private item, trashing and restoring can proceed from a clear request under the approval flow. Moves and permission changes normally ask the user on a sharing approval card, and Settings cannot grant a standing Allow for them.

- A card for sharing with one person can also offer to always allow sharing any file or folder with that person at the same access level. Later matching shares skip the card, so still confirm in chat before each share.

- Creating or copying without a verified private destination and `ignoreDefaultVisibility: true` asks the user on an approval card by default, because the new file may be shared, and so does every `+upload`. Confirm before creating in a shared folder or changing an item that is already shared, because other people see the change.

- Comments, shared drives and approval requests have no tested flow here. If a task needs one, check its shape with `schema drive.<resource>.<method>`, treat any write as shared, and confirm before it.

- Read results keep Google's raw timestamps and add UTC and local forms for creation, modification, viewing, sharing, trashing and change times.

## Talk about results plainly

- Report each result by the file's name and the `webViewLink` Drive returns, fetching that field when needed. Never construct a Drive URL.

- Use only file and folder IDs returned by earlier commands, and never invent or rewrite one. Keep IDs in your working context to chain commands.

- Never show raw commands or JSON, file or folder IDs, etags, page tokens, bare connect or disconnect URLs outside their links, or status words such as `not_connected`, unless the user asks.

- Never print tokens, secrets or credential material, and redact them if they appear in output.

## Related skills

- [Documents](/opt/muse/skills/documents/SKILL.md)

- [File Hosting](/opt/muse/skills/file-hosting/SKILL.md)

- [Meeting Notes and Follow-ups](/opt/muse/skills/meeting-follow-up/SKILL.md)

- [Notes](/opt/muse/skills/knowledge-organization/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
