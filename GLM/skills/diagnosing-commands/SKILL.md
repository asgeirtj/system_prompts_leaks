---
name: diagnosing-commands
description: Use to diagnose and fix ZCode custom slash-command (/command) configuration problems in the ZCode client. Applies when a command is missing, is overridden by a higher-precedence command of the same name, has a frontmatter parse error, is dropped for having an empty body, has an invalid name, does not substitute $ARGUMENTS/$1, uses a colon rather than a slash for nested names, has a misspelled frontmatter key, or disappears because the plugin providing it is disabled. Provides the discovery order, how to inspect commands in the client, common pitfalls, and a step-by-step localization and repair workflow.
---

# Diagnosing Command Configuration

Goal: reduce any `/command` problem to a single concrete fix.

A person inspects commands from the **`/` menu** (the Commands group) in the input box; an agent inspects by reading the command files at the locations below.

> Two points that are often misunderstood: nested command names join with a **colon** (`review/code.md` becomes `/review:code`, not `/review/code`); and a command is a `.md` file whose **file name is the command name**.

## 1. Discovery order (earlier locations take precedence)

1. Explicitly configured roots
2. User `~/.zcode/commands`
3. User `~/.agents/commands`
4. Workspace `.zcode/commands` (from the current directory up to the repository root; every level counts)
5. Workspace `.agents/commands`
6. Enabled **plugin** command roots (lowest precedence)

Within a level, `.zcode` is scanned before `.agents`. Subdirectories are scanned recursively, and a nested path joins into the command name with a colon.

## 2. Deduplication rule (first match wins)

The key is the **normalized command name** (the relative path with `.md` removed, separators replaced by `:`, lowercased). The **first occurrence — the highest-precedence location — wins**: user overrides workspace, `.zcode` overrides `.agents`, and local files override plugins. Duplicates are ignored.

There is also an **interactive-surface-only** filter: a command whose name matches a built-in slash command (or `compress`) is filtered out of the live `/` menu, though it is still present on disk.

## 3. Command .md format

- The command name comes from the file name and must match `^[a-z0-9][a-z0-9_:-]{0,63}$` (lowercase alphanumeric start; no spaces, dots, or leading `-`/`_`; at most 64 characters). A violation drops the command.
- Frontmatter (a flat parser; indented lines are ignored) recognizes `description`, `argument-hint`, `allowed-tools`, `model`, `skills`, and `disable-noninteractive` (all hyphenated). An unknown key is ignored but the command still loads.
- **A description or a non-empty body is required** — otherwise the command is dropped. When `description` is absent, the first non-empty body line is used.
- Argument substitution: `$ARGUMENTS` is the full argument string; `$1`/`$2` are positional (out of range is empty). When arguments are supplied but no placeholder is present, they are appended under a "User arguments:" heading.
- `skills` are auto-mounted. Inline dynamic shell (`` !`cmd` `` or a fenced `!` block) is rejected.

## 4. How to inspect commands

- **In the client**: type **`/`** in the input box and open the **Commands** group; you can search by keyword. Each entry shows its name and description.
- **As an agent**: read the `.md` files at each location in discovery order. Derive each command's name from its path (subdirectories become `:`), and remember that for a same-named command the **first** in discovery order is the one that runs.

## 5. Common pitfalls (symptom → cause → fix)

1. **Missing — wrong directory** — the `.md` is not under a scanned root (for example a singular `.zcode/command/`, or above the repository root). → Move it into `~/.zcode/commands/` or `<repo>/.zcode/commands/`.
2. **Missing — invalid name** — the file exists but no command appears. The file name violates the pattern (uppercase, spaces, dots, leading `-`/`_`, or over 64 characters). → Rename to a valid lowercase name; namespace with subdirectories (which become `:`), not dots.
3. **Overridden by a higher-precedence duplicate** — a different command runs, or your edits have no effect. First match wins. → Find the higher-precedence copy in discovery order and rename or remove it. Local files always beat plugins.
4. **Frontmatter parse error** — a key is silently missing. The flat parser reads only single-line top-level keys; indented lines and multi-line arrays are dropped. → Keep every value on one line; write lists inline, e.g. `allowed-tools: Read, Bash`.
5. **Empty command is dropped** — both the description and the body are empty. → Add a `description:` or at least one non-empty body line.
6. **Unknown frontmatter key (misspelling)** — `model`/`skills`/`allowed-tools` have no effect. → Use the hyphenated keys: `allowed-tools` (not `allowed_tools`), `argument-hint`, `disable-noninteractive`.
7. **`$ARGUMENTS`/`$1` does not substitute** — the placeholder appears literally or is empty. The body has no placeholder (arguments are appended under "User arguments:" by design), `$1` is out of range, or a form like `${ARGUMENTS}` is not recognized. → Use the exact `$ARGUMENTS`/`$1` tokens.
8. **Dynamic shell is rejected** — running the command reports an unsupported shell expansion. The body contains `` !`...` `` or a fenced `!` block. → Remove it; use static text or `$ARGUMENTS`.
9. **A plugin command is missing** — a disabled plugin contributes no command roots, or a local same-named file is shadowing it. → Enable the plugin in **Settings → Plugin Management**, and ensure no local duplicate shadows it.
10. **Disabled by configuration** — a valid command silently disappears. The configuration disables it by the command file's absolute path (not the command name). → Set that path's `enable` to `true` or remove it.
11. **`/` versus `:` confusion** — `/review/code` reports not found although `review/code.md` exists. Subdirectories map to `:`, so the real name is `review:code`. → Invoke `/review:code`.
12. **Reserved-name collision (interactive only)** — the command exists on disk but cannot be triggered in the live `/` menu, because its name matches a built-in slash command or `compress`. → Rename to a non-reserved name.

## 6. Localization workflow (in order)

1. **Is it in the `/` menu?** Open the Commands group. Absent → step 2. Present but the wrong content runs → step 4 (a duplicate).
2. **Confirm the file and its root.** Ensure the `.md` sits directly under a scanned commands root for the current working directory — pitfall 1 — and that its name is valid — pitfall 2.
3. **Check the frontmatter.** A missing/garbled key points to the flat-parser rules (pitfall 4) or an empty command (pitfall 5); a key with no effect is likely a misspelling (pitfall 6).
4. **Resolve a duplicate.** For a given name, the winner is the first in discovery order; find and rename or remove the copy you do not want.
5. **Check the body.** Verify the argument placeholders (pitfall 7) and that there is no rejected dynamic shell (pitfall 8).
6. **Still missing with no obvious cause?** Check for a configuration disable (pitfall 10, by absolute file path), a disabled plugin (pitfall 9), or reserved-name filtering (pitfall 12).
