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
  color-scheme: light;
  --surface-1:      #fcfcfb;   /* chart surface */
  --text-primary:   #0b0b0b;
  --text-secondary: #52514e;
  --series-1:       #2a78d6;   /* categorical slot 1 */
  /* …only the roles this chart uses */
}
@media (prefers-color-scheme: dark) {
  :root:where(:not([data-theme="light"])) .viz-root {
    color-scheme: dark;
    --surface-1:      #1a1a19;
    --text-primary:   #ffffff;
    --text-secondary: #c3c2b7;
    --series-1:       #3987e5;
  }
}
:root[data-theme="dark"] .viz-root {
  color-scheme: dark;
  --surface-1:      #1a1a19;
  --text-primary:   #ffffff;
  --text-secondary: #c3c2b7;
  --series-1:       #3987e5;
}
```

Declare the dark values under both scopes as above — the media query covers
the OS setting; the `data-theme` scope covers the viewer's theme toggle,
which must win both ways (the `:not(…)` guard lets a light stamp beat
OS-dark; `:where()` keeps the media block below the toggle scope).

## Categorical palette

Both modes are selected. The dark column is the same eight hues stepped for the
dark surface, not a separate palette:

| Slot | Hue | Light | Dark |
|------|-----|-------|------|
| 1 | blue | `#2a78d6` | `#3987e5` |
| 2 | orange | `#eb6834` | `#d95926` |
| 3 | aqua | `#1baf7a` | `#199e70` |
| 4 | yellow | `#eda100` | `#c98500` |
| 5 | magenta | `#e87ba4` | `#d55181` |
| 6 | green | `#008300` | `#008300` |
| 7 | violet | `#4a3aa7` | `#9085e9` |
| 8 | red | `#e34948` | `#e66767` |

This order passes every hard gate in both modes on the default *adjacent*
pairlist (stacks, bars, lines): worst adjacent CVD ΔE 9.1 light / 8.4 dark
(OKLab ×100, ≥8 target), worst adjacent normal-vision ΔE 19.6 light / 19.3
dark (≥15 floor). Under `--pairs all` (scatter, bubble, choropleth, small
multiples) the full eight cannot clear the floors — with all 28 pairs in
play no ordering can (the pairlist no longer depends on order), and
re-stepping is off the table by the documented-palette rule — so those
chart forms carry a series cap: **the first three slots validate all-pairs
in both modes** (worst pair CVD ΔE 9.2 light / 9.4 dark, normal-vision 24.0
light / 20.9 dark — clear of the CVD warn band). Past three, fold to "Other" or
facet: the fourth slot puts yellow and orange on screen
together, and that pair fails the all-pairs floors (normal-vision 13.7
light; CVD 4.8 dark). Three light-mode slots (magenta, yellow, aqua)
sit below 3:1 contrast on the light surface: the **relief rule** applies (ship
visible direct labels or the table view). The dark steps were chosen for the
dark band (OKLCH L ≈ 0.48–0.67, ≥ 3:1 on the dark surface) and validated as a
set. (Ordering history: adopted July 2026 for its more harmonious opening —
the same eight hues and steps as its predecessor, re-ordered, zero hex
changes. The predecessor validated its first FOUR slots all-pairs, with its
dark run in the 6–8 CVD warn band, so secondary encoding was required there;
this order deliberately trades that fourth slot — yellow now sits beside orange —
for better-looking leading colors. Revisit the trade if yellow↔orange
confusion shows up in real charts with four or more series; undoing it is a
pure re-order.) When you swap in your own ramps, hold your palette to the full
gate.

The slot **ordering** is the CVD-safety mechanism, not cosmetic — candidate
orderings were enumerated and only those clearing every adjacent gate in both
modes kept (see `color-formula.md` § Themes); this default is one of the
passing orders, picked among them for its opening colors. When you swap in
your brand's hues, do the same: run the validator on candidate orderings and
choose only among the passing ones.

## Sequential hue

Default single hue: **blue**, light→dark. When two sequential contexts appear at
once, the second takes the next categorical slot's hue (orange), each as its own
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
from the categorical slots so a status color never impersonates a series —
distinct enough that nothing collides at a glance, not enough for hue to
carry the distinction unaided: measured by the series floor's own bar
(unsimulated ΔE ≥ 15), around nine categorical-vs-status pairs per mode sit
below 15 — in light mode red vs critical and yellow vs warning both measure
4.8, slot-2 orange sits 5.8 from status-serious, and the light success text
green `#006300` sits 10.1 from the series green; green vs status-good (9.7)
holds in both modes, since both hexes are mode-invariant. The rule is general: any series color beside a
same-hue-family status or delta cue leans on the icon + label pairing and on
placement; never on hue alone.

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
