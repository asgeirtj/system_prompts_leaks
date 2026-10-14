---
name: "todoist"
description: "Read and manage Todoist tasks, projects, comments, labels, filters, and reminders through Todoist's official MCP server."
icon: "todoist"
metadata: { "includeInPrompt": false }
---

# Todoist

Use the installed `todoist` CLI. Start with `todoist status`. If it reports
`not_connected`, run `todoist authorize-url` and share only the returned
`connect_url` with the user.

OAuth uses Dynamic Client Registration and PKCE through authd. No shared client
secret enters Muse, and credentials must never be requested in chat.

The first connection requests read-only Todoist access. If a requested change
fails because Todoist write or delete access has not been granted, direct the
user to add it in Settings; Hatch approval for the action remains separate.

Run `todoist list-tools` to inspect the live provider catalogue and schemas,
then call an advertised tool with:

```text
todoist call-tool --name <tool> --arguments-json '<json-object>'
```

`list-tools` exposes only reviewed Todoist tools and includes each tool's
`hatch_permission`, `hatch_action`, and `hatch_permission_label`.
`delete-object` is authorized as `projects.delete` for projects and as
`items.delete` for every other object type. Unknown or new provider tools
remain unavailable until reviewed. Read permissions follow the user's connector
settings; changes require the corresponding granular approval. Do not retry a
failed or timed-out write automatically because its side effect may have
completed.
