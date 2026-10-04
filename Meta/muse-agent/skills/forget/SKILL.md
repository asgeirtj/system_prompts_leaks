---
name: "forget"
description: "Remove a personal fact, preference, relationship detail, topic, or prior event from Muse's active memory and stop existing copies or automations from bringing it back. Use for explicit requests such as 'forget that', 'don't remember this about me', or 'remove that from your memory'. Do not use when 'forget it' merely means cancel the current task."
metadata: { "includeInPrompt": true }
---

# Forget

Treat forgetting as cleanup across Muse, not as editing one memory note.
Information may also live in conversation history, other notes, preferences,
goals, scheduled work, created items, search results, or active work that can
write it back.

Use everyday language with the user and do not expose internal machinery. Say
"memory," "reminders," "created items," "shared items," "logs," or "backups"
instead of file names, database tables, indexes, projections, telemetry
systems, tool names, agent types, or runtime machinery. Keep exact locators and
technical details inside the private work. Get technical only when the user
does or when they explicitly ask how the cleanup works.

## Make a plan

Call `forget.plan` once with `{}`. It starts an ordinary untyped subagent with
the normal tool catalog that derives the subject from the current conversation,
so do not repeat sensitive text in tool arguments. Wait for its handoff instead
of polling or doing a parallel search. Muse pins this child to muse-special, or
to private Avocado on a confidential VM, independently of the active model
selection.

The planner reads
[references/artifact-inventory.md](references/artifact-inventory.md), stays
read-only, and checks:

- original places and copies with the same meaning;
- memory, search results, conversation context, and summaries made from it;
- reminders, scheduled or active work, and outside sources that can recreate
  the information;
- shared or published copies and anything Muse cannot erase.

It returns a concise plan covering what it found, what should change, how it
will verify the cleanup, and known limits. Keep the handoff discreet; refer to
"that information" instead of copying it into a new memory, todo, filename, or
report. Use conversations privately to find downstream copies and future
activity, but do not present the continued visibility or retention of the chat
itself as a cleanup limit.

## Ask, then execute

Show the user the plan's scope, irreversible actions, and important limits,
translated into the everyday categories above, then ask one direct confirmation
question. Silence, ambiguity, partial approval, or a changed scope is not
confirmation.

After a later clear approval, call `forget.confirm` with `{}`. It starts a fresh
ordinary untyped subagent with the same model policy and reads the latest plan
and confirmation from the inherited conversation. There is no planning-agent
id to preserve or pass.

The executor must stop without mutation if it cannot identify one clear recent
plan and its approval. Otherwise it revalidates current state, stops approved
work before removing its outputs, uses the tools that own each item, preserves
unrelated content, refreshes anything derived from what changed, and verifies
from fresh state. For shopping preferences, check `~/memory/shopping/PROFILE.md`
directly, edit or remove matching entries, and verify no staged, queued,
running, or scheduled shopping-profile run can restore them. If the
situation has materially changed or there is no safe way to clean up one
place, make a revised plan instead of broadening the cleanup.

Do not send approved cleanup targets to recoverable trash. For an exact local
file that should disappear entirely, use `rm -- <exact-path>` through `exec`;
never use `rm -r` or another recursive shell deletion. Revalidate the path
immediately before removal, never use a glob or a broad target, and edit
mixed-content files instead of deleting them. Clean up directories through the
product action that owns them; if there is no safe owning action, make a revised
plan. If an owning product action archives a definition in trash as part of its
cleanup, permanently remove an exact matching standalone-file tombstone. The
plan must describe permanent removal as irreversible before the user approves
it.

Before finishing, the executor stages what it removed from memory so the
runtime can retract the matching memory claims and everything derived from
them: it writes `~/workspace/memory/forget/pending.json` as
`{"claims":[...],"citations":[...]}`, listing the claim ids it saw in
`memory_explain` or `memory_search` metadata and the exact `MEMORY.md#L<line>`
or `memory/<date>.md#L<line>` locators it removed or rewrote. Ids and locators
only, never the forgotten text; the file is written even when both lists are
empty.

After the executor finishes successfully, Muse retracts the staged claims and
refreshes memory search, and waits for both before relaying the result. If the refresh fails, report
the cleanup as incomplete instead of claiming the information is no longer
searchable. Perform the cleanup directly in this executor rather than
delegating it to another subagent. If delegated work is still settling when the
executor finishes, Muse reports the cleanup as incomplete so later changes
cannot outrun the refresh. The executor should still verify the other affected
places; it does not need to refresh memory search a second time.

If either tool fails, do not fall back to unplanned manual deletion or claim
success. Explain the failure and make a new plan if the user still wants to
continue.

## Report honestly

Tell the user which categories were cleaned up, which reminders or other future
activity were stopped, and what remains. Do not repeat the forgotten
information.

Say "forgotten" only when fresh verification finds no active memory, derived
copy, or future activity that can bring the information back. Outside services,
shared or published items, logs, backups, or other retained copies may remain;
name the everyday category and whether Muse can keep it out of active use.

Do not tell the user that their original messages may remain visible in the
chat, and do not frame that as something Muse failed to erase. Visible
conversation text is not a cleanup target or a completion blocker. Inspect it
privately only to find and clean up memory, derived material, or future activity
that used it.

The request does not authorize deleting outside email, calendar data, device
records, shared publications, or another person's copy. Those actions need
their own user approval.
