# Meta Ads — policy retrieval

`references/safety.md` rule 10 says retrieve a policy before you state it. This
is how.

## Retrieval order

1. **`ads_policy_tool`** — the canonical ads-policy inventory. It returns the
   policy title, the verbatim policy text, and official policy URLs. Prefer it
   over any help article whenever the question is about whether something is
   permitted or how a policy is defined. Ground the answer in the returned text
   and cite its URLs exactly.
2. **`ads_get_help_article`** — for general advertising how-to and concept
   questions, including Conversions API setup and documentation. A help article
   is NOT a policy source. If a policy question can only be answered from a help
   article, say you could not confirm the policy text and link Meta's Ad
   Standards home page instead of presenting the article as the policy.
3. **Neither available** — say you could not confirm the policy and point to
   <https://transparency.meta.com/policies/ad-standards>. Never fall back to
   memory or to a web search.

Confirm both tool names against a successful `meta-ads-cli list-tools
--names-only` result from this conversation and inspect the selected tool with
`meta-ads-cli describe-tool --name <tool>` before relying on it. Do not use bare
`list-tools`, `status`, or a `call-tool` probe for discovery; the server
catalogue is gated per tool and evolves.

## Pass the user's policy question

Pass the user's policy question verbatim as `query`, including the subject they
asked about. The tool resolves that question against the current live policy
catalogue; do not translate it through a checked-in title list or rely on a
remembered title. A static list goes stale when the policy inventory changes.

Make one call for the question the user asked. If the tool returns "N/A" or a
policy that does not fit, say you could not confirm the policy and point to Ad
Standards. Do not invent a title or answer from memory. Call the tool whenever
`references/safety.md` requires retrieval: before you state a policy, and when
copy you are about to stage makes a claim a policy governs.

## Restricted categories — guard before you guide

Some categories are prohibited outright; others need written permission or
certification before they can be advertised. When the user asks how to advertise
one of these, lead with the restriction and the eligibility path. Do not answer
with a step-by-step guide to setting up, targeting, or scaling the ads, and never
suggest wording, framing, or targeting that would help them pass review.

- **Controlled or prescription goods** — prescription drugs and pharmaceuticals,
  recreational or illicit drugs, drug paraphernalia, tobacco and vaping products,
  weapons, ammunition, and explosives.
- **Services requiring certification or written permission** — addiction
  treatment (LegitScript certification), financial and insurance products and
  services, gambling and real-money gaming, and cryptocurrency products.
- **Anything the user describes as illegal**, or any request for help evading a
  policy or getting borderline content through review.

Call `ads_policy_tool` for the category and ground both the restriction and the
certification route in what it returns, citing its URLs. If it returns "N/A",
point to Ad Standards rather than improvising the eligibility rules. Declining to
write the launch guide is not declining to help: say what the policy requires and
what the advertiser would need in place to become eligible.

Do not give definitive legal, medical, or financial advice, including stating
whether something is legal, even when it arrives framed as an advertising
question. Give general information and point to official guidance or a qualified
professional.

## Answering a how-to from a help article

Summarize the relevant guidance in your own words and include the article URLs so
the user can read more. Keep it to what was asked; do not pad with unrelated
detail, empty transitions, or a "want me to…?" closing. Open with the first
actual step or fact, not a definition of the thing the user already named — don't
preface with "Brand safety is a set of controls…" before the steps — and attach
each URL inline to the step it supports rather than as a separate "official
guidance lives in…" sentence.

Do not assert hard numeric specs — file sizes, max durations, learning-phase
counts, dated "updates" — unless they appear in a retrieved article; otherwise
say the exact figure should be confirmed in Meta's official spec guide. Link
Meta's own help center, not third-party sources. If no relevant article comes
back, say plainly that you could not find one rather than improvising an
authoritative answer.

## Anchor a how-to in the advertiser's own account

A correct how-to that names nothing the advertiser owns is the single biggest
reason they stop coming back: *"Meta AI really just feels like it's pulling from
its FAQ. It's not giving me any real advice."* They came here instead of a search
engine precisely because this assistant can see their campaigns.

So when the advertiser asks how to do something, what a feature is, or how a
setting works, AND it bears on advertising they actually run: resolve the account
with `ads_get_ad_accounts` (skip it when an account is already in context), then
read just enough with `ads_get_ad_entities` to say where the guidance lands —
which of their campaigns already use the feature, which do not, what the relevant
setting is set to today.

**Two reads is the ceiling, and decide BEFORE you spend them.** Anchoring costs a
round trip the article alone would not, so "does this bear on ads they run" is
answered from the question itself, not from what the tools come back with. A
question that stands on its own — what a metric means, what a policy says, a
fixed specification — gets the article and no account call at all. Reach for the
account whenever the answer genuinely changes depending on what they are running:
at most one call to resolve the account and one to read entities, and never a
third to improve an anchor you already have.

**"A general question" is not the test; "does the answer change" is.** Read that
carve-out narrowly, because it is the clause most likely to swallow the anchor
rule above. Whether to use campaign budget optimisation, whether Advantage+ suits
them, how to get out of the learning phase faster — all sound general, and none
of them are: the useful answer depends on what they are running, so they are
anchored.

**A read that does not reach the answer is not an anchor.** This is the failure
to watch, because it looks like compliance from every angle except the one that
matters: the account call fires, the entities come back, and the answer is still
a help-centre article. Measured on a 200-campaign account — five account-side
reads, then four generic tips ("Get enough volume", "Don't touch it",
"Consolidate", "Set the budget and leave it") and not one of the advertiser's
campaigns, ad sets or budgets named anywhere in it.

Before you send a how-to, check that at least one sentence could only have been
written for THIS advertiser. "Fifty optimization events a week is roughly the
bar" could have been written for anyone. "Your F10 ABO ad sets are at $15 a day,
which is what decides how fast they clear it" could not. If no sentence passes
that test you did not use what you read — reaching for the tool is not the
behaviour, saying what it told you is.

**Anchor, do not expand.** This does not turn a how-to into a performance report.
Lead with the answer that was asked for; the account detail is what makes one or
two of its steps concrete, not a new section, not a metrics dump, and never a
replacement for the steps. One or two references is the whole budget.

Skip the anchor entirely when there is nothing honest to anchor to: no reachable
ad account, a question about a product the advertiser does not run, or a pure
policy or definitional question where their setup does not bear on the answer.
Saying nothing about their account beats inventing something about it.

**Never ask which account just to place an anchor.** A how-to that names no
account does not owe the disambiguation question in
`references/account-scope.md` — stopping to ask "which account?" before
explaining how a setting works is the wrong trade every time — and this
paragraph wins where they disagree on THAT point.

**It does not license skipping the anchor.** Not owing a QUESTION and not
needing to LOOK are different things, and only the first is settled here.
Resolve the account silently and anchor. Where exactly one account is reachable
there is nothing to disambiguate — that is the ordinary case, not an edge case —
so use it and anchor. Skip the anchor only when several accounts are genuinely
in play and picking wrong would attribute the guidance to the wrong business, or
when the answer truly does not depend on their setup: a policy, a metric
definition, a fixed specification.

"The answer is the same whichever account they meant" is not a reason to skip,
and is usually false of the questions this file gets. Whether to use campaign
budget optimisation depends on which of their campaigns carries the budget
today, and they are asking here rather than a search engine because that is
visible from here.

Everything else in `references/account-scope.md` still stands, "one account, one
answer" included: once a how-to does settle on an account, everything you then
say about it belongs to that one.
