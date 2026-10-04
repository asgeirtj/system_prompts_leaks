# Campaign handoff

Read this only after the advertiser selects a post-create delivery-state or
editing action. `campaign-execution.md` owns the initial success handoff.

## Show successful creation

For a later re-render after the governing read or write flow has verified the
current state, run `meta-ads-cli render-campaign-success --success-json` with the
reviewed campaign name, integer ad-set/ad counts, and exact returned HTTPS Ads
Manager URL when available. Pass its widget `kind` and `data` unchanged to
`widget.create`. A staged or draft result is not successful creation, so stop
before this handoff and report it as staged. If the URL is rejected, omit it so
the renderer uses the canonical link. A presentation failure never justifies
retrying a write.

Use this JSON shape, replacing only the values:

```json
{"campaign_name":"Holiday workshop","ad_set_count":1,"ad_count":1,"ads_manager_url":"https://adsmanager.facebook.com/adsmanager/manage/campaigns"}
```

When the card works, never add a Markdown/bare link, generic `external_link`,
IDs, signed URLs, settings recap, creative preview, or artifact. The native card
has no header and one link row: `Open in Ads Manager`. The renderer intentionally
owns only this link card; the surrounding response owns the brief status sentence.

After any verified edit, publication/activation, or pause, the same final
response must contain, in order: one short evidence-backed sentence stating
what completed and the current delivery/spend state; the Ads Manager card; and
one `muse.create_options` menu of currently executable next actions. Keep the
card and options adjacent and end after the options. A prose invitation such as
`ask anytime`, `let me know`, or `say the word` never replaces the options.
Use a collective phrase such as `the campaign hierarchy` rather than joining
returned names and type labels into repetitions such as `ad set ad set`.

## While paused

Immediately beneath the card, show one `muse.create_options` menu. Put first:

- `Publish it so it can start spending at <budget and schedule>`

Add up to three currently executable actions supported by live tools and
prerequisites: revise creative/copy, change budget/schedule, or add a separately
reviewed ad. Do not offer speculative actions or `Keep it paused`; leaving the
menu untouched keeps it paused. This menu is required after a successful pause
as well as after an edit to an already-paused hierarchy. The status sentence
must say that the hierarchy is paused and is not spending. Do not repeat
settings, hierarchy counts, IDs, the link, or option labels.

A paused-edit choice records intent only and follows its normal planning,
creative, and write approvals. After each successful paused update, name the
completed change in that single status sentence, followed by the card and
current menu again; make both widget calls before writing that sentence.

Publish is a new spending request. On its next turn, apply `writes.md` and the
live activation schema, state objects and spending consequence in the native
approval surface, and let Sentinel gate every write. An ACTIVE or PUBLISHING
result proves submission, not delivery; call it live/delivering only after a
later read proves effective delivery across campaign, ad set, and ad. Never
describe daily budget as a hard one-day cap.

## After publication

State the verified publication result without calling it live, reaching people,
delivering, or spending unless a later read proves that state. Then render the
Ads Manager card and one `muse.create_options` menu with two to four supported
actions, best first: check review/delivery, review performance once data exists,
revisit budget with delivery evidence, pause, or prepare another reviewed creative/ad.
When readback proves only active status, use one sentence such as `The publication
completed and the campaign hierarchy is active; delivery and spending are not yet  
verified.`  
Do not offer Publish again. A selection authorizes no write and executes on a
later turn under its own read/write rules; never chain another action onto
activation. Do not claim future monitoring unless the advertiser separately
requests and configures it.
