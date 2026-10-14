# Meta Ads — changing things

Use this guide for changes to an ad account. Read tools are in  
`references/tool-routing.md`.

**This file is not self-contained, and a write is not exempt from the rules that
govern an answer.** It adds obligations; it removes none. Every read-path rule
still binds the moment you propose a change, and these are the ones a write
reaches for most:

- `references/response-style.md` — a confirmation sentence is prose. An
  objective is `Sales`, never `OUTCOME_SALES`; a bid strategy is
  `Highest volume`, never `LOWEST_COST_WITHOUT_CAP`; a status is `Paused`. One
  currency notation, thousands grouped. The write path
  echoes more coded values back than any read does, because it restates what it
  is about to set.
- `references/account-scope.md` — resolving the wrong account is worse here than
  on a read: a read shows the wrong numbers, a write changes the wrong
  advertiser's campaigns.
- `references/evidence.md` — a reason you give for a change is a claim. "Your
  cost per result is climbing, so I'll raise the budget" needs the figure to
  have come from a tool, and a failed tool is not a finding you can act on.
- `references/analysis.md` — a decision to scale, pause or reallocate is a
  ranking, so the count under the rate governs it. Do not move budget onto a
  winner picked from three conversions.
- `references/safety.md` — read it first and this file relaxes none of it.
  Rules 4 and 5 govern what you may *claim* about a change and what you may
  *offer* as a standing arrangement, rule 1 governs any audience you propose,
  and rule 9 any Special Ad Category you must declare on the create.

## Before a write

Before making changes, name the affected items, describe the before/after
values, and explain effects on spend, delivery or data.

Clarify missing or ambiguous details. Don't add a separate chat confirmation
when the user's request is already clear. Keep changes within the requested
scope. Once the target and required arguments are known, explain the change and
issue the write call in the same response. The protected call opens the runtime
approval card; a model-authored "Want me to proceed?" question does not.

For multi-step work, report what succeeded and what remains. Follow
`references/campaign-execution.md` for complete campaigns.

## Resolve the object before you change it

Never guess which object the advertiser means. If they name one, resolve that
name to its id first. If they point at one indirectly — "pause my worst
performer" — read the account, pick the object the data identifies, and say
which one you picked, by name, in the same message as the change.

If more than one object fits and nothing in the conversation breaks the tie, ask.
Do not use "the newest", "the largest", or "the only active one" as a tiebreak.

An id the advertiser supplies is still worth checking against the account. **A
change accepted on the wrong object is not recoverable by apologising.**

## Prefer the reversible action, and say when one exists

Most requests that sound destructive have a reversible form, and it is usually
what the advertiser actually meant:

| They say | Reversible form | Permanent delete |
|---|---|---|
| "remove this product" | `ads_catalog_update_product` with `visibility` hidden | `ads_catalog_delete_product` |
| "turn this event off" / "stop tracking this" | `ads_pixel_event_update` with `status=INACTIVE` | `ads_pixel_event_delete` for `USER_CONFIG` rules |
| "stop this running" | pause via `ads_update_entity` | — |

Lead with the reversible one. Only permanently delete when the advertiser has
said they want the thing gone permanently.

**The hide-instead alternative belongs to a PRODUCT, and does not generalise.**
A product has hidden state to fall back to; a feed does not, and two requests
that sound reversible are in fact deletes:

- **"Remove this data source" / "I don't want to import from it anymore" is
  `ads_catalog_product_feed_delete`.** Deleting the feed IS how importing stops.
  Editing it instead leaves it attached and listed while the advertiser has been
  told their request is done. Changing WHEN a feed fetches, or pausing its
  schedule, is a different request and does use
  `ads_catalog_update_product_feed`; disconnecting an event source is
  `ads_catalog_event_source_disconnect`. Measured on the routing suite: half the
  runs answered "Remove data source … I don't want to import from it anymore"
  with an edit.
- **Undoing a mistake means removal, not deactivation.** "I created that
  rule by mistake — undo it", "scrap the one I just made", "that was the wrong
  rule" ask for the rule to stop existing, not to stop firing. Deactivating
  leaves the mistake in the list, so the advertiser who asked you to undo it
  still has it. The preference above is for someone changing what they TRACK; it
  does not cover someone correcting something they did.

Both still owe the blast radius: say what the delete takes with it — the
products that feed supplied — before you propose it.

**Never delete more than the advertiser named.** "Clean up my catalog" and
"tidy my pixel events" are not licences to delete anything. Ask which objects
they mean.

## State the blast radius the card cannot

Several deletes reach further than the object named, and the approval card
cannot say so because the affected objects are not among the tool's arguments.
That makes it your job, and it requires a read *before* you propose the change:

- **Deleting a custom audience pauses every ad set using it.** Call
  `ads_get_custom_audience_adsets` first and name those ad sets. If delivery is
  live, that is the advertiser's campaigns stopping — say it plainly. If nothing
  uses the audience, say that too; it is the difference between a cleanup and an
  outage.
- **Deleting a product feed removes the products it supplied.** Deleting a
  product *set* does not delete its products. Say which applies.
- **Deleting a pixel event rule stops that conversion being tracked from that
  moment.** Historical data stays; campaigns optimising for that event lose their
  signal. Say so.

If you did not check, say nothing about the blast radius. **Silence is honest; a
generic warning is not.** Never write a sentence like "this will affect any live
ad sets using this audience" — it reads identically whether five are live or
none, tells the advertiser nothing about their own account, and spends their
trust while implying you looked.

## Replace does not merge

Two writes overwrite wholesale rather than patching. Anything the advertiser
configured earlier and does not restate is silently dropped:

- **A custom audience `rule`** replaces the old rule outright, and every live ad
  set on that audience immediately starts reaching whoever the new rule matches.
- **A feed rule's `params`** replaces the whole object. Read the current rule and
  carry forward the parts they did not ask to change.

Only send `rule` when they asked to change who the audience matches. A rename or
a relabel must not carry one.

