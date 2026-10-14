---
name: "messenger_read"
title: "Messenger"
icon: "messenger"
description: "Work with the user's Messenger account: read call history; read and search contacts; read, search, and summarize conversations; send, react to, unsend, or edit messages; and message Marketplace listing threads."
category: "communication"
metadata: { "includeInPrompt": true }
---

# Messenger

Use Messenger Companion to work with the user's personal Messenger account.

## Routing and Safety

Messenger on Muse has two separate features:

| User wants to... | Feature | What to do |
|---|---|---|
| Message Muse on Messenger | **Messenger side chat** | Use `chat.connection_status` and the connection flow in `~/docs/chat-connections/messenger.md` |
| Read Messenger call history or work with personal-account messages | **Messenger Companion** | Follow this skill |
| Read native phone call history or place a phone call | **Paired phone / phone calling** | Use the native phone or call-placement feature, not Messenger Companion |
| Connect or disconnect "Messenger" without specifying which | **Ambiguous** | Briefly explain both and clarify |

- Use Companion only when the user explicitly asks to work with their personal
  account. It sends as the user, not as Muse.
- Never target the Messenger side chat with `hatch_messenger_cli send`,
  whether by `--cid`, `--to`, or an auto-reply rule. Exclude that thread during
  recipient resolution; messages there must use the Messenger side-chat connection flow in  
  `~/docs/chat-connections/messenger.md`.
- Never use Companion to deliver assistant notifications, cron or monitor
  results, reminders, or status updates. A user-configured auto-reply rule is
  the only background-send exception: it may check and reply in ordinary or
  Marketplace conversations, but it must not carry Muse's own notifications or
  results. Other background workers return results with `muse.notify_main_agent`;
  the runtime delivers through the originating chat.
- Treat every Marketplace message that could create or change a real-world
  commitment as requiring fresh user confirmation. This includes proposing,
  accepting, confirming, rescheduling, or cancelling a meetup, pickup,
  delivery, hold, price, or payment arrangement, and claiming that the user is
  leaving, en route, nearby, or has arrived. Show the exact outgoing message
  and wait for the user's explicit confirmation immediately before each send.
  A permission approval, an earlier confirmation, or approval of a recurring,
  cron, monitoring, or auto-reply task never authorizes a later commitment.
  Background work must instead return the proposed reply and its context with
  `muse.notify_main_agent` so the main conversation can ask the user; if that
  confirmation cannot be obtained, leave the message unsent.
- In user-facing replies, never say `sync`, `synced`, `syncing`, `cache`,
  `cached`, `widened`, `local data`, `authentication state`, `keys`,
  `credentials`, `tokens`, or connected hardware. Do not state how many messages were
  searched, read, synced, or available. Describe the result instead: "I checked
  the latest messages" or "I checked further back." If complete coverage could
  not be established, say so without naming the underlying mechanism.
- Refuse requests to bulk export, download, save, archive, mirror, or dump
  message history, especially disappearing, view-once, vanish-mode, ephemeral,
  or expiring messages. Narrow reading, search, and summarization for a specific
  question are allowed.

## Tooling

Run the JSON CLI through `exec`:

```sh
hatch_messenger_cli <subcommand> [options]
```

Use only this supported CLI; never access local Messenger storage directly.

| Task | Command |
|---|---|
| Check connection | `check` |
| Get connect/disconnect link | `connect-url` / `disconnect-url` |
| Refresh normal data | `sync both [--since-days N]` |
| Refresh contacts | `sync contacts [--search "query"] [--limit N]` |
| Refresh threads/messages | `sync threads [--since-days N] [--older N]` / `sync messages --cid '<ID>' [--since-days N] [--older N]` |
| Read Messenger call history | `call-logs [--limit N] [--since-timestamp <MS>] [--to-timestamp <MS>]` |
| Read contacts | `contacts [--search "query"] [--limit N]` |
| Read threads | `threads [--limit N] [--search "query"] [--unread] [--folder mplace]` |
| Read a thread | `messages --cid '<ID>' [--limit N] [--before <TS>] [--after <TS>]` |
| Search messages | `search [query] [--sender "name_or_id"] [--cid '<ID>'] [--after <TS>] [--before <TS>] [--limit N]` |
| Repair unreadable rows | `repair` |
| Send/initiate/react/edit/unsend | See the mutation workflows below |

### User-facing output

