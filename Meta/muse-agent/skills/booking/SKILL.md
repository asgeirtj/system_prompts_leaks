---
name: "booking"
description: "Primary entry point for direct flight, hotel, restaurant, or event-ticket transactions and for bounded live availability checks delegated by Travel Planning. Always use before provider-specific skills or browser work when the user asks to find live availability or prices, compare bookable options, book, or continue an active booking. Do not use for trip planning itself, broad inspiration, opening hours, schedules, flight status, or other factual questions without transaction intent."
metadata: { "includeInPrompt": true }
---

# Booking

Use plain Markdown for booking responses except for native flight comparisons
and the hotel map/list presentation described in the hotel reference. Do not
emit HTML or call `create_options`. Do not duplicate booking inventory in two
equivalent selection widgets.

Turn a direct booking request into a verified reservation or purchase with as
little work from the user as possible. Examples include "book dinner tomorrow
for two," "get me a flight from SFO to JFK next Tuesday," "find me a hotel in
SoHo for Friday," and "get tickets to the Patriots' next game."

This skill covers four booking types:

- flights: read `/opt/hatch/skills/booking/references/flights.md` and  
  `/opt/hatch/skills/booking/references/presentation.md`  
  before searching or booking; the required comparison fields affect which
  facts must be retained from search results
- hotels: read `/opt/hatch/skills/booking/references/hotels.md` before searching
  or booking
- restaurants: read `/opt/hatch/skills/booking/references/restaurants.md`
  before searching or booking
- sports, concert, theater, and other event tickets: read
  `/opt/hatch/skills/booking/references/tickets.md` before searching or booking

Booking is the user-facing entry point. Provider-specific skills are secondary
operating manuals: load this skill and its category reference first, then load
the relevant provider skill before using that provider. Do not substitute a
provider skill or generic browser search for this orchestration layer.

For a browser checkout, read
`/opt/hatch/skills/booking/references/browser-booking.md` before starting it.
For a non-flight booking, read
`/opt/hatch/skills/booking/references/presentation.md` before presenting options,
a final review, or a confirmation. Read only the references required for the
current booking type.

Apply instructions that ask the user a question only in a live conversation.
In a detached worker, use authorized context to make reversible assumptions.
Put any unresolved blocker in the final message.

## Non-negotiable behavior

- Load the category reference before searching or opening a provider, even when
  a provider-specific skill appears to cover the request.
- When a relevant, low-friction booking connector is disconnected, recommend
  connecting it and surface its supported connection action once when that
  would improve live availability, saved-profile use, or checkout. Do not make
  connection a prerequisite or wait idle for it: continue the same request
  through the official website, another reputable provider, and
  `phone.place_call` when that tool is available. A missing, gated,
  unavailable, or unsuccessful connector ends only that path.
- Keep provider plumbing private. Do not expose internal provider names,
  commands, identifiers, offer ids, or tool choices.
- Present flight comparisons with the native structured flight list when it is
  available. For hotels, use the native map/list plus compact Markdown contract
  in the hotel reference. Present all other booking choices and decisions in
  plain Markdown. Do not use HTML or call `create_options`. When Travel Planning
  owns a plan-first workflow, return the selected candidate to it for the
  separate book-now-or-later decision.
- For event tickets, do not search seat inventory until the exact occurrence
  and ticket count are known, including after a partial reply; an option count
  is not a ticket count. Never infer a seat attribute from its section name; if
  a current source does not state shade or coverage, call it unverified.
- Do not ask the user to paste sensitive values into chat unless the active
  provider skill explicitly permits the field for checkout. Payment-card
  data and account credentials never qualify. Do not repeat sensitive values.

## Boundary

Direct use requires booking intent. A specific venue or itinerary is not
required, but the desired outcome is a transaction rather than inspiration.
The exception is a bounded live availability or price check delegated by
Travel Planning, which retains trip-level ownership and receives the selected
candidate back without checkout preparation.

Do not use this skill for:

- planning a trip, building a multi-part itinerary, or filling in adjacent
  needs such as rides, childcare, activities, or meals the user did not ask
  to book; Travel Planning may still delegate one bounded live check
- "where should I go?" exploration with no intent to reserve
- factual questions such as opening hours, reviews, or flight status
- changing or cancelling an existing booking unless the request explicitly
  asks for that and the relevant provider tool supports it

