# Choose a Meta Ads read

- This guide covers reads. Writes, and what each one destroys, are in [write operations](writes.md).

- The names here are an intent map, not a promise of availability. Confirm each in the conversation's discovery result and establish that the object belongs to Meta Ads, both as the [connector doc](../CONNECTOR.md) describes.

- For a named catalog or feed whose owner is unclear, resolve its parent objects, then look for one exact match with the matching list or read tool below.

## Avoid the common failures

- Three mistakes cause most failures:
  - analysis levels are tool-specific, and an unsupported value may be rejected, remapped or return no usable rows, so an empty analysis never proves the account has no data
  - a rejected argument fails the call, so it is never evidence the advertiser has no such thing
  - a guessed ID does not error but returns another object's data under the user's question

- Ads Intelligence (`ads_intelligence`, when live discovery lists it) can help diagnose the advertiser's question. Use it when the extra diagnosis is worth asking for because each call may need the advertiser's approval. Treat its figures and explanations as leads: check them against account data you retrieved yourself, and look into gaps or contradictions.

## Product concepts and how-to questions

- For a Meta Ads concept, setup step, specification or how-to, call `ads_get_help_article` first and ground the answer in it, never in memory, a browser search or an account query. A pure definition such as "what does lifetime budget mean?" needs no account discovery, and policy questions follow [policy retrieval](policy.md).

## Performance and diagnosis

- Pick the tool by intent, leading with the one that most directly answers:
  - a standard delivery readout, or a comparison or ranking of accounts, campaigns, ad sets or ads, however many metrics, uses `ads_get_ad_entities` at the level the question named
  - why a metric moved over time, including a drop or rise called sudden, or a trend of cost per result, CPC, CPM, CTR, conversion rate or ROAS, uses `ads_insights_performance_trend`
  - whether the account has detected anomalies, without one named metric's movement, uses `ads_insights_anomaly_signal`
  - auction competitiveness, quality or bid ranking, under-delivery or audience overlap uses `ads_insights_auction_ranking_benchmarks`
  - comparison with similar advertisers or the industry uses `ads_insights_industry_benchmark`
  - which objective or optimization goal fits the business and funnel uses `ads_insights_advertiser_context`
  - what budget a campaign that does not exist yet would need, and its cost per result, uses `ads_budget_estimate`
  - whether budget or bid settings cap delivery, or where there is room to scale, uses `ads_insights_budget_scaling_analysis`
  - whether the budget structure costs efficiency, such as too many ad sets, uses `ads_insights_budget_liquidity_analysis`
  - what a different budget would produce uses `ads_insights_budget_allocation_simulation`
  - the account's Opportunity Score and its recommendations use `ads_get_opportunity_score`
  - recent changes, edit history or who changed what and when uses `ads_account_get_activity_logs`
  - account or delivery errors, or why an ad is not running, use `ads_get_errors`
  - which fields, breakdowns or filter operators can be queried uses `ads_get_field_context`
  - defining a metric or its formula uses `ads_get_metric_definition`

- `ads_insights_industry_benchmark` compares delivered ad sets with their peers. Omit `entity_ids` for the whole account or pass campaign or ad-set IDs, because ad IDs return nothing, and never use it to size a launch, because peer comparison needs live delivery.

### Make the specialized read the first call

- When one intent above matches, call that tool before any general one. An `ad_account_id` or object ID in the user's request can go straight into the call when the schema accepts it, so never make account, entity, field-context, Opportunity Score, anomaly, trend or scaling reads a prerequisite for gathering context.

- The specialized tools are not interchangeable. "Why did this fall over time" is a trend even when the user says "suddenly", "any anomalies" is the anomaly signal, "what would another budget produce" is allocation simulation, current caps are scaling analysis, and fragmented budgets or consolidation are liquidity analysis.

- When the specialized read fully answers the request and further diagnosis would not help, stop and answer. When an anomaly check succeeds, add a trend read only if the advertiser also asked why a named metric moved.

- A concise or synthetic-looking result is no reason to enrich it with more reads. A failed neighboring tool does not show that the specialized capability is unavailable.

### Analysis levels

- Insights tools take `analysis_level` with upper-case, tool-specific values, while `ads_get_ad_entities` takes lower-case `level`, and some insights tools have no level at all. Never carry a value between the two families, omit an undeclared level, and make one call per level.

