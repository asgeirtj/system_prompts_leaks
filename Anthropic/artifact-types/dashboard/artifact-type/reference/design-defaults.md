# Design suggestions

Suggestions for what the person left unsaid. The documents, the rules and the
`dash` API are in the type's `SKILL.md`.

- A dashboard is easier to act on when it serves one decision and its
  takeaway says which.
- A short header keeps the figures in view without scrolling: a plain
  one-line title (the `dash/meta` title or close to it) and one sentence of
  takeaway under it, filled in `onData`. More than about six headline figures
  in a row of large numbers can be hard to read.
- When appropriate, you can give each question or domain a page of its own (a
  tab) rather than one long page, and put further cuts of the same data
  behind a filter.
- People read the first figure as the most important, so it helps to start
  with the one nearest the outcome (orders, not visits).
- A headline figure is more useful with its change from the period before:
  signed, the period named, colored by whether the change is good.
- Figures that are stages of one thing are usually clearer as a funnel or a
  ratio than as separate tiles.
- Cards are easier to read when they say their time window, such as "Last 28
  days".
- A breakdown table is easier to compare when it keeps its parent's columns,
  in the same order.
- It helps to define a metric in plain words where it first appears. A method
  that takes more than a sentence can have a page of its own.
- Where a connector offers governed or semantic definitions and one covers
  the metric, a query through it gives the number people get when they ask
  elsewhere. Where the SQL is your own, it helps to say so beside the
  metric's definition.
- You can add one breakdown the person is likely to ask for next, such as by
  team or by who did it.
- Labelling a line at its end with its name and latest value can replace a
  legend.
- Each live query runs again for every reader, so where a smaller or
  already aggregated table has the answer it is the better source. The
  connector's answer often says how much data a query scanned.
- When something was left out, it helps to say so on the page, with why (a
  table too large to query on every load).

Shapes to mix or ignore; where a shape says otherwise, the shape wins:

- **Board** — kept open to watch health: one status line saying what is over
  its limit now, the same metric for every member as small charts on one
  shared scale, recent incidents in a table; only a breach takes the danger
  color, and nothing moves.
- **Scorecard** — a weekly check-in: four to six cards, each a large latest
  value, its change from the period before, a small trend and its target; only
  a missed target turns red.
- **Experiment** — deciding whether to ship: the primary metric's lift as the
  large number, a sentence on whether its 95% interval crosses zero, every
  metric's interval against a zero line (right of zero is better), then the
  rate by arm over time.
- **Table** — many rows to scan: one table that sorts and searches, an in-cell
  bar on one shared scale, a sparkline per row, secondary columns that hide
  when narrow.
- **Funnel** — where people drop off: each step as a bar from one left edge
  over a thin bar for the period before, the share lost between steps, the
  biggest loss in the danger color.
- **Review** — a period in review, read once: a few large totals on top, one
  large chart with dated events marked on it, then the same measure per group
  as small charts on one scale, labelled directly.
- **Visual analysis** — a finding, read top to bottom: the finding in a
  sentence around one number, then a chart under each heading that says what
  it shows; one accent series, the rest muted.
- **Scroll story** — a finding told as the reader scrolls, also asked for as a
  story, a narrative, a scroll-driven story or scrollytelling: short chapters
  of text in one column beside one chart that stays in view
  (`position: sticky`) and changes as each chapter reaches the middle (an
  `IntersectionObserver` with `root: document`, without which this page
  ignores its `rootMargin`); one idea a chapter, its numbers marked like any
  other; when narrow, the chart stays on top and the text scrolls under it.

### Look

- The dashboard gives the page plain text defaults and its outer gutter, which
  grows with the width, so the page's outermost wrapper takes no padding of
  its own. To change it, the page's CSS sets
  `#dash-root { --dash-gutter: … }` (`0` runs edge to edge), the one rule it
  writes on `#dash-root`; a maximum width is a wrapper with `max-width` and  
  `margin-inline: auto`.
- Charts and tables are easier to scan in cards, each with its title and a
  one-line note at the top: `background: var(--color-panel)`,  
  `border: 1px solid var(--color-border-line)`,  
  `border-radius: var(--cds-radius)`, `padding: var(--cds-pad-lg)`. A grid
  (`repeat(auto-fit, minmax(min(100%, 20rem), 1fr))`, `--cds-gap-md`) lets
  two share a row when there is room, and cards that answer one question can
  share a section heading.
