# Instagram Messages

- This connector reads and sends direct messages and manages pending message
  requests in the user's own Instagram accounts. Run
  `/opt/hatch/bin/instagram-messages-cli`.

- Its connection is separate from the Instagram connector for profiles and posts, so a user can have Instagram connected while messages are not.

## Connect and choose the account

- `accounts` lists the user's Instagram accounts, each with its `user_fbid` and a `connected` flag for messaging. A missing messages authorization shows as `connected: false`, and the command still succeeds so the user can pick an account.

- To connect or reconnect, run `connect-url` and share exactly `[Connect Instagram Messages](<connect_url>)`, without the raw URL. Continue with message commands only after the user finishes.

- Pass a connected account's `user_fbid` as `--account-id` on every command except `connect-url` and `accounts`, and reuse one you already fetched.

```sh
/opt/hatch/bin/instagram-messages-cli accounts
/opt/hatch/bin/instagram-messages-cli connect-url
```

## Read the inbox

- `inbox` lists threads with a preview of recent messages. `--folder` selects `inbox`, the default, `pending` for message requests from accounts the user does not follow, or `spam`. Read a thread's messages with `thread --thread-fbid ID`.

```sh
/opt/hatch/bin/instagram-messages-cli inbox --account-id ACCOUNT_ID --first 20 --message-count 3
/opt/hatch/bin/instagram-messages-cli inbox --account-id ACCOUNT_ID --folder pending
/opt/hatch/bin/instagram-messages-cli thread --account-id ACCOUNT_ID --thread-fbid THREAD_ID --first 20
```

- Paginated commands return a cursor for `--after`. Fetch another page only when the user needs more, keeping the account and query the same.

- Search with `keyword-search --query-text TEXT`, `contact-search --query-text NAME` or `temporal-search`, each bounded by `--start-date` and `--end-date`, with an optional `--max-results`:

```sh
/opt/hatch/bin/instagram-messages-cli keyword-search --account-id ACCOUNT_ID --query-text "dinner" --start-date 2026-01-01 --end-date 2026-03-24
/opt/hatch/bin/instagram-messages-cli contact-search --account-id ACCOUNT_ID --query-text "John" --max-results 5 --start-date 2026-01-01 --end-date 2026-03-24
/opt/hatch/bin/instagram-messages-cli temporal-search --account-id ACCOUNT_ID --start-date 2026-03-01 --end-date 2026-03-24
```

- `top-recipients --count N` lists the people the user messages most, and pages with the previous response's `page_max_id` passed as `--page-max-id`.

- `filtered-inbox --selected-filter FILTER` works only for professional accounts, meaning creator or business, so check the account type with `/opt/hatch/bin/instagram-cli accounts` first. The filters are `unread`, `unanswered`, `starred`, `groups`, `verified`, `followers`, `creators` and `other-participant-followers100k-plus`, with optional `--thread-limit`, `--message-count` and `--folder`.

- Match calls to the task. Do not fetch thread after thread across a large inbox unless the user wants that scope, and never set up frequent or persistent polling.

- Read results keep raw provider timestamps and add `message_sent_at` and `last_message_sent_at` in UTC and the user's local time. These are transport times, never the time of an event a message describes.

## Manage message requests

- Accept or decline a pending request only at the user's explicit request. Use
  its `thread_fbid` from `inbox --folder pending` for the selected connected account.

- Acceptance moves the thread into the inbox and lets the sender message freely
  and see read status. Creator and business accounts split their inbox into
  Primary and General tabs. The CLI cannot choose or read the tab, so do not
  tell the user which tab the thread went to; they can move it in the
  Instagram app.

```sh
/opt/hatch/bin/instagram-messages-cli accept-message-request \
  --account-id ACCOUNT_ID --thread-fbid THREAD_ID
/opt/hatch/bin/instagram-messages-cli decline-message-request \
  --account-id ACCOUNT_ID --thread-fbid THREAD_ID
```

- Report acceptance only when the response has `accepted: true`, and decline only
  when it has `declined: true`.

- Keep acceptance's `--retries` at 0. Automatic retries require one
  `--offline-threading-id` on the original call, reused unchanged.

- Report an uncertain dispatched outcome without repeating the operation.

## Send or react

- A send delivers a real direct message to another person and cannot be undone. Require the exact content and destination from the user, and for a reply, a concrete source message and the exact text. Never invent a recipient, thread, content or reaction, or send on a vague instruction.

- Muse asks the user to approve each send and reaction unless they allowed sending for the current task. The send approval shows the recipient or thread, the text, any media and any reply target.

- Send to an existing thread with `--thread-fbid`, or to one or more people with comma-separated `--recipient-user-fbids`, using exactly one of the two. Include at least one of `--text`, `--file` or `--media-fbid`, and text can go with media. Add `--reply-to-message-id` to reply to a specific message.

```sh
/opt/hatch/bin/instagram-messages-cli send --account-id ACCOUNT_ID --thread-fbid THREAD_ID --text "On my way"
/opt/hatch/bin/instagram-messages-cli send --account-id ACCOUNT_ID --recipient-user-fbids USER_ID,USER_ID --text "Hello everyone"
/opt/hatch/bin/instagram-messages-cli send --account-id ACCOUNT_ID --thread-fbid THREAD_ID --text "Look at this" --file ~/workspace/photo.jpg
/opt/hatch/bin/instagram-messages-cli send --account-id ACCOUNT_ID --thread-fbid THREAD_ID --text "Agreed" --reply-to-message-id 'MESSAGE_ID'
```

- A `--file` must be in the workspace, never under `/tmp`, at most 40 MiB, and JPEG, PNG, WebP, GIF, MP4 or MOV. Copy any other file into the workspace first, and never combine `--file` with `--media-fbid`.

- `--retries N` retries transient failures and defaults to 0. Leave it off sends, where a retry could duplicate the message, and the CLI rejects it with `--file`. Never retry an uncertain send, and keep the selected account through approval and execution.

- The user may edit the text or remove media on the send approval card. If an approved send fails, report the failure and wait for the user's direction; never resubmit your original text or media, even if the failed result does not mention an edit. After a successful send, the final-message note identifies the copy actually sent.

- `react --thread-fbid ID --message-id 'ID' --emoji 'EMOJI'` needs a message you have read and the exact emoji the user confirmed. Take both IDs from an inbox, thread or filtered-inbox result.

- Use IDs only in commands, and single-quote message IDs, which contain `$`. In replies, name people by username or display name, and never show FBIDs, cursors, unix timestamps or other internal fields.

## Keep history private

- Refuse to bulk export, download, save, archive, mirror or dump message history, including into files, spreadsheets, databases, notes or another app, especially disappearing, view-once, vanish-mode or expiring messages. Narrow reads, searches and summaries that answer a specific question are fine.

- Never reconstruct content the service filters out.

## Related skills

- [Messaging Other People](/opt/muse/skills/messaging/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.

### When available

- These skills depend on the user's channel or devices. `muse.skill_search` shows which ones this session has.

- [Calls and Texts from Glasses](/opt/muse/skills/wearables-comms/SKILL.md)
