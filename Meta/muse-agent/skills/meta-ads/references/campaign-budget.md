# Campaign budget

Read this after the non-budget inputs required by the estimator and advertiser
constraints are stable. Unresolved requested geography blocks pricing.
Existing-campaign budget diagnosis belongs to `tool-routing.md`.

For campaign planning, this is a pricing substep that also requires the
executable destination defined in `campaign-planning.md`, even when the request
emphasizes budget, results, or learning. Return its decision to that controller.
Only a request solely for a price or budget explanation is pricing-only; it does
not require an execution-bound URL or object identity.

## Price one stable proposal

After compact discovery confirms `ads_budget_estimate`, read its live schema
with `describe-tool --input-only`. Use its current objective, optimization, and
result enums, then run the proposal once through the typed command:

```sh
/opt/hatch/bin/meta-ads-cli estimate-budget \
  --account-id <ACCOUNT_ID> \
  --advertiser-request '<COMPLETE_REQUEST>' \
  --campaign campaign_1 '<CAMPAIGN_NAME>' <OBJECTIVE> <OPTIMIZATION> CBO \
  --ad-set campaign_1 ad_set_1 '<AD_SET_NAME>' \
  --country <COUNTRY_CODE> \
  --target-country ad_set_1 <COUNTRY_CODE> \
  --advantage-audience ad_set_1 on
```

The typed command owns JSON serialization, request correlation, and final
live-schema validation. Do not use `call-tool`, CLI help, source inspection, or
trial calls to construct the request.
Set `yield_ms` to 120000. If execution still backgrounds, wait for its automatic
result; a running command is not a failure and must not be invoked again.

- Add every campaign with  
  `--campaign KEY NAME OBJECTIVE OPTIMIZATION CBO|ABO` and every ad set with  
  `--ad-set CAMPAIGN_KEY KEY NAME`.
- Prospecting is the default. Add `--campaign-stage KEY retargeting` only when
  current evidence establishes retargeting.
- Compare every ad set's final targeting before the call. When all are
  identical, use `--country` for plan context, give each ad set one geography
  shape with `--target-country`, `--city-key`, or `--region-key`, and add
  returned `--interest-id`, `--custom-audience-id`, `--locale-id`, `--age-range  
  KEY MIN MAX`, `--gender KEY all|men|women`, and `--advantage-audience KEY  
  on|off` values.
- Add bounded schedules with `--ad-set-start KEY ISO_8601` and  
  `--ad-set-end KEY ISO_8601`.

For resolved city targeting, retain `--country` as context, replace the keyed
country with the returned city key, and append only returned interest IDs.

The estimator publishes one targeting-based cost per campaign. When any ad-set
targeting differs, the only targeting arguments allowed are the campaign's
top-level `--country` values: omit every keyed targeting flag on the first call.
Keep executable audiences unchanged and label the estimate country-level, not
audience-specific. Never test the rejected divergent shape, merge audiences, or
broaden them to make pricing succeed.

Budget and constraint flags are plan-level numeric values, never campaign or
ad-set keys:

- `--daily-budget AMOUNT` or `--lifetime-budget AMOUNT`
- `--max-daily AMOUNT` or `--max-lifetime AMOUNT`
- `--max-cost-per-result AMOUNT`
- `--min-roas NUMBER`

When budget is open, omit daily and lifetime budget flags; never invent a seed.
When the advertiser committed an amount, pass it with `--currency`. A lifetime
budget requires duration or end dates. Use maximum, cost, and ROAS constraints
only when advertiser-supplied.

Pass an advertiser-stated result target with `--goal-value`,  
`--goal-result-type`, and optional `--goal-period day|week|month|total` only  
when it matches the priced optimization event. Never transfer a Purchase, lead,
booking, or other outcome count to views, clicks, or conversations without a
verified conversion rate; retain it only as business context.

Use the complete current multi-turn `advertiser_request` required by
`SKILL.md`. Ask before pricing when cadence or currency is ambiguous. Never
supply a cost or CPA; the estimator derives it.

Before pricing placements that include Instagram, resolve a compatible
Instagram identity. If none exists, exclude Instagram and state the limitation.

Use `total_budget` for the whole proposal and `per_campaign[]` for allocation.
Prefer formatted or major-unit values and preserve both currencies when
conversion is returned. Validate budget mode, assumptions, and warnings against
the proposal. Make one schema-grounded correction for a mismatch; otherwise
leave pricing unresolved.

## Interpret returned evidence

Amount basis explains why the budget was selected. Cost source, confidence,
sample size, fallback reason, and caveat explain how its projection was
grounded. Neither alone proves what the advertiser should spend.

| Basis | Advertiser-facing meaning |
| --- | --- |
| `budget_honored` | Their chosen spend and returned projection |
| `target_derived` | Spend associated with their goal and timeframe; goal-matched, not mandatory or necessarily affordable |
| `account_history` | Compatible observed account behavior; name the evidence and sample |
| `learning_floor` | Estimated spend for roughly 50 optimization events per ad set in rolling seven days; useful for exiting learning quickly, not a minimum or guarantee |
| `account_minimum` | Lowest accepted spend; not proof of useful volume |
| `delivery_floor` | Minimum supported delivery plan; not proof of viability or profitability |
| `mixed` | Explain each material component separately |

Treat `account_history` as measured only for the compatible returned sample.
Label `peer_benchmark` and `forecast` as estimates. Treat `hardcode` as a
low-confidence static fallback; its cost and derived amounts are directional.
All expected results remain projections.

`fallback_reason` explains why a stronger source declined. `cost_caveat`
qualifies the selected source. For example, `cost_not_split_by_stage` means the
account evidence combines prospecting and retargeting; it does not make that
evidence synthetic.

