# Delivery diagnostic

**Question:** Why are more orders arriving late, and what should we fix first?

This compact synthetic case shows a complete business diagnostic, not a required outline: a supported hypothesis, volume-adjusted decomposition, a like-for-like comparison, alternative explanations, and two reviewable next-step drafts.  
Meridian Home and every observation and source record are fictional. No internal company evidence, live connector, or executed SQL is implied.

## Build and inspect

From the canonical template, with its documented dependencies installed:

```sh
node examples/reports/delivery-diagnostic/build.mjs --output-root /tmp/delivery-diagnostic
```

The output directory must not already exist. The build prints its project and compiled HTML paths. Open the compiled report, not this source directory. To test an unsent Codex task with a trusted local project root, add `--local-preview`.  
The ordinary build retains the hosted handoff path and never submits a task.

This example inherits the report's typography, 748px editorial column, chart-card treatment, and task-link layout. There is no example-specific stylesheet or parallel runtime. Its three charts have 300px **content** height; card padding,
headings, and legends add to the outer height.

## Why this composition

- The lead gives an answer and the reason for the recommendation. Timing supports a hypothesis, not a measured causal claim.
- Two annotations add recorded operational context that is absent from the plotted measures. Their supporting records remain available in source panels.
- Group rates use their own denominators. Extra late orders are an accounting decomposition, not a claim about how many a proposed fix would prevent.
- Method detail, source records, and cost assumptions use `ReportDisclosure`.  
  Material limitations stay in the main narrative, and charts stay visible.
- `ReportTaskLink` supplies the shared link style, saved-narrative handling, and capability rules. The links prepare a pilot brief or cost comparison; they do not authorize booking a pickup, changing the report, or contacting anyone.

## Reproduce and revise

The copied project includes `src/content/report/evidence/evidence.json`. Run `node src/content/report/diagnostic.mjs` from that project to validate counts,
recalculate all rates and contributions, and write a SHA-256 evidence receipt.  
Reproduction preserves report identity, saved metadata, and authored title.

When revising the evidence, review the narrative and next steps as well as the charts. The generated schedule notes are omitted if their supporting record is missing, ambiguous, or changed; independently authored annotation edits survive.  
This guard is not a substitute for reviewing the report's conclusions.
