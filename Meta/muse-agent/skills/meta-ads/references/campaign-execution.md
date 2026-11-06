# Review and create the paused campaign

- Read this only after the strategy and creative are accepted, or while recovering a partial creation. Material drift returns to the earliest affected planning stage, and the final review authorizes only the unchanged paused hierarchy, never publication.

## Ground the exact request

- Before final review, fetch the live input schemas for `ads_create_campaign`, `ads_create_ad_set`, `ads_create_creative` and `ads_create_ad`, one `describe-tool --input-only` command per tool, plus the upload schema when new media must be uploaded. Reuse a schema from the current creative stage unless a failure or capability change made it stale, and use only names in the conversation's discovery result.

- Build each argument object strictly from those schemas, then apply [delivery compatibility](campaign-delivery-compatibility.md) to the exact hierarchy and arguments, including every conditional or mutually exclusive rule in the field descriptions. Never guess a field, enum, condition, URL, identity or media reference, and never use a write or a validation failure to discover the contract.

- A field absent from a selected schema is unsupported for this plan, and optional fields stay absent unless they carry a reviewed setting or the schema requires them for it. Never carry a field over from another Ads tool because it is common there.

- A read of an existing object cannot prove a create field optional. If current reads and the live create contract conflict, stop at that gap rather than approve or probe a write.

- If a required value cannot come from the advertiser or a successful read, return to the earliest open decision before asking for final approval. Copy field names and enum values exactly from the schema, never translating a label into a guessed provider value.

- An identifier is not a URL. Never build a URL from an ID unless the schema defines that conversion or the ad set's destination is Messenger, WhatsApp or Instagram Direct, where [creative preparation](campaign-creative.md) gives the link.

- When a schema exposes `advertiser_request`, pass the advertiser's complete current wording across turns, never your reconstruction. Keep all decisions and execution state in the conversation, never in memory or another durable store.

- The campaign, ad-set and ad create tools enforce `PAUSED` on the server, and a creative has no delivery status, so add no `status` field the schema does not expose. Keep a private map from every reviewed value to the argument that creates it:
  - account, Page and optional Instagram identity
  - objective, optimization, destination, targeting, placements and required Special Ad Category declarations and countries, including `targeting_as_signal: 0` on every ad set of a housing, employment or financial campaign
  - structure, budget, currency and schedule
  - creative format, source, copy, call to action and disclosure
  - every parent and media reference that will come from a successful result

- On budget- or bid-bearing writes whose schema exposes `account_currency`, pass the selected account's returned currency, never inferred or converted. Write the budget at exactly one level, omitting ad-set budget fields when the campaign holds it and campaign budget fields when the ad sets hold it.

## Render the final review

- `render-campaign-summary --summary-json` accepts exactly `campaign_name`, `goal`, `optimization`, `destination`, `structure` with integer `ad_set_count` and `ad_count`, `budget`, `schedule`, `audience_and_geography`, `audience_description` and `placements`. Its values describe the intended create arguments without introducing or omitting a material setting, and creative, category and paused state were reviewed elsewhere.

- `schedule` has `start` as `after_publishing` or `scheduled` and `end` as `no_end` or `scheduled`, with `start_time` or `end_time` only for a scheduled boundary. A scheduled time must be an explicit date or time, never words like "immediately" or "on publish".

- `placements` has exactly one `mode`, which is `automatic`, `platform_restricted` with `platforms`, or `manual` with `positions`.

- Use this shape, replacing only the values:

```json
{"campaign_name":"Holiday workshop","goal":"Awareness","optimization":"Impressions","destination":"https://example.com/workshop","structure":{"ad_set_count":1,"ad_count":1},"budget":"$10/day at campaign level","schedule":{"start":"scheduled","start_time":"December 1, 2026","end":"scheduled","end_time":"December 23, 2026"},"audience_and_geography":"United States","audience_description":"Broad Advantage+ audience","placements":{"mode":"automatic"}}
```

- Call the renderer once with the settled values, and pass the `data` object inside its returned `widget` unchanged as the arguments of `widget.create_html_file_widget`. Then create `muse.create_options` with exactly these choices:
  - `Yes, create paused campaign`
  - `No, make changes`

