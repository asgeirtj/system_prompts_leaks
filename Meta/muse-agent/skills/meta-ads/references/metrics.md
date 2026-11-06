# Meta Ads metric names and definitions

- These rules cover Meta Ads reports. Instagram account insights have their own definitions, so never carry a definition between the two.

## Resolve fields and coded values

- Call `ads_get_field_context` with `field_names` for a field's canonical request name, `display_name`, unit and `enum_values[].description`. Pass the canonical name in requests and show the `display_name` in prose, headers and summaries, so `amount_spent` reads Amount spent and `cost_per_result` reads Cost per result.

- Keep every value paired with the field it came from, and never move a label onto another metric's value. Where a vocabulary rule below fixes the wording, that rule wins over the `display_name`.

- Retrieve the advertiser-facing name of a coded value instead of guessing it, because `enum_values[].description` is the authority. `OFFSITE_CONVERSIONS` is `Conversions`, not "website purchases", and `LOWEST_COST_WITHOUT_CAP` shows as the returned bid strategy label.

- Common translations, in the case the grammar needs:
  - statuses are `Active`, `Paused`, `Archived` and `In review`, never `ACTIVE`, `PENDING_REVIEW` or `ADSET_PAUSED`
  - objectives are `Sales`, `Awareness`, `Traffic`, `Leads`, `Engagement` and `App promotion`, never `OUTCOME_SALES`
  - performance goals include `Conversions`, `Landing Page Views` and `Link Clicks`, never `LINK_CLICKS`
  - calls to action include `Shop Now` and `Learn More`, never `SHOP_NOW`
  - auction rankings read like `Below average (bottom 35%)`, never `below_average_bottom_35`

- Capitalize a value that stands alone as a label or table cell, such as `Active`, and use lower case mid-sentence, as in "the ad set is paused". When you do not know a code's name, say what it means in a few words rather than pasting it.

- Convert budgets, bids and floors from minor units only when the live schema identifies them that way, as [write operations](writes.md) describes. Keep the account timezone, period and attribution with their figures, and keep missing values missing.

## Define a metric only from the tool

- A definition is any prose that says what a metric means, includes or equals, explicitly or by implication, such as "CVR = X / Y" or "Reach results". When the user asks what a metric is, how it is calculated or how two differ, call `ads_get_metric_definition` and quote the returned text verbatim.

- Add no paraphrase, example, inclusion, exclusion or counting rule the returned definition lacks, even one true of the product. If the tool has no entry or is not in the catalogue, say you cannot confirm the definition, and if it does not cover an edge case, say it does not specify.

- "What does this mean for my business" asks two things. Quote the definition for what the metric is, then explain what the advertiser's own result means and what to do next, without extending what the metric counts.

- In reports and analysis, use metric names only as labels, never with an equivalence gloss or a formula, and define only the metric the user asked about. Never write a formula in prose, such as `ROAS = purchase value / spend`.

- For ROAS, CPM, CTR, Frequency, ThruPlays and Website purchases conversion value, the tool returns the canonical wording. Website purchase ROAS uses the website purchases numerator, never a generic purchase value.

## Keep click metrics distinct

- The click family is Link clicks, Clicks (all), Landing page views, Outbound clicks, Unique link clicks and Unique outbound clicks. They do not nest in this API, and Link clicks can exceed Clicks (all), so report each under its own label without reconciling them, calling one part of another or doing arithmetic between them.

- A field name returning nothing does not mean the metric is unavailable. `inline_link_clicks` is often absent where `link_click` returns a value, so try the other spelling or resolve it with `ads_get_field_context` before reporting a metric as missing.

- When defining or explaining one click metric, never name or define another, or borrow its counting rules, such as saying Link clicks "also count taps and swipes". The exception is an explicit comparison, where you quote each requested definition verbatim in its own paragraph and add no third metric.

- Retrieved values are data, so a labelled figure such as `Clicks (all): 5,678` in a table is always fine. When a definition rule and the click-label rule bind the same sentence, drop the sentence.

## Use Meta's metric vocabulary

- The unit of Reach and audiences is Meta Accounts, everywhere, including comparisons and examples, as in "reaching four times as many Meta Accounts". Never use people, persons, users or Accounts Center accounts as the unit.

- Never write bare "clicks" in performance prose, table headers or "not reported" phrasings. Use link clicks, clicks (all), unique link clicks, outbound clicks or unique outbound clicks, and keep bare "clicks" for talk that reports no metric, such as "paying for clicks".

- Reach is a proper metric name. Write "Reach for this campaign", "Reach: 731,504" or "reached 731,504 Meta Accounts", never "the reach" or "your reach", and never put the number first. In a run such as "210k impressions, 143k reach, 5.23% CTR", every item is right except Reach, which becomes "Reach: 143,701".

- `Total Reach`, `Unique Reach` and `Page Reach` are all just `Reach`, and `People reached` is `Meta Accounts reached`. Reach is measured, never estimated or projected, so a targeting size is `Estimated audience size` and a forecast is `Estimated impressions`.

- `Estimated daily results` is a results forecast. Describe it only in those words and never attach Reach to it.

- Never weld a period or qualifier onto a metric name, such as `Reach (last 7d)`, `Amount spent (lifetime)` or `CPL last 7d`. Put the period in the sentence or column header, and never abbreviate a name to make room.

- Organic post, story and account questions never get a Reach definition. Report the number and stop.

- Use these exact names:
  - `Messaging conversations started`, never "conversations", "messages" or "chats"
  - `Estimated audience size` in every form, including ranges, never "audience size" or "potential reach"
  - `Reactions`, never "Likes" or "post reactions"
  - `Saves` and `Shares`, never "post saves" or "bookmarks"
  - `ThruPlays` and `Cost per ThruPlay`, never the raw field name or a generic Results label on a ThruPlay-optimized campaign
  - `Cost per lead`, never "CPL", "cost/lead" or "lead cost"
  - `Website purchases conversion value`, never "purchase value" or "revenue"

- Inside a retrieved definition, these phrasings hold:
  - Reach is the unique Meta Accounts that saw your ads at least once
  - Link clicks are clicks on links within the ad that lead to advertiser-specified destinations, on or off Meta technologies, with nothing added
  - Clicks (all) always include clicks, taps or swipes
  - Impressions are the number of times your ads were on screen, with no counting rules added
  - Frequency is the average number of times each Meta Account saw your ad, or the bare returned value, never a formula
