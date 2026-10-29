# Packaging and sharing Data context

Use this reference after the [create-data-context workflow](../SKILL.md) prepares a draft package for review or handles requested installation/packaging of existing context. Preparing and validating draft files does not require a separate user review acknowledgement; installation follows the actual request and P4/P6, without a keyword gate. It owns the complete packaging, local availability, recipient onboarding, and internal sharing handoff. For an existing-context sharing request, enter here directly; do not repeat scope/approach intake or regenerate the selected skill. Honor draft-only, source-only, package-only, no-install, and specified output-location constraints and existing authorization.

- [Choose a durable source](#choose-a-durable-source)
- [Portable package shape](#portable-package-shape)
- [Select content to share](#select-content-to-share)
- [Authoring and installation tools](#reuse-available-authoring-tools)
- [Self-contained recipient instructions](#self-contained-recipient-instructions)
- [Personal or team marketplace](#personal-or-team-marketplace-handoff)
- [Internal publishing handoff](#internal-publishing-handoff)
- [Context handoff template](#context-handoff-template)
- [Validation and completion](#validation-and-completion)

## Choose a durable source

Prefer matching, writable context skills or a user-owned plugin already identified in the session. Preserve existing compatible names, layout, and ownership when updating, including explicitly embedded data context or approved as-is input. Otherwise use a user-selected local project or durable personal plugin folder. For new context, package one skill containing data definitions and useful working guidance for the same audience. Include only useful sections; definitions-only or working-guidance-only requests need no empty companion content. If the user explicitly requests standalone skills, save the actual skills in the host's supported personal skills location instead. When packaging is requested in a file-producing runtime without local installation, build the portable package in the workspace and provide it as a downloadable artifact.

Use the parent's [Prepare either draft](../SKILL.md#prepare-either-draft) for audience boundaries. Shared definitions and broad working conventions belong together. Only explicitly different personal guidance needs a separate user-owned context; reuse an existing personal skill when suitable.

Use the intended audience established by the request or selected context; if it is unclear, follow [P1A](../SKILL.md#p1a--clarify-intended-audience-when-needed). Keep that audience separate from the guidance's data/workflow coverage and any publishing recipients. Creating or installing a context locally changes only the current user's setup. A team audience does not authorize sharing or installation for others. Default sharing to the company level, reusing the known company/workspace. Do not ask for a team-versus-company choice or recipient roster. Ask for the company/workspace identity only when missing and necessary for the requested handoff; preserve explicitly restricted distribution.

Inspect the destination before writing. Reject symlink destinations and resource paths that escape the package. Do not overwrite managed caches, another owner's context, or unrelated files. For an existing-context update, make a focused change to the authoritative source, preserve unrelated references/assets, and use version control or a backup outside the distributable package for recovery. A personal overlay on shared context must identify its narrower scope and must not masquerade as an update to the shared source.

Personal edits update the user's own editable source. Shared edits update the maintained shared source and produce a new plugin version for recipients to refresh through the supported route. Editing an installed cache is not an update to the shared source. Do not promise automatic synchronization, merge recipients' personal context, or distribute a local edit as a team change without the requested shared update.

## Portable package shape

Use the topic and names established by the main workflow. A new single-skill plugin and its skill use `context-{team-slug}-{topic-slug}`. Preserve suitable existing names and approved layouts when updating or packaging. This example uses a **fictional** company:

```text
context-acme-product-analytics/
  .codex-plugin/plugin.json
  README.md
  skills/
    context-acme-product-analytics/
      SKILL.md           # working guidance and applicable definitions/sources
      agents/openai.yaml
```

Review the complete skill, then use one plugin manifest, version, installation, and ZIP. Use [P5's applicable structure](../SKILL.md#p5--add-data-context): domain definitions and their sources belong under Data Context; reporting guidance may need only a canonical source pointer and a compact section for genuine metric differences. Keep working conventions in their applicable sections; packaging does not require a data dictionary. Retain an existing external/provider reference when that is the requested source, with truthful access or installation prerequisites; do not duplicate its definitions or create a stub to fill the package shape. Preserve approved existing separate skills during packaging rather than silently merging them.

Use truthful creator and purpose metadata. Preserve the scaffold's entire `author`, `interface.developerName`, `interface.category`, and `interface.capabilities` unless the user explicitly supplies replacements; an audience identifies recipients, not the publisher or capabilities. Preserve the exact approved company/team name, including meaningful words such as "Team." A minimal manifest without a scaffold can use:

```json
{
  "name": "context-acme-product-analytics",
  "version": "0.1.0",
  "description": "Acme data definitions and working conventions for data analysis.",
  "author": { "name": "Local developer" },
  "skills": "./skills/"
}
```

An instruction-only package needs no MCP server or hook. Do not add an app dependency merely to package guidance; preserve actual external/provider access and installation prerequisites in the README and context references. Do not bundle credentials or imply that installation grants source permissions. If including plugin UI metadata, preserve a complete valid scaffold, including its required icon assets, and use owner-approved branding. Do not add an incomplete `interface` solely for a prompt. Give each actual skill its own UI metadata and usable starter without requiring custom icons. For example, the combined skill's `agents/openai.yaml` can use:

```yaml
interface:
  display_name: "context-acme-product-analytics"
  short_description: "Apply Acme definitions and working conventions"
  default_prompt: "Analyze the supplied adoption data using Acme definitions and reporting conventions."
policy:
  allow_implicit_invocation: true
```

The skill's name, description, and starter should cover its actual data and workflow scope. Preserve existing approved display names. Make report-specific conventions conditional so invoking context for an unrelated data task does not apply that report's formatting.

For a plugin with UI metadata, set `interface.defaultPrompt` to one usable starter per actual skill, up to three. For the minimal manifest above, use the skills' `agents/openai.yaml` default prompts. UI starters describe the associated skill's task, stay within 128 normalized characters, and omit raw `$skill-name` invocation text because the selected UI surface supplies activation. In README and chat handoffs, provide a natural task prompt per skill that fits its actual description and should invoke it implicitly, such as `Analyze Acme product adoption and summarize the main trends.` Do not require a skill name, `$skill-name`, or a reference to saved context in the sample. Verify that it matches the saved applicability; do not claim a behavioral test ran unless one actually did.

The README should name the maintainer when known, data/workflows covered, established intended audience, intended recipients when sharing, actual included skills and their roles, canonical editable source, the plugin's current version and meaningful changes, source-access and external-skill prerequisites, install route, and a natural test prompt per skill. Reuse the reviewed audience; do not add a recipient question for local installation or to complete the README. Increment the plugin version for changes distributed to existing consumers and explain the supported refresh/reinstall step; editing a source folder does not update their installed copies. Include only approved files. When packaging already reviewed skills, preserve their files, canonical source URLs, and approved customizations unchanged; do not regenerate them. Keep raw source exports, private drafts, logs, credentials, and backups outside the package.

For a workspace-ready ZIP, place `.codex-plugin/plugin.json`, `skills/`, and any approved README/assets directly at the archive root, without the enclosing source folder. Check archive integrity, size below 100 MB, exact approved file bytes, manifest metadata, prompts, and bundled references. Reject duplicate members, absolute/traversal paths, symlinks, and escaped files. Keep the named directory as the editable source.

## Select content to share

Share the whole reviewed shared bundle by default only after its contents are classified for sharing. A team bundle contains shared data definitions and team working preferences; adjacent personal context remains outside it. Honor an explicit selection of data definitions alone or working preferences alone, and make the package's actual contents clear in its manifest, README, and handoff.

Use the combined review to show the actual files and skill roles included in the shared ZIP and which personal context stays private. Preserve the user's explicit classification and use [P1A](../SKILL.md#p1a--clarify-intended-audience-when-needed) for unclear intended audience or unspecified differences between shared defaults and personal behavior. Ask one focused question if ambiguous personal/team material would otherwise be shared; do not add an organization hierarchy questionnaire or a second review after the contents are approved. Exclude private preference files and references from the ZIP, manifest, and shared README; never follow a sibling link to copy them implicitly.

For sharing data definitions only, package the data-context skill with the complete closure of its required local references and assets. Preserve the approved data-context source bytes, including source URLs. Include no preferences skill or private preference files; the data-context skill must have no dependency on them. Keep external source-access prerequisites explicit.

If the selected definitions are embedded in an existing combined skill, the request to share data definitions only calls for extraction into a separate package copy. Preserve the original combined source; carry over its definitions, citations, and required data-context resources without changing their meaning. Review that extracted skill and its actual contents before finalizing the selected package. The approved extracted files become the bytes to preserve in the ZIP; this does not migrate or replace the original context.

For preferences-only sharing, inspect its data-context links before packaging. Preserve an existing verified external/provider reference and explain the recipient's access or installation prerequisite. If it points to a sibling that would be omitted, do not ship a dangling link: include that data-context dependency only when authorized, or establish a valid external reference and review the changed package copy. Preserve the original approved source and resolve any missing dependency decision before claiming the selected package is portable. Do not silently copy private preferences when preparing a data-context package, or shared definitions into a preference package.

## Reuse available authoring tools

If the runtime exposes canonical plugin scaffolding, validation, or installation tools, use them against this source. An available Plugin and Skill Authoring package provides `scripts/create_basic_plugin.py`, `scripts/validate_plugin.py`, and `scripts/install_plugin.py`; resolve that package from the runtime's actual inventory, never a hard-coded cache path. Scaffolding is optional and must not replace an existing skill or inject unrelated defaults. Do not require installing another creator to author the files above.

For a local environment with those scripts, use its supported Python runtime. `TASK_AUTHORING_ROOT` below means the resolved authoring package root, and `TASK_CONTEXT_ROOT` means the approved generated plugin directory:

```bash
python3 "$TASK_AUTHORING_ROOT/scripts/validate_plugin.py" "$TASK_CONTEXT_ROOT"
```

For a requested disposable install smoke, use an empty, task-owned `TASK_SMOKE_HOME` so existing installations and config remain untouched:

```bash
python3 "$TASK_AUTHORING_ROOT/scripts/install_plugin.py" \
  --source "$TASK_CONTEXT_ROOT" --debug --codex-home "$TASK_SMOKE_HOME"
```

This verifies a disposable installation only. For ongoing use, inspect existing callable skills and enabled plugins first. If the approved version is already available, preserve that installation and report it accurately. Otherwise install the approved bundle once through the host's supported plugin install flow or a globally registered personal/team marketplace; preserve customizations and unrelated settings, avoid duplicate active copies, and report the actual installed key and source after readback. Installing or refreshing a team bundle preserves recipients' existing personal context; do not recreate it, copy it into the team plugin, or run setup again. Honor an explicit standalone-skill request; if plugin installation is unavailable but standalone skills are supported, install the actual complete skill folders, preserving their links and documented prerequisites, and report that form. Do not label a debug install as team distribution.

If authoring tools are absent, write the requested files or package directly and validate JSON, frontmatter, resource containment, and content using available file tools. State that the host's installer/validator has not been exercised. Give any remaining installation step only when installation was requested; do not invent a CLI, tool, successful install, or upload URL.

## Self-contained recipient instructions

Keep the README specific to the actual reviewed package: name/version, scope, canonical editable source, actual skills and references, required source access, supported installation route, verified starter prompts, and documented source-access or coverage limits. Identify each included skill's role and entry point. Lead with one short getting-started path appropriate to the recipient and requested outcome. Put manual marketplace JSON, CLI commands, or alternative developer installation routes in a secondary section only when the recipient needs them. A workspace-admin ZIP handoff should lead with the ZIP and workspace administration steps. For new data context, link its complete SKILL.md; do not move definitions or the source inventory into the README or supporting files. For a preserved older or embedded layout, identify its actual definitions location instead. For an external provider or separately installed data-context skill, retain the actual reference and truthful access/dependency prerequisites. Keep deferrals of missing data definitions in task notes or conversation. The README must remain usable without another authoring plugin; do not copy the research, draft-review flow, or data-context authoring workflow into it. For example:

> Extract this ZIP to a durable folder. Read the manifest and `{actual included skill paths}` to see their coverage and roles. If this version is already available, use that installation; otherwise install the complete plugin once through `{verified host installation route}`. In a host that supports only standalone skills, install the actual complete skill folders with their references and documented prerequisites. Verify their availability and follow any required reload step.  
>  
> Try: `{one verified prompt per actual included skill}`. Apply the working conventions only to their stated workflows; optional shared style defaults leave room for your personal preferences. Linked sources require your own access. To customize it, ask Data or Create Data Context for help with this editable source; if neither is available, ask your assistant to make the specific changes you want directly in these files. Preserve unrelated context, validate the result, and refresh the installation through the same supported route.  
>  
> Keep personal preferences in your own context; installing this team bundle does not replace it or require setup again. Edit your own source for personal changes. For shared changes, update the maintained team source and distribute the new version through the supported refresh route. Installed copies do not update automatically when the source changes.  
>  
> To share it, ask Data or Create Data Context for help, or send the validated ZIP and the included administrator handoff to your ChatGPT workspace administrator.

Resolve the placeholders and applicability statement using only the package's actual contents, install state, and host capabilities. Include the personal/team update instructions when the package is shared team context. For a requested sharing package, include the [internal publishing handoff](#internal-publishing-handoff) below once, adapted to the recipient. For newly created shared context without a sharing request, offer future sharing help instead. Explain an unavailable installation step without inventing commands or claiming activation.

## Personal or team marketplace handoff

For a local marketplace, the standard manifest lives at `.agents/plugins/marketplace.json` in its root. A prepared example containing the plugin above is:

```json
{
  "name": "acme-context",
  "interface": { "displayName": "Acme Context" },
  "plugins": [
    {
      "name": "context-acme-product-analytics",
      "source": { "source": "local", "path": "./plugins/context-acme-product-analytics" },
      "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" },
      "category": "Data & Analytics"
    }
  ]
}
```

Place the plugin at `plugins/context-acme-product-analytics` relative to that marketplace root. If registering in an existing marketplace is requested, preserve all unrelated entries and metadata. Preparation of this file is not registration in the user's global configuration or publication to a workspace marketplace. Use the available canonical installer or marketplace-management flow for those actions, with the already approved audience and action.

## Internal publishing handoff

After creating shared context for local use, highlight that the user can ask later for instructions on sharing it with their team. Personal context needs only its local availability and natural sample prompt. Enter this administrator handoff when sharing or a shareable package was requested; selecting a shared audience alone does not start this flow. A request to share or package reviewed context authorizes preparing the appropriately named plugin and validated ZIP. Preserve the convention scope and exact reviewed content. Reuse the established company and sharing destination. Ask when the intended destination is materially unclear; do not substitute generic IT guidance for that clarification or for searching the available context. Preserve an explicit narrower distribution restriction.

Search the available, relevant context for a potential ChatGPT administrator and inspect the actual results. Use provided evidence or authorized read-only connected sources, such as public Slack messages about ChatGPT administration or workspace support. Discover and call an available search tool; listing tool names or reading product documentation is not an administrator lookup. Keep the search focused on the known organization or workspace and follow promising evidence only as needed.

If the context points to a person, share their name and a source link, with a short caveat when their role, workspace match, or current access is uncertain. A plausible contact does not require formal membership verification, multiple independent sources, or proof of an access grant. Do not present an uncertain contact as a verified administrator. Use the IT/workspace-administrator fallback only when the lookup finds no plausible person or the relevant context is unavailable, and say which limitation applies.

For a packaged sharing result, lead with the downloadable ZIP, a short summary of what the included skills change, and the administrator's next step. Identify the actual plugin/version and scope, state whether it contains the whole bundle or a selected part, report installation status once, and give one verified starter per actual skill (up to three). Link the [official plugin guidance](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt-and-codex) and relevant permissioned sources. Keep metadata file inventories, archive hashes, and detailed validation or administrator-research evidence in the supporting files unless the user asks for them.

Use the complete template below so the useful next step is visible in the final message. Research a contact for a requested sharing handoff using the available context. Keep administrator evidence concise, and never include a personal companion ZIP in the administrator request unless explicitly selected for sharing.

For a verified current-user administrator, provide these steps directly. Mention pre-installation only when the actual workspace supports it. Do not instruct the user to create a group or promise group/role targeting without verified support; a named audience does not establish a deployment control.

Do not create or save a Slack draft, send a message, upload, publish, change source permissions, alter membership, or install across a workspace without a separate request and verified execution. Offer the concrete next step; do not claim the context has been shared merely because its package exists.

## Context handoff template

Use one concise response for the actual outcome. Replace placeholders with verified package/skill names, links, scope, and natural starter prompts. Repeat download and starter lines only for actual outputs. Omit ZIP wording for source-only results; link the saved skills instead. For personal context, use only the instruction, saved-skill link, verified installation or prepared status, and an implicit-invocation sample. For newly created shared context, add: "You can ask me later for instructions on sharing this context with your team." Include the administrator section below only for requested sharing or a shareable package. Keep version and file inventories out of the headline. Detailed contents and validation belong in the linked preview or README.

```markdown
Your {topic} context is {packaged / saved / installed}.

- **[{shared plugin display name}]({shared ZIP or skill path})** — {specific shared definitions or working guidance}.
- **[{personal plugin display name}]({personal ZIP or skill path})** — {specific personal guidance}; for your own use.

**{Try / After installation, try}:**
- {Verified starter for the first skill.}
- {Verified starter for the second skill, when present.}

**To make the company context available in ChatGPT**

{Potential ChatGPT administrator's name and supporting source, with any relevant caveat; use IT only if lookup finds no plausible contact or context is unavailable.}

Send {contact or your workspace administrator} the **{shared package name} ZIP** with:

> Could you make **{shared plugin display name} v{version}** available to **{established audience}** in **{workspace}**?
>
> 1. Open the [workspace plugins page](https://chatgpt.com/admin/plugins).
> 2. Upload/import the attached ZIP using the available workspace control.
> 3. Make it available for the intended audience to install, then check that a member can use it with: {verified starter}.
>
> Recipients still need access to {linked sources or documented prerequisites}. {When a separate personal package exists: The personal reporting package is excluded.}

[Administrator guidance](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt-and-codex) · [Package details and installation preview]({verified preview or README path})

{Actual installation and sharing status, stated once.}
```

Include the administrator section only when sharing or a shareable package was requested. A shared audience alone calls for the future-sharing offer, without administrator research or upload instructions. A request to prepare a sharing ZIP does not authorize sending it or deploying it. Address a verified current-user administrator directly with the steps instead of asking them to contact themselves. If the lookup finds no plausible person, say that IT can route the ZIP to the ChatGPT workspace administrator. Do not hard-code people, company names, or workspace capabilities from examples. Mention preinstallation only when supported and requested. State source prerequisites only when they exist; instruction-only context does not need invented source permissions.

## Validation and completion

1. Read back the written files and compare them with the approved content or diff. Confirm owner, activation scope, provenance, documented source limitations, and source URLs survived accurately. For new or reformatted data context, apply the [single-file content and structure checks](data-context-authoring.md#review-checks); package validation alone does not check the definitions' organization. Preserve approved older layouts during ordinary packaging. Do not restore data-context sections or scaffolding removed during finalization.
2. Validate the whole plugin when packaged, or the actual standalone skills when explicitly chosen. Parse the manifest and each skill's frontmatter, check folder/name matches and metadata, and resolve every bundled reference from its owning file, including sibling links. Check for escapes, symlinks, missing resources, unapproved contents, and machine-local paths. For a separate data-context skill, verify its complete local reference/asset closure contains no preference dependency. For shared packages, compare contents to the reviewed shared/private classification and exclude personal context. For selected packages, check only approved skills are present and no omitted sibling leaves a dangling link. Resolve named external skill prerequisites against their actual available entry points or separately generated files, not just a matching slug in prose; distinguish prepared files from installed skills. If a required companion has not been created or cannot be resolved, retain the useful draft and report that dependency as missing instead of claiming the package is ready. Do not mistake an unread external link for a validated source.
3. Check discovery and natural invocation for each actual skill separately, plus an unrelated task outside its applicability. Apply [Prepare either draft's frontmatter guidance](../SKILL.md#prepare-either-draft): a description should match a domain/workflow request even when it does not name one of the saved metrics, while retaining explicit personal and workflow limits. Do not use a metric inventory as the trigger description. For a new combined skill, include a definition-focused task and a reporting task; check that report-only conventions apply only to the latter. For preserved separate skills, check their documented dependencies and portability. Check that only applicable references load, reviewed working preferences retain their intended scope, and unresolved factual conflicts are not presented as verified definitions. Preserve explicitly embedded layouts and confirm unrelated context remains intact during revisions.
4. When an install is performed, validate/read back the installed bundle and its enabled plugin identity, version, and actual skills. Confirm existing personal context remains intact and no duplicate active shared version was introduced. Use one isolated bundle smoke first when appropriate; do not replace the user's current marketplace installation as a test. An install test proves loading/package mechanics; only an observed task run proves agent behavior.
5. Report only the requested outcome: draft/source-only returns written files and validation; package-only also returns its validated ZIP and intended audience; installation reports availability only after verified success. Include the actual name/version where present, material limitations, and a suitable test prompt. Offer sharing help, and give the administrator route when sharing was requested. Do not imply a ZIP or installation exists for file-only output.
