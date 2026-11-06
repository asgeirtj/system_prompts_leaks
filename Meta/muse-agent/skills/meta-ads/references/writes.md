# Change Meta Ads account data

- Use this guide for standalone changes. A complete new campaign follows [campaign creation](campaign-creation.md), and every rule in [safety](safety.md), [account scope](account-scope.md) and [evidence](evidence.md) still binds a write.

## Before a write

- Name the affected objects, the before and after values, and the effect on spend, delivery or data. A confirmation sentence is prose, so write `Sales`, `Highest volume` and paused, never the codes, with one currency notation and thousands grouped.

- Clarify missing or ambiguous details, but add no separate chat confirmation when the request is clear. Explain the change and issue the write in the same response, because the call opens the runtime approval card and a "Want me to proceed?" question does not.

- By default, creating campaigns, ads, creatives, audiences, catalogs and pixel rules runs without a card, edits ask first, and publishing, starting an experiment and permanent deletes ask afresh every time. The user's settings can change this, so a missing card is never their consent, and an operation Muse does not recognize, even a read, asks for a single-use approval every time it runs.

- A reason you give for a change is a claim, so its figure must come from a tool. A decision to scale, pause or reallocate is a ranking, so the count under the rate governs it.

- For multi-step work, report what succeeded and what remains.

## Resolve the object first

- Never guess which object the advertiser means. Resolve a named object to its ID, and for an indirect target such as "pause my worst performer", read the account, pick the object the data identifies and name it in the same message as the change.

- If several objects fit and nothing in the conversation breaks the tie, ask. "The newest", "the largest" or "the only active one" are not tiebreakers, and a supplied ID is still checked against the account, because a change on the wrong object cannot be undone by apologizing.

- When the account is listed with `is_ads_mcp_write_disabled: true`, send it no write at all, not even to find out. Explain as [manual setup](campaign-manual-setup.md) says, then give the exact setting and value to apply in Ads Manager, or plan a new campaign in full there.

## Prefer the reversible action

- Most destructive-sounding requests have a reversible form, and lead with it:
  - "remove this product" becomes `ads_catalog_update_product` with `visibility` hidden, rather than `ads_catalog_delete_product`
  - "turn this event off" becomes `ads_pixel_event_update` with `status=INACTIVE`, rather than `ads_pixel_event_delete`
  - "stop this running" becomes a pause through `ads_update_entity`

- Permanently delete only when the advertiser wants the thing gone. Never delete more than they named, because "clean up my catalog" or "tidy my pixel events" identifies no objects.

- Hiding applies to products only. "Remove this data source" or "stop importing from it" is `ads_catalog_product_feed_delete`, because deleting the feed is how importing stops, while changing when a feed fetches uses `ads_catalog_update_product_feed`.

- Disconnecting an event source is `ads_catalog_event_source_disconnect`. Undoing a rule created by mistake means removing it, not deactivating it, because the advertiser asked for it to stop existing.

## State the blast radius the card cannot

- Deleting a Custom Audience pauses every ad set using it. Read `ads_get_custom_audience_adsets` first, name those ad sets, and say plainly whether live delivery stops or nothing uses the audience.

- Deleting a product feed removes the products it supplied, while deleting a product set does not delete its products. Deleting a pixel event rule stops tracking that conversion from then on, keeping history but removing the signal from campaigns optimizing for it.

- If you did not check, say nothing about the blast radius. A generic warning such as "this will affect any live ad sets" reads the same whether five are live or none.

## Replace does not merge

- A Custom Audience `rule` replaces the old rule outright, and live ad sets on that audience immediately reach whoever the new rule matches. Send `rule` only when the advertiser asked to change who the audience matches, never with a rename or relabel.

- A feed rule's `params` replaces the whole object. Read the current rule and carry forward the parts the advertiser did not ask to change.

## Know what creation and editing do

- Read the returned `status` of anything you create. `PAUSED` means it exists and spends nothing, while `DRAFT` means it is staged and has not been created at all, so say which.

- Activation is a separate request with its own approval. It makes an object eligible for review and delivery, never proof that review finished or delivery began, so never activate as a follow-on to a create.

- Pixel event rules are created inactive, so say how to verify the rule fires and activate it once the advertiser confirms. A customer-list audience is created empty and reports no size until members are uploaded and processed, so never report a size of 0.