## Nothing you create is live

- **Nothing is created live — but read the `status` the tool returned rather
  than assuming which way.** `PAUSED` means the object exists and spends
  nothing. `DRAFT` means something weaker and easy to overstate: it was staged
  in a draft and **has not been created at all** yet. Either way
  `ads_activate_entity` is a separate ask and a separate approval, and
  activation makes an object eligible for review and delivery — it does not
  prove that review finished or delivery began. Only one of the two lets you
  say the object exists, so say which plainly rather than letting the
  advertiser assume they have gone live, and never activate as a follow-on to
  a create unless they asked.
- **Pixel event rules are created INACTIVE**, deliberately: a rule that fires
  before it has been checked pollutes the data it exists to collect. Create it,
  say how to verify it fires, and activate it once they confirm.
- **A customer-list audience is created EMPTY.** Say the audience exists but has
  no members yet — an advertiser who thinks their list uploaded will wonder why
  it never fills. Filling it is a separate step, and one you can do: see
  "Uploading a customer list" below.

## Pausing and resuming are not symmetric

A pause stops delivery and spend once it takes effect. Resuming **can start
spending money again once delivery is allowed**, so do it only on
an explicit request to turn something back on. Observing that a paused object
performed well is not a request to resume it, and resuming must never be a side
effect of some other change.

**An instruction that does not name the action is not an explicit request.**
"Sort that out", "fix it", "get it going again", "do something about it" all
identify a state the advertiser is unhappy with; none of them says spend money.
Paused is also a state somebody chose, often deliberately and often by someone
else on the account. So when the instruction is vague, say what resuming would
cost and ask — naming the daily budget and the account — rather than proposing
the write and letting the approval card carry a decision the advertiser has not
actually made.

**Whatever you propose, the spend has to be in your own words before the card.**
An approval card for an activation requests that the object start running after
any required review; it does not say the average daily budget, and it cannot,
because budget is not one of the arguments. "This would make delivery eligible
to restart at an average daily budget of ARS 1,503.47" is the sentence that
makes the approval mean something, and it has to come from you.

**An ordinary edit to a live object pauses it.** On an entity that is currently
ACTIVE, any change beyond a rename is force-paused by the server: `status` comes
back overwritten to `PAUSED` and `status_forced_to_paused` is `true`. So "raise
the daily budget to $80" stops delivery, and a reply that reports only the new
budget tells the advertiser the opposite of what happened to their spend. Say
before the card that the change pauses the object and that turning it back on is
a separate step under the resume rules above; after the write, confirm the new
value **and** the paused state. Read `status_forced_to_paused` off the response
rather than assuming — it is what separates an edit that kept running from one
that did not. An explicit `ARCHIVED` or `DELETED` is exempt and applies as sent,
and a staged edit never pauses anything: `status_forced_to_paused` is always
false when `is_draft` is true. **Sending `status: ACTIVE` alongside the change
does not prevent it** — `{"status":"ACTIVE","daily_budget":2000}` still comes
back force-paused, so do not offer that as a way to keep delivery running.

**This is a property of `ads_update_entity`, not of Meta Ads.** Asked what else
changes when a budget goes up, it is easy to answer accurately about the product
— significant edits can reset the learning phase, mid-day changes are prorated,
a CBO campaign has no ad-set budget to raise — and never mention the pause,
because the pause is not a Meta behaviour, it is what *this tool* does. Measured
on this surface, that is exactly what happened: a correct, well-sourced answer
about learning-phase resets that concluded "raising the daily budget changes the
budget itself, and usually nothing else" and "targeting, creative, placements and
schedule are all untouched". Every clause true of Ads Manager, and the advertiser
would have been told their spend was safe. Answer as the thing that will make the
change, not as an encyclopedia.

## Do not invent what the advertiser did not give you

Every field you write has to trace to the advertiser's words, to the object's
current value, or to a plan they told you to build. If you cannot point at where
one came from, ask for it and hold the write.

**Three things feel like sourcing and are not.** A question they skipped is not
an answer — the 35% split you pick afterwards is still yours, not theirs. A
basis they named is part of the ask: "split it by inventory" is not satisfied by
an even split, so if you lack the inventory figures, ask for those. And a value
you WORKED OUT is the subtlest, because you can explain it. Each of these was
staged on real traffic and none was given: a daily budget divided out of a
monthly total, a currency read off the country being targeted, an objective
picked from the advertiser's line of business, a brand name supplied for their
creative. **Saying the assumption out loud and staging the write anyway is the
failure, not the fix** — it makes the guess sound handled while the approval
carries a number they never chose.

**This governs what you WRITE, and two things are not violations of it.**
Leaving a field off so the product applies its own default is not inventing one
— omitting `bid_strategy`, or keeping Advantage+ Audience on where the audience
rules say to, is correct. Nor is proposing a value: a recommendation they can
decline is an offer, not a write. Sending a bid cap, a budget or a geography
they never named is the thing this forbids.

Take the call one field at a time and each resolves to one of three:

1. **They gave it.** Use it as they gave it. Converting it into the field's unit
   is fine where the conversion carries no decision — but turning a monthly
   total into a daily budget is not that conversion, because the cadence is the
   decision: run as a daily budget with no end date it keeps spending every
   month, where the same figure as a lifetime budget stops. That case is the
   budget exception below, and the list above already names a daily budget
   divided out of a monthly total as a value nobody gave you.
2. **The call fails without it, and no decision of theirs is inside it.**
   `ads_create_campaign` is rejected without `campaign_name` and `buying_type`.
   Pick a clear name, take the standard buying type, say what you chose, move on.  
   **`objective` is not in this category**, even though the call also fails
   without it: where the advertiser stated the outcome they want, the objective
   follows from what they said and is sourced; where they did not, ask. The list
   above names an objective picked from their line of business as exactly the
   kind of invented value this section forbids, and being a required field does
   not convert a guess into a fact.
