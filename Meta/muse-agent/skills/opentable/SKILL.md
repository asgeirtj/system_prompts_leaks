---
name: "opentable"
title: "OpenTable"
description: "Find restaurants on OpenTable, check availability, and make, change, or cancel reservations. Use for restaurant booking and live reservation data."
icon: "opentable"
metadata: { "includeInPrompt": false }
---

# OpenTable

For a user-facing restaurant search or booking, first read  
`/opt/hatch/skills/booking/SKILL.md`,  
`/opt/hatch/skills/booking/references/restaurants.md`, and
`/opt/hatch/skills/booking/references/presentation.md`. Those files define the
end-to-end booking, fallback, and presentation rules. Use this file for the
OpenTable CLI contract. Keep reservation choices in plain Markdown. Do not call
`create_options` or a comparison/list widget during a restaurant booking.

## Connecting
OpenTable needs a one-time in-chat consent before any command returns data. Run
`opentable status`. For a direct reservation request, if it is `not_connected`,
recommend connecting OpenTable as the preferred low-friction path and post the
exact returned `connect_url`. Do not invent one. Explain briefly that this
enables live availability, saved-profile use, and smoother booking. Do not wait
idle for the connection or make it a prerequisite: continue the same request
through the venue's official reservation link, another reputable platform, and
`phone.place_call` when available. If the user connects after a fallback path
started, follow the duplicate-protection rule in
`/opt/hatch/skills/booking/references/restaurants.md` before resuming the
OpenTable request. If status is `unavailable`, skip the connection offer and
use those fallback paths immediately. If the request is specifically to connect
OpenTable rather than reserve a table, post the link immediately and wait for
the user to connect. Disconnect with `opentable disconnect`. Do not send the
user to Settings.

## Common flows

### Find a table
Use `lookup-rid` to resolve a named restaurant or discover restaurants by city, cuisine, and price. When the city is known, include `--city`. If there is no clear match, vary the restaurant name or adjust the filters. For example, try common spacing or punctuation variants, pass only the city name to `--city`, or drop `--country-code`. Keep the requested location fixed.

Then use `search-availability` to check open tables for the requested time and party size.

### Book
After `search-availability`, resolve the exact slot from the user's request.
Use authorized stored contact details when available; ask only for the name,
email, or phone fields still required at checkout. Then book with
`book-reservation` (it locks the slot and books in one step).
After `book-reservation` returns a confirmation, offer to remind the user 30 minutes before the reservation. If they accept or choose another lead time, use `cron.add` to create a run-once reminder for their chosen time, resolved from the confirmed reservation time.

### Modify
Find the new time with `search-availability`, resolve the exact requested slot, then update with `modify-reservation-with-lock`. Needs the reservation's confirmation id.

### Cancel or look up a reservation
Use `cancel-reservation` or `get-reservation`, both by the reservation's confirmation id.

### Book an experience
Find it with `list-experiences`, check times with `search-availability --include-experiences true`, resolve the exact requested experience and slot, then book with `book-reservation --experience-json` (include the experience `id` and `version`).

