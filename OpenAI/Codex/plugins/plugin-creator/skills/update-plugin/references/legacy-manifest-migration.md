# Legacy manifest migration

Use this mapping when the current release has only `.codex-plugin/plugin.json`
and needs a root Agent Plugins 1.0 `plugin.json`. Convert the existing source;
do not reconstruct it from a new-plugin example. Keep a copy of the original
manifest and inventory its referenced files before editing. Apply the user's
requested changes to the preserved values, then perform the update skill's
before-publication comparison.

## Map metadata without losing values

Add root `$schema` with the exact value  
`https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`.

| Existing source | Root `plugin.json` destination |
| --- | --- |
| `name`, `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords` | The same root keys. Preserve complete compatible values; bump `version` as required by the update skill. |
| Entire `interface` object | `extensions["com.openai"].interface`. Copy the complete object, including prompts, descriptions, URLs, capabilities, colors, icons, and screenshots. |
| `apps`, `hooks`, `requires_local_executor`, `publicationPolicy`, `id` | The same keys inside `extensions["com.openai"]`, preserving their values. The manifest `id` is not a substitute for the verified backend `plugin_id`. |
| Existing `extensions` | Preserve all namespaces at root. Keep existing `extensions["com.openai"]` fields, including `onboardingSkill`, `review`, and `publication`, at that level; do not nest another `extensions` object inside it. |
| `skills` | Preserve the effective skill set in fixed `skills/<skill-name>/SKILL.md` locations, as described below. Do not copy the path override into the portable manifest. |
| `mcpServers` / `.mcp.json` | Convert the effective server configuration to root `mcp.json`, as described below. Do not copy the legacy path override into the portable manifest. |

Start with the existing `extensions` object and add the mapped OpenAI fields.
If a destination already has a conflicting value, do not silently overwrite
either value. Resolve it against the requested edit and the current effective
configuration; stop and explain any unresolved conflict. Account for every
source field. For an unlisted field, establish a supported lossless mapping
before continuing; do not invent a destination or silently discard it.

Preserve supported empty, false, and null values rather than filtering fields
by truthiness. Portable fields have stricter types than some legacy fields:
for example, root `author` supports only `name`, `email`, and `url`, and root
`homepage`, `repository`, and `license` must be strings. If an existing value
cannot be represented, leave the current release untouched and explain the
incompatibility instead of dropping or coercing it to make validation pass.

## Preserve the complete interface

Plugin-level `defaultPrompt` accepts one string or an array of up to three
strings. Copy its entire value, retaining its type, prompt text, and order.
For example, `["Show prices", "Compare products", "Check stock"]` must remain
that three-element array when only the display name changes. Do not truncate,
deduplicate, rewrite, or substitute starter prompts during conversion.

Legacy `interface.default_prompt` is also accepted. When that alias supplies
the existing prompt value, write the same value under canonical `defaultPrompt`;
otherwise canonical loading can default `defaultPrompt` to null and hide the
alias. If both keys exist with different values, resolve the conflict before
publishing. This is separate from a skill's `agents/openai.yaml`
`interface.default_prompt`, which is a single string and is not the plugin's
starter-prompt list.

Once root `extensions["com.openai"]` exists, the loader selects that entire
object instead of the legacy manifest's client configuration. It does not fill
missing fields from the legacy file. Keeping the original prompts or assets
only in `.codex-plugin/plugin.json` does not preserve their effective values.
If retaining that file for compatibility, synchronize its repeated metadata
and interface with the completed root manifest, and retain the component
declarations needed by older clients. Those declarations do not override the
portable skill or MCP locations.

## Preserve components and referenced files

- **Skills:** inventory the skills actually discovered by the current release,
  including custom legacy paths. The portable format discovers only
  `skills/<skill-name>/SKILL.md`. Copy any skills that need relocation with their
  supporting files, preserve their contents, and adjust affected references,
  including `onboardingSkill`, to equivalent paths. Do not overwrite colliding
  skill directories or add previously inactive skills. Verify the discovered
  set stays the same; legacy path declarations cannot restore omitted skills.
- **Apps, hooks, and assets:** preserve their configuration and every referenced
  file. Keep `.app.json` contents, app IDs, and required/optional settings unless
  the user requested changes. Moving metadata under an extension does not by
  itself move files or change paths, which remain relative to the plugin root.
- **MCP:** inventory the currently effective servers, not just files present in
  the bundle. An undeclared `.mcp.json` can contain inactive servers; preserve
  that file without activating its servers in root `mcp.json`. Translate the
  effective configuration into root `mcp.json` with
  `$schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json"`. Convert
  legacy `"type": "http"` to `"type": "streamable-http"`, infer `"type": "stdio"`
  for command-based entries without a type, and normalize legacy `"cwd": "."`
  to `"cwd": "${PLUGIN_ROOT}"`. Preserve server names and supported transport,
  command, argument, URL, header, environment, authentication, and working-directory
  settings. Do not drop an unsupported option to satisfy the portable schema;
  explain it and stop if no equivalent mapping exists. Keep `.mcp.json` when
  older-client compatibility needs it. Root `mcp.json` controls portable MCP;
  a legacy overlay cannot restore a server omitted there.

The update API preserves omitted files and replaces uploaded files whole; it
does not merge JSON fields or delete omitted files. Package any relocated or
changed files, and check the resulting package's effective configuration rather
than treating the continued presence of an old file as proof of preservation.
