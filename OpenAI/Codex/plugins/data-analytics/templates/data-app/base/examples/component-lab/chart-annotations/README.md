# Shared chart annotations

This optional synthetic example uses the same reviewed query, chart specification, and authored component in a report and a dashboard. It demonstrates a constant operating benchmark, a recorded event, an exact-date comparison window, and a reviewed point. The event is descriptive, not evidence of causation.

Keep labels concise. The shared renderer first fits plain noninteractive text inside the actual plot, without changing chart height, margins, or bar spacing. Text prefers a balanced two-line wrap and shares its reference line or arrow's theme color. Notes tied to a point, date, or period are left-aligned. A chart-wide horizontal benchmark instead uses a plot edge with matching text justification: right-aligned at the right edge, or left-aligned at the left edge when that gives a clearer fit beside its line. Try readable wraps beside the anchor before moving farther away; preserve whole words before using character splits. Nearby text needs no connector. Displaced labels may use an arrowhead pointing toward their source anchor. Only when the complete text cannot fit without covering data does it appear as a plain figure note below the plot. There are no annotation cards, hover popups, compact number markers, or click-to-highlight controls. Ordinary chart data tooltips and source inspection remain; print and image export retain the full evidence.

This fixture is a mechanical renderer check, not a model for annotation writing. An authored annotation needs additional sourced context absent from the chart, not a restated value, comparison, or trend. The [adoption/retention reference](../../reports/adoption-retention/README.md) leaves its ordinary comparisons unannotated; the [contextual examples](../../reports/contextual-stories/README.md) demonstrate when a sourced fact earns space in the figure.

Judge the relationship as well as the fit: a note must clearly belong to its bar, date, period, or threshold. Prefer the correct category row over unrelated whitespace and name the subject when omission could mislead. Explain the significance of a threshold beside its line; an unexplained stroke and a detached footnote are not a successful narrative annotation.

Bar-point arrows leave a small gap at both ends (nominally 6px beside the text and the painted bar edge), without adding a dot or drawing across its fill. They use a gentle curve where clear, or a straight connector when the bend would cross data or another label. The exact numeric endpoint still identifies the reviewed observation. If that bar or a safe connector cannot resolve, the complete note appears below the figure instead of floating over another bar. Range text first tries a padded position at the shaded area's leading edge, then searches along that edge before using the ordinary interior fallback.

From the canonical `templates/data-app/base` directory, with dependencies installed:

```sh
node examples/component-lab/chart-annotations/build.mjs
```

The builder creates two temporary projects, runs their normal protected-runtime checks and production builds, and prints each standalone HTML path. Pass `report` or `dashboard` to build one surface. No source data, default report text, or protected runtime is replaced in the canonical starter.

For a durable maintainer trial, add `--output-root /absolute/new/directory`; the builder refuses to overwrite existing report or dashboard projects. Add `--local-preview` only when serving the result privately over loopback. That build verifies the runtime and embeds its own project path so the existing local actions work; do not publish or distribute it. To serve a built project, run `npm exec -- vite preview --host 127.0.0.1 --port 4194` from that project's directory (choose another port for the second surface).

Change the example period to remove exact anchors, hide Repeat accounts in the legend to remove its point annotation, or use the chart-geometry selector to compare the four supported chart types. Ordinary saved chart edits take precedence and survive reload; the temporary geometry selector preserves the saved measure choices. The chart's source inspector and image-copy action retain the same reviewed annotation evidence. Adapt the pattern to a real question only after replacing the synthetic query and references with reviewed evidence.
