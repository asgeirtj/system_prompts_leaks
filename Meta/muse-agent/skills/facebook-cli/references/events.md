# Facebook Events

Search Facebook Events and read a single event's details.

## Commands

### Search Events

```bash
facebook-cli events search [--scope <scope>] [--keywords <text>] [--location <place>] [--latitude <lat> --longitude=<lng>] [--radius-in-miles <n>] [--category <category>] [--start-date <YYYY-MM-DD>] [--end-date <YYYY-MM-DD>] [--limit <n>] [--after <cursor>]
```

**Options:**
- `--scope` (optional): `connected` (default) — events you are connected to (going, interested, invited, hosting); `discover` — popular nearby events from the recommendation backend
- `--keywords` (optional): Free-text search, e.g. `"music"`, `"farmers market"`
- `--location` (optional): Place string, e.g. `"Seattle"`. Discover scope searches near this place instead of your location. The server geocodes it to a **city center**, so it cannot express a neighborhood or an address
- `--latitude` / `--longitude` (optional, discover scope only): Exact WGS-84 search center. Pass both or neither; one alone is an error. The pair takes precedence over `--location`. Use this whenever you have real coordinates — it is more accurate than any place string
- `--radius-in-miles` (optional, needs the coordinate pair): Search radius around the coordinates. Defaults to 25 miles
- `--category` (optional): Event category name, e.g. `MUSIC_AND_AUDIO`
- `--start-date` / `--end-date` (optional): Calendar dates (`YYYY-MM-DD`); start must not be after end
- `--limit` (optional): Maximum events per page (default 10, max 25)
- `--after` (optional): Pagination cursor from the previous response (`paging.cursors.after`). Cursors are bound to their search scope — do not reuse a cursor with a different scope

**Examples:**  
```bash
# My upcoming events
facebook-cli events search

# Keyword search across popular nearby events
facebook-cli events search --scope discover --keywords "music" --limit 5

# Events near a place on/after a date (city-center accuracy)
facebook-cli events search --scope discover --location "Seattle" --start-date 2026-07-31 --limit 5

# Events near exact coordinates, within 5 miles (preferred when coordinates are known)
facebook-cli events search --scope discover --latitude 37.5072 --longitude=-122.2605 --radius-in-miles 5 --limit 5

# Next page (pass the cursor from the previous response)
facebook-cli events search --scope discover --keywords "music" --after "<cursor_from_previous_response>"
```

**Choosing a location:**
1. If the turn context already carries the user's coordinates (for example a `message_location`
   tag), pass them straight to `--latitude` / `--longitude`. Do not reverse-geocode them into a
   place name first — that throws away the precision this command exists to use.
2. If the user named a place, geocode it with `map.geocode` and pass the coordinates, or pass the
   place string to `--location` when city-level accuracy is enough.
3. If nothing establishes a location, ask the user. Discover scope with no location falls back to
   a server-side guess, and the response never says which place it used.

**Negative coordinates:** write `--longitude=-122.2605` with the `=`. A bare `--longitude -122.2605`
is misread as another flag and fails with `error: unexpected argument '-1' found`. The same applies
to `--latitude` in the southern hemisphere.

**Response fields per event:**
- `id`: Numeric raw event ID (global, not app-scoped — matches the ID in `permalink_url`)
- `name`: Event name
- `permalink_url`: Shareable link, always `https://www.facebook.com/events/<id>/`
- `description`: Event description (may be null)
- `start_time` / `end_time`: Timestamps with offset (e.g. `2026-08-01T11:00:00-0400`)
- `location`: Venue or address text (may be null)
- `category`: Category name (may be null)
- `going_count` / `interested_count`: Attendance counts
- `timezone`: IANA timezone (may be null)
- `privacy`: `public`, `private`, etc. (may be null)
- `is_online`: Whether the event is online
- `online_url`: Third-party URL where an online event is hosted. Details responses only — search results omit this key entirely rather than sending null

The response is paginated: events live under `data`, with the next cursor at `paging.cursors.after` when more pages exist.

### Read Event Details

```bash
facebook-cli events details --event-id <id>
```

**Options:**
- `--event-id` (required): Raw numeric event ID — the `id` from search results, or the number embedded in the event's `permalink_url`

This is the only events route that populates `online_url`. A malformed ID returns 400; an event that does not exist or is not visible to you returns 404 (the two cases are indistinguishable by design).

**Examples:**  
```bash
# Read one event (ID taken from a search result)
facebook-cli events details --event-id 1679757800076464
```

**Response fields:** same as search, plus `online_url` (null when the event has no third-party online URL).
