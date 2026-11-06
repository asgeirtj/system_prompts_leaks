# Dropbox

- Dropbox holds the user's files. Run `/opt/hatch/bin/dropbox`, which calls Dropbox's official MCP server and its file API with the account the user connects through Muse.

- This connector needs the user's own Dropbox account. A recipient may open a shared link without one, but that never allows uploading without an account.

## Connect and request access

- Run `status`. If it reports `not_connected`, run `authorize-url` and share only the returned `connect_url`. Never ask for tokens or app credentials in chat.

- The first connection is read-only. Before a write, or after one fails for missing access, run `status --for-command` with the tool name, or with `create-file` before an upload. If it returns `scope_status: not_granted`, copy `scope_add_url` exactly onto its own line as `[Additional Dropbox access](<scope_add_url>)`, which renders the native access button.

- Wait for consent, then retry once, and never construct the URL yourself. OAuth access and Muse's approval for the action are separate, and one never replaces the other.

- `refresh` renews the connection. Run `disconnect` only when the user asks, because it removes the stored connection.

```text
/opt/hatch/bin/dropbox status
/opt/hatch/bin/dropbox status --for-command create_shared_link
/opt/hatch/bin/dropbox authorize-url
```

## Find and call a tool

- Run `list-tools` for the reviewed tools and their live input schemas, and follow those schemas exactly. Never call a tool that is missing from the list.

```text
/opt/hatch/bin/dropbox list-tools
/opt/hatch/bin/dropbox call-tool --name <tool> --arguments-json '<json-object>'
/opt/hatch/bin/dropbox call-tool --name download --arguments-json '<json-object>' --output <path>
```

- The reviewed tools list, search, read and download files, read file and account metadata, inspect and create shared links and file requests, create folders, and copy, move and delete content. Use `check_job_status` when a result hands back a job to follow.

- `download` needs `--output`, and `list-tools` marks it with `hatch_requires_output`. It saves the file and returns only the saved path and byte count.

## Upload a local file

- Use `create-file` to create or replace a Dropbox file from a local file, with an absolute Dropbox path. It sends text or binary files, and files over 150 MiB go through an upload session.

```text
/opt/hatch/bin/dropbox create-file --path /Projects/report.pdf --input ~/workspace/report.pdf
```

- `create-file` replaces any file already at that path, so check the destination first. Never use the hosted `create_file` tool or put file bytes in command arguments.

- It never retries an unknown outcome. After an interrupted upload, check the destination before trying again, because the write may have completed.

- A file request collects uploads from other people and never uploads a file from Muse. After uploading, create a shared link if the user needs one, and check its access settings.

## Share and manage files

- Confirm the user's intent before deleting, moving or overwriting content, and keep unrelated content in place.

- Never request or show temporary download links, tokens or app credentials in chat, and never save a temporary link as a lasting reference. Share a shared link instead.

- Revision history and version restore are not available through this connector.

- After a failed or timed-out write, read the file or folder before retrying, because Dropbox may already have made the change.

## Related skills

- [File Hosting](/opt/muse/skills/file-hosting/SKILL.md)

- [Notes](/opt/muse/skills/knowledge-organization/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
