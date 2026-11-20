# Messenger

- This connector works in the user's personal Messenger account and sends as the user, not as Muse. Use it only when the user asks to work with their own account.

- Run `/opt/hatch/bin/hatch_messenger_cli` through `muse.exec`, and never read local Messenger storage directly. The connector ID stays `messenger_read`, writes included.

## Choose the right feature

- Talking to Muse on Messenger is a separate side chat, described in `~/docs/chat-connections/messenger.md` and checked with `chat.connection_status`. Muse's replies there return automatically.

- Never target that side chat through this connector, by `--cid`, `--to` or an automatic reply rule, and leave it out when resolving recipients.

- This connector never delivers Muse's own reminders, monitoring or scheduled results, or status updates. Background workers return those with `muse.notify_main_agent`, and the runtime delivers them through the originating chat. An automatic reply rule is the only send that may run unattended.

- When the user asks to connect or disconnect "Messenger" without saying which feature, explain both briefly and ask.

- Messenger call history covers Messenger audio and video calls only. Native phone calls and their history belong to the paired phone.

## Connect or disconnect

- Run `check`. If the connector is not connected, run `connect-url` and share exactly `[Connect Messenger](<connect_url>)`, without the raw URL. Never collect secrets or walk the user through manual sign-in in chat, and continue with the request once they link it.

- To disconnect, run `disconnect-url` and share exactly `[Disconnect Messenger](<disconnect_url>)`. This removes access to the personal account and leaves the side chat connected.

```sh
/opt/hatch/bin/hatch_messenger_cli check
/opt/hatch/bin/hatch_messenger_cli connect-url
/opt/hatch/bin/hatch_messenger_cli disconnect-url
```

## Talk about results plainly

- Never show raw IDs (`msg_id`, `message_id`, `mid.$...`, `conversation_id`, `cid.$...`, caller or callee FBIDs, `otid`), device counts, encryption details, delivery or receipt state, raw JSON or cache statistics.

- In replies, never say sync, synced, syncing, cache, cached, widened, local data, authentication state, keys, credentials, tokens or connected hardware. Do not state how many messages were searched, read or available. Describe the result instead, such as "I checked the latest messages" or "I checked further back".

- When coverage stays incomplete, say so without naming the mechanism. After a successful change, confirm briefly, without narrating the service response or claiming the message was delivered or read.

## Commands

```sh
/opt/hatch/bin/hatch_messenger_cli sync both [--since-days N]
/opt/hatch/bin/hatch_messenger_cli sync contacts [--search "NAME"] [--limit N]
/opt/hatch/bin/hatch_messenger_cli sync threads [--since-days N] [--older N]
/opt/hatch/bin/hatch_messenger_cli sync messages --cid 'ID' [--since-days N] [--older N]
/opt/hatch/bin/hatch_messenger_cli call-logs [--limit N] [--since-timestamp MS] [--to-timestamp MS]
/opt/hatch/bin/hatch_messenger_cli contacts [--search "NAME"] [--limit N]
/opt/hatch/bin/hatch_messenger_cli threads [--limit N] [--search "NAME"] [--unread] [--folder mplace]
/opt/hatch/bin/hatch_messenger_cli messages --cid 'ID' [--limit N] [--before MS] [--after MS]
/opt/hatch/bin/hatch_messenger_cli search ["TEXT"] [--sender "NAME_OR_ID"] [--cid 'ID'] [--after MS] [--before MS] [--limit N]
/opt/hatch/bin/hatch_messenger_cli repair
```

## Refresh before claiming freshness

- Read commands use retained data, so refresh before claiming a result is current or complete. `sync both` is the normal refresh. It is incremental and fills gaps, and `--since-days N` reaches farther back.

- If `_cache.gaps` overlaps the question, repeat `sync both` until those gaps clear. If the period predates `_cache.oldest_cached_ts`, extend it with `sync both --since-days N`. For one thread, use `sync messages --cid 'ID' --older 100` instead.

- Folder filtering applies only to `threads`, never to `sync`. `--since-days` widens what is available but does not filter a later search.

## Read threads, messages and calls

- Resolve a thread before reading it. `threads --search` matches names and nicknames, so read the thread if exactly one matches and otherwise ask.

