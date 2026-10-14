# Shopify UCP Checkout

Load this file only after the user has selected one or more Meta catalog
products from the same Shopify merchant whose
`is_agentic_checkout_creation_enabled` fields are all exactly `true`.

The catalog flags route the flow; the checkout endpoint remains authoritative.
Use every selected product's exact `product_id`, capability fields, and `url`
from its catalog data. Bundle products only when their catalog URLs clearly
identify the same merchant storefront; matching brand labels are not enough.
Never mix merchants in one checkout. Treat a missing or null capability as  
`false`.

## Safety and input boundary

- `checkout create` moves no money. `checkout complete` creates the selected
  wallet spend request and places the order.
- `checkout complete` serves direct Stripe Link. It also serves direct Shop Pay
  when the checkout supports direct completion. Shop Pay uses the
  provider-approved credential and does not expose card details on this path.
  If direct completion is unavailable, use the browser route instead. On either
  browser route, the browser task places the order, so do not call `checkout
  complete`.
- Run `checkout complete` at most once for a checkout and only in the
  foreground. Never create a wallet spend request separately, background
  completion, poll it, or retry it automatically.
- A denial is the user's decision. Stop without placing an order. A later retry
  requires a new explicit user message.
- CLI inputs are JSON files with snake_case keys. Omit unknown optional fields
  and empty strings. Never carry endpoint-derived merchant, item, total, buyer,
  fulfillment, or legal-link data into completion input.

## Cart (optional)

A pre-purchase draft, never required — `checkout create` takes `items[]`
directly. Reach for one only when the basket must survive the turn: the user is
still adding or removing, or wants to come back to it later.
`shopify-ucp-cli cart --help` covers the subcommands; carry the `cart_id` from
`agent_state.cart_id` and treat it as opaque. Four things --help does not tell  
you:

- `cart update` replaces the whole basket — that is how an item is removed, and
  why a partial list deletes the rest. Unsure you have every item? `cart get`
  first and rebuild from `cart.line_items[]`.
- One cart, one merchant. A cart spanning two is refused outright:
  `multiple_merchants_not_supported`, "All cart line items must belong to the
  same merchant." Start a separate cart rather than retrying.
- `cart` accepts a catalog `product_id` or the variant GID it echoes back;
  `checkout create` accepts catalog ids only. A resumed cart can be revised but
  not checked out until you search again for its catalog ids.
- Nothing links a cart to a checkout: it supplies items only. Cancel it once
  `checkout complete` returns `ok: true`, or once a browser task reports the
  order placed; nothing else closes it, and there is no way to enumerate the
  ones you left open.
- Cart, checkout, and order reads preserve provider timestamps and add semantic
  UTC and user-local forms such as `checkout_expires_at`, `order_placed_at`,
  and `order_event_occurred_at`. Do not treat an order-status message time as a
  delivery time.

## Create the checkout

Confirm every product, exact variant, and quantity. Gather the buyer email
required to create the checkout. Include other buyer details only when they are
already known. Never guess or fabricate a value. Checkout creation moves no
money; save final purchase approval for the completed quote.

Creation needs no payment method. Do not resolve Link, connect a wallet, or ask
about payment before this call. The user picks the payment route after the
checkout exists, under *Choose the payment route* below.

Create one JSON file containing every selected product. Use each catalog
`product_id` as `items[].item_id`; use one entry per distinct variant and fold
repeated identical IDs into its quantity. Quantity defaults to `1`. Do not add
a merchant field: the endpoint resolves the merchant from the catalog IDs. The
endpoint requires buyer email and USD. Include phone and address fields only
when known. Native completion additionally requires a trusted cardholder first
or last name and billing/shipping address with street, city, state, postal code,
and ISO alpha-2 country.

Before this call, use buyer details already known from the conversation and
`~/USER.md`. Ask only for a missing email, because the endpoint requires it.
Do not ask for a name, phone number, or delivery address before checkout
creation.

