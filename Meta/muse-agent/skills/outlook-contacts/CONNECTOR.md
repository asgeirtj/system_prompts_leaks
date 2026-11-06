# Outlook Contacts

- Outlook Contacts reaches the address books of the user's personal Microsoft accounts and Microsoft 365 work or school accounts through `/opt/hatch/bin/outlook-contacts`.

- Commands below omit the `/opt/hatch/bin/outlook-contacts` prefix. Each prints JSON with `ok`, and `--timeout-secs` sets the request timeout, 30 seconds by default.

## Connect

- Run `--status`. When it returns `connect_url`, share exactly `[Connect Outlook Contacts](<connect_url>)` without pasting the raw URL, wait for the user to finish, then run `--status` again.

- To link another account, share the returned `add_account_url` as `[Add Outlook Contacts account](<add_account_url>)`. To remove one account and keep the others, direct the user to that account under Connectors in Settings.

- To disconnect Outlook Contacts entirely, run `disconnect` and share `[Disconnect Outlook Contacts](<disconnect_url>)`. Confirming there removes every account, so don't say it's disconnected yet. No `disconnect_url` means Outlook Contacts is not connected.

- Linking stays inside this CLI. Never use a shared connector helper, write token files or guess the connection state.

## Choose an account

- Commands use the default account unless they carry `--account <account_id>`. When the user means a particular account, run `accounts`, match its `display_name` and pass that `account_id`, and ask when the match is ambiguous.

- Repeat that `--account` on every follow-up, including `--page-token` pages, `get`, `update` and `delete`. Contact IDs and page tokens belong to the account that returned them.

- Never rerun a failed `--account` command without it. `--status`, `accounts` and `disconnect` cover the whole connector and reject `--account`.

## Recover access

- After an authentication failure, run `--status` and share `connect_url` if it returns one. Otherwise run `accounts` and check the selected account, or every account when the failed command had no `--account`.

- For each relevant account with `needs_reauth: true`, share the status response's `add_account_url` as `[Reconnect Outlook Contacts account](<add_account_url>)` and ask the user to sign in with that same Microsoft account. Resume with the original `--account`.

## Find a contact

```text
search '<name, email or phone>' [--page-size 10]
list [--page-size 10] [--page-token <token>]
get <contact-id>
```

- Use `search` to find someone by name, email address or phone number, and `list` to browse with `next_page_token` passed back as `--page-token`. `search` returns a single page, so narrow the query instead of paging.

- `--top`, `--limit` and `--max-results` are compatibility aliases for `--page-size`, so never use them in new commands.

- `search` and `list` return `count` and `contacts`, `list` also returns `total_people`, and `get` returns one `contact`. Each contact has `resource_name`, `display_name`, `given_name`, `family_name`, `emails`, `phones`, `organization`, `title` and `notes` when they are set.

- The `resource_name` is the contact's ID. Use it exactly as returned.

## Create, update or delete a contact

```text
create --given-name '<first>' [--family-name '<last>'] [--email <address>] [--phone <number>] [--organization '<company>'] [--title '<job title>'] [--notes '<text>']
update <contact-id> [--given-name '<first>'] [--family-name '<last>'] [--email <address>] [--phone <number>] [--organization '<company>'] [--title '<job title>'] [--notes '<text>']
delete <contact-id>
```

- `--email` and `--phone` repeat, and phone numbers are stored as business phones.

- `update` keeps every field you leave out, but `--email` and `--phone` replace the whole list. Repeat each address or number the contact should keep.

- Each change returns `action` as `created`, `updated` or `deleted` with the `resource_name`. Check `ok` and `action` before reporting it.

- Creating, updating and deleting a contact can proceed from a clear, unambiguous request without another confirmation. Find the exact person first.

## Report results

- Keep Graph contact IDs, change keys, page tokens and raw JSON out of replies, including summaries and lists. Show an ID only when the user asks for it or you need it to troubleshoot a failure.

- Never print connector secrets or dump raw contact data unless the user asks for it.

## Related skills

- [Email](/opt/muse/skills/email-management/SKILL.md)

- [Scheduling](/opt/muse/skills/scheduling/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
