---
name: "wearables_comms"
title: "Wearables Calls and Messages"
description: >-
  Required for wearable-originated calls and text messages: resolve recipients
  for new calls and messages, and immediately answer, decline, or cancel calls
  on the originating wearable instead of silently switching to a paired phone.
metadata: { "includeInPrompt": true, "devices": ["audio-wearable", "mcu-wearable"] }
---

# Wearables Calls and Messages

## Purpose

Handle call and text-message requests that originate on a wearable. Resolve a
named recipient for a new call or message from that wearable's synced contacts.
For an incoming or still-dialing call, send the requested call control directly
to the originating wearable. Do not silently hand an action to a paired phone.

An ordinary request such as "call Alice" means a native call where the user
speaks. This workflow does not cover a request for the assistant to conduct the
conversation itself.

## Emergency calls

If the user asks to call the 911 emergency line, including "nine one one" or a
formatted variant, do not search contacts or invoke any call command. Tell the
user immediately that glasses cannot place 911 calls and that they need to use
their phone to call 911. A request to call a non-emergency police, fire,
or ambulance number remains an ordinary call. The same is true for a personal
contact whom the user describes as their emergency contact.

If any call attempt returns `emergency-unsupported`, treat that result as
terminal even when the request did not match the rule above or contact lookup
resolved a name to 911. Report the restriction immediately. Do not perform
another lookup or retry through another advertised calling command or device.

## Default workflow: use the current wearable

For every native call or message action in this skill, use the originating
glasses' device id from the **current** user turn's `[device_id=...]` tag. This
tag is already the exact paired-device id. Do not call `device.list` or
`device.describe` before the call, message, or call-control command: the
documented command ids and argument shapes below are the default, and
`device.invoke` validates them against the device's current advertisement
before dispatch.

Keep that same device id for the initial stored-contact lookup and the final
action. A complete zero-candidate stored search may use other paired devices
for lookup only, as described in recovery below; it never changes the action
device, and the user must explicitly confirm a disclosed fallback match before
it can authorize a call or message. Only an explicit request to use another
device overrides the action target; follow the exceptions below in that case.

## Answer, decline, or cancel a call immediately

For a direct request to answer or pick up an incoming call, use the `answer`
action. For a request to reject an incoming call or send it to voicemail, use
`decline`. For a request to stop an outgoing call that is still dialing, use
`cancel`. The device decides whether a matching call exists; do not search for
call state or ask whether a call is ringing or dialing first. An attempted
control on a device without such a call is harmless.

These are not controls for an already connected phone call or for this voice
conversation. Do not interpret "hang up", "end the call", a conversational
sign-off, or an unrelated "cancel" as an outgoing-call cancellation. A brief
"never mind" means cancel the outgoing call only when the immediately preceding
context makes that intent clear. A bare device name or ordinal selects a call
control only when it answers your immediately preceding device clarification
for that same action.

Immediately call `device.invoke` once on the selected device with command
`wearables.comms.resolve.call` and `params_json` containing just the selected
`action` (`answer`, `decline`, or `cancel`). Use the documented action schema;
dispatch validates it against the current advertisement. Skip contact lookup and other
discovery. Do not automatically retry a failure or uncertain result except for
the pre-dispatch compatibility recovery below.

## Resolve a recipient

Skip contact lookup when the user supplied a complete phone number. Otherwise,
search the stored contacts first, even when the wearable is online:

```bash
device-data contacts search --match-mode ranked --device <selected_device_id> \
  --query <contact_name>
```

Pass `--phone-label <label>` when the user requested a mobile, home, work, or
other saved number, and `--locale <bcp-47>` when the caller's locale is known.
Ranked results are candidates, not authorization to act. Inspect the complete
result, including `selection_evidence`, every candidate's `match`, and every
candidate's `phone_selection`, before invoking a command.

- Treat `exact_full`, `exact_tokens`, `nickname`, and `phonetic` candidates as
  plausible interpretations of a spoken name. An exact textual match does not
  outrank a plausible homophone: the transcript's spelling came from speech
  recognition, not the user. When
  `requires_spoken_name_clarification` is true, ask a short clarification
  before invoking. Use each collision entry's `spoken_spelling` when
  pronunciation alone cannot distinguish the names.
  More than one plausible candidate with different phone destinations also
  requires clarification, even when the first candidate is an exact match.
- Resolve a phone line separately after resolving the person. If
  `requires_phone_clarification` is true, ask which saved line to use unless
  the user explicitly selected one of the numbered line options you presented.
  If `requested_label_match_count` is zero, say that no saved number has the
  requested label. If `distinct_usable_phone_count` is zero, ask the user for
  a number. Otherwise present the available lines under the rules below and
  use one only after the user selects it. When only one line remains, an
  explicit confirmation selects it.
  Never choose the first or preferred-order number. Multiple stored forms
  grouped into one phone option are one destination, not an ambiguity.
- Do not invoke a call or message from an incomplete search, a weak or
  unresolved name match, or an unresolved phone choice.

## Ask for clarification

When there are at most five selectable contact and phone-line combinations,
give one numbered option for each, keeping ranked contact order and the
returned phone-option order. Include the contact name, its `spoken_spelling`
when it has a spoken-name collision, and a concise phone label when the contact
has multiple lines. If labels are missing or repeated, add the option's
`spoken_suffix` so every spoken choice remains distinguishable. Add an
organization only when it helps distinguish otherwise similar contacts. Use
commas between spelled letters and digits so TTS speaks them separately. For  
example:

