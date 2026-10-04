# Campaign planning — explicit guided mode

Read this only when the advertiser explicitly asks to work step by step, decide
one setting at a time, or review recommendations as research develops. Do not
offer guided mode or switch into it merely because a decision is uncertain.

## Establish the foundation

If the advertised product or event is too unclear to research, ask only the
natural missing product facts. Use one picker only when one bounded answer is
enough; ask a related free-form bundle without a widget otherwise.

Resolve the account and Page under `account-scope.md`: silently use one clear
match, ask one named picker when several remain, and continue plan-only when no
account is available. Read Pages only with `ads_get_ad_account_pages` unless a
real returned `business_id` makes broader business scope necessary. Confirm a
material Page/destination brand mismatch with only `Use <Page>` / `Choose
another Page`. Before recommending or pricing placements that may deliver on
Instagram, resolve a compatible Instagram identity or exclude Instagram.

Use the conversation's compact discovery, describe only selected current-stage
tools, and make normal `call-tool --agent-output` reads. Consume Ads JSON
directly.

## Research and ask one steer

Research only enough to ground the next consequential decision. Start with
`ads_insights_advertiser_context` when exposed. Read entity history only when
that context is absent or lacks a fact that could change the current decision,
or when a named entity must be resolved. Discard mismatched product, objective,
destination, audience, or season history. Read tracking, destination,
audiences, performance, benchmark, and live policy/help only when they can
change the current steer. Defer asset inventory, market-pattern work, and all
Ad Library research to `campaign-creative.md`.

Connect two to four decision-bearing findings to the next unresolved
consequential decision, often objective or positioning, then ask one bounded
non-budget question and stop. Write brief evidence → implication →
recommendation prose, not a setup report, capability inventory, or process
narration. Mention a limitation only when it changes the choice. Identity
confirmation is a separate stop.

After the answer, rerun only affected evidence and settle remaining material
non-budget inputs one decision at a time. An explicit same-context direction
may settle a steer when evidence does not challenge it; `use your
recommendation` alone does not.

Resolve objective and optimization from intent, destination, and returned
tracking facts, and read and apply `campaign-delivery-compatibility.md` before presenting
that steer or pricing it, then resolve compliance. If the selected audience includes a
creation-bound interest, language, or non-country location, read
`campaign-targeting.md` and resolve it before pricing. Broad Advantage+ remains
the default when the advertiser did not narrow.

Missing or failed evidence may rule out a setting but does not establish its
replacement. Keep an unresolved or incompatible delivery tuple as the next
steer and make no Ads create call.

Do not mention or price budget, prepare media, or present a complete plan during
a non-budget steer. The renderer-owned full settings summary remains reserved
for final create review.

## Separate budget steer

When objective, optimization, geography, audience, placements, schedule,
budget mode, hierarchy, and advertiser constraints are stable, read
`campaign-budget.md` and make one whole-plan pricing call. Present its exact
amount and basis plus only useful forecast, source/confidence, and limitation;
keep other settings backstage unless needed to identify the proposal.

Render the applicable budget paths from `campaign-budget.md`. A normal steer
uses `Use <amount>` (or `Keep <amount>`) and `Change the budget`; a material
outcome, optimization, target, or spend fork uses that file's alternatives. The
selection settles only the budget or disputed path. Every successful guided
pricing result ends in this steer, including a supplied, history-derived, or
otherwise settled amount; never use the full-research strategy approval here.
Collect any required amount next and reprice after a material input change. Once
accepted, route to `campaign-creative.md` without a full strategy recap.