- `threads --folder mplace` lists Marketplace threads, and `--unread` narrows to unread ones. For older rows, use `messages --before MS`. For an unread catch-up, read `threads --unread`, then read the chosen thread with `messages --after` set to its read timestamp.

- `search` is literal substring matching over retained data, not semantic search. Quote multi-word queries and try other wording. Resolve an ambiguous conversation with `threads --search` before scoping by `--cid`, bound dates with `--after` and `--before`, and page back with `--before` set to the oldest timestamp for an exhaustive search.

- `message_sent_at` and `last_message_sent_at` are transport times. Never infer when an event mentioned in a message happened from them.

- `call-logs` returns the latest Messenger audio and video calls. `--limit` takes 0 to 50 and defaults to 20. `--since-timestamp` is an inclusive lower bound and `--to-timestamp` an exclusive upper bound, and the lower must be less than the upper.

- Report each call's time, event, audio or video type, duration, direction and missed status, without IDs. An empty result means no Messenger calls came back for that query, and says nothing about native phone calls or calls outside the retained history.

- A message with a `poll` object is a poll, not a blank message, even when its text is empty. Describe it from that object: the question, each option's text with its `vote_count`, who voted for it (`voters`), and the user's own votes (`viewer_voted` per option, `viewer_has_voted` overall). Mention that several choices or new options are allowed only when the user asks how to vote.

- Every creation, vote and added option of one poll returns as its own message carrying the same poll, and older copies can keep earlier counts. Run `sync messages --cid 'ID'` first and describe only the newest copy, once.

- A missing `vote_count` means the poll hides results from the user, and missing `voters` means it hides results or is anonymous; say so rather than reporting zero votes. `voters` is capped, so when `vote_count` is larger, name the listed voters and say how many others voted. Name the creator from `creator_id` against the thread's participants, or as the user when it matches `_cache.self_user_id`, and never show a poll or option ID.

- When asked for a URL from a message, check both its text and its URL metadata, and return the value byte for byte, keeping scheme, host, port, path, query, fragment, case and percent-encoding. Never normalize, shorten or rebuild it from a preview, and open it only if the user asks.

- For a total message count, compare `threads` with `_cache.cached_thread_count` and rerun with that count as `--limit` if needed. Deduplicate threads by `conversation_id`, run `messages --cid 'ID' --limit 1` for each, and sum their `_cache.cached_message_count`, not the one-row results. Refresh first, and qualify an incomplete total without exposing IDs.

### Link to a conversation

- Build a link only when the user asks. Resolve the exact thread and read both `conversation_id` and `is_e2ee`:
  - For an open one-to-one chat (`is_e2ee: false`, `cid.c.<VIEWER_FBID>:<CONTACT_FBID>`), compare both numbers with `_cache.self_user_id` and use the other one in `https://www.messenger.com/t/<CONTACT_FBID>`.
  - For an open group (`is_e2ee: false`, `cid.g.<GROUP_ID>`), use `https://www.messenger.com/t/<GROUP_ID>`.
  - For an end-to-end encrypted chat (`is_e2ee: true`, `cid.g.<THREAD_ID>`), use `https://www.messenger.com/e2ee/t/<THREAD_ID>`.

- Groups and encrypted chats share the `cid.g.` prefix, so never infer encryption from the prefix, the thread type or its name. If `is_e2ee` is missing, refresh and resolve again.

- Build a one-to-one link only when `_cache.self_user_id` identifies the other person unambiguously. Use only the numeric part, never the `cid.c.` or `cid.g.` namespace, and return a descriptive Markdown link without showing the ID separately.

## Resolve the recipient

- `sync contacts` refreshes up to 100 contacts by default and merges them into the retained snapshot. For more, rerun with a larger `--limit`, up to 10,000. `contacts` reads the whole snapshot, and `--search` matches any part of a name regardless of case.

- If a contact search finds no one, run `sync contacts --search "NAME"` once, then search again. Use the same targeted refresh when matches are ambiguous or incomplete, when the user asks to look beyond known contacts, or when current results matter.

- Send only on an explicit request, and never to a guessed recipient. A request for a one-to-one or direct message is a firm constraint, so before using `--cid`, check that `thread_type` is not a group and that the participants are only the user and the intended person. Never fall back to a matching group.

