# Flights

Use this reference for direct flight-booking requests. It does not turn the
request into a trip plan.

## Build the flight profile before asking

Use authorized memory, email, airline accounts, wallet/card profiles, linked
financial data, and prior bookings to determine, when available:

- preferred and avoided airlines or alliances
- aisle/window preference, preferred rows or zones, and tolerance for middle  
  seats
- cabin and fare-class preferences, including whether basic economy is  
  acceptable
- preferred origin, destination, and alternate airports
- loyalty programs, status, and usable membership linkage
- card products whose known airline benefits or transferable points matter;
  use Plaid only to identify linked products or relevant transactions, not as
  proof of benefits, reward rules, or point balances
- airline credits, vouchers, companion certificates, upgrade instruments, and
  their expiry or restrictions

When a loyalty program or status is relevant, mention the airline or alliance
and safe tier name before presenting the shortlist. Do not expose the membership
number.

## Minimum search facts

Origin, destination, departure date, directionality, and traveler count are
required to price. Search for one adult and a one-way trip when "me" and a
single travel date make those assumptions natural, then label the assumptions.
Ask before search only when the missing fact creates a materially different
route or could select the wrong passenger.

Resolve relative dates in the origin timezone. Check the calendar for hard
conflicts and infer realistic departure windows from the request and history,
but do not infer a different date.

## Search and route

Search live flight inventory with an available native provider such as
`duffel`. Also check the airline's authenticated site when loyalty status,
credits, companion benefits, upgrades, or cardholder pricing could materially
change the result. Use browser checkout when the native provider cannot apply
the relevant benefit or cannot complete the chosen itinerary.

Keep the native provider name internal. Do not mention Duffel in the message or
ask the user to choose between Duffel and the airline. Present airlines,
itineraries, fares, and user benefits. Introduce the airline website explicitly
only when signing in could unlock or verify points, status benefits, credits,
certificates, member pricing, or another relevant advantage, or when the
user asks to book direct.

### Search shortest useful journeys first

Unless the user explicitly prioritizes something else, optimize first for
elapsed journey time, including connections. When Duffel is available, the
`Search and compare` section in `/opt/hatch/skills/duffel/SKILL.md` is the
single authority for provider search ordering, pass count, filters, and airport
expansion. Use the returned result set to surface a meaningfully cheaper longer
option when one is available; do not require a second provider pass solely to
produce that comparison.

A targeted Duffel result of zero means only that Duffel did not return a
matching bookable offer; it is not evidence that the airline does not fly the
route.

