# Meta Ads — analytical substance

Reporting a value is not interpreting it. This file is what separates a readout
from an answer.

<!-- BEGIN shared-meta-ads-analytical-substance — canonical copy; guarded by scripts/check-shared-skill-blocks. -->

**Analytical substance — REQUIRED.** These are four properties the answer must *have*, not four sections it must *contain*. Establish them in this order — you cannot recommend before you have explained, or explain before you have measured — but deliver them as one continuous argument.

- **A concrete number from THIS account**, paired with a benchmark, a prior period, or a peer figure — never a qualitative label alone. "Cost per result $63.40, up 37% from $46.28 last week" carries a value; "cost per result is elevated" does not. Do NOT define what the metric is here — value plus comparator only. Attribute every number to the exact entity and window the tool returned it for, and state that entity and window ONCE, where the reader first needs it. Never append a scope clause to individual values or inside table cells — `372 for that ad set over the last 14 days` repeated down a column is noise the column header already carries. When the account-level read comes back `$0.00` or `Not available` for the window while a campaign underneath it shows spend, report that figure as the campaign's and name the campaign — never restate a child's value as the account's total, and never carry a value into a window it was not returned for.

- **The causal *why* the number moved**, in terms of a specific mechanism (creative fatigue, audience saturation, funnel drop-off, checkout attribution gap, delivery liquidity, spend concentration on a subsegment) *attached to another observed value* for the same ad object, not a bare mechanism label. "Cost per result rose 37% because CTR fell from 1.4% to 0.6% while CPM held flat" interprets; "cost per result rose because of creative fatigue" is a label. Never assert a causal link to a metric you did not retrieve. When nothing moved — one delivering object, one window, no prior period — interpret the *level* instead of a change: pair the metric with another value in the same retrieved row (CPM with CPC and CTR, impressions with Reach for frequency, spend with results) and with what the campaign's objective optimises for. `CPM $7.35 delivered 611,940 impressions but only 512 link clicks at CPC $4.68, so the cost sits in the click step rather than the impression step` interprets a level without labelling it, and `a Reach objective is why Reach is almost equal to Impressions, and why there is no cost per result to read, since Reach itself is the result` interprets it against the objective. `CTR 0.47% explains the 184 link clicks` is arithmetic — link clicks are CTR times impressions — and counts as a restatement, not an interpretation. Relate the values by placing them side by side; never write the ratio out as a formula or name what divides what. And never emit the quotient itself as a metric value when the tool did not return one: if Frequency comes back `Not available`, write `Reach 587,213 on 611,940 impressions` and let the reader see the relationship — stating `Frequency 1.03` reports a number the tool never gave. `CTR 0.47% on 611,940 impressions` relates them; `CTR (link clicks / impressions)` is a definition and conflates Link clicks with Clicks (all).

- **What this means for the user's *exact* question**, in their KPI. Answer the question that was asked and stay in that scope — remarketing question, remarketing answer; "what's doing well" question, name what's doing well and not what's failing; creative question, answer about creative and not budget. This is a property of the whole answer, not a separate paragraph: if the opening sentence already lands on the user's question, this beat is done and must not be restated later.

- **An action** that directly addresses the explanation, on a named entity. Every recommendation must trace to a specific value stated in the same response. No orphan recommendations, no format diversification for a low CTR unless the creative was analysed first, no scaling while trends are negative, no "run an A/B test" as a hedge against a call the data supports.

**Write it as one argument, not as four labelled blocks.** Never emit `Observation`, `Interpretation`, `Implication`, `Analysis`, `Recommendation`, or any synonym of them as a heading, a bold label, or a line of its own. These beats are how you think; they are not how the page is laid out, and a reader must not be able to tell where one ends and the next begins. One paragraph carrying all four is the ideal answer, not a degenerate one: `Cost per result rose to ₹13.98 from ₹9.53 on your active ad set, and it tracks CTR — 1.04% against 1.35% — rather than Reach, so the creative is losing the click rather than the auction. Refresh the creative before adding budget.`

**Say each fact once.** Write in a natural, non-repetitive voice. Avoid rephrasing or summarising a sentence when the rephrasing adds no meaningful information, and never restate a number, verdict, entity, or scope statement the reader already has. Do not repeat similar findings or similar action steps. Naming one finding as a value, again as an explanation, and again as what-it-means-for-you is the single most common complaint in review — it reads as padding, not as rigour. Before sending, reread the draft and delete every sentence that carries nothing new.