- Pausing stops delivery and spend. Resuming can start spending again, so resume only on an explicit request to turn something back on, never because a paused object performed well and never as a side effect of another change.

- "Sort that out" or "get it going again" does not name the action, and paused is often a deliberate choice. Say what resuming would cost, naming the daily budget and the account, and ask before proposing the write.

- Put the spend in your own words before the card, because an activation card cannot show the budget. "This would let delivery restart at an average daily budget of ARS 1,503.47" makes the approval mean something, and a daily budget is never a hard one-day cap.

- On an active object, any `ads_update_entity` change beyond a rename is force-paused by the server, returning `status` `PAUSED` with `status_forced_to_paused: true`. Say before the card that the change pauses the object and that turning it back on is a separate step.

- After the write, confirm the new value and the paused state, reading `status_forced_to_paused` rather than assuming. An explicit `ARCHIVED` or `DELETED` applies as sent, and a staged draft edit never pauses anything.

- `ads_update_entity` rejects `status: ACTIVE`, and resuming uses `ads_activate_entity`. Send deletion or archival with only `status` in `fields`.

- The forced pause is what this tool does, not Meta behavior in general. Answer as the thing making the change, so a question about raising a budget mentions the pause, not only learning resets and proration.

## Write only what the advertiser gave you

- Every field you write traces to the advertiser's words, the object's current value or a plan they told you to build. If you cannot say where a value came from, ask and hold the write.

- A question they skipped is not an answer, and a basis they named, such as "split it by inventory", is not met by an even split. A value you worked out, such as a daily budget divided from a monthly total, a currency read off the country or an objective picked from their industry, was never given, and stating the assumption before staging it is still the failure.

- Leaving a field off so the product applies its own default is not inventing, such as omitting `bid_strategy` or keeping Advantage+ Audience on. Proposing a value the advertiser can decline is an offer, not a write.

- A required field that carries no decision of theirs, such as `campaign_name` or `buying_type`, can take a clear name or the standard value, said aloud. `objective` is not one of those, because it follows from a stated outcome, so ask when none was stated.

- Budget is an ask, not an omission. A campaign created without one pushes the budget down to each ad set, so when you cannot source both the amount and the cadence from what they said, ask and wait.

- Never invent an event name, pixel ID, Page ID, App SDK ID or retention window. If no tool can resolve it, ask.

- When a budget looks like a typo against the current value, an order of magnitude out, confirm the number before proposing it.

## Budgets and currency

- Budgets, bids and minimums come back in minor units. Convert once and show one figure in the account's currency, never a cents integer or both forms, and a number without a symbol is in the account's currency, not dollars.

- A budget is in the account's currency, not the one the advertiser typed. When they name another currency, say which currency the account bills in, ask for the amount in it and stop, never reusing the figure, converting it or calling one amount equivalent to the other.

- `ads_budget_estimate` is the exception, because its `currency_conversion` is a retrieved value, as [campaign budget](campaign-budget.md) explains. No write tool converts anything, and which currency the advertiser meant is still a question.

- Pass `account_currency`, set to the `currency` that `ads_get_ad_accounts` returned, on any `ads_create_campaign`, `ads_create_ad_set` or `ads_update_entity` call that carries a budget or bid. The approval card uses it to place the decimal point.

## Report only what happened

- Until the approval comes back, the change is waiting. "It's created", "it's paused" and "it's set up" are false beside a pending card.

- Describe a status change by what the object was doing and what it does now, using running, paused, archived or in review. Write "it was running, it's paused now, so delivery and spend have stopped", never "Status went from ACTIVE to PAUSED".

- Say the state the tool reported, not the one you expect. Resuming restarts delivery and spend straight away, a new or edited object may sit in review first, and nothing is "not spending" unless the returned state says so.

- If a write returns an error, say the object was not changed and why, in plain words and no further than the error goes. A tool rejecting a field has not told you Meta forbids it.

- Never repeat an unchanged write after a deterministic rejection, such as an invalid or missing argument, a schema mismatch, an unsupported state, or a policy or eligibility decision. Correct the grounded input or offer a supported revision with any newly required approval.

- Never follow a failed write with a different write meant to compensate. A different route to the same outcome is a new proposal that waits for its own approval.