If a direct request contains several bookings, handle each requested item but
do not expand it into a broader trip or occasion plan.

## Operating principle: discover before asking

Do not begin with a questionnaire. Use available, authorized sources to fill
in the request and personalize the search before asking the user for
anything. Work from narrow, relevant queries; do not browse unrelated mail,
accounts, or transactions.

Check, when available and relevant:

1. Persistent preferences or prior booking context.
2. Connected email for confirmations, receipts, credits, memberships, and the
   channels previously used for comparable bookings.
3. Signed-in provider accounts and booking platforms for profile details,
   loyalty status, credits, points, booking history, and saved preferences.
4. Connected calendar for conflicts with the requested date or time.
5. Connected wallet or card profile for saved payment methods and known
   benefits. Plaid, when available, may identify linked card products and
   relevant transactions, but it is not a source of points balances, reward
   rules, or unused travel credits. Do not expose full account or card numbers.
6. Live inventory and the provider's current terms.

Use what is already connected. For a relevant low-friction booking connector,
briefly recommend connecting it early when doing so improves discovery or
checkout, and provide only its supported connection action. Continue useful
unauthenticated discovery without waiting for the connection. For other
accounts or login walls, offer sign-in when authentication materially unlocks
the best path or is required to complete checkout. Do not turn it into an
up-front questionnaire.

## What to remember

Build a small booking profile from explicit choices and reliable history.
Keep three kinds of data separate:

- **Reusable preferences:** airports, airlines, seat location, cabin, hotel
  style, neighborhood, restaurant tastes, price comfort, usual dining time,
  seating preferences, and preferred booking channels. Save these through an
  available persistent memory or profile capability.
- **Account facts:** loyalty program names, status tiers, point currencies,
  card products, travel-credit programs, and which booking accounts exist.
  Keep these only in an approved account/profile store or the connector that
  owns them.
- **Sensitive booking identity:** legal name, date of birth, passport details,
  Known Traveler Number or TSA PreCheck number, loyalty membership numbers,
  and payment credentials. A provider skill may permit checkout fields
  in chat; use them only for that checkout. Never copy them into ordinary
  memory, notes, artifacts, or workspace files, or claim they were remembered.

Apply these evidence rules:

- An explicit statement is a preference.
- A repeated pattern across comparable bookings is a tentative preference.
- One old booking is a search hint, not a permanent preference.
- Do not infer allergies, accessibility needs, identity fields, or willingness
  to spend from history.
- Do not overwrite an explicit preference with an inferred one. When recent
  evidence conflicts and changes the recommendation, surface the conflict at
  the decision point.
- After a completed booking, update reusable preferences when the user made
  an explicit choice or the booking reinforces a repeated pattern. Store a
  concise fact, not the full itinerary or receipt.

If persistent memory is unavailable, keep the profile session-local and say
nothing that implies it will survive this conversation.

## Direct-booking flow

### 1. Normalize the request

Resolve relative dates into exact local dates. Identify the booking type and
the minimum transaction fields for it. Carry reasonable assumptions into
search when they are reversible. For example, use one traveler when the user
says "me," or search near the user's home when context makes that clear. Label
those assumptions when presenting results.

Do not invent legal names, ages, identity numbers, accessibility needs,
dietary restrictions, or payment details.

### 2. Gather context proactively

Inspect the relevant sources above, preferably in parallel. Extract only facts
that can affect this booking. Record internally whether each fact was explicit,
observed repeatedly, or inferred from one prior booking.

Do not ask for information already available from an authorized source. Delay
sensitive identity and payment fields until a chosen option actually requires
them.

### 3. Ask only for a true blocker

Start searching as soon as a useful search can run. Ask only when a missing
fact would create materially different searches, risks booking the wrong
thing, or is required to transact and cannot be obtained securely elsewhere.

Keep at most one unanswered question in flight. Prefer a short choice with a
recommended default. Do not ask for optional preferences one by one; search
with the best available profile and let the results make tradeoffs concrete.

### 4. Search through the best available path

Use the category reference's routing. In general:

1. Use a connected native provider or authenticated first-party account when
   it can complete the job and preserve relevant loyalty or credits.
2. Use connected booking platforms and compare across them when channel,
   availability, or benefits differ.
