---
name: "flightaware"
title: "FlightAware AeroAPI"
description: "Use for questions about a specific flight's departure or arrival time, including "when's my flight?" and confirmation of remembered times, plus flight status, delays, and cancellations. Verify the exact dated flight before answering; memory identifies the itinerary but does not verify its current schedule. Use FlightAware to monitor operational changes for an upcoming booked flight when the user directly asks for ongoing monitoring."
metadata: { "includeInPrompt": true }
---

# FlightAware

## Connecting
There is nothing for the user to connect and no key to enter. Run `flightaware status` to check it is reachable, or `flightaware status --verify` to also confirm a live read works. If status comes back unavailable, tell the user FlightAware is not reachable from this device right now and try again later. Never ask the user for a FlightAware API key.

## Command syntax
Identifiers are positional arguments, not flags. Output is always JSON; add `--compact` for single-line JSON.
- `flightaware flight <IDENT> [--date YYYY-MM-DD]` for a flight number, registration, or `fa_flight_id`. `--date` is the local departure date and must be within two days from now; use `--start`/`--end` with ISO timestamps for another window.
- `flightaware position <FA_FLIGHT_ID>` and `flightaware track <FA_FLIGHT_ID>` for a leg returned by `flight`.
- `flightaware schedules <DATE_START> <DATE_END> [--origin <ICAO>] [--destination <ICAO>] [--airline <ICAO>] [--flight-number <N>]` for flights more than two days out.

## Common flows

### Track a flight
Run `flight` with the airline flight number to get its current status, then use the returned `fa_flight_id` with `position` for where it is now or `track` for its recent path. For a picture, run `map` with `--save <path>` to write a static image of the flight.

### Monitor a tracked trip

Use this flow when the user directly asks for ongoing monitoring of an upcoming
booked flight. Use this flow when the runtime hands off a validated automatic
booking source for an upcoming flight. Treat either trigger as authorization to
create the watch after the required flight facts are present. Do not ask whether
to start monitoring after the runtime handoff. Do not require a connected email
account. Ask the user only for flight facts that the requested monitoring needs
and that the current context does not supply. Resolve each exact dated leg
before scheduling a job.

Search user goals and Tracking items for the trip. Use a matching user goal as
the canonical owner. Otherwise, reuse a matching active Tracking item. If
neither exists, create one Tracking item. Resolve the canonical owner before
scheduling a job. Do not create a FlightAware-specific database or a duplicate
Tracking item.

Store the minimum operational state in
`~/workspace/goals/<goal-slug>/hidden_files/travel/flight.json`. Use
`~/workspace/goals/<goal-slug>/hidden_files/travel/flight.json` only as
goal-owned job state. Do not create a separate travel database.

List the canonical owner's cron jobs before creating an operational job. Reuse
an equivalent goal-owned operational job when one exists. If no equivalent job
exists, add one operational job for the trip. Use
`flight-status-<goal-slug>` as its identifier. Set its owner to
`goal:<goal-slug>`. Schedule the operational job at creation with the actual
cron schedule for the next active leg's current cadence band. Use a daily cron
schedule while the next active leg departs more than 48 hours from now. Use an
hourly cron schedule from 48 hours before departure until 6 hours before
departure. Use a 10 to 15 minute cron schedule from 6 hours before departure
through landing. Do not create or retain a high-frequency cron schedule that
relies on `~/workspace/goals/<goal-slug>/hidden_files/travel/flight.json` to
skip source calls. Write a self-contained cron body because the cron worker
receives neither this skill nor the surrounding conversation. Include the
Tracking goal, `~/workspace/goals/<goal-slug>/hidden_files/travel/flight.json`,
exact leg identity, and booked baseline. Include the deduplication rule, failure
policy, cadence transitions, and stop conditions. Include the exact FlightAware
command lines each run needs, written with the syntax above.

At the start of each operational run, compare the existing cron schedule with
the next active leg's current cadence band. Update the same cron job before any
FlightAware source call when the existing cron schedule differs from the
current cadence band. Repair an existing high-frequency cron schedule before
any FlightAware source call when the next active leg is outside the
high-frequency band. Keep the current cadence until the active leg lands or a
connection risk remains unresolved. Advance the same job to the next active
leg, then stop it after the final landing.