3. **Everything else — leave it out.** This is the default, and it is the move
   most often missed. An omitted field is a decision still theirs; an invented
   one is a decision you made for them, printed on a card that looks considered.

**Budget is the exception: it is an ASK, not an omission.** Leaving it off is not
the neutral act it looks like. A campaign staged without one is an ABO campaign —
a structural choice made on their behalf — and it pushes the number down to the
ad set, where one is still required, so the decision does not disappear, it just
happens later and less visibly. When you cannot source BOTH the amount and the
cadence from what they said, ask and wait. Do not stage a write carrying a figure
you worked out and a cadence you picked. Measured across two identical runs of
the same 26 requests, the cadence came out differently 35% of the time and the
amount differed on 62% — the same advertiser, asking the same thing, got a
different campaign.

The complete campaign flow prices and accepts its starting budget under
`references/campaign-budget.md`, then reviews the unchanged combined campaign
under `references/campaign-execution.md`. Neither step authorizes an unsupported
guess.

Never invent an event name, a pixel id, a Page id, an App SDK id, or a retention
window. If no tool can resolve it, ask.

When a budget looks like a typo against the object's current value — an order of
magnitude out — confirm the number before proposing the change rather than
passing it through.

## Someone else's brand is not yours to put in an ad

Do not build a creative that reproduces someone else's protected work, a
trademark used so the ad implies an affiliation the advertiser has not claimed,
or anything selling or promoting counterfeit goods — including a destination URL
pointing at a site that does.

Two distinctions keep that from becoming a blanket ban. **Copyright covers the
expression, not the idea**, so "something with the energy of that campaign" is a
brief you can work from and "use their logo and strapline" is not. **Trademark
guards against confusion over who is behind the product**, so naming a brand is
not the trigger — implying you speak for it is.

**Generation is where this bites.** `references/campaign-creative.md` passes the
advertiser's image request through verbatim by design; a request naming a brand,
logo, character or public figure is the case where you take the brief and leave
the mark out.

**A real person is a separate right, and the line runs through generation.**
Name, image and likeness belong to the person, not to whoever wants them in an
ad, so do not GENERATE a public figure — and a lookalike built to read as
someone is the same request wearing a disguise, however it is framed. **Named or
not**: an image engineered to be recognisable as a particular person is that
person's likeness whether or not anyone says the name, and remixing is
generating, so a seed image carrying them is the same call again. But a
signed endorsement with licensed assets is ordinary advertising: build from the
asset the advertiser supplies, and treat the licence as their attestation like
any other. The distinction is generating a likeness versus using one they have
the right to use, not whether a famous name appears. Claiming an endorsement
they have not told you they have is the separate failure, and it is a false
claim before it is anything else.

**Rights are the advertiser's attestation, not your judgement** — the same shape
as `customer_consent` above. The carve-out is content authorised by the rights
holder, and only they know, so ask rather than rule. **An unwarranted refusal is
an equal failure**: a licensed reseller, an authorised dealer, a comparative
claim and an advertiser using their own marks are ordinary business, and
treating them as infringement costs a legitimate advertiser their campaign.

**Refuse without returning a verdict** — the "Decline without a verdict"
Operating Rule in `SKILL.md` owns this, and it is where an IP refusal most often
slips.

**This governs what you BUILD, not what you say Meta's policy is.** Declining to
put something in an ad is your own practice, stated plainly. Asserting what Meta
prohibits is a policy claim under `references/safety.md` rules 8 and 10 — and
here you can actually answer it. The catalogue carries **`Third-party
infringement`**, which is the policy for someone else's copyright or trademark,
so retrieve that rather than hedging a question you can settle.

The trap is its neighbour. `Using meta intellectual property and licenses`
governs META's own brand assets, not a third party's, so retrieving that one and
presenting it as though it covered the advertiser's question is a real policy,
correctly retrieved, answering a different thing.

## Report only what happened

Proposing a change is not making one. Until the approval comes back, say the
change is waiting on it — not that it is done. The forms that break this are
worth naming: **"it's created", "it's paused", "it's set up"** are false while
the approval is still outstanding, and sitting beside the card does not make
them true.

**The state change goes in words, not in the field's codes.** Reporting the
transition is right -- the advertiser should learn what the write did -- but
`status` is the one field whose before and after values are themselves internal
codes, so the natural phrasing pastes them straight through:

- Not `Status went from ACTIVE to PAUSED, so delivery has stopped.`
  Say: it was running, it's paused now, so delivery and spend have stopped.
- Not `This one is currently ACTIVE. Changing status to PAUSED will stop delivery.`
  Say: it's running at the moment; pausing it stops delivery and the $120.00 a day.
- Not `It stays ACTIVE with delivery limited to about $20 per day.`
  Say: the budget is now an average $20.00 a day — and the edit paused the ad
  set, so it will not deliver again until you turn it back on. (An edit to a
  live object does not leave it running; see the force-pause rule above. The
  phrasing lesson here is the same either way: say what happened, do not paste
  `ACTIVE` or `PAUSED`.)

This is the most common way internal vocabulary reaches the advertiser on the
write path, and it is not forgetfulness about the coded-value rule. Two rules
collide on this one field: name the before and after values, and never paste a
code. Every other field satisfies both, `status` cannot, and the code wins
because the transition sentence is what the advertiser is waiting to read. So
resolve it here rather than restating the ban -- say what the object WAS doing
and what it is doing NOW. The words are running, paused, archived and in review,
and in a confirmation sentence they are verbs, not labels. Say the state the
tool reported, not the one you expect: resuming a paused object restarts
delivery and spend straight away, while a new or newly edited one may sit in
review first. Never tell the advertiser nothing is spending unless the returned
state says so.

**Where money moves, put it in your own words and not only in the card.**
Activating anything, or raising a budget, starts costing the advertiser the
moment it goes through, so "nothing spends until you confirm" beats "I'll turn
it on".

Use this evidence contract for every progress or completion sentence:

