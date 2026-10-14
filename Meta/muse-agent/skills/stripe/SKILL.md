---
name: "stripe"
description: >-
  Manage a merchant's Stripe customers, products, coupons, promotion codes, payments,
  invoices, and recurring subscriptions. Use for billing-plan changes, payment links,
  refunds of duplicate card charges, disputes and chargebacks, account balances,
  payouts, and reconciling processing fees through Stripe's official MCP server.
icon: "connectorStripe"
metadata: { "includeInPrompt": false }
---

# Stripe

Use the installed `stripe` CLI. Start with `stripe status`. If it reports
`not_connected`, run `stripe authorize-url` and share only the returned
`connect_url` with the user.

OAuth uses Dynamic Client Registration and PKCE through authd. Stripe issues a
per-VM public client, so no shared credential enters Muse and credentials must
never be requested in chat.

Run `stripe list-tools` to inspect the live provider catalogue and schemas,
then call an advertised tool with:

```text
stripe call-tool --name <tool> --arguments-json '<json-object>'
```

The OAuth connection identifies the merchant account. Never ask the user for
that connected account's `acct_...` ID. If another tool requires
`stripe_context`, first call the advertised `list_available_accounts_or_orgs`
tool with an empty arguments object and use a context it returns. If more than
one context matches the requested live or test mode, present their names and
ask the user which account to use; do not ask them to paste an account ID. Never
invent a context or call an account-scoped tool without one returned by Stripe.

`list-tools` exposes only reviewed Stripe tools and includes each tool's
`hatch_permission`, `hatch_action`, and `hatch_permission_label`. Unknown or
new provider tools remain unavailable until reviewed. For `stripe_api_write`,
the returned schema lists the reviewed `stripe_api_operation_id` values and
their operation-specific permission overrides; unlisted operation IDs are not
available. Read permissions follow the user's connector settings; Stripe API
writes and feedback require granular approval. Stripe may also require
confirmation through a provider URL for sensitive operations. Do not retry a
failed or timed-out write automatically because its side effect may have
completed.
