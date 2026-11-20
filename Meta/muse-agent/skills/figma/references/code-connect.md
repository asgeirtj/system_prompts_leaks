# Code Connect

- Code Connect works only for published components on an Organization or Enterprise plan, and the Figma URL must point to a node.

## Map components

- Call `get_code_connect_suggestions` with `excludeMappingPrompt` enabled to find published, unmapped components in the selection.

- For each returned main component ID, call `get_context_for_code_connect` with the project's actual language and framework. Infer them from the source code and `figma.config.json`.

- Match each Figma component to a real code component by purpose, property types, variants and import configuration. When more than one candidate fits, confirm the match with the user before writing.

- Map every Figma property that has a real code equivalent, and every value of each variant. Leave out a property with no matching code prop rather than inventing one.

- Resolve configurable nested components dynamically instead of hardcoding their output.

## Publish the mapping

- Check the mapping against the code component's real prop types and the complete Figma property set. Then publish it with the Code Connect management tool that `list-tools` advertises.

- For a parserless template, create `ComponentName.figma.ts` with the `figma.code` tagged template. Never replace an existing parser-based `.figma.tsx` mapping.

- When the project already uses another supported Code Connect format, follow it.
