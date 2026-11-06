# Present booking choices

- Help the user see the recommendation, the useful tradeoffs, the full cost and the next action in one place. Use this guide for comparisons, final reviews and confirmations.

- Keep one question open at a time, and offer a recommended default when it is a choice.

## Shape the comparison

- Lead with one sentence naming the recommended option and the decisive reason. For travel, state the meaningful difference in price and in time or distance.

- For text comparisons with no requested count, show three to five distinct choices, best first, or fewer when fewer qualify. Honor an explicit count. Native result previews follow the connector's preview and See all contract instead of this text default.

- Follow [flight comparison](/opt/muse/skills/flight-booking/references/flights.md), [hotel comparison](/opt/muse/skills/hotel-booking/references/hotels.md) and [rental cars](/opt/muse/skills/trip-transport/references/rental-cars.md) for native results. Use the Markdown table below for their fallback, restaurants and tickets.

- Do not add another picker or use `muse.create_options` to repeat a booking selection. For a single exact match, use short labeled lines instead of a one-row table.

- Name the airline, property, venue and actual seller when they affect the price, terms or later support. Keep commands, raw offer IDs and internal details out of the reply, and summarize a preference you found without naming the emails, transactions or past bookings you read.

## Write the comparison table

- Use stable labels such as A, B and C. Keep each table to six columns or fewer, with the same facts in the same order for every option.

- Show the full-party or full-stay total, never a teaser price the user must multiply. Use local dates and times, adding the year when it avoids ambiguity.

- Put important terms in the table and write `Not stated` when a missing fact could change the decision. Bold only the recommended label. Do not repeat the table's prices, schedules or terms in the surrounding prose, and never render the comparison as HTML.

- Use photos only from the current provider, venue or a verified listing, at stable public HTTPS URLs, and place each with its labeled option. A property photo does not prove the exact room, and a venue map does not show the view from a seat. Omit an image whose source or subject is uncertain.

## Use the right columns

### Flights without the native list

- Use one row per complete itinerary, keeping outbound and return together. Use the columns Option, Route and local times, Duration, Stops and layovers, Flight and cabin, and Full total.

- Every row shows the full-party price and currency, labeled one way or round trip. It also shows each leg's local airports and times, elapsed duration, exact stop count, every connection airport with its layover, the marketing carrier and flight number, the operating carrier when different, and the cabin and fare brand when stated.

- Work out layovers only from adjacent segment times at the same airport. When that is not reliable, write `Layover length not stated`.

- Put shared bag or fare caveats in one short note under the table and option-specific terms in their rows. Ask the user to reply with an option label.

### Hotels

- Use one row per property, room and rate, with the columns Option, Hotel and exact room, Location, Full stay total, Terms and benefits, and Why it fits.

- Include the exact room and bed, dates, mandatory fees, the amount due at the property, the cancellation deadline and material benefits. Show verified travel time to a named place when location matters.

- After the user picks a property, exact-room photos may help. Label any photo that does not show that room `Property photo`.

### Rental cars

- Use one row per rate, with the columns Option, Supplier and car, Pickup and drop-off, Seats, bags and transmission, Full total, and Mileage and payment.

- Show the supplier, the exact returned vehicle or "or similar", the category or type, the local rental period, the branch or access instructions when stated, and for an airport pickup or return the location type and estimated transfer time. Show the full total and currency, never the base amount.

- Do not imply that optional extras, fuel, tolls, deposits or locally charged fees are included unless the live rate says so.

### Restaurants

- Use one row per available table, with the columns Option, Restaurant, Time and seating, Cuisine and price, Location, and Deposit or cancellation terms.

- Show the exact time, seating type, price level, address or travel time, and any deposit, prepaid minimum, service charge or cancellation fee. The recommendation sentence names the taste, location, timing or value that makes the first option fit.

- One verified food, dining-room or exterior photo can illustrate the recommended restaurant. Name a dish only when the source identifies it, otherwise label the photo accurately, such as `Dining room`.

### Event tickets

- Use one row per available ticket group, with the columns Option, Event and local time, Exact seats, Primary or resale, Delivered total, and Important terms.

- Keep the ticket count, section, row, assigned seats, view restrictions, fees, delivery method and hold expiry. Give every option a verified listing or purchase link so the user can act on it.

- Show a verified seat-view image under its exact section label when one exists. Otherwise link a verified venue map without implying a particular view.

## Show the final review

- After the user chooses, show the exact commitment once instead of repeating the comparison. List the item, the local date and time, the full total with the amounts due now and later, any credits or points applied, the payment method's safe label, and the material cancellation, refund, change or no-show terms.

## Report the outcome

- After submission, give the status the provider returned, the safe confirmation reference, the local time and place, the amount paid or committed, and any next deadline.

- Keep full payment, passport, traveler-security and membership numbers out of the reply.
