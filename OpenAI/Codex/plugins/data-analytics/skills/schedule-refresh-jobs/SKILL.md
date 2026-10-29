---
name: schedule-refresh-jobs
description: Create or update recurring cloud refresh jobs for an existing Data dashboard or report, including requests to keep it up to date.
---

# Schedule Refresh Jobs

Create or update recurring cloud refresh jobs for an existing Data dashboard or report, including requests to keep it up to date.

## Overall Instructions

- Follow the [shared Data instructions](../../shared/shared-skill-instructions.md) throughout this workflow.

## Dependencies

Apply the shared [dependency resolution policy](../../shared/shared-skill-instructions.md#dependency-resolution) to the categories below.

- Data Warehouse: The selected warehouse queries and schemas to reread on each refresh.
- Business Intelligence: The selected governed reporting source and its repeatable retrieval path.
- Product Analytics: The selected event or behavioral source and its refreshable comparisons.
- Knowledge & Files: Rereadable source files, saved metric definitions, and refresh instructions.
- Developer Tools: A supported cloud scheduler and the existing dashboard or report project's refresh capabilities.
- Internal Messaging: Operational context that helps interpret refresh requirements or failures.

## Workflow guidance

Use this skill for dashboard `schedule-refresh` actions and requests to schedule dashboard or report updates. Create and manage the automation in a cloud task so it runs independently of the user's computer. One-time refreshes and scheduled runs belong to [$build-dashboard](../build-dashboard/SKILL.md) or [$build-report](../build-report/SKILL.md). Do not turn document updates, change alerts, or summary sharing into refresh jobs.

## Set up the job

1. **Identify the app.** Confirm the dashboard or report's Data app ID and Site URL/project ID, or another verified cloud-accessible project. Never match by title alone. The cloud task must be able to reopen the app and its saved sources without local files or the original conversation. If it cannot, explain the missing access. Ask before publishing or uploading a local-only app. Uploaded files and one-time snapshots need a source that can be read again.
2. **Confirm the schedule.** Reuse the user's chosen cadence and timezone. The hourly option means every hour on the hour. Ask only for missing details: time for daily, days and time for weekly, or day of month and time for monthly. Do not repeat answered questions or silently replace an unsupported cadence. Cancellation leaves the schedule unchanged.
3. **Find an existing job.** Match its app identity or verified task/automation ID. Reuse the task and update its job to avoid duplicates. Ask if several matches remain. Preserve unrelated settings, notification preferences, and paused status unless the user requests a change. Moving a local job to the cloud requires authorization; do not leave both running.
4. **Set it up in cloud Work mode.**
   - From Codex Desktop, use `send_message_to_thread` for the existing cloud task, or `create_thread` with `target: { type: "chatgptWorkCloud" }`. Creating a task requires the user's authorization; the schedule action/default prompt includes it. Ask once if the request does not. Leave `target.projectId` out unless `list_projects` verifies a compatible ChatGPT project. Put the Sites project ID in the prompt.
   - Give the cloud task the app identity, source references, cadence, timezone, existing automation ID if any, and the run prompt below. Have it create or update the native cloud automation **in that task**. Keep rows, SQL, credentials, signed URLs, and copies of old presentation settings out of the prompt.
   - If already in cloud Work mode, use its native scheduler directly. Keep cadence in the schedule fields. Do not create another task or send scheduling to another agent.
   - A missing scheduler in Desktop is not a blocker if you can create a cloud task. Let that task check its tools. If cloud setup or access fails, explain the blocker; do not substitute a local automation, heartbeat, cron job, detached process, or workspace agent.
5. **Verify the saved automation.** Wait for setup with `wait_threads`, or inspect it with `read_thread` if waiting is unsupported. Resolve queued creation through task listing; do not use a `clientThreadId` where a `threadId` is required or retry an accepted creation. Read back the automation ID, app, cadence, timezone, enabled/paused state, and next run if available. Return the cloud task link and confirmed settings. If setup is still pending, say so. Setup alone does not run queries, refresh or publish the app, or send test notifications.

## Instructions for each run

Use [$build-dashboard](../build-dashboard/SKILL.md) or [$build-report](../build-report/SKILL.md), as appropriate, and the [shared refresh workflow](../../shared/data-app.md#refresh-a-published-dashboard-or-report). Save a prompt like this with the exact Site URL and known project/app IDs:

> Use @Data to refresh `<Site URL>`. Read the Data plugin's shared/data-app.md reference and follow its published refresh workflow. If the skill reader cannot open it, read the file from the installed plugin directory. Use the Sites connector's get_site tool to resolve the Site, then read GET `/api/snapshot` and GET `/api/presentation`. Rerun the saved queries or connector requests and rebuild from the source currently deployed. Update the data, refresh timestamp, and date ranges according to their saved rules; update affected report claims too. Validate and redeploy through Sites to the same Site, preserving its layout, saved presentation, and access. Verify the result through API readback. Do not use the browser or WebMCP to perform the refresh. Report any failed step.

A scheduled run executes the refresh; it does not create another task or schedule. Report failures through the existing scheduler, without adding alerts or messages to other destinations.