Preserve returned shortfalls, warnings, feasibility, and supported actions.
Never silently raise spend, reallocate budget, or drop a campaign. The estimator
takes no placement input, so never call its estimate placement-specific.

Use returned formatted amounts. Otherwise display money at the currency's
normal minor-unit precision without feeding display rounding into another
calculation. Translate machine metadata into advertiser language; do not expose
enum tokens, snake case, nulls, or internal statuses. Limit volume interpretation
to the returned projection, source/confidence, and applicable benchmark; leave
stability, effectiveness, and usefulness uncharacterized unless returned.

## Classify the budget decision

Return `settled` or `open` with the basis, amount, projection, learning
relationship, and material constraint:

| Inputs and result | State and handoff |
| --- | --- |
| Supplied amount honored | `settled`; preserve it and its projection |
| Supplied amount below learning floor | Amount stays `settled`; open a feasibility choice and lead with the supported recommendation |
| Supplied amount meets floor, or learning is not applicable | `settled`; no feasibility fork unless another returned constraint creates one |
| No budget; compatible account-history recommendation | `settled`; include evidence and sample |
| No budget; `target_derived` amount | `open`; goal cost is known, affordability is not |
| No budget or goal; only learning floor | `open`; explain it without adopting it |
| Only account minimum or delivery floor | `open`; ask for sustainable spend or an aligned result target |
| Feasibility conflicts with a stated limit or target | Preserve the supplied decision and return the conflict plus supported paths |

A supplied amount does not become open because it equals a minimum or another
amount could buy more results. A target-derived amount remains open whether it
is below, equal to, or above the learning floor because the advertiser has not
accepted its affordability. When neither budget nor goal was supplied, prefer
compatible account history; otherwise never invent a generic small-business
range or default a large learning benchmark.
Never present a minimum-only result as viable, effective, or a starting budget.

For budget constraints, return these option families to the controller:

- Supplied amount below floor: lead with a verified upstream event when it is
  the supported recommendation; otherwise lead with `Keep <supplied amount>`.
  Other applicable paths are `Keep <supplied amount>`, `Use <learning-floor
  amount>`, and `Change the budget`.
- Target-derived amount: lead with a verified upstream event when it is the
  supported recommendation; otherwise lead with `Use <goal-matched amount>`.
  Other applicable paths are `Use <goal-matched amount>`, `Use <learning-floor
  amount>` when materially distinct at display precision, and `Choose another
  budget`.
- No budget, goal, or history: `Use <learning-floor amount>` when returned,
  `Set a budget`, `Set a result goal`.

List each path once. Add a verified upstream event only when executable. A spend
option selects the same formatted amount and cadence shown in the explanation.
An account minimum or delivery floor alone is never a `Use <amount>` option;
offer only `Set a budget` and `Set a result goal`.

In full-research planning, execute the controller terminal in that response: an
open budget or material feasibility fork calls `muse.create_options` with the
applicable family first, then writes the explanation and question in the final
response and stops after its embedded token; a settled budget with no
other constraint proceeds to the complete plan and its
`Approve this strategy` / `No, make changes` widget.
In guided mode, return every successful result to `campaign-guided.md`; its
budget or feasibility steer is required even when the amount is settled. Never
substitute a prose question or placeholder.

## Learning and allocation safeguards

Use a returned learning floor directly. If no monetary floor is returned but
one ad set has a returned weekly event projection, compare that projection with
roughly 50 events per rolling seven days without inventing a dollar floor.

- At or above the floor, say the projection is expected to support the volume
  recommended for exiting learning quickly; never guarantee exit.
- Below it, say the plan can run and optimize for the event, but projected
  volume is below the benchmark. Stop there: `likely slower learning` and
  `less stable delivery` are unsupported even when phrased as possibilities.
- Do not predict `Learning limited`, an exit date, slower learning,
  instability, or higher cost unless returned.
- Absence of a floor does not prove learning is absent. If an authoritative
  result marks learning not applicable, say the benchmark does not apply.
- Learning is per ad set. Use only returned per-ad-set volume; if absent,
  sufficiency is unresolved. Consolidate ad sets without distinct delivery
  mechanics before recommending more spend.
- A campaign-level budget is pooled and may allocate unevenly. Never divide it
  or its results by ad-set count. Omit `expected_daily_share` from the
  advertiser-facing response; it is estimator modeling, not an allocation. An
  ad-set floor does not guarantee that delivery amount.

## Event feasibility

Ground event availability in tracking or native-destination evidence. An event
accepted by the estimator proves only that it can be priced.

If the requested event cannot be measured, do not price a replacement. Return
the tracking constraint and verified executable paths to
`campaign-planning.md`. If the event is measurable but volume is below its
learning benchmark, recommend the closest verified higher-frequency event first
when evidence supports it as the more feasible path. Retain the requested event
at the current or goal-matched spend as an explicit alternative; never replace
it silently. Without a supported upstream event, lead with the requested event.

An upstream event optimizes for that action, not the original outcome. Do not
carry the original numeric target into its estimate or equate projected
upstream events with outcomes. Do not promise later retargeting, timing, CPM,
cost, or sales lift without returned evidence.

Changing optimization invalidates the estimate. Treat the first result as
feasibility evidence and price only the selected final structure once. Keep a
superseded amount only when it materially explains the change.

Return the decision to `campaign-planning.md`, which owns the next question,
options widget, or complete review. For a campaign-planning request, do not
finish inside this pricing substep. Guided mode returns to `campaign-guided.md`.

## Failures

A deterministic argument or schema failure leaves budget unresolved until the
input or interface changes. Retry the unchanged request only once when the
failure is explicitly transient. A successful response missing required pricing
fields is incomplete, not a reason to inspect CLI help or repeat the call.
