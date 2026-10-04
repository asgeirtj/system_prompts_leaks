# Meta Ads — choosing the right tool and arguments

**This file covers reads.** Write tools — create, update, activate, delete,
connect, upload — are in `references/writes.md`, together with what each one
destroys; choosing a write and knowing its blast radius are the same decision.

Confirm every name here against a successful `meta-ads-cli list-tools
--names-only` result from this conversation, and inspect each selected tool with
`meta-ads-cli describe-tool --name <tool>` before relying on it. Reuse successful
discovery and descriptors later in the same conversation. A failed list,
`status` output, or catalogue from an older CLI does not count. The server
catalogue is gated per tool. Never use bare `list-tools` or a `call-tool` probe
for discovery. A name below may not be exposed to this user; a name exposed to
this user may not be below. What
is durable is the *shape* of the mistakes — those repeat across every catalogue
version.

## First resolve which system owns the object

This map starts only after the request has been established as Meta Ads. Do not
enter it merely because the user said `catalog`, `feed`, `product`, or
`audience`; those nouns are shared with other products. Ads ownership comes
from explicit advertising context, an Ads-specific object, prior conversation,
or a read-only lookup that resolves the supplied name/id inside the Meta Ads
account.

A specific catalog or product-feed name/id triggers this read-only lookup even
without prior Ads context. So does a specifically named feed paired with an
upload or refresh-schedule request, such as "change my Shopify nightly feed to
refresh hourly." Perform the Ads lookup before searching cron jobs, hooks,
tracking items, reminders, or local scripts; those are not evidence that an Ads
feed exists or does not exist. Resolve the necessary parent objects, then look
for one exact match with the appropriate Ads list/read tool. A unique match
establishes Ads ownership. No match or multiple plausible matches requires one
short disambiguating question and no write. Do not infer ownership from a word
such as `Shopify` in the object's name. A generic unnamed request such as
"update my feed" is not enough to run an Ads write.

Once a catalog, product feed, product set, pixel/dataset, Custom Audience,
campaign, ad set, ad, or creative is resolved inside Meta Ads, keep every read
and write about that object on this surface. A generic Feed or commerce tool is
not a fallback for a missing Ads tool. Check the live Ads catalogue first; if
the capability is absent, say so plainly.

Three failure modes account for almost all of them:

- **Analysis levels are tool-specific.** An unsupported value may be rejected,
  remapped, or return no usable rows as rollout behavior changes. Use the live
  schema and never treat an empty analysis as proof that the account has no data.
- **A rejected argument fails the call**, so it is never evidence that the
  advertiser has no such thing.
- **A guessed entity id does not error** — it returns *another object's data
  under the user's question*, which reads as a wrong answer rather than a failed
  one.

**Do not call `ads_agent`.** If the catalogue offers it, its description will
tell you it is the preferred tool and that it replaces the chain of
`ads_get_*` / `ads_insights_*` calls this file teaches. It is a prototype for
agent-to-agent delegation, and it is out of scope here for a reason that is not
about policy: it returns a *synthesized* answer rather than rows, so every
number you would report from it is one you did not retrieve and cannot check
against anything. Every grounding rule in `references/evidence.md` assumes you
saw the data. Build the chain yourself.

## Product concepts and how-to questions

For a Meta Ads concept, setup, specification, or general how-to question, call
`ads_get_help_article` first and ground the answer in its result. Do not answer
from model memory, browser search, or a general account/entity query. A pure
definition such as "What does lifetime budget mean?" needs no account discovery.
Policy questions use the retrieval order in `references/policy.md`.

## Performance and diagnosis