**Match the shape to the situation.** Most answers are not a full analysis, and a short answer to a short question is a correct answer, not a lazy one.

| When the answer is | Write |
| --- | --- |
| a name, a yes/no, or "that does not exist in this account" | The answer in the first sentence, then the one action worth taking. Stop. No headers, no table, no tour of what you checked. |
| one entity whose metric moved | A single paragraph: the value, the driver, the action. |
| a diagnosis with a real cause chain | Continuous prose. At most one header. |
| a multi-entity comparison, or an explicit request to compare | A table plus short prose. This is the only case that earns sections. |

**Keep retrieval out of the answer.** Discovering and calling tools is visible on this surface and needs no apology, but the finished answer is not a log of it. Do not write `I tried…`, `I pulled…`, `I ran…`, `I checked…`, or `How I got this:` in the answer prose, and do not narrate a sequence of attempts. The advertiser reads your conclusion. This bites hardest when something is missing — the no-data evidence boundary in `references/evidence.md` carries the exact rewrites for phrasing an absence.

<!-- END shared-meta-ads-analytical-substance -->

## Advertiser principles — HARD

These override a confident-sounding recommendation.

1. **A rate is only as good as the count underneath it.** Before ranking,
   comparing or naming a winner on any per-unit metric — cost per result, cost
   per lead, CTR, CVR, ROAS — read the matching volume in the same row: objective
   `results` for cost per result, the returned click and impression counts for
   click rates and costs, and `conversions` only where the live field context
   supports it for a conversion-specific question. For ROAS, require the
   returned conversion value and spend. An absent field is not zero. When the
   underlying outcome count is in the low single digits the
   ordering is noise: one more conversion reverses it, so do not rank those
   objects against each other, call one an underperformer, read a trend from
   them, or recommend pausing, scaling or editing on that basis.

   **This is about the COUNT, not the age** — the count is what makes an object  
   unrankable, and an ad that has run ninety days on four results is exactly as  
   unrankable as one launched yesterday.

   **Age still disqualifies on its own, in the one direction that matters.** An  
   object in the learning phase or a few days into delivery has not stabilised  
   even where the count is healthy, so do not recommend pausing, cutting or  
   replacing it on early numbers — that is the expensive half of the mistake,  
   because the ad killed in week one never gets to show what it would have done.  
   Say the numbers are early and give it the delivery. The exit is dynamic per  
   ad set, so do not quote a fixed day or event threshold (`fewer than 50  
   optimization events` is the usual one, and it is a claim the data does not  
   support), and only cite an event count a tool actually returned.

   **Being unable to rank is not being unable to answer.** Say which object is  
   ahead if that is what was asked, and say in the same breath that the gap will  
   not hold — "Summer Sale is at $12 per result and Retargeting at $18, but on 3  
   and 2 results a single conversion reverses that" — then answer from what the  
   account does have enough of: spend, impressions, reach, frequency, link  
   clicks, and what the creative and setup show. Never let "it needs more  
   delivery" stand as the whole answer.

   Naming a margin as inseparable IS an interpretation of the data, not a  
   refusal to interpret it, so it is not the kind of "status" that must stay out  
   of the headline. That rule governs account states such as a payment error or  
   a spend cap, not the width of a measurement gap.

2. **Judge each entity on the metric its objective optimizes for.** CTR is a
   primary success metric only for Traffic and Link Click objectives; for Sales,
   Conversions, and Leads the measure is cost per result, ROAS, or conversion
   volume. CTR is fine as a secondary read on creative engagement when conversion
   data is genuinely unavailable or the user asked about creative. Lead with CPM
   only for awareness or Reach objectives. This governs which metric you judge
   success on, not which metrics you may report: always report a metric the user
   explicitly asked for.

3. **Never compare across objectives.** Do not rank, compare, or label campaigns
   with different objectives on one shared metric.

4. **A CTR drop is not a fatigue signal.** Declining CTR alone never justifies
   pausing or refreshing an ad — pair it with frequency, conversion, or cost
   movement first.

5. **Broad beats narrow.** Do not recommend narrowing an audience, layering
   interests, or excluding age or gender off cost-per-result variance, least of
   all at low volume; never tell the user their audience is too broad. If you do
   suggest narrowing — confirmed retargeting only — recommend Advantage+ Audience
   in the same breath and note that over-narrowing restricts liquidity.

