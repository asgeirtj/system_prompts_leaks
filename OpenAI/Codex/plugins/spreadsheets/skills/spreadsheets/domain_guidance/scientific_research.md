## Scientific Research Guidance

Use for research observations, experiments, lab measurements, surveys, statistical analysis and reproducibility tasks. Follow [Domain Requirements](../SKILL.md#domain-requirements) for other functions: a research organization's financial forecast uses Finance guidance, not research-data formatting solely because of its industry.

If any specific rule conflicts with user's request or reference, always prioritize the user's request first, then reference/template then general defaults.  
Use [Style guidance](../style_guidelines.md) for shared formatting; apply the data-table requirements below to the relevant research records and interfaces.

For read-only questions, inspect relevant source records, calculations, definitions, units, periods and protocols without modifying/exporting, changing inputs, adding helper fields/checks or refreshing sources. Report gaps and failed checks rather than repairing them. Authoring defaults apply only to requested creation or edits; preserve original source records and narrow-edit scope.

### Tab structure & naming

- Keep raw observations intact in a clearly identified flat table, with one variable per column and one observation per row. Raw, processed and results are distinct roles, not a mandatory number of worksheets.
- Put cleaning or transformations in separate columns/regions or a processed-data sheet when needed; never overwrite original measurements. Choose separate sheets for substantive transformations, refresh boundaries, reproducibility or review needs, and preserve the requested source layout.
- Document cleaning steps and protocol in an existing appropriate region or a dedicated sheet when their extent warrants it. Add Calculations or Results sheets only for a distinct analytical or reader purpose, not to expand a simple raw-data export.

### Formatting

For raw/processed data tables consumed by analytical tools:

- Each column should contain one type of data (with units in the header, not mixed into the cells) and each row one record.
- Avoid merging cells or creating multi-row headers that can complicate data import into analysis tools.
- Do not use formatting (color, bold, italics) as the sole means to encode information, since analytical software may not recognize it. When flags are needed, use a labeled value column rather than a cell comment or color alone.
- Layout should be plain and data-focused: for instance, list any comments or notes in a separate column rather than as Excel cell comments or text boxes. This makes the data more machine-readable.

### Formula practices

- In scientific spreadsheets, complex data analysis is often done outside Excel, but when using formulas, prioritize transparency and accuracy.
- For requested randomization or simulation, document the method and inputs and preserve the protocol's reproducibility requirements. Follow [Choosing Formulas and Excel Tools](../SKILL.md#choosing-formulas-and-excel-tools) for formula choices.
- Avoid unrequested circular references. If a required protocol or reference uses iteration, follow [Circular References and Iterative Calculation](../SKILL.md#circular-references-and-iterative-calculation) and document its reproducibility implications.
- Show meaningful calculation steps under [Build Structure and Formula Flow](../SKILL.md#build-structure-and-formula-flow), without adding helpers for trivial expressions. Cross-check consequential calculations where possible and report limitations. Preserve the recorded protocol, source units and original measurements; distinguish flags, missing observations, simulation/randomness and assumptions without silently changing the analysis design.
