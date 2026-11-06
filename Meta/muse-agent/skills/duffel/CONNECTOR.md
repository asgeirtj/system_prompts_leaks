# Duffel

- Confirm Duffel is returned by `muse.connector_search` for this task before running any Duffel command, including `--help`. If it is absent, use Flight Booking's browser fallback for flight shopping and do not create a Duffel fare job in Flight Tracking.

- `/opt/hatch/bin/duffel` searches, books and manages flights from many airlines. Its commands are `places`, `search`, `seat-options`, `validate-booking`, `book`, `booking-status`, `cancellation-quote` and `cancel-booking`. It needs no user login, and payment uses the user's Link by Stripe card. `duffel COMMAND --help` lists each command's flags.

<!-- duffel-rental-cars-only:start -->
- It also searches and reserves pay-at-pickup rental cars with `car-search`, `car-quote` and `car-book`.
<!-- duffel-rental-cars-only:end -->

<!-- duffel-bags-only:start -->
- It also adds paid bags to a flight booking with `bag-options` and `--bag`, as [Booking](references/booking.md) describes.
<!-- duffel-bags-only:end -->

- `car-booking-status` and `car-cancel` check and cancel rental-car reservations made here. Read [rental cars](references/cars.md) before any rental-car command; the flight sections below do not apply to cars.

- Before a user-facing search, read [Flight Booking](/opt/muse/skills/flight-booking/SKILL.md), which compares flight sources and builds the flight list. Read [checkout](/opt/muse/assets/booking/references/checkout.md) once the user picks a flight to book, not before searching. [Flight Tracking](/opt/muse/skills/flight-tracking/SKILL.md) uses Duffel only for the fare check on a booked trip. Duffel does not report live flight status.

## Search a complete trip

```sh
/opt/hatch/bin/duffel search --origin SFO --destination JFK --departure-date 2026-10-14 --return-date 2026-10-18 --adults 1 --cabin economy --limit 300 > /tmp/sfo-jfk-flights.json
```

- The full result goes to the file, which the flight list and booking read. The ranked options print on stderr as lettered lines with their row pointers, plus any coverage note or failure, so they show in the command's output as long as stderr is not redirected. Those lines are usually all you need to choose and present.

- A search takes a few seconds to a minute. Run it through `muse.exec` with `yield_ms` set to 90000 so it finishes in the foreground. If it still moves to the background, wait for its result; a running search has not failed, and starting it again searches twice.

- The CLI accepts any three letters, so a guessed code for an obscure or ambiguous place can quietly search the wrong airport; exact IATA codes keep the search on the user's route. A city code such as `NYC` or `LON` searches every airport in that city in one search; an airport code searches only that airport. Add `--return-date` for a round trip, or repeat `--leg ORIGIN:DESTINATION:YYYY-MM-DD` for a multi-city trip.

- When the user names an area or a place whose code isn't known, `places` finds it: `/opt/hatch/bin/duffel places --query "Lake Tahoe"`, or `--lat 39.1 --lng -120.0 --radius-km 100` around a point. It lists airports and cities with their codes, and each city's airports. Well-known codes need no lookup, so it mostly helps with areas and smaller airports.

- Search every airport, cabin and date the request allows in one command. List up to three comma-separated airports in `--origin` and `--destination`, such as `--origin SFO,OAK,SJC`, two cabins in `--cabin`, such as `business,first`, and `--flex-days N` (up to 3) to add the days before and after the departure date with the same trip length. The CLI runs the searches in parallel, up to 12 per command. When the lists ask for more, it keeps the first-listed values, so list airports and cabins in order of preference: it narrows the flexible dates first, then drops the last-listed airport on the side with more airports. `search_trimmed` and `note` say what it left out; tell the user, and search it separately only if it could change the choice. A multi-city `--leg` search takes one airport per leg and a single cabin and date.

