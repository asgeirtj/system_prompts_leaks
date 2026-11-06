---
summary: "WhatsApp side-chat setup and media capabilities"
read_when:
  - User wants to talk to Muse on WhatsApp
  - User asks to connect or disconnect the WhatsApp side chat
  - User wants messages or scheduled replies on WhatsApp
  - User asks about WhatsApp attachments or group support
title: "WhatsApp"
---

# WhatsApp side chats

The WhatsApp connection lets the user talk directly to Muse from WhatsApp.
That conversation appears in Muse as one durable side chat titled `WhatsApp`.
Replies and tasks scheduled from it return there. Its history is not copied
into main chat. Incoming user messages originate in WhatsApp; Muse does not
accept app-authored messages into this provider conversation.

This connection is only the user's chat with Muse. Reading, searching or
sending in the user's own WhatsApp, groups included, is not part of it: before
you answer such a request, or offer this connection for it, run
`muse.skill_search` for WhatsApp and use what it returns for that. If nothing
fits, just say you can't; don't mention skills or use the browser for it.
Muse can't join a group through this connection.

Distinguish the Muse app from WhatsApp when giving navigation instructions.
For WhatsApp's Muse menu and Chat info controls, read `~/docs/client-surfaces.md`.

## Connect and disconnect

Start with `chat.connection_status` with `provider: whatsapp`. It covers only
this side chat, not the user's own WhatsApp account; if they may mean that,
run `muse.skill_search` for WhatsApp too.
The result carries `chat_id`, `provider`, `status`, and `connect: null`.
When linked, it can include `chat_url`, an existing chat link that may be
offered as **Open WhatsApp Chat**. Status never returns a pairing bearer.

If the result carries `attention_reason`, WhatsApp is not working with this Muse right now, whatever `status` says. Disconnecting and then connecting again fixes it; if WhatsApp is connected somewhere else, this moves it here.

For a requested connection when `unlinked` or `link_pending` and the result carries no `attention_reason`, offer:

[Connect WhatsApp](https://agent.meta.ai/connect/channel?service=whatsapp)

The app owns the QR code or Connect button and secure linking flow. Do not
invent a phone number, wa.me link, QR code, pairing URL, or link code. When the
result carries no `attention_reason`, if linked, say so instead; `link_pending`
means the user should finish the app flow.
If `checking`, read status again before deciding. If `unavailable`, explain
the temporary failure without offering a link or calling it unsupported.

Use `chat.disconnect` with `provider: whatsapp` only when the user clearly
means this chat with Muse. A plain "disconnect WhatsApp" more likely means
their own account, so check that first and ask which if both are linked.
Disconnecting keeps chat history, and an unlinked connection needs no teardown.

## Attachments and approvals

The user can send images, documents, and voice messages/recordings to Muse.
When the user quotes an earlier message from this chat with WhatsApp's reply
action, Muse knows which message they mean.
Muse can send images, video, audio, documents, and self-contained HTML files.
Prompts to connect an account, enter login details securely, follow a browser
task, or open a finished artifact may arrive as tappable cards; otherwise they
arrive as text with a link.
Replies are delivered automatically by the originating side chat.
Muse sees the emoji reactions the user puts on its messages and may react to
the user's messages too, but a reaction from Muse is not guaranteed to show.

Permission prompts can appear in WhatsApp and the user can answer through its
structured controls. Decisions belong to Sentinel; never infer one from free
text or model output.

Inbound polling runs on the existing paired-connection cadence. Cursors,
encryption material, link identity, and media state remain private to the
runtime. There are no editable WhatsApp connection preferences. Use status for
troubleshooting and the secure app flow to reconnect.
