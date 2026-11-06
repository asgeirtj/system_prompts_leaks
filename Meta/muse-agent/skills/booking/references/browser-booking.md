# Book through a website

- Use a website when it offers a suitable option or a better way to finish the booking. Airlines, hotels, venues, agencies and booking platforms can differ in inventory, total price, terms and benefits.

- Use an existing authorized session when one is available. Offer sign-in when it can unlock or verify member pricing, credits, points or saved details. Continue as a guest when that meets the need, and never require a new account.

- Follow [checkout](checkout.md) for the final refresh, worse terms, approval, an uncertain result and confirmation.

## Research offers

- Give a research task started with `browser.browse` and `task_id: "new"` the exact dates, party with ages, room or seats, and the terms that matter. Ask it to return the complete offer, current total, terms, seller URL and time checked, without starting a checkout or holding inventory.

## Run one checkout

- Start one `browser.browse` task with `task_id: "new"` for the selected option and keep its `task_id` through review, changes, submission and verification. Continue it with `browser.browse` and that `task_id`. Carts, holds and sign-in belong to that session, so never start a competing checkout or start over after approval.

- Give the task the exact seller URL and every known non-sensitive choice. When the booking takes payment or requires a card guarantee, ask it to book; its checkout shows the user the payment approval before committing the booking. Otherwise, ask it to prepare the booking, hand back the verified final review and stop before anything that creates a reservation, charge, deposit, points transfer or cancellation penalty. It may place a free, cancellable hold that protects this booking. Tell the user about the hold and its expiry right away.

- Keep passport, traveler-security and membership numbers out of the task text. The website or user enters them in the secure field. A payment card the user supplies for this booking may go to the browser task as text with `wallet: null`, following `~/docs/chat/payments-and-purchases.md`. The user still approves the payment in the payment approval; keep card details out of notes, memory and files.

## Handle website snags

- Give custom date and party pickers the exact values in words.

- On a seat map, report the exact section, row, seat numbers and any obstructed-view note.

- Treat totals shown before the final review as provisional. If a hold expires before approval, refresh the inventory and terms.

- Use the supported sign-in or one-time-code path. Never bypass a site's controls.

- The browser solves CAPTCHAs without asking. Never ask the user to solve one. A site it cannot get past counts as blocked automation.

- If automation is blocked, try another authorized seller, a call when the phone tools are available, or a precise handoff with the exact link, the choices already made and what remains. A difficult checkout never justifies a different date, venue, property, seat, room, rate or price.