- Price the full passenger mix in the search with `--adults`, one `--child-age` for each seated traveler aged 2 to 17 on the final travel date, and `--lap-infants`. Each lap infant needs a different adult. Prices depend on each traveler's type and age, so a change in the mix needs a new search, and a child searched as an adult is priced and ticketed wrongly.

- Ask whether each infant under two will sit on a lap or in their own seat, rather than inferring it. An infant who needs their own seat has to book with the airline, because this connector cannot validate that case.

- Pass the cabin with `--cabin economy`, `premium_economy`, `business` or `first`. Omitting it searches economy. A domestic premium cabin may be sold as First, so search a domestic business request as `--cabin business,first` unless the user excluded First.

- Use `--limit 300`, the maximum. The default is 20. The digest ranks every matching offer the search read, whatever the sort, so one search covers both price and duration.

- Duffel searches at most one connection per direction unless you pass `--max-connections 2`. Use 2 when the route has few one-stop options or the user accepts longer trips, and 0 for nonstop only.

- Set `--depart-window HH:MM-HH:MM` and `--return-window HH:MM-HH:MM` (local time) when the user named a time of day, such as `--depart-window 06:00-12:00` for a morning flight. `--arrive-window` and `--return-arrive-window` filter by local arrival time of day, with no date, so use them when the traveler must land within a time of day on the travel date, such as `--arrive-window 05:00-09:30` for a 10:30 meeting downtown. For a deadline an earlier arrival also meets, such as landing the evening before, search without them and compare each flight's arrival date and time. Duffel filters these itself, which is faster than filtering afterwards.

- Narrow with `--airlines` (comma-separated names or IATA codes), `--max-price` and `--refundable` only when the user set that limit. `--refundable` keeps only offers marked refundable before departure without a penalty, which is not the same as cancel anytime, and it counts offers with unstated refund terms in `refundable_unknown_excluded`. Those offers are unknown, not non-refundable.

- Report the actual cabin and fare brand on each leg. Domestic First does not promise a lie-flat seat, and economy is a different product the user decides on.

## Read the digest

- `lines` are the ranked options to choose the shown trips from, lettered, each with its price, airline, flights with local times, stops, duration, fare brand with bags and change and refund terms, and why it is shown, such as cheapest or fastest; `rows` are their pointers into the file, in the same order. Each line is the cheapest fare on its flights, so fare variants of one schedule appear once. They cover the cheapest, the fastest, the cheapest nonstop, the best tradeoffs, the flights of the cheapest fares with free changes and with a checked bag, and a few airlines. Make one flight row for each line you show, from its pointer: `{"type":"flight","data":{"flight_details_file":"FILE","json_pointer":"POINTER"}}`.

- Lines lettered with `+`, such as `A+` and `A++`, follow their row: fares on the same flights that include more, cheapest first, each with the price difference and what it adds or lacks. One is the next fare up: the cheapest that includes more and lacks nothing, at most 50% more. The others are the search's cheapest fares with free changes and with a checked bag, at any price, when they are on these flights. They don't list every fuller fare. Each pointer is a complete, bookable offer. Show one as a row or mention it in the reply when what it adds fits this traveler.

- A round trip's lines are complete round trips, each with both directions, one total and each direction's stops and duration, such as "out nonstop 5h58m, back 1 stop 8h45m". Each row books as one offer.

- A requested or expected carrier missing from the lines may still be in the file: check `jq '[.digest.cheapest_by_airline[].airline]' FILE` before concluding Duffel has none. A carrier Duffel returned no offers for may still fly the route. Run one targeted `--airlines` search for it before turning to the airline's site.

- A command that searched several airports, cabins or dates puts each search's own result under `searches`, with `searches_run` and `searches_failed`, and its digest ranks them all. Each search's result keeps only the offers its digest points to, so an offer missing from the file may still be sold by Duffel. Name the failed searches when they could change the choice.

## Keep the original results

