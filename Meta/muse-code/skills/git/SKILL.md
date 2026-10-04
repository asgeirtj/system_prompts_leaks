---
name: git
description: Source-control safety for Git. Two rules apply whether or not you read the body. First, never commit, amend, push, tag, rebase, cherry-pick, revert, or reset --hard unless the user asked for that exact write in this session. An explicit request to create a new commit counts anywhere in the user's own task text, but it is not a request to amend, push, or tag. Finishing a task without that request is not authorization, so leave your work uncommitted for review. Second, when a Git lock file or corrupt index blocks you, never kill the holding process or bulldoze through with deletions - wait, retry, use the holder's own stop mechanism, or stop and report. Load the body only before writing Git history or recovering Git state.
user-invocable: false
---

# Git source-control safety

The working tree belongs to the user. Make the change, leave it visible, and
let them decide what becomes history.

## Never without an explicit ask

The user must have asked for that exact write in this session, in their own
words. An explicit request to create a new commit counts anywhere in the user's
own task text, but it is not a request to amend, push, or tag. Finishing a task
without that request does not authorize a history write.

- `commit`, `commit --amend`, `push`, `tag`, `rebase`, `cherry-pick`, `revert`,
  `merge`, branch deletion, `reset --hard`, path restore, and `clean -f` all
  require an explicit ask.
- Never publish merely because publication would be useful.

## Before an authorized discard

Recovery is insurance, not authorization. A save never expands what the user
allowed you to delete or overwrite.

When the user explicitly authorized an operation that may discard or broadly
overwrite workspace changes, and the workspace is an ordinary Git checkout:

1. After `read_skill` gives the physical Git skill package path, run:

   ```bash
   bash <git-skill-dir>/scripts/workspace-recovery.sh save before-discard
   ```

2. Keep the printed `refs/tbh/recovery/...` value in your handoff, then perform
   only the exact authorized operation.
3. If the save fails or the workspace is unsupported, stop before destruction
   and ask the user.

To recover that saved tree later, run:

```bash
bash <git-skill-dir>/scripts/workspace-recovery.sh restore <recovery-ref>
```

Restore first saves the current workspace, leaves HEAD, branch, and the real
index in place, and restores the selected snapshot into the worktree. The ref
also retains distinct staged bytes when the same path had later worktree edits.
Read those staged bytes with `git show '<recovery-ref>^2:<path>'`; the recovery
commit's second parent is the saved index tree. Ignored files are not saved;
restore refuses an ignored-path collision rather than overwrite data it could
not save. Use only the exact printed ref, not a revision expression.

## Always fine

Read-only inspection such as `status`, `log`, `show`, `diff`, `blame`,
`branch -v`, `show-ref`, `rev-parse`, `for-each-ref`, and `merge-base` is fine.
Staging named files to inspect `diff --cached`, and a temporary stash around a
tool that requires a clean tree, are also fine when the original state is put
back afterward.

## The rest

- Do not use a broad add in a tree you did not clean; name the files you changed.
- Do not initialize a repository inside vendored, build, data, or existing
  source-control trees.
- Do not hand-edit generated files; change their source of truth.
- Scratch repositories under a temporary directory are yours to experiment in.

## Locks and corrupt state

A Git lock usually means another process is writing. Never kill the holder on
your own initiative. Wait, inspect the holder read-only, use that tool's normal
stop mechanism, or report the block. Never delete a lock without proving no
live process owns it, and never respond to index corruption by deleting state
and committing anyway.

Never commit or push while status reports changes you did not make and cannot
explain.

## If you already made an unwanted write

Say so plainly and stop. Do not attempt more history surgery without direction.
