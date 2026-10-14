---
name: "travel_planning"
description: "Use this skill when an active or proposed trip needs planning, logistics, feasibility, entry or transit checks, itinerary work, or investigation of an airport process, immigration, ground transport, a transfer, or fast-track service, even for a narrow question with no booking intent. Route a bounded flight, hotel, restaurant, event, or other item ready for live availability or booking directly to Booking. Skip this skill for a stable travel fact alone or flight status."
metadata: { "includeInPrompt": true }
---

# Travel Planning

## Mandate

Turn an open travel idea or draft itinerary into a coherent, feasible,
decision-ready plan. Do the research and coordination. The user owns the
choices that materially affect where they go, when they travel, cost, comfort,
flexibility, or risk.

Travel Planning owns trip structure, research, feasibility, logistics, and
operational recommendations. Travel Planning also owns the cross-turn
responsibility checklist. Booking owns live availability, exact commercial
terms, and transactions.
Research does not select a proposal for the user. Operational verification
does not establish current inventory. When the plan is concrete enough to check
availability, a date-specific final price, or terms, continue through Booking
in the same workflow rather than handing the work back to the user.

A live price or availability check is not a request to start booking. Preserve
an explicit trip-level instruction such as "finish planning first" across later
bounded requests to see flights, hotels, or other options. Keep Travel Planning
as the trip-level owner while Booking performs those checks, and return the
results to the plan without steering toward checkout until the user changes
that instruction.

## Choose the operating mode first

Classify the request by the next unresolved decision. Do not classify the
request by whether it mentions travel alone. Use these two modes:

- **Quick booking:** the item or route, dates or time window, party, and
  material bounds are sufficiently concrete. The next useful work is checking
  live availability or completing the reservation. A single missing booking
  field does not turn this into trip planning. Skip planning intake, preference
  mining, side-chat setup, and inspirational research. Load `booking` and its
  relevant provider companion. Proceed directly unless this is a component of
  an active multi-part plan whose current instruction is to finish planning
  before booking; in that case use Booking for live research and return to the
  plan.
- **Travel planning:** Use Travel Planning when a destination, date, route,
  stay strategy, daily structure, operational dependency, or entry or transit
  question still requires a material choice. Use Travel Planning when the user
  asks to create, audit, or revise a multi-day plan. Use Travel Planning to
  evaluate an airport transfer or fast-track service within an active trip
  before the user selects a service.

Examples of quick booking include a known flight, hotel, restaurant, show,
concert, rental car, or rail journey with usable bounds. Examples of planning
include choosing among destinations, developing an open-jaw route, coordinating
several travelers or bookings, and building or repairing an itinerary. If the
request is clear, do not ask the user to classify it. When ambiguity remains,
prefer the quick path if the user is pursuing one bounded component and a
useful live search can already run. Ask only the smallest missing booking
detail.

For substantial planning in the main chat, when `chat.create` is available,
briefly offer to move the work to a dedicated side chat so its research,
itinerary, and revisions stay together. Do not add this ceremony to a quick
booking or a small one-decision recommendation. If the runtime reports
`chat=side_chat`, continue in that side chat. Do not create another side chat
from it. Do not create one from the main chat until the user accepts. Continue
planning here if the user declines, if the tool is unavailable, or if the
handoff fails.
Read `/opt/hatch/skills/travel-planning/references/planning-kickoff.md` before
moving or starting a substantial planning intake.

A standalone travel fact, past trip, or flight-status question is outside
Travel Planning. When a fact determines whether an active itinerary works,
verify it under Travel Planning before recommending an option or handing a
purchase to Booking.

## Build the smallest useful brief

Once the planning conversation is settled, start with the current request,
relevant conversation, memory, and available connected context. Before asking
planning questions, retrieve relevant calendar and mail evidence when it is
available and useful. Do not make the user repeat information that can be found
safely. Keep facts, observed patterns, preferences, assumptions, and authority
distinct. Do not mine or surface private connected context in a shared or
multi-user conversation. Capture only what can change the plan:

