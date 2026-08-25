# Anti-patterns - what goes wrong

Check every chart against this list. If your output matches an entry, it is wrong -
fix it before shipping. These are real failure modes, each caught in shipping
dashboards.

## Color & encoding

**Bad: Dual-axis charts (two y-scales on one plot).**
Why it misleads: the alignment of the two scales is arbitrary, so the chart invents a
correlation that isn't in the data. Real example: an "Adoption" chart plotting Users
(0-30k) against Sessions (0-800k) - a reviewer flagged it as looking "hallucinated."
Good: Do instead: two charts, small multiples, or index both series to a common base
(=100 at t0) on **one** axis.

**Bad: Recolor-on-filter.** Assigning colors by current rank, so filtering out a series
repaints the survivors.
Why: a reader who learned "Acme is blue" is now misled.
Good: Color follows the entity, not its row number. Survivors keep their hue.

**Bad: Cycling / generating hues past 8.** A 9th categorical color, generated or reused.
Why: indistinguishable from an existing slot under CVD; breaks the order check.
Good: Fold the tail into "Other," facet into small multiples, or use composite encoding.

**Bad: Eyeballing colorblind-safety.** "These look different enough."
Good: Run `scripts/validate_palette.js`. Adjacent Delta E >= 8 (OKLab ×100), or 6-8 WITH secondary encoding.

**Bad: A value-ramp on nominal categories.** Coloring each bar darker-where-bigger
when the categories have no natural order (products, teams, endpoints).
Why: it double-encodes bar length as hue, burns the only free channel on
information the chart already shows, and fails the categorical checks by design
(a ramp spans the lightness band and drops below the chroma floor).
Good: One series -> one color (slot 1) for every bar. Ordered categories (funnel,
tiers, age bands) -> the ordinal ramp, validated with `--ordinal`.

**Bad: Rainbow / non-neighbor sequential.** A multi-hue ramp for magnitude.
Good: One hue, light->dark. (Analogous neighbors or semantic heat are the only multi-hue
sequential exceptions, always with a scale legend.)

**Bad: A hue at the diverging midpoint, or two cool hues as the two poles.**
Why: the midpoint must read as "nothing"; poles must read as opposite. blue<->aqua
fails this (both cool); blue<->red or blue<->orange succeed (warm/cool).
Good: Two hues that read as opposite + a neutral gray midpoint.

**Bad: Status color used for a non-status series** (or a series color used for status).
Good: Status tokens only when the color *means* good/bad; categorical when it's identity.

## Form

**Bad: Eight categorical hues when the story is one number.** The most common way a
chart misses its point.
Good: Emphasis (highlight one, gray the rest), or a stat tile / hero number.

**Bad: A one-bar bar chart, or a 2-slice pie.**
Good: A stat tile. The number is the chart.

**Bad: A donut/pie for comparing close values.**
Good: A bar, or the numbers. Part-to-whole at a glance only, <= 6 segments.

**Bad: More than ~7 color classes carrying meaning.**
Good: A table, or table + chart. Past ~7 bins, adjacent classes blur.

## Marks & chrome

**Bad: Thick saturated blocks, heavy gridlines, no breathing room.** Reads loud, even
childish, at scale.
Good: Thin marks, hairline recessive grid/axes, generous padding. Saturated fills are
for small marks and accents, never large blocks.

**Bad: Dashed gridlines or axis rules.** Dashing adds visual noise and reads as
"projection" or "threshold" when it's just a grid.
Good: Gridlines and axes are solid hairlines, one shade off the surface.

**Bad: A number on every data point.** A value beside every dot or segment is chaos and goes unread.
Good: A legend is always present for >= 2 series; direct-label *selectively* (the endpoint, the extreme, the one series that matters) and let the axis + tooltip carry the rest.

**Bad: A border drawn around marks to separate them.**
Good: A 2px surface gap between fills (stacked segments and adjacent bars alike) and a 2px surface ring (on overlapping markers).

**Bad: A label clipped by, or overflowing, a too-small bar or stacked segment** -
including `overflow: hidden` cropping the first/last characters of an in-segment label.
Good: Only render a label inside a mark when it fits with padding; otherwise move it
outside the bar end, or drop it to the tooltip/legend (the value stays in the table view).

**Bad: A chart container whose fixed height excludes the x-axis band** - the plot
fits, the axis labels don't, so the card gets a tiny nested vertical scroll.
Good: Size the container to include the axis labels (plot height + x-axis band),
or let the container grow with its content instead of fixing a height.

**Bad: A display or serif face on the hero figure.** It reads as off-brand decoration.
Good: The hero figure uses the same sans as everything else.

**Bad: `tabular-nums` on a large standalone number.** Equal-width digits make `121`
look loose at display sizes.
Good: Proportional figures on hero and stat-tile values; `tabular-nums` only where
numbers align vertically (table rows, axis ticks).

**Bad: Texture on by default, or as decoration.** Dense angled fields are a vestibular
risk and read as noise on value scales.
Good: Texture is opt-in (a11y setting, print, forced-colors), 45°/135° only, ordered on
value scales.

## Interaction & accessibility

**Bad: A tooltip as the only way to read a value.**
Good: Tooltips enhance, never gate - every value is also reachable via direct labels or
the table view; keyboard focus shows the same as hover.

**Bad: Pinpoint hover targets - an 8px scatter dot you must land on dead-center.**
Good: The hit area includes the 2px gap and meets a ~24px minimum; dense scatter uses a nearest-point / Voronoi layer.

**Bad: Per-chart filters, or filters inside a chart card.**
Good: One filter row above everything it scopes; all charts re-render against the same slice.

**Bad: Skeleton flash on refetch.**
Good: Hold the previous render at reduced opacity - no layout jump.

**Bad: No table view / color-only encoding on a continuous scale.**
Good: Every chart has a table-view twin (the WCAG-clean equivalent).
