# Campaign planning — full research

Use this reference for the default full-research path. Apply account scope and
evidence; read analysis, policy, response style, or general tool routing only
when the decision requires them. Explicit step-by-step requests use
`campaign-guided.md` instead.

## Delivery strategy before creative

Strategy connects advertiser intent to executable delivery settings. Resolve:

1. signals and tracking;
2. objective and optimization;
3. destination;
4. compliance;
5. geography and audience;
6. hierarchy and placements; and
7. budget and schedule.

The current request overrides memory. Prior conversations may support stable
facts the advertiser did not replace, never an old budget, objective,
destination, promotion, or one-off asset.

This review may name the ad count needed for structure or pricing, but it does
not include creative format, concept, composition, copy, button wording,
in-image text, or production source. Those belong to `campaign-creative.md`
after strategy approval.

## Establish the product brief

Before discovery, decide whether the conversation explains what is being
advertised or tested well enough to research it without adding facts. If
describing what the audience receives, how the offering is delivered, or what a
requested test changes would require invention, the brief is incomplete.
Account names, campaign labels, and history cannot fill that gap unless the
advertiser explicitly asks to reuse or duplicate a prior setup. A name, date,
audience, or price alone does not establish the substance of the offering. Ask
the natural product- or test-scope questions needed to remove the actual
ambiguity, grouped into one brief turn. Do not supply example answers or preview
any campaign setting. The response contains only a short reason and the
questions; do not mention research, pricing, planning, or future workflow.
Research—not the advertiser—will recommend goal, destination type, audience,
placements, hierarchy, and schedule. It also recommends budget when the
advertiser leaves affordability open; exact execution inputs still require
advertiser or tool provenance.

Ask now only for facts needed to understand the advertised offering or to run
delivery research. A detail needed only to write or render the ad belongs in
the creative stage and must not block strategy research. This turn contains only
offering or test-scope questions plus the budget question below; account, Page,
destination, and other delivery-setting decisions belong to later stages. When
this clarification turn is already required and no spend constraint is known,
it must include one natural budget question. Let the advertiser leave budget
open for the estimator; never require them to invent an amount.

The brief is sufficient only when remaining unknown advertiser-owned facts
cannot change a delivery decision or how budget should be interpreted. The
instruction to minimize intake applies only after this test passes. Ask only for
facts that resolve such a dependency, without anchoring the answer to another
product; otherwise continue and state the resulting limitation.

Use options only when one bounded question is sufficient. When several related
facts are missing, ask them together in plain text. Begin discovery and the
first research call in the same turn after the brief is complete. One brief,
natural status is fine while research continues; the final response contains a
finding, blocker, or decision rather than troubleshooting narration.

An omitted budget alone does not create an upfront clarification turn. When the
brief is otherwise sufficient, continue; after other pricing inputs stabilize,
call `ads_budget_estimate` without a seed and resolve its returned basis under  
`campaign-budget.md`.

## Resolve identity

Apply `account-scope.md`. Silently use the sole enabled account or one clear
name/context match; otherwise show one named account picker and stop. If no
account is available, continue plan-only and state that Ads Manager execution
is unavailable.

Read Pages with `ads_get_ad_account_pages` for the selected account. Use a Page
the advertiser chose or one clear compatible match. If several are plausible,
ask with one picker. If the Page name materially differs from the verified
destination brand, show the exact pairing and ask only `Use <Page name>` /
`Choose another Page`; ignore cosmetic name differences. Never use
`ads_get_pages_for_business` without a returned `business_id` and a real need
for business scope. That list is the account's promoted Pages, not the set the
advertiser may advertise from: `ads_create_creative` takes a `page_id` and
accepts any Page they hold advertising rights to. So when it is empty or holds
no match, widen to `ads_get_user_pages`, which needs no id, and resolve from
there; a Page found only in the wider scope is valid for creation. An empty or
non-matching `ads_get_ad_account_pages` never blocks creation, and is never
reported to the advertiser as something they must fix — do not tell them to
attach a Page in Business Settings.

That widening is for the Page only. Resolve Instagram before recommending an
Instagram-only placement or automatic placements that may deliver on Instagram,
use only an Instagram identity returned for the selected account, and never
assume Page identity also covers Instagram. If no usable Instagram identity
exists, revise the placement recommendation or state the limitation rather than
recommending or pricing Instagram placements. Do the same if no Page is usable
at all.

Reuse stable, same-context choices by name. Refresh a prior campaign through
`ads_get_ad_entities` only when the request refers to that campaign. Do not
carry one-off offers, URLs, seasons, assets, IDs, capability results, or live
delivery state into a new context. Carried choices are defaults, not standing
permission to spend. Never use history to complete an insufficient current
brief; a prior reference authorizes carry-forward only when the advertiser asks
to reuse or duplicate it.

## Run decision-bearing research

