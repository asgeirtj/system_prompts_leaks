---
name: "outlook_calendar"
description: "View, create, update, and delete events in the user's Outlook Calendar."
icon: "outlook_calendar"
metadata: { "includeInPrompt": false }
---

# Outlook Calendar

## Purpose
Manage Outlook Calendar events with the `outlook-calendar` companion CLI. The
connector supports both personal Microsoft accounts and Microsoft 365 work or
school accounts.

## Tooling
Use `exec` to run the installed CLI directly from `PATH`.

```sh
outlook-calendar --status
outlook-calendar disconnect
outlook-calendar list --page-size 10 [--time-min <RFC3339>] [--time-max <RFC3339>] [--query <text>] [--page-token <token>]
outlook-calendar get "<event_id>"
outlook-calendar create --summary "<title>" --start "<RFC3339-or-date>" --end "<RFC3339-or-date>" --timezone "<iana_tz>" [--attendee <email>] [--location <text>] [--description <text>] [--all-day]
outlook-calendar update "<event_id>" [--summary <title>] [--start <RFC3339>] [--end <RFC3339>] [--timezone <iana_tz>] [--location <text>] [--description <text>]
outlook-calendar delete "<event_id>"
```

For `list`, use `--page-size` for result count. `--top`, `--limit`, and
`--max-results` are compatibility aliases only; do not use them in new
commands. `list` uses `--time-min` / `--time-max` for time bounds. `--start`
and `--end` are canonical only for `create` / `update`; `list` accepts them
only as compatibility aliases.

JSON output contract:
- `disconnect`: parse `ok`, `action`, `status`, and `disconnect_url`.
- `list`: parse `ok`, `count`, `next_page_token` (when present, pass back as `--page-token`), `retrieved_at`, and `events[]` with fields such as `id`, `summary`, `description`, `start`, `end`, `event_starts_at`, `event_ends_at`, `location`, `is_all_day`, and `attendees`.
- `get`: parse `ok`, `retrieved_at`, and `event`.
- `create` / `update`: parse `ok`, `action`, `event_id`, and `web_link`.
- `delete`: parse `ok`, `action`, and `event_id`.

## Auth
This skill uses the CLI-managed Outlook connector. Do not hand-write auth files.

First-use or reconnect flow:
1. Run `outlook-calendar --status`.
2. If the response includes `connect_url`, replace `<connect_url>` with the returned URL and share exactly this Markdown link: `[Connect Outlook Calendar](<connect_url>)`; do not paste the raw URL separately. Wait for the user to finish linking.
3. Re-run the same status command before continuing.
4. If the response includes `disconnect_url`, the account is already connected.

For disconnect requests, run `outlook-calendar disconnect`. When `disconnect_url` is present, replace `<disconnect_url>` with the returned URL and share exactly this Markdown link: `[Disconnect Outlook Calendar](<disconnect_url>)`; do not paste the raw URL separately. If it is absent, say the account is already disconnected.

## Operating Rules
1. Use `list` first when you need an event ID or when the user asks about a date range.
2. All timed values must be RFC3339 / ISO 8601. Use date-only values only with `--all-day`.
3. Always supply a valid IANA timezone on `create`, and on `update` whenever start or end times change.
4. Confirm with the user before creating an event that sends invitations.
5. Private event updates may proceed from a clear user request. The helper reads
   the current event before updating it; organizer-owned meetings with attendees
   require confirmation because Outlook sends meeting-update email.
6. The current helper does not support attendee changes on `update`. If the user asks to add or remove invitees on an existing event, explain that limitation instead of emitting an unsupported `--attendee` flag.
7. `delete` may proceed from a clear, unambiguous user request without an additional confirmation.
8. Event IDs are opaque Graph values. Reuse the exact `id` returned by `list` or `get`.
9. Never use the shared connector helper CLI for Outlook Calendar; status and linking must go through `outlook-calendar --status`.
10. Never surface raw Graph identifiers (event ids, calendar ids) or other internal response fields (change keys, page/skip tokens, raw JSON) in text shown to the user — including in summaries, lists, or per-item annotations. Reuse the ids only internally to chain follow-up commands (rule 8). The sole exceptions are when the user explicitly asks for a raw id or you must show one to troubleshoot a failure.
11. For timed events, prefer `event_starts_at.user_local` and `event_ends_at.user_local`; the raw Graph fields remain for compatibility. All-day values are calendar dates, not instants, and must not be timezone-shifted.
- Permission-withheld fields: a `list` result carrying a `withheld` entry had
  organizer and attendees removed by the user's "Access events" permission —
  the meeting is NOT guest-less. Answer from the remaining fields and mention
  that the permission hides the guest list. Only when the user actually needs
  a withheld field for one specific event and `withheld.reason` is
  `requires_approval`, read that event with `get`, which shows the user the
  approval prompt. Never `get` during routine browsing just to fill guest
  lists.
