# FlightAware

- `/opt/hatch/bin/flightaware` reads flight schedules, live status, positions, tracks, and airport and airline activity through Muse's managed FlightAware service. There is no account to connect and no API key, so never ask the user for one.

- Output is always JSON, and `--compact` prints it on one line. [Flight Tracking](/opt/muse/skills/flight-tracking/SKILL.md) uses this connector for status questions and for the status job on a booked trip.

## Check availability

- `status` reports whether managed FlightAware is set up on this VM, and `status --verify` also makes a safe live read to confirm it works. If it is unavailable, tell the user FlightAware cannot be reached right now and to try again later, without asking for credentials or sending them to Settings.

## Find the right flight

```sh
/opt/hatch/bin/flightaware flight UAL123 --date 2026-10-14
/opt/hatch/bin/flightaware position FA_FLIGHT_ID
```

- Identifiers are positional arguments, not flags.

- `flight IDENT --date YYYY-MM-DD` reads a flight number, registration or `fa_flight_id` departing within two days. The date is the local departure date. Use `--start` and `--end` with ISO timestamps for another near-term window.

- `schedules DATE_START DATE_END` covers flights more than two days out, with optional `--origin ICAO`, `--destination ICAO`, `--airline ICAO` and `--flight-number N`.

- Prefer the airline's ICAO flight number, such as `UAL123` rather than `UA123`. Resolve an ambiguous number with `canonical-flight IDENT` first.

- Match the date, airports and leg, not only the flight number. Use the chosen leg's `fa_flight_id` with `position`, `track`, `route` or `map ID --save PATH`, which writes a static image. Never guess an `fa_flight_id`.

## Read status

- Flight reads keep the raw times and add UTC and user-local forms in fields such as `scheduled_gate_departure_at`, `estimated_takeoff_at`, `actual_landing_at`, `scheduled_gate_arrival_at` and `position_observed_at`. Prefer the user-local form in replies, and keep scheduled, estimated and actual events distinct.

- `cancelled: true` alone does not confirm a cancellation. When `muse_cancellation_evidence.classification` is `conflicting_provider_fields`, recheck the exact dated leg, then seek airline or airport confirmation if the conflict remains.

- A cancellation is confirmed only when the `cancelled` flag and the status text agree, or an airline or airport source confirms it. Until then, tell the user it is unconfirmed.

- When a flight or aircraft is blocked or has no data, say so plainly and do not work around it. `aircraft blocked IDENT` checks whether public tracking is blocked.

- FlightAware does not cover baggage, airline policies, terminal maps, booking or customer service. Use the web for those and say that the answer came from the web.

- Reply in plain language about the flight, not about how you looked it up. Keep commands, identifiers such as `fa_flight_id` and raw status codes out of the reply.

## Use other reads

- `search` finds airborne flights. Return one page by default and ask before pulling more.

- Airport reads are `airport`, `airport-delays`, `airport-flights`, `airport-weather` and `nearby-airports`. Airline reads are `operator` and `operator-flights`. `airport-flights` and `operator-flights` take a kind after the code, such as `arrivals` or `all`.

- `history` reads past flights, tracks, routes, airport and operator activity and an aircraft's last flight. Give its flight, airport and operator reads an explicit `--start` and `--end` range. `foresight` returns predictions, which you present as predictions, and `disruptions` returns delay and cancellation counts.

- Run `flightaware --help` for the full command list, including aircraft owner and type lookups, route and count queries and advanced search. Run `flightaware COMMAND --help` for filters and pagination, such as `--max-pages` and `--cursor`.

## File a flight intent

- `create-flight-intent IDENT --body-json JSON` changes FlightAware state. Run it only when the user clearly asks for it, and confirm the exact dated flight with the user first whenever the request leaves any doubt. Read its `--help` for the body fields.

## Monitor a booked trip

- Create the status job through [Flight Tracking](/opt/muse/skills/flight-tracking/SKILL.md), which sets its owner, name, deduplication, failure handling and stop conditions. Write the rules below into the job's body with the exact command lines each run needs.

- Set the schedule by the next active leg's departure. Run daily while it is more than 48 hours away, hourly from 48 hours to 6 hours before departure, and every 10 to 15 minutes from 6 hours before departure through landing. Create the job at the band that applies now.

- At the start of each run, compare the job's schedule with the current band. When they differ, update the same job with `cron.update` before any FlightAware call. Never keep a frequent schedule that relies on the state file to skip calls.

- Keep the current band until the leg lands, and longer while a connection risk is unresolved, then move the same job to the next leg.

- Compare schedule changes with the booked baseline, and operational changes with the last notified facts.

- Alert on a material time change, a flight or carrier change, a confirmed cancellation, a diversion, a terminal or airport change, a qualifying gate change, an equipment change that affects the cabin, seat or itinerary, a qualifying delay, or a credible connection risk. Give each one stable fingerprint.

- Send terminal and airport changes, confirmed cancellations, diversions and connection risks at once.

- The first delay estimate of 30 minutes or more qualifies. A later delay-only change qualifies only when it drops below 30 minutes, enters a worse band (30 to 59, 60 to 119, or 120 or more minutes), or differs by 60 minutes or more from the last notified estimate. Leave the exact minutes out of a delay-only fingerprint.

- A departure gate change qualifies only within 24 hours of departure. From 90 minutes before departure, send each change on the run that finds it.

- Earlier than that, send at most one departure gate alert per leg per hour. Save a newer gate in the state file and send the gate that is current on the first run after the hour.

- Name only the current gate. Stay silent when the gate returns to the last notified one, and fold a gate change into a concurrent delay or cancellation message.

- An arrival gate change qualifies only when it affects a connection or a pickup.

- Stay silent for a first gate or terminal assignment, an on-time status, boarding, taxiing, departure and progress in flight. Keep the final landing silent unless the user asked for landing notices or a pickup or connection depends on it.

- In a scheduled run, keep an unconfirmed cancellation silent. Record it in the state file, recheck the dated leg, seek airline or airport confirmation and keep checking on later runs. Notify as soon as it is confirmed.

## Related skills

- [Flight Tracking](/opt/muse/skills/flight-tracking/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
