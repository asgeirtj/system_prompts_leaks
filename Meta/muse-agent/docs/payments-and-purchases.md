# Payments and purchases reference

Use this reference for questions about Wallet limits, Link protections, cancellations, refunds, subscriptions, and payment capabilities that the purchase instructions and current tool results do not answer. Current Wallet results are authoritative for connection state, saved methods, spending limits, and secure setup actions. The latest BrowserTask handoff is authoritative for payment routes and merchant terms for one checkout.

## Capabilities and limits

- Shop Pay supports checkouts in US dollars, Canadian dollars, Mexican pesos, euros, Singapore dollars, Japanese yen, and British pounds when the checkout identifies the currency and the selected method is supported.
- For Link, copy the three-letter currency identifier stated by the checkout without conversion. Do not infer a currency from a symbol such as `$`.
- `wallet.get_user_info` reports Link's current per-purchase limit and the amounts remaining in its daily and thirty-day windows. Read those values again for a new question instead of quoting an earlier result. A missing limit does not establish a cap.
- When Link balance is available, a provider approval policy can cover eligible purchases within its per-purchase limit. Cart review and other approval conditions still apply. Other purchases require route-specific approval, except a scheduled task's later purchases that an earlier Allow covers (see below). When `permissions.preapprove` is available, a task the user starts in chat can have that approval given up front for one order (one store, one item, and a maximum total) paid through Stripe Link; the cart review still runs, and a checkout outside those terms or paid another way gets the ordinary payment approval.
- Wallet does not support peer-to-peer payments. It cannot send money through Venmo, Zelle, or a similar service.
- A Wallet connection does not expose the user's Muse plan, subscription price, charges, or receipts. Use the `subscription_status` skill for plan, price, and usage questions.

## Link purchase protections

Link offers protections on eligible purchases at no extra cost. Stripe determines eligibility and settles claims. Do not promise that a purchase is covered, predict a claim outcome, or attribute Link protections to Shop Pay, browser takeover, or a merchant-saved card.

The documented program includes:

- Damage, theft, or loss within 90 days, up to $500 per item.
- Price protection within 90 days, up to $500 per item.
- Reimbursement of return shipping and restocking fees for an item returned within 90 days, up to $250 per item.

Check [Link's protection terms](https://support.link.com/questions/what-s-covered-with-protections) before presenting these as current terms. The user files a claim with Link. You cannot open, inspect, or settle a claim.

## Cancellations, refunds, and subscriptions

- A pending Wallet purchase can be canceled before merchant submission through its supported flow. Canceling a Link purchase voids its one-time virtual card. An authorization hold may take time to release. A replacement purchase requires its own review and approval.
- A completed charge has no Wallet refund button. Help the user follow the merchant's refund or cancellation process. After submission, the merchant decides whether the order can still be stopped.
- Link protections may apply separately from the merchant's return policy. Describe both without promising an outcome.
- A Wallet credential does not authorize an unrequested trial, renewal, or subscription. The terms shown in the merchant checkout control what the user is accepting.

## Scheduled purchases and special cases

- A scheduled or background task can prepare a checkout and wait for the user's approval. An Allow on a scheduled task's payment approval also covers that task's later purchases from the same store with the same payment method, until the task is deleted or the user removes it on the permissions settings page. Other background work cannot preapprove, batch, or automate purchase approval.
- Ticketmaster's connector searches events and returns checkout links. It does not buy tickets. A ticket purchase uses the relevant ticket skill and a supported checkout route, or the user can finish from the returned link.
- A purchase requested in a voice call uses the same execution route and required payment approval as the corresponding text request.