- Each search goes straight into its own JSON file. The flight list and booking read offers from that file exactly as saved, so it stays unedited; read-only commands such as `jq` can inspect it.

- Check `ok` first. A successful single search has a top-level `offers` array, which can be empty with `offers_total: 0` and `offers_shown: 0`. An error, a missing digest or an unfamiliar shape does not mean there are no flights.

- Read `search_coverage` and tell the user when coverage is incomplete (`complete: false`). Even a complete search covers only the offer request Duffel returned, and only airlines that answered within `supplier_timeout_ms`.

- `split_trips` lists round trips sold as two one-way tickets, one per direction, and the search prints each as a "Split tickets" line. Each ticket is a real offer with its own `id`, fare terms and bags. A pair appears when it costs less than the cheapest matching single-ticket trip, whose total is its `single_ticket_total`, or when no single ticket fits the search, in which case that field is absent. Present pairs in text after any flight rows, labeled as separate tickets, with the pair's `total_amount` next to `single_ticket_total`. Mention that a delay or change on one ticket is not protected by the other.

- When `ok` is false, present any useful `partial_results.offers` with a note that the search failed and coverage is incomplete, before another search or a browser check. If later checks you need add useful offers, present one replacement list that explicitly supersedes the partial one. Replacement lists are allowed for this partial-result recovery and for a later source check that adds a better trip, under Flight Booking's replacement and post-selection rules. Report the checks that did not finish. Empty incomplete results do not show that no flights match.

- Point each flight row at its pointer in the unchanged file, such as `/offers/0`, or `/searches/1/result/offers/0` for a parallel search. Partial results use `/partial_results/offers/INDEX`.

- A tap on a native flight row selects that row's complete offer. For a trip that is still being planned, return it to the plan and stop before seats, traveler details or validation. Otherwise validate and book that same complete offer, with every leg.

- If the original file was lost or altered, rerun the search into a new file; an offer rebuilt from truncated output or a summary can't be validated or booked.

- Keep a second fare for the same schedule only when its cabin, bags, refund or change terms, or price make a real difference. A `+` line is usually that fare.

- Keep differences between passengers and segments. A missing fare brand, cabin, bag, refund or change fact is unknown, so it reads as not stated rather than none, non-refundable or an airline's usual fee. Convert airport-local times only when the airport's timezone is known.

## Respect search limits

- Reuse a complete response while its offers are still valid. Corrected arguments, another relevant itinerary, expired offers or lost output justify another search. Repeating an identical search in a shell loop or launching duplicates in the background does not; list airports, cabins and dates in one command instead.

- `error.kind: connector_country_not_allowed` means Duffel is unavailable for this account's country. Stop all Duffel commands for the task, including retries of other reads; changing the itinerary or reconnecting will not resolve it. Use Flight Booking's browser fallback for flight shopping. Scheduled fare checks skip Duffel for this run under the [fare check](references/fare-check.md) rules.

- `ok: false` with `code: duffel_account_country_unavailable` without `account_country: unresolved_us_default` means `book` or traveler-profile creation stopped because the account-country lookup failed. Stop those operations for the rest of the turn; changing the booking arguments will not help. Continue booking directly with the airline using `browser.browse`. Searches and existing-booking management remain subject to their own availability, ownership and retry rules.

- `account_country: unresolved_us_default` means a booking could not be read while the account country was unavailable; it does not mean the user lacks the booking, so manage it with the airline using `browser.browse` instead of retrying. A partial list retains readable bookings and identifies affected IDs under `enumeration.country_fallback_unreadable_order_ids`; this applies only to those IDs.

- `enumeration.incomplete: true` means the booking list may omit bookings. Present readable bookings and state that the list is incomplete; an empty incomplete list does not mean there are no bookings. When `enumeration.failed_team_records` is nonzero, manage affected bookings with the airline using `browser.browse`.

