---
name: durable-test-collateral
description: Load the body before the first implementation edit for a bug fix or behavior change, or when the user or governing specification makes reusable tests a deliverable. It keeps the smallest focused test with the delivered project and updates coverage when behavior changes. Do not load for greenfield work unless reusable tests are explicitly required, behavior-preserving refactors, verification-only work, plan/review/explanation/documentation/formatting/generated-output-only work, explicit no-change or no-tool work, or when the user declines tests.
user-invocable: false
---

# Durable Test Collateral

Verification is part of the delivered project when it can prevent the same
behavior from breaking again. Use the project's existing framework and
conventions.

## Keep the check with the project

For a bug fix or behavior change, add or update the smallest maintained test in
the repository's normal test layout that exercises the changed behavior. If a
specification makes a reusable suite or test category a deliverable, implement
that suite instead of treating it as private verification.

An inline interpreter command, heredoc, scratch script, temporary-directory
test, demo, or manual probe may help diagnose the problem, but it does not
replace the maintained test. Keep a useful self-authored test unless the user
explicitly asks for a disposable probe.

Do not add a new test framework solely to satisfy this skill. If the repository
has no maintained harness and the request does not require one, disclose when
durable coverage would be disproportionate or infeasible and use the narrowest
honest verification instead.

On a later turn, update the maintained test even when the old suite remains
green and the user does not repeat the test request. Cover the new behavior,
not merely an unrelated cleanup in the test file.

## Prove the maintained check

Observe the authentic failure before the implementation change when it is safe
and runnable. Then make the smallest implementation change and run the focused
maintained test after the final relevant source or test edit.

Do not weaken or delete a real failing test to obtain green. Fix the product,
or explain why the test's expectation is wrong before changing that
expectation. Do not repeat an unchanged check solely to collect evidence.

Run a broad or full suite only when the user, a repository gate, or
proportionate risk requires it. A focused regression test comes first; broad
proof does not substitute for missing focused coverage.

If the real runner is unavailable but the focused test can still be authored
honestly, leave the focused test in the repository and say it was not run. Do
not fabricate a passing result.
