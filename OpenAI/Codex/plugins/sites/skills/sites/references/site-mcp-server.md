# Site MCP server

Build or update a Site-hosted MCP server and help users access its tools through the Site's plugin in ChatGPT or Codex.

## Build the server

Add `"mcp"` to the capabilities in `.openai/hosting.json` and expose a stateless JSON-RPC `POST /mcp` endpoint. Prefer MCP 2026-07-28 and implement:

- `server/discover`: Return `supportedVersions: ["2026-07-28"]` and `capabilities: {tools: {}}`.
- `tools/list`: Return a `tools` array with each tool's `name` and `inputSchema`.
- `tools/call`: Run `params.name` with `params.arguments` and return MCP `content` blocks; set `isError: true` for tool failures.

### Authentication

Sites authenticates MCP requests and checks that the caller can view the Site before forwarding them to your server. Enforce any additional access rules the tools require. Sites includes the caller's identity in the incoming `/mcp` request headers. Your server can read these headers when needed:

- `oai-authenticated-user-id`: Site-scoped user ID.
- `oai-authenticated-user-email`: Verified email address.
- `oai-authenticated-user-full-name`: Optional display name, percent-encoded UTF-8.

## Publish and connect

1. Publish the Site through the shared [workflow](../SKILL.md#workflow). When the owner publishes with `"mcp"` in `.openai/hosting.json` capabilities, Sites creates a private App and plugin for them. When the owner republishes, Sites refreshes the connected plugin's tools by fetching the latest tool list from the Site's `/mcp` endpoint.
2. Try the tools. The plugin may already be installed and connected automatically. If its tools are available, verify with a tool call, preferably read-only.
3. Help the user install or connect. If tools are missing and installation is unconfirmed, call `get_site` with `include_mcp_connection: true` to get the plugin ID, then call `plugin_management.suggest_plugins` with `{"plugin_ids": ["<returned plugin ID>"]}`. This shows the installation UI. If it reports "Already installed," a new chat may help the tools appear. The user can also open the plugin under Plugins → Personal → Created by you and choose Install or Connect as needed.

To use this Site's MCP tools in ChatGPT or Codex, reuse the plugin Sites creates when you publish. This connection doesn't need a separate App or plugin, local MCP configuration, or `codex mcp add` / `codex mcp login`.
