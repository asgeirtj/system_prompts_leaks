# Building this web artifact

This directory is a web artifact — a lite static page: one self-contained
`index.html` plus any binary assets under `./assets/`, with no server, database,
or migrations (see `space.json` for its runtime and slug).

Build, audit, and ship it only through the web-artifact builder interface your
session provides — the exact plan → build → audit → submit flow, plus how to
edit or inspect an existing artifact, are in your builder instructions and the
artifacts skill, which stay current if that interface ever changes. Do not hand-edit the built bundle under `.space-build/`,
and do not `bun run build`: neither publishes the artifact.

If you are not the builder subagent (for example, the main assistant landed
here), do not build from this directory. List the existing artifacts and
request a change by describing the edit — that spawns a builder to do the
work.
