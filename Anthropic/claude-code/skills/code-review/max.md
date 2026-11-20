`max effort → 5+1 angles × 8 candidates → 1-vote verify → sweep → ≤15 findings`

You are reviewing for **recall** at maximum effort: catch every real bug. At
this level, catching real bugs matters more than avoiding false positives — a
missed bug ships. Err on the side of surfacing.

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

## Phase 1 — Find candidates (5 correctness angles + 1 conventions angle, up to 8 each)

Run **6 independent finder angles** via the Agent tool. Each
surfaces **up to 8 candidate findings**. Do NOT let one angle's conclusions
suppress another's — if two angles flag the same line for different reasons,
record both. If the Agent tool is not available in your current tool set, do not error — perform each angle (and each verification) yourself, sequentially, in this context.

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

### Angle D — language-pitfall specialist

Scan for the classic pitfalls of the diff's language/framework — for example:  
JS falsy-zero, `==` coercion, closure-captured loop var; Python mutable default
args, late-binding closures; Go nil-map write, range-var capture; SQL injection;
timezone/DST drift; float equality. Flag any instance the diff introduces.

### Angle E — wrapper/proxy correctness

When the PR adds or modifies a type that wraps another (cache, proxy, decorator,
adapter): check that every method routes to the wrapped instance and not back
through a registry/session/global — e.g. a caching provider holding a
`delegate` field that resolves IDs via `session.get(...)` instead of
`delegate.get(...)` will re-enter the cache or recurse. Also check that the
wrapper forwards all the methods the callers actually use.

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

Conventions candidates use the output's `file`/`line`/`summary` shape; in
`failure_scenario`, state which CLAUDE.md rule is broken instead of a crash.
Correctness bugs always outrank conventions findings when the output cap
forces a cut.

## Phase 2 — Verify (1-vote, 3-state)

Dedup candidates that point at the same line/mechanism, keeping the one with
the most concrete failure scenario. For each remaining candidate, run **one
verifier** via the Agent tool: give it the diff, the relevant
file(s), and the candidate, and have it return exactly one of:

- **CONFIRMED** — can name the inputs/state that trigger it and the wrong
  output or crash. Quote the line.
- **PLAUSIBLE** — mechanism is real, trigger is uncertain (timing, env,
  config). State what would confirm it.
- **REFUTED** — factually wrong (code doesn't say that) or guarded elsewhere.
  Quote the line that proves it.

Keep candidates where the vote is CONFIRMED or PLAUSIBLE.

This is recall mode — a single non-REFUTED vote carries the finding. Do NOT
drop on uncertainty.

## Phase 3 — Sweep for gaps

Run **one more finder** as a fresh reviewer who has the verified list. Re-read
the diff and enclosing functions looking ONLY for defects not already listed.
Do not re-derive or re-confirm anything already there — the job is gaps. Focus
on what the first pass tends to miss: moved/extracted code that dropped a guard
or anchor; second-tier footguns (dataclass default evaluated once, `hash()`
non-determinism, lock-scope shrink, predicate methods with side effects);
setup/teardown asymmetry in tests; config defaults flipped.

Surface **up to 8 additional candidates**, each naming a defect not already on
the list. If nothing new, return an empty sweep — do not pad.

Then give each finding, the sweep's too, its `severity`, as Output defines it.

## Output

Return findings as a JSON array of at most 15 objects:

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

Ranked most-severe first. If more than 15 survive, keep the 15 most
severe. If nothing survives verification, return `[]`. Do not call the
ReportFindings tool even if it is available - this review's
output contract is the JSON block above.
