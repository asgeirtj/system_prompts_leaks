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
clock, network, host commands, settings, environment and the rest), `e` is the event's input as a plain value,
and `next(e)` continues to the other plugins and then the engine's own
behaviour, resolving to the event's result. A hook that returns without
calling `next` answers for itself; one that calls `next({ ...e, ... })`
rewrites what the rest of the chain sees, within what that event allows.
The module runs in an environment of its own, with no DOM and no Node:
everything outside it is reached through `$`. JSX is available with `h` as
the factory.

The events cover tool calls and their descriptions, the prompt as
submitted, the system prompt's sections and the first message's context
blocks, what the interface draws, the turn's start, steps and completion,
the session's start and its inbound deliveries, skills, subagents and
attribution text. Which of them a feature is, and what it needs from `$`,
are the two questions worth settling before writing anything.

## The types are the reference

Do not guess at an event's input, a method on `$`, or an element's props.
Run `/plugin-types` in the session (it takes an optional directory and
defaults to `.claude/types`). It writes two files from the running build:
`claude-code.d.ts`, which declares the module `claude-code` (import types
from it; at run time the import is empty), the globals a hooks module has,
and the inputs of this build's built-in tools; and `claude-code-mcp.d.ts`,
the inputs of the MCP tools connected right now, so `e` narrows per tool.
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
quickest check that the engine sees what you meant.

## Developing one

`claude --plugin-dir <folder>` loads the plugin from disk for that session
only (repeat the flag for several). In an interactive session the folder is
watched: saving a file reloads the hooks module, so `register` runs again in
a fresh environment and the previous environment's timers are dropped.
Options for a plugin loaded this way are read from settings under
`pluginConfigs`, keyed by the plugin's `<name>` (or `<name>@inline`).

Run with `claude --debug` while developing. A hook that fails is skipped and
the chain continues without it, unless its registration's `.catch` handler
answers in its place; the transcript says so once, in a dim line naming the
plugin, the event and the reason, as it names a module that did not load. The debug log has every occurrence and each result the engine
refused, so a plugin that seems to do nothing has usually been told why.

## Drawing: ui.render

A `ui.render` hook receives one component instance. `e.component` says
which component, `e.surface` where it is drawn (`terminal` or `desktop`),
`e.requestId` which instance (the tool_use_id for a tool row or dialog,
the message id for a message, the agent id for a spinner), `e.props` the
component's plain-data props, and `e.viewport`, when the surface has
measured, the size it draws into in character cells: `columns` and `rows`.
A change of width re-runs every hooked site once the resize settles, so a
tree sized to `columns` stays right; a change of height alone re-draws
nothing. `$.ui.invalidate` asks for a redraw when the hook's own state
changed.

Build trees from the table `$.ui.resolve(e)` returns: the surface's element
constructors, destructured into the hook's JSX tags (a module has no element
globals). Tables differ per surface and narrowing `e.surface` narrows the
table: check `Elements` before using an element on both. Return a tree,
or `next({ ...e, props })` to change what the engine draws, or `next(e)` to
leave it. A tree that does not validate (an element the surface lacks, a
prop the element does not take, a child where none goes) is not drawn: the
engine draws its own component instead and writes a line to the debug log
beginning `ui.render (<Component>): a hook returned a tree that does not
validate`, followed by the reason. When a drawing silently falls back,
that line and the element's props type are the two things to read. Buttons,
text fields and selects keep their handlers in the plugin and raise
`ui.press`, `ui.input` and `ui.select`; keys reach one only while it has
focus, Esc returns to the prompt. A keyed `Box` scopes `hover` styles.

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

## Tools the model can call

`$.tool.register` declares a tool: its name, the description the model
reads and its input schema; the tool is listed as `mcp__<plugin>__<name>`.
The plugin serves it by hooking `tool.call` with the matcher
`{ tool: 'mcp__<plugin>__<name>' }` and returning the result, and a call
no hook answers fails saying so. Registering the same name again replaces
the tool, and a plugin may register several, each listed as it lands.
