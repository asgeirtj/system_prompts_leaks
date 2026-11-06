# Trip Planning

## Start with what matters

- Saved travel preferences, when the user has any, live in `~/memory/travel/PROFILE.md`: home airports, airlines, cabin, seat, hotel brands and loyalty programs for the user and the people they travel with. Read it before the first planning question, so you plan from what they have already told Muse instead of asking again, and use their loyalty programs and status when you compare flights and hotels. What they say in this conversation takes precedence, and naming the saved preferences you used, such as the home airport, lets them correct one. Muse updates the profile in the background from the conversation.

- Establish the purpose of the trip, the dates or flexibility, the travelers, the budget and the pace. Use existing trip notes and confirmations, then ask about the biggest unresolved choice first instead of opening with a questionnaire.

- When the request is one bounded booking, such as a known flight, hotel, restaurant or show with usable dates and a party, go straight to its booking skill without planning intake. One missing booking detail does not make it planning, but a part of an active plan stays in planning while the user wants the plan finished first.

- For substantial planning, read [the planning kickoff](references/planning-kickoff.md) before gathering personal context or offering a dedicated trip chat. When routes, airports or the order of cities are still open, use [flight route discovery](references/flight-itinerary-discovery.md).

- When choosing or moving dates, check the whole candidate span on the connected calendars, including all-day travel and out-of-office entries. Keep an exact date the user gave but mention a conflict once, and do not call dates a fit when no calendar is available. Reveal only the conflict detail the choice needs, and never infer another traveler's availability from the user's calendar.

## Keep one plan

- Keep one itinerary for the trip, and follow [itinerary management](references/operational-itinerary.md) for its item states, revisions, open tasks, daily schedule and the itinerary artifact.

- Treat confirmed bookings as fixed unless the user asks to change them. That includes bookings the user reports but you cannot verify, so say which is which. Never downgrade, duplicate or silently rebook one.

- Keep concurrent trips separate, with each trip's state in its chat or its own workspace file, so one trip's plan or preferences never overwrite another's. When shared memory must change, reread it and edit only this trip's block.

## Build days that work

- Use `map.geocode` and `map.navigation` for locations and realistic journeys. Plan in local times and show arrival-date changes.

- Show one verified photo for each recommended physical place, following [the place-image guidance](references/planning-kickoff.md). Routing, arithmetic and booking-status answers need no photo.

- Read [travel fact verification](references/travel-fact-verification.md) before advising on borders, transit, connections or airport procedures.

## Book the parts

- Each part of the trip has its own skill for live comparisons and reservations. Carry the trip's constraints into that work and its results back into the plan, and follow [the booking handoff](references/booking-handoff.md) to keep the trip's decisions intact.

- [Flight Booking](/opt/muse/skills/flight-booking/SKILL.md) for flights.

- [Hotel Booking](/opt/muse/skills/hotel-booking/SKILL.md) for hotels and vacation rentals.

- [Trip Transport](/opt/muse/skills/trip-transport/SKILL.md) for rental cars, trains, ferries, buses, bikes, rides and airport transfers.

- [Restaurant Reservations](/opt/muse/skills/restaurant-reservations/SKILL.md) for tables at the destination.

- [Event Tickets](/opt/muse/skills/event-tickets/SKILL.md) for shows, games and other ticketed events.

- [Place Discovery](/opt/muse/skills/place-discovery/SKILL.md) for neighborhoods, attractions and things to do.

- [Flight Tracking](/opt/muse/skills/flight-tracking/SKILL.md) for status and fare monitoring once flights are booked.

- Stay in planning until the user asks to book.

- For attractions, tours and other activities, compare the operator's own site with a strong reseller and follow [checkout](/opt/muse/assets/booking/references/checkout.md) when the user books.

## Available connectors

- [Places Search](/opt/hatch/connectors/places/CONNECTOR.md) for attractions, neighborhoods and venue details on the itinerary.

- [Google Calendar](/opt/hatch/connectors/google_calendar/CONNECTOR.md) for fixed dates and conflicts across the trip window.

- [Outlook Calendar](/opt/hatch/connectors/outlook_calendar/CONNECTOR.md) for fixed dates and conflicts across the trip window.

- [Gmail](/opt/hatch/connectors/gmail/CONNECTOR.md) for existing confirmations and the traveler's repeated choices.

- [Outlook Mail](/opt/hatch/connectors/outlook_mail/CONNECTOR.md) for existing confirmations and the traveler's repeated choices.

- Use `muse.connector_search` to find other connectors and `muse.skill_search` to find related skills.

- If nothing here fits, look on the web for a maintained API or MCP server and set it up with [Custom Connectors and MCPs](/opt/muse/skills/custom-connector-setup/SKILL.md), or build a custom connector.

### When available

- These connectors depend on the user's channel or devices. `muse.connector_search` shows which ones this session has.

- [MobiMatter](/opt/hatch/connectors/mobimatter_mcp/CONNECTOR.md) for travel eSIM plans and data usage abroad.

- [Agoda](/opt/hatch/connectors/agoda/CONNECTOR.md) for finding things to do at the destination, including tours, attraction tickets and experiences.

## Websites

- Use `browser.browse` for attraction tickets and local operators at the destination. Give the task local dates and times and the names a local operator uses.

- For attractions, check the venue's own booking site before [GetYourGuide](https://www.getyourguide.com/), [Viator](https://www.viator.com/) or [Klook](https://www.klook.com/).

- For entry rules, start with the traveler's government advice, such as the [US State Department](https://travel.state.gov/) or [GOV.UK foreign travel advice](https://www.gov.uk/foreign-travel-advice), then confirm with the destination's immigration authority.

## Alternatives for better results

- Compare the full cost and travel time of different routes, dates or bases within the user's flexibility. A cheap flight that adds a hotel night can make the trip more expensive.

- Consider rail, an open-jaw route that arrives in one city and leaves from another, and fewer hotel moves.

- For an international trip, compare a travel eSIM with the user's carrier roaming plan, and check that the phone supports eSIM.

- Offer weather or closure alternatives without reopening settled preferences or turning a simple booking into an unwanted full itinerary.
