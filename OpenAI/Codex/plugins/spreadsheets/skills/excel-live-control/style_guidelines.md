# Style and Formatting Instructions

Follow user instructions, then intentional templates/references, then domain guidance. Defaults apply only to new sheets or authorized restyling.

Render before editing. Preserve unrelated content, layout, formatting and native features; values-only edits must not change formatting.

## Tab Structure Defaults
- Follow [Workbook Structure](SKILL.md#workbook-structure) and [Build Structure and Formula Flow](SKILL.md#build-structure-and-formula-flow). Roles do not require separate tabs: keep simple workbooks basic and apply role styling by section on mixed-use tabs.
- Keep primary outputs and the assumptions control panel easy to find. Use a dark brand-color tab for outputs and one level lighter for Assumptions; standalone Finance Actuals tabs use light tan. Preserve intentional user/reference colors.
- For complex workbooks with several source/internal tabs after the working views, place a divider before that group. Do not add dividers for focused tasks. Choose a plain name that fits the group, such as `Data >>`, `Internal >>` or `Inputs >>`. Color the divider and leave its children uncolored, overriding individual role colors. Give any `ReadMe` tab a distinct muted color, including within a divider group. Leave other tabs uncolored unless color clarifies navigation.

## Reader-facing sheet layout

For new reader-facing sheets or authorized restyling, use a compact, presentation-style opening view: a concise unfilled title, modest whitespace and the main results. Choose a table, chart or both to suit the task. Covers follow the simple front-page guidance in Workbook Structure instead of the layout below.

For a filled Cover, start with a bounded area such as `A1:Z100` and adjust it to the intended opening view. Never apply the background to the entire worksheet or whole rows/columns.

- Use one blank top row, then a concise unfilled left-aligned title, a thin rule and compact spacing before the main content. Include essential context, not a required subtitle or takeaway. Avoid large filled title banners. This presentation default does not add blank rows to raw source tables or override a supplied layout.
- Remove filler. Put useful table commentary in ordinary `Notes` or `Comments` cells to the right, separated by at least one blank spacer column and outside the table header fill and borders. Turn wrapping off. Widen or shorten notes without increasing the table row heights; put longer required explanations in a separate notes area on the same sheet. Keep notes readable and unclipped. Do not add setup/footer blocks. Keep essential units and specific warnings beside the affected result. Follow [Citation Requirements](SKILL.md#citation-requirements) for sources and annotations. These are ordinary cells, not Excel Comments or Notes.
- Add summary/KPI cards only when they clarify the requested decision; do not duplicate a small table or make oversized cards.
- Choose cards, tables and charts for the task; keep useful trends and comparisons rather than defaulting every summary to a table. Use the width of an analytical Summary: place a compact table beside a useful chart and monthly detail below when that fits the content. Do not turn it into a tall page of prose or shrink fonts to force a layout.

## Use a visually clear layout
- Distinguish headers, inputs, calculations and notes consistently. Default to dark body text and restrained fills, not a universal teal theme. Preserve domain styling defaults, like finance input/formula/source colors and dynamic statuses.
- When cases are used, including outside Finance, show `Case Selected:` and the linked case value (for example, `Base`) prominently near the top of each output and build tab. Center the value horizontally and vertically in a restrained dashed or dotted outline, close to the content. Keep one editable selector and distinguish the active case from actuals and named comparison cases. On Assumptions, put the selector or its linked value and only essential global inputs directly above the driver table. Emphasize each driver's Active Selection row over its case inputs. Include a short case-number key only for numeric selectors. Do not add unused Owner columns or setup sections, and preserve meaningful existing owners.
- Put purely technical helper rows, such as period keys, above the model; italicize and group/collapse them where supported. Keep them inspectable but out of business headers and chart labels. Do not hide useful business calculation steps as helpers.
- On output tabs, use consistent row heights within each table and modest vertical padding. Tighten excessive spacing and reduce oversized heights after autofit while keeping useful breathing room and readability when tables are copied into slides or printed to PDF. Size rows to the font and content; expand only rows needing wrapped table content, not the whole table, and do not shrink fonts to tighten spacing. Exclude off-table commentary from table-row autofit. Input tabs can use smaller, fitted rows; keep working builds compact. Apply these distinctions by section on mixed-use tabs. Format only populated or intentionally reserved ranges.
- Keep working titles, headers and input/calculation areas unmerged. Presentation merges require user/template intent; never overwrite content or combine distinct table columns. In reader-facing tables, center column headers horizontally and vertically. For one heading spanning several otherwise empty header cells, use Center Across Selection where supported, or simplify the layout to one header cell. Treat the span as one header group with no internal borders or blank outlined header boxes; never center across distinct headings or populated cells. Working builds may retain useful blank column headers and genuine spacer columns.
- Use yellow/amber for inputs needing updates. Distinguish editable-input cues from calculated warnings, with a compact legend when needed. Follow documented exception styles for overrides, special formulas and one-offs.
- Dark column headers: white text with thin white separators between actual headings, including dates.
- Section bands: continuous fill and one outside outline, without internal borders; exclude gutters. Keep genuine spacer columns between separate tables or sections blank and unfilled, including their header cells.
- If a sheet uses a leading gutter, align titles, sections and tables to the same content edge. Keep it empty except for specified navigation markers. Follow Finance gutter defaults only for financial models; do not impose them on operational trackers.
- Prefer thin/light structural borders, stronger section breaks and no full body-cell grid. Do not apply borders around every filled cell.
- Hide worksheet gridlines by default on new sheets, including inputs, builds and outputs. Preserve an intentional user/reference setting and do not change gridlines during unrelated edits. Gridline visibility is separate from selective structural borders.
- Put needed context in separate cells or ordinary punctuation. Preserve meaningful financial/mathematical labels and symbols, required source quotes, intentional reference conventions and the expressly specified plain `x` navigation markers.
- Use bounded conditional formatting for status, risk, variance and exception cues that must react to edits. Reuse the workbook's existing rules rather than inventing business logic for color. Emphasize affected missing/invalid inputs or failed checks, for example with light-red fill and bold red text for critical errors. Keep valid check values neutral. Do not substitute static error paint or decorative PASS fills.

## Freeze panes

- For tables that need vertical scrolling, freeze the header rows. Freeze identifying columns when horizontal scrolling would hide them. Use the smallest useful frozen area. Leave enough space to read and work with the data.
- Do not move content or add tabs to accommodate freezing. Preserve existing panes during unrelated edits.
- Do not freeze compact summary, dashboard or cover sheets unless scrolling requires preserving shared headers or row labels.

## Align and format by data type

- Left-align text, right-align numbers and center column headers horizontally. Default to middle vertical alignment throughout populated and intentionally reserved workbook ranges. Top-align wrapped descriptions where helpful.
- Keep numbers/dates typed with explicit, appropriate formats and clear units. Adjust widths/heights so final content with formatting fits (including signs, parenthesis and units); never stringify values for appearance.
- Italicize brief context/scope/unit notes—not headers, controls, statuses or warnings.

## Typography - Use intentionally but conservatively

- Choose one font verified in both generating and target environments: Helvetica Neue → Helvetica → Arial → Aptos. Use one family across cells, charts and theme fonts, with consistent body sizing across the workbook.
- Default to two font sizes, max three, across standard non-cover sheets, keeping sizes consistent for matching elements. Dashboard and visual sheets may use additional sizes selectively but keep them modest.
- Keep the largest size no more than 6 pt above the body size, unless the user or reference specifies otherwise. Use spacing and restrained fills for hierarchy.
- Example defaults: 10pt body/table headers, 14pt for titles, 16pt ceiling.
- Table headers and content should typically be consistent following the chosen body size.
- Use bold or italics sparingly for emphasis. For example for totals or when needed for domain styling defaults.

## Live inputs and visuals

- Drive dependent values, charts and status text from editable cells. Use categorical validation where feasible and the dynamic-state formatting above. Invalid/missing inputs must not appear as plausible zeros or success states.
- Prefer compact, formula-linked summaries. Preserve required outputs; avoid redundant tables and oversized KPI cards. Inline bars require explicit request. Follow `features/charts.md` for charts.
