# Workflows for creating new spreadsheets

## Quality Guidelines
- Build correct, readable, auditable workbooks for the intended audience; keep them simple and easy to update.
- Before populating, identify the audience, decision, target engine, outputs, inputs, calculations and checks from the user request, reference/template and applicable domain guidance. These roles do not require tabs: combine compatible roles and add tabs only for distinct readers, dependencies, refresh boundaries, auditability or an explicit request.
- Keep related inputs and calculation steps together. Calculate each result in one place and link to it from other views. Do not create a tab for a small supporting block that fits cleanly in an existing sheet.
- Put requested insights or recommendations once on the main dashboard, cover or summary. If none exists, place them near the relevant results. Support them with figures or rules already shown. Avoid generic rationale, invented scoring or long formula-generated narrative. Keep useful short calculated statuses and actions.
- For triage, priorities or next actions, make records needing attention and the reasons easy to find, using formatting for visual cues to highlight important items needing attention. Include owners, actions or deadlines when relevant and supported by the data. Keep summary counts traceable to those records.
- Reduce oversized widths/heights after autofit without clipping content.

## Checks
- Do not add a separate "Checks" tab for simple spreadsheets. Only add when useful for task/complexity.