After the user selects a wallet route, follow the Wallet setup sequence in
Payments & Wallet before asking the user for missing checkout details.
If checkout creation omitted the required name or address, pass the retrieved
values to the browser route. `checkout update` cannot add them, so do not use
direct completion for that checkout.

```json
{
  "buyer": {
    "email": "<email>",
    "phone_number": "<phone-string>",
    "country_code": "<country-code>",
    "address": {
      "first_name": "<first-name>",
      "last_name": "<last-name>",
      "street1": "<street1>",
      "street2": "<street2>",
      "city": "<city>",
      "state": "<state>",
      "postal_code": "<postal-code>",
      "country": "<country-alpha-2>"
    }
  },
  "items": [
    {"item_id": "<product_id-1>", "quantity": 1},
    {"item_id": "<product_id-2>", "quantity": 2}
  ],
  "currency": "USD"
}
```

```sh
HATCH_SHOPPING_PRODUCT_CONTEXTS='[<each product hatch_telemetry_context, copied verbatim>]' shopify-ucp-cli checkout create --input-file "<checkout.json>" --format json
```

Copy each runtime-authored context whole, including its eligibility flags, in
the same order as `items`. Set that same environment value on every
`shopify-ucp-cli` checkout, cart, and order command for this purchase attempt.
It is read only by local telemetry and is not sent to Shopify.

Put the complete item set in this initial create call. `checkout update` cannot
add or remove products. Do not use the separate `cart` commands to assemble
this checkout.

Inspect the authoritative create response before branching on the catalog
completion capability. A returned `continue_url` does not by itself require a
browser handoff because checkouts ready for direct completion may also include
one.

If create returns an error or rejects the item, explain the result and offer
browser checkout from the original catalog `url`; do not retry automatically.
When the user accepts, follow
`/opt/hatch/skills/shopping/references/browser-checkout.md`. Set `stage` to
`agentic_fallback` and `reason` to `agentic_create_failed`.

Only a successful create response with a usable `.agent_state.checkout_id` may continue below. Save that checkout ID. The CLI stores the endpoint-derived checkout behind the trusted runtime boundary. Inspect `.result` without copying its trusted fields into later commands.

A response carrying `requires_escalation`, `status: "redirect"`, or a note that
buyer detail is still missing is a successful create when it returned a
checkout ID. Do not treat it as an error. It does not say which route's brief to
send, so ask the route question before handing off.

Take the checkout URL now, from `.result.continue_url` or
`.result.checkout.continue_url`. Use only a value the endpoint returned. When
it is absent, fall back to one selected product's original catalog `url` from
that merchant rather than inventing one.

## Choose the payment route

The checkout exists and moves no money yet. Keep a route the user already
selected. Otherwise, ask with `muse.create_options` and wait. Offer Shop Pay
with provider `shop-pay`, Link with provider `stripe-link`, and `Use another
method` through browser takeover. A connected provider, saved default, or
available method does not select a route.

After the user chooses, follow *Route after creation* to decide whether
checkout continues directly or through a BrowserTask.

As soon as a wallet route is settled, record it once before calling any wallet
or browser tool:

```sh
shopping payment-lane-selected --lane <shop-pay|stripe-link> --selection-source user --product-contexts-json '[<each product hatch_telemetry_context, copied verbatim>]'
```

Emit one lane once. Do not emit it again when browser or direct completion
starts. If this best-effort command fails, continue the checkout unchanged.

After recording the route, follow the Wallet setup sequence in Payments &
Wallet. Use the exact provider ID, payment-method ID, and masked label only for
this purchase. If the user declines setup or no usable method remains, return
to route selection. Connection and method selection do not approve the
purchase.

When the route question is needed, ask it before any other message that follows
creation. Ask it even when the create response reports `requires_escalation`,
`status: "redirect"`, a missing shipping address, no delivery options, or a
total that is not final. None of those says which route the user wants. Do not
offer to open the checkout in the browser before the answer arrives, because
that offer picks the route.

On escalation, redirect, or a name or address missing at creation, say
alongside the available options that the browser will finish this checkout and
collect what is missing. Missing delivery options and an unsettled total are
ordinary direct-checkout work under *Refresh delivery and totals* below, so do not say
the browser will place the order for those.

