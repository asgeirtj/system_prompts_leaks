# Follow the user's template or design

Read this when editing an existing deck or matching a supplied design.

## Determine how to use the supplied deck

Determine whether the user wants to edit the deck, match its design, use it for inspiration or take content from it. Follow its design when asked to match it or use it as a template. If the user supplies a deck only as a source of text, data or images, do not assume they want you to copy its design.

## Inspect before changing

Render the source slides relevant to the task. Check slide dimensions, layouts, title and body positions, fonts, colors, logos, image crops and repeated elements such as footers. When adapting a whole deck, inspect every source slide before choosing layouts. Use the actual reference; do not rely on memory or assume a 16:9 slide size.

For PPTX, read the API references for [imported decks](../artifact_tool_docs/api/references/cookbook/imported-deck.md), [masters](../artifact_tool_docs/api/references/master.spec.md), [layouts](../artifact_tool_docs/api/references/layout.spec.md) and [inspection](../artifact_tool_docs/api/references/inspect.md). Use `presentation.inspect({kind:"layout"})`, `presentation.masters.items` and placeholder summaries to see which elements and styles come from shared masters and layouts.

## Reuse the structure

Work on a copy. Import and reuse or duplicate source slides, fill existing placeholders, and edit existing elements in place. Keep dimensions, masters, layouts, theme, fonts, spacing, image styles and repeated elements unless the task calls for changes. Edit individual slides when possible. Change a shared master or layout only when the change should apply to all slides that use it.

Fit new content into the existing layout instead of covering it with a new design. Remove unused placeholders, but keep required template elements. If the slide count is fixed, fit the content without adding slides. A PDF or image reference may need to be rebuilt as editable objects. Match its appearance and explain any differences that affect the result; do not claim its underlying structure is identical.

## Verify the match

After export, compare changed slides with the originals side by side. Include every slide that uses a master or layout you changed. Check appearance and editability. A successful import or render does not prove the template was preserved. If the tool loses required elements or styles, investigate and try to restore them. Ask about an alternative only if the loss prevents the requested result.
