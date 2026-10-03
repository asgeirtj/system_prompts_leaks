# Function hooks: the long form

The long form of the plugin-authoring skill: what a plugin of function hooks is in full, where its exact contract is written down for the build you are running in, and where to look when something does not take. SKILL.md beside this file says where a mod is written, where the types are and what happens when the turn ends. Run `claude plugin validate <dir>` on the plugin's folder early and often: it reads the manifest and the hooks
module's source the way the engine will and reports what the module hooks and calls and everything the engine would refuse, before a
session loads it. The API is early access and moves between releases: the declaration file is the authority, this note the map.

## What a plugin of function hooks is

A mod is three files written directly: `claude plugin init` scaffolds another kind of plugin, one of command hooks under `~/.claude/skills`.

A plugin is a folder with a `.claude-plugin/plugin.json` manifest. Its
function hooks live in one hooks module: a TypeScript or JavaScript file
that `hooks/hooks.json` names under `modules` (one path, relative to that
file), exporting `register(on, options)`; the module, and every file it imports from the plugin, is named `.ts`, `.tsx`, `.jsx`, `.js`, `.mjs`, `.cjs`, `.mts` or `.cts` (a file named otherwise is not loaded) and is an ES module whatever its suffix. A file of the plugin is imported with an `import` declaration. A module holding `import()` does not load. `on(event, matcher?, hook)` adds a
hook; `options` holds the values of the fields the manifest's `userConfig`
declares. Every hook has the shape `($, e, next)`: `$` is the engine
interface (display, model, session, prompt, tools, filesystem, store,
clock, network, host commands, settings, environment, the config menu's rows and the rest), `e` is the event's input as a plain value,
and `next(e)` continues to the other plugins and then the engine's own
behaviour, resolving to the event's result. A hook that returns without
calling `next` answers for itself; one that calls `next({ ...e, ... })`
rewrites what the rest of the chain sees, within what that event allows.
The module runs in an environment of its own, with no DOM and no Node:
everything outside it is reached through `$`. JSX is available with `h` as the factory.

The events cover tool calls and their descriptions, the rows the conversation keeps (`session.append`), the prompt as submitted, the system prompt's sections and the first message's context blocks, what the interface
draws, the turn's start, steps and completion, the session's start, end (a /clear too: `session.end` with `reason: 'clear'`, and no `session.start` after it) and deliveries, each hooks module's admission, skills, subagents and attribution text. The settings hooks' own events are hookable as `classic.<Event>` (`classic.Stop`, `classic.SessionEnd`), `e` being what that hook receives on stdin, `transcript_path` and the other base fields included. Which of them a
feature is, and what it needs from `$`, are the two questions worth settling before writing. Two events stream, `turn.step` (a model request of the turn) and
`process.spawn` (a child's output, piece by piece; for the caller `$.process.spawn({ argv })` is the stream and the loop's end is the child's): a hook on either is an
async generator (`async function* ($, e, next) {}`, the one form that loads there); `next(e)` is the stream beneath, `yield* next(e)` forwards it and evaluates to the
result, `for await` over it rewrites the chunks one at a time, yielding without `next` answers alone, and a hook that fails mid-stream is left where it stood. A `telemetry` event is hooked by name (`telemetry.*` names them all; `*` and a negation do not select one), and the hook picks its stream in the matcher, `to` written as a string literal or a list of them (`on("telemetry.log", { to: "collector" }, hook)`): `collector` is the customer's OpenTelemetry collector, `anthropic` is Anthropic's own analytics and is the stream the plugins built into the CLI stand on, and `claude plugin validate` lists the streams a module's hooks stand on.

## The types are the reference

`types/claude-code.d.ts` beside this file is this build's declaration of the
whole API, written by the engine as the skill loaded: it declares the module
`claude-code` (import types from it; at run time the import is empty), the
globals a hooks module has, and the inputs of this build's built-in tools, so
`e` narrows per tool. Its header carries a `tsconfig.json` that fits a hooks
module and shows how to type `register` against `Register`. A mod the engine
loads from a folder the person owns (the mods folder after `Enable for this
session`, a `--plugin-dir` or `CLAUDE_CODE_PLUGIN_DIRS` folder) has the same
declarations laid beside it, in `.claude-plugin/types/`, at every load and
reload: `claude-code/index.d.ts`, the API; `claude-code-tools/index.d.ts`, this
build's built-in tools; `claude-code-mcp/index.d.ts`, the MCP tools connected
when the mod last reloaded (refreshed when you save the mod; a restart
never replaces it); one entry per plugin its `plugin.json` lists under
`dependencies` (below); and a `tsconfig.json` its own extends, so its editor
and `tsc -p <mod folder>` type it with no step taken. There is no command to
run. The built-in tools' table is what this build registers on this machine: a
tool another build has (Glob and Grep, which a native macOS or Linux build
does not register) is compared through `String(e.tool)`.

Read that file for every event's input and result, every noun and method on
`$` with its doc comment and example, every element each surface draws and
the props each element accepts, and the limits it states. Shapes there are
the engine's own, not the Messages API's: `$.session.messages()`, for one,
answers `SessionMessage` rows of `{ role, text, toolUses }`, not `content`
blocks. When the build updates, regenerate rather than edit.
`claude plugin validate <path>` reads a plugin's manifest and its hooks
module's source and reports what the module hooks and calls, which is the
quickest check that the engine sees what you meant. A plugin that adds a noun to `$` in `engine.create` ships that noun's types as a contract: one self-contained `.d.ts` (say `types/index.d.ts`) that exports the noun's types at its top level and declares the noun on the engine's interface, `export type Topo = { ... }` then `declare module 'claude-code' { interface EngineInterface { topo: Topo } }`, with no import or reference, its exported names led by the noun's PascalCase name (`Topo`, `TopoRun`), named in `plugin.json` as `"types": "./types/index.d.ts"`. The plugin's own hooks module imports those types from that file, so the contract is the one place they are written. A plugin that depends on it never copies the file: it lists that plugin under `dependencies` in its own `plugin.json`, and each time the engine loads it from a folder the person owns it lays that plugin's contract into `.claude-plugin/types/<plugin>/index.d.ts`, so the noun is typed on the dependent's `$`; `claude plugin validate` checks the contract.

## Developing one

A mod made in this session goes where SKILL.md's WHERE TO WRITE IT says and loads as it describes. The rest of this section is the other ways a plugin is run from disk.

`claude --plugin-dir <folder>` loads the plugin from disk for that session only (repeat the flag for several). `CLAUDE_CODE_PLUGIN_DIRS` names the same folders where no flag can be given (a session the desktop app or an SDK host starts): one or more absolute paths (`~` allowed) separated by the platform's path-list separator, each loaded exactly as a `--plugin-dir`, taken from the process environment or the `env` block of `~/.claude/settings.json` (never a project's settings). In an interactive session the folder is watched, as is a plugin auto-loaded from a skills folder (`~/.claude/skills/<name>`, the project's `.claude/skills/<name>`): saving a file reloads the hooks module, so
`register` runs again in a fresh environment and the previous environment's timers are dropped. Saves made while the session's own turn runs (the model editing the plugin) reload once, when the turn ends, or sooner when a tool or command the plugin registered is about to run, so the turn can try what it wrote. Saves from anywhere else reload once the folder has been quiet: a lone save within a quarter second, a run of saves seconds apart once the run stops. A headless `claude -p` always loads fresh, and a long-lived headless session (SDK, desktop) watches too when `CLAUDE_CODE_PLUGIN_DIR_WATCH=1` is set the same way, its reload lines reaching the host as `ui_log` messages and the debug log.  
Options for a plugin loaded this way are read from settings under `pluginConfigs`, keyed by the plugin's `<name>` (or `<name>@inline`); each non-secret `userConfig` field is a row in the config menu too, and a change there reloads the module with the new `options`. A `string` field that lists `options` (`"options": ["gist", "turbo"]`, its `default` among them) is a picker over exactly those values there, and a stored value outside them counts as unset.

Run with `claude --debug` while developing. A hook that fails is skipped and the chain continues without it, unless its registration's `.catch` handler
answers in its place; while the session hot-reloads a plugin folder (the mods folder once hot reloading is on, a `--plugin-dir` or `CLAUDE_CODE_PLUGIN_DIRS` folder an interactive session watches) the transcript says so once, in a dim line naming the
plugin, the event and the reason, as it names a module that did not load, and in any other session that line goes to the debug log alone, as `<plugin>: <line>` (a `claude -p` run has no transcript: one printing text names a `--plugin-dir` plugin whose module was not loaded, or failed to load, once on stderr with the reason, the switch being off included; a json or stream-json run keeps it in the debug log). The debug log has a line for every occurrence and each result the engine
refused; a skipped hook's line has the error's name and message length in place of its text (the first one's text, cut to a short line, is on that transcript line, which the debug log has too), so a plugin that seems to do nothing has usually been told why. `claude plugin test <folder>` runs the plugin's `*.test.ts` files against the engine itself: a test holds the engine's `$` and an `on` whose hooks sit beneath the plugin (import `test`, `expect`, `mock` from `claude-code/testing`; the typings say the rest). Nothing sits beneath those hooks: they stand for the engine, so what one answers reaches the plugin as given, fields only the engine sets included (a `tool.call` answer's `isReadOnly`, and its `ref` and `text` when the plugin relays it), while every plugin in the test, wherever it stands, is read as in a session. A test gives the plugin under test its `userConfig` values with `test(name, { options }, body)`, which it reads as the values stored in settings (a value outside a field's `options` unset, defaults filled in, then validated); left out, the plugin gets its manifest's defaults. A UI test mounts a component through the plugin on a surface it names, never an assumed one (the kit's `mount` on the test's `ui` noun: `{ plugin, surface, component, props }`), and acts on the drawing by key (`press`, `input`, `find`, a `Client`'s `key` and `post`), each act typed by that surface's element table; write the body once and loop it over `['terminal', 'desktop'] as const` so the test shows the plugin does not depend on one surface. A tree the test drew through the engine's `ui` noun (`render`) is acted on the same way through that noun's `press`, `input` (`{ plugin, key, text, kind? }`: `change` is one edit reaching `onInput`, `submit`, the default, is Enter reaching `onSubmit`) and `select` (`{ plugin, key, value }`); every act resolves only once the chain, the element's own handler and any work that handler left running unawaited have settled, so a test asserts right after the `await` with no settling of its own (work asleep on the mocked clock waits for the test to advance it). The test's `classic` noun raises a classic hook event as the engine does (`SessionStart({ source: 'clear' })`, the envelope fields stamped unless given; every event but `PreToolUse`, which a test reaches through the `tool` noun's `call`: `$.tool.call` raises `classic.PreToolUse` as a session does, beneath every plugin's `tool.call` hook and above the test's own, so a deny ends the call with the errored result a session's `tool.call` hooks see (`isError`, the reason as `text`; `{ deny }` to a plugin's own `$.tool.call`) and the test's hook never runs, while a rewrite, a pass, an ask or an allow goes on to it; with no settings hook configured, no decision stands beneath the test's own `classic.PreToolUse` hooks). The kit exercises the plugin's hooks and the description they return under each surface's rules, not any surface's paint.

## Drawing: ui.render

A `ui.render` hook receives one component instance. `e.component` says
which component, `e.surface` where it is drawn (`terminal`, `desktop`,
`mobile` or `vscode`), `e.requestId` which instance (the tool_use_id for a tool row or
dialog, the message id for a message or a command's output row, the agent id for a spinner), `e.props`
the component's plain-data props, and `e.viewport`, when the surface has
measured, the size it draws into in character cells: `columns` and `rows`. A transcript message's `e.props.onScreen` says which of its rows the viewport shows now (`{ first, last, of }`, from the site's first laid-out row; `null` while off screen; absent where the surface does not say, as on the terminal's main screen), and the hook re-runs for that message when it changes.  
A change of width re-runs every hooked site once the resize settles, so a
tree sized to `columns` stays right; a change of height alone re-draws
nothing. A `Pane` or `AbovePrompt` hook sizes its tree to `e.props.bodyColumns` instead: the box it draws into, which is narrower than the viewport while a pane is docked beside the transcript. `e.viewport.isFullscreen` says whether the surface docks a pane at all (the terminal's fullscreen layout does, its main screen opens one inline; absent where a surface does not say, so do not assume), the fact `command.run`'s `presentation` carries, so a plugin opens a pane unasked only where it would be a sidebar. `$.ui.invalidate` asks for a redraw
when the hook's own state changed. State a drawing draws from belongs in `$.state`, not a module variable (a hot reload loses those): named values the host holds for the session, each with a version. Declare them in the contract (`interface PluginState { counter: { count: number; isOpen: StateFamily<boolean> } }`), refer to one by a typed reference whose `plugin` and `key` are literals (`const count = { plugin: "counter", key: "count" } as const`, a const used for nothing but `$.state` calls, the state library's functions and a spread adding a family member's `id`), and read it while drawing: `const { value = 0 } = await $.state.get(count)`. That read subscribes the instance, and a later `$.state.set` draws exactly the readers again, so nobody calls `$.ui.invalidate` for it. A render hook never writes (`$.state.set` while drawing is denied); write from a handler closure or another event, and never from a value the closure captured at draw time: `import { update } from "claude-code"` and `onPress: () => update($, count, n => (n ?? 0) + 1)` reads, applies and writes with `ifVersion`, again on a miss, so two presses before the redraw both land; `atom(ref, initial)`, `derive(sources, fn)`, `memberOf(family, e)` and `read($, source)` come from the same import. Only the owner writes a value; another plugin changes it by hooking `state.set` with a matcher on `plugin` and `key` and passing `next` another `value`. To keep a value past the session, write it to `$.store` too.

Build trees from the table `$.ui.resolve(e)` returns: the surface's element constructors,
destructured into the hook's JSX tags (a module has no element globals). Tables differ per
surface, see `Elements` (`mobile` has no `Input`, `Select` or `Client`, `vscode` no `Client`,
`terminal` no `Svg` but alone `Raster` and `Image`); narrowing `e.surface` narrows the table. A grid of colored cells
(sparkline, heat map, rendered frame) is one `Raster`, its cells packed per `RasterProps`, never a `Box` per cell; `$.ui.blit`
repaints a mounted one without a render pass. A picture (PNG or RGBA bytes, or the name of a file or POSIX shared-memory object another local process wrote, per `ImageProps`) is one `Image` over a box of cells: the kitty graphics protocol where the terminal has it (kitty, Ghostty), its `alt` elsewhere or where the terminal cannot read this machine's files; a new source updates it in place, and a keyed one is swapped at the frame rate by `$.ui.blit({ requestId, key, source })`, the pixels never crossing `$`. Model-style text (headings, lists, tables, code fences, links; one outside `https:`/`http:`/`file:` draws as text) is one `Markdown`, drawn as an assistant reply is; given `key` and `onLinkPress`, a plain single click on a link it drew (any, or one `pressableLinks` names) raises `ui.press` carrying the link's `href` instead of the surface opening it, where the surface reports clicks (the fullscreen terminal; a ctrl- or alt-click still opens it). Return a
tree, or `next({ ...e, props })` to change what the engine draws, or `next(e)` to leave it.
A tree that does not validate (an element the surface lacks, a prop it does not take, a
child where none goes) is not drawn: the engine draws its own instead and writes to the
debug log a line beginning `ui.render (<Component>): a hook returned a tree that does not
validate`, followed by the reason. While the session hot-reloads a plugin folder (the mods folder once hot reloading is on, a `--plugin-dir` or `CLAUDE_CODE_PLUGIN_DIRS` folder an interactive session watches) the transcript says it too, once per load, component and reason: `<plugin>: ui.render (<Component>) refused: <reason>; the engine drew its own`, `<plugin>` being the one plugin whose hook could have drawn the tree, `hooks` otherwise; in any other session the debug log is the only sign. One value is drawn in a lesser form rather than refused: a `Code` under `format: 'diff'` whose `source` does not parse as hunks (a diff cut mid-hunk, one with no `@@` header) is drawn as plain code, as with no `format` and no `startLine`, and everything around it draws; the debug log says so, and while the session hot-reloads a plugin folder the transcript too, each once per load, site (a pane or band by its instance, the transcript's rows of one component together) and Code: `<plugin>: ui.render (<Component>): Code <n> is drawn as plain code, its source not a unified diff: <reason>`, `<n>` its place among the tree's `Code` elements in the order written, `(path "<path>")` after it when it names one; in the tree a `Client`'s surface module draws, `Client <module>:` stands where `ui.render (<Component>):` does, once per load, module and Code. That reason and the
element's props type are the two things to read. A Button is `[ label ]` on the terminal, or with `plain` no brackets: `1: label` beside its `hotkey` and the label alone without one, so a one-glyph label is a one-glyph control the focus still inverts; `variant="primary"` marks the main action of several (the terminal draws its `[ label ]` in the accent color, each other surface its own primary look), `"secondary"` or none is the default look, and `plain` wins over it. `role="dismiss"` marks the Button that closes its site, a drawing hint only: the terminal draws it as without, a desktop its native close control. Buttons, text fields and selects keep their
handlers in the plugin and raise `ui.press`, `ui.input` and `ui.select`; keys reach one only
while it has focus, Esc returns to the prompt; a Button's `hotkey` (one digit or lowercase letter) presses it while its site holds the keyboard, the band after ctrl+x tab or a click and a pane the same or opened with `focus`, except that a Button naming one of the engine's keybinding actions (`action: "app:cycleDiffBase"`) is also pressed by the person's chord for it from the prompt while it is mounted: chords, or a modified key Global or an active context binds, and not while an engine handler of that action is mounted. A pane opened with `focus`, `closeOnEscape` and `holdToasts` behaves as a dialog: it takes the keys, Tab and the arrows walk its buttons, Esc closes it, and toasts wait behind it; an element drawn `autoFocus` holds the ring from the start, every move of the ring is the `ui.focus` event first (its `element` the key now holding it, absent on the engine's close mark; `{ deny }` keeps it) and `$.ui.focus({ requestId, key })` moves it while the site holds the keys; `rows` opens it inline as tall as its content needs (up to what the layout spares, and the person's own size wins), so a short dialog shows whole and its arrows walk rather than scroll; the `command.run` input's `presentation` says whether the answer shows fullscreen and how wide the terminal is. A keyed `Box` scopes `hover` styles, a hover `scope` groups elements across sites, and a `Box` drawn `position: "absolute"` with cell offsets (`top: -2, left: 2`) paints over its surroundings without moving them, so `display: "none"` with `hover: { display: "flex" }` on it is a card that appears over the rows above a hovered glyph. Every user-role transcript row is the `UserMessage` site: the person's prompt, a background task's notification (`e.props.task`: its `id`, `status`, `durationMs`) and a message another agent, teammate, session or channel sent (`e.props.from.name`), told apart by `e.props.origin.kind`, which a matcher narrows on (`{ props: { origin: { kind: 'task-notification' } } }`); a hook that draws a compact row of its own returns `next(e)` while `e.props.isExpanded` (ctrl+o), so the full row still shows there, and a rewritten `text` changes the row alone, never what the model read. A slash command's output row is the `CommandOutput` site: a plugin whose command answers `command.run` with `{ text, context? }` (`text` the row the model also reads, `context` notes only the model reads, recorded after it) hooks it with `{ component: 'CommandOutput', props: { command: 'mine' } }` and draws that text as a tree inline in the transcript, where a built-in command's lines would sit.

## The rows a conversation keeps: session.append

`session.append` IS the append: every place the engine adds a row to a conversation it keeps calls it, once, as the row's originator, and its bottom performs the store. The rows are the person's prompt, a slash command's record and output, each block of the model's response, a tool's result and the rows a tool hands over, a prompt or notification folded into a running turn, the reminders and listings the engine injects, a settings hook's or a chain's context, the loop's own nudges, a compaction's boundary and summary, and the notices the transcript shows, in the main conversation and in every subagent's alike (the event's `agentId` names the subagent's loop). The owner of each list appends the rows it originates (the interactive transcript, the headless session, a subagent's run for its opening rows), and the query loop appends every row it makes as the row leaves the loop; what the owner behind a loop receives, what the transcript file stores and what the next request sends are all the row as the chain answered it. Never a progress row, a row that rides one request alone, or a row a load returned (a `--resume`, a teleport, a subagent's saved transcript): loads are not appends. While no plugin hooks the event the call is the store itself.

The event's `door` names the route the row came in by (`prompt`, `command`, `response`, `tool-result`, `tool-message`, `delivery`, `attachment`, `hook-context`, `note`, `compaction`, `notice`), `origin` who caused it (a prompt's sender, `{ kind: 'model', model }`, `{ kind: 'tool', tool }`, the engine, a settings hook, a plugin), and `uuid` its id in the transcript. Its `message` is the row: `type`, `name` (an attachment's type, a notice's subtype), `role` (absent for a row no request carries), `isMeta`, and `content`, its blocks as the Messages API spells them, so `{ role, content }` of a row a request carries is an API message. All but the message's `content` is pinned: left out, it is kept; changed, the hook fails and is skipped.

A hook rewrites `content` with `next({ ...e, message })`: text blocks (edited, added, dropped, reordered) and a tool_result's `content` and `is_error` (tool_results answered with no `tool_use_id`, one for each the row holds, stand for them in order, and one naming no `is_error` keeps the row's flag); an image or document block may be dropped or moved, not changed or added. Text a hook puts ahead of every pinned block follows the row's leading thinking blocks or tool results, which a request needs first. The bottom puts back what the record depends on: thinking and redacted_thinking blocks, tool_use blocks and every block it does not author, whole and in place, and each tool_result's id and the set of them. Content left empty removes every block a hook may drop: the pinned ones are put back, and a row left with no block at all is stored with the engine's own words for an empty message, `(no content)`, never with what the hook removed. A rewrite of an attachment rendered per request or carrying media keeps the row as made (said in the debug log). `next(e)` resolves `{ message, uuid }` once the row is stored; a hook that answers a row without `next` is skipped and the row is kept: a row the engine appends is never refused. The engine's later edits of a kept row (a tool result cut to its budget, a hint cleared, compaction) are its own business and no append.

In a hooked session a row is stored once its chain has run, a conversation's appends strictly in the order they were made; a row the engine appends from a synchronous callback (a notice) therefore lands after its chain, and the places that read a list back right away (a turn building its first request) wait for the appends made so far. A tool result's structured record beside its tool_result (`toolUseResult`, what the screen draws), the row's timestamps and parent links, and an attachment's payload are stored as made. So is the message queue's own record of a prompt as it was queued (the transcript file's `queue-operation` entries), which is no row of the conversation: a plugin that must change a prompt's words everywhere rewrites them at `prompt.submit`, before they are queued.

`$.session.append({ message: { type, content }, agentId? })` is the same dispatch from a plugin, and it REALLY appends: a user-role row the person does not see as typed (`type: "user"`, stored `isMeta`, the model reads it) or a notice (`type: "system"`, one text block, the model never reads it), of text blocks alone in this release, to the main conversation or to a running subagent's, under `origin: { kind: 'plugin', name }` and door `note`, with an id the engine mints. The row is in the list at once and in a running turn's requests from the loop's next top. The bottom refuses any other row or block, an `agentId` that names no running loop, and a run no plugin may shape (one started with the settings hooks off, or as a delegated observation), with the reason (the call rejects). The stored user row carries the plugin's name as its origin, so a later reader of the transcript knows who appended it. A plugin above may rewrite it like any row, or refuse it by answering `{ deny: reason }` in place of `next` (after `next` the row is stored, and a deny then fails the hook): the call then resolves `{ deny }` and nothing is stored. A hook's answer is what its `next` answered, the row as stored or the refusal from below, unchanged: a different row fails the hook. That is the one row a `session.append` hook may refuse; where an organization seats its policy plugin, the event continues past the person's plugins like the prompt events do.

```js
on("session.append", ($, e, next) => next({ ...e, message: redact(e.message) }))
  .catch(($, e, next) => next({ ...e, message: placeholderFor(e.message) }))
```

## Work that outlives a dispatch

A hook runs inside one dispatch with a budget of its own time (a `next` or `$` call in flight does not count; a `$.clock.sleep` does, so a `turn.step` generator that polls with it pays every sleep from its one budget), and `next.signal` aborts
when that dispatch is abandoned (the user interrupted, another hook settled
first, the budget ran out); anything started for the dispatch should stop
on it. Work meant to outlive a dispatch belongs elsewhere: start it from a
`session.start` hook, which fires once when the session is ready and is
awaited before the first prompt (so a `$.tool.register` awaited there is
listed by turn one), and keep it going with `$.clock.every` and
`$.clock.after`, whose timers run until cancelled or until the module
reloads. `$.prompt.submit` queues a prompt that starts a turn of its own once the session is idle (never folded into a running turn; the call resolves as that turn starts, not when it ends), so
background work can wake a quiet session. `$.model.complete({ model, prompt })` runs one text completion with no history on the session's own client and always resolves a result (`ModelCompleteResult`), never a bare string and never a rejection over what the provider did: `isAnswered` with `text` and `usage` (a `ModelUsage`, the four token counts as the API spells them: the one shape `session.compact`'s result, `turn.complete`'s `usage` and the context breakdown's `apiUsage` report a call's cost in too), or `isAnswered: false` with a `reason`, `api-error` (with the HTTP `status` and the `error` kind, never the error's text), `empty-reply`, or `aborted` (its `timeoutMs` elapsed, or the dispatch that made the call was abandoned), `usage` on each arm; only a request the engine refuses to send (a blocked model, a bad `maxTokens`) rejects. `$.model.fork({ prompt })` asks one tool-less question over the session's own transcript as the main thread last sent it, same model and system prompt, so the API serves that prefix from its prompt cache (`usage.cache_read_input_tokens` says how much it served); its result is the same arms plus `nothing-to-fork` (a new session before its first turn, and again right after a /clear), its `aborted` the turn whose hook forked interrupted while the fork ran. `$.ui.status`, `$.ui.toast` and
`$.ui.log` show state without starting a turn, `$.ui.copy({ text, surface })` puts text on the clipboard of the surface the caller names (a press hook passes `e.surface`; left out, the session's first): the terminal's through the machine's clipboard tool and OSC 52, resolving `{ isCopied: true }`; `{ isCopied: false, reason }` on a remote surface, `no-clipboard`, or with nothing drawing, `no-surface`; the event `ui.copy` carries the target `surface`, so a hook may rewrite, refuse or take it), `$.store` keeps values
across sessions, `$.session.version()` answers the engine's `version`, its `base` release and its `builtAt` build time (the values the engine's own analytics rows carry, in every mode and build), and `$.process.run` runs a host command by argv. `$.fs` reads (text, or `{ as: 'bytes' }` for `{ base64 }`), writes, lists and stats paths; `$.fs.stat(path, { resolve: true })` also answers `realPath`, every symbolic link and `..` resolved (what `realpath` gives: a hard link, a `/.vol/` file-id spelling or a case alias keeps its own spelling), so a guard's robust form is an allow-list on `realPath` under a root it resolved the same way, and a deny-list on spellings is best effort.

`$.ui.selection()` answers what the person last selected with the mouse in
the fullscreen terminal, `{ text, requestId? }`: the text as a copy would
take it, and the transcript row it lies in, by the id that row's `ui.render`
reads as `e.requestId` (absent when it spans several rows or lies outside
the transcript). A key or a click takes the highlight down before a command
or a press runs, so the answer stays what they last selected until they
select again, dismiss it, or their next prompt or command has run: a command
they type, or a Button they press, reads it. A prompt typed while a turn
runs and folded into that turn is no run of its own: the selection stays
kept until the next one has run. It resolves `undefined` with
nothing selected, and wherever the engine sees no selection (fullscreen off,
`-p`, a remote surface). A command that quotes the selection into the prompt:

```js
export function register(on) {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'quote',
      description: 'Quotes the selection into the prompt.',
    })
    return next(e)
  })
  on('command.run', { command: 'quote' }, async $ => {
    const selected = await $.ui.selection()
    if (selected === undefined) return { text: 'Nothing is selected.' }
    const quoted = selected.text.replace(/^/gm, '> ')
    await $.prompt.fill({ text: quoted + '\n\n', mode: 'insert' })
    return { text: 'Quoted the selection.' }
  })
}
```

## Tools and agent types the model can call

`$.tool.register` declares a tool: its name, the description the model
reads and its input schema; the tool is listed as `mcp__<plugin>__<name>`.
The plugin serves it by hooking `tool.call` with the matcher
`{ tool: 'mcp__<plugin>__<name>' }` and returning the result, and a call
no hook answers fails saying so. Registering the same name again replaces
the tool, and a plugin may register several, each listed as it lands. `$.agent.register` declares an agent type the same way, `<plugin>:<name>`, from an agent definition as settings JSON spells one (prompt, tools, model, and the rest, all in force); a plugin folder's `agents/*.md` files declare them too. `$.agent.spawn({ subagentType })` runs one and its answer is its `turn.complete`; an `agent.offer` hook returning `{ isOffered: false }` keeps it from the model while the plugin's own spawn still runs it.