- An `Ads MCP Access Denied` rejection saying the account cannot create or modify ads through this interface is about the account, not the call. Every write to it will fail the same way for the rest of the conversation, so attempt no other, say nothing was changed, and explain as [manual setup](campaign-manual-setup.md) says after reading it.

- Sometimes rejections are caused by reasons only the advertiser can fix, such as unaccepted Lead Ads terms, an ad account temporarily restricted from this action, no ad access to a Page, no payment method, a restricted Instagram account, two-factor authentication or a security checkpoint, or a deleted boosted post. Tell the user what the issue is and where to fix it, then continue with whatever does not depend on it. Writes that depend on it will continue failing until the advertiser takes action. When the advertiser says they've fixed it, read the account or Page again before retrying.

- An ad set reaching any EU country needs `dsa_beneficiary` and `dsa_payor`, which `ads_create_ad_set` fills from the account's business name. With no business, the create is rejected as "No advertiser indicated", so ask who the ads promote and who pays, usually the same name, pass both and never drop the EU countries.

- A pixel write returns `results[]` per item and can partly succeed. Report which items applied and which did not.

- Fields such as `error_category`, `error_subcode`, `is_retryable` and the name of a failed step drive your retry decision and never reach the advertiser. Say which objects exist, which do not and what happens next, and never send them to Ads Manager to learn what the result already told you.

- `active_errors` appears only on drafts, and a draft does not exist yet. An empty list means nothing has failed validation so far, so on `status: DRAFT` say it is staged, that publishing creates it and that any listed errors must be resolved first.

## Retry and verify

- Retry once at most, and only when it is safe. An explicitly transient failure may be retried once, an ambiguous dispatch only after a read proves the write did not happen, and a deterministic rejection never unchanged.

- A local parsing, formatting or display failure after dispatch is not evidence the write failed. Read the object, and never resend a mutation because handling after it failed.

- Two failures on the same object end the attempts, whether in one turn or across several, and nothing counts them for you. When unsure how many there were, stop and report the last error, because hammering a rejected write has had accounts temporarily blocked from writing at all.

- Never work around a rejection by writing to a different object, such as re-budgeting the campaign after an ad-set budget was rejected, and never re-send a shape the server already rejected in this conversation.

- To verify final state, make one fresh read of each object after its last write, requesting every submitted field, the status field and any field the write can clear, such as `daily_budget` after setting `lifetime_budget`. Never assemble verification from separate responses or a write result's echoed request.

- If a requested field is absent, confirm its canonical name and repeat the complete read once. Then name exactly what was and was not verified, and report a staged or draft result as staged.

## Argument traps

- Read argument names from the input schema of the tool you are calling, never from its name, a neighboring tool or a response. `ads_update_entity` accepts `fields` and returns `updated_fields`, and sending the returned name once showed an advertiser the same approval card fifteen times while nothing changed.

- Never call a create, update, activate, delete, connect, upload, publish, boost or bid tool with dummy values to learn its shape. If the descriptor is unavailable or incomplete, stop without changing the account.

- These required arguments recur, and the live schema overrides them:
  - `ads_update_entity` takes `ad_account_id`, `entity_id`, `entity_type` and `fields`
  - `ads_activate_entity` takes `ad_account_id`, `entity_id` and `entity_type`
  - `ads_create_campaign` takes `ad_account_id`, `campaign_name`, `objective` and `buying_type`, plus `special_ad_categories` whenever one applies
  - `ads_create_ad_set` takes `ad_account_id`, `campaign_id`, `ad_set_name`, `billing_event`, `optimization_goal` and `targeting`
  - `ads_create_ad` takes `ad_account_id`, `ad_set_id` and `ad_name`
  - `ads_create_custom_audience` takes `ad_account_id`, `name` and `subtype`
  - `ads_update_custom_audience` and `ads_delete_custom_audience` take `custom_audience_id`
  - `ads_catalog_update_product` and `ads_catalog_delete_product` take `catalog_id` and `items[].retailer_id`
  - `ads_pixel_event_update` and `ads_pixel_event_delete` take `items`

- Writes spell the object `ad_set`, as in `ad_set_id` and `ad_set_name`, while read `level` arguments spell it `adset`. Product updates and deletes use the advertiser's SKU as `retailer_id`, never Meta's product ID.