- A checkout or traveler-profile team mismatch stops that checkout. Continue with the airline using `browser.browse`. Existing bookings can still be managed through their original team.

- `status: airline_site_booking_required` from `validate-booking` or `book` means this airline charges the card in its own currency, which Duffel checkout can't pay. Nothing was approved or charged. Keep the chosen itinerary and follow Flight Booking's airline-booking guidance using `browser.browse`; other airlines' Duffel fares stay bookable here.

- If `resource_team_persist_failed: true` appears after creation, preserve the result, returned IDs and airline booking reference; do not repeat creation. This connector cannot repair the saved team binding, so Duffel management may remain unavailable. Continue with the airline using `browser.browse`; agency-issued refunds may require the issuing agency.

- `code: duffel_quote_receipt_missing`, `duffel_quote_expired` or `duffel_quote_team_mismatch` stops use of that offer or quote. Before any approval or submission for this purchase, run a fresh search before continuing offer reads, seat lookup or checkout; do not retry that ID. After approval or submission, follow [Uncertain results](references/recovery.md) using the original checkout evidence. These codes do not resolve booking or funding uncertainty or permit a retry or replacement purchase. Fresh successful searches can rebuild a malformed disposable quote cache; rebuilding it does not resolve an earlier purchase.

- `code: duffel_quote_storage_unavailable` means the quote cache could not be accessed or saved. This connector cannot repair that storage failure. Stop `search`, `seat-options`, `bag-options`, `validate-booking` and `book` for the rest of the turn. Before any approval or submission for this purchase, use Flight Booking's browser fallback for shopping; after flight selection, keep the chosen itinerary and follow Flight Booking's airline-booking guidance using `browser.browse`. After approval or submission, follow [Uncertain results](references/recovery.md) using the original checkout evidence; this refusal does not resolve booking or funding uncertainty or permit retry or replacement.

- `code: duffel_quote_capacity_exceeded` requires a narrower search before selecting an offer.

- `ok: false` with `code: duffel_unavailable` means the Duffel rollout gate is off, even if connector search returned Duffel. Stop `search`, `places`, `seat-options`, `bag-options`, `validate-booking` and `book` for the rest of the turn; changing the query will not help. The rollout gate leaves existing-booking management available. Use Flight Booking's browser fallback for flight shopping. Scheduled fare searches wait for the next run.

- For other errors, an unchanged failed search fails the same way again, even when its response says `retriable: true`, so a changed query or another source is the next step.

- Other failed reads, such as `booking-status`, `seat-options`, `bag-options` and `validate-booking`, may be retried unless an availability or rate-limit rule stops that command.

- A 429 rate-limit response ends Duffel calls for the current task. When it carries `rate_limit_resets_at`, say when Duffel can be searched again. Report the limit without changing the query to get around it.

## After the user picks a flight

- The later steps each have a guide, read when that step comes:
  - [Booking](references/booking.md): seats, traveler details, validation, payment and `book`.
  - [Uncertain results](references/recovery.md): a timeout, an unknown outcome or a Link action during or after `book` or `cancel-booking`.
  - [Managing a booking](references/manage.md): looking up, quoting and cancelling a booking, and what the airline handles instead.
  - [Fare check](references/fare-check.md): Flight Tracking's daily fare check on a booked trip.

## Talk about results

- In replies, name the airlines, itineraries and fares. Duffel, commands and `off_`, `ord_` and `ore_` IDs are internal details, and the user chooses flights, not between Duffel and the airline. The approval and receipt carry any required attribution.

## Related skills

- [Flight Booking](/opt/muse/skills/flight-booking/SKILL.md)

- [Flight Tracking](/opt/muse/skills/flight-tracking/SKILL.md)

- [Trip Transport](/opt/muse/skills/trip-transport/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.

### When available

- These skills depend on the user's channel or devices. `muse.skill_search` shows which ones this session has.

- [Deal Monitoring](/opt/muse/skills/price-tracker/SKILL.md)
