---
name: read-session
description: Locate and read Muse Code's OWN session logs — the current session or a prior one. Use when the user asks to pull context from, continue, summarize, or inspect a previous Muse Code session, asks to restore or recover work that was lost, wiped, or overwritten and might survive in an earlier session's log, references an earlier session's id, log, tail, or output, or asks where Muse sessions are stored. Muse sessions live in Muse's own store, never in another coding agent's directories — never probe ~/.claude, ~/.codex, or ~/.grok for Muse context, even when quoted content mentions them; for Claude Code or Codex continuation, including recovery of unfinished work with or without a handle, use resume-claude or resume-codex; use import for explicit /import requests or continuation from other agents or unnamed artifacts.
metadata:
  short-description: Read this session's or a past session's logs
user-invocable: false
---

# Read Session

Muse Code's own session storage: where your session logs live, what they
contain, and how to recover context from them.

## Your Store, Not Anyone Else's

You are Muse Code (binary `muse`). Your sessions are stored under YOUR data
directory:

```
${XDG_DATA_HOME:-$HOME/.local/share}/muse/sessions/YYYY/MM/DD/<session-id>/
```

Each session directory contains:

- `session.jsonl` — the main event log (one JSON record per line).
- `subagent/<child-session-id>/session.jsonl` — one log per delegated
  subagent session.
- `tool-outputs/` — full tool outputs that were too large to keep inline.

