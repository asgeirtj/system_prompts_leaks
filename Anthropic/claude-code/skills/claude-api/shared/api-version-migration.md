# Migrating to a newer Claude API version

> **If you arrived via `/claude-api api-version`, or via `upgrade` to a release in a "Set the version" table below or a later one:** this is the right file. Execute the steps below in order - do not summarize them back to the user. Start with Step 0 before touching any file.


An API version is the date you send in the `anthropic-version` request header (on Amazon Bedrock and Google Cloud Vertex AI, the `anthropic_version` request body field). A new version is how the Claude API ships breaking changes, and a codebase moves to it when it is ready. This is **not** model migration (that is `migrate`, `shared/model-migration.md`) and not an SDK major-version upgrade in general (that is `upgrade`): it covers only the SDK and CLI releases that switch the version.

**The outcome.** After the migration, the code runs on the target version and still does what the user wants: everything the new version would break is fixed, every choice that's the user's to make has been put to them, and the tests pass. It gets there the standard way, on the SDK release for that version with no version overrides.

Each version's section below lists the changes to make, or says where to read them, and links that version's public migration guide.

---

## Step 0: Confirm scope, current version, and target

**Scope - ask before editing unless it is already unambiguous.** Same rule as `shared/model-migration.md` Step 0: if the request does not name an exact file, a specific directory, or an explicit file list, ask one question offering (1) the whole working directory, (2) a specific subdirectory, (3) specific files - and wait. Dependency manifests and lockfiles count as in scope whenever any code under them is.

**Target version.** If the user did not name one, use the newest version that has a section in this file and say so. Only the versions with a section below are covered; for any other, point the user at the versions page (`https://platform.claude.com/docs/en/api/versioning`) and do not improvise.

**Current version.** Read which SDK release the code uses (the manifest, and the installed package if there is an environment), and any version the code sets explicitly: an `anthropic-version` header (`rg -n -i 'anthropic[-_]version'`), including one in default headers or an environment variable, or on Bedrock and Vertex the `anthropic_version` body field.

Each version's section begins with a **From** line naming the versions it migrates from. Start at the section whose From line names the code's current version. If calls send different versions, start from the oldest one a From line names. If the code already sends the target version (for example, its SDK was upgraded already), still open the target's section and run its searches: the code may not have its changes yet. In that case skip only the switch (Step 3), and stop only if the searches come back clean. Calls on a version no From line names (and that isn't the target): don't edit them; tell the user this skill doesn't cover moving from that version, and point them at the versions page (`https://platform.claude.com/docs/en/api/versioning`).

If the scope is under version control, check its status before editing - unexpected modifications mean a concurrent process; stop and investigate before proceeding.

## Step 1: Open the version sections and take inventory

Open the section Step 0 found, then each later section up to and including the target, oldest first, and no others. Inventory first: run those sections' searches over the scope and keep the hit list - it is your checklist and, re-run at the end, your verification. Classify each hit before editing: **request or response code for the Claude API** (edit), **unrelated use of the same name** (leave - a `temperature` variable for a sensor, a `roles` field in your own user model), **test** (edit, and keep the test meaningful), **docs or notebook snippet inside the scope** (edit). Never touch installed packages or vendored third-party code.

Upgrade the SDK package first (Step 3), unless the version's section says the user must choose first (for example, for calls to a model that can't use the target version); remove explicit versions after Step 2's decisions. If the project is typed (Go, Java, C#, TypeScript, or Python or PHP with a type checker) and you can install packages, build or type-check and add the errors that belong to the version's changes to the hit list. The build does not show everything: the searches stay the main inventory.

## Step 2: Apply the per-version changes

Apply the sections Step 1 opened, oldest first. Each section has the changes, the searches that find them, and a checklist. Items are tagged **[BREAKS]** (a 400 error, or a response field your code reads that is no longer there - apply as code edits) or **[DECIDE]** (the user owns the choice - surface it, do not decide silently).

Make a section's changes and the switch (Step 3) as one change, and run the tests on the new version.

## Step 3: Switch the version

Switch the version in the same change as the per-version changes (Step 2):