Use [ITA Matrix](https://matrix.itasoftware.com/search) as the route-coverage
backstop after the first Duffel search when:

- a requested, preferred, or otherwise expected carrier is missing
- Duffel returns fewer than three credible itinerary shapes
- alternate airports, connection points, nearby dates, or a complex routing
  could materially improve the result

Matrix remains optional only when Duffel already provides credible coverage
and no relevant carrier or route appears missing. Matrix is not a booking
provider and its displayed fare is not proof that an itinerary remains
available for sale.

For a promising Matrix result, retain enough detail to reproduce it: travel
dates, airport pair, marketing and operating carriers, flight numbers, local
times, cabin, stops, and fare or booking-code details when shown. Then locate
the same itinerary in live bookable inventory:

1. Check `duffel` when it is available.
2. If Duffel cannot reproduce the itinerary and price, check the operating or
   ticketing airline's website.
3. Compare the same passenger mix, cabin and fare conditions, currency, and
   full total, including unavoidable fees. A similar schedule or headline
   price is not an exact match.

Present the itinerary as bookable only at the current verified Duffel or
airline price. If neither source can reproduce it, use Matrix only as routing
evidence, explain that its fare could not be verified, and do not offer that
fare for selection or checkout. If the itinerary matches but the price does
not, show the current bookable price and clearly note the change.

If Matrix exposes a useful carrier or nonstop itinerary that Duffel omitted,
check that airline's own website even when Duffel returned other acceptable
offers. Do not stop after presenting only the carriers that happened to occupy
Duffel's first result page.

Provider rollout and skill rollout are separate. If `duffel` is absent or
returns its availability-gate response, do not retry it during the turn and do
not imply that native flight booking is available. Continue directly with the
airline through the browser. The rest of this flight flow still applies.

Compare cash and points only with live redemption data. Show taxes and fees on
an award, the transfer ratio and delay for transferable points, and the cash
value being displaced. Do not transfer points merely to discover availability.

Prefer a card based on concrete value for this itinerary. Relevant value can
include credit eligibility, free bags, lounge access, insurance, or bonus
earning. Do not prefer a card based on a generic points claim. Confirm that a
credit is valid for the operating or marketing carrier and has not expired.

## Rank on the whole journey

Lead with the shortest reasonable itinerary, normally preferring nonstop over
a connection. Then include a meaningfully cheaper longer option and other
distinct tradeoffs such as the best preferred-airline or flexible fare. Do not
fill the shortlist with near-duplicate cheap results while faster or nonstop
choices exist.

When the user has status, favor eligible flights on that airline or alliance
when the schedule, fare, and operating carrier make the status benefits useful.
Keep a materially faster or cheaper non-status option visible and state the
tradeoff; status is a ranking advantage, not an instruction to overpay or accept
a poor itinerary.

Compare:

- full cash total or points plus cash, including bags and seat fees
- operating airline and flight number
- departure and arrival airports, terminals when relevant, and local times
- next-day arrival markers
- stops, connection airports, connection length, and total duration
- cabin, fare brand, seat availability, and upgrade state
- baggage allowance
- refund, change, same-day-change, and credit-expiry rules
- loyalty earnings and material card/status benefits

Reject unsafe or unrealistic connections and airport changes. Do not call a
fare "cheapest" when required bags or seats make it more expensive.

If preferences conflict, explain the decisive tradeoff: for example, the
preferred airline costs more but uses the user's credit and avoids a middle
seat.

## Flight comparison response

Every user-visible comparison of live flight options must use `widget.create`
with `kind: "list"` and flight rows whenever `widget.create` is present in the
current tool set. Tool availability is the capability signal: do not choose a
Markdown table because client support is uncertain, the schema is lengthy, the
provider output is large, or Markdown is easier. Attempt the structured list
before writing the response. Use the Markdown fallback only when
`widget.create` is absent or one valid `widget.create` call returns an explicit
unsupported or rendering error.

Do not delegate a native-provider flight comparison to a generic research or
browser worker. Keep its search and widget creation in the user-facing agent.
If a worker already searched, require its unchanged response path and candidate
pointers; never relay its table. Confirm a successful `widget.create` before
responding. Invalid arguments require a corrected retry, not Markdown.

Do not use a shopping widget or a duplicate option picker. Search the complete
requested itinerary together and put complete offers for the same itinerary
and dates in one comparison list. Show the best four distinct matching trips,
or every match when fewer than four exist.

The widget requires the complete normalized provider offer. Do not pipe or
truncate the search response, and do not replace it with a hand-built summary.
Redirect every search directly into a distinct temporary JSON file on its first
attempt, verify its exit status and response, and keep the saved JSON unchanged
until widget creation succeeds. If an earlier search was piped, truncated, or
reduced by a custom parser, do not repeat it in the same turn; ask the user to
continue in a new turn so the complete response can be retained.

For native-provider JSON, create one row per selected complete offer with
`type: "flight"` and point directly into the unchanged search file:

```json
{
  "flight_details_file": "/tmp/flight-search.json",
  "json_pointer": "/offers/0"
}
```

Use the original offer's zero-based array index. Do not copy the offer JSON into
the tool call, rewrite timestamps, remove fields, or generate a separate widget
payload file. The runtime reads the selected object, enriches its presentation,
and stores the complete flight data without retaining the path or pointer.

For browser results, use inline `data: {"flight_data": FlightData}` or save that
same verified flight object and use `flight_details_file`. Preserve the complete
offer: private mapping `id`, passengers, full-party `price` and `currency`, every
slice and segment, airport-local timestamps, source durations, carrier and
operating-carrier details, flight numbers, cabin, fare brand, bags, stops, and
three-valued fare conditions. Do not calculate elapsed durations by subtracting
timestamps from different airport timezones. Do not expose the offer id.

Present the widget once with `present_now: true`, or include its returned embed
token unchanged when it was created without immediate presentation. Do not
repeat the rows in prose or a Markdown table.

After presenting a flight widget, keep the accompanying message to a short
acknowledgement. Add details only to answer something the user explicitly
asked or explain a material mismatch with their request. Do not repeat
information available in the widget, add a "Details" section, or ask the user
to type their flight selection. Let the user select flights through the widget.

Choose the list action from the current flow:

- For direct booking or a trip that is `ready to book`, omit `flight_action`.
  The runtime supplies its default booking CTA and derives an identifying
  booking reply from the complete offer.
- When Travel Planning hands off a `planning only` trip, set the list-level
  `flight_action` to `{"cta_text":"Add to plan","response_message_prefix":"Add this flight to my trip plan:"}`.
  Return that selected itinerary to the plan so Travel can offer the separate
  choice to book now or keep planning and book later.

Do not author a row-level `response_message`. The runtime appends the exact
complete itinerary and total to either response. Treat the interaction as
selection of the complete offer, not as approval to purchase it. Add
`flight_link` only for a verified details URL.

Include the entire offer in one row during comparison and after selection: one
slice for a one-way trip, two for a round trip, and every requested slice for a
multi-city trip. Do not split or duplicate a round trip into outbound and return
rows, pair legs from different offers, or invent per-leg prices. Keep separately
ticketed one-way offers separate and explicit.

If `widget.create` is absent, or its valid invocation explicitly fails because
the client cannot render the native flight list, follow
`/opt/hatch/skills/booking/references/presentation.md` and use its compact
flight Markdown table. Do not infer lack of support without attempting the tool
when it is available. In either format,
every itinerary must show all of:

- full party price and currency, labeled as one-way or round-trip
- each leg's local departure and arrival times and airports
- each leg's total elapsed duration
- nonstop or the exact stop count
- every connection airport and layover duration
- marketing carrier, operating carrier when different, and flight numbers
- cabin and fare brand when stated

Do not defer price, duration, stops, or layovers to a follow-up. Calculate
each layover from the adjacent provider segment timestamps at the same airport;
if the timestamps are insufficient or ambiguous, write `layover length not
stated` rather than omitting it or guessing. Keep baggage and change/refund
terms in the native widget. For the Markdown fallback, keep shared terms in
one short `Details:` line after the table and option-specific differences in
their rows. Ask the user to reply with the option label only when using the
Markdown fallback.

Do not use HTML or present the same inventory in a second format.

## Prepare and book

Price the selected offer again immediately before final review. Surface any
fare, seat, baggage, airport, schedule, or operating-carrier change.

When known airline status, points, credits, or certificates could apply, ask
one combined decision before choosing the purchase channel: whether to sign in
to the airline website and compare cash and points, check cash only, or check
points only. Recommend comparing both when time permits. Use the signed-in
airline path to verify member benefits and redemption availability; do not
infer a points balance from status or transfer points without separate explicit
approval.

At final review include traveler count, exact itinerary, cabin and fare brand,
assigned or selected seats, bags, total, points/credits applied, amount charged,
and fare rules. Ask before a points transfer, certificate use, or paid upgrade.

Follow the native provider skill for checkout fields. Payment
credentials and account passwords remain secure-surface-only. Do not expose
native-provider commands, offer ids, or validation fields.

Verify the booking with the airline/provider confirmation and passenger name
record. Return the route, dates, flight numbers, seats, total, and safe
confirmation reference. Do not display full loyalty, passport, Known Traveler,
redress, or payment numbers.
