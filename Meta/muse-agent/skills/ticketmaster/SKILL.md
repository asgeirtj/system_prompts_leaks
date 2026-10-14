---
name: "ticketmaster"
description: "Search Ticketmaster events and seats with pricing. Returns Buy-now links to Ticketmaster checkout; it cannot complete a purchase itself."
metadata: { "includeInPrompt": false }
---

# Ticketmaster

## Purpose
Search events and get smart Ticketmaster seat recommendations.

For a user-facing event-ticket search or purchase, first read  
`/opt/hatch/skills/booking/SKILL.md`,  
`/opt/hatch/skills/booking/references/tickets.md`, and
`/opt/hatch/skills/booking/references/presentation.md`. Those files define the
routing, presentation, browser checkout, and commitment rules. Use this file
for the Ticketmaster CLI contract. Do not call `seat-view-carousel`, create
HTML, or use `widget.create` for a booking flow. Use the compact Markdown ticket
table and optional verified Markdown images.
Do not call `create_options` for ticket choices or checkout decisions.

## Tooling

```sh
ticketmaster <subcommand> [options]
```

#### search-events
Search for events by keyword (required), location, and date range. Supports `--country-code` (default: US), `--page` (0-indexed), and `--sort` (e.g. `date,asc`, `relevance,desc`, `name,asc`). `--start-date` and `--end-date` accept ISO 8601 values; bare `YYYY-MM-DD` dates are normalized by the CLI.

```sh
ticketmaster search-events --keyword "Taylor Swift" --city "Los Angeles" --size 10
ticketmaster search-events --keyword "Lakers" --start-date 2026-05-01 --end-date 2026-06-01 --state-code CA --sort date,asc
```

#### event-details
Get full details for a specific event ID returned by `search-events`.

```sh
ticketmaster event-details --event-id vvG1IZ_AKnSEae
```

#### top-picks
Get seat recommendations sorted by price or quality. Default `--selection Any` returns Standard + Resale + Platinum tickets. Use `--selection Standard` to exclude resale. Returns `venue_map_url` and per-pick `snapshot_image_url` when available. Preserve those URLs for verified Markdown links or images.

```sh
ticketmaster top-picks --event-id vvG1IZ_AKnSEae --quantity 2 --sort listprice
ticketmaster top-picks --event-id vvG1IZ_AKnSEae --quantity 4 --sections "MEZZ,ORCH" --sort quality
ticketmaster top-picks --event-id vvG1IZ_AKnSEae --quantity 2 --price-min 50 --price-max 150 --limit 10
ticketmaster top-picks --event-id vvG1IZ_AKnSEae --quantity 2 --selection Standard --sort listprice
ticketmaster top-picks --event-id vvG1IZ_AKnSEae --quantity 2 --areas "10,11" --ticket-type-id 000000000001
```

#### seat-view-carousel
Generate a carousel HTML widget from top-picks JSON. Takes the full top-picks JSON output as `--input`. Outputs raw HTML to stdout.

```sh
ticketmaster seat-view-carousel --input '<top-picks JSON>' --title "Lakers vs Thunder" --subtitle "Paycom Center · May 13 · 8:30 PM"
```

## Output

Commands return JSON from Ticketmaster. Do not expect an
`ok` wrapper around endpoint output.

The CLI maps snake_case query params to Ticketmaster camelCase API params. The
response body is the raw Ticketmaster payload unless this CLI adds explicit
convenience fields for local rendering.

**search-events**: raw Ticketmaster Discovery search response. Events are in
`_embedded.events[]`; pagination is in `page`. For each event, use `id` as the
event ID for follow-up calls, `name` for the title, `url` for the public
Ticketmaster page, `dates.start.localDate`, `dates.start.localTime`, and
`dates.start.dateTime` for timing, `_embedded.venues[0]` for venue/city/state,
and `priceRanges[]` when Ticketmaster includes search-level pricing.
Each event may add `tmol_available`. When it is `false`, `url` and the
`tmMarketPlace` outlet URL are omitted and `box_office_url` contains a sanitized
venue link or `null`. An absent `tmol_available` means availability is unknown.

**event-details**: raw Ticketmaster Discovery event object. Read fields
directly from the event: `id`, `name`, `url`, `dates.start.*`,
`dates.timezone`, `dates.status.code`, `priceRanges[]`, `classifications[]`,
`images[]`, `_embedded.venues[]`, `_embedded.attractions[]`, and `_links`.

Timed event reads add `event_starts_at` / `event_ends_at` with canonical UTC
and user-local forms, plus runtime-generated `retrieved_at`. Prefer the
user-local form when answering; date-only event fields remain dates.

**top-picks**: raw Ticketmaster Top Picks response with CLI convenience fields
added for carousel rendering when available.

