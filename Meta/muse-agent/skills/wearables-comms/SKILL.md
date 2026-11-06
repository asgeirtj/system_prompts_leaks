# Calls and Texts from Glasses

## Choose the route

- Treat "call Alice" as a native phone call the user will speak on, not a conversation Muse conducts.

- Calling is native only. For a call through WhatsApp, Messenger, Instagram or another app, reply only with a brief "I can't do that at the moment" in the user's language, and do not place or offer a native call instead.

- Texts default to native SMS when the user names no app. For a named app, read its connector docs and use that route, because app messages are never device commands. If the app is not connected, give the same brief refusal without starting setup, switching to SMS or offering another route. Check an unfamiliar app before calling it unsupported.

- When the user asks what the glasses can do or which accounts are connected, answer normally.

## Emergency numbers

- Glasses cannot call 911, however it is written or spoken. Tell the user at once to call from their phone, without searching contacts or invoking a call. A non-emergency police, fire or ambulance number, or a contact the user calls their emergency contact, is an ordinary call.

- An `emergency-unsupported` result ends the attempt even when the request did not look like 911. Report it at once, without another search, command or device.

## Use the device the request came from

- Use the current turn's `[device_id=...]`, the exact paired-device ID, for both the contact search and the action. On the first attempt, invoke the commands below directly, without `device.list` or `device.describe`, because `device.invoke` checks them against the device's current commands.

- When the user asks to try again after setup or missing commands blocked a call or text, run `device.describe` on the same device before deciding it is still unavailable. Also refresh when the user reports a connector or setup change, or asks which commands are advertised. Use the current advertised command and schema for an authorized action; an earlier description or failure does not establish current capabilities.

- After directing the user to settings in the Meta AI app, run `device.describe` before reassessing availability. Connecting Phone under Communicate hands-free can sync another copy of the contacts to Muse. After that setup change, repeat the stored contact search and its recovery lookups instead of relying on an earlier empty result.

- A setup update or a request to check capabilities authorizes the check only. Do not retry a failed call or text unless the user asks to retry it.

- Without a device ID, use `device.list` only to find the one device marked `is_request_origin: true`, and say so if none is clear.

- Unless a specific phone is mentioned by name, requests to text or call from the phone should still use the device the request came from, which calls through the phone paired to it.

- Change devices only when the user asks, matching their words with `device.list` and asking if several fit. Send call controls to that device as they are. For a new call or text, run `device.describe` there and use its advertised command and schema.

- Never move an action to a paired phone or another wearable because the selected device is offline or rejects the command.

## Answer, decline or cancel a call

- Invoke `wearables.comms.resolve.call` once, right away, with `params_json` holding only `action`: `answer` or `decline` for an incoming call, `cancel` for an outgoing call that is still dialing. Skip contact and call-state lookups. The device decides whether a matching call exists, and trying without one is harmless.

- These controls never end a connected call or this voice session, so "hang up", "end the call", a sign-off or an unrelated "cancel" is not a cancellation. "Never mind" cancels only when a dialing call was the subject a moment before, and a bare device name or ordinal picks a control only when it answers your own question about which device.

## Find the person and number

- Skip the search when the user gave a complete number or an announced message supplies one. Otherwise search the selected device's stored contacts first, even when it is online. Add `--phone-label LABEL` for a requested mobile, home, work or other saved number, and `--locale BCP47` when you know the user's locale:

```bash
/opt/hatch/bin/device-data contacts search --match-mode ranked --device DEVICE_ID --query NAME
```

- Read the whole result, including `selection_evidence` and every candidate's `match` and `phone_selection`. Treat `exact_full`, `exact_tokens`, `nickname` and `phonetic` matches all as plausible readings of a spoken name. An exact spelling does not outrank a homophone, because speech recognition chose it. Ask when `requires_spoken_name_clarification` is true or when plausible candidates have different numbers.

- Settle the line after the person. Ask when `requires_phone_clarification` is true, unless the user already picked a numbered line you read out. If `requested_label_match_count` is zero, say no saved number has that label and offer the lines there are. If `distinct_usable_phone_count` is zero, ask for a number.

- Never pick the first or preferred number yourself, and never act on an incomplete search, a weak match or an unsettled line. Stored forms grouped into one option are one destination. When only one offered line is left, the user's confirmation selects it.

- When a complete stored search finds no one, follow [recovery](references/recovery.md) before giving up.

## Ask a clear question

