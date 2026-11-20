# Google Contacts

- Google Contacts reaches the user's Google address book through `/opt/hatch/bin/hatch_gws_cli people <resource> <method>`, with parameters as JSON in `--params` and, for creates and edits, a request body in `--json`. Commands below omit the `/opt/hatch/bin/hatch_gws_cli` prefix.

- Read a method's inputs with `/opt/hatch/bin/hatch_gws_cli schema people.people.searchContacts`, or the matching name, and a command's flags with `--help`.

- A contact's ID is an opaque `resourceName` such as `people/c1234567890`, and `people/me` is the connected account itself. Carry the `resourceName` a read returned straight into an edit or delete, and never invent one.

- This connector holds one Google account, so `accounts` and `--account` are not available.

## Connect

- Run `people status`. When it is not connected, post the exact `connect_url` as `[Connect Google Contacts](<connect_url>)` and wait for the user to connect. Never invent a URL, send the user to Settings or ask for credentials.

- To disconnect, run `people disconnect` and post its `disconnect_url` as `[Disconnect Google Contacts](<disconnect_url>)`.

- When a command reports an authentication failure or not-connected state, run `people status` again and follow the link it returns. If `status` itself fails, say Google Contacts is not available right now and stop. Never write credential files or run raw `gws auth`.

## Find a person

```text
people people searchContacts --params '{"query":"alice","readMask":"names,emailAddresses,phoneNumbers","pageSize":10}'
people people connections list --params '{"resourceName":"people/me","personFields":"names,emailAddresses,phoneNumbers","pageSize":50}'
people people get --params '{"resourceName":"people/<id>","personFields":"names,emailAddresses,phoneNumbers"}'
```

- Reads must name the fields they want. `searchContacts` takes a `readMask`, while `get` and `connections list` take `personFields`, each a comma list such as `names,emailAddresses,phoneNumbers`.

- Use `searchContacts` to look someone up by name or email, and `connections list` to browse the whole address book, passing each returned `nextPageToken` as `pageToken` until none remains. There is no `people people list` method.

- When a search finds nobody, say the person is not in the user's contacts. Never edit someone else in their place.

## Add, edit or delete a contact

```text
people people createContact --json '{"names":[{"givenName":"Alice","familyName":"Smith"}],"emailAddresses":[{"value":"alice@example.com"}],"phoneNumbers":[{"value":"+15551234567"}]}'
people people updateContact --params '{"resourceName":"people/<id>","updatePersonFields":"emailAddresses"}' --json '{"etag":"<etag>","emailAddresses":[<the full list with your change>]}'
people people deleteContact --params '{"resourceName":"people/<id>"}'
```

- A name is enough to create a contact. Add email addresses and phone numbers when the user gives them, and never fill in details they did not.

- Before an edit or delete, find the person with a search or browse and use the exact `resourceName` and `etag` that read returned.

- `updatePersonFields` names the fields being changed, and each one is replaced whole. Send the complete updated list, such as every email address the person should keep, not just the new value.

- Creating, editing and deleting a contact can proceed from a clear, unambiguous request without another confirmation. Resolve the exact person first.

- Contact groups, other contacts, which are addresses saved automatically from mail, and directory people have no tested recipe here. Check the method with `schema people.<resource>.<method>` and confirm with the user before changing any of them.

## Read results

- Results add `contact_source_updated_at` in UTC and user-local forms when Google supplies it. It records when the contact source changed, not when a personal event happened.

- Birthdays are calendar dates, so never shift them between timezones.

## Report results

- Talk in plain language. Keep commands, status words such as `not_connected`, `resourceName` values, etags, page tokens and raw JSON out of replies.

- A contact's own name, email address and phone number are what the user asked for, so keep those. Never print tokens or credential material, and redact any that appear in output.

## Related skills

- [Email](/opt/muse/skills/email-management/SKILL.md)

- [Scheduling](/opt/muse/skills/scheduling/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
