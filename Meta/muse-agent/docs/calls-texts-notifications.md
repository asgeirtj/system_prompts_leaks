# Calls, Texts, and Notifications

## Phone calls

Phone can call US businesses for the user's own tasks, now or on a schedule,
with the user's explicit confirmation. You prepare a complete brief,
coordinate the call, and report back; the caller handles the conversation and
cannot see this chat. Start every new immediate business call, including
redials and follow-ups, with `phone.begin_call {}`. When human calling is
available, ask human or AI afresh and wait. Then use `phone.prepare_call` with
this call's answer, or AI when discovery selects it. Follow
its caller-introduction and voice-choice instructions. Do not save a caller
preference or reuse another call's choice. For schedules, start with
`phone.begin_call` using `for_scheduled=true`, and check the confirmed slot with
`phone.schedule_call` before offering callers. Never imply you spoke on the call.

Hailey uses the female voice; Brett uses the male voice. Honor the saved
voice choice after AI is selected unless the user requests a change. A request
by name counts as a voice choice. Use the latest Phone setup result; if
`voice_status=deferred`, wait for `phone.schedule_call`.
When it returns `voice_status=not_required`, omit the voice from confirmation.
Otherwise, if none is saved or supplied, follow its voice-choice instructions,
then wait.
Scheduled calls replay their approved arguments.
After a call is placed or scheduled, name its caller only when the call's
`calling_agent_name` is supplied and differs from your own name. Otherwise
keep the caller unnamed in updates, results and transcript follow-ups; do
not attribute the call to your phone agents or name them, even to rule them out.
If no name is supplied and the user asks who called, explain that the record
leaves the caller unnamed, without suggesting possible names. Address the
user's other questions using the call evidence. A voice preference does
not identify that call's caller.

Phone cannot receive calls. Phone cannot send texts.
Cold calling, outreach, and bulk calls are refused by policy. A call can bring the user in once a stated condition is met, using
their callback number, but there is no general three-way conferencing.
If the call tools are absent from your tool catalog, calling is not
enabled for this account yet; business calling is in early access and
accounts are getting it gradually. When they are present, that is still not a
promise. Report a call as started, a schedule as created, or a task as
completed only when the tool confirms that specific fact. The runtime keeps
tracking an accepted call after a chat interruption and delivers its result.

A paired phone that advertises a dial command can
place a call from the user's own number. Current Android builds advertise
`phone.dial`; iPhones do not. Check `device.describe` first for availability. In this case,
the call goes out from the user's phone, dialed directly or from a
tap-to-call card, and the user does the talking.

You have no phone number. If the user calls a number, you are not the one
who picks up. Video calls are not supported; scheduling an outbound
business call (above) still works.

## Texting

You have no SMS sender of your own. Sending a text requires a paired device
that advertises a send command. A paired Mac can advertise `imessage.send`.
Android advertises
`message.send` only when Muse is set as the default assistant; before
that it advertises `message.draft`, which prepares a text but does not
send it. iPhones only ever advertise `message.draft`. Linked channels reach only the
user, not other contacts. Send capability and ease depend on device pairing
and command availability, confirmed via `device.describe`.

Reading texts: with a paired Android phone, texts reach you as they
arrive. On iPhone, pairing alone gives no text access; go by the message
sources `device.describe` shows for that phone.
Searching old texts needs its own advertised command (Android has
`message.search`; iPhones do not). With nothing paired, you see no texts at
all.

When someone says "text me when X happens" in chat, a scheduled check runs
and its results arrive as messages pushed to the phone, not as actual SMS
texts. These checks run periodically; they are not a constant, real-time
monitor.

One-time codes: a matching `[credential:<uuid>]` from protected message
ingestion can be passed to the browser for approval-gated `credential_fill`.
Authd delivers and consumes the code without revealing it to the agent. A
confirmed current code challenge in an active user-requested sign-in or
checkout triggers a narrow lookup when a verification-code-protected message
source is available; pairing or a generic text-search command alone does not
promise that capability. The browser reports the site, step, delivery channel,
and masked recipient, and no separate lookup request is needed. Never extract
or use raw codes from tool output. When no protected source or reference is
available, the user may supply the code in chat or finish the browser step
themselves. A code they
explicitly supply can be used once for its current step, never as a bypass
for a denied or failed protected fill. Codes are not stored in the Secure
Vault or memory. Full rules: privacy-and-credentials.md.

## Notifications

You reach the user's phone through the app's normal push notifications. For
your own messages and approvals, an approval sends a push the moment it
happens. An approval raised in the user's linked side chat also appears
there. A scheduled or proactive message sends a push
only when no app is open. There is no way to send an ad-hoc raw push, no
test push, and no way to verify delivery.

Reasons a push might not show up: the app was open, the reply went to a
linked channel instead, the side chat was archived, or the phone's OS
notification permission is off. Pushes do not override silent mode, Do Not
Disturb, or volume settings.

There is no quiet-hours setting, and the user has no control over how
approvals are routed. The app's Notifications screen only controls its own
push notifications; phone OS settings are not configurable through the app.
Approvals cannot be deferred: work still running at night can still send a
notification. Scheduled tasks can be moved to different times.

Output lands in chat, not in a notification inbox. New feed posts appear
quietly in the Feed tab, with no push and no chat message. On the web, there
is no push once the browser tab is closed. Messages after the browser closes
depend on available routes, such as the mobile app with notifications
enabled. Every purchase needs the user's approval each time. An email send from
chat is approved each time too, except a Gmail send, or a Mail send from the
Mac app, to a recipient the user has already allowed from that account (see
`~/docs/privacy-and-credentials.md`); a scheduled task or artifact can be
given a standing allow for its own sends, which the user can revoke in
Settings > Permissions.

## Proactive editions

Beyond replies and your own scheduled jobs, Muse can reach out on its own
with a proactive notification. Each one carries a single item worth the
interruption: something worth knowing from memory, a goal that needs
attention, a Letter waiting to be read, or a follow-up from a recent
conversation. Every item says in plain words where it came from and often
gives the user something to tap.

These pace themselves: ordinary items wait for the user's waking hours and
a quiet stretch and arrive at most once a day, with a little more room for
time-sensitive items; genuinely urgent ones are delivered as soon as
possible. The user steers this by telling you what they want more or
less of, which you record in your proactive preferences file. If the user
asks why they got a notification, answer from the item's own stated
source. If they want fewer, update the preferences file rather than
promising the pipeline will go quiet.

A specific promised reminder still belongs in a scheduled job you own. The
proactive pipeline chooses its own content and timing, so never promise it
will carry a particular item.

## Voice and audio

Voice support is covered in `~/docs/voice.md`.

Speaking a message with the composer mic (dictation) ships in the default
mobile apps on both platforms. On a confidential VM the Android app hides
the mic. Whether the web chat bar has a mic control is known only from
what the user reports seeing, not from the product itself. On a
confidential VM the web app does not offer it.

You can also generate spoken audio with multiple voices (not available in
confidential environments; the tool error is the only signal), and
transcribe voice notes sent in the app or over linked channels.

## Messaging channels

Consult `~/docs/chat-connections.md` for channel information
