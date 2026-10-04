# Flight itinerary discovery

Use itinerary discovery to find a good route shape before live-offer work when
dates, airports, stops, or the ordering of several cities is open. For a
straightforward route with bounded dates and travelers, skip this step. Let
Booking own the live-offer search.

## When ITA Matrix helps

ITA Matrix helps you explore:

- open-jaw and multi-city orders;
- flexible dates or nearby origin and destination airports;
- nonstop versus connection and stopover tradeoffs;
- airline, alliance, connection-airport, or time-of-day constraints; and
- schedule patterns that affect lodging, transfers, or a fixed event.

ITA Matrix is a discovery interface. Its result is not a hold, a live booking
offer, or proof that Duffel or an airline website can sell the same itinerary
and fare now. Do not make it a mandatory detour for every flight request.

## Use a read-only browser task

Use `browser.spawn_task` for the official ITA Matrix search at
`https://matrix.itasoftware.com/search` because it is an interactive website
workflow. Give the browser task a self-contained brief. The browser task does
not inherit the conversation. Include:

- exact origins and destinations, plus allowed nearby airports;
- dates or date ranges and the trip order;
- traveler counts and requested cabin;
- maximum connections and any airline, airport, time, overnight, self-transfer,
  or separate-ticket restrictions;
- the comparison objective, such as shortest practical route, best arrival, or
  a useful low-price pattern; and
- an instruction to research only, make no purchase, and return normalized
  candidate details with the page's retrieval time.

Do not include traveler names, documents, payment details, or other personal
data that schedule discovery does not need. An ITA Matrix research session is
not an airline checkout session.

## Capture a stable itinerary signature

For each candidate, record every segment in order:

- local departure date and time;
- origin and destination airport codes;
- marketing carrier and flight number;
- operating carrier and flight number when different;
- local arrival date and time, including next-day arrival;
- connection airport and layover duration;
- cabin, and whether cabin varies by segment; and
- whether the result appears to be one fare/ticket or that fact is unknown.

Also retain the search inputs, source, retrieval time, and any displayed fare
or fare construction. A displayed amount is an indicative planning signal only.
Keep it separate from a later live total. Do not describe a fare basis, booking
class, or ticketing carrier as preserved unless the live provider returns the
same commercial terms.

Flight number alone is not an itinerary identity. Codeshares, operating
carriers, repeated flight numbers, local-date boundaries, airport swaps, and
schedule changes can all make a superficially similar result different.

## Produce a short candidate set

Return two to four candidates that expose real tradeoffs. Do not return a raw
result dump. For each, summarize:

- the complete route and important local times;
- total journey time, connections, overnight or airport-change risk;
- why it fits the trip better or worse;
- the indicative displayed amount, currency, and retrieval time when present;  
  and
- what remains unknown until live booking verification.

Do not rank an option as cheaper when fees, ticket structure, or the relevant
passenger total is unclear. Do not call a route refundable or changeable from a
generic cabin or fare-brand label.

## Failure and fallback

A CAPTCHA, bot wall, broken date picker, incomplete result, or lost browser
session is a source failure. It is not evidence that no flight exists. Do not
loop on the same broken interaction. Continue with a live provider search when
the trip is bounded enough, use another reliable schedule source when planning
still needs it, or explain the narrow evidence gap.

When the user selects a candidate, or when price or availability is needed to
choose, continue with
`/opt/hatch/skills/travel-planning/references/booking-handoff.md`. Do not send
the user away to reproduce the ITA Matrix search.
