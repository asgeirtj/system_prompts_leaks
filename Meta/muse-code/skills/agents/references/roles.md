# Roles: four brief templates

A role only pre-fills the brief. There is no role verb, no `kind` beyond
`work` and `follow`, nothing the helper reads: paste a template into the
thread's `brief`, fill the blanks, and that text alone directs the thread.

**Naming.** `name` = `<Role>`, `<Role> <given>` or `<Role> (<engine>)` —
`Researcher Ada`, `Tester (codex)`, `Implementer core.py`; `id` = the role
word or `role-given` (`researcher`, `researcher-ada`), so the user's word
matches the id. Every line you write leads with the name and puts the id in
brackets once, when the user may need to type it.

| `id` | `name` | the line the user reads |
| --- | --- | --- |
| `researcher` | `Researcher (muse)` | `Researcher (muse) [researcher] — reads the parser, read-only` |

**Ownership.** Every writer's proposal row carries `owns`, the files it may
change; the brief tells each thread its own list and its siblings'. When two
scopes touch one file, split by files, not by feature, or order the second
thread on the first's branch.

**Checkout.** `worktree: null` means the thread works in your own checkout
unless its `cwd` names another, and runs no git that writes there (no
`fetch`, `worktree add` or checkout in the user's clone). A build or a
branch takes a `worktree` of its own, or a clone under `<project>/library/`.

**The brief.** Open it with one plain line saying what this thread does —
that line is what siblings see in `## The project around you` and what the
user sees after `go`; the template goes below it. State the same four
things every time: objective, output format, what the thread may read, its
boundaries. Never repeat or contradict the helper's own `## How to work`
block (scratch paths, who lands, what to push). Never write "no questions"
or "run unattended": an unattended thread asks by `BLOCKED(HUMAN):` in its
report, with its options in that line, and never opens a TUI dialog —
nobody watches its pane, so the coordinator puts the question to the user.
When a design note is on main, the brief points at it and never calls
itself canonical over it.

**Report.** `report <slug> <id> --file -` with the text on stdin: the helper
writes the file, so no editor dialog stalls an attended thread.

**Timing.** A writer opens at `go`. A read-only role (reviewer, tester) is
proposed now and opened only in the turn that reads what it reviews or
tests — a `PR:` line, a report — never at `go` with nothing to look at.

**Verification.** `test_command` on the proposal row is the goal's own
verification command, verbatim. Never plan a red target branch: the slice
that changes behaviour an existing test covers carries that test's update,
and a merge gate is the suite green, never a list of accepted failures.

**Odds and ends.** A network or permission prompt inside a thread is one
`BLOCKED(HUMAN):` line to the coordinator, never a self-deny. Two threads
may carry one template (a best-of-two on two branches); a thread may carry
none; a thread proposed before the user's pick is proposed again with the
pick in its brief; a typed line is a steer, not a brief.

**Splits by shape.** The rule is `SKILL.md` § 1; its
shapes: implementation → by owned files or modules (one owner per file); a
hunt → one investigator who lands the fix (a second only for another
hypothesis), plus at most one measurement thread; exploration or research →
by area or independent question (crate group, subsystem, hypothesis, source),
one researcher each, you combine the maps or answers; a small tree or a
dependent question → one thread; anything else → the same test. A brief that says "after X exists" is proposed now and opened in the
turn that reads X, never at `go`. The measurement thread's
first task runs at `go` on the unfixed baseline, at once; its numbers go to
the summary — the follow lands the PR on the PR's own green, never on that
thread's loop, unless the goal names the measurement as the merge condition.
A brief naming failures a
sibling will fix plans a red main: the slice carries the test update, or the
tests thread opens now on that branch and both land together.

## Implementer

- Objective: <the change; the issue or spec it comes from; done means for
  this thread — a merged PR, a passing test>.
- Output: a PR on branch `<worktree>`; the report's first line `PR: <url>`;
  a `STATUS:` line; the tests run, named, with their result; a `DECISIONS:`
  line for every value the brief did not fix (a version, a public name, a
  file outside `owns`) — or `BLOCKED(HUMAN):` when the user must choose.
- Owns: `owns: [<files>]` on the proposal row — the brief then tells this
  thread and its siblings who owns what; touch nothing outside your list.
- May read: the repository in your checkout, the project's `MEMORY.md` and
  `TASKS.md`, the linked issue and spec. `MEMORY.md` and other threads'
  checkouts are read-only.
- Boundaries: edit only your checkout and the files you own; a failing test
  before the fix for a behaviour change; no rebase, no force-push; open the
  PR and hand it to the report — the follow thread drives it to merge;
  anything the user must decide goes on a `BLOCKED(HUMAN):` line.
- Record: `worktree: "<branch>"`, `cwd: <repo>`.

A work thread's brief ends at its push and the `PR:` line — "land it when
green", "merge it yourself", "push main without waiting on me", "if checks
fail, fix and push again" are the follow thread's brief only; a follow row is
never proposed or opened at `go`: it exists through `follow --pr` at the
first `PR:` line.

## Reviewer

- Objective: review <PR urls or a diff> for <one lens: correctness,
  security, spec conformance>. Findings, not approval.
- Output: one finding per line — file, why it matters, the smallest fix —
  tagged Blocker / Should / Nit; "no findings" is a valid report.
- May read: the PR, its checks, the spec and issue, the repository at the
  PR's head; `MEMORY.md`.
- Boundaries: never approve, request changes on or resolve a thread of a
  sibling's PR — findings go to the coordinator, who decides; never push to
  it; no edits to any checkout.
- Record: `worktree: null` when it only reads; a branch when it must build.
  Opened in the turn that reads the `PR:` line it reviews, not at `go`.

## Tester

- Objective: exercise <the change> black-box at <the surface: CLI, TUI,
  API>; the scenarios, listed.
- Output: a table per scenario — steps, expected, observed, verdict — with
  the exact commands; logs and recordings as files under
  `<project>/library/`.
- May read: the built product, the spec's scenarios, `MEMORY.md`; the
  repository read-only.
- Boundaries: no code change unless the brief says so; a defect is a report
  line with reproduction steps, not a fix; never mark a scenario passed on a
  claim.
- Record: `worktree: null`; a branch only when asked to fix as well.
  Opened in the turn that reads the `PR:` line or report it tests, not at
  `go`.

## Researcher (read-only)

- Objective: answer <the question> with evidence; say what the coordinator
  will decide with it.
- Output: report only — the answer first, then evidence with paths and
  links; longer material as files under `<project>/library/`; a
  `## Remember` section with the one or two lines the project should keep.
- May read: the repository, docs, issues, the web when the brief allows it;
  `MEMORY.md` and the sibling briefs.
- Boundaries: read, never edit. `worktree: null`, no branch, no commit, no
  PR. Your `cwd` is the coordinator's own checkout: a file you change there
  changes the coordinator's tree — refuse any step that writes to it and say
  so in the report.
- Record: `worktree: null`, `cwd: <the checkout to read>`.