- Text looks at home in `font-family: var(--font-anthropic-sans)` and
  sentence case. Its sizes are `--cds-font-size-` plus `caption`, `body`,
  `heading` or `title`; `heading` at `--cds-font-weight-medium` works for
  chart and section titles. `font-variant-numeric: tabular-nums` keeps
  numbers lined up.
- People see text at `--cds-font-size-title` or larger as large. For a page
  title, a headline figure or a tile's main number,
  `var(--font-anthropic-serif)` at weight 400 works well.
- For spacing there are `--cds-gap-` and `--cds-pad-` plus `xs`, `sm`, `md`,
  `lg` or `xl`, and `--cds-radius` for corners. A row looks tidier with boxes
  of one height.
- Series can take `dash.colors` in order. When one matters most, the rest can
  be `--cds-chart-muted`; `--cds-chart-status-critical` works for a value
  past a limit. Colors are tokens that follow the theme, so there is no
  dark-mode rule to write.
- Counts per day, week or month are usually clearest as bars (`d3.scaleBand`
  with a gap), and a rate, a running total or several series over time as a
  line drawn point to point, since a curve suggests values the data doesn't
  have.
- Lines look good at 2px with round caps and joins, and bars up to 32px thick
  with rounded ends. Gridlines can be 1px `--cds-chart-grid`, an axis line
  `--cds-chart-axis`, a reference line `--cds-chart-reference`, and tick
  labels `--color-fg-muted` at caption size.
- A tooltip can be a small popover: `background: var(--cds-surface-popover)`,
  `border: 1px solid var(--cds-border)`, `border-radius: var(--cds-radius)`,
  `box-shadow: var(--cds-shadow-popover)`,
  `padding: var(--cds-pad-xs) var(--cds-pad-sm)`, caption size,
  `pointer-events: none`. It reads well with the date or category first, in
  `--cds-text-secondary`, then a line per series: a swatch in its color
  (`dash.colors[i]`, as its mark), name, formatted value; one series needs no
  swatch. To tie it to the chart, the hovered point can get a dot in that
  color (a bar, a stronger fill or outline), and with several series a rule
  can mark the hovered x while the others fade.
- A table of more than a screen of rows can sit in a box with `max-height`
  and `overflow: auto`, its `th` `position: sticky; top: 0` on the card's
  background. It is easier to use when each header is a button that sorts
  (`aria-sort`, numbers as numbers) and a search `<input>` above filters rows
  by their text. Scrolling through every row usually works better than
  pages, and all of it works on the rows the page already has.
- Numbers and dates are easier to read formatted: counts `d3.format(',')`,
  shares (0–1) `'.1%'`, headline figures from 10,000  
  `Intl.NumberFormat('en', {notation: 'compact', maximumFractionDigits: 1})`,  
  dates `d3.utcFormat('%b %-d')` on `new Date(day)`.

### States

The type stamps what the data is doing as attributes the page can style
(`SKILL.md`, States):

- A failed source can show one line centered in its element, across and
  down (`display: flex; align-items: center; justify-content: center`):
  a 0.375rem round dot in `background: var(--color-bad)`, then `Failed to load` in
  `color: var(--color-fg-muted)` at `--cds-font-size-caption`, with no
  underline. The element keeps the `min-height` it has with data, so nothing
  below it moves, and the connector's message (`dash.data(id).message`) stays
  off the page: Sources shows it. The line is drawn in script where
  `dash.data(id).status === "error"`: a source waiting on the viewer (their
  permission, a sign-in) is stamped `data-dash-source-state=error` too, and
  its status is `connect`.
- A value that isn't there, as blank space:
  `[data-dash-source-state=empty] { color: transparent; }`, so no "No data"
  text is needed. Where a whole chart would look broken empty, one muted line
  under its heading says why.
- Before a dataset's first values arrive, give the elements that will show
  them the class `dash-skeleton`: it draws a short rounded bar in place of
  words and fills a chart's box, so loading takes no spinner and no words.
  Leave a chart's box empty, with no `—` and no white space in it: a box
  that holds only text gets the bar. Remove the class when the data arrives or the load fails.
  While a filter change or a refresh re-runs a source, its marks
  carry `data-dash-source-state=refreshing`:  
  `[data-dash-source-state=refreshing] { opacity: .5; transition: opacity var(--cds-dur-slow); }`  
  shows which cards are catching up, and the last values stay readable. Motion
  of the page's own is `@keyframes` on elements inside the page.
