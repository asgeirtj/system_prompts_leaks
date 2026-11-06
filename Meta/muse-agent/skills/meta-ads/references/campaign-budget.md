# Price a Meta campaign budget

- Read this once the estimator's non-budget inputs and the advertiser's constraints are stable. An unresolved requested geography blocks pricing, and diagnosing an existing campaign's budget belongs to [tool routing](tool-routing.md).

- In campaign planning, pricing also needs the executable destination that [planning](campaign-planning.md) defines, even when the request stresses budget, results or learning, and its decision returns to that guide. Only a request purely for a price or a budget explanation is pricing-only and needs no execution-bound URL.

## Price one stable proposal

- After discovery confirms `ads_budget_estimate`, read its live schema with `describe-tool --input-only` for the current objective, optimization and result values. Then price the proposal once through the typed command:

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

- The typed command builds the JSON, correlates the request and validates it against the live schema. Never construct the request through `call-tool`, CLI help, source inspection or trial calls.

- Run it through `muse.exec` with `yield_ms` set to 120000. If it still moves to the background, wait for its automatic result, because a running command has not failed and must not be started again.

- Add every campaign with `--campaign KEY NAME OBJECTIVE OPTIMIZATION CBO|ABO` and every ad set with `--ad-set CAMPAIGN_KEY KEY NAME`. Ad-set keys are unique across the whole plan, and `--account-id` takes the numeric ID without `act_`.

- Campaigns default to prospecting. Add `--campaign-stage KEY retargeting` only when current evidence establishes retargeting.

- Compare every ad set's final targeting before the call. When all match, use `--country` for plan context, give each ad set one kind of geography by repeating `--target-country KEY COUNTRY_CODE`, `--city-key KEY CITY_KEY` or `--region-key KEY REGION_KEY` once per place, and add the returned `--interest-id`, `--custom-audience-id` and `--locale-id` values with `--age-range KEY MIN MAX`, `--gender KEY all|men|women` and `--advantage-audience KEY on|off`.

- For resolved city targeting, keep `--country` as context, replace the keyed country with the returned city key and add only returned interest IDs. `--country` must agree with any country targeting.

- Add bounded schedules with `--ad-set-start KEY ISO_8601` and `--ad-set-end KEY ISO_8601`.

- The estimator publishes one targeting-based cost per campaign. When ad-set targeting differs, pass only the campaign's top-level `--country` values and omit every keyed targeting flag, keep the executable audiences unchanged and label the estimate country-level rather than audience-specific.

- Never test the rejected divergent shape, merge audiences or broaden them to make pricing succeed.

- Budget and constraint flags are plan-level numbers, never tied to a campaign or ad-set key:
  - `--daily-budget AMOUNT` or `--lifetime-budget AMOUNT` in major currency units, such as `25` for $25, never both
  - `--max-daily AMOUNT` or `--max-lifetime AMOUNT`
  - `--max-cost-per-result AMOUNT`
  - `--min-roas NUMBER`
  - `--duration-days DAYS`

- When the budget is open, omit both budget flags and never invent a seed. Pass `--currency`, a three-letter uppercase code, with every amount the advertiser committed, including the maximum and cost flags, give a lifetime budget a duration or end dates, and use the maximum, cost and ROAS flags only when the advertiser supplied them.

- Pass an advertiser-stated result target with `--goal-value` and `--goal-result-type`, plus `--goal-period day|week|month|total` when needed, only when it matches the priced optimization event. Never transfer a purchase, lead or booking count onto views, clicks or conversations without a verified conversion rate, and keep it only as business context.

- Before pricing placements that include Instagram, settle the Instagram identity as [planning](campaign-planning.md) describes.

- Pass the advertiser's complete current wording across turns as `--advertiser-request`. Ask before pricing when the cadence or currency is ambiguous, and never supply a cost or CPA, which the estimator derives.

- Read `total_budget` for the whole proposal and `per_campaign[]` for allocation, preferring formatted or major-unit values and keeping both currencies when a conversion is returned. Check the budget mode, assumptions and warnings against the proposal, make one schema-grounded correction for a mismatch, and otherwise leave pricing unresolved.

## Interpret the returned basis

- The amount basis explains why this budget was selected, while the cost source, confidence, sample size, fallback reason and caveat explain how its projection was grounded. Neither alone proves what the advertiser should spend.

- Explain each basis in advertiser terms:
  - `budget_honored` is the advertiser's chosen spend with its returned projection
  - `target_derived` is the spend matched to their goal and timeframe, neither mandatory nor necessarily affordable
  - `account_history` is compatible observed account behavior, so name the evidence and sample
  - `learning_floor` is the estimated spend for roughly 50 optimization events per ad set in a rolling seven days, useful for leaving learning quickly but never a minimum or a guarantee
  - `account_minimum` is the lowest accepted spend, not proof of useful volume
  - `delivery_floor` is the minimum supported delivery plan, not proof of viability or profit
  - `mixed` needs each material component explained separately

- Treat `account_history` as measured only for its returned sample, label `peer_benchmark` and `forecast` as estimates, and treat `hardcode` as a low-confidence static fallback whose amounts are directional. All expected results are projections.

