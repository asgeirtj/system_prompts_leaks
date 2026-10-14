# Campaign review and execution

Read this only after delivery strategy and creative are accepted, or while
recovering partial creation. Recheck coherence; material drift returns to the
earliest affected planning stage. Final review authorizes only the unchanged
paused hierarchy and never publication.

## Ground the executable request

Before final review, obtain the live input schemas for
`ads_create_campaign`, `ads_create_ad_set`, `ads_create_creative`, and
`ads_create_ad` with one `describe-tool --input-only` command per selected tool.
Reuse a schema fetched during the current creative stage unless a failure or
capability update made it stale. Fetch the upload schema too when approved new media must be uploaded.
Use only names present in the conversation's current compact discovery result.

Build each intended argument object strictly from those schemas. Before final
review, read and apply the pre-write gate in
`campaign-delivery-compatibility.md` to the
exact hierarchy and arguments, including every conditional or mutually
exclusive rule in the live field descriptions rather than only each schema's
`required` list. Never guess a
field, enum, conditional requirement, destination URL, identity, or media
reference, and never use a write or a validation failure to discover the
contract. A field absent from a selected schema is unsupported for this plan.
Optional fields default to absent. A known value does not authorize every
optional field that could carry it; include only the reviewed setting's mapped
field or a schema-required dependency.
Do not carry a field from another Ads tool merely because it is common there.
An existing object's read response cannot prove that a create-schema field is
optional; if current reads and the live create contract conflict, stop at that
contract gap rather than approving or probing a write.
If a required value cannot be obtained from the advertiser or a successful
read, return to the earliest open decision before requesting final approval.
Copy field names and enum values exactly from the live schema; never translate a
human label into a guessed provider value. An identifier is not a URL. Do not
construct a URL pattern from an ID unless the live schema explicitly defines
that transformation, or the ad set's `destination_type` is `MESSENGER`,
`WHATSAPP`, or `INSTAGRAM_DIRECT`, where `campaign-creative.md` gives the link.

Only when that tool's schema exposes `advertiser_request`, use the advertiser's
complete current multi-turn wording required by `SKILL.md`; never add an
assistant-written reconstruction.

Keep all campaign decisions and execution state in conversation context. Do
not call memory tools or persist campaign settings, IDs, media references,
attempts, or failures to `MEMORY.md` or another durable store.

The campaign, ad-set, and ad create tools enforce `PAUSED` server-side; a
creative has no delivery status. Follow each live schema and do not add a
`status` field when it is not exposed. Keep a private mapping from every
reviewed value to the exact argument that will create it, including:

- account, Page and optional Instagram identity;
- objective, optimization, destination, targeting, placements, and required
  special-ad-category declarations and countries, including
  `targeting_as_signal: 0` on every ad set of a housing, employment, or
  financial products and services campaign (why: the Special Ad Category
  section of `references/writes.md`);
- hierarchy, budget, currency and schedule;
- creative format, source, copy, CTA and disclosure; and
- all parent/reference dependencies that will come from successful results.

On every budget- or bid-bearing write whose schema exposes `account_currency`,
pass the exact currency returned for the selected account. Never infer it from
geography or silently convert an amount. Write budget at exactly one hierarchy
level: when the campaign carries its budget, omit ad-set budget fields; when ad
sets carry budget, omit campaign budget fields.

`render-campaign-summary --summary-json` accepts exactly `campaign_name`,
`goal`, `optimization`, `destination`, `structure` (`ad_set_count` and
`ad_count`), `budget`, `schedule`, `audience_and_geography`,
`audience_description`, and `placements`. Schedule declares an
`after_publishing` or scheduled start and a `no_end` or scheduled end, with a
time only for a scheduled boundary. Placements declares exactly one mode:
`automatic`, `platform_restricted` with platforms, or `manual` with positions.
Its values must describe the intended create arguments; do not use the renderer
to introduce or omit a material setting. Creative, category, and paused state
were already reviewed elsewhere and do not appear as summary rows.

Use this JSON shape, replacing only the values:

```json
{"campaign_name":"Holiday workshop","goal":"Awareness","optimization":"Impressions","destination":"https://example.com/workshop","structure":{"ad_set_count":1,"ad_count":1},"budget":"$10/day at campaign level","schedule":{"start":"scheduled","start_time":"December 1, 2026","end":"scheduled","end_time":"December 23, 2026"},"audience_and_geography":"United States","audience_description":"Broad Advantage+ audience","placements":{"mode":"automatic"}}
```

