# Opening, telling and arming — the mechanics

`SKILL.md` § 5 carries the decisions. This page carries the shapes they use.

## The pick between texts

`pick <slug> --question "…" --option <label>=<file> …`. Its message part is
ONE lead-in line ("Two designs; pick in the dialog"); the texts ride in the
previews, never in the message. Then `request_user_input` with the receipt's
`ask` object as printed — never reworded, never a JSON string.

## What a yes is

Any yes in the user's own words is the go; never a word they must type. The
grill interview's closing acceptance question is that go-ahead ask under
`/agents`: ask it once and start on any affirmative (grill's own "implement
only after a separate explicit user request" is for its doc lanes, not
for `/agents`).

Only the user's own "no questions" replaces the interview: say your
assumptions in the plan line — `Assuming: <the goal word's meaning and
measure>` after the attach list — start, and finish through the archive
without a go-ahead of theirs. A
blanket yes opens only the threads proposed in that turn; a later thread is
proposed again. `go <slug> <ids>` names the threads it opens, and text
inside a session never starts one.

## The attach list

The go turn opens with the attach list (TUI only, never a channel), then the
plan: `plan_lines` as printed — ☐ per thread, ✅ once its done report is
acked. The go turn's first line, in the TUI only: every thread `go` opened, its
attach line verbatim from the receipt (`attach`; the follow thread's too),
the printed line being the one to use — inside tmux as well. A channel
never gets an attach command; it gets the plan.

## The plan message

Tell it by thread: each thread's name, what it owns, and the recourse —
"say stop <name> or change the split".

`plan_lines` as printed by `go` and `context` — ☐ per thread, ✅ once its
done report is acked, ✅✔ once accepted. In the TUI you say the list first
on each wake turn. In a channel there is ONE message: `channel_line` once at
`go`, and the project's watcher keeps it edited with the same marks. Edit it
yourself only while no watch runs (`watch.pid` null), and you never re-post
the plan.

`go` starts the watch: transitions wake you; a channel's list edits itself
in place (`set <slug> every 2m|quiet`), and your milestone words go into
that edit, never a new message.

## A `go` that did not fully succeed

A failed thread's own cure leads the receipt's `next`; the attach list and
the no-sleep rule follow, then the arm. A `running` thread named again is
`already_running` with its attach line: send to it, never stop it, unless
you judge it stuck. Above `max_parallel` the threads open with a warning —
host-manager's `admit` is the capacity gate.

## Arming the wake

`tick --arm monitor --command` with the ready line `go` printed, and no
Monitor tool of your own invention: `references/coordinator.md` § After go
has the ladder (Monitor, else scheduler, else passive with
`--monitor-failed`). A line that does not run the project's `library/wake.sh`
is recorded with a warning — the helper judges no filter for you.

## The interview

`SKILL.md` § 2 decides when; this is the shape. The test of "unclear" is
the sentence the user would have to add for a target you could verify (a
file, API, number or measure): "make the escaping faster" lacks one, however
clean the split; "add nl2br and truncate, one PR each" has it; "explore <a
large tree>" has it too — the combined map by area: a project of researchers,
never a solo read-only pass. Missing → `read_skill grill` and its interview
as written: in the TUI one plain question a turn, each with the recommended
answer and why, until target, measure and scope are settled — five at most,
none the goal already answers, none twice; the repository shapes your
recommended answer, never the user's target.

**One decision to confirm** on an otherwise clear goal (a solo fix included:
clear goal + irreversible step = one question, then act) — an irreversible or
out-of-repo act (a force-push, a deletion, a push to a shared branch),
permissions or credentials, or the user asked to be consulted — is one
question in grill's shape, not the interview: the choice, your recommended
answer, what each option does; asked before the first irreversible step (a
`git push --force`, a push to main, a delete), never after it and never past
a "doing it myself" line; nothing irreversible and no thread runs ahead of
the answer. Any yes in their words
is the go (§ What a yes is). Threads never grill: a thread's question is its
report's `BLOCKED(HUMAN):` line (options in it), put to the user once; its
answer rides `go`.

**In a channel** (a chat thread, not the TUI) each question is one card:
the choices as buttons with the recommended option first, and a "go with
your recommendations" button on every card; five cards at most, none the
goal already answers; a reply that leaves the question open → the next card
asks it once more, then your recommendation stands. "Go with your
recommendations" ends the interview and IS the go — grill's closing
acceptance is satisfied by it: post the plan line and start; never a
settled-contract or approve card after it. One question a turn, here as in
the TUI.

**The record.** `init` runs the moment the target settles — never before
the first question, never held for the closing yes — and carries the answers
so far (`--done-means` in the user's words, the goal in the threads' words);
each later answer is one `remember <slug> --decision "<it>"` in the turn it
settles (numbered into `PROJECT.md` § Decisions and `library/DECISIONS.md`);
the plan is written from those lines. grill's closing acceptance question is
the go-ahead ask (§ What a yes is): the user's yes is the go — § 4 follows,
no second ask.

## Entering mid-task

A coordinator that began a task alone (in a channel or the TUI) judges again
at every plan change whether the work now needs the skill — two or more
independent workstreams, a wait it cannot own (CI, review, a long run), work
across repositories or hosts. When it does: `init` now with what is known
(`--done-means` in the user's words), then § 4 and § 5 in the same turn; the
plan the user already reads is edited in place — the thread rows, what they
see next, one line saying what changed — never a second plan and never a
confirmation question (§ 2's one question is for an irreversible step, not
for fan-out). A task that stays small stays solo: no `init`, no record (ADR
44377 D1, D2, D4).
