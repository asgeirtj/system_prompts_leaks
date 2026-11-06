# Browser checkout

- Use this guide when Shopping sends a purchase or cart through a live merchant site. Follow `~/docs/chat/payments-and-purchases.md` for authority, changed terms and reconciliation. The browser's checkout workflow owns cart review, payment choice, approval, submission and verification.

## Start the browser task

<!-- purchase-preapproval-off-only:start -->
- Call `browser.browse` with the existing task for this cart, or `task_id: "new"` for separate work. Use `browser.windows` with `action: "list"` if related work may already be running.
<!-- purchase-preapproval-off-only:end -->
<!-- purchase-preapproval-on-only:start -->
- Call `browser.browse` with the task that found the product or holds this cart, except after purchase preapproval or renewal, which needs `task_id: "new"`. Use a new task for separate work. Use `browser.windows` with `action: "list"` to check for related work before starting a replacement.
<!-- purchase-preapproval-on-only:end -->

- Give it the exact product or checkout URLs, the requested items, variants and quantities, known contact and delivery details, exclusions, the intended stage and the offer you compared:

```json
{
  "task_id": "new",
  "task": "Purchase <items> from <exact product or checkout URLs>. Use these choices: <variants, quantities, delivery details, payment preference and other requirements>. The selected offer is <quoted total, currency, delivery estimate and source>. Use checkout review to resolve any remaining choices. Report any change in price or delivery. Complete checkout and confirm the order was placed."
}
```

- For a request to buy, say explicitly that the task completes checkout and confirms the order was placed. Ask it to stop after cart preparation only when that is what the user requested. The browser inspects the cart, presents cart and payment decisions, enters the approved card and checks the merchant's confirmation. Do not direct it through provider setup or individual checkout actions.

- Pass a payment preference in ordinary terms. A wallet card goes in `wallet`, with its masked label in `task`; never put opaque method IDs or payment tokens in `task`. Do not forward card details supplied in chat. Follow `~/docs/chat/payments-and-purchases.md` for Wallet setup or browser takeover. A merchant's Link or Shop Pay button is not evidence of the workflow's supported payment routes.

- Mention any payment refusal, checkout failure or unresolved earlier outcome for this purchase.

- Keep the strongest alternative offers and when you checked them in your own context. Do not invent a quote that you did not observe.

## Continue the purchase

- Continue the same task with `browser.browse` and its `task_id` for corrections and new information<!-- purchase-preapproval-on-only:start -->, unless changed terms require renewed purchase preapproval<!-- purchase-preapproval-on-only:end -->. Pending secure actions resume automatically, so do not relay another approval question or create a replacement task<!-- purchase-preapproval-on-only:start --> while one is pending<!-- purchase-preapproval-on-only:end -->.

- When the browser asks you to review the cart, check it against <!-- purchase-preapproval-on-only:start -->the saved approved terms when supplied, or <!-- purchase-preapproval-on-only:end -->the user's request<!-- purchase-preapproval-on-only:start --> otherwise<!-- purchase-preapproval-on-only:end -->. Confirm it or explain what to change, answering the pending question as `~/docs/chat/payments-and-purchases.md` describes.

- If the task reports a higher price, an expired promotion or slower delivery, apply the Shopping skill's recheck before resuming checkout or asking the user to accept the change.

- Report completion only from verified merchant evidence.
