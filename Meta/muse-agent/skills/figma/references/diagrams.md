# FigJam diagrams

`generate_diagram` produces editable FigJam content from Mermaid. Use it for
flowcharts, architecture flows, sequence diagrams, ER diagrams, state diagrams,
and Gantt charts. It does not support pie charts, mind maps, Venn diagrams,
class diagrams, C4 diagrams, or Mermaid timelines.

Ground the diagram in source code, specifications, existing Figma content, or
focused user answers. Do not invent entities or edges merely to make the graph
look complete.

Keep Mermaid compatible with Figma's renderer:

- Do not use emoji, HTML labels, or escaped `\n` label breaks.
- Use simple camel-case node IDs; do not use reserved words such as `end`,
  `graph`, or `subgraph` as IDs.
- Quote labels containing punctuation or parentheses.
- Do not rely on sequence-diagram notes or Gantt styling; the renderer strips
  them. Add annotations afterward with `use_figma` when they materially help.

Do not call `create_new_file` before `generate_diagram`; diagram generation can
create its own FigJam file. On an iteration, pass the existing `fileKey` so the
user does not accumulate duplicate draft files. Ask whether to retain both
versions or replace the earlier diagram before deleting anything.

After two unsatisfactory attempts, stop regenerating and ask which concrete
part needs correction.