- **SDK:** upgrade the SDK, and any platform-client package that ships separately, to at least the release the version's section lists, in the manifest's existing pin style, and regenerate the lockfile with the project's own tool if you can run it; otherwise give the user the exact command. Then remove every version the code sets explicitly on an SDK client (Step 0), so the SDK's default applies, except the overrides below.
- **The SDK's own breaking changes:** a new SDK major can have breaking changes unrelated to the API version. If this skill bundles an `sdk-upgrade.md` for that language and the code is below the release that file targets, follow its code-change steps (`upgrade`), but install the release this file's section names, not the one that file targets, and skip only its sampling-parameter item (Python: the `temperature`, `top_p`, `top_k` bullet of Step 6; do the rest of Step 6): the version's section decides about those parameters. For the part of the jump no bundled file covers (for example Python 1.x to 2.0.0), the version's section says where the changes in the release it lists are; for earlier breaking releases on the way there, use that SDK's changelog or migration notes (repositories in `shared/live-sources.md`). Say in the report that the upgrade carries those changes too.
- **Raw HTTP:** set the `anthropic-version` header to the target version. A hand-built Amazon Bedrock or Google Cloud Vertex AI request body (boto3 `invoke_model`, Vertex REST) keeps its required `anthropic_version` field; change it to the target, written as in the header (for example `2026-10-21`), only where the Platforms note allows it.
- **Message Batches:** a batch's results use the API version of the request that created it, so batches created before the switch finish under the old version. Nothing to edit; mention it in the report if the code polls batches across a deploy.