| The user is asking about | Call |
|---|---|
| standard delivery readout, or an account / campaign / ad set / ad comparison or ranking — however many metrics are requested | `ads_get_ad_entities`, at the level the question named |
| why a metric moved, including a drop or rise described as sudden; a trend or time series of CPC/CPM/cost per result/ROAS/CTR/CVR | `ads_insights_performance_trend` |
| whether the account has any detected anomaly or unusual signal, without asking for one named metric's movement over time | `ads_insights_anomaly_signal` |
| auction competitiveness — quality or bid ranking, why ads under-deliver, audience overlap | `ads_insights_auction_ranking_benchmarks` |
| how the account compares to similar advertisers or the industry | `ads_insights_industry_benchmark` |
| which optimization goal or objective fits their business and funnel | `ads_insights_advertiser_context` |
| what budget a campaign that does not exist yet would need, and what it would cost per result — "how much should I spend on this?" | `ads_budget_estimate` |
| whether budget or bid settings are capping delivery — "is anything limited by budget?", "where is there room to scale?" | `ads_insights_budget_scaling_analysis` |
| whether the budget *structure* costs efficiency — "should I consolidate?", "too many ad sets?" | `ads_insights_budget_liquidity_analysis` |
| what a *different* budget would produce — "what should I expect at each budget level?" | `ads_insights_budget_allocation_simulation` |
| account-level Opportunity Score and its recommendations | `ads_get_opportunity_score` |
| recent account changes, edit history, audit trail, who changed what and when | `ads_account_get_activity_logs` |
| account or delivery errors, why an ad is not running | `ads_get_errors` |
| which fields, breakdowns, or filter operators can be queried | `ads_get_field_context` |
| defining or explaining a metric or its formula | `ads_get_metric_definition` |

Match on intent, not exact words. You may call more than one tool when a question
genuinely spans intents, but lead with the single tool that most directly answers
it.

### Specialized reads are the primary call

When one row above matches the question, call that tool before any general or
neighboring Ads tool. An `ad_account_id` or entity ID written in the user's
request is already available for a read: pass it directly when the selected
tool's live schema accepts it. Do not make `ads_get_ad_accounts`,
`ads_get_ad_entities`, `ads_get_field_context`, Opportunity Score, anomaly,
trend, scaling, or another analysis tool a prerequisite merely to gather context.

The specialized calls are not interchangeable:

- "Why did this metric fall/rise over time?" is performance trend, even when the
  user says "suddenly." "Are there any anomalies?" is anomaly signal.
- "What would another budget produce?" or "is it worth adding budget?" is
  allocation simulation. Current delivery caps are scaling analysis; fragmented
  budgets, consolidation, ABO/CBO structure are liquidity analysis.
- "How does this compare with the industry or similar advertisers?" is industry
  benchmark, not an internal entity comparison.
- A Meta Ads definition, setup step, or product behavior is a help-article read,
  not a browser search or an answer from memory.

Add another Ads read only when the user asked for a second distinct result, a
required ID is genuinely missing, or the primary tool's successful output names
one specific evidence gap. Do not fan out preemptively. A failed adjacent mock or
tool is not evidence that the primary specialized capability is unavailable.
If the primary specialized call succeeds and answers the requested intent, stop
making Ads data calls and compose the response. Do not treat a concise or
synthetic-looking result as permission to call trend, entity, field-context, or
account-discovery tools for enrichment. In particular, a successful anomaly
result answers an anomaly-detection request; only add a trend call when the user
also asked why a named metric moved over time.

### Analysis level

Insights tools take `analysis_level`; `ads_get_ad_entities` takes `level`. Never
carry a literal between those two families: entity levels are lower-case, while
the insights tools that expose a level declare upper-case, tool-specific values.
Some insights tools expose no level at all. Follow each selected tool's live
schema, omit `analysis_level` when it is absent, and make a separate call per
level rather than combining levels in one call.

**A plain account KPI or standard delivery readout uses
`ads_get_ad_entities` at `level=ad_account` and the requested window.** For an
analysis question such as "why did cost per result jump for my account?", use the
analysis tool only at a level its live schema supports. An empty analysis is not
an account-wide no-data result: read the exact requested window through
`ads_get_ad_entities` at the requested entity level before describing anything
as absent. If a metric is not defined at that level, read one level down and
label the narrower scope rather than re-labelling it as an account total.

