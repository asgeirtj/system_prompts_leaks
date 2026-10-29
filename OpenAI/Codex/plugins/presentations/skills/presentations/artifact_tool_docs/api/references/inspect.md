# Inspect

`presentation.inspect({ select, include, fileName })` queries one public
presentation tree with [RFC 9535 JSONPath](https://www.rfc-editor.org/rfc/rfc9535.html).
The [JSON Schema](./inspect.schema.json) describes its content and layout fields.
`select` finds nodes; `include` chooses exact fields from those nodes.

## Read content

```ts
await presentation.inspect({
  select: "$.slides[*]",
  include: [
    "id", "index", "layout", "title",
    "elements.id", "elements.kind", "elements.text", "elements.alt", "elements.title",
    "notes.text",
  ],
  fileName: "content.ndjson",
});
```

This writes one slide per line, retaining its applied layout and editable
element IDs. Text includes paragraph breaks and complete table content. The
query omits positions and styles, so those fields are not computed.

The tree has this shape (selected fields):

```json
{
  "schema": "openai.presentation.inspection/v1",
  "unit": "px",
  "id": "pr/abcdefgh",
  "kind": "presentation",
  "slides": [{
    "id": "sl/12345678", "kind": "slide", "index": 0,
    "layout": { "id": "ly/abcdefgh", "name": "Title and image" },
    "elements": [{ "id": "sh/abcdefgh", "kind": "textbox", "text": "Welcome" }],
    "notes": { "id": "nt/12345678", "kind": "notes", "text": "Opening remarks" }
  }]
}
```

Only canonical prefix/hash IDs are exposed. Pass editable `sl/`, `sh/`, `im/`,
`ch/`, `tb/`, `ea/`, and `nt/` IDs to `presentation.resolve(id)`.
The read-only `ly/` ID identifies the applied layout. `index` is zero-based;
positions and computed font sizes use pixels.

## Find and edit

```ts
const hits = await presentation.inspect({
  select: "$.slides[*].elements[?(@.text == 'Confidential')]",
  include: ["id", "text"],
});
```

JSONPath filters inspect source fields before projection. Comparisons therefore
match the text itself, rather than its serialized JSON representation. Use
`$.slides[0,2].elements[*]` for two slides or a predicate such as
`@.kind == 'image'` for one element kind. Selected scalar values are also valid;
for example, `$.slides[*].title` returns title strings.

Use `search(@.text, 'overview|steps')` for a text pattern, or `match()` to match  
the entire string. Patterns follow [I-Regexp](https://www.rfc-editor.org/rfc/rfc9485.html).
`length()` measures a value, `count()` counts selected nodes, and `value()`
extracts a value when a query selects exactly one node. Filters use `==` and
`!=`; JavaScript expressions and method calls are not part of JSONPath.
Repeated selectors retain repeated results: `$.slides[0,0]` selects slide zero
twice. Invalid queries report a syntax error with the character offset.

Use the literal ID from the result for subsequent edits. Read computed styling
or mixed-format text for that same ID:

```ts
await presentation.inspect({
  select: "$.slides[*].elements[?(@.id == 'sh/abcdefgh')]",
  include: ["id", "text", "position", "style", "paragraphs"],
});
```

`style` reflects theme and inherited formatting. `paragraphs` preserves styled
runs; `cells` expands a table. These fields are evaluated when accessed without
rendering slides or fetching images. Explicit paths keep queries focused;
recursive `..` queries can traverse computed fields across the document.

`include` is an exact array of typed field paths. Nested paths such as
`elements.text` preserve arrays and object structure. Including a parent such
as `style` includes that complete object. Omitting `include` returns complete
selected nodes. Include `id` explicitly when the next step needs an editing ID.

## Files and results

An attached Artifact Session writes all selected records to
`<outputDirectory>/presentation-inspect.ndjson`. `fileName` chooses another
NDJSON basename. Reusing a name replaces that file. The completed session run's
`files` contains finalized paths. Unnamed inspection outside a session stays in
memory; the Node runtime supports a named standalone output path.

The returned object prints `recordCount` and output metadata. Access `.records`
or `.ndjson` explicitly for the complete values. No pagination or record
abbreviation applies to JSONPath queries. Select nodes and fields according to
the task before reading the output into model context.

Rendering separately writes `slide-N.png` and `slide-N.layout.json`. Layout
files use these same element fields and canonical IDs in a slide-scoped file
envelope. The file's `slide` contains the inspected slide metadata and its
`elements` contains the compact layout field selection. The content query does
not replace those render outputs. Full layout export also exposes inherited
paint layers and paragraph/run formatting.

## Types

```ts
type PresentationInspectQueryOptions = {
  select: string;
  include?: readonly PresentationInspectField[];
  fileName?: string;
};

type PresentationInspectQueryResult = {
  readonly records: readonly unknown[];
  readonly recordCount: number;
  readonly ndjson: string;
  readonly path?: string;
  readonly status?: "pending" | "saved" | "conflict" | "error";
  readonly message?: string;
};
```

The earlier preset and record-filter overloads remain deprecated compatibility
entry points. New callers should use the explicit query above.
