# Admin API (Organization Management)

Read this file when the user wants to manage their Anthropic organization programmatically: members and roles, invites, workspaces and workspace members, API keys, rate limit reports, usage and cost reports, service accounts, workload identity federation (WIF), or customer-managed encryption keys (CMEK).

The Admin API lives under `https://api.anthropic.com/v1/organizations/*`. It manages the organization itself - it does not send messages. As of **August 26, 2026** it is available in all seven SDKs (Python, TypeScript, C#, Go, Java, PHP, Ruby) under `client.beta.organization`, and in the `ant` CLI under `ant beta:organization`. Current SDK releases also have endpoints for Claude Enterprise organizations: the Claude Enterprise Analytics API (`.analytics`), RBAC groups and roles (`.rbac_groups`, `.rbac_roles`) and spend limits (`.spend_limits`). Claude Enterprise organizations call them with a scoped key that the primary owner creates in claude.ai with the matching scopes (custom-role reads use `read:members`), not an `sk-ant-admin` key. An early-access preview lets some Console organizations use their admin credential here instead, to set, read, list and delete spend limits on their organization and workspaces. The Usage and Cost Analytics API (`.analytics.usage`, `.analytics.cost`), which is separate from the Claude Enterprise Analytics API though it shares the `.analytics` accessor, serves Console and Claude Enterprise organizations alike: see Usage and Cost Analytics below. The Admin API's older usage and cost reports (`GET /v1/organizations/usage_report/messages`, `GET /v1/organizations/cost_report`) are legacy but still supported, and are **not** in the SDKs - call those with raw HTTP.

## Authentication

Two kinds of credential, both read automatically by the default SDK client and the CLI:

| Credential | Env var | HTTP header | Covers |
| --- | --- | --- | --- |
| Admin API key (`sk-ant-admin...`), or an organization-scoped API key linked to a user or service account | `ANTHROPIC_API_KEY` | `x-api-key` or `authorization: Bearer` | Most endpoints |
| `org:admin` OAuth token | `ANTHROPIC_AUTH_TOKEN` | `authorization: Bearer` | Everything, including the OAuth-only endpoints |

- **API key header:** the API accepts an API key in either header; the SDK and CLI releases that send API version `2026-10-21` send it as `authorization: Bearer`.
- **OAuth-only endpoints:** service accounts, federation issuers, and federation rules reject API keys - they require an `org:admin` OAuth token.
- **Precedence gotcha:** when both env vars are set, some clients prefer the API key. When using a bearer token, leave `ANTHROPIC_API_KEY` unset in that shell.
- Admin API keys are created in the Claude Console by organization admins.
- Workspace-scoped API keys do not work on these endpoints (except `GET /v1/organizations/me`), and admin credentials do not work on the Messages API.
- An `org:admin` token grants access to the whole organization regardless of any workspace binding.

**Interactive OAuth token** - log in with the `ant` CLI under a dedicated profile (keeps routine commands from running with elevated access), then export the token. Tokens are short-lived; on 401, re-run the export. Profile and scope mechanics (why `org:admin` needs an explicit `--scope`, switching profiles): `shared/anthropic-cli.md`.

```bash
ant auth login --profile admin --scope "org:admin"
export ANTHROPIC_AUTH_TOKEN=$(ant auth print-credentials --profile admin --access-token)
# When done: unset ANTHROPIC_AUTH_TOKEN && ant profile activate default
```

**Automated workloads (CI)** - don't log in interactively. Create a federation rule with `oauth_scope: org:admin` targeting a service account whose `organization_role` is `admin` (this one rule must be created by a human in the Claude Console), then point the client at it with the federation env vars and construct it with no arguments - the SDK/CLI performs the token exchange automatically and refreshes before expiry:

```bash
export ANTHROPIC_FEDERATION_RULE_ID=fdrl_...       # the org:admin rule
export ANTHROPIC_ORGANIZATION_ID=<org-uuid>
export ANTHROPIC_SERVICE_ACCOUNT_ID=svac_...       # the rule's target service account
export ANTHROPIC_IDENTITY_TOKEN_FILE=/path/to/jwt  # or ANTHROPIC_IDENTITY_TOKEN
```

**curl** also needs an `anthropic-version` header on every request (for example `2026-10-21`).

## Fields removed in API version `2026-10-21`

On API version `2026-10-21`, which the SDK and CLI releases under `shared/api-version-migration.md` -> Set the version send by default, the responses below no longer include the old field, and no error says so. Read the new field instead.

| Endpoints | Old field | New field |
| --- | --- | --- |
| RBAC groups: create, list, retrieve, update | `roles` | `role_ids` |
| RBAC group members: list, add, remove | `group_id` | `rbac_group_id` |
| RBAC roles: list, retrieve | `name` | `display_name` |
| Organization and workspace rate limits: list, and setting a workspace's limits | `group_type` | `group.type` |
| API keys: list, retrieve, update | `workspace_id` | `scope` (different values, below) |
| Claude Enterprise Analytics per-user usage and cost reports | `actor.email` | `actor.email_address` |
| Claude Enterprise Analytics activity summaries | `summaries` | `data` |

On `2023-06-01`, an API key's `workspace_id` is `null` both for a key in the Default Workspace and for an all-workspaces key. On `2026-10-21`, `scope.workspace_id` is the real ID of the key's workspace, the Default Workspace included, and an all-workspaces key has `scope: {"type": "organization"}` with no `workspace_id`. The `group_type` query parameter and the API key list's `workspace_id` filter are unchanged. To migrate existing code, follow change 4 in `shared/api-version-migration.md`.

## Endpoint Coverage

SDK accessor shown in Python spelling; see the per-language table below for naming conventions.

| Resource | REST path | SDK accessor (`client.beta.organization` +) | CLI (`ant beta:organization` +) |
| --- | --- | --- | --- |
| Organization info | `GET /v1/organizations/me` | `.retrieve()` | `retrieve` |
| Members | `/v1/organizations/users` | `.users` - `list`, `update`, `remove` | `:users list\|update\|remove` |
| Invites | `/v1/organizations/invites` | `.invites` - `create`, `list`, `delete` | `:invites create\|list\|delete` |
| Workspaces | `/v1/organizations/workspaces` | `.workspaces` - `create`, `retrieve`, `list`, `update`, `archive` | `:workspaces create\|list\|update\|archive` |
| Workspace members | `/v1/organizations/workspaces/{id}/members` | `.workspaces.members` - `add`, `list`, `update`, `remove` | `:workspaces:members add\|list\|update\|remove` |
| API keys | `/v1/organizations/api_keys` | `.api_keys` - `list`, `update` | `:api-keys list\|update` |
| Org rate limits | `GET /v1/organizations/rate_limits` | `.rate_limits.list(model=..., group_type=...)` | `:rate-limits list` |
| Workspace rate limits | `GET /v1/organizations/workspaces/{id}/rate_limits` | `.workspaces.rate_limits.list(workspace_id)` | `:workspaces:rate-limits list` |
| Service accounts (*) | `/v1/organizations/service_accounts` | `.service_accounts` - `create`, `list`, `archive` | `:service-accounts create\|list\|archive` |
| Federation issuers (*) | `/v1/organizations/federation_issuers` | `.federation.issuers` - `create`, `list`, `archive` | `:federation:issuers create\|list\|archive` |
| Federation rules (*) | `/v1/organizations/federation_rules` | `.federation.rules` - `create`, `list`, `archive` | `:federation:rules create\|list\|archive` |
| CMEK external keys | `/v1/organizations/external_keys` | `.external_keys` - `create`, `validate` | - |
| Usage and cost analytics (beta) | `/v1/organizations/analytics/usage`, `/v1/organizations/analytics/cost` | `.analytics.usage` - `list`; `.analytics.cost` - `list` | `:analytics:usage list`, `:analytics:cost list` |

(*) OAuth-only: requires an `org:admin` bearer token, not an API key.

Attaching a CMEK external key to a workspace is a workspace update: `client.beta.organization.workspaces.update("<workspace-id>", external_key_id="ekey_...")`.

## Per-Language Naming & Pagination

| Language | Accessor style (list members example) | List behavior |
| --- | --- | --- |
| Python | `client.beta.organization.users.list(limit=10)` | Iterator auto-fetches more pages; `limit` = page size, not total |
| TypeScript | `client.beta.organization.users.list({ limit: 10 })` - camelCase sub-resources: `apiKeys`, `rateLimits`, `serviceAccounts`, `externalKeys` | `for await` auto-pages |
| C# | `client.Beta.Organization.Users.List(new() { Limit = 10 })` | `await foreach (var u in page.Paginate())` auto-pages |
| Go | `client.Beta.Organization.Users.ListAutoPaging(ctx, params)`; org info is `Organization.Get(ctx)` | `.Next()` / `.Current()` auto-pages |
| Java | `client.beta().organization().users().list(params)` with builder params (`UserListParams.builder().limit(10).build()`) | `.autoPager()` auto-pages |
| PHP | `$client->beta->organization->users->list(limit: 10)` | Raw single-page data call - iterate `->getItems()`; the SDK's auto-pagination helpers aren't wired up for these endpoints yet |
| Ruby | `client.beta.organization.users.list(limit: 10)` | Raw single-page data call - iterate `.data`; the SDK's auto-pagination helpers aren't wired up for these endpoints yet |
| CLI | `ant beta:organization:users list --limit 10` | On the member, invite, workspace, workspace-member, and API-key lists, `--limit` caps the results (unlike most `ant` list commands, where `--limit` sets the page size and `--max-items` caps - see `shared/anthropic-cli.md`) |
| curl | `GET /v1/organizations/users?limit=10` | One page per request; cursor pagination per the Admin API reference |

The rate-limit lists (`rate_limits`, `workspaces.rate_limits`) also support pagination as of launch - page them like the other list endpoints rather than assuming a single response.

Go param types follow the pattern `anthropic.BetaOrganizationUserListParams` (with `anthropic.Int(10)` for `Limit`); Java params use builders from `com.anthropic.models.beta.organization.*` (e.g. `UserListParams.builder().limit(10).build()`). The Go and Java pagination loops:

```go
users := client.Beta.Organization.Users.ListAutoPaging(ctx, anthropic.BetaOrganizationUserListParams{Limit: anthropic.Int(10)})
for users.Next() {
	user := users.Current() // ...
}
if err := users.Err(); err != nil { /* handle */ }
```

```java
for (var user : client.beta().organization().users().list(params).autoPager()) { /* ... */ }
```

## Examples

Common operations (Python spelling; map to other languages with the table above - every operation follows the same shape in each language):

```python
# Organization info
org = client.beta.organization.retrieve()

# List members (iterator auto-fetches more pages; limit = page size)
for user in client.beta.organization.users.list(limit=10):
    print(f"{user.id}: {user.email} ({user.role})")

# Change a member's role / remove a member
client.beta.organization.users.update("user_...", role="developer")
client.beta.organization.users.remove("user_...")

# Invite someone
client.beta.organization.invites.create(email="user@example.com", role="developer")

# Create a workspace and add a member to it
ws = client.beta.organization.workspaces.create(name="Production")
client.beta.organization.workspaces.members.add(
    ws.id, user_id="user_...", workspace_role="workspace_developer"
)

# Deactivate / rename an API key
client.beta.organization.api_keys.update("apikey_...", status="inactive", name="New Key Name")

# Rate limit reports (optional filters: model=..., group_type=...)
client.beta.organization.rate_limits.list(model="claude-opus-5-5")
client.beta.organization.workspaces.rate_limits.list("wrkspc_...")

# Service accounts + WIF (org:admin OAuth token required)
sa = client.beta.organization.service_accounts.create(name="inference-worker", organization_role="developer")
issuer = client.beta.organization.federation.issuers.create(
    name="github-actions",
    issuer_url="https://token.actions.githubusercontent.com",
    jwks={"type": "discovery"},
)
client.beta.organization.federation.rules.create(
    name="gha-deploy",
    issuer_id=issuer.id,
    match={"subject_prefix": "repo:my-org/my-repo:ref:refs/heads/main",
           "claims": {"repository_owner": "my-org"}},
    target={"type": "service_account", "service_account_id": sa.id},
    workspace_id="wrkspc_...",
    oauth_scope="workspace:developer",
    token_lifetime_seconds=600,
)

# CMEK: register, validate, then attach an external key to a workspace
# (on Claude Platform on AWS the client differs and there is no validate step: see Platform Restrictions)
key = client.beta.organization.external_keys.create(
    display_name="prod-key", geo="us",
    provider_config={"type": "aws", "kms_arn": "arn:aws:kms:..."},
)
client.beta.organization.external_keys.validate(key.id)
client.beta.organization.workspaces.update("wrkspc_...", external_key_id=key.id)
```

## Usage and Cost Analytics (beta)

`GET /v1/organizations/analytics/usage` (token and request counts) and `GET /v1/organizations/analytics/cost` (USD) report the organization's history by dimensions such as `model`, `workspace_id`, `api_key_id`, `service_tier`, `product` and `actor`. curl needs `anthropic-beta: analytics-usage-cost-2026-08-24` (without it the call fails with a bare 404 or an authorization error about `read:analytics`, not a message about the beta), and `--globoff` for the `[]` in parameter names; the SDKs and `ant` send the header and fetch further pages for you: in PHP through `pagingEachItem()` and in Ruby through `auto_paging_each`, even though the Per-Language table gives single-page calls for those two languages. Full parameters and the migration tables from the older reports: the usage and cost analytics page under Live Docs below. Before the first query:

- **Range:** `starting_at` is required, on or after 2026-01-01 and within the last 365 days; a request spans at most 31 days (24 hours with `1m` buckets), so split longer ranges. Both ends round down to a UTC bucket boundary, or to the hour with no bucket width, so to compare two reads, put both ends on a boundary that neither read moves, such as UTC midnight when one read uses `1d` buckets.
- **Rows, not buckets:** `time_bucket_width` (`1m`, `1h`, `1d`) has no default, and setting it requires `ending_at`; without it, each combination of `group_by[]` values is one row covering the whole range. Rows are ranked by `order_by`, largest first; with a bucket width, `order_by=time` gives a time series, newest bucket first (`order=asc` for oldest first), and empty buckets have no row.
- **Paging:** `limit` counts rows (default 20, max 1,000); the extra rows that splitting `/cost` by `cost_type` or `token_type` adds don't count toward it. With curl, repeat the request with the same parameters and `page=<next_page>` while `has_more` is true. An HTTP 410, from curl or an SDK iterator, means the cursor expired when the data refreshed: start again from the first page.
- **Grouping:** up to five `group_by[]` dimensions; a dimension you don't group by is `null`. `/cost` can also split by `cost_type` and `token_type` (not counted in the five); the legacy cost report's `description` grouping is gone. Every filter works on both endpoints.
- **An empty result isn't always zero spend:** `data` is empty, with `data_refreshed_at: null`, when no data has landed yet for any part of the range. An unknown ID or a misspelled `models[]` value matches nothing instead of returning an error, and so does a filter on `api_key_id`, `workspace_id` or `service_tier` on Claude Enterprise. A filter on `rbac_group_id` returns an error instead when teams aren't available to the organization.
- **Freshness:** data typically lands within 4 hours and can take up to 24 hours. Each response's `data_refreshed_at` marks where complete data ends; for stable results, set `ending_at` at or before one you have already seen. Closed months can still be revised; for billed amounts, use the invoice.
- **Cost fields:** `amount` is the cost after discounts and before credits, and `list_amount` the list price, both decimal strings in cents. Requests under a Priority Tier commitment appear on `/usage` (`service_tier: "priority"`) but add zero token cost on `/cost`; the commitment fee isn't in this data.
- **Credentials:** Console organizations use an Admin API key or `org:admin` OAuth token; Claude Enterprise organizations a `read:analytics` key. On Claude Platform on AWS, the IAM actions `ListAccountUsage` and `ListAccountCost` authorize the calls, and each request covers only the workspaces in its endpoint's region. On Claude Models on Google Cloud (Anthropic managed), use the organization-level base URL with the `usageAnalytics.list` (`/usage`) and `costAnalytics.list` (`/cost`) permissions.
- **Legacy Admin API reports:** `GET /v1/organizations/usage_report/messages` and `GET /v1/organizations/cost_report` have no date floor: use them for dates before 2026-01-01 or more than 365 days back, or if the new endpoints return an error saying they aren't available to the organization. Console organizations have both, Claude Models on Google Cloud (Anthropic managed) only the usage report, and Claude Platform on AWS neither. Their `limit` counts buckets (default 7, 24 or 60, at most 31, 168 or 1,440 for `1d`, `1h` or `1m`), so follow `next_page` while `has_more` is true. Paging can go faster, but repeated polling should stay at about once a minute. For today's tokens, use `usage_report/messages` with `bucket_width=1h` or `1m`: it lags by about 30 minutes, and a bucket appears only after it ends (with `1d` it stops at the last UTC midnight). `cost_report` is daily, stops at the last UTC midnight and, unlike `usage_report/messages`, leaves out Priority Tier commitment rows; for ranges from October 2025 on it reads the same data as `/cost`. So today's dollars come only from `/analytics/cost`, up to its `data_refreshed_at`.
- **Legacy Claude Enterprise reports:** `usage_report`, `cost_report`, `user_usage_report` and `user_cost_report` under `/v1/organizations/analytics/` are legacy too. They share the new endpoints' earliest date, 365-day lookback and 4-to-24-hour data delay, so they don't help with same-day or pre-2026 reads.

## Organization Roles

| Role | Permissions |
| --- | --- |
| `user` | Playground |
| `claude_code_user` | Playground + Claude Code |
| `developer` | Playground + manage API keys |
| `billing` | Playground + manage billing |
| `admin` | All of the above + manage users |

These roles apply to Claude Console organizations. Claude Enterprise organizations have a different set of roles, and the API can assign only `user` and `managed` there. Workspace roles are `workspace_user`, `workspace_developer`, `workspace_admin`, and `workspace_billing`.

## Platform Restrictions

- **Claude Platform on AWS:** only the workspace, CMEK external-key, telemetry destination and usage and cost analytics endpoints work. Requests go through Amazon's gateway, signed with the user's AWS credentials (`shared/claude-platform-on-aws.md`; for destinations, `shared/opentelemetry.md`); Admin API keys and OAuth tokens don't work there. There is no external-key validate endpoint: a key is validated when it's attached to a workspace. Keys can also be registered and attached in the Claude Console. Members, workspace members, invites, API keys, rate-limit reports and the legacy usage and cost reports are unavailable.
- **Claude Models on Google Cloud (Anthropic managed):** most of these endpoints are not offered, and Admin API keys don't work there. The usage and cost analytics endpoints and the legacy usage report (`GET /v1/organizations/usage_report/messages`) go through the organization-level base URL (this platform's docs page in `shared/live-sources.md`) with Google Cloud credentials and `roles/claude.admin`, the only predefined role that grants their permissions. There is no legacy cost report. Register, verify and attach CMEK keys in the Claude Console, and manage workspaces there too.
- **Claude Enterprise (claude.ai orgs):** members and invites, usage and cost analytics, plus Enterprise-only endpoints (groups and group members, read and write; custom-role reads; spend limits; the Claude Enterprise Analytics API), all called with the scoped claude.ai key described at the top of this file. Current SDK releases have them under `client.beta.organization`.

## Live Docs

| Topic | URL |
| --- | --- |
| Admin API guide | `https://platform.claude.com/docs/en/manage-claude/admin-api.md` |
| Admin API reference | `https://platform.claude.com/docs/en/api/admin.md` |
| Workspaces | `https://platform.claude.com/docs/en/manage-claude/workspaces.md` |
| Rate limits API | `https://platform.claude.com/docs/en/manage-claude/rate-limits-api.md` |
| WIF admin | `https://platform.claude.com/docs/en/manage-claude/wif-admin-api.md` |
| Usage and cost analytics | `https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api.md` |
| Legacy usage & cost reports (curl-only) | `https://platform.claude.com/docs/en/manage-claude/usage-cost-api.md` |