- A plain account KPI or delivery readout uses `ads_get_ad_entities` at `level=ad_account` for the requested window. An empty analysis is not an account-wide no-data result, so read the exact window through `ads_get_ad_entities` before calling anything absent, and when a metric is not defined at a level, read one level down and label the narrower scope.

- Budget tools are stage-specific. Estimation prices an uncreated proposal, allocation simulation models an existing campaign, scaling analysis checks delivery caps and liquidity analysis checks fragmentation, and simulations are labeled as forecasts at their assumed budget.

### Read `ads_get_ad_entities`

- Choose `ad_account` for an overall view, `campaign` to compare campaigns, and `adset` or `ad` to drill in, answering at the exact level the user named. Request only the fields the question needs.

- Fetch only the rows the answer will show. When more qualify than a reply can present, about 20, pass `sort` on the metric the question turns on, such as `amount_spent_descending`, with a `limit` near what you will show, say how many you showed and that more exist, and fetch the rest, with `limit` up to 1000, only when asked.

- A plural request still gets more than one object unless you say only one qualifies.

- Keep the user's window shape. Use a matching `date_preset` so the server owns inclusivity and the account timezone, `time_range` for explicit dates or a missing preset, and the schema's native comparison or one query per period for comparisons.

- For all time or lifetime, use `maximum`, never `data_maximum`, which can pair results with spend that is no longer retained and report a spend and cost per result of zero.

- Status words are query scope, not fields to show. For "active", "running", "live" or "still on", or to exclude paused objects, call `ads_get_field_context` for `effective_status` and pass its filter on every applicable read, currently `"filtering":[{"field":"effective_status","operator":"IN","value":["ACTIVE"]}]`, because requesting the field alone filters nothing.

- Use breakdowns such as placement, age or platform only when the user asks why something happened or wants a segment view.

- Call `ads_get_field_context`, which takes only `field_names`, when unsure a field exists at the level, or after `additional_info` reports one unsupported. Never invent a name, and in `filtering`, every `value` is an array even for one value.

- Conversion metrics differ by level. `conversions` is not an account-level field, and `cost_per_result` disappears at `ad_account` once the account has several result types, so keep `cost_per_conversion` for an account-scope conversion cost and never swap one for the other silently.

- For an account-wide cost per result, query at `campaign`, group rows by their returned result type, compare only within a group and say the rows are not an account rollup. `results` is the objective's outcome for an object, never an alias for every conversion metric.

- `ads_get_errors` takes `entity_ids`, not `ad_account_id`, so pass an account ID as a string inside `entity_ids`.

### Read the Opportunity Score

- The score is account-level only, never a campaign's, ad set's or ad's. State it in one clause as the bare integer "out of 100", never `74/100`, `74%` or "74 points", and go straight to the fixes without explaining the score or adding reassurance.

- Order recommendations by `opportunity_score_lift`, highest first, calling it points rather than impact. Use `lift_estimate` for the expected benefit and `recommendation_content.body` for what to change, quoting both only as returned, and describe the benefit qualitatively when no lift is given.

- Offer a recommendation's `url` as the place to apply it, and say one with a `recommendation_signature` can be applied here under the write rules. Ground a recommendation that references objects with `ads_get_ad_entities`, and when no recommendations are open, answer the underlying question from the delivering objects' results.

## Catalogs and commerce

- Choose the tool by object type and pass whichever ID you hold as `entity_id`, because reading one object returns a one-row page:
  - `ads_catalog_list_catalogs` lists catalogs, with a business ID as `entity_id` or none to list every catalog the viewer can reach, and reads one catalog's settings with its catalog ID
  - `ads_catalog_list_products` lists a catalog's products or a product set's items, or reads one product, by the matching ID
  - `ads_catalog_list_product_sets` lists a catalog's sets, reads one set, or finds the sets containing a product by that product's ID
  - `ads_catalog_list_product_feeds` lists a catalog's feeds or reads one feed's settings and schedule
  - `ads_catalog_get_product_feed_upload_sessions` reads one feed's upload sessions and takes `product_feed_id`, not `entity_id`

- An ad account can never scope `ads_catalog_list_catalogs`, so never pass it `ad_account_id`, `ad_account_ids` or `business_ids`.

- The old readers `ads_catalog_get_catalogs`, `ads_catalog_get_details`, `ads_catalog_get_products`, `ads_catalog_get_product_details`, `ads_catalog_get_product_sets`, `ads_catalog_get_product_set_details`, `ads_catalog_get_product_set_products`, `ads_catalog_get_product_product_sets`, `ads_catalog_get_product_feed_details` and `ads_catalog_search_product` are gone. Calling one returns a successful result saying it was removed, which says nothing about what the product can do, so retry with the matching tool above.

