## Namespace: mcp__codex_apps

### mcp__codex_apps__cloud_threads_send_message

Create cloud tasks on a connected desktop, registered Remote, or saved coding environment, list, read or message tasks, create and list read-only Dreamers, get or change the user's dot's name or pet, and manage shared Dream Notes.

Send instructions to a cloud task for the user's dot using its existing executor. The prompt appears as a user-visible message in the destination task. Write clear, cohesive, human-readable prose. Starts a turn when idle or steers the current turn when running. Optional model and thinking changes apply to the new turn when idle; when running they are saved for subsequent turns, without changing active inference. Omitted settings are preserved. Returns the admitted turn ID without waiting for completion.

exec tool declaration:  
```ts
declare const tools: { mcp__codex_apps__cloud_threads_send_message(args: {
  // Model available to your account. Omit to keep the current model.
  model?: string | null;
  prompt: string;
  // Reasoning effort supported by the model. Omit to keep the current effort.
  thinking?: "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max" | "ultra" | "persistent" | null;
  threadId: string;
}): Promise<CallToolResult>; };
```

### mcp__codex_apps__slackbot_send_message

Use the connected Slack bot to send messages and, when available, read public channels, edit its messages, and manage Slack content.

Send a message as the bot. Omit destination fields to reply in the current conversation. Supports Markdown. Use Slack Block Kit blocks for tables, comparisons, and key-value layouts. Always include a complete `message` for notifications and accessibility. Provide `thread_ts` for a thread reply; set `reply_broadcast=true` to also show it in the channel.

exec tool declaration:  
```ts
declare const tools: { mcp__codex_apps__slackbot_send_message(args: {
  // Optional Slack Block Kit layout. Prefer `section` blocks with `fields` for comparisons and key-value summaries; use `header`, `divider`, or `context` blocks when helpful. For example, {"type":"section","fields":[{"type":"mrkdwn","text":"*Status*: Done"}]}. Use `markdown` blocks for standard Markdown tables; pipe tables do not render in `mrkdwn` sections. Set `expand` to true to keep section text fully visible. Always supply a complete `message` fallback; keep each section within 3,000 characters and all Markdown blocks combined within 12,000 characters. Interactive controls are supported only in the current default-agent thread. Every action_id must start with `chatgpt_agent_action:`. A selection change continues the conversation immediately. For a form that waits for Submit, put controls in input blocks with dispatch_action=false and add an ordinary Submit button; its callback includes all form values. Prefer on_enter_pressed for independent text inputs. Clearing a single selection produces null; clearing a multi-select produces an empty list. External selects are not yet supported. Link and workflow buttons keep Slack's native behavior. Video requires links.embed:write and a configured unfurl domain.
  blocks?: Array<{ [key: string]: unknown; }> | null;
  // Optional destination channel ID. Omit to use the current verified channel. Use a bot-accessible public channel returned by slackbot.list_public_channels or a group DM returned by slackbot.open_group_dm; use user_id for a different direct message. Supplying the current channel explicitly with no thread_ts posts at the channel's top level. Mutually exclusive with user_id.
  channel_id?: string | null;
  // Set true when this message completes your response in the current conversation and you have no further work planned. After a successful send, end your turn unless new user input arrives. Leave false for progress updates.
  is_final_response?: boolean;
  // Complete standard-Markdown response, also used as the notification and accessibility fallback when structured blocks are supplied. Both `**bold**` and `*bold*` render as bold; use `_italic_` for italics.
  message: string;
  // Whether to also surface the thread reply in the channel. Defaults to false and may only be true when thread_ts is supplied.
  reply_broadcast?: boolean;
  // Optional thread reply target in the destination channel. Use a known thread_root_ts to continue a thread, or message_ts only when intentionally starting a thread beneath a top-level message. Omit with an explicitly supplied channel_id or user_id to post at that conversation's top level.
  thread_ts?: string | null;
  // Optional Slack user ID for a direct message. The server verifies that the user belongs to the authenticated workspace, then Slack opens or reuses the DM. Use a user ID from trusted Slack context; mutually exclusive with channel_id.
  user_id?: string | null;
}): Promise<CallToolResult>; };
```

### mcp__codex_apps__teamsbot_send_message

Send or edit text, read verified channel context, inspect current-team members and tags, or browse, search, download, organize, or upload files through the invocation's verified Microsoft Teams destination. Supply a read scope to inspect other authorized Teams channels and threads; reuse it for related member reads. Reading keeps the original reply destination. The server resolves the destination; never request or provide tenant, conversation, service URL, link, or account identifiers.

