# Forget artifact inventory

Use this as a required routing checklist, not as permission to remove every
listed surface. Record only surfaces that contain the requested subject or can
recreate it. For every match, identify its owner, exact locator, relationship
to the source, proposed action, precondition, reversibility, and verification.

## 1. Conversation and live execution

Check the current and prior public or side-chat events, context-only messages,
compaction summaries, subagent histories, tool calls and outputs, spilled tool
output files, restart checkpoints, and conversation-scoped todo snapshots.
Check conversation titles, list previews, reply previews, activity cards, and
other transcript-derived presentation projections separately from the event
rows that produced them.
Include message attachments, reactions, native-channel copies, approval
requests or decisions, and any pending handoff that can reinsert the content.
Inspect active subagents, browser tasks, workflows, shell processes, calls, and
other RuntimeWork that may still hold or act on the information.

Use conversation history privately to locate memory, summaries, pending work,
and other downstream material. The visible chat itself is not a cleanup target
or a completion blocker. Do not report its continued visibility or retention as
a limitation. Prevent new compaction summaries, memory flushes, checkpoints,
and future producers from restating the subject.

## 2. Source files and standing context

Inspect precise matches and semantic restatements in:

- `~/MEMORY.md` and relevant files under `~/memory/`, including dated source logs;
- `~/USER.md`;
- `~/SOUL.md`, `~/IDENTITY.md`, and legacy `~/GOALS.md` when the information
  became persona, identity, or carried goal context;
- `~/FEEDBACK.md`, the durable preference input to conversational follow-ups,
  when the information became a check-in topic, timing or frequency preference,
  or signal about the user's tolerance for proactive contact;
- person and group pages plus their indexes under `~/memory/people/` and  
  `~/memory/groups/`;
- the shopping profile at `~/memory/shopping/PROFILE.md`, which is
  user-editable, excluded from memory ingest, and read directly by shopping  
  turns;
- `~/HEARTBEAT.md`, `~/AGENTS.md`, and `~/TOOLS.md` when the information became
  an instruction, standing check, or environment note;
- goal, study, dream, feedback, workspace, and user-authored skill files;
- attachments, generated media, and tool-output spill files under the
  workspace.

Also inspect recoverable trash, temporary or editor-backup files, exports and
download archives, and version-control commits, stashes, or remote branches when
the workspace is a repository. Removing the working copy does not erase those
histories.

Do not use recoverable trash for approved cleanup. Permanently remove an exact
standalone file with `rm -- <exact-path>` after revalidating the target. Never
use `rm -r`, another recursive shell deletion, globs, or home/root paths. Edit
mixed-content files in place and use the owning product action for directory
cleanup. Permanently remove an exact matching standalone-file tombstone already
in trash, including one an owning product delete action creates while cancelling
a schedule or workflow. If only a directory archive remains and no owning
permanent-delete action exists, report that limitation instead of deleting it
recursively.

Preserve unrelated content in a mixed file. Daily logs are historical sources,
not disposable scratch space: removing or redacting one claim must also cause
their search rows and every downstream projection to be reconciled.

## 3. Memory retrieval and derived projections

The Markdown corpus is indexed into PostgreSQL `memory.entries`,
`runtime.search_documents`, and `memory.embeddings`. Beside the index sits the
claim spine, `memory.claims`: one row per verified claim carrying its id, the
quote and conversation handles that grounded it, its status, and the
supersession links between an older belief and the claim that replaced it.
`memory_explain` shows the row behind a claim id, a `memory://` uri, or a
`path#L<line>` citation, and `memory_search` results carry the claim id in
their metadata. Retracting a claim must reach every claim linked to it on
that chain, so record the ids and exact line locators of what you remove;
the executor stages them in `~/workspace/memory/forget/pending.json` and the
runtime retracts the chain before the reindex. Derived memory also  
includes:

- `~/memory/bank/{world,experience,opinions}.md`;
- person and group pages and indexes;
- the personalization projection;
- the compact `MEMORY.md` and profile projection in `USER.md`;
- prompt-context caches and already assembled session context;
- the centrally published user-memory embedding for the VM.

Deleting text without reconciling sparse search, vector search, prompt caches,
and the central publication leaves active copies. Prefer the owning memory
rebuild/publication APIs. A successful `forget.confirm` executor is followed by
a runtime-owned memory reindex before its result is relayed; do not start a
second reindex. During execution, verify source files and owning-API state; a
semantic-search hit may still come from the pre-cleanup index and is not by
itself a cleanup failure. The runtime-owned reindex closes that retrieval
surface before the result is relayed. If a remote publication has no delete or
replacement proof, report that limitation.

## 4. Self-improvement outputs

Review both finished and in-flight runs whose evidence window included the  
subject:

- Memory claims, reconciliation staging, demotions, receipts, run/step state,
  and files under `~/workspace/memory/`;
- Relationships pages, rankings, and relationship run records;
- Alignment state, synthesis, progression history, repair threads, evidence,
  archive, and daily dreams under `~/dreams/`;
- Goals bookkeeping proposals and applied tracking changes;
- Shopping-profile runs, staged `shopping/PROFILE.md` files, receipts,
  queued or running profile writers, and the durable profile at  
  `~/memory/shopping/PROFILE.md`;
- Studying plans, goal briefs, suggestions, momentum, and  
  `~/workspace/objectives/goals/STUDYING.md`;
