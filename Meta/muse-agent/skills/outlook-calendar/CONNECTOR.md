# Outlook Calendar

- Outlook Calendar reaches the user's personal Microsoft calendars and Microsoft 365 work or school calendars through `/opt/hatch/bin/outlook-calendar`.

- Commands below omit the `/opt/hatch/bin/outlook-calendar` prefix. Each prints JSON with `ok`, and `--timeout-secs` sets the request timeout, 30 seconds by default.

## Connect

- Run `--status`. When it returns `connect_url`, share exactly `[Connect Outlook Calendar](<connect_url>)` without pasting the raw URL, wait for the user to finish, then run `--status` again. A response with `disconnect_url` means the calendar is already connected.

- To link another account, share the returned `add_account_url` as `[Add Outlook Calendar account](<add_account_url>)`. To remove one account and keep the others, direct the user to that account under Connectors in Settings.

- To disconnect Outlook Calendar entirely, run `disconnect` and share `[Disconnect Outlook Calendar](<disconnect_url>)`. Confirming there removes every account, so don't say it's disconnected yet. No `disconnect_url` means Outlook Calendar is not connected.

- Linking stays inside this CLI. Never use a shared connector helper or write authentication files.

## Choose an account

- Commands use the default account unless they carry `--account <account_id>`. When the user means a particular account, run `accounts`, match its `display_name` and pass that `account_id`, and ask when the match is ambiguous.

- Repeat that `--account` on every follow-up, including `--page-token` pages, `get`, `update` and `delete`. Event IDs and page tokens belong to the account that returned them.

- Never rerun a failed `--account` command without it. `--status`, `accounts` and `disconnect` cover the whole connector and reject `--account`.

## Recover access

- After an authentication failure, run `--status` and share `connect_url` if it returns one. Otherwise run `accounts` and check the selected account, or every account when the failed command had no `--account`.

- For each relevant account with `needs_reauth: true`, share the status response's `add_account_url` as `[Reconnect Outlook Calendar account](<add_account_url>)` and ask the user to sign in with that same Microsoft account. Resume with the original `--account`.

## Read events

```text
list --time-min <RFC3339> --time-max <RFC3339> [--query <text>] [--page-size 10] [--page-token <token>]
get <event-id>
```

- Use `list` to find an event and its ID before `get`, `update` or `delete`, and reuse each `id` exactly as returned.

- Pass both `--time-min` and `--time-max` for any date question. Without bounds, `list` returns events in start order from the beginning of the calendar, not the upcoming ones.

- `--query` matches event titles only. Follow `next_page_token` by passing it as `--page-token`, and set the count with `--page-size`.

- `--top`, `--limit` and `--max-results` are compatibility aliases for `--page-size`, and `--start` and `--end` for the `list` bounds, so never use them in new commands.

- `list` returns `count`, `next_page_token` and `events`, each with `id`, `summary`, `start`, `end`, `event_starts_at`, `event_ends_at`, `location`, `is_all_day`, `show_as`, `organizer`, `attendees`, `web_link` and `change_key`, which changes whenever the event does. `get` returns one `event` that adds `description`.

- Times come back in UTC, so prefer `event_starts_at.user_local` and `event_ends_at.user_local`. All-day values are calendar dates and must not be shifted between timezones.

- `show_as` tells busy from free, tentative or out of office, and each attendee carries their response. Describe both in plain words.

- A `withheld` entry means the user's Access events permission removed the organizer and attendees, so a missing guest list does not mean the meeting has no guests. When the task needs one event's guests and `withheld.reason` is `requires_approval`, read it with `get`, which asks the user. Never `get` events during routine browsing just to fill guest lists.

## Create, update or delete

```text
create --summary '<title>' --start <RFC3339> --end <RFC3339> --timezone <IANA zone> [--attendee <email>] [--location '<text>'] [--description '<text>']
create --summary '<title>' --start <YYYY-MM-DD> --end <YYYY-MM-DD> --all-day --timezone <IANA zone>
update <event-id> [--summary '<title>'] [--start <RFC3339>] [--end <RFC3339>] [--timezone <IANA zone>] [--location '<text>'] [--description '<text>']
delete <event-id>
```

- `--timezone` defaults to UTC, so always pass the event's IANA zone on `create`, and on `update` whenever the start or end changes.

- Date-only values need `--all-day` and an end date the day after the last day, and they must not be shifted between timezones.

- `--attendee` repeats, and the attendees receive invitations when the event is created.

- `update` needs at least one field to change and reads the event first. For a meeting the user organizes with attendees, it sends them an update email and asks for approval.

- `update` cannot add or remove attendees, and the connector cannot create recurring events or add a Teams meeting link. Explain those limits instead of passing unsupported flags.

- `delete` removes the event. Deleting a meeting the user organizes also sends the attendees a cancellation.

- `create` and `update` return `action`, `event_id` and `web_link`, and `delete` returns `"action":"deleted"`. Share `web_link` after a successful write.

## Confirm before writing

- Confirm before creating an event that sends invitations, and before changing or deleting a meeting that has attendees. Restate the event, the time with its timezone, the attendees and that they will be emailed.

- Creating, updating or deleting a private event can proceed from a clear request without another confirmation.

- Invitations and attendee updates normally also ask the user on an approval card each time, and Settings cannot grant a standing Allow for them.

- If a write's result is uncertain, read the event or the calendar before trying again, so you never create a duplicate.

## Report results

- Keep Graph event and calendar IDs, change keys, page tokens and raw JSON out of replies, including summaries and lists. Show an ID only when the user asks for it or you need it to troubleshoot a failure.

- Never print tokens or connector secrets.

## Related skills

- [Flight Booking](/opt/muse/skills/flight-booking/SKILL.md)

- [Home Search](/opt/muse/skills/home-search/SKILL.md)

- [Meeting Notes and Follow-ups](/opt/muse/skills/meeting-follow-up/SKILL.md)

- [Mortgage Comparison](/opt/muse/skills/mortgage-comparison/SKILL.md)

- [Scheduling](/opt/muse/skills/scheduling/SKILL.md)

- [Trip Planning](/opt/muse/skills/trip-planning/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
