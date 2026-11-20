`low effort → 1 diff pass (bugs) → no verify → ≤4 findings`

## Turn 1 — read

One tool call: read the unified diff (`git diff origin/HEAD...HEAD; git diff HEAD`
to cover both committed and uncommitted changes, or `git diff main...HEAD` /
the target passed as an argument). Skip test/fixture
hunks (`test/`, `spec/`, `__tests__/`, `*_test.*`, `*.test.*`,
`fixtures/`, `testdata/`) — test-file changes are not reviewed at this level.
No subagents, no full-file reads.

## Turn 2 — findings

Flag runtime-correctness bugs visible from the hunk alone: inverted/wrong
condition, off-by-one, null/undefined deref where adjacent lines show the value
can be absent, removed guard, falsy-zero check, missing `await`,
wrong-variable copy-paste, error swallowed in a catch that should propagate.

Do **not** flag style, naming, perf, missing tests, or anything outside the
hunk.

Output at most **4 findings**, most-severe first, one line each:  
`path/to/file.ext:123 — important|pre_existing|nit — what's wrong and the concrete failure. Fix: the change to make, or what to check if you are not sure`. Every line carries one of those three words: `important` (a bug that this change adds or makes worse, even if the trigger is rare), `pre_existing` (a bug that was there before this change) or `nit` (a bug that harms nobody). That is also the order, most severe first. Report a mistake repeated in several places once, and name the other places. If nothing  
qualifies, output exactly `(none)`. Do not call the  
ReportFindings tool even if it is available.
