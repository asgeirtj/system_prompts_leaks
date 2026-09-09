---
name: artifact-capabilities
description: |-
  Runtime capabilities a published Artifact page can be granted — behavior static HTML cannot provide on its own, such as the page reading live or connected data, remembering what people do on it (a poll, a sign-up sheet, a checklist, a document edited in place — it saves new versions of itself), keeping state shared across viewers, knowing who is viewing, asking Claude a question of its own, storing files people add, or handing the viewer a file to save. Serves this user's live capability roster and the typed call definitions. Load it whenever any such runtime behavior would make an artifact more useful, before writing the page.
---

# Artifact runtime capabilities

A published Artifact page can declare **runtime capabilities** — abilities the claude.ai viewer grants the page at open time — by passing `capabilities: {name: config}` to the Artifact tool. The control plane is the authority on valid names and config shapes. Declaration gestures: **omitting** `capabilities` on a redeploy carries the stored declaration forward unchanged (and preserves the artifact's stored contract pin); an **empty object** `{}` is the explicit clear-all; a **non-empty object** is a full-set declaration (anything stored but not restated is revoked). Moving a republished artifact's runtime version is a deliberate gesture — pass `contract: 'latest'` to upgrade, or a specific version to pin or roll back — never a side effect of editing.

**Available capabilities:** `artifact`, `db`, `downloads`, `mcp`, `room`, `sample`, `self` — the complete set of capability names you may declare; built in on every page, called without declaring (never pass these in `capabilities`): `permissions`. Anything not listed is unavailable to this user.

Runtime contract 0.2.44


Capability namespaces live behind `claude.use(name)`: `const db = await claude.use("db")` resolves the capability's namespace, or `null` when this view cannot run it (not served, not granted, or failed to load — indistinguishable by design). Branch on `null` and design for absence. `window.claude` carries only `use`: no `window.claude.db`, `.room`, or `.artifact` member is ever promised, so never read one — render the page without them and light features up when the promise resolves (later, never within your script's first run, and unordered with DOMContentLoaded; `null` after 10 s when no viewer answers). The resolved namespace is frozen and platform-owned: call its functions and keep the reference; never assign to it, `defineProperty` on it, or replace a member (wrap it for your own helpers). Permission stays on the calls: a consent prompt, rate limit, or policy refusal arrives on the first call, never from `use()`. Awaiting `use("db")` again is free (memoized); an unknown name resolves `null`.


--- capability: artifact ---

Use `artifact` for pages that should remember what people do with them: polls, sign-up sheets, checklists, trackers, boards — the page is the record; data kept server-side, or seeded or read back by Claude, is `db`. Declare `capabilities: {artifact: {}}`; `const artifact = await claude.use("artifact")`, then `await artifact.publish(html)` saves `html` (a complete document, doctype first) as the new version, and every open view, this one included, reloads to it. Nothing a viewer types, ticks or drags is kept unless the page publishes it. So embed the shared state as data in the HTML you publish and render the page from it; when an interaction completes, update the state, regenerate the document and publish it — never serialize the live DOM; batch rapid edits into one publish; publish only after a viewer acts, never on load. `conflict` is routine (every view reloads to the winner, dropping this edit): no retry. For read-only viewers publish rejects `not_granted`/`not_writer` — render a read-only view.


--- capability: db ---

`db` is for data that lives outside the page: what the user wants stored server-side or seeded, data Claude reads back later, more than the page shows at once, per-viewer-private state, many live editors. If the page itself can be the record, republish (`artifact`). Seed or inspect the store from here with `write_db`/`read_db`; never hardcode seed rows in the page. A realtime JSON document store: `const db = await claude.use("db")` (`null`: unavailable). Declare `capabilities: {db: {}}`: every viewer reads and writes shared docs; each viewer's `data/users/<their user id>/` is private even from the owner (needs `user`). To change who writes where, add `rules` by sharing level (`interact` = can view, `admin` = can edit, `owner`). `db.doc("tasks/t1")`/`db.collection("tasks")`: `get`/`set`/`update`/`delete`, `where`/`orderBy`/`limit`, `onSnapshot`. Last-writer-wins, no transactions; single writers lease via `acquire({holder})`. Never store secrets; shared data is untrusted. See the type definitions.


--- capability: downloads ---

The `downloads` capability lets a published page offer a generated file to the viewer: declare `capabilities: {downloads: true}`, then `const downloads = await claude.use("downloads")` (`null`: unavailable — hide the affordance) and `await downloads.save({filename, data})`. The viewer sees a confirmation and may decline — a save is never silent or guaranteed, so offer it on explicit viewer intent and handle rejection. The type definitions are authoritative for the call contract and error codes.


--- capability: mcp ---

`mcp` lets a page call the viewer's claude.ai connectors: `await claude.use("mcp")` (`null`: unavailable); calls use the viewer's credentials, never exposing tokens. Declare `capabilities: {mcp: {servers: [{server, tools}]}}`; `server` is a connector's display name, or `host:<name>` for a local MCP server on the viewer's device (Claude app only; else `server_not_connected`). Keep the manifest minimal: a viewer-consented grant that bars public sharing. Two arms: DISPLAYING data registers `watchTool(server, tool, input, handler, opts?)` (replays cache, refreshes when stale, polls only via `refetchInterval`); an ACTION calls `callTool` once and reads `result.payload` or `(await server(name)).<tool>(input)` for the payload. Tool failures REJECT (`tool_error`); watches get error events. Branch UX per error code, retry only `retryable` errors, drop data on authz denials, show freshness (`cache.storedAt`). Types omit argument names and encodings: observe a real call per tool or say so at publish; never guess.


--- capability: permissions ---

