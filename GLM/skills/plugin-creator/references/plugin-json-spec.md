# ZCode plugin and marketplace reference

A plugin uses `.zcode-plugin/plugin.json`. Its `name` is its stable identifier; this scaffold uses lower-case hyphenated names, at most 64 characters, and initial version `0.1.0`.

```json
{
  "name": "my-plugin",
  "version": "0.1.0",
  "description": "The implemented workflow",
  "author": { "name": "Your team" },
  "skills": "./skills"
}
```

Optional components: `skills` and `commands` point to directories; `hooks` points to `hooks/hooks.json`; `mcpServers` can point to `.mcp.json` or contain the server configuration. Only declare real resources. Paths stay within the plugin root. Use `${CLAUDE_PLUGIN_ROOT}` in MCP arguments and hook commands for the runtime plugin location. The loader handles the token; shell scripts must not guess the install cache path.

Skills contain `<name>/SKILL.md` with `name` and `description` YAML frontmatter. Commands are Markdown documents. The generator provides minimal examples for skills, commands, MCP and SessionStart hooks. Implement the actual requested behavior before reporting success.

## Marketplace

For a local marketplace, use `.claude-plugin/marketplace.json` at its root. The root-level `marketplace.json` is also supported by ZCode. Sources are resolved against that root, not the `.claude-plugin` directory.

```json
{
  "name": "my-market",
  "plugins": [
    {
      "name": "my-plugin",
      "source": "./plugins/my-plugin",
      "version": "0.1.0",
      "description": "The implemented workflow",
      "displayName": "My Plugin",
      "displayName_i18n": { "zh-CN": "我的插件" },
      "description_i18n": { "zh-CN": "已实现的工作流说明" },
      "category": "productivity"
    }
  ]
}
```

Presentation belongs to the marketplace entry. Common categories are `developer-tools`, `productivity`, `utilities`, `legal`, `template`, `finance`, `other`. Icons use a reachable HTTPS URL; omit absent assets rather than fabricating a URL. Keep this test handoff on a local directory source; distribution through other source types requires checking the target version's supported format separately.

Use this development layout. When Node is already available, `upsert-dev-marketplace.mjs` can prepare it with a stable path-based market name:

```text
<workspace>/plugins/
  marketplace.json       name: dev-<workspace>-<canonical-path-hash>
  my-plugin/
    .zcode-plugin/plugin.json
    skills/my-plugin/SKILL.md
```

The listing source in this layout is `./my-plugin`, and its version and description follow the plugin manifest. Names and Chinese presentation metadata stay in the listing. Read the helper's JSON output for the actual ID. Without Node, create the same catalog with file tools, choose a distinct `dev-` prefixed marketplace name and retain it on later edits. An existing chosen market keeps its own name; pass its file explicitly if later using the helper. Creating this file alone does not register or install anything. Follow [the manual UI handoff](installing-and-updating.md) to guide the user through addition, installation and later updates.

## Optional authoring helpers

Use only an already available Node runtime, with actual absolute script paths:

```bash
node "<skill-root>/scripts/create-basic-plugin.mjs" my-plugin --with-skills
node "<skill-root>/scripts/upsert-dev-marketplace.mjs" "<plugin-path>" --display-name "My Plugin" --name-zh "我的插件" --description-zh "实际用途说明"
```

Scaffold components are selected with `--with-skills`, `--with-mcp`, `--with-hooks`, `--with-commands`, `--with-scripts`, `--with-assets`. `--path <parent-directory>` changes the plugin's parent directory. The helper refuses existing files by default. `--marketplace-path <existing-file>` on the listing helper explicitly selects a previously chosen market and preserves its name. Ordinary updates edit source instead of using scaffold `--force`.

These helpers prepare files only. Their use does not authorize registration or installation. If Node is unavailable, use file tools and the manifest/catalog examples above; asking the user to install Node is not part of this handoff.

Fields and conventions from other plugin formats, such as `interface`, availability/authentication `policy`, `.app.json`, implicit `~/.agents/plugins/marketplace.json` discovery and custom-scheme handoff links, are not this workflow's contract. Use ZCode's format, and distinguish source inspection from any schema/runtime validation actually performed.
