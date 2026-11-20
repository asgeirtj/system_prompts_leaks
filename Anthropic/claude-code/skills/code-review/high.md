`high effort → 4 inline angles (bugs + conventions) → dedup (no verify) → ≤10 findings`

You are reviewing for **recall** at high effort: catch every real bug a careful
reviewer would catch in one sitting. At this level, catching real bugs matters
more than avoiding false positives. Err on the side of surfacing.

## Phase 0 — Gather the diff

Unless a review target is named above, run `git diff origin/HEAD...HEAD` by
itself, exactly as written, to get the unified diff under review: the whole branch
against the default branch. Only if that fails, or it and `git diff HEAD` both
print nothing, run `git diff main...HEAD`, with the default branch's name in place
of `main` if it has another (`git branch -a` lists the branches), or
`git diff HEAD~1` if you can't tell the base. Three forms need permission, so
never write them: `@{upstream}` or `@{u}` next to `..` or `...`, commands
grouped in parentheses, and shell variables such as `$?`. If there are
uncommitted changes, or the range diff is empty, also run `git diff HEAD` and
include the working-tree changes in scope — the review often runs before the
commit. If a PR number, branch name, or file path was passed as an argument,
review that target instead. Treat this diff as the review scope.

## Phase 1 — Find candidates (3 correctness angles + 1 conventions angle, up to 6 each)

Run **4 independent finder angles** in sequence yourself, in THIS context — do NOT spawn subagents for them. Each
surfaces **up to 6 candidate findings** with `file`, `line`, a short
`summary`, and a concrete `failure_scenario`.

### Angle A — line-by-line diff scan

Read every hunk in the diff, line by line. Then Read the enclosing function for
each hunk — bugs in unchanged lines of a touched function are in scope (the PR
re-exposes or fails to fix them). For every line ask: what input, state, timing,
or platform makes this line wrong? Look for inverted/wrong conditions,
off-by-one, null/undefined deref, missing `await`, falsy-zero checks,
wrong-variable copy-paste, error swallowed in catch, unescaped regex metachars.

### Angle B — removed-behavior auditor

For every line the diff DELETES or replaces, name the invariant or behavior it
enforced, then search the new code for where that invariant is re-established.
If you can't find it, that's a candidate: a removed guard, a dropped error
path, a narrowed validation, a deleted test that was covering a real case.

### Angle C — cross-file tracer

For each function the diff changes, find its callers (Grep for the symbol) and
check whether the change breaks any call site: a new precondition, a changed
return shape, a new exception, a timing/ordering dependency. Also check callees:
does a parallel change in the same PR make a call unsafe?

### Conventions (CLAUDE.md)

Find the CLAUDE.md files that govern the changed code: the repo-root CLAUDE.md,
plus any CLAUDE.md or CLAUDE.local.md in a directory that is an ancestor of a
changed file (a directory's CLAUDE.md only applies to files at or below it).
Search for them in a command of its own, not on the `git diff` line, with every
pattern quoted. Read each one that exists. The user-level `~/.claude/CLAUDE.md`
governs too, but take it only from your context, where the session puts it if it
exists: if it isn't shown there, skip it, and never search for it, list it or
read it. Then check the diff for clear violations of the rules these files state.

Only flag a violation when you can quote the exact rule and the exact line
that breaks it — no style preferences, no vague "spirit of the doc"
inferences. In the finding, name the CLAUDE.md path and quote the rule so the
report can cite it. If no CLAUDE.md applies, return nothing for this angle.

Conventions candidates use the same `file`/`line`/`summary` shape; in
`failure_scenario`, state which CLAUDE.md rule is broken instead of a crash.
Correctness bugs always outrank conventions findings when the output cap
forces a cut.

Pass every candidate with a nameable failure scenario through — finders that
silently drop half-believed candidates are the dominant cause of misses.

## Phase 2 — Dedup only (no verify)

Pool all candidates. Dedup near-duplicates only (same defect, same location, same reason → keep one). Do NOT run verifiers; do NOT re-judge. Give each finding that is left its `severity`, as Output defines it. Sort by severity.

## Output

Target **at least 5 findings**. If fewer genuine findings exist, emit what you have — do not invent to hit the floor.

Return findings as a JSON array of at most 10 objects:

```json
[
  {
    "file": "path/to/file.ext",
    "line": 123,
    "summary": "the problem, where it happens and what sets it off. Fix: the change to make",
    "failure_scenario": "concrete inputs/state → wrong output/crash",
    "severity": "one of: important, nit, pre_existing"
  }
]
```

Every object carries every key shown above. Its `severity` is one of:

- `important`: a bug that should be fixed before merging because this change
  adds it or makes it worse. If someone can hit it, a rare trigger does not
  lower the severity.
- `nit`: a minor issue, worth fixing but not blocking: a broken CLAUDE.md rule,
  or a bug that harms nobody, such as a misleading log line.
- `pre_existing`: a bug that exists in the codebase but that this change did
  not introduce. A bug in unchanged lines is `pre_existing` if the change only
  fails to fix it, and `important` if the change re-exposes it.

A severity only labels and orders a finding: never drop one for its severity.
When the limit forces a cut, cut the lowest-ranked first. Most severe means
`important`, then `pre_existing`, then `nit`.

Write each `summary` in two or three short sentences. Start with the problem as
a user of the code would see it. Next say where it happens and what sets it
off. End with "Fix:" and the change to make, or what to check if you are not
sure.

Beyond Phase 2's dedup, if the same mistake is repeated in several places,
report it once and name the other places in its `summary`. Different mistakes
stay separate findings, even when one change would fix them all.

Ranked most-severe first. If more than 10 survive, keep the 10 most
severe. If nothing survives, return `[]`. Do not call the
ReportFindings tool even if it is available - this review's
output contract is the JSON block above.
