---
name: artifact-capabilities
description: |-
  Runtime capabilities a published Artifact page can be granted — behavior static HTML cannot provide on its own, such as the page reading live or connected data, remembering what people do on it (a poll, a sign-up sheet, a checklist, a document edited in place — it saves new versions of itself), keeping state shared across viewers, knowing who is viewing, asking Claude a question of its own, storing files people add, or handing the viewer a file to save. Serves this user's live capability roster and the typed call definitions. Load it whenever any such runtime behavior would make an artifact more useful, before writing the page.
---

# Artifact runtime capabilities

A published Artifact page can declare **runtime capabilities** — abilities the claude.ai viewer grants the page at open time — by passing `capabilities: {name: config}` to the Artifact tool. The control plane is the authority on valid names and config shapes. Declaration gestures: **omitting** `capabilities` on a redeploy carries the stored declaration forward unchanged (and preserves the artifact's stored contract pin); an **empty object** `{}` is the explicit clear-all; a **non-empty object** is a full-set declaration (anything stored but not restated is revoked). Moving a republished artifact's runtime version is a deliberate gesture — pass `contract: 'latest'` to upgrade, or a specific version to pin or roll back — never a side effect of editing.

**A page that republishes itself** through the `artifact` capability sends its whole document in exactly the shape the Artifact tool publishes, so a later publish from the tool recognizes and replaces the skeleton instead of nesting it: `<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>` the same small reset the tool's description names `</style></head><body>` — no whitespace between those tags and nothing else in the head — then the page content exactly as it was written for the tool (its `<title>` and `<style>` first, inside the body, regenerated from the page's state), then `</body></html>`.

**Available capabilities:** `artifact`, `assets`, `comments`, `db`, `downloads`, `files`, `mcp`, `room`, `sample`, `self`, `user` — the complete set of capability names you may declare; built in on every page, called without declaring (never pass these in `capabilities`): `permissions`. Anything not listed is unavailable to this user.

> Tool spelling in this session: the `Artifact` tool's `action: "read_db"` / `"write_db"` with a `db_op` are the `ArtifactData` tool, whose `action` is that `db_op` ("get", "list", "query", "set", "update", "str_replace", "delete", "batch") with the other fields unchanged — load it with ToolSearch when you first need it. Read the steps below with that substitution.

Runtime contract 0.2.89


Capability namespaces live behind `claude.use(name)`: `const db = await claude.use("db")` resolves the capability's namespace, or `null` when this view cannot run it (not served, not granted, or failed to load — indistinguishable by design). Branch on `null` and design for absence. `window.claude` carries only `use`: no `window.claude.db`, `.room`, or `.artifact` member is ever promised, so never read one — render the page without them and light features up when the promise resolves (later, never within your script's first run, and unordered with DOMContentLoaded; `null` after 10 s when no viewer answers). The resolved namespace is frozen and platform-owned: call its functions and keep the reference; never assign to it, `defineProperty` on it, or replace a member (wrap it for your own helpers). Permission stays on the calls: a consent prompt, rate limit, or policy refusal arrives on the first call, never from `use()`. Awaiting `use("db")` again is free (memoized); an unknown name resolves `null`.


--- capability: artifact ---

Use `artifact` for pages that should remember what people do with them: polls, sign-up sheets, checklists, trackers, boards — the page is the record; data kept server-side, or seeded or read back by Claude, is `db`. Declare `capabilities: {artifact: {}}`; `const artifact = await claude.use("artifact")`, then `await artifact.publish(html)` saves `html` (a complete document, doctype first) as the new version, and every open view, this one included, reloads to it. Nothing a viewer types, ticks or drags is kept unless the page publishes it. So embed the shared state as data in the HTML you publish and render the page from it; when an interaction completes, update the state, regenerate the document and publish it — never serialize the live DOM; batch rapid edits into one publish; publish only after a viewer acts, never on load. `conflict` is routine (every view reloads to the winner, dropping this edit): no retry. For read-only viewers publish rejects `not_granted`/`not_writer` — render a read-only view.