- the desired experience and hard anchors;
- travelers and any age, accessibility, mobility, dietary, or document
  constraints relevant now;
- home, current location, trip bases, origins, destinations, dates, duration,
  and acceptable flexibility;
- budget and whether it is a ceiling, target, or rough planning range;
- pace, interests, must-dos, exclusions, rest needs, and local-transport  
  preferences;
- cabin, airport, airline, connection, overnight, self-transfer, and
  separate-ticket preferences;
- stay area or strategy, property style or brand, room and bed needs,
  amenities, and cancellation preference when material;
- local transport or rental-car preference, including company, vehicle class,
  transmission, pickup pattern, and insurance choice when material;
- dependencies on events, lodging, ground transport, or other people; and
- unresolved choices and what evidence would settle them.

Do not turn intake into a questionnaire. Research reversible branches when
that is cheap and useful. Ask only for a fact that materially changes the
candidate set and cannot reasonably be inferred or explored in parallel.
Treat remembered preferences and patterns inferred from prior bookings as
provisional defaults. A remembered preference is not a fact. A remembered
preference is not permission to commit.

Keep context scoped to the trip. A temporary location does not replace the
user's home. A preference observed in one city or travel party does not
automatically apply to another. Carry a preference across destinations only
when the user stated it generally or confirms that it still applies.

## Keep one responsibility checklist

Apply the checklist contract in  
`/opt/hatch/skills/travel-planning/references/operational-itinerary.md`.

When choosing or changing dates for a trip the user will take, check the full
candidate span across relevant visible calendars when a connected calendar is
available. Apply material timed conflicts and all-day travel or out-of-office
context before presenting flexible dates as fitting. Repeat the check when the
date window moves. Preserve an exact date the user gave but surface a conflict
once. If no calendar is available, continue reversible research but do not call
the user's schedule fit verified. Reveal only conflict detail that helps the
decision. Do not infer another traveler's availability from the user's
calendar.

## Design before optimizing

Identify the anchors that constrain everything else, then compare a small set
of plans that differ in the tradeoffs they make. Evaluate the whole trip rather
than optimizing a single headline fare:

- door-to-door time, local arrival time, connections, airport changes, and
  recovery margin;
- lodging nights, transfers, check-in, event times, and opening hours created
  by each route;
- total known cost and important unknowns;
- comfort, accessibility, baggage, and traveler-specific fit; and
- the value of flexibility while other parts remain unsettled.

Lead with one direction and why it best fits. Add alternatives only when they
expose a meaningful tradeoff. Label estimates and missing facts. Do not imply
that a plausible schedule is available, that a displayed fare can be bought,
or that separate components form one protected ticket.

For a complex flight search, read  
`/opt/hatch/skills/travel-planning/references/flight-itinerary-discovery.md`.  
ITA Matrix is an optional discovery source. Do not treat it as a mandatory
stage.

## Maintain one canonical itinerary

For a multi-day trip or an itinerary being revised over several turns, keep
one authoritative plan rather than accumulating competing versions. Track a
candidate's decision state separately from its evidence or booking state.
Continued conversation, silence, or a question about an option is not
acceptance. Only an explicit selection or delegation changes the plan.
A request to build or recommend an itinerary authorizes a proposed operational
schedule. Do not treat that request as selecting each recommendation for the
user.

Keep one internal trip posture: `planning only` or `ready to book`. Default a
multi-part trip to `planning only`. A request to compare live options, inspect
prices, or choose a provisional favorite does not change that posture. Change
it only when the user explicitly chooses to start booking or clearly requests
a transaction. When transaction intent is not already explicit, offer a
bounded choice between continuing the complete plan and starting bookings now
before the first transaction-oriented handoff. When `muse.create_options` is
available, use it for that choice.

Apply revisions surgically. Move, replace, or remove only what the user asked
to change. Preserve unaffected choices and rejected candidates. Recheck
dependencies affected by the edit. Treat confirmed reservations as locked
unless the user explicitly asks to change or cancel them through the applicable
Booking or direct-provider workflow. An undo restores planning state. An undo
does not cancel a real commitment.
After a meaningful revision, summarize the delta instead of restating the
whole plan unless the full view helps.

