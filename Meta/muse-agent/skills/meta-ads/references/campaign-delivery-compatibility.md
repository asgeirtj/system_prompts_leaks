# Campaign delivery compatibility

Use this gate while choosing delivery and again on the exact create arguments
before final review. It prevents a plausible setting in isolation from becoming
an invalid campaign when combined with the others.

Treat each ad set's business outcome, campaign objective, optimization goal,
destination, required signal or promoted object, and billing event as one
decision. Settle the tuple only when every leg agrees:

- the objective supports the optimization goal;
- the destination can produce the event being optimized;
- every required Page, form, messaging identity, dataset/pixel, and event was
  returned for the selected account and belongs to the intended role. No tool
  lists an account's apps, so an app ID and store URL come from the advertiser
  or an existing ad set's promoted object; never invent either;
- the promoted-object shape contains exactly the fields that goal and
  destination require; and
- the billing event and budget/bid level are supported by the same setup.

The plan must describe the result it actually optimizes. A plan cannot promise
purchases while optimizing visits, call a website visit an on-ad lead, or call
Page Likes a Traffic result. An upstream event is a different delivery path;
present and settle it as such rather than relabelling the advertiser's outcome.

## Common recommendation families

Use these families for ordinary recommendations. Codes are internal planning
values; use advertiser-facing names in responses.

| Intended result | Compatible delivery family |
|---|---|
| Awareness or reach | `OUTCOME_AWARENESS` with `REACH`, `IMPRESSIONS`, or another live-supported awareness goal |
| Website visits | `OUTCOME_TRAFFIC` with `LANDING_PAGE_VIEWS` or `LINK_CLICKS`, a verified website URL, and only tracking fields supported by that goal |
| Website purchases or conversion value | `OUTCOME_SALES` with `OFFSITE_CONVERSIONS` or `VALUE`, a website destination, and a returned eligible conversion source plus a supported event |
| Website lead conversions | `OUTCOME_LEADS` with `OFFSITE_CONVERSIONS`, a website destination, and a returned eligible conversion source plus the selected lead event |
| Instant-form leads | `OUTCOME_LEADS` with `LEAD_GENERATION` or `QUALITY_LEAD`, an on-ad destination, and the returned Page and form |
| Messaging conversations | An objective matching the stated outcome with `CONVERSATIONS`, a matching Messenger, WhatsApp, or Instagram Direct destination, and its returned identity; the creative uses the channel's message button and standard link per `campaign-creative.md`, never an advertiser-supplied URL |
| Page Likes | `OUTCOME_ENGAGEMENT` with `PAGE_LIKES`, the Page destination and returned Page; use a live-supported billing event, normally impressions |
| Post engagement | `OUTCOME_ENGAGEMENT` with `POST_ENGAGEMENT`, an on-post destination, and the returned Page/post or supported new-ad shape |
| Profile visits | `OUTCOME_TRAFFIC` with `VISIT_INSTAGRAM_PROFILE` or `PROFILE_VISIT` and the matching returned profile destination |
| Video views | `OUTCOME_AWARENESS` or `OUTCOME_ENGAGEMENT` with a live-supported video-view goal and destination |
| App installs or app events | `OUTCOME_APP_PROMOTION` with an app goal, app destination, and the advertiser-supplied app ID and store URL or event identity |
| Calls | A goal-matched objective with a live-supported call goal, phone destination, and returned Page/number inputs |

These are recommendation families, not a substitute for the current tool
contract. An account-gated or unlisted combination is settled only when current
tool evidence proves the complete combination and its required inputs. A field
being present in a schema does not prove that every combination using it is
valid.

## Rules the tuple does not show

These combinations pass every individual field check and are still rejected:

- **One goal per lowest-cost campaign budget.** When the campaign carries the
  budget with the lowest-cost bid strategy, every ad set in it, including one
  added later, uses the same optimization goal. Before adding an ad set, read
  the existing ad sets' goal; a different goal needs its own campaign.
- **A lifetime budget needs an end.** When the ad set's own budget or its
  parent campaign's budget is a lifetime budget, the ad set needs an end time
  more than 24 hours after its start. Read the parent's budget before adding an
  ad set to an existing campaign. Without an end date, ask for one; never
  switch the advertiser's lifetime budget to a daily one yourself
  (`references/writes.md` treats budget cadence as their decision).
- **An app ad targets the app's platform.** When the promoted object names an
  app, restrict targeting to that app's operating system: an App Store app is
  iOS and a Google Play app is Android. Leaving the operating system open is
  rejected as a mismatch. Take the value from the live schema or a targeting
  search, never a guessed string.
- **iOS 14+ attribution needs an iOS 14+ campaign.** Send the ad set's
  `campaign_attribution` (`SKAN` or `AEM`) only under a campaign created in
  this conversation with `is_skadnetwork_attribution: true`, or one the
  advertiser says is an iOS 14+ campaign. Reads cannot show that setting on an
  existing campaign, so otherwise omit it. Take field names from the live
  schema.

## Resolve incompatibility before pricing

When supplied values cross families, preserve each stated intent as a
constraint and show one bounded choice between executable paths. For example,
a request for website Traffic optimized for Page Likes becomes a choice between
website visits and Page Likes; neither setting silently overwrites the other.
Missing required conversion signals likewise becomes a choice between restoring
that measurement and accepting a clearly named upstream delivery path.

Until the tuple is compatible, keep it open. Do not price it, present a complete
strategy, plan creative against it, render final review, or call an Ads create
tool.

## Recheck the exact create arguments

After fetching the selected live create schemas, apply their conditional and
mutual-exclusion descriptions—not only their `required` arrays—to the exact
arguments. Confirm the campaign objective and budget ownership against every ad
set's optimization goal, destination, promoted object, billing event and bid
fields; then confirm targeting/placements, one creative family with all of its
identity/media/link requirements, and the intended ad-set/creative references.

The live descriptors win if this reference and the current contract differ.
Return to the earliest affected planning decision and obtain a revised approval;
do not rely on create-time defaulting or auto-correction, and do not use a
failed create as compatibility discovery.
