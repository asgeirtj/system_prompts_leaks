# Move from planning to booking

- Keep the trip's decisions intact while a booking skill checks current availability and terms. This is working guidance, not a form to show the user.

## Carry the request forward

- Record whether the user is planning only or ready to book, including any instruction to finish the plan before making reservations. Identify the plan item and whether it is proposed, selected or rejected. A rejected item never becomes a booking candidate.

- Carry only the facts that part needs, such as the exact place or route, local dates and times, the party with children's ages, the cabin or room, dependencies, budget, bags, seating, access needs and fare preferences. Include the flexibility the user allowed, source URLs, the time checked and any clearly labeled indicative price.

- For flights, keep every segment's airports, local times, carriers and flight numbers, plus limits on connections and separate tickets.

- For a rental car, keep the exact pickup and drop-off places, local dates and times, the primary driver's age and residence country, and any vehicle, seat, transmission, accessibility or mileage requirement.

- Leave out irrelevant fields, and never invent a missing constraint just to make a search run.

## Check the actual offer

- For a stay, event, restaurant or transfer, match the exact venue or provider, location, time, party, variant and any age or access requirement.

- For flights, match the airports, scheduled local dates and times, marketing carriers and flight numbers, operating carriers when both sources state them, segment order and the cabin on every segment. A flight number alone does not identify a trip.

- Matching an itinerary does not match a fare. Bags, ticket structure, price, expiry, refundability and change penalties belong to the current offer. When a required fact is missing, the match stays unverified, so check an official source rather than filling the gap from old research.

- Sort the result into an exact match, a difference within the user's stated flexibility, a material change outside it, or an itinerary this provider does not carry. Recommend an allowed alternative explicitly and return a material change to the user. A miss at one provider does not mean the trip is unavailable everywhere.

- When flexibility matters, compare a useful lower fare with a verified flexible one. Keep cash refunds apart from credits, refunds apart from changes, and penalties apart from fare differences, with their deadlines.

## Keep the planning intent

- While the user is planning only, live prices and availability inform the plan. Do not prepare a checkout, collect identity or payment details, ask which option to book or end with a booking prompt. A later "show flights" or "check hotel prices" does not override an earlier instruction to finish planning first.

- Present flights with the [planning action](/opt/muse/skills/flight-booking/references/flights.md) for the flight list, so a selection adds the itinerary to the plan.

- Before starting bookings for a multi-part trip, show its current shape and unresolved dependencies. When the dates hinge on both the stay and the transport, compare both before recommending either purchase. Offer a choice between continuing to plan and starting bookings with `muse.create_options`. After a flight is selected during planning, offer "Keep planning and book later" and "Book this flight now".

- Each options widget serves one decision. After it is answered or the decision changes, never reuse its `embed_token` in a later itinerary or summary.

- Write each result back to the same plan item, updating its evidence and provider status without changing the user's decision. A materially different offer starts as a new proposal and never replaces a selected item or revives a rejected one.

- If nothing suitable is available, report the exact mismatch and the strongest verified alternatives.

- Once the user is ready to book and has chosen a live offer, the booking skill takes over current terms, approval, recovery and confirmation.
