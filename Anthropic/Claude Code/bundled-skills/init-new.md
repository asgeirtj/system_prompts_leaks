---
name: init
description: Initialize a new CLAUDE.md file with codebase documentation.
---

Set up a minimal CLAUDE.md (and optionally skills and hooks) for this repo. CLAUDE.md is loaded into every Claude Code session, so it must be concise — only include what Claude would get wrong without it.

## Phase 0: Check for an existing CLAUDE.md

Before asking anything, check if CLAUDE.md already exists at the project root (just `cat ./CLAUDE.md` — only the project-root file counts; don't explore the tree yet). This branches Phase 1.

## Phase 1: Ask what to set up

Use AskUserQuestion to find out what the user wants. Which question you ask depends on Phase 0. Call AskUserQuestion with **only Q1** — do NOT include Q2 in the same call. Only ask Q2 after you've seen the Q1 answer, since "Let Claude decide" skips it.

Before the first question, print this primer as normal assistant text so first-time users know the terms:

> Quick context:
> - **CLAUDE.md** files give Claude persistent instructions for a project, your personal workflow, or your organization. Claude reads them at the start of every session.
> - **Skills** are packaged instructions Claude invokes automatically when a task matches, or that you trigger with a slash command (e.g. `/frontend-design`, `/commit-push-pr`).
> - **Hooks** allow you to run shell commands automatically on lifecycle events: get notified when Claude is blocked on your input, auto-format after edits, enforce checks before commits — these are deterministic and Claude can't skip them.

**If CLAUDE.md already exists**, ask:
- "I found an existing CLAUDE.md. What would you like to do?"
  Options: "Review and improve it" | "Leave it, set up other things" | "Start fresh (replace it)"
  Description for improve: "Explore what's changed in the codebase and propose targeted edits to the existing file."
  Description for leave it: "Skip CLAUDE.md. Go straight to skills and hooks."
  Description for start fresh: "Discard it and write new file(s)."
  Routing:
  - "Review and improve" → skip Q1/Q2; explore (Phase 2), ask the single Phase 3-lite question, then go to Phase 4's diff-proposal, then Phase 8.
  - "Leave it" → skip Q1, ask Q2 (rename its fourth option to "Neither — skip setup"). If they pick "Neither — skip setup", jump straight to Phase 8 with: "Nothing to set up — your CLAUDE.md is unchanged." Otherwise: Phase 2 → Phase 3 proposal (no gap-fill interview) → Phases 6/7 per queue → Phase 8. For Phase 7's hook target-file default, treat this path as "project" (`.claude/settings.json`).
  - "Start fresh" → continue to Q1 below as if no file existed.

**If no CLAUDE.md exists** (or the user picked "Start fresh"), ask:
- Q1: "Which CLAUDE.md files should /init set up?"
  Options: "Project CLAUDE.md" | "Personal CLAUDE.local.md" | "Both project + personal" | "Let Claude decide"
  Description for project: "Team-shared instructions checked into source control — architecture, coding standards, common workflows."
  Description for personal: "Your private preferences for this project (gitignored, not shared) — your role, sandbox URLs, preferred test data, workflow quirks."
  Description for Let Claude decide: "Fastest path — project CLAUDE.md plus whatever skills or hooks fit this repo. No follow-on questions; you'll approve everything before it's written."
  If the user picks "Let Claude decide", skip Q2 — treat it as project CLAUDE.md with no skills/hooks constraint.

- Q2: "Also set up skills and hooks?"
  Options: "Skills + hooks" | "Skills only" | "Hooks only" | "Neither, just CLAUDE.md"
  Description for skills: "Packaged instructions Claude invokes automatically when a task matches, or that you trigger with a slash command (e.g. `/frontend-design`, `/commit-push-pr`)."
  Description for hooks: "Deterministic shell commands that run on tool events (e.g., format after every edit). Claude can't skip them."
  Q2 is a hint, not a filter — Phase 3 proposes what fits the codebase and notes any deviation.

## Phase 2: Explore the codebase

Launch a subagent to survey the codebase, and ask it to read key files to understand the project: manifest files (package.json, Cargo.toml, pyproject.toml, go.mod, pom.xml, etc.), README, Makefile/build configs, CI config, existing CLAUDE.md, .claude/rules/, AGENTS.md, .cursor/rules or .cursorrules, .github/copilot-instructions.md, .windsurfrules, .clinerules, .mcp.json.

Detect:
- Build, test, and lint commands (especially non-standard ones)
- Languages, frameworks, and package manager
- Project structure (monorepo with workspaces, multi-module, or single project)
- Code style rules that differ from language defaults
- Non-obvious gotchas, required env vars, or workflow quirks
- Existing .claude/skills/ and .claude/rules/ directories
- Formatter configuration (prettier, biome, ruff, black, gofmt, rustfmt, or a unified format script like `npm run format` / `make fmt`)
- Git worktree usage: run `git worktree list` to check if this repo has multiple worktrees (only relevant if the user wants a personal CLAUDE.local.md)

Note what you could NOT figure out from code alone — these become interview questions.

## Phase 3: Fill in the gaps

Use AskUserQuestion to gather what you still need to write good CLAUDE.md files and skills. Ask only things the code can't answer.

If the user chose project CLAUDE.md, both, or "Let Claude decide": ask about codebase practices — non-obvious commands, gotchas, branch/PR conventions, required env setup, testing quirks. Skip things already in README or obvious from manifest files. Do not mark any options as "recommended" — this is about how their team works, not best practices.

If the user chose personal CLAUDE.local.md or both: ask about them, not the codebase. Do not mark any options as "recommended" — this is about their personal preferences, not best practices. Examples of questions:
  - What's their role on the team? (e.g., "backend engineer", "data scientist", "new hire onboarding")
  - How familiar are they with this codebase and its languages/frameworks? (so Claude can calibrate explanation depth)
  - Do they have personal sandbox URLs, test accounts, API key paths, or local setup details Claude should know?
  - Only if Phase 2 found multiple git worktrees: ask whether their worktrees are nested inside the main repo (e.g., `.claude/worktrees/<name>/`) or siblings/external (e.g., `../myrepo-feature/`). If nested, the upward file walk finds the main repo's CLAUDE.local.md automatically — no special handling needed. If sibling/external, the personal content should live in a home-directory file (e.g., `~/.claude/<project-name>-instructions.md`) and each worktree gets a one-line CLAUDE.local.md stub that imports it: `@~/.claude/<project-name>-instructions.md`. Never put this import in the project CLAUDE.md — that would check a personal reference into the team-shared file.
  - Any communication preferences? (e.g., "be terse", "always explain tradeoffs", "don't summarize at the end")

If the user picked "Review and improve" in Phase 0: ask just one question — "Has anything changed about how the team works since this CLAUDE.md was written (new conventions, commands, gotchas)?" with options "No, nothing's changed" | "Yes — let me describe". If they pick Yes, ask what changed (free text) before continuing. Then skip to Phase 4.

**Synthesize a proposal from Phase 2 findings and the gap-fill answers.** For each item, pick the artifact type that fits the evidence:

  - **Hook** — deterministic, fast, per-edit shell command (formatting, linting a changed file).
  - **Skill** — on-demand multi-step workflow (`/verify`, `/deploy-staging`, session reports).
  - **CLAUDE.md note** — guidance that shapes behavior but isn't enforced (conventions, communication style).

Include the CLAUDE.md file(s) implied by Q1 (project, personal, both, or "Let Claude decide" → project) as the first bullet(s) of the proposal, with a one-line summary of what each will cover. Then list skills/hooks/notes. On the "Leave it" path, omit CLAUDE.md file bullets and notes (Phase 4 won't run). On the "Start fresh" path with Q1 = personal-only, add a bullet noting the existing project CLAUDE.md will be left untouched (they chose not to replace it with a project file).

Propose what fits. If the user gave a Q2 hint and your proposal deviates from it (e.g. they said "Hooks only" but nothing hook-shaped exists), say so in one line at the top of the proposal and propose the better-fitting artifacts anyway.

**Print the proposal as normal assistant text**, one bullet per item:

> Here's what I'd set up:
> • **[Artifact type: file/hook/skill/note]** — [one-line description]
> • …

Then call AskUserQuestion with a simple question ("Does this look right?") and options like "Looks good — proceed" | "Drop the hook" | "Drop the skill". Don't use the `preview` field — the proposal is already visible in scrollback. The tool auto-adds an "Other" option for custom tweaks.

**Build the preference queue** from the accepted proposal. Each entry: {type: hook|skill|note, description, target file, any Phase-2-sourced details like the actual test/format command}. Phase 6 and Phase 7's hooks sub-bullet consume this queue; Phases 4/5 gate on the approved proposal's file bullets directly; Phase 7's GitHub-CLI and linting checks run regardless of queue contents.

## Phase 4: Write CLAUDE.md (if the approved proposal includes it, or on the "Review and improve" path)

Write a minimal CLAUDE.md at the project root. Every line must pass this test: "Would removing this cause Claude to make mistakes?" If no, cut it.

If the user picked "Review and improve it" in Phase 0: don't write fresh — read the existing file, compare against Phase 2 findings and the Phase 3-lite answer, and propose specific additions/removals as diffs with a one-line reason for each. The existing file is the baseline; your job is to catch what's missing, outdated, or bloated. After printing the diffs, call AskUserQuestion ("Apply these edits?" with options like "Apply all" | "Let me pick which" | "Skip — leave it as is") before writing anything.

**Consume `note` entries from the Phase 3 preference queue whose target is CLAUDE.md** (team-level notes) — add each as a concise line in the most relevant section. These are the behaviors the user wants Claude to follow but didn't need guaranteed (e.g., "propose a plan before implementing", "explain the tradeoffs when refactoring"). Leave personal-targeted notes for Phase 5.

Include:
- Build/test/lint commands Claude can't guess (non-standard scripts, flags, or sequences)
- Code style rules that DIFFER from language defaults (e.g., "prefer type over interface")
- Testing instructions and quirks (e.g., "run single test with: pytest -k 'test_name'")
- Repo etiquette (branch naming, PR conventions, commit style)
- Required env vars or setup steps
- Non-obvious gotchas or architectural decisions
- Important parts from existing AI coding tool configs if they exist (AGENTS.md, .cursor/rules, .cursorrules, .github/copilot-instructions.md, .windsurfrules, .clinerules)

Exclude:
- File-by-file structure or component lists (Claude can discover these by reading the codebase)
- Standard language conventions Claude already knows
- Generic advice ("write clean code", "handle errors")
- Detailed API docs or long references — use `@path/to/import` syntax instead (e.g., `@docs/api-reference.md`) to inline content on demand without bloating CLAUDE.md
- Information that changes frequently — reference the source with `@path/to/import` so Claude always reads the current version
- Long tutorials or walkthroughs (move to a separate file and reference with `@path/to/import`, or put in a skill)
- Commands obvious from manifest files (e.g., standard "npm test", "cargo test", "pytest")

Be specific: "Use 2-space indentation in TypeScript" is better than "Format code properly."

Do not repeat yourself and do not make up sections like "Common Development Tasks" or "Tips for Development" — only include information expressly found in files you read.

Prefix the file with:

```
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
```

For projects with multiple concerns, suggest organizing instructions into `.claude/rules/` as separate focused files (e.g., `code-style.md`, `testing.md`, `security.md`). These are loaded automatically alongside CLAUDE.md and can be scoped to specific file paths using `paths` frontmatter.

For projects with distinct subdirectories (monorepos, multi-module projects, etc.): mention that subdirectory CLAUDE.md files can be added for module-specific instructions (they're loaded automatically when Claude works in those directories). Offer to create them if the user wants.

## Phase 5: Write CLAUDE.local.md (if the approved proposal includes it)

Write a minimal CLAUDE.local.md at the project root. This file is automatically loaded alongside CLAUDE.md. After creating it, add `CLAUDE.local.md` to the project's .gitignore so it stays private.

**Consume `note` entries from the Phase 3 preference queue whose target is CLAUDE.local.md** (personal-level notes) — add each as a concise line. If the user chose personal-only in Phase 1, this is the sole consumer of note entries.

Include:
- The user's role and familiarity with the codebase (so Claude can calibrate explanations)
- Personal sandbox URLs, test accounts, or local setup details
- Personal workflow or communication preferences

Keep it short — only include what would make Claude's responses noticeably better for this user.

If Phase 2 found multiple git worktrees and the user confirmed they use sibling/external worktrees (not nested inside the main repo): the upward file walk won't find a single CLAUDE.local.md from all worktrees. Write the actual personal content to `~/.claude/<project-name>-instructions.md` and make CLAUDE.local.md a one-line stub that imports it: `@~/.claude/<project-name>-instructions.md`. The user can copy this one-line stub to each sibling worktree. Never put this import in the project CLAUDE.md. If worktrees are nested inside the main repo (e.g., `.claude/worktrees/`), no special handling is needed — the main repo's CLAUDE.local.md is found automatically.

If CLAUDE.local.md already exists: read it, propose specific additions, and do not silently overwrite.

## Phase 6: Suggest and create skills (if the approved proposal includes any)

Skills add capabilities Claude can use on demand without bloating every session.

**First, consume `skill` entries from the Phase 3 preference queue.** Each queued skill preference becomes a SKILL.md tailored to what the user described. For each:
- Name it from the preference (e.g., "verify-deep", "session-report", "deploy-sandbox")
- Write the body using the user's own words from the interview plus whatever Phase 2 found (test commands, report format, deploy target). If the preference maps to an existing bundled skill (e.g., `/verify`), write a project skill that adds the user's specific constraints on top — tell the user the bundled one still exists and theirs is additive.
- Ask a quick follow-up if the preference is underspecified (e.g., "which test command should verify-deep run?")

**Then suggest additional skills** beyond the queue when you find:
- Reference knowledge for specific tasks (conventions, patterns, style guides for a subsystem)
- Repeatable workflows the user would want to trigger directly (deploy, fix an issue, release process, verify changes)

For each suggested skill, provide: name, one-line purpose, and why it fits this repo.

If `.claude/skills/` already exists with skills, review them first. Do not overwrite existing skills — only propose new ones that complement what is already there.

Create each skill at `.claude/skills/<skill-name>/SKILL.md`:

```yaml
---
name: <skill-name>
description: <what the skill does and when to use it>
---

<Instructions for Claude>
```

Both the user (`/<skill-name>`) and Claude can invoke skills by default. For workflows with side effects (e.g., `/deploy`, `/fix-issue 123`), add `disable-model-invocation: true` so only the user can trigger it, and use `$ARGUMENTS` to accept input.

## Phase 7: Suggest additional optimizations

Tell the user you're going to suggest a few additional optimizations now that CLAUDE.md and skills (if chosen) are in place.

Check the environment and ask about each gap you find (use AskUserQuestion):

- **GitHub CLI**: Run `which gh` (or `where gh` on Windows). If it's missing AND the project uses GitHub (check `git remote -v` for github.com), ask the user if they want to install it. Explain that the GitHub CLI lets Claude help with commits, pull requests, issues, and code review directly.

- **Linting**: If Phase 2 found no lint config (no .eslintrc, ruff.toml, .golangci.yml, etc. for the project's language), ask the user if they want Claude to set up linting for this codebase. Explain that linting catches issues early and gives Claude fast feedback on its own edits.

- **Proposal-sourced hooks** (if the approved proposal includes any): Consume `hook` entries from the Phase 3 preference queue. If Phase 2 found a formatter and the queue has no formatting hook, offer format-on-edit as a fallback.

  For each hook preference (from the queue or the formatter fallback):

  1. Target file: default based on the Phase 1 CLAUDE.md choice — project → `.claude/settings.json` (team-shared, committed); personal → `.claude/settings.local.json`. Only ask if the user chose "both" in Phase 1 or the preference is ambiguous. Ask once for all hooks, not per-hook.

  2. Pick the event and matcher from the preference:
     - "after every edit" → `PostToolUse` with matcher `Write|Edit`
     - "when Claude finishes" / "before I review" → `Stop` event (fires at the end of every turn — including read-only ones)
     - "before running bash" → `PreToolUse` with matcher `Bash`
     - "before committing" (literal git-commit gate) → **not a hooks.json hook.** Matchers can't filter Bash by command content, so there's no way to target only `git commit`. Route this to a git pre-commit hook (`.git/hooks/pre-commit`, husky, pre-commit framework) instead — offer to write one. If the user actually means "before I review and commit Claude's output", that's `Stop` — probe to disambiguate.
     Probe if the preference is ambiguous.

  3. **Load the hook reference** (once per `/init` run, before the first hook): invoke the Skill tool with `skill: 'update-config'` and args starting with `[hooks-only]` followed by a one-line summary of what you're building — e.g., `[hooks-only] Constructing a PostToolUse/Write|Edit format hook for .claude/settings.json using ruff`. This loads the hooks schema and verification flow into context. Subsequent hooks reuse it — don't re-invoke.

  4. Follow the skill's **"Constructing a Hook"** flow: dedup check → construct for THIS project → pipe-test raw → wrap → write JSON → `jq -e` validate → live-proof (for `Pre|PostToolUse` on triggerable matchers) → cleanup → handoff. Target file and event/matcher come from steps 1–2 above.

  Act on each "yes" before moving on.

## Phase 8: Summary and next steps

Recap what was set up — which files were written and the key points included in each. Remind the user these files are a starting point: they should review and tweak them, and can run `/init` again anytime to re-scan.

Then tell the user that you'll be introducing a few more suggestions for optimizing their codebase and Claude Code setup based on what you found. Present these as a single, well-formatted to-do list where every item is relevant to this repo. Put the most impactful items first.

When building the list, work through these checks and include only what applies:
- If frontend code was detected (React, Vue, Svelte, etc.): `/plugin install frontend-design@claude-plugins-official` gives Claude design principles and component patterns so it produces polished UI; `/plugin install playwright@claude-plugins-official` lets Claude launch a real browser, screenshot what it built, and fix visual bugs itself.
- If you found gaps in Phase 7 (missing GitHub CLI, missing linting) and the user said no: list them here with a one-line reason why each helps.
- If tests are missing or sparse: suggest setting up a test framework so Claude can verify its own changes.
- To help you create skills and optimize existing skills using evals, Claude Code has an official skill-creator plugin you can install. Install it with `/plugin install skill-creator@claude-plugins-official`, then run `/skill-creator <skill-name>` to create new skills or refine any existing skill. (Always include this one.)
- Browse official plugins with `/plugin` — these bundle skills, agents, hooks, and MCP servers that you may find helpful. You can also create your own custom plugins to share them with others. (Always include this one.)
