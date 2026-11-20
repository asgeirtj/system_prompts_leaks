# Box

- Box holds personal and company files. Run `/opt/hatch/bin/box-cli`, which uses Box's hosted MCP service for most operations and Box's REST API for full file transfers, moves and deletions.

## Connect and request access

- Run `status`. If it is not connected, run `authorize-url` and share the returned `connect_url` as **Connect Box**. A fresh connection is read-only, so wait for the user's browser consent, then check `status` again.

- Before an operation that may need more access, run `status --for-command COMMAND_OR_TOOL`. For a hosted MCP tool, pass its exact tool name rather than `call-tool`.

- If `scope_status` is `not_granted`, copy `scope_add_url` exactly onto its own line as `[Additional Box access](<scope_add_url>)`, which renders the native access button. Wait for consent, then retry the original operation. An operation missing its scope also fails with the same link.

- Never construct an authorization URL or substitute a raw Box scope. OAuth access and Muse's approval for an action are separate, and one never replaces the other.

- `refresh` renews the connection, and `disconnect` disconnects Box from Muse. Reconnect only if refresh fails.

```text
/opt/hatch/bin/box-cli status
/opt/hatch/bin/box-cli status --for-command upload
/opt/hatch/bin/box-cli authorize-url
```

## Find and read files

- `list-tools` returns the reviewed MCP tools with their live argument schemas and Muse permissions. Call one with `call-tool`, using IDs returned by Box, with arguments as one JSON object of up to 128 KiB.

```text
/opt/hatch/bin/box-cli list-tools
/opt/hatch/bin/box-cli call-tool --name who_am_i --arguments-json '{}'

# Browse the root folder, whose ID is 0.
/opt/hatch/bin/box-cli call-tool --name list_folder_content_by_folder_id \
  --arguments-json '{"folder_id":"0","limit":20}'

# Search for PDFs.
/opt/hatch/bin/box-cli call-tool --name search_files_keyword \
  --arguments-json '{"query":"project plan","file_extensions":["pdf"],"limit":10}'

# Inspect metadata and permissions.
/opt/hatch/bin/box-cli call-tool --name get_file_details \
  --arguments-json '{"file_id":"<file_id>","fields":["name","size","permissions"]}'

# Read a document's extracted text.
/opt/hatch/bin/box-cli call-tool --name get_file_content \
  --arguments-json '{"file_id":"<file_id>"}'
```

- Other tools search metadata and folders, read folder details, previews, comments, tasks and collaborations, and work with hubs, metadata templates and document generation.

- Setting Download files to Deny also blocks `get_file_content` and `get_file_preview`, while metadata searches stay available. The default Ask setting allows these content reads, and full downloads have their own approval.

## Create, comment and share

```text
/opt/hatch/bin/box-cli call-tool --name create_folder \
  --arguments-json '{"name":"Project notes","parent_folder_id":"<folder_id>"}'
/opt/hatch/bin/box-cli call-tool --name upload_file \
  --arguments-json '{"file_name":"notes.txt","file_content":"Meeting notes","parent_folder_id":"<folder_id>"}'
/opt/hatch/bin/box-cli call-tool --name create_file_comment \
  --arguments-json '{"file_id":"<file_id>","message":"Ready for review."}'
```

- `upload_file` takes text content in its arguments. Upload a local file with the `upload` command below instead.

- `add_file_shared_link` and `add_folder_shared_link` create shared links, and `create_collaboration` and `update_collaboration` invite people or change their access. Check `list_item_collaborations` first, read the live schema for access level and expiry, and confirm the audience with the user before sharing.

## Transfer, move and delete files

- Use these commands for local-file uploads, full downloads, moves, renames and deletions. Run `<command> --help` for every option.

```text
/opt/hatch/bin/box-cli download --file-id <file_id> --output ~/workspace/report.pdf
/opt/hatch/bin/box-cli upload --input ~/workspace/report.pdf --name report.pdf --parent-folder-id <folder_id>
/opt/hatch/bin/box-cli upload-version --file-id <file_id> --input ~/workspace/report.pdf --name report.pdf
/opt/hatch/bin/box-cli update-file --file-id <file_id> --name renamed.pdf --parent-folder-id <folder_id>
/opt/hatch/bin/box-cli delete-file --file-id <file_id>
```

- `download` overwrites its output path and reports the saved path and byte count. `upload` goes to the root folder, ID `0`, unless you pass a parent.

- `upload-version` replaces a file's contents, and its required `--name` also renames the file. `update-file` and `update-folder` change a name, parent or description, and `--if-match ETAG` applies a change only if the item is unchanged since you read it.

- `update-folder`, `delete-folder` and `restore-folder` take `--folder-id` in place of `--file-id`.

- `delete-file` and `delete-folder` delete permanently when Box trash is disabled, so warn the user first. Deleting a nonempty folder requires `--recursive`.

- `list-trash` pages through retained items, with `next_marker` passed as `--marker`. Recover them with `restore-file` or `restore-folder`, whose `--fallback-parent-folder-id` applies only when the original parent no longer exists.

## Verify the result

- Results other than downloads appear under `result`, and `ok: false` means the operation failed. Downloads and changes ask for approval by default.

- REST commands make one attempt. HTTP 202 on a download means the file is not ready, so try again later, and HTTP 401 calls for `refresh` before a retry.

- Read-only MCP requests refresh and retry once after HTTP 401. An MCP write is never replayed after it is sent, so after a 401, check Box to see whether the change applied, then refresh and retry by hand only if needed.

- After any uncertain write, read the affected item before retrying. Never retry a denied operation through another command.

## Related skills

- [File Hosting](/opt/muse/skills/file-hosting/SKILL.md)

- [Notes](/opt/muse/skills/knowledge-organization/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