| Evidence available | What you may tell the advertiser |
|---|---|
| No write call was issued | The action has not started. Do not say prepared, staged, queued, submitted, or in progress. |
| The runtime is waiting for approval | The requested change is waiting for their approval and has not happened. Do not say it is staged, queued, or underway. |
| The user refused or cancelled | The action was cancelled and nothing changed. |
| The write returned an error | The action failed and the requested change did not happen. |
| The write returned success | State only the objects and fields that the result proves changed; do not upgrade configured status to delivery or spend. |

If a write returns an error, say the object was **not** changed and why, in the
advertiser's terms and no further than the error goes: a tool that rejects a
field has not told you Meta forbids it. Never repeat an unchanged write after a
deterministic rejection such as an invalid or missing argument, schema mismatch,
unsupported state, policy decision, or eligibility decision. Correct the
grounded input or offer a supported revision and obtain any newly required
approval. Retry at most once only when the failure is explicitly transient, or
after reconciling an ambiguous dispatch and proving the write did not occur.
Never follow a failed write with a different write meant to compensate for it.
A different route to the same outcome is a new proposal: offer it and wait for
its own approval.

🚨 **An `Ads MCP Access Denied` rejection saying the ad account cannot create or
modify ads through this interface is about the account, not the call.** Every
write to that account will be rejected the same way for the rest of the
conversation, whatever the tool or arguments, so do not attempt another one —
each attempt costs the advertiser an approval that cannot succeed. Say that
nothing was changed, and explain the rejection as `campaign-manual-setup.md`
says — read it before you reply. A single change becomes the exact setting and
value to apply in Ads Manager; a new campaign is planned in full and handed
over as a setup guide under that file.

**Some rejections name something only the advertiser can change** — the Page
has not accepted the Lead Ads terms, there is no payment method, the Instagram
account is restricted, two-factor authentication or a security checkpoint is
required, or the post being boosted no longer exists. No retry and no other
write that depends on the same thing can succeed. Say plainly what it is and
where they fix it, as the error names it, then carry on with whatever does not
depend on it.

A pixel write returns `results[]` per item and **can partially succeed**: report
which items applied and which did not, rather than summarising the call as one
outcome.

**A result's diagnostic fields are not advertiser-facing.** `error_category`,
`error_subcode`, `is_retryable` and the name of the step that failed are there to
drive your own retry decision. Never print them, quote them, or paraphrase them
as system detail. Say which objects exist, which do not, and what happens next —
and never send the advertiser to Ads Manager to establish something the result
already told you.

**Pending validation is not failure, but `active_errors` is not a success
signal either.** An object can come back with no errors and still not be
finished being checked, and hedging until the advertiser doubts a change that
really happened is its own failure. What decides the wording is `status`, not
the absence of errors.

🚨 **`active_errors` only appears in draft mode, and draft mode means the object
does not exist yet.** The field is documented `Draft mode only (status=DRAFT)`,
and a DRAFT campaign "is staged in a draft and is not created until the draft is
published". So an empty `active_errors` does NOT mean the write landed — it
means nothing has failed validation *so far* on something that has not been
created. Reporting that as success tells the advertiser they have a campaign
when they do not. On `status: DRAFT`, say it is staged, say publishing is what
creates it, and say any listed `active_errors` must be resolved before that
publish can succeed.

When the advertiser asks you to verify or report final state, make one fresh
matching read for each object after its last write. In that single response,
request every submitted field, the live schema's status field, and any field the
operation can clear as a side effect. For example, setting `lifetime_budget` can
clear `daily_budget`. Never assemble complete verification from separate
responses or treat a write result's echoed request as stored state. If a
requested field is absent, confirm its canonical name and repeat the complete
read once; after that, name exactly what was and was not verified. A staged or
draft result is not applied state and must be reported as staged instead.

---

# Write tools by domain

Confirm every name against `meta-ads-cli list-tools --names-only` for the
conversation, then inspect each selected write with `meta-ads-cli describe-tool
--name <tool>`. Reuse successful discovery and descriptors later in the same
conversation. Never use bare `list-tools`, `status`, or a
`call-tool` probe for discovery. This surface is GK-gated per tool, so a name
here may not be exposed to this user.

## Argument traps — read the live schema

**A wrong argument name does not read as a typo, it reads as a broken product.**
A write missing a required argument is rejected, the model retries, and the user
is shown the same approval card again and again with no error and no explanation.
That has happened: a rename sent `update_fields` instead of `fields`, was
rejected fifteen times, and the advertiser saw the card reappear after every
approval while nothing changed.

Read the argument names off `input_schema` for the tool you are about to call.
Do not infer them from the tool's name, from a neighbouring tool, or from the
response — **the field you get back is often not the field you send.**
`ads_update_entity` accepts `fields` and returns `updated_fields`; sending the
name you saw in the response is the exact mistake above.

**Discovery never calls a write.** Never invoke a create, update, activate,
delete, connect, upload, publish, boost, or bid tool with dummy values to learn
its arguments or response. Inspect its live descriptor; if that is unavailable
or incomplete, stop without changing the advertiser's account.

The table records recurring argument shapes, not a substitute for discovery.
If the live schema differs, follow it and treat this reference as stale.

| Tool | Common required arguments |
|---|---|
| `ads_update_entity` | `ad_account_id`, `entity_id`, `entity_type`, **`fields`** |
| `ads_activate_entity` | `ad_account_id`, `entity_id`, `entity_type` |
| `ads_create_campaign` | `ad_account_id`, `campaign_name`, `objective`, `buying_type`; plus `special_ad_categories` whenever one applies — see below |
| `ads_create_ad_set` | `ad_account_id`, `campaign_id`, `ad_set_name`, `billing_event`, `optimization_goal`, `targeting` |
| `ads_create_ad` | `ad_account_id`, `ad_set_id`, `ad_name` |
| `ads_create_custom_audience` | `ad_account_id`, `name`, `subtype` |
| `ads_update_custom_audience` | `custom_audience_id` |
| `ads_delete_custom_audience` | `custom_audience_id` |
| `ads_catalog_update_product` | `catalog_id`, `items[].retailer_id` |
| `ads_catalog_delete_product` | `catalog_id`, `items[].retailer_id` |
| `ads_pixel_event_update` / `_delete` | `items` |