`Plan only` suppresses writes, not discovery or decision-bearing reads; run the
same research needed to ground the recommendation.

Use normal `call-tool --agent-output` reads and consume their JSON directly.
Describe only selected tools in the current lane, one tool per `describe-tool`
command; independent descriptor calls may run together. Do not preload creation
schemas. A failed lane is unavailable evidence, not a negative advertiser
finding, and degrades only that lane.

Complete the needed lanes without interim questions or partial findings:

- **Account context first:** call `ads_insights_advertiser_context` when exposed.
  Treat it as the primary account/history summary. Call `ads_get_ad_entities`
  for history only when context is absent, lacks a fact that could change a
  concrete delivery decision, or the request names an entity that must be
  resolved. Read only compatible product/objective/destination/audience/season
  entities; do not retrieve or average unrelated history.
- **Tracking:** read only the dataset, event, quality, pixel, and custom-
  conversion facts that can change objective or optimization. Individual reads
  combine into evidence; they are not a fictional unified health tool.
- **Audience:** inspect an existing audience only when the request or account
  context makes it a plausible buildable choice. Use returned IDs only.
- **Destination and brand:** verify the destination and only the public facts
  needed to choose delivery settings. Defer creative-market patterns, asset
  inventory, and all Ad Library research to `campaign-creative.md`.
- **Performance and benchmark:** call a trend or one relevant benchmark only
  when its inputs are grounded and its result can change the plan. Never infer a
  trend or benchmark from absent data.
- **Policy/help:** call live policy or help only when the category or proposed
  setting materially requires it.

Call research complete only after every selected lane has returned or been
recorded as unavailable. Describe exactly what was checked; never upgrade a
small subset of account reads into `everything is verified`. Collection names
and IDs are leads, not evidence for absent fields: follow the smallest useful
set of plausibly compatible objects into detail or trend reads when they could
change a decision, or omit that history. Empty, failed, names-only, or unmatched
results never prove the advertiser lacks history or has never run something.

Apply these disciplines:

- Every cited fact changes a setting or explains why a candidate was rejected.
- History is evidence only when product, objective, destination, audience type,
  and relevant season are compatible.
- Resolve conflicts in this order: compliance, explicit advertiser preference,
  compatible first-party evidence, then safe Advantage+ defaults.
- Current intent always grounds the plan; history may support but never replace
  it.

Evidence constrains choices: missing or failed evidence may rule out a setting,
but does not establish an alternative. Recommend objective, destination, and
audience from stated intent, affirmative evidence, or a supported safe default
shown as an assumption; otherwise keep the decision open. Execution-bound URLs
and targeting values must come from the advertiser or a tool result. The chosen
destination is stable for pricing only when its required URL or object identity
is supplied or returned; never price a hypothetical destination.
Describe the audience as only what the executable targeting encodes; personas or
interests used only to shape messaging are creative direction, not configured
targeting.

An empty or failed summary establishes only that its lane supplied no usable
evidence. It does not prove the advertiser lacks history, assets, audiences,
demand, or prior performance unless an authoritative, correctly scoped
collection explicitly returns empty. Use the documented fallback read when a
missing fact could change a concrete decision.

Choose objective and optimization only after destination and tracking facts,
then read and apply `campaign-delivery-compatibility.md` before either decision is
settled, priced, or shown as a recommendation. Never silently replace the
requested outcome. If its measurement event is unavailable, finish useful
non-pricing research and go directly to the binding-constraint checkpoint
before pricing an alternative.
Then apply compliance and resolve any creation-bound targeting. A country code
is already canonical. For any interest, language, or other location, read
`campaign-targeting.md` before the first lookup, then call
`ads_targeting_search` once with the grounded batch. A successful partial result
is final for that decision round; do not retry by varying spelling, type,
radius, or nearby areas without new advertiser evidence. Carry only returned
objects into pricing and creation. An unresolved requested place remains open:
do not price a partial audience, substitute a nearby place, widen its radius,
or omit geography from executable targeting. Price only after every requested
geography resolves or the advertiser accepts a revised geography.

Evaluate whether each campaign or ad set earns its own budget; prefer
consolidation to unsupported fragmentation. After all pricing inputs,
identities, and required capabilities stabilize, price the whole structure once
under `campaign-budget.md`. An estimate that prompts an optimization change is
feasibility evidence, not final pricing. Any accepted input change invalidates
it; reprice only the final structure.

Finally check coherence across all seven settings, including the complete
delivery tuple in `campaign-delivery-compatibility.md`. Repair
evidence-resolvable conflicts. If one genuinely advertiser-owned blocker
remains, finish available research, explain that blocker, and ask only for it
instead of presenting an approvable plan.

After research, end with exactly one controller state: a binding-choice widget,
one genuinely unbounded next question, or the complete strategy with embedded
approve/revise options—even for plan-only requests. Never stop at an
informational campaign or budget summary.

