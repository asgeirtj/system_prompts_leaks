# Plan a complete Meta campaign

- Use this full-research path by default. An explicit step-by-step request uses [guided planning](campaign-guided.md) instead, and [account scope](account-scope.md) and [evidence](evidence.md) apply throughout.

## Settle strategy before creative

- Strategy turns the advertiser's intent into executable delivery settings. Resolve them in this order:
  - signals and tracking
  - objective and optimization
  - destination
  - compliance
  - geography and audience
  - structure and placements
  - budget and schedule

- The current request overrides memory. Earlier conversations may supply stable facts the advertiser did not replace, never an old budget, objective, destination, promotion or one-off asset.

- The strategy may name the number of ads needed for structure or pricing. Creative format, concept, copy, button wording, in-image text and production source belong to [creative preparation](campaign-creative.md) after strategy approval.

## Establish the product brief

- Before discovery, decide whether the conversation explains what is being advertised or tested well enough to research without adding facts. If describing what the audience receives, how it is delivered or what a test changes would need invention, the brief is incomplete.

- Account names, campaign labels and history cannot fill that gap unless the advertiser asks to reuse or duplicate a setup. A name, date, audience or price alone does not establish what the offering is.

- Ask the natural product or test questions together in one brief turn, with a short reason and no example answers, campaign settings or talk of research and later stages. Research, not the advertiser, recommends the goal, destination type, audience, placements, structure and schedule, and the budget when they leave it open.

- A detail needed only to write or render the ad waits for the creative stage. When this clarification turn is needed anyway and no spending limit is known, include one natural budget question that lets the advertiser leave it open, never requiring them to invent an amount.

- The brief is complete only when the remaining unknown facts cannot change a delivery decision or how the budget should be read. Ask only for facts that resolve such a dependency, without anchoring the answer to another product, and otherwise continue and state the limitation.

- An omitted budget alone never creates a clarification turn. When the brief is otherwise enough, continue, and call `ads_budget_estimate` without a seed once the other pricing inputs are stable.

- Use options only when one bounded question is enough. Once the brief is complete, begin discovery and the first research call in the same turn, and the final response carries a finding, a blocker or a decision, never troubleshooting narration.

## Resolve identity

- Use the sole enabled account or one clear match by name or context. Otherwise show one named account picker and stop, and with no account available, continue plan-only and say Ads Manager creation is unavailable.

- Read Pages with `ads_get_ad_account_pages` for the selected account, and use the Page the advertiser chose or one clear compatible match. With several plausible Pages, ask with one picker.

- When the Page name materially differs from the verified destination brand, show the pairing and offer only `Use <Page name>` and `Choose another Page`. Ignore cosmetic differences.

- That list holds the account's promoted Pages, not every Page the advertiser may advertise from. When it is empty or has no match, widen to `ads_get_user_pages`, which takes no ID, because `ads_create_creative` accepts any Page they hold advertising rights to.

- An empty or unmatched account Page list never blocks creation and is never reported as something to fix, such as attaching a Page in Business Settings. Use `ads_get_pages_for_business` only with a returned `business_id` and a real need for business scope.

- Resolve Instagram with `ads_get_ig_accounts` before recommending placements that may deliver on Instagram, using only an identity returned for the selected account. An Instagram-only placement, Instagram Direct or an Instagram profile destination needs that account.

- Without a usable Instagram account, revise those placements or state the limitation, saying no Instagram account is linked to the ad account and that linking one would show their Instagram profile on ads delivered there. Revise the plan the same way when no Page is usable at all.

- Reuse stable same-context choices by name, and refresh a prior campaign through `ads_get_ad_entities` only when the request refers to it. One-off offers, URLs, seasons, assets, IDs, capability results and live delivery state never carry into a new context, and carried choices are defaults, not permission to spend.

## Run decision-bearing research

- A plan-only request suppresses writes, not research. Run the same reads needed to ground the recommendation.

- Use ordinary `call-tool --agent-output` reads, one tool per `describe-tool` command, with independent descriptors run together and no creation schemas yet. A failed lane is missing evidence for that lane only, never a negative fact.

- Complete the lanes that matter before asking anything:
  - account context first, from `ads_insights_advertiser_context` when exposed, reading `ads_get_ad_entities` history only when that summary is absent, lacks a fact that could change a decision or the request names an object
  - tracking, reading only the dataset, event, quality, pixel and custom-conversion facts that can change the objective or optimization
  - audience, inspecting an existing audience only when the request or account context makes it a plausible choice
  - destination and brand, verifying only the public facts needed for delivery settings
  - performance and benchmarks, called only when their inputs are grounded and the result can change the plan
  - policy or help, called only when the category or a proposed setting needs it

- Leave creative-market patterns, asset inventory and all Ad Library research for the creative stage. Read only compatible history, matching the product, objective, destination, audience type and season, and never average unrelated history.

- Call research complete only when every selected lane has returned or been recorded unavailable, and describe exactly what was checked rather than calling everything verified. Names and IDs in a listing are leads, not evidence, and empty, failed or unmatched results never prove the advertiser lacks history.

- Every cited fact changes a setting or explains why a candidate was rejected. Resolve conflicts with compliance first, then the advertiser's explicit preference, compatible first-party evidence and safe Advantage+ defaults.

- Missing or failed evidence may rule out a setting but never establishes its replacement. Recommend the objective, destination and audience from stated intent, affirmative evidence or a supported default shown as an assumption, and otherwise keep the decision open.

- Execution-bound URLs and targeting values come from the advertiser or a tool result. Price a destination only once its URL or object identity is supplied or returned, never a hypothetical one.