- Without a verified one-to-one thread, use `--to FBID` only when that exact ID appears on the person's current name-based `contacts --search` result. When you started from an ID alone, it must match one unambiguous record in unfiltered `contacts`.

- An ID from thread participants, message metadata, memory, earlier output or the user's text never authorizes `--to`. If the person cannot be resolved, ask for their name or explain that you cannot find them.

- In contact results and the Recipients line of a send preview, link each full display name to its `profile_url` or `vanity_url`, or else to `https://www.facebook.com/profile.php?id=<fbid>`, and keep the name plain when neither exists. Never show a raw FBID, a bare profile URL or a shortened name.

- Use plain names everywhere else, including success confirmations. Never add a profile link to an outgoing message unless the user asked for exactly that text.

## Preview and send

- Pass every message body, Marketplace first message and edit through `--text-stdin` and the separate `stdin` field of `muse.exec`, one invocation per message. There is no `--text` flag.

```json
{
  "command": "/opt/hatch/bin/hatch_messenger_cli send --cid 'CONVERSATION_ID' --text-stdin",
  "stdin": "Exact confirmed message."
}
```

- Immediately before sending, show this preview and wait for the user's explicit confirmation:
  - a Thread line, only for a `GROUP` or `SECURE_MESSAGE_OVER_WA_GROUP` thread
  - Recipients, with full names linked as described above
  - the exact outgoing text as a Markdown blockquote
  - any attachment on its own line after the blockquote, as `![filename](sandbox://workspace/<path>)`

- If anything changes, show the revised preview and wait again. Then run exactly one `send --cid 'ID'` or `send --to 'FBID'`, single-quoting IDs so the shell cannot expand them.

- If the user edits the pending approval, the saved message is the one sent. Do not submit another send, re-preview the original text, or request a second confirmation after approval. If the approved send fails, report the failure and stop; wait for a new request from the user instead of retrying the original or edited copy.

- Add `--attach 'FILE'` with a readable local path, where a leading `~` expands to the home directory even inside single quotes. Copy a file from outside the workspace into `~/workspace/` first, and use that same copy in the preview and in `--attach`.

## Group chats

- `thread-create`, `participants add` and `participants remove` work on open (non-encrypted) groups; encrypted and one-to-one chats are refused. `participants remove` also refuses groups with AI bots or linked to a Facebook Group, even when the user is leaving.

- These commands ask the user for approval themselves, so run them without Preview and send's chat preview. Ask first only when the request is ambiguous, and run it once the user picks. Pass message text with `--text-stdin`.

- Resolve the group with `threads --search` and use its ID, skipping groups with `is_e2ee: true`. If `is_e2ee` is missing or nothing matches, run `sync threads` once and search again.

- When more than one open group matches the chat the user named, list each match as its name, Markdown-linked to `https://www.messenger.com/t/<GROUP_ID>` (the numeric part of `cid.g.<GROUP_ID>`), followed by two of its other members' names, for example `[Weekend Crew](https://www.messenger.com/t/123) (Sandra Liangstein, Mary Zuckerez)`, and ask which chat they mean. Show names, never bare URLs or IDs. If only encrypted chats match, say these commands cannot change members there.

- When a name matches more than one contact or group member, list each match by full name, linked as Resolve the recipient describes (the name itself is the link; never a bare URL or ID), and ask which one they mean.

- Never retry a failed call automatically or trigger approval again; report the reason once and stop. After a failure, keep the people, group, name and message unless the user changes them.

### Start a group chat

- Use `thread-create` only when the user explicitly asks to start a new group chat, not to add someone to an existing one. It needs at least two other participants, each a Messenger contact resolved through Resolve the recipient; the server adds the user automatically. If a participant is not in the retained contacts, find them with `contacts --search` and call again.

- An opening message is required; ask for one if the user has not given it, and never invent one. Call once:

```json
{
  "command": "/opt/hatch/bin/hatch_messenger_cli thread-create --participant '<FBID_1>' --participant '<FBID_2>' --thread-name '<GROUP_NAME>' --text-stdin",
  "stdin": "exact initial message text"
}
```

