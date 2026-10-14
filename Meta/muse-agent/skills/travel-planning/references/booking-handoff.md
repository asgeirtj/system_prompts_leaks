# Planning-to-booking handoff

This handoff preserves a travel decision while replacing planning evidence with
live commercial truth. It is internal working state. It is not a form to show
the user.

## Route to the right booking owner

Do not run a live booking search under Travel Planning. When `booking` is
available, load it first. Let Booking own the live search, transaction, and
provider composition. Known specialist companions are:

| Component | Specialist when available |
|---|---|
| Flights | `duffel` |
| Restaurants | `opentable` |
| Shows, concerts, sports, and other supported ticketed events | `ticketmaster` |

Use the current Skills catalog rather than treating this table as exhaustive.
When the catalog lists an exact specialist that this table does not, prefer
that specialist. Hotels, vacation rentals, rental cars, rail, transfers, and
general activities currently remain with Booking's website, provider, or call
path when no specialist is listed. If `booking` itself is absent, you may use
the relevant specialist's documented self-contained fallback. Do not invent a
provider. Do not make the user repeat the planning brief.

## Candidate input

Carry forward:

- the current trip posture: `planning only` or `ready to book`, including any
  explicit instruction to finish planning before transactions;
- the requested outcome and which candidate the user selected, if any;
- the canonical plan item and its proposed, selected, or rejected decision  
  state;
- for a stay, event, activity, restaurant, or transfer: the exact named item,
  location, local date and time or window, duration, party, child ages or
  accessibility constraints, and dependencies;
- exact traveler counts and child ages used for pricing, plus requested cabin;
- every flight segment's airports, local dates and times, marketing flight, and
  operating flight when known;
- one-ticket, self-transfer, airport-change, overnight, and connection bounds;
- the user's allowed flexibility in dates, times, airports, carriers, cabin,
  route, and ticket structure;
- budget, baggage, seating, accessibility, loyalty, and refund/change needs that
  affect the offer; and
- each planning source, official or booking URL when verified, its retrieval
  time, and any indicative amount clearly separated from live price.

Do not hand a rejected item forward as active. Do not require every field when
it is irrelevant. Do not invent a traveler, airport, date, cabin, or flexibility
bound so that a provider search can run.

## Establish live truth

Drive the Booking search with the actual item, timing, party, and itinerary
shape. For a non-flight item, match the exact provider or venue, location,
local date and time, party or quantity, variant, and any accessibility or age
requirement before comparing current price and terms. For a flight candidate,
compare every returned segment in order. An exact itinerary match requires the  
same:

- origin and destination airports;
- scheduled local departure and arrival dates and times;
- marketing carrier and flight number;
- operating carrier and flight number when both sources state them;
- segment and connection order; and
- cabin on every segment.

Matching an itinerary does not match its fare. The live provider's fare brand,
baggage, ticket structure, total, expiry, refundability, changeability, and
penalties are a new commercial offer and are authoritative only for that live
offer.

If a fact needed for an exact match is absent from the live result, the match is
unverified rather than exact. Check the official airline when practical or
surface the uncertainty; do not fill it from the planning source.

Classify the result internally:

- **exact match:** The itinerary signature matches. Compare the new commercial
  terms with the plan.
- **within delegated flexibility:** A difference falls within bounds the user
  already gave. You may explicitly recommend the option.
- **material mismatch:** A route, schedule, cabin, ticket structure, price, or
  condition changed outside those bounds. Return the choice to the user.
- **not found in this provider:** The searched inventory did not contain the
  candidate. Do not treat this result as proof of real-world unavailability.

Do not silently collapse the last two states into the selected candidate.

## Compare flexibility honestly

When flexibility matters, compare a useful lower-cost offer with an explicitly
refundable or changeable alternative when available. Keep these facts separate:

- refundable versus non-refundable versus not stated;
- refund to cash versus airline credit when the provider states it;
- changeable versus refundable;
- change or cancellation penalty, including when it is not stated;
- fare difference owed after a change; and
- deadline or pre-departure restriction.

Do not infer conditions from a cabin name, brand label, airline reputation, or
the planning source. An unknown condition is not a restrictive condition and is
not a flexible one.

## Return to planning or continue

When the trip posture is `planning only`, live availability and price are
research inputs. Booking may search and compare exact options, but it must not
prepare checkout, collect transaction-only identity or payment fields, or ask
which option to book. For flights, it must present the live comparison in the
native flight widget. The user may choose or point to a preferred itinerary in
that widget, but the choice updates the plan only and does not authorize a
purchase. For this planning-only list, pass the list-level  
`flight_action: {"cta_text":"Add to plan","response_message_prefix":"Add this flight to my trip plan:"}`.  
Do not use that override once the posture is `ready to book`; omission preserves
the widget's default booking action. A later request to "show flights," "check
hotel prices," or inspect another bounded component does not by itself override
the user's plan-first instruction. Return the verified options and material
tradeoffs to Travel Planning so it can update the whole-trip view and ask the
next planning decision.

Before changing a multi-part trip to `ready to book`, show the current trip
shape and unresolved dependencies. When `muse.create_options` is available,
offer a concise choice between continuing planning and starting bookings. The
user's choice changes the posture; a live search, provisional favorite, or
flight-widget interaction that only selects an itinerary does not. After a
flight is selected while the posture remains `planning only`, use
`muse.create_options` to offer `Keep planning and book later` and `Book this
flight now` rather than asking for a typed response.

If no exact or authorized-flex option is live, return the concrete mismatch and
the strongest verified alternatives to Travel Planning. Preserve the user's
settled decisions. Change only what the evidence requires.

Write the result back to the same canonical plan item. Update its operational
evidence and provider state without changing its decision state. A provider
alternative outside delegated flexibility is a new proposed item. It does not
replace the selected item, revive a rejected item, or enter the active
itinerary merely because the search returned it.

Once the posture is `ready to book` and a live option is selected, Booking owns
current price and terms, transaction approval, mutation recovery, supplier
confirmation, and follow-through. A planning selection is not purchase
approval.
