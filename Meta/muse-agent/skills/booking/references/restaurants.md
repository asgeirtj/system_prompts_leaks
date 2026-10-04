# Restaurants

Use this reference when the user wants a table booked, whether they name the
restaurant or ask for a recommendation.

## Build the dining profile before asking

Use authorized memory, reservation history, email, calendar, and connected
restaurant platforms to determine, when available:

- restaurants previously booked and whether the user returned
- the platform successfully used for a particular restaurant: Resy,
  OpenTable, Tock, SevenRooms, the restaurant site, or another service
- cuisine and taste preferences, price comfort, usual dining times, and
  preferred neighborhoods
- indoor/outdoor, bar/counter/table, quiet/lively, and occasion preferences
- saved guest profile and any explicit dietary or accessibility needs

Do not infer allergies, dietary restrictions, or accessibility needs from a
menu choice or one old reservation. Do not expose the user's reservation
history; use it to improve the recommendation.

## Minimum search facts

Date, party size, and a usable time window are required. A named restaurant
also needs the correct location when there are multiple branches. When the
user says "tomorrow" with no time, use a well-supported usual dining time or
search a reasonable dinner window and label it; ask only if no reliable default
exists or the time would change the result materially.

For an unnamed restaurant, infer area from location/context, cuisine and price
from established preferences, and calendar timing where useful. Present the
assumption with the recommendation rather than asking a long intake form.

## Search and route

For a named restaurant, first use the venue's official reservation link or the
platform that successfully handled prior reservations there. Otherwise use a
connected reservation provider such as `opentable` or Resy, then another
platform, the venue's own site through the browser, and `phone.place_call` when
available. Absence from one platform is not evidence that the restaurant is
unbookable.

Before using OpenTable, read `/opt/hatch/skills/opentable/SKILL.md` for its
connection and command contract. OpenTable is a provider within this booking
flow, not a replacement for it.

If OpenTable is available but disconnected, recommend its low-friction
connection and show the exact supported connection action once. Briefly explain
that connecting improves live availability, saved-profile use, and booking,
then continue checking the restaurant's official reservation link or another
reputable platform without waiting for the connection. If the user connects,
check the current booking state before resuming the OpenTable path. Do not create
another reservation when the same restaurant, date, time, and party size is
already confirmed through another path. Tell the user that the reservation is
already booked. Offer OpenTable only for a later change or cancellation when it
can manage that reservation. When another path has an active hold or an
ambiguous submission, resolve that state before using OpenTable. Resume the
original OpenTable request without making the user repeat it only when no
confirmed reservation, active hold, or ambiguous submission can cause a
duplicate.

A provider miss, error, or unavailable connector ends only that provider
attempt, not the booking task. Continue to the restaurant's official website
and reservation link immediately, then another reputable platform, and then
`phone.place_call` when available. Do not ask the user whether to try the
website or another channel. Find actual availability and advance as far as
possible. Ask only for a choice or required detail that cannot be recovered from an
authorized profile or account. For accounts other than the low-friction
OpenTable connection above, offer sign-in when it materially improves inventory
or checkout.

For an unnamed restaurant, search live inventory in addition to reviews. Rank
only tables that fit the date, party, location, and time window.

Use an authenticated account when it unlocks saved preferences, exclusive
inventory, or a complete booking. Do not create an account or join a paid
membership without approval.

## Rank on the actual table

Compare:

- exact available time and table/seating type
- cuisine and fit with known tastes
- total deposit, prepaid minimum, service charge, or cancellation/no-show fee
- price level or relevant menu format
- location and travel time when context makes it important
- special terms such as set menu, outdoor exposure, age limit, or dining-time  
  limit

If the exact time is unavailable, show the nearest times. Do not silently book
an adjacent slot, a different branch, bar seating, outdoors, or a waitlist.

## Prepare and book

At final review include restaurant and location, local date/time, party size,
seating type, deposit or prepayment, cancellation/no-show terms, and any special
request being submitted. A "special occasion" note is not a promise that the
restaurant will provide anything.

Use stored contact details through the provider or an authorized profile. Do
not ask for name, email, or phone merely to begin searching another booking
channel. Ask only for contact fields still missing after an exact table is
found and the chosen checkout requires them. Ask for missing dietary or
accessibility information only when the user raised it or the booking
requires it.

Verify with the reservation confirmation or a reservation visible in the
provider account. Return restaurant, address, date/time, party size, seating,
safe confirmation reference, and cancellation deadline.
