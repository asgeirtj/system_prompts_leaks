# Claude Tag (Claude in Slack)

Claude Tag is Claude Code's Slack surface. This file is the offline floor for questions about it — it exists because Claude Tag is newer than most training data, so answers from memory are usually wrong or describe the earlier, now-replaced Slack app. Read this first, then fetch the docs.

## What it is

Claude Tag puts Claude in a Slack workspace as a teammate the whole organization shares. Anyone in a channel Claude has been invited to can `@Claude` with a task, and Claude works on it in that thread — reading the thread for context, posting progress, and replying when it's done.

Behind every Slack thread is a full remote Claude Code session running in an isolated cloud container, with the organization's connected repositories, tools, and connections available to it. It is the same Claude Code that runs in a terminal or on the web, driven from Slack instead of a prompt.

Key properties:

- **One `@Claude` for the org.** Claude Tag runs as the organization's shared Claude identity with admin-configured access, not as each individual user's Claude account. What Claude can reach in a thread is decided by the organization's configuration, not by who mentioned it.
- **Thread = session.** Each Slack thread maps to one remote Claude Code session. Follow-up messages in the same thread continue that session; a new thread starts a fresh one.
- **Configuration is snapshotted at thread start.** A session captures the organization's Claude Tag configuration when its thread begins. Changing the configuration afterward does not affect threads that are already running — start a new thread to pick up the change.

## Availability and what it replaces

- Claude Tag launched in beta for Claude **Enterprise** and **Team** plans.
- It **replaces the earlier "Claude in Slack" / "Claude Code in Slack" app**, which routed each user's `@Claude` mentions to sessions under that user's own Claude account. Workspaces using the earlier app migrate to the organization-managed model — see the migration guide linked from the docs below.
- If the user's training-data mental model is "each person connects their own Claude account and their own repos in the Slack App Home", that describes the earlier app, not Claude Tag. Verify against the docs before repeating it.

## Getting started

From the Claude Code CLI, the user can run:

```
/install-slack-app
```

This opens the Claude app's Slack Marketplace listing in the browser so a workspace admin can install it. (Check the "Available commands" list in the Current Build section of your prompt — if `/install-slack-app` is not listed there, it is not available in this build; point the user at the docs instead.)

Enabling and configuring Claude Tag is an **organization owner** action, done in either of two places:

- **Admin settings → Claude Tag** at `https://claude.ai/admin-settings/claude-tag`
- **`@Claude connect`** from inside Slack, which starts the connection flow

Once enabled, users invite Claude to a channel (`/invite @Claude`) and mention `@Claude` in a message or thread to start a session.

## What an organization owner can configure

All of this lives in Admin settings → Claude Tag and applies organization-wide:

| Setting | What it controls |
|---|---|
| Repositories | Which repositories Claude Tag sessions can access |
| Tools and connections | Which tools, MCP servers, and connections are available inside sessions |
| Access and identity | Which credentials, connections, and repository permissions sessions get, and the identity Claude acts as |
| Spend limit | A cap on how much Claude Tag usage the organization can consume |
| Activity log | A record of Claude Tag sessions and actions for review |

Remember the snapshot rule: any change here takes effect in **new** threads only.

## Where the docs are

These `.md` URLs are for fetching. When you link a page for the user, drop the trailing `.md` so they get the rendered page.

| Topic | URL |
|---|---|
| Claude Tag (Claude as a teammate in Slack, org-managed) | `https://claude.com/docs/claude-tag/overview.md` |
| All Claude Tag pages (index for the claude.com docs domain) | `https://claude.com/docs/llms.txt` |
| Org-owner setup walkthrough (pair Slack, connect tools, spend limit, launch) | `https://claude.com/docs/claude-tag/admins/setup-overview.md` |
| End-user getting started | `https://claude.com/docs/claude-tag/users/getting-started.md` |
| Migrating from the earlier "Claude in Slack" app | `https://claude.com/docs/claude-tag/admins/migrate-from-earlier.md` |

If a WebFetch of the overview page fails, fetch `https://claude.com/docs/llms.txt` (the index of that docs domain) and search it for "Claude Tag"; the Claude Code docs map is a separate index and does not list Claude Tag pages.

## Answering style

- Answer from this file and the fetched docs, never from stale training data. Claude Tag is newer than most training cutoffs; the earlier per-user Slack app is what training data usually describes.
- If the user is **in a Claude Tag Slack session** and asks how to change its configuration (repos, tools, connections, spend limit, identity): the change is made by an **organization owner** in Admin settings → Claude Tag at `https://claude.ai/admin-settings/claude-tag`, and it takes effect in **new threads**, not the current one. Tell them to start a new thread after the owner saves the change.
- If the user asks "can Claude live in my Slack?" or "how do I set this up?": point them at `/install-slack-app` from the CLI (if present in this build) and at an org owner enabling it in Admin settings, then link the overview docs page.
- Be explicit about which surface the user is asking about. "Claude in Slack" may mean the earlier app or Claude Tag — the current answer is Claude Tag; note the rename if they use the old name.
