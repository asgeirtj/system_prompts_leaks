---
name: jupyter-notebooks
description: "Create, edit, or validate reproducible SQL or Python notebooks. Use for notebooks, SQL/Python scratchpads, reproducible exploration, audit trails, or runnable companions where the analysis should be reviewable or rerunnable."
---

# Jupyter Notebooks

Create, edit, or validate reproducible SQL or Python notebooks.

## Overall Instructions

- Follow the [shared Data instructions](../../shared/shared-skill-instructions.md) throughout this workflow.
- When exporting a Data report or dashboard to a notebook, follow the [Data App Contract](../../shared/data-app.md) for source preservation and export.

## Dependencies

Apply the shared [dependency resolution policy](../../shared/shared-skill-instructions.md#dependency-resolution) to the categories below.

- Data Warehouse: Queryable source data, schemas, and saved queries for reproducible analysis.
- Business Intelligence: Governed query results, semantic definitions, and reference reports.
- Product Analytics: Event and behavioral data for notebook calculations and comparisons.
- Knowledge & Files: Supplied datasets, existing notebooks, and methodological references.
- Developer Tools: Source code, version history, and execution context needed to reproduce the analysis.

## Related Guidance

Apply the shared [analysis quality criteria](../../shared/analysis-quality.md) when notebook results support a recommendation, shared claim, or decision. Keep the notebook's execution and result checks in this workflow.

Use [$visualize-data](../visualize-data/SKILL.md) for chart selection, analytical integrity, and visual QA when building notebook figures. Keep figures in notebook cell outputs using the notebook's plotting tools.

## Workflow guidance

For an export of an existing Data dashboard or report, apply the export requirements below and the reproducible-analysis workflow that follows them.

## Existing Data app export

1. Resolve the existing app and preserve the requested tabs, filters, local chart selections, narrative, definitions, caveats, freshness, and provenance. For a published app, follow [Published Site authentication](../../shared/data-app.md#published-site-authentication) before declaring a `401` blocked.
2. Notebook export is the exception to [Preserve chart images across non-PDF exports](../../shared/data-app.md#preserve-chart-images-across-non-pdf-exports): keep explicit editable plotting code. Use the app's already-authorized reviewed data and chart definitions, preserve the selected view, and do not fetch fresh data just to export.
3. Keep the notebook portable and rerunnable. Include the authorized inputs needed by the plots or identify the exact existing source artifact; do not depend on temporary image URLs or hidden execution state. Native chart PNGs can be comparison references, but must not replace the requested editable code.
4. Validate the notebook format, execute it top-to-bottom, and inspect the resulting plots against the app's selected charts. Verify values, signs, units, labels, series, filters, and local chart selections. Report any execution or fidelity gap explicitly.

## Reproducible analysis

Create clean, reproducible Jupyter notebooks that are easy to skim, rerun, and handoff. Make the findings visible through a clear summary, purposeful charts, and concise interpretation alongside inspectable code. Notebook work is not complete until the notebook executes successfully top-to-bottom and its saved presentation has been inspected, or the execution or inspection gap is called out with the exact validation steps needed to reproduce it.

## Workflow

1. Lock the notebook mode and scope.

   Decide whether the notebook is an analysis report, experiment log, diagnostic notebook, data-quality check, market-sizing calculation, model exploration, tutorial, or companion artifact for a report. Identify the reader, decision, expected handoff, required inputs, and whether the task calls for a new notebook or targeted edits to an existing one.

2. Inspect or scaffold with notebook-safe tooling.

   Prefer JupyterLab, `nbformat`, `nbclient`, or an existing scaffold utility over hand-editing raw JSON. When editing an existing notebook, preserve its intent and minimize JSON churn. Avoid reordering cells unless it clearly improves the top-to-bottom story. If raw JSON editing is unavoidable, validate the notebook structure before finishing.

3. Structure the notebook for the chosen mode.

   For analytical notebooks, default to:

   1. `## tl;dr`
   2. `## Context & Methods`
   3. `## Data`
   4. `## Results`
   5. `## Takeaways`

   Write `tl;dr` and takeaways after reviewing executed outputs. Use concrete observed values, visible patterns, rows, or charts, not assumptions. Include a `### Key Assumptions` subsection in `Context & Methods` when assumptions affect correctness.

   For tutorials or walkthroughs, adapt the same discipline to a teaching flow:

   1. `## Goal`
   2. `## Setup`
   3. `## Steps`
   4. `## Checks`
   5. `## Next Steps`

4. Build a clear data and computation path.

   Separate setup, imports, parameters, data loading, data preparation, calculations, visualizations, and interpretation. If the notebook uses both SQL and Python, keep complex SQL in SQL cells or separate query files rather than large embedded Python strings unless there is a clear reason. Use descriptive variable names and keep each code cell focused on one step.

5. Use data sources deliberately.

   When a notebook needs table data, first use `~~structured_data` to confirm table choice, schema, partition filters, sample rows, and query-submission policy. Use the relevant source connector when available, then fall back to exports or pasted SQL when needed. Use `~~operations_logs` for freshness or lineage checks when they matter. Record query permalinks, request IDs, source paths, dashboard links, extract names, or other source artifacts in the notebook context for any executed result that supports the analysis. Keep heavy queries filtered and bounded instead of turning the notebook into a broad live-source scan.

6. Make cells readable and bounded.

   Add concise markdown headers before most code cells. Keep headers brief and action-oriented, such as `### 1. Load Data`, `### 2. Validate Inputs`, or `### 3. Plot Results`. Favor several short cells over one large mixed-purpose cell. Keep prose short: explain purpose, assumptions, and expected result, not every line of code. Split multiple tables or charts across separate cells instead of dumping all outputs from one cell.

7. Make the analytical results visual.

   For each main question, choose a chart when it helps the reader see a comparison, trend, distribution, relationship, or uncertainty. Analytical notebooks with such evidence should include rendered figures by default, even when the user did not explicitly ask for charts. Choose complementary views when they answer different parts of the question; do not stop at a preview table or one token chart while the main findings remain buried in code or prose. Scale the visual coverage to the task rather than a fixed chart count, and honor explicit table-only requests or small checks where a chart adds no information.

   Place each figure beside the calculation it explains, followed by a short interpretation of the observed result and any material caveat. Use the [Visual Presentation](#visual-presentation) standards below and the chart-selection guidance in $visualize-data. Keep exact-value tables where they help lookup or audit.

8. Validate results before writing conclusions.

   Check that key numbers, charts, and takeaways match executed outputs. Bound raw debug output, oversized tables, and noisy logs. If a result is surprising, add a local reasonableness check, small sample inspection, or reconciliation against a trusted source before promoting it to the summary.

9. Execute, inspect, and record validation status.

   Run the notebook top-to-bottom when the environment allows:

   ```bash
   python -m jupyter nbconvert --execute --to notebook --inplace path/to/notebook.ipynb
   ```

   Optional local setup when needed:

   ```bash
   uv pip install jupyterlab nbformat nbclient ipykernel
   ```

   Save the executed notebook with its intended figure and table outputs so it is useful when opened without rerunning. Open the saved notebook in an available notebook viewer, or render an HTML preview and inspect it. Check the summary, results, and figures at the intended reading size for missing outputs, clipped labels, unreadable text, excessive whitespace, and long raw dumps. Fix presentation problems and rerun affected cells before saving; rerun top-to-bottom if computation or dependencies changed.

   If execution or visual inspection is not possible, say so explicitly and provide the exact command, missing dependency, credential, data access, kernel, viewer, or environment step needed to validate locally. Do not claim a visual check based only on successful execution or the presence of image data.

## Standards

### Notebook Structure

- Make the default top-to-bottom read clear before the reader starts executing cells out of order.
- Put executive summary material at the top, but write it last after inspecting executed results.
- Keep notebook sections aligned with the notebook mode: analysis, experiment, diagnostic, tutorial, or handoff artifact.
- Keep section titles, chart titles, labels, and file names descriptive enough for handoff.
- Preserve the existing notebook's intent when refactoring; improve structure without rewriting everything by default.

### Visual Presentation

- Give the notebook a descriptive title and a compact summary of the observed results. Use headings, whitespace, and brief takeaway callouts to establish a reading order; keep detailed setup and audit material in clearly labeled sections.
- Match figures to the evidence: for example, a retention analysis may need a cohort heatmap and a same-age cohort comparison; an experiment readout may need effect estimates with intervals; a diagnostic may need a time series and a segment breakdown. Use only views supported by the available data, and preserve missing values and immature cohorts instead of painting them as zero.
- Define a small shared plotting style near setup and reuse it: consistent figure sizing, readable type, restrained gridlines, and stable colors for the same measures or groups. Use accessible contrast and labels or line styles so color is not the only distinction. Resolve dense charts by simplifying or splitting them, not shrinking text.
- Give every figure a descriptive title, meaningful axis labels and units, and the period, population, denominator, or baseline needed to interpret it. Annotate material changes or comparisons with computed values; explain interval meaning when showing uncertainty. Keep source references traceable from the figure's section.
- Use native notebook plotting such as Matplotlib or the environment's supported chart library. Prefer self-contained static figure outputs for portable handoff. Use interactive charts when exploration helps and the destination supports them; retain a static view of the key result when interaction requires a live kernel, external JavaScript, or viewer-specific extensions.
- Format tables for reading: descriptive column names, units, sensible precision, and bounded rows and columns. Use a sorted comparison or selective emphasis when useful, and retain plain values if richer styling does not survive the target viewer. A styled table complements charts but does not replace a useful view of the main pattern.

### Reproducibility

- Keep parameters, date ranges, filters, cohorts, assumptions, and source references visible near the top of the notebook.
- Record enough source context for another reader to trace the analysis: query permalinks, request IDs, table names, source paths, spreadsheet tabs, dashboard links, extract versions, or input file locations.
- Make computation deterministic where possible. Avoid hidden state, manually edited intermediate values, out-of-order dependencies, and unexplained cached outputs.
- Prefer explicit environment setup cells or notes when the notebook depends on nonstandard packages, kernels, credentials, or local files.
- Execute the notebook when the task requires a runnable artifact. In the final response, do not add a separate routine validation section for a clean run; surface execution gaps, partial execution, or unrun notebooks with the reason because those affect whether the user can rely on the artifact.

### Code And Data Hygiene

- Separate data preparation from presentation.
- Keep complex SQL readable and documented with a one-line goal comment.
- Keep plotting and lightweight shaping in Python after the data preparation step is complete.
- Use descriptive variable names and avoid abbreviated temporary names in reader-facing notebooks.
- Keep outputs bounded. Prefer small preview tables, sampled rows, explicit limits, and focused charts over raw dumps.
- Avoid broad live-source scans. Filter queries by needed partitions, cohorts, or time windows.

### Analysis Quality

- Make assumptions explicit when they affect interpretation.
- Tie takeaways to executed outputs with concrete numbers, rows, charts, or visible patterns.
- Do not promote unexecuted or unverified calculations into the `tl;dr`.
- Label caveats, incomplete checks, missing source access, and known validation gaps.
- Add reasonableness checks for surprising results, high-impact claims, or stakeholder-facing conclusions.

### Validation Checklist

- Required section order is present for the notebook mode.
- The notebook executes without runtime errors, or execution failure is called out explicitly.
- Outputs are present where expected and are not dominated by raw debug dumps.
- Main analytical questions have useful rendered visuals where the evidence supports them; chart omissions fit the task or an explicit user preference.
- The `tl;dr`, results, and takeaways match executed cells.
- Source references and query or artifact links are preserved.
- Tables and charts are labeled, bounded, and interpretable.
- The saved notebook retains intended outputs, and its rendered presentation has been inspected at reading size, or the inspection gap is stated.
- The final response includes the notebook path and validation status.