### Health, diagnostics and event sources

- Pick among these closely named tools by scope:
  - catalog-wide diagnostics, feed errors or item quality use `ads_catalog_get_diagnostics` for one catalog
  - dynamic ads delivery health or catalog fit for dynamic ads use `ads_catalog_get_dynamic_ads_health` for one catalog
  - a pixel or dataset event source's health uses `ads_catalog_event_source_get_health` for one source under a catalog
  - the event sources attached to a catalog use `ads_catalog_event_source_get` with the catalog ID
  - the catalogs an event source feeds use `ads_catalog_event_source_get_catalogs` with the event source ID

- "Health" alone means `ads_catalog_get_diagnostics`. Use the event-source health tool only for a pixel or dataset question and the dynamic ads tool only when dynamic ads are named.

- The two event-source lookups run in opposite directions, and their names do not say which. Sending a catalog ID as `event_source_id` answers a different question without an error.

- `ads_catalog_event_source_get` labels each connected source with `source_type`, which is `PIXEL`, `APP` or `OFFLINE_CONVERSION_DATA_SET`. The Conversions API enhances a pixel or app source and is never a source type of its own.

### Follow one object to the next

- Reverse lookups take the same `entity_id`, so a product's sets come from `ads_catalog_list_product_sets` with the product ID and a catalog's feeds from `ads_catalog_list_product_feeds` with the catalog ID. Never insert an extra listing between two steps the lookup already joins.

- That never licenses skipping the object the question is about. `entity_id` has no default, so when the advertiser named no catalog and you hold no ID from this conversation, call `ads_catalog_list_catalogs` first and ask which when several come back, because an unresolved ID returns another catalog's data successfully.

- Start from a SKU with `ads_catalog_list_products` using the catalog ID and `filter={"retailer_id":{"eq":"ABC-001"}}`, then use the returned numeric `product_id`. Do both steps rather than handing the user the lookup.

### Arguments

- The `ads_catalog_list_*` readers take `entity_id` plus `limit` and `cursor`, never `catalog_id`, `product_set_id`, `after_cursor` or `cursor_after`. Pass back the exact returned cursor as `cursor`, because a hand-built or renamed one is rejected.

- `ads_catalog_get_diagnostics`, `ads_catalog_get_data_sources` and `ads_catalog_get_dynamic_ads_health` take `catalog_id`, never `after_cursor` or `cursor_after`, and page only with a `cursor` their schema declares. `ads_catalog_get_product_feed_upload_sessions` takes `product_feed_id`, never `catalog_id`.

- `ads_catalog_get_feed_rules` takes `product_feed_id`, never `feed_id` or `catalog_id`. `ads_catalog_event_source_get` and `ads_catalog_event_source_get_health` take `catalog_id`, and `ads_catalog_event_source_get_catalogs` takes `event_source_id`.

- `filter` is optional on `ads_catalog_list_products`, so omit it to list everything. Filter and field names are per catalog, so use only names the tool's error or the catalog confirms, never guessing `product_type`, `product_feed_id`, `custom_label_0`, `images_fetch_status` or `description`.

- `product_id` is numeric, never a SKU or product name. Passing `MB-001` as `entity_id` is rejected, so resolve the numeric ID with the `retailer_id` filter first.

## Datasets, pixels and signals

- Use the detail tool for one dataset or pixel, never the listing alone:
  - one dataset's setup uses `ads_get_dataset_details`
  - one dataset's event quality uses `ads_get_dataset_quality`
  - one dataset's event volume uses `ads_get_dataset_stats`
  - one pixel's event configuration uses `ads_pixel_event_read`
  - one pixel's parameter setup uses `ads_pixel_parameter_read`
  - an account's custom conversions use `ads_get_customconversions`

- `ads_get_datasets` lists dataset IDs with no quality or stats, so chain to the matching detail tool. It must be scoped with `ad_account_id` or `business_id`, never neither and never `ad_account_ids`.

- The dataset detail, quality and stats tools take `dataset_id`, never `ad_account_id`, and `ads_get_customconversions` takes `ad_account_id`.