When the user selects `Use another method`, load
`/opt/hatch/skills/shopping/references/browser-checkout.md`. Continue the
existing checkout in a BrowserTask from the exact checkout URL. Include the
user's payment choice in the brief without including card details. State that
the user will enter payment during browser takeover.
Set `stage` to `agentic_fallback` and `reason` to `user_selected_browser`. The
user chose this route; no provider limit forced it.

If the user does not choose, stop and wait. Do not select a route for them.

## Route after creation

For a selected wallet route, take the first branch that matches:

1. The user selected Shop Pay with an exact saved method: use direct completion
   only when every selected product's
   `is_agentic_checkout_completion_enabled` is exactly `true`, create did not
   report `requires_escalation` or `status: "redirect"`, and the checkout carries
   the required name and address. Otherwise use the browser Shop Pay route below
   with the exact connected payment method. Finish connection or setup in the
   parent first.
2. The Stripe Link route, and create reported `status: "redirect"`,
   `requires_escalation`, or messages that explicitly require buyer input or
   review: the browser, carrying Link. Take this branch regardless of  
   `is_agentic_checkout_completion_enabled`.
3. The Stripe Link route, and any selected product's
   `is_agentic_checkout_completion_enabled` is not exactly `true`: the browser,
   carrying Link.
4. The Stripe Link route, and the checkout was created without the name and
   address direct completion requires: the browser, carrying Link.

Otherwise every selected product's `is_agentic_checkout_completion_enabled` is
exactly `true`, and the direct Stripe Link flow below applies.

On any browser branch, briefly acknowledge the handoff and end the response
after delegating. Do not poll the browser task. Do not call `checkout complete`
for that checkout.

### Shop Pay, in the browser

Spawn the task with the Shop Pay route and the selected method's masked label.
Do not include the opaque `payment_method_id` in `task`. The trusted checkout
tool revalidates the exact selected ID against a fresh wallet read before
creating approval.

```js
{
  "task": "<what the user asked for, in their words>. Open <exact Shopify checkout URL> for <selected products>. The user selected Shop Pay for this purchase with saved method <masked card label>. Complete the purchase using these known choices: <color/size/quantity/other variants>. Ask only for missing required purchase choices. Shipping preference: <deadline/budget/speed, or none>.",
  "shopping_checkout": {
    "products": [<each product hatch_telemetry_context, copied verbatim>],
    "stage": "payment_lane",
    "reason": "shop_pay_selected"
  }
}
```

Resolve the Shop Pay connection and exact method before delegating. BrowserTask
does not call wallet tools or discuss another payment route. Follow
`/opt/hatch/skills/shopping/references/browser-checkout.md` for continuation.

### Stripe Link, in the browser

Use the exact Stripe Link method selected above, then spawn the task. Identify
the provider and saved method with the exact provider ID and masked label. Do
not include the opaque payment-method ID in `task`.

```js
{
  "task": "<what the user asked for, in their words>. Open <exact Shopify checkout URL> for <selected products>. Use provider stripe-link with saved method <masked label>. Use these known choices for every item: <color/size/quantity/other variants>. Ask only for missing required purchase choices. Continue through checkout and hand off the exact final terms before submission. Shipping preference: <deadline/budget/speed, or none>.",
  "shopping_checkout": {
    "products": [<each product hatch_telemetry_context, copied verbatim>],
    "stage": "agentic_fallback",
    "reason": "<provider_requires_browser | agentic_completion_ineligible | buyer_details_required | stripe_link_unavailable>"
  }
}
```

Choose the reason from the first matching *Route after creation* condition.
Do not use a post-create fallback reason for an initial browser route.

Follow `/opt/hatch/skills/shopping/references/browser-checkout.md` for
continuation.

### Stripe Link, completed directly

Use the exact Stripe Link method selected above, then continue with the direct
flow.

## Use the selected wallet

