# Presenting social results

## Choose the format

- Write the answer, the interpretation and the caveats in concise prose. Add another format only when it shows something prose cannot.

- Use a Markdown table for exact values across accounts or posts and a chart when the shape of a trend or comparison matters.

- Use a metric-card grid only for distinct headline metrics of one account over one period. Never use it to repeat the same metric across competitors or accounts.

- Avoid repeating the same figures across prose, tables and widgets unless the repetition supports a conclusion.

## Build a metric-card grid

- Create the grid with `widget.create_html_widget` as a responsive layout using `repeat(auto-fill, minmax(260px, 1fr))`. Give each card its own rounded border and consistent padding.

- Put a short label, one prominent value and optional subdued context such as `+12% vs prior 28d` on each card. Keep every card in one grid cell, without `grid-column` spanning.

- Leave out table headers, gridlines, gradients, gauges, decorative icons, heavy shadows and oversized type.

- If creating the widget fails, answer without it. Do not fetch the metrics again.

## Name and link posts

- Label a post with the first five words of its returned caption, adding an ellipsis only when more words follow. Without a caption, use its date and format, and reuse the same label throughout.

- Link every post you single out with its exact returned permalink. Never construct a permalink, and describe only the aggregate pattern when no verified link exists.

- Keep account IDs, post IDs, tool names and backend field names out of the answer.

## State the scope

- Name the network, the period the data actually covers and the population analyzed. When a ranking covers many posts or accounts, show the leaders and say how many were analyzed.

- Put any availability or evidence limit next to the claim it qualifies.
