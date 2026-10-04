# Code Connect

Use Code Connect only for published components on an Organization or Enterprise
plan. The Figma URL must identify a node.

1. Call `get_code_connect_suggestions` with `excludeMappingPrompt` enabled to
   discover published, unmapped components in the selection.
2. For each returned main component ID, call
   `get_context_for_code_connect`. Supply the project's actual language and
   framework, inferred from its source and `figma.config.json`.
3. Inspect the codebase and match each Figma component to a real code component
   by purpose, property types, variants, and import configuration. If more than
   one candidate is plausible, confirm the match with the user before writing.
4. Account for every Figma property that has a legitimate code equivalent.
   Map every variant value exhaustively; omit properties with no corresponding
   code prop instead of inventing one. Resolve configurable nested components
   dynamically rather than hardcoding their output.
5. Validate the mapping against the code component's real prop types and the
   complete Figma property set before publishing it with an advertised Code
   Connect management tool.

For parserless templates, create `ComponentName.figma.ts`, use the `figma.code`
tagged-template form, and do not replace an existing parser-based `.figma.tsx`
mapping. Follow the project's existing Code Connect format when it has already
standardized on another supported workflow.
