# Facebook events

- Find Facebook Events connected to the account or discover popular Events near a location. These commands provide context about an Event's schedule, location, attendance, privacy, and online access.

## Search events

```sh
/opt/hatch/bin/facebook-cli events search [--scope <connected (the default) or discover>] [--keywords '<keywords>'] [--location '<place>'] [--category <category, such as MUSIC_AND_AUDIO, SPORTS or FOODS>] [--start-date <YYYY-MM-DD>] [--end-date <YYYY-MM-DD>] [--limit <1 to 20, default 20>] [--after '<paging.cursors.after from the previous response, with the same scope and filters>']
/opt/hatch/bin/facebook-cli events search --scope discover --latitude <latitude> --longitude <longitude> [--radius-in-miles <miles, default 25>] [--keywords '<keywords>'] [--category <category>] [--start-date <YYYY-MM-DD>] [--end-date <YYYY-MM-DD>] [--limit <1 to 20, default 20>] [--after '<paging.cursors.after from the previous response, with the same scope and filters>']
```

- `events search` finds Events. `--scope connected`, the default, returns only Events the user is going to, interested in, invited to, or hosting. These can include public Events. `--scope discover` finds popular public Events near the effective search location; see **Choose the search location** below.

- `--keywords` searches Event names with `--scope connected` and finds nearby Events related to the keywords with `--scope discover`.

- `--start-date` and `--end-date` limit results to Events that start within the specified date range. Both dates are inclusive, and the start cannot be after the end.

- When `paging.cursors.after` is present, pass it as `--after` with the same scope and filters. Follow cursors until none remains before saying no Events match, or say which pages were searched. A cursor used with another scope is rejected.

- When `events search` returns no Events, tell the user which scope, dates and place you searched, and report only Events that `events search` or `events details` returned.

- The response contains a `data` list. Use an Event's `id` for `events details` and its `permalink_url` as the Facebook Event link. `permalink_url` has the form `https://www.facebook.com/events/<id>/`.

### Choose the search location

- With `--scope connected`, `--location` filters the Event's location text. Use `--latitude`, `--longitude`, and `--radius-in-miles` only with `--scope discover`.

- For the user's own Events in a region, keep `--scope connected` and any requested dates. Use `--location` only when the venue text will name the place; otherwise omit it and filter the returned `location` values, such as keeping San Francisco and Oakland Events for "the Bay Area".

- With `--scope discover`, `--location` is geocoded to a city center and searches within the 25-mile radius. Use it for a city-level search.

- With `--scope discover`, `--latitude` and `--longitude` set an exact search center and must be passed together. They override `--location`. For a neighborhood or address, get the coordinates with `map.geocode`. `--radius-in-miles` sets the radius around this center.

- When the conversation already provides coordinates for a `--scope discover` search, pass them directly to `--latitude` and `--longitude` to preserve the exact search center.

- Without a search location, `--scope discover` uses a server-selected location that is not identified in the response. Pass `--location` or coordinates when the search should use a specific location.

- If nothing establishes the location, ask the user before a discover search.

## Read event details

```sh
/opt/hatch/bin/facebook-cli events details --event-id '<numeric id from events search, also the number in permalink_url>'
```

- `events details` reads one Event. The response contains all fields returned by `events search`, plus these details-only fields:
  - `online_url`: the URL where an online Event is hosted, or null when none is available
  - `rsvp_style`: `public` uses `going`, `interested`, and `declined`; `private` uses `going`, `maybe`, and `not_going`
  - `viewer_response`: the account's current response in the `rsvp_style` vocabulary, or null when it has not responded

- `permalink_url` is the Facebook Event page. It is distinct from `online_url`, which identifies where an online Event is hosted.

- Give `online_url` as the join link for an online Event, without checking whether it loads.

- `start_time` and `end_time` include the Event's UTC offset. `timezone`, when available, identifies the Event's IANA time zone.

- When presenting an Event, include its `permalink_url` and, when `start_time` is available, its Event-local start time.

- A malformed Event ID returns an error. An Event that is missing or not visible to the account returns the same not-found error, so tell the user the Event isn't visible to them, for example because it's private, rather than saying it was deleted or doesn't exist.
