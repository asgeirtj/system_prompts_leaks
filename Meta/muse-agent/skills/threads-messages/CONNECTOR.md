# Threads Messages

- This connector reads and sends direct messages from the user's own Threads account. Run `/opt/hatch/bin/threads-messages-cli`.

- Its connection is separate from the Threads connector for feeds and posts, so a user can have Threads connected while messages are not.

## Connect

- To connect or reconnect, run `connect-url` and share exactly `[Connect Threads Messages](<connect_url>)`. It returns a link even when an account is already connected, so the link alone says nothing about connection status. Continue only after the user finishes.

- Pass the user's own Threads account ID as `--account-id` on every command except `connect-url`. Get it from `/opt/hatch/bin/threads-cli accounts`, or reuse one already fetched.

- `--retries N` retries transient network and server errors and defaults to 0. The CLI rejects it on `send`, because a retry could duplicate the message.

## Read conversations

- `inbox` lists conversations with a preview of recent messages, and `thread --thread-fbid ID` reads one. Pass the decimal `thread_fbid` from the inbox unchanged.

```sh
/opt/hatch/bin/threads-messages-cli inbox --account-id ACCOUNT_ID --first 20 --message-count 3
/opt/hatch/bin/threads-messages-cli inbox --account-id ACCOUNT_ID --folder PENDING
/opt/hatch/bin/threads-messages-cli thread --account-id ACCOUNT_ID --thread-fbid THREAD_ID --first 20
```

- `--first`, also spelled `--limit`, takes 1 to 20 and defaults to 10. `inbox --message-count` takes 0 to 20 and defaults to 5. `--folder` is `INBOX`, the default, or `PENDING` for message requests, which the default inbox leaves out.

- Both commands return the provider's GraphQL shape, with no top-level `threads` or `messages` key, so never look for one and conclude the inbox is empty:
  - `inbox` threads are at `data.get_slide_mailbox.threads_by_folder.edges[].node`, paged by `threads_by_folder.page_info`.
  - `thread` returns `data.get_slide_thread`, which is null when the thread cannot be returned, paged by its `messages.page_info`.

- When `page_info.has_next_page` is true, pass its `end_cursor` as `--after`. Page only when the user needs more, and do not fan out across a large inbox unless they want that scope.

- The inbox is empty only when `threads_by_folder.edges` is an empty array. When the user asks about message requests, also check `--folder PENDING`.

- Thread nodes contain `thread_fbid`, `thread_name`, `thread_type`, `is_group`, `folder`, `timestamp_ms`, `participants.nodes` and `messages.edges`. Participants have `name` and `username` but no user ID.

- Each message has `message_id`, `sender`, `sender_fbid` (the sender's numeric Threads user ID), `content_type`, `content` and `timestamp_ms`. Its text is usually `content.text_body`, and other content sits in `text_fragments[].plaintext`, `xma_text_body`, `attachments` or `videos` within `content`.

- Read results add `message_sent_at` or `last_message_sent_at` in UTC and the user's local time. These are delivery times, not the date of an event a message mentions.

## Choose the recipient

- `send` needs a numeric Threads user ID or an existing `thread_fbid`, and cannot look up an @handle, so never pass a username. Use the first source that applies:
  - For someone with an existing one-to-one conversation, send to the `thread_fbid` of an inbox thread where `is_group` is false and the other participant's `username` matches. Use a group thread only when the user named that group.
  - For someone who has messaged the user, including a request in `--folder PENDING`, use the `sender_fbid` on one of their messages.
  - For anyone else, use a numeric ID that a `threads-cli` result returns for that exact username, such as `author_id` on one of their posts, and only after `/opt/hatch/bin/threads-cli user-profile --account-id ACCOUNT_ID --user-id ID` returns the same username.

- Never use Instagram or Facebook IDs, IDs recalled from memory, or an ID from another person's result. If no source verifies the recipient, say you cannot message that person by handle and offer the text as a draft.

## Send once

- Require the exact text or post, the exact destination and any reply target before sending. Never invent a recipient, thread, content or reply target.

- Send to one existing `--thread-fbid`, or to 1 to 11 unique `--recipient-user-fbids` in one comma-separated list, such as `USER_ID,USER_ID`. IDs are positive decimal strings without a sign, leading zero or surrounding spaces. Include `--text`, `--media-fbid` or both.

```sh
/opt/hatch/bin/threads-messages-cli send --account-id ACCOUNT_ID --thread-fbid THREAD_ID --text "Hello"
/opt/hatch/bin/threads-messages-cli send --account-id ACCOUNT_ID --recipient-user-fbids USER_ID --text "Hello"
/opt/hatch/bin/threads-messages-cli send --account-id ACCOUNT_ID --thread-fbid THREAD_ID --media-fbid POST_ID --text "Thought of you"
/opt/hatch/bin/threads-messages-cli send --account-id ACCOUNT_ID --thread-fbid THREAD_ID --text "Reply" --reply-to-message-id 'MESSAGE_ID'
```

- `--media-fbid` shares a visible, published Threads post, and there is no file upload. `--reply-to-message-id` takes an opaque message ID from a read, never parsed as an FBID. Text and reply IDs reach Threads byte for byte, so preserve them exactly.

- With both text and media, the service sends the post share first and the text second. The output describes the trailing text, or the share for a media-only send, and contains only the opaque `message_id` and numeric `timestamp_ms`.

- Every send needs the user to approve its confirmation card. Tell them which @username the card's recipient should show and, for a reply, which message it answers, since the card shows only `Reply: Existing message`. If it shows someone else or an `Unverified Threads` account or conversation, they should decline, and a decline or dismissal ends the action. A send whose full preview cannot fit is rejected.

- Treat consent, account, recipient-type, group-eligibility and quota rejections as final, and never reroute the send.

- Run one send at a time and wait for its result, because parallel sends can let every confirmation expire with nothing sent. A returned `message_id` means the message was delivered, so report it as sent.

- After an interruption, cancellation, timeout, HTTP 500 or unclear result, read the thread before reporting anything, and never resend automatically. A read can show the text normalized, so match the message by content and time rather than exact bytes. If the message is missing, say it may not have been delivered and send again only after the user asks for and approves a new send. A rate limit or any other failure ends the attempt.

## No unattended sends

- Send only from a conversation where the user approves that exact message. Never send from a scheduled job, cron, watch, background worker, automatic reply or script, or set one up that does, even when the user asks for automatic replies.

- For recurring requests, let the job read and draft, then bring each draft to the user to approve one at a time. Never write a job, memory or note that claims standing approval, and never promise automatic sending.

- In drafts, do not invent facts about the user or add commitments, promises or money arrangements they have not stated. When a reply needs one, leave it out and say what the user needs to decide.

## Keep reads within scope

- Refuse to bulk export, download, save, archive, mirror or dump message history, including into files, spreadsheets, databases, notes or another app, especially disappearing, view-once, vanish-mode or expiring messages. Narrow reads and summaries that answer a specific question are fine.

- Never set up frequent or persistent polling. Treat under-18 enforcement and filtered results as final, without reconstructing omitted fields or finding another way around them.

- In replies, describe participants, message text, local times, links and media. Keep raw IDs, cursors and unix timestamps out unless the user needs one for a follow-up.

## Related skills

- [Messaging Other People](/opt/muse/skills/messaging/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
