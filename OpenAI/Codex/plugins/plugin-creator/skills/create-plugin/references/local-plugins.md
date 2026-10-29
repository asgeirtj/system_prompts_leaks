# Build a local plugin

Use the selected repository and runtime for local source or direct machine
access. User-selected files alone may only need an Extensions file handler.

## Build the package and runtime

Follow [package format](plugin-packages.md). Use the host's available local
authoring helpers for scaffolding and installation. In Codex, the bundled
`plugin-creator` skill covers marketplaces and compatibility manifests;
it is separate from this plugin's `create-plugin` skill.

For a local MCP process, build the server in the chosen language/runtime and
describe its actual command in portable `mcp.json`. For example, after building
a Node server to the indicated path:

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "local-tools": {
      "type": "stdio",
      "command": "node",
      "args": ["${PLUGIN_ROOT}/server/dist/index.js"],
      "cwd": "${PLUGIN_ROOT}"
    }
  }
}
```

Use the actual built entrypoint. Keep protocol output on stdout and logs on
stderr; scope file/process access to the request. When an interactive view
helps the workflow, add an MCP App and the relevant
[Extensions](extensions.md).

## Install locally when requested

Use the target host's supported installation flow. In Codex,
`~/.agents/plugins/marketplace.json` is discovered implicitly; a custom
marketplace needs registration. Preserve existing entries and check the
installed CLI's help for supported commands.

Edit the marketplace's source directory, then reload/reinstall using the host's
flow. The bundled helpers handle the version cachebuster; do not edit the cache.

Verify startup, tool discovery, a harmless call, and any app view in the target
host. An account upload does not make a local process available on web/mobile.
Use the account creation tools only when saving a package to the account is
requested. For source/ZIP-only requests, return the artifact without installing.
