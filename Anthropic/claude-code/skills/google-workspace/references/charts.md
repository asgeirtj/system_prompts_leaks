# Charts

Read the slide design rules in `references/slides.md` first; this file covers charts on slides. Assume each chart will be projected, printed or forwarded without you there to explain it, so everything the reader needs is on the chart.

## Choose the display

| The reader needs to... | Use |
| :---- | :---- |
| See one or two numbers | No chart: plain words in a bullet, or a big number, the figure set large ("15%") with a line of smaller text under it saying what it is ("revenue growth last quarter"). Clearer than a one-bar chart or a two-slice pie |
| Compare magnitudes across categories | Bar chart: vertical columns by default, horizontal bars when the category names are long |
| See a trend, or anything else where the points are connected | Line: for time series and other connected data, never for categories; add error bars or a shaded range when the spread matters alongside an average |
| See how a few items moved between two points | Slope graph with no gridlines or value axis (say, education rate by region, 2015 against 2025), not a multi-series bar chart. Few lines, the one that moved most in the accent color; the start value alone on the left, the end value and the name once on the right |
| See one series against context | That series in the accent color, everything else gray |
| See parts of a whole | Stacked column: absolute to compare totals and their components, 100% to compare mix. Stacks get overwhelming fast; they show the gist, not precise comparisons of middle segments |
| Compare an ordered scale across categories (Likert responses) | 100% stacked horizontal bar: consistent baselines at the far left and far right |
| Follow a starting point, the changes, and the result | Waterfall: breaks a complicated calculation into pieces |
| See share on two dimensions at once (segment size and the mix within it) | Mekko |
| See a schedule | Gantt |
| See the relationship between two quantities | Scatterplot: mostly for samples and studies; fine in business when there is a real relationship to show |
| See data that normal charts don't accommodate | Shapes as illustration: a funnel, a grid of squares, an illustrative bar, when the data doesn't fit a chart and exact units don't matter, as long as it is obviously not to scale |

