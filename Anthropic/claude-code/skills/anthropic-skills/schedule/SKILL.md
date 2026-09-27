---
name: "schedule"
description: "Create or update a scheduled task that runs automatically. Use when the user says things like \"every day\", \"each morning\", \"remind me in an hour\", \"run this at noon\", or wants to reschedule an existing task."
---

First, decide whether the user wants to **create a new** scheduled task or **change an existing** one.

## Updating an existing task

If the user wants to reschedule, edit the prompt, or pause/resume a task that already exists, call the `update_scheduled_task` tool with its `taskId` — do **not** call `create_scheduled_task`. Use `list_scheduled_tasks` if you need to look up the ID. When this session is itself a scheduled run, the current task's ID is the `name` attribute in the `<scheduled-task name="…">` tag at the top of the conversation.

## Creating a new task

You are distilling the current session into a reusable shortcut. Follow these steps:

### 1. Analyze the session

Review the session history to identify the core task the user performed or requested. Distill it into a single, repeatable objective.

### 2. Draft a prompt

The prompt will be used for future autonomous runs — it must be entirely self-contained. Future runs will NOT have access to this session, so never reference "the current conversation," "the above," or any ephemeral context.

Include in the description:
- A clear objective statement (what to accomplish)
- Specific steps to execute
- Any relevant file paths, URLs, repositories, or tool names
- Expected output or success criteria
- Any constraints or preferences the user expressed

Write the description in second-person imperative ("Check the inbox…", "Run the test suite…"). Keep it concise but complete enough that another Claude session could execute it cold.

### 3. Choose a taskName

Pick a short, descriptive name in kebab-case (e.g. "daily-inbox-summary", "weekly-dep-audit", "format-pr-description").

### 4. Determine scheduling

The `create_scheduled_task` tool description explains the options (`cronExpression` for recurring, `fireAt` for one-time, omit both for ad-hoc) and their formats. If the user didn't give a clear schedule, propose one and ask them to confirm before proceeding — don't rely on an approval prompt to catch a wrong guess, since task creation may be approved automatically in some permission modes.

Finally, call the `create_scheduled_task` tool.