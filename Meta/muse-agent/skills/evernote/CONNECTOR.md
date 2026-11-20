# Evernote

- Evernote holds the user's notes, notebooks, Spaces, tags, tasks and attachments. Run `/opt/hatch/bin/evernote`, which calls Evernote's official MCP server with the account the user connects through Muse.

## Connect

- Run `status`. If it reports `not_connected`, run `authorize-url` and share only the returned `connect_url`. Never ask for tokens or credentials in chat.

- Run `disconnect` only when the user asks to disconnect, because it removes the stored connection.

```text
/opt/hatch/bin/evernote status
/opt/hatch/bin/evernote authorize-url
```

## Find and call a tool

- Run `list-tools` for the reviewed tools and their live input schemas, with each tool's `hatch_action` showing whether Muse treats it as a read or a write. Unknown or new provider tools stay unavailable until they are reviewed.

- Build `--arguments-json` as one JSON object from that schema, and never guess a tool name or required field. Follow the returned pagination fields to read more.

```text
/opt/hatch/bin/evernote list-tools
/opt/hatch/bin/evernote call-tool --name <tool> --arguments-json '<json-object>'
```

- The reviewed catalogue covers all 28 tools. The connected account may expose fewer: `search_tasks` is for individual accounts; `search_assigned_tasks` is for Business accounts.

- `delete_note` moves a note to the trash; `restore_note` restores it. `delete_task` removes a task. Confirm the exact note or task with the user before deleting it. Send task date-time arguments in UTC with a `Z` suffix; the provider can reject numeric timezone offsets.

- Reads and writes follow the user's connector settings. Manage and delete operations ask for approval by default.

- Check both the CLI exit status and the provider result for errors, including `isError: true`; an outer `ok: true` does not guarantee provider success. When wrapping CLI calls in a shell, preserve their exit status.

- After a failed or timed-out write, verify the provider state before retrying; its side effect may have completed.

## Add a note

- Find the intended notebook and read related notes before creating another, so the new note fits and does not duplicate one.

- Reads follow the user's connector settings, and creating a note asks for approval as those settings require.

- Never retry a failed or timed-out create automatically. Search for the note first, because Evernote may already have saved it.

## Attachments

- Download with `get_attachment` and `--output <local-path>`.

- Upload with `start_attachment_upload` and `--input <local-file>`. Include `noteId`, the file's lowercase MD5 `hash` and exact `sizeBytes` in the provider arguments, following the live schema from `list-tools`. The CLI transfers the file.

- Only after upload succeeds, register the attachment with `finalize_attachment`, using the same `noteId`, `hash` and `sizeBytes`, plus the file's real `mimeType` and optional filename from its live schema.

- Only after finalization succeeds, use `edit_note` to insert an `<en-media hash="..." type="..." />` fragment with the matching hash and MIME type, using `mode: "append"` to preserve existing content and place it at the end.

- If upload or finalization fails, stop this workflow; do not insert an `<en-media>` reference or attempt download. Re-read the note to inspect its state.

- Re-read the note to verify the attachment before reporting success.

## Related skills

- [Notes](/opt/muse/skills/knowledge-organization/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
