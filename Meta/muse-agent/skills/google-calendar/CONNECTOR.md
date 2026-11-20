# Google Calendar

- Google Calendar reaches the user's Google calendars through `/opt/hatch/bin/hatch_gws_cli calendar <command>`. Commands below omit that prefix.

- Raw API calls name the resource and method as separate words, such as `events list`, with query and path values as JSON in `--params` and a request body in `--json`. Before using a method you are unsure of, read its inputs with `/opt/hatch/bin/hatch_gws_cli schema calendar.events.insert`, or the matching name, and a command's flags with `--help`.

- Use returned IDs unchanged, and never invent or rewrite an event or calendar ID.

## Connect

- Run `status`. When it is not connected and returns a `connect_url`, post it as `[Connect Google Calendar](<connect_url>)`, then stop and wait for the user to tap it. Connecting is the user's step, so never open the sign-in yourself, send the user to Settings or ask for credentials.

- If `status` fails, or reports not connected without a URL, say Google Calendar is not available right now and stop.

- To disconnect, run `disconnect` and post `[Disconnect Google Calendar](<disconnect_url>)` only when it returns that URL. Otherwise run `status` again and report its state without inventing a link.

- When a later command fails with an authentication or not-connected error, run `status` again. Post the connect link if it is not connected, retry once if it is connected, and stop if `status` itself fails. Never write credential files or run raw `gws auth`.

## Choose the account

- Commands use the default account, so most tasks need nothing extra. When the user means one of several accounts, run `accounts`, match their words to one `display_name` and add `--account <account_id>` to every command for that account.

- Ask which account when you cannot match exactly one. A wrong or unlinked `--account` fails with "account may not be linked", so confirm the account rather than retrying on the default.

- To link another account, post the `add_account_url` from `status` as `[Add Google Calendar account](<add_account_url>)`. Never reuse `connect_url` for this, and if `add_account_url` is absent, say that adding another account is not available.

- To remove one account and keep the others, direct the user to that account under Connectors in Settings rather than disconnecting Google Calendar entirely.

## Add access to a connected account

- When Google returns `403`, `insufficientPermissions` or "insufficient authentication scopes", run `status --for-command <command-or-method>` with the same `--account`. `commands` lists the command and permission keys it accepts.

- When `scope_status` is `not_granted`, post `scope_add_url` exactly as `[Additional Google Calendar access](<scope_add_url>)` and tell the user to choose the same account on Google's consent screen. Never substitute `add_account_url`, which links a new account instead, and wait for consent before retrying.

## Read the agenda

- Use `+agenda` for any read-only "what's on my calendar" or multi-day summary. It reads every visible calendar.

```text
+agenda --today --format json
+agenda --tomorrow --format json
+agenda --week --format json
+agenda --days 3 --calendar '<name-or-id>' --format json
```

- `--today` and `--tomorrow` cover whole days, while `--week` and `--days N` start now and run 7 or N days ahead. Days follow the Google account's timezone, so add `--timezone <IANA zone>` when the user is somewhere else.

- `+agenda` reads at most 50 events from each calendar and leaves out any calendar it could not read. For a long or busy window, or a calendar that seems missing, use `events list` on that calendar and pass each `nextPageToken` back as `pageToken` until none remains.

- Trust the events `+agenda` returns for the window you asked for, and get "today" and "tomorrow" right against the current date.

## Look up calendars, events and free time

```text
calendarList list
events list --params '{"calendarId":"primary","timeMin":"<RFC3339>","timeMax":"<RFC3339>","singleEvents":true,"orderBy":"startTime"}'
events get --params '{"calendarId":"<calendar-id>","eventId":"<event-id>"}'
freebusy query --json '{"timeMin":"<RFC3339>","timeMax":"<RFC3339>","items":[{"id":"primary"}]}'
```

- Use `calendarList list` to name the connected calendars or target one by name. Use `events list` instead of `+agenda` when you need one calendar, fields `+agenda` leaves out or event IDs, and keep `singleEvents` so each occurrence of a recurring event appears on its own date.

- Use `freebusy query` to check whether a time is free. It is refused while the user's Access events permission is set to ask or deny, so then use `events list`, which asks the user when needed, or explain the restriction.

- Describe attendee responses in plain words, such as accepted, declined, maybe or no reply yet, never as raw values like `needsAction`.

- Returned timed events add `event_starts_at` and `event_ends_at`, and recurring instances add `event_original_starts_at`, each in UTC and user-local forms. Prefer `user_local` in replies, and keep all-day dates as dates without shifting them between timezones. In `+agenda` output an all-day event carries `all_day: true` and its exclusive end date as `end_exclusive`.