"1, Sean, spelled S, E, A, N, mobile. 2, Shawn, spelled S, H, A, W, N, work.
Which one should I call?"

When presenting numbered options, end with a question that matches the
requested action: "Which one should I call?" for a call or "Which one should I
message?" for a message. Build message options with the same rules as call
options, and never replace a bounded numbered list with a bare name question.

When more than five combinations remain, or the search is incomplete, do not
read a partial list. Ask one short question that narrows the person first, such
as their last name or organization, then search again. If one resolved contact
still has more than five lines, narrow by phone label or final digits before
presenting options.

Only after you actually presented the complete numbered list may an ordinal on
the next turn select its corresponding option. A name, spelling, organization,
or phone label selects an option only when it identifies exactly one of them.
A bare contact name does not choose a line when that contact still has multiple
numbered line options. A repeated bare name also does not resolve a spoken-name
collision, because ASR may choose the same spelling again; require the option
number, deliberate spelling, or another distinguishing detail. Do not reorder
the presented options while interpreting the answer.

If the stored search does not resolve exactly one recipient and line, do not
invoke the call or message command. A complete zero-candidate search may use
the cross-device recovery below. Otherwise follow the clarification rules.

## Place a call

Call `device.invoke` on the selected wearable with command
`wearables.comms.provider.call`. Set `params_json.phone_number` to the supplied
or resolved number and `params_json.provider` to `phone`. Always set
`params_json.contact_name` too: use the resolved contact name when available,
or the supplied phone number otherwise. Do not call `device.describe` first.
Dispatch rejects a device that does not currently support the command or
arguments.

## Send a message

Require both a resolved recipient and the message text. Select the native SMS
command by calling `device.invoke` on the selected wearable with command
`wearables.comms.native.sms`. Set `params_json.phone_number` to the supplied or
resolved number and `params_json.message` to the user's text; include
`params_json.contact_name` when a named contact was resolved. Do not call
`device.describe` first. Dispatch rejects a device that does not currently
support the command or arguments.

Apply the recipient and phone-line resolution and clarification rules above
before sending; a supplied message body is not evidence for choosing a
recipient. When clarification is required, keep the user's original message
text unchanged. Once those rules resolve exactly one recipient and line, send
that original text to it without asking the user to repeat it. Do not send to
any candidate before then.

Do not substitute a draft or send command from a paired phone. If the wearable
cannot send the message, report that instead of creating a draft somewhere the
user may never see.

## Recovery and explicit device overrides

### The user selected another device

Call `device.list` to map the user's description to the intended device. If
more than one device fits, ask which one they mean. For answer, decline, or
cancel, invoke the fixed call-control command on the selected device without
calling `device.describe`. For a new call or message, call `device.describe`
on the selected device, then use its advertised call or SMS command and schema
instead of the fixed wearable commands above.

### The current turn has no device id

When the user named no device and the current turn has no trustworthy device
id, call `device.list` only to find the one `is_request_origin: true` device.
If it cannot identify one, explain that you cannot tell which device to use.

### Stored contacts returned no candidates

Do not use another device to settle a weak, ambiguous, incomplete, or
numberless result from the selected device. Search other devices only when the
selected device's stored search is complete and its `count` is zero. If it
returns any candidate, including a weak one, follow the resolution and
clarification rules above instead.

After a complete zero-candidate result, call `device.list` and search the
stored contacts on every other paired device:

```bash
device-data contacts search --match-mode ranked --device <fallback_device_id> \
  --query <contact_name>
```

Finish every fallback-device search before choosing, and treat all results as
one candidate set under the resolution and clarification rules above. If any
search is incomplete or the combined set does not resolve exactly one
recipient and line, ask for clarification. Once exactly one recipient and line
remain, present that fallback match as one numbered option, say that it came
from another paired device, and ask the user to confirm it for the requested
call or message. Only an affirmative answer to that disclosed confirmation
authorizes using the fallback phone number. Then invoke the selected wearable.
Never invoke a fallback device.

Only when every stored search is complete and each has `count` zero, inspect
the selected device's description, reusing it if an explicit device override
already required one. If it advertises `contacts.search`, invoke that command
on the selected device with its advertised schema. This live lookup is the one
exception to the default workflow. Do not run a live contact search on any
device before exhausting the stored searches, and never run one on a fallback
device.

### The advertised command or schema changed

If the documented call, message, or call-control invocation returns
`node_command_unsupported` or `invalid_command_params`, it was rejected before
dispatch. Call `device.describe` once on the same selected device and inspect
its current commands and schemas. If it advertises a compatible command for
the requested action, retry once using that command and its advertised schema.
Ask for any newly required user input rather than inventing it. If there is no
compatible command, report that the selected device cannot perform the action.

Do not use this recovery for a timeout, interruption, transport error, or any
other failed or uncertain result: the action may already have happened. Do not
switch devices during recovery.

Never silently switch to a paired phone or another wearable because the
selected device is unavailable or rejects the command.

## Report the result

- Report success only when `device.invoke` reports success.
- For call controls, inspect the device's result too: an inner `ok: false` or
  error is a failure even if the outer tool call succeeded. If there was no
  incoming or outgoing call to control, say so briefly without retrying.
- Relay a useful device-provided failure explanation without exposing internal
  command names or private contact details.
- Do not blindly retry a timed-out, interrupted, or uncertain call, send, or
  call control; the action may already have happened.
