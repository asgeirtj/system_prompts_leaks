---
name: "duffel"
description: "Use Duffel to search, book, pay for, or manage flights. Use Duffel to monitor an already booked flight's fare when the user directly asks for ongoing price monitoring."
allowed-tools:
  - "exec"
  - "widget.create"
  - "read"
  - "write"
  - "edit"
  - "tracking.list"
  - "tracking.get"
  - "tracking.search"
  - "tracking.create"
  - "tracking.update"
  - "tracking.create_entry"
  - "tracking.set_status"
  - "user_goal.list"
  - "user_goal.get"
  - "user_goal.search"
  - "user_goal.create_entry"
  - "cron.list"
  - "cron.view"
  - "cron.status"
  - "cron.add"
  - "cron.update"
  - "cron.remove"
metadata: { "includeInPrompt": false }
---

# Duffel Flight Booking

For a user-facing flight search or booking, first read  
`/opt/hatch/skills/booking/SKILL.md`,  
`/opt/hatch/skills/booking/references/flights.md`, and
`/opt/hatch/skills/booking/references/presentation.md`. Those files define the
discovery, privacy, presentation, and commitment rules. Use this file for the
Duffel CLI contract. Do not emit HTML, call `create_options`, or duplicate
flight choices in another widget; the native flight widget owns flight
selection and uses the action chosen for the current flow.

Use only this public CLI surface:

```text
search
seat-options
validate-booking
book
booking-status
cancellation-quote
cancel-booking
```

Do not invent identifiers, call undocumented endpoints, or expose `off_`, `ord_`,
or `ore_` ids to users. Do not show a Duffel command. Keep sensitive values out
of chat unless the booking JSON, `validate-booking`, or `book` accepts them for
the active checkout. Never request payment-card data or account credentials.
Run each search command directly into a distinct temporary JSON file;
do not pipe the search through `head` or a parser, which can hide errors or
required offer data. After the direct search succeeds, a read-only command may
inspect the saved JSON to group and rank offers, but it must not overwrite the
file. Reuse the unchanged file for presentation. If an earlier search was
piped, truncated, reduced, or overwritten, do not repeat it in the same turn;
explain that a complete result was not retained and ask the user to continue in
a new turn. A hand-built summary is not sufficient input for the required
structured flight list.

## Booking flow

1. Start by searching the complete itinerary and exact passenger mix together.
2. Present the shortlist through  
   `/opt/hatch/skills/booking/references/flights.md`.
3. If Travel Planning delegated the search in `planning only` posture, return
   the selected itinerary to Travel Planning and stop. Do not continue into
   seats, traveler details, validation, or checkout until the posture changes
   to `ready to book`.
4. Optionally show `seat-options` and collect bookable seats.
5. Collect required passenger details and any loyalty account the user wants
   attached.
6. Let `/opt/hatch/skills/booking/references/flights.md` choose between the
   native path and the airline website. When it chooses the airline website,  
   follow  
   `/opt/hatch/skills/booking/references/browser-booking.md`. Recheck the
   itinerary and terms. Do not require the user to complete the checkout.
7. Otherwise continue through the supported native path without asking the
   user to choose an implementation provider. Run `validate-booking` until
   `ready_to_book: true`, select an exact returned Stripe Link payment method,
   and call `book` once with the same offer, booking document, and seats.
8. On success, report every carrier confirmation reference/PNR and ticket
   status. Do not add the Duffel name to the message. Any required provider
   attribution belongs to the provider-controlled approval or receipt surface.

Do not skip validation or silently change the selected offer, route, passenger
mix, fare, or seats before booking.

## Search and compare

```sh
duffel search --origin SFO --destination LAX --departure-date 2026-09-30 \
  --limit 300
duffel search --origin SFO --destination LAX --departure-date 2026-09-30 \
  --return-date 2026-10-04 --adults 2 --child-age 8 --lap-infants 1 --limit 300
duffel search --leg SFO:LAX:2026-09-30 --leg LAX:JFK:2026-10-03 --adults 2 \
  --limit 300
duffel search --origin SFO --destination LAX --departure-date 2026-09-30 \
  --max-connections 0 --sort duration --limit 300
```