- Never expose raw tool metadata: IDs (`msg_id`, `message_id`, `mid.$...`,
  `conversation_id`, `cid.$...`, caller/callee FBIDs, `otid`), device counts,
  encryption details, delivery or receipt state, raw JSON, or cache statistics.
- The only ID-derived output exceptions are an FBID embedded in an allowed
  Facebook profile link and the target portion of a user-requested Messenger
  thread link. Never display either ID separately or put a full namespaced ID
  in a URL.
- A URL found in message text or message-level URL metadata may be returned
  when requested, but expose only the URL, not its surrounding metadata.
- After a successful mutation, confirm briefly and naturally. Do not narrate
  the service response or claim delivery/read status.

## Connect or Disconnect Companion

Check first:

```sh
hatch_messenger_cli check
```

If Companion is not connected, run `hatch_messenger_cli connect-url`. When the
response contains `connect_url`, share exactly
`[Connect Messenger](<connect_url>)`, without also pasting the raw URL. Do not
collect secrets or guide the user through manual authentication in chat. After
the user links in Settings, continue with the requested operation.

To disconnect Companion, run `hatch_messenger_cli disconnect-url`. When the
response contains `disconnect_url`, share exactly
`[Disconnect Messenger](<disconnect_url>)`, without also pasting the raw URL.
Disconnecting Companion removes its access to the personal account but does not
affect the Messenger side-chat connection. Reconnect later with `connect-url` and the same link
rule.

## Sync Threads and Messages

Read commands use locally retained Messenger data. Sync before claiming
freshness or completeness.

Use `hatch_messenger_cli sync both` for normal refreshes. Add `--since-days N`
when the question reaches farther back. For older history in one thread, use:

```sh
hatch_messenger_cli sync messages --cid '<CONVERSATION_ID>' --older 100
```

`sync both` is incremental and fills message gaps. If `_cache.gaps` overlaps
the question, repeat it until the relevant gaps clear. If the requested period
predates `_cache.oldest_cached_ts`, extend it with `sync both --since-days N`.
For a single-thread gap, prefer targeted `sync messages`. Qualify the answer if
complete coverage still cannot be established, using the user-facing language
from Routing and Safety.

# Resolve Contacts

```sh
hatch_messenger_cli sync contacts
hatch_messenger_cli contacts --search "Alice"
```

The default refresh fetches up to 100 contacts and merges them into the contact
snapshot. If the user asks for more, rerun with a limit larger than 100 or the
previous bounded limit, up to 10,000. `contacts` reads the complete retained
snapshot; `--search` performs case-insensitive substring matching on names.

If local search returns no result, retry once with
`sync contacts --search "<name>"`, then repeat the local search. Also use that
targeted refresh when matches are ambiguous or incomplete, the user asks to
look beyond known contacts, or current server results are required.

### Contact profile links

In contact-list/search results and the **Recipients:** field of a send preview,
link each full display name when a profile URL or FBID is available. Prefer an
explicit `profile_url` or `vanity_url`; otherwise use
`https://www.facebook.com/profile.php?id=<fbid>`. Keep names plain when neither
is known. Do not show a raw FBID, a bare profile URL, or a shortened name.

Use plain contact names in thread labels, thread-search results, unrelated
assistant prose, and success confirmations. Never add a profile link to the
outgoing message unless the user explicitly asked to send that exact linked
text.

## Read Messenger Call History

Use `hatch_messenger_cli call-logs` for the latest Messenger audio and video call
history. `--limit` accepts 0 through 50 and defaults server-side to 20. Use
`--since-timestamp <MS>` for an inclusive lower bound and `--to-timestamp <MS>`
for an exclusive upper bound; when both are present, the lower bound must be
less than the upper bound.

Report the annotated time, event, audio/video type, duration, direction, and
missed status without exposing caller, callee, conversation, or message IDs or
raw JSON. An empty result means no Messenger calls were returned for that
bounded query; it does not establish that the user has no native phone call
history or no calls outside the retained Messenger history window.

## Read Threads and Messages

List or resolve threads before reading one:

```sh
hatch_messenger_cli threads --limit 20
hatch_messenger_cli threads --search "Bao" --limit 10
hatch_messenger_cli messages --cid '<CONVERSATION_ID>' --limit 20
```

`threads --search` matches names and nicknames. If exactly one thread matches,
read it; otherwise ask the user to disambiguate. Folder filtering applies only
to `threads`, not `sync`:

```sh
hatch_messenger_cli threads --folder mplace --limit 20
hatch_messenger_cli threads --folder mplace --unread
```

