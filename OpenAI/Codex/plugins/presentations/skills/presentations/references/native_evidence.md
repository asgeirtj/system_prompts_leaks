# Editable tables and charts

Build required tables, data charts and editable diagrams as slide objects, not screenshots. Keep a supplied image unchanged when the user explicitly asks to use that image. Do not turn every short list into a table.

## Tables

Keep required rows, columns, periods and headers on the relevant slides. Calculate each total once and reuse it in tables, titles and notes. Set column widths, row heights and padding from the actual text; preserve template alignment. Use the [table API](../artifact_tool_docs/api/references/tables.spec.md).

The arithmetic checker checks declared simple sums with displayed-rounding tolerance and reports automatically inferred totals as diagnostics. It is not proof of exact arithmetic or full support for localized numbers. Manually check ratios, subtotals and tables with different units when the checker skips them. Also compare source data and numbers in the slide text with the calculations; passing the checker does not verify those.

## Charts

Keep categories, data series, units, dates, positive/negative signs and precision. Choose a chart that answers the audience's question. Set axis and label formats explicitly; spreadsheet formatting may not carry over. To display 31% with a percentage format, use `0.31`, not `31`.

Use the chart's own labels instead of separate text boxes. Do not duplicate labels or titles, and remove the placeholder "Chart Title." Keep labels and annotations the audience needs or the user requested. For stacked bar/column charts, use `inEnd` or `center`, not `outEnd`. If an invisible data series positions the visible bars, hide its outlines and labels too. If bar positioning requires positive magnitudes, keep the original positive/negative signs in the data shown to the audience. If the API cannot place a label as required, explain the limitation. See the [chart API](../artifact_tool_docs/api/references/charts.spec.md).

The finalizer finds editable charts and checks supported cell-range references against the corresponding workbook cells, including category and value order. Unsupported or broken references cannot be reported as verified. To support use across applications, explicitly set `materializeLiteralChartWorkbooks: true` when a new workbook snapshot from complete literal chart data is appropriate for the task. This preserves values, not the original workbook's formulas or links to source data. It is off by default. Keep original workbooks when required; never invent formulas or data. Use `nativeChartTargetApplication: "powerpoint"` only when the requested output is explicitly for PowerPoint alone; this does not excuse broken workbook references.

Inspect the rendered slides: check that labels identify the right data, signs and units are correct, and text is readable. If you can open the deck in its target application, edit and resize representative charts in a test copy, then save and reopen it. Record unavailable application tests without implying that previews verify application behavior. Follow the handoff rules in [SKILL.md](../SKILL.md) for what to report. A chart working in PowerPoint does not prove it works in Google Slides.
