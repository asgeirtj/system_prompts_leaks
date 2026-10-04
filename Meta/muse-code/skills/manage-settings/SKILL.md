---
name: manage-settings
description: Any explicit Muse Code setting question or change (model, reasoning effort, /settings) requires a silent read_skill call for bundled:manage-settings as FIRST ACTION—no assistant text or other tool first. Never use for repository, app, eval, or other non-Muse configuration.
---

# Manage Settings

Explain saved settings and defaults from the workspace's configuration, keep
them distinct from live/effective state, and make small settings edits only when
the user explicitly asks for that edit.

## Scope

- Manage Settings is exclusively for Muse Code-owned settings.
- Never read, name, explain, or modify another agent's config, rules, skills,
  home directories, or compatibility environment.
- Use this skill for questions about product settings, config paths, reminder
  toggles, TUI settings, provider/model settings, and tool or policy settings.
- "Product settings" here means Muse Code itself. Repository settings,
  application settings screens, library configuration, and eval-task config
  work stay in the ordinary task workflow and MUST NOT load this skill.
- Prefer the current workspace and current process environment over general
  defaults.
- Do not create issues, branches, commits, PRs, plugins, or skills.
- Do not install, enable, disable, trust, activate, or run plugins or skills
  unless the user explicitly asks for that action.
- Do not print secrets. If a setting might contain a token, key, credential, or
  opaque auth value, describe whether it is present without revealing the value.

## Decide Before Any Tool Call

- Manage Settings owns persistent saved settings, not current runtime state.
- An explicit request to change a setting is a saved-settings edit request; the
  user does not need to say "saved default" or name `settings.json`.
- For questions about controls, supported tiers, or timing, answer from the
  stable contract below. Read config when the user asks for a saved value or a
  persistent setting change.
- The first settings-file CONTENT access MUST be `read_file` on the resolved
  active path. When the absolute path is not already known, one read-only Bash
  call may resolve it from the environment, but that call may print only the
  resulting path and MUST NOT touch the filesystem. Use this shape without
  adding `ls`, `test`, `stat`, `cat`, or another command:
  `python3 -c 'import os; print(os.path.join(os.environ.get("XDG_CONFIG_HOME") or os.path.join(os.environ["HOME"], ".config"), "muse", "settings.json"))'`.
  YOLO mode alone never authorizes direct Bash file access.
- Use `edit_file` or `write_file` for the smallest safe JSON change. If those
  tools reject the same app-private config path, only when the startup security
  context explicitly says YOLO mode is already active (approval bypassed,
  shell sandbox off, and workspace trusted), a structured shell JSON edit may
  be used after the file tools reject that exact path in this turn. Use a JSON
  parser plus atomic replace and reread; never use text substitution.
- A shell file-access fallback must operate on that one resolved path. It MUST NOT test a
  second root, branch on file existence, use `$HOME` after resolving an
  `XDG_CONFIG_HOME` path, list the directory, or `cat` the whole settings file.
  Emit only the requested safe key values and the minimal preservation evidence.
- Never ask the user to change security mode just to edit settings.
- Never recommend disabling sandbox, approvals, or another security control to
  inspect or change settings.
- Renderer settings such as reasoning summaries and verbose output cannot be
  simulated in the assistant response. Explain the owning control instead of
  promising equivalent behavior.

## Read Before Answering

First classify the request. Questions about product controls, supported tiers,
or timing use the stable contract below and do not require a settings-file read.
Read the file for a saved-value question or an explicit setting change. A
request to change a setting means a persistent file edit; it does not authorize
a claim about current runtime state.

Before explaining or editing a saved value:

1. Identify the settings file. Prefer `$XDG_CONFIG_HOME/muse/settings.json`
   when `XDG_CONFIG_HOME` is set; otherwise use `$HOME/.config/muse/settings.json`.
2. Read that file when it exists. After the optional path-only resolver, the
   first content access MUST use `read_file`. If it rejects the app-private path
   and startup evidence already says YOLO mode is active, the structured shell
   JSON fallback above may read the same path.
3. A missing file is the normal first-write state. For a read-only question,
   say which path was checked, explain the relevant default, report that no file
   changed, and stop. For an explicit unambiguous change, create the smallest
   valid JSON document with `schema_version: 1` and only the requested setting;
   the old value is absent plus its documented default. Do not create a file for
   an ambiguous request.
4. If the allowed read path is unavailable or the read fails for any reason
   other than not found (permission denied, sandbox block, malformed JSON, I/O
   error), say which path was checked and which failure happened, explain the
   relevant default behavior instead of inventing a saved value, and stop — do
   not hunt for substitute configuration files, probe writability, or try a
   different config root.
5. Tie the answer to the concrete key path, such as
   `runtime_capabilities["plugin:tbh-reminders:reminder:skill-reminder"].enabled`.

## Where Muse Code Keeps Its Settings

This skill answers from the settings surface only:

- Config root: `$XDG_CONFIG_HOME/muse`, else `$HOME/.config/muse` — holds
  `settings.json` (saved settings and defaults), `auth.json`, and `trust.json`; report
  auth/trust presence only, never contents.

That config root is the whole answer surface for this skill. A configuration
file outside it is not Muse Code configuration — do not hunt for substitute
configuration files, and never present an unrelated file as this session's
active or effective configuration, even when the Muse settings file is
unreadable.