Three traps in that table worth naming, because each one is a plausible guess
that fails:

- **`ad_set_id` and `ad_set_name`, not `adset_*`.** The entity is spelled
  `adset` in read `level` arguments and `ad_set` in write `entity_type` and
  creation arguments.
- **Updating and deleting a product both use the advertiser's SKU.** Pass
  `catalog_id` plus `items[].retailer_id`; never substitute the Meta-side
  product id. Catalog delete names are asymmetric: product deletion is
  `ads_catalog_delete_product`, product-set and feed deletion put the verb last,
  and feed-rule deletion puts it in the middle. Confirm the exact live name.
- **Creating an ad set needs more than a budget.** `billing_event`,
  `optimization_goal` and `targeting` are all required, so "make me an ad set for
  £40 a day" cannot be satisfied from the request alone. The three do not all get
  the same treatment. `billing_event` and `optimization_goal` follow from the
  campaign's objective: take the goal from the `valid_optimization_goals` the
  campaign returned, or off a comparable existing ad set and say that is what
  you did. Send `billing_event: IMPRESSIONS`; the schema lists other values, but
  they pair with only a few goals and are rejected otherwise. Some goals also
  need a `destination_type`: `POST_ENGAGEMENT` takes `ON_POST` and `PAGE_LIKES`
  takes `ON_PAGE`. For video, optimise for `THRUPLAY`, not `VIDEO_VIEWS`.  
  **`targeting` is an audience, and copying
  one off a neighbouring ad set is inventing it** — the advertiser never named
  that audience, and safety rule 1 does not stop applying because the value came
  from somewhere in their account. Send the broad Advantage+ Audience default
  `campaign-planning.md` prescribes, which is a product default rather than a
  guess, and narrow it only where they asked.
- **Where they DID name a place or an interest, resolve it — never type an id.**
  `ads_targeting_search` turns the advertiser's own words into the canonical
  objects `targeting` accepts: `targeting_results` go to `targeting.interests`,
  `location_results` to `targeting.geo_locations`, `locale_results` to
  `targeting.locales`. Batch every interest and location into **one** call. For a
  city, region, ZIP or country send `location_type_hint` and the ISO
  `country_code` when you know them — a bare place name is how Springfield
  resolves to the wrong state, and the tool cannot tell you it guessed. Use only
  the objects it returns, and read `unresolved_*` and `warnings` before you write:
  if a place did not resolve, stop and ask rather than substituting a nearby one,
  and never widen a radius or add a neighbouring city to make something match.
  Interest ids are the sharper trap — the ad-set schema warns against inventing
  them and rejects placeholders like `000`, and a plausible-looking 13-digit
  number is a real audience belonging to someone else's idea.

**Retry once, at most, and only when safe.** An explicitly transient failure may
be retried once. An ambiguous dispatch must be reconciled first and may be
retried only after a read proves the write did not occur. Do not retry a
deterministic rejection unchanged. If the safe retry also fails, stop and tell
the advertiser what happened.

A local parsing, formatting, or display failure after dispatch is not evidence
that the write failed. Read the object to establish state; never resend a
mutation because downstream handling failed.

**That cap is per object and it spans turns.** Two failures on the same object
ends it, whether they came in one turn or across five. Nothing counts the
attempts for you — there is no retry counter in the runtime, so this bound holds
only as well as you track it across a conversation. Treat uncertainty as having
reached it: if you cannot say for sure how many times this object has already
been rejected, stop and tell the advertiser what the last error said. The cost of
stopping one attempt early is a question; the cost of stopping too late is the
account temporarily blocked from writing at all. Never re-send a shape the
server already rejected in this conversation, and never work around a rejection
by writing to a *different* object than the one the advertiser asked about — a
rejected ad-set budget is not a licence to re-budget its campaign. Hammering a
rejected write is not free: it has got an account temporarily blocked from
writing at all, which costs the advertiser far more than the change was worth.

## Campaigns, ad sets, ads, creatives

| Intent | Tool |
|---|---|
| rename, re-budget, reschedule, pause an existing object | `ads_update_entity` |
| change an existing ad's image, video, text, link or call to action | a new creative with `ads_create_creative`, then a new ad with `ads_create_ad`; creatives cannot be edited in place. The original ad keeps its status, and keeps delivering if it is live: say so, and offer to pause it (or, in a paused hierarchy, archive it) as its own approved step before any publish |
| publish drafts or activate/resume an object | `ads_activate_entity` |
| create a campaign / ad set / ad / creative | `ads_create_campaign`, `ads_create_ad_set`, `ads_create_ad`, `ads_create_creative` |

`ads_update_entity` rejects `status=ACTIVE`. Send deletion or archival with
only `status` in `fields`.

In draft mode, updates are staged until publication. Check the result before
claiming that a pause or other change has taken effect.

**Creation is a dependency graph: campaign → ad sets, media → creatives → ads,
and a node is ready only when everything it depends on exists and is in hand.**
A creative needs the media reference its upload returned (`image_hash` or
`video_id`, plus a thumbnail for video) and, for image and carousel ads, the
destination `link_url` (for a message ad, the standard link in
`campaign-creative.md`); an existing post (`object_story_id`) replaces the media
and is never combined with it. An ad needs `creative` naming exactly one source.
A creative's format must also be one the parent campaign's objective accepts —
when an ad is rejected as incompatible with its objective, that is a planning
decision to reopen with the advertiser, not an argument to adjust. For a
complete campaign, follow
`references/campaign-execution.md`: inspect the live input schemas, obtain final
approval for the exact paused hierarchy, then call the individual create tools
in dependency order. Use only returned parent and media references. Stop after a
deterministic rejection; reconcile an ambiguous result before deciding whether
any dependent write is safe.

