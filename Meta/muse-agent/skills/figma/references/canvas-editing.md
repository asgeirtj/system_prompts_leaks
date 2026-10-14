# Canvas editing

Use `use_figma` for native canvas inspection and mutation. Its script executes
inside Figma; the value explicitly returned by the script is the usable output.

## Before editing

- Inspect the file with a read-only script first. Discover its editor type,
  pages, components, variables, fonts, naming, and layout conventions.
- Infer editor type from the URL: `/design/`, `/board/`, or `/slides/`. APIs and
  supported node types differ across Design, FigJam, and Slides.
- Prefer existing components, styles, and variables over parallel lookalikes.
- Batch related work when it remains understandable and safe to recover. Avoid
  many tiny mutation calls followed by redundant screenshots.

## Mutation rules

- `return` a structured result containing every created or mutated node ID.
  Logging to the console is not a substitute for returning evidence.
- Await every asynchronous API call. Load the existing font data before any
  text mutation; never guess a font style name.
- Switch to a target page asynchronously and at most once per call. Split
  independent multi-page work into parallel calls.
- Use auto layout for structurally related children. Append a child to its
  auto-layout parent before assigning fill or hug sizing, and resize before
  setting final sizing modes.
- Figma color channels use values from 0 through 1. Put opacity on the paint,
  not inside its color object. Clone read-only fill and stroke arrays before
  modifying and reassigning them.
- Position new page-level content in clear space instead of accepting the
  default origin.

## Recovery and verification

Treat a timeout or error as an uncertain write. If the result says it is unsafe
to retry without reading the canvas, inspect first and reconcile created IDs
before attempting another mutation. Never replay the whole write blindly.

Require structural evidence from each mutation: affected IDs plus useful
counts, names, or bounds. Take a screenshot after meaningful composition and
again only when validating a visual fix. Stop once structural and visual checks
pass; repeated unchanged screenshots waste the user's quota.
