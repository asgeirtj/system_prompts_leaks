# Stock watch

Dashboard reference. See the [catalog](../manifest.json) for revision-specific approval and eligibility.

## Question and fit

How has a selected security traded, and what do price, volume and scenarios show?

Adapt this reference when the evidence supports entity-first price and volume exploration or candlestick and range-position patterns. Borrow only the relevant pattern when the whole composition does not fit. An explicitly requested layout takes precedence.

## Preservation and adaptation

The public-demo candidate watchlist uses Costco, WM (Waste Management), Garmin, AutoZone, FedEx, Cintas, McCormick and Fastenal, with Costco selected first. This cross-sector composition avoids concentrating the demo on AI platforms, infrastructure partners or personality-led brands. It is an editorial demo choice, not an investment recommendation or brand/commercial clearance. Each company has at least four distinct, dated primary-source news/events cards; do not pad the carousel by splitting a release into several stories. Recheck the selection and news before public launch.

Candlestick/volume, price-derived annotations and trade-planning scenarios remain custom. News & events is a separate, dated primary-source snapshot linked to the selected company; it is not a live feed or evidence for the simulated price path. Day/year range positions use core Chart.

The desktop watchlist is an inset shared card, matching the supporting panels rather than a full-height divided rail. Its stock list and the security workspace have independent scroll regions within the shared viewport shell. On mobile the watchlist becomes a horizontal strip within the card, leaving the security workspace vertically scrollable. Market overview uses a shared card; supporting cards keep their intrinsic height instead of stretching to match a taller neighbor.

The middle column tops out at 960px. The three-column group centers together on wider screens, preserving 32px panel gaps rather than moving the sidebars apart. The shared top bar stays full-width; narrower layouts keep their existing breakpoints.

Replace the synthetic fixture with reviewed evidence. Preserve units, scope, grain and missing-value semantics; remove unsupported analyses rather than manufacture evidence. Do not copy gallery navigation or unrelated data.

Prepare privately from the plugin root with `node scripts/prepare-data-app.mjs --surface dashboard --example finance --output /absolute/new-directory`. Gallery launchers and prepared content share this directory's canonical authored implementation.