- `ads_pixel_event_read` and `ads_pixel_parameter_read` take `items`, a list in which each entry names an `event_rule_id` or `parameter_id`, or a `pixel_id` to list from. To read one pixel, pass one item carrying its `pixel_id`, never a bare `pixel_id` or `ad_account_id` at the top level.

- No tool creates a pixel or dataset or generates a Conversions API token, so follow the pixel section of [write operations](writes.md) rather than calling pixels unsupported. Conversions API setup and documentation go through `ads_get_help_article`.

## Audiences and Pages

- One Custom Audience's settings, size or source uses `ads_get_custom_audience`, the ad sets using one audience use `ads_get_custom_audience_adsets`, and an account's audience inventory uses `ads_get_ad_account_custom_audiences`. Resolve an audience named by name through the listing, then chain to the detail tool.

- `ads_get_custom_audience` and `ads_get_custom_audience_adsets` take `custom_audience_id` and never accept `ad_account_id`. `ads_get_ad_account_custom_audiences`, `ads_get_ad_account_pages` and `ads_get_ig_accounts` are keyed on `ad_account_id`.

- Use `ads_get_ad_account_pages` for Pages connected to an ad account, `ads_get_pages_for_business` with `business_id` for a business's Pages, and `ads_get_user_pages`, which takes no ID, for the current user's Pages.

- `ads_get_ig_media` needs an `ig_account_id` resolved with `ads_get_ig_accounts`, and the `ad_account_id` it also accepts is no substitute. These tools cover paid and ad-linked Instagram content, while organic posts, engagement and account management belong to the [Instagram connector](/opt/hatch/connectors/instagram/CONNECTOR.md).

- Resolve a creation-bound interest, location or language with `ads_targeting_search` before an ad-set write, as [targeting](campaign-targeting.md) describes. Free-form names never go into an ad-set write.

## Experiments

- One A/B test's setup, status or results uses `ads_experiment_abtest_get_test`, one lift test uses `ads_experiment_lift_get_test`, an account's experiment inventory uses `ads_experiment_list_tests`, and whether an account can create experiments uses `ads_experiment_check_eligibility`.

- Resolve a test named by title, status, date or objective through the listing, then continue to its detail tool rather than stopping at the list.

## Creatives and media

- An account's creative inventory uses `ads_get_creatives`, the ads using one creative use `ads_get_creative_ads` with `creative_id`, and uploaded images and videos use `ads_get_ad_images` and `ads_get_ad_videos`.

- To read an ad's copy, take its `creative_id` from `ads_get_ad_entities` at `level=ad`, then call `ads_get_creatives` with `creative_ids` and no `fields`, which returns every supported field, with the copy in `body`, `title`, `description` and `link_url`. The tool takes creative IDs, not ad IDs, and has no `object_story_spec` field.

- `ads_get_ad_preview` renders one existing ad from a resolved `ad_id` or `creative_id`, with an optional `ad_format` naming the placement. An account-wide preview is not one call, so name the ad being previewed.

- Formats include `MOBILE_FEED_STANDARD`, the default, `DESKTOP_FEED_STANDARD`, `INSTAGRAM_STANDARD`, `INSTAGRAM_STORY`, `INSTAGRAM_REELS`, `RIGHT_COLUMN_STANDARD`, `MESSENGER_MOBILE_INBOX_MEDIA` and `THREADS_STREAM`. Pass the format the advertiser asked about rather than describing how the default would differ, and name the placement in their words, such as Instagram Stories.

- Creative health, the best creative or why creative performance changed are performance questions for the insights tools, but numbers only rank ads. Read the creatives as well, because they are one of the few explanations the data can support.

## Public Ad Library

- `ads_library_search` reads Meta's public transparency data, every active ad and historical ads in regulated categories across Facebook, Instagram, Messenger and the Audience Network, for any advertiser rather than the user's account. Use it for competitive research, brand discovery, resolving a brand to a `page_id`, political and issue ad monitoring and public creative examples, never for the user's own creatives, performance or policy questions.

- An active ad proves only that a pattern is in use, never that it works.

- Provide at least one of `search_terms`, `page_ids` or ISO-2 `countries`, and never `ad_account_id`, `ad_reached_countries` or a singular `country`. It returns `estimated_total_count` and up to `limit` records, at most 50, each with `id`, `page_id`, `page_name`, `ad_creative_link_title`, `ad_creation_time`, `ad_delivery_start_time`, `ad_snapshot_url` and `currency`.

- `ad_creative_body` is not exposed, so point the user to `ad_snapshot_url` for the full creative.
