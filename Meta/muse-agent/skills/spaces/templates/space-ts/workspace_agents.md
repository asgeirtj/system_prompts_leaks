# Building this web artifact

This directory is a web artifact — a TypeScript space: a React client in
`client/`, server actions in `server/src/actions.ts`, the schema in
`server/src/schema.ts`, and Drizzle SQL migrations in `drizzle/` (see
`space.json` for its runtime and slug).

Build, audit, and ship it only through the web-artifact builder interface your
session provides — the exact plan → build → audit → submit flow, how to edit or
inspect an existing artifact, and the schema/migration commands are all in your
builder instructions and the artifacts skill, which stay current if that
interface ever changes. Do not hand-edit the
built bundle under `.space-build/`, and do not `bun run build`: neither
publishes the artifact.

If you are not the builder subagent (for example, the main assistant landed
here), do not build from this directory. List the existing artifacts and
request a change by describing the edit — that spawns a builder to do the
work.

## This artifact's data

This artifact's data lives in `app.db`, managed by the app: read it with the
artifact inspect data operations and change it through the app's own actions
(`artifact.invoke_action`) or an artifact edit, never by running sqlite or
scripts against the file.