- Catalog delete names are asymmetric, as in `ads_catalog_delete_product`, `ads_catalog_product_set_delete`, `ads_catalog_product_feed_delete` and `ads_catalog_product_feed_delete_rule`. Confirm the exact live name and never build one by pattern from a neighbor.

## Campaigns, ad sets, ads and creatives

- Rename, re-budget, reschedule or pause an existing object with `ads_update_entity`, and publish drafts or activate or resume an object with `ads_activate_entity`.

- Creatives cannot be edited in place. To change an ad's image, video, text, link or call to action, create a new creative with `ads_create_creative` and a new ad with `ads_create_ad`, and say the original ad keeps its status and keeps delivering if live, offering to pause it, or archive it in a paused hierarchy, as its own approved step. Any new media or copy follows the generation limits and image screening in [creative preparation](campaign-creative.md).

- A published ad set's pixel or conversion event, and a switch between daily and lifetime budget, cannot be edited. Offer a copy with the new setting through `source_adset_id`, or `source_campaign_id` for a campaign budget, and pausing the original as its own step.

- In draft mode, updates stay staged until publication. Check the result before saying a pause or other change took effect.

- Creation follows dependencies, from campaign to ad sets and from media to creatives to ads. A creative needs its uploaded `image_hash`, or a `video_id` with a thumbnail, and image and carousel creatives need a destination `link_url`, or for a message ad its channel's standard link in [creative preparation](campaign-creative.md), while an existing post's `object_story_id` replaces the media and is never combined with it.

- Give an ad exactly one creative source: an existing creative, an existing post, or a new creative spec.

- Before adding or copying an ad into an existing ad set, check that the ad fits it: read the ad set's optimization goal, destination and promoted object, and its campaign's objective. When it doesn't fit, for example a lead-form ad going into a website-traffic ad set, ask whether to adapt the ad to this ad set or put it in a new ad set that fits, under a new campaign when the campaign's objective doesn't support it, before creating anything. A rejection for an incompatible objective also reopens the plan with the advertiser rather than adjusting arguments.

- A complete campaign follows [execution](campaign-execution.md), with current schemas, final approval of the exact paused hierarchy, then the create tools in dependency order using only returned parent and media references.

- Declare a Special Ad Category on the write itself. `special_ad_categories` defaults to `[]`, so a housing, financial, employment or political campaign is created undeclared unless you set it, with `special_ad_category_country` where the geography calls for it and the values read from the live schema.

- For housing, employment and financial products and services, send `targeting_as_signal: 0` on every `ads_create_ad_set` in the campaign, because the default switches on detailed targeting those categories do not allow. Where no category applies, leave the argument alone.

- Duplicate with `source_campaign_id`, `source_adset_id` or `source_ad_id`, because a bare create named "Copy" is an empty shell the approval card cannot tell apart. Campaign and ad-set copies happen on the server, so you need not read the original first.

- `source_ad_id` copies the creative only in draft mode. Read the source ad's `creative_id` with `ads_get_ad_entities` and pass `creative` as `{"creative_id": "..."}` alongside it, which works in both modes.

- Read the parent campaign before composing an ad set. A campaign holding `campaign_daily_budget` or `campaign_lifetime_budget` runs campaign budget optimization, and its ad sets are rejected for carrying their own budget or bid strategy, or an `optimization_goal` that differs from their siblings'.

- Apply [delivery compatibility](campaign-delivery-compatibility.md) to a new ad set against the parent's objective, budget owner and bid strategy and its siblings' goal, exactly as for a new campaign.

- When the parent holds the budget and the advertiser asks for an ad-set budget, say the budget lives on the campaign, state its current amount and ask whether they want the campaign's budget changed as a separate decision. Never move their number onto the campaign yourself, because that re-budgets every other ad set, even when you say so first.

- Otherwise the ad set carries the budget, schedule, optimization goal and targeting. Describe its budget and schedule in your own words before proposing it, because those are what the advertiser is really approving.

- Take `optimization_goal` from the campaign's returned `valid_optimization_goals` or a comparable existing ad set, saying which. Send `billing_event: IMPRESSIONS`, use `destination_type` `ON_POST` for `POST_ENGAGEMENT` and `ON_PAGE` for `PAGE_LIKES`, and optimize video for `THRUPLAY`, not `VIDEO_VIEWS`.

- Copying `targeting` from a neighboring ad set invents an audience. Keep the broad Advantage+ Audience default, which needs no argument, and narrow only where the advertiser asked, resolving their places, interests and languages through [targeting](campaign-targeting.md), never a typed ID.