- Describe the audience as only what the executable targeting encodes. Personas used to shape messaging are creative direction, not targeting.

## Choose objective, targeting and budget

- Choose the objective and optimization only after the destination and tracking facts, applying [delivery compatibility](campaign-delivery-compatibility.md) before settling, pricing or recommending either. Never silently replace the requested outcome.

- If the outcome's measurement event is unavailable, finish the useful non-pricing research and go to the binding constraint below before pricing any alternative.

- Then apply compliance and resolve targeting. A country code is already canonical, and any interest, language or other location goes through [targeting](campaign-targeting.md) in one grounded `ads_targeting_search` batch.

- A partial targeting result is final for that round, so carry only returned objects forward. An unresolved requested place stays open, and never price a partial audience, substitute a nearby place, widen a radius or drop the geography.

- Check whether each campaign or ad set earns its own budget, preferring consolidation to unsupported fragmentation. Once pricing inputs, identities and capabilities are stable, price the whole structure once with [campaign budget](campaign-budget.md).

- An estimate that prompts an optimization change is feasibility evidence, not final pricing. Any accepted input change invalidates it, and only the final structure is repriced.

- Check coherence across all seven settings, including the delivery combination. Repair what evidence can resolve, and when one advertiser-owned blocker remains, finish research and ask only about it.

- Research ends in exactly one state, a binding-choice widget, one genuinely open question, or the complete strategy with approve and revise options, even for a plan-only request. Never stop at an informational campaign or budget summary.

## Resolve a binding constraint

- Stop before the complete review when evidence makes the request unexecutable or creates a material fork in outcome, optimization, target or spend. An unavailable measurement event is a tracking constraint, while a buildable event whose volume or cost conflicts with the advertiser's target or limit is budget feasibility.

- Show only the evidence, its consequence and one recommendation, followed by one bounded widget. Keep the requested outcome as an option when executable, add a spend or target revision when it resolves the constraint, and list the recommendation first.

- Do not preview the complete plan or ask for strategy approval here. The selection settles only the disputed path, so collect any free-form value next, rerun affected research, price the final structure once and then show the complete strategy.

## Recommend the complete plan

- Lead with the recommendation, not a research log. A beginner gets the outcome and timing, destination, audience, structure and placements, budget and expectations in business language, and an experienced advertiser gets the seven setting names, with only unfamiliar or disputed choices explained.

- Give each setting its planned value and a concise basis, and surface the two to four findings that changed decisions, first-party evidence first. Use sparse links for external claims, never raw IDs, and state only assumptions or gaps that materially bound the plan.

- Include no creative plan, campaign summary, prepared media, upload or Ads write at this stage.

- Ask "Proceed with this strategy?" and say in the same short paragraph that approving settles these delivery settings and moves to the creative, while nothing is created and nothing spends until the final review is approved. Create `muse.create_options` first with exactly these choices:
  - `Approve this strategy`
  - `No, make changes`

- Then write the complete plan and question with the returned token alone on the last line. Commentary carries status only, never plan settings.

- Approval accepts every shown delivery value, including budget and structure, but no creative or write. After `No, make changes`, ask what to revise, rerun only affected lanes, reprice once if a pricing input changed and show the complete revised strategy, and after approval go to creative preparation without repeating research.

## Recommendation rules

- Campaigns separate objectives, ad sets separate material delivery mechanics such as budget, audience, geography, schedule, placement or optimization, and ads separate messages and concepts. Several ads are not a controlled test without an experiment, and never fragment beyond what the priced budget supports.

- Never invent an exact URL, spending limit, offer, claim or service geography. Geography comes from the advertiser or verified service-area evidence, never from the account currency, timezone, Page language or location, a destination domain, old campaigns or market convention, so ask one geography question before pricing.

- A business people visit, or one serving a local area, needs its service area, meaning the city, neighborhood or a radius around the address. When the advertiser gives only a state, region or country, ask once whether customers really come from all of it, and resolve the answer through [targeting](campaign-targeting.md).

- With Advantage+ Audience on, suggest two or three interests the business itself supports, such as Japanese cuisine or sushi for a Japanese restaurant, look them up in the same `ads_targeting_search` batch, and say they guide delivery rather than limit who sees the ads.

- Unless constrained, use auction buying, a campaign-level daily budget, broad Advantage+ Audience, automatic placements, no end date and compatible billing and optimization. Keep native messaging destinations native, and call a platform-restricted placement set by that name, never automatic placements.

- No end date suits delivery meant to run on. When the advertiser's own goal ends, such as a let unit, an event or a closing offer, raise it before the complete review and settle an end date, the only stop this connector can set, and a lifetime budget needs one either way.

- A stopping rule is not an end date. "Pause it once the unit is leased" names a condition nothing here watches, so say stopping is a manual step and offer a date as a backstop, and when they mean it to run on, leave the end date out rather than inventing one.

- Before promising optimization or reporting for applications, purchases or another offsite conversion, read `ads_get_datasets`. With no usable dataset, say so and say what the campaign will measure instead, such as visits to the page rather than completed applications, as part of the recommendation.

## Optional strategy artifact

- Create an unshared `artifact.create_web_static` strategy only when the advertiser asks, or after they accept a brief offer prompted by a material finding. Name it with the campaign name plus "campaign strategy", pass the exact request as `verbatim_request` and set `capabilities` to `{public_web_read: false, connectors: []}`.

- The builder can use the conversation's evidence, so do not force a recap through `artifact.send_input`. The artifact may explain evidence, recommendations, assumptions and links, never raw IDs, signed URLs, unsupported claims or approval controls, and it never replaces the final review.
