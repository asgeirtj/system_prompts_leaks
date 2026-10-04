# agents verb contract (`scripts/agents.py`)

The one helper this skill ships. It keeps a **project folder** — goal,
memory, threads, inbox — and turns the coordinator's decisions into
mechanics: it opens threads through `host-manager` (this machine) or
`fleet-manager` (a saved machine), records who each thread is, files
events once, and computes the groups a status answer is made of. It decides
nothing: which work becomes a thread, where it runs, when it is done and
what to remember are the coordinator's calls (`references/coordinator.md`).

```
python3 scripts/agents.py <verb> …
```

The six verbs the coordinator types most, as typed (the rest of this page
has every flag):
```
propose <slug> --threads-json -   # stdin {"threads": [{"id","name","brief","worktree","owns":[…],"test_command","unattended",…}]}
tick <slug> --arm monitor --command "<the line go printed>"
follow <slug> --pr <url> [--pr <url>…]
stop <slug> <id> [<id>…]
ack <slug> <id> [--progress NN --basis "<why>"]
inbox drain <slug>
```

The helper is stdlib Python and runs by path from the skill directory. It
finds `host-manager` and `fleet-manager` as sibling skills
(`../host-manager/scripts/lane_runtime.py`,
`../fleet-manager/scripts/fleet_manager.py`); `MUSE_AGENTS_HOST_MANAGER` and
`MUSE_AGENTS_FLEET_MANAGER` name other commands (tests inject fakes there).
A fleet-manager counts only when its `open` verb answers `--help` (one probe
per run): a rename-only file is "found, but no `open` verb" in `doctor` and
no `remote_threads` capability; a helper that crashes or hangs on that
probe is reported by `doctor` (`fail`) and, on a verb that needs remote
sessions now, is a tool failure (exit 6 with its last stderr line), never
"no verb". Projects live under `~/.muse/projects/`; `MUSE_PROJECTS_HOME`
overrides the directory.

## One JSON shape

Every verb prints **one JSON object** on stdout, success or error — the
same envelope `host-manager` and `fleet-manager` print (two text modes
are the exceptions: `tick --wake-line` prints one WAKE line, `pick` the
message to post, then a `--- dialog ---` line and the dialog spec):

| key | meaning |
| --- | --- |
| `outcome` | what happened, one word |
| `provider` | the session provider a thread line is about (`herdr`, `tmux`), or `null` |
| `ref` | `<slug>` for a project line, `<slug>/<thread>` for a thread line, or `null` |
| `capabilities` | what this installation can do: `local_threads`, `remote_threads` (fleet-manager found), `unattended_flag` (host-manager's `open` advertises `--unattended` — D16's spelling, under which a plain `open` is the engine's own prompts), `trusted_flag` (its `open` advertises `--trusted`: the engine's own trust record pre-seeded for a Claude Code or Codex thread, Amendment 6), `hooks_flag` (its `open` advertises `--hooks-approved`: the coordinator's hooks acceptance seeded into a thread's own settings file, Amendment 9) |
| `progress` | one line per step, in order; also written to stderr as it happens |
| `next` | the one thing to do next — a command with the flags in force, or "end the turn"; always present, and a repeated read is never the answer (§ What `next` means) |
| `error` | on a failure only: the first thing that is wrong |
| `receipt` | on a write verb only: `what`, `project`, `thread` (when one), `who`, `when`; `go` returns `receipts`, one per thread it opened |

Stdout carries slugs, ids, names and paths; never an environment value.
Verb-specific keys are listed per verb below. Every write verb takes
`--asked-by WHO` (default: `MUSE_AGENTS_ASKED_BY`, else the login name); it
goes into the receipt and, for a remote thread, in front of the
fleet-manager verb.

## Environment

