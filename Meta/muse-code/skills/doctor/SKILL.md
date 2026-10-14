---
name: doctor
description: Diagnose Muse Code product/runtime issues from installed binary evidence. Use ONLY when the user explicitly invokes the doctor skill, asks to debug/troubleshoot Muse Code itself, asks what happened earlier in the current Muse Code session, or explicitly selects an earlier Muse Code session. Do NOT use for ordinary repository code failures or history, benchmark tasks, implementation debugging, build/test hangs, or third-party project issues.
---

# Diagnose

Diagnose Muse Code as an installed product. Use this skill only when the user
explicitly invokes `doctor` or clearly asks to debug/troubleshoot Muse Code
itself from binary/runtime evidence. Assume the user has the binary, not the
source tree. Help them understand how the app works, collect the smallest safe
evidence set, identify the likely failing layer, and give the next safe action.

## Scope

- Use this skill ONLY when the user explicitly invokes `doctor`, asks to use
  the doctor skill, or clearly asks to debug/troubleshoot broken Muse Code
  product behavior: app, CLI, TUI, desktop, crash, provider/model, settings,
  auth, trust, skills, plugins, MCP, session, resume, export, trace, approvals,
  sandbox, update, or unexpected output.
- Use this skill when the user asks how Muse Code itself works, where Muse Code
  stores state, what a Muse Code log/session/trace means, or how to collect a
  Muse Code support bundle.
- Use this skill when the user asks what happened earlier in the current
  Muse Code session or explicitly selects an earlier Muse Code session for
  evidence. This does not include ordinary repository history or an unspecified
  third-party agent session.
- Do NOT use this skill for ordinary repository engineering: code
  implementation, third-party project bugs, benchmark/eval tasks, build or test
  failures, command hangs, toolchain issues, CI failures, or local debugging
  inside a non-Muse Code codebase. Handle those with the normal engineering
  workflow unless the evidence points to Muse Code itself.
- Treat the user as a product user first, not as a repository engineer.
- For pure settings questions or explicitly requested settings edits with no
  product failure to investigate, use the `manage-settings` skill instead;
  Diagnose reads settings only as evidence for a failure it is investigating.
- Do not create issues, branches, commits, PRs, install/enable/disable skills or
  plugins, change settings/auth/trust, upload logs, run live-provider/network
  checks, or edit code unless the user explicitly asks.
- Do not print secrets, raw prompts, raw model payloads, auth tokens, API keys,
  cookies, bearer headers, or full session logs. Prefer redacted exports,
  key/value presence checks, and concise summaries.
- If a surface has no standalone app log, say so and use session logs, crash
  reports, trace inspection, or export evidence instead of inventing a path.

## Mental Model

Explain the relevant product path before asking for logs:

- The binary reads settings/auth/trust from the user's config directory and
  writes sessions, crashes, model catalog cache, and memory under the data
  directory.
- A Muse Code session is the main handle for resume, trace inspection, export,
  and support. Prefer a session id or session log path over screenshots of
  terminal output.
- Provider/auth failures are often config, environment, model catalog, network,
  or credential problems. Separate those before blaming the model.
- Skills/plugins/MCP are loaded product capabilities. Diagnose discovery,
  activation, trust, validation, and runtime errors separately.
- A trace/export explains what the binary saw and did. It is evidence, not a
  transcript to paste raw.

## Triage Questions

1. Name the failing surface and exact symptom.
2. Record the command, cwd, session id/path if provided, whether the user wants
   to inspect or continue that session, approximate time, provider/model if
   relevant, and whether the issue reproduces.
3. Ask for one missing handle only when it blocks a safe local check. Prefer:
   exact command, session id/path, time window, and whether they can reproduce.
4. If the user only wants an explanation, explain first and avoid running checks.

## Product Evidence Map

Collect the smallest read-only set that explains the issue. Adapt the map to the
symptom; do not run every row by default.

The config/data roots below are Muse Code's entire local state surface. A
config, log, or session file outside them is not Muse Code state —
never present one as the product's active configuration, logs, or session
evidence.
Variables such as `CODEX_HOME` matter only for explicitly requested
import/compat evidence and stay attributed to the product that owns them.

