# Context that changes how you read the chart

Three optional reporting examples with **new fictional observations and context records authored together**. They are not company data, reconstructed history, or events added to an existing dataset. Each annotation supplies a fact absent from the plotted measure. The report, source panels, and standalone chart-image descriptions disclose the fictional scope.

| Reporting question | Context absent from the chart | What it changes |
| --- | --- | --- |
| What changed in the intake operation? | The operations log dates the opening of a second intake desk. | The timing helps focus a routing review. The daily completion totals do not measure the desk's incremental effect. |
| Is the billing peak recurring? | A ledger record identifies a one-time catch-up invoice for June work. | Subtracting the recorded USD 24,000 from USD 37,200 leaves USD 13,200, within the other weeks' range. This is accounting, not a forecast of recurring demand. |
| Does the higher incident count mean performance worsened? | The monitoring register expands coverage from eight to twelve locations. | The totals span different reporting populations. Compare consistent coverage before treating the increase as deterioration. |

The annotations carry the contextual facts. Concise prose explains their implications instead of repeating them. Operations and coverage use date-event annotations on time-series lines; the billing note points to the posted value of its weekly bar, without a date line through the bar. All three use the same shared `ChartRenderer`, plain full-text labels, collision handling, and figure-note fallback. The report keeps one 720px column and the shared title editor, rich narrative editor, component actions, source inspection, themes, print, and image export.

## Build a separate report

From the canonical `templates/data-app/base` directory, with its dependencies installed:

```sh
node examples/reports/contextual-stories/build.mjs
node examples/reports/contextual-stories/build.mjs --output-root /absolute/new/project
node examples/reports/contextual-stories/build.mjs --output-root /absolute/new/private-preview --local-preview
```

The default build creates a fresh temporary project. `--output-root` selects a durable directory and refuses to overwrite anything already there. The builder copies the exact canonical runtime, adds only the authored content and evidence, runs the normal integrity check and production build, and prints the HTML path. It never replaces another report or its saved work.

`--local-preview` is for private maintainer review over loopback. It embeds the generated project's own path for existing local actions. Do not publish or distribute that private build; use the normal build for delivery. Generated projects and HTML do not belong in Git.

## Evidence and reproduction

`evidence.json` contains 20 observations and three separate context records across the three cases. Records have stable IDs, exact ISO dates, concise factual text, and explanatory detail. `joinContextRows` sorts observations and left-joins records by exact date, retaining the original measured values. A missing or ambiguous match produces empty context, not a guessed event.

Each chart uses one reviewed query containing its descriptive numeric field, `date`, `context`, and `contextId`. Adjustment and coverage rows also retain `oneTimeAmount` and `coveredLocations`. The event annotation references `field: "context"`, so the shared inline projection retains the contextual text. Its component-scoped metric definition also carries the record ID, date, and detail; source lineage identifies the evidence and calculation files. The source panel records the actual file-based join expression, not invented SQL or a claimed external query.

The generated project contains `src/content/report/evidence/evidence.json` and `story-results.json`. The results record the evidence SHA-256, hashes of each joined row set, exact context dates/text, and the billing subtraction. Reproduce from that project:

```sh
node src/content/report/stories.mjs
npm run build
```

Every new build receives a fresh artifact ID. Reproduction preserves that ID, title, prepared date, legacy title, report settings, publication metadata, and other saved snapshot metadata. It replaces the verified queries and refreshes the derived example metadata. The sources have different windows, so the gallery does not invent a shared "As of" cutoff.

## Corrections and saved edits

Annotations are derived from current reviewed context, not hardcoded labels. Missing, conflicting, invalid, or structurally contradicted context removes the generated annotation. Revised record text updates it, while implication prose rechecks its supporting observations. An original eight-to-twelve coverage label cannot survive a correction that changes the structured location counts, and the original one-time invoice label cannot survive removal of its one-time amount.

Source record IDs, artifact IDs, and component IDs are stable. An example-generated annotation ID includes a small deterministic ownership fingerprint of its record ID, kind, field, date, and wording. It identifies a **context revision**, not security or source authenticity. This lets repeated data corrections replace stale generated annotations even after chart edits, without treating custom wording under an old ID as example-owned. Unrelated annotations, custom date/field/wording edits, other saved chart settings, and explicit empty annotation lists remain intact. Removing an annotation does not cause it to reappear on the next correction.

These are examples of when context earns space in a figure, not a quota of three annotations for other reports. The [adoption/retention reference](../adoption-retention/README.md) leaves its ordinary comparisons unannotated because the evidence supplies no additional contextual facts.
