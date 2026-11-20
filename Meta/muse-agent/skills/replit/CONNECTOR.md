# Replit

- `/opt/hatch/bin/replit` calls Replit's official MCP server to find, create, update and publish the user's apps.

- Replit connects through its own sign-in page, so never ask for tokens or credentials in chat.

## Connect

- Run `/opt/hatch/bin/replit status`. If `auth_status` is `not_connected`, run `authorize-url` and share only the returned `connect_url`.

- The first connection grants read-only access. Before a write, or after a write fails for missing access, run `status --for-command <tool>` with the reviewed tool name.

- If it returns `scope_status: not_granted`, copy `scope_add_url` exactly and post it on its own line as `[Additional Replit access](<scope_add_url>)` so the app shows its access button. Wait for the user to finish, then retry once. Never construct this URL yourself.

- Extra OAuth access does not replace Muse's approval for each change.

- `disconnect` deletes the stored connection at once. Run it only when the user asks.

## Call an operation

```text
/opt/hatch/bin/replit list-tools
/opt/hatch/bin/replit call-tool --name <tool> --arguments-json '<JSON object>'
```

- `list-tools` returns live schemas for the reviewed tools, each with `hatch_action` showing whether Muse treats it as a read or a write. A tool Replit adds stays unavailable until it is reviewed.

- Reads follow the user's connector settings. Creating, updating and publishing apps each ask for approval.

## Work on an app

- Find the app with `search_apps`, `resolve_app_by_name` or `list_apps`. Use `ask_question` to learn how an existing app works before changing it.

- `create_app_from_prompt` builds a new app and `update_app_using_prompt` changes one. Describe the outcome, the users and the data the app needs.

- `publish_app` publishes an app, and `get_publish_status` reports where publication stands. Open the published URL before handing it over.

- Keep the returned app ID and any job ID, and check the resulting app before reporting completion.

## Recover from errors

- Each call runs once. After a failed or timed-out write, check the app or its publish status before trying again, because the first attempt may have completed.

## Limits

- The connector has no domain operation, so connecting a custom domain happens on Replit's website.

## Related skills

- [App Creation](/opt/muse/skills/app-creation/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
