# The Measured Search - Many Changes Weighed on an Eval

> **The measured search for `shared/latency-optimization.md`.** It assumes three things: the project has an eval that covers this workload, the user wants many changes weighed against each other, and they have approved a budget or are about to ("Agree the plan"). Without all three, go back to the guide's "Try one change". The guide's ground rules and its "Talking to the user" note apply here unchanged.

---

## The search in brief

A full cross of every lever with every other is unaffordable on any real eval, so the search goes in stages. Per workload, in this order:

1. Agree the plan: the levers in, the levers out and why, the budget, the cost limit.
2. Run the baseline, write five decision rules down, and price the plan with the final re-run held back.
3. Measure caching, then sweep model x effort x thinking together: each combination of the three is a **configuration**.
4. Measure every other change once, then try **combinations** of them (sets switched on together) on the best configurations.
5. Choose two results: the best at no more than today's cost, and the best within the cost limit.
6. Remove each kept change once, which gives each change's share.
7. Re-run both results in a fresh pass. Those are the numbers reported, and the user decides.

A **pass** (a "run" in the guide's other files) runs a set of configurations over the same tasks, interleaved, with the baseline (the current setup) always among them; a **full pass** covers the whole eval, less any tasks set aside. Every pass follows `shared/latency-optimization/measuring.md`, "Comparing two versions".

## Agree the plan

**A user who named a budget and said not to wait has agreed the plan: write it at the top of the report and start.** Otherwise show it in about a screenful: what will run, in what order, how long, the price as a range, and what they will have at the end.

**What is in:** every lever that fits this workload's shape (`shared/latency-optimization.md`, "Workload shape -> lever"), anything the user named, and anything newer than this guide (`shared/latency-optimization/levers.md`, "Levers this file doesn't name").

**What is out**, a line each, with the reason beside the lever. Confirm "not available" on the lever's fetched page, never on the cached `shared/platform-availability.md` alone, since a skip is the one decision the eval never gets to correct.

**Two decisions go with the plan**, in one `AskUserQuestion` call, unless the request or an earlier answer has settled them:

- **The budget for measuring**, in dollars and time: the whole plan, or a smaller one with what it leaves out.
- **The cost limit per task**, because the plan puts paid levers on the table; the cost question is in `shared/latency-optimization.md`, "What to ask, and when". A budget for measuring is not a cost limit per task: unless the user named a limit or said speed at any price, paid levers are priced and described ("not tried: above your cost limit"), not measured, except for pairings that could stay within the limit (see "What "no extra cost" means" in that file). A larger model or a higher effort level counts as paid too, but its cost per task is known only once it has run, so the sweep gives it the quick first pass and judges it on the cost measured there.

**Go back only if the plan outgrows what was approved**, with what fits and what would be left out. With nobody there, cut to fit and say so in the report.

## Write the rules down first

Write the decision rules and the plan in the report file before the first comparison, and each stage's results before reading the next stage's, so that no rule is chosen after seeing its result. A rule changed later carries its reason beside it.

**The baseline run comes first and carries no candidate**: the current setup alone, run twice side by side over the same tasks. The gap between the two is the noise, in seconds and in quality, so the rules are written with their numbers filled in. It also feeds the prices and the eval check, which comes before every search (`shared/latency-optimization/measuring.md`, "Checking the eval first").

1. **The wait and the percentile**, with any limit on a second wait the user watches, held to the same test as the quality bar. Where there is a target, what "meets the target" means: for example, the point estimate is under it in every pass.
2. **What clears the quality bar, with its number.** The bar is the one the user chose or the default (`shared/latency-optimization.md`, "What to ask, and when"); it decides what is kept, never what is tested. The test: for example, the lower end of the interval over tasks is at or above the bar. **It cuts both ways**: a point estimate within the noise of the bar gets another pass before it is called either way, and one still inside the noise after that is reported as undecided.
3. **The cost limit per task**, applied to whole configurations. A cost per task within the noise of the limit counts as within it; "no more than today's cost" is read the same way.
4. **What counts as a difference in seconds**: the test chosen under `shared/latency-optimization/measuring.md`, "Comparing two versions". For the quick first pass, also its subset of tasks and the margin under the quality bar that drops a configuration: for example, the quality noise plus a few points.
5. **How a tie is settled.** Configurations that rule 4's test can't separate are tied; choose by higher quality, then lower cost, then fewer changes from the baseline.

Settle with them:

- **Tasks set aside for the final re-run**, only if both sets keep enough tasks for the chosen percentile (`shared/latency-optimization/measuring.md`, "Percentiles and how many tasks they need"). Otherwise it is a fresh pass over the same tasks, and the report says so.
- **Total concurrency**, fixed for the whole search. Where concurrency or items per request is the lever, time the whole job at production's concurrency instead.
- **A baseline that fails the bar.** The first job is then a configuration that clears it, which serves as the baseline from here on.

## Price it, and hold back the final re-run

Fetch the **Models Overview** row and the **Pricing** row first. Before anything has run, price from the logs' or the code's token counts, and say the range is an estimate. After the baseline run, price the baseline from its measured cost per request, and each other configuration from a check that the API accepts it: about twenty requests spread over the task types, read only for acceptance, tokens and seconds. Say which limit binds, dollars or minutes, and re-price from what each stage cost.

**Hold back enough for the final re-run, and cut the plan before cutting that**: its one fresh full pass, plus two rounds of "Remove each kept change once".

**If what remains can't hold the whole plan, spend it in this order and stop where it runs out**: the single-request, log and count routes, caching first; the quick first pass over the model configurations; the first full pass of those still in; their later passes; the changes measured alone on the eval, by expected saving; the combinations.

**Fitting a small budget.** Start with whatever makes later runs cheaper (caching, where input tokens dominate the cost of a run). Shrink the slice of tasks before dropping the side-by-side baseline, which is never dropped. When the budget can't reach a final re-run, say so at the start and report directions with rough sizes: which are solid, which are hints, and what it would cost to settle each.

## Model, effort and thinking together

**Settle caching first**: time one representative request shape cold against cached, repeated. Once kept, it joins the baseline. It still meets the eval: where this search turned it on, the first pass carries one baseline without it.

Model, effort and thinking are one space: a larger model at lower effort can beat a smaller one at higher effort on both axes, or the reverse.

1. **Lay out the configurations.** Every model in the fetched lineup's current generation that the account can call (older models only if the project runs one now or the user asks) x every effort level that model accepts x the thinking settings it accepts (on, off, up-front thinking off). Read these from the **Models Overview** row, the **Effort Parameter** row and the **Thinking** row, above the current model as well as below. Where the task runs subagents, their model and effort are a separate axis, searched the same way, and the cost limit applies to the whole configuration. Every other lever stays at its baseline setting.
2. **Fast mode is a fourth axis where the cost limit admits it, where the user asked what it buys, or where it is paired with savings that could keep total cost per task within the limit, such as a smaller model.** Where no such pairing is promising, the options table lists it as "not tried: above your cost limit", with its price from the **Fast Mode** row.
3. **Run a quick first pass on rule 4's subset**: stratified, large enough for the chosen percentile, with the hardest tasks kept. If it can't hold every configuration, put off those with the highest measured cost and seconds per task, never by list price, and keep each model at its default settings, so that no model is left out whole.
4. **Drop only clear losers**: under the bar by more than rule 4's margin, or slower than another by more than the noise with no better quality and no lower cost. One that measures above the cost limit by more than the noise is marked "above your cost limit" and gets no full pass.
5. **Give the rest the full eval**, then carry forward the best configuration within the cost limit, the best at no more than today's cost where that is another one, and every configuration tied with either.

## Every other change once

Every other lever in the plan gets one measurement, in the profile's order, against the baseline and not against the changes kept so far, so that the order doesn't decide the verdicts. Use the cheapest route that can see it (`shared/latency-optimization/measuring.md`, "The cheapest route that can see a change"). A change timed on one request or sized from logs has shown seconds only, and still meets the eval once, in a combination or in "Remove each kept change once". Give each a status and a one-line reason:

- **kept**: it did its job on this workload - a shorter wait on the chosen metric, or for a limit, quality held, how many tasks it ended and the new worst case. Note whether it costs quality or money: one that does is a trade.
- **can't tell**: quality within the noise of the bar, or seconds within the noise. It stays in play where the point estimate is favorable.
- **dropped**: it fails the bar or the limit on the second wait by more than the noise, or it made what it targets measurably worse.

## Combinations on the best configurations

A change measured on one model is only an estimate on another, so:

- **The combinations**: every change off; every kept change that isn't a trade on; and that set plus, in turn, each trade and each "can't tell" still in play. Changes sized from the logs aren't crossed.
- **Changes that can't run together** go in alternative combinations, never in one.
  - What a message thread excludes: `shared/latency-optimization/levers.md`, "Message threads - stop re-sending the conversation".
- **Each runs on each configuration carried forward**, with the results in one table. Per-message effort is reset to each configuration's own accepted levels.
- **When the budget can't hold them all**, cut changes first, keeping those with the largest measured effects and any that moved the second wait; then configurations, keeping the best for each of the two results.
- **A stack counts only once that exact configuration has been measured**.

## Choose: two results

**Eligible**: a configuration, with the combination it carries, that clears the bar by rule 2, holds any limit on the second wait, and sits within the cost limit.

**Two results, side by side.** Take the fastest eligible configuration on the chosen wait twice: among those that cost no more per task than the baseline, and among all that are eligible. The first shows what the changes give with no money added, and the gap between the two is what the extra dollars buy. Where one configuration is both, as it is whenever the cost limit is no higher than today's cost, say so. Rule 5 settles ties, and each result lists its tied set. Where a target was given, say whether each result meets it.

**Recommend one, and say what would change the choice.** The user decides, and may choose another configuration.

## Remove each kept change once

In the same passes as each result, remove each kept change once, caching included. A sweep setting the result changed (model, effort, thinking, fast mode) counts as a kept change: set it back to the baseline's. **A kept change's share is how the result's seconds, quality and cost per task move when it alone is removed.** Changes interact, so the shares needn't add up to the whole gain. A kept change whose removal changes nothing measurable on what it targets comes out, since fewer changes is better.

In those passes, also add once each change left out of the combinations and each one that hasn't yet met the eval. An addition that helps goes in, and the check repeats once on the new result.

## Final re-run, then hand over

Re-run each result, up to two of its ties and the baseline in a fresh full pass, on the tasks set aside where there are any, and report those numbers.

**Three full passes, the final re-run included, for each result and the baseline.** A pass under "Remove each kept change once" counts for every configuration it runs. Other configurations can stay at one pass, marked indicative; a result short of three is reported as provisional.

**If a result fails the bar or the limit on the second wait there**, take the next in the tied set, or the next eligible configuration, and re-run that one.

**Hand over** the two results, their ties and the baseline, side by side: seconds at the chosen percentile, the second wait if there is one, quality, cost per task and the number of full passes, and under each result every kept change's share (where the search ended before a change was removed, its own measured ratio, labeled so; nothing more is billed just to fill in the report). During the search, settings stay in the test runner or behind a flag. The chosen result's changes then follow the guide's ground rule 4: uncommitted edits, one change at a time, or a patch file each where the user is away, committed only on the user's word. Offer to commit the report and the timing code, with "don't commit" as an option. After cutover, check the production timing logs at the chosen percentile.

## When it ends

- **The plan is done**: every lever in it has a measurement, and the sweep and the combinations have run.
- **The target is met.** With the user there, say so and ask whether to go on, with "stop here" recommended. Unattended, stop searching.
- **The budget or the time is down to what was held back.**
- **The user says stop.** Nothing more is billed: report what stands.

In the first three cases the closing stages still run, from "Choose: two results" to the final re-run. However it ends, the report lists the levers not tried, the configurations not run and the combinations not crossed, each with its expected size and the cost to test it. When the baseline is both results, the finding is "no changes recommended".

## The options table and the longer report

**The options table** has one row per lever looked at: `Option | What it moves | Status | Result: seconds, quality, cost | Note`.

- **Status** is one of four: kept / dropped / can't tell / not tried. "Not tried" carries its reason: doesn't apply here, not available, already in the baseline, not asked for, small expected gain, above your cost limit (with the price; where the limit is the default and not one the user named, say that no extra cost was agreed), out of budget, needs an eval.
- **Result** is the ratio to the same pass's baseline with its interval, then quality and cost per task. **Note** says which route measured it, and what a trade gives up.
- **The guide's tags on diffs follow from the status**: kept, dropped and can't tell are *measured* once the change has met the eval and *quality not checked* until then; not tried is *proposed*.

**The report** follows the skeleton in `shared/latency-optimization.md`, "What to hand back", with a plot or table of every configuration under its results and the options table as what was tried. It adds two sections: **the rules written beforehand**, with the budget approved and what was spent; and **combinations by configurations**, with what the first pass dropped, on what number, and what was left out.