Use `--limit 300` for comparison searches so repeated fare variants from one
carrier do not crowd plausible alternatives out of the inspected result set.
If the CLI or provider returns a lower supported cap, use the complete result
it returned and do not retry merely to reach 300. Present only the 3–6 most
useful distinct offers. Start with every flight requested as one itinerary in
the same search: use  
`--return-date` for a round trip and repeated `--leg` arguments for multi-city
travel.

Treat each search as a live snapshot, not a price-monitoring loop. Do not
refresh an identical search in a shell loop or launch duplicate searches in the
background. The CLI suppresses completed and concurrent duplicate searches and
bounds all provider attempts within one user turn. On `duplicate_search`, reuse
the completed result. On `search_in_progress`, wait for the original invocation.
On `search_terminal`, do not retry. On `search_budget_exhausted`, use any results
already available and ask the user before expanding in a new turn.

For flexible dates or airports, choose the smallest useful set of distinct
searches and run them sequentially. Show useful results as soon as they are
available. If the requested comparison exceeds the CLI's turn budget, tell the
user which combinations remain and ask them to continue in a new turn. Do not
silently search the Cartesian product of every possible date and airport.

Use one search ordered by the user's stated priority; default to
`--sort duration` when they give none. Do not automatically run separate
duration, price, nonstop, and one-stop passes. Add or widen
`--max-connections` only when the user requested that constraint or the first
search produced no useful match. Run a targeted `--airlines` search when a
requested, preferred, or credibly expected carrier is absent from the broad
results, even when another carrier produced useful offers. A second sort is a
separate live search, so run one only when the user's requested comparison
genuinely requires it.

Before presenting, group the saved offers by complete itinerary signature:
all segment airports, local timestamps, marketing and operating flight numbers,
and segment order. Do not let repeated fare brands for one schedule consume the
shortlist. Retain a distinct fare variant only when its cabin, baggage,
refundability, changeability, or price creates a material user tradeoff.

Check carrier coverage after grouping. Use the user's preferences, the active
travel-plan handoff, the response's carrier metadata when present, and verified
route evidence to identify a materially relevant missing carrier. Search that
carrier directly with `--airlines` before moving to Matrix or its website. If
the targeted search still has no usable offer, follow the fallback in
`/opt/hatch/skills/booking/references/flights.md`. Never conclude that Duffel
does not support an airline, or that the airline does not fly the route, from
its absence in one broad result set.

Use exact three-letter airport IATA codes, not metro codes such as `NYC`.
Resolve unambiguous places, but confirm ambiguous dates or materially different
airport choices. Do not guess an obscure or ambiguous code. Results are
hard-filtered and nearby-airport inventory is excluded. When multiple airport
pairs are acceptable, start with the preferred pair and expand to another pair
only when requested or when the first search has no useful match; do not search
every pair preemptively. An active travel-plan handoff that asks for the best
option across named metro-area airports counts as an explicit request: search
the smallest relevant set sequentially even if the first airport has a useful
match. Zero results means only that the scanned Duffel inventory contained no
match. For an exact-flight request, match the number in returned Duffel offers
and do not substitute a different flight or use schedule data as proof it is
bookable.

Passenger pricing is fixed at search:

- `--adults` is the adult count.
- Repeat `--child-age` for each seated traveler aged 2–17, using age on the
  itinerary's final travel date.
- `--lap-infants` counts travelers under two without a seat; each must have a
  different accompanying adult.

Ask for missing ages once. Ask whether an infant is seated or on a lap. Do not
infer it. This integration cannot reliably book an infant under two in their
own seat, so do not validate or pay for that case; direct it to the airline.
Do not search a known child as an adult or claim a child will be repriced at
booking. Search again whenever the passenger mix changes.

Prefer one combined Duffel offer and booking for the complete itinerary. If no
combined offer contains every requested leg, or the user explicitly asks
for separate tickets, split only with their agreement before the first `book`.
Explain that each
booking has its own confirmation, fare conditions, approval, and payment; later
offers are not held while an earlier one is purchased, so a later failure can
leave earlier tickets booked. Compare the combined total. Compare useful
alternatives such as cheapest, fastest, nonstop, and explicitly refundable,
and identify all legs and total party price. Treat native-provider inventory as
one live source, not exhaustive coverage across every airline channel.

