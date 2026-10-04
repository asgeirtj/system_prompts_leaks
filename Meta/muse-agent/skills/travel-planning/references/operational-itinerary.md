# Operational itinerary

Use this guidance when a trip spans several days, the user is revising an
existing itinerary, consequential logistics or pass economics need checking,
or the plan will become an artifact. Early inspiration can stay lightweight.
Apply this rigor before calling a plan feasible.

## Keep one canonical plan

Maintain one active plan for the trip. Do not make the user reconcile several
chat answers. Keep the minimum trip-level context that changes the result:

- home, current location, trip bases, local time zones, and travel dates;
- travelers, child ages, mobility or accessibility needs, and documents when  
  relevant;
- budget and currency, pace, interests, dietary needs, must-dos, exclusions,
  and transport preferences; and
- fixed anchors, unresolved choices, confirmed commitments, and dependencies.

For each itinerary item, keep three axes separate:

- decision: proposed, selected, or rejected;
- operational evidence: unchecked, estimated, or verified, including source
  and retrieval time; and
- provider state: not applicable, not checked, found, available, requested,
  held, waitlisted, confirmed, unknown, failed, or cancelled.

An item can be selected but not yet verified or available. Continued
conversation, a follow-up question, or silence does not change a proposed item
to selected. Record a selection only from the user's explicit choice or an
already-established delegation. Keep a rejected item out of the active plan.
Keep the record that the item was rejected.

A request to build or recommend an itinerary authorizes arranging grounded
recommendations into a proposed schedule. Keep those items visibly tentative.
The request does not itself change them to selected.

## Maintain the responsibility checklist

For a multi-part trip or planning work that will continue across turns,
maintain one compact responsibility checklist inside the canonical plan.
Record every open item with these fields:

- **Outcome:** State the result that must become true.
- **Owner:** Record one of `planning`, `booking`, an applicable direct provider,
  or `the user`.
- **Status:** Record `investigating`, `needs decision`, `ready for booking`,
  `booking in progress`, `user action`, `blocked`, `booked`, `confirmed`,
  `completed`, or `dropped`.
- **Next action or decision:** State the next step that advances the outcome.
- **Evidence state:** Record `unchecked`, `estimated`, or `verified`.
- **Material deadline:** Record an exact deadline, `unknown`, or `none`.
  `unknown` means a material deadline may apply but is not known. `none` means
  no material deadline applies.

Assign `planning` to research, feasibility, logistics, or recommendation work
that the available tools support. Assign `booking` or an applicable direct
provider only through the rules in
`/opt/hatch/skills/travel-planning/references/booking-handoff.md`. Assign the
user only to a decision, private input, approval, or external action that the
available tools cannot perform.

Record `dropped` only after the user explicitly removes the outcome from the
trip. Do not declare the trip complete while a required item is `investigating`,
`needs decision`, `ready for booking`, `booking in progress`, `user action`, or  
`blocked`.

When a live text channel is available, present the checklist as a compact
Markdown trip-status table after the initial trip shape, after a material
change, or when the user asks what remains. Do not repeat it after minor
exchanges. Use at most these user-facing columns:

| Component | Current plan | Status | Next step |
|---|---|---|---|

Translate the richer internal owner, evidence, and deadline fields into those
columns without exposing internal workflow vocabulary. On a voice-only surface,
use a short spoken summary instead.

This status view is ordinary chat content, not an artifact. Do not create or
update an artifact to keep the dashboard current during planning. Create the
single durable itinerary artifact only at the end of a coherent planning
session after the user asks for or accepts it, unless the user explicitly asks
for the artifact earlier.

Treat a confirmed commitment as locked. Arrange the plan around a confirmed
commitment. Change or cancel a confirmed commitment only through Booking, or
through the applicable direct provider when Booking is unavailable, under the
same authorization and verification rules. When the user reports an existing
commitment but supplier evidence is not available, preserve it as a locked
dependency. Do not claim verified supplier confirmation for it. Do not
downgrade, duplicate, or silently rebook it.

## Revise without drift

Apply an edit to the canonical plan rather than producing a competing full
version. Retain a concise change history with prior values so the user can
compare revisions or undo a planning edit without treating an older copy as
the active plan:

- **Move:** retain the item's identity and decision state. Recheck hours,
  transit, tickets, and every downstream dependency affected by the new time.
- **Replace:** keep the old item rejected or removed as requested. The
  replacement starts proposed unless the user selected it explicitly.
- **Remove:** take only that item out of the active plan. Retain it in revision
  history for undo. Identify any resulting gap or broken dependency.
- **Undo:** restore the preceding planning state. Do not use undo to reverse a
  real reservation, purchase, cancellation, or message.

Preserve unrelated days, constraints, rejections, and confirmed items. Do not
add a restaurant, activity, city, or detour merely to make the revised plan
look complete. After a material edit, summarize what moved, was added or
removed, and what now needs rechecking. Compare full versions only when the
user asks or the delta is otherwise hard to understand.

When responsibility must survive the current conversation, reuse one relevant
durable owner. Do not create parallel trip records. A visible itinerary
artifact is a user deliverable. Do not treat that artifact as the only copy of
private working state. Read `/opt/hatch/skills/booking/SKILL.md` only when the
user needs live availability, exact commercial terms, or a transaction.

## Build a usable day

Resolve the exact local dates, including year, and the relevant overnight base
or arrival and departure geography before calling a day or route feasible. If
one is missing, provide a useful conditional sketch from the facts that remain.
Ask for only the smallest blocking detail. Label the unresolved dependency. Do
not claim the schedule works.