Resolve exactly one root. When `XDG_CONFIG_HOME` is set, `$HOME/.config/muse` is
outside the active root: never read, list, test-write, or report it as a fallback
or schema source.

Session state, logs, crashes, and what-happened questions are not settings
questions: hand those to the `doctor` skill instead of reading data-dir
files from here.

## Saved Versus Live State

A `settings.json` read-back proves saved configuration only; it never proves
current TUI, in-flight run, active tool surface, or provider-request state. A
verified config write changes the permanent saved setting only. It is guaranteed
to be loaded on the next Muse Code launch; do not claim that the current process
reloaded it. Relaunch Muse Code, not the terminal application, when the user
wants the saved value to become the new runtime default.

Ordinary conversation does not invoke a TUI settings control. In the interactive
TUI, `/models`, `/effort`, and `/settings` are user-side controls; never claim
that you executed one. Telling the assistant `/effort` or describing a desired
setting in chat does not run that control.

Current-runtime controls are outside this skill's mutation scope. `/models`,
`/effort`, and `/settings` are user-side controls; mention the relevant control
when the user also wants an immediate current-session change, but never claim
that you executed it. For Meta, the persistent effort tiers are `minimal`,
`low`, `medium`, `high`, `xhigh`, `max`, and `ultra`. `high` is the default Meta
baseline; `xhigh` is the opt-in premium precision tier. `ultra` remains the
saved client selection, uses `max` reasoning on the Meta wire (ADR 19425 D63), and currently
enables proactive workflow/delegation guidance when that tool surface is
available. It may proactively run multi-agent workflows and increase token
usage quickly. Do not claim the proposed 64-slot unconfigured-root default is
current; that capacity change is still a target.

You may honor a behavioral preference for the current task without claiming a
product setting changed only when it actually governs your response or tool
choices. For example, answer more briefly or avoid subagents when asked, while
leaving the corresponding product setting untouched. Do not pretend to emulate
renderer behavior such as reasoning summaries or verbose-output repainting, or
provider, permission, or other external-setting behavior. Do not invent
reasoning-effort tiers, budgets, ratios, mappings, or effects; use only the
stable facts above. Do not infer token budget, quality, speed, or generic
workflow effects from tier names. In particular, do not say a higher provider
tier performs more, deeper, longer, or better reasoning. The only current
workflow delta named by this contract is `ultra`'s proactive guidance; it does
not prove that provider reasoning itself is deeper or better.

## Persistent Writes On Explicit Change

Do not claim that a saved-file edit changed the current interactive TUI. An
explicit request such as "use xhigh", "turn summaries off", or "set verbose
output to less" authorizes the corresponding persistent setting edit when the
request is unambiguous. If the requested value is ambiguous, ask which saved
value to use and STOP without a mutation. A clarification timeout,
auto-cancellation, dismissal, empty reply, or missing reply is not authorization:
leave the setting unchanged. Never pick a value because it seems more common,
likely, stronger, or closer to a default.

Use these stable key contracts:

- `reasoning_effort` is the top-level persistent effort tier. Meta accepts
  `minimal`, `low`, `medium`, `high`, `xhigh`, `max`, or `ultra`.
- `tui.reasoning_summaries` is a persistent boolean; absent defaults to `true`.
- `tui.verbose_output` is one of `less`, `edits`, or `more`; absent defaults to
  `edits` (shown as `edits & writes`).
- `tui.terminal_background` is one of `auto`, `light`, or `dark`; absent
  defaults to `auto` (detect from the startup probe). `light`/`dark` override
  the detected terminal background for theme resolution at the next startup.

When a write is requested:

1. Read the current settings first.
2. Make the smallest JSON change that satisfies the request. If the read proves
   the file is missing, create a minimal object containing `schema_version: 1`
   and only the requested setting. A denied or malformed file is not a missing
   file and MUST NOT be replaced.
3. Preserve unrelated keys, formatting-sensitive values, and unknown fields.
4. Re-read the file to prove the saved value changed. Do not treat the reread as
   live/effective-state evidence.
5. Report the old saved value (or absent plus its effective default), the new
   saved value, that it is permanent, that the current session is unchanged,
   and that it takes effect on the next Muse Code launch. Relaunch Muse Code; do
   not tell the user to restart the terminal application.

For a YOLO shell fallback, an earlier successful shell read does not replace the
required `edit_file` or `write_file` attempt. Try the file mutation tool on the
same path first; use the atomic structured shell mutation only after that tool's
explicit denial in this turn.

If the allowed access path above still cannot read or write the active config,
report that no saved setting changed and stop. Do not probe another config root
or bypass a security control.

## Completion Report

For read-only answers, include:

- the settings path checked;
- the key path or default that answers the question;
- whether any file was changed.

For a verified write, use this user-facing summary shape:

```text
Saved changes
- <key>: <old saved value or absent + default> -> <new saved value>

Permanent: yes
Current session: unchanged
Effective: next Muse Code launch
Reload: required - relaunch Muse Code; no terminal-application restart
Verified: `settings.json` reread at <path>
```

For a setting such as `reasoning_effort` with higher-precedence startup input,
append `unless a launch flag overrides the saved value` to the
Effective line. Name any setting intentionally left unchanged.

If the read, write, or verification fails, use:

```text
Changed: no
Reason: <exact path and failure>
Reload: not applicable
```
