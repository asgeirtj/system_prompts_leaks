---
description: Building a chart on any surface: where its numbers come from, how data maps to marks, and the technique each surface needs.
---

# Charts

- Read this before writing any chart, on any surface. Decide one thing first: is the chart a rendered image placed on a fixed page, or live elements in a page that reflows? That choice picks your technique section below, and the data and encoding rules apply everywhere.

## Where the numbers come from

- If the data already exists, such as a file the user gave you, a document you just produced or a spreadsheet in the workspace, read it and build from it. Never regenerate numbers you already produced. Two generations of "the same" data will not match, and the user cannot tell which is right.

- Never claim two artifacts show the same data unless you read one and built the other from it.

- Use only real, verifiable data from the source. Never invent figures, dates, citations or source names, and never cite a chart you generated as a source.

- If a source's summary disagrees with its own rows, recompute from the rows and say so on the artifact.

- Ship no randomness. With `Math.random()`, no two loads agree. If you must synthesize sample data, generate it once, save it to a file and have every artifact read that file.

- Compute every displayed number from the plotted data:
  - captions, headings, stat tiles, annotations and summary lines
  - superlatives such as "peak", "highest" or "fastest-growing", which come from an argmax over the series, never from memory
  - comparisons and counts stated in prose, such as "up 40%" or "eight above the threshold"
  - deltas, whose two endpoints must both exist in the dataset

- A literal typed into prose drifts the moment the data changes. Never floor or cap a displayed statistic, because `max(22, computed)` guarantees a number, not a fact. Never claim a reconciliation you did not compute.

- Compute a total from the parts shown beside it, never from a different source than the parts.

- Percentages share one denominator and the parts must account for the whole. If they sum to 90%, a part is missing or the total is wrong, and the artifact says which.

- State a count only if it matches what you drew. Name the remainder, because an unlabeled slice is unreadable.

## How data maps to marks

- These rules apply on every surface. Where you hand-author the chart they are the arithmetic you are about to write. Where a library computes them, check its output, because library defaults happily draw a truncated baseline or an axis that clips your data.

### Axes

- Derive the domain from the data and never hardcode a limit. A literal maximum will eventually be smaller than the data, and points past it clip without warning. Verify every plotted value falls inside whatever range you set.

- Start bar and area charts at zero, because their length encodes magnitude and a truncated baseline misstates it. If the variation only shows on a truncated scale, use a line chart.

- When truncation is unavoidable, disclose it on the chart itself with a visible axis break. A note in prose beside the chart does not travel with a screenshot.

- Match the range to the question. An axis so wide that meaningfully different bars look identical, or so narrow that noise reads as a mountain range, misreports either way.

- Use one labeled scale per encoding. Two series in different units need two labeled axes or two charts. Rescaling one series by a constant so it can share the axis is the same defect with extra steps.

- Give every axis readable ticks. Value labels alone are not a scale.

### Labels

- Never truncate label text in code, since a sliced label reads as data ("Utiliti"). Rotate, wrap, shrink the type or show fewer ticks, and measure the longest label against the space before choosing.

- Show value labels on every mark or on none. Clipping only the longest one hides the largest value.

- Check text against its container, such as a card, the plot area or a donut hole, not just the viewport. Keep labels from overlapping each other or the marks.

### Legends and annotations

- Put every plotted series in the legend, with each swatch built from the same value the renderer uses. Two series must never resolve to one color.

- Place a reference line or annotation at its statistic. A line labeled "median" sits at the median.

- Keep decorative marks proportional, or they are not marks.

### Data shape

- Render missing data as a gap. Never interpolate across a hole, because a reader cannot tell absent from zero.

- Give unequal intervals a real scale. Spacing 2021, 2023 and 2026 as three even categories tells the reader the gaps were equal.

- Label a partial period as partial, or it reads as a collapse in volume.

- Show every part of a part-to-whole. A capped list of slices still names and counts the remainder.

- Never clamp values to the top of a range. Clamping to 100% makes 108% and 166% identical.

## Technique by surface

### Slide deck

