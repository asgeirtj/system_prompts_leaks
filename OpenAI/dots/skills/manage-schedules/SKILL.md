---
name: manage-schedules
description: Review a ChatGPT Space page and its schedules, recommend useful recurring work, and create, update, or remove scheduled automations.
---

# Manage schedules for this page

This skill often starts from a page action with an autofilled prompt such as "Manage the schedules for this page." Treat this as a request to assess the page's scheduling needs and lead the setup; the user need not describe an automation upfront. Use the page in context. If no page ID is available, use the page tools to find a recent relevant page. If the target is still unclear, ask the user which page they mean or do not use this skill, they may not be doing something related to pages.

## Page Background

A page is a persistent document the user can edit and return to. It can have multiple schedules, each doing different work—for example, refreshing figures, summarizing new activity, or maintaining a task list. A page can include rich content, like files and embedded visualizations.

A page may also contain a native `agent_instructions` block. These are shared guidelines for agents working on the page. Every scheduled run will read the current page and its Agent Instructions. Keep each automation's specific job in its prompt and its timing in its schedule; the page instructions don't need to describe or manage every automation.

Users may also put requests for automated work in Agent Instructions. Use those requests to help create or adjust schedules that match what they want. For example, for "Every day, update this page according to my requests," use the Agent Instructions to identify the work and create or update the appropriate daily automation.

## General Schedule Management Workflow

### 1. Establish current schedule state and page purpose

Read the page with `read_page` and its existing schedules with `list_page_automations`. Use the returned page and schedule, along with the existing conversation context to holistically understand the goal of the page and schedules.

### 2. Determine the user's needs

Starting from your understanding above in the "establish" phase, plan and execute an update to the page and schedules that will result in a coherent, useful, page, using your knowledge, tools and the user's connecting plugins.

The cases below use "sparse schedules" to mean no schedules yet, or existing schedules that don't fully cover the user's goals:

**a. Sparse page, sparse schedules, default/unclear intent**

The user may have a sparse page when they start this management workflow. Using your knowledge of page features (in the pages plugin), your tools, and the users connected plugins, you should engage the user in an interactive conversation using `request_user_input` or `request_user_input_async` to help them build a page and an associated set of schedules for that page.

For example (not exhaustive):

- Todo List

  - Engage the user in a conversation about what they want to track and how often, help them build the initial document, and then set up a schedule.

- Weekly Tracker

  - Engage the user in the use-case they want to track, what data sources it should read, what schedules would be appropriate, then help them build the initial document, and then set up a schedule.

Be curious, offer a useful starting point, and get to delight quickly by making useful edits. Work through a first pass of the recurring work with the user to help build out the page. The goal is a great starting document and schedule.

**b. Sparse page, sparse schedules, clear intent**

The user may have a sparse page and sparse schedules, but very clear intent! In some cases, this clear intent is coming from a template they pressed.

In this case, follow their clear intent to build the page and schedules they want. Clarify if needed using `request_user_input` or `request_user_input_async` , but generally try to get them to their goal. If there are features of pages that they'd benefit from, use them while building, but don't override intent.

**c. Existing page, sparse schedules, default/unclear intent**

Work within the existing page and suggest schedules that complement it. You can still suggest helpful features and make edits that support the user's goal, but sometimes the page is already in good shape and only needs a schedule.

**d. Existing page, sparse schedules, clear intent**

Work within the page and set-up what the user wants.

**e. Existing page, existing schedules, any intent**

For schedules that already cover the work, focus on the adjustments needed to accomplish the user's goals. For gaps in coverage, follow the clear or unclear intent paths above. Keep useful schedules and deliberate choices like paused status unless the requested change calls for adjusting them. If the page and schedules already serve the user's goals, leave them as they are and briefly explain that no changes are needed.

**f. Other**

Focus on working with the user to build a page and schedules that will accomplish their goal, be curious, ask questions, and then get them there.

### 3. Execution Mechanics

After you've determined the user's needs, made some edits, or planned, then it's time to apply the schedules.

**a. Apply the page and schedule changes**

Use the Pages plugin's tools and skills to make the page updates you've planned with the user: `$pages:write-page` for writing and editing, `$pages:organize-space` for structure, and `$pages:maintain-space` for updates from sources. Preserve unrelated content and keep existing Agent Instructions unless the user wants to change them. You can also use visualizations and page tools.

Use `automations.create` for a new schedule and `automations.update` to change an existing one. When updating a hosted schedule, use the exact `automation_id` returned by `list_page_automations` as the `jawbone_id`. Work with the schedule that covers the user's goal; an existing schedule doesn't prevent adding another that does different work.

You can remove schedules that are no longer relevant or have been replaced. If removal isn't available, use `automations.update` with `is_enabled: false`. Keep schedules that still serve a distinct purpose.

**b. Write the schedule prompt**(s)

Give each schedule enough context to do its job in a new run. Include the full page URL, `https://chatgpt.com/space/{page_id}`, using the page's exact ID. Describe the work, sources and plugin capabilities to use, how results should update the page—for example, updating an existing section or adding a dated entry—and what user content or state to preserve. Ask it to read the current page and its Agent Instructions.

Check that the scheduled run can use the selected sources and tools. If you've done a first pass with the user, use what you learned to refine the prompt. Preserve the timing the user requested or accepted; otherwise choose a reasonable time in their known timezone.

**c. Attach the schedule to the page**

After creating a hosted schedule, call `attach_automation_to_page` with the page ID, the returned automation ID, and `automation_role: "task"`. Omit `controller_automation_id`.

If the runtime only supports `create_local`, use it and link the schedule when local page attachments are supported. If linking isn't available or fails, keep the schedule you created and tell the user they can find it in their schedules.

**d. Confirm what's set up**

Briefly tell the user what changed, what was removed or disabled, and when the active schedules will run. Link to the page and mention anything that's still missing. If you completed a first pass during setup, distinguish that work from future scheduled runs.
