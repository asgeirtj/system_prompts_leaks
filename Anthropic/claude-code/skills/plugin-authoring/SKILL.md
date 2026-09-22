---
name: plugin-authoring
description: Write or debug a Claude Code plugin made of function hooks (a hooks module exporting register(on, options), hooks ($, e, next) on events like tool.call, prompt.submit, ui.render, session.start). Load it before writing or changing such a plugin; it says where the exact types come from, how to run a plugin under development, and where the engine reports what it refused.
---

You are about to write, extend or debug a plugin made of function hooks.
This note is orientation: what such a plugin is, where its exact contract
is written down for the build you are running in, and where to look when
something does not take. The API is early access and moves between
releases, so treat the generated declarations as the authority and this
note as the map to them.

## What a plugin of function hooks is

A plugin is a folder with a `.claude-plugin/plugin.json` manifest. Its
function hooks live in one hooks module: a TypeScript or JavaScript file
that `hooks/hooks.json` names under `modules` (one path, relative to that
file), exporting `register(on, options)`. `on(event, matcher?, hook)` adds a
hook; `options` holds the values of the fields the manifest's `userConfig`
declares. Every hook has the shape `($, e, next)`: `$` is the engine
interface (display, model, session, prompt, tools, filesystem, store,
clock, network, host commands, settings, environment, the config menu's rows and the rest), `e` is the event's input as a plain value,
and `next(e)` continues to the other plugins and then the engine's own
behaviour, resolving to the event's result. A hook that returns without
calling `next` answers for itself; one that calls `next({ ...e, ... })`
rewrites what the rest of the chain sees, within what that event allows.
The module runs in an environment of its own, with no DOM and no Node:
everything outside it is reached through `$`. JSX is available with `h` as
the factory.

The events cover tool calls and their descriptions, the prompt as submitted, the system prompt's sections and the first message's context blocks, what the interface
draws, the turn's start, steps and completion, the session's start and deliveries, each hooks module's admission, skills, subagents and attribution text. Which of them a
feature is, and what it needs from `$`, are the two questions worth settling before writing. One event streams: `turn.step`, a model request of the turn, whose hook is an
async generator (`async function* ($, e, next) {}`, the one form that loads there); `next(e)` is the stream beneath, `yield* next(e)` forwards it and evaluates to the
step's result, `for await` over it rewrites the chunks (`TurnStepChunk`) one at a time, yielding without `next` answers alone, and a chunk once yielded stays, so a hook
that fails mid-stream is left where it stood and the rest of the response comes from beneath it.

## The types are the reference

Do not guess at an event's input, a method on `$`, or an element's props.
Run `/plugin-types` in the session (it takes an optional directory and
defaults to `.claude/types`). It writes three files from the running build:
`claude-code.d.ts`, which declares the module `claude-code` (import types
from it; at run time the import is empty), the globals a hooks module has,
and the inputs of this build's built-in tools; `claude-code-plugins.d.ts` and its folder, what the enabled plugins add to `$` (below); and
`claude-code-mcp.d.ts`, the inputs of the MCP tools connected right now, so `e` narrows per tool.
The header of `claude-code.d.ts` carries a `tsconfig.json` that fits a hooks
module and shows how to type `register` against `Register`.

Read that file for every event's input and result, every noun and method on
`$` with its doc comment and example, every element each surface draws and
the props each element accepts, and the limits it states. Shapes there are
the engine's own, not the Messages API's: `$.session.messages()`, for one,
answers `SessionMessage` rows of `{ role, text, toolUses }`, not `content`
blocks. When the build updates, regenerate rather than edit.
`claude plugin validate <path>` reads a plugin's manifest and its hooks
module's source and reports what the module hooks and calls, which is the
quickest check that the engine sees what you meant. A plugin that adds a noun to `$` in `engine.create` ships that noun's types as a contract: one self-contained `.d.ts` (say `types/index.d.ts`) that exports the noun's types at its top level and declares the noun on the engine's interface, `export type Topo = { ... }` then `declare module 'claude-code' { interface EngineInterface { topo: Topo } }`, with no import or reference, its exported names led by the noun's PascalCase name (`Topo`, `TopoRun`), named in `plugin.json` as `"types": "./types/index.d.ts"`. The plugin's own hooks module imports those types from that file, so the contract is the one place they are written. A plugin that depends on it never copies the file: `/plugin-types` copies every enabled plugin's contract to `claude-code-plugins/<plugin>.d.ts` beside an index, `claude-code-plugins.d.ts`, that references each, so the noun is typed on the dependent's `$` from the session it develops in (the tsconfig's include of `.claude/types` takes the folder), and `claude plugin validate` checks a contract exactly as that roll-up reads it.

