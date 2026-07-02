# Interaction — tooltips & filters

An HTML chart is interactive by default — the hover layer is part of the deliverable,
not an upgrade. Omitting it is the exception (a bare stat tile), never the default.
Design it with the same care as the static render.

## Tooltips & hover

Tooltips **enhance, they never gate**: every value a tooltip shows is also reachable
without it, through direct labels or the table view. Same details on keyboard focus
as on hover.

- **The crosshair finds the X.** A vertical hairline tracks the pointer and snaps to
  the nearest data position. Readers aim at a date, never at a 2px line.
- **On bars and cells, the mark is the hit target.** No crosshair — each bar, segment,
  dot, or heat-cell carries its own `pointermove`/`focus` tooltip showing category and
  value, and the hovered mark lifts (slight lighten or outline) so the reader sees it respond.
- **One tooltip, every series.** The readout lists every series at that X — the
  pointer never has to land on a line or a fill to get a value.
- **Labels are untrusted data — use `textContent`.** Series and category names
  often come from CSV headers, tool output, or API responses. Insert them into
  tooltip/legend/table DOM with `textContent` or `createTextNode`, never via
  `innerHTML` string concatenation.
- **Values lead, labels follow.** In the tooltip the value is the Strong,
  high-contrast element and the series name is secondary — the legend's hierarchy
  inverted, because here the reader has the series and wants the number.
- **Line keys, not boxes.** Tooltip rows key their series with a short stroke of the
  series color; at tooltip density a filled box is data-weight ink doing a label's
  job. (Legends still mirror the mark: rect for bars/areas, line for lines.)
- **The hit target is bigger than the mark.** A mark's hover/focus area includes its
  2px surface gap and then some — never only the painted pixels. An 8px scatter dot is a
  pinpoint nobody hits reliably; give each point a transparent hit area of at least
  **24px**, or — for dense scatter — a nearest-point / Voronoi layer so the pointer only
  has to be *closest*, not dead-center. (The crosshair already does this for the X on
  line and bar charts; scatter and bubble need the per-point version.)
- **A value pushed off its mark lives in the tooltip.** When a label won't fit inside a
  small bar (see `marks-and-anatomy.md`), that bar's hit area carries the value on hover
  and focus — the tooltip is its overflow home, and the table view keeps it reachable
  without hovering at all.

## Filters & time ranges

Every monitoring dashboard needs the same controls. These are **standard UI, not
chart marks** — build them with ordinary HTML form controls styled to match the
chart chrome. Dataviz only adds composition rules:

- **One row, above the charts.** Filters sit in a single left-aligned row above the
  content they scope — never inside a chart card, never per-chart. If one chart needs
  its own range, it's a different dashboard.
- **Date range first.** It's the filter every reader reaches for; presets (today,
  last 7 / 30 / 90 days) before a custom range.
- **Filters scope everything below them.** Every chart, stat, and table re-renders
  against the same slice, so the numbers always agree.
- **Refetch keeps the frame.** While data reloads, charts hold their previous render
  at reduced opacity — no skeleton, no layout jump, no flash.

A good date picker lists presets as rows (nobody fights a calendar grid for "last 30
days"), marks selection with a 16px bold check, keeps hover a ghost wash so it never
competes with selection, and tucks the custom range behind a hairline in the footer.
(See `palette.md` for the reference spec.)
