# Activation diagnostics: a methods-focused example

**Question:** Is the decline in Paid Search activation credible within the supplied data, and how much of the aggregate change comes from channel performance versus channel mix?

This example adapts the methods-focused report actually generated during the report composition evaluation. It uses an exact copy of the bundled synthetic `assets/demo-product-growth.csv`: 32 week/channel rows, April 6–May 25, 2026. It is an optional reference, not a required technical-report outline.

## Reasoning and composition

Check the observed grid and funnel arithmetic before comparing pooled April and May rates. Use ratios of summed counts, not averages of channel or weekly percentages. Show the timing in one chart, exact counts/rates in tables, and the symmetric within/mix identity beside its reconciled decomposition. A second decomposition and endpoint comparison test whether the interpretation depends on the chosen convention.

The report deliberately gives methods, reproducibility, sensitivity, and limitations more space than an executive brief. It uses ordinary public report, chart, table, and rich-text primitives, a wider evidence column, and source metadata for every derived query. It does not add a forecast or invent a causal explanation. The CSV cannot verify user-level cohort conversion, channel exclusivity, acquisition efficiency, production completeness, statistical uncertainty, or the reason Paid Search changed.

## Run it

From `templates/data-app/base`, with the canonical dependencies installed:

```sh
node examples/reports/activation-diagnostics/build.mjs
node examples/reports/activation-diagnostics/build.mjs --local-preview
```

The builder copies the **current** canonical runtime into a fresh system-temporary project, adds only authored files, reproduces the reviewed snapshot, verifies integrity, and builds `dist/index.html`. It prints the absolute path. The default starter and its data are not changed. Inside the generated project, rerun `node src/content/report/reproduce.mjs` to regenerate `src/data.json` and `src/content/report/evidence/results.json`, then rebuild normally.

`--local-preview` is only for canonical-template maintainer QA through a loopback browser. It verifies integrity before supplying the temporary project path as a one-build Vite definition. Do not publish or distribute that private preview. Ordinary generated-app delivery follows the shared Data App Contract. Do not commit generated HTML or results.
