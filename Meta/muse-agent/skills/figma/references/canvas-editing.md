# Canvas editing

- `use_figma` runs a script inside Figma to inspect or change the canvas. The value the script returns is the only output you can use.

## Before editing

- Inspect the file with a read-only script first. Learn its editor type, pages, components, variables, fonts, naming and layout conventions.

- Infer the editor type from the URL path, which contains `/design/`, `/board/` or `/slides/`. Design, FigJam and Slides support different APIs and node types.

- Prefer the file's existing components, styles and variables over new lookalikes.

- Batch related changes when the batch stays understandable and safe to recover. Avoid many tiny mutation calls followed by redundant screenshots.

## Write the script

- `return` a structured result that lists every created or changed node ID. Logging to the console is not evidence.

- Await every asynchronous API call. Load the existing font before changing text, and never guess a font style name.

- Switch to a target page asynchronously and at most once per call. Split independent work on several pages into parallel calls.

- Use auto layout for children that belong together. Append a child to its auto layout parent before giving it fill or hug sizing, and resize before setting the final sizing mode.

- Color channels take values from 0 to 1. Put opacity on the paint, not inside its color object.

- Fill and stroke arrays are read-only. Clone an array, change the copy and assign it back.

- Place new page-level content in clear space instead of at the default origin.

## Recover and verify

- Treat a timeout or error as an uncertain write. When the result says a retry is unsafe without reading the canvas, inspect first and reconcile the created IDs before another change. Never replay a whole write blindly.

- Require structural evidence from each change, such as the affected IDs with counts, names or bounds.

- Take a screenshot after a meaningful composition step, and again only to check a visual fix. Stop once the structural and visual checks pass, because repeated screenshots use the user's allowance.
