# Hotels

Use this reference for direct hotel-booking requests. Do not expand the ask
into flights, activities, transportation, or a full itinerary.

Ask date, occupancy, account, and option questions in plain Markdown. Do not
call `create_options`. Use the native map/list presentation below for results.

Keep implementation details out of traveler-facing responses: do not mention
APIs, tools, response fields, integrations, or their limitations. Never replace
a missing provider fact with reputation or general knowledge. If a requested
material fact cannot be verified, say only that it could not be verified for
the displayed option; otherwise omit it.

## Build the stay profile before asking

Use authorized memory, email, hotel and booking-platform accounts, and prior
stays to determine, when available:

- properties and neighborhoods previously used in the destination
- explicit likes/dislikes from prior stays
- boutique versus large hotel, independent versus chain, and desired service  
  level
- usual room type, bed type, floor, view, quiet-room, accessibility, and
  smoking preferences
- price comfort and willingness to prepay
- loyalty programs, status, points, free-night certificates, upgrade benefits,
  breakfast, parking, resort-credit, or late-checkout eligibility
- preferred booking channel, including direct hotel accounts and platforms
  such as Booking.com

Do not treat one historical stay as a permanent style preference. Do not infer
accessibility requirements or willingness to accept a non-refundable rate.

## Minimum search facts

Destination or property, check-in, check-out, guest count, and room count are
required. If the user names only a night, infer a one-night stay and label it.
Use the destination timezone for dates. Ask early only if destination ambiguity
or occupancy would invalidate the search.

Every child must have an exact age before searching because age changes lodging
eligibility and price. Ask once for any missing ages; do not infer them or
search children as adults. Search again whenever the room occupancy or a child
age changes.

If the location is broad, use the stated purpose, calendar event, prior
neighborhood history, or current context to center the search. Say what the
search is centered on.

Do not block the first useful search on location preferences. With the initial
shortlist, ask whether they care about proximity to a particular place,
neighborhood, event, office, or transit stop. If they name a target, calculate
or verify travel time and rerank the options around it.

When `widget.create` is available, automatically show a `local_map` for a
multi-property shortlist. Use only provider coordinates or coordinates
verified with an available maps/places tool; never guess them. Give every
marker the same stable option label and property name used in the comparison,
put the full-stay price and decisive term in its subtitle, and attach that
property's verified image as `background_image_url` when available.
Prefer coordinates returned with the lodging result. Do not geocode properties
that already have both coordinates, do not delay the initial map to fetch
missing photos or other per-property enrichment, and create the shortlist map
in one widget operation rather than iteratively rebuilding it.

If exact coordinates cannot be verified or the map call fails, create a
generic native `list` whose rows use the same labels and order, with one
verified property image attached to its corresponding hotel. The list is a
visual summary, not a selection control; keep the compact Markdown comparison
as the place where complete terms and the user's `A`/`B`/`C` choice are clear.
Never emit an unlabeled image grid. If neither widget is available, place each
labeled image immediately beside or below its hotel's Markdown entry.

## Search and route

Use an installed lodging provider for live lodging discovery and rate refreshes
when available; otherwise use another connected accommodation tool or the
browser. Do not treat a flight-only integration as supporting hotels. Confirm
shortlisted rates rather than trusting teaser prices. Check the authenticated
hotel-chain site when status, member pricing, points, or certificates matter.
Check a connected booking platform when it contains useful history, member
pricing, or better inventory.

For the selected rate, use native checkout only when the freshly refreshed
provider data explicitly marks that exact rate eligible. When a selected rate
requires provider-hosted checkout, always surface its validated URL. If the
user has already asked to complete the booking, continue through that exact URL
in the browser; otherwise leave it as an actionable link without asking an
additional question. A provider-hosted checkout URL is the provider's supported
completion path, not a failed provider path. Do not switch rooms, rates, or
terms to force native checkout. Booking retrieval, cancellation terms, and
cancellation apply only to bookings represented by an owned capability in the
selected provider skill.

Compare direct and third-party rates on equivalent rooms and terms. A cheaper
third-party rate may lose status credit, upgrades, breakfast, flexibility, or
direct support; a direct rate is not automatically better.

When moving to a hotel or booking-platform website, ask whether the user has
an account there and wants to sign in so member rates, loyalty benefits, saved
preferences, and booking history can be used. Continue as a guest if they do
not. Do not require a new account.

When browser continuation applies under the rule above, follow the shared
browser-booking workflow. Do not switch properties, room types, dates, or rate
terms because one channel fails.

## Rank on the full stay

Compare:

- full stay total, taxes, mandatory resort/destination fees, and anything due
  at the property
- room and bed type, occupancy, and whether the room is guaranteed
- exact location and travel time to the stated purpose
- cancellation deadline, refundability, prepayment, deposit, and card hold
- included breakfast, parking, Wi-Fi, credits, and meaningful status benefits
- points earned or redeemed and certificate value
- check-in/check-out times and late-arrival requirements

Do not compare only nightly rates. Disclose the charged-now and due-at-property
amounts separately. A property with only an estimated total, missing mandatory
fees, or unknown current cancellation terms is not a bookable contender. Keep
it outside the ranked shortlist until rechecked. Do not label a rate
`refundable` when its cancellation deadline has passed; reverify it.

## Prepare and book

Revalidate the chosen room and rate immediately before final review. Surface
any room, bed, view, refundability, fee, or benefit change.

At final review include property and address, dates, guests/rooms, exact room
and bed, rate name, full total, due now, due at property, deposit/hold,
inclusions, loyalty/points/certificate use, and cancellation deadline.

Use secure provider or profile fields for identity, membership, and payment data.
Do not expose full values in chat.

Verify with a provider confirmation number and a reservation visible in the
hotel or booking-platform account when possible. Return the safe confirmation
reference, dates, room, total, due-at-property amount, and cancellation
deadline.
