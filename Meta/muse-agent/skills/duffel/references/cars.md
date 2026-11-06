# Duffel rental cars

- These commands apply to rental cars only; the flight sections of Duffel's `CONNECTOR.md` do not. [Trip Transport](/opt/muse/skills/trip-transport/SKILL.md) covers gathering inputs, airport pickups and comparing sources. Use the commands as written here rather than running `--help`.

<!-- duffel-rental-cars-only:start -->
## Search

- Resolve each place to verified coordinates with `map.geocode` (load the `map` namespace with `tool_search.load_tool_namespace` first) or another map source, and pass the primary driver's age on the pickup date and two-letter residence country. Times are local to each location.

```sh
/opt/hatch/bin/duffel car-search \
  --pickup-date 2026-10-12 --pickup-time 09:00 \
  --pickup-latitude 37.6213 --pickup-longitude -122.3790 \
  --dropoff-date 2026-10-15 --dropoff-time 18:00 \
  --dropoff-latitude 37.6213 --dropoff-longitude -122.3790 \
  --driver-age 31 --driver-country US | tee /tmp/sfo-cars.json
```

- Read the output as it prints. It is compact JSON for a shortlist, and `tee` saves it unchanged for the native list. Use a new file name for each search and keep the file, unedited, until the list is created.

- The output is `{ok, status, search_id, rates_total, rates_returned, suppliers, rates}`, where `rates_total` counts every rate Duffel returned before filters. Each entry of `rates` has `rate_id` (internal), `total_amount` and `total_currency`, `payment_type` (`postpaid`, `guarantee` or `prepaid`), `mileage` (`{type: "unlimited"}` or `{type: "limited", limit, unit}`), `supplier` (`name`, `logo_url`), `car` (`name`, `category`, `type`, `transmission`, `max_passengers`, `baggage` with `large` and `small`, `air_conditioning`, `fuel` and at most one image in `images`), `pickup_location` and `dropoff_location` (`name`, `access` as `in_terminal`, `shuttle`, `meet_and_greet` or `call_for_pickup`, `address`, `opening_hours` and up to two `additional_information` entries), and the local `pickup_date`, `pickup_time`, `dropoff_date` and `dropoff_time`. A field Duffel did not return is absent.

- `suppliers` lists every rental company among the rates that match the other filters, cheapest first, as `{name, rates, cheapest_total, currency}`. It ignores `--supplier`, so a company missing from it has no rate from this source for the search.

- `rates` is a shortlist of up to 10 in price order. It takes the cheapest rate of each company priced within 25% of the cheapest rate first, then the cheapest of each category and vehicle type. Narrow it with `--category`, `--vehicle-type`, `--transmission`, `--max-price` and `--supplier`, or change `--limit`. `--category` takes `mini`, `economy`, `compact`, `intermediate`, `standard`, `fullsize`, `premium`, `luxury`, `oversize` or `special`, and most also have an `_elite` form such as `compact_elite`. `--vehicle-type` takes `suv`, `crossover`, `four_door`, `two_door`, `wagon_estate`, `passenger_van` (a minivan or people carrier), `convertible`, `coupe`, `sport`, `limousine`, `pickup_regular_cab`, `pickup_extended_cab`, `commercial_van_or_truck`, `motor_home` and a few others; there is no `minivan` or `van`. `--transmission` takes `automatic` or `manual`. The CLI prints the allowed list for any other value, so correct the value rather than searching again with a guess. `suv` is a vehicle type, not a category. `--pickup-radius` and `--dropoff-radius` are whole kilometres from 1 through 100.

- When the user names a company, has a loyalty membership with one or asks for other companies, read `suppliers` and search again with `--supplier NAME` for each wanted company in `suppliers`, repeating the flag for several, such as `--supplier Avis --supplier SIXT`. Names match without regard to case. A company missing from `suppliers` needs a check on its own site; the website comparison in Trip Transport's rental-car guide still applies to the others.

- Keep pickup and drop-off coordinates distinct for a one-way rental. Zero results means only that Duffel had no inventory for that exact search, so ask before changing a location, date or time.

- A 429 rate-limit response ends Duffel calls for the current task. Report the limit and keep the query, radius and filters as they were.

- Quote the row the user picks by its `rate_id`. When the search output is no longer in view, search again with the same inputs.

## Show the rates as a list

- Load the `widget` namespace with `tool_search.load_tool_namespace` and make one `widget.create_list_widget` call. Set `language` to the reply language, title the list with the pickup place, such as "Rental cars at SFO", and put the local rental period in its `subtitle`.

- When several companies are priced close together, include at least one row from each, since the user may prefer one for its loyalty program.

- Give each rate one `type: "car_rental"` row whose `data` is `{"car_rates_file": "/tmp/sfo-cars.json", "json_pointer": "/rates/N"}`, where `N` is the rate's index in the saved `rates`. The runtime reads the rate from the file, so `data` holds only those two fields.

