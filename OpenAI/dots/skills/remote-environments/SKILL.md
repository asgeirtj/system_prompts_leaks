---
name: remote-environments
description: "Discover available task environments and create or continue tasks when the user names an environment or computer, or refers to files or apps specifically on their computer. Excludes software engineering; use orbit:software-engineering for that."
---

# Remote environments

Do not use this skill for software engineering. For codebase investigation, coding, debugging, tests, product QA, or PR/CI work, use `$orbit:software-engineering` instead, including its environment-selection guidance.

Use this skill in the parent dot for other tasks. If you are already the assigned task, work in your selected environment.

For follow-up work in a task whose environment the user already selected, go straight to **Follow through**. Keep its `threadId` and selected environment.

This skill covers both collections returned by `cloud_threads.list_environments`: existing user computers and registered remotes in `environments`, and personal and workspace-shared saved coding configurations in `codingEnvironments`. The dot cloud computer is separate and is not included in that list.

## Decide where to work

Use the dot cloud computer for all computer work unless:

- The user asks to use a specific environment or computer. Use that environment or computer.
- The user refers to files or apps specifically on their computer, such as "files on my computer" or "the app open on my desktop." Use the user's computer.
- The browser tool's documentation calls for a local browser fallback. Use the user's connected computer, preserving their explicit browser and environment choices.

A request for a cloud task alone does not select another computer. The dot cloud computer remains the default.

## Discover and choose

- Call `cloud_threads.list_environments`. Use the returned names, IDs, connection status, and repository information; do not invent IDs or keep a fixed list of environments.
- Read both collections. Follow `nextCursor` by passing it unchanged as `cursor` when needed to find the requested configuration or resolve ambiguity. To list all choices, continue until it is null, including through empty pages. Computer entries repeat across pages; list each computer once.
- Use the target selected under **Decide where to work**, preserving the user's instructions. "Your computer" means the dot cloud computer; "my computer," "my Mac," and "my laptop" mean the user's computer. A named remote refers to that remote. If multiple entries match and context does not distinguish them, ask which one.
- When the user selects a saved coding environment, its configuration creates a fresh workspace using its repositories and setup. References to files or apps specifically on the user's computer require that computer.
- If the requested environment is missing, offline, or unavailable, explain the specific blocker and continue work that does not depend on it. Do not silently switch environments. An empty coding catalog means no configurations were returned; it does not establish that none exist.

## Create the task

Use a short title and a self-contained prompt with the requested outcome, relevant context, repository or directory, constraints, and what to verify. The child does not inherit this conversation.

| Target | Arguments to `cloud_threads.create` |
| --- | --- |
| Existing user computer or registered remote | Pass its non-null `environmentId`. It must have `status: "connected"`; `attached: false` is allowed. |
| Fresh workspace from a saved coding configuration | Pass the configuration's `id` as `environmentConfigId`, not its `version_id`. No attached or connected user computer is required. |
| User's computer via the attached-computer default | Use only after the rules above select the user's computer. Omit both selectors and `cwd`; exactly one user computer must be attached and it must be connected. |

- Check only the selected environment's prerequisites. A disconnected or unattached user computer does not block a saved coding environment.
- When creating an authorized task, call `cloud_threads.create` with the requested target's selector. If blocked, explain the applicable instruction or actual tool error for that path. Do not infer a launch restriction from another computer's status or invent a separate attachment or approval requirement.
- Pass at most one environment selector.
- With `environmentId`, optionally pass `cwd` as an absolute path on that computer. Otherwise use its default directory. Changing `cwd` does not expand write access.
- With `environmentConfigId`, omit `cwd`. Repository refs and setup come from the saved configuration.
- Discovery does not attach or connect a computer. Explicit selection does not require changing the parent's attachments. Respect any access or feature-availability error from creation.
- Connection status does not describe browser or app capabilities. Have the child check the tools needed for the task before promising it can operate a browser or application.

## Follow through

- Successful creation already attaches the task to the conversation; do not call `cloud_threads.attach` again. Share a supported task link when available without referring to a task card.
- Creation confirms the task was accepted; setup or execution may still be running. Use `cloud_threads.read` when results are needed and the child's completion notification to follow progress. Do not poll continuously.
- Continue related work with `cloud_threads.send_message` on the same `threadId`; it keeps the selected environment.
- Do not automatically repeat an uncertain create. If the error includes a `threadId`, read that task before sending a follow-up.
