---
name: "places_search"
title: "Places Search"
description: "Find, compare, and share details on physical places near the user or in a specified area, including restaurants, cafes, bars, hotels, parks, attractions, shops, and businesses with local services. Not for itineraries, choosing a city or region, dated events or showtimes, or directions."
metadata: { "includeInPrompt": false }
---

# Places

Use `browser.search` for all place discovery and name/address lookup. Run
`places <command>` through `muse.exec` for richer details and photo-based place
detection. Never load or search for a `places` tool namespace. If a search
comes back empty or weak, refine the `browser.search` query per the rules
below. Print CLI JSON to stdout for you to read, not to show the user. Use
`--help` when needed. No sign-in is required.

## Common flows

### Find places

Use `browser.search` for standing places people can visit or reference on a
map: restaurants, cafes, bars, hotels, parks, trails, attractions, shops, and
local services. A follow-up like "anything cheaper?" or "Italian instead?"
refines the preceding search.

- Put the complete user intent in `primary_query.query`. Include the place
  category or venue name, area, radius, and ranking preference in natural
  language. For example, search for "best sushi restaurants in San Francisco
  within five miles", not just "sushi".
- Put "near me" or "nearby" in a browser.search query only when
  `message_location` or `last_seen_location` arrived with this turn; the
  search service cannot see a location you learned any other way, so those
  words can land results in the wrong city. When the location came from the
  user, a device read, or their home on file, put the area's name in the
  query. If no location is available, ask the user; never invent or guess a
  location.
- One call covers one area. When the user names multiple cities or
  neighborhoods, run a separate call for each and cover each in the answer.
- For category discovery, include the category and area in the query. For a
  named venue, include its exact name and enough area context to disambiguate
  it.
- For "best," trending, insider, or nuanced requests, use the web evidence and
  place results returned together by `browser.search`. Ground every named venue
  in a returned result.
- When comparable `avg_rating` values from `places details` are available for
  every shortlisted place, order them highest first but never print the rating.
  Otherwise order by relevance to the user's constraints.
- Avoid showing permanently or temporarily closed places unless specifically
  asked for.
- Judge the returned result set rather than following rank blindly. Set aside
  wrong-category or wrong-area results. If the set is weak, retry with an exact
  venue name, a narrower subtype, or clearer area language.

### Get richer details

- `places details` takes numeric place IDs only. It cannot search by name or
  address; use `browser.search` for that.
- Call `places details` only when `browser.search` explicitly returns an all-digit
  `place_id` for that result. Never derive an ID from a venue name or URL.
- Prefer the `browser.search` response when it already contains enough detail. Use
  `places details` for richer or fresher hours, prices, photos, reviews, and
  offerings.
- If `browser.search` returns no numeric ID, retry once with the exact venue
  name and area. If that still returns no ID, answer from cited search evidence
  without details or a map.
- Batch several IDs into one call when comparing places. Pass `--motivation`
  with the user's intent so quotes and photos are ranked for it.
- `places details` returns `{"<place_id>": {"details": {…, "rating":
  {"avg_rating", "num_rating"}}}}`, keyed by id.

### Show places on a map

Before creating a map, run `places details` for the selected numeric IDs. Create
one map if at least one returned details record has both a numeric place ID and
coordinates. This applies to recommendations, comparisons, named-place
lookups, and other uses where a map could ground the user. See Response
formatting for which places go on it.

Create one `local_map` widget with `widget.create` and this payload:

```json
{
  "kind": "local_map",
  "data": {
    "elements": [
      {
        "kind": "rich_place",
        "place_id": "<numeric ID>",
        "name": "<name from the same result>",
        "coordinate": {
          "latitude": 0.0,
          "longitude": 0.0
        }
      }
    ]
  }
}
```

- Replace the example coordinates with the values from the same keyed
  `places details` record. Use its canonical name. Omit a place whose details
  or coordinates are missing; never infer an ID or geocode a name.
- If creation fails, answer in text. Do not retry or build an HTML or image map.

### Identify a place from a photo

Use `places detect` when captured frames and GPS need to resolve which place the
user is at. It returns ranked candidates as `{place_id, place_name, confidence}`.
Pass a returned ID to `places details` for more. The optional 4th `--location`
field is the connected Wi-Fi BSSID; include it verbatim when known to improve
Home/Work matching, and never echo a raw BSSID back to the user.

## Response formatting

- Never name a place that did not come back from a tool.
- Match the framing to the ask. When the user wants a recommendation, give them
  two to three. When the request is broad, offer a few named results as a
  starting point.
- Name two to three places in text from the merged result set. Write each on
  its own line in exactly this shape: `**Name**, a sentence or two on why you
  chose it.` Open with one short line framing the answer before the places.
- Send the text as one message. Never add a second message after the map.
- No addresses, raw place IDs, coordinates, star ratings, review counts, or
  price levels in text.
- After a recommendation, note there are more options without itemizing; after
  a broad answer, offer to narrow to a recommendation.
- Cite factual claims sourced from `browser.search` using its normal citation
  format.
- Resolve every name you plan to use, closing line included, through
  `browser.search` before creating the map. Never name an unresolved place.
- Build the map from the most relevant places returned that have a place ID
  and coordinates. Don't rely solely on named places in your text as an
  indication of what places should appear on the map.
- The places you named come first on the map, in the order you named them,
  ahead of everything else.
- Create one map per answer. Include the returned `embed_token`.
- Never narrate or reference the map. No "I mapped things out for you"; "Take a look at the map", etc.

## Limits

- Do not write directions, turn-by-turn steps, maps links, or navigation
  controls.
- Do not estimate travel times or distances. Use only values returned by a tool.