Send a Markdown text message as this assistant to Microsoft Teams. For Orbit sends, destination_id selects a conversation or channel thread. It is required when answering an incoming Orbit Teams event; use the event's destination_id to reply in that conversation. Other invocations can omit it to use the default destination. In a channel, mention a user with <@user:AAD-OBJECT-ID|Display Name>. For the requester, copy the trusted user_aad_object_id and user_display_name context fields exactly; do not invent a display label. For another user, copy the exact aad_object_id and name returned by a Teamsbot member tool. Never use the member_id field or legacy <@MEMBER-ID> syntax. To mention a tag in a standard channel, first call get_channel_info with include_tags=true and copy the exact returned mention_token (<@tag:GRAPH-TAG-ID|Tag Name>). Do not invent or re-encode tag IDs; use at most 10 tag mentions per message. Return web URLs as Markdown links (e.g., [label](https://example.com)).

exec tool declaration:  
```ts
declare const tools: { mcp__codex_apps__teamsbot_send_message(args: { card?: { actions?: unknown; body: unknown; } | null; destination_id?: string | null; files?: Array<unknown> | null; message: string; }): Promise<CallToolResult>; };
```

### mcp__codex_apps__user_message_send_message

Message the user via ChatGPT or Slack. Send messages and manage reactions, search previous messages, and read messages with surrounding context.

Send text or Library files to the user on ChatGPT or Slack, or an app widget on ChatGPT. On ChatGPT, send as the user's dot in its existing conversation with the user. Omit destination for normal sends unless the channel requires it. On ChatGPT, if the incoming message has a non-null reply_to_message_id, set destination.message_id to that incoming message's own message_id for the reply and follow-up updates. Otherwise, set destination.message_id only for targeted replies. Use the incoming channel unless the user asks for another. Load the selected channel's skill for formatting and channel-specific workflows. For chatgpt, deliver generated images, audio, video, and other files as native attachments by default using library_file_ids, without waiting for the user to ask for an attachment. If the file is only local, first upload it with library.create_library_file and use its returned library_file_id. Do not substitute Markdown or bare sandbox paths or private file download URLs (including Library download URLs) in text; these may not open in the user's app. Keep ordinary external website and shareable document links as links. If attachment preparation fails, explain the problem; do not present a private file URL as successful delivery. To share an app widget on ChatGPT, await the widget-producing tool, then immediately send its caption with channel="chatgpt" and metadata={"include_widget": true}, without intervening tool calls. Use this explicit option for requested plugin setup or any card the caption refers to. If the send fails, do not send that caption as text-only. Omitting include_widget or setting it false sends no widget. To show a proactive plugin suggestion, use true as well. Sends stay on the selected channel. Use email tools for email. An accepted send does not confirm delivery. If only some attachment messages were accepted, do not resend those messages or the whole batch. Do not retry an uncertain send.

exec tool declaration:  
```ts
declare const tools: { mcp__codex_apps__user_message_send_message(args: {
  // Supported channels: chatgpt (the user's room with their dot in ChatGPT) and slack.
  channel: "chatgpt" | "slack";
  // For ChatGPT, omit destination for normal messages. If the incoming message has a non-null reply_to_message_id, set message_id to that incoming message's own message_id for the reply and follow-up updates. Use message_id for other targeted replies. For Slack, use channel_id for a new top-level message or add thread_id to post in that thread. Omit to use the verified incoming Slack conversation/thread or the user's connected DM.
  destination?: {
  // For Slack only. Conversation ID for a new top-level message.
  channel_id: string;
} | {
  // For Slack only. Conversation ID containing the thread.
  channel_id: string;
  // Slack root message timestamp of the thread.
  thread_id: string;
} | {
  // Message to reply or react to on the selected channel. Copy its exact ID from incoming context or a prior send; on ChatGPT, read_messages and search_messages also return usable IDs. For Slack, use the full returned slack:conversation:thread:message reference, not a raw timestamp. Do not use a mirrored room message ID for Slack or construct an ID. Replies are supported on ChatGPT and Slack.
  message_id: string;
} | null;
  // Public pending approval request ID supplied by the server. Attaches the original approval on the selected channel. Do not invent IDs or approval links. Do not retry an uncertain send.
  elicitation_request_id?: string | null;
  // Up to 10 returned library_file_id values for owned Library uploads or generated files, not paths, URLs, or backing file_id values. Attaches current versions; native Library documents are unsupported. First upload local files with library.create_library_file. For ChatGPT, use this field by default to deliver generated files as native attachments.
  library_file_ids?: Array<string>;
  // Channel options; unsupported keys are rejected.
  // ChatGPT: set include_widget=true to include the app widget from the immediately preceding tool result in this turn. Await the widget-producing tool, then send its caption without intervening tool calls. The server retrieves the original result; do not copy widget data into the message. Use include_widget=true for requested plugin setup or any card the caption refers to. Omitting it or setting false sends no widget.
  // message_metadata stores presentation JSON (up to 16 KiB of UTF-8 JSON, finite numbers only). To show a computer handoff, copy the returned cloud_browser_handoff object to metadata.message_metadata.cloud_browser_handoff unchanged, including tab_id, browser_conversation_id, and connection_thread_id. Explain it in text; reuse the handoff without requesting another.
  // Slack text sends: blocks (an array of objects), unfurl_links and unfurl_media (booleans, both default false); no reply broadcasts. Slack file sends instead accept title, alt_text, and snippet_type as nonempty strings applied to each file.
  metadata?: { [key: string]: unknown; } | null;
  // Exact message text or attachment caption. Optional when attaching files; otherwise required, including for widgets. Maximum 100,000 characters on ChatGPT or 40,000 after rendering on Slack. Slack attachment sends put text only on the first file.
  text?: string | null;
}): Promise<CallToolResult>; };
```