- Avoid unless the user explicitly asks: pie and donut charts (people judge angles badly; use a sorted bar chart instead); area charts (hard to read; the one exception is the square-area graph, where each square's area is a quantity, useful for very different magnitudes such as TAM, SAM and SOM); 3D; and secondary axes (the alignment of two scales is arbitrary and invents a correlation; label the units on each line, stack two charts on the same horizontal axis, or index both series to a common base).
- One to three colored series read clearly; at four or more, label each series directly even if the deck's charts use a legend; five or six is the most one chart can hold. Past that, combine the smallest into "Other", or use small multiples (a grid of small identical charts on shared scales). Never fix "too many series" by adding colors.

Combinations are sometimes right, such as a stacked bar with one segment broken out beside it (in a chart, a small table or a text box) when the audience will want that detail.

## Which standard the chart follows

If the deck already contains charts and they share a consistent style (axis treatment, gridlines, legend or direct labels, label placement, whether the title sits inside the chart or above it, fonts, colors), that is the standard, and every new chart follows it, even where it differs from the master's theme. Charts that disagree with each other are not a standard. Otherwise follow the house standard below.

Under a deck standard, the deck's charts decide everything the house standard decides, including where the title sits and how it is worded. Where you cannot reproduce their style directly, copy one of the deck's charts and replace its data and labels, which is the surest way to get an identical look.

## The house standard

- **No legend**, except where Series names (Finishing touches) allows one.
- **Bar and column charts:** no gridlines and no value axis; every bar carries its value, and the category axis names the bars. Keep a thin gray category axis line (about #BFBFBF), so the bars don't float.
- **Line charts:** faint horizontal gridlines at four or five round values, so the reader can read values across (faint means close to the background: light gray on a white slide, a dark gray just off black on a dark one); value-axis labels in a muted color that carry the unit ("$0B", "$25B"), with no axis line; no vertical gridlines. A small marker on each labeled point and none on the others, since markers on every point clutter a long line. Lines run straight from point to point, never smoothed.
- **Scatter charts:** no gridlines; both value axes, four or five ticks at round numbers, bare numbers in a muted color.
- **One accent color** for the point that is the message, gray for everything else. Use the deck's accent: the theme's first accent color, the accent the deck's finished slides use, or the accent you chose when setting up a new deck. Use this fallback palette only when the deck has no accent of its own (default theme, and no finished slide uses one), so decks for different companies don't share a look: accent #1A6BB8, bars #BFBFBF, lines #A6A6A6, text #1A1A1A, secondary text #595959.
- **Transparent background.** The chart area and the plot area have no fill and no border, so the chart sits on the slide background.
- **Units in the number format.** Every data label on a bar or column carries its unit ("$42M", "38%", "12K"); only a plain count such as 355 goes bare. On stacked columns only the column total carries the unit ("$40.5M"); the segments are bare numbers (18.2, 12.5, 9.8), and the total sits above each stack.
- **Bar proportions.** The gap between bars is 50% of a bar's width, so bars are twice as wide as the gaps. On stacked bars, set the series overlap to 100% so the segments stack on one bar.
- **Headroom.** Set the value axis maximum about 15% above the tallest bar, so labels above the bars fit; about 25% when totals or growth arrows sit above the bars.
- **Sorting.** Horizontal bars are sorted with the largest at the top.
- **Likert and other ordered scales** are tints of the one accent, darkest at the top of the scale (such as "Strongly agree") and lightest at the bottom, never a red-to-green ramp. This overrides the two-hue rule for values above and below a baseline in Finishing touches.
- **Waterfalls.** The start and end totals are dark gray, increases are the accent, and decreases are one contrasting warm color, such as orange #E07B39. Each step is labeled with its signed change, and the totals carry the unit.
- **Text.** Axis and data labels are 14pt in the deck's body font; the year row and callouts are smaller (Finishing touches). Text set in a series color (line names, callouts) uses the secondary text color when that series is a light gray.

## The chart label

The story is in the slide title (or in the slide's commentary when the deck uses label titles), never in the chart. A story title states the takeaway as a full sentence with the number ("Sales grew every quarter for two years and finished 2025 at $12.4M"). The chart carries a descriptive label only, with these parts in this order, separated by commas: what is plotted, the scope if there is one, the unit, the timeframe.

- The unit is a short token, never spelled out. Currency scale letters follow the deck's own convention when it has one, otherwise the deck's language: $K, $M and $B for US English (also the default when the language is unclear), £k, £m and £bn for UK English, and so on. Do not mix conventions in one deck.
- Parentheses hold only a second unit or a data basis, never the primary unit.
- What is plotted always stays.
- Drop the timeframe when the axis shows the year, in the tick labels ("FY22") or on a year row. Keep it when the axis shows only bare periods ("Q1", "Jan"), as on a single-year chart, so the year appears somewhere on the slide.
- The unit is on every data label of a bar or column chart and on the value-axis labels of a line chart, so it drops out of the chart label for both. On stacked columns the totals carry it. On scatter charts the axes show bare numbers, so the unit stays in the label.
- Decide at the first chart which parts this deck's labels carry (scope, unit, timeframe), and apply that and the drop rules the same way on every chart, checking the earlier labels before each new one. Half the charts labeled "$M, FY25" and half not looks careless.
- Never in the label: the takeaway, a figure (a growth rate, total or change goes in the slide title, a data label, a growth arrow or a callout), a colon or a dash between parts, a spelled-out unit.

Examples:

- Column chart, bars labeled "$42M", x-axis "Q1 … Q4 | Q1 … Q4" with "2024" and "2025" on a year row → **"Quarterly revenue"**, not "Quarterly revenue, $M, Q1 2024–Q4 2025".
- Column chart, bars labeled "$42M", x-axis "Q1 … Q4" (one year, no year row) → **"Quarterly revenue, FY25"**: the timeframe stays because the axis has none.
- Line chart, axis labels "0K … 250K", x-axis "Jan … Dec | Jan … Jun" with "2025" and "2026" on a year row → **"Monthly active users"**: the axis carries the unit and the year row the timeframe.
- Column chart with growth arrows, bars labeled "$42M", growth labels "+21%" → **"Quarterly revenue, FY25 (% growth QoQ)"**: a second unit goes in parentheses at the end.
- Bar chart of segment shares, bars labeled "58%" → **"Regional share of revenue, FY25 (based on reported segments)"**: a data basis goes in parentheses.

The label is a text box in the slide's caption style directly above the chart, so its typography matches the slide; the chart's own built-in title stays off. Line the label's first character up with the slide title's: the same left position and the same left text inset (internal padding). A title placeholder usually has a nonzero inset from the master and a new text box has an inset of 0.1 in (7.2pt), so copy the title's inset rather than setting zero. Keep the label to one line when the subject is short. When the subject runs to about six words or more ("Quarterly sales by department, Product X"), put the unit and timeframe on a second line about two points smaller and muted ("FY25", or "$M, FY25" where the label keeps the unit) rather than letting the label wrap or run into the chart. A slide with two or more charts gives each its own descriptive label, and the slide title carries the message they make together.

## Placing the chart

- A chart on its own takes the whole content area: the full content width (the title's left edge to its right edge), from just under the title to just above the footnotes. The common mistake is a chart that stops halfway down the slide, not one that is too big.
- Small multiples: no panel shorter than about 120pt, or the labels have nowhere to go. Share one scale across the panels only when the comparison is about magnitude; when a shared scale flattens the smaller panels into a line, give each panel its own scale and say so in the caption.

## Finishing touches

Once the chart exists, adjust it so the message is visible:

- **Color does one job per chart.** A second accent is a second message; if two things matter, make two charts. Use distinct hues only when telling the series apart is the point, and then the same hue for the same entity on every chart in the deck. Use a single hue from light to dark for magnitude, and two opposed hues around gray for above and below a baseline. Never a rainbow, and never color as the only carrier of a distinction (red and green least of all): a label or position always backs it up.
- **Source line** below the chart, at footnote size (10–12pt, muted), following "Footnotes and sources" in `references/slides.md`, including citing only sources you have.
- **Period axes.** Tick labels show only the short period (Q1 … Q4, Jan … Dec). The year sits on a second row under each year's first period, at 11pt in the secondary text color, and is not repeated on the other ticks; "Q1 FY25, Q2 FY25, …" on every tick is the defect to avoid. A linked Sheets chart has no tested way to draw it, so put small text boxes under the axis. A single-year chart has no year row and carries the year in its label.
- **Series names.** Give each line a short name, one or two words ("Data center"), in its series color, right of its last point on the same line as the end value ("$89.0B Data center"), with room left on the right of the plot. On a chart of three lines or fewer other than a slope graph, there are two exceptions: when the deck standard uses a legend, use the deck's legend; otherwise a name longer than about 14 characters gets a small legend instead of a wrapped end label. With four or more lines, or on a slope graph, shorten long names instead. A chart with two or more lines is not done until every line is named on the chart, by an end label or a legend.
- **Point labels on a line:** the start, the end, and the peak, trough or break the title or bullets refer to. Three labels on a ten-point line is right; more than four is crowding, and the first and last alone are too few for a long line. Each label except the end label sits above or below its point, off the line.
- **Annotate the conclusion:** a shaded band over the downturn, or a callout when Callouts below calls for one. Where actuals turn into a projection, mark the boundary so nobody reads the forecast as history: on a line, the forecast portion is dashed; on columns, forecast bars are hatched or a visibly lighter fill, and their category labels carry an E suffix ("2026E", "Q3E"). A short label at the boundary ("Actual" | "Forecast") helps when the deck will be read on its own.
- **Growth arrows** show growth or decline where it is significant, not between every pair of bars. The default is an elbow: up from one bar, across at a height that clears the bars between and their labels, and down onto the other. A straight line from one bar top to the next works only between adjacent bars with room above them. The third shape is a difference marker (a short horizontal mark at each bar top and a vertical line between the two levels with the change on it). Whichever shape, the change number sits centered on the arrow (on an elbow, on its horizontal part), in front of it, on a fill matching the slide background. Growth arrows and CAGR brackets are shapes drawn over the chart, never chart elements; position them from the chart's geometry.
- **Callouts:** when the slide title or commentary claims a change in trajectory (an acceleration, a break, a launch, a one-off), put a callout naming the cause at the point where it happens, on the chart rather than only suggested in your reply. If nothing you were given names the cause, ask, or leave the callout out; never guess one. Otherwise most charts need none. At most one, occasionally two; more than that is clutter, and the explanation belongs in a text block beside the chart instead. The callout is a short phrase ("Supply chain outage", "Product X launch"), never a full sentence, at 11–12pt in the color of the series it annotates, with no box, border or fill, and a thin leader line in the same color from the text to the point. Place the text in the nearest open area of the plot, never over a bar, the line, or a data label.
