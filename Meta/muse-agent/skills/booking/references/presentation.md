# Booking presentation

Make booking responses easy to scan, compare, and act on. The user should
understand the recommendation, tradeoff, full cost, and next action without
reading a wall of text.

Use this reference whenever presenting options, an exact-term review, or a
completed booking.

## Response shape

For native flight widgets, follow the acknowledgement and selection guidance
in `/opt/hatch/skills/booking/references/flights.md`. Use the following
hierarchy for other bookings and the flight Markdown fallback:

1. **One-sentence recommendation.** Name the best option and the decisive
   reason. Keep any caveat to one short clause.
2. **One compact comparison.** For flights, `widget.create` in the current tool
   set means the native structured flight list is available and must be used;
   use the Markdown fallback only when that tool is absent or a valid call
   explicitly fails. For hotels, use the native map/list presentation in the
   hotel reference together with the category's compact Markdown table. For
   other categories, use the category's Markdown table. Show three to five
   distinct options at most.
3. **One decision.** For flights, let the user select the complete itinerary
   through the native flight widget; do not add a duplicate picker or ask for a
   typed option label. Other booking categories continue to use their
   category-specific presentation contract.

Do not emit HTML or use `create_options`. Other than the hotel map/list
presentation, do not use a native picker/list widget for non-flight bookings.
Do not duplicate prices, schedules, terms, or the comparison as prose. Put
important decision fields in the primary comparison and give secondary facts
in a short labeled block only after the user selects an option or asks for more
detail.

When there is only one exact match, skip the comparison table and use short
labeled Markdown fields.

## Markdown rules

- Keep the recommendation above the table to one sentence.
- Use stable option labels such as `A`, `B`, and `C` in every follow-up.
- Keep each table to six columns or fewer. Combine closely related facts in one
  cell with semicolons or short phrases.
- Put the full party or stay total in the table. Do not make the user calculate
  it from a per-person or nightly teaser price.
- Keep fields in the same order for every option.
- Bold only the recommended option label and the most important changed fact.
- Render absent provider facts as `Not stated`. Do not silently omit a field
  whose absence could change the decision.
- Use airport-local, property-local, venue-local, or restaurant-local dates and
  times. Include the year when ambiguous.
- Do not include raw provider identifiers, tool names, command output, or
  implementation details.

Verified imagery may still be shown with ordinary Markdown image syntax after
the comparison table. Use only stable public HTTPS images from the current
provider, venue, or verified listing. Label each image accurately. Do not use a
generic property photo as the exact room, a restaurant interior as a named dish,
or a venue map as the view from a specific seat. Omit imagery when no reliable
source exists.

## Flights

Use the native structured flight list described in
`/opt/hatch/skills/booking/references/flights.md` for every live flight
comparison when `widget.create` is available. Do not substitute Markdown based
on uncertainty, convenience, output size, or schema complexity. Use this table
only when `widget.create` is absent or a valid widget call explicitly returns an
unsupported or rendering error:

| Option | Route and local times | Duration | Stops and layovers | Flight and cabin | Full total |
|---|---|---:|---|---|---:|
| **A (Recommended)** | SFO 8:10 AM → JFK 4:45 PM | 5h 35m | Nonstop | UA 123 · Economy Flex | $642 round-trip |
| B (Cheapest) | SFO 7:00 AM → DEN 10:25 AM → JFK 4:10 PM | 6h 10m | 1 stop · DEN 1h 05m | UA 456/789 · Economy | $511 round-trip |

Use one row per complete itinerary; keep outbound and return together in the
same row using concise labels when it is a round trip. Every row must show:

- full party price and currency, labeled one-way or round-trip
- each leg's local departure and arrival airports and times
- each leg's total elapsed duration
- nonstop or exact stop count
- every connection airport and layover duration
- marketing carrier and flight number, plus operating carrier when different
- cabin and fare brand when stated

Do not hide price, duration, stops, or layovers in a follow-up. Calculate each
layover from adjacent provider timestamps at the same airport. If that cannot be
done reliably, write `Layover length not stated`.

After the Markdown fallback comparison, add at most one short `Details:` line
for shared baggage or fare-rule caveats. Do not show the same inventory in a second format.

## Hotels

Use one row per exact property-room-rate combination:

| Option | Hotel and exact room | Location | Full stay total | Terms and benefits | Why it fits |
|---|---|---|---:|---|---|

Include exact room and bed, dates, total including mandatory fees, amount due at
the property, cancellation deadline, and material loyalty benefits. When
location matters, show verified travel time to the named place rather than a
vague neighborhood claim.

With the first multi-property shortlist, automatically provide the native map
or list described in the hotel reference. Keep its option labels and order
identical to the Markdown comparison. If proximity to a particular place
matters, show verified travel times in the comparison rather than adding a
second location table.

Attach each useful verified property image to that property's map marker or
list row. Never show a separate unlabeled image gallery. After selection, offer
exact-room images separately and label unmatched images `Property photo`.

## Restaurants

Use one row per exact live table:

| Option | Restaurant | Time and seating | Cuisine and price | Location | Deposit or cancellation terms |
|---|---|---|---|---|---|

Show exact available time, seating type, cuisine, price level, address or travel
time, and any deposit, prepaid minimum, service charge, cancellation fee, or
no-show exposure. The recommendation sentence should name the one taste,
location, timing, or value reason that makes the first option best.

When reliable imagery exists, show at most one verified food, dining-room, or
exterior image for the recommended option below the table. Use a dish name only
when the source identifies it; otherwise label it `Food at <restaurant>` or  
`Dining room`.

## Event tickets

Use one row per exact ticket group:

| Option | Event and local time | Exact seats | Primary or resale | Delivered total | Important terms |
|---|---|---|---|---:|---|

Preserve ticket count, section, row, exact seats when assigned, view
restrictions, primary/resale status, fees, delivery method, and hold expiry.
When a verified seat-view image exists, show it below the table with its exact
section label; otherwise provide a verified venue-map link without implying a
specific view. Include a verified actionable listing or purchase link for every
option offered as the user's next choice. Do not present an extra option without
the same action path as the rest of the shortlist.

## Final review and confirmation

Do not show another large comparison after selection. Use a compact two-column
Markdown table for the commitment boundary:

| Review | Selected terms |
|---|---|
| Item | Exact itinerary, property and room, table, or seats |
| Date and time | Local date and time |
| Total | Full amount, currency, amount due now, and amount due later |
| Applied value | Credits, points, certificates, or benefits |
| Payment | Safe payment label only |
| Terms | Material cancellation, refund, change, or no-show terms |

The trusted connector or browser approval remains authoritative. Do not create
a second confirmation question when the tool already asks the user to approve
the same terms.

After success, return a compact Markdown receipt with:

- `Status:` Confirmed, Held, Waitlisted, or Blocked
- `Confirmation:` the safe human-readable reference
- `When and where:` local date, time, and location
- `Total:` amount paid or committed
- `Next:` the next deadline or action, only when one exists

Do not display secrets or full payment, passport, traveler-security, or loyalty
numbers.