Present the shortlist with native flight rows through `widget.create`, using
`kind: "list"`. Read the Flights section in
`/opt/hatch/skills/booking/references/flights.md` for
complete-trip rows and presentation.
For list creation, redirect each search to a distinct temporary JSON file.
Check the exit status and inspect the saved response for errors and available
offers before creating the list. Keep the saved output unchanged:

```sh
duffel search --origin SFO --destination JFK --departure-date 2026-10-14 \
  --return-date 2026-10-18 --adults 1 --limit 300 > /tmp/sfo-jfk-flights.json
```

Create one row per selected complete offer. Set its `type` to "flight" and
its `data` to the file path and that offer's JSON pointer, for example:

```json
{
  "flight_details_file": "/tmp/sfo-jfk-flights.json",
  "json_pointer": "/offers/0"
}
```

Use the original offer's zero-based index in `/offers/<index>`. Keep the file
until `widget.create` succeeds. Do not copy the offer JSON into the tool call,
rewrite timestamps, remove fields, or generate a separate widget payload file.
The runtime reads the selected object, maps timestamps, and
stores the complete flight data. It does not retain the path or pointer.
Keep all outbound, return and connecting segments in that one row. Show the
whole offer price once. The server derives an identifying booking reply from
those facts. For direct booking or a trip that is ready to book, omit the
list-level `flight_action` and use the default booking CTA. For a Travel
Planning handoff in `planning only` posture, set `flight_action` to  
`{"cta_text":"Add to plan","response_message_prefix":"Add this flight to my trip plan:"}`  
so selection returns the itinerary to the plan instead of implying checkout.
Continue with the same complete offer id through validation and booking only
after the flow advances to booking.
Do not reinterpret a row tap as a request to buy only its first leg. Treat
`refundable` and `changeable` as three-valued: `yes`, `no`, or `not stated`.

Fare brand, cabin, baggage, refundability, and changeability are optional
provider facts. Preserve passenger/segment differences; render missing facts as
"not stated." Do not render missing facts as "none," "not allowed," or
"non-refundable." Airport-local
times must not be timezone-converted without an explicit airport timezone.
`--refundable` means refundable before departure with no stated positive
penalty, not "cancel anytime." Do not infer baggage or airline-standard fees.

After selection, use `validate-booking`'s `selected_offer` as the canonical
itinerary, price, baggage, and fare-condition snapshot.

## Tracked fare monitoring

Use this flow when the user directly asks for ongoing monitoring of an already
booked flight. Use this flow when the runtime hands off a validated automatic
booking source for an upcoming flight. Treat either trigger as authorization to
create the watch after the required booking facts are present. Do not ask
whether to start monitoring after the runtime handoff. Do not require a
connected email account. Ask the user only for booking facts that the requested
monitoring needs and that the current context does not supply.

Collect the exact dated itinerary and passenger mix. Collect the booked cabin
or fare family, included bags, and stop pattern. Collect the paid all-in total,
booking currency, and known cancellation, change, or rebooking costs.

Search user goals and Tracking items for the trip. Use a matching user goal as
the canonical owner. Otherwise, reuse a matching active Tracking item. If
neither exists, create one Tracking item. Resolve the canonical owner before
scheduling a job. Do not create a shadow trip, a price-tracker notebook entry,
or a parallel tracking record. Keep confirmation references, ticket numbers,
and connector identifiers out of user-visible goal text.

Store the minimum machine-readable fare state in
`~/workspace/goals/<goal-slug>/hidden_files/travel/flight.json`. Store the
booking fingerprint, source fingerprints, traveler relationship and count,
immutable booked itinerary, paid total, fare terms, current facts, last
comparison, last-notified fingerprint, and cron identifiers. Use
`~/workspace/goals/<goal-slug>/hidden_files/travel/flight.json` only as
goal-owned job state. Do not store full messages, raw connector output, names,
ticket numbers, identity documents, contact data, payment data, loyalty
numbers, Known Traveler Numbers, or CLEAR identifiers.

