# Travel-fact verification

This procedure defines route normalization, eligibility inputs, and source
ownership for consequential airport, border, and transfer claims.

## Normalize every leg independently

Record these facts for each relevant route leg before reasoning about that leg:

- **Origin:** Record the code, city, country or territory, and applicable border
  or customs area.
- **Destination:** Record the code, city, country or territory, and applicable
  border or customs area.
- **Timing:** Record local departure and arrival dates and times when known.
- **Service:** Record the operating carrier and service number when known.
- **Official classification:** Record the carrier's or authority's published
  classification when available.
- **Terminal:** Record the terminal, source identity, and retrieval time when
  available.
- **Next dependency:** Record the immigration, customs, baggage reclaim,
  transfer, connection, or check-in step that follows the leg.

Resolve every airport code against current authoritative location data.
Classify each leg from its own endpoints and evidence. Do not copy a domestic,
international, airside, precleared, no-immigration, or terminal label from an
adjacent segment. When endpoint countries differ, classify the leg as
international unless an authoritative source proves a route-specific exception.
When endpoint countries match, check an authoritative source for a special
border or customs regime before classifying the leg. Use the sources in "Match
sources to claims" below to verify each consequential claim for the exact leg
and travel date.

## Limit eligibility inputs

Base personalized entry or transit eligibility only on the minimum relevant
facts in the available inputs: citizenship, passport-issuing country and
document type, residency or visa status, trip purpose, and stay or transit
duration. If a required fact is absent, state the generally applicable process.
Mark personalized eligibility unresolved. Do not infer a missing eligibility
fact from adjacent itinerary context. Do not request or retain passport numbers
in ordinary planning state.

## Match sources to claims

Verify each consequential claim with the authority that owns that fact:

- Use a government immigration or border authority for entry, transit, visa,
  arrival-form, passport, and customs rules.
- Use the operating carrier or official airport for terminal, connection,
  baggage, transfer-desk, and check-in rules.
- Use the named airport or service operator for fast-track eligibility, hours,
  meeting point, inclusions, and published price.
- Use current route or navigation evidence for ground-transfer duration.
- Use reputable marketplaces or recent traveler reports only for qualitative
  context. Do not use them as the sole proof of an entry requirement or official
  service.

Verify each rule for the travel date. Record the source identity, source URL
when available, and retrieval time. If no authoritative source establishes a
consequential claim, mark that claim unverified. Make any dependent
recommendation conditional on resolving the claim.

Do not present a generic or remembered queue time as a current fact. If no
official live wait-time source exists, label any estimate as historical or
anecdotal. Base a fast-track recommendation on the verified arrival process,
the available user constraints, and the service's verified published terms.

## Separate advice from purchase

Keep operational analysis and recommendations under this skill. Apply
`/opt/hatch/skills/travel-planning/references/booking-handoff.md` when the
booking trigger in `/opt/hatch/skills/travel-planning/SKILL.md` applies. Add
each normalized leg, required eligibility input, and verified source record to
the candidate input defined in that handoff.

For an airport transfer, compare only options that serve the exact airport,
terminal, arrival time, party, luggage, and destination. If no available tool
can complete the selected transfer, assign the external action to the user in
the responsibility checklist.