**A Special Ad Category has to be DECLARED on the write, not just discussed.**
`special_ad_categories` is optional in the schema and **defaults to `[]`**, so a
campaign for housing, financial products and services, employment, or social
issues / elections / politics is created with no category attached unless you
set it. Saying the right thing in the conversation does not set it: safety rule
9 governs what you TELL the advertiser, this governs the argument you SEND, and
getting the first right while omitting the second produces an undeclared
campaign that reads as compliant in the chat.

So when rule 9 identifies a category, set `special_ad_categories` on the create,
and set `special_ad_category_country` where the campaign's geography calls for
it. Do not guess the accepted values — read them off the live `input_schema` for
the tool, the same way any other enum is resolved. And do not talk the advertiser
through the targeting restrictions the declaration brings: rule 9 is explicit
that those come from retrieved policy text, never from memory. The declaration
applies them; your job is to make it, say you made it, and let the retrieved
policy say what it changes.

For housing, employment, or financial products and services, the declaration
also has to reach every ad set: send `targeting_as_signal: 0` on each
`ads_create_ad_set` in that campaign. Left unset, the tool switches Advantage
detailed targeting on by default, which these categories do not allow, and the
create is rejected.

Where no category applies, leave the argument alone. An unwarranted declaration
is not the safe default — it forces real targeting restrictions onto a
legitimate advertiser, which rule 9 treats as a failure of the same severity as
missing one.

**Duplication is a real capability — use the source parameters rather than
building an empty copy.** `ads_create_campaign` takes `source_campaign_id`,
`ads_create_ad_set` takes `source_adset_id`, and `ads_create_ad` takes
`source_ad_id`, which also carries the creative across in draft mode. Asked to
duplicate something, pass the source id: a bare create named "... Copy" produces
an empty shell, and the approval card cannot tell the two apart, so the
advertiser approves expecting their ad sets, ads and creatives to come with it
and gets nothing.

**You do not need to read the original first** — the copy happens server-side.
That matters because a source object is not always readable here, and refusing
to duplicate what you cannot read turns a working capability into a false
"I can't do that".

**Read the parent campaign BEFORE you compose an ad set.** Whether an ad set may
carry a budget at all depends on the parent, and only the campaign can tell you.
A campaign holding `campaign_daily_budget` or `campaign_lifetime_budget` runs
campaign budget optimisation, and an ad set under it is rejected for carrying
its own budget or its own bid strategy, or for an `optimization_goal` that
differs from its siblings'. Nothing in the ad-set arguments says so,
so an unchecked guess here is the single most common way a creation chain
collapses into a loop of rejected attempts.

The same read settles the rest of the ad set. Apply
`references/campaign-delivery-compatibility.md` to the new ad set against the
parent's objective, budget owner and bid strategy, and against the goal its
existing ad sets use, before composing the create. An ad set added to an
existing campaign gets the same compatibility check as one in a new campaign.

When the parent runs campaign budget optimisation and the advertiser asks for an
ad-set budget, say the budget lives on the campaign and stop there.

**Moving their number onto the campaign is not the fix.** It is a different
change, to a different object than the one they named, and it re-budgets every
other ad set in that campaign. Announcing it first does not make it theirs:
"the campaign runs its own budget, so I'll move the 2,000 there" is the exact
sentence this paragraph exists to stop — it reads as an explanation and is
actually an unrequested write to the parent. There is no version of this that
is acceptable because you said it out loud.

Instead: say what the campaign's budget is today, say the new ad set will draw
from it rather than carry its own, and ask whether they want the *campaign's*
budget changed — a separate decision with its own approval. This is the rule
"never work around a rejection by writing to a different object" from the retry
section below, applied before the rejection instead of after it.

**Otherwise the ad set is where the money is** — it carries the budget, the
schedule, the optimization goal and the targeting. Say what the budget and
schedule are in your own words before proposing it, because they are what the
advertiser is really approving.

**Leave the bid strategy alone unless the advertiser asked for one.** Omitted,
the ad set uses the account default and needs no cap. Setting a strategy that
obliges a cap — `LOWEST_COST_WITH_BID_CAP` is the one to watch — without the
`bid_amount` it requires is rejected outright, and it is a bid the advertiser
never asked to place.

**Placements work the same way, and the field they go in is not the obvious
one.** Advantage+ placements is what happens when nobody names a placement, so
leave every placement field off and say that is what the ad set will do. When
the advertiser does restrict placements, they go **inside `targeting`** as
`publisher_platforms` plus the matching `*_positions` arrays — Facebook Feed and
Instagram Reels only is `"publisher_platforms":["facebook","instagram"],
"facebook_positions":["feed"],"instagram_positions":["reels"]`. The separate
`placement` argument is an advanced spec; do not send the same restriction in
both. And never tell the advertiser their placements were selected unless those
fields were actually in the call — Advantage+ delivery described as a chosen
placement set is a claim about where their money goes that nothing backs.

**Multi-advertiser enrolment is settable, but only on a NEW inline creative.**
It is not a tool argument — it sits at the top level of the `creative` JSON on
`ads_create_ad`, as `contextual_multi_ads.enroll_status`. For a new inline
creative (`object_story_spec`) the tool defaults it to `OPT_OUT`, so the safe
state happens on its own; send `OPT_IN` only where the advertiser has explicitly
asked to be in the program. When the request reuses something that already
exists — `creative_id`, `object_story_id` or `source_instagram_media_id` — the
server leaves the setting untouched and **this write cannot change it**. There,
say so before creation and tell the advertiser what to check in Ads Manager,
rather than implying a choice you did not make.

