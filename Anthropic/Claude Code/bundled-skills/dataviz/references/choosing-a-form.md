# Choosing a form

Decide this **before** color. The data's job picks the form — and sometimes the
right form is not a chart.

## Is it even a chart?

| The data is… | Use | Not |
|---|---|---|
| A single current value (+ maybe a trend) | **Stat tile** (value + delta + sparkline) | A one-bar bar chart |
| A handful of headline numbers | **KPI row** of stat tiles | A grouped bar chart |
| The one number a dashboard leads with | **Hero figure** (≥48px, sans) | — |
| A single ratio against a limit | **Meter** (same-ramp track) | A pie of 2 slices |
| More than ~7 classes that all carry meaning | A **table** (or table + chart) | More colors |

If a chart *is* right, pick the type by the job:

## The job → the type

| Job (what the reader must do) | Default form | Color job |
|---|---|---|
| Compare magnitude, low → high | bar / column; **heatmap** for a grid | sequential (one hue) |
| Trend over time | line; area for a single series | sequential or 1 categorical |
| Tell distinct series apart | grouped/stacked bar, multi-line | **categorical** |
| One series is the point, rest are context | **emphasis** (highlight one, gray the rest) | 1 hue + gray |
| Above/below a baseline; Δ to target | diverging bar, or line vs baseline | diverging |
| Part-to-whole | **stacked bar** (go horizontal for many / long-named categories) | categorical |
| Ordered-scale share (Likert, sentiment, agree↔disagree) | **diverging stacked bar**, centered on neutral | diverging |
| Before → after per item | dumbbell | 1 hue, 2 shades |

## The rules behind the table

- **Sequential is the safe default.** One hue, more-is-darker. It stays legible and
  consistent and is hard to misread. Reach for it unless the data's job is
  specifically *identity* or *polarity*.
- **Categorical is for when the series ARE the subject** — and it has a real cost:
  it can bury the one data point that actually matters. If the story is "this one
  went up," that's **emphasis**, not categorical.
- **Emphasis** = the most underused form. One series in the accent hue, the rest in
  the de-emphasis gray. Often the honest answer to "make this chart clearer."
- **Texture is an opt-in expression, not a default form.** It earns its place only
  for accessibility (full CVD), print/export, and `forced-colors`. Never decorative.
  → see `marks-and-anatomy.md`.

## Series-count ladder (categorical)

| Series | Treatment |
|---|---|
| 1–3 | color alone is comfortable for everyone; direct-label |
| 4 | the CVD floor enters — direct labels become mandatory, not a courtesy |
| 5–6 | soft cap; legend or small multiples |
| 7–8 | token ceiling; past it, fold the tail into "Other," facet into small multiples, or use composite encoding (hue × shape) |

Never solve "too many series" by generating more hues. A generated 9th hue is
indistinguishable from an existing one under CVD and breaks every check.
