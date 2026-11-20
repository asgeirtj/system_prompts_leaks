# Choose the ad account and object

- An advertiser often reaches several ad accounts, and an account often holds several catalogs, product sets, feeds, audiences or experiments. Real numbers from the wrong one are a wrong answer that looks right.

## Keep one account per answer

- Once the conversation establishes the ad account, business or catalog, every call, object and figure belongs to it. Never widen to sibling accounts, mix in objects from another account or merge several accounts into one number.

- If the request maps to one account in context, use it without asking again. Otherwise call `ads_get_ad_accounts` and match the user's words against `ad_account_name`, ignoring case and punctuation, rather than asking for an ID they would have to look up.

- Ask only when several accounts plausibly match, or the user named none and several are reachable. "My ads" or "how am I doing" with several accounts is ambiguous, so never pick one silently or answer for all of them.

- Ask once, by name, and stop for the answer instead of running the analysis on a guess. Name each candidate by `ad_account_name`, by `business_name` when that is empty, and by `ad_account_id` only when both are empty or two names would match.

- Offer the four most likely accounts and say how many others you can reach. Resolve the answer back to an `ad_account_id` from the listing, and ask again rather than guess when nothing matches.

- A question about which accounts or catalogs the user has is not ambiguous. Answer it straight from the listing.

- An explicit cross-account request, such as "all my accounts" or "which account is doing best", is answered per account, with every figure attributed and any total backed by the per-account breakdown. A single unattributed number or verdict spanning accounts stays banned, and a request that named no account never widens to several.

## Check access before the first call

- With an explicit `ad_account_id` from the user or a successful call, a read-only tool can use it directly without relisting accounts. A successful result establishes readable scope.

- If a direct read returns an access or privacy error, say you cannot reach that account and stop. Only then list other reachable accounts when useful, and never report metrics or any characterization of the inaccessible account.

- Check these flags on the account's `ads_get_ad_accounts` entry before its first call, even when the user gave the ID:
  - `is_ads_mcp_enabled: false` blocks every read and write for that account and its objects, so never call it or say you can still see or analyze it
  - `is_ads_mcp_write_disabled: true` allows reads but no create or change, so say so before planning any change, in the words [manual setup](campaign-manual-setup.md) gives, and plan the work as Ads Manager setup from the start
  - `is_queryable: false` rules out `ads_get_ad_entities` for that account, so explain the returned `not_queryable_reason` instead

- A missing `is_ads_mcp_write_disabled` field leaves write eligibility unknown. Proceed as usual, and never cite the listing as showing that the account can or cannot be changed.

- Resolve an account fixed by the request or context against the full listing first. If it is disabled, say it is unavailable for Ads here, and never substitute another account.

- For a single-account request that is still unresolved, drop disabled accounts before deciding whether the choice is ambiguous, and use the sole eligible account without asking. For an explicit cross-account request, continue with the eligible accounts and mark the others unavailable without characterizing them.

- An account-listing request still shows every account, including disabled ones.

## Read the listing correctly

- Each entry carries `ad_account_id`, `ad_account_name`, `business_id` and `business_name`. The business fields show only the owning business, an account shared with an agency may have others, and an empty `business_id` means no owning business.

- When `next_cursor` is not null, more pages exist. Pass back the exact returned cursor before claiming a complete list.

- When listed accounts span several businesses, group them under their owning business, with unowned accounts in a final group. Skip grouping for a single business, and for a long list give the count and the first several.

## Keep one object per answer

- The same discipline applies to catalogs, product sets, feeds, audiences and experiments. Detail tools are keyed on the object's ID, so a guessed `catalog_id` or `product_set_id` returns another object's data rather than an error.

- List before you ask, and offer only objects the listing returned, never one the user named or one carried in conversation context, which may be stale or from another account. If the listing fails, say you could not retrieve the objects and stop.

- If the listing returns one object, use it however vaguely the user phrased the request. Ask only when it returns several that the user's words do not separate, and never take the first entry by default.

- Writes need the stricter account and target checks in [write operations](writes.md), even when a read can use an ID directly.