For older retained rows, use `messages --before <TIMESTAMP_MS>`. For unread
catch-up, read `threads --unread`, then the chosen thread with  
`messages --after <read_timestamp>`.

If a row says `(decrypt failed)` or `(no thread key)`, treat only that row as
unreadable. Run `repair` and read the thread again before drawing a conclusion;
see Repair Unreadable Messages.

### Return URLs from messages

When asked for a URL from a message, inspect both its text and message-level URL
metadata. Return the relevant value verbatim, preserving scheme, hostname,
port, path, query, fragment, casing, and percent-encoding. Do not normalize,
shorten, decode/re-encode, or rebuild it from a preview. Do not open it unless
the user asks.

### Count total messages

1. Run `threads` and compare the returned list with
   `_cache.cached_thread_count`; if needed, rerun with that count as `--limit`.
2. Deduplicate threads by `conversation_id`.
3. For each thread, run `messages --cid '<CONVERSATION_ID>' --limit 1` and read  
   `_cache.cached_message_count`.
4. Sum those counts, not the one-row `messages` arrays.

Sync first for a current or complete count. Qualify an incomplete total using
the user-facing wording above, and never expose the IDs used in the calculation.

### Link to a specific conversation

Only create a deep link when the user asks. Resolve the exact thread and inspect
both `conversation_id` and `is_e2ee`:

- Open one-to-one: `is_e2ee: false` and
  `cid.c.<VIEWER_FBID>:<CONTACT_FBID>`. Compare both values with
  `_cache.self_user_id` and use the other value:  
  `https://www.messenger.com/t/<CONTACT_FBID>`.
- Open group: `is_e2ee: false` and `cid.g.<GROUP_ID>`:  
  `https://www.messenger.com/t/<GROUP_ID>`.
- E2EE chat: `is_e2ee: true` and `cid.g.<THREAD_ID>`:  
  `https://www.messenger.com/e2ee/t/<THREAD_ID>`.

Groups and E2EE chats share the `cid.g.` prefix, so never infer encryption from
the ID prefix, thread type, or name. If `is_e2ee` is absent, sync and resolve
again. For an open one-to-one, do not build the link unless
`_cache.self_user_id` identifies the other participant unambiguously. Use only
the documented numeric portion; never substitute another field, guess, or put
the `cid.c.`/`cid.g.` namespace in the URL. Return a descriptive Markdown link
without separately showing the ID.

## Search Messages

```sh
hatch_messenger_cli search "dinner"
hatch_messenger_cli search --sender "Alice"
hatch_messenger_cli search "dinner" --cid '<CONVERSATION_ID>'
```

- Search is literal substring matching over retained data, not semantic search.
  Quote multi-word queries and try alternate terms when useful.
- Resolve an ambiguous conversation with `threads --search` before scoping the
  query. For exhaustive searches, paginate with `--before <oldest_timestamp>`.
- Sync first when freshness or completeness matters.
- Bound date questions with `search --after <ms>` and optionally
  `--before <ms>`. `sync --since-days N` widens available history but does not
  filter search results.
- `message_sent_at` and `last_message_sent_at` are transport times. Never infer
  when an event mentioned inside a message occurred from those timestamps.

## Message Text Input

For every send, Marketplace initiation, or edit, pass the body through
`--text-stdin` as the final option and a single-quoted heredoc:

```sh
--text-stdin << 'MESSENGER_INPUT'
exact message text
MESSENGER_INPUT
```

There is no `--text` flag. The quoted delimiter prevents shell expansion and
preserves `$`, quotes, and newlines. Choose a delimiter absent from the body;
never use an unquoted heredoc. Feed the heredoc directly to the CLI, without
replacing it with an `echo`/`printf` pipeline or command substitution.
`--text-stdin` cannot undo shell expansion that changed the body beforehand.

## Send a Message

Send only on an explicit request and never to a guessed recipient.

### Resolve the recipient

1. Use `threads --search` for an existing conversation.
2. A request for a one-to-one, direct, or individual chat is a hard constraint.
   Before using `--cid`, verify `thread_type` is not a group and participant
   metadata contains no one beyond the user and intended recipient. Never fall
   back to a matching group.
3. If there is no verified one-to-one thread, follow the contact workflow. Use
   `--to <FACEBOOK_USER_ID>` only when that exact FBID appears on the intended
   person's current name-based `contacts --search` result. When only an FBID was
   initially available, it must exactly match an unambiguous record from
   unfiltered `contacts`.