- A chart's box with a `min-height` equal to its drawn height keeps a state
  from moving what is below it.

### Filters

- A page can work out a filter's default in its own code, such as a date
  relative to today, and set it with `dash.setParams` at the top of its
  script: the queries first run with it. The page's Reset calls that code
  again after `dash.resetParams()`, which returns to `dash/params`, not to
  what the page set.

```js
const setDefaults = () => dash.setParams({end: d3.utcFormat('%Y-%m-%d')(d3.utcDay.offset(new Date(), -3))});
setDefaults();
document.querySelector('.lx-reset').addEventListener('click', () => { dash.resetParams(); setDefaults(); });
```

### Before writing

A read of the files is the check: every `var(--cds-…)` is written in full and
named in these docs; every number and date is formatted; each chart's code
measures its margins from the widest tick and end label as drawn
(`getComputedTextLength()`) and keeps labels from meeting (fewer ticks, end
labels moved apart), since the data sets a label's width and place. Animation is `@keyframes` with `--cds-dur-slow` and
`--cds-ease-out` inside `@media (prefers-reduced-motion: no-preference)`,
timed from the first draw that has rows so a redraw doesn't replay it.

### Handing over

Tell the person, in a line each, what they can do next: ask you for any chart or control by name, such as a flow diagram, a date filter or a click that filters every card; download a source's rows as CSV from Sources; and, as an editor, edit a live query's request in Sources (its SQL or other arguments), test it, save it and restore an earlier one. Then what to know about their data: each live query runs with the reader's own access whenever the dashboard is opened, refreshed or filtered; and where a query is not refreshing automatically, everyone who can open the dashboard sees its saved rows, whatever their own access, until they ask you to refresh it or an editor makes it live again in Sources, which the page can't undo.

### Links

A link names a place on the page: a tab, a section, any element with an `id`. The page brings that place into
view itself once it is drawn, ignores a name that is not its own, and sets the link as the reader moves.

```js
const go = (el) => { el.scrollIntoView(); dash.setLink(el.id); }; // for a tab, show it instead
const named = document.getElementById(location.hash.slice(1));
if (named) go(named); // after the first draw, when the element exists
```

### d3 and the kit

- The `d3` global is most of d3 v7. Beside scales, shapes, axes and formats,
  a page can reach for treemaps and other hierarchies, network diagrams,
  chords, contours, nearest-point lookup, zoom, brush and transitions.
- It has no maps, fixed color schemes or CSV reading. Regions compare well in
  bars or a table, a ramp runs between two tokens' computed colors
  (`d3.interpolateRgb`), and rows come from `dash.data`.
- A shape that shows one row's value, such as a link between two nodes, is
  marked as any value is (`SKILL.md`, Marking).
- `d3.scaleUtc` or `d3.scaleLinear` with one argument sets the range, not the  
  domain: pass both, `(domain, range)`.
- Parse each day or month string into a Date once, before scaling: a date axis
  formats Dates, so a NaN, Invalid Date or undefined on the page means a string
  went unparsed.
- d3.axis puts `font-size` 10 and `font-family` sans-serif on its group:  
  `.attr('font-size', null).attr('font-family', null)` removes both.
- A `<b>` is bold 700 from the kit's rule `[data-appifact-content] :is(b,
  strong)`: a selector at least as specific, such as `.page b`, sets a
  number's weight.
- Token names are written in full: `var(--cds-chart-${x})` hides a typo.
- `--color-ok`, `--color-warn` and `--color-bad` are text colors.
- An area under a line can fade to nothing at the baseline: a vertical
  `linearGradient` (`x2` 0, `y2` 1) with stops at 0, .25, .5, .75 and 1 at
  opacity .26, .16, .08, .03 and 0, colored with `style` (`stop-color:  
  ${dash.colors[0]}`), since `d3.color()` can't read `dash.colors`.
- Bars round with `rx` 4 on a rect (the browser caps it at half the bar) or
  `border-radius` on an HTML bar. Dashed reference lines keep the default flat
  ends (`butt`), so short dashes stay even.
- Boxes in one row stay the same height if the grid keeps its default stretch
  and the border is on the item itself; a column beside stacked rows is as tall
  as the stack.
- A formatted key column keeps its raw value on the `<tr>` as `data-key`.
- A tooltip is `position: absolute` in a `position: relative` box;
  `position: fixed` scrolls with this page.