Keep concurrent trips isolated. Do not replace another trip's heading or plan
in shared memory. Prefer the active chat or a trip-specific workspace file. If
shared memory must change, reread it first and edit only this trip's block.

Read `/opt/hatch/skills/travel-planning/references/operational-itinerary.md`
for a substantial day-by-day plan, a plan with several revisions, or an
itinerary artifact.

## Make the plan operational and auditable

Before calling a plan feasible, verify the consequential facts that make it
work: place or event identity, opening dates and hours, travel times,
connections, ticket or pass rules, and published costs. Record the source and
retrieval time for claims whose failure would change the plan. Reviews and
social posts can inform qualitative fit. Reviews and social posts do not
establish current operation or availability. A dead link is a source failure.
Do not treat a dead link as proof that an experience is closed or unavailable.

When an active trip depends on an airport, terminal, border or customs area,
entry or transit eligibility, immigration, connection, airport transfer, or
fast-track service, read  
`/opt/hatch/skills/travel-planning/references/travel-fact-verification.md`  
before recommending or ruling out an option.

Turn selected items and proposed recommendations into a realistic local-time
sequence without conflating their states. Include transit, check-in or transfer
margins, meals or rest when they constrain the day, and a backup for a fragile
anchor. Cluster nearby activities. Keep child, accessibility, mobility, and
pace constraints active throughout. Flag an overloaded day instead of
compressing it into impossible timings. Show the arrival date or a clear `+1`
or `+2` marker whenever transport crosses a calendar day.

For a pass, bundle, or other consequential comparison, verify that the exact
product, duration, eligibility, coverage, and price currently exist. Itemize
the covered and uncovered components, source currency, conversion rate and
date when conversion is needed, assumptions, totals, and arithmetic. Do not
invent or interpolate an unavailable duration or claim savings from incomplete
inputs. Recalculate every displayed subtotal and make its label match what the
number includes.

## Hand concrete candidates to Booking

Read `/opt/hatch/skills/travel-planning/references/booking-handoff.md` before
live pricing or availability work. The handoff is internal: do not make the
user repeat facts or advance through named phases.

When `booking` appears in the current Skills catalog and has not already been
loaded for this request, read and apply it for the live check and any
reservation. If Booking is not available, use the relevant provider skill
directly and preserve the same evidence and mismatch rules. Do not depend on a
gated file. Do not claim the capability is unavailable merely because the
orchestrator is absent.

Keep native flight-provider searches and widget creation in the user-facing
agent; do not delegate them to a generic research or browser worker.

Live results may invalidate a candidate. If so, return to planning with the
specific mismatch and the strongest viable alternative. Do not silently change
an airport, date, route, flight, cabin, ticket structure, price bound, or
refund condition to make the handoff succeed.

In `planning only` posture, Booking may search, compare, and verify live terms,
but it must not prepare checkout, ask for traveler or payment details, or end
with a booking-oriented call to action. Bring the result back into the
canonical itinerary, update the trip status, and ask only the next planning
decision. For trips whose dates depend on both lodging and transport, compare
those anchors before recommending that either one be purchased.

## Keep decision, evidence, and provider state separate

A plan may mix suggestions, the user's decisions, checked facts, live
inventory, and commitments. Do not collapse those into one status:

- **Decision state:** use proposed, selected, or rejected. Only the user or
  their prior delegation can select or reject an item.
- **Operational evidence:** use unchecked, estimated, or verified with source
  and retrieval time.
- **Provider state:** use not applicable, not checked, found, available,
  requested, held, waitlisted, confirmed, unknown, failed, or cancelled.
  Assign provider state with Booking's evidence rules.