- `fallback_reason` explains why a stronger source declined, and `cost_caveat` qualifies the selected one. `cost_not_split_by_stage`, for example, means account evidence mixes prospecting and retargeting, not that it is synthetic.

- Preserve returned shortfalls, warnings, feasibility and supported actions, and never silently raise spend, reallocate budget or drop a campaign. The estimator takes no placement input, so never call its estimate placement-specific.

- Use returned formatted amounts, otherwise show money at the currency's normal precision without feeding the rounding into later math. Translate machine metadata into plain words, with no enum tokens, nulls or internal statuses, and say nothing about stability or effectiveness beyond the returned projection and confidence.

## Classify the budget decision

- Return the decision as settled or open, with its basis, amount, projection, learning relationship and any material constraint:
  - a supplied amount that is honored is settled, keeping its projection
  - a supplied amount below the learning floor stays settled, and a feasibility choice opens with the supported recommendation first
  - a supplied amount at or above the floor, or where learning does not apply, is settled, with no feasibility fork unless another returned constraint creates one
  - no budget but a compatible account-history recommendation is settled, with its evidence and sample
  - no budget and a `target_derived` amount is open, because the goal's cost is known but its affordability is not
  - no budget or goal and only a learning floor is open, explained without adopting it
  - only an account minimum or delivery floor is open, asking for a sustainable spend or an aligned result target
  - a feasibility conflict with a stated limit or target keeps the supplied decision and returns the conflict with supported paths

- A supplied amount never becomes open because it equals a minimum or because another amount could buy more results. A target-derived amount stays open at any level relative to the floor, because the advertiser has not accepted its affordability.

- When neither budget nor goal was supplied, prefer compatible account history, and never invent a generic small-business range or default to a large learning benchmark. Never present a minimum-only result as viable, effective or a starting budget.

- Offer these option families for budget constraints, listing each path once:
  - a supplied amount below the floor leads with a verified upstream event when that is the supported recommendation, otherwise with `Keep <supplied amount>`, and also offers `Use <learning-floor amount>` and `Change the budget`
  - a target-derived amount leads with a verified upstream event when supported, otherwise with `Use <goal-matched amount>`, and also offers `Use <learning-floor amount>` when it differs at display precision, and `Choose another budget`
  - with no budget, goal or history, offer `Use <learning-floor amount>` when returned, `Set a budget` and `Set a result goal`

- Add an upstream event only when it is executable. A spend option selects the same formatted amount and cadence shown in the explanation, and an account minimum or delivery floor alone is never a `Use <amount>` option, leaving only `Set a budget` and `Set a result goal`.

- In full research, finish in the same response. An open budget or material feasibility fork calls `muse.create_options` with its family first, then writes the explanation and question ending on the token, and a settled budget with no other constraint goes straight to the complete plan and its approval.

- In guided mode, every successful result returns to [guided planning](campaign-guided.md) for its budget choice, even when the amount is settled. Never substitute a prose question or a placeholder.

## Learning and allocation

- Use a returned learning floor directly. If no monetary floor is returned but an ad set has a weekly event projection, compare it with roughly 50 events per rolling seven days without inventing a monetary floor.

- At or above that volume, say the projection is expected to support leaving learning quickly, never that it guarantees it. Below it, say the plan can run and optimize for the event but projected volume is below the benchmark, and stop there, because "likely slower learning" or "less stable delivery" is unsupported.

- Never predict `Learning limited`, an exit date, slower learning, instability or higher cost unless returned. A missing floor does not prove learning is absent, and when a result marks learning not applicable, say the benchmark does not apply.

- Learning is per ad set, so use only returned per-ad-set volume and treat sufficiency as unresolved without it. Consolidate ad sets without distinct delivery mechanics before recommending more spend.

- A campaign budget is pooled and may allocate unevenly, so never divide it or its results by the number of ad sets. Leave `expected_daily_share` out of the answer, because it is estimator modeling rather than an allocation, and an ad-set floor does not guarantee that delivery.

## Event feasibility

- Ground event availability in tracking or a native destination. An event the estimator accepts proves only that it can be priced.

- If the requested event cannot be measured, price no replacement and return the tracking constraint and verified paths to planning. If it is measurable but its volume is below the learning benchmark, recommend the closest verified higher-frequency event first when evidence supports it, keeping the requested event at the current or goal-matched spend as an explicit alternative.

- Without a supported upstream event, lead with the requested event, and never replace it silently. An upstream event optimizes for that action, so never carry the original target into its estimate, equate its projected events with outcomes or promise later retargeting, timing, CPM, cost or sales lift without returned evidence.

- Changing optimization invalidates the estimate. Treat the first result as feasibility evidence, price only the selected final structure once and keep a superseded amount only when it explains the change.

- Return the decision to planning, which owns the next question, widget or review, and never finish a planning request inside pricing. Guided mode returns to guided planning.

## Failures

- A deterministic argument or schema failure leaves the budget unresolved until the input or interface changes. When the estimate says the plan's optimization or actions are not supported, say once that it cannot price this plan, ask for the budget the advertiser wants and continue without a forecast rather than inventing one.

- Retry an unchanged request once only when the failure is explicitly transient. A successful response missing required pricing fields is incomplete, never a reason to read CLI help or repeat the call.
