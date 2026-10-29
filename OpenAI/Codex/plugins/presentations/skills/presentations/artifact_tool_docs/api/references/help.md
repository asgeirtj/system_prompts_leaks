# Help

Use `presentation.help(...)` to search the presentation JS API and template
catalog. Help emits bounded NDJSON records for quick lookup during create, edit,
and review workflows.

## Query

```ts
const result = presentation.help(query, {
  search,
  include,
  maxChars,
});
console.log(result.ndjson);
```

Example output for `query = "*"` with `include = ["index", "examples"]`:

```text
{"kind":"api","name":"presentation.help","summary":"Search the presentation JS API and template catalog.","tags":["help","docs","examples","presentation.help"],"examples":[{"summary":"Find shape editing APIs","code":"const result = presentation.help('*', {\n  search: 'slide.shapes.delete|shape.delete|slide.shapes.add|deleteAll',\n  include: ['index', 'examples', 'notes'],\n  maxChars: 12000,\n});\nconsole.log(result.ndjson);"}]}
{"kind":"api","name":"slide.shapes.add","summary":"Add a preset/custom/connector shape to a slide.","tags":["shape","shapes.add","rectangle","ellipse","connector","slide.shapes.add"],"examples":[{"summary":"Create a styled rectangle","code":"const shape = slide.shapes.add({\n  geometry: 'roundRect',\n  position: { left: 72, top: 96, width: 320, height: 120 },\n  fill: { type: 'solid', color: 'accent1' },\n  line: { style: 'solid', fill: 'accent2', width: 2 },\n});\nshape.text = 'Launch plan';"}]}
{"kind":"template","name":"agenda","summary":"Agenda slide with a title and list body.","examples":[{"summary":"Apply the agenda template","code":"presentation.apply(presentation.template('agenda'));"}]}
```

Use API records to find facade names and examples; use template records with  
`presentation.template(name)`.

Common queries:

```text
*, shape*, slide.shapes.add, chart xAxis, template*
```

Query behavior:

```text
* lists all matching API and template records
shape* uses glob matching
slide.shapes.add matches the exact dotted API name
chart xAxis matches entries containing either word token
template* lists template records only
```

Use `search` as a case-insensitive regular expression over the JSON lines after
the primary query has selected records:

```ts
const focused = presentation.help("*", {
  search:
    "slide\\.shapes\\.delete|shape\\.delete|slide\\.shapes\\.add|deleteAll",
  include: ["index", "examples", "notes"],
  maxChars: 12000,
});
console.log(focused.ndjson);
```

## Include

Default output includes index fields such as:

```text
kind, name, summary, tags
```

Useful include tokens:

```text
index, examples, notes
```

`include` accepts either an array or a comma-separated string:

```ts
const shapeExamples = presentation.help("slide.shapes.add", {
  include: ["examples", "notes"],
});

const templateExamples = presentation.help("template*", {
  include: "index,examples",
});
```

## Inline Type

```ts
type PresentationHelpOptions = {
  include?: string[] | string;
  search?: string;
  maxChars?: number;
};

type PresentationHelpResult = {
  ndjson: string;
  truncated: boolean;
  metadata: {
    revision: string;
    query: string;
    include: {
      requested?: string[] | string;
      tokens: string[];
    };
    search?: string;
    notices?: string[];
  };
};
```

## Record Kinds

API records describe public JS facades and methods:

```text
{"kind":"api","name":"slide.shapes.add","summary":"Add a preset/custom/connector shape to a slide.","tags":["shape","shapes.add","rectangle","ellipse","connector","slide.shapes.add"]}
{"kind":"api","name":"shape.delete","summary":"Delete this shape from its slide.","tags":["shape","delete shape","remove shape","shape.delete"]}
```

When examples are included, records focus on usage snippets:

```text
{"kind":"api","name":"slide.shapes.add","examples":[{"summary":"Create a styled rectangle","code":"const shape = slide.shapes.add({\n  geometry: 'roundRect',\n  position: { left: 72, top: 96, width: 320, height: 120 },\n  fill: { type: 'solid', color: 'accent1' },\n  line: { style: 'solid', fill: 'accent2', width: 2 },\n});\nshape.text = 'Launch plan';"}],"notes":["Preset geometry values include rect, roundRect, ellipse, triangle, rightArrow, and many other PowerPoint shape names."]}
```

Template records describe named template patches for  
`presentation.template(name)`:

```text
{"kind":"template","name":"title-slide","summary":"Title + subtitle slide with centered text boxes."}
{"kind":"template","name":"two-up","summary":"Two-column slide with left/right content boxes."}
{"kind":"template","name":"agenda","summary":"Agenda slide with a title and list body."}
```

If output exceeds `maxChars`, the final line is a notice record and
`result.truncated` is `true`:

```text
{"kind":"notice","message":"Truncated: omitted 93 lines. Increase maxChars or narrow query."}
```

## Create/Edit Loop

```ts
// Find the public API surface for the edit.
const shapeHelp = presentation.help("shape*", {
  include: ["index", "examples", "notes"],
  maxChars: 8000,
});

// Build with the documented JS facade.
const slide = presentation.slides.add();
const shape = slide.shapes.add({
  geometry: "roundRect",
  position: { left: 72, top: 96, width: 320, height: 120 },
  fill: { type: "solid", color: "accent1" },
});
shape.text = "Launch plan";

// Inspect the live deck after editing.
const snapshot = await presentation.inspect({
  kind: "slide,textbox,shape",
  maxChars: 4000,
});
```

## Imported Templates

```ts
const templates = presentation.help("template*", {
  include: ["index", "examples"],
  maxChars: 4000,
});

presentation.apply(presentation.template("agenda"));
```

Use template help to discover the available names before calling  
`presentation.template(name)`.

## Cookbook

```ts
// List the top-level deck APIs.
const deckApis = presentation.help("presentation*", {
  include: "index",
  maxChars: 6000,
});
```

```ts
// Search broadly, then filter by regex.
const hits = presentation.help("*", {
  search: "chart|axis|legend",
  include: ["index", "examples"],
  maxChars: 8000,
});
```

```ts
// Pull examples for one exact API.
const examples = presentation.help("slide.charts.add", {
  include: ["examples", "notes"],
  maxChars: 4000,
});
```

```ts
// Pair help with inspect for focused edits.
const help = presentation.help("shape.text.replace", {
  include: ["examples", "notes"],
});
const before = await presentation.inspect({
  kind: "textbox,shape",
  search: "Placeholder",
  maxChars: 4000,
});
const target = presentation.resolve(anchorId);
target.text.replace("Placeholder", "Updated text");
const after = await presentation.inspect({
  target: { id: anchorId, beforeLines: 2, afterLines: 2 },
  kind: "textbox,shape",
  maxChars: 2000,
});
```