## Create, change or delete an event

```text
events insert --params '{"calendarId":"primary"}' --json '{"summary":"Focus block","start":{"dateTime":"2026-04-16T14:00:00-07:00"},"end":{"dateTime":"2026-04-16T15:00:00-07:00"}}'
events insert --params '{"calendarId":"primary"}' --json '{"summary":"Offsite","start":{"date":"2026-04-17"},"end":{"date":"2026-04-18"}}'
events patch --params '{"calendarId":"<calendar-id>","eventId":"<event-id>","sendUpdates":"all"}' --json '{"location":"Room A"}'
events delete --params '{"calendarId":"<calendar-id>","eventId":"<event-id>","sendUpdates":"all"}'
```

- Timed events use RFC3339 `dateTime` values with an offset. All-day events use `date` values with an exclusive end, so a one-day event ends on the next date, and one event never mixes the two.

- Add guests as `"attendees":[{"email":"<address>"}]`, and a `location` or `description`, to the body as needed.

- A hold, block or focus event must show as busy, so leave `transparency` unset or set it to `opaque`. Use `transparent` only when the user wants the time to read as free.

- Carry the account, calendar ID and event ID from the read that found the event into the write. `primary` is the default only when the user names no other calendar and no read has located the event on another one.

- `events patch` changes only the fields you send, but an array replaces the whole list. To add or remove a guest, read the event and send the complete attendee list with the change applied, and when moving an event, send both `start` and `end` so its duration stays the same.

- `events instances` lists a recurring event's occurrences. Patch an occurrence's own ID to change just that one, or the recurring event's ID to change the whole series.

- `+insert --summary '<title>' --start <RFC3339> --end <RFC3339>` creates a simple timed event on `primary` or `--calendar <id>`, and `--meet` adds a Google Meet link. It cannot make all-day events or notify guests, so use `events insert` for those.

- For a Meet link through `events insert`, add `"conferenceDataVersion":1` to `--params` and `"conferenceData":{"createRequest":{"requestId":"<unique-id>","conferenceSolutionKey":{"type":"hangoutsMeet"}}}` to the body.

## Notify guests

- Whenever an event has attendees before or after a write, add `"sendUpdates":"all"` to `--params`. This covers creating an event with guests, adding the first guest, changing the time, place, title, description, recurrence or video link, and deleting, which sends each guest a cancellation.

- If the user asks not to notify anyone, explain that `"sendUpdates":"none"` can keep the change from reaching guests' calendars, and confirm before using it.

## Confirm before writing

- Creating, changing or deleting a private event with no guests can proceed from a clear request without another confirmation.

- Creating an event with guests, any change or deletion that notifies guests, and calendar sharing or access changes need confirmation first. Restate the event, the time with its timezone, the guests and the notification effect.

- Creating, deleting, clearing, unsubscribing from or transferring a whole calendar also needs confirmation first. Name the calendar and the effect, such as `calendars clear` erasing every event on it.

- Creating an event with guests, and any change that notifies guests or sends an attendee list, normally also asks the user on an approval card. Settings cannot grant a standing Allow for these, though a card that names a single guest can let the user always allow that guest. Deleting an event raises no card by default, so your confirmation is the only check before guests get a cancellation.

- After a write, read the event back and report its final local time and guests. If the result is uncertain, read the calendar before trying again so you never create a duplicate.

## Request limits

- Calendar calls share a per-minute request quota. A result with `kind: connector_rate_limited` and `terminal_for_attempt: true` ends calendar work for this attempt, so report partial progress and leave the rest for a later run.

## Report results

- Talk in plain language. Keep commands, status words such as `not_connected`, event and calendar IDs, etags, page tokens and raw JSON out of replies unless the user asks for them.

- Name an account by its display name or email only when you need to say which one you mean. Never print tokens or credential material, and redact any that appear in output.

## Related skills

- [Flight Booking](/opt/muse/skills/flight-booking/SKILL.md)

- [Home Search](/opt/muse/skills/home-search/SKILL.md)

- [Meeting Notes and Follow-ups](/opt/muse/skills/meeting-follow-up/SKILL.md)

- [Mortgage Comparison](/opt/muse/skills/mortgage-comparison/SKILL.md)

- [Scheduling](/opt/muse/skills/scheduling/SKILL.md)

- [Trip Planning](/opt/muse/skills/trip-planning/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
