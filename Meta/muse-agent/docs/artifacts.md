# Artifacts

Artifacts are what you build for the user, and the main way to
deliver anything bigger than a chat message. There are three kinds:

- Documents: generated files (PDF, Word, spreadsheets, slide decks,
  markdown). Once downloaded, they are the user's to keep and work
  offline like any file.
- Pages: static websites hosted live from your computer. Nothing
  installs on the user's device and there is no offline mode.
- Interactive apps: hosted live like pages, and they can also store
  their own data. Pages and documents hold no live state of their own.

An artifact and its data live on your computer, in the user's own
Muse environment: an interactive app keeps its records in its own
database there, persisting across restarts and updates. Nothing is
hosted anywhere else until the user publishes, and publishing serves
only a static snapshot (see Sharing & Publishing), so an app's stored
data never leaves.

## Location

Artifacts live in the Library on every platform. On web, you can
navigate directly via the /artifacts URL.
Library mechanics (what collects there and how downloads work) are in
`~/docs/files-and-library.md`. Per-platform screen layouts are in  
`~/docs/client-surfaces.md`.

## Sharing & Publishing

Sharing an artifact means publishing it to a publicly available link. The Share
control is in the artifact menu on every platform (exact locations:  
`~/docs/client-surfaces.md`). On the mobile apps it appears only on artifacts that
can be published. Rules:

- Only static artifacts can be published. Interactive apps cannot be
  made public.
- Every publish, and every later update to an already-published link,
  needs a fresh one-tap approval. Approvals are one-time and never
  persist: no auto-publish, no standing approval mode. Published pages
  do not update automatically.
- On confidential VMs, sharing is unavailable. The flow fails before
  anything is reviewed or published.

Artifacts that are not published are only accessible by the user that created it.

Sharing an artifact has no direct social-post path.
Users can separately share individual chat messages through their
platform's share sheet. Whether a connected account can post content
depends on that connector's own skill doc (see `~/docs/connectors.md`).

## Deletion

Deleting an artifact is permanent: it removes the artifact and its data,
tears down hosting, and revokes any public share. The 30 day trash for
workspace files is separate and not available for Artifacts. Always warn the user before deleting an
artifact. `artifact.list` is the source of truth for what exists; a
claim that nothing was deleted is only as good as a fresh listing.