### mcp__codex_apps__cloud_threads_delete_dream_notes

Create cloud tasks on a connected desktop, registered Remote, or saved coding environment, list, read or message tasks, create and list read-only Dreamers, get or change the user's dot's name or pet, and manage shared Dream Notes.

Delete a shared note at one exact path. A successful deletion acknowledges acceptance; reads, lists, and searches may briefly return the deleted file. Serialize with writes and do not blindly retry an uncertain deletion.

exec tool declaration:  
```ts
declare const tools: { mcp__codex_apps__cloud_threads_delete_dream_notes(args: {
  // Absolute logical file path, such as /preferences/style.md. No empty, '.', '..', or trailing path components.
  path: string;
}): Promise<CallToolResult>; };
```

### mcp__codex_apps__cloud_threads_read

Create cloud tasks on a connected desktop, registered Remote, or saved coding environment, list, read or message tasks, create and list read-only Dreamers, get or change the user's dot's name or pet, and manage shared Dream Notes.

Read the latest recorded turn outcome and recent messages of a cloud task. By default, the task must be a direct child in this Orbit. With expanded read access enabled, read any thread App Server Backend authorizes for the current user. No connected desktop is needed. Messages are returned newest first. Pass nextCursor as cursor to read older messages. Recorded status may briefly lag execution. Use when results are needed; do not poll continuously.

exec tool declaration:  
```ts
declare const tools: { mcp__codex_apps__cloud_threads_read(args: { cursor?: string | null; limit?: number; threadId: string; }): Promise<CallToolResult>; };
```

### mcp__codex_apps__cloud_threads_read_dream_notes

Create cloud tasks on a connected desktop, registered Remote, or saved coding environment, list, read or message tasks, create and list read-only Dreamers, get or change the user's dot's name or pet, and manage shared Dream Notes.

Read a shared note by path. Returns at most limit_chars Unicode characters starting at offset_chars. File metadata describes the entire file. Continue with next_offset_chars while has_more is true; concurrent replacements can change later reads. Reads are eventually consistent and may briefly return old data or miss a new file.

exec tool declaration:  
```ts
declare const tools: { mcp__codex_apps__cloud_threads_read_dream_notes(args: {
  limit_chars?: number;
  offset_chars?: number;
  // Absolute logical file path, such as /preferences/style.md. No empty, '.', '..', or trailing path components.
  path: string;
}): Promise<CallToolResult>; };
```

### mcp__codex_apps__cloud_threads_write_dream_notes

Create cloud tasks on a connected desktop, registered Remote, or saved coding environment, list, read or message tasks, create and list read-only Dreamers, get or change the user's dot's name or pet, and manage shared Dream Notes.

Create or atomically replace an entire persistent note shared by this Aeon and its agents. Paths are logical and independent of agent names. Empty text leaves an empty file. The complete file must fit in 1,000,000 UTF-8 bytes. A successful write acknowledges acceptance, not immediate visibility. Do not blindly retry an uncertain write. Use append_dream_notes, when available, to add text without replacing the file.

exec tool declaration:  
```ts
declare const tools: { mcp__codex_apps__cloud_threads_write_dream_notes(args: {
  // Absolute logical file path, such as /preferences/style.md. No empty, '.', '..', or trailing path components.
  path: string;
  text: string;
}): Promise<CallToolResult>; };
```