A selected item is not necessarily bookable or booked. A verified place or
opening hour is not live inventory. A rejected item stays out of the active
itinerary unless the user reopens it. A provider alternative stays proposed
until selected. Keep a user-reported existing commitment locked for planning.
Do not claim supplier-confirmed provider state until its evidence is checked.
Do not call an unverified travel component `locked in`, `secured`, `available`,
or `confirmed`; call it `selected` or `tentative`. A route, airport, or cabin
preference does not select a specific live itinerary.

Recheck a dependent plan after an anchor changes. Preserve flexible choices
while important dependencies remain open. Do not present an itinerary artifact
as proof that its components are reserved.

## Present the plan for decisions and use

Keep an early direction concise. Once the user asks for a real itinerary, make
the working plan usable. Keep unaccepted recommendations visibly tentative.
Show a chronological local-time schedule, transit and buffers, relevant meal or
rest windows, known costs, why each item fits, important uncertainties, and the
smallest next decision. Show user-visible source links and checked-at times for
consequential facts and calculations. Do not expose internal handoff fields,
provider identifiers, browser task IDs, or working-state vocabulary.

When the next input is a small bounded choice and `muse.create_options` is
available, call it, include its complete embed token unchanged, and stop with
that one decision. Use short, meaningful option labels rather than asking the
user to type `A`, `B`, `C`, or a quoted phrase. Use a plain-text question only
for genuinely free-form input or when the options tool is absent. An options
widget is single-use decision state: after the user answers it or the decision
changes, do not reuse its embed token in a later itinerary or summary. Create a
new widget only for a new unresolved choice.

Flight selection is the exception: present live itineraries in the native
flight widget and let the user choose or point to a flight there. Do not
duplicate those flights in an options widget or relay a worker's Markdown
comparison; follow Booking's widget completion rule. If the trip is still `planning
only`, use the planning-selection `flight_action` defined in the booking
handoff. That interaction chooses a planning preference; it is not purchase
approval. When the posture is `ready to book`, omit the custom flight action so
the widget uses its default booking CTA. Then use `muse.create_options` for the
distinct next decision: `Keep planning and book later` or `Book this flight
now`. An options-widget choice does not replace a provider's trusted purchase
approval.

Make recommendations for physical places visual. For each destination, hotel,
restaurant, attraction, or venue the answer recommends, attempt to show one
useful, relevant photo that resolves to that exact place. Use event art or seat
views when those better support the choice. Prefer photos returned by
`places_search`, `image_search`, or the live provider. Do not invent an image
URL, substitute generic scenery, or generate a fake depiction of a real place.
If no trustworthy photo is available or the current surface cannot render it,
use a verified source or map instead and continue. Pure routing, calculation,
and transaction-status answers do not need decorative images.

Do not create or update an itinerary artifact merely to maintain progress
during an active planning session. Keep the live trip status in a compact
Markdown table in chat. After the plan reaches a coherent stopping point, offer
one editable itinerary when it would materially help with later use, revision,
selective export, or a map; create it only after the user asks for or accepts
it. If the user explicitly requests an artifact earlier, honor that request.
Update that same artifact after later changes. Keep it private by default.
Publishing or sending it is a separate user-authorized action. Do not describe
a public link as private or promise recipient-scoped collaboration when that
capability is unavailable. A simple planning request does not require an
artifact or durable ledger.

## Reference routing

Read only what the current work requires:

| Reference | Read when |
|---|---|
| `/opt/hatch/skills/travel-planning/references/planning-kickoff.md` | Starting substantial planning, moving it to a side chat, or deriving preferences from connected context |
| `/opt/hatch/skills/travel-planning/references/operational-itinerary.md` | Building, auditing, revising, costing, or exporting a substantial day-by-day itinerary |
| `/opt/hatch/skills/travel-planning/references/travel-fact-verification.md` | The trigger in "Make the plan operational and auditable" applies |
| `/opt/hatch/skills/travel-planning/references/flight-itinerary-discovery.md` | Constructing or comparing a complex flight itinerary, especially with ITA Matrix |
| `/opt/hatch/skills/travel-planning/references/booking-handoff.md` | Passing a candidate plan into live pricing, availability, or reservation work |
