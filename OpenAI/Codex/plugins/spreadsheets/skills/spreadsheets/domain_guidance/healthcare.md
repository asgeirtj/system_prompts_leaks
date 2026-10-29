## Healthcare (clinical/administrative) spreadsheets

Use for clinical records, care delivery, patient/encounter analysis and healthcare administration tasks, not every workbook at a healthcare organization. Follow [Domain Requirements](../SKILL.md#domain-requirements): financial forecasts, budgets, cash planning and valuation use Finance guidance, with relevant healthcare definitions, protocols and units added when needed.

If any specific rule conflicts with user's request or reference, always prioritize the user's request first, then reference/template then general defaults.  
Use [Style guidance](../style_guidelines.md) for shared formatting; apply the healthcare requirements below only where the task needs them.

For read-only questions, inspect relevant source records, calculations, definitions, units, periods and protocols without modifying/exporting, changing inputs, adding helper fields/checks or refreshing sources. Report gaps and failed checks rather than repairing them. Authoring defaults apply only to requested creation or edits; preserve original source records and narrow-edit scope.

### Tab structure

- Keep raw clinical/administrative records distinct from calculations and reports. These are roles, not a mandatory three-tab template: use separate tabs when different datasets, access, refresh or review needs justify them; otherwise use clearly separated regions without changing original records.
- In a clinical context, you might have one sheet for patient-level data (each row = one patient or encounter), and another that summarizes by clinic or month.
- A staff list and appointment schedule may need separate tabs when their records or update owners differ.
- Name each tab descriptively, such as "Appointments_RawData", "Clinic KPI Dashboard".

### Formatting

- Highlight fields staff actually need to complete, following the reference's input styling. Record-only fields may be useful without feeding formulas, but their purpose must be clear; do not add unused input-looking placeholders.
- When the requested workflow needs clinical or follow-up flags, use only source/protocol-defined thresholds and preserve their severity meanings. Use bounded conditional formatting and include a legend when its meaning is not already clear.
- Use clear data formatting (e.g. YYYY-MM-DD or MM/DD/YYYY as required), identifiers (like medical record numbers), and units for all measurements (e.g. weight in kg, temperature in °C).
- For intended printed or urgent use, keep identifiers and relevant clinical information scannable without crowding. Follow [Freeze panes](../style_guidelines.md#freeze-panes) for long lists.

### Formulas

- For clinical indicators such as average length of stay or readmission rates, preserve the source definitions, periods and denominators. Use [Choosing Formulas and Excel Tools](../SKILL.md#choosing-formulas-and-excel-tools) for aggregation.
- Where calculations involve thresholds or guidelines (say, flagging patients with BMI over a certain value), consider referencing those thresholds from a single cell named "BMI_threshold" so that it's clear and adjustable, rather than embedding the number in multiple formulas.
- Follow [Checks and Audit](../SKILL.md#checks-and-audit) for relevant completeness and reconciliation checks. Independently verify critical clinical calculations against an authoritative source or qualified review and state when that verification is unavailable. Use only source-supported thresholds and definitions; do not invent clinical advice or change source protocols.

### Raw data and outputs

- Never alter or delete original healthcare data
- For data entries that need correction (e.g., a misspelled diagnosis or an out-of-range age), consider doing it via a data validation process or noting corrections in a separate column ("Corrected value") rather than overwriting, or maintain an audit log of changes.

### Metadata, units, and codes

- Healthcare data is full of codes and units, which must be documented.
- Always provide the units for each metric (e.g., blood glucose "mg/dL", heart rate "bpm").
- Include normal or target ranges only when the clinical task needs them and an applicable source/protocol supplies the range and context; do not infer a universal range.
- Keep code definitions available in a labeled region or a separate Codebook sheet when its size, reuse or review purpose warrants it; preserve existing definitions and source codes.
- If the main data uses abbreviations (like "M"/"F" for sex or clinic codes like "NYC" for New York Clinic), ensure there is a legend or the full term in the header ("Sex (M/F)" is clear).