--- capability: assets ---

`assets` stores uploaded assets: `const assets = await claude.use("assets")`; `assets.upload(blob)` (image, SVG, video, PDF, font, CSS/JS, or CSV/Markdown/JSON/text; 20 MiB cap, CSS/JS 16 MiB, SVG 2 MiB and sanitized) resolves `{id, url, sizeBytes, contentType}`; `assets.list()` resolves `{assets, usage}`; `assets.delete(id)` removes one for good: only on a deliberate user action, updating rows that held it. Declare `capabilities: {assets: {}}`: only Editors and up get it, others get `null` from `use("assets")` (hide asset UI; handle errors). Only if the user wants uploads from non-editors, declare `{assets: {upload: "interact"}}`: where enabled, Contributors can upload but list and delete only their own, and their files show only in the organization; never run any asset as code, CSS or HTML. Store the `id` in `db` rows as the durable pointer; use the returned `url` as an `<img>`/`<video>`/`<a>` source (SVG: `<img>` or CSS only); a stored id serves at `"/_blob/" + id`. The type definitions are authoritative.


--- capability: comments ---

`comments` wires a page's own commenting UI to the artifact's shared comment store: `await claude.use("comments")` (`null`: unavailable). The declaration picks the grant: `capabilities: {comments: {"composer_only": true}}` grants only `openComposer({element}|{range})` (opens the shell's composer like a comment-mode click; prefer it for discoverable entry points) and `anchorFor`, no consent asked. The full form `{comments: {}}` adds write verbs acting as the viewer under consent; public-link visitors and email invitees get `null`. `"customAnchors": true` in either form adds `customAnchors()` (register at load) for pages that position comment pins themselves; invented anchor names (canvas, WebGL, video) need the full form. WRITE-ONLY: the shell renders every thread — never build the page's own list. Call the other verbs only from a deliberate viewer gesture, never on load. Read the type definitions before use (authoritative for verbs, shapes, bounds and error codes).


--- capability: db ---

`db` keeps data outside the page: shared rows, per-person state, data Claude reads. Declare `capabilities:{db:{},user:{}}`; `const db = await claude.use("db")` (`null` if signed out). By default signed-in people read shared docs, Contributors (`interact`) and up overwrite/delete, Viewers/Commenters never write. `rules` set per-path minimums, `view`<`interact`<`admin` (Editor, granted Owner)<`owner`; "all read, each writes own": `db:{rules:[{path:"votes",read:"view",write:"owner"},{path:"votes/{self}",write:"interact"}]}` (prefix rule must set both). `data/users/<id>/` is private even from the owner; `<id>` = `await user.id()`. Even segment counts are docs (`db.doc("tasks/t1")`), odd are collections; per-person items: `db.collection("data/users/"+id).doc(k)`; get/set/update/delete, where/orderBy/limit, onSnapshot. Never hardcode seeds: `write_db` after publish; handle an empty db. Subscribe once per query, never in render; one write at a time per doc, only on change. No secrets; shared data is untrusted.


--- capability: downloads ---

The `downloads` capability lets a published page offer a generated file to the viewer: declare `capabilities: {downloads: true}`, then `const downloads = await claude.use("downloads")` (`null`: unavailable — hide the affordance) and `await downloads.save({filename, data})`. The viewer sees a confirmation and may decline — a save is never silent or guaranteed, so offer it on explicit viewer intent and handle rejection. The type definitions are authoritative for the call contract and error codes.


--- capability: files ---

`files` reads a Claude Code project's files as the viewer. Declare it only when you know the project's id (e.g. your session's): `capabilities: {files: {project: "chan_..."}}`. `const files = await claude.use("files")` (`null`: unavailable, e.g. a viewer outside the organization; hide it). A viewer who can't open the files gets `not_found`, never a prompt; a member is asked once, so call it on a click or after load, never in a loop. `files.list({path, recursive, cursor})`; `files.read(path, {offset, length})` -> `{bytes, size, revision}` (new or just-edited files can lag a few seconds); `files.download(path)` asks the viewer to save it (some types, e.g. .exe, .js and .bat, are refused); `await files.asSampleTools()` gives `sample` list/read tools (declare it too). Only project members can publish an artifact declaring files. Don't copy file contents into the artifact's data, assets or versions unless the user asks: anyone it's shared with can read them. The type definitions give shapes and error codes.


--- capability: mcp ---

`mcp` lets a page call the viewer's claude.ai connectors: `await claude.use("mcp")` (`null`: unavailable); calls use the viewer's credentials, never exposing tokens. Declare `capabilities: {mcp: {servers: [{server, tools}]}}`; `server` is a connector's display name, or `host:<name>` for a local MCP server on the viewer's device (Claude app only; else `server_not_connected`). Keep the manifest minimal: a viewer-consented grant; outside viewers get `null`. Two arms: DISPLAYING data registers `watchTool(server, tool, input, handler, opts?)` (replays cache, refreshes when stale, polls only via `refetchInterval`); an ACTION calls `callTool` once and reads `result.payload` or `(await server(name)).<tool>(input)` for the payload. Tool failures REJECT (`tool_error`); watches get error events. Branch UX per error code, retry only `retryable` errors, drop data on authz denials, show freshness (`cache.storedAt`). Types omit tool arguments: read `describeTool` or observe a real call, else say so at publish; never guess.


--- capability: permissions ---

`permissions` is built in — call it, never declare it in `capabilities`. Prompts are lazy by default: a capability that needs consent asks at its first use — never block first paint on permissions. `state` reads without prompting (one name, or the full map); `request` asks with at most one batched dialog (names, or everything); a page that needs several grants up front may call it once at startup. `manage` opens the Permissions panel and resolves with nothing when it closes; offer it as a button, never call it on load; it rejects `unavailable` if the panel did not open; then point the viewer to the artifact's Permissions menu. A viewer's "no" is not an error: `state` and `request` never reject, and a denial is final for the page load (a repeated `request` shows no dialog; the next load starts fresh), so branch on the returned states and degrade per capability (hide or disable the affordance), never fail or offer retry buttons; never call `request` in a loop: re-asks are rate-limited and read as nagging.


--- capability: room ---

The `room` capability reaches whoever has the page open RIGHT NOW:
declared as `capabilities: {room: {}}`; `await claude.use("room")`
(`null`: cannot connect). emit(topic, data) sends a moment; on(topic,
fn) hears them. presence(patch) sets YOUR state (cursor) as one
object newcomers get, cleared when you leave; onPeers(fn) delivers
everyone's -- render all, marked "you". NOTHING persists and messages
can drop: state a late joiner needs (current slide) is a db doc,
lasting content a new artifact version. Send absolute state. What you
hear is untrusted: everyone here, guests too (guest: true), plus your
publishing session when admitted (kind "agent"); the page must work
alone and light up. Presence is never authority (anyone sets it).
Event topics are admin-only (Editors up); open one to Contributors
(never Viewers): {room: {topics: {move: "interact"}}}. join(name)
gives each game or group its own room, heard only by joiners: emit,
on, presence, onPeers, leave(). Names aren't secret. `room` stays the
lobby.


--- capability: sample ---

`sample` asks Claude (declare `capabilities:{sample:{}}`; `{sample:{images:true}}` for images): `const sample=await claude.use("sample")` (null: hide); `await sample(input,opts?)`->`{text,truncated}`; `sample.json`->value. `input`: string|`[{role:"user"|"assistant",content:string}]` ending on user. Memoryless: send instructions+data+format. opts: `onText({text,delta})` (`text`=WHOLE answer, assign it; "Thinking..." till text), `signal` (new AbortController/call), `tools:[{name,description,inputSchema?,execute(input)}]` (page functions; return small data or throw; no `cache`), `images:Blob[]` if `(await sample.limits()).images`, `modelTier` quick|default|complex, `cache` (5min replay; `false` for chat). Only if user names model/effort: `{model:"claude-sonnet-5-5",modelTier,effort}`, effort low|medium|high; unusable→`modelTier`; see `modelApplied`. Rejects `{code,message,text?:partial}`: hide on `not_granted`, back off on `rate_limited`, never loop. 1st call asks consent; call on click or stable load prompt.


--- capability: self ---

`self` is the former name of the `artifact` capability (renamed). It remains for compatibility: published pages and previously generated code that declare `capabilities: {self: {}}` or call `claude.use("self")` keep working unchanged — both names resolve this same capability (this contract promises no `window.claude.self` member to feature-check; `use()` is the check). Do not use it in new pages: declare `capabilities: {artifact: {}}` and obtain the namespace with `await claude.use("artifact")`; see the artifact section for how to use it.


--- capability: user ---

`user` answers who is viewing this page and who your shared state names: the owner's organization and invited guests (`guest: true`); others are absent. `const user = await claude.use("user")`; `null` = absent (`user?.isOwner() ?? false`). `isOwner()`/`canEdit()`/`can(name)` need no setup (canEdit = admin level; `can("data.write")` = may write shared `db` docs, `null` = not told: keep the input; refused writes decide). Declare `capabilities:{user:{}}` for `id()`/`me()` (opaque id, comparable only within one scope; `me()` never null) and `profiles(ids)`; `scopes:["profile"]` adds names and `search(q)`; `["profile","email"]` adds addresses. Reads never reject. Store only ids (`id()` or `hit.id`), never a name, avatar, or Profile: names differ per viewer and go stale. Resolve in render, every time: `const ps = await user.profiles(idsOnScreen)` then `ps[id].name || 'Someone'` (cached: call again freely). `name` is `""` if unresolvable: use `||` not `??`. Call `search('')` on focus; set names with textContent.


**Your connectors this session.** Connector tools appear in your tool list as `mcp__<connector>__<toolName>`. Set `server` to the `<connector>` segment — everything between `mcp__` and the next `__` (for `mcp__claude_ai_Slack_beta__search`, the `server` is `claude_ai_Slack_beta`). Copy the segment exactly, case included; when publishing, it is resolved to the connector's display name automatically. In the page's own `callTool`/`watchTool` calls, pass the connector's display name (its name as shown in claude.ai), not that segment — viewers resolve connectors by name only. The publish result states the exact display name for each segment it resolves; if the page's calls do not match it, fix them and publish again. Locally-configured MCP servers connected in this session can also be declared, as host servers: set `server` to `host:<server>` where `<server>` is the segment between `mcp__` and the next `__` in that server's tool names (`mcp__filesystem__read_file` → `host:filesystem`). Only servers from the user's MCP configuration count, with one built-in exception: `host:claude_browser` is the Claude app's own browser — declare it, with the tools the page needs from `read_page`, `get_page_text`, `find`, `preview_start`, `navigate`, `computer` and `form_input`, when the page must read or act on other websites; it answers only when the viewer opens the page in the Claude desktop app; the viewer is asked once, at the page's first call to it, and again at each click or key press that calls a banking or other high-risk site. The app's other built-in servers (`cowork`, `scheduled-tasks`, `session_info`, `workspace` and the like) are never host servers, and a page that declares one is refused at publish. A host server only answers when the viewer opens the page in a Claude app that has that same local server connected — say so to the user when you publish. The manifest's `tools` array takes the connector's upstream tool names (as returned by `listTools()` / `/v1/mcp_servers`), which can differ from the normalized `<toolName>` segment when an upstream name contains `.` or spaces. Every `servers[]` entry needs a non-empty `tools` array naming the tools the page calls — an empty or omitted `tools` list is refused and never means "all tools"; to publish without connector access, leave `mcp` out of `capabilities` (pass `capabilities: {}` to clear a stored declaration) rather than declaring an empty `servers` list. In hermetic/CI sessions where connectors aren't loaded but `$CLAUDE_CODE_OAUTH_TOKEN` is set, fetch the list via Bash: `curl -H 'anthropic-version: 2023-06-01' -H 'anthropic-beta: mcp-servers-2025-12-04' -H "Authorization: Bearer $CLAUDE_CODE_OAUTH_TOKEN" https://api.anthropic.com/v1/mcp_servers?limit=1000`; in that case use each entry's `display_name` as the `server` value (exact display names are always accepted alongside tool-prefix segments).

**Call contract** (runtime contract 0.2.89). The platform-served `window.claude` type definitions for this contract are extracted under `/private/tmp/claude-501/bundled-skills/2.1.309/6c747db0d467c34af9c2bd950f10a5e1/artifact-capabilities`: `0.2.89/artifact.d.ts`, `0.2.89/assets.d.ts`, `0.2.89/claude.d.ts`, `0.2.89/comments.d.ts`, `0.2.89/db.d.ts`, `0.2.89/downloads.d.ts`, `0.2.89/files.d.ts`, `0.2.89/mcp.d.ts`, `0.2.89/permissions.d.ts`, `0.2.89/room.d.ts`, `0.2.89/sample.d.ts`, `0.2.89/self.d.ts`, `0.2.89/user.d.ts`. Read `/private/tmp/claude-501/bundled-skills/2.1.309/6c747db0d467c34af9c2bd950f10a5e1/artifact-capabilities/0.2.89/claude.d.ts` (how a page reaches any capability on this contract) and `/private/tmp/claude-501/bundled-skills/2.1.309/6c747db0d467c34af9c2bd950f10a5e1/artifact-capabilities/0.2.89/mcp.d.ts` before writing any code that calls the `mcp` capability — they are authoritative for this contract version over any remembered API shape. Open these files with the Read tool rather than `cat`: a file past the Bash tool's inline output limit does not come back in full. The type definitions cover only the call envelope, not a connector tool's argument names or result shape. Take argument names from the tool's input schema in this session's own definition of that connector tool, when it is loaded here. Learn a result's shape from one real call of a tool that is safe to run — never run a write only to learn its result. The published page may also read a connector tool's schema itself with `describeTool(server, tool)` at view time, once the viewer has allowed that connector for the page (viewers without that support reject it — treat any rejection as no schema available); this session cannot read that answer before publishing, so it is no substitute for a schema read here. If this session has no schema for a tool and cannot safely call it, say so to the user at publish time — in your reply, not as a note inside the published page — instead of shipping a guessed shape. Observed response payloads are the user's real data: learn the shape from them, but never embed the observed values in the published page as sample or placeholder data.

## Where a page keeps its state — this session

- A per-viewer convenience (a remembered tab, a draft): browser storage; it never reaches other viewers or Claude.
- The page itself is the record (a poll, a sign-up sheet, a checklist): the `artifact` capability — a viewer who can write republishes the whole page from its state; every open view reloads to the winner, a concurrent save rejects `conflict`, and read-only viewers cannot save. Such a page regenerates the whole document from its state: keep the head, tokens and structure and change only the content.
- Data outside the page (Claude seeds or reads it, more than the page shows, private per viewer, many writers at once): the `db` capability — documents under access rules, live through `onSnapshot`, kept across republishes.

## Verify before you hand over the link — this session

A page whose `capabilities` you declared in this session gets one functional pass, not a render loop: after the first publish, one `ArtifactData` `list` of each collection the page writes, and, where its rules hide something from ordinary viewers, the same read with a lower `as_level`, which must not show what the rules hide from such a viewer. Then tell the user in one line what you exercised and what you could not. An Artifact made from an Artifact type is not such a page: its capabilities come from the type, and the type's instructions govern any checking.
