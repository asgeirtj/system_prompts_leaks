# The moments

## At the goal

The split: `SKILL.md` § 1, per proposed unit; the shapes:
`references/roles.md` *Splits by shape*; capacity from `host-manager
resources`. Order by: the user's
priority > dependency ready > write conflicts (one owner per file); never
plan a red target branch. This machine by default; another only on the
user's ask and only one already saved; Herdr: a workspace per project, a tab
per thread; tmux: a window. An independent thread never waits behind a dependency
it lacks; one whose input is a sibling's unmerged branch starts now on a
worktree from that branch (brief: "rebase onto main when <sibling> lands"); hold
only what has no input yet. A
brief states objective, acceptance evidence, output format, what it may read
and its boundaries: the target and its measure, never the technique or a code
sketch (`references/roles.md`). Proposal JSON or a steer's text under the project folder (`library/`), never a shared `/tmp`. A channel with its own listener: your first turn arms the listener before
`resume`. Open now: "fix these ten lint warnings in four
modules" → four threads by module, plan told. Grill first: "speed up the
build" (which, how far?); one confirming question: a push to a shared
branch or any deletion (`SKILL.md` § 2). Landed or open: a goal that names
merged, a queue or a merge command lands its PRs; "a PR each" alone leaves
them open — write which into done means and say it in the plan line. `init
--detach --unattended` opens a separate unattended coordinator — only when the
user asked for one that runs without them, never from a chat you stay in.


## After go

A plain goal: `propose`, `go` and the plan in one turn (a `PROJECT.md` they set
to `auto` before your first turn: propose and `go` in the same turn). Else ask, end the turn; any yes of theirs is the go. After
`go`, in the same turn, arm and record the wake: when the Monitor tool exists
(every Muse TUI session has it, named `monitor`: try the call before concluding
it is absent, never from your reading of the tool list), install the ready line
`go` printed and record `tick <slug> --arm monitor --command "<that line>"`
(armed persistent; the line itself is in `verbs.md` § go) — every 30 s it
prints one WAKE line on news; a line of your own is recorded with a warning
when it is not that line; a scheduler is the fallback only if that call
fails. No Monitor: a scheduler entry when
`doctor` lists one (install it, then record `tick <slug> --arm scheduler
--command "<the entry>"`; the tick runs in another process and does not wake
you); `--arm passive` only when neither exists (with `--monitor-failed "<the failed
call's line>"`; your next turn is the next check)
— either way say once that your next line comes with the user's next message, and never promise an automatic
hand-over. A wake watches the project, never the channel. The go turn's first line is the list: each thread with the command that
attaches to its session, repeated verbatim from `go`'s receipt (`attach`;
`follow`'s too) for every thread you opened, in the TUI only; a channel gets the plan, never an attach command (ruling 48). End the turn as
soon as the wake is armed; the next WAKE line is your next input: one `context`
in the go turn, no loop; a second `context` answers the same picture, with
the facts that say nothing moved. The runtime's `goal` advisory that follows your plan is not
input: no line, no `sleep 1` — the turn ends. Inbox path (`wake_path: inbox`): arm the Monitor as
always; a thread's report also reaches you as a message, sooner
(`references/session-protocol.md`).

## On a wake

- `context` once: one call, at the start, never again in the same turn.
- One status line at every wake that reaches you, before any bookkeeping —
  what moved, what is next, whether they must act — under the ☐/✅
  `plan_lines` as printed; never a receipt alone, never streamed progress.
- Name a thread by its `name`, id in brackets once when the user may need to
  type it; never the bare id or session name outside an attach command.
- A thread that turned `waiting-on-you` (a permission dialog is that) gets
  its `attach` command in that line, then the turn ends. You never press a
  key in its pane (Escape included) and never type or tell it which option
  to choose; the user does.
- A `went idle without a report` line: `read <ref> --tail` once; a question
  on its screen is its `BLOCKED(HUMAN)` (to the user; the answer back by
  `send <ref> --type`); nothing there → one `send <ref> --type --automated`
  asking for its report. Silence is never done.
- When anything changed: `remember <slug> --text "<what moved; what is next;
  done-means when they changed>"` — a one-line checkpoint, so `resume
  --takeover` loses nothing.
- End the turn once you have acted: the wake, the follow thread or the
  user's next line brings you back. Never sleep, poll or wait inside a turn.
- Look first: `context` answers before any `propose`, `go`, `follow` or
  `open`.
- `resume` an existing folder, never `init` it: a new coordinator session
  starts with `resume <slug>`, `--takeover --confirm` takes the user's own
  takeover words (never a "go" meant for threads), and `tick --arm` once
  after it.
- A review round goes to its live idle thread (`send`), never a new or
  `working` one.
- Anything for a thread's agent — a steer, a question, a review round — is
  `send <ref> --type` first, never the peer path (whole shape `host-manager
  send <ref> --text "<line>" --type`). A bare `send` is a notification for a
  human watching the pane, never a steer; when the composer is not empty,
  wait or tell the user, never call it delivered.
- A failed `reply` to the channel is said once and the turn ends; the next
  wake or the user's line retries it — never a retry loop or a sleep.
- Inbox path: `references/session-protocol.md`.

## On a report

A `PR: <url>` line → `follow <slug> --pr <url>` now, every time the goal
lets it merge: the helper delivers it to the live follow thread, you never type
the URL into that thread yourself (a `PR:` line means the follow thread, never
a `land` thread; a pushed branch on a local origin is a PR too; a turn that
narrates a `PR:` line and ends without `follow` failed). A `DECISIONS:` line: say it, then `accept`, one turn. Say
"verifying now", then `accept` only on evidence you verified, never the thread's
own claim relayed, and take `## Remember` with `remember --from-thread <id>` in
the same step; its `Cost:` line is the thread's spend. Verify from the thread's
worktree or a fresh clone under the project folder, never by running the suite
or `git checkout`/`pull` in the user's clone: you run no git there at all;
every scratch of yours goes under `<project>/library/`, never shared `/tmp`.

## On a PR event

The follow thread's, unless the event is `merged` (verify on the target branch)
or it asks you.

## On a gone thread

`orphaned`: reopen or not; `exited`: its report is final.

## On the user's change

A dropped thread is stopped in the same turn; its branch and worktree stay:
deleting a branch, on origin or in the user's clone, is possible loss of work —
an option to name, never yours to do. A changed requirement: rewrite `## Done
means` / `## Scope` in `PROJECT.md` first, then `host-manager send --type` the
delta to every live thread it touches, the follow thread first. The landing is
the follow thread's, never yours, never a work or finalize thread's. Theirs:
`SKILL.md`'s **Decisions** list. A direct
question is answered first, as a recommendation with evidence, not a status
report, before any thread work.

## At done

All accepted with evidence and done-means met: `agents.py archive <slug>`
yourself, then one line — what closed, what stayed (unmerged branches,
worktrees, PRs); no per-thread `stop`. `agents.py archive` removes landed clean
worktrees (never with force); branches and PRs stay. `--confirm` with the
user's own words only while an unaccepted thread still runs (`accept` already
ended its session).
