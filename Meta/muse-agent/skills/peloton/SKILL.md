---
name: "peloton"
description: "Connect to Peloton to browse fitness classes, check schedules, and book workouts."
icon: "peloton"
metadata: { "includeInPrompt": false }
---

# Peloton

## Purpose
Connect to Peloton to browse on-demand and live fitness classes, manage schedules, and book workouts.

## Tooling
Use the installed CLI directly from `PATH`.

Core auth commands:
- `peloton status`
- `peloton authorize-url`
- `peloton disconnect`

### Class Browsing
- `peloton ride-archived [--limit 10] [--page 0] [--fitness-discipline cycling] [--duration 1800] [--sort-by popularity] [--difficulty-level beginner] [--has-closed-captions true] [--super-genre-id <ID>] [--browse-category cycling] [--class-type-id <ID>] [--instructor <ID>] [--desc true]`
- `peloton ride-live [--limit 10] [--schedule-type live] [--exclude-complete true] [--days 7] [--fitness-discipline cycling] [--super-genre-id <ID>] [--browse-category cycling] [--class-type-id <ID>] [--instructor <ID>] [--desc true]`
- `peloton search-class --query "<text>" --limit 10 --page 0 [--include-raw] [--include-schema]` — search classes by natural-language or partner-provided terms such as "seated strength". Always pass `--limit` and `--page`; use `--limit 10 --page 0` unless the user asks for a different local result window. Use `--include-raw` or `--include-schema` only when inspecting the response shape.

Response structure: class browsing commands return a presentation-ready `body.classes[]` array. `search-class` also returns local-window fields: `body.count`, `body.total`, `body.page`, `body.limit`, `body.has_more`, and `body.pagination_mode: "local_window"`. Peloton search does not support API pagination; `--limit` and `--page` only slice the returned result set locally. For different results, refine the query instead of trying to fetch another provider page. Raw provider arrays may be present only for debug commands that request them.

Class reads preserve Peloton's raw epoch fields and add semantic
`class_scheduled_start_at`, `class_starts_at`, `class_ends_at`, and
`class_originally_aired_at` values with UTC and user-local forms when those
source fields are present. Prefer the semantic fields.

#### Filter IDs
- `peloton metadata-mappings` — returns all filter taxonomies: instructors, class_types, equipment, fitness_disciplines, difficulty_levels, and content_formats. Use the returned IDs for `--super-genre-id`, `--class-type-id`, and `--instructor` filters instead of hardcoding values.

### Scheduling
- `peloton schedule-event --ride-id <ID> --scheduled-start-time <EPOCH>` — schedule an on-demand class
- `peloton schedule-event --join-token <TOKEN>` — schedule a live class
- `peloton delete-scheduled-event --join-token <TOKEN>` — remove a scheduled class
- `peloton reschedule-event --join-token <TOKEN> --scheduled-start-time <EPOCH>` — move to new time

### Deeplinks
- `peloton deeplink --class-id <ID>` — generate a link to view the class in Peloton

## Auth
Peloton is an OAuth-backed skill.

For normal class reads, call the requested read command directly; do not add a `peloton status` preflight. If a command reports `not_connected`, or the user asks to manage the connection:
1. Run `peloton status`.
2. If status is `not_connected`, complete the link flow first.
3. Before running `peloton authorize-url`, ask for explicit confirmation:
   - state the provider name: `peloton`
   - warn: `This stores a persistent access token for Peloton. Your assistant will have ongoing access until you disconnect it locally or revoke it in Peloton settings.`
   - never show raw OAuth scope strings or scope names in the connection message
4. Run `peloton authorize-url` once. When `connect_url` is present, replace `<connect_url>` with the returned URL and share exactly this Markdown link: `[Connect Peloton](<connect_url>)`; do not paste the raw URL separately.
5. Do not call `peloton authorize-url` again while waiting for the user to approve the link or for the callback to complete; use `peloton status` to check pending connection state.
6. After callback completion, run `peloton status` again and continue only when status is `connected`. If status is still `not_connected`, say the connection is still pending or failed and ask whether to generate a new link.

Credential storage:
- Never print `client_secret`, `access_token`, or `refresh_token`.

## Operating Rules
1. For account linking, follow the Auth section.
2. Do not show raw internal identifiers, difficulty scores, star ratings, rating counts, or class URLs in user-facing results unless the user explicitly asks for technical/debug details. Use titles, instructor names, and times for fallback text.
3. For natural-language class searches, call `peloton search-class` with `--limit 10 --page 0`. Use `ride-archived` only when the user requests its structured filters or unsearched archived browsing. Present the returned `body.classes[]` with `widget.create`, using `kind: "list"` and a list title and `items` inside `data`. Put each class title in `title`, instructor and `duration_minutes` in `subtitle`, and a relevant class time in `tertiary_title` when available. Copy `thumbnail_url` into `image_url` when present. Use `type: "link"` with `data.url` copied from the returned HTTP(S) `deeplink_url`; use `type: "generic"` when no such link is returned. Place the returned `embed_token` in the reply. Do not duplicate the class list in plain text. If there are no classes, say so; if widget creation fails, use concise Markdown bullets with title, instructor, and duration. Do not print class IDs or image CDN URLs as text.
4. For other class browsing commands, use the same list presentation with `body.classes[]`. Use raw provider arrays only for requested debugging. Do not construct class URLs yourself.
5. Use the CLI-provided `duration_minutes` field for displaying class duration.
6. For live classes, default to a 7-day window using `--days 7 --exclude-complete true`.
7. Scheduling and deleting scheduled classes may proceed from a clear, unambiguous user request without an additional confirmation.
8. Token refresh on expired-token errors is automatic. If API calls still fail after auto-refresh, re-check `peloton status` and re-link if needed.
