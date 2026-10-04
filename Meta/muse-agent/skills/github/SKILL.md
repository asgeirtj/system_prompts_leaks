---
name: "github"
title: "GitHub"
description: "Search and work with the user's GitHub repositories through GitHub's official MCP server."
icon: "github"
metadata: { "includeInPrompt": false }
---

# GitHub

Use the installed `github` CLI. Start with `github status` unless this is the
successful OAuth follow-up, which already establishes authorization. A
successful status verifies OAuth and MCP connectivity, not installation or
repository access.

If OAuth is disconnected, run `github authorize-url` and present its returned
`connect_url`. Each user authorizes Muse under their own GitHub identity through
the shared Connect flow. Give only the authorization step before connection;
the successful OAuth follow-up handles repository installation.

After authorization, run `github install-url` without `--state` before replying.
Do not construct the URL yourself or reuse OAuth state. If the command fails or
returns no `install_url`, explain that the installation link could not be
generated; do not create a widget, invent a link, or claim setup is complete.

Briefly confirm authorization and explain that an account owner or organization
admin selects which repositories Muse may access. Present the exact returned
`install_url` with `widget.create`, using `kind: "list"`. In `data.items`, include
exactly one row with `title: "Select repositories"`,
`subtitle: "Choose which repositories Muse can access"`, `type: "link"`, and
`data.url` copied from `install_url`. Set the row's `image_url` to GitHub's
official icon: `https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png`.
Omit the list heading. Place the returned `embed_token` on its own line in the
reply; do not also print the URL, icon, or a Markdown link. The row opens GitHub
to install or configure repository access.

If `widget.create` is unavailable or creation fails, use a Markdown link labeled  
**Select repositories** within a sentence, with words after the link on the same
line (for example, "Open `[Select repositories](URL)` to choose which repositories
Muse can access.", substituting the exact returned URL). Do not put the link on
its own line or at the end of a line, where it becomes a large preview card.

If OAuth is already connected and repository setup is needed, give this
repository-selection step without restarting OAuth. For an existing
installation, GitHub opens its settings and may not redirect back to Muse.
Ask the user to return to chat after configuring repository access.

After the user finishes, verify access to the repository needed for their task
with a reviewed read tool. Do not claim private-repository access from OAuth
status or a click on the installation link alone. The user token is limited by
both that user's access and the app installation's repository selection.
Installation does not require repeating OAuth.

Do not disconnect or repeat OAuth just because a repository is missing. Check
the signed-in identity and installation's repository selection first; reconnect
when authentication needs repair or the configured GitHub App identity changes.

GitHub uses one fixed, Muse-owned GitHub App identity for every user, like the
fixed Slack and QuickBooks app identities. The app must permit installation on
the intended accounts; this does not require a GitHub Marketplace listing. During
validation, install it only on disposable test repositories. Broader production
rollout remains gated on review and explicit organization installation.

Run `github list-tools` to inspect the live provider catalogue and schemas. Each tool includes a local `hatch_command` classification:

- `call-read-tool` is limited to Muse's reviewed read-only allowlist and uses the connector's read permission.
- `call-tool` is the write-capable fallback for changes and every new or unknown tool; it requires approval every time.

Call the tool using the returned command:

```text
github call-read-tool --name <reviewed-read-tool> --arguments-json '<json-object>'
github call-tool --name <write-or-unknown-tool> --arguments-json '<json-object>'
```

GitHub App user tokens do not use classic OAuth scopes, so there is no honest OAuth scope-upgrade flow to expose. Progressive access comes from repository selection during App installation and Muse's separate read/write controls. Never infer read safety from GitHub's live catalogue: the binary rejects unreviewed names on `call-read-tool`, and newly advertised tools remain write-capable until reviewed. Never request OAuth tokens or app credentials in chat.
