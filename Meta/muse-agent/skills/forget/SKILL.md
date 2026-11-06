# Forgetting Personal Information

## Prepare the cleanup

- Distinguish forgetting personal information from cancelling a task. Treat forgetting as cleanup across Muse rather than an edit to one memory note. The information can also live in conversation history, other notes, preferences, goals, scheduled work, created items, search results or active work that can write it back.

- Call `forget.plan` once with `{}`. It identifies the subject from the conversation, so do not repeat sensitive text in the arguments.

- Wait for the planner's handoff instead of polling or running a parallel search. The planner stays read-only and follows the [artifact inventory](references/artifact-inventory.md). Its plan covers what it found, what should change, how the cleanup will be verified and what Muse cannot erase.

- Keep the work discreet. Refer to the subject as "that information" and never copy it into a new memory, todo, filename or report.

- Speak to the user in everyday categories such as memory, reminders, created items, shared items, logs and backups. Keep file names, database tables, indexes, tool names and other internal machinery in the private work unless the user gets technical or asks how the cleanup works.

- Present the plan's scope, irreversible actions and important limits in those terms, then ask one direct confirmation question. Describe any permanent removal as irreversible before the user approves it.

- Treat silence, ambiguity, partial approval or a changed scope as no confirmation. After a later clear approval, call `forget.confirm` with `{}`. It rereads the latest plan and approval from the conversation, so there is no planning agent ID to pass.

## Follow the confirmed plan

- Stop without changing anything when you cannot identify one clear recent plan and a later approval of it. Report the blocker so a new plan can be made.

- Revalidate the plan against current state before acting. Stop approved work that could recreate the information before removing its output.

- Use the tool or product action that owns each item and preserve unrelated content. Refresh anything derived from what changed and verify from fresh state.

- Preserve platform configuration and migration bookkeeping even when the user asks to forget everything. Do not bulk-truncate files or replace structured state with `{}`; clean approved personal content through its owning action.

- Make a revised plan instead of broadening the cleanup when the situation has materially changed or there is no safe way to clean up one place.

- For shopping preferences, check `~/memory/shopping/PROFILE.md` directly and edit or remove the matching entries. Verify that no staged, queued, running or scheduled shopping-profile run can restore them.

- For travel preferences, do the same with `~/memory/travel/PROFILE.md` and travel-profile runs.

- Do not send approved cleanup targets to recoverable trash. Remove an exact standalone file with `rm -- <exact-path>` through `muse.exec`, revalidating the path immediately before removal.

- Never use `rm -r`, another recursive deletion, a glob or a broad target. Edit a mixed-content file instead of deleting it, and clean a directory through the product action that owns it or make a revised plan.

- When an owning product action archives a definition in trash as part of its cleanup, permanently remove the exact matching standalone-file tombstone.

- Perform the cleanup directly instead of delegating it to another subagent. If delegated work is still settling when you finish, Muse reports the cleanup as incomplete so later changes cannot outrun the memory refresh.

- Before finishing, write `~/workspace/memory/forget/pending.json` as `{"claims":[...],"citations":[...]}`, even when both lists are empty. List the claim IDs you saw in `muse.memory_explain` or `muse.memory_search` metadata and the exact `MEMORY.md#L<line>` or `memory/<date>.md#L<line>` locators you removed or rewrote.

- Put only IDs and locators in that file, never the forgotten text. Muse retracts those claims and everything derived from them, then refreshes memory search, so do not refresh it a second time.

## Verify and explain the result

- Report the cleanup as incomplete if the memory refresh fails, instead of saying the information is no longer searchable. Muse finishes the claim retraction and the refresh before it relays the result.

- Say "forgotten" only when fresh verification finds no active memory, derived copy or future activity that can bring the information back. Report which categories were cleaned up and which reminders or other future activity stopped, without repeating the information.

- Name what remains, such as outside services, shared or published items, logs, backups or other retained copies, by its everyday category. Say whether Muse can keep it out of active use.

- Do not tell the user that their original messages may remain visible in the chat, and do not frame that as something Muse failed to erase. Visible conversation text is not a cleanup target or a completion blocker. Inspect it privately only to find memory, derived material or future activity that used the information.

- If `forget.plan` or `forget.confirm` fails, do not fall back to unplanned manual deletion or claim success. Explain the failure and make a new plan if the user still wants to continue.

- Get separate approval before deleting outside email, calendar data, device records, shared publications or another person's copy. A request to forget does not authorize those actions.

## Available connectors

- This skill uses native tools and does not require an account connector.

- Use `muse.connector_search` to find other connectors and `muse.skill_search` to find related skills.

- If nothing here fits, look on the web for a maintained API or MCP server and set it up with [Custom Connectors and MCPs](/opt/muse/skills/custom-connector-setup/SKILL.md), or build a custom connector.

## Alternatives for better results

- If the user wants to correct an inaccurate fact or replace a preference, identify that narrower intent. A clear request to forget should proceed through the forgetting plan.

- For material outside the supported cleanup, identify the service that holds it and its deletion process. Report what remains without implying that local cleanup removed every copy.
