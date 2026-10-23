---
name: diagnosing-skills
description: Use to diagnose and fix ZCode skill configuration problems in the ZCode client. Applies when a skill is not discovered, is installed but does not trigger automatically, is shadowed by a higher-precedence skill of the same name, is disabled by configuration, has a SKILL.md frontmatter error, fails to load because its description is too long, or disappears because the plugin providing it is disabled. Provides the discovery order, how to inspect skills in the client, common pitfalls, and a step-by-step localization and repair workflow.
---

# Diagnosing Skill Configuration

Goal: reduce any skill problem to a single concrete fix. A skill "loading successfully" and a skill "triggering" are two different things — distinguish them first.

A person inspects skills in **Settings → Skills** and the **`/` menu** (the Skills group); an agent inspects by reading the skill files at the locations below.

## 1. Discovery order (earlier locations take precedence)

1. Explicitly configured roots
2. User `~/.zcode/skills`
3. User `~/.agents/skills`
4. Workspace `.zcode/skills` (from the current directory up to the repository root; every level counts, and a deeper location wins)
5. Workspace `.agents/skills`
6. Enabled **plugin** roots (lowest precedence)

Within a level, `.zcode` is scanned before `.agents`. A skill's identity is its **file path**, so same-named skills at different paths are **all discovered**, but only the first in discovery order is loaded — higher-precedence copies shadow the rest. Directories beginning with `.` (except `.system`) and `node_modules` are skipped.

## 2. SKILL.md format (two-tier failure model)

A skill is a directory containing a `SKILL.md`. Frontmatter is a `---`-delimited block of flat `key: value` lines (indented keys are ignored; use `>` or `|` for multi-line values). The recognized keys are `name`, `description`, `when_to_use`, `license`, and `metadata`.

**Fails to load (the skill is dropped)**: frontmatter is present but `name` is missing, `description` is missing, or `description` exceeds 1024 characters.

**Loads but may not trigger**: no frontmatter at all — `name` defaults to the directory name and `description` is empty, leaving the model nothing to match on; a malformed line is skipped.

**Triggering**: a skill's `name`, `description` (truncated to ~250 characters), and `when_to_use` are presented to the model, which decides on its own whether to invoke the skill. There is no keyword matcher — **a description that clearly states "when to use this" is what makes a skill discoverable to the model.**

## 3. How to inspect skills

- **In the client**: **Settings → Skills** lists every discovered skill and its group, including a **Plugin Skills** group for plugin-provided ones. In the input box, type **`/`** and open the **Skills** group to see what is available and search by keyword.
- **As an agent**: read the `SKILL.md` at each location in discovery order. The file that would actually load is the **first** one whose frontmatter `name` (or the plugin's `plugin:skill` qualified name) matches — if that is not the file you edited, you have found a shadow.

## 4. Common pitfalls (symptom → cause → fix)

1. **Not discovered — wrong directory** — absent from the Skills list. It is not directly under a discovery root, or the file is not named `SKILL.md` (case-sensitive on Linux). → Move the skill directory under a real root: `~/.zcode/skills/<name>/SKILL.md` or `<repo>/.zcode/skills/<name>/SKILL.md`.
2. **Skipped inside a dot-directory** — a skill under, for example, `~/.zcode/skills/.foo/` never appears. Directories beginning with `.` (except `.system`) are excluded. → Rename to remove the leading `.`.
3. **Not triggering — weak or empty description** — it appears but the model never invokes it. Without frontmatter the description is empty, and it is truncated to ~250 characters when presented. → Add a frontmatter `description` and `when_to_use`, front-loading the trigger wording within the first ~250 characters.
4. **Shadowed by a higher-precedence skill of the same name** — your edits have no effect. On load the first same-named skill wins; user overrides workspace overrides plugin, and a deeper working-directory location overrides the repository root. → Find the higher-precedence copy in discovery order and rename or remove it.
5. **Disabled by configuration** — a known-good skill disappears entirely. The configuration disables it by absolute path. → In `~/.zcode/cli/config.json` (or the workspace `.zcode/config.json`), set that path's `enable` to `true` or remove the override.
6. **Frontmatter parse error or wrong shape** — `name`/`description` missing or garbled. The parser reads only top-level scalars; indented keys are ignored, and multi-line values need `>` or `|`. → Keep `name`/`description` as top-level scalars and use `description: >` with an indented continuation for long text.
7. **Missing SKILL.md** — the directory exists but the skill never appears. → Ensure the file is named exactly `SKILL.md`.
8. **Description too long (over 1024 characters)** — the skill is dropped. → Trim `description` under 1024 characters and move detail into the body.
9. **An `.agents` copy is shadowed by a same-named `.zcode` copy** — it is discovered but the `.zcode` copy is what loads, because `.zcode` is scanned first within a level. → Remove the `.zcode` duplicate or rename one.
10. **A plugin skill disappears because the plugin is disabled or suppressed** — a disabled plugin contributes no skill roots. → Enable the plugin in **Settings → Plugin Management**, or remove it from the suppressed-built-ins list.
11. **Path-versus-name confusion** — a skill is invoked by `name` or `plugin:skill`, not by file path and not with a leading `/`. → Reference the exact name.
12. **The whole skill subsystem is off** — no skills appear and the skill tool reports it is not configured. The skill feature or `skills.enabled` is false. → Set both to `true` (both default to true).

## 5. Localization workflow (in order; stop when the cause is found)

1. **Is the subsystem on?** In `~/.zcode/cli/config.json` (and the workspace file) confirm the skill feature and `skills.enabled`; either being false disables discovery — pitfall 12.
2. **Is it discovered at all?** Check **Settings → Skills**, and read the skill files from the **same working directory the session runs in** (discovery is relative to it). Absent entirely → pitfalls 1, 2, 5, 7, 10, or 12.
3. **Check for load failures.** A skill present on disk but not listed usually has a frontmatter problem: missing `name`/`description`, an over-long `description`, or a malformed frontmatter line — pitfalls 6 and 8.
4. **Which file actually wins?** Walk the discovery order for the name and compare the first matching `SKILL.md` to the file you edited. A mismatch means shadowing — pitfalls 4 and 9.
5. **Is it disabled?** Look in both configuration files for the skill's absolute path with `enable: false`.
6. **A plugin skill?** If the name is `plugin:skill`, confirm the plugin is enabled and not suppressed.
7. **Discovered but will not trigger?** Inspect the `description`/`when_to_use`; empty or overly long/truncated → pitfall 3.
