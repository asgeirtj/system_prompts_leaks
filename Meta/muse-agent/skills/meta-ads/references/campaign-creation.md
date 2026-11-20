# Create a complete Meta campaign

- Use this sequence for a new campaign with its ad sets, creatives and ads. Adding one child to an existing campaign is a standalone change under [write operations](writes.md).

## Load only the current stage

- Full research is the default. Before discovery, make sure the request explains what is being advertised or tested well enough to proceed without inventing how it works, and otherwise ask only the needed product or test questions in one natural turn.

- Use guided planning only when the advertiser explicitly asks to go step by step, and never ask which mode they want. Keep valid decisions when the mode changes.

- Load the first incomplete stage and nothing later:
  - the product brief, identity, research, delivery plan or plan approval uses [planning](campaign-planning.md), with [budget](campaign-budget.md) once the non-budget pricing inputs are stable, and ends when the whole plan is accepted
  - explicit step-by-step planning uses [guided planning](campaign-guided.md) and ends when its current choice is answered, with the budget accepted before creative
  - the creative plan, source preparation and media approval use [creative preparation](campaign-creative.md) and end when every prepared ad has passed the media gate
  - final review, paused creation, the first Ads Manager handoff and partial recovery use [execution](campaign-execution.md) and end when every reviewed object exists, is verified paused and the handoff is shown
  - a publish or edit action chosen after creation uses [handoff](campaign-handoff.md)
  - an account listed with `is_ads_mcp_write_disabled: true`, an account that rejected writes or a campaign the advertiser builds themselves uses [manual setup](campaign-manual-setup.md) in place of execution and handoff

- A strategy-only request stops once its plan is accepted, unless the advertiser asks to continue.

## Ask one decision at a time

- Keep one open decision. Full research stops only for a product brief, identity, a binding constraint, an advertiser-owned blocker, whole-plan approval, the creative source, media approval or final creation approval, and guided mode settles one consequential setting at a time.

- Use `muse.create_options` for every bounded choice. Ask related free-form facts together in plain text, and never replace a bounded approval with "say the word".

- Finish every read, background command, browser task and to-do for the decision first, and wait for a background result's automatic notification, because a polled result is not finished. Then call `muse.create_options` alone as the final tool call, never in parallel with another.

- After it returns, write the whole response, with all context and the question, then the returned `embed_token` alone on the last line, and stop. Never invent, abbreviate or print a placeholder token, and if the call fails, no options were shown.

- A tap submits only its `selectedText`, and an unambiguous typed answer to the same unchanged choice is equivalent. Neither answers any other question.

- These approvals stay distinct:
  - identity does not approve research or budget
  - strategy approval accepts only the delivery plan shown
  - a choice on one creative question does not approve the whole creative plan
  - a source action authorizes only that preparation
  - media approval accepts only the media shown, paired with the unchanged plan
  - final review authorizes only the unchanged paused hierarchy
  - publication is a later spending decision

## Confirm capabilities in order

- Follow the discovery rules in the [connector doc](../CONNECTOR.md), with names once, descriptors only for the current stage and `--agent-output` on ordinary calls. Never fetch create schemas during research.

- For full research, settle the product brief before discovery. Then resolve identity in order, with the account descriptor, the exact protected account listing, the account choice, the Page descriptor and then `ads_get_ad_account_pages` for that account, and only then the other reads.

- Resolve targeting after the objective and compliance, and price the budget after the final audience, geography, placements and structure.

- Creation needs `ads_get_ad_accounts`, `ads_get_ad_account_pages`, `ads_targeting_search` for any targeting not yet canonical, current input schemas for `ads_create_campaign`, `ads_create_ad_set`, `ads_create_creative` and `ads_create_ad`, and `ads_creative_upload_media` for new media after final approval. A creative schema read during the current creative stage can be reused, and existing Ads media references need no upload.

- If a required creation capability is missing, create nothing and show no final review or its options. Stay at plan or creative review, explain that creation is unavailable and offer only a supported revision.

- When an accepted placement-specific image plan is unavailable, explain the supported single-image alternative in plain words and ask whether to revise. Never downgrade the accepted plan silently, and remember that a capability never authorizes generation or upload.

## Track decisions in the conversation

- Keep the plan only in conversation state, never in memory, a file, a database record or a runtime API. Track these independently:
  - the account, Page and Instagram identity
  - goal, objective, optimization, destination and tracking
  - compliance, geography, audience, placements and structure
  - budget amount and cadence with its basis, cost source and confidence, projected volume, schedule, planning mode and strategy approval
  - the creative plan, source, prepared media and media approval
  - final approval, returned IDs, handoff and delivery state

- Mark each decision settled, assumed or open. Settled values come from the advertiser or a successful result, a supported default stays assumed and is shown for approval, and an answer to one question leaves its siblings open.

- An execution-critical field with neither a settled value nor a safe default blocks strategy or final approval. Failed research is missing evidence, never a negative fact about the advertiser.

- When something changes, reopen only the decisions downstream of it:

```text
identity and destination
  -> tracking and objective
  -> compliance
  -> audience, structure and placements
  -> budget
  -> strategy approval
  -> creative plan
  -> prepared media
  -> final approval
```

- Keep unaffected work. Material drift during execution returns to the earliest invalidated decision, and repricing waits until the new inputs are stable.

- A draft is staged, not created. Conversational approval never overrides the runtime's own approval rules for each write.