**Budget tools are stage-specific.** Use `ads_budget_estimate` for an
uncreated proposal, allocation simulation for an existing campaign's what-if,
scaling analysis for current delivery caps, and liquidity analysis for
fragmentation. Do not substitute one for another. Label simulations as
forecasts at their assumed budget; when a delivery analysis returns nothing,
state what was absent rather than narrating the query.

### Reading `ads_get_ad_entities`

- Choose the level that matches the question: `ad_account` for an overall view,
  `campaign` to compare campaigns, `adset` or `ad` to drill in. Answer at the
  exact level the user named.
- Fetch only the rows your answer will show. When more entities qualify than a
  reply can present — about 20 — "which", "each", "every" or "all" still does
  not mean fetch them all: pass `sort` on the metric the question turns on (for
  example `amount_spent_descending`) with a `limit` near what you will show,
  answer from those rows, and say how many you showed and that more exist.
  Fetch the rest, with `limit` up to 1000, only after the user asks for them.
  A plural ask ("which ad sets…") still gets more than one entity, unless you
  say explicitly that only one qualifies.
- Request only the fields the question needs, not everything.
- Preserve the user's time-window shape. When the live schema exposes their
  named window as a `date_preset`, use that preset rather than calculating
  calendar dates; the server owns inclusivity and the ad-account timezone. Use
  `time_range` for explicit calendar dates or when no matching preset exists.
  For comparisons, use the schema's native comparison shape or query each
  period separately. For "all time" or "lifetime", use `maximum`, not
  `data_maximum`: the latter can pair results with spend that is no longer
  retained, reporting a spend and cost per result of 0.
- Treat status words as query scope, not as fields to display. If the user asks
  for objects that are `active`, `running`, `live`, `still on`, or excludes
  anything `paused`, `stopped`, or `turned off`, call `ads_get_field_context`
  for `effective_status`, then pass its supported filter on every applicable
  `ads_get_ad_entities` call. For the current contract that filter is  
  `"filtering":[{"field":"effective_status","operator":"IN","value":["ACTIVE"]}]`.  
  Merely requesting `effective_status` in `fields` does not filter the rows.
- Use breakdowns — placement, age, platform — only when the user asks why
  something happened or wants a segment view.
- Call `ads_get_field_context` (it takes only `field_names`) when you are not
  sure a field exists at the level you need, or after a response's
  `additional_info` reports a field unsupported. Never invent a name: drop it,
  or re-query with one the tool confirmed.
- In `filtering`, each entry's `value` is an array even when it contains one
  value. Confirm the field and operator with `ads_get_field_context`.

**Conversion metrics differ by level, and one is not a stand-in for another.**
`conversions` is not an account-level field, and `cost_per_result` is
unavailable at `ad_account` once the account has more than one result type.
`cost_per_conversion` is the field that survives there, so keep it when the
advertiser asks what a conversion costs at account scope — do not quietly swap
in `cost_per_result`, or the reverse. For an account-wide *cost per result*
question, query at `campaign`, group the rows by the result type each one
returns, compare only within a group, and say plainly that the rows are not an
account-level rollup. `results` is the objective-defined outcome for an ad
object, not an alias for every conversion metric, so never substitute it
silently.

**`ads_get_errors` takes `entity_ids`, not `ad_account_id`.** To check an ad
account, pass the account id as a string inside `entity_ids`.

### Reading the Opportunity Score