1. Build/provenance: `muse --version`; also note `command -v muse` when
   multiple copies may exist.
2. Config/data roots: `$XDG_CONFIG_HOME/muse` or `$HOME/.config/muse`;
   `$XDG_DATA_HOME/muse` or `$HOME/.local/share/muse`.
3. Local files: `settings.json`, `auth.json`, and `trust.json`; read settings
   when relevant, but report auth/trust presence and provider names only.
4. Data dirs: `sessions`, `memory`, `model-catalog`, and `crashes` under the
   data dir. For crashes, summarize report metadata and file path, not session
   content.
5. Session evidence: prefer `muse export --redacted --out <file>` for the
   latest workspace session, or `muse export --session <id-or-session.jsonl>
   --redacted --out <file>` when the user provides a handle.
6. Continuation handles: if the user provides a Muse Code session id and wants
   to continue that session, point them to `muse resume <session-id>` or
   `muse resume --last` for interactive continuation. Use
   `muse exec --session-id <session-id> "<follow-up>"` only on explicit
   request for headless continuation. Add `--allow-workspace-switch` to the
   `muse exec --session-id` command only after confirming the session
   belongs to another workspace; interactive `muse resume` does not take
   this flag. If an exit, fork, or handoff message printed
   `muse resume <session-id>`, treat that command as the canonical handle.
7. Trace evidence: use `muse trace inspect --session-log <session.jsonl>
   --render-mode compact`; add `--run-id <uuid>` or `--all-runs` for multi-run
   logs; use `--format json` only when structured analysis is needed.
8. User support bundle: use `/feedback` when available; otherwise prefer a
   redacted export, trace inspection, crash metadata, and concise reproduction
   steps.
9. Skills/plugins/MCP: use `muse skills list --enabled-only --json` and safe
   `muse plugins ... --help` or validation commands when the symptom points
   there.
10. Environment: check relevant non-secret variables by presence/value only, such
   as `MUSE_MODEL`, base-url variables with credentials redacted, XDG dirs,
   `CODEX_HOME` for import/compat issues, and telemetry variables by presence
   only.

## Use Current Session Evidence First

For a question about what happened earlier in the current Muse Code session,
use the sibling `scripts/session-evidence.py` helper before export or full trace
inspection. After `read_skill` gives the physical Diagnose package path, run:

```bash
python3 <doctor-skill-dir>/scripts/session-evidence.py --session-log <current-session.jsonl> --workspace "$PWD"
```

The runtime session-identity context already contains the exact current log
path. Do not ask the user for a path already present there, do not guess a
latest session, and do not search the session store first. A host may instead
provide `MUSE_CURRENT_SESSION_LOG`, in which case the helper can run without a
selector.

For an explicitly selected earlier Muse Code session, use the exact path or id:

```bash
python3 <doctor-skill-dir>/scripts/session-evidence.py --session-log <explicit-session.jsonl> --workspace "$PWD"
python3 <doctor-skill-dir>/scripts/session-evidence.py --session-id <explicit-session-id> --workspace "$PWD"
```

Both explicit earlier-session forms are current-workspace scoped and fail
closed on unknown workspace metadata, a mismatch, or ambiguity. Use `--kind`,
`--path`, `--tool`, `--run-id`, or sequence bounds to narrow follow-up evidence.
Projected events retain their source stream, and the default bound reserves
evidence for both the main session and child sessions so a busy child cannot
erase the parent timeline. Always compare durable actions with assistant claims,
especially across compaction and child activity. Use a
redacted export or compact trace only when this bounded projection is
insufficient. Never paste the raw session log into model context.

## Diagnose Live Session Ownership Safely

Use this path when resume says a session is already open or the original
terminal no longer accepts input:

1. Select the exact session first and run `scripts/session-evidence.py` as
   above. Bound the output and compare its latest durable activity timestamps;
   do not start with a store-wide process or file search.
2. Treat `.session.lock` as an inode-backed kernel lease, not a marker file:
   file existence is not lock ownership, and `flock` protects an open inode.
   Unlinking a contended pathname can let another process create and lock a new
   inode while the original writer still owns the old inode.