- Render the chart as an image from real data with deterministic Python (matplotlib). Never fake one with CSS shapes, gradients, styled divs, inline SVG or Mermaid, and never use `media.generate_image` for a chart. Generated imagery is for concepts, and charts carry the data.

- Color it from the deck by passing `--slide-primary`, `--slide-accent`, `--slide-fg` and `--slide-muted` into the chart script.

- Place it with `object-fit: contain`, never `cover`, which crops the axes and labels. This overrides the usual `cover` default for image cells.

- The library computes scales, ticks and the legend, but check them against the encoding rules above. Matplotlib will happily truncate a baseline.

- Slide layout and the one-fact-one-home rule stay in the [slide authoring guide](/opt/muse/skills/documents/presentation/references/authoring.md).

### PDF or printed document

- Build charts with a Python script using matplotlib, plotly or seaborn. Never use `media.generate_image` or any other media generation tool for a data visualization.

- The [PDF workflow](/opt/muse/skills/documents/pdf/references/workflow.md) owns page placement: `object-fit`, `max-height` and the `cover` trap that crops axes while validation passes. If a chart renders too small to read, raise its `max-height` or drop it.

### Self-contained page with no build step

- This covers `runtime: static` and any live page built without a bundler.

- Hand-author the chart as inline SVG rather than loading a charting library from a CDN at read time. That keeps the chart's correctness in the file you write instead of in a dependency that must resolve before anything renders.

- No library is computing scales, ticks, labels or the legend, so every rule in "How data maps to marks" is arithmetic you write. Settle the domain, the baseline, the label strategy, the legend and the annotation positions before you draw.

- Inline the data once as a literal array. That array is the single source for the marks, the labels, the legend and any total you display.

- The page scrolls, so let cards size to content (`align-items: start`) and never stretch a chart card to match a taller sibling. Reserve real height for the plot, because a series squeezed into a wide, short box flattens.

- Position tooltips in the coordinate space you apply them in. Values computed in an SVG `viewBox` and set as CSS pixels land in the wrong place once the SVG scales, and `overflow: hidden` on the container clips tooltips at the edges, exactly where they appear.

- This section governs only the chart. The page's other assets, such as fonts, images, allowed CDN tags and maps, follow the asset rules already in your instructions. Never strip an allowed asset because of something you read here.

### Web artifact on the TypeScript runtime

- Bind charts to the data file the source document already reads. A web artifact usually follows a document, and a hand-typed copy of its dataset is a second dataset that will differ while both artifacts claim the same numbers. If no source file exists yet, produce one first and have both read it.

- Build charts as real DOM with Recharts. Avoid these:
  - matplotlib PNGs, which cannot reflow, are invisible to assistive technology and blur when scaled
  - styled-div or Mermaid fakes
  - canvas libraries such as Chart.js, uPlot or the default ECharts renderer, which turn the chart into a bitmap the page cannot inspect or style
  - D3 or visx, unless the chart is genuinely custom, since they hand back the scale and axis math this reference exists to avoid

- Check the artifact's own `package.json` first. A new scaffold pins `"recharts": "2.15.3"`, an older artifact does not, and importing it without the dependency fails the build.

- Add the scaffold's exact pin, not a range, then run `bun install` before building. Auto-install is off, so the entry alone does not put the module on disk.

- Recharts derives scales, legend entries and tooltip positions from the series, the three things most often shipped wrong. It does not do two things: it auto-scales, so set a zero domain yourself for bars and areas, and it will not stop you plotting two units against one axis.

- Let cards size to content in a scrolling grid (`align-items: start`). Stretching belongs on fixed slides. Verify text fits at the widths the artifact really renders, including narrow ones, because a horizontally scrolling table hides its right-hand columns, usually the totals.

- Every control described anywhere in the page or your reply re-renders every panel it claims to affect. Keep control state and displayed state in one place, and make exports reflect the current view.

## Before you hand it over

- Re-derive each headline figure from the source and compare it with what the artifact displays: the total, the percentages, the named extreme, any growth figure and any count you state. A number you cannot reproduce from the data is wrong, and the fix is the number, not the caption.

- Then read the artifact as its reader will, starting from first load with no interaction. A chart that only appears after a click has not been delivered.