## Resolve a binding constraint before full review

Before complete review, stop when evidence makes the request unexecutable or
creates a material outcome, optimization, target, or spend fork. Name the first
constraint correctly: an unavailable measurement event is tracking; a buildable
event whose projected volume or required spend conflicts with the advertiser's
target or limit is budget feasibility.

Show only evidence → consequence → one recommendation, followed by one bounded
widget under the interaction contract. Keep the requested outcome as an option
when executable, name alternatives clearly, include a spend or target revision
when it resolves the constraint, and order the recommendation first. Do not
preview the complete plan or ask for strategy approval.

The selection settles only the disputed path. Collect any required free-form
value next, rerun affected research, price the final stable structure once, then
show the complete strategy with its accepted learning tradeoff.

## Recommend the complete plan

Lead with the forward recommendation, not a research log. Choose one form:

- For a beginner, answer in plain business language: intended outcome and
  timing, destination, audience, structure/placements, budget, and expectation.
- For an experienced advertiser, use the seven delivery-setting labels above,
  explaining only unfamiliar or disputed choices.

For each setting, state the planned value and concise basis. Surface only two
to four findings that materially changed decisions, leading with first-party
evidence. Use sparse clickable links for any external claims and never expose
raw IDs. State only assumptions or missing evidence that materially bound the
recommendation. Do not include a creative plan, render `campaign-summary`,
prepare media, upload, or write Ads objects. Ask `Proceed with this strategy?`,
then show exactly:

- `Approve this strategy`
- `No, make changes`

Put the complete plan, approval question, and both options in one final response
under the interaction contract. Commentary may contain status only, never plan
settings or recommendations.
Call `muse.create_options` before writing the plan, then write the plan and
question with its returned `embed_token` alone on the final line; calling the
tool without embedding the token does not display the choice.

The approval accepts every shown delivery value, including budget and
hierarchy, but no creative or write. After `No, make changes`, ask what to
revise. Retain unaffected evidence, rerun only affected lanes, reprice once only
if a pricing input changed, and present the complete revised strategy again.
On approval, do not rerun strategy research; route to `campaign-creative.md`.

## Recommendation rules

Campaigns separate objectives. Ad sets separate material delivery mechanics
such as budget, audience, geography, schedule, placement, or optimization. Ads
separate messages and creative concepts. Multiple ads are not a controlled A/B
test without an experiment. Do not fragment beyond what the priced budget can
support.

Never invent an exact URL, spending constraint, offer, claim, or service
geography. Do not derive geography from account currency, timezone, Page
language or location, a destination domain, prior campaigns, or market
convention. It must come from the advertiser or verified service-area evidence;
otherwise ask one geography question before pricing. Do not ask about
evidence-backed defaults. Unless constrained, use
auction buying, campaign-level daily budgeting, broad Advantage+ Audience,
automatic placements, no end date, and compatible billing/optimization. Keep
native messaging destinations native. Name the executable placement choice
precisely: automatic placements means all surfaces eligible for the final
setup, while a platform-restricted set is not automatic.

**Bounded delivery is the exception to the no-end-date default.** That default
is for delivery meant to run on. When the advertiser's own goal ends — the unit
is let, the event happens, the offer closes — a daily budget with no end date
keeps spending past the thing it was for. Raise it before the complete review
and settle it as an **end date**, which is the only stop this surface can
actually set. A lifetime budget requires one either way.

**A stopping rule is not an end date, and must not be accepted as one.** "Pause
it once the unit is leased" names a condition nothing here watches: there is no
scheduled task, no trigger, and safety rule 5 forbids offering one. Writing it
into the plan and moving on leaves the campaign spending while the advertiser
believes it will stop by itself. If that is the shape they want, say plainly
that stopping is a manual step they take, and offer a date as a backstop so the
spend has a floor under it if they forget. Where they do mean it to run on,
leave the field out rather than inventing a date to fill it.

**Do not promise measurement the account cannot do.** Before telling the
advertiser you can optimise for or report applications, purchases or any other
offsite conversion, read the account's datasets with `ads_get_datasets`. With no
usable dataset, say so plainly and say what the campaign will measure
instead — a click-optimised campaign counts visits to the page, not completed
applications. That difference is often what decides between Traffic and a
conversion objective, so it belongs in the recommendation, not in a caveat
afterwards.

## Optional strategy artifact

Create an unshared `artifact.create_web_static` strategy only when explicitly
requested or after the advertiser accepts a brief nonblocking offer prompted by
a material finding. Use the campaign name plus `campaign strategy`, the exact
request as `verbatim_request`, and `capabilities: {public_web_read: false,
connectors: []}`. Let the builder use parent-conversation evidence; do not force
a recap through `artifact.send_input`. It may explain evidence,
recommendations, assumptions, and links, but never raw IDs, signed URLs,
unsupported claims, or approval controls. It does not replace final review.
