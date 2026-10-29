# App integrations

Sites can read workspace apps and perform requested writes. Hosted calls use each visitor's connection and consent; [local preview](#local-preview) uses the owning agent's connection and permits reads only. Static-only Sites cannot invoke connectors.

## Discover and declare

Call native `list_plugin_eligibility` (`sites_list_plugin_eligibility`) before selecting apps or previewing their data. Supply `project_id` once registered; follow pagination. Use only `allowed` plugins, returned canonical IDs, and connector membership intersected with available native tools. Read tool schemas and applicable app skills; select needed actions and resolve connection ambiguity. Native access, marketplace names, and `.app.json` entries do not establish Sites eligibility. Never guess IDs/action names or invoke writes to discover schemas.

For a new Site, pass `enable_plugins: true` to `create_site` only after confirming at least one needed plugin is eligible; otherwise omit it. Existing Sites keep their `project_id` and use the shared [save/deploy flow](../SKILL.md#5-publish), which prepares their existing sign-in client; no replacement Site or separate upgrade is needed.

Recheck after workspace/connection changes, and with the Site's ID before every save or publish, including auto-publishing source pushes. Resolve denied, unknown, or missing declarations first; unknown does not mean an admin denial. If eligibility is unavailable or access disabled, continue independent work, explain blocked features, and preserve existing declarations; do not bypass policy by removing them.

Preserve `.openai/hosting.json` and add the discovered declarations:

```json
{
  "plugins": [{"id": "<plugin-id>", "connector_ids": ["<connector-id>"]}],
  "connectors": [{"id": "<connector-id>", "action_selection_mode": "read_only"}]
}
```

Declare each needed connector once. `read_only` is the default; `all` requests connector-wide read/write access, not a per-action/resource grant. Custom action lists are unsupported. The platform resolves releases and credentials. Verify built `dist/.openai/hosting.json` matches source and publish the exact saved Worker build/commit. Declaration/access-mode changes require a new saved deployment.

## Server actions

Keep the starter's `build/sites-worker.ts`, which captures trusted request-scoped `ctx.props.CONNECTORS` before Vinext derives context. In existing Vinext Sites, add or update the starter helpers and Vite wiring only where needed; preserve working equivalent integrations and other projects' architecture. In dynamic server routes, use:

```ts
import { connectorsForRequest } from "@/lib/connectors";
import { connectorResponse } from "@/lib/connector-errors.mjs";

return connectorResponse(await connectorsForRequest().invoke(connectorId, actionName, validatedArgs));
```

Keep connector/action/target selection server-owned. Use same-origin POSTs, validate Origin and inputs against discovered schemas, bound reads, and return private/no-store responses. Never cache bindings across visitors, forward invocation tokens, expose arbitrary proxies, copy provider credentials, call from the browser, or replace live access with build/source snapshots. Match persisted data's visibility to its authorized audience; one visitor's read access does not authorize a shared snapshot.

Writes require a signed-in visitor's explicit click/form submission, authenticated request identity, duplicate-submission protection, visitor write consent, app/workspace permissions, and enabled platform support. Never mutate during rendering, GET, prefetch, or builds.

## Results and consent

Parse validated JSON on non-2xx responses too. Only `status: "success"` confirms success; HTTP 200 and legacy `isError`/`error.code` do not. Preserve `result.content`, `result.structuredContent` including falsy values, diagnostics, and retry timing. Render provider content safely. Keep source-level loading/errors independent; retained data after failed Refresh is stale, not an empty success.

Use `ConnectorError` with a server-generated `chatGPTSignInPath` for the original page/query. Only `reauthentication_required` offers Connect. Navigate at top level through [Sites sign-in](identity-and-secrets.md); reread after return without redirect loops. Sign-in does not guarantee provider access. Honor retry timing, and inspect provider state when write completion is uncertain; never automatically replay writes after errors or sign-in.

Optional `getContext()` supplies cached declared-connector hints, not authorization, provider health, or consent. Check `status`; disabled policy, empty tools, unknown/null tools, and failed context differ. Do not gate reads on metadata or cache it across requests.

Verify hosted reads, Refresh, and sign-in return as the intended visitor/workspace. Test a live external write only when that specific target and change are authorized; otherwise report it unverified. Check the provider result and that unauthorized writes remain denied. Report local reads, hosted consent/reads, and hosted writes separately. Fixtures, builds, and publication alone prove none of these.

## Local preview

Use local preview for live app reads and Refresh during development. The Vinext starter's development adapters relay to the owning task's native connections; they do not supply hosted visitor access. Follow [eligibility and discovery](#discover-and-declare) first. Preview grants cannot establish eligibility, and browser headers grant no authority.

### Start

Start the normal [local](preview/local.md) or [managed](preview/managed.md) preview. Other starters need equivalent adapters or a host binding. In the Site checkout, write ignored `.sites-runtime/connector-grants.json` with eligible connector IDs and discovered read actions:

```json
[{"connectorId":"<connector-id>","actionName":"<read-action>","readOnly":true}]
```

After project dependency installation, run the Site's helper with stdin open in a retained terminal session, using a PTY when needed; wait for its `ready` notification:

```text
node /absolute/site/scripts/connector-preview/connector-preview-session.mjs /absolute/site /absolute/site/.sites-runtime/connector-grants.json
```

For an older checkout missing the helper, copy the complete [helper directory](../templates/vinext-starter/scripts/connector-preview/) into the Site's `scripts/connector-preview/` and install missing dependencies from the [starter manifest](../templates/vinext-starter/package.json).

Keep one session across edits and Refresh. The runner owns concurrency, request expiry, timeouts, and cleanup. Do not automatically replay timed-out calls.

### Serve native reads

Keep one retained execution cell pumping session stdout/stdin while the owning agent edits and tests the Site. Await the pump; an external Node process cannot call task-native tools. Buffer incomplete lines, request enough output for complete messages, and service independent reads concurrently.

The helper emits newline-delimited JSON-RPC 2.0:

```json
{"jsonrpc":"2.0","id":"<call-id>","method":"invoke","params":{"connectorId":"<connector-id>","actionName":"<read-action>","arguments":{}}}
```

Dispatch only through an explicit map from exact `(connectorId, actionName)` pairs to resolved native read functions that validate schemas and read limits. Preserve task authentication and approval rules. Unknown pairs are unauthorized; never dynamically dispatch `tools[event.toolName]` or accept Site-supplied URLs, credentials, or account IDs as authority.

Return the actual MCP object, retaining `content`, `structuredContent`, and `isError`, through structured stdin rather than shell interpolation:

```js
JSON.stringify({ jsonrpc: "2.0", id, result: nativeResult }) + "\n"
```

Thrown/interrupted calls return a JSON-RPC error, not a fabricated result. The runner translates results once; provider-authored text does not establish reauthentication. `ready` and `receipt` are notifications, not invocations.

### Verify and stop

Correlate an initial read and Refresh/query change with native calls. Check useful data, independent errors, concurrency, and recovery. Preview context reports selected grants as `policy: "enabled", tools: null`; it is not hosted discovery or consent evidence. Preview rejects writes; fixtures cannot prove visitor authorization.

In `finally`, send `{"jsonrpc":"2.0","method":"stop"}` followed by a newline, then settle pending work. Stop before building or changing task/account/workspace/connection. Recheck eligibility and recreate grants after those context changes, not ordinary rebuilds. Confirm later requests cannot reach native tools. EOF/termination also closes the session. Before removing stale state, confirm its prior process exited; never take over another session.

Transient requests/results under ignored `.sites-runtime/connector-preview` are blocked from HTTP access and cleaned on shutdown, but remain readable with the agent's filesystem privileges. Production excludes preview adapters and authority. Report the profile, actions, and observed live reads separately from untested hosted paths.