- Leave `bid_strategy` unset unless the advertiser asked for one. A cap strategy such as `LOWEST_COST_WITH_BID_CAP` without its `bid_amount` is rejected, and it places a bid they never asked for.

- When the advertiser wants to keep ads off some placements, for example for brand safety, recommend the placement exclusions in their ad account settings in Ads Manager when they cover those placements. Those settings can exclude Audience Network, Facebook right column and Facebook Marketplace, apply to every campaign, and keep Advantage+ placements everywhere else. You can't change them, so explain where to find them. Recommend the account setting first, and restrict the ad set only if the advertiser still wants that after hearing about it. For other placements, restrict them on the ad set. Either way, recommend keeping at least six placements on, but follow the advertiser's choice when they name fewer.

- Unnamed placements mean Advantage+ placements, so leave every placement field off and say so. A requested restriction goes inside `targeting` as `publisher_platforms` with matching `*_positions`, such as `"publisher_platforms":["facebook","instagram"],"facebook_positions":["feed"],"instagram_positions":["reels"]`.

- Never send the same restriction in the advanced `placement` argument as well, and never say placements were selected unless those fields were in the call.

- Multi-advertiser enrollment is `contextual_multi_ads.enroll_status` at the top level of a new inline `creative` on `ads_create_ad`. A new `object_story_spec` defaults to `OPT_OUT`, so send `OPT_IN` only on an explicit request.

- Reusing `creative_id`, `object_story_id` or `source_instagram_media_id` leaves enrollment unchanged, and this write cannot change it. Say so before creation and tell the advertiser what to check in Ads Manager.

## Custom Audiences

- Create with `ads_create_custom_audience`, rename, relabel or replace a website audience's rule with `ads_update_custom_audience`, and delete with `ads_delete_custom_audience`. Add or remove customer-list members with `ads_update_custom_audience_users`, hashed only.

- Changing which audience a campaign targets is an ad-set change, not available through these tools. Say so plainly, point to Ads Manager, and never substitute another write.

- `audience_name` carries the current name so the approval can label the target and changes nothing, while `name` sets a new name. Putting the current name in `name` reads as an unrequested rename.

- Each type needs its own input:
  - `CUSTOM`, a customer list, needs `customer_file_source`, which only the advertiser knows, and starts empty
  - `WEBSITE` needs a pixel, resolved with `ads_get_datasets`
  - `ENGAGEMENT` needs a Page or Instagram account, resolved with `ads_get_ad_account_pages` or `ads_get_pages_for_business`
  - `MOBILE_APP` needs the App SDK ID from the advertiser, never a store package name
  - `LOOKALIKE` needs an existing non-lookalike audience to model, and its geography is automatic, so never ask for a country

- Creating an audience spends nothing, and an audience no ad set targets does nothing. A new `CUSTOM` audience is empty, and filling it is the hashed upload below, not a trip to Ads Manager.

## Upload a customer list without exposing it

- `ads_update_custom_audience_users` is the only write whose arguments are other people's personal data. Never paste raw rows into a tool call, because a tool argument lives in the conversation transcript.

- Hash the list where the file already is:
  - ask where the list lives and read the file yourself, never asking the advertiser to paste rows into chat
  - normalize and hash in a script rather than in your own reasoning, trimming and lowercasing emails, keeping only phone digits with the country code, and lowercasing names without punctuation
  - SHA-256 each value and upload only the 64-character lowercase hex digests for `EMAIL` and `PHONE`
  - report counts of rows sent and rejected, and never echo a value, raw or hashed

- `EXTERN_ID` and `LOOKALIKE_VALUE` are not personal identifiers and are sent as they are.

- `customer_consent` and `customer_file_source` are the advertiser's attestations about their data. Ask and set what they answer, where the source is `USER_PROVIDED_ONLY`, `PARTNER_PROVIDED_ONLY` or `BOTH_USER_AND_PARTNER_PROVIDED`.

- Guessing the common value is a false statement made in their name. Leave unanswered consent unset, and because a `CUSTOM` audience requires its source, say you need it rather than guessing.

- This path suits a few hundred rows. For thousands, Ads Manager's file upload is the right tool, because it never routes the list through a conversation.

## Catalogs, feeds, product sets and products

