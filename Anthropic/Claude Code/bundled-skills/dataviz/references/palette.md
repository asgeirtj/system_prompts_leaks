# Reference palette

This is the **reference instance** of the data-viz method: every parameter the
method needs, filled in with a validated default palette. The rest of the skill
is system-agnostic — **to target your brand, substitute this file's values** and
re-run the validator. Nothing else changes.

## How to use these values

Everything below is plain hex. In an HTML chart, **define the slots you use as
CSS custom properties in a local `<style>` block** at the top of the file, then
reference them by role throughout — so the light/dark values swap in one place,
and the chart body is written against roles rather than raw hex:

```css
.viz-root {
  --surface-1:      #fcfcfb;   /* chart surface */
  --text-primary:   #0b0b0b;
  --text-secondary: #52514e;
  --series-1:       #2a78d6;   /* categorical slot 1 */
  /* …only the roles this chart uses */
}
@media (prefers-color-scheme: dark) {
  .viz-root {
    --surface-1:      #1a1a19;
    --text-primary:   #ffffff;
    --text-secondary: #c3c2b7;
    --series-1:       #3987e5;
  }
}
```

## Categorical palette

Both modes are selected. The dark column is the same eight hues stepped for the
dark surface, not a separate palette:

| Slot | Hue | Light | Dark |
|------|-----|-------|------|
| 1 | blue | `#2a78d6` | `#3987e5` |
| 2 | aqua | `#1baf7a` | `#199e70` |
| 3 | yellow | `#eda100` | `#c98500` |
| 4 | green | `#008300` | `#008300` |
| 5 | violet | `#4a3aa7` | `#9085e9` |
| 6 | red | `#e34948` | `#e66767` |
| 7 | magenta | `#e87ba4` | `#d55181` |
| 8 | orange | `#eb6834` | `#d95926` |

Light-mode worst adjacent CVD ΔE is 24.2 — well clear of the ≥12 target. Three
light-mode slots (aqua, yellow, magenta) sit below 3:1 contrast on the light
surface: the **relief rule** applies (ship visible direct labels or the table
view). The dark steps were chosen for the dark band (OKLCH L ≈ 0.48–0.67, ≥ 3:1
on the dark surface) and validated as a set — worst adjacent ΔE 10.3, the floor
band, so four-plus series lean on direct labels or texture in dark mode too.

The slot **ordering** is the CVD-safety mechanism, not cosmetic — it was derived
by enumerating orderings and picking the one that maximizes the minimum adjacent
ΔE (see `color-formula.md` § Themes). When you swap in your brand's hues, do the
same: run the validator on candidate orderings and keep the best.

## Sequential hue

Default single hue: **blue**, light→dark. When two sequential contexts appear at
once, the second takes the next categorical slot's hue (aqua), each as its own
one-hue ramp.

| step | hex | step | hex | step | hex | step | hex |
|---|---|---|---|---|---|---|---|
| 100 | `#cde2fb` | 250 | `#86b6ef` | 400 | `#3987e5` | 550 | `#1c5cab` |
| 150 | `#b7d3f6` | 300 | `#6da7ec` | 450 | `#2a78d6` | 600 | `#184f95` |
| 200 | `#9ec5f4` | 350 | `#5598e7` | 500 | `#256abf` | 650 | `#104281` |
| | | | | | | 700 | `#0d366b` |

The full 100→700 range is for **sequential** encoding (continuous magnitude —
heatmaps, choropleths) where the lightest step means "near zero" and is allowed
to recede toward the surface. For an **ordinal** ramp (discrete ordered marks —
funnel stages, tiers — validated with `--ordinal`), the step nearest the surface
must still clear 2:1: on light, start no lighter than **step 250** (`#86b6ef`,
2.06:1); on dark, go no darker than **step 600** (`#184f95`, 2.15:1).

## Diverging pair

**blue ↔ red** — warm/cool poles that read as opposite. Neutral midpoint is gray
(light `#f0efec`, dark `#383835`). Equal step count per arm. (blue↔aqua was
rejected — both cool, the midpoint doesn't read as "nothing".)

## Status palette (fixed — never themed)

| role | hex | light-surface contrast | dark-surface contrast |
|---|---|---|---|
| good | `#0ca30c` | 3.27 | 5.19 |
| warning | `#fab219` | 1.79 | 9.49 |
| serious | `#ec835a` | 2.57 | 6.60 |
| critical | `#d03b3b` | 4.68 | 3.62 |

Dark: same four steps — all clear 3:1 on the dark surface (`#1a1a19`) and remain
distinct from the dark categorical slots. On the light surface, warning and
serious are sub-3:1 by design; the **icon + label** pairing is the mitigation, so
a status color never carries meaning alone. These steps are deliberately distinct
from the categorical slots so a status color never impersonates a series.

## Texture fill (the accessibility channel)

One hand-drawn **"Lines"** fill, used at **45° and its 135° mirror only**. Inked
tone-on-tone (a darker step of the fill's own ramp). On value scales it is
*ordered* (rotation steps with magnitude; arm angle carries the diverging sign).
Triggered by the accessibility setting, print, or `forced-colors` — never
decorative, never on by default.

## Surfaces (for the validator)

- Light chart surface: `#fcfcfb`
- Dark chart surface: `#1a1a19`

These are the validator's built-in defaults. **When you swap in your own
palette, re-run against your own surfaces:**
`--surface <your-light> --mode light` and `--surface <your-dark> --mode dark` —
contrast and band results are only meaningful against the surface the chart
actually renders on.

## Chart chrome & ink

| Role | Light | Dark |
|---|---|---|
| Chart surface | `#fcfcfb` | `#1a1a19` |
| Page plane | `#f9f9f7` | `#0d0d0d` |
| Primary ink | `#0b0b0b` | `#ffffff` |
| Secondary ink | `#52514e` | `#c3c2b7` |
| Muted (axis/labels) | `#898781` | `#898781` |
| Gridline (hairline) | `#e1e0d9` | `#2c2c2a` |
| Baseline / axis | `#c3c2b7` | `#383835` |
| Delta ↑ good (success text) | `#006300` | `#0ca30c` |
| Border (hairline ring) | `rgba(11,11,11,0.10)` | `rgba(255,255,255,0.10)` |

## Filter controls

Filters are standard UI, not chart components — the chart layer only adds the
composition rules in `interaction.md`. A date-range control is a list of preset
rows (today, last 7/30/90 days, month-to-date) with selection marked by a 16px
bold check, hover as a ghost wash, and custom range behind a hairline in the
footer. Dimension filters are a standard combobox.

## Typeface & figures

Everything — including the hero figure — stays in the system sans: `system-ui,
-apple-system, "Segoe UI", sans-serif`. No display or serif face anywhere. Large
standalone numbers (hero figure, stat-tile values) use the default proportional
figures; reserve `font-variant-numeric: tabular-nums` for columns that must align
vertically (table rows, axis ticks). Substitute your brand's UI sans here.
