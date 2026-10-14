# Browser Checkout

Use browser checkout when the Purchase workflow sends a purchase through a
product or checkout page. Use this reference to start and continue the
BrowserTask.

## Start the browser task

Call `browser.spawn_task` with the exact product or checkout URLs and every
choice already made for this purchase:

```json
{
  "task": "Purchase <items> from <exact product or checkout URLs>. Use these choices: <variants, quantities, delivery details, payment choice, and other requirements>. Ask only for missing required item or checkout choices. Continue through checkout and hand off the exact final terms before submission."
}
```

When a wallet route is selected, include its exact provider ID. When a saved
method is also selected, include its masked label. Do not include the opaque
payment-method ID in `task`. Include a payment refusal or checkout failure when
one already occurred. When no route is selected, omit one. The runtime adds
checkout-supported providers to the BrowserTask handoff.
Do not ask the BrowserTask to infer providers from checkout buttons. When the
user selects Link with a condition such as "if it is there" or "if available",
pass `stripe-link` as the selected provider. Do not turn that condition into a
requirement for a merchant Link button. Browser checkout permits `Use another
method` through browser takeover. Present that choice with the other eligible
routes. When the user selected it,
state that they will enter payment during browser takeover. Do not include card
details.

## Add catalog route information

Some products returned by `shopping product-details` include a
`hatch_telemetry_context`. For those products, add `shopping_checkout` to the
browser task. Copy each product's complete `hatch_telemetry_context` into
`products` without changing it. This information records why browser checkout
was used. It does not change the checkout.

Set `stage` and `reason` from the situation that started the browser task:

| Situation | `stage` | `reason` |
|---|---|---|
| Agentic checkout creation was unavailable, and `checkout create` was not called | `checkout_start` | `agentic_creation_ineligible` |
| The user chose browser checkout before `checkout create` was called | `checkout_start` | `user_selected_browser` |
| Shop Pay must finish in the browser | `payment_lane` | `shop_pay_selected` |
| `checkout create` failed | `agentic_fallback` | `agentic_create_failed` |
| The user chose browser checkout after `checkout create` | `agentic_fallback` | `user_selected_browser` |
| The selected provider requires browser checkout | `agentic_fallback` | `provider_requires_browser` |
| Agentic checkout completion was unavailable | `agentic_fallback` | `agentic_completion_ineligible` |
| The browser must collect required buyer details | `agentic_fallback` | `buyer_details_required` |
| Stripe Link was unavailable for agentic completion | `agentic_fallback` | `stripe_link_unavailable` |

Do not add `shopping_checkout` for a product found only by the browser.

Example:

```js
{
  "task": "<self-contained browser checkout task>",
  "shopping_checkout": {
    "products": [<complete hatch_telemetry_context for each catalog product>],
    "stage": "checkout_start",
    "reason": "agentic_creation_ineligible"
  }
}
```

## Continue the purchase

Follow the acknowledgment returned by `browser.spawn_task`. Continue the same
task with `browser.steer_task`. Do not replace it with a new task during wallet
setup or confirmation.
