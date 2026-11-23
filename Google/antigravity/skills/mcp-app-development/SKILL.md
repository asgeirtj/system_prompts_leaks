---
name: mcp-app-development
description: >-
  Build, package, and debug MCP Apps for Antigravity: MCP server tools whose
  results render as interactive UI in the conversation, in the side pane, or
  full-page from the sidebar. Use when adding a UI to an MCP tool, building or
  theming the app itself, packaging it as a plugin, or debugging an app that
  doesn't render or behave as expected.
metadata:
  icon: handyman
---

# Developing MCP Apps

An **MCP App** is an MCP tool that ships its own UI. The tool's `_meta` points
at a `ui://` resource on the same server; when the tool runs, Antigravity reads
that resource (one HTML document), renders it in an isolated iframe on its own
origin, and talks to it over JSON-RPC on `postMessage`. The app gets the tool's
input and result, and can call back into its server, message the conversation,
and attach context to the user's next message.

Spec: [modelcontextprotocol/ext-apps](https://github.com/modelcontextprotocol/ext-apps)
(SEP-1865). Antigravity implements it plus a few extensions, described below.

## Server side

### 1. Declare the UI resource

Serve the app as a resource with a `ui://` URI and MIME type
`text/html;profile=mcp-app`. The HTML is fetched each time a view opens and is
never stored in the trajectory. Limit: 10 MiB.

Optional resource `_meta.ui` fields the host acts on:

- `csp`: `connectDomains`, `resourceDomains`, `frameDomains`, `baseUriDomains`
  (origins only, such as `https://cdnjs.cloudflare.com`; see
  [Isolation and CSP](#isolation-and-csp)).
- `prefersBorder` (bool): whether the host draws a border around the frame.

### 2. Point tools at it

```python
APP_URI = "ui://tasks/app.html"

# Renders the app inline in the conversation.
INLINE = {"ui": {"resourceUri": APP_URI}}

# Also openable from the side pane "+" menu and full-page from the left sidebar
PANE = {
    "ui": {"resourceUri": APP_URI},
    "com.google.antigravity/ui": {
        "entrypoints": [
            {"type": "aux_pane", "title": "Tasks"},
            {"type": "global", "title": "Tasks"},
        ]
    },
}

# Only the app may call it; the model never sees it.
APP_ONLY = {"ui": {"visibility": ["app"]}}

mcp.tool(title="Create a task board", meta=INLINE)(create_board)
mcp.tool(name="open_tasks", title="Tasks", meta=PANE)(open_tasks)
mcp.tool(meta=APP_ONLY)(app_save_board)
mcp.resource(APP_URI, name="Tasks app",
             mime_type="text/html;profile=mcp-app",
             meta={"ui": {"prefersBorder": False}})(app_html)
```

Rules the host enforces:

- `resourceUri` must start with `ui://`, or the tool's UI metadata is dropped.
  The legacy flat key `_meta["ui/resourceUri"]` is still read.
- `visibility` is a list of `"model"` and/or `"app"`. Empty or absent means
  both. `["app"]` tools are hidden from the model; tools without `"app"` cannot
  be called by the app.
- Entrypoints (`aux_pane`, `global`) are only kept on tools that declare a
  `resourceUri`. Unknown types are dropped.
- Each entrypoint can set a `title`, the name users see. The `aux_pane` title
  labels the "+" menu item and the side pane tab; the `global` title labels the
  sidebar entry. Without a `title`, the tool name is shown.
- Entrypoint launches call the tool with **`{}`**. Make every argument optional
  and return a sensible default view for empty input.
- In a conversation, a finished call to a tool with an `aux_pane` entrypoint
  can auto-open in the side pane (subject to the host's auto-open policy)
  instead of rendering inline. Calling the same tool again updates the open
  pane, so the agent can drive the view.
- The `CallToolResult` stored on the trajectory step is capped at 1 MiB. Above
  that the app only receives the tool input, so return large data from an
  app-only tool instead.

### 3. Tool results

Return both `content` (text the model reads) and `structuredContent` (what the
app renders). Don't put secrets or answers in results you don't want the model
to see: the model sees `content`; the app sees the full result.

## App side

Build the app with the MCP Apps SDK, `@modelcontextprotocol/ext-apps`: the
`App` class, or `useApp` and `useHostStyles` from
`@modelcontextprotocol/ext-apps/react`. Don't hand-write the `postMessage`
bridge: the SDK handles the handshake, protocol version, `ping`, teardown,
auto-resize, and message validation.

The app must be one self-contained HTML document, because the default CSP
blocks external scripts and styles. Bundle the SDK and your code into a single
file, for example with Vite and `vite-plugin-singlefile`, or with
`esbuild --bundle` and inline the output into the HTML.

```ts
import {
  App,
  applyDocumentTheme,
  applyHostStyleVariables,
} from '@modelcontextprotocol/ext-apps';

const app = new App({name: 'Tasks', version: '1.0.0'}, {});

// Register handlers before connecting so no notification is missed.
app.ontoolinput = ({arguments: args}) => renderLoading(args);
app.ontoolresult = (result) => render(result.structuredContent);
app.onhostcontextchanged = (ctx) => {
  if (ctx.theme) applyDocumentTheme(ctx.theme);
  if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
};

await app.connect();
const ctx = app.getHostContext();
if (ctx?.theme) applyDocumentTheme(ctx.theme);
if (ctx?.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
```

### Lifecycle

1.  `app.connect()` sends `ui/initialize` and `ui/notifications/initialized`.
    Afterwards, `app.getHostCapabilities()` and `app.getHostContext()` return
    what the host offered.
2.  The host then delivers the tool's arguments (`ontoolinput`), its full
    `CallToolResult` (`ontoolresult`), cancellation (`ontoolcancelled`), and
    live theme changes (`onhostcontextchanged`).
3.  Antigravity does **not** send `ui/resource-teardown`: the frame is removed
    or reloaded without warning, and in-flight `tools/call` requests are
    aborted. Persist state eagerly as edits happen (for example, through an
    app-only tool called with `app.callServerTool`) instead of waiting for
    teardown.

### What the app can ask for

Check `app.getHostCapabilities()` first, because capabilities vary by surface.
A global view has no conversation, so `message` and `updateModelContext` are
absent there. Hide the buttons that need them.

| SDK call | Capability | Antigravity behavior |
| --- | --- | --- |
| `app.callServerTool()` | `serverTools` | Calls a tool on the app's **own** server only. The tool must be enabled and visible to apps. At most 4 calls in flight per app. Calls are aborted when the view closes or reloads. |
| `app.sendMessage()` | `message` | Text content only. Sends a user message to the owning conversation. With `_meta: {"com.google.antigravity/message": {"target": "new"}}` it starts a background conversation in the same project instead, and returns its ID in the same `_meta` key as `conversationId`. |
| `app.updateModelContext()` | `updateModelContext` | Replaces the app's pending context with `text` and `resource_link` blocks. Empty `content` clears it. The context appears as a pill on the user's next message, and resource links become resources of the app's server that the model can read. Only attach in response to a user action. |
| `app.openLink()` | `openLinks` | `http`/`https` only. Opens outside the app. |
| `com.google.antigravity/toggle-aux-pane` | (not advertised) | Antigravity extension. Params `{"tabType": "fileView", "uri": "file:///..."}` open a workspace file in its own side pane tab. Returns `{"isError": true}` if nothing opened (for example, on a global view with no side pane or for an invalid `file://` URI). Other hosts answer `-32601` (method not found). |
| Auto-resize (on by default) | | Inline only: the frame grows to the reported height, up to 800 px (start: 150 px). In the side pane and global view the frame fills its container and ignores reported sizes. |

`com.google.antigravity/toggle-aux-pane` isn't in `hostCapabilities`, because
the SDK drops unknown capability keys. Send it with the SDK's generic request
method and handle `-32601`:

```ts
const result = await app.request(
  {
    method: 'com.google.antigravity/toggle-aux-pane',
    params: {tabType: 'fileView', uri: 'file:///path/to/file.ts'},
  },
  z.object({isError: z.boolean().optional()}).passthrough(),
);
```

### Host context and theming

`hostContext` has `theme` (`light`/`dark`), `styles.variables`, `platform:
"web"`, `displayMode: "inline"` (the only mode offered), `locale`, `timeZone`,
and `containerDimensions.maxHeight` when inline.

`styles.variables` follows the spec's standard names, derived from the host  
theme:  
`--color-background-{primary,secondary,tertiary,inverse,disabled,info,danger,success,warning}`,  
`--color-text-{primary,secondary,tertiary,inverse,info,danger,success,warning,disabled}`,  
`--color-border-{primary,secondary,inverse,info,danger,success,warning}`,  
`--color-ring-{primary,info,danger,success,warning}`, and `--font-sans`. Apply
them with `applyHostStyleVariables` after `connect()` and in
`onhostcontextchanged` (React: `useHostStyles` does both). Always declare
fallbacks, because missing tokens are omitted.

```css
body {
  background: var(--color-background-primary, #fff);
  color: var(--color-text-primary, #1f1f1f);
  font-family: var(--font-sans, system-ui, sans-serif);
}
```

### Isolation and CSP

- Each view loads in an isolated iframe on a fresh, unique origin (or an
  opaque origin if that frame can't be created). Browser storage such as
  `localStorage`, `IndexedDB`, and cookies is either unavailable or discarded
  when the view closes or reloads, and is never shared between views, so keep
  state on the server through app-only tools.
- Default CSP: `default-src 'none'`. Inline scripts and styles plus
  `data:`/`blob:` images, fonts, and media are allowed. `fetch`/WebSocket,
  frames, `<base>`, forms, and plugins are blocked.
- Open more only through the resource's `_meta.ui.csp`:
  - `resourceDomains`: scripts, styles, images, fonts, media.
  - `connectDomains`: fetch, XHR, WebSocket.
  - `frameDomains`: nested iframes.
  - `baseUriDomains`: `<base href>`.

  Each entry must be a bare `http(s)`/`ws(s)` origin, optionally with a `*.`  
  subdomain or a port. Paths, keywords, and quotes are dropped silently.
- Prefer `tools/call` over `connectDomains`: the server already has
  credentials, and the call stays auditable.

## Packaging and iterating

Ship the server as a plugin under `~/.gemini/config/plugins/<name>/`. There is
no separate install or register step: a directory there with a `plugin.json` is
discovered automatically.

```text
~/.gemini/config/plugins/tasks/
├── plugin.json       # required: {"name": "tasks", "description": "..."}
├── mcp_config.json   # the app's MCP server(s)
├── bin/tasks-server  # the server
└── assets/logo.svg   # optional
```

In `mcp_config.json`, `${PLUGIN_ROOT}` expands to the plugin directory and
`${PLUGIN_DATA}` to a persistent per-plugin data directory:

```json
{
  "mcpServers": {
    "tasks": {
      "command": "bash",
      "args": ["${PLUGIN_ROOT}/bin/tasks-server", "--data_dir=${PLUGIN_DATA}"]
    }
  }
}
```

- A plugin's servers are namespaced `<plugin>_<server>` (for a `tasks` plugin,
  `tasks_tasks`). Use that name in RPCs and when reading logs.
- New plugins are picked up without a restart. An already running server keeps
  its old binary, so restart it from **MCP Servers** settings, or ask the
  running language server to restart just that server. From an Antigravity  
  terminal:

  ```bash
  curl -sf -H "Content-Type: application/json" \
    -H "x-codeium-csrf-token: ${ANTIGRAVITY_CSRF_TOKEN}" \
    -d '{"serverName": "tasks_tasks"}' \
    "http://${ANTIGRAVITY_LS_ADDRESS:-localhost:5387}/exa.language_server_pb.LanguageServerService/RefreshMcpServers"
  ```

- For fast UI iteration, have the server read the HTML from a path in an env
  var or flag (for example, `TASKS_APP_HTML`). Then reopening the view picks
  up edits without a rebuild.
- See the plugin skill for `plugin.json`, logos, and suggested prompts.

## Debugging checklist

| Symptom | Check |
| --- | --- |
| Error instead of the app | The resource returns MIME `text/html;profile=mcp-app` and non-empty text under 10 MiB, and the server declares the `resources` capability. |
| Blank frame | `app.connect()` never ran or threw, or a script was blocked by CSP. Bundle everything into the HTML file or add `resourceDomains`. |
| App shows input but no data | The result is over 1 MiB, or `ontoolresult` was set after `connect()`. Register handlers first, and fetch large data with an app-only tool. |
| `tools/call` fails | The tool is disabled, lacks `"app"` in `visibility`, belongs to another server, or 4 calls are already in flight. |
| Message/context buttons do nothing | No `message`/`updateModelContext` capability on this surface (global view). Gate the UI on `app.getHostCapabilities()`. |
| Not in the "+" menu or sidebar | `com.google.antigravity/ui.entrypoints` is missing, or is on a tool without `resourceUri`. |
| `toggle-aux-pane` returns `isError` | `uri` is not a valid `file://` URI, or the current surface has no side pane (such as a global view). |
| Colors wrong after a theme switch | Re-apply `styles.variables` in `onhostcontextchanged`, or use `useHostStyles`. |
