# Places

- `browser.search` discovers places and looks up a venue by name and address. `/opt/hatch/bin/places` adds rich details and identifies a place from photos. There is no `places` tool namespace to load and no account to connect.

- [Place Discovery](/opt/muse/skills/place-discovery/SKILL.md) covers choosing and presenting places.

## Search for places

- Put the whole intent in `primary_query.query`, including the category or exact venue name, the area, any radius and the ranking the user wants. Search for "best sushi restaurants in San Francisco within five miles", not just "sushi".

- Write "near me" or "nearby" in the query only when `message_location` or `last_seen_location` arrived with this turn, since the search cannot see a location learned any other way. When the location came from the user, a device read or their saved home, put the area's name in the query.

- If no location is available, ask the user. Never invent or guess a location.

- One search covers one area. Search each city or neighborhood the user names separately and cover each in the answer.

- For a named venue, include its exact name and enough of the area to tell branches apart. A follow-up such as "anything cheaper?" refines the previous search.

- For "best", trending or insider requests, `browser.search` returns web evidence and place results together, so use both. Cite web facts in the search's usual citation format.

- Name only places a tool returned, and leave out permanently or temporarily closed places unless the user asked about them.

## Read details

- `places details` takes only the numeric `place_id` values that `browser.search` or `places detect` returned, batched in one call. A name or URL cannot replace the ID.

```sh
/opt/hatch/bin/places details 755728335673330 1124993194757094 --summary
```

- Use the search result directly when it already answers the question. Call `places details` for fresher hours, prices, photos, reviews and offerings, and pass `--motivation` with the user's intent so quotes and photos are ranked for it.

- For a shortlist or map, use `--summary`. It keeps each record's name, location, address, categories, hours and closure status, rating, price level, phone numbers, links and offerings when present, without gallery or review payloads. It preserves the usual ID-to-record JSON shape. Use full details only when the task needs the omitted content.

- Direct, redirected or piped `places details` output can include a reserved top-level `_meta` entry for privacy deletion and redaction. It is not a place: skip `_meta` when iterating or counting records. Normal runtime readback hides it from the agent, but does not remove it from a saved file.

- Reuse details already returned for the same branch and task. Fetch only new candidates or facts that need refreshing. Do not pipe details through `head`: it can hide later places or cut the JSON. If you need to process a full response, save it once, parse that file and filter out `_meta` rather than rerunning the lookup. Missing records and nested fields such as `rating` can be null; treat them as unknown, not a reason to fetch the same response again.

- The response maps each place ID to its record, with the place's fields under `details`, including `details.rating.avg_rating` and `details.rating.num_rating`. Read `places --help` for options such as `--num-gallery-media`, `--num-quotes` and `--product-source`.

- If a search returns no numeric ID, try once more with the exact venue name and area. If there is still none, answer from the cited search evidence without a details lookup or a map point.

## Keep a place's identity together

- Keep the numeric `place_id`, canonical name and coordinates from the same details record together, and pass that record when another tool needs the place.

- Missing coordinates are unknown. Never derive them from a name or pair an ID with coordinates from another record.

- Show the chosen places on one map as [map presentation](/opt/muse/skills/place-discovery/references/map-presentation.md) describes.

## Identify a place in a photo

- `places detect --frame PATH --location "LAT,LNG,TIMESTAMP_MS"` resolves captured frames and their GPS into ranked candidates with `place_id`, `place_name` and `confidence`. Pass one `--location` per `--frame`, and use a returned ID for a details lookup.

- The optional fourth `--location` field is the connected Wi-Fi BSSID, which improves home and work matching. Include it only when known, and never repeat the raw value to the user.

## Limits

- Places does not give directions, distances or travel times. Use `map.navigation` for those.

## Related skills

- [Grocery and Food Delivery](/opt/muse/skills/groceries/SKILL.md)

- [Home Search](/opt/muse/skills/home-search/SKILL.md)

- [Hotel Booking](/opt/muse/skills/hotel-booking/SKILL.md)

- [Place Discovery](/opt/muse/skills/place-discovery/SKILL.md)

- [Restaurant Reservations](/opt/muse/skills/restaurant-reservations/SKILL.md)

- [Trip Planning](/opt/muse/skills/trip-planning/SKILL.md)

- [Trip Transport](/opt/muse/skills/trip-transport/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