4. An ID from thread participants, message metadata, memory, earlier output, or
   user text does not authorize `--to`. If the exact contact cannot be resolved,
   ask for the person's name or explain that the contact cannot be resolved.

### Preview and execute

Immediately before sending, show:

- **Thread:** only for `GROUP` or `SECURE_MESSAGE_OVER_WA_GROUP`;
- **Recipients:** resolved full names, linked according to Contact profile links;
- **Message:** the exact outgoing text as a Markdown blockquote; and
- **Attachment:** when present, followed on its own line by
  `![filename](sandbox://workspace/<workspace-relative-path>)` outside the
  blockquote.

Use names rather than IDs. Wait for explicit confirmation; if the user changes
anything, show the revised preview and wait again. Then call exactly one form:

```sh
hatch_messenger_cli send --cid '<CONVERSATION_ID>' [--attach <FILE>] --text-stdin << 'MESSENGER_INPUT'
message text
MESSENGER_INPUT
```

```sh
hatch_messenger_cli send --to '<FACEBOOK_USER_ID>' [--attach <FILE>] --text-stdin << 'MESSENGER_INPUT'
message text
MESSENGER_INPUT
```

For attachments, use a readable local path. If the source is outside the
workspace, copy it into `~/workspace/` first and use that same copy in both the
preview and `--attach`. Leading `~` resolves to the Muse home directory.

### Automatic replies

The user may create a recurring rule that checks their ordinary or Marketplace
conversations and replies for them. Build it once they have named the
conversations, how often to check, and the exact reply text; ask only for
settings that are genuinely missing.

When setting up an automatic reply, reject reply text that creates or changes
a real-world Marketplace commitment and suggest a non-committal alternative.
Write the exception into the saved rule itself: if an incoming message or a
proposed reply involves scheduling or other commitment details covered by
Routing and Safety, send no reply and report the conversation and exact
proposed text to the main conversation for fresh confirmation. Include this
exception in the setup preview so the user knows which messages need follow-up.

Before creating the rule, preview the conversations it covers, how often it
checks, and the exact reply text as a Markdown blockquote. Wait for explicit
confirmation, then create it. The rule's individual replies are not previewed
again in chat. When Messenger approvals are on, a reply sends without a separate
approval only if the user previously allowed that conversation from this
Messenger account; replies to other conversations wait for approval. The user
can revoke that allowance under Settings > Connectors > Messenger > Manage
recipient permissions.

### Initiate a Marketplace conversation

Use `marketplace initiate` only when the user explicitly asks to contact the
seller of a specific listing. Resolve the listing and its positive numeric ID,
then preview:

- **Listing:** its title or URL, not only its ID; and
- **Message:** the exact text as a Markdown blockquote.

Wait for explicit confirmation, then call once using the Message Text Input  
rule:

```sh
hatch_messenger_cli marketplace initiate \
  --listing-id <LISTING_ID> \
  --text-stdin << 'MESSENGER_INPUT'
message text
MESSENGER_INPUT
```

`created: true` means a new thread was created and the message was sent.
`created: false` means the existing buyer/seller thread was returned and no
message was sent. In the latter case, use the returned `conversation_id`
internally to sync and read the thread, then use the normal send preview and
confirmation workflow for a follow-up. Never call `marketplace initiate` again
for that follow-up.

## React to a Message

Reactions work in open and E2EE conversations with the same command. The
vendored Messenger CLI chooses the correct transport from the resolved thread.
You may react to either the user's own message or another participant's
message. `--cid` is optional at the wrapper; when omitted, the vendored CLI
owns conversation inference and any target-specific requirement. The vendor
also validates `--emoji`, which must be exactly one emoji. The command adds a
reaction when none exists and changes the user's current reaction when one does.

1. Resolve the exact target from `messages` or `search`; never guess its ID. If
   an older target is missing, deep-fetch that thread with
   `sync messages --cid '<CONVERSATION_ID>' --older 200` or `--since-days N`,
   then resolve it again.
2. Immediately before previewing, run
   `sync messages --cid '<CONVERSATION_ID>'` and read the target again. If it
   changed or is ambiguous, refresh the preview.
3. Show **Thread:** only for a group, **Message:** with the target text when it
   has text, and **Reaction:** with either the exact emoji or "Remove your
   reaction." Use names, never raw IDs.
