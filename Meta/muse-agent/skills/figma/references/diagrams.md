# FigJam diagrams

- `generate_diagram` turns Mermaid into editable FigJam content. It supports flowcharts, architecture flows, sequence diagrams, entity relationship diagrams, state diagrams and Gantt charts.

- It does not support pie charts, mind maps, Venn diagrams, class diagrams, C4 diagrams or Mermaid timelines.

## Ground the diagram

- Base the diagram on source code, specifications, existing Figma content or focused answers from the user. Never invent entities or edges to make the graph look complete.

## Write Mermaid the renderer accepts

- Keep the Mermaid compatible with Figma's renderer:
  - Leave out emoji, HTML labels and escaped `\n` line breaks in labels.
  - Use simple camelCase node IDs, and never use reserved words such as `end`, `graph` or `subgraph` as IDs.
  - Quote labels that contain punctuation or parentheses.
  - Do not rely on sequence diagram notes or Gantt styling, because the renderer strips them. Add annotations afterward with `use_figma` when they help.

## Create and iterate

- Do not call `create_new_file` before `generate_diagram`, because diagram generation can create its own FigJam file.

- On a revision, pass the existing `fileKey` so the user does not collect duplicate drafts. Ask whether to keep both versions or replace the earlier diagram before deleting anything.

- After two unsatisfactory attempts, stop regenerating and ask which part needs to change.
