---
name: "dropbox"
description: >-
  Search, read, upload, organize, and share files and folders in the user's
  Dropbox cloud storage. Use to upload or download files, collect client uploads
  with file requests, inspect or create shared links, and create, copy, move, or
  delete content through Dropbox's official APIs.
icon: "dropbox"
metadata: { "includeInPrompt": false }
---

# Dropbox

Use the installed `dropbox` CLI. Start with `dropbox status`. If it reports
`not_connected`, run `dropbox authorize-url` and share only the returned
`connect_url` with the user. After connecting, run `dropbox list-tools` to get
the live input schemas for the reviewed Dropbox MCP catalogue.

The first connection requests read-only OAuth access. Before a write, or after
one fails for missing access, run `dropbox status --for-command <tool-name>`.
If it returns `scope_status: not_granted`, copy `scope_add_url` exactly and post
it on its own line as `[Additional Dropbox access](<scope_add_url>)` so the
client renders the native access button, then wait for consent to finish before
retrying once. OAuth access does not replace Hatch approval. Never construct a
scope URL or ask for tokens in chat.

```text
dropbox list-tools
dropbox call-tool --name <tool-name> --arguments-json '<JSON object>'
dropbox call-tool --name <tool-name> --arguments-json '<JSON object>' --output <path>
dropbox create-file --path <dropbox-path> --input <local-path>
```

The reviewed catalogue supports listing, searching, reading, and downloading
files; file and account metadata; inspecting and creating shared links and file
requests; and creating, copying, moving, deleting, or sharing content. Follow the
schema returned by
`dropbox list-tools` exactly. Never call a tool that is absent from that list.

Use `create-file` to create or replace a Dropbox file from a local file. It
accepts text and binary files up to 150 MiB.

File requests collect uploads from other people; they do not upload a local file
from this VM. The CLI does not expose revision history or version restore.

Use `--output` when the selected tool returns binary content. Never request or
expose temporary download links, OAuth tokens, or Dropbox app credentials in
chat. Confirm destructive intent before deleting, moving, or overwriting
content.
