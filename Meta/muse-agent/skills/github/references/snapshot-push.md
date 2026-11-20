# GitHub local snapshot pushes

Read this procedure before creating a branch or pushing local files, including
selections with binary files or unknown encoding. Inspect the complete
`github list-tools` result for `push_files`; do not filter discovery with a
partial keyword list. Use it only when advertised and a snapshot fits the
request: a snapshot commit creating or updating UTF-8 files, without deletions, local
Git history, tags, branches, file modes, symlinks, or binary contents.
If those limitations do not fit, explain that the connector cannot complete
that kind of push. Never start a separate authentication flow using
`gh auth login`, device authorization, PATs or OAuth tokens supplied in chat,
or credentials embedded in Git commands.

## Select files

For a Git checkout, select tracked and unignored untracked files. Write the
NUL-delimited manifest outside `<source-dir>`, excluding sync records and
temporary records at every depth, including nested source directories:

```text
git -C <source-dir> ls-files --cached --others --exclude-standard -z -- . \
  ':(glob,exclude)**/*.muse-github-snapshot-sync.json' \
  ':(glob,exclude)**/*.muse-github-snapshot-sync.json.tmp-*' > <paths-file>
```

Without Git metadata, inspect the files and explicitly write selected
repository-relative paths to the same manifest. Apply both basename exclusions
at every depth, and check supplied manifests for them too. Tell the user sync
metadata is excluded: it can reveal other repositories' targets, absolute local
paths, commit SHAs, and selected files. If a sync record was explicitly
requested, explain the exclusion and obtain agreement before omitting it.

The manifest must end in NUL and is limited to 1 MiB. The CLI validates the
entire snapshot before writing: at most 2,000 files and 16 MiB of UTF-8 content.
Invalid or duplicate paths, missing files, symlinks, non-UTF-8 content, or
exceeded bounds reject the whole snapshot; nothing is pushed. `git ls-files`
can include deleted tracked files and binary assets. On validation failure,
inspect the selection and explain which requested files were rejected and why
before retrying. Omit requested files only with the user's agreement. Explain
that omitting deleted tracked files leaves their GitHub copies in place.

## Resolve sync provenance

Canonicalize `<source-dir>` to an absolute directory without a trailing slash.
Use a persistent directory, not a temporary directory or a Git-config-only
store. Lookup and saving both use the adjacent record
`<canonical-source-dir>.muse-github-snapshot-sync.json`, never a file inside the
source directory. Do not use `/`, which has no sibling record location. If an
existing record cannot be read or parsed, stop and recover it; do not replace
it or treat the current branch head as missing sync history.

## Check the target branch and selected paths

For a first upload, first distinguish a confirmed-empty repository from a
missing target branch in a repository with commits. Use the live catalogue's
read tools and an explicit empty-repository result to confirm there are no
commits or branch refs; a generic lookup failure, access error, or missing branch
does not prove emptiness. Prior sync history for this target makes missing
remote files divergence, not a fresh first upload.

For a confirmed-empty repository without prior sync history, do not create a
branch or require a head SHA. Explain before approval that the provider may
initialize the repository with a README.md and a separate initial commit
before the snapshot commit, possibly on its default branch. An unselected
README.md may remain; a selected README.md replaces that generated file.
Confirm that this fits the request, including replacement of that file.
Otherwise stop and agree on initialization before uploading. Hosted provider
support can differ; advertised push_files alone does not prove initialization
will succeed. The selected paths have confirmed remote absence in this case,
so no existing remote content needs a per-path sync-base comparison. Continue
to `Push the snapshot`; the remaining checks in this section apply to
repositories with commits.

Use the live catalogue's read tools to check whether the branch exists. A failed
lookup or access error does not prove absence. For confirmed absence, create
the branch from the user's intended starting commit or branch. If creation
fails or another writer creates it, check its state again. Once the branch
exists, use `list_commits` to record its current head SHA and apply the same
checks below, including to files inherited by a newly created branch.

For each selected path, find the GitHub commit it was last synced from. Use
the newest confirmed record entry matching owner, repository, branch,
canonical source directory, and that path. For paths without a matching entry,
use verified local Git history or other known sync provenance; an unpushed
local commit is not a GitHub sync base. Neither the observed head nor a new
branch's starting commit establishes the local files' sync base.

Use `get_file_contents` at the recorded head and each path's sync base to
compare remote content and existence. Additions, modifications, and deletions
are divergence, including a new local path already present remotely. For an
unknown base, incomplete comparison, or divergence, stop and reconcile or
obtain explicit overwrite intent for the affected paths.

## Push the snapshot

Immediately before a first upload to a confirmed-empty repository, recheck
that it is still empty. If commits or refs have appeared, use the existing
repository procedure above; if emptiness is unconfirmed, stop. Otherwise let
push_files initialize it during the approved write. For a repository with
commits, verify the branch exists and its head matches the recorded SHA.
If it changed or lookup fails, repeat the checks and reconcile or
obtain explicit overwrite intent for the new state. Branch checks and sync
records are agent-owned: the CLI validates file inputs but provides no atomic
head precondition or synchronization, so concurrent writes remain possible.

```text
github push-files --owner <owner> --repo <repo> --branch <branch> --message <message> --source-dir <source-dir> --paths-file <paths-file>
```

For local-file uploads, always use `github push-files`, even when their
contents have already been assembled into a small JSON payload. It reads
bounded inputs through privsep descriptors and enforces the file-input
validation described under `Select files`.
Use `github call-tool --name push_files --arguments-json '<json-object>'`
only for assembled content that did not come from local files and fits in
command arguments; it does not perform that file-input validation.
Both call the same MCP `push_files` tool through the existing provider handler,
connector token, write approval, and response guard. The adapter only prepares
local inputs; branch checks and sync records follow this procedure.

## Record confirmed success and recover failures

After the provider confirms success and a full commit SHA, append an entry
containing that SHA and the exact submitted paths to the adjacent durable JSON
record. Directories without Git metadata use the same record. Store an ordered
array of entries with this shape:

```json
{"owner":"<owner>","repo":"<repo>","branch":"<branch>","source_dir":"<canonical-absolute-source-dir>","commit_sha":"<confirmed-full-GitHub-commit-SHA>","paths":["<submitted-relative-path>"]}
```

Write the updated array to `<sync-record-path>.tmp-<unique-id>` and atomically
replace the record. Remove temporary files after failure; selection excludes
them even if cleanup fails. Retain earlier entries so paths omitted from later
snapshots keep their last sync SHA; lookup uses the newest matching entry for
each path. Advance only paths GitHub confirmed it committed.

Failed, rejected, or uncertain writes never advance the record. Obtain the SHA
from the confirmed provider result, not a later head lookup that may reflect
another writer. If success or its SHA is unconfirmed, leave the record unchanged
and reconcile the outcome before another push. If record saving fails after
confirmed success, report that the remote write succeeded but its record was
not saved. Recover the record from that result without repeating the write.

After an initialization attempt, inspect the target branch and any generated
README.md or default branch. Initialization may have succeeded even when the
snapshot failed; do not record its initial commit as a successful snapshot or
retry as though the repository were still empty. Apply the existing-repository
checks to that state before another write, and report any extra file or commit.
