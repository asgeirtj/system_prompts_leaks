---
name: "slack"
description: >-
  Read and search messages, channels, and threads in the user's Slack workspace.
  Use to catch up on team discussions and decisions, post channel messages, and
  reply to coworkers through Slack's official MCP server.
icon: "slack"
metadata: { "includeInPrompt": false }
---

# Slack

Use the installed `slack` CLI. Start with `slack status`. If it reports
`not_connected`, run `slack authorize-url` and share only the returned
`connect_url` with the user.

Slack requires a fixed registered app identity and does not support Dynamic  
Client Registration. The test app is limited to its development workspace;  
the production app must be approved for Slack Marketplace distribution before
users from other workspaces can connect.

Run `slack list-tools` to inspect the reviewed subset of the live provider
catalogue and its permission annotations, then call an advertised tool with:

```text
slack call-tool --name <tool> --arguments-json '<json-object>'
```

Slack's catalogue contains both reads and mutations and can change over time.
The CLI allows only explicitly reviewed tools: read operations are allowed by
default and mutations require approval with an argument preview. Unknown or new
provider tools fail closed. Direct file reads, signed upload URLs, and unreviewed
list tools remain unavailable until they have dedicated delivery handling.
Never request OAuth tokens or app credentials in chat.