## Render final review

Call `meta-ads-cli render-campaign-summary` once with those exact settled
values, then pass its compact widget `kind` and `data` unchanged to  
`widget.create`.  
Create these exact options with `muse.create_options`:

- `Yes, create paused campaign`
- `No, make changes`

In the final response, place the review token first, ask `Proceed with this
campaign? It will be created paused. After success I'll give you a direct Ads
Manager link.`, then place the options token. Add no duplicate summary or
second question. The exact affirmative option or an unambiguous typed
instruction to create the unchanged reviewed hierarchy accepts this decision;
do not treat agreement to another decision as final approval.

## Create after approval

After that affirmative acceptance, execute only the reviewed arguments:

1. Upload each approved new asset with `ads_creative_upload_media`; retain only
   its returned account-owned media reference. Existing Ads references need no
   upload. Complete and verify every required upload before the first Ads-object
   write; media preparation is a gate, not work to parallelize with campaign
   creation.
2. Call `ads_create_campaign` once and retain its returned campaign ID.
3. Call `ads_create_ad_set` exactly once for each reviewed ad set with that
   campaign ID, and `ads_create_creative` exactly once for each reviewed
   creative with its approved identity/media. Run only dependency-independent
   calls in parallel.
4. Call `ads_create_ad` exactly once for each reviewed ad, only after its
   paired ad-set and creative IDs exist.

Creation succeeds when every expected campaign, ad set and ad create result
returns its ID and `status` `PAUSED`, and every creative create returns its ID.
Those successful create results are the verification; do not read the hierarchy
back after a clean create. Never infer a child's safe state from a paused
ancestor: each object's own result must show `PAUSED`. A `DRAFT` result is
staged, not created, and is reported under `references/writes.md`. An
unexpectedly `ACTIVE` create result is an immediate stop: pause it when an
exposed update can, then reconcile and report without creating descendants.
When a result that reports success lacks its ID or status, make one fresh read
of that object with the live read tool, fetching its schema first; that read is
reconciliation, not a retry. A missing object or non-`PAUSED` status after that
read blocks the success card and publication options.

Run every Ads operation as its own `exec` call. Never retry a create merely to
recover missing output. If an argument or material decision changes after
approval, stop, update only affected decisions, reprice when required, and
render a new final review.

`render-campaign-success --success-json` accepts exactly `campaign_name`,
`ad_set_count`, `ad_count`, and optional `ads_manager_url`. After verified
success, call it, pass its returned list widget unchanged to `widget.create`,
then show one `muse.create_options` menu.
Put `Publish it so it can start spending at <budget and schedule>` first and add
up to three currently executable paused edits supported by the discovered tools
and prerequisites. Do not offer `Keep it paused`; leaving the menu untouched
keeps it paused. In the final response, state in one short evidence-backed
sentence that creation completed and the hierarchy remains paused and is not
spending, then embed the Ads Manager card and the options consecutively. End
after the options. Do not repeat settings, hierarchy counts, IDs, the link, or
the option labels. Use a collective phrase such as `the campaign hierarchy`
rather than joining returned names and type labels. A prose invitation such as
`ask anytime`, `let me know`, or `say the word` never replaces the options.

## Failure and recovery

On failure, reconcile current Ads state before deciding whether another write
is safe. Report only objects proved to exist and their verified status, plus the
first incomplete stage. If local or generated media exists but no campaign,
ad set, creative, or ad exists, say `No Ads objects were created`, not `nothing
was created`.

Describe the returned failure without assigning an unproved provider, outage,
or infrastructure cause. Say when reconciliation occurred rather than claiming
each attempt was verified. Account-owned uploaded media is existing state even
when no delivery object was created.

Never say `everything validated`, `the last step`, or equivalent unless every
schema, identity, asset, argument, approval, write, and verification required by
that statement actually completed. A validation, schema, unsupported-shape,
missing-input, policy, or eligibility rejection requires corrected grounded
input or a supported revision; do not offer an unchanged retry. A local
pre-dispatch validation failure may be corrected from its exact diagnostic and
reissued because no write occurred. For an explicitly transient write failure,
or an ambiguous failure reconciled to no object, make at most one additional
dispatch for that intended object in the current turn. Reconciliation is the
safety prerequisite, not another retry allowance. If that retry fails, stop;
a later explicit request or changed environment may begin a new attempt only
after current state is reconciled.
