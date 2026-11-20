# Slack

- Slack is the user's work chat. Run `/opt/hatch/bin/slack`, which calls Slack's official MCP server with the user's own Slack account, so everything it posts appears under the user's name.

## Connect

- Run `status`. If it reports `not_connected`, run `authorize-url` and share only the returned `connect_url`. Never ask for tokens or app credentials in chat.

- Slack connects through Muse's registered Slack app, so a workspace can connect only where that app is available.

- Run `disconnect` only when the user asks to disconnect Slack. It removes the stored connection.

```text
/opt/hatch/bin/slack status
/opt/hatch/bin/slack authorize-url
```

## Find and call a tool

- Run `list-tools` for the reviewed tools and their live input schemas, with each tool's `hatch_action` showing whether Muse treats it as a read or a write. Provider tools that have not been reviewed stay unavailable, even when Slack advertises them.

- Build `--arguments-json` as one JSON object from that schema, and never guess a tool name or required field. Follow the returned pagination fields to read more.

```text
/opt/hatch/bin/slack list-tools
/opt/hatch/bin/slack call-tool --name <tool> --arguments-json '<json-object>'
```

- The reviewed tools search messages, channels, people and emoji, and read channels, threads, canvases, profiles, members and reactions. They also send, schedule and draft messages, add reactions, create conversations, and create or update canvases.

## Send as the user

- Resolve the channel, person or thread from current results before writing, and reply in the thread the user means.

- By default, sends, scheduled messages, drafts, reactions, new conversations and canvas changes ask for approval with a preview of their arguments. Reads follow the user's connector settings.

- A draft lets the user review and send the message from Slack themselves. Offer one when they want to check the wording there first.

## Check the result

- Never retry a failed or timed-out write automatically. Read the channel or thread first, because Slack may already have posted it.

- Files shared in Slack cannot be read, and files cannot be uploaded through this connector.

## Related skills

- [Messaging Other People](/opt/muse/skills/messaging/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
