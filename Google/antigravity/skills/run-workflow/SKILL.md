---
name: run-workflow
description: >-
  How to write and run a dynamic workflow script with the `run_workflow` tool:
  a Python script that orchestrates many agents with `agent`, `parallel`,
  `pipeline`, and `phase`. Use when a task splits into many
  independent or staged pieces of agent work (fan out over files, modules,
  bugs, or review angles, then aggregate), or when the user asks for a
  workflow. Don't use for a single delegated task (use a subagent) or for
  legacy workflow files (see migrate-workflows).
---

# Dynamic workflows with `run_workflow`

A workflow is a short Python script that the `run_workflow` tool executes. The
script decides which agents to start, in what order, and what to do with their
results. Use it instead of many manual subagent calls when the orchestration
itself is code: loops over a list, fan-out then aggregate, or staged pipelines.

## Steps

1.  Pass the script inline as `Script`, or write it to a file (for example in
    the conversation scratch directory) and pass its absolute path as
    `ScriptPath`. Set exactly one of them; a file is easier to fix and rerun.
2.  Call `run_workflow(Script="...", Description="...")` or  
    `run_workflow(ScriptPath="/abs/path/workflow.py", Description="...")`.  
    `Description` is a one-line goal shown in the UI.
    The workflow runs in the background, and you are notified when it ends.
    For a quick script, such as a `call_tool` fan-out, set
    `WaitMsBeforeAsync` (up to 10000) to get the result in the same turn if it
    finishes in time.
    To pass inputs, set `Args` to a JSON object; the script reads it as the
    `args` dict. When `ScriptPath` is a saved workflow's entry script, `Args`
    is validated against the args schema in its `workflow.json`.
3.  Read the tool result: it contains the `log()` output (`Logs:`) and what the
    script printed (`Output:`). Each agent is also linked from the workflow
    step, so the user can open its conversation.
4.  If the tool returns an error, fix the script at the reported line and run
    it again.

## Script rules

The script runs in its own `python3` process, which needs Python 3.8 or later
on `PATH`:

-   `await` works at the top level, and you can define `async def` helpers.
-   Installed library workflows are importable by name (`import <library>` or
    `from <library> import <name>`); library modules see the same primitives as
    the script.
-   What the script prints (`print()`, `stderr`, child-process output, and the
    `repr` of a trailing expression) is returned in the tool result's `Output:`
    section (and appended to the error when the workflow fails).
-   An uncaught exception stops the workflow and reports the script line.
-   `CONVERSATION_ID` and `STEP_INDEX` identify the `run_workflow` step.
    `WORKSPACES` is a tuple of the workspace directories, primary first (empty
    if there are none).
-   The working directory is `Cwd` if given, else `WORKSPACES[0]`, so relative
    paths resolve against it. Local modules are not importable.

## Primitives

| Primitive | Behavior |
| --- | --- |
| `log(*args)` | Adds a line to the workflow output and the UI. |
| `phase(name)` | Starts a named phase; later logs and agents group under it. |
| `agent(prompt=None, schema=None, role=None, type_name="self", workspace="inherit", model=None)` | Defines an agent; nothing runs yet. `await agent(prompt, schema)` runs it once and returns its result. `a = agent(...)` then `await a(prompt, schema)` runs one turn in a conversation kept across calls. |
| `parallel(items, fn)` | Promise that calls `fn(item)` for each item and awaits all results concurrently; results are in item order. If one fails, the rest are cancelled. |
| `pipeline(items, fn)` | Promise that calls and awaits `fn(item)` one item at a time; results are in item order. |
| `trajectory(last=None, types=None, tools=None, min_index=None, max_index=None)` | `await trajectory()` returns steps before this `run_workflow` call started, oldest first. `min_index` and `max_index` bound `step.index` (inclusive); `types` and `tools` filter by step type or tool name; `last` keeps the last N matching steps. |

Arguments:

-   `type_name`: the agent type to run. `"self"` uses the current agent's
    configuration; any available custom agent name also works.
-   `workspace`: `"inherit"` (the current workspace), `"branch"` (a new isolated
    clone, for agents that edit code in parallel), or `"share"` (a new workspace
    that shares the underlying repository). Other values are errors.
-   `schema` (required): a JSON schema (dict or string) for the agent's result.
    The agent returns the result by calling its `finish` tool, which checks it
    against the schema, and `await agent(...)` returns the parsed value. An
    agent that ends without calling `finish` fails the workflow. Use
    `{"type": "string"}` for a free-form answer.
-   `role`: an optional short title for the agent's card, such as  
    `"Security reviewer"`.
-   `model`: the agent's model tier: `"inherit"` (default, your model),
    `"flash_lite"`, `"flash"`, or `"pro"`. Use a lighter tier for simple,
    high-fan-out work.