6. **Budget moves belong at campaign or ad set level, never ad level.** Only cut
   a budget when you name where the money goes instead.

7. **Pausing always pairs with a replacement.** Pausing an ad, recommend a new ad
   to replace it; pausing an ad set or campaign, name which one absorbs the
   budget and why.

8. **Keep placements and creative formats diverse.** Never recommend
   consolidating onto a single placement or a single creative format, even when
   one outperforms.

9. **Take the stance the data supports.** When the retrieved numbers point to a
   clear recommendation, give it. Do not fall back on "run an A/B test" or "split
   this into more ad sets" to avoid making the call.

## Minimum interpretation evidence — HARD

Before answering a why, trend, ranking, or performance question, use a relevant
prior period, peer, segment, or funnel comparison plus one candidate driver from
successful tool results. When no prior period, peer, or segment exists for this
account, two metrics from the same retrieved row plus the campaign's objective
are sufficient evidence — that case still owes an interpretation, not a deferral.

If the primary query lacks that evidence, make at most one targeted follow-up
attempt for the missing comparator or driver. Do not retry an equivalent no-data
query, and do not fan out across adjacent analysis tools merely to manufacture an
explanation. Then write at least one sentence connecting the user's KPI to that
driver with the retrieved values on both sides: `Cost per result is $0.92 vs
$1.07 while CPM is $31.20 vs $44.85; the lower CPM is the observed driver of the
lower cost per result.` That interprets the relationship without defining what
either metric means or counts.

If the requested series is unavailable, say that first and do not invent its
direction. Then analyse a relevant comparison — or, when none exists, the levels
in the row you did retrieve — from the same objective and time window as
supporting context, clearly separate from the unavailable series. Never pass the
comparison off as the requested trend. If no eligible comparator and driver can
be retrieved, say the driver cannot be identified: status, tool availability, and
a generic mechanism do not substitute for metric interpretation.

## Driver coverage check — HARD

Before calling a child entity, segment, or returned row *the* driver of a parent
result, reconcile its values with the parent total. If the retrieved children do
not account for the parent total, describe only the comparison among the returned
rows — never call the subset the account or campaign driver, the only
contributor, or the source of the remaining performance. A valid peer comparison
does not prove exhaustive parent attribution.

## The creative is part of a performance answer

`ads_get_creatives` reads what an ad actually says and shows. Read it whenever
the answer could turn on the creative — including on a general "what's working",
"why did results drop", "what should I improve" or "which ad should I scale"
question, not only when the advertiser uses the word creative. Performance
numbers say which ad is ahead; they never say why, and the creative is one of the
few explanations the retrieved data can actually support.

Read it before you commit to a diagnosis, not after: a recommendation to change
copy, format or the call to action, written without reading the creative, is a
guess presented as a finding. Where the creative turns out not to explain the
movement, say so in a clause and move on — this is a read that grounds the
answer, not a section to add to it.

An ad's images, videos, and its rendered preview are separate tools;
`references/tool-routing.md` says which.

## Per-ad-object consistency

Group the response by ad object. Do not label the same entity "top performer" in
one section and "underperformer" in another, or place a value under a header it
contradicts. If two sections disagree, resolve before writing. Emit at most one
verdict per (ad object, metric) pair across the whole answer.

## One analysis level per figure set — HARD

**Levels do not reconcile.** The same account over the same window returns
different totals at `ad_account`, `campaign` and `ad` — differences of tens of
percent are ordinary, and a metric can be absent at one level and populated at
another. Do not assume an account total is the sum of its campaigns, or that a
child total is bounded by its parent.

So **every figure in one list, table or paragraph must come from a single
analysis level**, and that level is the one the user's question named. Putting an
account-level spend beside a campaign-level result set presents two incompatible
measurements as one coherent picture, and the reader cannot see the seam.

This bites hardest when a metric is missing at the level you queried — asking for
results at `ad_account` can return nothing while `campaign` has them. Three
honest options, in order of preference:

1. Re-query everything at the level that carries the metric, and report that
   level throughout.
2. Report the level the user named, and say the metric is not available there.
3. Report both as **separate, labelled sets** — "across the account… ; at
   campaign level…" — never interleaved in one list.

Taking one number from each level and listing them together is the failure. Never
state a figure without knowing which level produced it.

### The click family does NOT nest — do not "correct" it

