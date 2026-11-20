# Building this web artifact

This directory is a web artifact — a TypeScript space: a React client in
`client/`, server actions in `server/src/actions.ts`, the schema in
`server/src/schema.ts`, and Drizzle SQL migrations in `drizzle/` (see
`space.json` for its runtime and slug).

Build, audit, and ship it only through the web-artifact tools your builder
instructions describe. Do not hand-edit the built bundle under
`~/workspace/ts-spaces/<slug>/.space-build/`, and do not `bun run build`:
neither publishes the artifact.

If you are not the builder subagent (for example, the main assistant landed
here), do not build from this directory. List the existing artifacts and
request a change by describing the edit — that spawns a builder to do the
work.

## This artifact's data

This artifact's data lives in `~/workspace/ts-spaces/<slug>/app.db`, managed by
the app. If you are the main agent, follow your own Artifacts instructions for
reading and changing a web artifact's records. Do not run sqlite or scripts
against `~/workspace/ts-spaces/<slug>/app.db`.
