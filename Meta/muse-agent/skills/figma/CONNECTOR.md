# Figma

- `/opt/hatch/bin/figma` calls Figma's official MCP server for the connected account. Use it to read designs and design systems, download assets, and make the reviewed changes that `list-tools` returns.

- Figma connects through OAuth with dynamic client registration, and Muse keeps the generated client secret outside the conversation. Never ask the user for Figma credentials.

## Connect

- Run `/opt/hatch/bin/figma status`. When connected, it also checks the MCP server and lists the available tools.

- If `auth_status` is `not_connected`, run `authorize-url` and share only the returned `connect_url`.

- `disconnect` deletes the stored connection at once. Run it only when the user asks to disconnect Figma.

## Call an operation

```text
/opt/hatch/bin/figma list-tools
/opt/hatch/bin/figma call-tool --name <tool> --arguments-json '<JSON object>'
```

- `list-tools` returns live schemas for the reviewed tools, each with `hatch_action` showing whether Muse treats it as a read or a write. A tool Figma adds stays unavailable until it is reviewed.

- Build arguments from the live schema, because Figma adds optional fields without notice. `call-tool` returns the provider's response under `result`.

- Reads follow the user's connector settings. Creating files, generating designs or diagrams, editing designs, uploading assets and changing Code Connect, plugins or shaders each ask for approval.

- Each call runs once. After a failed or timed-out write, inspect the file before trying again, because the change may already have landed.

## Find the design

- From a Figma URL, keep the `fileKey` and the `node-id`. Convert the node ID from URL form (`123-456`) to API form (`123:456`).

- Read a node with `get_design_context`, `get_screenshot`, `get_metadata` or `get_variable_defs`. Use `get_figjam` for a FigJam board and `get_motion_context` for animation.

- Use `search_design_system` and `get_libraries` for components and styles, and `download_assets` for the images a design uses.

## Read Figma's guides first

- When a tool's description requires a Figma guide, fetch it with `get_figma_skill` before the operation and follow its prerequisites. Use the URI the tool advertises:

```text
/opt/hatch/bin/figma call-tool --name get_figma_skill --arguments-json '{"uri":"skill://figma/figma-create-new-file/SKILL.md"}'
```

- When the URI is unknown, fetch `skill://index.json` the same way and choose the matching entry. Resolve a guide's supporting paths relative to its URI and read them only as needed.

- These guides live on Figma's server, and reading them follows the user's setting for reading designs. Reuse a guide already read in the task, and never copy guides into the local skills.

- Call `get_figma_skill` only when `list-tools` advertises it. If it is absent or Figma confirms a guide is missing, continue from the live schema only when the guide was optional. A required guide that is missing blocks its operation, so report that.

- An authentication failure, denial or timeout does not prove a guide is missing. Avoid repeating a failed lookup and continue the work that does not depend on it.

## Choose the operation guide

- [Design to code](references/design-to-code.md) for reading a design to implement it in a codebase.

- [Canvas editing](references/canvas-editing.md) for inspecting or changing nodes with `use_figma`.

- [FigJam diagrams](references/diagrams.md) for creating a diagram from Mermaid with `generate_diagram`.

- [Code Connect](references/code-connect.md) for mapping published components to code.

## Limits

- Figma limits MCP usage by plan and seat, and some accounts have a small monthly allowance. Reuse schemas, context, screenshots and validation results already gathered in the task rather than requesting them again.

## Related skills

- [App Creation](/opt/muse/skills/app-creation/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