**Budgets and minimums come back in minor units.** Convert once and give a
single figure in the account's currency. Never show a cents integer, and never
print the raw number beside the converted one: "a 150,347 cent floor" and
"1,504 ARS" in one sentence is the same amount twice, and the advertiser cannot
tell which one they are approving. Do not soften it with a
smaller "starter" or "test" amount either — that is still a rate you invented.
And a missing symbol is not a dollar sign: "gasto diario de 20,00" is their
currency, not yours. Across three runs the control staged a wrong budget in 12
of 15 non-USD cases; with this rule, none.

**A budget is in the ACCOUNT's currency, not the one the advertiser typed.**
This is the most expensive mistake available here, and the confirmation card
cannot catch it: the card faithfully shows the amount that will be spent, so an
advertiser who asked for R$20 and reviews a correct-looking `$20.00` taps
approve on roughly five times the spend they intended. Measured on production
traffic: of six advertisers who named a budget in reais, five had the identical
number staged in USD.

So when the advertiser names an amount in a currency that is not the account's:
name the account's currency, ask for the amount in it, and stop. Never reuse the
figure as though the unit did not matter, never convert it — no exchange rate is
available to you on this path and one invented from memory is a fabricated
number — and never tell them one amount is "equivalent to" the other. Saying
"your account bills in USD, so how much per day in USD?" costs one turn; the
alternative costs money.

**Pricing is the one exception, and it is a different tool.**
`ads_budget_estimate` takes `stated_currency` and returns an authoritative
`currency_conversion`, so quoting its converted figure is reporting a retrieved
value — see `references/campaign-budget.md`. That does not license converting
here: no write tool converts anything. And it does not settle *which* currency
they meant, which is still a question.

**Pass `account_currency` on any write that carries a budget or a bid.**
`ads_create_campaign`, `ads_create_ad_set` and `ads_update_entity` all accept it;
send the `currency` that `ads_get_ad_accounts` returned for the account. The
confirmation card derives the minor-unit offset from that currency, so a missing
or guessed value renders the advertiser a number with the wrong decimal place on
the one screen where they approve the spend.

## Custom audiences

| Intent | Tool |
|---|---|
| create an audience | `ads_create_custom_audience` |
| rename, relabel, or replace a website audience's rule | `ads_update_custom_audience` |
| delete an audience | `ads_delete_custom_audience` |
| add or remove people in a customer list | `ads_update_custom_audience_users` — **hashed only**, see below |
| change which audience a campaign targets | **not available here** — that is an ad set change |

Say the unavailable action plainly and point at Ads Manager. Never imply you did
it, and never substitute a different write to approximate it.

### Uploading a customer list: hash locally, upload digests

`ads_update_custom_audience_users` is the only write whose arguments are other
people's personal data — email addresses, phone numbers, names. The server will
accept those raw and hash them itself, which makes pasting the advertiser's
customer list into a tool call the path of least resistance. **Do not take it.**
Raw personal data placed in a tool argument is in the conversation transcript,
and everything that carries a transcript now carries that list.

Hash it where the file already is:

1. Ask where the list lives and read the file yourself. Do not ask the
   advertiser to paste rows into the chat — that puts the data in the
   transcript before you have touched it.
2. Normalize and hash **in a script**, not by reading values into your own
   reasoning: lowercase and trim an email; strip everything but digits from a
   phone number, keeping the country code; lowercase names and strip
   punctuation. Then SHA-256 each value and emit the hex digest.
3. Upload only the digests. `EMAIL` and `PHONE` accept a 64-character
   lowercase hex digest directly.
4. Report counts — rows sent, rows rejected. **Never echo a value back**, raw or
   hashed, and never quote a row to illustrate what you did.

`EXTERN_ID` and `LOOKALIKE_VALUE` are not personal identifiers and are sent
as-is.

**Two fields on this path are the advertiser's attestations, not yours.** Both
state a fact about the data that only they know, both carry compliance weight,
and neither can be inferred from the request:

- **`customer_consent`** — that they have permission to upload these people.
- **`customer_file_source`** — where the data came from. `USER_PROVIDED_ONLY`
  means the advertiser collected it directly; `PARTNER_PROVIDED_ONLY` means a
  partner supplied it; `BOTH_USER_AND_PARTNER_PROVIDED` is mixed. Partner data
  carries obligations the advertiser's own data does not.

Ask, and set what they answer. Guessing the common value is not a safe default —
it is a false statement made in the advertiser's name, and it looks identical to
a true one afterwards. If `customer_consent` goes unanswered, leave it unset.
`customer_file_source` is required for a `CUSTOM` audience, so if it goes
unanswered, say you need it rather than creating the audience with a guess.

**Bulk lists do not belong in a tool call.** Every row has to pass through the
conversation to be sent at all, so this path suits a few hundred rows at most.
For a real customer database, say plainly that Ads Manager's file upload is the
right tool and that it never routes the list through a conversation — that is an
advantage, not an apology.

An audience created here starts **empty**, and empty is not zero: it reports no
size at all until members are uploaded and processed. Say that rather than
reporting a size of 0.

A note on names, since a wrong one fails quietly: every tool named in this file is
written out in full. Do not construct a name by pattern from a neighbouring one.

**`audience_name` vs `name` is a trap.** `audience_name` carries the audience's
CURRENT name so the approval can label what is being changed — it changes
nothing. `name` is the NEW name, and setting it renames the audience. Putting the
current name in `name` to "identify" the audience reads to the advertiser as an
unrequested rename.

What each audience type needs:

| Type | Needs | Resolve with |
|---|---|---|
| `CUSTOM` (customer list) | `customer_file_source` — how the data was sourced | only the advertiser knows — **ask**; created empty |
| `WEBSITE` | a pixel | `ads_get_datasets` |
| `ENGAGEMENT` | a Page or Instagram account | `ads_get_ad_account_pages`, `ads_get_pages_for_business` |
| `MOBILE_APP` | the App SDK id | only the advertiser has it — ask; never a store package name |
| `LOOKALIKE` | an existing non-lookalike audience to model on | — geography is automatic, do **not** ask for a country |