Reuse the selected provider and exact payment method resolved above. Do not ask
the route question again. If the selected method is no longer available, stop
before completion or browser delegation and return to *Choose the payment
route*. Do not substitute another route. A browser route taken because Stripe
Link cannot complete this checkout uses `stage: "agentic_fallback"` and  
`reason: "stripe_link_unavailable"`.

## Refresh delivery, discounts, and totals

If the checkout offers delivery options, select one. With more than one, if the
user stated a shipping preference (a deadline, budget, or speed) or the options
are trivially close, pick the best fit and tell the user which you chose;
otherwise present the options with their price and delivery estimate and let the
user choose. Update the trusted quote before completion:

If the checkout requires independent delivery choices for different item
groups, do not attempt direct completion; continue in the browser from the
returned checkout URL with `stage: "agentic_fallback"` and  
`reason: "provider_requires_browser"`.

```json
{
  "checkout_id": "<checkout-id>",
  "selected_delivery_option_id": "<delivery-option-id>"
}
```

```sh
HATCH_SHOPPING_PRODUCT_CONTEXTS='<same JSON array used for create>' shopify-ucp-cli checkout update --input-file "<update.json>" --format json
```

To apply promo or coupon codes, pass the complete desired set in
`discount_codes`. Use codes the user supplied, or codes found during a deal
search the user requested. Do not invent codes or interrupt every checkout to
ask for one. Omit `discount_codes` to preserve the checkout's existing codes;
use an empty array to clear all codes. Delivery selection and discount codes
may be changed in one call:

```json
{
  "checkout_id": "<checkout-id>",
  "selected_delivery_option_id": "<delivery-option-id>",
  "discount_codes": ["<promo-code>"]
}
```

A discount-only update needs only `checkout_id` and `discount_codes`. Report
applied discounts, `result.checkout.rejected_discount_codes`, and the refreshed
total; rejected codes can be present even when `ok` is `true`. A checkout
without delivery options skips delivery selection, not a requested discount
update.

## Review and complete

Use the exact saved method selected above. If the user asks to switch methods,
return to exact saved-method selection in Payments & Wallet. Do not ask the
user to confirm a switch they just requested.

Show the completed quote with the masked method, items, final total, and
delivery choice. Present this quote as the purchase review under Purchasing
Flow. For Stripe Link, ask for explicit approval and wait. For Shop Pay, do not
ask for a separate chat confirmation. `checkout complete` requests the wallet
approval that serves as final purchase confirmation. A wallet connection and
an earlier request to buy are not approval for this quote. Then write
completion input containing only the trusted checkout ID, chosen wallet
provider, chosen payment-method ID, and selected delivery-option ID when one  
exists:

```json
{
  "checkout_id": "<checkout-id>",
  "wallet_provider": "<stripe_link-or-shop_pay>",
  "payment_method_id": "<selected-wallet-payment-method-id>",
  "selected_delivery_option_id": "<delivery-option-id>"
}
```

Include `wallet_provider` in every completion input: use `"stripe_link"` for
Stripe Link or `"shop_pay"` for Shop Pay. For Shop Pay use the exact
instrument ID returned by `wallet.list_payment_methods`. The Shop Pay branch
keeps credentials inside trusted payment workers. The provider CLI creates the
payment approval. When the merchant supports direct Shop Pay,
the runtime adds that approval ID to the selected credential and submits it
to the merchant. If direct Shop Pay completion is unavailable, use the browser
route instead of producing card details. The runtime does not receive
a separate buyer identity token.

Omit `selected_delivery_option_id` when the checkout has no delivery selection.

```sh
HATCH_SHOPPING_PRODUCT_CONTEXTS='<same JSON array used for create>' shopify-ucp-cli checkout complete --input-file "<complete.json>" --format json
```

Read the top-level `ok`: `true` means the order was placed; `false` means it was
not. Never paste raw `.result` JSON or expose internal IDs, API fields, buyer
contact information, or shipping-address details. Summarize only available
user-facing fields: order status, products, merchant, final amount, delivery
estimate, and confirmation link. If completion fails after card save or reports
an unknown outcome, do not claim no order was placed and do not retry or switch
to browser checkout automatically.
