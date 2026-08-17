# Components — the pieces a chart is made of

A chart is built from these parts, assembled in plain HTML/SVG. Tier 0 is the
foundation everything mounts on; the System tier is what makes the method
portable (and is, itself, this skill).

## Tier 0 — Foundations
- **Color roles** — categorical (8 × light/dark), sequential ramps, diverging pairs,
  status (4), de-emphasis / "Other", grayscale chart furniture (axis/grid/label/surface).
  Defined as CSS custom properties at the top of the HTML — see `palette.md`.
- **Texture fill** — the directional fill + 45°/135° rotations.
- **Chart container** — a `<figure>` (or card `<div>`) that owns responsive
  sizing, title/caption, and the **table-view toggle** (the accessibility twin
  of every chart). **Any fixed height includes the x-axis band** (plot height
  + axis labels) so the card never gets a nested vertical scroll; prefer
  letting the container grow with its content.
- **Legend** (toggle-to-isolate, texture-aware swatches) · **Tooltip** · **Axis** · **Data label**.

## Tier 1 — The charts people ask for
- **Bar chart** — grouped + stacked, thin-bar default, horizontal + vertical.
- **Line chart** — multi-series, soft-fill area variant, accessibility markers.
- **Stat tile** — value + delta + optional sparkline (the figure contract).
- **Meter / progress track** — same-ramp tracks.

## Tier 2 — Rounding out the kit
- **Area chart** (stacked, band-edge = line) · **Sparkline** · **Heatmap**
- **Scale legend** (sequential / diverging) · **Chart filters / time range** · **Empty state**

## System tier — becomes the skill
- **Six-checks validator** — `scripts/validate_palette.js` (palette validation).
- **Theming engine** — snap a customer's ramps to passing values (color-formula.md).
- **Chart-type heuristic** — pick the form (choosing-a-form.md).
- **Table-view generator** — the WCAG-clean equivalent of any chart.

Notes: part-to-whole rides on the stacked bar chart; donut stays deprioritized.
Small multiples is a layout pattern over these, not a separate piece. Scatter
joins Tier 2 if scatter-heavy surfaces land.
