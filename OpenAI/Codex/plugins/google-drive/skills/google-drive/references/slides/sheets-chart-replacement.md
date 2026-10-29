# Sheets Chart Replacement

Use this reference when a Google Slides workflow needs to replace a screenshot, placeholder image, or stale chart graphic with a chart sourced from an existing Google Sheets workbook.

## Use When

- The user names both a spreadsheet and a presentation.
- The source chart already exists in Google Sheets and should be reused.
- The slide currently contains a screenshot, placeholder image, or other static chart content in the chart area.
- The user may also want a few narrow data edits before generating the refreshed chart graphic.

## Workflow

1. Ground both artifacts first.
- Search for the spreadsheet and presentation when the user gives titles instead of URLs.
- Read spreadsheet metadata to confirm the target chart titles and `chartId` values before writing.
- Read the presentation and target slides to capture slide numbers, titles, object IDs, and current chart-area elements.

2. Keep spreadsheet edits narrow when they are part of the request.
- Prefer exact cell updates on existing rows instead of table rewrites.
- Avoid KPI, headline summary, or rollup cells unless the user explicitly asks to change them.
- Do not add rows, remove rows, or create temporary charts unless the named chart is missing.
- Read back the changed ranges before touching Slides.

3. Capture the placeholder footprint from the live slide.
- Use `get_slide` to find the current screenshot, image, or placeholder object in the chart area.
- Reuse that element's size and transform as the starting footprint for the replacement chart.
- Use `get_slide_thumbnail` to check whether any separate instructional or placeholder text near the chart area also needs removal.

4. Replace the placeholder with the existing Sheets chart.
- Prefer `createSheetsChart` with the existing `spreadsheetId` and `chartId` from the workbook.
- Use `linkingMode: NOT_LINKED_IMAGE` when the user only needs a refreshed graphic and does not need the slide to stay linked to Sheets.
- Use `linkingMode: LINKED` only when the user explicitly wants ongoing chart linkage.
- Delete the obsolete screenshot or placeholder image once the replacement target is grounded.
- Preserve slide order, titles, nearby copy, and unrelated page elements.

5. Clean up chart-area residue.
- Remove separate placeholder or instructional text objects associated with the chart area when they are clearly obsolete.
- Do not delete slide titles, KPI summary content, or other non-chart text unless the user asked for that change.

6. Verify slide by slide.
- After each replacement, fetch a fresh thumbnail and refreshed slide structure.
- Expect Google Slides to normalize inserted chart size or aspect slightly; judge success by approximate footprint and visual cleanliness, not exact raw transform equality.
- Confirm the new chart object exists and the old placeholder image is gone before moving on.
- If the replacement changed visible chart-area layout, cleanup, or styling, continue with [visual-change-loop](./visual-change-loop.md) and do not stop before the third fresh visual review of that slide.

7. Report exact outcomes.
- Exact spreadsheet ranges changed.
- Old and new values for each edited data cell.
- Slide numbers updated.
- Replacement success per chart.
- Whether any placeholder text remained.

## Failure Policy

- If the named chart is missing, then and only then consider creating a replacement chart.
- If the replacement introduces a layout problem, switch to [visual-change-loop](./visual-change-loop.md) and adjust only the affected slide.
