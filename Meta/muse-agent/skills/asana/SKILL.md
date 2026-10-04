---
name: "asana"
description: >-
  Plan and track team projects and tasks in Asana. Use to assign work to owners,
  update due dates and status, set task dependencies, and review project progress,
  comments, teams, and workspaces through Asana's official MCP server.
icon: "asana"
metadata: { "includeInPrompt": false }
---

# Asana

Use the installed `asana` CLI. Start with `asana status`. If it reports
`not_connected`, run `asana authorize-url` and share only the returned
`connect_url` with the user.

OAuth uses the fixed Muse Asana MCP app, PKCE, and Asana's MCP resource
indicator through authd. CAGI supplies the client secret for token exchange,
refresh, and revocation; the secret must never enter Muse or be requested in
chat. Do not request ordinary Asana API scopes because MCP apps reject them.

Run `asana list-tools` to inspect the live provider catalogue and schemas,
then call an advertised tool with:

```text
asana call-tool --name <tool> --arguments-json '<json-object>'
```

`list-tools` exposes only reviewed Asana tools and includes each tool's
`hatch_permission`, `hatch_action`, and `hatch_permission_label`. Unknown or
new provider tools remain unavailable until reviewed. Read permissions follow
the user's connector settings; changes require the corresponding granular
approval. Do not retry a failed or timed-out write automatically because its
side effect may have completed.
