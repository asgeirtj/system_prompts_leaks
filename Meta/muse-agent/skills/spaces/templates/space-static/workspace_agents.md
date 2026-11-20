# Building this web artifact

This directory is a web artifact — a lite static page: one self-contained
`index.html` plus any binary assets under `./assets/`, with no server, database,
or migrations (see `space.json` for its runtime and slug).

Build, audit, and ship it only through the web-artifact tools your builder
instructions describe. Do not hand-edit the built bundle under
`~/workspace/ts-spaces/<slug>/.space-build/`, and do not `bun run build`:
neither publishes the artifact.

If you are not the builder subagent (for example, the main assistant landed
here), do not build from this directory. List the existing artifacts and
request a change by describing the edit — that spawns a builder to do the
work.