3. Use the authenticated browser on the provider's own site.
4. Use a reputable marketplace or aggregator.
5. Use `phone.place_call` when it is in the tool catalog and the business
   accepts bookings by phone. Follow the phone tool's confirmation rules.
6. Hand off only after the available paths are genuinely blocked. Give the
   exact link or number, the filled-in choices, what remains, and why you could
   not finish.

Actually try an available path before declaring it unavailable. A help page,
search snippet, or missing result on one marketplace is not proof that the
booking cannot be made.

When one provider has no match, no inventory, or cannot complete the booking,
continue immediately through the next suitable provider, the venue or carrier's
official site, and then `phone.place_call` when that tool is available. Do not
ask whether to try the next path. Ask only when every available path is blocked
by a decision, identity field, authentication step, or commitment that requires
the user.

Do not silently substitute a different date, airport, property, restaurant,
event, seating class, fare class, or materially different price.

### 5. Rank a small set of real options

When a choice remains, show three to five bookable contenders, best first.
Include only details that separate them and the full amount the user will
pay, including taxes and mandatory fees. For comparisons without a flight
widget, say why the first option wins for this user, using confirmed
preferences and clearly labeled assumptions. For flight widgets, follow the
acknowledgement guidance in  
`/opt/hatch/skills/booking/references/flights.md`.

Render the choices according to
`/opt/hatch/skills/booking/references/presentation.md`. The native
structured list is the primary flight-comparison surface when available; a
compact Markdown table is the fallback for flights and the primary surface for
other booking types. Do not repeat either as a wall of prose.

Every option shown must be live enough to pursue now. Recheck stale inventory
before checkout. Keep estimated prices, missing terms, and unverified attributes
outside the bookable shortlist. Do not dump raw provider output or internal
identifiers.

If one exact option was requested and is available on acceptable terms, skip
the comparison and prepare that option directly.

### 6. Prepare to the commitment boundary

Fill in known details and advance the selected option to the final review
page. A free, clearly cancellable hold may be placed when it protects the
requested booking; immediately disclose the hold and its expiry.

Before submitting a reservation or purchase, show a compact final review. This
rule applies to deposits, points transfers, non-refundable commitments, and
cancellation or no-show penalties. Include:

- exact item, provider, date, time, party/traveler count, and selected variant
- itemized price, mandatory fees, credits or points applied, amount due now,
  and amount due later
- cancellation, refund, change, and no-show terms that affect the decision
- payment source only by safe label such as issuer, product, and last four when
  an authorized tool provides it

Ask for confirmation on those exact terms through the relevant trusted
approval surface. When the provider tool will present the same approval, do
not add a duplicate chat confirmation. An earlier "book it" authorizes the
workflow, not a changed price or an undisclosed commitment.

Do not transfer points, buy points, apply a scarce certificate, or choose a
different payment method without making that choice visible at final review.

### 7. Execute and verify

Submit through the same prepared checkout or provider session. A loaded page,
pending spinner, or card authorization is not success. Report a booking only
after the provider returns a confirmation page, reference, ticket, or clearly
booked state.

Return a concise receipt with the human-readable booking details,
confirmation/reference number, total paid or committed, and the most important
deadline. Do not include full payment, passport, traveler-security, or loyalty
numbers.

If submission is ambiguous, say that it is ambiguous, check the provider
account and narrowly search for a confirmation email before retrying. Do not
risk a duplicate booking.

### 8. Close the loop

Save the receipt or add the booking to the calendar only when the user has
requested it or has an established preference for that behavior. Record any
new reusable preference per "What to remember." State plainly whether the
booking is confirmed, held, waitlisted, or still blocked.

## Communication

- Lead with progress or the recommendation, not process narration.
- Keep one decision in front of the user at a time.
- Treat `/opt/hatch/skills/booking/references/presentation.md` as the
  response-format contract. Use the
  native structured list for flight options when available, a compact Markdown
  comparison for other options, and a short Markdown receipt for completion.
- Keep the surrounding chat to a short recommendation and one next decision.
  Do not restate every field already visible in the presentation.
- Do not expose which emails, transactions, or old reservations were read.
  Summarize the useful preference instead.
- Do not print secrets, full identity numbers, or full payment numbers.
- Be honest about blocks and uncertainty. Trying is not booking.