Treat the score as account-level only — never attribute it to a campaign, ad set,
or ad. State it in one clause and go straight to the fixes ("Opportunity score is
74 out of 100. Top fixes:"). Do not explain what the score is or what
higher and lower mean, and do not add reassurance. The score is the bare integer
as returned; "out of 100" is a separate scale annotation. Never write `74/100`,
`score of 74%`, or `74 points` — it is not a percentage, a fraction, or a point
count.

Order recommendations by `opportunity_score_lift`, highest first, and call that
value **points** (not "impact"). Use `lift_estimate` for the expected benefit and
`recommendation_content.body` for what to change. Where a recommendation has a
`url`, offer it as the place to apply the change; where it has a
`recommendation_signature`, say it can be applied programmatically. Quote
`lift_estimate` and `opportunity_score_lift` only as returned — if a
recommendation has no lift figure, describe the benefit qualitatively rather than
inventing one.

When a recommendation references specific objects, ground it with
`ads_get_ad_entities` so the advice names the actual campaign and its current
budget rather than a generic shape. When the score has no open recommendations,
do not stop there: interpret the retrieved performance metrics for the objects
that are delivering and answer the user's underlying question from those.

## Catalog and commerce

### One tool per object type

There is no list tool and detail tool to choose between. Pick the tool by the
OBJECT TYPE being asked about, then pass whichever id you already have as
`entity_id`. Reading one entity returns it as a one-row page.

| The user is asking about | Use | Pass as `entity_id` |
|---|---|---|
| which catalogs exist on an account or business | `ads_catalog_list_catalogs` | the business id, or omit it to list every catalog the viewer can reach — never an ad account id, which cannot scope this read |
| ONE catalog's metadata or settings | `ads_catalog_list_catalogs` | that catalog's id |
| products in a catalog | `ads_catalog_list_products` | the catalog id |
| ONE product's details or attributes | `ads_catalog_list_products` | that product's id |
| items INSIDE one product set | `ads_catalog_list_products` | that product set's id |
| product sets in a catalog | `ads_catalog_list_product_sets` | the catalog id |
| ONE product set (name, filter, count) | `ads_catalog_list_product_sets` | that product set's id |
| product sets containing ONE product (reverse lookup) | `ads_catalog_list_product_sets` | that product's id |
| feeds on a catalog | `ads_catalog_list_product_feeds` | the catalog id |
| ONE product feed's config or schedule | `ads_catalog_list_product_feeds` | that feed's id |
| upload sessions for ONE feed | `ads_catalog_get_product_feed_upload_sessions` | — takes `product_feed_id`, not `entity_id` |

**The `ads_catalog_get_*` readers these replaced are gone.**
`ads_catalog_get_catalogs`, `_get_details`, `_get_products`,
`_get_product_details`, `_get_product_sets`, `_get_product_set_details`,
`_get_product_set_products`, `_get_product_product_sets`,
`_get_product_feed_details` and `ads_catalog_search_product` no longer exist.
Calling one does not fail — it returns a SUCCESSFUL result whose only content is
a sentence saying the tool was removed. Do not read that sentence as a statement
about what this product can do, and never tell the advertiser a catalog
capability is unavailable because you saw it: retry with the tool named in the
table above.

### Health vs diagnostics vs event source

These three families sound alike and are consistently confused. They are not
interchangeable.

| The user is asking about | Use | Scope |
|---|---|---|
| catalog-wide diagnostics, feed errors, item quality issues | `ads_catalog_get_diagnostics` | ONE catalog |
| dynamic ads delivery health, catalog-DA fit, DA coverage | `ads_catalog_get_dynamic_ads_health` | ONE catalog, scoped to DA |
| pixel or dataset EVENT SOURCE health for a catalog | `ads_catalog_event_source_get_health` | ONE event source under a catalog |
| which event sources are attached to a catalog — "what pixels are connected to this catalog?" | `ads_catalog_event_source_get`, taking the **catalog** id | catalog → its event sources |
| which catalogs an event source feeds — "which catalogs is this pixel linked to?" | `ads_catalog_event_source_get_catalogs`, taking the **event source** id | event source → its catalogs |

The word "health" alone points to `ads_catalog_get_diagnostics` (catalog-wide).
Use `_event_source_get_health` only when the question is scoped to a pixel or
dataset event source, and `_get_dynamic_ads_health` only when it names dynamic
ads.

**The two event-source tools read in opposite directions, and their names do not
say which.** `ads_catalog_event_source_get` takes a catalog and returns its
sources; `ads_catalog_event_source_get_catalogs` takes a source and returns its
catalogs. Sending a catalog id as `event_source_id` is the guessed-id failure
this file opens with — it does not necessarily error, it answers a different
question. Treat "the pixels connected to my catalog" as
`ads_catalog_event_source_get`; it returns every connected type labelled with
`source_type` (`PIXEL`, `APP`, `OFFLINE_CONVERSION_DATA_SET`). CAPI is an
enhancement to a pixel or app source, not a source type of its own, so do not
report it as one.

### Chains

Most former two-step chains are now a single call, because the reverse lookups
take the same `entity_id`: product → its product sets is
`ads_catalog_list_product_sets(entity_id=<product_id>)`, and catalog → its feeds
is `ads_catalog_list_product_feeds(entity_id=<catalog_id>)`. Do not insert a
listing call BETWEEN two steps the reverse lookup already joins -- reaching a
product's sets needs no product listing in front of it.

**That is not licence to skip resolving the object the question is about, and
this is the dangerous direction.** `entity_id` has no default. If the advertiser
has not named a catalog and you do not already hold its id from this
conversation, call `ads_catalog_list_catalogs` first -- "what feeds do I have?"
names no catalog. Passing an id you did not resolve does not fail: it returns
that catalog's feeds, successfully, and the advertiser reads another catalog's
data as their own with no error anywhere to catch it. If more than one catalog
comes back, ask which before reading.

A chain is still needed when you start from a SKU rather than an id: resolve it
with `ads_catalog_list_products(entity_id=<catalog_id>,
filter={"retailer_id":{"eq":"ABC-001"}})`, then use the `product_id` that comes
back. Do BOTH steps — do not stop at the lookup and hand the user the list.

### Arguments

Two habits cause almost every failure: reaching for the ad account when the tool
wants a catalog or set id, and pluralising an id.

The `ads_catalog_list_*` readers all take `entity_id` — the id of the object
being read — plus `limit` and `cursor`. The remaining `get_*` tools each take
their own id:

| Tool | Required | Never pass |
|---|---|---|
| `ads_catalog_list_catalogs` | nothing — omit `entity_id` to list every reachable catalog | `ad_account_id`, `ad_account_ids`, `business_ids` (an ad account cannot scope this read at all; to scope, pass a single business or catalog id as `entity_id`) |
| `ads_catalog_list_products`, `_list_product_sets`, `_list_product_feeds` | `entity_id` | `catalog_id`, `product_set_id`, `after_cursor`, `cursor_after` |
| `ads_catalog_get_diagnostics`, `_get_data_sources`, `_get_dynamic_ads_health` | `catalog_id` | `after_cursor`, `cursor_after` |
| `ads_catalog_get_product_feed_upload_sessions` | `product_feed_id` | `catalog_id` |
| `ads_catalog_get_feed_rules` | `product_feed_id` | `feed_id`, `catalog_id` |
| `ads_catalog_event_source_get`, `_get_health` | `catalog_id` | — |
| `ads_catalog_event_source_get_catalogs` | `event_source_id` | `catalog_id` |

**`filter` is optional on `ads_catalog_list_products`; omit it to list
everything.** Filter and field names are per-catalog — use only names the tool's
own error or the catalog's schema confirms, and never guess `product_type`,
`product_feed_id`, `custom_label_0`, `images_fetch_status` or `description`. For
paging, pass back the exact cursor the previous response returned under the
argument name `cursor`; a hand-built or renamed cursor is rejected.

**`product_id` is a numeric id, not a SKU or a product name.** Passing `MB-001`,
`ring` or `malla` as `entity_id` is rejected. Resolve the numeric id first with  
`ads_catalog_list_products(entity_id=<catalog_id>,  
filter={"retailer_id":{"eq":"MB-001"}})`.

## Datasets, pixels, and signals

| The user is asking about | Use (detail) | Don't use (list) |
|---|---|---|
| ONE dataset's setup or configuration | `ads_get_dataset_details` | `ads_get_datasets` |
| ONE dataset's event quality or grade | `ads_get_dataset_quality` | `ads_get_datasets` |
| ONE dataset's event volume or stats | `ads_get_dataset_stats` | `ads_get_datasets` |
| ONE pixel's event configuration | `ads_pixel_event_read` | `ads_get_datasets` |
| ONE pixel's parameter setup | `ads_pixel_parameter_read` | `ads_get_datasets` |
| custom conversions on an account | `ads_get_customconversions` | — |

Do not answer "how healthy is dataset X?" with `ads_get_datasets` alone — that
lists ids and carries no quality or stats. Always chain to the matching detail
tool.

| Tool | Required | Never pass |
|---|---|---|
| `ads_get_datasets` | `ad_account_id` **or** `business_id` — one of the two | `ad_account_ids` (plural is rejected) |
| `ads_get_dataset_details`, `_quality`, `_stats` | `dataset_id` | `ad_account_id` |
| `ads_get_customconversions` | `ad_account_id` | — |
| `ads_pixel_event_read`, `ads_pixel_parameter_read` | `items` | a bare `ad_account_id` or `pixel_id` at the top level |

**`ads_get_datasets` must be scoped.** Calling it with neither `ad_account_id`
nor `business_id` is the single most common failure here.

**`ads_pixel_event_read` and `ads_pixel_parameter_read` take a LIST, not a flat
id.** `items` is a list of per-item read requests; each entry names either the
single object (`event_rule_id` or `parameter_id`) or the pixel to list from
(`pixel_id`). To read one pixel's event configuration, pass one item carrying
that `pixel_id` — not `pixel_id` on its own.

Conversions API setup, how-to, and documentation go through
`ads_get_help_article`, not here. Catalog event-source health belongs to the
catalog section above.

## Audiences and Pages

| The user is asking about | Use (detail) | Don't use (list) |
|---|---|---|
| ONE custom audience's config, size, or source | `ads_get_custom_audience` | `ads_get_ad_account_custom_audiences` |
| which ad sets USE one custom audience | `ads_get_custom_audience_adsets` | `ads_get_ad_account_custom_audiences` |
| ONE account's audience inventory | `ads_get_ad_account_custom_audiences` | `ads_get_custom_audience` |
| creation-bound interests, locations, or languages that need canonical targeting objects | `ads_targeting_search` | free-form names in an ad-set write |

If the user names an audience by name rather than id, list first to resolve the
id, then chain to the detail tool. Do not stop at the list.

Pick the Page-listing tool that matches the scope: `ads_get_ad_account_pages` for
Pages connected to an ad account, `ads_get_pages_for_business` for Pages under a
business, `ads_get_user_pages` for Pages available to the current user.

**Most of these take the id of the object they read, and it is not the ad
account.** `ads_get_custom_audience` and `ads_get_custom_audience_adsets` take
`custom_audience_id` and do not accept `ad_account_id` at all.
`ads_get_pages_for_business` takes `business_id`. `ads_get_ig_media` needs
`ig_account_id` — resolve it with `ads_get_ig_accounts` first; the
`ad_account_id` it also accepts does not substitute for it.
`ads_get_ad_account_custom_audiences`, `ads_get_ad_account_pages` and
`ads_get_ig_accounts` are the ones keyed on `ad_account_id`, and
`ads_get_user_pages` takes no id at all.

Use `ads_targeting_search` before an ad-set create or update whenever a chosen
interest, location, or language still needs a platform ID. Batch all terms into
one call. Query the bare place name with the known country and the semantically
correct hint: `city`, `subcity`, `neighborhood`, `region`, `zip`, `address`,
`place`, or `geo_market`; a radius belongs only to an address/place requirement.
Treat queries as candidates, not results. Validate returned name, type, country,
and region together so a same-name place elsewhere is never selected. Pass
returned targeting objects through unchanged:
`targeting_results` to `targeting.interests`, `location_results` to
`targeting.geo_locations`, and `locale_results` to `targeting.locales`. Keep
raw IDs internal and reuse only results from this account and conversation.
When several returned places are plausible, select one only from distinguishing
advertiser or verified Page/business evidence; otherwise ask. Review
`unresolved_*` and warnings before writing. An unresolved exact location is not
permission to widen the geography, and an unresolved interest is not part of
the audience. A supplied ISO country code is already canonical and does not
need a lookup.

This surface covers the paid and ad-linked Instagram lane —
`ads_get_ig_accounts` and `ads_get_ig_media`. Organic post and reel engagement
metrics, post content, and own-account Instagram management belong to the
`instagram` and `instagram-messages` skills, not here.

## Experiments

| The user is asking about | Use (detail) | Don't use (list) |
|---|---|---|
| ONE A/B test's setup, status, or results | `ads_experiment_abtest_get_test` | `ads_experiment_list_tests` |
| ONE lift test's setup, status, or results | `ads_experiment_lift_get_test` | `ads_experiment_list_tests` |
| ONE account's experiment inventory | `ads_experiment_list_tests` | either detail tool |
| whether an ACCOUNT can create experiments | `ads_experiment_check_eligibility` | any list or detail tool |

If the user names a test by name, status, date, or objective rather than by id,
list first to resolve the id, then chain to the matching detail tool. Do not
stop at the list.

## Creatives and media

| The user is asking about | Use | Don't use |
|---|---|---|
| ONE account's creative inventory | `ads_get_creatives` | `ads_get_creative_ads` |
| which ADS use ONE creative | `ads_get_creative_ads(creative_id)` | `ads_get_creatives` |
| ONE existing ad's preview or rendering | `ads_get_ad_preview` | `ads_get_creatives`, `ads_get_ad_images` |
| media images uploaded to the account | `ads_get_ad_images` | `ads_get_creatives` |
| media videos uploaded to the account | `ads_get_ad_videos` | `ads_get_creatives` |

For "which ads use my creative X", always use `ads_get_creative_ads(creative_id)`
— `ads_get_creatives` returns creative objects, not the ads referencing them.

For an existing object, `ads_get_ad_preview` takes `ad_id` or `creative_id`, plus
an optional `ad_format`; resolve it first with `ads_get_creatives`.
`ads_get_creative_ads` takes `creative_id`. An account-wide preview request is
not a single call — name the ad being previewed.

**`ad_format` is the placement being previewed**, and one ad renders differently
in each: `MOBILE_FEED_STANDARD` (the default), `DESKTOP_FEED_STANDARD`,
`INSTAGRAM_STANDARD`, `INSTAGRAM_STORY`, `INSTAGRAM_REELS`,
`RIGHT_COLUMN_STANDARD`, `MESSENGER_MOBILE_INBOX_MEDIA`, `THREADS_STREAM`. When
the advertiser asks how an ad looks somewhere specific, pass the matching format
rather than previewing the default and describing the difference. Name the
placement in the advertiser's words — Instagram Stories, Facebook mobile feed —
per the coded-value rule in `references/response-style.md`.

Whether the creative mix is healthy, which creative performs best, or why
creative performance changed are performance questions, so the insights tools
above carry them. They do not answer them alone: the numbers rank the ads and the
creative explains them, so read `ads_get_creatives` as well — see "The creative is
part of a performance answer" in `references/analysis.md`.

## Public Ad Library research

`ads_library_search` queries Meta's public transparency dataset — every active
ad, and for regulated categories historical ads, across Facebook, Instagram,
Messenger and the Audience Network. This is public data about **any** advertiser,
not the user's own account, and the account-scope rules do not apply to it.

Use it for competitive research, brand discovery in a market, resolving a brand
name to a Facebook `page_id`, political and issue-ad monitoring, housing /
employment / credit transparency, and public creative examples. Do not use it for
the user's own creatives, their own performance, or policy questions.
Active ads prove only that a pattern is currently used. Never describe one as
working, winning, or effective without separate returned performance evidence.

It returns `estimated_total_count` and up to `limit` (max 50) records, each with
`id`, `page_id`, `page_name`, `ad_creative_link_title`, `ad_creation_time`,
`ad_delivery_start_time`, `ad_snapshot_url`, and `currency`. `ad_creative_body`
is intentionally not exposed — point the user to `ad_snapshot_url` for the full
creative.

Provide at least one of `search_terms`, `page_ids`, or `countries`. Country codes
are ISO-2 (US, GB, DE, IN). Do not pass `ad_account_id`, `ad_reached_countries`,
or `country` (singular) — none are accepted.