## Other commands
The flows above cover the common cases. For anything else (a restaurant's policies, seating and dining-area options, releasing a stuck slot lock), run `opentable --help` for the full command list and `opentable <command> --help` for its flags.

## Rules
- Before `book-reservation` or `modify-reservation-with-lock`, resolve the exact restaurant, date, time, and party size. Before `cancel-reservation`, resolve which reservation the user means. For a booking, take the user's name, email, and phone from an authorized profile or the user. Invoke the resolved command directly so connector policy can present any required approval. Do not add a duplicate chat confirmation. A clear, unambiguous cancellation may proceed without an additional confirmation. Do not guess missing details.
- Read results add UTC and user-local semantic fields when OpenTable supplies
  an offset-bearing reservation or hold timestamp, plus runtime-generated
  `retrieved_at`. A date/time without an offset is restaurant-local civil time;
  do not guess a timezone or convert it.
- `book-reservation` verifies the booking with OpenTable before reporting success. Only report the booking as confirmed when the result explicitly says it is confirmed; a confirmation number alone is not proof. When it is confirmed, say so without hedging, mentioning provider lifecycle states, or predicting a later status transition. If OpenTable requires another action, explain what is needed instead of retrying. If the booking is unconfirmed or cannot be verified, say that plainly, keep the confirmation reference, and never retry automatically. Offer only the OpenTable continuation or recovery link returned by the command; the link itself never proves confirmation, and you must never invent one.
- For reservation lookups, summarize the returned status in a natural sentence (for example, "Your reservation is confirmed"). Never quote result field names or provider-internal status fields. Describe cancelled, completed, no-show, or unknown results in the same plain language.
- When OpenTable returns a reservation-management link, include it exactly once as the only web link in the final reply, on its own last line. Do not also link the restaurant profile; multiple links prevent Hatch from rendering the management card.
- Only tell the user a booking, change, or cancellation went through when the command returns a confirmation. If it fails or comes back empty, say so plainly instead of inventing a confirmation or a workaround.
- A result carrying `resource_authorization` with `persisted: false` means the OpenTable operation succeeded but the main agent could not confirm that its authorization was stored. Do not automatically repeat a mutation. Give the user the confirmation number and explain that the main agent may not be able to manage it later. Reads are safe to retry except after a rate-limit response.
- Make only one OpenTable connector call at a time. Do not batch calls, run them in parallel or in the background, or put them in shell/Python loops or retry wrappers.
- If an OpenTable command returns HTTP 429 or says it was rate limited, stop making OpenTable calls for this task and report the partial result. Never repeat `book-reservation`, `modify-reservation-with-lock`, or `cancel-reservation` after a rate limit because the mutation may already have applied. If the result includes a confirmation reference, a later task may retry only `get-reservation` after the returned `retry_after`, or after 60 seconds if the response has no value.
- A reservation the main agent did not book may not be reachable by `get-reservation`, `modify-reservation-with-lock`, or `cancel-reservation`. If one of those commands is refused, say so and point the user to opentable.com or the restaurant. Do not retry with a different rid or confirmation id.
- Attribute each reservation task to OpenTable. Mention OpenTable when presenting availability. Mention it once more in the final result only when that clarifies who owns the reservation. Do not repeat it in intermediate updates or use promotional language.
- Only add special requests the user gave you (dietary needs, allergies, seating). Do not put unrelated personal data in the booking.
- If `lookup-rid` finds no match after the applicable retries, stop the
  OpenTable attempt without checking availability or inventing a rid. If the
   user asked only whether the venue appears on OpenTable, report that result.
   If the user intends to reserve, continue with the `Search and route` section
   in `/opt/hatch/skills/booking/references/restaurants.md`.
- If `search-availability` returns `no_availability_reasons`, tell the user why in plain language rather than showing the raw code.
- Present restaurant results through  
  `/opt/hatch/skills/booking/references/presentation.md`.
- Keep messages focused on the outcome. Do not quote the command you ran or plan to run, `rid`s, tokens, slot-lock state, or raw result codes like `not_connected` or `NoTimesExist`. Tell the user the outcome in normal words. The OpenTable attribution described above is user-facing. It is not an internal implementation detail.

## Limits
- The connector cannot book a slot that needs a card, deposit, or prepayment. These show up as a `cancellation_policy` on the slot in `search-availability`, or an experience marked `prePaymentRequired`. When these requirements are present, or a booking is rejected for needing a card, continue the same reservation with `browser.spawn_task` following `/opt/hatch/skills/booking/references/browser-booking.md`. Use the returned `booking_url` with `ref=19075` added if missing, or the restaurant's `profile_url` if no booking URL is returned.
- Bookings are for 1 to 20 diners. For a larger party, tell the user to arrange it with the restaurant directly. Do not book a smaller table or split the group to fit.
