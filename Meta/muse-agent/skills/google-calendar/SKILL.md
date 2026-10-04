---
name: "google_calendar"
description: "Work with the user's Google Calendar: agenda views, event details, and scheduling changes."
icon: "google_calendar"
metadata: { "includeInPrompt": true }
---

# Google Calendar

Everything runs through `hatch_gws_cli calendar ...`. Raw API calls are space-separated (`<resource> <method>`) and take a `--params` JSON object, plus a `--json` body when creating or editing. A timed event's start/end is a `dateTime` in RFC3339 with a timezone offset, like `2026-04-16T14:00:00-07:00`; an all-day event uses a date-only `date` like `2026-04-16` instead (never mix the two on one event). Run `hatch_gws_cli calendar <command> --help` for a command's flags, and `hatch_gws_cli schema calendar.events.insert` (and so on) for a raw method's `--params` and `--json` shape before you use one you are unsure of.

## Connecting
Calendar needs a one-time connect before commands return data. Run `hatch_gws_cli calendar status`. If it comes back not connected and returns a `connect_url`, post it as `[Connect Google Calendar](<connect_url>)`, then stop and wait for the user to tap it. If no URL is returned, report that connection is unavailable and stop; never invent one. Connecting is the user's step: never open the sign-in, drive a browser to it, send the user to Settings, or ask for credentials. If status is unavailable, say Google Calendar is unavailable on this device and stop. Disconnect with `hatch_gws_cli calendar disconnect`. Post `[Disconnect Google Calendar](<disconnect_url>)` only when the command returns that URL; otherwise rerun `status` and report its state without inventing a link. If a later command fails with an auth error, missing connector, or not-connected status, rerun `status`: if not connected with a URL, post the connect link and wait; if connected, retry once; if unavailable or missing a URL, report that and stop. Auth flows only through `status` and `disconnect`. Never hand-author credential files or run raw `gws auth`.

If the user asks to add or link another Google Calendar account, run `hatch_gws_cli calendar status` and post the exact `add_account_url` it returns as `[Add Google Calendar account](<add_account_url>)`. Never reuse `connect_url` for an additional account. If `add_account_url` is absent, say that adding another account is unavailable. To remove one specific Google Calendar account while keeping the others, direct the user to that account under Connectors in Settings; do not disconnect Google Calendar entirely.

## More than one account
A user can link several Google accounts. Calendar service calls use the default account when `--account` is omitted, so most tasks need nothing extra and there is no need to list accounts first. When the user clearly means a specific one of several, list them with `hatch_gws_cli calendar accounts` (identity only, no tokens) and match their words to a `display_name`, then add `--account <account_id>` to the command. `--account` selects which linked account runs a calendar service call and which account a capability-aware `status --for-command` checks; plain `status`, `disconnect`, and `accounts` remain connector-wide lifecycle commands. If you cannot match the user's words to exactly one `display_name`, ask which account rather than guessing; a wrong or unlinked `--account` fails closed ("account may not be linked") — surface that and confirm the account, never silently retry on the default.

If Google returns `403`, `insufficientPermissions`, or "insufficient authentication scopes," run `hatch_gws_cli calendar status --for-command <command-or-method>` with the same `--account <account_id>` selection as the failed operation. When `scope_status` is `not_granted`, post the returned `scope_add_url` exactly as `[Additional Google Calendar access](<scope_add_url>)` and tell the user to choose that same account on Google's consent screen. Do not substitute `add_account_url`: that starts a new-account flow rather than adding access to the selected account. Wait for consent to finish before retrying the command.

## Common flows

### Read the agenda
`+agenda` is the default for any read-only "what's on my calendar", "what's coming up", or multi-day summary. It searches every visible calendar.
- Match the window to the question: `+agenda --today` for today, `+agenda --week` or `+agenda --days 7` for a range.
- One calendar: `+agenda --calendar <name-or-id>`.
- Add `--format json` when you need to parse the result.

### Look up calendars, events, and free time
- Which calendars exist: `calendarList list`. Use it when the user asks what calendars are connected or wants to target one by name.
- Events in a known calendar, or to get an event's ID before editing it: `events list --params '{"calendarId":"primary","timeMin":"<start>","timeMax":"<end>"}'`. Use this over `+agenda` only when you need a specific calendar, fields `+agenda` omits, or event IDs.
- One event's full detail: `events get --params '{"calendarId":"primary","eventId":"<id>"}'`.
- Whether a time is free or busy: `freebusy query --json '{"timeMin":"<start>","timeMax":"<end>","items":[{"id":"primary"}]}'`.

### Create, update, or delete events
- Create: `events insert --params '{"calendarId":"primary"}' --json '{"summary":"Focus block","start":{"dateTime":"<start>"},"end":{"dateTime":"<end>"}}'`. Add `attendees`, `location`, or `description` as needed. A block, hold, or focus event must show as busy: leave `transparency` unset or set it to `"opaque"`, never `"transparent"` (that shows the time as free) unless the user wants it to read as free. For an all-day event use date-only values instead, `"start":{"date":"2026-04-16"},"end":{"date":"2026-04-17"}`, where the end date is exclusive.
- Update: `events patch --params '{"calendarId":"primary","eventId":"<id>"}' --json '{"location":"Room A"}'`. Patch only the fields that change. A patch REPLACES a whole array, so to add or remove a guest, first read the event and send back the COMPLETE attendee list with your change applied — never send only the new guest, or you silently drop the others.
- Delete: `events delete --params '{"calendarId":"primary","eventId":"<id>"}'`.

Carry the account, calendar ID, and event ID from the read that found the event straight through the write, and use them exactly. `primary` above is only the default when the user has not pointed at another calendar; once a read locates an event on some calendar, target that same calendar and account for the update or delete — never fall back to `primary`. Never invent or rewrite an event ID.

For any create, deletion, or guest-visible change, add `"sendUpdates":"all"` to `--params` whenever attendees exist before or after the write. This includes adding the first guest, recurrence or conference changes, and time, location, title, description, or attendee changes. A deletion sent with `"sendUpdates":"all"` gives each guest a cancellation notice. If the user asks not to notify anyone, explain that `"sendUpdates":"none"` can stop the change from reaching guests' calendars, then confirm before using it.

## Rules
- Private event creation, private updates, and event deletion may proceed from a clear user request without an additional confirmation. Creating an event with guests, changing an event in a way that notifies guests, and calendar or ACL management require confirmation because event content or access changes reach other people. Before those outward-facing writes, restate the specific event, time, recipients, and notification effect.
- Commands that return the saved event in their response (such as timed-event reads, creates and updates) add `event_starts_at` / `event_ends_at`; recurring instances also add `event_original_starts_at`. Each carries UTC and user-local forms; prefer `user_local` in replies. All-day bounds remain calendar dates and must not be timezone-shifted. Trust the events `+agenda` returns for the window you asked for, and get "today" and "tomorrow" right against the current date.
- Talk to the user in plain language only. Never show raw commands, status words like not_connected or unavailable, opaque provider/event/calendar IDs, etags, page tokens or cursors, raw JSON, or other internal response fields, unless the user asks for them. You may name an account by its display name or recognizable email when you need to disambiguate which account you mean. Keep IDs and pagination cursors internally to chain follow-up commands.
- Never print tokens, secrets, or credential material. Redact them if they appear in tool output.