For each working day, establish a plausible local-time sequence. Arrange
selected items and proposed recommendations without conflating their states.
Include only details that make the experience usable:

- time or honest window, place and locality, expected duration;
- travel mode and current travel-time evidence from the preceding stop;
- a realistic transfer, queue, check-in, or recovery buffer;
- meal, rest, medication, or child-schedule windows when they constrain the  
  day;
- known cost and reservation state;
- a short reason the item fits; and
- a backup when weather, scarcity, closure, or a tight connection makes the
  anchor fragile.

A backup is a proposed contingency. Do not treat a backup as a second selected
anchor unless the user chooses it or delegates that choice.

Cluster nearby activities when it improves the day. Check opening days and
hours, last admission or service, ticket windows, arrival and departure times,
lodging check-in, and transport connections. Use a currently advertised route
or transit capability when one is available. Otherwise use a current operator
or official website and label remaining timing uncertainty. Do not present an
estimated travel time as checked.

A future travel duration returned by a route tool or operator is still an
estimate unless it is an exact scheduled service time. Label its source,
retrieval time, and material assumptions. Recheck volatile facts at the live
booking handoff and near the date of use, especially when the operator has not
yet published the relevant seasonal schedule.

Carry party constraints through every day. Do not apply them only in the
introduction. Check age restrictions and child pricing, stroller or mobility
practicality, walking and transfer load, rest needs, meal timing, and the
user's stated pace. Flag an overloaded day. Offer the smallest useful
adjustment. Do not compress activities into impossible timings.

## Ground consequential facts

Apply `/opt/hatch/skills/travel-planning/references/travel-fact-verification.md`
before the numbered source list in this section when
`/opt/hatch/skills/travel-planning/SKILL.md` directs it.

Use each source for what it can prove:

1. Supplier confirmations prove existing commitments.
2. A live booking provider proves current inventory and commercial terms.
3. An official venue, event, operator, or government source supports identity,
   operation, schedules, closures, rules, and published products or prices.
4. Place search, reputable guides, reviews, and social posts support discovery
   and qualitative fit. Verify an operational claim from those sources against
   another source.

Resolve the exact place, event, beach, station, or experience before naming it
in the active plan. Record the source identity, its URL when one exists, and
the retrieval time for facts whose failure would change the itinerary. Keep a
checked fact distinct from an estimate and from live availability.

Open each consequential booking or information link. Verify that it reaches
the intended official item, date, or product. A dead or stale link is a source
failure. An unexpected redirect to mismatched content is a source failure. On
a source failure, find the current official path or mark the item unverified.
A normal canonical or locale redirect to the intended content is acceptable.
Link failure is not evidence that the item is closed, sold out, or nonexistent.
Likewise, an accessible page is not evidence that dated inventory is available.

An official published admission, fare, or pass price is valid planning
evidence. Date-specific inventory, mandatory checkout fees, refundability, and
the final payable total are live commercial truth for Booking to establish.

When sources disagree, prefer the source that directly owns the fact. State the
unresolved discrepancy when you cannot reconcile it. Do not fill a gap with a
plausible venue, event, schedule, price, or link.

## Calculate trip economics transparently

For a pass, bundle, or material cost comparison, verify the exact current
product before calculating. Record:

- product name, duration, validity pattern, class or zone, traveler eligibility,
  and current official price;
- each itinerary segment or admission, its ordinary price, and whether the
  product fully covers it, discounts it, requires a reservation or supplement,
  or does not cover it;
- adult and child quantities and rules;
- source currency, taxes or fees when known, and unknowns;
- the exchange-rate source and date when conversion is necessary; and
- the arithmetic for point-to-point total, product total, uncovered extras,
  and resulting difference.

Do not interpolate an unlisted duration, infer coverage from a product name,
or call a pass cheaper when required fares, supplements, eligibility, or
prices are missing. When the evidence cannot support a savings number, show
the known components. State what remains unresolved.

## Produce one useful artifact after planning

After the plan reaches a coherent stopping point, when the user asks for or
accepts an itinerary artifact, create or update one canonical artifact rather
than creating a new copy after every revision. If the user explicitly asks for
an artifact earlier, honor that request. A useful artifact supports the whole
plan or a user-selected subset and includes:

- a chronological day-by-day view with local times, transit, buffers, costs,
  reservation state, rationale, and backups;
- one exact, trustworthy photo for each recommended physical place when
  available, following the "Make place recommendations visual" rules in  
  `/opt/hatch/skills/travel-planning/references/planning-kickoff.md`;
- official, source, or reservation links when available and freshness for
  consequential facts;
- confirmed details kept visually distinct from selected and unresolved items;
- a concise change summary and a visible list of what is still open; and
- a map or map links when geography materially helps and locations are
  verified, with a usable list fallback.

Update the canonical artifact for later changes. Follow
`/opt/hatch/skills/booking/references/presentation.md` when presenting booking
options, a final review, or a confirmation. For artifact photos, follow
`image_search`'s artifact ingestion and preflight contract. Do not persist a
transient CDN thumbnail as the durable copy. Keep the artifact private by
default. Publish the artifact, update a published copy, or send it to another
person only after a separate explicit request and the applicable approval. When
recipient-scoped private sharing is not available, tell the user. Offer a
downloadable file the user can share privately. Do not describe a public link
as private.
