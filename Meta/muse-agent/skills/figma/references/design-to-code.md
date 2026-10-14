# Design to code

Use this workflow when implementing a Figma screen or component in a codebase.

1. Inspect the target repository before editing. Identify its framework,
   styling conventions, installed design-system packages, existing components,
   assets, and tokens.
2. Call `get_design_context` for the requested node and request a screenshot in
   the same call when its live schema supports that option. If the response has
   no screenshot, call `get_screenshot` before editing.
3. If the context response says it is sparse, do not implement from that
   summary. Correlate its visible child IDs with the screenshot and request
   high-fidelity context for those children in one batch.
4. Treat generated React or Tailwind as a visual specification, not code that
   must be pasted verbatim. Translate it into the repository's stack, layout
   primitives, component boundaries, and interaction patterns.
5. Reuse Code Connect mappings at their mapped nodes. Also reuse suitable local
   components and tokens; recreate them only when they cannot express the
   design accurately.
6. Preserve every visible static asset in its intended slot and geometry.
   Download provider-supplied assets to durable project paths and remove all
   temporary Figma URLs. Never substitute the screenshot for implementation
   assets or redraw an available asset by hand.
7. Render the requested screen or component and compare it with the Figma
   screenshot. Fix in-scope layout, typography, color, interaction, and asset
   mismatches; report pre-existing out-of-scope differences without changing
   them.

Keep API- or prop-provided images dynamic. Avoid absolute positioning when the
design can be represented with the project's responsive layout system.
