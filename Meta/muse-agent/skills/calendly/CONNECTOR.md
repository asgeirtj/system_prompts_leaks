# Calendly

- Calendly holds the user's own booking links, event types and booked meetings. Use `/opt/hatch/bin/calendly`, which reaches the account the user connects through Muse.

- Commands below omit the `/opt/hatch/bin/calendly` prefix. Every command prints JSON with a top-level `ok`.

## Connect

- Run `status`. When it is not connected, run `authorize-url` and share the returned `connect_url` exactly as `[Connect Calendly](<connect_url>)`, without pasting the raw URL.

- After the user connects, run `me` to verify the account. Its `body.resource` carries the user's `uri`, `current_organization`, `timezone` and `scheduling_url`, which is their main booking page.

- Tokens refresh automatically. If calls keep failing with authentication errors, run `status` again and reconnect when needed, and never print access or refresh tokens.

- `disconnect` deletes the stored connection immediately and returns `removed`. Run it only when the user asks to disconnect Calendly.

## Read booking links and meetings

```text
me
event-types --user-uri <user-uri> [--active true] [--count 20] [--page-token <token>]
list-events --user-uri <user-uri> [--status active] [--min-start-time <UTC time>] [--max-start-time <UTC time>] [--count 20] [--page-token <token>]
```

- `me`, `event-types`, `list-events` and `request` return `ok`, the HTTP `status` and Calendly's `body`. A failed call still prints JSON, so check `ok` before using the body.

- Lists sit in `body.collection`. Pass `body.pagination.next_page_token` as `--page-token` until it is null, with `--count` from 1 to 100.

- Each event type's `scheduling_url` is the link invitees use to book it. `--status` filters booked meetings to `active` or `canceled`, and start-time bounds use UTC.

- Read results add `event_starts_at` and `event_ends_at` in UTC and user-local forms and a `retrieved_at` time. Prefer the user-local times in replies.

## Other operations

- `request --method <METHOD> --path <path> [--query <key=value> ...] [--json-body '<json>']` reaches the rest of Calendly's API. GET requests are reads, while POST, PUT, PATCH and DELETE are changes that need the user's approval.

```text
request --method GET --path /scheduled_events/<uuid>
request --method GET --path /scheduled_events/<uuid>/invitees
request --method GET --path /event_type_available_times --query 'event_type=<event-type-uri>' --query 'start_time=<UTC time>' --query 'end_time=<UTC time>'
request --method POST --path /scheduling_links --json-body '{"max_event_count":1,"owner":"<event-type-uri>","owner_type":"EventType"}'
request --method POST --path /scheduled_events/<uuid>/cancellation --json-body '{"reason":"<reason>"}'
```

- A meeting's UUID is the last part of its `uri`. Open times need a start in the future, and a single-use scheduling link returns its `booking_url`.

- Confirm with the user before cancelling a meeting, deleting anything or making any other change that invitees will see. Calendly can refuse with 403 when the plan or this connection does not allow an operation, so report that rather than retrying.

- Reading an event type or its open times never books anything.

## Related skills

- [Scheduling](/opt/muse/skills/scheduling/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