| variable | meaning |
| --- | --- |
| `MUSE_PROJECTS_HOME` | the projects directory (default `~/.muse/projects`); passed into every local thread |
| `MUSE_AGENTS_HOST_MANAGER` / `MUSE_AGENTS_FLEET_MANAGER` | the sibling helpers' commands (default: the sibling skills' `scripts/`) |
| `MUSE_AGENTS_ASKED_BY` | the default for `--asked-by` |
| `MUSE_AGENTS_TMUX` | the tmux command the coordinator's own sessions live on (`tmux -L <socket>`); rides as host-manager's global `--tmux` on every call, so threads open, are found and are stopped on that server; unset, host-manager's default |
| `MUSE_AGENTS_PROJECT`, `MUSE_AGENTS_THREAD`, `MUSE_AGENTS_ROLE` | set on a thread by `go`; `remember` refuses `MUSE_AGENTS_ROLE=thread`. `MUSE_AGENTS_ROLE=launcher` is set by a program that runs `init` for a coordinator session it opens afterwards (a launcher): `init` records no coordinator (`coordinator: null`) and that session's first `resume` binds |
| `MUSE_EXPERIMENTAL_AGENTS=on` | passed by `init --detach`, `go` and `follow` into every local session they open (the skill was visible here, so the new session must see it too — ADR 38715 D15); fleet-manager's `open` takes no `--env`, so a remote thread gets it only from its machine's own environment (a `progress` line says so) |
| `AGENTS_TEST_LAUNCHER_ARGV` | tests only, under the seams switch: a JSON list standing in for the launching session's command line |
| `AGENTS_TEST_COORDINATING_PID` | tests only, under the seams switch: the pid that stands in for the coordinating process (the suite pins its own, so no test's identity follows who ran `run.sh` and whether that shell outlived the first tests — #42960) |
| `AGENTS_TOOL_TIMEOUT_S` | the failure bound on one sibling-helper call (default 120); never a wait |
| `AGENTS_NOW` | a fixed clock for tests |
| `MUSE_AGENTS_TEST_SEAMS` | `1` enables the test-only seams; any other value ignores them (`ignored_env` in `progress`) |
| `AGENTS_TEST_HOLD` | tests only, under the switch above: `<point>:<ready>:<go>` — at `inbox-put` or `accept-judged` (both inside the lock, the latter after the `done`/`proposed` guards) the helper opens the go pipe, writes `reached` to the ready pipe and blocks reading the go pipe, so a suite can prove the lock is held and what a second writer does meanwhile |

`state.json`, the inbox and every thread record are written under one lock
file (`<slug>/.lock`, `flock`): threads run `report` and `inbox put` while
the coordinator runs `tick`, `context` and `resume`; each read-modify-write
pair is atomic; `tick` and the live `follow` path re-read a record under
the lock after their (unlocked) liveness probe, `follow`'s reopen path
derives the fresh record from a locked re-read, so a report filed meanwhile
is kept, and `accept` judges `done`/`proposed` under the lock.

## One exit-code table

| code | meaning |
| --- | --- |
| `0` | ok |
| `2` | usage — the message names the flag or argument |
| `3` | refused by a guard: no such project or thread (`"archived"` when the slug's folder is in the archive: the line carries `"archive_path"` and `"archived_at"`, `next` reads it), a slug already taken, a thread not named or not proposed, a live coordinator or live threads without confirmation, a memory write from a thread, an acceptance of a thread that is already done or never ran, a hand-written Monitor line refused at arm time (`arm_not_persistent`; `next` is the ready line). Nothing changed |
| `4` | unsupported here: no host-manager beside this skill, or a machine named without fleet-manager; `next` names the alternative |
| `5` | stopped for a step only a human can take (host-manager or fleet-manager stopped with 5); `next` is that step |
| `6` | evidence unavailable: a provider could not answer, a thread could not be opened. Nothing changed unless the line says `created: true` |
| `7` | internal — report the line; nothing changed |

A host-manager or fleet-manager exit code is passed through unchanged with
the underlying line under `underlying`.

## What `next` means

`next` coaches the turn, never the loop: it names the one thing to do after
the verb, and it never answers `context <slug>` or `overview <slug>` after a
write. Judgement stays `SKILL.md`'s.

| after | `next` |
| --- | --- |
| `doctor` | the first turn's `init` |
| `init` | `propose <slug> --threads-json -` when `--done-means` was given; else write `## Done means`, then that proposal line |
| `init` on a request that begins `/agents` or `agents:` | the same, prefixed: under /agents you do the work yourself unless it needs several lanes at once or a long wait (then threads, or one follow thread); the plan line names the choice and why (ADR 38715 Amendment 10, #42241; it replaced the several-threads default of owner rulings 30/31) |
| `context` | write `## Done means`; `propose …` when no thread exists; the inbox moves in order (`follow <slug> --pr <url>` for a `PR:` report, the `BLOCKED(HUMAN)` question, `ack`, verify-then-`accept` of the thread that opened a merged PR (the follow thread ends on its own final report), reopen-or-not for a gone thread), then end the turn; the facts say so (`since_last_context_s`, `unchanged_for_s`, `context_call`) when `changed` is empty on a turn's first look; `end the turn now — context says how long nothing has moved and what brings you back; else answer the user and end the turn |
| `propose` | show the list, end the turn, `go <slug> <ids>` on the user's later go — or that `go` line alone under `start_threads: auto`; each ends `a thread is a host-manager session, opened by `go` alone; never `subagent_spawn` for project work` (owner ruling 52: the in-process subagent path has no report and no wake) |
| `go` | repeat `text`; `tick <slug> --arm monitor\|scheduler --command "…"` (or `--arm passive --monitor-failed "<line>"` when neither exists; the host-manager sentence above rides on this `next` too) and end the turn when no wake is recorded; else repeat `text` (each thread's attach command) in the TUI — in a channel `channel_line` alone: an attach command never reaches a channel (owner ruling 48) — then `no sleep of any length (the wake brings the reports)` and the end-turn line last, on every path — a first go, a later go under an armed wake (a thread opened after a pick, under a wake already armed), a reopen: `end the turn now; the Monitor wakes you.` — a note to the coordinator, no timestamp, never posted (it was pasted into plans) (a scheduler: `… the scheduler ticks in another process and the user's next message brings you back`; passive: `… nothing wakes you (passive) — the user's next message brings you back`) |
| `tick --arm`, `tick` | the same end-turn line as `go` after an arm (`end the turn now; the Monitor wakes you.`, or the tier's own words); a plain `tick` ends the turn and looks again on the next wake — or, when no wake is recorded, the arm line; when `changes` is non-empty, `remember <slug> --text "<what moved; what is next>"` first (the checkpoint of a changing wake) |
| `follow` | repeat `text` to the user (the follow thread with its attach command); end the turn; `no sleep of any length (the wake brings the reports)`; the follow thread reports here — the same no-sleep words ride `go` (a first go, a reopen and a partial go with a live thread — newly opened or already running — alike; on a partial go the failed thread's cure leads, then the attach-list words and the no-sleep words, then the arm and the end-turn line last) and the `context` move that relays a `BLOCKED(HUMAN)` answer (#41850: `sleep 240/280/90` after each of those); a `queued` follow receipt ends `never land it yourself; no sleep of any length (the wake brings the reports)` |
| `report`, `inbox put` | filed for the coordinator's next wake (a `PR:` report names the `follow` line the coordinator runs in the turn it reads it) |
| `ack` of a done report (a `PR:` line or a done STATUS) | `verify now; when done-means is met, `accept <slug> <id>` in this wake (that closes its session); else say what is missing` — one per done thread acked, `then end the turn` last (#41851: acked done reports sat unaccepted, sessions lingering, until the user asked) |
| `ack` of a progress report, `accept`, `remember`, `stop`, `inbox drain` | continue with what you have; end the turn when nothing else is pending — `inbox drain` first says `<n> report(s) unread — <names>` when a report is still neither acked nor accepted: the drain empties the inbox, not your reading |
| `relay --asked` | wait for the user's answer; on it, `relay <slug> <id> --fingerprint <fp> --answer "<their answer>"`; end the turn |
| `relay --answer` (delivered) | the answer is with the thread; the question closes on its next report; end the turn; `no sleep of any length (the wake brings the reports)` |
| `relay --answer` (failed) | NOT delivered, with the reason: the relay stays owed — the same `relay … --answer` again once the send can land; say what was NOT delivered, never that it was forwarded |
| `overview` | answer the user from `text` (a `waiting-on-you` line carries the thread's attach command again), then end the turn |
| `pick` | post everything above the `--- dialog ---` line verbatim as your message, then ask with the JSON below it as printed (its options carry the texts too); end the turn |
| `resume` | arm your own wake |
| a refusal | the command that clears it |

`--help` on the helper and on every verb lists the flags with one line each;
the helper's source is not for reading.

## The project folder

```
~/.muse/projects/<slug>/
  PROJECT.md              goal, request (the message as typed), "done means", scope, repositories, standing instructions, settings
  MEMORY.md               shared memory — written only through `remember`
  TASKS.md                the user's checklist (pointers; issues and PRs are the truth)
  state.json              schema agents-project/v1: coordinator, repos (as init recorded them; a thread inherits trust only from one the user also trusted in Muse's trust.json — init says which lack a record), wake arm, cursors; on the inbox path only (absent = the Monitor path, FR-41038-5): `wake_path: inbox` (recorded at init and kept until archive — ADR 41038 D5; the Monitor wake is the floor on both paths until #41228), `inbox_target` / `inbox_label` / `inbox_reason` (the report target: this session's Muse session id, the workspace label it was resolved under, the reason when none)
    tracking.json           schema agents-tracking/v1: the progress ledger — workstreams, thread → workstream, one observation per live thread per tick, pending questions (below)
  threads/<id>/record.json   schema agents-thread/v1 (below)
  threads/<id>/brief.md      what the thread was told at open
  threads/<id>/report.md     the thread's own report (whole-file rewrite; the brief names this path)
  threads/<id>/leftover/     report files archive moved out of a landed checkout
  threads/<id>/remember.md   the report's `## Remember` section, held for the coordinator
  library/                 files threads produce for the project; wake.sh, the helper's own wake loop
  inbox/new/<seq>-<hash>.json   unprocessed events
  inbox/done/<seq>-<hash>.json  processed events (kept for idempotency)
```

`PROJECT.md` is human-editable Markdown. `init` writes these headings and
`context` reads them: `## Goal`, `## Request`, `## Done means`, `## Scope`,
`## Repositories`, `## Standing instructions`, `## Settings`. Settings are
`key: value` lines under `## Settings`:

| key | default | meaning |
| --- | --- | --- |
| `max_parallel` | `4` | threads `go` will hold open at once |
| `start_threads` | `propose` | `propose` (wait for `go`) or `auto` (the user said so) |
| `unattended` | `inherit` | posture of new threads: `inherit` = this coordinator's own approval posture (approvals off → unattended); `true`/`false` on the user's words |
| `follow_every` | `5m` | the follow thread's cadence, written into its brief |
| `stuck_scans` | unset | the project's own flat-run length in wake rounds — ticks at which another thread moved, never raw 30 s ticks — that raises a thread's `flat` flag; unset = the number alone (`quiet_for_s`), no flag |

`MEMORY.md` is `## <date> <heading>` entries. `TASKS.md` is `- [ ]` lines.

**Thread record** (`threads/<id>/record.json`, `schema: agents-thread/v1`):
`id`, `name`, `kind` (`work` | `follow`), `status`, `brief` (the coordinator's
text), `cwd`, `repo`, `worktree` (the branch name from the proposal, or
null), `worktree_path` (the checkout `go` made for it, or null), `machine`
(`local` or a label), `provider`, `ref` (the provider's bare ref: the
address is composed from `machine` and `ref`, once), `server`, `engine` (set
at `propose` — the proposal's, else the coordinator's own — and confirmed
from the open receipt's identity), `engine_args` (the proposal's list),
`identity` (the provider's tuple as host-manager or fleet-manager reports
it; a remote thread's `status` answer is compared to it field by field, and
`identity_drift` lists the fields that differed, `key: 'was' -> 'now'`
each, as fleet-manager's `status` serves them, when a session under the
thread's name was not the one opened for it), `model`,
`effort`, `unattended`, `posture_source` (which rule decided the requested
posture — `thread`, `project`, `inherited`, `unreadable`; FR-38715-15),
`allow_list_path` (the engine's own rules file the helper wrote into the
thread's checkout; `null` when none), `posture_applied` (what the open receipt reports:
the helper's own word when it names one, e.g. `engine_default`; else from
its posture flag list — `unattended` when a flag applied, `attended` when
none did and none was asked, `unknown` when unattended was asked and the
receipt carries no flag, as host-manager adds it for Muse alone;
`provider_default` when the helper took no `--unattended`), `proposed_at`, `amended_at`
(`propose --replace`), `opened_at`, `receipt` (host-manager's), `open_note`
(the provider's note on open, when it gave one), `attempts` (failed opens),
`prs` (`[{url, last_event, head, at}]`), `report` (`{digest, at, status_line, blocked_line, decisions_line, pr, remember, progress}` — `progress` is the thread's `Progress: NN% — <basis>` line as `{percent, basis}`, null without one), `acked_digest`, `calibrated` (`{value, basis, rung, at}` from `ack --progress`, null until then), `workstream` and `workstream_ref` (the proposal's title and reference, null without), `evidence` (`[]` until `accept`),
`ended_at`, `stop_receipt` and `session_ended_at` (when `stop` or `agents.py archive`
ended its session), `last_agent_status` (the last screen or Herdr verdict
`tick` saw, so a thread that turns waiting-on-you files once per transition).

**Thread status** is a recorded fact: `proposed` → `running` → (`exited` when
the provider proves it gone after a report) → `done` (only `accept`); `stopped`
(by `stop` or `agents.py archive`); `orphaned` (gone or identity failed with no report,
set by `tick` or `resume`). A thread's own "done" is a claim in its report,
never a status. A status is about the record; the session may outlive it
(a `done` thread's engine keeps running until `stop` or `agents.py archive` ends it).

**Groups** (computed by `context` and `overview` from facts, in this order,
first match wins):

| group | fact |
| --- | --- |
| `done` | `status = done` (evidence recorded) |
| `orphaned` | `status = orphaned`, or a live check answers gone/mismatch and there is no report newer than `opened_at` |
| `waiting-on-you` | the report's `BLOCKED(HUMAN):` line is newer than `acked_digest`, or the provider reports the agent `blocked` (Herdr's own status, read from host-manager's `list` row — its `status` verb answers liveness only), or (tmux, this machine) the visible screen shows a dialog or permission prompt (`evidence: screen`, `screen: prompt on screen`) |
| `ready-for-review` | a report exists whose digest is not `acked_digest` |
| `landing` | any `prs[].last_event` in `enqueued`, `queued`, `merging` |
| `unreachable` | the provider answered `transport_unreachable` for a running thread (ADR 41038 § Failure modes): its transport is down and it keeps running there — never `orphaned`, never listed under `unknowns`; the row carries `unreachable` (the provider's words) and its attach line, and `text` lists it with the attach command; `tick` records nothing for it |
| `working` | live and the provider reports `working` or no status at all (liveness only: an engine Herdr does not detect), or (tmux) the screen shows an activity line (`evidence: screen`); a tmux screen that says nothing readable leaves liveness alone as the verdict and the row says `evidence: liveness` |
| `idle` | live and the provider reports any other status (`idle`, `done`, `unknown` — the groups host-manager's own `list` row gives them), or (tmux) the screen shows an empty composer with nothing running, or `status = exited` with its report acked, or `status = stopped` |
| `proposed` | `status = proposed` — written by `propose`, not yet opened by `go` |

A `group` on host-manager's `read` line (the msp provider's own state:
`working|waiting-on-you|idle|unknown`) decides before any screen reading;
`unknown` falls through to it (before it was read, every msp
thread read `working` by liveness alone). A tmux or msp provider's `status` knows liveness only, so for a live local thread the
helper reads the visible screen once (host-manager `read <ref> --tail`) and
judges it: known dialog and permission-prompt lines, the engine's activity
line, an empty composer. A thread whose provider could not answer has no
group: it is listed under `unknowns` with `unknown_reason` (the provider's
own words) and named in `text` with its machine and last known status.

## The tracking ledger

`tracking.json` (schema `agents-tracking/v1`) is the project's progress
ledger — pointers and checkpoints, never task truth (issues, PRs and
artifacts stay authoritative), written under the same project lock as
`state.json` by atomic replace, rebuilt from the records when missing, and
loud when it cannot be read: every verb that touches it then answers
`tracking_error` (the path and the cure — move the file aside; the next tick
seeds a new ledger from the records and the earlier series is lost) and the
status table is that one line, never an empty table. It holds:

- `workstreams`: `{<id>: {id, title, source_ref}}` — `id` is the title's
  slug, `title` and `source_ref` the proposal's; `threads`: `{<thread id>:
  <workstream id> | null}`. Both are rebuilt from the records (`workstream`,
  `workstream_ref`) on every write: a workstream groups the status table
  and nothing else — never a session name or a label segment.
- `observations`: `{<thread id>: [point, …]}`, append-only — one point per
  running thread per `tick` (unchanged values included: a flat series is the
  stuck evidence), one point at `ack` and `accept` for that thread, and one
  transition point when a thread's status changed since its last point
  (stopped, exited, orphaned, done — the series ends there). A point:
  `at`, `group`, `status`, `live`, `self_reported` (`{value, basis, source:
  report}` or null), `artifact_rung` (`{value, basis}`), `calibrated`
  (`{value, basis, rung, at}` or null), `progress` (the one shown value,
  below), `current_action` (the report's `STATUS:` line), `pending_question`
  (an open entry's fingerprint or null), `blocker` (the report's
  `BLOCKED(HUMAN):` line), `evidence` (PR URLs with their last event, then
  the `accept` evidence), `flags`.
- `pending_questions`: `[{fingerprint, thread, text, surfaced_at, status,
  closed_at, relay_state, asked_at, relay}]` — one per question: a report's
  `BLOCKED(HUMAN):` line (`report:<id>:<digest>`) or a dialog on the screen
  (`dialog:<id>:<stamp>`, once per transition). Open until the thread moves
  on — the next report supersedes the line, the screen leaves the dialog, or
  the thread is done — which is the answer's delivery as seen from here;
  `ack` closes nothing (the user still has the question). A report question
  carries its relay lifecycle (#44029, § `relay`): `relay_state` is
  `blocked-unasked` at open, `asked-relay-owed` once the ask (or an answer)
  is recorded, `relayed-awaiting-worker` once the relay's send is delivered;
  `asked_at` is the recorded ask and `relay` the recorded receipt
  (`{thread, fingerprint, answer, at, send}`), both `null` until then. A
  dialog entry's three relay fields are `null`: it is answered at its
  screen, never relayed.

**Artifact rung** — the evidence value from the record's facts alone,
never from a claim: `proposed` 0; opened with no PR 25 (`no PR yet`); a PR
open (any event but a landing or `merged`) 50 (`PR open`); `enqueued`,
`queued` or `merging` 90 (`landing`); `merged` 95; `status: done` 100
(`accepted`). Several PRs take the lowest, the basis counting the merged
ones. **Shown value** (`progress` on a row and a point): the coordinator's
`calibrated` value while the rung it was judged against still holds — evidence
that moved since (a merge, an accept) supersedes it until the next `ack
--progress` — else the rung itself; never above the rung, and a
`self_reported` value never raises it (the user sees one value; the two raw
tracks stay in the ledger for the coordinator).

**Series facts** on every `context`/`overview` row: `elapsed_s` (since the
open), `quiet_for_s` (since the series last changed — the first point of the
trailing unchanged run; since the open before any point),
`pending_question` (the open entry or null) and `flags`, candidate facts the
coordinator judges: `flat` (the trailing unchanged run spans at least the
project's `stuck_scans` wake rounds — ticks at which another thread's point
changed, never raw ticks; no setting, no flag),
`regressed` (the thread's own `Progress:` fell below its earlier one, or the
artifact rung fell below its peak — a lost artifact; never the coordinator's
own downward `ack --progress`, which is its judgment, not the thread falling
back). No universal threshold is coded, and the
helper estimates no finish time: the facts are the series, the rung and the
elapsed time, and the reading is yours.

**Status table** (`overview --table`; `overview`'s `table`; the tail of
`context`'s `text` every wake — rendered by the helper, never hand-typed):
`<slug>: N threads · L landed[ · A accepted]` — `landed` counts threads with
a `merged` PR event, `accepted` the `done` ones without (shown only when
any; "2 of 3 landed" echoed to a user who said do not
merge); under each workstream title (`other:` for
the rest; no headers when no thread has one) one row per thread — the
name-first cell `<name> (<engine>) [<id>] · PR <n>` (the session name only
inside an attach command), the bar `██████░░░░ 60% <basis>` of the shown
value, the ETA with its basis, the group and `quiet <time>` — then at most
two footer lines (`landed L of N[ · accepted A] · inbox K pending · wake <tier>`; `flags:
…` when any) and one `Needs you: <name> (<engine>) [<id>] — <question>` line
per open question, a dialog's with its attach command. `overview` also
answers `needs_you` (the open entries), as `context` does.

## Inbox events and idempotency keys

An event is `{schema: "agents-event/v1", key, kind, at, thread, text, data}`.
`inbox put` files it once per `key`; a second `put` with a key already in
`inbox/new/` or `inbox/done/` is `duplicate` (exit 0, `deduplicated: true`,
nothing written). Key shapes, one per source:

| source | key |
| --- | --- |
| a thread report | `report:<thread>:<sha256 of report body, 12 hex>` |
| a PR event | `pr:<head sha>:<event>` (`checks_failed`, `review`, `enqueued`, `merged`, `conflict`, …) |
| a thread status change (`tick`) | `thread:<thread>:<status>:<opened_at>` |
| a thread that turned waiting-on-you (`tick`) | `thread:<thread>:waiting-on-you:<stamp>` — text carries its attach command; once per transition |
| an outside subscription | `sub:<source>:<seq>` |
| the user or the coordinator by hand | `user:<any text>` |

On the inbox path (ADR 41038 D1; `wake_path: inbox`) a `report` event and a `pr …:merged` event are also sent to the coordinator's session as an `agents-message/v1` message — the fast path beside the Monitor's WAKE line, which still names the same event — and a copy filed with `inbox put --message` uses the message's own `key:`: a copy delivered twice, or one the Monitor already named, files once.

## `doctor`

```
doctor [<slug>]
```

`healthy` (0) or the first thing missing (`needs_user_action` 5,
`no_host_manager` 4, `sandbox_blocked` 5). `checks` rows: `python`,
`projects_home` (writable), `host_manager` (found, its own `doctor`
outcome), `tmux` (only when host-manager's `list` fails after a healthy
doctor: `fail` with `sandboxed: true` when the socket answers `Operation
not permitted` — a sandboxed shell, which cannot open, read or stop
sessions; `warn` with the reason otherwise), `fleet_manager` (found or
absent — absent is `warn`, remote threads unavailable), `git`, `gh` (absent
is `warn`: the follow thread needs it), `wake` (`candidates`: which of
`monitor`, `systemd-run`, `launchctl`, `crontab` exist here — facts, the
coordinator picks and arms). `capabilities` carries `unattended_flag` when
host-manager's `open --help` advertises it (one probe). `sandbox_blocked`
(5): `next` names the escalated shell (`sandbox_permissions:
require_escalated`) or a coordinator session without the sandbox; `init`,
`propose` and `context` keep working from the sandboxed shell. Under
`sandbox_blocked`, run `init` and every later verb in the escalated shell
(the recorded coordinator must be the shell that runs `go`): this shell
cannot reach the tmux socket. With a slug: the project's folder, its
coordinator record and wake arm (`wake_path: inbox` on the inbox path only).

## `init`

```
init - [--done-means TEXT] [--slug S] [--repo DIR …] [--max-parallel N]
       [--goal "<the task in the threads' words>"]
       [--unattended|--attended] [--start-threads propose|auto] [--engine muse|claude|codex] [--detach] [--asked-by WHO] <<'EOF'
<the user's message, whole>
EOF
```

`init -` reads the task from stdin, the way `propose --threads-json -`
reads its JSON: a quoted heredoc keeps the user's backticks and `$(…)` as
text; never inside double quotes: a backtick or `$(…)` in the user's words
runs as a command in their clone; never edit the message to make it
shell-safe. The user's words are the whole message — every numbered
requirement, quoted string and sentence that defines a PR, merged, a test
command or an origin, not its title: the follow brief quotes them from `##
Goal`, a paraphrase loses them. `init "<message>"` in double quotes let the shell run a backticked
`python -m pytest -q` inside the user's clone and store its output as the
goal, and the other coordinator stripped all 70 backticks to avoid that. Positional words are still accepted; a message among
them that carries a backtick or `$(` answers `warnings:
[{kind: `task_on_the_command_line`, text, next}]` with `next` = `pass the
message on stdin (init -)`, the line's own `next` opening with the warning —
recorded as received, never refused. `init -` with empty stdin is `usage`
(2), nothing created.

Plain `init` makes the folder and records you, this session, as
coordinator; its answer carries `doctor`'s checks. Keep `--slug` short — 24 characters at most: the slug prefixes every
session name (`<slug>-<id>`), and a 63-character name wraps at 80 columns
and eats the Monitor row. Creates the folder: `PROJECT.md` with `## Goal` from `--goal` — the task in
the threads' own words, yours to write: `## Goal` is what every thread
reads, and a thread that reads the sentences addressed to you ("propose the
threads and wait for my go", "you coordinate", "do not do the work
yourself") becomes a coordinator, so leave them
out. Without the flag the message stands as the goal, unchanged. The
message as typed is kept whole under `## Request` either way —
`## Done means` from `--done-means` (the evidence that ends the project;
empty without the flag — the coordinator then writes it before any
thread), `## Repositories` from `--repo` (default: the repository root walked
up from the current directory), `## Settings` from the flags; empty
`MEMORY.md`, `TASKS.md`, `threads/`, `library/`, `inbox/`. No other heading
is written. A second clone is a second `--repo`: the helper counts two
checkouts as one repository only when they share a `.git` common directory
(a worktree does; another clone does not). Records this session as the coordinator
(`state.json.coordinator`: `kind: session` with `MUSE_LANE_BACKEND` /
`MUSE_LANE_REF` when present, else `kind: process` with `user`, `host`,
`pid` — the coordinating process, the nearest ancestor of the helper that
is neither a shell nor a python interpreter (a `python3` that is a launcher
forking the real interpreter is the helper's own per-call parent, never the
coordinator) — its `command` and `started` stamp, which `resume` and
`context` check on the same host through `/proc` on Linux, `ps` elsewhere). A caller that runs `init`
for a coordinator session it opens afterwards says so with
`MUSE_AGENTS_ROLE=launcher`: no identity in its own process tree is that
session's — the walk climbed to the launcher's own TUI and the opened
session's `resume` met a live coordinator — so
nothing is recorded (`coordinator: null`, a `progress`
line says so, `next` = `resume <slug>` from that session) and the first
`resume` binds. `--slug` defaults
to a slug of the task's first words; a taken slug is `slug_taken` (3) with
`next` = `resume <slug>`. A task without `--slug` that starts with
`resume`, `continue`, `reopen` or `pick` (or is one word) and names an
existing project is `resume_instead` (3, nothing created, `next` =
`resume <that slug>`): a fresh session asked to pick a project up never
makes a stray one. The coordinator is recorded as the session
host-manager opened it in (`MUSE_LANE_BACKEND`/`MUSE_LANE_REF`); else, inside
tmux, as the TUI's own pane (`$TMUX`, `$TMUX_PANE`) — from its sandboxed tool
shell and its escalated shell alike, which see different processes but one
pane (a default-mode coordinator's auto-approved `init`
recorded the pane, its approved `go` came as a process, and the first `go`
was refused) — probed through host-manager `list` on that tmux server (a live
row naming the pane); outside the sandbox the process (pid, start stamp)
rides on the pane record, and a project that recorded a process accepts the
same process seen from its pane; else as a process (user, host, pid, start
stamp) probed through `/proc` on Linux, `ps` elsewhere; inside a sandboxed tool shell (a PID namespace,
where the coordinating process is `pid 2 sh` and no host `ps` knows it)
with no pane that pid is never recorded: the coordinator is `opaque` —
nobody can prove they are it, so `resume` from any session answers
`coordinator_unknown` until the human's words take over; a `progress` line
says which. `--detach` opens a coordinator session through
host-manager `open` with a starter that loads this skill and runs `resume
<slug>`; the receipt carries that session's identity. `--detach` requires
`--unattended` (`usage`, 2, nothing created, without it — even when this
session itself runs approvals-off: nobody sits in a detached coordinator,
so that word stays the user's own, never inherited): nobody answers a
detached session's prompts, so it opens with `--unattended`
(`coordinator.posture_applied: unattended`; `provider_default` with a
`progress` line under a host-manager that predates D16). The detached
coordinator gets the same settings as the session that opened it (owner
ruling 2026-09-20; ADR 38715 D15/D16): `--env MUSE_EXPERIMENTAL_AGENTS=on`
and the launching session's own `--model`, `--reasoning-effort`,
`--provider`, `--preset`, `--base-url` and tool-call switches as
`--engine-arg=--flag=value` tokens, read from that session's command line
(the coordinating process's argv; never its posture flags, workspace,
worktree, resume or prompt as engine args — the approvals-off flag there is
read for the threads' inherited posture, Amendment 6); where the command line cannot be read (a
sandboxed tool shell, a launcher that is not a Muse session) nothing is
guessed. `initialized` (0): `slug`, `path`, `coordinator`, `settings`,
`created: true`, and with `--detach` `launch_settings` (`env`,
`engine_args`, `engine_args_source`: `launcher argv` or the reason none
could be read; `binary`, `binary_source` and, when PATH `muse` stood in,
`binary_fallback`: the detached coordinator runs this session's own
binary — `MUSE_BIN`, else this session's command resolved — never a
stale `muse` on PATH without saying so). The line also carries what the first turn used to fetch
in four more calls (`doctor`, `context`, a
`PROJECT.md` read and edit around every `init`): doctor's `checks` and
`health` (`{"outcome": "healthy"}`, or doctor's refusal as `outcome`,
`error`, `next` — `no_host_manager`, `sandbox_blocked`, host-manager's own
word — reported, never raised: the folder is made either way), and the
picture `context` would return for the new project (`project`, `memory`,
`tasks`, `threads`, `inbox`, `coordinator`, `wake`, `host_manager`, `text`;
`changed` and `since_last_context_s` are `null` — `init` moves no context
cursor, so the go turn's `context` is still a first call). `next` is the
proposal line (`propose <slug> --threads-json -`) when `--done-means` was
given, else `write `## Done means` in PROJECT.md …, then propose …`; with
`--detach` or a launcher, the resume line as before. A goal turn is
`init --done-means "…"` then `propose`: no separate `doctor` or `context`.

**Wake path (ADR 41038 D5).** `init` reads `TBH_AGENTS_SESSION_PROTOCOL` once
(1/on/true/yes, any case); no later verb reads the flag, so a project keeps
its path until archive. Off, or unset: today's behaviour byte for byte — no
key is written, and a missing `wake_path` reads as the Monitor path. On: the
helper resolves this session in the local Muse session list (`muse
session-message list --json`; `MUSE_AGENTS_SESSION_LIST` overrides the
command): exactly one row under this process's workspace label (or the
lane's own `session_name`) is the report target, recorded as
`inbox_target` (with `inbox_label`), `wake_path` is `inbox`, and a
`progress` line says so; the wake loop is written and the wake arm stays
today's — the Monitor wake is the floor on both paths until #41228 (round 21
B1: a worktree thread's message parks behind the coordinator's admission
card and dies with the thread). No such row — a closed list
(`external_agent_ingress_closed`), none or two under the label — opens the
project on the monitor path with a warning `inbox_wake_unavailable`
(`warnings[]`, its `text` naming the reason, its `next` the Monitor arm). On
the inbox path the `init`, `context` and `resume` lines carry `wake_path:
inbox` (`resume` also `inbox_target` and `resubscribed`); on the monitor
path they are today's lines and today's `state.json`, key for key
(FR-41038-5).

## `context`

```
context <slug>
```

The whole picture in one call, for one coordinator turn. It changes nothing but its own `changed` cursor in `state.json`
and, like `tick`, types a PR queued on the follow record once that thread's composer is free (`follow_delivered`, the
URLs typed this call; see `follow`)
(`last_context` when the caller is the recorded coordinator, or when that coordinator has no stable identity — `opaque`,
nobody can be told from it; a session that is not it reads the same picture on a cursor of its own under
`context_cursors.<kind|identity keys>` — the keys `resume`/`not_coordinator` compare; opaque callers, which have none, get one
row per user and host — so
a second TUI's `resume` or a shell's `context` never consumes the coordinator's deltas: each caller sees a change once; at
most eight stranger rows are kept, the oldest look dropped first, and an evicted caller's next call reads as a first call):

- `project`: `slug`, `path`, `goal`, `done_means` (empty string when the
  coordinator has not written it — write it first), `scope`, `repositories`,
  `standing_instructions`, `settings`;
- `memory`: the `MEMORY.md` headings with their dates (the index, not the
  text);
- `tasks`: the `TASKS.md` lines with `done: true|false`;
- `threads`: one row per thread: the record fields (`attach` included) plus `live` (host-manager
  or fleet-manager `status`, `null` when it could not answer), `agent_status`
  (Herdr's, or the tmux screen verdict), `group`, `evidence` (`screen` or `liveness` for a tmux thread), `screen` (what the screen showed), and the ledger facts — `artifact_rung`, `self_reported`, `calibrated`, `progress` (the one shown value), `elapsed_s`, `quiet_for_s`, `eta`, `flags`, `pending_question` (§ The tracking ledger); a
  provider that cannot answer narrows `coverage`, lists the thread under
  `unknowns` instead of grouping it and puts its words in `unknown_reason`;
- `inbox`: `pending` (the events in `inbox/new/`, oldest first) and
  `pending_count`;
- `worker_notes` and `repainted` (FR-43932-6): the herdr worker gate's
  pending notes for this project — a worker under a live coordinator
  reports `unknown` instead of `idle`/`blocked`, and each gated report
  leaves one note (`pane`, `server`, `machine`, `slug`, `kind`, `at`,
  `seq`) in its project dir (the coordinator's own, or the thread
  machine's for a split-machine thread, read through the copy channel);
  work a note like any other thread event, and relay a note's question
  with `relay`, never an answer of your own. When the recorded
  coordinator is dead, a note older than 45 minutes is repainted here
  (a fresh `idle` for its pane, `seq` one more than the note's) and
  listed under `repainted` (`delivered: false` names a machine whose
  socket did not answer — the note stays pending);
- `coordinator`: the recorded coordinator and whether it is this process;
- `wake`: the recorded arm (`tier`, `command`, `armed_at`, `armed_by`,
  `means` — what that tier does for the coordinator session, repeated in
  `text` —, `env` and `tick_command`) or `null` — a `null` arm means nothing
  will wake this project; the coordinator arms one (`tick --arm`) or says so;
- `changed`: what moved since this caller's last `context` call (thread
  groups, new events, memory entries, tasks); the first call has nothing to
  compare against and says so;
- `plan_lines` and `channel_line`: the ☐/✅ list to post under the wake
  line, as printed (§ `go`);
- `since_last_context_s`: whole seconds since this caller's previous
  `context` call (`null` on the first); when nothing moved and it is under a minute, `text`
  ends `nothing moved since <n> s ago` — a fact, not a refusal;
- `unchanged_for_s`: whole seconds since this caller's picture last differed
  from the look before it (`null` on the first call, `0` on a call that
  reports a change): how long nothing has moved, as a number (coordinators
  slept in-turn 50-75 % of their active time);
- `host_manager`: the exact host-manager command prefix this helper uses for
  its own calls (`--tmux` included when `MUSE_AGENTS_TMUX` is set), so your
  own `send`/`read`/`resources` calls reach the same server; `null` when no
  host-manager is beside the skill;
- `text`: the same picture in a few lines, safe to read to the user — each
  thread row `  - <name> [<id>] (<machine>): <status line, or the status
  word>`, the name first and the id in brackets once; a
  thread without a group is a line under `unknown` with its machine, the
  provider's reason and its last known status — a machine that is down reads as a machine down, never as a missing row, then the status table (below);
- `needs_you`: the open `pending_question` entries, oldest first (a `BLOCKED(HUMAN):` report no tick has ledgered yet included);
- `next`: the inbox moves in order (never `inbox drain`: this call read
  them); a `ready-for-review`
  or `waiting-on-you` thread whose report event is already read gets the
  same moves (`follow`, the question, `ack`) from its record, whatever
  `changed` says — never `nothing moved; end the turn` while a report is
  unread.
- `tracking_error`: only when `tracking.json` cannot be read — the path and the cure; the table is that line then.

Every call answers the whole picture. A look with nothing moved carries the
facts that say so — `since_last_context_s` (since this caller's previous
`context`), `unchanged_for_s`, `context_call` (this cursor's looks since
anything moved) — and, from the second, the `text` line
`nothing moved since <n> s ago — look <N> since anything did; <what brings
you back>` (the Monitor with its arm time, the scheduler or passive words,
or the arm hint when no wake is recorded). Whether that is a second look in
one turn is yours to read: the helper keeps no clock-based same-turn guess
(text and a hint, no guard).

`no_such_project` (3) names the folder that is missing; `next` is `init`.
`"archived"` (3) when the slug was archived: `"archive_path"`, `"archived_at"`,
`next` reads the archived `PROJECT.md` (every project verb answers this
way for an archived slug).

A Monitor nobody installed (`tick --arm monitor`
recorded, no Monitor tool call, two reports unread ten minutes): when the
record says `tier: monitor`, `library/wake.lock/pid` names no live process
and the arm is older than 15 s (the loop writes its pid in its first
second), `text` leads with `wake: monitor armed on record, but no loop is
running` and `next` opens with `call monitor(<the recorded command>) now`
(the recorded line when it is a `monitor(...)` line, else the ready line
wrapping it). A fact, never a disarm: the record stands.

## `propose`

```
propose <slug> (--threads-json PATH|-) [--replace]
```

Records the coordinator's proposal — threads the user has not yet approved.
The JSON is `{"threads": [{id, name, brief, cwd?, repo?, worktree?, machine?,
engine?, engine_args?, model?, effort?, unattended?, kind?, owns?, test_command?, workstream?}]}`: `id` is `[a-z0-9-]{1,32}` and
unique in the project (a taken id is `thread_exists`, 3); `brief` is the one page the thread is told; `workstream` (a title, or `{title, source_ref}`) groups the thread in the status table and nothing else — never a session name or a label — and `propose` writes the assignment to `tracking.json` (anything but a title is `usage`, 2); `machine` defaults to `local`; `worktree` is a
**branch name**: `go` gives a local thread its own checkout of that branch
(created from `HEAD` when the branch is new) beside the repository and
records the path in `worktree_path` (`null` = work in `cwd`; two threads
that write one repository at once each name a branch); for a thread on a
machine the value is passed to fleet-manager `open --worktree` unchanged
(there it names an existing worktree on that machine, Herdr only); a
`worktree` that is not a non-empty string (JSON `true`, a number, a list)
is `usage` (2) naming the field and the accepted shape — judged at
`propose`, so `go` never sees it — and so is a local
thread's string git would not take as a branch name (`branch: feat/x`, a
space, `..`, a leading `-`; `git check-ref-format --branch` judges it, its
words on the line — the string passed and every `go`
failed with git's advice hint as the reason); a thread on a machine hands
its value to fleet-manager unjudged; an `unattended` of `true` or `false` is
the thread's own posture either way, above the project setting and the
coordinator's own (a `false` amendment fell through to
inherit under a `--yolo` coordinator), absent is no word (recorded `null`)
and anything else is `usage` (2); the word is read while the record is
still the proposal's or was opened on it (`posture_source` unset or
`thread`) — a reopened no-word thread re-derives its posture, and a record
proposed before this rule but never opened reads its stored `false` as
attended; `engine`
is `muse|claude|codex|shell` — what host-manager's or fleet-manager's `open
--engine` starts for the thread — and defaults to the coordinator's own
engine (the session this helper runs inside; `muse` when it cannot be
learned): a Claude Code coordinator's threads are Claude Code sessions
unless the proposal says otherwise; any other value is `usage` (2) naming
the four; `engine_args` is a JSON list of strings, the engine's own
arguments, passed one `--engine-arg` each (a flag it names is the thread's
own choice: the coordinator's inherited copy of that flag is dropped, so
the engine never sees it twice); `model` and `effort` are Muse
flags — on a thread whose engine is not `muse` either is `usage` (2),
pointing at `engine_args` — and the launcher's own Muse flags (`--model`,
`--reasoning-effort`, …) are inherited by a Muse thread alone, while the
`agents` gate env reaches every engine; `effort`
is one of the engine's tiers (`none|minimal|low|medium|high|xhigh|max|ultra`;
any other value is `usage`, 2, naming them, before anything is written —
the engine exits at once on an unknown tier and every open fails); `model`
is an id the engine can open here: one the catalog it cached at its last
start lists (`model-catalog/` under its data root, every provider and
profile) or the launching session's own `--model`; any other value is
`usage`, 2, naming the accepted ids, before anything is written (the engine
checks nothing itself: a name it cannot resolve dies at the thread's first
call, after the thread opened, and the thread ends `orphaned` with no
report); when neither source is readable a set `model` is `usage` too,
saying so — leave it unset and the thread inherits the coordinator's;
`kind` defaults to `work` — a `kind: follow` row with no PR is recorded but
never opened by `go`; the line's `text` and a `progress` line say so and name
`follow <slug> --pr <url>`, which opens the follow thread at the first `PR:`
line (opened from the proposal, it polled from t=0 with
nothing to follow); `owns` is a JSON list of paths (one string is
taken as a list of one) — the files this thread alone writes; `go` writes
them into every brief of the project (`You own: …` for the thread, `Siblings
own: <id>: …` for the others), so two threads that both name `CHANGES.rst`
are seen before they conflict; `test_command` is one
string, the command that runs the repository's tests, written into the
brief as `Test command: …` (either field of a wrong type is `usage`, 2,
before anything is written). Each thread is written with `status: proposed`.
`--replace` rewrites a thread that is still `proposed` in place — the
requester changed the split, the brief is narrowed — keeping its
`proposed_at`, its `attempts`, and — for a local thread only — its
`worktree_path` when the rewrite names the same branch, the same repository
(`repo`, else `cwd`, compared canonically on both sides through `repo_root`,
so a record written with a trailing slash or a symlink still matches) and
the same machine (the checkout a failed open made is this thread's own;
another branch, repository or machine drops it and a `progress` line,
printed only when the batch is written, names the checkout left behind) —
and stamping `amended_at`. A thread on another machine keeps `repo` as
spelled, never resolved on this disk, and never keeps a checkout on this
disk. The thread's own checkout, given as `repo` or `cwd`, names the same
repository.
A work thread's brief ends at its push and the `PR:` line; the landing
words and the follow row belong to `references/roles.md` § Implementer, and
the receipt says whose the landing is. A `--threads-json PATH`
outside the project folder (a shared `/tmp/threads.json` was overwritten by
another coordinator within minutes) is read and
answered with a `warnings` entry too (`kind: threads_json_outside_project`,
`next` = `pass the JSON on stdin (--threads-json -)`). A warning refuses
nothing; `warnings` is absent when there is none.
A thread that ran is `thread_exists` (3) with or without the flag. `proposed` (0) with `threads`
(id, name, machine, `replaced`) and `next` = `show the list to the user;
plain goal (one reading, nothing irreversible or outside the repository before
the first report) → go <slug> <ids…> in this turn and tell the user the plan;
else ask whether to open them, END the turn, and on any yes of theirs
("unattended" is a posture, not consent) → go <slug> <ids…>` (the bare `go` line
under `start_threads: auto`; 2 of 4 goal turns went
propose → go on their own). Nothing is
opened. A local thread that names neither `cwd` nor `repo` takes the
project's first recorded repository (`state.json.repos[0]`, when it still
is a directory) as both — never the process's own directory (a coordinator running from repo A gave project B's threads
worktrees of A) — and a `progress` line says so; a project whose state
predates `repos` keeps the process-directory default.

## `go`

```
go <slug> <thread-id…> [--asked-by WHO]
```

Opens the named threads, one host-manager or fleet-manager `open` each: a
remote thread first gets its worker-gate record copy on its machine
(FR-43932-5: `<projects-home>/<slug>/thread-copy-<id>.json` through the
copy channel, before the prompt is delivered, so the thread's first
stop can already gate; a failed open removes it again) — the copy is
what lets the thread's own Herdr hook report `unknown` to its
coordinator instead of showing the user a waiting dot. What opens is a
`proposed` thread, or a `stopped`, `orphaned` or `done` work thread, which reopens
in place — same id, same record and checkout (its own branch reused dirty
or clean: the dirt is the thread's own work; another branch checked out
there is still `worktree_failed`), a new session, its `attempts`, evidence and
PR rows kept, `ended_at`/`session_ended_at`/`stop_receipt`/`identity_drift`
cleared, `reopened_at` (a record field) stamped, `reopens` counted on the
record (and so on every `context`/`overview` row) and `reopened: true` on its
receipt (a stuck session is not reopened beside: a `running` thread answers
`already_running` and is stopped only on your own judgement). A `done` work thread
named in `go` reopens in place the same way (its session ended at `accept`;
owner ruling 55, #41777): its accepted `report` and `acked_digest` are
cleared, so the plan shows ☐ again and its next report is a new one; a
done thread `go` does not name stays done. Routing (owner ruling 58): a
follow-up about work a thread owns goes back to that thread through this
reopen — its PR, branch or findings; a PR to babysit is the follow
thread's (`follow --pr`) — and the coordinator does the work itself only
when no thread owns it. The follow thread never
reopens through `go`: `follow <slug> --pr <url>` reopens it itself, outside
`max_parallel` and with its record refreshed, and the refusal's `next`
names that. A proposed `kind: follow` row with no PR to follow is skipped —
`threads.<id>: skipped`, a `text` line, and `next` led by `the follow thread
opens at the first PR: line via follow <slug> --pr <url>` — while the other
ids open; when only such rows are named the call is `empty_follow` (3,
nothing opens, the same `next`). Ids are
required (`usage`, 2, with none): the user's `go` names
threads, so no thread starts on a bare word. Guards, in order, before
anything opens: an id in another status (`exited`) is
`no_such_thread` (3); a `running` id beside ids that can open is skipped
— `threads.<id>: already_running`, a receipt with `already_running: true`,
a `text` line `<name> [<id>]: already running — attach: …` — and the rest
open (a retried go told the coordinator to stop a
healthy thread); when every named id runs already the call is
`already_running` (0): the same receipts and `text`, `next` = the
`host-manager send <ref> --text "<line>" --type --automated` line for each
(a stuck one is `stop`ped on your judgement, never on this receipt); opening
more than `settings.max_parallel` would hold open is a `warnings` entry
(`over_max_parallel`, naming the live threads and the set that fits) and the
threads open: host-manager's `admit` is the capacity gate (D16), and your
`go` is not overruled by this skill's own setting; a
`machine` other than `local` without a fleet-manager whose `open` verb
answers `--help` (one probe per run) is `unsupported` (4) — a rename-only
fleet-manager has the file but no session verbs.

Per thread, in order. A local thread with `worktree` first gets its
checkout: `git worktree add <repo>-threads/<slug>-<id> <branch>` (with
`-b <branch>` when the branch does not exist yet; never `--force`); the
record's `cwd` becomes that path and `worktree_path` records it. A
directory already at the path is reused only when this thread's own
earlier open made it (the record names the path) and it is a clean
checkout of the branch; anything else there — an earlier project's
leftover with the same slug and id, a dirty tree — and a checkout git
refuses (the branch is checked out elsewhere, the parent directory cannot
be written) are `worktree_failed` for that thread — nothing opens for it,
it stays `proposed` with the attempt, its detail (git's own `fatal:` line,
never the `hint:` advice after it) and the thread's `engine` logged — the `progress` lines name the engine the thread runs at the open and in a failure (a helper text that blames the muse binary for a non-Muse thread gets the thread's own engine named after it). Then the brief file is assembled
(`threads/<id>/brief.md`: the project goal and done-means, the standing
instructions, `## The project around you` — the base block the helper
reads at open time (`Repository:`; `Checkout: <cwd> on branch <branch> from
<short base sha>` from one bounded `git rev-parse` each, the branch being
`worktree` when set; `Remote: origin <url>` when the checkout has one; `You
own:` / `Siblings own:` from the proposals' `owns`; `Test command:` from
`test_command`; a thread on a machine gets the repository and branch as
spelled and no git probe), then `MEMORY.md` and `TASKS.md` pasted verbatim
when each body is under 2 KB, `is empty` when it has no body (never "read
it" for an empty file: every thread opened on that read), else
named with its entry count and size, then the sibling threads as they stand
at that moment (id, name, state, the first sentence of its brief, at most 200 characters — never the whole brief) — the coordinator's `brief`, the thread rules the helper writes (the brief's `## How to work` section;
`threads/<id>/brief.md` has the exact text), the directory to work in, and the exact
`report` command with `--file threads/<id>/report.md` under the projects
home — the report lives in the project folder, never in the checkout); then `open --name <slug>-<id> --cwd <cwd> --purpose …
--prompt-file <brief> --exact-name --env MUSE_AGENTS_PROJECT=<slug> --env
MUSE_AGENTS_THREAD=<id> --env MUSE_AGENTS_ROLE=thread [--env
MUSE_PROJECTS_HOME=…] --env MUSE_EXPERIMENTAL_AGENTS=on [--engine-arg=--model=<m>]
[--engine-arg=--reasoning-effort=<e>] [--engine-arg=<inherited>…] [--unattended]` runs on host-manager
(`local`), or `open <machine> --name … --cwd … --purpose … --exact-name
[--worktree <value>] [--engine-arg=--model=<m>] [--engine-arg=…]
--engine-arg=<the brief text> [--unattended]` on fleet-manager: a tmux
machine has no readiness signal for a prompt file (fleet-manager sends
nothing and says so), so the brief rides as the engine's last argument, the
way the local launcher passes it, on every provider. A `shell` thread takes
no brief as argv on either side (host-manager would run `bash '<the brief
text>'`): its open carries no `--prompt-file` and
no brief argument, the record says `brief_delivery: file` with `brief_path`
(`threads/<id>/brief.md`), a `progress` line names it, and the coordinator
types the line that reads it; every other thread records `brief_delivery:
prompt-file` (local) or `engine-arg` (remote). Posture (ADR 38715 D16 as
amended by Amendment 6), local and remote alike: the requested posture is
the thread's own `unattended` (`true` or `false` — an explicit `false` is
the thread's attended word), else the project setting when the
user set it (`true`/`false`), else (`inherit`) the coordinator's own — read
from the coordinating session's command line, where Muse
`--yolo`/`--disable-approval`, Claude Code `--dangerously-skip-permissions`
(or `--permission-mode bypassPermissions`) and Codex
`--dangerously-bypass-approvals-and-sandbox`/`--ask-for-approval never` mean
approvals off, any other line means attended, and a line that cannot be
read (a sandboxed tool shell, a launcher that is no known engine) means
attended, said in a `progress` line; the record's `posture_source` names
the rule. `--unattended` is passed when that posture is unattended and the
helper's `open` advertises the flag (`unattended_flag`); nothing is passed
for `attended` (the engine's own prompts; a prompt the thread sits on
surfaces as `waiting-on-you`). An attended local thread in a checkout the
helper made gets the engine's own rules file first, scoped to that
checkout — Claude Code `.claude/settings.local.json` (edits inside it, the
record's `test_command`, git on its branch; kept out of `git status`
through the repository's `info/exclude`); Muse and Codex get none (Muse's
persistent prefix rule at the first prompt is already workspace-scoped;
Codex reads no per-directory settings and its `workspace-write` sandbox
already confines writes; said once in a `progress` line) — recorded as
`allow_list_path`; a file the helper did not write is left alone and said,
and a checkout that cannot take the file opens with the engine's own
prompts, said (`references/allow-list.md` § Thread allow-list). `go`'s `text` says whose posture the threads got
(`threads run with my permission posture: <posture> (<why>)`, then any
thread whose own word differs). The record's `posture_applied` is `unattended` or
`attended` when the helper advertises the flag (D16: a plain `open` is the
engine's own prompts), else `provider_default` with a `progress` line (a
helper that predates D16; its default is not known here).

Every thread gets the coordinator's own settings too (owner ruling
2026-09-20, coordinators and threads alike): the `agents` gate pair on a
local open, and the launching session's engine args as `init --detach`
carries them, except a flag the record sets itself (`model`, `effort`),
which wins; the line's `launch_settings` names the gate pair, the source,
and under `engine_args` what each thread id was actually given. A local
Muse thread runs the coordinator's own executable, handed to host-manager
as `--engine <path>` (`MUSE_BIN` when the session that launched this one set it, else the
coordinator's command resolved); `launch_settings.binary` names it, and a
fallback to `muse` by name is said in `binary_fallback` and a `progress`
line, never silently. A remote thread keeps the bare `muse` of its machine.

The record takes the provider, server, identity and receipt the helper
returned, the **bare** ref (`identity.ref`; fleet-manager's `ref` is the
address `<machine>/<ref>`, which the helper composes itself, once, for
every later `status`/`close`), a `note` the helper gave (in `progress` and
`open_note`), and `status: running`. A repeated id in one `go` opens once.
Every open's `--purpose` ends in `[<instance>]`, six hex digits naming this
project folder (`context.project.instance`; two projects with one slug —
two homes, two coordinators on one host — differ). When `open` answers
`name_taken` for the exact name, host-manager `list` is asked whose the
session is: live, in this thread's directory, with this instance's marker
means it is this thread's own (an open whose record write died) and the
record adopts it (`running`, `adopted: true`; `posture_applied` stays what
the open recorded unless the row states a posture); anything else under the name
— another project with this slug, a stale name — is never adopted or
touched: the attempt is logged and the thread opens under
`<slug>-<id>-<instance>` (a `progress` line says so); that name is this
project's alone, so `name_taken` on it is this thread's own earlier open
and is adopted the same way. A retried `go` whose own checkout is no longer
reusable (dirty, another branch) adopts this thread's live session in it
rather than stranding it.
`started` (0) when every named thread opened or was adopted; `partial` (6)
when some did — `threads` says per id `opened`, `adopted`, `worktree_failed`
or the underlying outcome; nothing is retried. A failed open's `progress`
line and its `attempts[].detail` carry the helper's reason (host-manager's
`message`, e.g. "the lane exited within 1s of launch"; fleet-manager's
`error`; else the last stderr line), never the bare outcome twice, and
`attempts[].next` the helper's own cure when it named one; `partial`'s
`next` is the first failed thread's cure (`<id>: <cure>`), followed by the
wake line only when another thread opened in the same call. The same
reason fills `error` when `init --detach`, `follow` or `agents.py archive`
pass a helper's failure through. `receipts`: one per thread, each with its
`attach`. `mode_line` (host-manager's `mode=<x> (<why>)`: why the thread
landed in tmux, Herdr or msp) rides on the `opened as` progress line, the
record and the `go` receipt, so the coordinator can say it; when the open receipt's `progress` says `msp not chosen: <reason>`
(the session protocol on, msp unusable here) that reason is folded into the
line verbatim — `mode=tmux (msp not chosen: <reason>; tmux; no Herdr server)`
— so a flag-on user reads why the threads are tmux (#41827). `plan_lines` (on `go`, `context`, `tick`, `ack` and `accept` alike, every
look included) is the plan as the user sees it, ready to post as printed: one ☐ per opened
thread, name first, then what it owns (else its brief's first line); ✅ once
its done report is acked — a report with a `PR:` line, or a STATUS opening
with done/finished/complete(d)/merged/pushed/landed, whose digest is
`acked_digest` (a progress report acked stays ☐); ✅✔ once accepted (the
merge decision keeps its own mark: ✅ on `accept` alone flipped one run in
three, because coordinators ack on the wake and accept at archive); a
proposed-but-unopened thread is on `propose`'s `plan_lines` alone — the
plan told before the threads open — and not on the others. `channel_line`
beside it is the one channel `reply` call that posts the list, in the
conversation coordinator's own shape — `reply --to <lane>
--replace-last <<'MSG'` … `MSG`, the lines on stdin (a backtick in a brief
line never runs), `--replace-last` editing the plan while it is the lane's
newest message (post nothing else while the project runs, so it stays the
newest; never a re-post); the lane
fills `<lane>` (channel row: the per-thread list never
reached the channel and the ticked list came as a new message; composed by
the model, the ✅ re-post landed three times in seven).
A local thread whose `cwd` is the worktree this helper made (`worktree_path`)
from one of the coordinator's repositories — the ones `init` recorded
(`state.json.repos`) whose root the user already trusted, in Muse's own
`trust.json` (read-only; never the cwd of the process running `go`) or on
the coordinating session's own command line for this run (`--trust-workspace`
or `--yolo` on the line, and the workspace it trusts — `--workspace <root>`,
else the repository around the coordinator's cwd — is that root; a `--yolo`
session's trust is never persisted, ADR 38715 Amendment 6 item 4; an
explicit `untrusted` record in the store wins over the line) — one `.git` common
directory — inherits that trust and the hooks acceptance that goes with it:
a Muse thread opens with `--engine-arg=--trust-workspace` (project skills,
rules and hooks load for the run), a Claude Code or Codex thread
opens with host-manager `open --trusted` (the engine's own per-directory
trust record pre-seeded, no skip-permission flag) when `open --help`
advertises it (`trusted_flag`), else a `progress` line says the engine's
dialog stands; the record carries `trust_workspace: true` and `trust_reason`
once the open succeeded — a failed open records neither trust field, an
adopted session records `null`; a `progress` line — because the user
trusted that repository, and nobody answers a thread's trust prompt.
Installed-hook acceptance rides separately and to EVERY local thread (ADR
38715 Amendment 9, owner ruling 64): when the coordinator's own Muse
settings file exists (`$XDG_CONFIG_HOME`/`~/.config`, `muse` or `tbh`,
`settings.json`) and host-manager's `open --help` advertises
`--hooks-approved` (`hooks_flag`), the thread's `open` carries that file
and host-manager seeds the thread's own settings file from it where the two
differ — a hook the user changed or refused still prompts; without the flag
a `progress` line says the engine's own hooks review stands. A coordinator
whose launcher vouches for every session below it (its environment carries
`MUSE_AGENTS_LAUNCHER_TRUST=inherit`, which only such a launcher sets) opens
EVERY local thread, any engine and any directory, with host-manager `open
--trusted` as well — the checkout's own trust record, so no thread of such a
session shows a startup dialog of any kind (owner ruling 65); the record
says `trust_reason: a thread of a session its launcher vouches for`. A work
thread at a repository root itself, a worktree of a recorded-but-untrusted
or trusted-but-unrecorded repository, another clone's worktree and any other
directory keep the engine's own prompt (`trust_workspace: false`; the follow
thread's rule is under `follow`). Owner rulings 2026-09-20 (spec
FR-38715-9).
Every opened or adopted thread records `attach`: the exact command that
puts the human in front of its session, as host-manager's or
fleet-manager's own `attach` verb answers it (`tmux -L <server> attach -t
=<name>` with the server flags in force, `herdr agent attach <ref>`, the
machine's form for a remote thread), never composed here; `null` with a
`progress` line when the helper has no such verb; and `attach_inside_tmux`:
the same tmux command with `switch-client` for `attach` (server flags kept;
`null` for another provider's command) — `tmux attach` refuses to nest and a
tmux user is usually inside one (a dead end). Every `text` line
names both: the form for where the caller sits first (`$TMUX` set in the
helper's environment: `attach: <switch-client form> (you are inside tmux;
from outside: <attach form>)`; else `attach: <attach form> (inside tmux:
<switch-client form>)`), and the per-thread receipt carries both fields. `go` returns `attach`
(per id) and `text`: one line per thread — `<name> [<id>]: <first brief
line> — attach: …`, the name first — for the user's post-go message (owner ruling
2026-09-20: a session the user cannot reach feels gone); `next` opens with
"repeat `text` to the user" at every open — a single thread, a reopen — not
only the first go. It also writes
`library/wake.sh` (the helper's wake loop, with this session's tmux
environment and projects home) and returns `monitor_line`, the ready
Monitor line on it — `monitor(command="sh <project>/library/wake.sh",
persistent=true, wake_delay_ms=0, show_lines=true, description="agents
<slug>")`; with no wake armed, `next` says to install that line as printed
and record it (coordinators spent four to five calls composing a
line, wrote it to shared /tmp and chose a two-minute period). The inbox
path (`wake_path: inbox`) changes none of this — the loop and the ready line
are the wake floor (#41228); an `inbox_target` missing since `resume` is
resolved again first.

## `follow`

```
follow <slug> --pr URL [--pr URL…] [--cwd DIR] [--unattended] [--asked-by WHO]
```

The one follow thread per project (`kind: follow` — found by kind, whatever
its id: a proposal's `kind: follow` row under another id is that thread, and
`follow --pr` opens it in place under its own id with its own checkout, never
the proposal's `cwd`, and never a second follow thread beside a live one
(a gone one is replaced under its own id): it babysits
PRs to merge on a `settings.follow_every` cadence — with a local origin (no
GitHub) a PR is a branch pushed to origin and landed means merged into
origin's main; the follow thread drives it, working in its own clone
under the project folder and never checking out, merging or creating
branches in the user's clone; the coordinator and the work threads never
land; its merge gate is the suite green, never a list of accepted
failures — event-first (it reacts to
the first failed check, review threads, conflicts and the queue), self-reviews
each head, enqueues once, verifies the merge on the target branch, and exits
after its report when nothing it follows is open. When no live follow thread
exists, `follow` opens one through host-manager `open` with the follow brief
— its `## Your task` opens with `What this project calls a PR and merged (the
goal's own words): …`, the `## Goal` sentences that mention a PR or a merge
(a branch on a bare origin, a merge into its main), when there are any (the follow thread spent 12-18 turns re-deriving them), and says that on
a target branch with no merge automation the landing is the follow thread's
(merge each PR and push the target by explicit refspec once green — the one
case a thread pushes the target — then file `merged`, never `enqueued`; a
follow thread once stalled 746 s on "I may not push main") — and the PR list
(`following`, 0, `created: true`), its posture — ADR 38715 D16 as amended by Amendment 6: `--unattended` on this verb, else the project setting when the user set it, else the coordinator's own posture (`inherit`; attended when its line cannot be read), recorded as `posture_source`; never inferred from the work threads' postures (per-thread `unattended: true` under an attended project left the follow thread on its staged merge prompts — so put the user's word where the follow thread is decided; `posture_applied` on the record says which, and `go` says it in advance: `follow_posture`, and a `text` line `follow thread: opens <posture> (<why>)` before it exists, `follow thread: live, opened <posture_applied>` — `provider_default` for a pre-D16 record — after a liveness probe says it runs, `state unknown …` when its provider cannot answer; `--unattended` on a live follow thread changes nothing and says so in a `progress` line) and
`--engine-arg=--trust-workspace` for its own directory — a detached
checkout of the coordinator's first recorded repository (`state.json.repos`,
whatever process opens it; a gone one falls back to the caller's repository,
said in a `progress` line when that default is used) that the helper makes
beside the work threads' worktrees, `<repo>-threads/<slug>-follow` (`git
worktree add --detach`; reused when a checkout of that repository already
stands there; the record's `cwd` and `worktree_path` name it, so `agents.py archive`
removes it once landed and clean) — never the user's clone itself (the follow thread merged and pushed from the user's clone and
moved their HEAD four times); when git can make none (a repository with no
commit yet) it opens in the repository after all and a `progress` line says
its HEAD may move — unless `--cwd` names another or the previous
follow record already carried one (a reopen keeps its directory while it
still exists; a gone one falls back to the default above — the first
recorded repository, else the caller's repository — and says so in a
`progress` line; a relative `--cwd` is stored resolved, and a record saved
relative by an earlier helper is treated like a gone one; a project whose
state predates `repos` keeps the pre-field default, the caller's
repository, with no notice) — when that directory is inside one of the coordinator's
repositories that the user trusted in Muse's `trust.json` (a tick or a
detached coordinator that opens it has nobody to answer the trust prompt;
`trust_workspace: true` and `trust_reason` on its record once the open
succeeded; a `--cwd` outside that repository keeps the engine's prompt; a
`--cwd` that is not a directory is refused before any record is written
(`usage`, 2); a work thread gets the flag only
for a checkout this helper made from the coordinator's repository, see
`go`); when one
is live, the new URLs are typed into it as one automated line — host-manager
`send <ref> --type --automated`, never the peer path, which Muse opens only
to a session that has messaged this one first, and a thread this helper
opened never has (`following`, 0, `created: false`, `delivered`, `delivery:
typed`, the receipt on the line — a notification is never delivery, #38715
ruling 18). Every `following` line carries `attach` (the follow thread's
attach command as recorded at its open) and `text`, its one line for the
user — id, brief, attach — like `go`'s; `next` says to repeat it. The record keeps every URL
either way, each row with `delivered: true|false` (a row a thread's own
`inbox put --kind pr` creates is `delivered: true` — it knows that PR; a row
written before this field reads as delivered). The record is the follow
thread's PR list: its brief names the record path and says to read it at
the start of every round, so a PR handed over while it works reaches it
whether or not the typed line does (the line typed
into a mid-turn thread sat unsent on its composer for the whole session).
Before typing, one `read --tail` judges the composer: while the engine runs
or a dialog stands, or while text already sits on the composer, nothing is
typed; that, or a send that is not a clean `sent` receipt at exit 0 —
`composer_not_empty`, `typed_unsubmitted` / `composer_not_cleared` (the text
still on the composer after Enter), any non-zero exit — is `queued` (0) with
`queued` (the URLs), `why`, `underlying` (the send's line, when one ran),
the rows marked `delivered: false`, and `next`: end the turn; the follow
thread reads its record's PR list every round, and the next `tick` (the wake
loop's round included), `context` or `follow` types it once the composer is
free (`follow_delivered` on those lines names the URLs typed; a `follow` call
with a new URL types the queued ones with it); never land it yourself (one
action; no manual `send` line, no attend-the-thread alternative and no
re-run chore — offered three options, a coordinator
merged and pushed main itself). When the composer verdict comes from a
thread whose screen shows it idle — no activity line, no dialog — the answer
is `composer_stale` (6) instead: the thread finished and an earlier
unsubmitted line sits on its composer, which no wait or retry clears (three `follow` calls over 14 minutes were told "mid-turn") —
a line that already sat on the idle thread's composer before any send is
the same case (it read `queued` for 17 minutes and
nothing freed it; `underlying` is then a `composer_not_empty` verdict this
call made itself, the line's text on it); `next` names the line's first 60
characters, says `host-manager send --type` cannot clear or type over it,
and names the stop-then-follow reopen (`stop <slug> follow`, then the same
`follow`; the reopened thread's brief carries the URL) and, again, never land
it yourself. The retry every `tick` and `context` make types nothing on top
of such a line and leads its `text` and `next` with `follow: idle behind an
unsubmitted line ("<its first 60 characters>") that no round clears: stop
<slug> follow, then follow <slug> --pr …`. The typed nudge itself is
`new PR(s) queued in your record: <n>; read <record.json path>` — a count
and the record, never a URL: the Muse composer does not submit a line that
carries a `file://` token (the root cause of the undelivered
hand-offs), and the record is the list the brief tells the
thread to read every round. A screen that says nothing lets the send itself answer.
`delivered: true` is never answered on a receipt that did not submit. A live follow thread
whose recorded `cwd` is no longer a directory is `follow_thread_lost` (6):
nothing is typed into it, the URLs are recorded `delivered: false`, `next`
names the stop-then-follow reopen; `tick` and `overview`/`context` show such a
thread as `lost — its recorded checkout <cwd> is gone` (the WAKE line too)
instead of `running` (the follow thread removed its own
checkout and two PRs were "delivered" into it while the rows said running). After a clean `sent` receipt the helper re-reads the composer once (host-manager `read --tail`): the pasted line still there is `queued` too, `underlying` = `typed_unsubmitted`/`composer_not_cleared` (`sent` answered while the composer held the line, a 991 s stall). A gone record whose own live session the
reopen adopts (`adopted: true`) gets the URLs its brief did not carry typed
the same way — adoption alone never counts as delivery (`queued` with `adopted: true` when the composer is not free). The follow
thread files PR events with `inbox put --kind pr --key pr:<head>:<event>`.
No `--pr` is `usage` (2). A `done` or `stopped` follow thread reopens in
place — done is per PR list, never terminal for the follow thread (`thread_done` left the coordinator building landing threads of its
own): same record, a new session, its `evidence`, `attempts`, report and PR
rows kept, the new URLs appended, `ended_at`/`session_ended_at`/`stop_receipt`/
`identity_drift` cleared and `reopened_at` stamped (`following`, 0,
`created: false`, `reopened: true`; the brief lists only the PRs not yet
merged). A running follow thread whose provider cannot answer is
`follow_unknown` (6) — nothing reopened or recorded, `next` is `tick <slug>`. A gone follow thread (`exited`, `orphaned`) is reopened
as a fresh record (no report, evidence or end stamp; `created: true`) carrying exactly the
PRs the old record had not seen merged plus the new URLs. `--cwd` is the directory the follow thread works in
(default: the coordinator's first recorded repository, `state.json.repos[0]`;
a reopen keeps the previous record's). The follow thread is one per project and
outside `max_parallel`.

## `report`

```
report <slug> <thread-id> (--file PATH|-)
```

A thread's report, written as a whole (`threads/<id>/report.md`; the
brief's `Report:` line is `--file -`, the report on stdin — one shell call,
no file the thread writes itself, the helper keeps the copy — four attach-and-approve trips per project came from editor-tool writes of
that file). The helper
reads the first `PR: <url>` line, wherever the report puts it (a `PR:` line that is empty or says `none`, `n/a`, `-`, `no` or `nothing` is no PR: no row, no rung, no follow hint — `PR: none` became a PR row at rung 50), the last `STATUS:` line, the
last `BLOCKED(HUMAN):` line (a value of `none`, `n/a`, `-`, `no` or `nothing`,
any case, a trailing period allowed, or nothing at all is no block:
`blocked_line` is `null`) and the last `DECISIONS:` line — what the thread
decided that the brief did not fix: a version, a public name, files outside
its list (the same no-decision values, or no line at all, is `null`; a report
from before the line reads as before — where a
removal version and three extra modules passed through unquestioned) — files one inbox event (`kind: report`, key
`report:<thread>:<digest>`), adds a work thread's `PR:` URL to its record's
`prs` as an open row (the follow thread's `PR:` line adds no row: its rows
are the URLs it follows), and moves a `## Remember` section, when present,
to `threads/<id>/remember.md` — never into `MEMORY.md`. A report identical to
the last one is `reported` with `deduplicated: true`. `reported` (0) with
`digest`, `status_line`, `blocked_line`, `decisions_line`, `pr`,
`remember: true|false`, `self_reported` (the last `Progress: NN% — <basis>` line as `{percent, basis}`; no line, or one that does not parse — no percent, over 100 — is `null`, silently: the brief asks for it, the helper never invents it; it is recorded as said and shown only under the artifact rung, § The tracking ledger). `context`'s `next` for a pending report with a decision says `relay <id>'s DECISIONS to the user: …` before the `ack`. `no_such_thread` (3) for an unknown id.

On the inbox path the verb, run from the thread's own shell, then sends the
report as one `agents-message/v1` session message to the coordinator's
session (`muse session-message send --json --target <its id>`, the body on
stdin; `MUSE_AGENTS_SESSION_SEND` overrides the command): first line `WAKE
<slug>: <name> reported: <text>` (the wake line's own words), then the schema
line and `project:`, `thread:`, `kind:`, `key:`, `text:`, `report:` lines, a
blank line, the report text verbatim. The line carries `message` —
`delivered`, `target`, `body`, the CLI's `receipt`, or `error`; `held: true`
when the target session holds it for its own admission (the CLI's
`pending`); `send_with_tool` (`{tool: send_session_message, target, body}`)
when the CLI refused it — today's runtime admits a session message from the
session's own model tool, not from a shell (`unverified_target_receipt`,
`causal_metadata_invalid`; #41210), so `next` then leads with `send
\`message.body\` to session <target> with your send_session_message tool`
and the thread, whose brief says the same, sends it itself; the helper's
own attempt is bounded to a few seconds, so the receipt always comes back
inside the thread's tool window. Any other undelivered send leads `next`
with `not delivered …`. Either way the file and
the inbox event stand, nothing is typed, nothing is retried. A deduplicated
report sends nothing.

## `ack`

```
ack <slug> <thread-id…> [--progress NN --basis TEXT]
```

The coordinator has read the current report: `acked_digest` becomes the
report's digest, so the thread leaves `ready-for-review` /
`waiting-on-you` until the report changes. `acked` (0); `no_report` (3) when
there is nothing to ack. Several ids like `stop` (`ack
<slug> a b c d` was `usage`, then `--help`, then a per-id loop): every id is
checked before any write — one without a report is `no_report` naming it and
nothing is acked — and the line answers `threads` (`digest` per id), `ref` =
`<slug>/<id,id,…>`; one id keeps its shape (`digest` at the top).

The line carries what the coordinator says and does with the report: `decisions_line` (the report's, `null` without
one) and, when there is one, `text` = `Decisions: <line>` (several ids: one
line each, `Decisions: <id> — <line>`) with `next` opening `say this to the
user in this turn: …`; then `warnings: [{kind: `pr_without_follow`, thread,
text, next}]` for every work row with an unmerged PR that no running follow
thread carries, `next` = `follow <slug> --pr <url> — the landing is the
follow thread's, never yours; you run no git in any clone` (the follow
thread's own report, and a PR the follow thread already carries or has
merged, warn of nothing); `next` closes with the end-of-turn words. Facts,
never a refusal: the ack lands either way.

`ack <slug> <id> --progress NN --basis "<why>"` — never above the row's `artifact_rung`; a lower self-report may pull it down — also records the coordinator's judged value — one thread, a whole percent, a basis (what was verified, or the thread's own lower report) — as `calibrated` `{value, basis, rung, at}` and answers it; a value above the thread's artifact rung is `usage` (2) naming the cap and its basis (`--progress 80 is above the artifact rung 50 (PR open)`), and nothing is acked; several ids with `--progress`, or `--progress` without `--basis`, is `usage` too. The ack writes the thread's ledger point (§ The tracking ledger).

A few seconds after a typed steer (`host-manager send <ref> --type`), ONE
`read <ref> --tail`: say what the pane shows (took it / no reaction yet),
never leave it at `typed`; the outcome comes with the next wake.

## `remember`

```
remember <slug> (--text TEXT | --from-thread ID… | --decision TEXT) [--heading H]
```

Appends one entry to `MEMORY.md` (`## <date> <heading>` and the text).
`--from-thread` takes `threads/<id>/remember.md` (the report's `## Remember`)
and removes it once appended; several ids take several sections in one
call, every one checked before any is appended (one
without a section is `nothing_to_remember`, 3, nothing written) — the
answer then carries `blocks` (`heading`, `deduplicated` per id),
`entries` and `receipts`; one id or `--text` keeps the one-block shape
below (plus `blocks`). The coordinator is the only writer: a call from
a thread — `MUSE_AGENTS_ROLE=thread` in the caller's environment — is
`not_coordinator` (3) and writes nothing; the thread's words stay in its
report for the coordinator to take. `remembered` (0) with `heading`,
`entries` (the new count) and `deduplicated`: a block byte-identical to one
`MEMORY.md` already holds under the same heading is not appended again
(`deduplicated: true`, `entries` unchanged; the thread's `remember.md` is
removed either way). Task state — issues, PRs,
`TASKS.md` — is never memory: `MEMORY.md` keeps what the project learned,
not what is open.

`--decision "<text>"` records one settled answer instead: the next `D<n>`
line in `PROJECT.md` § Decisions and in `library/DECISIONS.md` (the threads'
copy), numbered by the helper. `remembered` (0) with `decision` (the label)
and `decisions` (every line, in order; `context`'s `project.decisions` says
the same). It takes neither `--text` nor `--from-thread` in the same call.

A failed `host-manager send` is not a relay: do its receipt's `next`
(`--type`); still failing, say what was NOT delivered, never that it was
forwarded (moved here from SKILL.md step 6.2).

## `relay`

```
relay <slug> <thread-id> [--fingerprint FP] (--asked | --answer TEXT) [--asked-by WHO]
```

The recorded relay of a `BLOCKED(HUMAN):` answer (#44029). A report question's
lifecycle is distinct in the ledger (§ The tracking ledger):
`blocked-unasked` → `asked-relay-owed` → `relayed-awaiting-worker` → closed
(on the worker's next report, as before). `ack` alone moves a question past
none of these states: it reads the report, it does not ask, answer or relay.

- `--asked` records that the coordinator put the question to the user once:
  `asked` (0) with `relay_state: asked-relay-owed` and `asked_at`; nothing is
  sent. `--asked` on a question already relayed is `already_relayed` (3).
- `--answer TEXT` (`-` reads stdin) records the user's answer on the ledger
  entry first, then performs the send — host-manager
  `send <ref> --type --automated --text <answer>` on this machine,
  fleet-manager `send <addr> <text> --type --automated` on a machine — and
  records the receipt: `relay` = `{thread, fingerprint, answer, at, send:
  {outcome, delivery, receipt}}`. Delivered only on `deliver_to_follow`'s
  criterion: a clean `sent`/`typed` line at exit 0 WITH a receipt, and the
  submission confirmed — on this machine a post-send re-read whose composer
  no longer holds the answer (a swallowed Enter is not delivery), on a
  machine fleet-manager's own post-send verify: its `submitted` verdict
  (`submitted: false` is not delivery): `relayed` (0), `relay_state:
  relayed-awaiting-worker`; the question stays open until the worker's
  next report closes it. The whole check → record → send → record runs
  under the project lock, so two concurrent relays cannot both type it.
- A failed send is `relay_failed` (6): the entry stays `asked-relay-owed`
  with the answer and the failed `send` recorded, `next` leads with what was
  NOT delivered and the same `relay … --answer` retry (the answer shell-quoted;
  no re-ask of the user is needed: their answer is on the entry), and
  `context`'s `next` and the WAKE line keep naming the relay as owed until
  it lands.
- No open report question for the thread — or a `--fingerprint` that names
  none, or a `dialog:` fingerprint (a screen dialog is answered at its
  screen, never relayed) — is `no_open_question` (3) and sends nothing.
  Without `--fingerprint` the thread's one open report question is meant.
- Only the recorded coordinator relays (`not_coordinator`, 3, as `accept`).

While a relay is owed, `context`'s `next` names it (`relay owed for <id>
(<fingerprint>): …`) even when the report was acked and nothing else moved —
never `nothing moved; end the turn` — and `tick --wake-line` names
`<Name> relay owed: <question>` for a thread its report segment did not
already name. `needs_you` (in `context` and `overview`) and the status
table's `Needs you:` line carry the entry with its `relay_state`.

A session opened outside this helper — a raw `agentcloudctl` or
host-manager session with no thread record — has no pending question, no
wake and no relay: `relay` refuses it (`no_such_thread` /
`no_open_question`). Coordinators must not treat such a session as a
managed thread; open it through `propose`/`go` when its questions must be
asked and relayed.

## `accept`

```
accept <slug> <thread-id…> --evidence TEXT… [--asked-by WHO]
```

Marks a thread `done` on evidence the coordinator verified — a merged PR
URL, a commit on the target branch, an artifact path, a test run. Several
ids take the one evidence line for all of them, like `stop`: every id is judged before any is written (an unknown id
is `no_such_thread`, a done or never-run one its refusal below, nothing
written), the answer carries `threads` (`evidence`, `decisions_line` per
id) and `receipts`, and `next` relays every thread's decision; one id
keeps the shape below (plus `threads`). Without
`--evidence` it is `usage` (2): a report that says "done" is a claim.
`accepted` (0) with `evidence` and `decisions_line` (the report's, `null`
without one); the receipt records who accepted and when, and `decisions`
when the thread decided something on its own — `text` is then `Decisions:
<line>` and `next` opens with `say this to the user in this turn: …`, and a
`pr_without_follow` warning with its `follow --pr` line follows when no
running follow thread carries the thread's unmerged PR (the same shape as
`ack`, above): the acceptance lands either way;
`next` is `every thread is done: archive <slug>, then end the turn` when
no thread is left in another status, else it names what is still open
before the archive (`<id> (<status>)`, the follow thread included) after
the end-of-turn words.
For a remote thread the answer also carries `copies` (FR-43932-5): each
accepted thread's record-copy disposition — `removed`, `tombstone-left`
(the copy was rewritten `status: accepted` before removal, and the
removal failed; the tombstone already ungates the pane), or
`tombstone-failed` (both writes failed; the copy keeps gating until
its stamp ages past 45 minutes, and the failure is named here, never
silent).
`accept` ends the accepted thread's session the way `stop` does (host-manager
`stop`, fleet-manager `close`; `stop_receipt` and `session_ended_at` on the
record; `session_ended` on each `threads` row and receipt, with
`session_ended_why` when `false` — `no live session`, a stranger's
session's `identity_drift`, or the provider's refusal); the clone, branch, record and evidence stay,
and `go <slug> <id>` reopens the thread in place (§ go; owner ruling 55,
#41777). A provider refusal never un-accepts: `accepted` (0) all the same,
`session_ended: false`, the refusal under that row's `stop_error`
(`outcome`, `error`, `next`), and `next` opens with `stop <slug> <id…>`.
A second `accept` on a done thread is `thread_done` (3) and appends
nothing (a reopened thread is accepted again, its evidence appended); a
thread that never ran (`proposed`) is `not_started` (3). The accept writes each thread's terminal ledger point — `accepted`, 100, the evidence beside it (§ The tracking ledger).

## `inbox`

```
inbox put <slug> --kind KIND --key KEY [--thread ID] [--text TEXT] [--json JSON]
inbox put <slug> --message (PATH|-)
inbox drain <slug> [--ids ID…]
```

`put` files one event under its key (`filed`, 0, `created: true`) or answers
`duplicate` (0, `deduplicated: true`) when the key was seen — in `new/` or
`done/`. `--thread` is resolved before anything is written:
`no_such_thread` (3) for an unknown `--thread` files no event. A `pr` event with `--thread` updates that record's `prs[]`
(`last_event`, `head`). Your own `context` already reads (drains) the events it returned, so a wake
needs no `drain` call of its own; a stranger's `context`
reads nothing, as its own cursor already promises. `drain` stays for the
events you want cleared by hand and for a caller that is not the recorded
coordinator. `drain` returns the pending events (all, or the named
ids) and moves them to `inbox/done/` — the coordinator's "processed"
(`drained`, 0, `events`). An empty inbox is `drained` with `events: []`.
The line also carries `unacked_reports` (thread ids whose newest report
is neither acked nor accepted, newest first) and, when there are any,
`next` opens `<n> report(s) unread — <Name> [<id>], …: read
threads/<id>/report.md, then ack …` — a drain empties the inbox, not your
reading; an unread report stays on the WAKE line (four reports drained
together, three acted on, the fourth never named again: #38715).

`--message` files a message that arrived by session delivery (ADR 41038 D1:
a thread with no folder here) under the message's own `key:`: `filed` (0;
for a `report` the text after the header is written to
`threads/<id>/report.md` and read the way `report` reads it, `digest` on the
line) or `duplicate` (0, `deduplicated: true`) when the key was seen — the
same copy delivered twice files once. A body that is not an
`agents-message/v1` message, or one for another project, is `usage` (2); a
`thread:` the project lacks is `no_such_thread` (3); nothing is written
either way. On the inbox path a `put --kind pr` whose key ends `:merged`
also sends the event to the coordinator's session (`message` on the line);
every other pr event is the follow thread's own and wakes nobody.

## `tick`

```
tick <slug> [--arm monitor|scheduler|passive [--command CMD] [--one-shot] [--monitor-failed LINE]] [--disarm] [--asked-by WHO]
```

The coordinator's cadence mechanics, safe to run from a timer:

- refreshes every live remote thread's worker-gate copy stamp
  (FR-43932-5: `coordinator_seen_at` on this round's 30-second cadence,
  update-in-place through the copy channel — a live coordinator keeps
  its workers gated by cadence, not attention; a dead machine's copies
  simply age, and the tick never stalls on one);
- refreshes every open thread's liveness through its provider; a thread that
  is gone after a report becomes `exited`, gone or mismatched without a
  report becomes `orphaned`, and each change files one event
  (`thread:<id>:<status>:<opened_at>`), so a repeated tick files nothing new.
  A remote session fleet-manager no longer lists (`no_such_session` from
  `status` on a reachable machine) is gone; one whose live identity (`cwd`,
  `engine`, …) no longer matches the record is a stranger under the
  thread's name — gone for this thread (`identity_drift` on the record),
  never stopped; a machine that cannot answer leaves the thread unknown;
- reads each live local thread's verdict the way `context` does (Herdr's own
  status, or host-manager's `read --tail` judgment plus the activity mark)
  and files one event when a thread turns waiting-on-you
  (`thread:<id>:waiting-on-you:<stamp>`, text with its attach command), so
  the watched `text` changes once for a dialog or permission prompt too;
  `last_agent_status` on the record keeps it to once per transition; and
  one when a live thread has read `idle` (an empty composer, nothing
  running; Herdr's or the msp provider's own `idle`) on two rounds in a row
  with no report the coordinator still has to read — none filed, or its
  newest acked and not done — `thread:<id>:idle:<spell>` (the record's count of idle spells), text `<id> went
  idle without a report — a question may be waiting on its screen; read it
  once` with its attach command, once per idle spell (`idle_rounds` on the
  record; one idle round is a fresh TUI's empty composer, not news). A
  question typed on a thread's screen, or a thread that stopped without
  reporting, was silence before this (AUDIT-AGENTS-WAKE, #38715: four
  minutes of `--wake-line` printed nothing while the question sat there);
- writes the tracking ledger (§ The tracking ledger): one point per running thread from what this round already holds (the record, the liveness verdict, the report, the PR events), a transition point for a thread whose status changed, the workstreams and the pending questions synced; the wake loop's `--wake-line` tick is a round too. A ledger that cannot be read is `tracking_error` on the line and a `tracking: …` progress line; the tick's own work still lands;
- every round, `--wake-line` included, types a PR queued on the follow record once that thread's composer is free (see `follow`; `follow_delivered` on the JSON line, nothing on the wake line: a delivery is no news);
- `--wake-line`: the wake loop's mode (`library/wake.sh` runs it every 30 s);
  each pending event renders as `<name> reported: <text>` (a pr event
  `<name> pr <event>: <text>`), the name from the thread's record and the
  key kept in the JSON `inbox` — the JSON tick's `text` rows read
  `  - <name> [<id>] reported: <text>  (<key>)` — no
  JSON; one line `WAKE <slug>: <segment>[; <segment>…]`, the event segments
  newest first whatever their kind — `<name> reported: <text>`, `<name> pr
  <event>: <text>`, `<name> thread: <text>` (a thread that turned
  waiting-on-you) — then `unknown: <ids>` and `<name> lost: …`, and one
  report per thread, its newest (an older unread report of the same thread
  stays in the JSON `inbox`, off the line: the first digest led every WAKE
  while the later reports were the news, past the
  ellipsis at 80 columns; the JSON `tick` is not curated),
  when there is news, nothing otherwise, identical while the news is, so the
  loop's last-line guard prints it once and again when the same news returns
  after a quiet spell; the records are news too: every thread whose newest
  report is neither acked nor accepted (`ready-for-review`, `waiting-on-you`)
  is one `<name> reported: <text>` segment on every tick until `ack`/`accept`,
  whether or not its event is still in the inbox (an `accept` shrinks the
  line, so the loop wakes you again for what is left — a drained, unread
  report is never silence); one segment per thread: its `reported` words win
  over its `moved` watch events (a ready-for-review or blocked transition
  repeats that report), else only its newest `moved` shows, and `pr` events
  stay; the line holds `WAKE_LINE_BYTES` (500) — whole segments newest
  first, then `+N more unread` for the ones that did not fit, so a thread is
  never silently dropped past the note's fold (the JSON `tick` keeps every
  event whole); a tick the loop cannot run at all (exit 126/127) is one
  WAKE line saying so; on an archived or unknown project it prints nothing and exits 0 (a loop installed before the
  folder went away must not print the refusal as news); a `pr` event the follow thread filed about a PR it
  follows is not news until it says `merged` — checks, reviews, conflicts
  and the queue are the follow thread's own to act on (three wakes in five
  minutes on an unread count), and the JSON
  `tick` still lists it. `--arm`/`--disarm` with it is `usage`;
- `--arm monitor` with a command that does not run the project's own
  `library/wake.sh` records the arm and adds one `warnings` entry
  (`not_the_ready_line`: it may never wake you, with the ready line as its
  `next`). The helper runs no simulation of the line: the ready line is
  printed by `go`, `context`, `tick` and the script's own header, and
  judging a hand-written filter is yours;
- `library/wake.sh` speaks for one loop per project: it takes `library/wake.lock/pid`, a second loop on the same
  project (a second Monitor installed) stays silent and takes over only when the pid there is gone, and once the
  project folder is gone (archived) every loop on it, speaking or silent, exits 0 within one tick, so the Monitor
  ends by itself (owner ruling 26, #38715; supersedes the stay-alive loop:
  three Monitors meant every WAKE three times). `sh wake.sh --once` runs one
  round by hand. `--arm monitor` while the recorded arm is a monitor whose loop pid is alive is `already_armed` (0,
  nothing re-recorded) with `wake` (the standing arm), `loop_pid`, and `next` saying to leave the second Monitor alone
  — its loop is silent on its own, and a stop is a note that costs a turn; the arm records `loop_pid` when the loop
  has started;
- `--arm` records who wakes this project: `tier`, `command` (for `monitor`,
  the Monitor line the coordinator installed; for `scheduler`, the unit or
  cron line), `persistent`, `armed_by` (this coordinator), `armed_at`;
  `--disarm` clears it. Recording is not scheduling — the coordinator
  installs the Monitor or the scheduler entry itself and records it here so
  `context` and `resume` can say whether a wake exists and whose it is;
  `--arm monitor` or `--arm scheduler` without `--command` is `usage` (2,
  nothing recorded) — an arm with no entry behind it wakes nobody; `--arm
  passive` without `--monitor-failed "<one line copied from the failed
  monitor( result>"` is `usage` (2, nothing recorded; `error` names the
  Monitor tool and the ready line, `next` says to call it, then record
  `--arm monitor`): passive is never the first try — the Monitor is what
  wakes you, and a passive arm with no call tried left every report unread
  (the owner's own run; ruling 52, #38715).
  With the line in hand it records `wake.monitor_failed` beside the tier. A
  monitor is persistent by default: a `--command` line that says
  `persistent=false` is `arm_not_persistent` (3, nothing recorded) unless
  `--one-shot` says one wake is all that is wanted — a timed monitor ends
  after its window, and re-arming it with the same cursor replays every
  line the source kept since; a replayed line carries the key it had the
  first time, so the inbox files it once (`duplicate`) and no `go` is
  read twice; the persistence rule reads only the line's own `persistent=`,
  never quoted inner text;
- `ticked` (0) with `changes` (per thread: from, to), `inbox_pending`,
  `inbox` (every unread event: key, kind, thread, text), `text` (the unread
  events first, then the changes, then the wake line — the line a Monitor
  watches: it changes exactly when the inbox or a thread does, whoever ran
  the previous tick, so a thread's report is a change it sees once) and
  `wake`; `next` is `inbox drain <slug>` while anything is unread; a
  `receipt` (`what: arm|disarm`) when the arm changed;
- the arm also records `means` (what the tier does for the coordinator
  session: a Monitor wakes it; a scheduler runs `tick` in another process —
  the folder refreshes, the session is not woken and speaks on the user's
  next message; passive runs nothing), `env` (the `MUSE_AGENTS_TMUX`,
  `TMUX_TMPDIR` and `MUSE_PROJECTS_HOME` the arm ran under) and
  `tick_command` (the line a scheduler should run: that environment in
  front of `python3 agents.py tick <slug>`), and answers `tick_command` on
  the line. A later verb whose caller sets no `MUSE_AGENTS_TMUX` /
  `TMUX_TMPDIR` fills them from the arm with a `progress` line, so a tick
  from a bare scheduler environment probes the same tmux server instead of
  an empty directory; a caller that names its own tmux is respected. A
  tmux that cannot answer leaves the thread unknown — never gone: so does a
  `status` answer that is `unreachable`, carries a tmux connect error, has
  no boolean `live`, is not a `status` line, carries an `error` beside its
  verdict (a listing the helper could not read, or
  a non-JSON answer; only a positive, parseable not-live verdict from a
  reachable provider moves a thread), or answers — live or not — from a tmux server other
  than the one the record names (a bare environment with no
  `MUSE_AGENTS_TMUX` and no arm to fill it from probes the default server;
  whatever that server holds, a same-named stranger included, the thread's
  own server was never asked and nothing of the stranger is read). Such
  threads are listed under `unknowns` with `unknown_reasons`, nothing is
  recorded or filed, and `text` carries one `unknown:` line naming the tick
  command that reaches their server (the arm's `tick_command`, else one
  composed from the recorded server whenever this environment's
  `MUSE_AGENTS_TMUX` is absent or names another server — never a repeat of
  the probe that just failed);
- `--arm` and `--disarm` run only from the recorded coordinator
  (`not_coordinator`, 3, nothing recorded); a plain `tick` is anyone's.

The same missing-loop fact rides on every `tick` that is not the loop's own
`--wake-line`: `text` leads with `wake: monitor armed on record, but no loop
is running` and `next` is `call monitor(<the recorded command>) now, then
end the turn` (an arm made this call is inside the grace window). The
earlier `try monitor(<the ready line>) first; passive only after a failed
call` hint on an early passive arm is retired: the arm refuses instead
(above), the failed call's line in hand.

## `overview`

"status?" → `overview <slug> --table`, shown as is, never as bullets; a
`flat` row → ONE `host-manager read <name> --tail`, said in that thread's
line, no scanning on other wakes (moved here from SKILL.md
step 6, with the `ack` cap and the `init` message rules).
Deep read on a trigger only — quiet past `stuck_scans`, a doubted
self-report, the user asks, before `accept`: `read <ref> --lines 200`
once, never every wake (moved here from coordinator.md § On a wake for
the went-idle bullet's byte room).

```
overview <slug> [--table]
```

The groups as text, one line per thread under its group heading, in the
order `waiting-on-you`, `ready-for-review`, `working`, `landing`, `idle`,
`orphaned`, `done`, `proposed`, then `unknown` (threads whose provider did
not answer: machine, reason, last known status), the inbox count and the
wake arm. `overview` (0) with `groups`, `unknowns`, `text`, `table` (the status table, § The tracking ledger) and `needs_you`; `overview <slug> --table` makes `text` the table — the answer to "status?", read verbatim. No HTML view exists.

## `pick`

```
pick <slug> --question "<q>" --option "<label>=<path>" [--option "<label>=<path>" …]
```

A pick between texts (two advocate notes, candidates, a `DECISIONS:` line),
printed ready to post: the message part is ONE lead-in line naming the
labels ("Two texts to choose between — A, B — each in full in its option's
preview; pick in the dialog.", plus the file paths when a preview is cut) —
the dialog is the carrier (six rounds of prose left the
message a bare lead-in in 2/3 runs while the previews carried every text
3/3) — then the line `--- dialog ---` and one JSON object — `ask` (the `request_user_input` arguments object: one
question, cut to 500 characters, the ask tool's cap, with its `options`) and `next`, nothing twice. Each option carries its `label` (cut to 60
characters) and, unless the file is blank, its text twice in the ask tool's
own per-option fields: `description`, the text as one line cut to 240
characters, and `preview` (`format: markdown`, `content` the text cut to
2000 characters); a cut description ends in `… (full text in the preview)`,
a cut preview in `… (cut at the dialog's cap)` — never "in the message
above": the model skipped that message in three rounds.
Post the lead-in line, then call `request_user_input` with the `ask`
object below the separator as its arguments, exactly as printed —
`{"questions": [{"id": "pick", "header": "Pick", "question", "options"}]}`,
an object whose `questions` is an array, never a JSON string (the model rebuilt the call, passed `questions` as a string,
and the retry dropped the previews) — descriptions and previews never
reworded: the user reads each text in the
dialog, never labels alone and never the texts after the choice (#41037:
the pick was made blind while the texts sat outside the dialog; #41227
and the model ran the verb and posted a lead-in with nothing under
it, so the texts moved into the dialog for good). A relative `<path>` is under the
project folder (`library/a.md`); an absolute path is taken as given. Two or
three options — the ask tool's cap per question (#41234); a fourth is
`usage` (2) naming the limit: ask in two rounds. Nothing else refuses: a file that
cannot be read prints `(missing: <path>)` in its option with a `warning:`
line on stderr, and the verb exits 0 either way. Not the JSON envelope:
stdout is the message, the separator, the JSON; a slug with no project
folder still works for absolute paths.

## `set`

```
set <slug> mode herdr|tmux|msp|auto [--asked-by WHO]
set <slug> engine muse|claude|codex|auto
set <slug> every 2m|90s|quiet|auto
set <slug> heartbeat 5|1h|off
set <slug> sink "<command>"|none
```

`mode`: the project's mode pin (ADR 41038 D3 rule 1): every later `go` passes it to
host-manager as `open --mode <x>`, which uses it or refuses with the reason
(`mode_unavailable`, `mode_unreachable`) and never substitutes; `auto`
removes the pin and the ladder decides (Herdr when its server runs, else
tmux; `msp` — behind `TBH_AGENTS_SESSION_PROTOCOL` — only when pinned or
by host, or when this machine advertises MSP; the pin overrides that arm
both ways, and flag off an `msp` pin is refused naming the flag). Written as `mode: <x>` under
`## Settings` in PROJECT.md, beside the other settings, once. Running
threads keep the mode they opened with (`running_keep_mode`); a project never
switches mid-flight. Say the pin in one line when the user asked for it; a
pin is the user's word, never yours.

`engine` (#43739, spec 38715-agents FR-43739-4): the project's default worker
engine — `init --engine codex` writes it when the user names the workers'
engine ("do this with codex workers"); `set <slug> engine claude` pins or
changes it later; `auto` removes the line. Written as `engine: <x>` under
`## Settings`. A proposal thread that names no `engine` takes it; a thread's
own `engine` still wins; without the line a thread runs the coordinator's
own engine, else muse (QA r10 ENGINES D1). Threads already proposed or
running keep theirs. host-manager applies the engine's own posture and
trust as for any thread; Muse flags (`model`, `effort`) stay Muse-only.

`every`, `heartbeat`, `sink` (#41802): the watcher's settings, in the same
section (`every: 120s` | `every: quiet`, `heartbeat: 5`, `sink: <command>`),
re-read by a running watcher before its every sleep — no restart. `every`
is the pace of the "still working" edits ("update me every 2 min" → `2m`;
"less often" → a longer value; "quiet until done" → `quiet` (`off` is the
same word); `auto` removes the line and the cadence table decides); under
10 s is `usage`. `heartbeat` makes a cadence tick also file a `watch`
inbox event every N minutes — for a TUI user who wants a periodic line;
off by default, `off` removes it. `sink` is the command each rendered list
is piped to (§ `watch`); `none` removes it. Outcome `set` with `setting`,
`value` (`null` after `auto`/`off`/`none`), a receipt; `usage` (2) for
another setting or value.

## `watch`

```
watch <slug> [--sink "<command>"]                                  # the project's threads (what `go` starts)
watch <slug> --source cmd --step "<label>" [--sink "<command>"] -- <command…>   # one long step of your own
watch <slug> --stop
```

The project's watcher: ONE long-lived child per project, started by `go`
(pid on `state.json` `watch`, bound to the process by its start stamp (`ps`'s `lstart` spelling, read from `/proc` on Linux) —
a recycled pid is a stranger's: never signalled, treated as gone; a second `go` keeps it; one that died while
threads run is restarted by the next `go`, `context` or `tick` — the wake
loop's round included; `watch_restarted` on that line), ended by `agents.py archive`,
by `--stop`, or by itself once every row is terminal (done, accepted,
failed, stopped). It never wakes you itself. Every **20 s** (`WATCH_POLL_S`)
it reads the project's own records and each running thread's session — the
same facts `context`/`overview` compute — and renders one row per opened
thread:

```
☐ running · ⛔ blocked (the fact is the question) · ✅ done (report acked) · ✅✔ accepted · ✖ failed (session gone, checkout gone) · ⛔ stopped
<mark> <name> — <what it owns> [· <elapsed>] [· <one fact: the report's STATUS line, else its newest commit>]
```

(The marks are `plan_lines`' own, so your post and the watcher's edit are
one list; a proposed thread is not on it, as on `plan_lines`.)

Two clocks. A **state transition** between two samples (running →
blocked, → done, → failed, …) rewrites the list at once and restarts the
cadence interval; a transition into blocked/done/accepted/failed/stopped,
or out of blocked, also files one `watch` inbox event
(`watch:<id>:<state>:<n>`, text `<from> → <to> — <fact>`), which the wake
loop prints as `<Name> moved: …` — the Monitor wakes you (on the inbox path
the message is sent too). A running row's new report the coordinator has
not acked is a transition into `ready-for-review`: one event per digest
(`watch:<id>:ready-for-review:<digest>`, text `running → ready-for-review —
<STATUS>`), no edit of its own (the next cadence rewrite carries the fact);
a row whose state moved in the same sample files that transition's event
alone. The start batch files nothing and is not news to
the sink: you just opened them (a lane that cannot fold an edit posts
nothing for it). Otherwise a **"still working"** rewrite
follows the cadence table (`WATCH_CADENCE`), keyed by time since the watch
started, `every` overriding it:

| elapsed | edit every |
| --- | --- |
| under 10 min | 1 min |
| 10–30 min | 2 min |
| 30–60 min | 5 min |
| 1–2 h | 10 min |
| after 2 h | 15 min |

Where the list goes: always `library/status.md` (`# <slug> — updated <t>`,
then the rows; `context`/`overview` return `watch` = `{pid, status_file,
updated_at, every, heartbeat, sink}`); with `--sink` (else the `sink`
setting) also to that command's stdin, one call per rewrite — a channel's
plan message, edited in place by id (the channel's own sink command, set
by the program that created the project). The sink edits only the
coordinator's plan post: until that message exists it answers `skipped:
no_plan` with no id, the watcher logs the wait once and the status file
alone carries the list — the watcher never creates the plan message and
never edits an acknowledgement (#41959). Sink contract: stdin is the
rendered rows; argv gets `--message-id <id>` (from its own previous answer),
`--news` on a transition batch, `--row` for a `--source cmd` step (rewrite
one row, not the block), `--stamp` to answer without editing; stdout is one
JSON line `{"message_id", "edited_at_ms"}`; a non-zero exit is logged once
and never stops the watch; an answer `{"outcome": "refused", "reason": …}`
with exit 3 (not applicable: a card as the target) is learned once — no
further sink calls, the status file keeps the list. **Backoff**: before a cadence rewrite the watcher
asks the sink for the stamp; a stamp newer than its own last edit (you
ticked or reworded the list) skips that tick and restarts the interval;
no stamp, no backoff. `--source cmd` watches one command of your own
instead (its row `☐ <label> · <elapsed> · <last log line>`, `✅ <label>` or
`✖ <label> · exit <n>` on exit, `⛔ · stopped` on `--stop`; the output is
teed; the exit code is the command's; no inbox event — the step's own
completion wakes the lane).

Outcomes: `watch_ended` (0; `ended`: done | failed | stopped, `edits`,
`transitions`, `events`, `elapsed`) — the JSON line is the watcher's last
stdout line, under `library/watch.log` when `go` started it;
`already_watching` (0, `pid`) for a second `watch` on a live one;
`watch_stopped` (0, `pid`) / `no_watch` (0) for `--stop`; `usage` (2) for
`--source cmd` without a command. The watcher composes no prose: the mark,
the name, what it owns, elapsed and one fact from the source; when you are
awake you say what it means.

## `resume`

```
resume <slug> [--takeover --confirm "<the human's words>"]
```

A session whose identity (`MUSE_LANE_BACKEND` / `MUSE_LANE_REF`) is one of
the project's own thread records is `coordinator_is_thread` (3, `thread`
named, nothing recorded, with or without `--takeover`): a coordinator is
never one of its threads. A new coordinator session takes the project over from the folder. It first
asks whether the previous coordinator is live — a session through its
provider, a process identity on the same host through `/proc` on Linux, `ps` elsewhere (its `pid`, and
its `started` stamp, so a reused pid is not a live coordinator): a live one
is `coordinator_live` (3) — two coordinators would race — and a session
whose provider cannot answer, a tmux pane its server cannot judge, or an
`opaque` sandboxed coordinator is `coordinator_unknown` (6) — it may still be
live — unless `--takeover --confirm` carries the human's words; a process
identity that is gone proceeds with a `progress` line, and one on another
host (or without a pid, written by an older helper) cannot be checked and
proceeds with a `progress` line saying so. A second session on the same
host is therefore never the same coordinator by accident. Then it reconciles every
open thread by identity (gone or mismatched without a report → `orphaned`;
gone after a report → `exited`; live → unchanged; a provider that cannot
answer leaves the thread as it was and lists it under `unknowns`), clears
the wake arm (a Monitor bound to the previous session is not this one's —
re-arm with `tick --arm`), records this session as the coordinator, and
returns the same picture `context` does. `resumed` (0) with `threads`,
`unknowns`, `previous_coordinator`, `wake: null`, `previous_stopped`. A
`--takeover` of a coordinator that `init --detach` opened and that is live
or cannot be checked stops that session on the same words, before this
session is recorded (`previous_stopped: true`; a stop that fails passes
through and records nothing, so the retry still finds it; one that answers
`no_such_session` after a probe that could not answer proceeds with "not
found on this server" — host-manager `stop` looks on the caller's server —
while `no_such_session` after a probe that said live is that contradiction:
`no_such_session` (3, nothing recorded) with the helper's own `next` — stop
the coordinator on its own tmux server, then `resume --takeover --confirm
"<the human's words>"` again): nobody sits in it and it would run on
beside the new coordinator, and never two live coordinators; a person's own
live session is never stopped by a takeover. The session recorded by `init --detach`
resuming itself (its starter runs `resume`) keeps `detached` and its posture
on the record, so `context` still says so and `agents.py archive` from
another session finds and stops it.

A session that binds a project a launcher made (`init` under
`MUSE_AGENTS_ROLE=launcher` recorded nobody; the lane it opened runs the first
`resume`) is recorded `detached: true`, like an `init --detach` coordinator:
nobody sits in it, so `agents.py archive --confirm` from any session stops it
and names it, and `resume --takeover --confirm` stops it before recording the
taker (a shell's archive was `not_coordinator` and a
takeover left two lane sessions running against archived projects). A
person's own session that ran `init` itself is never marked so.

On the inbox path `resume` keeps `wake_path: inbox` whatever
`TBH_AGENTS_SESSION_PROTOCOL` says now (a `progress` line says so) and
re-subscribes — this session is resolved as the report target and recorded
as `inbox_target` (on the line too, with `wake_path`); `resubscribed` lists
the running threads whose next `report` reaches it through the folder; a
remote thread's report filed by the coordinator itself sends nothing. The wake arm is cleared
and the loop rewritten as on the monitor path, and `next` is the same arm
line. A monitor project resumed with the flag on stays on the monitor path
and says so.

## `stop`

```
stop <slug> <thread-id…> [--asked-by WHO]
```

Ends one or several threads' sessions (several ids like `go`; every id is
checked before any session ends — an unknown one is `no_such_thread`, 3,
and nothing stops) through host-manager `stop` or fleet-manager
`close` (the engine's own quit, a wait, a close of what lingers), whatever
the record's status: a `running` record becomes `stopped`; a `done`,
`exited`, `orphaned` or `stopped` record whose engine still runs keeps its
status and only loses the session (`ended: true`, `stop_receipt` on the
record). `ended` is this helper's word — a live session was ended;
`lingered` is the provider's, passed through unchanged (`true`: the engine
ignored its quit gesture and was closed; `null` when no session was
asked to quit). A thread that is already gone is `stopped` with `ended:
false` (a remote session fleet-manager no longer lists is gone the same
way); a session under the thread's name whose identity no longer matches
the record is a stranger's — the record becomes `orphaned` (`exited` when
a report exists) with `identity_drift`, nothing is sent or closed
(`ended: false`); a `proposed` one never had a session. The caller is checked before anything
else: from a session that is not the recorded coordinator every `stop` is
`not_coordinator` (3), a `proposed` thread's included. A provider that answers
`no_such_session` for a session it just reported live (a wrong address, a
provider in trouble) is that refusal, passed through (3): nothing is
stamped stopped while a session may still run; `next` is `tick`, then
`stop` again. One id answers as before: `ended`, `lingered`, `status` and
one `receipt` at the top (plus `threads`, the same words under the id).
Several ids answer `threads` (one row per id: `ended`, `lingered`,
`status`, `identity_drift` when set), `stopped` (the ids whose live session
was ended) and `receipts`, `ref` = `<slug>/<id,id,…>`; a provider refusal
for one of them rides under that id (`outcome`, `error`, `next`) while the
others are ended, and the line is `partial` (6) naming it, `next` its cure
(`stop <slug> a b c` was `usage` in 3/3 projects).

## `agents.py archive`

```
archive <slug> [--confirm "<the human's words>"] [--asked-by WHO]
```

Completion cleanup, in this order, each a `progress` line. The first
`progress` line, and the line's `text`, is `Monitor: do not work_stop it — it
ends by itself within a tick; the empty `Monitor event` that follows is not
input (one line at most: `Monitor ended; project archived.`, never the
close-out again)` (three coordinators stopped it
after reading the receipt; the first line survives a `head`); the receipt's
`monitor_ended_line` is that one line, `Monitor ended; project archived.`,
verbatim — the ended-Monitor turn's whole text, and `next` says so ("say
nothing" was spoken aloud instead, twice with the close-out repeated). Once the
live-session guard below passes, disarm the wake first — the arm cleared
and `library/wake.sh` removed before any thread is stopped, so the stops
are news to nobody (a Monitor WAKE fired after the
archive and cost a turn; `disarmed` names the tier, `null` when none was
armed, on the line and the receipt); the loop a Monitor still runs is left
alone — it exits 0 within one tick once the folder is gone, so the Monitor
ends by itself (owner ruling 26, #38715: the item stayed `watching`;
supersedes the stay-alive loop), and the empty `Monitor event:
agents <slug>` the runtime then delivers (a `stream_ended` item; the TUI shows
`Monitor "agents <slug>" — ended`) is the Monitor ending, not new input: say
nothing and end that turn (a `work_stop` is the same note one turn earlier);
`next` says so; then stop every
session that is still live — every thread's, whatever its status (`done`
threads' engines included), and a coordinator `init --detach` opened when
it is not the session running the verb; one whose provider cannot answer
counts as live; a session this helper already ended (`session_ended_at`)
is not asked about again; a `done` thread's live session (one `accept`
could not end, #41777) is ended without
the words — its work was accepted on evidence, and its idle engine is what
`threads_live` refused every project whose threads were still live (`threads_live`,
3, naming the live sessions of threads not yet done, `coordinator` among
them, when any is live and there is no `--confirm`; `next` names `accept`,
the `--confirm` line and the `stop <slug> <ids>` line);
for each thread `worktree_path` that git reports clean and
whose HEAD is merged into the repository's default branch — its copy on
`origin` after one bounded `git fetch` when the repository has an origin
(a local `main` nobody pulled is stale), else the local branch; a failed
fetch is a `progress` line naming the copy compared — `git worktree remove
<path>` — **never `--force`**; a landed checkout whose only untracked files
are the thread's report (`report*.md`, `report*.txt` or `AGENTS-REPORT.md`
at its root) counts as clean: they move to `threads/<id>/leftover/` first
(a `progress` line each), nothing is deleted; a dirty or unmerged worktree
is left in place and named in `kept` (`not merged into origin/main`); move the folder to
`~/.muse/projects/.archive/<slug>-<stamp>/` (the records stay readable;
nothing is deleted). Branches and PRs are never touched. `"archived"` (0)
with `stopped` (thread ids whose session it ended), `coordinator`, which
names the detached session from the record — `stopped (<provider>:<ref>)`;
`not live (<provider>:<ref>)` when it was gone or its stop found no session;
`none` when the project had no detached coordinator and another session
archives it; `this session (<provider>:<ref>)` when the recorded coordinator
with a session identity runs the verb itself (the verb never stops the
session it runs in, so a detached coordinator that archives its own project
stays open until the user closes it); `this TUI session` when the recorded
coordinator running the verb has no session identity (a process or pane) — `removed_worktrees`, `kept`,
`"archive_path"`, and a receipt. A reader that closes the pipe early
(`agents.py archive <slug> 2>&1 | head -5`) never stops the verb: the dropped lines
stay in `progress`, the folder moves, the receipt is written and the exit
code is the verb's own. A slug is one path component of letters,
digits, `.`, `_` and `-` (`usage`, 2, otherwise) on every verb.

## Allow-list

Read and record verbs — `doctor`, `context`, `overview`, `propose`, `report`,
`ack`, `inbox put`, `inbox drain`, `tick` without `--arm` — may sit on an
agent's allow-list by subcommand, never the bare helper. `init --detach`,
`go`, `follow`, `stop`, `agents.py archive`, `resume --takeover`, `remember`, `accept`
and `tick --arm` start, end, take over or record authority and stay on the
permission prompt. `go`, `follow`, `accept`, `stop`, `remember`, `tick --arm`,
`tick --disarm`, `agents.py archive` and `propose --replace` also check the
caller: a session that is not the recorded coordinator
(`state.json.coordinator`) is `not_coordinator` (3, nothing changed; `next`
is `resume <slug>` when that coordinator is gone or is a process identity
that cannot be checked — the same cases a plain `resume` proceeds past —
and `resume <slug> --takeover --confirm` when it is live or a session whose
provider cannot answer). Read and record verbs never check. A detached
project's `stop` and `agents.py archive` stay open to any session: nobody
sits in a detached coordinator, both only end things, and `agents.py archive` stops
the detached session itself on the human's words. An `opaque` recorded
coordinator (a sandboxed tool shell with no tmux pane) can be told from
nobody, itself included, so these verbs proceed with a `progress` line
saying so; `resume --takeover --confirm` on the human's words settles it. The Claude Code settings template and what a prefix
rule cannot express (`tick --arm`, `init --detach`):
`references/allow-list.md`.

## Contract suite

The helper's contract suite ships with its source tree beside the skill:
stdlib unittest, offline, a fake host-manager and a fake fleet-manager
(injected through `MUSE_AGENTS_HOST_MANAGER` / `MUSE_AGENTS_FLEET_MANAGER`),
a per-test `MUSE_PROJECTS_HOME`, real `git` for the worktree arm, no sleeps.
