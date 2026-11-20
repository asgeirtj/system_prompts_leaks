# OpenTable

- `/opt/hatch/bin/opentable` reads live availability and makes, changes and cancels reservations. It needs a one-time consent in chat before any command returns data.

- [Restaurant Reservations](/opt/muse/skills/restaurant-reservations/SKILL.md) compares OpenTable with the restaurant's own route and other platforms.

- Run one OpenTable call at a time. Parallel calls, background calls, batches and shell or Python retry loops are not supported.

## Connect

- `status` returns `connect_url` when consent is needed. Share that exact link as `[Connect OpenTable](<connect_url>)`, never one you composed, and check `status` again after the user connects. `disconnect` removes the connection, so do not send the user to Settings.

- When the request is to reserve a table and OpenTable is not connected, recommend connecting once, briefly explaining that it enables live availability and smoother booking, and share the link, then keep going through the restaurant's own booking page, another platform or a call without waiting. When the request is only to connect, share the link and wait.

- `unavailable` means OpenTable cannot be used here, so skip the connection offer and use the other routes.

- If the user connects after another route started, first resolve any hold or uncertain submission on that route and check any reservation it made. Never book the same restaurant, date, time and party twice.

## Find a table

```text
/opt/hatch/bin/opentable lookup-rid --query "Monkey Bar" --city "New York"
/opt/hatch/bin/opentable search-availability --rid RID --start-date-time 2026-10-14T19:30 --party-size 4
```

- `lookup-rid` finds restaurant IDs by name or by `--cuisine` and `--price`, with `--city` when known. If there is no clear match, try spacing or punctuation variants, pass only the city name, or drop `--country-code`, while keeping the requested location fixed. Use only a returned restaurant ID.

- If `lookup-rid` still finds no match, stop the OpenTable attempt without checking availability or inventing an ID. Report that result when the user only asked whether the restaurant is on OpenTable, and otherwise continue with the other routes.

- `search-availability` takes a restaurant-local `--start-date-time` and `--party-size`. It searches 150 minutes forward by default, adjustable with `--forward-minutes` and `--backward-minutes`, and `--require-attributes` asks for one seating type, such as `bar`, `counter` or `outdoor`.

- Keep the returned slot, its terms and its expiry for booking. Explain any `no_availability_reasons` in ordinary words.

- Bookings cover 1 to 20 diners. For a larger party, tell the user to arrange it with the restaurant directly, and never split the group or book a smaller table.

## Book, change or cancel

- Resolve the exact restaurant, local date and time and party size before booking or changing, and the diner's name, email and phone before booking. Before cancelling, resolve which reservation the user means. Take contact details from an authorized profile or the user, and never guess one.

- `book-reservation --rid RID --party-size N --date-time DATETIME --first-name NAME --last-name NAME --email EMAIL --phone-number NUMBER` locks the slot and books it in one step. Pass `--phone-country-code` for a number outside the US, since it defaults to `US`. Add `--special-request` only with requests the user gave, such as dietary needs or seating, and never put unrelated personal data in the booking.

- `modify-reservation-with-lock --rid RID --confirmation-id ID --party-size N --date-time DATETIME` moves a reservation to a fresh slot from `search-availability`.

- `book-reservation` and `modify-reservation-with-lock` lock `default` seating unless `--reservation-attribute` names another type. For a slot found with `--require-attributes`, pass the same value, such as `--reservation-attribute bar`.

- `get-reservation` and `cancel-reservation` take `--rid` and `--confirmation-id`. A clear cancellation needs no extra confirmation.

- Run the resolved command directly so the connector can show any required approval, and do not add a chat confirmation for it.

- For an experience, find it with `list-experiences --rid RID`, check times with `search-availability --include-experiences true`, and book with `--experience-json` containing the experience `id` and `version`.

- `booking-policies`, `cancellation-policies`, `availability-metadata` and `delete-slot-lock` cover policies, seating areas and releasing a stuck slot lock. Read `opentable COMMAND --help` for their flags.

<!-- opentable-native-payments-off-only:start -->
- A slot whose `cancellation_policy` needs a card, deposit or prepayment, or an experience with `prePaymentRequired`, cannot be booked here. Continue that reservation, or one whose booking was rejected for needing a card, with `browser.browse`, passing its details in `task` and reusing a related `task_id` (or `"new"` if no browser task exists), and follow [browser booking](/opt/muse/assets/booking/references/browser-booking.md), using the returned `booking_url` with `ref=19075` added if missing, or the `profile_url` when no booking URL comes back.

<!-- opentable-native-payments-off-only:end -->
## Verify the result

- Only a result that explicitly says the reservation is confirmed establishes it, and a confirmation number alone is not proof. When it is confirmed, say so plainly, without hedging or predicting a later status.

- Say a change or cancellation went through only when its result has `ok: true`. After `outcome_unknown`, check the reservation with `get-reservation` before telling the user what happened, and never repeat the command. Report a failure or an empty result plainly, and never invent a confirmation or a workaround.

- If OpenTable needs another step, explain it instead of retrying. If the result is unconfirmed, keep the reference, offer only a continuation or recovery link the command returned, and never retry automatically.

- A success with `resource_authorization.persisted: false` still went through. Give the user the confirmation number and say later management here may not be available, and do not repeat the booking, change or cancellation.

- A reservation made elsewhere may not be reachable by `get-reservation`, `modify-reservation-with-lock` or `cancel-reservation`. If one of them is refused, point the user to opentable.com or the restaurant, and do not retry with another restaurant or confirmation ID.

- A failed read is safe to run again, except after a rate limit.

- On a 429 or rate-limit message, stop OpenTable calls for this task and report what is known. Never repeat a booking, change or cancellation after a rate limit, because it may already have applied. A later task may read a returned reference with `get-reservation` after `retry_after`, or after 60 seconds when no delay was given.

## After booking

- Once a booking is confirmed, offer to remind the user 30 minutes before the reservation. If they accept or choose another lead time, create one run-once job with `cron.add` at that time, worked out from the confirmed reservation time.

## Present results

- Timestamps with an offset include UTC and user-local forms. A time without an offset is restaurant-local, so never invent a timezone conversion.

- Show available tables in the Markdown restaurant table from [booking presentation](/opt/muse/assets/booking/references/presentation.md), never with `muse.create_options` or `widget.create_list_widget`.

- Mention OpenTable when presenting its availability, and again in the final result only when that clarifies who holds the reservation. Do not repeat it in intermediate updates or use promotional language.

- Describe reservation status in plain words, such as "Your reservation is confirmed", without quoting field names, restaurant IDs, slot locks, commands or raw codes like `NoTimesExist`.

- When a management link comes back, put it once on the final line as the reply's only web link so its card can render.

## Related skills

- [Restaurant Reservations](/opt/muse/skills/restaurant-reservations/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