Compare strategic schedule changes with the booked baseline. Compare
operational changes with the last notified facts. Apply the cancellation
corroboration and status interpretation rules in the Rules section. For a
material movement, flight or carrier change, confirmed cancellation, diversion,
terminal change, qualifying gate change, qualifying equipment change,
qualifying delay, or credible connection risk, create one stable event
fingerprint. Treat the first delay estimate at 30 minutes or more as a
qualifying delay. Treat a later delay-only change as a qualifying delay only
when it crosses from 30 minutes or more to less than 30 minutes, enters a worse
band among 30 to 59 minutes, 60 to 119 minutes, and 120 minutes or more, or
differs by 60 minutes or more from the last notified delay estimate. Do not
include the exact delayed minute value in a delay-only fingerprint. Treat
terminal changes, airport changes, confirmed cancellations, diversions, and
credible connection risks as immediate alert candidates. Treat departure gate
changes as alert candidates only inside 24 hours before departure. Treat
arrival gate changes as alert candidates only when they affect a connection or
pickup. Treat equipment changes as alert candidates only when they affect
cabin, seat, or itinerary facts. Keep final landing silent unless the user
asked for landing notification or a pickup or connection impact remains.
Keep a first gate or terminal assignment, an on-time status, boarding, taxiing,
departure, and in-flight progress silent; none of them is a change. Name only
the current gate in a departure gate alert. From 90 minutes before departure,
send each departure gate change on the run that finds it. Earlier, send at most
one departure gate alert per leg per hour: record a newer gate that arrives
within the hour in  
`~/workspace/goals/<goal-slug>/hidden_files/travel/flight.json` and send the
then-current gate on the first run after the hour. Stay silent when the gate
returns to the last notified gate, and fold a gate change into a concurrent
delay or cancellation message instead of sending it separately. In a scheduled
run, keep an unconfirmed cancellation silent: record it in
`~/workspace/goals/<goal-slug>/hidden_files/travel/flight.json`, recheck the
exact dated leg, and seek confirmation from an airline or airport source. A
cancellation is confirmed only when FlightAware's `cancelled` flag and status
text agree, or an airline or airport source confirms it. Notify as soon as it
is confirmed, and keep checking on later runs while it stays unconfirmed.
Write these silence rules, including the gate timing and the cancellation
confirmation test, into the cron body with the other alert rules; the cron
worker does not receive this skill.
Persist the fingerprint before sending a message. Add one Tracking activity
before sending a message. Do not add another activity or message for the same
fingerprint. Keep unchanged checks silent. After three consecutive expected
source failures, add one degraded-coverage activity. Do not treat a failed read
as evidence that nothing changed. Remove the operational job when the Tracking
item is completed or retired.

### Find flights in the air
Use `search` to find airborne flights by origin, destination, or area. Default to one page of results and ask before pulling more.

### Airport activity
Use `airport` for an airport's details, `airport-delays` for current delays, `airport-flights` for arrivals and departures, and `airport-weather` for conditions. `nearby-airports` finds airports around a location.

### Airline activity
Use `operator` for an airline's details and `operator-flights` for its recent and scheduled flights.

### History
For past flights, use the `history` commands with an explicit date range. They cover flights, tracks, routes, airport activity, and an aircraft's last flight.

### Predictions and schedules
Use `foresight` for FlightAware's predicted status and positions, `schedules` for scheduled flights between two dates, and `disruptions` for cancellation and delay counts.

## Other commands
The flows above cover the common cases. For anything else, run `flightaware --help` for the full command list and `flightaware <command> --help` for a command's options. This includes aircraft owner and type lookups, route and count queries, and advanced search syntax.

## Rules
- Use the airline's ICAO flight number when you can (`UAL123`, not `UA123`). If the user's flight number is ambiguous, resolve it with `canonical-flight` first.
- For "where is my flight", get the flight first, pick the right date and leg, then look up its position or track. Do not guess an `fa_flight_id`.
- A cancellation is a high-impact terminal claim. Never report it as confirmed or stop a flight watch from `cancelled: true` alone. If the flight carries `muse_cancellation_evidence.classification: conflicting_provider_fields`, recheck the exact dated leg. If the fields still conflict, seek confirmation from an airline or airport source. Without it, say the cancellation is unconfirmed when answering the user directly, and keep a scheduled monitoring run silent until it is confirmed; keep monitoring either way. Only treat the cancellation as confirmed when FlightAware's boolean and status text agree, or an independent source confirms it.
- If FlightAware says a flight or aircraft is blocked or has no data, tell the user plainly and do not try to work around it.
- Flight reads preserve AeroAPI's raw times and add semantic UTC/user-local fields such as `scheduled_gate_departure_at`, `estimated_takeoff_at`, `actual_landing_at`, and `scheduled_gate_arrival_at`. Prefer their `user_local` values in replies. Position samples similarly add `position_observed_at`.
- FlightAware does not cover airline policies, terminal maps, baggage, booking, or customer service. For those, use web search and make clear which details came from the web rather than FlightAware.
- Reply in plain language about the flight, not about how you looked it up. Do not show the user commands, ids, tokens, or raw status codes.

## Limits
- You can't book travel, buy tickets, change a reservation, or contact an airline or airport.
- Filing a flight intent changes state in FlightAware, so only do it when the user clearly asks and the exact flight is unambiguous; no additional confirmation is required.