**Overriding the version.** A client or request can send a version other than its SDK's default (Step 0 lists where code sets one). Use an override only when the user asks not to upgrade the SDK, chooses, after upgrading, to keep specific calls on their current version (a **[DECIDE]** in the version's section, which says when that is offered), or the release the version's section lists for their SDK isn't published yet. Check in the SDK's source how it applies the override before relying on it. On a kept call, a field the upgraded SDK no longer accepts (Python 1.x and later: `temperature`, `top_p`, `top_k`) goes through the SDK's extra-body option; check that the SDK has one that sends it (C#'s `AsIChatClient()` adapter drops these settings without an error), and if it has none, tell the user the call can't be kept this way. Without the upgrade, the old SDK's types still describe the old version, so a type check won't catch fields the new version removes. List every override in the report.

## Step 4: Verify

1. Re-run the per-version searches over the scope. Every remaining hit needs a reason (unrelated name, the query parameter of the same name, a field that stays) - put the reasons in the report.
2. Build or type-check the project and run its test suite if it runs without credentials.
3. **[DECIDE]** A live check spends real money and needs credentials: ask first. If the user agrees, send one minimal Messages request with the new version (for example a short `max_tokens`) through the code's own client, and for each Admin API or Claude Enterprise Analytics API endpoint the code reads, one read through the code's own path.

## Step 5: Report

Lead with the outcome, then:

- what changed, grouped by the per-version changes, with file counts and the notable files;
- the public migration guide link for each version you applied (from its section);
- **decisions the user owns** (every [DECIDE] you hit, with the choice made or still open);
- which SDK releases the code now uses, and every version override left in the code and why;
- what you could not verify and the exact commands to finish (install or lock command, test command).

---

## Migrating to API version 2026-10-21

**From:** `2023-06-01`, and on Amazon Bedrock and Google Cloud Vertex AI the body values `bedrock-2023-05-31` and `vertex-2023-10-16`.

**Migration guide** (give this link to the user in the report; this section has every API change to make, and the guide has the SDK and CLI ones - change 5): `https://platform.claude.com/docs/en/api/migration-2026-10-21`

**TL;DR:** upgrade the SDK (or send `anthropic-version: 2026-10-21` for raw HTTP), then: remove `temperature`, `top_p` and `top_k` from the Messages requests that switch (asking first about non-default values, change 1); never put a `document` block directly in an `assistant` message or a `text` block with non-empty `citations` in a `user` message; and if the code reads Admin API or Claude Enterprise Analytics API responses, read the replacement fields below. With the upgrade, make the code changes the new SDK or CLI release needs, which you read from the migration guide (change 5).

**Scope.** Changes 1-4 are in the Messages API, token counting, Message Batches, and the Admin API and Claude Enterprise Analytics API endpoints named below. Every other Claude API endpoint (Files, Models, Skills, Managed Agents, the rest of the Admin API and Claude Enterprise Analytics API) accepts `anthropic-version: 2026-10-21` and behaves exactly as on `2023-06-01`. Change 5 can touch SDK or `ant` code for any endpoint.

**Platforms.** `2026-10-21` works on the Claude API, Claude Platform on AWS, Microsoft Foundry and Google Cloud Vertex AI, and on Amazon Bedrock for Claude 4.7 and later models.

If the code calls an older model on Bedrock (one numbered below 4.7, such as Claude Opus 4.6, Claude Sonnet 4.6 or Claude Haiku 4.5; ask if the code doesn't name its models), don't upgrade those calls. Keep the SDK that makes them, and its separate Bedrock package if it has one, on their current releases, and tell the user this keeps every other call through that SDK on its current version too. Keep a hand-built request on the version it sends now. **[DECIDE]** Offer to upgrade those calls by first moving them to a Claude 4.7 or later model (the `migrate` flow, `shared/model-migration.md`).

**Order.** Changes 1-4 also work on `2023-06-01`, so the fixes can ship before the upgrade. Before upgrading the SDK, settle the older Bedrock models (Platforms note) first and then change 1's non-default-value **[DECIDE]** for the calls that will switch, since either can hold the upgrade back. Settle change 1's question before deleting those settings too: on models that accept other values, output changes as soon as a deletion ships.

### Searches

| Signal | What it finds | Change |
|---|---|---|
| `temperature`, `top_p`, `top_k` (keyword arguments, quoted keys, and the per-SDK spellings in `shared/model-migration.md` -> Per-SDK Syntax Reference -> Sampling parameters, e.g. `topP`, `TopK`); `extra_body` | sampling parameters sent on Messages requests, batch request `params`, and `extra_body` escape hatches | 1 |
| C#: `ChatOptions` `Temperature` / `TopP` / `TopK` on a client from `AsIChatClient()` | sampling settings that the new C# major's `IChatClient` adapter ignores without an error | 1 |
| `"document"` / `'document'` block types, `DocumentBlockParam` and the SDK's equivalents, and code that builds or replays `assistant` messages from stored history | documents placed in assistant turns | 2 |
| `citations`, `search_result`, and code that puts Claude's response `content` (or its `text` blocks) into a `user` message or into `search_result` or `tool_result` content - for example one agent's output passed to another as input | cited text sent back as user input | 3 |
| Endpoint path segments and SDK or CLI accessors, case-insensitively: `rbac_groups` / `rbacGroups`, `rbac_roles` / `rbacRoles`, `rate_limits` / `rateLimits`, `api_keys` / `apiKeys`, `organizations/analytics` and the `.analytics.summaries` / `.analytics.user_usage_report` / `.analytics.user_cost_report` accessors, `organizations/` in URL builders, `client.beta.organization` (and `beta().organization()`), `ant beta:organization`; then, in the code that reads those responses, the nested forms of the removed fields: `roles`, `group_id`, a role's `name`, `group_type`, an API key's `workspace_id`, `actor.email` / `["actor"]["email"]` / `.actor.email` in jq, `summaries` as a response key | Admin API and Claude Enterprise Analytics API response fields | 4 |

**What a build does not show for this version** (the build after the SDK upgrade): documents in `assistant` turns and `citations` on `user` text (the SDK types still allow both); values passed through extra-body options or raw JSON; parameters built in a variable or spread in TypeScript; and the RBAC group `roles`, member `group_id`, analytics `actor.email` and `summaries` fields (never typed in the SDKs). The searches find these.

### 1. Sampling parameters are removed

**[BREAKS]** On `2026-10-21`, a Messages request that sends `temperature`, `top_p` or `top_k` returns a 400 error on every model - even at its default value, such as `"temperature": 1`. The same applies to each request in a Message Batch created with `2026-10-21`. Delete the three fields from every request that switches to `2026-10-21`, including batch request `params` and any `extra_body` entry that carries them: an `extra_body` entry still puts the field in the request JSON, so the API rejects it. Leave them on a call that stays on its current version (Platforms note). Where one is set to a non-default value, settle the non-default-value **[DECIDE]** after the example below before deleting it or upgrading the SDK. **[DECIDE]** For your own wrappers and config that forward them (a `temperature` argument on a helper, a config key), stop sending the value to Claude; removing the argument from a public signature breaks that code's callers, so that part is the user's call. A third-party library between the code and the API (LangChain, LiteLLM, and the like) may send these fields when it is configured with them: remove them from its configuration, check how it sets `anthropic-version`, and list it in the report.

C#: on a client from `AsIChatClient()`, the new major ignores `ChatOptions` `Temperature` / `TopP` / `TopK` without an error; treat them like the fields above (same question).

Request body before (`2023-06-01`):

```json
{"model": "claude-sonnet-4-6", "max_tokens": 1024, "temperature": 0.2, "messages": [{"role": "user", "content": "Hello, Claude"}]}
```

After (`2026-10-21`):

```json
{"model": "claude-sonnet-4-6", "max_tokens": 1024, "messages": [{"role": "user", "content": "Hello, Claude"}]}
```

**[DECIDE]** Before deleting a `temperature`, `top_p` or `top_k` set to anything other than its default (a `temperature` other than 1, or any `top_p` or `top_k`), ask the user, unless the call uses a model that already accepts only the defaults (such as Claude 4.7 and later models). If the code doesn't name a fixed model, include the call. Ask once, listing every such call. Tell the user what the calls lose and offer these choices in this order, recommending the first:

1. **Delete the setting** and use the default sampling, once the user has checked that the default output works for that call.
2. If the default output doesn't work for a call: **hold back the SDK upgrade and the version switch** and stay on `2023-06-01` for now. Tell the user this holds back the whole codebase, not just that call. Offer to make the rest of changes 1-4 now, since they work on `2023-06-01`; leave the settings on the calls that hold the upgrade back, and report the code as not switched, naming those calls.
3. Least recommended: **upgrade, but keep those calls on `2023-06-01`** with an override (Step 3, "Overriding the version"), and report each as not migrated.

(Tell the user that requests with extended thinking on already restrict these values on `2023-06-01`, on every model, so those calls lose less. Still include those calls in the question.)

What the call loses: on `2026-10-21`, requests sample with the defaults a request gets today when it leaves these fields out (for example `temperature` 1.0). Models that already accept only those defaults, such as Claude 4.7 and later models, sample as before once the fields are removed. On models that accept other values, such as Claude Sonnet 4.6, Claude Opus 4.6 and Claude Haiku 4.5, a call that lowered `temperature` for more consistent output loses that, and there is no replacement setting, so the choice is whether the default output is acceptable for that call. Note that `python/claude-api/sdk-upgrade.md` Step 6's `extra_body` route works only on `2023-06-01`.

Tests that assert these parameters pass through: keep them meaningful by asserting on parameters that still exist (`stop_sequences`, `metadata`, `max_tokens`).

### 2. A `document` block directly in an `assistant` message returns an error

**[BREAKS]** On `2026-10-21`, a request that places a `document` block directly in an `assistant` message returns a 400 error that says where each such block is. Move the document into a `user` message at the point the conversation needs it. A document nested inside another block - such as a web fetch tool result that Claude returned - is still accepted, so do not strip documents out of Claude's own tool results when you send them back. The check also applies to token counting and to each request in a Message Batch created with `2026-10-21`.

This is almost always a bug in how history is built (a document attached to the wrong role), not a pattern to port; fix it where the message is assembled.

### 3. A `text` block with `citations` in a `user` message returns an error

**[BREAKS]** On `2026-10-21`, a request that sends a `text` block with a non-empty `citations` array in a `user` message returns a 400 error - whether the block sits directly in the message or inside a `search_result` block, including one in a `tool_result`. Remove `citations` from those blocks (keep the `text`). The check also applies to token counting and to each request in a Message Batch created with `2026-10-21`.

Still accepted, so do not touch: citations on `text` blocks in `assistant` messages (Claude's earlier replies, sent back unchanged), and the `"citations": {"enabled": true}` setting on `document` and `search_result` blocks.

A likely source is code that copies Claude's response blocks into a `user` turn; send their text without the citations.

### 4. Admin API and Claude Enterprise Analytics API: deprecated response fields are removed

Skip this part if the scope never calls these endpoints. On `2026-10-21` these responses no longer include a deprecated duplicate field. The API returns no error - the field is simply absent - so every read has to be found. In each case the replacement is already returned on `2023-06-01` with the same value, except `workspace_id` on API keys (below).

**[BREAKS]** Admin API:

| Endpoints | Removed field | Read instead |
|---|---|---|
| RBAC groups (`/v1/organizations/rbac_groups`): create, list, retrieve, update | `roles` | `role_ids` |
| RBAC group members (`/v1/organizations/rbac_groups/{rbac_group_id}/members`): list, add, and the response to removing a member | `group_id` | `rbac_group_id` |
| RBAC roles (`/v1/organizations/rbac_roles`): list, retrieve | `name` | `display_name` |
| Organization and workspace rate limits (`/v1/organizations/rate_limits`, `/v1/organizations/workspaces/{workspace_id}/rate_limits`): list | `group_type` on each entry | `group.type` |
| API keys (`/v1/organizations/api_keys`): list, retrieve, update | `workspace_id` | `scope.workspace_id` (not a plain copy - below) |

**[BREAKS]** Claude Enterprise Analytics API:

| Endpoints | Removed field | Read instead |
|---|---|---|
| Per-user usage and cost reports (`/v1/organizations/analytics/user_usage_report`, `/v1/organizations/analytics/user_cost_report`) | `actor.email` | `actor.email_address` |
| Activity summaries (`/v1/organizations/analytics/summaries`) | `summaries` | `data` |

Unchanged, so leave alone - these share a name with a removed field:

- `name` on RBAC **groups**, API keys, workspaces and service accounts (only RBAC roles lose `name`);
- `email` on RBAC group members, organization users and invites (only `actor.email` on the two per-user reports goes);
- `workspace_id` anywhere but the API key object: the API key list endpoint's `workspace_id` filter, federation rules, workspace paths;
- the `group_type` query parameter on the rate-limit list endpoints;
- `summaries` as the endpoint path (`/v1/organizations/analytics/summaries`) and SDK accessor (`.analytics.summaries`) - only the response key goes.

**[DECIDE] API key `workspace_id`.** On `2023-06-01` an API key's `workspace_id` is `null` both for a key in the Default Workspace and for a key that isn't bound to one workspace (an all-workspaces key). `scope` tells them apart: `{"type": "workspace", "workspace_id": "wrkspc_..."}` carries the workspace's real ID, including the Default Workspace's, and an all-workspaces key has `{"type": "organization"}` with no `workspace_id` key at all. So a mechanical rename changes behavior: read `scope.workspace_id` optionally (it is absent, not `null`, for those keys) or branch on `scope.type`. Where the code treated `null` as "Default Workspace", compare `scope.workspace_id` with the Default Workspace's ID instead - list workspaces with `include_default=true` and take the one named `"Default"`. Where it treated `null` as an all-workspaces key, check `scope.type == "organization"`. Tell the user which branches you changed.

These endpoints are reached through the SDKs (`client.beta.organization`: `.api_keys`, `.rate_limits`, `.rbac_groups`, `.rbac_roles`, `.analytics`), the `ant` CLI (`ant beta:organization`), and raw HTTP, so look for reads in typed code, dict keys, JSON paths and jq filters, and in anything fed from them (database columns, dashboards, exports).

### 5. The new SDK and CLI releases have breaking changes of their own

Skip this part for raw HTTP code and for an SDK or CLI that stays below the release under "Set the version". These changes are in the migration guide, under "SDK and CLI changes", not in this file. As part of the Step 1 inventory, WebFetch `https://platform.claude.com/docs/en/api/migration-2026-10-21.md?sdk_languages=<name>`, asking for that section word for word: once per SDK in scope (`python`, `typescript`, `java`, `go`, `ruby`, `csharp`, `php`; no other name) and once with `cli` if anything in scope runs or installs `ant` (scripts, CI config, Makefiles, Dockerfiles). If the result is saved to a file, read all of it.

**[BREAKS]** Go through that section heading by heading, to the end of the page: the text outside the tabs, then your language's `<Tab>`. A `<Tabs>` block with no `<Tab>` for your language comes back with every tab and does not apply to it: skip it, and never apply another language's tab. For each change that applies, search the scope for the names it gives, add the hits to the Step 1 list, and edit each as the guide shows; where it lists several fixes with the same effect, pick one. **[DECIDE]** Don't upgrade until the user has answered: which credential a client with two keeps, whether the proxy or gateway behind each custom base URL reads `X-Api-Key`, and whether you may change a proxy's or gateway's own config. Edit `X-Api-Key` headers after that. Where a heading covers the same ground as the Platforms note or changes 1-4, use its SDK names, but the **[DECIDE]** items above still hold.

**[DECIDE]** If a fetch fails, or returns a summary instead of the section's own text, don't guess at the changes: tell the user, give them the guide's link, and ask whether to hold the upgrade back (changes 1-4 can ship without it; recommended where no build or type check covers the code) or to upgrade and fix only what the build and the tests show.

### Set the version

Upgrade to an SDK release that sends `2026-10-21` by default, or, for raw HTTP, send `anthropic-version: 2026-10-21` (Step 3):

| SDK | First release that sends `2026-10-21` by default |
|---|---|
| Python (`anthropic`) | 2.0.0 |
| TypeScript (`@anthropic-ai/sdk`) | 1.0.0 |
| Go (`github.com/anthropics/anthropic-sdk-go`) | 2.0.0, whose module path is `github.com/anthropics/anthropic-sdk-go/v2`: change each import of the module and of its packages (such as `.../option`) to start with that path |
| Java (`com.anthropic:anthropic-java`) | 3.0.0 |
| C# (`Anthropic`) | 13.0.0 |
| PHP (`anthropic-ai/sdk`) | 1.0.0 |
| Ruby (`anthropic` gem) | 2.0.0 |
| `ant` CLI | 2.0.0; for `go install`, the path is now `github.com/anthropics/anthropic-cli/v2/cmd/ant@latest`; if nothing in scope installs `ant`, say in the report that the machines that run it need 2.0.0 |

Platform-client packages that ship separately: upgrade to the major released alongside the main SDK's (in TypeScript and C#, 1.0.0), unless the Platforms note keeps that SDK back. If the release in the table isn't published yet for the user's SDK (check the package registry), tell the user and offer to wait or to set the version explicitly (Step 3, "Overriding the version").

### 2026-10-21 Migration Checklist

- [ ] **[BREAKS]** `temperature`, `top_p`, `top_k` removed from every Messages request that switches to `2026-10-21`, including batch request `params` and `extra_body` - **[DECIDE]** every switching call that set a non-default value, unless its model accepts only the defaults: the user chose to delete it (recommended), to hold back the upgrade, or, last, to keep the call on the version it sends now with an override
- [ ] **[BREAKS]** No `document` block directly in an `assistant` message; documents sent in `user` messages
- [ ] **[BREAKS]** No `text` block with non-empty `citations` in a `user` message (directly, or in a `search_result`, including inside a `tool_result`); assistant-side citations and `citations: {enabled: true}` untouched
- [ ] **[BREAKS]** If the code calls the Admin API: `roles` -> `role_ids`, `group_id` -> `rbac_group_id`, role `name` -> `display_name`, `group_type` -> `group.type`, API key `workspace_id` -> `scope.workspace_id` with **[DECIDE]** the Default Workspace comparison
- [ ] **[BREAKS]** If the code calls the Claude Enterprise Analytics API: `actor.email` -> `actor.email_address`, `summaries` -> `data`
- [ ] **[BREAKS]** The guide's "SDK and CLI changes" read for each SDK in scope (and for `cli` if the scope runs or installs `ant`), and each change the code hits made - or the report says the guide could not be read (n/a where the upgrade is held back)
- [ ] Bedrock calls to an older model (Platforms note) not upgraded, or, if the user chose (**[DECIDE]**), moved to a Claude 4.7 or later model and then upgraded
- [ ] Version switched: the release in the table under "Set the version" (raw HTTP: `anthropic-version: 2026-10-21`), with no explicit version overrides except the ones the user chose, each listed in the report - or, where the upgrade is held back (change 1's choice or the Platforms note), not switched and reported as such
- [ ] Tests pass on `2026-10-21` (on `2023-06-01` where the upgrade is held back)
- [ ] Step 4 verification run and Step 5 report written