## Developing one

`claude --plugin-dir <folder>` loads the plugin from disk for that session
only (repeat the flag for several). In an interactive session the folder is
watched: saving a file reloads the hooks module, so `register` runs again in
a fresh environment and the previous environment's timers are dropped.
Options for a plugin loaded this way are read from settings under
`pluginConfigs`, keyed by the plugin's `<name>` (or `<name>@inline`); each non-secret `userConfig` field is a row in the config menu too, and a change there reloads the module with the new `options`. A `string` field that lists `options` (`"options": ["gist", "turbo"]`, its `default` among them) is a picker over exactly those values there, and a stored value outside them counts as unset.

Run with `claude --debug` while developing. A hook that fails is skipped and
the chain continues without it, unless its registration's `.catch` handler
answers in its place; the transcript says so once, in a dim line naming the
plugin, the event and the reason, as it names a module that did not load. The debug log has every occurrence and each result the engine
refused, so a plugin that seems to do nothing has usually been told why.

## Drawing: ui.render

A `ui.render` hook receives one component instance. `e.component` says
which component, `e.surface` where it is drawn (`terminal`, `desktop`,
`mobile` or `vscode`), `e.requestId` which instance (the tool_use_id for a tool row or
dialog, the message id for a message or a command's output row, the agent id for a spinner), `e.props`
the component's plain-data props, and `e.viewport`, when the surface has
measured, the size it draws into in character cells: `columns` and `rows`.
A change of width re-runs every hooked site once the resize settles, so a
tree sized to `columns` stays right; a change of height alone re-draws
nothing. A `Pane` or `AbovePrompt` hook sizes its tree to `e.props.bodyColumns` instead: the box it draws into, which is narrower than the viewport while a pane is docked beside the transcript. `$.ui.invalidate` asks for a redraw
when the hook's own state changed.

Build trees from the table `$.ui.resolve(e)` returns: the surface's element constructors,
destructured into the hook's JSX tags (a module has no element globals). Tables differ per
surface, see `Elements` (`mobile` has no `Input`, `Select` or `Client`, `vscode` no `Client`,
`terminal` no `Svg` but alone `Raster`); narrowing `e.surface` narrows the table. A grid of colored cells
(sparkline, heat map, rendered frame) is one `Raster`, its cells packed per `RasterProps`,
never a `Box` per cell; `$.ui.blit` repaints a mounted one without a render pass. Model-style text (headings, lists, tables, code fences, links; one outside `https:`/`http:`/`file:` draws as text) is one `Markdown`, drawn as an assistant reply is; given `key` and `onLinkPress`, a plain single click on a link it drew (any, or one `pressableLinks` names) raises `ui.press` carrying the link's `href` instead of the surface opening it, where the surface reports clicks (the fullscreen terminal; a ctrl- or alt-click still opens it). Return a
tree, or `next({ ...e, props })` to change what the engine draws, or `next(e)` to leave it.
A tree that does not validate (an element the surface lacks, a prop it does not take, a
child where none goes) is not drawn: the engine draws its own instead and writes to the
debug log a line beginning `ui.render (<Component>): a hook returned a tree that does not
validate`, followed by the reason. When a drawing silently falls back, that line and the
element's props type are the two things to read. A Button is `[ label ]` on the terminal, or with `plain` no brackets: `1: label` beside its `hotkey` and the label alone without one, so a one-glyph label is a one-glyph control the focus still inverts. Buttons, text fields and selects keep their
handlers in the plugin and raise `ui.press`, `ui.input` and `ui.select`; keys reach one only
while it has focus, Esc returns to the prompt, except that a Button naming one of the engine's keybinding actions (`action: "app:cycleDiffBase"`) is also pressed by the person's chord for it from the prompt while it is mounted: chords, or a modified key Global or an active context binds, and not while an engine handler of that action is mounted. A pane opened with `focus`, `closeOnEscape` and `holdToasts` behaves as a dialog: it takes the keys, Tab and the arrows walk its buttons, Esc closes it, and toasts wait behind it; an element drawn `autoFocus` holds the ring from the start, every move of the ring is the `ui.focus` event first (its `element` the key now holding it, absent on the engine's close mark; `{ deny }` keeps it) and `$.ui.focus({ requestId, key })` moves it while the site holds the keys; `rows` opens it inline as tall as its content needs (up to what the layout spares, and the person's own size wins), so a short dialog shows whole and its arrows walk rather than scroll; the `command.run` input's `presentation` says whether the answer shows fullscreen and how wide the terminal is. A keyed `Box` scopes `hover` styles, a hover `scope` groups elements across sites, and a `Box` drawn `position: "absolute"` with cell offsets (`top: -2, left: 2`) paints over its surroundings without moving them, so `display: "none"` with `hover: { display: "flex" }` on it is a card that appears over the rows above a hovered glyph. Every user-role transcript row is the `UserMessage` site: the person's prompt, a background task's notification (`e.props.task`: its `id`, `status`, `durationMs`) and a message another agent, teammate, session or channel sent (`e.props.from.name`), told apart by `e.props.origin.kind`, which a matcher narrows on (`{ props: { origin: { kind: 'task-notification' } } }`); a hook that draws a compact row of its own returns `next(e)` while `e.props.isExpanded` (ctrl+o), so the full row still shows there, and a rewritten `text` changes the row alone, never what the model read. A slash command's output row is the `CommandOutput` site: a plugin whose command answers `command.run` with `{ text, context? }` (`text` the row the model also reads, `context` notes only the model reads, recorded after it) hooks it with `{ component: 'CommandOutput', props: { command: 'mine' } }` and draws that text as a tree inline in the transcript, where a built-in command's lines would sit.

## Work that outlives a dispatch

A hook runs inside one dispatch with a budget, and `next.signal` aborts
when that dispatch is abandoned (the user interrupted, another hook settled
first, the budget ran out); anything started for the dispatch should stop
on it. Work meant to outlive a dispatch belongs elsewhere: start it from a
`session.start` hook, which fires once when the session is ready and is
awaited before the first prompt (so a `$.tool.register` awaited there is
listed by turn one), and keep it going with `$.clock.every` and
`$.clock.after`, whose timers run until cancelled or until the module
reloads. `$.prompt.submit` hands the session a prompt once it is idle, so
background work can wake a quiet session. `$.ui.status`, `$.ui.toast` and
`$.ui.log` show state without starting a turn, `$.store` keeps values
across sessions, and `$.process.run` runs a host command by argv.

## Tools and agent types the model can call

`$.tool.register` declares a tool: its name, the description the model
reads and its input schema; the tool is listed as `mcp__<plugin>__<name>`.
The plugin serves it by hooking `tool.call` with the matcher
`{ tool: 'mcp__<plugin>__<name>' }` and returning the result, and a call
no hook answers fails saying so. Registering the same name again replaces
the tool, and a plugin may register several, each listed as it lands. `$.agent.register` declares an agent type the same way, `<plugin>:<name>`, from an agent definition as settings JSON spells one (prompt, tools, model, and the rest, all in force); a plugin folder's `agents/*.md` files declare them too. `$.agent.spawn({ subagentType })` runs one and its answer is its `turn.complete`; an `agent.offer` hook returning `{ isOffered: false }` keeps it from the model while the plugin's own spawn still runs it.
