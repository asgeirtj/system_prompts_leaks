# Stripe

- Stripe runs payments for the user's own business. Run `/opt/hatch/bin/stripe`, which reaches Stripe's official MCP service. Paying a merchant as a shopper is the separate Link by Stripe connector.

## Connect

- Run `status`. If it reports `not_connected`, run `authorize-url` and share only the returned `connect_url`.

- The sign-in flow handles OAuth without any shared credential, so never ask for API keys, tokens or app credentials in chat.

## Find and call a tool

```text
/opt/hatch/bin/stripe list-tools
/opt/hatch/bin/stripe call-tool --name <tool> --arguments-json '<JSON object>'
```

- `list-tools` returns only reviewed tools, each with its live schema and `hatch_action` showing whether Muse treats it as a read or a write. A new provider tool stays unavailable until it is reviewed.

- `call-tool` makes one provider call and returns Stripe's response under `result`. Follow any pagination fields in that response to read further.

- For `stripe_api_write`, use a `stripe_api_operation_id` listed in the returned schema, each with its own permission override. An unlisted operation is unavailable even when Stripe supports it elsewhere.

## Select the account

- The connection identifies the merchant account, so never ask for its `acct_...` ID. When a tool needs `stripe_context`, call `list_available_accounts_or_orgs` with `{}` and use a context it returns.

- If several contexts match the requested live or test mode, show their names and ask which to use. Never invent a context or call an account-scoped tool without one that Stripe returned.

## Change merchant records

- Reads and invoice previews follow the user's connector settings. Other API writes and feedback ask for approval, operation by operation.

- Some sensitive operations also need the user to confirm at a URL that Stripe returns. Share that URL, then check the result before reporting completion, because approval in Muse does not show that Stripe completed the action.

- Coupons can be created, updated and deleted, and promotion codes can only be created. Read their current schemas before making a change.

- Never retry a failed or timed-out write automatically, because its effect may have happened. Check the record or operation status first.

## Related skills

- [Bookkeeping and Invoicing](/opt/muse/skills/business-finance/SKILL.md)

- [Store Operations](/opt/muse/skills/store-operations/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
