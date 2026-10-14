# Meta Ads — account and object scope

An advertiser routinely reaches more than one ad account, and an account
routinely holds more than one catalog, product set, feed, audience, or
experiment. Answering for the wrong one is not a partial answer — it is a wrong
answer that looks right, because the numbers are real and only the subject is
wrong.

<!-- BEGIN shared-meta-ads-account-scope — canonical copy; guarded by scripts/check-shared-skill-blocks. -->

## Account scope discipline — HARD

**One account, one answer.** Once the conversation establishes which ad account, business, or catalog the user is asking about — whether they named it, you resolved it, or an earlier turn fixed it — every tool call, every entity you reference, and every insight you surface must belong to it. Do not widen to sibling accounts, do not cross-reference entities from another account, and do not merge figures from several accounts into one undifferentiated number.

**Resolve before you ask.** If the request maps to exactly one account in context, use it — do not re-ask. Call `ads_get_ad_accounts` and match the user's wording against `ad_account_name` (case-insensitive, ignoring punctuation) rather than asking for an ID they would have to go look up. Ask only when the request does not settle on one and several accounts are reachable: either several plausibly match what the user said, or they named no account at all. A bare "my ads", "my campaigns", or "how am I doing" while more than one account is reachable is an ambiguous request, not a licence to answer for all of them — let the user choose. Never silently pick one, and never answer for several when the user meant one.

**Ask once, by name, and stop.** When the request does not settle on one account, ask a single direct question that names the candidates and stop for an answer — do not run the analysis on a guess and caveat it afterwards. Name each candidate by its `ad_account_name`, or its `business_name` when that is empty, falling back to the `ad_account_id` only when both are empty; add the id to names that would otherwise be identical. Offer the four most likely and say how many other accounts you can reach, so the user can name one you did not list. Resolve the answer back to an `ad_account_id` from the `ads_get_ad_accounts` output before continuing, and ask again rather than guessing when nothing matches.

**Discovery questions are not ambiguous.** When the user asks which accounts or catalogs they have access to, answer directly from the listing tools — do not make them pick one first. This rule governs answers about data *inside* one account, not questions about the set of accounts itself.

**An explicit cross-account ask is answered per account.** When the user's own words reach across accounts — "all my accounts", "across my accounts", "compare my two accounts", "which account is doing best" — do it: query each and attribute every figure to the account it came from, so a per-account breakdown carries any total you state. This applies only where the user asked for the span; it never licenses widening a request that named no account. What stays banned is the unattributed blend: a single number, entity, or verdict that silently spans accounts the user cannot separate.

**Access-error fallback may name other accounts.** When a tool returns an access or privacy error for the target account, listing the user's other reachable accounts as alternatives is expected and permitted.

<!-- END shared-meta-ads-account-scope -->

## Access is a precondition, not a fallback

When the user names an account but not its ID, resolve it through
`ads_get_ad_accounts` and analyze only a returned match. When the user supplies
an explicit `ad_account_id`, or a successful Ads call already established one in
this conversation, a read-only tool may use that ID directly; do not relist
accounts merely to verify it. A successful result establishes readable scope.
If the direct read returns an access or privacy error, say plainly that you
cannot reach the account and stop; only then list reachable accounts when useful.
Writes still follow the stricter target verification in `references/writes.md`.
Do not report metrics, estimates, comparisons, or any characterization of an
account after an access failure.

Two fields on each `ads_get_ad_accounts` entry gate what you may do next:

- `is_ads_mcp_enabled` — when false, do not use that `ad_account_id` or any ad
  object under it in a later call. Every such call is refused as "not enabled
  for the Ads MCP", so check the flag before the first call on an account,
  including one the advertiser named by id.
- `is_queryable` — when false, do not call `ads_get_ad_entities` for that
  account; surface `not_queryable_reason` instead.

First resolve any account fixed by the request or established context against
the full listing. If it is returned with `is_ads_mcp_enabled` false, say that
account is unavailable for Ads here and never substitute another account. For a
single-account request, offer any eligible accounts and stop; for an explicit
cross-account request, continue only with requested eligible accounts and mark
the others unavailable without comparing or characterizing them. For a
single-account request whose scope remains unresolved, filter disabled accounts
before deciding ambiguity and silently use the sole eligible account. This
filtering does not apply to account-discovery or listing requests.

Each entry also carries `ad_account_id`, `ad_account_name`, `business_id`, and
`business_name`. The business fields reflect the **owning** business only — an
account shared with an agency may have other businesses with access that are not
shown. An empty `business_id` means no owning business. When `next_cursor` is
non-null there are more pages; pass back the exact cursor the previous call
returned.

When you list accounts, group them under their owning business when they span
more than one, with accounts that have an empty `business_id` in a final "no
business" group. When they all share one business, skip the grouping. If many
come back, give the count and list the first several.

## One catalog, one answer

The rules above settle which *account*. They do not settle which catalog,
product set, feed, audience, or experiment, and the same discipline applies one
level down. This is stricter than it looks, because the detail tools are keyed on
the object id, not the account: a guessed `catalog_id` or `product_set_id` does
not error, it returns **another object's data under the user's question**.

**List before you ask, and only offer what came back.** Call the listing tool
first and build the options from its results. Never offer an object that a
listing tool did not return — not one the user named, and not one carried in
conversation context. Context can be stale or belong to another account; the
listing is the account's actual state.

**If the listing fails, stop.** A failed listing call is not a licence to build
the question from objects named earlier in the conversation. Say you could not
retrieve them and stop, per "a failed tool is not a finding" in  
`references/evidence.md`.

**If the listing returns one object, use it.** One catalog on the account is not
an ambiguous request however vaguely the user phrased it. Only ask when the
listing itself returns several that the user's wording does not separate.

**Never silently pick one.** Taking the first entry of a listing result is the
specific failure this rule exists to stop.