Intuition says `Link clicks` ⊆ `Clicks (all)`. **In this API it is not true**, and
acting on the intuition makes you suppress or alter correct data. Measured on a
live account, same level, same window:

> `clicks` = 11,010 · `link_click` = 15,672 · `landing_page_view` = 2,847

`clicks` and the action-type counters (`link_click`, `landing_page_view`) are
computed differently, so a "narrower" metric can legitimately exceed a "wider"
one. When two click-family figures look contradictory:

- **Report both, each under the label matching the field you retrieved.** Do not
  drop one, do not reconcile them, do not add a caveat implying one is wrong.
- **Do not present them as parts of a whole** — no "of which", no percentages of
  one against the other, no arithmetic between them.
- Field names differ from display names: `link_click` renders as `Link clicks`.
  `inline_link_clicks` is frequently absent on an account where `link_click`
  returns a value, so a single missing field is not evidence the metric is
  unavailable — try the action-type name before reporting nothing.

**One field name returning nothing does not mean the metric is unavailable.**
This API carries several name variants per metric, and the singular action-type
name often works where the plural inline name does not. Measured on the same
account and window:

| Asked for | Returned |
|---|---|
| `inline_link_clicks` | *absent* |
| `link_click` | 15,672 |
| `unique_inline_link_clicks` | *absent* |
| `unique_link_click` | 13,003 |

So before reporting a metric as unavailable, try the other spelling — or resolve
it with `ads_get_field_context`, which is what that tool is for. Telling an
advertiser a number does not exist when it does is the same class of error as
inventing one.

## Reasonableness clip on stated changes

A percentage change is itself a derived figure, so grounding rule 8 in
`references/evidence.md` governs it first: state it as a change between two
values you retrieved and named, never as a figure the tool returned. Any
percentage change of 500% or more is treated as untrustworthy by review.
Re-express such deltas as absolute values (`from $4 to $40, a 10× budget
change`), or as the raw prior and current pair, or drop the delta and describe
the movement in words — never `702% higher than average`.

## Status may be acknowledged, never as the primary explanation

Learning phase, "too new", "insufficient data", payment error, spend limit,
budget pacing and overnight overspend are honest states, and so is a tool that
returned nothing. Say the state in one sentence, then still interpret the
engagement and delivery data that DOES exist — CTR, link clicks, impressions,
Reach, frequency, even Impressions of 0 — and pivot the recommendation to
*resolving the state*: pixel setup, payment fix, budget headroom, delivery
troubleshooting. Not generic optimisation tips.

**Check for a hard blocker before recommending more spend.** When the
recommendation is to raise a budget, scale an ad set, or otherwise spend more,
first confirm from retrieved data that nothing makes it impossible: the account
is not restricted or disapproved, no prepaid balance or account spend limit caps
daily spend, and the current budget is actually pacing in full. If one of those
blocks it, lead with the blocker and make resolving it the recommendation —
advice to spend more on an account that cannot spend is wrong even when the
metrics support it. If a tool did not return that status, say which blocker you
could not confirm rather than assuming it is clear.

Declining one specific recommendation because an ad set is in the learning phase
is fine. Thin data is otherwise governed by advertiser principle 1 above, which
owns the thresholds and the "never the whole answer" rule; this section owns
account states such as a payment error or a spend cap.

Two more framings to avoid: an account running a single objective is a legitimate
strategy, not a defect to be solved; and a messaging objective is a valid choice
for a Sales goal, not an objective mismatch.

Order matters. The interpretation of the values you did retrieve comes before the
state or the gap, and prose whose only content is why the analysis could not be
done has interpreted nothing. Keep the state out of the headline sentence and out
of the interpretation entirely: lead with what the retrieved numbers show,
interpret them, and put the blocker in one line of its own before the
recommendation.

## Naked qualitative labels are banned

"Solid", "healthy", "average", "exceptional", "strong", "low", "high",
"elevated", "cheap", "expensive", "expected", "holding" and their kin fail unless
the same sentence also carries the numeric value AND a benchmark or historical
delta. "CTR 1.4%, 12% above the account's 4-week average" passes; "CTR is strong"
does not, and neither does "CPM $7.35 is low" or "CTR 0.47% is expected for
Awareness". When you have no comparator, describe the relationship between the
retrieved values instead of grading one of them: "CPM $7.35 across 611,940
impressions produced 512 link clicks" carries the same insight with nothing to
benchmark against.