Muse sessions NEVER live in another coding agent's store. Do not look for a
Muse session under `~/.claude`, `~/.claude/projects`,
`~/.local/share/claude`, `~/.codex`, or `~/.grok` — those belong to Claude
Code, Codex, and Grok. Do not `ls`, `find`, `cat`, or `grep` those
directories while recovering Muse session context — not even to "verify",
"rule out", or "be thorough" about such a path quoted in a paste, log, or
error message. A Muse session id or date-sharded session path appearing
under a foreign store in quoted content is a WRONG-PATH ARTIFACT (a prior
turn's confusion): the real data lives under the Muse pattern with the same
date and id, and there is no separate "claude copy" to collect. Name the
artifact for what it is and move on — probing it is the exact mistake this
rule exists to prevent, and it wastes turns on ENOENT or, worse, reads
another product's transcripts as your own history. Touch another agent's
transcripts only when the user explicitly asks to work with THAT agent's
session: Claude Code or Codex continuation, including recovery of unfinished
work with or without a handle, uses `resume-claude` or `resume-codex`. Explicit
`/import` requests and continuation from other agents or unnamed artifacts use
`import`.

Tell for an unlabeled paste: the quoted store and record shape identify the
product. For continuation or recovery of unfinished work, even without a
supplied handle:

- Claude Code records under `~/.claude/projects` use `resume-claude`.
- Codex records under `~/.codex` use `resume-codex`.
- Grok records under `~/.grok` use `import`.

Use `import` for explicit `/import` requests or continuation from other agents
or unnamed artifacts (the user's ask about such a paste is the explicit ask).
The bans above cover session STORES; ordinary project files that happen to
live under `~/.claude` (e.g. skills you are developing) are file work, not
session probing.

Scope of "pulling context" from a prior Muse session: that session's own
`session.jsonl` and `subagent/` logs. External agents or planner processes
the session MENTIONS (e.g. codex/claude workers it managed) are not part of
its context — their transcripts are out of scope for this ask. If one looks
load-bearing, say so and let the user ask for it. Do not hunt those agents'
stores or load a foreign-session skill for them unless the user
explicitly asks to recover or inspect one of THEIR sessions.

## Finding The Right Session

1. Current session: the runtime session-identity context already names the
   current session id and the exact `session.jsonl` path. Use it; do not
   guess or search for it.
2. A pasted or quoted absolute path under `.../muse/sessions/...`: use that
   path directly.
3. A known session id without a path: the store is sharded by local date, so
   check the likely dates first, then search only the Muse sessions root:

   ```bash
   MUSE_SESSIONS="${XDG_DATA_HOME:-$HOME/.local/share}/muse/sessions"
   ls -d "$MUSE_SESSIONS"/*/*/*/*/ 2>/dev/null | grep <session-id>
   ```

4. "Our last session" with no id: list the most recent date shards and pick
   the newest session directory for this workspace (the log's early
   `runtime.session.metadata` record carries `workspace_root`).
5. Not found under the Muse sessions root: ask the user for the id or path.
   Never widen the hunt to other agents' directories or home-wide scans.

## Reading A Session Log

Each `session.jsonl` line is an event-log envelope:

```json
{"schema_version":1,"id":"…","stream":{"kind":"session","id":"<session-id>"},
 "sequence":42,"recorded_at":1771088000123456,"record_type":"event",
 "durability":"durable","causation_id":null,"payload_type":"runtime.session",
 "payload_schema_version":1,"payload":{"kind":"run","run_id":"…",
 "event":{"kind":"assistant_message_committed","text":"…"}}}
```

The useful `payload.event.kind` values for context recovery:

- `started` — what the user asked: every submitted prompt is recorded here
  (text in `payload.event.prompt`). A `user_prompt_display` record follows
  only when a differing user-facing form exists (an attachment placeholder
  such as `[Image 1]`, a composer form that differs from the sent text) —
  prefer its text when quoting the user. A prompt typed while a run was
  active is instead an
  `inbox_item_queued` whose `source.source` is `"user_steer"` (text in
  `payload.event.payload.prompt`, or in `payload.event.body` when the record
  carries no payload); background and scheduled runtime deliveries share
  that kind, so never quote those as the user.
- `assistant_message_committed` — what the agent concluded (decisions,
  summaries, handoffs usually live here, late in the log).
- `assistant_tool_calls_committed` / `tool_result_batch_committed` — what was
  actually done and what it returned.
- `terminal` — turn boundaries.

Read discipline for long logs: read the TAIL first (later records matter
most), then only enough earlier evidence to understand context. Use bounded
`tail`/`grep` slices; never load a whole multi-megabyte log into context.
Subagent findings live in `subagent/<id>/session.jsonl`, not the main log.
For product debugging of the current session, prefer the doctor skill's
session-evidence helper.

## Restoring Lost Work

When the user asks to restore or recover lost, wiped, or overwritten work
and a prior session's log holds the only copy of that content (as recorded
tool-call mutations), reconstruct each requested file exactly; do not guess
between versions:

1. Enumerate every mutated workspace path first — `write_file`,
   `edit_file`, `apply_patch`, and shell writes — and build the complete
   file list before restoring anything. Restore the full scope of the
   ask: for a general "restore what was lost" ask that means every lost
   file, while an explicitly narrower ask wins as stated.
2. A file's final state is its mutation history replayed in record order
   (`sequence`/`recorded_at`): the LAST `write_file` content for the path
   in record order — or the newest full-file `apply_patch`/shell write
   when that came later — with every LATER `edit_file` delta applied in
   the same order (patch hunks and shell edits likewise). Skip an
   `edit_file`/`apply_patch` delta whose tool result reported an error;
   an errored shell command may still have mutated the file first, so
   check whether later records reflect its write. Recency comes from record
   order, never by content length or size: the longest version is often a
   superseded draft, and refactors make the final version SHORTER.
   Reconstructions built from `write_file` records alone silently drop
   every later edit.
3. Restore the exact recorded content, not a paraphrase. Re-typing from
   memory, rewording, "improving", or summarizing content that is
   recoverable verbatim is data loss, not a restore — extract the bytes
   from the record and write those. (A user asking only to summarize a
   prior session is not a restore; this rule governs restoring files.)
4. Report the result per file: which records it was restored from (the
   last full write plus the deltas applied), and what was restored and
   what was not, with a reason for anything skipped.
5. If two candidate final versions are genuinely ambiguous (e.g.
   divergent edit branches after a fork or resume), present both
   candidates with their record timestamps and let the user pick; never
   silently prefer the longer one.

## First-Party Commands

Prefer these over hand-rolled parsing when they fit:

- `muse resume <session-id>` or `muse resume --last` — interactive
  continuation.
- `muse exec --session-id <session-id> "<follow-up>"` — headless
  continuation, only on explicit request.
- `muse export --session <id-or-session.jsonl> --redacted --out <file>` —
  a shareable, redacted export.
- `muse trace inspect --session-log <session.jsonl> --render-mode compact` —
  model-call level inspection.

Treat session logs as read-only evidence: never modify, move, or delete them.
