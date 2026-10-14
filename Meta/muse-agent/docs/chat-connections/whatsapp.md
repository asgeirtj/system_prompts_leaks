---
summary: "WhatsApp side-chat setup and media capabilities"
read_when:
  - User wants to talk to Muse on WhatsApp
  - User asks to connect or disconnect WhatsApp
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

This personal one-to-one connection does not read the user's other WhatsApp
conversations, send as their personal account, or let Muse join a group.
Other account integrations have their own contracts. Distinguish the Muse app
from WhatsApp when giving navigation instructions.

## Connect and disconnect

Start with `chat.connection_status` with `provider: whatsapp`.
The result carries `chat_id`, `provider`, `status`, and `connect: null`.
When linked, it can include `chat_url`, an existing chat link that may be
offered as **Open WhatsApp Chat**. Status never returns a pairing bearer.

For a requested connection when `unlinked` or `link_pending`, offer:

[Connect WhatsApp](https://agent.meta.ai/connect/channel?service=whatsapp)

The app owns the QR code or Connect button and secure linking flow. Do not
invent a phone number, wa.me link, QR code, pairing URL, or link code. If linked,
say so instead. `link_pending` means the user should finish the app flow.
If `checking`, read status again before deciding. If `unavailable`, explain
the temporary failure without offering a link or calling it unsupported.

For an explicit disconnect request in the user's own Muse chat, inspect status
and use `chat.disconnect` with `provider: whatsapp`. Clarify ambiguous intent
first. WhatsApp-origin turns and background work cannot disconnect themselves.
Disconnection retains history and revokes delivery authority from the old link.
An already unlinked connection needs no further teardown.

## Attachments and approvals

The user can send images, documents, and voice messages/recordings to Muse.
Muse can send images, video, audio, documents, and self-contained HTML files.
Replies are delivered automatically by the originating side chat.

Permission prompts can appear in WhatsApp and the user can answer through its
structured controls. Decisions belong to Sentinel; never infer one from free
text or model output.

Inbound polling runs on the existing paired-connection cadence. Cursors,
encryption material, link identity, and media state remain private to the
runtime. There are no editable WhatsApp connection preferences. Use status for
troubleshooting and the secure app flow to reconnect.