- In the final response, place the review token first, ask "Proceed with this campaign? It will be created paused. After success I'll give you a direct Ads Manager link.", then place the options token, with no duplicate summary or second question.

- The exact affirmative option, or an unambiguous typed instruction to create the unchanged reviewed hierarchy, accepts this decision. Agreement to any other decision does not.

## Create after approval

- Execute only the reviewed arguments, in this order:
  - first upload each approved new asset with `ads_creative_upload_media` and keep only its returned account media reference, finishing and verifying every upload before the first Ads object write, since media preparation is a gate rather than work to run alongside creation
  - then call `ads_create_campaign` once and keep its returned campaign ID
  - then call `ads_create_ad_set` exactly once per reviewed ad set with that campaign ID, and `ads_create_creative` exactly once per reviewed creative with its approved identity and media, running only independent calls in parallel
  - finally call `ads_create_ad` exactly once per reviewed ad, only after its ad-set and creative IDs exist

- Creation succeeds when every campaign, ad set and ad result returns its ID and `status` `PAUSED`, and every creative returns its ID. Those results are the verification, so never read the hierarchy back after a clean create, and never infer a child's state from a paused parent.

- A `DRAFT` result is staged, not created, and is reported as [write operations](writes.md) describes. An unexpectedly `ACTIVE` result is an immediate stop, so pause it through an exposed update, reconcile and report, and create no descendants.

- When a success result lacks its ID or status, make one fresh read of that object with the live read tool, fetching its schema first, as reconciliation rather than a retry. A missing object or a non-paused status after that read blocks the success card and the publish options.

- Run every Ads operation as its own `muse.exec` call, and never retry a create to recover missing output. If an argument or material decision changes after approval, stop, update only the affected decisions, reprice when required and render a new final review.

## Hand off the paused campaign

- After verified success, call `render-campaign-success --success-json` with exactly `campaign_name`, integer `ad_set_count` and `ad_count`, and an optional returned HTTPS Ads Manager URL as `ads_manager_url`. Pass the `data` object inside its returned `widget` unchanged as the arguments of `widget.create_list_widget`.

- Then create one `muse.create_options` menu with `Publish it so it can start spending at <budget and schedule>` first and up to three paused edits the discovered tools and prerequisites currently support. Never offer `Keep it paused`, because leaving the menu untouched keeps it paused.

- In the final response, say in one short evidence-backed sentence that creation completed and the campaign hierarchy is paused and not spending, then show the Ads Manager card and the options together, and end. Repeat no settings, counts, IDs, link or option labels, and use a collective phrase such as "the campaign hierarchy" rather than joining returned names and type labels.

- A prose invitation such as "ask anytime", "let me know" or "say the word" never replaces the options. Later actions follow [handoff](campaign-handoff.md).

## Recover from failures

- On failure, reconcile current Ads state before deciding whether another write is safe. Report only objects proved to exist with their verified status, plus the first incomplete stage.

- Uploaded account media is existing state even when no delivery object exists. When media exists but no campaign, ad set, creative or ad does, say "No Ads objects were created", not "nothing was created".

- Describe the returned failure without an unproved provider, outage or infrastructure cause, and say when reconciliation happened rather than claiming every attempt was verified. Never say "everything validated" or "the last step" unless every schema, identity, asset, argument, approval, write and verification behind it completed.

- Some rejections name something only the advertiser can fix, such as no payment method or unaccepted Lead Ads terms. Tell them what it is and where to fix it, as [write operations](writes.md) describes. When they say they've fixed it, read the account or Page again before retrying.

- A validation, schema, unsupported-shape, missing-input, policy or eligibility rejection needs corrected grounded input or a supported revision, never an unchanged retry. A local validation failure before dispatch may be corrected from its exact message and sent again, because no write happened.

- After an explicitly transient write failure, or an ambiguous one reconciled to no object, make at most one more dispatch for that object, tracking attempts across turns as [write operations](writes.md) describes. Reconciliation is the safety step, not another retry, and if that retry fails, stop until a later explicit request or a changed environment, after reconciling again.