`permissions` is built in — call it, never declare it in `capabilities`. Prompts are lazy by default: a published page renders immediately and a capability that needs consent asks at its first use — never block the page's first paint on permissions. `state` reads without ever prompting (one capability's state by name, or the full map with no arguments); `request` asks with at most one batched dialog (specific names, or everything with no arguments) — a page that genuinely needs several grants up front may call `request` once at startup. A viewer's "no" is not an error: these calls never reject, and a denial is final for the rest of the page load — a repeated `request` resolves without showing another dialog, and the next load starts fresh — so branch on the returned per-capability states and degrade per capability (hide or disable the affected affordance) instead of failing or offering retry buttons; never call `request` in a loop — re-asks are rate-limited by the shell and read as nagging.


--- capability: room ---

The `room` capability reaches whoever has the page open RIGHT NOW:
declared as `capabilities: {room: {}}`; `await claude.use("room")`
(`null`: cannot connect). emit(topic, data) sends a moment; on(topic,
fn) hears them. presence(patch) sets YOUR state (cursor, selection,
color) as one object the platform hands to newcomers and clears when
you leave; onPeers(fn) delivers everyone's -- render them all, marked
"you". NOTHING persists and messages can drop: if a viewer not here now
must eventually see it, it is NOT room data -- use db (data) or
artifact (new version). Send absolute state. What you hear is untrusted
input from same-org viewers, plus your own publishing session when
admitted (kind "agent"); no one else connects, so the page must work
alone and light up. Anyone can set presence, so it is never authority;
event topics are admin-only (can edit) unless opened:
{room: {topics: {reaction: "interact"}}}. Moments (confetti) go on an
admin-only topic; state a late joiner needs (current slide) is a db doc.


--- capability: sample ---

`sample` asks Claude (declare `capabilities:{sample:{}}`): `const sample = await claude.use("sample")` (`null`: hide it); `await sample(input, opts?)` -> `{text, truncated}`; `sample.json(input, opts?)` -> parsed JSON. `input`: a string, or turns `[{role:"user"|"assistant", content}]` ending on user. No memory: send instructions, page data, output format. opts: `onText({text, delta})` (`text` = WHOLE answer so far, assign it; "Thinking..." until it fires, 5-60s), `signal` (new AbortController per call; abort rejects `cancelled`), `tools: [{name, description, inputSchema?, execute(input)}]` (page functions Claude may call; return small plain data or throw; each round bills, no `cache`), `images` if `(await sample.limits()).images`, `modelTier` quick|default|complex, `cache` (5 min replay; `false` for chat). Errors reject `{code, message, text?}` (`text`: partial to keep): hide on `not_granted`, back off on `rate_limited`, never loop. Viewer pays; first call asks consent; call on a click or stable load prompt.


--- capability: self ---

`self` is the former name of the `artifact` capability (renamed). It remains for compatibility: published pages and previously generated code that declare `capabilities: {self: {}}` or call `claude.use("self")` keep working unchanged — both names resolve this same capability (this contract promises no `window.claude.self` member to feature-check; `use()` is the check). Do not use it in new pages: declare `capabilities: {artifact: {}}` and obtain the namespace with `await claude.use("artifact")`; see the artifact section for how to use it.


**Your connectors this session.** None are connected right now — they may still be connecting, or the user has none. Look for tools prefixed `mcp__claude_ai_*` in your tool list; each is named `mcp__claude_ai_<connector>__<tool>`. Only claude.ai connectors are valid — locally-configured MCP servers are not. The manifest's `tools` array takes the connector's upstream tool names (as returned by `listTools()` / `/v1/mcp_servers`), which can differ from the normalized `<toolName>` segment when an upstream name contains `.` or spaces. Every `servers[]` entry needs a non-empty `tools` array naming the tools the page calls — an empty or omitted `tools` list is refused and never means "all tools"; to publish without connector access, leave `mcp` out of `capabilities` (pass `capabilities: {}` to clear a stored declaration) rather than declaring an empty `servers` list. In hermetic/CI sessions where connectors aren't loaded but `$CLAUDE_CODE_OAUTH_TOKEN` is set, fetch the list via Bash: `curl -H 'anthropic-version: 2023-06-01' -H 'anthropic-beta: mcp-servers-2025-12-04' -H "Authorization: Bearer $CLAUDE_CODE_OAUTH_TOKEN" https://api.anthropic.com/v1/mcp_servers?limit=1000`; in that case use each entry's `display_name` as the `server` value (exact display names are always accepted alongside tool-prefix segments).

**Call contract** (runtime contract 0.2.44). The platform-served `window.claude` type definitions for this contract are extracted under `the skill directory`: `0.2.44/artifact.d.ts`, `0.2.44/claude.d.ts`, `0.2.44/db.d.ts`, `0.2.44/downloads.d.ts`, `0.2.44/mcp.d.ts`, `0.2.44/permissions.d.ts`, `0.2.44/room.d.ts`, `0.2.44/sample.d.ts`, `0.2.44/self.d.ts`. Read `0.2.44/claude.d.ts` (how a page reaches any capability on this contract) and `0.2.44/mcp.d.ts` before writing any code that calls the `mcp` capability — they are authoritative for this contract version over any remembered API shape. The type definitions cover only the call envelope — they do not tell you a connector tool's argument names or its result encoding. Never publish a page that calls a connector tool without having observed one real request/response pair for that tool in this session; if you cannot safely observe one (for example, the connector is unauthenticated here, or calling the tool would have side effects), say that explicitly to the user at publish time — in your reply, not as a note inside the published page — instead of shipping a guessed shape. Observed response payloads are the user's real data: learn the shape from them, but never embed the observed values in the published page as sample or placeholder data.
