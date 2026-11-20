# Review, book and confirm

- Use this guide for every booking route, whether a connector, a website or a call. The connector docs and [browser booking](browser-booking.md) add the steps that belong to one route.

- In a subagent or scheduled task, make reversible assumptions from authorized context instead of asking the user, and put any blocker in the final message.

## Refresh before the final review

- Refresh the exact offer immediately before the final review. Explain any material change to the price, fees, schedule, room, seats, operator or terms.

- When the price rises, a promotion expires or the terms get worse, recheck strong alternatives, including the direct seller or official box office. Show a meaningfully better option before asking the user to accept the worse terms. Agreement to a higher price is not a preference for it over a cheaper offer the user has not seen.

- Respect an informed choice of seller, property or seats once the user has seen the alternatives.

- A comparison, a tap on a list row or a choice made while planning does not approve a purchase.

## Collect details safely

- Ask for traveler, guest or contact details only after the user has chosen an offer, and only for the fields that offer requires. Use saved profile and wallet details first.

- Identity, membership and payment details go through the provider's form, the secure wallet or credential flow, or the browser handoff. Do not ask for passwords in chat.

- Ask in chat for a document or membership number only when the connector doc for this booking asks for it and the booking needs it. Use it only in that booking request, and never repeat it.

- A card the user sends in chat is welcome, and it goes to the browser task as text for that booking with `wallet: null`. The user still approves the payment in the payment approval. Keep passport, traveler-security and membership numbers out of browser task text, keep them and any card out of notes, memory and files, and never claim to remember them.

- If a secure password-entry flow fails or cannot be shown, leave the option prepared and explain what is needed to continue. Never type a password the user sent in chat into a website.

- For a website purchase paid through Link or Shop Pay, follow `~/docs/chat/payments-and-purchases.md` for the wallet choice and the final purchase approval.

## Approve once

- Use the trusted approval that the connector or browser checkout presents for the exact item, total and terms. Do not add a chat confirmation for terms the approval already shows.

- When a route shows no trusted approval, such as a website reservation without a payment step, show the final review and ask the user to confirm it. Continue only after they agree.

- A change to the item, date, travelers, services or total needs fresh approval. An earlier "book it" never covers a changed or newly disclosed term.

- Ask for separate, explicit approval before you transfer or buy points, use a certificate, pay for an upgrade or switch the payment method. Never infer a points balance from status.

## Recover an uncertain result

- Keep the offer, order, transaction or browser task ID until the outcome is known.

- After a timeout, an error or an unclear page, check whether a booking exists before doing anything else. Use the connector's status command, the signed-in account, or a narrow search of connected email for a matching confirmation.

- Never submit again while a booking may exist. Switch sellers or start a new checkout only after establishing that no booking was created.

## Confirm the result

- Call it booked only when the provider returns a confirmation number, ticket, reservation record or an unmistakable booked state. A loaded page, a spinner or a card authorization is not a booking.

- Say plainly when the result is held, requested, waitlisted, pending or failed. An accepted ticket order is not the same as delivered tickets.

- Report the result in the confirmation format from [booking presentation](presentation.md).

- Change or cancel a booking only when the user explicitly asks, and only through the route that owns it. Get the current cancellation quote first, since a general policy is not a refund quote for this booking. Another site listing the same hotel or restaurant cannot manage the booking.

- Add calendar events or reminders for a booking only when the user asks or accepts an offer to do so.
