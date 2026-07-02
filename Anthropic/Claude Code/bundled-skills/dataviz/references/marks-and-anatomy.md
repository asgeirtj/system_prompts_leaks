# Marks & anatomy

The quiet, considered look is a few fixed specs plus two pieces of negative space.
The data is the only thing allowed to be loud.

## Mark specs (fixed across every chart)

| Mark | Spec |
|---|---|
| Bar / column | **≤ 24px thick** (cap it — never fill the slot; let the band's leftover be air); **4px rounded data-end, square at the baseline**; grows from a single baseline |
| Line | **2px**, round join/cap |
| Marker / end-dot | **≥ 8px** (r ≥ 4), filled with the series color |
| Area fill | the series hue at **~10% opacity** (a wash, never a saturated block) |
| Gridlines / axes | one-step-off-surface gray, **hairline (1px), solid** (never dashed), recessive |

## The two spacers (white doing the separating)

- **Surface gap.** A **2px gap** in the surface color separates touching marks — every
  segment of a stacked bar, and every adjacent (touching) bar, the same width. Keep it
  one consistent width across a stack; neighbors one step apart read distinct because of
  the gap, not a stroke drawn around them.
- **Surface ring.** Dots and end-markers carry a **2px ring in the surface color**,
  so they stay legible where they cross a line or overlap each other. The ring is part
  of the mark's hover/hit target, not just spacing — see `interaction.md` (small dots
  are easy to under-size for hover).

Never draw a border around a mark to separate it. The gap and the ring are the
mechanism; a stroke adds data-weight ink that isn't data.

## Labels & legend

A **legend is always present for two or more series** — the dependable identity
channel; never make the reader rely on color-matching alone. Direct labels then ride
the marks to *supplement* it. **A single series needs no legend box**: there is only
one color, so the chart's title or subtitle already says what is plotted. A box with
one swatch restates the title and costs space.

- **Label selectively — never a number on every point.** A value beside every dot or
  segment is chaos and goes unread. Label the endpoint, the extreme, or the one series
  the story is about; let the axis, the legend, and the tooltip/table carry the rest.
  Direct labels work *because* they are sparing — flood the chart and they stop working.
- **Direct labels before gridlines; gridlines before a second axis.**
- **A label that won't fit doesn't get clipped — measure first.** Only place a label
  *inside* a bar or stacked segment when the rendered text fits with comfortable
  padding on both sides. If it doesn't fit: for a whole bar/column, move the label
  outside the bar end (or to the tooltip if there's no room outside either); for an
  *interior* stacked segment (which has no free end),
  skip the inline label and let the legend + tooltip carry it. Either way the value
  stays in the table view, so nothing is gated. Never use `overflow: hidden` on the
  segment to "solve" it — that crops the first/last characters and is worse than no
  label. Text never overflows or is clipped by its own mark.
- Bars → value at the tip. Columns → value on the cap. Lines → value at the end.
- Y-axis ticks: round to clean numbers (0 / 1,000 / 2,000), thousands-comma'd; they
  carry the values you didn't directly label, so keep them unless every value is labeled.
- **Text never wears the data color.** Marks — bars, lines, dots, area fills — carry
  the series color; labels, values, legends, and axis text use **text tokens**
  (primary / secondary / muted). A light categorical hue (yellow, aqua) is illegible
  as text on the surface. Identity comes from the colored mark *beside* the text — a
  dot, a short line-key, a swatch — never from coloring the text itself. A label set
  *inside* a colored fill (a stacked segment, a map tile) is the one exception: pick
  white or ink by the fill's luminance so it always clears contrast.
- **When end-labels collide, don't stack them.** Direct end-labels work when series
  separate at the right edge. When lines converge, nudging labels apart vertically
  detaches them from their lines and reads as noise — instead use **leader lines**
  (a thin connector from label to line-end), facet into **small multiples**, or fall
  back to the legend + tooltip. Past ~4 converging series, small multiples is usually right.

## Figures — when the form is a number

- **Stat tile** contract: `label` (sentence case, no trailing colon) · `value` (Sans
  semibold, auto-compact: 1,284 / 12.9K / $4.2M) · `delta` (optional; signed,
  vs a named period; color = direction × whether up is good) · `trend` (optional;
  12-point sparkline in the de-emphasis hue, current period in the accent).
- **Meter:** the fill carries severity (accent → warning → danger); the unfilled
  track is a **lighter step of the same ramp** (blue-on-blue, etc.) so state reads
  across the whole bar.
- **Hero figure.** The single number a dashboard leads with, ≥48px, in the same
  sans as everything else (never a display or serif face — it reads as off-brand
  decoration). Exactly one per view.
- **Proportional figures for big numbers; tabular only in columns.** A large
  standalone value (hero figure, stat-tile value) uses the font's default
  proportional figures — `tabular-nums` gives every digit the width of a `0`, so a
  number like `121` looks loose at display sizes. Reserve
  `font-variant-numeric: tabular-nums` for columns of numbers that must align
  vertically (table rows, axis ticks).

## Texture — the backup channel (opt-in)

Where hue fails — full-severity CVD, grayscale print, `forced-colors` — texture
carries identity. One directional hand-drawn fill, used at **45° and its 135° mirror
only** (never horizontal/vertical — those read as gridlines/bars). Inked tone-on-tone
(a step from the fill's own ramp), equal loudness across slots. On value scales the
texture is *ordered* (rotation steps with magnitude; arm angle carries the diverging
sign) so it never misstates the value. Triggered by an accessibility setting, print,
or `forced-colors` — never on by default. (See `palette.md`.)
