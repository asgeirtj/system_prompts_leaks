# Choosing a form

Decide this **before** color. The data's job picks the form - and sometimes the
right form is not a chart.

## Is it even a chart?

| The data is... | Use | Not |
|---|---|---|
| A single current value (+ maybe a trend) | **Stat tile** (value + delta + sparkline) | A one-bar bar chart |
| A handful of headline numbers | **KPI row** of stat tiles | A grouped bar chart |
| The one number a dashboard leads with | **Hero figure** (>=48px, sans) | - |
| A single ratio against a limit | **Meter** (same-ramp track) | A pie of 2 slices |
| One whole split into <= 6 parts, read at a glance, standing alone | **Tall segmented bar** (to compare the parts instead -> *Part-to-whole - which bar* below) | A donut or a pie |
| More than ~7 classes that all carry meaning | A **table** (or table + chart) | More colors |

If a chart *is* right, pick the type by the job:

## The job -> the type

| Job (what the reader must do) | Default form | Color job |
|---|---|---|
| Compare magnitude, low -> high | bar / column; **heatmap** for a grid | sequential (one hue) |
| Trend over time | line; area for a single series | sequential or 1 categorical |
| Tell distinct series apart | grouped/stacked bar, multi-line | **categorical** |
| One series is the point, rest are context | **emphasis** (highlight one, gray the rest) | 1 hue + gray |
| Above/below a baseline; delta to target | diverging bar, or line vs baseline | diverging |
| Part-to-whole | a bar; which one -> *Part-to-whole - which bar* below | categorical; one hue for ranked bars |
| Ordered-scale share (Likert, sentiment, agree<->disagree) | **diverging stacked bar**, centered on neutral | diverging |
| Before -> after per item | dumbbell | 1 hue, 2 shades |

## The rules behind the table

- **Sequential is the safe default.** One hue, more-is-darker. It stays legible and
  consistent and is hard to misread. Reach for it unless the data's job is
  specifically *identity* or *polarity*.
- **Categorical is for when the series ARE the subject** - and it has a real cost:
  it can bury the one data point that actually matters. If the story is "this one
  went up," that's **emphasis**, not categorical.
- **Emphasis** = the most underused form. One series in the accent hue, the rest in
  the de-emphasis gray. Often the honest answer to "make this chart clearer."
- **Texture is an opt-in expression, not a default form.** It earns its place only
  for accessibility (full CVD), print/export, and `forced-colors`. Never decorative.
  -> see `marks-and-anatomy.md`.

## Part-to-whole - which bar

A request for a donut or a pie is usually a part-to-whole request (one ratio against a
limit is a **Meter**, above). Answer it with one of these; the donut stays deprioritized.

| The reader must... | Use |
|---|---|
| Compare the parts with each other, rank them, tell close values apart, or read more than 6 parts | **Ranked horizontal bars**, one per part, largest first, one hue: bars on one baseline compare more exactly than segments laid end to end |
| See how one whole splits, at a glance: one bar alone in a card, no figures listed beside it | **Tall segmented bar**: each part its own block, its share or amount printed on it where it fits, and a legend of names only. <= 6 parts; fold a tail nobody needs to read into "Other" |
| Read the split beside its figures: down the rows of a table or list, or above a list that already gives each part's name and amount | **Thin segmented bar**, no text: the text beside it carries the figures the reader needs, and printing them on the bar adds nothing. One legend for the whole table; a swatch on each list row replaces the legend |
| See the split change over time, or compare several wholes on one shared axis | **Stacked bar chart** (go horizontal for many / long-named categories): its axis carries the values |

Specs for the two segmented bars -> *Figures* in `marks-and-anatomy.md`.

## Series-count ladder (categorical)

| Series | Treatment |
|---|---|
| 1-3 | color alone is comfortable for everyone; direct-label |
| 4 | adjacent forms (stacks, bars, lines) stay gate-safe, but direct labels become mandatory - yellow and orange now share the screen; all-pairs forms (scatter, bubble, choropleth, small multiples) cap at **three** - fold to "Other" or facet rather than seat a 4th |
| 5-6 | soft cap; legend or small multiples |
| 7-8 | token ceiling; past it, fold the tail into "Other," facet into small multiples, or use composite encoding (hue × shape) |

Never solve "too many series" by generating more hues. A generated 9th hue is
indistinguishable from an existing one under CVD and breaks every check.