List the canonical owner's cron jobs before creating a fare job. Reuse an
equivalent goal-owned fare job when one exists. If no equivalent job exists,
add one fare job for the trip. Use `flight-price-<goal-slug>` as its identifier.
Set its owner to `goal:<goal-slug>`. Schedule the ordinary check daily. Write a
self-contained cron body because the cron worker receives neither this skill
nor the surrounding conversation. Include the goal identifier,
`~/workspace/goals/<goal-slug>/hidden_files/travel/flight.json`, and the exact
Duffel query. Include the comparison rules, alert thresholds, deduplication
rule, failure behavior, and stop date. Record the cron identifier in  
`~/workspace/goals/<goal-slug>/hidden_files/travel/flight.json`.

Run exactly one Duffel `search` during each fare cron run. Search the complete
itinerary and passenger mix together with `--limit 30`. Do not use a browser or
web search for repricing. Do not retry `duplicate_search` in the same turn. On
`duplicate_search`, reuse a completed result only when the CLI returns that
completed result in the same command response. On `search_in_progress`, wait
for the original invocation. Retain only results that match the booked dated
flight numbers, airports, passenger count, cabin or fare family, included bags,
stop pattern, and material refund or change restrictions. Compare a candidate
only when its priced scope exactly matches the baseline's complete priced
scope, including every outbound, return, or multi-city leg, dated segment
identity, passenger mix, cabin or fare family, included bags, stop pattern,
currency, and taxes or fees basis. Do not compare a one-way or single-leg offer
with a round-trip or multi-leg paid total. Do not prorate a booking total across
legs unless provider-authored line-item prices establish the exact segment
amount. When priced scope is missing or mismatched, record the check as
non-comparable in  
`~/workspace/goals/<goal-slug>/hidden_files/travel/flight.json`. When priced
scope is missing or mismatched, clear any pending candidate tied to that
mismatch. When priced scope is missing or mismatched, keep the run silent
unless degraded-coverage policy separately triggers. Compute actionable net
savings after known cancellation, change, and rebooking costs.

Treat these baseline gaps as missing priced scope. When the booked fare family
is not stated, a basic, light, saver, or otherwise more restrictive fare brand
is never comparable. When the paid total includes seats, bags, or other extras,
record them separately and compare fares only after removing them or adding the
candidate's current price for the same extras. When the booking source does not
establish whether the paid total covers every traveler, do not compare it.

When no pending candidate exists, persist the best threshold-crossing
comparable candidate in  
`~/workspace/goals/<goal-slug>/hidden_files/travel/flight.json` with comparable
itinerary signature, total, currency, and check time. Do not notify the user
for the first threshold-crossing candidate. Temporarily update the same fare
cron to run once about one hour after the current run. When a pending candidate
exists, run one Duffel `search`. Compare equivalent inventory against the
pending candidate and booked facts. Confirm the pending candidate only when
equivalent inventory still qualifies above either threshold. When the pending
candidate is confirmed, continue to the persistence and notification rules
below. Clear the pending candidate when equivalent inventory disappears, no
longer matches the exact comparable criteria, or falls below both thresholds.
Retain the pending candidate with a source-failure record when the confirmation
search cannot complete because a source failed. Restore the same fare cron to
daily cadence after a confirmed candidate, disconfirmed candidate, or source
failure. Keep the run silent after a disconfirmed candidate or source failure
unless degraded-coverage policy triggers.

Alert only when confirmed net savings exceed either 10 percent of the original
paid total or the booking-currency equivalent of USD 100. Convert USD 100 with
a fresh FX source. Record the FX source time. When reliable FX is unavailable,
apply only the percentage threshold.

Before notifying, read the goal's recent Tracking activities for a later change
to the booked itinerary, such as a rebooked leg or an added traveler. When the
booking changed, update the baseline, clear the pending candidate, and keep the
run silent.

Persist the comparison and stable alert fingerprint before notifying the user.
Add one concise Tracking activity before notifying the user. State when the
fare was confirmed and that fares can change before the user acts. Ask whether
the user wants the main agent to investigate a credit, refund, or rebooking path.
When the user accepts, run one fresh Duffel `search` before quoting savings.
Treat the user's answer as authorization for investigation and preparation
only. Do not cancel, rebook, contact a provider, accept terms, or spend money
without the approval required for that action. Do not promise that a credit or
refund will be granted.

