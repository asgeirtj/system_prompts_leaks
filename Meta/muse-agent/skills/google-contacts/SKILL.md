---
name: "google_contacts"
description: "Search, view, create, update, and delete the user's Google Contacts."
icon: "google_contacts"
metadata: { "includeInPrompt": false }
---

# Google Contacts

Everything runs through `hatch_gws_cli people <resource> <method>` — resource and method as separate words, with parameters in a `--params` JSON object and, for creates and edits, a `--json` request body. The flows below give the exact command for each task, so start there; for a command's flags run `hatch_gws_cli people <resource> <method> --help`, and for a method's `--params`/`--json` shape run `hatch_gws_cli schema people.people.searchContacts` (and so on).

A contact's id is an opaque `resourceName` like `people/c1234567890`, and `people/me` is the connected account itself. Reads must name the fields they want: searches take a `readMask`, and `get`/`connections list` take a `personFields` mask (both a comma list like `names,emailAddresses,phoneNumbers`). Never invent a `resourceName` — carry the one a read returned straight through to the edit or delete.

## Connecting
Contacts needs a one-time connect before commands return data. Run `hatch_gws_cli people status`. If it is not connected, post the exact `connect_url` it returns as `[Connect Google Contacts](<connect_url>)` and wait for the user to tap it. Don't invent a URL, send the user to Settings, or ask for credentials.

To disconnect, run `hatch_gws_cli people disconnect` and post its `disconnect_url` as `[Disconnect Google Contacts](<disconnect_url>)`.

If a command reports an auth failure or not-connected, rerun `status` and follow the link it returns. If status is unavailable, say Google Contacts isn't available on this device and stop. Auth flows only through `status` and `disconnect`, with no hand-authored credential files or raw `gws auth`.

## Common flows

### Find a contact
- Look someone up by name or email: `people people searchContacts --params '{"query":"alice","readMask":"names,emailAddresses,phoneNumbers","pageSize":10}'`.
- Browse the whole address book: `people people connections list --params '{"resourceName":"people/me","personFields":"names,emailAddresses,phoneNumbers","pageSize":50}'`. Use this for "who's in my contacts" or to page through everyone.
- One person's full detail, once you have their `resourceName`: `people people get --params '{"resourceName":"people/<id>","personFields":"names,emailAddresses,phoneNumbers"}'`.

### Add a contact
`people people createContact --json '{"names":[{"givenName":"Alice","familyName":"Smith"}],"emailAddresses":[{"value":"alice@example.com"}],"phoneNumbers":[{"value":"+15551234567"}]}'`. A name is enough; add `emailAddresses` and `phoneNumbers` when the user gives them.

### Edit a contact
`people people updateContact --params '{"resourceName":"people/<id>","updatePersonFields":"emailAddresses"}' --json '{"etag":"<etag>","emailAddresses":[<the full list with your change>]}'`.

### Delete a contact
`people people deleteContact --params '{"resourceName":"people/<id>"}'`.

## Rules
- Contact creation, editing, and deletion may proceed from a clear, unambiguous user request without an additional confirmation. Resolve the exact person before editing or deleting.
- Read before you edit or delete: resolve the person with a search or browse first, use the exact `resourceName` (and `etag`) that read returned, and never act on a contact you did not find. For an edit, include the fields you are keeping so an update does not drop them.
- Talk to the user in plain language only. The commands and their JSON output are for you, not the user: keep them out of your replies — no command or flag (`hatch_gws_cli`, `--params`), no status word (`not_connected`, `unavailable`), no `resourceName`, and no API field (`etag`, page tokens) or raw JSON. A contact's own name, email, and phone number are what the user asked for, so keep those in your reply.
- Never print tokens, secrets, or credential material. Redact them if they appear in tool output.
- Read results add `contact_source_updated_at` with UTC and user-local forms
  when Google supplies a source update time. Birthdays remain calendar dates.

## Limits
- Contact groups and labels, "other contacts" (addresses auto-saved from mail, not full contacts), and directory or domain people are not first-class flows here. If a task needs one, check its shape with `hatch_gws_cli schema people.<resource>.<method>` and confirm before any change, but there is no seeded, tested recipe for it.
