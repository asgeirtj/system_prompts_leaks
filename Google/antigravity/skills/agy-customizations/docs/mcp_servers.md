# MCP Servers (`mcp_config.json`)

The Model Context Protocol (MCP) is an open standard that enables developers to
build secure, two-way integrations between AI models and their data/tools. In
Antigravity, configuring MCP servers allows you to expose custom tools,
resources, and prompts to the agent.

MCP servers can be configured globally or packaged within plugins.

--------------------------------------------------------------------------------

## Configuration File (`mcp_config.json`)

MCP servers are defined in a `mcp_config.json` file. The file contains a map of
server identifiers to their respective configurations.

### Location

*   **Global Configuration**: `~/.gemini/config/mcp_config.json` (applies to all
    sessions).
*   **Plugin Configuration**: `plugins/<plugin_name>/mcp_config.json` (active
    when the plugin is enabled).

--------------------------------------------------------------------------------

## Configuration Schema

Antigravity supports two transport mechanisms for MCP: **Stdio** (for local
command-line tools) and **Streamable HTTP** (for remote services).

```json
{
  "mcpServers": {
    "sqlite-helper": {
      "command": "sqlite-mcp-server",
      "args": ["/path/to/database.db"],
      "env": {
        "DB_READONLY": "true"
      }
    },
    "remote-service": {
      "url": "https://mcp.mycompany.com/mcp"
    }
  }
}
```

### 1. Stdio Transport (Local)

Used to run a local executable or script as an MCP server. The Language Server
spawns the process and communicates with it over standard input/output.

*   **`command`** (string, required): The executable to run (e.g., `node`,
    `python3`, or a binary name).
*   **`args`** (array of strings, optional): Arguments to pass to the command.
*   **`env`** (object, optional): Environment variables to inject into the
    server process.

### 2. Streamable HTTP Transport (Remote)

Used to connect to a remote MCP server over the  
[Streamable HTTP](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http)
transport.

*   **`url`** (string, required): The HTTP(S) URL of the remote MCP endpoint.  
    The legacy key `serverUrl` is also accepted.

The legacy HTTP+SSE transport (MCP spec 2024-11-05) is not supported. Point
`url` at the server's Streamable HTTP endpoint (often `/mcp` rather than
`/sse`). For a server that only speaks legacy SSE, run a stdio bridge such as
`mcp-remote` as a Stdio server instead.

--------------------------------------------------------------------------------

## How the Agent Uses MCP

Once an MCP server is configured and successfully connected:

1.  **Tool Discovery**: The system queries the server for its available tools.
2.  **Tool Injection**: Discovered tools are automatically added to the agent's
    toolset and listed in the system prompt.
3.  **Execution**: When the agent calls an MCP tool, the Language Server routes
    the request to the MCP server, executes it, and returns the result to the
    agent.

## Scoping and Scannability

*   **Global Servers**: Active for all conversations.
*   **Plugin Servers**: Only active when the parent plugin is loaded. Their
    tools are automatically prefixed or namespaced if necessary to avoid
    conflicts.
*   You can inspect active MCP servers and their tools in the UI by navigating
    to **Additional Options (...) > MCP Servers**.
