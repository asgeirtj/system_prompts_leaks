# Recover an uncertain Duffel result

- Use this guide when `validate-booking`, `book` or `cancel-booking` returns anything other than a clean success or a validation error.

- For a Link `requires_action` result, share a link only when `user_action.kind` is `open_url`, using `user_action.label` as the text and `user_action.url` as the destination. An `action_url` inside `provider_response` is the provider's raw link, not one meant for the user. Without `user_action`, report the blocker and stop.

- When the resolution is `auto_resume`, share the action link once. After the user completes it, rerun the identical `book`.

- When the resolution is `replacement_required`, share the link and stop. After the user completes it and asks to continue, search again and get a new purchase approval instead of rerunning the old `book`.

- When the resolution is anything else or missing, share the link and stop, without assuming the request can resume.

- A `failed`, `terminal_status` or `unsupported` Link result ends the attempt; another spend request would start a new purchase, so report it and stop.

- Before any approval or submission for this purchase, correct validation errors; for an expired offer, search the itinerary again and present fresh terms for approval.

- After approval or submission for this purchase, follow the returned outcome's recovery rule. Expiry does not resolve booking or funding uncertainty or permit retry or replacement.

- An `approved_credential_unresolved` result means stop. Explain that payment credentials are unavailable and this attempt stopped before submitting a booking, and that any card authorization or hold is unknown. While the state is unresolved, another `book`, a retry or a replacement purchase could charge the user twice, so the attempt ends here.

- A missing charge or hold, or renewed permission to buy, does not prove that the payment state is resolved. This checkout cannot resolve it and has no supported recovery action or verified escalation destination. Tell the user that limitation; there is no known time or condition that makes the payment resolved.

- `checkout_receipt_unverified` means the attempt is closed, but its saved receipt does not establish whether a booking or payment occurred. Report both as unknown and stop. A missing booking or charge, elapsed time or renewed permission doesn't resolve it, and a retry or replacement purchase could duplicate one that already went through.

- `checkout_preparation_rejected` preserves a known traveler-profile requirement during 3DS preparation. This attempt did not submit its order or payment; earlier bookings and funding remain unverified. Explain the required profile details and stop. Updating them or renewing permission does not resolve funding uncertainty or permit another purchase.

- `checkout_pricing_stopped` means checkout stopped before 3DS and no order was sent. With `reason: purchase_terms_changed`, the card charge, selected seats or selected bags changed after approval, and `changed_fields` says which; with `reason: quote_unavailable`, the approved price couldn't be confirmed. Tell the user which one. With `next_step: requote`, the approved payment was cancelled and this checkout is closed; if the user still wants the flight, rerun `validate-booking` and then `book`, which asks for a fresh approval at the current price. If that `book` stops again with only `charge_amount` changed while the refreshed total, seats and bags are unchanged, the card charge itself differs from the approved price, so another checkout stops the same way: don't repeat it; explain that and offer the airline's own site. Without it, stop: the approved payment may still be open, so rerunning `book` or `booking-status` can't continue this checkout, and another purchase could leave two payments open. A later `book` only retries confirming a cancellation that had started, with `reason: cancellation_resumed` and no new price check, and returns `next_step: requote` once it is confirmed.

- `held_payment_failed` preserves Duffel's failed status for the listed payment attempt on an existing order. Report those references and that status without inferring the current order status, other payments, refunds or hold release. Stop there, since another payment or a replacement purchase could duplicate effects that are still unknown.

- `order_submission_rejected` means Duffel created no order for this submission, and this checkout is closed: rerunning `book` on the same offer, even with another card, returns the same rejection. Its `next_step` says what that allows. `requote` means the fare changed or is gone, and `change_payment` means the card was declined; for either, offer a new search and book the new offer only after a fresh approval, or the airline's own site. `fraud_rejected` means Duffel flagged the booking as a fraud risk, so another attempt here is likely to be refused too; offer the airline's own site. `fix_request` means the result doesn't say what Duffel objected to, so report the rejection and offer a new search with a fresh approval, or the airline's own site. `check_existing_booking` means Duffel reports an earlier booking or attempt for this offer, so run `booking-status` and leave the offer unbooked. An earlier attempt with an unknown outcome stays unresolved either way.

- `merchant_outcome_unknown` leaves the submission unconfirmed, so a booking or payment may have gone through. Stop there; another `book` or a replacement purchase could duplicate it. A missing `booking-status` order or renewed permission doesn't resolve it.

- `supplier_confirmed_details_pending` means the supplier reports confirmation, but booking details are still pending. Tell the traveler their reservation was reported confirmed and the booking reference and ticket details aren't available yet; ticket issuance and settled payment are still unconfirmed. `booking_outcome_unknown` means confirmation is still unknown. Neither permits another `book` call or a replacement purchase.

- Keep the returned `checkout_operation_id` and original `offer_id` for recovery. `/opt/hatch/bin/duffel booking-status --checkout-operation-id OPERATION_ID --offer-id ORIGINAL_OFFER_ID` reads saved evidence, including after restart or offer expiry, and while the outcome is unresolved, including `supplier_confirmed_details_pending`, it asks Duffel whether that offer has an order. When Duffel has one, the result is the booking receipt with its booking reference. `provider_lookup: no_order_yet` means Duffel shows no order yet; an accepted booking can take time to appear, so this doesn't prove there is no booking. An immediate re-check won't change the answer; a check in a later turn may find it. Other `provider_lookup` values leave the outcome unknown. `observation_persistence: unconfirmed` means the response distinction may not survive restart; unavailable or absent evidence doesn't prove there is no booking. Refreshing the offer won't recover the purchase.

- A timeout, a 5xx, `result_unknown: true` or an error saying the outcome is unknown or unconfirmed means the booking or cancellation may already have happened. `booking-status` is the first step; resending `book` or `cancel-booking` could act twice, and the outcome stays unknown until a status read shows it.

- An uncertain customer-profile creation has not started payment. Ask for profile recovery instead of creating the profile again.

- After a partial split purchase, report the completed booking references and every unpurchased leg, then stop buying or cancelling until the user decides.

- A success with `resource_authorization.persisted: false` is still a booking. Report it and warn that later management may be unavailable; booking again would create a second booking.

- The same offer with the same booking data is the same checkout and can resume, except after `checkout_pricing_stopped`. A new offer starts another checkout and may place another hold, so it is a new purchase for the user to choose, not a retry.

- After success, report every carrier booking reference and ticket status from the receipt. A loyalty account marked `not_confirmed_on_order` is unconfirmed, not rejected. Suggest checking with the airline using the booking reference; rebooking would buy a second ticket.
