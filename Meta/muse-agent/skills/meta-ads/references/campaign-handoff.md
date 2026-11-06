# Publish or edit a created campaign

- Read this only after the advertiser chooses a delivery or editing action on a created campaign. [Execution](campaign-execution.md) owns the first success handoff.

## Show verified state

- Once the governing read or write has verified the current state, run `render-campaign-success --success-json` with the reviewed campaign name, integer ad-set and ad counts and the exact returned HTTPS Ads Manager URL when available. Pass the `data` object inside its returned `widget` unchanged as the arguments of `widget.create_list_widget`.

```json
{"campaign_name":"Holiday workshop","ad_set_count":1,"ad_count":1,"ads_manager_url":"https://adsmanager.facebook.com/adsmanager/manage/campaigns"}
```

- If the renderer rejects the URL, omit it so the renderer uses the canonical link. A presentation failure never justifies retrying a write, and a staged or draft result is not a successful creation, so report it as staged and stop before this handoff.

- When the card works, add no Markdown or bare link, IDs, signed URLs, settings recap, creative preview or artifact. The card has one link row, `Open in Ads Manager`, and the response around it owns only the short status sentence.

- After any verified edit, publication or pause, the response holds, in order, one short evidence-backed sentence on what completed and the current delivery and spend state, the Ads Manager card, and one `muse.create_options` menu of currently possible next actions. Keep the card and options together and end after the options, and never let "ask anytime", "let me know" or "say the word" replace them.

- Use a collective phrase such as "the campaign hierarchy" rather than joining returned names and type labels into repetitions such as "ad set ad set".

## While paused

- Put `Publish it so it can start spending at <budget and schedule>` first in the menu, then up to three actions the live tools and prerequisites support, such as revising creative or copy, changing budget or schedule, or adding a separately reviewed ad. Never offer speculative actions or `Keep it paused`, because leaving the menu untouched keeps it paused.

- This menu follows a successful pause and every edit to an already paused hierarchy. The status sentence says the hierarchy is paused and not spending, without repeating settings, counts, IDs, the link or option labels.

- A paused-edit choice records intent and goes through its normal planning, creative and write approvals. After each successful paused update, name the completed change in the status sentence, followed by the card and the current menu, making both widget calls before writing that sentence.

## Publish with a new approval

- Publishing is a new spending request. On its next turn, apply [write operations](writes.md) and the live activation schema, state the objects and spending consequence before the approval, and let the runtime approval gate every write.

- An `ACTIVE` or `PUBLISHING` result proves submission, not delivery. Say the campaign is live or delivering only after a later read proves effective delivery across campaign, ad set and ad, and never describe a daily budget as a hard one-day cap.

## After publication

- State the verified publication result without calling it live, reaching people, delivering or spending unless a later read proves it. When readback proves only active status, say something like "The publication completed and the campaign hierarchy is active, and delivery and spending are not yet verified."

- Then show the Ads Manager card and one menu of two to four supported actions, best first, such as checking review and delivery, reviewing performance once data exists, revisiting the budget with delivery evidence, pausing or preparing another reviewed ad. Never offer Publish again.

- A selection authorizes no write and runs on a later turn under its own rules, so never chain another action onto activation. Never claim future monitoring unless the advertiser separately asks for it and it is set up.
