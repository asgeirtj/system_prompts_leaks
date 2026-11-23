---
name: plugin
description: How to manage and create plugins — namespaced bundles of skills, agents, rules, MCP servers and hooks that install, enable and disable as a single unit. Use this skill when the user wants to enable, disable, install or uninstall a plugin, when they want to create a new plugin, or when a new customization should be packaged into a plugin rather than left loose. Also triggered by the /plugin slash command. Don't use for the underlying customization system itself — discovery roots, loading priority, or authoring a standalone skill, agent, rule, hook or MCP server outside a plugin; see the customizations guide skill for those.
---

# Plugins

A **plugin** is a namespaced bundle of customizations that ships, installs, and
turns on as one unit. It can contain skills, agents, rules, MCP servers and
hooks. When a plugin is on, everything inside it is active; disabling it takes
the whole bundle down at once.

Your job is either to change a plugin's lifecycle state or to get new
functionality into the right plugin. Step 0 and Step 1 are common to both; Step
1 routes you to Step 2A or Step 2B.

For the underlying customization system — discovery roots, loading priority,
what each customization type is for — see the customizations guide skill. This
skill does not restate that material.

## Quick Start

After writing `/tmp/lsrpc.sh` in **Step 0**, prefix `lsrpc GetAllPlugins` with
`source /tmp/lsrpc.sh &&` and key every `customization://<dir>` link on `<dir>`
(the install directory name `(.path | split("/") | last)` from Step 0, never
`plugin.json`'s `name`):

`<!-- mdformat off -->`
| Operation | Command / Action | Key Guardrail |
| :--- | :--- | :--- |
| **Inventory installed plugins** (Step 0) | `source /tmp/lsrpc.sh && lsrpc GetAllPlugins '{"workspaceUris":["file:///path/to/workspace"]}' \| jq '[.plugins[] \| {name, dir: (.path \| split("/") \| last), disabled: (.disabled // false), isGlobal, skills: [.skills[]?.name], agents: [.agents[]?.name], rules: [.rules[]?.absolutePath], hooks: ((.hooksJson // "") \| length > 0), mcp: [.mcpServers[]?.name]}]'` | Never read `GetAllPlugins` unfiltered (inlines full `SKILL.md` text); always pipe through `jq` and use `dir` for links (`'{}'` if no workspace is active). |
| **Enable / Disable plugin** (Step 2A) | Give the user `[<name>](customization://<dir>)` so they can toggle it on the Customizations page | Takes effect live (no restart). Never call `JetboxWriteState` (restricted in `run_command`) or hand-edit `~/.gemini/config/config.json`. |
| **Uninstall user plugin** (Step 2A) | Give the user `[<name>](customization://<dir>)` so they can uninstall it on the Customizations page | If `.path` contains `/builtin/plugins/`, explain that built-in plugins cannot be uninstalled and can only be disabled on that page. Never call `DeletePlugin` (restricted in `run_command`). |
| **Install Marketplace plugin** (Step 2A) | Call `search_marketplace` (if the ID is unknown) and emit `<plugin-card catalog-id="<marketplace-id>"></plugin-card>` on its own line | Never call `InstallCustomization` (restricted in `run_command`) or guess `<marketplace-id>` from `name`. Tell the user they can install it from the card. |
| **Author / consolidate plugin** (Steps 2B–4) | Create `~/.gemini/config/plugins/<name>/plugin.json` (or in source repo if published) + used subdirectories (`skills/`, `agents/`, `rules/AGENTS.md`, `mcp_config.json`, `hooks.json`, `assets/logo.svg`) | Check Step 0 inventory for `name` collisions first; re-run Step 0 inventory and link as `[<name>](customization://<dir>)` (never `plugin://`). |
`<!-- mdformat on -->`

## Step 0: Preflight and inventory

Every path needs to know what is already installed. Talk to the language server
over its local Connect endpoint. The address and CSRF token are normally already
in your shell environment; you do not need to hunt for a port file.

```bash
: "${ANTIGRAVITY_LS_ADDRESS:=localhost:5387}"
curl -sS "http://${ANTIGRAVITY_LS_ADDRESS}/healthz"
```

Write the helper to a file once, then source it in every call below. Each
command you run is a fresh shell, so a function defined in one call is gone by
the next; sourcing a file is what makes it reusable.

```bash
cat > /tmp/lsrpc.sh <<'EOF'
: "${ANTIGRAVITY_LS_ADDRESS:=localhost:5387}"
lsrpc() {  # usage: lsrpc <MethodName> <json-body>
  curl -sS -X POST \
    "http://${ANTIGRAVITY_LS_ADDRESS}/exa.language_server_pb.LanguageServerService/$1" \
    -H "Content-Type: application/json" \
    -H "x-codeium-csrf-token: ${ANTIGRAVITY_CSRF_TOKEN}" \
    -d "$2"
}
EOF
```

Now list the installed plugins, passing active workspace URIs in
`workspaceUris` so workspace-scoped plugins are discovered (or `'{}'` when no
workspace is active). Prefix every `lsrpc` snippet in this skill with  
`source /tmp/lsrpc.sh &&`:

```bash
source /tmp/lsrpc.sh && lsrpc GetAllPlugins '{"workspaceUris":["file:///path/to/workspace"]}' | jq '[.plugins[] | {
  name,
  dir: (.path | split("/") | last),
  disabled: (.disabled // false),
  isGlobal,
  skills: [.skills[]?.name],
  agents: [.agents[]?.agent.name],
  rules: [.rules[]?.absolutePath],
  hooks: ((.hooksJson // "") | length > 0),
  mcp: [.mcpServers[]?.name]
}]'
```

> **Never read `GetAllPlugins` unfiltered.** The response inlines the *full  
> text* of every bundled `SKILL.md`. A single plugin can exceed 16KB and a  
> populated config will flood your context. Always pipe it through `jq`.

**`dir` is the identifier that matters.** It is the install directory name — the
last path segment — and it is what every `customization://<dir>` link is keyed
on. It can differ from `name` in `plugin.json`: a plugin written by hand can
sit in a directory of any name, and a Marketplace plugin installed by an older
release sits in a directory named after its numeric catalog ID, such as
`-1870732469773246571`. Using `name` where `dir` is expected builds a broken
link or path.

## Step 1: Decide the kind

-   The user names an existing plugin and a lifecycle verb — "turn off X",
    "install Y", "get rid of Z" -> **Step 2A**.
-   The user wants new capability, or wants existing loose customizations tidied
    up — "I want a Strava thing", "package these skills together" -> **Step
    2B**.

## Step 2A: Lifecycle operations

Language Server state-mutation RPCs (`JetboxWriteState`, `DeletePlugin`, and
`InstallCustomization`) are restricted from `run_command` subprocesses. Always
guide the user through the UI link or Marketplace card below rather than calling
those RPCs from `run_command` or editing `~/.gemini/config/config.json`.

**Enable, disable, or uninstall an installed plugin.** Resolve the target to its
`dir` from the Step 0 inventory first. If the user's words match several
plugins, ask which one rather than guessing.

-   **Enable or disable:** Give the user a direct link to the plugin's page in
    Customizations — `[<name>](customization://<dir>)` — where they can toggle
    it on or off (takes effect live, no restart required). Never hand-edit
    `~/.gemini/config/config.json`: writes that bypass the language server miss
    the live reload and risk clobbering concurrent `userSettings` or permission
    grants.
-   **Uninstall:** Check whether `.path` contains `/builtin/plugins/`:
    -   **Built-in plugins (`/builtin/plugins/`) cannot be uninstalled** because  
        they ship with the product. Explain this to the user and give them  
        `[<name>](customization://<dir>)` so they can disable it instead.
    -   **User or Marketplace plugins:** Give the user  
        `[<name>](customization://<dir>)` so they can uninstall it from the  
        plugin's page in Customizations.

**Install a Marketplace plugin.** For a plugin published to the Agent  
Marketplace:

1.  If you do not already have the catalog ID, look it up with the
    `search_marketplace` tool (never guess `<marketplace-id>` from the plugin's
    `name`).
2.  Render the Marketplace card on its own line so the user can install it with
    one click:

    ```markdown
    <plugin-card catalog-id="<marketplace-id>"></plugin-card>
    ```

3.  Tell the user they can install the plugin directly from the card. If the
    plugin is not in the Marketplace catalog, tell the user it isn't available
    to install.

Lifecycle operations end here; you do not need Steps 3 or 4.

## Step 2B: Decide where the functionality belongs

A plugin is a bundle, so the first question is never "what do I build" but
"where does it go". Take the inventory from Step 0 and see whether the request
fits an existing plugin. Plugins tend to cohere around one of three shapes:

-   **A data provider or external service.** Everything that talks to one system
    — Strava, GitHub, a particular API. Its MCP server, the skill that drives
    it, and the rules about its quirks belong together.
-   **An artifact or file type.** Spreadsheet handling, proto editing, log
    analysis. Grouped by what the user is operating *on*.
-   **A role or recurring job.** Data analysis, running a small business,
    reviewing documents, writing code. Broader, and the right home when a
    capability spans several providers in service of one repeated task.

**Recommend and proceed.** State in one line which plugin you picked and why,
then keep going. Use **`ask_question`** only when two existing plugins are
genuinely close, or when nothing fits and the boundary for a new one is unclear.
Do not stall on a decision the user can trivially reverse.

If nothing fits, create a new plugin at `~/.gemini/config/plugins/<name>/`.
Before settling on a name, check it against the Step 0 inventory: names share
one global namespace, and when two plugins claim the same name the first
discovered wins and the other is dropped **silently**.

If the plugin is meant to be shared or published, create it in the source
repository it will be published from instead of the user's config directory.

### Consolidating loose customizations

When the user asks to tidy up standalone customizations, move the directories: a
skill at `~/.gemini/config/skills/foo/` becomes
`~/.gemini/config/plugins/<name>/skills/foo/`, and a rule becomes
`rules/AGENTS.md` inside the plugin.

MCP servers need a warning first. Moving an entry out of the user's
`mcp_config.json` and into the plugin's own `mcp_config.json` ties its lifecycle
to the plugin: it is assembled only while the plugin is enabled, so disabling
the plugin stops its tools being offered along with everything else in the
bundle. Control moves with it too, since the server is no longer an entry in the
user's own config and is managed through the plugin rather than on its own. Tell
the user this before you move the entry.

## Step 3: Author the bundle

Create only the subdirectories the plugin actually uses:

```text
~/.gemini/config/plugins/<name>/
├── plugin.json       # required
├── README.md         # user-facing docs; never read by the agent
├── mcp_config.json   # optional, same format as the user's own
├── hooks.json        # optional
├── assets/logo.svg   # optional
├── skills/<skill>/SKILL.md
├── agents/<agent>.md
└── rules/AGENTS.md
```

Write the inner customizations yourself — the `SKILL.md`, the agent markdown,
the rules, the MCP config. Do not hand that back to the user as a follow-up.
Rules in a plugin's `rules/AGENTS.md` are plain markdown with no frontmatter and
are always on while the plugin is enabled.

`plugin.json` is parsed as JSONC, so comments and trailing commas are allowed:

```json
{
  "name": "strava",
  "description": "Strava integration: pull activity data, summarize training load, and draft workout notes.",
  "logo": "assets/logo.svg",
  "suggestedPrompts": [
    "Summarize this week's workout mileage and heart rate zones",
    "Compare pacing and cadence across my last 4 long runs",
    "Draft an annotated Strava description for my latest activity"
  ]
}
```

| Field              | Type     | Notes                                        |
| ------------------ | -------- | -------------------------------------------- |
| `name`             | string   | The label users see, and the global unique   |
:                    :          : key — two plugins sharing a `name` collide   :  
:                    :          : and one is dropped. **Not** the install      :  
:                    :          : identifier; that is the directory. Lowercase :  
:                    :          : kebab-case. Defaults to the directory name   :  
:                    :          : if omitted.                                  :  
| `description`      | string   | One or two sentences saying what the plugin  |
:                    :          : does and who it is for. This is what         :  
:                    :          : Marketplace search matches.                  :  
| `logo`             | string   | Optional. A path relative to the plugin      |
:                    :          : directory, such as `assets/logo.svg`, ending :  
:                    :          : in `.png`, `.svg`, `.jpg`, `.jpeg` or        :  
:                    :          : `.webp`. URLs and absolute paths are         :  
:                    :          : rejected silently — a bad value renders no   :  
:                    :          : logo rather than erroring.                   :  
| `suggestedPrompts` | string[] | Optional. Up to 3 starter prompts for card   |
:                    :          : and detail views. Exactly 3 prompts are      :  
:                    :          : recommended for UI card layouts. Empty       :  
:                    :          : strings are skipped and additional prompts   :  
:                    :          : beyond 3 are ignored.                        :  
| `displayName`      | string   | Optional. Human-readable presentation title  |
:                    :          : shown in UI headers, cards, and slash        :  
:                    :          : command menus.                               :  
| `version`          | string   | Optional. Semantic version string.           |
| `author`           | string / | Optional. Developer or team name string, or  |
:                    : object   : an object with `name` and optional `url`     :  
:                    :          : (`https://`).                                :  
| `homepage`         | string   | Optional. External `https://` website or     |
:                    :          : documentation URL.                           :  
| `repository`       | string / | Optional. Source repository `https://` URL   |
:                    : object   : (or `{"type": "git", "url": "https://..."}`). :  
| `disabled`         | boolean  | Optional. Ships the plugin turned off. A     |
:                    :          : choice the user has already made wins over   :  
:                    :          : this field.                                  :

> **Do not add any other top-level field.** Unknown top-level fields are  
> silently discarded by the loader — they neither take effect nor error out.

Offer to generate a logo with the `generate_image` tool. Ask for a square asset
of at least 128x128 with a transparent background, high contrast so it reads on
both themes, and roughly 10% empty margin baked in — the frame adds no padding
of its own and center-crops anything non-square.

## Step 4: Verify and hand back

Re-run the Step 0 inventory and confirm the plugin appears with the components
you expect. Then tell the user:

-   What changed, and which plugin now owns it.
-   Where to manage it, as a link: `[<name>](customization://<dir>)` opens the
    plugin's own page, which lists what it provides and can turn it on and off.

`<dir>` is the install directory from Step 0, never the manifest `name`.

If the user asks how the plugin takes effect, tell them that it loads by itself,
and its skills are available from the agent's next turn.

Do not emit `plugin://` or `plugins://` links; they are not handled and render
as dead text.

## Constraints & Tips

-   **Key every `customization://<dir>` link on the install directory name,
    never `plugin.json`'s `name`.** This is the single most common way to break
    a plugin link.
-   **Never hand-edit `config.json` or call mutation RPCs from `run_command`.**
    `config.json` is written atomically at mode 0600 and holds sibling state —
    `userSettings`, permission grants — that a manual rewrite can clobber, and
    `JetboxWriteState`, `DeletePlugin`, and `InstallCustomization` are blocked
    for `run_command` subprocesses. Use `customization://<dir>` links and
    `<plugin-card>` instead.
-   **One coherent purpose per plugin.** Bundling unrelated capabilities forces
    the user into an all-or-nothing toggle. If a request does not fit the
    plugin's description, that is the signal to create a new one.
-   **MCP server names are global too.** They collide across the user's config
    and every installed plugin, so prefix a plugin's servers with the plugin
    name rather than shipping a generic `search` or `db`.
-   **Keep `description` honest and current.** It is what the user reads before
    installing and what search matches. Update it when the bundle's contents
    change.