- Ideas, idea sources, embeddings, cards, accepted builds, and Feed prompts or
  units derived from them;
- Discovery Pool or other community cards and previews published from those  
  Ideas;
- Skill-improvement proposals, staged artifacts, installed user skill changes,
  learnings, and follow-ups;
- Conversational-follow-up attempts, persisted selector decisions and
  `feedback_note` values, and selected candidates derived from recent public
  chat or `~/FEEDBACK.md`;
- fleet-learning and Feed publication outboxes, centrally published lessons,
  receipts, and unconsumed remote records derived from the information.

Removing only a final projection is insufficient when an objective run or its
staging artifact can reapply it. Claim retraction plus reindex is not enough
for `~/memory/shopping/PROFILE.md`: edit or remove matching profile
entries directly, verify the file from fresh state, and prove no queued,
running, staged, or scheduled shopping-profile run can restore them. Quiesce
an in-flight writer first. A retained run receipt may keep content-free
provenance, but any model-readable evidence
or generated proposal containing the subject needs an explicit disposition.

## 5. Goals, schedules, and future producers

Inspect user goals, assistant tracking items, entries, associations,
suggestions, briefings, and saved prompt snapshots. Inspect all cron
definitions and bodies, owned reminders, heartbeat instructions, event hooks,
hook scripts and logs, workflow definitions and saved runs, pending delivery
outbox rows, pending notification payloads, channel-delivery payloads, and
already admitted workers.

Treat the six-hour conversational-follow-up selector as a producer. It reads
both `~/FEEDBACK.md` and up to 48 hours of visible public chat, and a persisted
pending attempt may append its already-selected `feedback_note` on retry.
Quiesce or account for an in-flight attempt before editing the file, remove only
matching preference bullets, and verify that no pending decision can rewrite
them or send a follow-up about the subject. Use recent chat privately to find
already-derived candidates or decisions, but do not list the retained visible
conversation as a cleanup limitation.

If the subject is still eligible in that 48-hour lookback and no owning
exclusion prevents the selector from using it, this producer is not fully
closed. Report the conversational-follow-up category as pending until the
lookback expires or an exclusion is proven, without presenting the visible
conversation itself as the limitation.

On a host with the current runtime control, a successful confirmation spawn is
that owning exclusion: the selector receives a subject-free instruction not to
use, preserve in follow-up preferences, or surface the covered topic, and a
still-pending decision made before a newer confirmation is suppressed before it
can write or deliver. Verify that the control is available; if it is not, keep
the producer pending under the rule above.

Use the owning goal, tracking, cron, hooks, and workflow tools. Decide whether
the subject is incidental text to rewrite or whether the whole obligation must
be deleted. Deleting a goal may cascade its owned schedules; the plan must make
that consequence visible. Disable or cancel an approved producer before
cleaning its output so it cannot race the cleanup.

## 6. Artifacts and sharing

Search file artifacts, web artifacts and their `app.db` records, media,
attachments, widgets, profiles, idea builds, briefings, exported files, and
generated reports. Include Spaces and their proposals or shares, projects,
podcast episodes plus their remote audio, feed, cover, and RSS objects, Feed
posts or units, media descriptions and metadata, extracted OCR or transcripts,
and avatar or profile projections. Check whether a matching artifact is shared,
published, sent through a channel, attached to an email, or copied to an
outside service.

Use artifact actions for artifact-owned data. Local removal does not revoke a
shared URL or retract a message. Unsharing, deleting an external copy, or
contacting another person is a distinct external action and needs separate
approval if it was not in the confirmed plan.

## 7. Connected and cached sources

The same information may still exist in email, calendar, contacts, device
cache, health or sensor records, call logs,
channel history, a browser session or its page, screenshot, DOM, download, or
accessibility cache, an ingest/raw-signal record, a connector, or another
external account. Determine whether Muse merely read it, cached it, or
authored it. The forget request does not by itself authorize changing the
source service.

If an unchanged connected item could be ingested again, the plan needs either
a source-scoped exclusion or an explicit limitation. Do not keep rediscovering
the subject from external services during verification.

## 8. Operational and retained copies

Account for runtime events, inference/provider traces, Pariscope or Scuba
telemetry, journald, database WAL, snapshots, backups, mobile notifications,
prompt renderings, cached request or summary rows, and retention-controlled
service copies. These are not ordinary agent memory, and a VM subagent may not
be able to erase them.

State whether each known class is deleted, replaced, excluded from active
model use, or retained until an external policy expires. Never claim physical
erasure of backups or service telemetry without authoritative confirmation.

## 9. Verification closure

The final verification must show:

1. no approved authoritative source remains available to the agent;
2. exact and semantic retrieval no longer returns a usable copy;
3. standing prompt context, new compaction summaries, memory flushes,
   restart checkpoints, and the shopping profile do not preserve or restate it;
4. no active, staged, queued, or scheduled producer, including a
   shopping-profile run, can recreate it;
5. approved artifacts and shares have the requested disposition;
6. remaining external or retention-controlled copies are explicitly reported.

A check that reintroduces the sensitive text into a normal chat, memory entry,
todo, filename, or report is itself a failure. Keep detailed match evidence in
the private plan and expose only discreet counts and categories to the user.
Do not include the original visible conversation in the final limitation
report.