- Write `title`, `subtitle` and `tertiary_title` in the reply language: the exact returned vehicle name in `title`; the supplier, category or type, transmission, seats and bags in `subtitle`, plus the location type and estimated transfer time for an airport pickup or return; and the full total and currency, mileage terms and payment type in `tertiary_title`. Clients without rental-car cards show only these three lines.

```json
{"type":"car_rental","title":"Toyota Corolla or similar","subtitle":"Hertz · Compact · Automatic","tertiary_title":"$212.00 total · Pay at counter","data":{"car_rates_file":"/tmp/sfo-cars.json","json_pointer":"/rates/0"}}
```

- Leave out `image_url` and `icons`: the runtime takes the vehicle image and supplier logo from the saved rate.

- Use `present_now: false` and place the returned embed token in the reply instead of repeating the rows in prose.

- On clients with rental-car cards, a card opens the car's details, and its booking button sends a message naming the vehicle, supplier, rental period and total. Otherwise the rows are display only. Treat that message, or a choice by position or by the visible supplier and vehicle, as the user's pick, and resolve it against the search output before quoting.

## Quote and answer questions

```sh
/opt/hatch/bin/duffel car-quote --rate-id RATE_ID
```

- Quote the selected rate before collecting driver details. The quote adds the supplier's `conditions`, `charges` and `privacy_policies`. Answer questions about fees, deposit, excess, fuel, mileage, age rules, cancellation and pickup from the search row and the quote, quoting the supplier's wording, and say plainly when the quote does not state something, such as taxes or airport fees.

- Check that the returned payment type is `postpaid`. When the price, supplier, vehicle, dates, places, payment type or material terms changed from the search, show the difference before going further.

## Reserve

- Native reservation supports only a `postpaid` quote, paid at the rental counter. A guarantee or prepaid rate is booked on the rental company's site.

- Use the driver's legal name, birth date, email and international phone number from an authorized secure profile when one exists. Otherwise ask after selection, and use them only for this reservation.

- Check that the birth date gives the searched age on the pickup date, since age can change the price, young-driver fees and eligibility. When it disagrees, say so plainly, such as "You mentioned 35, but that birth date makes you 24 on pickup", and ask which is right. Continue with the same quote when the birth date was mistyped, and search again with the confirmed age when the searched age was wrong.

```sh
/opt/hatch/bin/duffel car-book --quote-id QUOTE_ID \
  --driver-given-name GIVEN --driver-family-name FAMILY \
  --driver-date-of-birth YYYY-MM-DD \
  --driver-email EMAIL --driver-phone-number +14155550123
```

- Supply the three `--customer-*` flags only when the CLI says no Duffel traveler profile exists. They create the account-owner profile after approval.

- `car-book` loads the trusted quote, accepts only `postpaid` rates and takes no card. It refuses when the birth date does not give the searched age on the pickup date; nothing is reserved then and the same quote stays usable.

- The reservation approval shows the supplier, vehicle, local rental period, full amount due at pickup, driver name and returned conditions. It is the one confirmation, so submit the approved quote once.

- On confirmed success, report the supplier's confirmation reference, the vehicle, pickup and drop-off details, the amount and currency due at the counter and any next deadline.

- `confirmation_pending` means the reservation was submitted before the final booking was ready. Report it as submitted, keep the request id for support and run `car-booking-status` to reconcile it, and ask the user to watch for the supplier's confirmation email if it stays pending. After a pending, unknown or already-submitted result, reconcile instead of running `car-book` again for that quote.

## Recover

- `ok: false` with `code: duffel_unavailable` means new rental-car searches and reservations are unavailable right now; continue on the rental company's official site with `browser.browse`. Existing reservations stay readable and cancellable.

- When Duffel finds no matching inventory, say only that this source had none for the search, which does not show that no cars exist.
<!-- duffel-rental-cars-only:end -->

## Check or cancel a reservation

```sh
/opt/hatch/bin/duffel car-booking-status
/opt/hatch/bin/duffel car-booking-status BOOKING_ID
/opt/hatch/bin/duffel car-cancel BOOKING_ID
```

- Read the current reservation before describing or cancelling it. Without an id, `car-booking-status` recovers the reservations made here: it looks up only the exact quotes this device submitted, checks each result belongs to this user and records the matches as confirmed. A booking made elsewhere is not visible.

- A `confirmation_pending` or `submitted_unknown` claim, a `skipped_bookings` entry or `failed_reads` mean a reservation may exist even when `data` is empty. Treat them as unresolved rather than as an empty history; the status read may be repeated later. When a reservation cannot be resolved, report the uncertainty and the contact-support next step.

- Cancel only when the user asks. `car-cancel` reads the current status and supplier terms before its single approval, which shows the supplier, vehicle, rental period, safe reference and returned cancellation terms. Report a cancellation fee or refund only as the returned terms state it.

- After success, report the cancelled state and safe reference. When terms are absent, say they were not provided rather than calling the cancellation free.

## Talk about results

- In replies, name the supplier and vehicle. Keep Duffel's name, commands, rate, quote and `boo_` booking IDs, and the driver's details out of replies; the approval carries any required attribution.
