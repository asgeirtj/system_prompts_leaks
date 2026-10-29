# Funnels

## Layout and values

For ordered conversion stages, `Chart` with `type: "funnel"` adapts to its own container width and stage count: at least 144px per stage uses the horizontal ribbon, 120–143px uses compact horizontal typography, and less uses vertical stage rows with proportional bars. All stages remain visible without horizontal scrolling. Preserve input order; do not sort stages by value. Ribbon thickness and bar length are proportional to the largest stage; the ribbon stays flat after the last stage. Missing counts leave gaps and zero values stay zero.

## Interaction and appearance

Labels and percentages show share of the first stage. Hover/focus adds only the exact value, previous → current conversion, and signed absolute drop-off (or increase). Percentage measures retain exact percent and percentage-point units.  
Tap pins the details, with Done/tap-away dismissal and an explicit Ask action only where chart selection is permitted. Mouse/keyboard selection is unchanged.

Set `colors[y]` for one shared hue or `colors[stageName]` for stage hues. Tints start at the unmodified core hue and match editor swatches; vertical corners respect theme mark geometry. Image export includes all stages in the current layout.  
In Component Lab, choose Inventory → Chart → Funnel; the Example control includes sales, market-to-sales and product-activation specimens of this same component.
