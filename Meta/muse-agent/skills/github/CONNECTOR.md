# GitHub

- `/opt/hatch/bin/github` calls GitHub's official MCP server for repositories on public GitHub. It does not support GitHub Enterprise Server or another MCP endpoint.

- Each user authorizes Muse under their own GitHub identity, then an account owner or organization admin installs the Muse GitHub App on the repositories it may reach. Never ask for tokens or app credentials in chat.

## Connect the account

- Run `/opt/hatch/bin/github status` unless you are continuing directly from a successful OAuth connection. A connected status proves OAuth and MCP connectivity, not access to any particular repository.

- If `auth_status` is `not_connected`, run `authorize-url` and present the returned `connect_url`. Give only this authorization step before the connection completes, because the follow-up after OAuth handles repository selection.

## Select repositories

- After authorization, run `install-url` without `--state` before replying. Never construct the URL yourself or reuse OAuth state.

- If the command fails or returns no `install_url`, explain that the installation link could not be generated. Do not create a widget, invent a link or say setup is complete.

- Briefly confirm the authorization and explain that an account owner or organization admin chooses which repositories Muse can access. Present the exact `install_url` with `widget.create_list_widget`, with no list heading and this one item:

```json
{"title": "Select repositories", "subtitle": "Choose which repositories Muse can access", "type": "link", "data": {"url": "<install_url>"}, "image_url": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"}
```

- Put the returned `embed_token` on its own line. Do not also print the URL, the icon or a Markdown link.

- If the widget is unavailable or fails, use a Markdown link labeled **Select repositories** inside a sentence that continues after it, for example "Open [Select repositories](<install_url>) to choose which repositories Muse can access." A link alone on a line or at the end of one becomes a large preview card.

- When OAuth is already connected and only repository setup is needed, give this step without restarting OAuth. For an existing installation GitHub opens its settings and may not return to Muse, so ask the user to come back to the chat when done.

## Confirm access

- After the user selects repositories, verify access to the repository the task needs with a reviewed read tool. OAuth status or a click on the installation link does not prove private repository access.

- Access is the overlap of the user's own GitHub permissions, the App's permissions and the repositories selected for the installation. If a repository is missing, check the signed-in identity and the installation's repository selection first.

- Do not disconnect or repeat OAuth because a repository is missing. Reconnect only when authentication needs repair or the GitHub App identity changes.

## Call an operation

```text
/opt/hatch/bin/github list-tools
/opt/hatch/bin/github call-read-tool --name <reviewed-read-tool> --arguments-json '<JSON object>'
/opt/hatch/bin/github call-tool --name <write-or-unknown-tool> --arguments-json '<JSON object>'
```

- `list-tools` returns GitHub's live tools and schemas, each marked with the command to use in `hatch_command`.

- `call-read-tool` runs only the reviewed read-only tools under the connector's read permission: `get_file_contents`, `get_issue`, `get_me`, `get_pull_request`, `get_pull_request_files`, `get_pull_request_status`, `list_commits`, `list_issues`, `list_pull_requests`, `search_code`, `search_issues`, `search_repositories` and `search_users`. It rejects any other name.

- `call-tool` runs writes and every new or unknown tool, and each call asks for fresh approval. Never infer that a tool is safe to read from GitHub's live catalog.

- GitHub App user tokens have no OAuth scopes to upgrade. Repository selection and Muse's separate read and write controls decide access.

## Make changes safely

- For requests to upload or push local files, read
  [references/snapshot-push.md](references/snapshot-push.md) before creating a
  branch or writing, including when files may be binary or their encoding is
  unknown. The guide determines whether a snapshot fits the request.

- Resolve the repository, branch and issue or pull request before acting, and preserve unrelated work.

- Read the result back after a change. After a timeout or an uncertain write, inspect the current state before trying again, because the first attempt may have succeeded.

- A local checkout or the GitHub website may suit a task the MCP tools do not cover. A connector limit does not mean the task is impossible.

## Related skills

- [App Creation](/opt/muse/skills/app-creation/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
