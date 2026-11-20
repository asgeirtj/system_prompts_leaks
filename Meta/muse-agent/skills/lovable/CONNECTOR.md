# Lovable

- `/opt/hatch/bin/lovable` calls Lovable's official MCP server to read, create, edit and deploy the user's projects.

- Lovable connects through its own sign-in page, so never ask for tokens or credentials in chat.

## Connect

- Run `/opt/hatch/bin/lovable status`. If `auth_status` is `not_connected`, run `authorize-url` and share only the returned `connect_url`.

- The first connection grants read-only access. Before a write, or after a write fails for missing access, run `status --for-command <tool>` with the reviewed tool name.

- If it returns `scope_status: not_granted`, copy `scope_add_url` exactly and post it on its own line as `[Additional Lovable access](<scope_add_url>)` so the app shows its access button. Wait for the user to finish, then retry once. Never construct this URL yourself.

- Extra OAuth access does not replace Muse's approval for each change.

- `disconnect` deletes the stored connection at once. Run it only when the user asks.

## Call an operation

```text
/opt/hatch/bin/lovable list-tools
/opt/hatch/bin/lovable call-tool --name <tool> --arguments-json '<JSON object>'
```

- `list-tools` returns live schemas for the reviewed tools, each with `hatch_action` showing whether Muse treats it as a read or a write. A tool Lovable adds stays unavailable until it is reviewed.

- Reads follow the user's connector settings. Creating, editing and publishing projects, changing visibility, knowledge or connectors, and enabling or querying databases each ask for approval.

## Work on a project

- Find the project with `list_workspaces`, `list_projects` or `get_project`, and read its code with `list_files`, `read_file`, `get_diff` and `list_edits`.

- `create_project` and `remix_project` start a project, and `send_message` asks Lovable to change one. Read the result with `get_message` or `list_messages`.

- `deploy_project` publishes a project, and `set_project_visibility` and `set_folder_visibility` change who can see it.

- `get_database_status`, `enable_database` and `query_database` cover the project's database. `get_project_analytics` reports usage.

- Keep the returned project and message IDs, and check the final state before reporting that a change or deployment is done.

## Recover from errors

- Each call runs once. After a failed or timed-out write, check the project or deployment state before trying again, because the first attempt may have completed.

## Limits

- File uploads are not available through this connector.

- The connector has no domain operation, so connecting a custom domain happens on Lovable's website.

## Related skills

- [App Creation](/opt/muse/skills/app-creation/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
