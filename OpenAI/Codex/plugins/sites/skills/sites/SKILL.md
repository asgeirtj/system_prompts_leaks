---
name: sites
description: Use Sites when the user wants a website built for them (including a landing page, portfolio, dashboard, portal, tracker, hub, game, event registration, or tool), requests changes to a website already built with Sites, wants to publish a website with Sites, or wants to manage Sites hosting.
---

# Sites

Take the requested website through the supported development and publishing workflow. Publish completed new Sites and edits unless the user requests local-only work or saving without deployment. New Sites start private; preserve an existing Site's audience unless the user requests a change. Native tool approvals apply without an additional conversational publishing gate.

For hosting-only changes, use the relevant native Sites tool and confirm its returned state; source preparation is needed only for source changes or publication.

## Workflow

`<plugin-root>` is the installed directory containing `scripts/` and `skills/`. Run helpers with absolute paths and literal arguments from the selected checkout. Keep credentials in session memory and pass them through stdin, never shell arguments, files, or output.

### 1. Select and open

Default to a new Site unless a specific existing Site is identified.

- **Existing hosted Site:** retain its `project_id` and audience, call `get_site` and `create_source_repository_write_credential`, and open with the [source helper](#source-helper) before editing. Omit `archivePath`; use an empty directory when source is missing, then the returned `checkout_path`.
- **New Site:** use an empty project subdirectory in the task's workspace, normally `/workspace/sites/<slug>` in managed Linux. Default simple pages and browser-local interactions to buildless HTML/JS; use the supplied Vinext starter for server behavior. Preserve retained templates.
- **Local-only:** use the available checkout; skip registration, source synchronization, and publication.

### 2. Prepare and launch

For new Vinext projects, run:

```text
node <plugin-root>/scripts/project-setup.mjs
```

This copies the starter and configures ignored checkout-local state. Helpers select `managed-linux` only for `SITES_MANAGED_LINUX_CONTAINER=1`, otherwise `portable`. For buildless HTML/JS, prepare `dist/` for `index.html` and assets; skip starter setup, installation, and build.

For a retained template, add `--template-source <absolute-sanitized-source-directory>`; exclude Site identity, Git metadata, credentials, and runtime data. For explicitly requested Worker ESM, add `--starter worker-esm` and follow [its README](templates/worker-esm-starter/README.md). Use [Troubleshooting](references/troubleshooting.md#project-configuration) for profile repair or static-to-Worker migration.

After minimal setup, launch registration for new hosted work in a retained execution cell when available. Native `create_site` creates a private, unpublished Site and returns its ID and source credential. Registration includes immediately persisting that ID when the call returns:

```text
node <plugin-root>/scripts/set-project-id.mjs --project-id <returned-id>
```

Reuse an existing ID or registration attempt; resolve uncertain creation before retrying. For app integrations, first read [discovery and declarations](references/app-integrations.md#discover-and-declare).

Start needed dependency installation before feature implementation:

```text
node <plugin-root>/scripts/install-dependencies.mjs
```

Run only when dependencies are missing or their inputs changed. The installer handles host settings, package-manager selection, and interrupted setup; it takes no flags. Use one installer; keep dependency inputs unchanged while it runs. Proceed to implementation once the applicable operations are launched.

For managed-image pnpm additions, use `node "$SITES_PNPM_BIN" add <package>`.

Start required image search or generation when its brief is clear, alongside independent source work. Consider a parallel subagent for image downloads. Delegate bounded asset or research tasks; the Site owner handles the checkout, native Sites calls in the owning conversation, and publication.

### 3. Implement

Write application files while setup runs. For hosted work, await persisted Site identity before manifest edits or source synchronization. Await installed dependencies before commands that need them.

Implement the requested experience in one focused pass; revise for observed failures or unmet requirements. Replace starter title and description and remove temporary `codex-preview` metadata during implementation. Integrate required assets and complete the requested behavior before publishing.

When `SITES_MANAGED_LINUX_CONTAINER=1`, preview is internal QA. Start it only when the task needs browser QA and `$control-browser` is available. If `$control-browser` is unavailable, skip browser QA: do not start a preview server, install a browser, or improvise another browser-control path.

When `SITES_MANAGED_LINUX_CONTAINER` is not `1`, use local preview. In visible tasks with user-facing preview support, show the first recognizable version once it serves successfully and keep it current. Background tasks skip user-facing handoff.

Before any preview, browser test, or screenshot, read the selected reference: [managed](references/preview/managed.md) or [local](references/preview/local.md). If preview infrastructure is unavailable, report the verification limit and continue appropriate checks and publication unless passing browser QA is required. Follow [Troubleshooting](references/troubleshooting.md#preview) after failures.

### 4. Validate and package

Collect any remaining registration and installation results, then finalize the source manifest before checks/builds and packaging.

#### Hosting manifest

The tracked `.openai/hosting.json` declares Site identity and deployment configuration. After registration, a minimal static Site uses:

```json
{
  "project_id": "<returned-id>",
  "static": {"directory": "dist"}
}
```

| Field | Contract |
| --- | --- |
| `project_id` | Persist with `set-project-id.mjs`; preserve on updates. |
| `static` | Object with `directory`: `dist`, `dist/client`, `out`, `build`, or `.output/public`. Omit for Worker builds. |
| `d1`, `r2` | [Storage bindings](references/storage.md#bindings); leave unused bindings `null`. |
| `capabilities` | Declare [a Site MCP server](references/site-mcp-server.md#build-the-server) when needed. |
| `plugins`, `connectors` | [App integration declarations](references/app-integrations.md#discover-and-declare). |

Preserve existing fields. Edit the source manifest; build helpers emit Worker deployment metadata.

Run checks appropriate to the change; lint only when requested. For hosted work, package with the source helper using remaining checks/builds as ordered argument arrays and an absolute `archivePath`. Pass the complete prior opening result as `source` when available.

Buildless HTML/JS uses `commands: []` when no checks remain. Framework projects, including Vinext and static exports, build with `["node", "<plugin-root>/scripts/build-site.mjs"]`. Omit commands already completed successfully with unchanged inputs. Local-only work runs checks/builds directly and skips packaging for publication.

#### Source helper

Use the credential from registration or `create_source_repository_write_credential` for the same Site:

```text
node <plugin-root>/scripts/site-workflow.mjs --project-id <project_id>
```

Launch with `exec_command(tty: true, yield_time_ms: 1000)`. After `Ready for Site workflow JSON on stdin (input is hidden).`, send one newline-terminated JSON object with `write_stdin`. Wait for successful exit and retain the final JSON result.

| Input | Value |
| --- | --- |
| `credential` | Returned credential object, through stdin only. |
| `source` | Complete prior opening result, when available. |
| `commands` | Remaining checks/builds as ordered argument arrays; packaging only. |
| `archivePath` | Absolute output archive path for packaging; omit for opening. |

The helper owns Git preparation, ordered commands, commit/push, and packaging. Pass its verified `project_id`, `commit_sha`, and `archive` directly to publishing; keep the archive unchanged until saving succeeds.

### 5. Publish

Use the audience from creation or `get_site`; refresh unknown or changed ownership/access before selecting a tool.

| Audience | Native calls |
| --- | --- |
| Confirmed owner-private | `save_version_and_deploy_private`; if unavailable, `save_site_version` then `deploy_private_site_version`. |
| Other supported audiences | `save_site_version` then `deploy_site_version`. |

Save-only uses `save_site_version` without deployment. A matching archive-backed saved version needs only deployment; source-only versions still need their matching archive. Preserve returned version IDs, including `saved_version_id`, when resuming. Continue an existing deployment rather than starting another.

### 6. Finish

Poll `get_deployment_status` only for `pending`, `building`, or `publishing`; stop on a terminal result. A successful native result with its URL verifies deployment without another status call or browser visit.

Return the literal deployed URL, saved version for save-only work, or local result. In visible tasks, open the deployed URL in the existing Site tab with `open_in_codex` or equivalent when supported; background tasks skip browser handoff. Handoff failure does not invalidate a verified deployment. Report incomplete verification or blockers; read [Troubleshooting](references/troubleshooting.md) after a failure or incomplete result.

## Design

Build around the user's primary task. Choose a coherent visual direction suited to the subject and audience, and preserve established branding when editing. Keep layouts responsive, text readable, and interactions accessible. Use imagery when it contributes to the experience.

Keep functionality within the requested scope. For open-ended presentation-led briefs, develop content and structure as needed for a complete experience. Preserve explicit content constraints and keep bounded edits bounded.

Read applicable guidance before choosing content and structure. Select by the experience's purpose, not merely its visual subject.

| Design guidance | When to use it |
| --- | --- |
| [Presentation-led sites](references/design/presentation-led.md) | New websites primarily meant to introduce, explain, persuade, or showcase: landing pages, marketing sites, portfolios, and interactive presentation sites. |

## Capabilities

Choose capabilities from the requested behavior and preserve those an existing Site uses. This is a reference index, not a checklist of features to add. Read only the relevant pages.

| Capability | When to use it |
| --- | --- |
| [Data and files](references/storage.md) | Durable records in D1 and uploads or generated files in R2. |
| [Identity and access](references/identity-and-secrets.md) | ChatGPT sign-in, user-owned data, runtime secrets, and private service access. |
| [App integrations](references/app-integrations.md) | Let the Site read data and perform actions in apps visitors have connected to ChatGPT. |
| [Site MCP server](references/site-mcp-server.md) | Expose the Site's operations as tools agents can call. |
| [Browser agent support (WebMCP)](references/browser-agent-support.md) | Optionally make the page's actions easier for browser agents to use. |
| [Scheduled updates](references/recurring-updates.md) | Update a published Site while it is closed, using an unattended data path and a linked automation. |

Hosted server code runs in Cloudflare Workers, with 128 MB per isolate and HTTP-based external connections; raw TCP is unavailable. Preserve the starter's `sites()` build integration. Capability references specify any required manifest declarations; not every feature is a `capabilities` entry.
