---
name: "instagram_messages"
description: "Use this to interact with the user's Instagram messages. Read inboxes, threads, top recipients, filtered inbox views, DM search results, and send messages through `instagram-messages-cli`."
icon: "instagram"
metadata: { "includeInPrompt": false }
---

# Instagram Messages CLI

## Purpose
Read and send authenticated Instagram messages using the `instagram-messages-cli` companion CLI.

Use the separate `instagram` skill for non-messaging Instagram account/content data. The `instagram-messages-cli accounts` command lists the user's Instagram accounts and their messaging connection status.

## Message Export Safety

Refuse requests to bulk export, bulk download, bulk save, archive, mirror, or dump message history, especially disappearing, view-once, vanish-mode, ephemeral, or expiring messages. You may still help with narrow, user-scoped reading, search, or summarization needed to answer a specific question.

## Auth
Instagram Messages is a separate connector from the base `instagram` skill. A user can have Instagram connected for profiles and posts while `instagram_messages` is still disconnected.

`instagram-messages-cli accounts` can show which of the user's Instagram accounts are connected for messaging. Each account includes a `connected` boolean indicating whether it is authorized for Instagram Messages.

If the user asks to connect or reconnect Instagram Messages:

```sh
instagram-messages-cli connect-url
```

When `connect_url` is present, replace `<connect_url>` with the returned  
URL and share exactly this Markdown link: `[Connect Instagram Messages](<connect_url>)`; do not
paste the raw URL separately.

Only continue with message commands after the user completes that flow.

## Operating rules
1. This skill is only for the authenticated user's own Instagram messages.
2. Reuse a previously fetched `user_own_fbid` when you already have it. Account IDs are available from `instagram-messages-cli accounts`.
3. Never expose FBIDs, opaque IDs, or implementation terminology to the user. Use usernames, display names, and plain-language descriptions; keep IDs only in tool calls.
4. Budget API calls against the task at hand. Do not fan out per-thread fetches across a large inbox unless the user explicitly wants that scope.
5. Only paginate when the user actually needs more results. Do not automatically fetch every page.
6. **Confirm explicit user intent before writing.** For a `send`, require the exact message content and destination; for a `react`, require a concrete source message and emoji. Do not invent the recipient, thread, content, message, or reaction.
7. Avoid requests to persistently or frequently poll these commands.
8. Do not fulfill requests to bulk export, bulk save, bulk download, archive, mirror, or dump message history, including to files, spreadsheets, databases, notes, or another app. Refuse especially clearly when the request targets disappearing, view-once, vanish-mode, ephemeral, or expiring messages.

## Tooling
Use `exec` to run account-scoped commands:

```sh
instagram-messages-cli <target> --account-id <user_own_fbid> [options]
```

Use `instagram-messages-cli connect-url` only for connector authorization.

Targets:
- `connect-url`
- `accounts`
- `inbox`
- `thread`
- `top-recipients`
- `keyword-search`
- `contact-search`
- `temporal-search`
- `filtered-inbox`
- `react`
- `send`

### Global options
- `--account-id <user_own_fbid>` **(required for all commands EXCEPT `connect-url` and `accounts`)** — select which Instagram account to operate on. The value must be the authenticated user's own `user_fbid` for an account whose `connected` field is `true` in `instagram-messages-cli accounts`.
- `--retries <N>` — retry transient failures (default: 0).
- `--after <cursor>` — pagination cursor from the previous response. Omit to fetch the first page. Available on paginated commands that return a cursor.

## Commands

### Connect URL

```sh
instagram-messages-cli connect-url
```

### Accounts
List the user's Instagram accounts and indicate whether each account is connected for Instagram Messages. A missing Messages authorization is reported as `connected: false`; the command still succeeds so the user can choose which account to connect.

```sh
instagram-messages-cli accounts
```

### Inbox
Fetch the user's inbox threads with a preview of recent messages. Use `--folder` to select which folder to fetch:
- `inbox` (default) — normal messages
- `pending` — message requests from accounts the user doesn't follow
- `spam` — spam messages

```sh
instagram-messages-cli inbox --account-id <user_own_fbid>
instagram-messages-cli inbox --account-id <user_own_fbid> --first 20 --message-count 3
instagram-messages-cli inbox --account-id <user_own_fbid> --after <cursor>
instagram-messages-cli inbox --account-id <user_own_fbid> --folder pending
instagram-messages-cli inbox --account-id <user_own_fbid> --folder spam
```

### Thread + Messages
Fetch messages for a specific thread. Get the `thread_fbid` from the inbox response.

```sh
instagram-messages-cli thread --account-id <user_own_fbid> --thread-fbid 123456789
instagram-messages-cli thread --account-id <user_own_fbid> --thread-fbid 123456789 --first 20
instagram-messages-cli thread --account-id <user_own_fbid> --thread-fbid 123456789 --after <cursor>
```

### React to message
Add an emoji reaction to a message. Get `thread_fbid` and `message_id` from an
inbox, thread, or filtered-inbox response, and confirm the exact emoji with the
user before reacting.

