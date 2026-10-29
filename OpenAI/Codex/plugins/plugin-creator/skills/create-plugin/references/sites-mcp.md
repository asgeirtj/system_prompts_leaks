# Host a plugin with Sites MCP

Sites MCP is the default hosting path for a new cloud plugin. Read the
available Sites plugin's `sites` skill, then its **Site MCP server** reference
at `references/site-mcp-server.md`, relative to that skill's directory. Follow
`sites` for setup and publishing, and the MCP reference for server implementation,
authentication, and connection. If the skill, reference, or backend is unavailable,
explain the gap and continue independent source work without promising a
working connection or substituting another host.

## Build the requested surface

Reuse an existing Site's source and project identity. Follow the Sites skill's  
**Site MCP server** reference for the server implementation; choose the
user-facing surface from the request:

- **Tools used in chat:** build the MCP endpoint and required storage. Keep the
  website page minimal: the app's purpose and useful connection/status information.
- **Interactive views:** add an MCP App when a view helps the workflow. Choose
  useful [Extensions](extensions.md) and follow that guide's implementation and
  verification steps. A published website URL is not an MCP App view.
- **A website people will use:** follow `sites`. Add MCP to the same
  application when the request also needs tools in chat; a standalone website
  does not require a plugin or MCP server.

## Publish and connect

Sites publishing provisions the App and its canonical private plugin. Follow
the **Site MCP server** reference's publishing and connection steps, then verify
the requested tools and any in-chat view. Do not use `create_plugin` to create a duplicate,
including while provisioning is pending. Reuse the existing App/plugin on updates
and preserve Site sharing and plugin access separately. Honor source-only requests without deploying.

For skills in the Site's existing plugin, follow
[account plugin updates](../../update-plugin/references/account-updates.md#skills-in-app-backed-plugins).
Keep website, MCP tool, and Extension changes in the existing Site source.
