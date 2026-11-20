# Design to code

- Read the design from Figma with the steps below, then follow [App Creation](/opt/muse/skills/app-creation/SKILL.md) to build it in the user's project.

- Before editing, inspect the project's framework, styling, design-system packages, components, assets and tokens.

## Read the design

- Call `get_design_context` for the requested node, and ask for a screenshot in the same call when its live schema offers that option. If the response has no screenshot, call `get_screenshot` before editing.

- When the context response says it is sparse, do not implement from that summary. Match its visible child IDs to the screenshot and request detailed context for those children in one batch.

- Treat the generated React or Tailwind code as a visual specification, not code to paste. Translate it into the project's own stack, layout primitives and components, and avoid absolute positioning wherever the project's responsive layout can express the design.

- Reuse a Code Connect mapping wherever a node has one. Elsewhere reuse the project's own components and tokens, and recreate one only when it cannot express the design.

## Bring in the assets

- Download every static asset the design uses to a durable path in the project, and replace each temporary Figma URL before the app uses it.

- Keep each asset in its intended slot and size. Never substitute the screenshot for an asset or redraw an asset that Figma supplies.

## Compare the result

- Render the requested screen or component and compare it with the Figma screenshot.

- Fix differences in layout, typography, color, interaction and assets within the requested scope. Report differences that predate the task without changing them.