3. Probe the exact lock read-only with a non-blocking exclusive `flock`. Open it
   without truncation, report only `acquirable`, `contended`, `missing`, or the
   read error, then close it immediately. Never resume the session as a probe.
4. Read the lock body's PID only as a hint. A tool sandbox or PID namespace may
   not see the host process; `ps`/`kill -0` absence inside it cannot prove that
   the host owner died. Request a host-shell check when that distinction matters.
5. Check the bounded session evidence for prior file mutation involving
   `.session.lock`, especially `rm`, unlink, replacement, truncation, or
   recreation. If the path is missing while old activity advances, stop resume
   attempts and preserve evidence.

Never remove, replace, truncate, or recreate `.session.lock` as diagnosis or
repair. Never signal the owner from Diagnose. Do not request takeover or use an
owner-control endpoint. Ask the user to exit the owning process normally, then
explicitly retry ordinary resume.

Classify the result before recommending an action:

| Evidence | Classification | Safe next action |
| --- | --- | --- |
| Lease is acquirable | No current kernel owner; a leftover pathname is harmless | Retry normal resume; do not clean the file for tidiness |
| contended lease with advancing session activity | Live owner and active runtime; terminal attachment may be the failed layer | Preserve the owner; inspect terminal/PTY evidence or exit it normally |
| Contended lease with bounded activity idle | Live kernel owner, runtime/terminal health unknown | Ask the user to exit the owning process normally, then explicitly retry ordinary resume |
| Legacy owner-control artifacts are present | Diagnostic leftovers from an old binary; the kernel lease remains authoritative | Treat them as diagnostic only; exit the owning process normally before ordinary resume retry |
| Lock path was unlinked or replaced while old activity continues | Unsafe prior mutation with possible dual writers | Stop further resume attempts, preserve both inode/session timelines, and escalate; do not recreate the lock |

A contended lease proves a live kernel owner, not that its TUI, terminal,
provider, or runtime is healthy. Pin the failing layer from activity plus
host-visible evidence before proposing a product fix.

## Narrowing Loop

Work from evidence:

1. State the most likely layer in one or two concrete sentences.
2. Say why the next check will confirm or reject that hypothesis, then run that
   one safe local check.
3. Update the hypothesis from the result and continue only while the next check
   is still relevant and safe.
4. If a live provider, live network, destructive command, or upload is required,
   state why and get explicit user approval first.
5. If customization or local state is suspected, compare against an isolated
   temporary XDG config/data profile only after explaining that it will not read
   or mutate the user's real settings.

## Common Diagnosis Paths

- Startup/auth: binary path -> version -> config load -> auth provider present
  -> model/catalog selection -> first network boundary.
- Provider/model: selected provider/model -> base URL with credentials redacted
  -> auth presence -> model catalog cache -> trace request/error summary.
- Session/resume: session id/path -> workspace match -> session log exists ->
  resume/export/trace command -> whether the user wants inspection or
  continuation.
- Skills/plugins/MCP: list/discovery -> activation/trust -> validation output ->
  runtime trace or startup diagnostic.
- Desktop/TUI: packaged app/binary version -> session id -> UI-visible symptom
  -> crash/report metadata -> trace/export evidence. Say when source-only tests
  cannot prove a packaged-app issue.

## Fix Boundary

- Settings-only fix: propose the exact change and apply it only after explicit
  user request; preserve unknown settings fields and verify with a read-back or
  focused command.
- Workspace code fix: switch to the RED-before-GREEN engineering loop only when
  the user explicitly asks to fix code in the current repo. Reproduce first,
  edit surgically, rerun the same check, and report incomplete if it still
  fails.
- Product bug report: if the evidence points to Muse Code itself and no local fix
  is safe, give a concise support bundle with symptom, version, config/data
  paths, session/crash paths, redacted export/trace evidence, likely cause, and
  next action.

## Completion Report

Include:

- Symptom and affected surface.
- Product mental model relevant to this failure.
- Evidence collected, paths inspected, commands and outcomes.
- Redactions applied.
- Most likely cause and confidence.
- Fix made, proposed, or not made.
- Remaining uncertainty and the next safest check.
