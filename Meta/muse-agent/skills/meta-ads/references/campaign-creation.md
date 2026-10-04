# Meta Ads — complete campaign creation

Use this controller for a new campaign hierarchy. Adding one child to an
existing hierarchy is a standalone write under `references/writes.md`.

## Route only the current stage

Full research is the default. Before capability discovery or identity
resolution, ensure the current request explains what is being advertised or
tested well enough to proceed without inventing how it works. Otherwise ask only
the necessary product- or test-scope questions in one natural turn. Minimize
intake only after this gate passes. `campaign-planning.md` owns identity,
advertiser-owned blockers, and evidence-backed outcome, optimization, target, or
spend choices. Use guided mode only when explicitly requested; never ask which
mode. Retain valid decisions across mode changes.

| Current need | Read now | Stage complete when |
|---|---|---|
| Full-research product brief, identity, research, delivery plan, or plan approval | `campaign-planning.md`; load `campaign-budget.md` after non-amount pricing inputs and advertiser constraints stabilize | All delivery decisions were presented together and accepted. |
| Explicit step-by-step planning or its separate budget steer | `campaign-guided.md`; load `campaign-budget.md` only when it directs | Its current steer was answered; budget is accepted before creative. |
| Creative plan, source preparation, or media approval | `campaign-creative.md` | The complete plan authorized its source action and every prepared ad passed the media gate. |
| Final review, paused creation, initial Ads Manager handoff, or partial recovery | `campaign-execution.md` | Every reviewed object exists, the campaign is verified paused, and the handoff is shown. |
| A selected post-create publish or editing action | `campaign-handoff.md` | The requested delivery-state or follow-up action is complete, or the campaign remains paused. |
| The account rejected writes as not available, or the advertiser will build it in Ads Manager | `campaign-manual-setup.md`, in place of `campaign-execution.md` and `campaign-handoff.md` | The accepted plan was handed over as a setup guide. |

Load only the first incomplete stage. A strategy-only request stops after its
plan is accepted unless the advertiser asks to continue.

## Decision and interaction contract

Keep one `next_open_decision`. Full research may stop only for a product brief,
identity, binding constraint, advertiser-owned blocker, whole-plan approval,
creative source, media approval, or final-create approval. Guided mode resolves
one consequential setting at a time.

Use `muse.create_options` for every bounded choice. Call it before writing any
advertiser-facing text (`SKILL.md` rule 19); text written before the call is
hidden commentary. After it returns, write the final response: all context and
the question, then its returned `embed_token` alone on the final line, and stop.
A tap submits only its `selectedText`; an unambiguous typed answer to the same
unchanged choice is equivalent. Neither answers another question. Ask related
free-form product facts together; never replace bounded approval with `say the
word`.

Render options only after every selected read, background command, browser task,
and todo for that decision is terminal. Once the token is sent, leave no pending
work that can resume before the advertiser answers. Never invent, abbreviate, or
print an `<embed_token placeholder>`; if `muse.create_options` fails, no options
were shown.

Complete entity resolution and every other tool first. Call
`muse.create_options` alone as the final tool call, never in parallel. After it
succeeds, compose the response with its exact token and call nothing else. A
polled background result is not terminal for this purpose; wait for its automatic
completion notification before creating the widget.

These approvals remain distinct:

- identity does not approve research or budget;
- strategy approval accepts only the shown delivery plan;
- a creative-axis choice does not approve the complete creative plan;
- a source action authorizes only that preparation;
- media approval accepts only the shown media paired with the unchanged plan;
- final review authorizes only the unchanged paused hierarchy; and
- publication is a later spending decision.

## Capability and research ordering

Follow the discovery contract in `SKILL.md`: names once, only current-stage
descriptors, and `--agent-output` on normal calls. Do not fetch later-stage
create descriptors during research.

For full research, establish the product brief before discovery. Then resolve
identity sequentially: fetch the account descriptor, run the exact protected
account command required by `SKILL.md`, select the account, fetch the Page
descriptor, and read `ads_get_ad_account_pages` for that account. Later reads
may proceed only after this scope is known. Targeting resolution follows
objective and compliance; budget pricing follows the final audience,
geography, placements, and hierarchy.

Ads Manager creation requires:

- `ads_get_ad_accounts` and `ads_get_ad_account_pages`;
- `ads_targeting_search` for a creation-bound interest, place, or language that
  is not already canonical;
- `ads_create_campaign`, `ads_create_ad_set`, `ads_create_creative`, and
  `ads_create_ad`, with every selected input schema current before final review;
  a creative schema read during the current creative stage may be reused;
- every identity, destination, format, and source required by those schemas;  
  and
- `ads_creative_upload_media` for each new accepted asset after final approval.
  Existing Ads references need no upload.

If a required creation capability is absent, create no partial hierarchy and
do not render final-create review or its approval options. Keep the flow at plan
or creative review, explain that execution is unavailable, and offer only a
supported revision.
When an accepted placement-specific static-image plan is unavailable, explain
the supported single-image alternative without exposing internal field names
and ask whether to revise. Never silently downgrade the accepted plan.
Capability does not authorize generation or upload; `campaign-creative.md`
owns those gates.

## Private strategy ledger

Keep the ledger only in conversation state—never `MEMORY.md`, a file, database
record, persisted strategy object, or runtime API. Track independently:

- account, Page, and Instagram identity;
- goal, objective, optimization, destination, and tracking;
- compliance, geography, audience, placements, and hierarchy;
- budget amount and cadence, derivation basis, cost source/confidence,
  projected volume, schedule, planning mode, and strategy approval;
- creative plan, source, prepared media, and media approval; and
- final approval, returned Ads IDs, handoff, and delivery state.

Classify each decision as `settled` (value, basis, provenance), `assumed` (safe
default and reason), or `open` (exact decision and who or what can resolve it).
Settle only fields explicitly supplied by the advertiser or supported by a
successful result. A supported skill-owned default remains `assumed` and must
be shown for approval; it is not evidence. An answer to one question leaves
omitted sibling fields open, and any execution-critical field with neither a
settled value nor a safe executable default blocks strategy or final approval.
Failed research is unavailable evidence, not a negative advertiser fact.

Invalidate only dependants:

```text
identity/destination
  -> tracking + objective
  -> compliance
  -> audience + structure + placements
  -> budget
  -> strategy approval
  -> creative plan
  -> prepared media
  -> final approval
```

Retain unaffected siblings and upstream work. Material execution drift returns
to the earliest invalidated decision; reprice only after new inputs stabilize.
A DRAFT is staged, not created. Sentinel remains the native write gate after
either form of conversational acceptance; no widget, artifact, typed reply, or
conversation state replaces it.
