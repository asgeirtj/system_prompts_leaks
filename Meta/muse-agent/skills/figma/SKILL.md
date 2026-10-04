---
name: "figma"
description: >-
  Inspect Figma designs and generate implementation context for screens and
  interfaces. Use to read component variants, spacing and design tokens, inspect
  layouts and design-system libraries, and extract image assets for implementing
  a design through Figma's official MCP server.
icon: "figma"
metadata: { "includeInPrompt": false }
---

# Figma

Use the installed `figma` CLI. Start with `figma status`. If it reports
`not_connected`, run `figma authorize-url` and share only the returned
`connect_url` with the user.

OAuth uses Dynamic Client Registration and PKCE through authd. Figma issues a
per-registration confidential client; authd stores its generated secret outside
the runtime cell, so credentials must never be requested in chat.

Run `figma list-tools` to inspect the live provider catalogue and schemas,
then call an advertised tool with:

```text
figma call-tool --name <tool> --arguments-json '<json-object>'
```

`list-tools` exposes only reviewed Figma tools and includes each tool's
`hatch_permission`, `hatch_action`, and `hatch_permission_label`. Unknown or
new provider tools remain unavailable until reviewed. Read permissions follow
the user's connector settings; design, file, asset, Code Connect, plugin, and
shader changes require granular approval. Do not retry a failed or timed-out
write automatically because its side effect may have completed.

## Load Figma's provider skills

Before calling a tool whose description requires a Figma skill, fetch that
skill with `get_figma_skill` and follow its prerequisites. These `skill://`
URIs refer to resources on Figma's MCP server. For example, before
`create_new_file`, read:

```text
figma call-tool --name get_figma_skill --arguments-json '{"uri":"skill://figma/figma-create-new-file/SKILL.md"}'
```

Use the skill URI advertised by the tool. If the relevant URI is unknown,
fetch `skill://index.json` with the same tool and select the matching skill.
Fetch supporting references only as needed, resolving relative paths against
the parent skill URI. Reuse guidance already loaded for the current task;
there is no need to install or copy these provider skills into the local
skill directory. Skill reads use the `designs.read` permission.

Call `get_figma_skill` only when advertised by `list-tools`. If the tool is
unavailable or Figma confirms that a skill is missing, continue using the
live tool description, schema, and local guides only when the skill is
optional (for example, "if it exists"). If the skill is required
unconditionally, stop the dependent operation and report the missing
guidance. Authentication failures, permission denials, timeouts, and other
read errors do not establish that a skill is missing. Avoid repeated failed
lookups; continue work that does not depend on the unavailable guidance.

## Choose the workflow

Read only the guide that matches the task before calling provider tools:

- Implement a Figma design in code: [design-to-code](references/design-to-code.md)
- Create or edit canvas content with `use_figma`:
  [canvas editing](references/canvas-editing.md)
- Generate a FigJam diagram: [diagrams](references/diagrams.md)
- Create Code Connect mappings: [Code Connect](references/code-connect.md)

For a Figma URL, extract its `fileKey` and `node-id`; convert node IDs from URL
form (`123-456`) to API form (`123:456`). Inspect the live schema before
constructing arguments because Figma can add optional fields without changing
this skill.

Avoid redundant catalogue, context, screenshot, and validation calls. Figma
applies account- and seat-dependent usage limits, and repeated reads can consume
a user's small monthly allowance. Reuse results gathered earlier in the task.