Creating an audience does not spend money — say so if they expect a charge, but
do not oversell it: an audience no ad set targets does nothing at all.

**A new `CUSTOM` audience is empty, and filling it is something you can do.** The
next step is the hashed upload above, not a redirect to Ads Manager. Sending the
advertiser there for a list you could hash and upload yourself understates the
surface and wastes the trip. Ads Manager is the right answer for a list too large
to pass through a conversation — thousands of rows — and only then; say which
case applies rather than defaulting to the redirect.

## Catalogs, feeds, product sets, products

| Intent | Tool |
|---|---|
| create a catalog / product set / product / feed / feed rule | `ads_catalog_create`, `ads_catalog_create_product_set`, `ads_catalog_product_create`, `ads_catalog_create_product_feed`, `ads_catalog_create_feed_rule` |
| rename or edit a catalog, product, product set, feed, feed rule | `ads_catalog_update_catalog`, `ads_catalog_update_product`, `ads_catalog_update_product_set`, `ads_catalog_update_product_feed`, `ads_catalog_update_feed_rule` |
| start a feed upload | `ads_catalog_create_product_feed_upload_session` |
| connect or disconnect an event source | `ads_catalog_event_source_connect`, `ads_catalog_event_source_disconnect` |
| **permanent deletes** | `ads_catalog_delete_product`, `ads_catalog_product_set_delete`, `ads_catalog_product_feed_delete`, `ads_catalog_product_feed_delete_rule` |

Catalog creation **is** available — when the advertiser gives a name, create it
rather than sending them to Ads Manager.

**A product feed's refresh schedule is an ads asset, not a reminder.** "Change my
Shopify nightly feed to refresh hourly", "fetch daily at 4am", "move it to 9.30am"
are all feed edits and belong here, however much they sound like calendar or
task work — `ads_catalog_update_product_feed` owns the fetch schedule. On Meta AI
the same requests routed to a general scheduling surface and came back "I can't
access your scheduled tasks", four times out of four, for a request that had
nothing to do with reminders. Never hand a feed-timing question to a task,
reminder or calendar tool.

**A feed rule is identified by `feed_rule_id` alone, and a product set by
`product_set_id` alone.** Neither argument carries its parent catalog, so if the
advertiser has more than one catalog, say which catalog you resolved the object
from — the approval cannot.

## Meta Pixel events and parameters

| Intent | Tool |
|---|---|
| start tracking a conversion | `ads_pixel_event_create` (creates INACTIVE) |
| activate, deactivate, or edit an event | `ads_pixel_event_update` |
| add or change a parameter extractor | `ads_pixel_parameter_create`, `ads_pixel_parameter_update` |
| archive a parameter extractor | `ads_pixel_parameter_delete` |
| remove an event rule | `ads_pixel_event_delete` |

Parameter deletion archives the extractor and leaves its event intact.
Event deletion permanently removes rules created in Events Manager
(`USER_CONFIG`) and archives other rules. Do not promise an undo through
this CLI.

**The six write tools take `items[]`, a list** — the reads do not — and one call
can carry several changes across several pixels. Send only what the advertiser
asked for: one item per change they named. Do not batch in a convenient extra,
and do not split one change across two calls. If you are sending more items than
they can reasonably check, say what the batch does as a whole first.

**Remove event rules one at a time.** `ads_pixel_event_delete` can permanently
erase a rule, so send one item per call and explain what it tracks. Stop at the
first refusal or failure and report what was removed. Parameter archiving can
use the batch behavior above.

**Identify the event before removing it.** `event_rule_id` alone does not explain
what stops being recorded. Read it with `ads_pixel_event_read` and name the event
type and the URL or button it fires on.

**Naming the pixel takes work.** Reading a rule by `event_rule_id` does **not**
return its `pixel_id` — that lookup only goes the other way. When the advertiser
has not named the pixel, list their datasets with `ads_get_datasets` and call
`ads_pixel_event_read` per pixel until the rule id appears. If they have too many
pixels for that, say plainly that you could not confirm which pixel the rule
belongs to. Do not guess, and do not let the approval imply you checked.

**An event without parameters records nothing but the event.** A Purchase with no
`value` or `currency` cannot be optimised against or reported in money terms.
When a conversion has an obvious value, say what parameters it needs and offer to
add them.

Extractors are `CSS` or `CONSTANT_VALUE` only. `CSS` reads the text of a matched
element; it cannot read a URL fragment, an attribute, or JavaScript state. If the
value lives somewhere a selector cannot reach, say so rather than shipping one
that will not match.

## Not covered here

Additional tools without domain-specific guidance in this file:

- **Standalone creative and media changes** — `ads_creative_update`, `_delete`,
  and the image/video upload tools. Complete-campaign media
  preparation is governed by `references/campaign-creative.md`; review and
  creation are governed by `references/campaign-execution.md`.
- **Experiments** — `ads_experiment_abtest_create_test`, `_update_test`,
  `ads_experiment_lift_create_test`.
- **Boosting** — `ads_boost_ig_post`.

Three more assume a UI file picker that does not exist on this surface yet, so
they cannot complete here: `ads_creative_upload_local_image`,
`ads_finalize_local_ad_image_upload`, `ads_delete_local_ad_image`. This is a
gap to be built, not a permanent exclusion. Do not attempt those calls. It does
not affect the workspace media preparation in
`references/campaign-creative.md`. `ads_log_ui_interaction` is different: it is
app-only telemetry and states outright that it is never called by the model, so
it is not yours to call at all.

For anything in this section the general rules above still bind — state the
change, stay within the requested scope, prefer the reversible action, report only
what happened — but there is no domain-specific guidance, so be correspondingly
more cautious about what you propose.

Media inputs use Ads-returned hashes/IDs; upload new assets with
`ads_creative_upload_media` first. Direct catalog
product image fields are unsupported: they accept only
URLs, with no hash alternative. Product destinations and feed URLs remain valid.
