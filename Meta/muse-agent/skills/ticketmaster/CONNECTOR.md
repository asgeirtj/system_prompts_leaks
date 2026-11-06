# Ticketmaster

- `/opt/hatch/bin/ticketmaster` searches events and reads available seats with prices. It needs no user setup, and it cannot buy tickets. Purchases continue in the browser through the checkout link it returns.

- [Event Tickets](/opt/muse/skills/event-tickets/SKILL.md) compares Ticketmaster with official box offices and resale.

## Find the event

```sh
/opt/hatch/bin/ticketmaster search-events --keyword "Lakers" --city "Los Angeles" --start-date 2026-11-01 --end-date 2026-12-01 --sort date,asc
```

- `search-events --keyword TEXT` filters with `--city`, `--state-code`, `--country-code`, `--classification-name`, `--start-date` and `--end-date`. Dates take ISO 8601 or plain `YYYY-MM-DD`, and `--country-code` defaults to `US`, so pass the event's country, such as `GB`, `CA` or `MX`, for events elsewhere.

- Pages use `--size` (default 10, up to 200) and a zero-based `--page`. `--sort` takes values such as `date,asc` or `relevance,desc`.

- Results are raw Discovery objects under `_embedded.events[]`, with paging in `page` and no `ok` wrapper. A failed command instead returns `ok: false` with an `error`, or with `status: 429` when the request is rate limited. Use each event's `id` for `event-details --event-id ID` and for seat reads.

- Read each event's title in `name`, its public page in `url`, its timing in `dates.start` and `dates.timezone`, its status in `dates.status.code` and its venue in `_embedded.venues[0]`. Say when an event is cancelled, postponed or rescheduled.

- Timed events add `event_starts_at` and `event_ends_at` in UTC and user-local forms, plus `retrieved_at`. Prefer the user-local form, and keep a date-only value as a date.

- Search-level `priceRanges` is often missing or incomplete. Never say there is no pricing until `top-picks` has run.

## Read seats and prices

```sh
/opt/hatch/bin/ticketmaster top-picks --event-id ID --quantity 2 --sort listprice
```

- `--quantity` defaults to 2. Always pass the user's exact ticket count, and do not call `top-picks` until that count is known.

- `top-picks` also accepts the numeric event ID that its response echoes as `eventDetails.id`.

- Use `--sort listprice` for the cheapest seats and `--sort quality` for the best. Filter with `--price-min`, `--price-max`, `--sections`, `--areas` and `--ticket-type-id`, and set `--limit` (default 10, up to 100).

- `--sections` and `--areas` each take one comma-separated list, such as `--sections "MEZZ,ORCH"` or `--areas "10,11"`. Never repeat either flag.

- `--selection Any`, the default, includes Standard, Resale and Platinum tickets. `--selection Standard` leaves out resale.

- Venues name their sections inconsistently. For an unfamiliar seating level, run a broad `--sort quality --limit 20` query without `--sections` first, then use the returned section and area names.

- Join each pick's `offers` IDs to `_embedded.offer[]` before pricing it. Take the price from `pick.total_price`, then the matched offer's `totalPrice`. Both are per-ticket prices, so multiply by the quantity for the party total and never label one ticket's price as the total. Show `face_value` only as context, never as the main price.

- Respect an offer's `limit.min` and `limit.max`. For resale picks, show the `listingDetails` description and note that they are verified resale tickets.

- When `eventDetails.allInclusivePricing` is true, say that the prices include fees. Show `eventDetails.listingsDisclaimer` and `eventDetails.importantInformation` when present.

- Skip any event or pick that carries an `error`, without showing the error text.

- Never quote a price from memory or an earlier turn. Run `top-picks` again and quote only its current result, including on every run of a scheduled price check.

## Keep the price, seats and checkout together

- Take the checkout link from `redirect_url` on the same pick as the price and seats, and check its seat and offer parameters. The CLI sets `redirect_url` only when the pick's checkout link is a valid HTTPS Ticketmaster link, so a pick without it has no usable link. Returned HTTPS affiliate links such as `https://ticketmaster.evyy.net/...` are valid.

- Give each option a compact `[Review on Ticketmaster](<checkout link>)` link bound to its own pick. Never reuse one option's link for another or invent a missing one, and do not present a seat as purchasable without a valid link and price.

- For a seat image, use `snapshot_image_url`. When a pick has no valid seat view of its own, the CLI fills `snapshot_image_url` with the response's top-level `venue_map_url`, which shows the venue rather than the view from that seat.

- Present ticket choices in the Markdown ticket table from [booking presentation](/opt/muse/assets/booking/references/presentation.md). Never use HTML, `seat-view-carousel`, `widget.create_list_widget` or `muse.create_options` for them.

- When the user picks tickets, ask whether they want to sign in to Ticketmaster before checkout, and continue as a guest when allowed. Hand off the exact link only when sign-in, blocked automation or another real limit stops the browser.

- The checkout link prepares a purchase. Confirm the browser's final order confirmation before saying tickets were bought.

## Related skills

- [Event Tickets](/opt/muse/skills/event-tickets/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
