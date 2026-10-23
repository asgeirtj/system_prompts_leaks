---
name: plugin-creator
description: Create or update ZCode plugin source and a local test marketplace, then guide the user to add, install, update and try it in the app. Use for new plugins or changes to an existing plugin's capabilities, manifest or local distribution.
---

# Plugin Creator

Deliver implemented plugin source, a local dev marketplace catalog, and precise UI instructions for the user to add the market, install/update the plugin and try it. Use ZCode manifests.

The current handoff is manual. Do not register markets, install/update/enable plugins, or publish as part of this skill. Ordinary Desktop users are not expected to have a global `zcode` CLI or `node` command. Use existing file tools when helper runtimes are unavailable; do not ask users to install development tooling to complete the UI steps. A skill reference alone has no plugin requirements: ask what the plugin should do before generating files.

## 1. Define the outcome and source

Read the target workspace's instructions. Reuse the user's choices for purpose, name, components and destination. Define a representative input and observable expected result for the capability; use it for the smoke test and final trial prompt.

Default source location: `<workspace>/plugins/<slug>/`. An explicit directory wins. Work on the target host for remote work. For an existing plugin, inspect its manifest and edit the original source while retaining its identity.

Read [the ZCode manifest reference](references/plugin-json-spec.md) before choosing components. This step is complete when the source location and acceptance example are concrete.

## 2. Create and implement

Create `.zcode-plugin/plugin.json` and only the components the plugin needs. The directory name and manifest name must match. Use the available file tools, or the optional bundled `scripts/create-basic-plugin.mjs` helper when Node is already runnable. Helper options and examples are in the manifest reference.

Implement the requested capability and replace generic scaffold descriptions with its purpose. The generated MCP server only implements a handshake and an empty tool list; implement real tools before reporting a working integration. Keep secrets in user-config/environment/credential mechanisms.

Preserve existing source. Ordinary iteration edits implemented files and increments the manifest's semantic version; it does not re-scaffold with `--force`. This step is complete when the requested files and behavior have been implemented, or a specific blocker is recorded.

## 3. Check what the environment can verify

Check manifest JSON, declared resource existence, directory/name consistency, path containment and unresolved placeholders. Run the representative capability smoke test with available tools. Report unavailable runtime or credential-dependent checks explicitly.

In an existing developer environment, `scripts/validate-plugin.mjs` can additionally invoke `zcode plugins validate`; use its `--cli` override only when an actual working entry is already known. This is optional developer verification, not a prerequisite or a command to give ordinary Desktop users. File inspection alone does not prove ZCode schema validation or runtime execution.

## 4. Prepare the local test marketplace

Unless the user requested source-only delivery, create or update `<workspace>/plugins/marketplace.json` beside the plugin directories. Its entry uses the plugin manifest's name, version and description, a relative source path, and appropriate display/localized metadata. Preserve unrelated entries, metadata and order.

When Node is available, use `scripts/upsert-dev-marketplace.mjs` with the actual plugin path. It returns the marketplace ID, full plugin ID and paths; its directory-based dev ID is stable. Pass an existing chosen catalog explicitly with `--marketplace-path` to retain its name. Without Node, use the file tools and the reference's catalog format, choose a distinct `dev-` prefixed name for a new market, and retain that saved name on later edits. Resolve same-name/different-source conflicts rather than replacing another entry or market.

Read [manual installation, updates and trial](references/installing-and-updating.md) for every handoff. This step is complete when the catalog and plugin files exist and their IDs, versions and paths agree. Creating the catalog does not register a market or install a plugin.

## 5. Guide the user's UI actions

Provide the actual market root directory and instruct the user to open **Plugin Marketplace → Add → Add Plugin Marketplace**, paste that directory, and add it. Then use **Personal → the actual market name → plugin → Install**. Follow the reference for updates and failures.

Give a concrete new-task trial prompt with its expected result. For a skill, tell the user to select the installed plugin/skill from the composer picker after installation. Only provide an installed `SKILL.md` reference if its actual path has been observed; a source path is not an installed reference. Preserve the user's disabled choices and explain any needed manual enable/configuration step.

## 6. Deliver with accurate status

Reply in the user's language with:

- Actual absolute source directory, marketplace root to paste, and catalog file path.
- Actual marketplace name, full plugin ID and source version.
- The manual add/install or refresh/update steps, and **Settings → Plugins** as the installed management entry.
- The trial prompt and expected result, plus checks completed and checks pending.
- Explicit status: market awaiting manual addition, plugin awaiting installation/update, and trial pending, unless completion has been observed or reported by the user. Mark an existing but unverified installation as unverified.

If the user has not completed the UI steps, stop with a usable handoff rather than performing them automatically or claiming success. For a reported error, keep the source, inspect the error and correct the relevant source/catalog issue. Public release remains separate from local testing.