- Omit `--thread-name` when the user gave no name. Otherwise pass it exactly, without dropping or replacing characters to avoid quoting. Single-quote it, writing each `'` as `'\''` (`Mom's 60th` becomes `'Mom'\''s 60th'`; inside the JSON string the backslash is `\\`).

- Use the returned `conversation_id` for follow-up `send` and `sync messages`.

- A timed-out call may have created the group, so check with `sync threads` before creating it again.

- `INITIAL_MESSAGE_FAILED` means the group exists but the message was not sent. Never call `thread-create` again for it, even if the user asks to retry, because that makes a second group. Tell the user, and on their OK send the message once with `send --cid '<CONVERSATION_ID>' --text-stdin`, using the ID from the error or from `sync threads`.

### Add people to a group

- Use `participants add` only when the user asks to add contacts to a group they are in. Resolve each person through Resolve the recipient and pass only unambiguous `user_id`s, never a guessed ID. If someone is not in the retained contacts, find them with `contacts --search` and call again.

- Call once, with at most 50 `--user-id` values:

```sh
/opt/hatch/bin/hatch_messenger_cli participants add --cid '<CONVERSATION_ID>' --user-id '<FBID_1>' --user-id '<FBID_2>'
```

- Report each person by name from `results[].outcome`:
  - `added`: now in the group.
  - `pending_approval`: invited, but not in the group until an admin approves. Say that; it is not a failure.
  - `already_member` or `already_pending`: nothing changed.

- `GROUP_FULL` and `ADD_NOT_ALLOWED` mean nobody was added; for `ADD_NOT_ALLOWED`, do not guess who or why. Once the add has been sent, any other failure, including a timeout or an unreadable response, means it may have happened: say the outcome is unknown and suggest checking the group in Messenger.

### Remove someone or leave a group

- Use `participants remove` only when the user asks to remove someone from a group they are in, or to leave it. Only admins can remove others; anyone can leave. AI bots cannot be removed.

- Take the person's `id` from the group's `participants` in `threads`, matched by name. To leave, use the user's own `user_id` from `check`.

- Call once per person, so each gets its own approval card. If the user is also leaving, do that last.

```sh
/opt/hatch/bin/hatch_messenger_cli participants remove --cid '<CONVERSATION_ID>' --user-id '<FBID>'
```

- `{"success": true}` means the person is out of the group, or the user left.

- If the command refuses before the approval card because it cannot read the local threads, or you or the command cannot find the person among the group's members, nothing was sent: run `sync threads` once, resolve them again and call again; if they are still missing, tell the user. Report only the final outcome, not the retry.

- These errors mean nothing changed:
  - `NOT_IN_GROUP`: the person is not in the group.
  - `ONLY_SELF_REMOVAL_ALLOWED`: the user is not an admin, so they can only leave. Ask whether they want to leave, and call again with their own ID only on an explicit yes.
  - `BOT_REMOVAL_NOT_SUPPORTED`: the person is an AI bot.
  - `REMOVE_NOT_ALLOWED`: Messenger does not allow it; do not guess why.

- Once the removal has been sent, any other failure, including `REMOVE_FAILED`, a timeout or an unreadable response, means it may have happened: say the outcome is unknown and suggest checking the group in Messenger.

## Marketplace messages

- Use `marketplace initiate` only when the user asks to contact the seller of a specific listing. Resolve the listing and its positive numeric ID, preview the listing title or URL and the exact message as a blockquote, and wait for confirmation:

```json
{
  "command": "/opt/hatch/bin/hatch_messenger_cli marketplace initiate --listing-id LISTING_ID --text-stdin",
  "stdin": "Exact confirmed message."
}
```

- `created: true` means it created the thread and sent the message. `created: false` means it returned the existing buyer and seller thread without sending anything, so sync and read that thread with the returned `conversation_id` and use a normal send for the follow-up, never another `marketplace initiate`.

- Any Marketplace message that could create or change a real-world commitment needs fresh confirmation of its exact text immediately before it goes out. That covers proposing, accepting, confirming, rescheduling or cancelling a meetup, pickup, delivery, hold, price or payment, and saying the user is leaving, on the way, nearby or has arrived.