- With five or fewer person-and-line choices, read a numbered list in the returned order. Give each name, its `spoken_spelling` when names collide, a short line label when the person has several lines, the option's `spoken_suffix` when labels are missing or repeated, and an organization only when it separates similar contacts.

- Put commas between spelled letters and digits so they are spoken one at a time, and end with "Which one should I call?" or "Which one should I message?". For example: "1, Sean, spelled S, E, A, N, mobile. 2, Shawn, spelled S, H, A, W, N, work. Which one should I call?"

- With more than five choices or an incomplete search, ask one narrowing question, such as a last name, organization, line label or final digits, and search again.

- An ordinal selects only from a list you read out in full. A name, spelling, organization or label selects only when it matches exactly one option, and a repeated bare name settles neither a spoken-name collision nor a line. Keep your options in the order you gave them.

## Place the call or send the text

- For a call, invoke `wearables.comms.provider.call` with `phone_number`, `provider: phone` and `contact_name`, which is the resolved name or else the number.

- Only one call can be active at a time, and placing a call ends this voice session. When the user asks for a new call, it replaces any earlier call they asked for that hasn't been placed yet.

- For a text, invoke `wearables.comms.native.sms` with `phone_number`, the user's original `message` and `contact_name` when a contact was resolved. The message never decides the recipient. Hold it unchanged while you clarify, then send it without asking the user to repeat it.

- A draft or send command on a paired phone does not fulfill a text from the glasses. If the glasses cannot send it, say so.

## Reply to announced messages

- The turn's announcement note says how to fetch the messages, which one the user means and how to answer an `sms` sender directly. Never guess a sender or contents, and say so when the fetch fails.

- Reply through the message's own provider, using the routes above. For `mms`, `rcs` or `imessage`, say you can reply here only by text and ask first. For `other`, ask how to reply.

- An `sms` message's `is_group` decides who a reply reaches. When it is `true`, reply to the whole group: add `reply_to_event_id` set to the message's `event_id` and, when the message has `group_members`, that exact list, and say the reply went to the group; if the user asks to reply only to the sender, leave both out and say only the sender got it. When it is `false`, the sender is the only other person. When it is absent, a reply reaches only the sender: decline a group reply and ask before sending to the sender alone, and the first time you reply to one, say replies go only to the sender. If a group reply's result confirms it was not sent, such as a declined or expired approval, say the group did not get it and ask before sending it to the sender alone; once the device was asked to send, a timeout, interruption or transport error may mean it already reached the group, so say so and do not retry. Never resend it without `reply_to_event_id` on your own.

## Report the result

- Report success only when `device.invoke` does. For a call control, an inner `ok: false` or error is a failure even when the outer call succeeded, and when there was no call to control, say so briefly. Relay a useful failure reason without internal command names or private contact details.

- Only `node_command_unsupported` and `invalid_command_params` mean the device refused before acting. Describe the same device once and retry once with a compatible advertised command, asking for any newly required input, or say the device cannot do it.

- After a timeout, interruption or transport error the action may already have happened, so do not retry or switch devices.

- For a timed-out text, keep the uncertainty and duplicate warning in the spoken reply, in the user's language: "I can't confirm whether the message was sent. Check Messages on your phone before trying again, because another attempt could send a duplicate." Do not automatically resend or treat the timeout as a setup failure.

- When contacts have never synced, a text fails with `map_not_connected`, or a fresh description advertises no calling or texting commands, follow [recovery](references/recovery.md) before replying.

## Available connectors

- [Messenger](/opt/hatch/connectors/messenger_read/CONNECTOR.md) for a message the user asks to send through Messenger.

- [Instagram Messages](/opt/hatch/connectors/instagram_messages/CONNECTOR.md) for a message the user asks to send through Instagram.

- Use `muse.connector_search` to find other connectors and `muse.skill_search` to find related skills.

- If nothing here fits, look on the web for a maintained API or MCP server and set it up with [Custom Connectors and MCPs](/opt/muse/skills/custom-connector-setup/SKILL.md), or build a custom connector.

### When available

- These connectors depend on the user's channel or devices. `muse.connector_search` shows which ones this session has.

- [WhatsApp](/opt/hatch/connectors/whatsapp/CONNECTOR.md) for a message the user asks to send through WhatsApp.

## Alternatives for better results

- A complete phone number from the user avoids a contact search when contacts are missing or a name keeps colliding.

- When the selected glasses are offline or reject a native call or text, say so plainly. The user can still place it from their phone.