Keep checks silent when no comparable result exists, the price is unchanged, or
the movement stays below both thresholds. After three consecutive expected
source failures, add a degraded-coverage activity to Tracking. Stop the fare job
when the useful change or cancellation window closes, the trip is cancelled
without a replacement, or the Tracking item is completed. Remove the fare job
when the Tracking lifecycle ends.

## Seats

Use `seat-options` only after shortlisting. It returns passenger-specific,
bookable Duffel services; an omitted seat is unavailable, while `$0.00` is a
bookable seat with no added fee. Use `row` and `section` for adjacency. Seats on
opposite sides of an aisle are not adjacent. Seat maps are carrier-dependent
and inventory remains live.

Choose at most one seat per passenger per segment. Do not duplicate a seat.
Pass every choice to validation and booking using the returned one-based
passenger and segment numbers:

```sh
duffel validate-booking --offer-id off_… --booking-json '{...}' \
  --seat 1:1:28B --seat 2:1:28C
```

## Passenger details

After offer selection, ask in chat for only the values required by the booking
JSON or validation:

- each traveler's legal given/family name, birth date, title, and gender;
- one reachable trip email and phone, reusable for passengers when designated
  as their shared contact;
- the accompanying adult for each lap infant; and
- passport details only when validation requires them.

Use chat-supplied values only for this checkout; do not persist them elsewhere
or repeat them to the user. Never request payment-card data or account
credentials in chat.

Allowed titles are `mr`, `ms`, `mrs`, `miss`, and `dr`; gender is `m` or `f`.
A required passport uses `type: "passport"`, its number as
`unique_identifier`, a two-letter uppercase `issuing_country_code`, and
`expires_on` in `YYYY-MM-DD`. Do not send an empty document, invent identity
data, or ticket an unborn traveler; explain that booking must wait until birth.
Do not promise the same fare, availability, or adjacent seats later.

Mention loyalty once. If the user wants an account attached, collect its airline
IATA code and account number in chat and add it to the matching passenger's
`loyalty_programme_accounts`. Validation must confirm support and attachment;
omit a failed account only with the user's agreement. Mention optional seat
availability once without blocking.

Keep passengers in search order. Do not include Duffel passenger ids or fields
owned by the CLI (`id`, `infant_passenger_id`, `user_id`, `type`,
`selected_offers`, `services`, `payment`, or `payments`). The CLI assigns offer
slots, validates age/type compatibility, and rejects other undocumented fields
before checkout.

```json
{
  "data": {
    "passengers": [{
      "given_name": "Legal given name",
      "family_name": "Legal family name",
      "born_on": "1990-01-01",
      "title": "ms",
      "gender": "f",
      "email": "trip-contact@example.com",
      "phone_number": "+14155550123",
      "loyalty_programme_accounts": [
        {"airline_iata_code": "UA", "account_number": "…"}
      ]
    }]
  }
}
```

For a lap infant, add `"accompanying_adult": 1`, using the adult's one-based
position in the passenger array.

## Validate before payment

```sh
duffel validate-booking --offer-id off_… --booking-json '{...}'
```

Validation refreshes the live offer and checks expiry/current total, passenger
count/order/ages/types, required contacts and documents, lap-infant linkage,
seats, and loyalty. It creates no Stripe request and has no HITL. Ask for every
`required_missing` or `invalid` item together and rerun. Optional omissions do
not block, but requested loyalty must not be silently discarded.

Before `book`, compare every `selected_offer.slices[].from` and `.to` with the
chosen airports. Stop on any mismatch. Do not infer a route from search args,
flight number, or city name.

A first booking may require the user's account email and legal name for
a Duffel payment profile. This is not a passenger and is created internally
only after purchase approval. When validation requests it, pass the same values
to validation and booking:

```sh
duffel validate-booking --offer-id off_… --booking-json '{...}' \
  --customer-email owner@example.com \
  --customer-given-name Account --customer-family-name Owner
```

## Book once

```sh
stripe-link payment-methods list --format json

duffel book --offer-id off_… --payment-method-id pm_… \
  --booking-json '{...}' --seat 1:1:28B --seat 2:1:28C \
  --customer-email owner@example.com \
  --customer-given-name Account --customer-family-name Owner
```

