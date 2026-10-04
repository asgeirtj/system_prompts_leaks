# Event tickets

Use this reference for sports, concerts, theater, comedy, and other ticketed
events.

## Resolve the event before asking

Use authorized context, calendar, ticketing accounts, email, and live schedules
to resolve:

- exact team, artist, show, or event
- the next relevant occurrence and its local date/time
- home versus away, venue, city, and competition/season when ambiguous
- prior ticketing platforms, favorite sections, price comfort, and seat-view  
  preferences
- memberships, season-ticket access, presales, fan-club benefits, or cardholder  
  offers
- usual party size only as a hint; do not assume companions are attending

For "the Patriots' next game," verify the official schedule and whether "next"
means the next game overall or the next home game in the current context. Ask
only if both remain plausible and lead to different purchases.

## Minimum search facts

The exact event occurrence and ticket count are required. Seating and budget
can be inferred as search preferences from reliable history, but they are not
permission to exceed a stated or established ceiling. Accessibility seating
must be explicit. Do not infer it. An unanswered ticket-count question remains
unresolved even if the user answers another part of the question. Never call
seat inventory such as `top-picks` until the exact count is known; ask again.

## Search and route

Check official schedules first. Search primary inventory through the venue or
an available provider such as `ticketmaster`, including authenticated presales
or account offers. Then compare reputable verified resale inventory when it is
legal and useful. Clearly label primary versus resale.

Before using Ticketmaster, read `/opt/hatch/skills/ticketmaster/SKILL.md` for
its command contract. Ticketmaster is a provider within this booking flow, not
a replacement for it.

Search output or a buy link is not a completed booking. Use the authenticated
browser to choose exact seats and reach final review. If an onsale has not
opened, report the verified onsale time; do not pretend inventory is sold out.

Do not use speculative or unverified ticket listings. Do not create a paid fan
club membership, season plan, or credit-card application to unlock inventory.

## Rank on the exact seats and delivered price

Compare:

- section, row, exact seats, and how many are together
- sightline, distance, side/angle, and obstructed or limited-view notation
- primary versus resale and the seller/marketplace guarantee
- itemized ticket price, service/facility/order fees, taxes, and delivered total
- ticket format, delivery timing, transfer restrictions, and resale policy
- refund/postponement/cancellation terms
- material membership, presale, or cardholder benefit

Do not recommend seats from a venue map alone when actual inventory is
available. Do not silently move to a different date, venue, performance, ticket
count, seating area, or resale listing.

Treat shade, roof coverage, weather exposure, and obstructed view as
listing-specific claims. Do not infer them from a side or section name. Without
a current source that explicitly supports the attribute for that section or
ticket group, say it is unverified; general venue facts may support only a
labeled best-likelihood recommendation, never a guarantee.

## Prepare and book

Seat holds expire quickly. Keep the same checkout alive, show the hold expiry,
and refresh the exact seats and total if approval arrives late.

At final review include event, venue, local date/time, ticket count, exact
section/row/seats, primary or resale status, itemized fees, delivered total,
delivery method, transfer restrictions, and refund/postponement terms.

Use the saved ticketing profile and secure wallet at checkout. Do not expose
full membership or payment numbers.

Verify with an order number and tickets or a delivery record visible in the
account. Return the event details, seats, total, safe order reference, delivery
state, and any deadline. If tickets will arrive later, say so plainly; an order
confirmation is not the same as tickets already delivered.