- A permission approval, an earlier confirmation, or approval of a recurring, scheduled, monitoring or automatic reply task never covers a later commitment. Background work returns the proposed reply and its context with `muse.notify_main_agent` so the main conversation can ask, and the message stays unsent if that confirmation cannot be had.

## Automatic replies

- The user may set up a recurring rule that checks named ordinary or Marketplace conversations and replies for them. Build it once they have named the conversations, how often to check and the exact reply text, asking only for what is missing.

- Reject reply text that creates or changes a Marketplace commitment, and suggest a non-committal alternative. Write that exception into the saved rule, so a message or proposed reply involving a commitment gets no reply and is reported to the main conversation with the proposed text.

- Before creating the rule, preview the conversations, the check frequency and the exact reply as a blockquote, including the commitment exception, and wait for confirmation. Its individual replies are not previewed again.

- When Messenger approvals are on, a rule's reply sends without a new approval only to a conversation the user previously allowed from this Messenger account, and replies elsewhere wait for approval. The user can revoke an allowance under Settings > Connectors > Messenger > Manage recipient permissions.

- Never use automatic replies to deliver Muse's own notifications.

## React, edit or unsend

- Resolve the exact target from `messages` or `search`, never guessing its ID. If an older target is missing, fetch more of the thread with `sync messages --cid 'ID' --older 200` or `--since-days N`, up to 30 days, and resolve it again.

- Immediately before the preview, run `sync messages --cid 'ID'` and read the target again, refreshing the preview if it changed or is ambiguous. `--cid` is optional for these commands, so omit it rather than guess.

- Show a Thread line only for a group thread, use names rather than IDs, and wait for explicit confirmation. Single-quote `--mid`, `--cid` and the emoji so the shell cannot change them.

- Run each change at most once per target and request. On failure, report the reason once and stop, without retrying or asking for approval again.

- `react --mid 'ID' --emoji 'EMOJI'` adds or changes the user's reaction, and `--remove` removes it. Reactions work in open and encrypted threads and on anyone's message, with exactly one emoji. Preview the target text and the exact emoji, or "Remove your reaction".

- Edit and unsend only the user's own messages, whose `sender_id` matches `_cache.self_user_id`. Preview the original timestamp in the user's local time, never the sender, a raw ID or a millisecond timestamp.

- `edit --mid 'ID' --text-stdin` replaces the text of one of the user's messages, only when they ask to edit, fix or reword it. Preview the current and new text as Before and After blockquotes, and preview again if the new text changes.

- Recipients see an "edited" marker, with no new notification. Messenger typically allows edits for about 15 minutes and about five times per message, and stale, over-limit or non-text edits fail.

- `unsend --mid 'ID'` removes the user's message for everyone, only when they ask to unsend, delete, take back or remove it. Preview the exact current text as a blockquote, and do not treat an initial not-found as final until you have fetched further back.

- Unsend is not supported in Marketplace conversations. Stop before any preview or approval and tell the user plainly that the message cannot be unsent there.

## Repair unreadable messages

- When rows show `(decrypt failed)` or `(no thread key)`, run `repair`, then read the thread again. Repair is local and safe to rerun. It refreshes keys once, retries retained ciphertext, leaves rows it still cannot read untouched and fetches no new messages.

- These markers describe single rows, not the thread or encrypted chat support, so never say encrypted conversations are inaccessible. If it matters, say only that those messages could not be read.

- Do not use repair for freshness, missing history, gaps, send failures or write-registration cleanup, and never loop on a failed repair. If it reports unavailable key refresh or stale device state, ask the user to disconnect and reconnect Messenger.

## Keep history private

- Refuse to bulk export, download, save, archive, mirror or dump message history, especially disappearing, view-once, vanish-mode or expiring messages. Narrow reading, search and summaries that answer a specific question are fine.

## Related skills

- [Marketplaces](/opt/muse/skills/marketplaces/SKILL.md)

- [Messaging Other People](/opt/muse/skills/messaging/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.

### When available

- These skills depend on the user's channel or devices. `muse.skill_search` shows which ones this session has.

- [Calls and Texts from Glasses](/opt/muse/skills/wearables-comms/SKILL.md)
