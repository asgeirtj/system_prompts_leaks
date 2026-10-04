---
description: Building a chart on any surface: where its numbers come from, how data maps to marks, and the technique each surface needs.
---

# Charts

Read this before writing any chart, on any surface. Decide one thing first: is
the chart a rendered image placed on a fixed page, or live elements in a page
that reflows? That choice picks your technique section below. The data and
encoding rules apply everywhere.

## Where the numbers come from

- If the data already exists (a file the user gave you, a document you just
  produced, a spreadsheet in the workspace), read it and build from it. Never
  regenerate numbers you already produced: two generations of "the same" data
  will not match, and the user cannot tell which is right.
- Never claim two artifacts show the same data unless you read one and built
  the other from it.
- Use only real, verifiable data from the source. Never fabricate figures,
  dates, citations, or source names, and never cite a chart you generated as a
  source.
- If a source's summary disagrees with its own rows, recompute from the rows
  and say so on the artifact.
- No randomness in a shipped artifact: `Math.random()` means no two loads
  agree. If you must synthesize sample data, generate it once, persist it to a
  file, and have every artifact read that file.

**Every displayed number is computed from the plotted data.** That covers
captions, headings, stat tiles, annotations, and summary lines; superlatives
("peak", "highest", "fastest-growing"), which come from an argmax over the
series, never from memory; comparisons and counts stated in prose ("up 40%",
"eight above the threshold"); and deltas, whose two endpoints must both exist
in the dataset. A literal typed into prose drifts the moment the data changes.
Never floor or cap a displayed statistic: `max(22, computed)` guarantees a
number, not a fact. Never claim a reconciliation you did not compute.

Totals and shares: compute a total from the parts shown beside it, never from
a different source than the parts. Percentages share one denominator and the
parts must account for the whole; if they sum to 90%, a part is missing or the
total is wrong, and the artifact says which. State a count only if it matches
what you drew. Name the remainder; an unlabeled slice is unreadable.

## How data maps to marks

These rules apply on every surface. Where you hand-author the chart they are
the arithmetic you are about to write; where a library computes them, check
its output, because library defaults happily draw a truncated baseline or an
axis that clips your data.

Axes:

- Derive the domain from the data; never hardcode a limit. A literal max will
  eventually be smaller than the data, and points past it clip without
  warning. Verify every plotted value falls inside whatever you set.
- Bar and area charts start at zero: length encodes magnitude, and a truncated
  baseline misstates it. If the variation only shows on a truncated scale, use
  a line chart. When truncation is unavoidable, disclose it on the chart
  itself (a visible axis break), not in prose beside it, which does not travel
  with a screenshot.
- Match the range to the question: an axis so wide that meaningfully different
  bars render identical, or so narrow that noise reads as a mountain range,
  both misreport.
- One labeled scale per encoding. Two series in different units need two
  labeled axes or two charts; rescaling one series by a constant so it can
  share the axis is the same defect with extra steps.
- Give every axis readable ticks; value labels alone are not a scale.

Labels:

- Never truncate label text in code: a sliced label reads as data ("Utiliti").
  Rotate, wrap, shrink the type, or show fewer ticks, and measure the longest
  label against the space before choosing.
- Drop value labels uniformly or keep them uniformly; clipping only the
  longest one hides the largest value.
- Check text against its container (card, plot area, donut hole), not just the
  viewport, and keep labels from overlapping each other or the marks.

Legends and annotations:

- Every plotted series appears in the legend, with each swatch built from the
  same value the renderer uses; two series must never resolve to one color.
- A reference line or annotation sits at its statistic: a line labeled
  "median" is at the median.
- Decorative marks are proportional or they are not marks.

Data shape:

- Missing data renders as a gap. Never interpolate across a hole; a reader
  cannot tell absent from zero.
- Unequal intervals need a real scale: 2021, 2023, and 2026 as three evenly
  spaced categories tell the reader the gaps were equal.
- Label a partial period as partial, or it reads as a collapse in volume.
- A part-to-whole shows every part; a capped slice list still names and counts
  the remainder.
- Never clamp values to the top of a range: clamping to 100% makes 108% and
  166% identical.

## Technique by surface

### Slide deck