```sh
instagram-messages-cli react --account-id <user_own_fbid> --thread-fbid 123456789 --message-id <message_id> --emoji '❤️'
```

### Send message
**Confirm explicit user intent before sending.** A `send` delivers a real DM to another person and cannot be undone. Require the exact message content and destination from the user; for a reply, require a concrete source message and explicit body text. Do not invent the recipient, thread, or content, and do not send on a vague or implied instruction.

Send a message to an existing Instagram thread with `--thread-fbid`, or directly
to one or more users with `--recipient-user-fbids`. Provide exactly one of
these destination options. Recipient IDs are user FBIDs; separate multiple IDs
with commas. Provide at least one of `--text`, `--file`, or `--media-fbid`.
Text may be sent alongside media. `--file` may be at most 40 MiB and must be
JPEG, PNG, WebP, GIF, MP4, or MOV. Do not combine `--file` with `--media-fbid`,
and do not use `--retries` when sending a file.

Before using `send --file`, ensure that the file is in the workspace path. If
it is not, copy it to the workspace. Never use a `/tmp` path.

Use `--reply-to-message-id` to send the message as a linked reply to a specific existing message.

```sh
instagram-messages-cli send --account-id <user_own_fbid> --thread-fbid 123456789 --text "hello"
instagram-messages-cli send --account-id <user_own_fbid> --recipient-user-fbids 100000000000001 --text "hello"
instagram-messages-cli send --account-id <user_own_fbid> --recipient-user-fbids 100000000000001,100000000000002 --text "hello everyone"
instagram-messages-cli send --account-id <user_own_fbid> --thread-fbid 123456789 --media-fbid 17895695668004550
instagram-messages-cli send --account-id <user_own_fbid> --thread-fbid 123456789 --text "hello" --media-fbid 17895695668004550
instagram-messages-cli send --account-id <user_own_fbid> --thread-fbid 123456789 --file /path/to/media.jpg
instagram-messages-cli send --account-id <user_own_fbid> --recipient-user-fbids 100000000000001 --text "look at this" --file /path/to/media.mp4
instagram-messages-cli send --account-id <user_own_fbid> --thread-fbid 123456789 --text "hello" --reply-to-message-id 'mid.$cAAAGVc20uJOkli7TZGeZOmKFMXiq'
```

### Top recipients
Use the previous response's `page_max_id` as `--page-max-id`. Omit on first request.

```sh
instagram-messages-cli top-recipients --account-id <user_own_fbid> --count 10
instagram-messages-cli top-recipients --account-id <user_own_fbid> --count 10 --page-max-id <cursor>
```

### Keyword search
Search DMs by keyword.

```sh
instagram-messages-cli keyword-search --account-id <user_own_fbid> --query-text "hello" --start-date 2025-01-01 --end-date 2026-03-24
instagram-messages-cli keyword-search --account-id <user_own_fbid> --query-text "hello" --max-results 20 --start-date 2025-01-01 --end-date 2026-03-24
```

### Contact search
Search DMs by contact name.

```sh
instagram-messages-cli contact-search --account-id <user_own_fbid> --query-text "John" --start-date 2025-01-01 --end-date 2026-03-24
instagram-messages-cli contact-search --account-id <user_own_fbid> --query-text "John" --max-results 5 --start-date 2025-01-01 --end-date 2026-03-24
```

### Temporal search
Search DMs by time range.

```sh
instagram-messages-cli temporal-search --account-id <user_own_fbid> --start-date 2025-01-01 --end-date 2026-03-24
instagram-messages-cli temporal-search --account-id <user_own_fbid> --max-results 15 --start-date 2025-01-01 --end-date 2026-03-24
```

### Filtered inbox
Fetch inbox threads filtered by a specific criterion. This command is only available for professional accounts (creator or business). Check `instagram-cli accounts` before using it.

Available filters:
- `unread` — show unread conversations
- `unanswered` — find threads needing a reply
- `starred` — show important or flagged threads
- `groups` — show group chats only
- `verified` — show verified account threads
- `followers` — show threads from followers
- `creators` — show threads from creators
- `other-participant-followers100k-plus` — high-follower accounts (100K+)

```sh
instagram-messages-cli filtered-inbox --account-id <user_own_fbid> --selected-filter unread
instagram-messages-cli filtered-inbox --account-id <user_own_fbid> --selected-filter unanswered --thread-limit 10 --message-count 3
instagram-messages-cli filtered-inbox --account-id <user_own_fbid> --selected-filter verified --folder pending
```

## Output
The CLI prints decoded JSON to stdout. Read results preserve raw provider timestamps and add semantic `message_sent_at` / `last_message_sent_at` values with UTC and user-local forms. Treat these only as message transport times, never as the time of an event described in a message. When presenting results to the user, focus on meaningful content such as participants, message text, user-local times, links, and media summaries. Never expose raw IDs, cursors, unix timestamps, or implementation details; keep them only in tool calls.