4. Wait for explicit confirmation. If the target or reaction changes, preview
   again. Single-quote `--mid`, the emoji, and `--cid` when provided so the
   shell cannot expand `$` sequences or alter the emoji.
5. Call `react` once per requested state. Do not retry a failure or trigger
   approval again; report the returned reason once and stop.

Add or change the user's reaction (exactly one emoji):

```sh
hatch_messenger_cli react --cid '<CONVERSATION_ID>' --mid '<MESSAGE_ID>' --emoji '❤️'
```

Remove the user's current reaction:

```sh
hatch_messenger_cli react --cid '<CONVERSATION_ID>' --mid '<MESSAGE_ID>' --remove
```

`--cid` may be omitted; the wrapper forwards it only when provided and otherwise
leaves inference to the vendored CLI. `--emoji` and `--remove` are mutually
exclusive; use `--emoji` to add or change a reaction and `--remove` to remove
it. Emoji validity is enforced by the vendor. After success, confirm briefly
and naturally without exposing message IDs, transport details, or raw tool output.

## Edit or Unsend an Existing Message

Messenger does not support unsending messages from Marketplace conversations.
If an unsend target belongs to Marketplace, stop before preview or approval,
do not call `hatch_messenger_cli unsend`, and tell the user plainly that the
message cannot be unsent from a Marketplace conversation.

For supported non-Marketplace conversations, both operations work in open and
E2EE threads. `--cid` is optional for both edit and unsend: the wrapper forwards
it when provided and otherwise leaves conversation inference and validation to
the vendored CLI. Apply this shared workflow:

1. Resolve the exact target from `messages` or `search`; never guess its ID.
   Only operate on a message whose `sender_id` matches `_cache.self_user_id`.
2. If an older target is missing, deep-fetch that thread with
   `sync messages --cid '<CONVERSATION_ID>' --older 200` or
   `--since-days N` (up to 30), then resolve it again.
3. Immediately before the preview, run `sync messages --cid '<CONVERSATION_ID>'`
   and read the target again. If it changed or is ambiguous, refresh the preview.
4. Show **Thread:** only when `thread_type` is `GROUP` or
   `SECURE_MESSAGE_OVER_WA_GROUP`, plus the original **Timestamp:** in the
   user's local timezone. Never show the sender, a raw ID, or a millisecond
   timestamp.
5. Wait for explicit confirmation immediately before executing. Single-quote
   `--mid` and `--cid` when provided so the shell cannot expand `$` sequences.
6. Call the mutation at most once per target per user request. Do not retry a
   failure or trigger approval again; report the returned reason once and stop.

### Unsend

Unsend removes the user's message for everyone. The preview also includes  
**Message:** with the exact current text as a Markdown blockquote.

```sh
hatch_messenger_cli unsend [--cid '<CONVERSATION_ID>'] --mid '<MESSAGE_ID>'
```

Only unsend when the user explicitly asks to unsend, delete, take back, or
remove their own message. Do not treat an initial `not found` as final until the
deep-fetch step above has been attempted.

### Edit

Edit only when the user explicitly asks to edit, fix, or reword one of their
own text messages. The preview also includes **Before:** with the current text
and **After:** with the exact replacement, each as a Markdown blockquote. If
the requested replacement changes, preview again.

```sh
hatch_messenger_cli edit [--cid '<CONVERSATION_ID>'] --mid '<MESSAGE_ID>' --text-stdin << 'MESSENGER_INPUT'
replacement text
MESSENGER_INPUT
```

The replacement must exactly match the confirmed Message Text Input body.
Recipients see an "edited" marker immediately; editing does not generate a
notification or unread bolding.
Messenger typically limits edits to about 15 minutes after sending and about
five edits per message; stale, over-limit, and non-text edits fail.

## Repair Unreadable Messages

When rows show `(decrypt failed)` or `(no thread key)`, run:

```sh
hatch_messenger_cli repair
```

Repair is local and non-destructive: it refreshes epoch keys once, retries
already retained ciphertext, leaves rows it still cannot decrypt untouched,
and fetches no messages. Re-read the thread afterward. A later rerun is safe.

These placeholders describe individual rows, not the thread or Companion's
E2EE support. Never claim that encrypted conversations are inaccessible. If it
matters, say only that those particular messages could not be read.

Do not use repair for freshness, missing history, gaps, send failures, or
write-registration cleanup. If it reports unavailable epoch refresh or stale
device state, ask the user to disconnect and reconnect Companion. Do not loop
on a failed repair.
