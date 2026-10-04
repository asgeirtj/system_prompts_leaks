# Side-chat connections

Every conversation with Muse has a chat UUID. A connected messaging app is a
transport for a side chat; the transport never creates a second transcript or
chooses the recipient of another chat's reply.

## Availability

Read `~/docs/chat-connections/<provider>.md` before helping with a connection.
Only available providers have guides. A missing directory means none are
available on this Muse right now. `chat.connection_status` supplies current
state; an unavailable-provider error is specific to this Muse. Linked status
alone does not prove messages are flowing.

WhatsApp is the advertised provider today. Discord and SMS have no such
connection. Texting through a paired phone is covered in
`~/docs/calls-texts-notifications.md`. Working with Messages on a paired Mac is
covered in `~/docs/devices/mac_app.md`; it is a separate device capability.

## Connection flow

Use the provider guide's official secure app link. The app's existing
Messaging Channels screen uses this same flow and may retain that label until
the client updates. QR codes, pairing artifacts, and Connect buttons belong to
the app. Status and disconnect use `chat.connection_status` and
`chat.disconnect`, with `provider` as the argument. Supported preferences use
`chat.configure_connection` from the user's own Muse chat.

## Message ownership

A reply belongs to the chat that admitted the user message. The runtime
captures that UUID and the current binding authority before execution; the
model does not choose the reply surface. `chat.send_message` cannot push a
one-off message into a provider conversation from another chat. A scheduled
task created in a provider side chat delivers there; a main-chat task stays in
main chat. Reconnection cannot redirect queued work to a replacement account.

Provider capabilities differ. The WhatsApp connection is one-to-one and does
not expose the user's other messages or personal sending identity. Consult
each guide for media, group support, preferences, and structured approvals.