If Stripe Link is disconnected, explain the one-time virtual-card flow and
provide its connection link. If the user cannot use that connection, an
airline-site fallback is allowed only when its secure browser handoff or
provider-owned payment surface actually renders for the user. Do not offer
to receive a card number, expiry, security code, billing address, or other
payment credential in chat. Do not transfer chat-supplied card data into the
browser. If neither secure path is available, stop at the prepared itinerary,
say payment is blocked, and provide the exact safe handoff; do not invent a
chat-card workaround. Omit `--customer-*` when validation did not request them.

`book` refreshes and revalidates before any Stripe request. Its single approval
covers the itinerary, passengers, seats/fees, fare conditions, total, optional
first-time booking profile, one-time virtual card, 3DS, and immediate paid order.
Do not use Duffel balance, held-order, inline-card, or separate order/payment
flows.

The trusted approval must show compact passenger names, plus a separate lap-infant
row with name, birth date, accompanying adult, and `no seat`; city and airport
codes, flights, operating carriers, schedules, fare/cabin, selected seats,
masked loyalty, baggage, refund/change conditions, price breakdown, and legal
links. Label absent provider conditions as not stated.

After success, treat a requested loyalty account marked
`not_confirmed_on_order` as unverified, not rejected: explain that the booking
response did not confirm it, it may still be attached, and the user should
check with the airline using the PNR and add it only if absent. Do not claim
attachment failed solely because the response omitted it. Do not retry or
rebook a successful order to repair loyalty.

## Recovery

| Result | Action |
|---|---|
| Validation failure or expired offer before approval | Correct all fields together. If the offer expired, report that and ask the user to continue in a new turn before searching again. No spend exists. |
| `stripe_link_action_required` with `auto_resume` | Send the complete Markdown link once, wait for the user to connect, then rerun the identical `book`. |
| `replacement_required` | Stop; do not change card/offer or create another spend without explicit recovery guidance. |
| Partially completed split booking | Stop. Report the successful bookings and PNRs plus every unpurchased leg. Do not buy a replacement or cancel anything without the user's explicit instruction. |
| Definitive native-provider rejection | Say no booking was created and the card was not captured; any temporary authorization will fall off on the issuer's schedule. Do not retry until the user explicitly requests a new attempt in a later message. |
| Timeout, 5xx, or ambiguous mutation | Do not claim success/failure or retry. Inspect `booking-status`; otherwise escalate. |
| Ambiguous customer-profile creation | No payment started; do not retry profile creation. Escalate for profile recovery. |
| Success with `resource_authorization.persisted: false` | Report the PNR/order and warn later management may be unavailable. Do not repeat the booking. |

Identical offer plus normalized booking data form a resumable checkout identity.
A newly searched offer is a new checkout and can create another authorization
hold, so do not use it as an automatic retry.

## Review, cancellation, and limits

```sh
duffel booking-status
duffel booking-status ord_…
duffel cancellation-quote ord_…
duffel cancel-booking ore_…
```

Without an id, `booking-status` lists locally authorized orders and can recover
a lost order id. `cancellation-quote` does not cancel; report its exact known
refund, destination, airline credits, and expiry. A null refund amount is
unknown, not zero: say that the carrier did not provide a quote. `cancel-booking`
re-checks the exact quote and asks once before the irreversible cancellation.
Do not invent an unknown refund or fee.

Unsupported: paid bags or other services, partial-passenger cancellation,
date/time or name changes, pets, unaccompanied-minor service, check-in, and
boarding passes. Do not improvise with raw APIs; direct the user to the
airline or support.

## Approval rules

- No HITL: search, seat options, validation, booking status, cancellation quote.
- Exactly one HITL: native `book`, airline browser checkout, or cancellation. The
  airline browser checkout uses the same single purchase-approval boundary as  
  `book`.
- Any change to flight, date, passengers, fare, services, or total requires a
  fresh purchase approval.
- Retry `search` only when its response explicitly says `retriable: true`;
  successful, duplicate, in-progress, terminal, and budget-exhausted searches
  must not be repeated in the same turn. Other reads may be retried. Do not
  automatically retry an ambiguous mutation.
