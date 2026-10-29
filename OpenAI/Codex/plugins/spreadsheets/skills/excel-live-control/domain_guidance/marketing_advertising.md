## Marketing/Advertising Guidance

Use for campaign, funnel, lead, CRM, attribution and advertising-performance tasks. Follow [Domain Requirements](../SKILL.md#domain-requirements) for financial planning or valuation, including work for a marketing company; add the relevant marketing metric definitions without replacing Finance conventions.

If any specific rule conflicts with user's request or reference, always prioritize the user's request first, then reference/template then general defaults.  
Use [Style guidance](../style_guidelines.md) for shared formatting; the task and intentional reference determine the presentation, not the employer's industry.

For read-only questions, inspect relevant source records, calculations, definitions, units, periods and protocols without modifying/exporting, changing inputs, adding helper fields/checks or refreshing sources. Report gaps and failed checks rather than repairing them. Authoring defaults apply only to requested creation or edits; preserve original source records and narrow-edit scope.

Distinguish extract freshness from analysis time, and trace requested campaign, channel or funnel outputs to their calculations and sources while preserving the comparison basis.

### Tab structure

- Keep source data, analysis and stakeholder outputs clearly distinguishable without treating those roles as mandatory tabs. Use separate sheets when import/refresh boundaries, calculations, different readers or an explicit request justify them; a compact report may combine compatible roles in labeled regions while preserving the raw data.
- Clearly name tabs by content (e.g., "Leads_Q1_2025", "Pipeline Analysis", "ROI Dashboard") so that users can easily find inputs versus results.

### Cell formatting

- Use target-based emphasis only when it helps the requested comparison and the source supplies the target and better/worse direction. Make the meaning clear with text or a legend; do not invent targets or require branding, traffic-light colors or KPI cards for every report.

### Marketing Analysis

- Follow [Formula Construction](../SKILL.md#formula-construction) and [Choosing Formulas and Excel Tools](../SKILL.md#choosing-formulas-and-excel-tools) for campaign/channel aggregation. Preserve the metric grain, denominator and comparison basis.
- Keep time-series dates typed and consistently formatted. Add an ISO export/helper column only when a downstream interface requires it and the requested scope permits it; do not convert the working date axis to text or add unused helpers.

### Raw data vs. outputs

- Keep raw data, including import data, intact and separate from any modifications
- Perform authorized cleaning, such as excluding test entries or combining categories, in derived columns or a prepared area when needed. Preserve the raw export and record exclusions or mappings. Feed the analysis from that prepared data without adding a tab merely to repeat it.
- Output figures should follow traceable calculations from the intact sources, whether those roles occupy separate sheets or clear regions on one sheet.
- Include a chart or compact visual only when it clarifies the requested trend, comparison or funnel. Keep its source ranges traceable; do not create a separate dashboard or hide supporting data merely to satisfy this example.

### Metadata and sources

- Document source platforms, extracts and as-of dates once in the appropriate input/source area or above the relevant input table, following [Citation Requirements](../SKILL.md#citation-requirements). Preserve required row-level provenance and short metric headers. Keep period and unit labels on outputs without repeating source footers there.
- Label any assumptions clearly
- Consistency is also key: if "CPC" means cost per click, ensure it's defined somewhere or obvious from context, so everyone reading the sheet interprets metrics correctly.
