# Outlook Mail

- Outlook Mail reaches the user's personal Microsoft mailboxes and Microsoft 365 work or school mailboxes through `/opt/hatch/bin/outlook-mail`. It is the user's own mail, separate from Muse Mail.

- Commands below omit the `/opt/hatch/bin/outlook-mail` prefix. Each prints JSON with `ok`, and `--timeout-secs` sets the request timeout, 30 seconds by default.

## Connect

- Run `--status`. When it returns `connect_url`, share exactly `[Connect Outlook Mail](<connect_url>)` without pasting the raw URL, wait for the user to finish, then run `--status` again.

- To link another mailbox, share the returned `add_account_url` as `[Add Outlook Mail account](<add_account_url>)`. To remove one mailbox and keep the others, direct the user to that account under Connectors in Settings.

- To disconnect Outlook Mail entirely, run `disconnect` and share `[Disconnect Outlook Mail](<disconnect_url>)`. Confirming there removes every mailbox, so don't say it's disconnected yet. No `disconnect_url` means Outlook Mail is not connected.

- Linking stays inside this CLI. Never use a shared connector helper, write authentication files or guess the connection state.

## Choose a mailbox

- Commands use the default mailbox unless they carry `--account <account_id>`. When the user means a particular mailbox, run `accounts`, match its `display_name` and pass that `account_id`. Ask when the match is ambiguous, no mailbox matches or `accounts` fails, and never fall back to the default mailbox.

- Repeat that `--account` on every follow-up, including `--page-token` pages, `get`, `reply`, `delete` and the mark commands. Message IDs and page tokens belong to the mailbox that returned them.

- Never rerun a failed `--account` command without it. `--status`, `accounts` and `disconnect` cover the whole connector and reject `--account`.

- When the user does not say which mailbox holds a message, run `accounts` first and search each linked mailbox with its own `--account`. If one cannot be searched, say it could not be checked rather than that the message does not exist, and follow Recover access for it.

## Recover access

- After an authentication failure, run `--status` and share `connect_url` if it returns one. Otherwise run `accounts` and check the selected account, or every account when the failed command had no `--account`.

- For each relevant account with `needs_reauth: true`, share the status response's `add_account_url` as `[Reconnect Outlook Mail account](<add_account_url>)` and ask the user to sign in with that same Microsoft account. Resume with the original `--account`.

## Find and read mail

```text
list [--folder <folder>] [--unread] [--page-size 10] [--page-token <token>]
search '<query>' [--folder <folder>] [--page-size 10]
get <message-id>
```

- Use `search` for a targeted lookup, `list` for browsing newest first and `get` only when you need one message's full body. Both `list` and `search` read the inbox unless `--folder` names another, such as `sentitems`, `drafts`, `junkemail` or `deleteditems`.

- `list` pages with `next_page_token`, which you pass back as `--page-token`. `search` returns a single page of up to `--page-size` results, so narrow the query instead of paging.

- Both leave out likely bulk mail, meaning messages addressed to 25 or more people, unless you add `--include-likely-spam`. In summaries, also leave out likely spam, phishing and bulk promotions unless the user asks for them, and say briefly that you filtered them.

- Use `--page-size` for the count. `--top`, `--limit`, `--max-results`, `read`, `get --id` and `search --query` are compatibility forms, so never use them in new commands.

- `list` and `search` return `count` and `messages`, each with `id`, `subject`, `from`, `to`, `date`, `message_received_at`, `preview`, `is_read` and `has_attachments`. `list` also returns `next_page_token` and `total_messages`, and `get` returns one `message` that adds `cc`, `body` and `body_type`.

- Reuse each `id` exactly as returned. `message_received_at.user_local` is when the mailbox received the message, so present it rather than `date`, which is UTC. Neither is the time of an event described in the body.

- A `withheld` entry means the user's Access messages permission removed the named fields, so a missing preview is not an empty message. When the task needs one message's content and `withheld.reason` is `requires_approval`, read it with `get`, which asks the user. Never `get` messages during routine browsing just to fill previews.

- Verification codes in results appear as a `[credential:<id>]` placeholder. Never try to recover the code.

## Send and reply

```text
send --to <address> [--to <address>] [--cc <address>] --subject '<subject>' --body '<body>' [--attachment <path>]
reply <message-id> --body '<body>' [--reply-all]
```

- `--to`, `--cc` and `--attachment` repeat, and bodies are plain text. `reply` answers the sender, and `--reply-all` also includes everyone on the original message.

- There is no BCC, forward, draft, HTML body or attachment download. When the user needs one of these, say this connector cannot do it.

## Confirm and approve

- Before `send`, confirm the recipients, subject, body and attachments with the user in the conversation. Before `reply`, confirm the reply text and whether to reply to all, which you use only when the user explicitly wants everyone included.

- `delete`, `mark-read` and `mark-unread` can proceed from a clear request without another confirmation.

- Sends and replies normally also ask the user on an approval card. Settings cannot grant a standing Allow for sending, though a scheduled task the user allowed to send can carry its own permission.

- For `send`, the card can let the user edit the subject and body or remove attachments, while the sender and recipients stay fixed. Saving an edit sends nothing. Only the user's approval sends, and it sends the latest saved copy.

- `reply` is approved exactly as prepared.

- A successful `send` returns `"action":"sent"`, plus `user_edited: true` when the user changed the message. When the output includes `Final sent message (supersedes the original request):` followed by JSON, describe that copy, and without that note the submitted subject and body were sent.

- If a send fails after approval, report the failure and wait for the user, since they may have edited the message on the card. Never resubmit your original text on your own.

- Look up Sent Items with the same `--account` only when the user asks for verification or the result is incomplete. When the outcome stays uncertain, say so and never repeat the send to check.

## Delete and mark messages

```text
delete <message-id>
mark-read <message-id>
mark-unread <message-id>
```

- `delete` moves the message to Deleted Items, where the user can still recover it, so tell them that and never describe it as permanent. The moved message gets a new `message_id`, which replaces the old one for any follow-up.

- Each command takes one message. The connector cannot move mail to other folders or empty Deleted Items.

## Report results

- Keep Graph message and conversation IDs, change keys, page tokens and raw JSON out of replies, including summaries and lists. Show an ID only when the user asks for it or you need it to troubleshoot a failure.

- Never print tokens, cookies or connector secrets.

## Related skills

- [Customer Outreach](/opt/muse/skills/customer-outreach/SKILL.md)

- [Email](/opt/muse/skills/email-management/SKILL.md)

- [Flight Booking](/opt/muse/skills/flight-booking/SKILL.md)

- [Flight Tracking](/opt/muse/skills/flight-tracking/SKILL.md)

- [Hotel Booking](/opt/muse/skills/hotel-booking/SKILL.md)

- [Meeting Notes and Follow-ups](/opt/muse/skills/meeting-follow-up/SKILL.md)

- [Trip Planning](/opt/muse/skills/trip-planning/SKILL.md)

- [Trip Transport](/opt/muse/skills/trip-transport/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.

### When available

- These skills depend on the user's channel or devices. `muse.skill_search` shows which ones this session has.

- [Deal Monitoring](/opt/muse/skills/price-tracker/SKILL.md)
