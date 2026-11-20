# Keep campaign settings compatible

- Check this while choosing delivery settings and again on the exact create arguments before final review. A setting valid on its own can still make an invalid campaign when combined with the others.

- Treat each ad set's business outcome, campaign objective, optimization goal, destination, required signal or promoted object, and billing event as one decision. Settle it only when every part agrees:
  - the objective supports the optimization goal
  - the destination can produce the event being optimized
  - every required Page, form, messaging identity, dataset or pixel, and event was returned for the selected account and fits its role
  - the promoted object has exactly the fields the goal and destination require
  - the billing event and the budget and bid level work with the same setup

- No tool lists an account's apps, so a Meta app ID, which differs from the store's numeric ID, and a store URL come from the advertiser or an existing ad set's promoted object.

- The plan describes the result it actually optimizes. It cannot promise purchases while optimizing visits, call a website visit an on-ad lead or call Page likes a traffic result, and an upstream event is a different delivery path to present and settle as such, never a relabeled outcome.

## Match the setup to the outcome

- Use these families for ordinary recommendations, keeping the codes in arguments and plain names in replies:
  - awareness or reach uses `OUTCOME_AWARENESS` with `REACH`, `IMPRESSIONS` or another live-supported awareness goal
  - website visits use `OUTCOME_TRAFFIC` with `LANDING_PAGE_VIEWS` or `LINK_CLICKS`, a verified website URL and only the tracking fields that goal supports
  - website purchases or conversion value use `OUTCOME_SALES` with `OFFSITE_CONVERSIONS` or `VALUE`, a website destination and a returned eligible conversion source with a supported event, sent as the promoted object's `pixel_id` and `custom_event_type`
  - website lead conversions use `OUTCOME_LEADS` with `OFFSITE_CONVERSIONS`, a website destination and a returned conversion source with the selected lead event, sent the same way
  - instant-form leads use `OUTCOME_LEADS` with `LEAD_GENERATION` or `QUALITY_LEAD`, an on-ad destination, a returned Page with `leadgen_tos_accepted` true as the promoted object's `page_id`, since lead ads run only on Pages that accepted the Lead Ads terms, and the returned form, which belongs to the creative rather than the promoted object
  - messaging conversations use an objective matching the stated outcome with `CONVERSATIONS`, the ad set's `destination_type` set to the Messenger, WhatsApp or Instagram Direct channel, only WhatsApp under `OUTCOME_LEADS`, and its returned identity, and the creative uses the channel's message button and standard link from [creative preparation](campaign-creative.md), never an advertiser URL
  - Page likes use `OUTCOME_ENGAGEMENT` with `PAGE_LIKES`, the Page destination and the returned Page, with a live-supported billing event, normally impressions
  - post engagement uses `OUTCOME_ENGAGEMENT` with `POST_ENGAGEMENT`, an on-post destination and the returned Page and post or a supported new-ad shape
  - profile visits use `OUTCOME_TRAFFIC` with `VISIT_INSTAGRAM_PROFILE` or `PROFILE_VISIT` and the matching returned profile destination
  - video views use `OUTCOME_AWARENESS` or `OUTCOME_ENGAGEMENT` with a live-supported video-view goal and destination
  - app installs or app events use `OUTCOME_APP_PROMOTION` with an app goal, an app destination and the advertiser's app ID and store URL or event identity
  - calls use a goal-matched objective with a live-supported call goal, a phone destination and returned Page and number inputs

- These families do not replace the tool contract. An account-gated or unlisted combination is settled only when current tool evidence proves the whole combination and its inputs, and a field appearing in a schema does not prove every combination using it is valid.

## Rules the fields do not show

- These combinations pass every field check and are still rejected:
  - one goal per lowest-cost campaign budget, so when the campaign holds the budget with the lowest-cost bid strategy, every ad set, including one added later, uses the same optimization goal, and a different goal needs its own campaign
  - a lifetime budget needs an end, so when the ad set's or its campaign's budget is lifetime, the ad set needs an end time more than 24 hours after its start
  - an app ad targets the app's platform, so targeting is restricted to the app's operating system, iOS for an App Store app and Android for a Google Play app, with the value taken from the live schema or a targeting search
  - the conversion event has to match the campaign objective, as the families above pair them, so when Meta rejects the event, offer an event the objective supports or a new campaign with the matching objective
  - iOS 14 and later attribution needs a matching campaign, so send the ad set's `campaign_attribution` (`SKAN` or `AEM`) only under a campaign created here with `is_skadnetwork_attribution: true`, or one the advertiser says is an iOS 14 campaign

- Read the existing ad sets' goal and the parent's budget before adding an ad set to an existing campaign. When a lifetime budget lacks an end date, ask for one, and never switch the advertiser's lifetime budget to daily yourself.

- Reads cannot show an existing campaign's iOS 14 setting, so otherwise omit `campaign_attribution`, taking field names from the live schema.

## Resolve conflicts before pricing

- When supplied values cross families, keep each stated intent as a constraint and offer one bounded choice between executable paths. Website traffic optimized for Page likes becomes a choice between website visits and Page likes, and neither silently overwrites the other.

- A missing conversion signal becomes a choice between restoring that measurement and accepting a clearly named upstream path. Until the combination is compatible, keep it open, and do not price it, present a strategy, plan creative against it, render the final review or call a create tool.

## Recheck the exact create arguments

- After fetching the live create schemas, apply their conditional and mutual-exclusion descriptions, not only their `required` lists, to the exact arguments. Confirm the objective and budget owner against every ad set's goal, destination, promoted object, billing event and bid fields, then the targeting and placements, one creative family with all its identity, media and link needs, and the ad-set and creative references.

- The live descriptors win when they differ from this guide. Return to the earliest affected decision for a revised approval, never rely on create-time defaults or corrections, and never use a failed create to discover compatibility.
