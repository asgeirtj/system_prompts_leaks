---
name: create-plugin
description: Create and validate a new native Muse plugin package in the current workspace. Use ONLY when the user explicitly asks to create a Muse plugin or invokes the create-plugin skill. Do NOT use for application/library plugin classes, third-party plugin systems, or ordinary code changes.
---

# Create Plugin

Create one new native Muse plugin in the current workspace. Use this skill only
for Muse native plugin package creation, not for implementing plugin classes or
plugin features inside another project. Produce the
smallest complete plugin that satisfies the request, validate it with the installed
muse CLI, and leave installation to the user.

## Boundaries

- Work only in one new destination inside the current workspace.
- Never modify, merge into, delete, or replace an existing path.
- Do not install, enable, trust, execute, or fetch the generated plugin or its
  dependencies.
- Do not update an existing plugin. Explain that update behavior needs a separate
  workflow.
- Do not publish or write global configuration.
- Ask before writing when the plugin ID, destination, requested capability, or
  required command is unclear.
- Reject unsupported capability families instead of inventing a schema.

The supported capability families are exactly `skills`, `commands`, `hooks`,
`mcpServers`, and `reminders`. Reject `tools`, `agents`, `outputStyles`, `settings`,
and `apps`. A custom model tool belongs behind an `mcpServers` entry, not a direct
`tools` capability.

## Optional References

This skill is complete without its references. If `read_skill` returned a physical
`SKILL.md` path and more detail would help, use `read_file` to inspect these siblings:

- `references/native-plugin-contract.md`
- `references/capability-examples.json`

Treat them as read-only guidance. Do not fail merely because a reference was not
read.

## Clarify First

Before tools, determine:

1. the portable plugin ID and human display name;
2. the destination relative to the current workspace;
3. the requested capability families and IDs;
4. every required artifact and command;
5. whether the request would require an unsupported family, dependency fetch, or
   modification of an existing path.

Ask a focused question for missing facts. Refuse before mutation when the request is
outside this skill's boundaries.

## Portable IDs And Paths

Plugin and capability IDs must:

- contain 1 through 80 ASCII bytes;
- begin with a lowercase ASCII letter or digit;
- use only lowercase ASCII letters, digits, `.`, `_`, and `-` afterward;
- not have a case-insensitive basename before the first dot equal to `CON`, `PRN`,
  `AUX`, `NUL`, `COM1` through `COM9`, or `LPT1` through `LPT9`;
- not use a product-reserved plugin ID: `loop` or `muse-core`.

Artifact paths must be relative UTF-8 paths beneath the plugin root. Manifest paths
use `/`. Reject absolute paths, `..`, backslashes in manifest values, symlink
escapes, and any path whose canonical parent leaves the current workspace.

## Required Manifest Base

Start from this native manifest shape and fill only requested capabilities:

```json
{
  "schemaVersion": 1,
  "name": "<portable-id>",
  "displayName": "<human name>",
  "version": "0.1.0",
  "description": "<plain description>",
  "compat": {
    "source": "native",
    "manifestDir": ".muse-plugin"
  },
  "capabilities": {
    "skills": [],
    "commands": [],
    "hooks": [],
    "mcpServers": [],
    "reminders": []
  }
}
```

The manifest lives at `.muse-plugin/plugin.json`. Keep empty capability arrays
unless the installed validator accepts their omission with zero diagnostics.

For each requested capability, create every path referenced by the manifest:

- `skills`: `{id, path, enabledDefault?}` and a UTF-8 `SKILL.md` with valid
  frontmatter;
- `commands`: `{id, path, enabledDefault?}` and a UTF-8 Markdown template;
- `hooks`: `{id, event, command, timeoutMs?, statusMessage?}` and any relative
  command source named by its argv;
- `mcpServers`: a stdio `{id, transport?, command}` or HTTP
  `{id, transport:"http", url}` entry and any relative command source named by its
  argv;
- `reminders`: `{id, path, tools?, blocking?, decision, defaultPriority?,
  maxPriority?, maxChildSteps?, maxInstallsPerRun?, reasoningEffort?, context?}`
  and a UTF-8 duty file. Use the executable decision object, including its V1
  `envelope` and `deliveryRole`, from `references/capability-examples.json`.

## Reserve The Destination

No artifact write may occur before all reservation steps succeed:

1. Resolve the current workspace and requested parent to canonical paths.
2. Require the parent and proposed destination to remain inside the workspace.
3. Reject a symlinked destination or a parent whose canonical identity escapes.
4. Confirm the destination does not exist.
5. Through the managed shell tool advertised by this session, use one
   platform-native atomic no-replace directory creation operation. Do not use a
   check-then-overwrite command.
6. If creation reports occupied or fails, stop. Never delete or reuse the path.
7. Canonicalize the new directory and its parent again. Require the same expected
   identity and workspace containment before the first `write_file` call.

Use `write_file` and `edit_file` for UTF-8 artifacts. Do not use shell redirection
to bypass file-tool containment. After reservation, mutate only the new directory.

## Validate And Correct

Validate every generated skill directory first. Invoke the installed program with
the equivalent structured argv. This is the `muse skills validate` operation;
keep its arguments structured:

```json
["muse", "skills", "validate", "<skill-directory>", "--json"]
```

Then run the `muse plugins validate` operation with structured arguments:

```json
["muse", "plugins", "validate", "<plugin-directory>", "--json"]
```

A validation result is clean only when the process starts, exits zero, stdout is
parseable JSON, top-level `valid` is `true`, and `diagnostics` is present and empty.
Warnings are not clean. A missing command, malformed JSON, timeout, denial,
cancellation, non-zero exit, `valid:false`, or any diagnostic leaves the draft
incomplete.

For each validation layer, make at most three correction rounds after its first
failed result. Edit only the new draft and rerun the same layer. The fourth failed
result is terminal for that layer. Never continue to whole-plugin validation while
a nested skill is invalid.

## Report

On success, report:

- the canonical artifact path;
- the capability and file inventory;
- the number and outcome of nested skill validations;
- the whole-plugin validation outcome;
- an unexecuted install proposal as structured `program` and `argv` values:

```json
{
  "program": "muse",
  "argv": ["plugins", "install", "<canonical-plugin-path>"],
  "executed": false
}
```

Explicitly state that installation was not run.

On failure or denial after reservation, report the draft path, exact failed
operation, remaining diagnostics, and checks not completed. Do not claim the draft
is created, valid, complete, or ready to install. Cancellation ends the run without
a later report; preserve all pre-existing bytes and let runtime cancellation remain
authoritative.