- Render the chart as an image from real data with deterministic Python
  (matplotlib). Never fake one with CSS shapes, gradients, styled divs, inline
  SVG, or Mermaid, and never use `media.generate_image` for a chart: generated
  imagery is for concepts, and charts carry the data.
- Color it from the deck: pass `--slide-primary`, `--slide-accent`,
  `--slide-fg`, and `--slide-muted` into the chart script.
- Place it with `object-fit: contain`, never `cover`, which crops the axes and
  labels. This overrides the usual cell `cover` default.
- The library computes scales, ticks, and legend, but check them against the
  encoding rules above; matplotlib will happily truncate a baseline.
- Slide layout and the one-fact-one-home rule stay in `slides/authoring.md`.

### PDF or printed document

- Build charts with a Python script (matplotlib, plotly, or seaborn). Never
  use `media.generate_image` or any other media generation tool for a data
  visualization.
- Page placement (`object-fit`, `max-height`, the `cover` trap that crops axes
  while validation passes) is owned by the pdf skill's `workflow.md`. If a chart renders too small to read, raise its `max-height`
  or drop it.

### Self-contained page with no build step

Covers `runtime: static` and any live page built without a bundler.

- Hand-author the chart as inline SVG rather than loading a charting library
  from a CDN at read time; that keeps the chart's correctness in the file you
  write instead of in a dependency that must resolve before anything renders.
- No library is computing scales, ticks, labels, or legend, so every rule in
  "How data maps to marks" is arithmetic you write. Settle the domain, the
  baseline, the label strategy, the legend, and the annotation positions
  before you draw.
- Inline the data once as a literal array; that array is the single source for
  the marks, the labels, the legend, and any total you display.
- The page scrolls, so let cards size to content (`align-items: start`); never
  stretch a chart card to match a taller sibling. Reserve real height for the
  plot: squeezed into a wide, short box, the series flattens.
- Position tooltips in the coordinate space you apply them in: values computed
  in an SVG `viewBox` and set as CSS pixels land wrong once the SVG scales,
  and `overflow: hidden` on the container clips tooltips at the edges, exactly
  where they appear.
- This section governs only the chart. The page's other assets (fonts, images,
  allowed CDN tags, maps) follow the asset rules already in your instructions;
  never strip an allowed asset to satisfy something you read here.

### Web artifact on the TypeScript runtime

- Bind charts to the data file the source document already reads. A web
  artifact usually follows a document, and a hand-typed copy of its dataset is
  a second dataset: it will differ, and both artifacts will claim to be the
  same numbers. If no source file exists yet, produce one first and have both
  read it.
- Build charts as real DOM with Recharts. No matplotlib PNGs (they cannot
  reflow, are invisible to assistive tech, and blur on scaling), no styled-div
  or Mermaid fakes, no canvas libraries (Chart.js, uPlot, ECharts' default
  renderer: the chart becomes a bitmap the page cannot inspect or style), and
  no D3/visx unless the chart is genuinely custom, since they hand back the
  scale and axis math this reference exists to avoid.
- Check the artifact's own `package.json` first: a new scaffold pins
  `"recharts": "2.15.3"`, an older artifact does not, and importing it without
  the dependency fails the build. Add the scaffold's exact pin, not a range,
  then run `bun install` before building: auto-install is off, so the entry
  alone does not put the module on disk.
- Recharts derives scales, legend entries, and tooltip positioning from the
  series, the three things most often shipped wrong. Two things it does not
  do: it auto-scales, so set a zero domain yourself for bars and areas, and it
  will not stop you plotting two units against one axis.
- Let cards size to content in a scrolling grid (`align-items: start`);
  stretching belongs on fixed slides. Verify text fits at the widths the
  artifact really renders, including narrow ones; a horizontally scrolling
  table hides its right-hand columns, usually the totals.
- Every control described anywhere in the page or your reply re-renders every
  panel it claims to affect. Keep control state and displayed state in one
  place, and make exports reflect the current view.

## Before you hand it over

Re-derive each headline figure from the source and compare it to what the
artifact displays: the total, the percentages, the named extreme, any growth
figure, any count you state. A number you cannot reproduce from the data is
wrong, and the fix is the number, not the caption. Then read the artifact as
its reader will, starting from first load with no interaction: a chart that
only appears after a click has not been delivered.