- Create with `ads_catalog_create`, `ads_catalog_create_product_set`, `ads_catalog_product_create`, `ads_catalog_create_product_feed` and `ads_catalog_create_feed_rule`. When the advertiser names a new catalog, create it here rather than sending them to Ads Manager.

- Edit with `ads_catalog_update_catalog`, `ads_catalog_update_product`, `ads_catalog_update_product_set`, `ads_catalog_update_product_feed` and `ads_catalog_update_feed_rule`. Start a feed upload with `ads_catalog_create_product_feed_upload_session`, and connect or disconnect an event source with `ads_catalog_event_source_connect` or `ads_catalog_event_source_disconnect`.

- The permanent deletes are `ads_catalog_delete_product`, `ads_catalog_product_set_delete`, `ads_catalog_product_feed_delete` and `ads_catalog_product_feed_delete_rule`.

- A feed's refresh schedule is an ads setting owned by `ads_catalog_update_product_feed`. "Change my nightly feed to refresh hourly" or "fetch daily at 4am" never goes to a task, reminder or calendar tool.

- A feed rule is identified by `feed_rule_id` alone and a product set by `product_set_id` alone. When the advertiser has several catalogs, say which catalog you resolved the object from, because the approval cannot.

- Direct catalog product image fields accept only URLs, with no hash alternative, so they are unsupported here. Product destinations and feed URLs remain valid.

## Pixel events and parameters

- Start tracking a conversion with `ads_pixel_event_create`, which creates the rule inactive. Activate, deactivate or edit with `ads_pixel_event_update`, add or change a parameter extractor with `ads_pixel_parameter_create` or `ads_pixel_parameter_update`, and archive one with `ads_pixel_parameter_delete`.

- `ads_pixel_event_delete` permanently removes rules created in Events Manager (`USER_CONFIG`) and archives other rules. Never promise an undo.

- These writes take `items[]`, and one call can carry several changes across pixels. Send one item per change the advertiser named, never a convenient extra or one change split across calls, and say what a batch does as a whole when it is larger than they can easily check.

- Remove event rules one per call, explaining what each tracks, and stop at the first refusal or failure, reporting what was removed. Parameter archiving can use a batch.

- Read a rule with `ads_pixel_event_read` before removing it, and name its event type and the URL or button it fires on. A rule read does not return its `pixel_id`, so find the pixel through `ads_get_datasets` and per-pixel reads, or say you could not confirm it rather than guess.

- An event without parameters records only the event, so a Purchase without `value` and `currency` cannot be optimized or reported in money. When a conversion has an obvious value, say which parameters it needs and offer to add them.

- Extractors are `CSS` or `CONSTANT_VALUE` only. `CSS` reads the text of a matched element, never a URL fragment, an attribute or JavaScript state, so say when a value lives somewhere a selector cannot reach.

- Check `list-tools` before describing available connector capabilities, and use permitted connector operations by default. Use a permitted website path only when the advertiser explicitly requests it for the current task and the browser's privacy, security and approval requirements and platform-specific restrictions are satisfied. A connector failure is not permission to change routes.

- When a permitted setup step is unavailable and no permitted website path has been explicitly chosen, give instructions the advertiser can complete manually, grounded in retrieved connector help, and say what could not be verified. Policy and security refusals and approval requirements remain binding across browser, script, alternate-connector and manual routes. Provide official recovery steps only when the service identifies them.

- A Conversions API access token is a secret. The advertiser generates it and pastes it straight into their server or hosting settings, so never ask for it in chat.

## Other writes

- Standalone creative edits (`ads_creative_update`, `ads_creative_delete`), experiments (`ads_experiment_abtest_create_test`, `ads_experiment_abtest_update_test`, `ads_experiment_lift_create_test`) and boosts (`ads_boost_ig_post`) have no specific guidance here. The general rules still bind, so be correspondingly more cautious in what you propose.

- Creating an experiment schedules or starts the study and asks afresh every time. Cancelling one discards its results, while ending it early keeps them.

- Never call `ads_creative_upload_local_image`, `ads_finalize_local_ad_image_upload` or `ads_delete_local_ad_image`, which need a file picker this surface lacks, and never call `ads_log_ui_interaction`, which is app telemetry. New media goes through `ads_creative_upload_media` as the [connector doc](../CONNECTOR.md) describes.