Top-picks contains `picks[]`, `_embedded.offer[]`, `eventDetails`, and `page`.
Seat-level pricing lives in `_embedded.offer[]`, keyed by `offerId`; each pick
references offers through `picks[].offers[]`. Use the first referenced matching
offer as the primary displayed price. `_embedded.offer[].totalPrice` is the
price **per ticket**, not the total for the requested quantity. Multiply it by
the requested quantity and show that computed full-party amount as the primary
price; label the per-ticket amount separately only when useful. Do not label one
ticket's `totalPrice` as the pair or party total. If
`eventDetails.allInclusivePricing` is true, say the displayed per-ticket price
and computed party total include fees and show
`eventDetails.listingsDisclaimer` when present. You may show `faceValue` only
as additional context, not as the main price.

Ticketmaster may return both camelCase and snake_case duplicates. Use this
precedence when reading fields:
- Checkout URL: `pick.redirect_url || pick.redirectUrl`
- Seat image: `pick.snapshot_image_url || pick.snapshotImageUrl || pick.snapshotURL`
- Price: `pick.total_price || _embedded.offer[offerId].totalPrice`

The CLI may add these convenience fields for carousel rendering:
`venue_map_url`, `snapshotURL`, `snapshot_image_url`, `redirect_url`,
`total_price`, `face_value`, and `currency`.

Each pick may include: `{ type, selection, section, row, seats, area, quality, descriptions, listingDetails, offers, snapshotImageUrl, redirectUrl }`.

**seat-view-carousel**: Legacy HTML output. Do not use it in a booking flow.
Images are Ticketmaster-hosted, for example
`https://app.ticketmaster.com/maps/geometry/...`. Checkout URLs must be valid
HTTPS URLs; `https://ticketmaster.evyy.net/...` affiliate redirect URLs with
preselected seats are valid when returned.

Do not generate or render the carousel or a buy-now list widget in a booking
flow. Put three to five exact ticket groups in the booking skill's Markdown
table. A verified `snapshot_image_url` may appear below the table with ordinary
Markdown image syntax and an exact section label. Keep each valid checkout URL
as a compact Markdown link in the relevant option or next action.

## Auth
No user setup is required for Ticketmaster service access.

## Operating Rules
1. Use `search-events` first to find the event ID before calling `top-picks`.
2. When the user asks for "cheap" tickets, use `--sort listprice`. When they want "best" seats, use `--sort quality`.
3. When searching for a seating level, do not guess the section name. Venues use inconsistent names for floor, mezzanine, orchestra, pit, and upper sections. Run a broad `--sort quality --limit 20` query with no `--sections` filter. Use the returned section names and area labels in later `--sections` queries.
4. When a valid checkout URL (`redirect_url || redirectUrl`) and a displayed price are present, include a compact `[Review on Ticketmaster](<redirect_url>)` Markdown link for that option. Ticketmaster affiliate links such as `https://ticketmaster.evyy.net/...` are valid checkout URLs. If the checkout URL is absent/invalid or pricing is unavailable, do not fabricate a checkout link or present the seat as directly purchasable.
   Bind each link to the same pick used for that row and verify its offer/seat
   parameters before sending. Do not reuse one option's URL for another option;
   omit an unverified link instead.
5. For resale tickets (`selection: "resale"`), show the `listingDetails` description when present and note these are verified resale tickets.
6. If the selected offer has a `limit` object, respect its `min` and `max` quantity bounds.
7. If `eventDetails.allInclusivePricing` is true, note that the displayed price includes fees. Show `eventDetails.listingsDisclaimer` and `eventDetails.importantInformation` when present.
8. After `top-picks` returns, follow the `Event tickets` section in  
   `/opt/hatch/skills/booking/references/presentation.md`.
9. `priceRanges[]` from search-events is often absent or incomplete. Do not tell the user "no pricing available" based on search-events alone. Use `top-picks` to get current pricing.
10. Use the raw Discovery `id` from `_embedded.events[]` for `event-details` and prefer it for `top-picks` calls. `top-picks` accepts either the Discovery ID (for example `vvG...`) or the numeric geometry/eventDetails ID (for example `0900...`); the response may echo the numeric ID as `eventDetails.id`.
11. If a search event has `tmol_available: false`, it is not sold on Ticketmaster. Say so, offer its non-null `box_office_url`, and never run `top-picks` on it. If `box_office_url` is null, say Ticketmaster Discovery supplied no official purchase link. If `tmol_available` is absent, do not claim the event is offsite.
12. When the user selects tickets, use the browser to keep the exact checkout alive and prepare it to final review. Ask whether the user has a Ticketmaster account and wants to sign in before checkout. Continue as a guest when permitted. Hand off the exact link only when authentication, blocked automation, or another real limitation prevents the main agent from continuing.
13. If a response carries an `error`, drop it silently: skip that event or pick, and do not display it or surface the error text.
14. Do not quote a price from memory or an earlier turn. Re-run `top-picks` and quote only its current result. A price-monitoring cron must fetch current inventory on every run.
