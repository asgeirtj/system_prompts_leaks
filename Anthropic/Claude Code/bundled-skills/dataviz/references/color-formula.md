# Color formula

Color is **not hand-picked**. Every chart color does exactly one of four jobs, and a
palette is legal only if it passes six checks. The checks are the product — they are
what makes a palette safe to change and what lets the same method run on any design
system's ramps.

## The four jobs

| Job | What it encodes | Structure |
|---|---|---|
| **Categorical** | identity (which series) | 8 hues, fixed order, assigned in sequence, never cycled |
| **Ordinal** | position in a sequence (funnel stage, tier, bucket) | one hue, monotone lightness steps; light end still ≥ 2:1 on surface |
| **Sequential** | magnitude (how much) | one hue, steps 100→700, light→dark; flips anchor in dark |
| **Diverging** | polarity (which side of a baseline) | two hues + a neutral gray midpoint; equal steps per arm |
| **Status** | state (good→critical) | a small fixed scale, reserved meaning, always icon+label |

**Categorical or ordinal?** If swapping the category order would change the
meaning — funnel stages, size tiers (S/M/L), age bands, cohort buckets — it is
**ordinal** and takes a one-hue ramp so the reader sees the order in the color.
If swapping would not — product names, teams, regions, endpoints — it is
**nominal categorical** and each bar takes the *same* slot-1 hue (one series,
so no legend box — the title names it), or slots 1..N when there are N separate
series. Never color nominal bars by their value: that spends the identity channel
re-encoding what bar length already shows.

## The six checks

Every categorical color — current or proposed — must pass all six.

1. **Fixed hue anchors.** Eight families in a fixed order. The order is the
   CVD-safety mechanism; it never changes. *(structural — enforced, not measured)*
2. **Lightness band per mode.** OKLCH L ≈ 0.43–0.77 light; ≈ 0.48–0.67 dark. *(validator)*
3. **Chroma floor.** OKLCH C ≥ ~0.10 — below it a hue reads as gray and stops doing
   identity work. *(validator)*
4. **CVD separation.** Machado-2009 ΔE ≥ 12 target / ≥ 8 floor (floor legal only with
   secondary encoding), under protanopia & deuteranopia. *Adjacent* pairs for
   stacks/bars/lines (only neighbors touch — assignment never skips); **all pairs for
   scatter, bubble, choropleth, and small-multiples**, where any two marks can sit side
   by side — pass `--pairs all` there or a real collapse stays hidden. *(validator)*
5. **Contrast vs surface.** ≥ 3:1 for marks; conditionally relaxed where values are
   readable another way (visible labels or the table view). *(validator)*
6. **Documented palette only.** Every slot is a hex from the instance file
   (`palette.md` or its equivalent) — no eyeballed values. *(structural; for a
   customer's ramps, snap to nearest — below)*

## Run the checks — never eyeball them

```
node scripts/validate_palette.js \
  "#2a78d6,#1baf7a,#eda100,#008300,#4a3aa7,#e34948,#e87ba4,#eb6834" --mode light
```

(`scripts/` is relative to this skill's base directory, shown at the top of the prompt.)

(or load it as `<script type="module">` in the chart's own page — it reads
`data-palette` off `<body>` and logs a `console.table` report)

Reports each computable check (2–5) with PASS / WARN / FAIL plus the worst CVD pair.
Exit 0 = no hard FAIL (WARN bands — floor-band CVD 8–12 and sub-3:1 contrast relief —
still exit 0 and require secondary encoding); exit 1 on any FAIL. Run once per mode
(`--mode dark --surface "#1a1a19"`), and add
`--pairs all` for scatter / bubble / map / small-multiples charts (where any two marks
can be neighbors — the default adjacent check would hide a collapse). For an
**ordinal** ramp pass `--ordinal` — it switches to the ramp checks (monotone L,
adjacent ΔL ≥ 0.06, light-end contrast ≥ 2.0:1, single hue) instead of the
categorical six.
A WARN on CVD (8–12 floor) is legal **only** if you also ship secondary encoding
(direct labels, gaps, or texture). A WARN on contrast is **not dismissable** — it
obligates a relief channel (visible direct labels or the table view); shipping the
sub-3:1 fill with neither is a fail.

**Scope — what the validator does and doesn't cover.** These six checks validate a
*categorical* palette (series identity). They do **not** judge a lone status/text
color or a sequential ramp. For a single status or text color, run a WCAG *text*-
contrast check (4.5:1 normal, 3:1 large) — `validate_palette.js` exports
`contrast(a, b)` for exactly this. For sequential/diverging, the check is lightness
monotonicity across the ramp, not adjacency CVD — running the categorical validator on
a sequential ramp **will FAIL by design** (it spans the band; steps sit close), which
is expected, not a real failure; don't "fix" a good ramp to satisfy it.

## Snap-to-passing (any design system)

Given a customer's ramps and a desired order:
1. For each slot, pick the step whose OKLCH L sits in the mode's band and C ≥ floor.
2. Run the validator. For any adjacent pair below ΔE 12, nudge one slot ± a step
   (hold its hue, move its lightness) and re-run.
3. Repeat until the worst adjacent pair clears the floor. Function preserved, the
   customer's hues kept.

## Themes

The slot **order** is a separable, named choice — a *theme* — on the same hues and
the same six checks. Each design system names a default order and any alternates;
swapping themes tunes the mood without touching the method. A surface adopts one
theme and freezes it; never mix themes within a dashboard. (See `palette.md`.)

**Deriving an order when a system has no theme yet:** don't guess. Enumerate candidate
orderings of the system's hues, run the validator on each, and pick the one that
maximizes the *minimum adjacent* CVD ΔE. (Seeding from a known-good order by hue-family
analogy, then optimizing, is fine — this is exactly how the default in
`palette.md` was derived.)

## Status is fixed

Status never follows the theme — it is a small fixed scale (good → warning → serious
→ critical) with reserved meaning, on steps deliberately distinct from the categorical
slots so a status color never impersonates a series, and always paired with an
icon + label (on a light surface warning and serious sit below 3:1 by design —
the pairing is the mitigation). (Exact steps in `palette.md`.) The collision rule: when a series *means* good/bad (error rate, pass/fail) it wears
status tokens; when it's just "series 4" it wears categorical — never both in one chart.