-   `fn`: usually a `lambda` that returns `agent(...)`, or an `async def`
    helper that awaits several agents. It must return something awaitable:
    an `agent()` or a call on one, a nested `parallel()` / `pipeline()`, or
    an `async def` call. Build per-item prompts and roles with f-strings.

Awaiting the same agent twice runs it once and returns the same result. An
`agent()` that is never awaited or called never runs, so always `await` it, or
pass it to `parallel` / `pipeline` and await that.

The workflow step shows one card per agent, in the order agents start, titled
with its `role`, or else the first line of its prompt, so set a role or start
each prompt with a short line that names the job.

## Agents that keep their context

When one agent should do several related turns, such as a reviewer that checks
the fixes for the bugs it found, call it instead of awaiting it. Each
`a(prompt, schema)` is lazy like an awaited `agent()` and returns that turn's
`finish` result; the agent's own `prompt`, if any, is its standing instructions
and leads the first turn. `schema` on a call defaults to the agent's. Turns on
one agent run one at a time, in the order they were started. A failed turn
raises, but the agent stays usable. An agent is either awaited or called, not
both. `del a` ends the agent, unless something else, such as a lambda, still
references it; every agent ends when the workflow ends.

```python
reviewer = agent("You review Go code for correctness.", role="Reviewer")
bugs = await reviewer("List the bugs in foo.go.", {"type": "array", "items": {"type": "string"}})
fixes = await parallel(bugs, lambda b: agent(f"Fix: {b}", {"type": "string"}))
ok = await reviewer(f"Fixes made: {fixes}. Are all your bugs fixed?", {"type": "boolean"})
del reviewer
```

## Calling tools from the script

Where the `run_workflow` tool description lists tools for `call_tool`, the
script can call them directly:

-   `call_tool(name, **args)` returns a promise like `agent()` does. Awaiting it
    runs the tool with the arguments you would pass to it directly and returns
    the tool's output as a `str`.
-   It raises `ToolError` (with `.tool` and `.message`) if the tool fails or
    the call is denied. `.denied` is `True` when a pre-tool hook or the
    permission check rejected the call before the tool ran, so a script can
    skip denied calls and still fail on real errors.
-   The user cannot be asked anything from a workflow: a call that needs user
    approval that has not already been granted is denied.
-   Tool outputs are not shown to you unless the script logs or prints them.

## Reading earlier conversation steps

Pass inputs you already have in `Args` (or inline in the script). Use
`await trajectory(...)` when the script needs to inspect steps from earlier in
this conversation—such as mining a failed `run_command` output without
rerunning it—and pass only the relevant slice into child `agent()` prompts.

Each returned `Step` is a `dict` that also supports attribute access (missing
fields return `None` as attributes):

-   `index` (`int`): 0-based step index.
-   `type` (`str`): step type, e.g. `"USER_INPUT"`, `"PLANNER_RESPONSE"`,
    `"SYSTEM_MESSAGE"`, or `"GENERIC"` (tool calls).
-   `status` (`str`): e.g. `"DONE"`, `"ERROR"`, or `"CLEARED"`.
-   Message steps set `text` (`str`); tool steps set `tool` (`str`), `args`
    (parsed `dict`), and `output` (`str`, truncated at 200k characters).

```python
steps = await trajectory(tools=["run_command"], last=20)
errors = [s.output for s in steps if s.status == "ERROR" and s.output]
log(f"Found {len(errors)} failed command(s)")
```

`trajectory()` only returns steps before the `run_workflow` call started (steps
added while the workflow runs in the background are not included). Older tool
steps evicted from memory have `status == "CLEARED"` and `output == None`; read
the conversation's `transcript.jsonl` / `transcript_full.jsonl` when you need
cleared tool outputs or steps added after the workflow started.

## Behavior to know

-   Workflow agents are main agents, not subagents. They are hidden from the
    conversation list and reachable from the workflow step. An awaited agent
    is single-use; a called agent lasts until deleted or the workflow ends.
-   `await agent(...)` returns when the agent's run ends, with the result it
    passed to `finish`.
-   If one agent in `parallel` fails, the whole call fails and the other agents
    in it are cancelled. Stopping the parent conversation stops all running
    workflow agents.
-   Agents do not see the script or each other. Put all the context an agent
    needs in its prompt, and ask for a short, well-defined output.

## Example

Fan out over a list that an agent produces:

```python
phase("Discover")
files = await agent(
    "List the Go files under pkg/foo that call Bar(). Paths only.",
    schema={"type": "array", "items": {"type": "string"}},
)

phase("Review")
reviews = await parallel(files, lambda f: agent(
    f"Review {f} for misuse of Bar(). Reply in 3 bullets or 'OK'.",
    schema={"type": "string"},
    role=f"Review {f}",
))
for r in reviews:
    log(r)
```
