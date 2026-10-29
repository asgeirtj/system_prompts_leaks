---
name: share-artifact-summary
description: Share or provide a concise Data dashboard, report, chart, or component summary.
---

# Share A Data Artifact Summary

Share or provide a concise Data dashboard, report, chart, or component summary.

## Overall Instructions

- Follow the [shared Data instructions](../../shared/shared-skill-instructions.md) throughout this workflow.
- When summarizing or sharing a Data report or dashboard, follow the [Data App Contract](../../shared/data-app.md) for source context, chart capture, and selected-view links.

## Dependencies

Apply the shared [dependency resolution policy](../../shared/shared-skill-instructions.md#dependency-resolution) to the categories below.

- Knowledge & Files: The selected artifact, audience context, and requested document destination.
- Internal Messaging: The explicitly selected team-messaging destination for delivering the summary.
- Email: The explicitly selected email destination for delivering the summary.

## Workflow guidance

1. Keep this interaction fast. Start with already-visible installed skills, callable tools, and the current conversation; discover deferred capabilities when needed for the requested destination. Before the first form, make no source-record calls and do not inspect the artifact, research stakeholders, read profiles, or search messages.
2. If no external delivery is requested, or no destination is named and no sharing connector is available, immediately return a concise, copyable artifact summary inline in the current conversation. Apply the source-link guardrail below without an intake form or connector calls. If the user requests a specific external destination whose connector is unavailable, follow the shared [dependency resolution policy](../../shared/shared-skill-instructions.md#dependency-resolution) to find and offer it. Prepare the supported summary while access is pending, but leave delivery unresolved and do not substitute a different destination.
3. Ask only for a missing destination, offering up to three available connectors, such as Slack, email, or Google Docs. Use only connected destinations; never default to Slack or yourself.
4. After the user chooses a connector, make at most one bounded target-discovery call to that connector with a limit of 5. Use a short artifact or project keyword already visible in the conversation. Do not run parallel searches, retry, paginate, read profiles, inspect message history, or query any unselected connector. If relevant targets are already visible, skip the lookup.
5. If the target is still unspecified, offer up to three verified targets in a second structured intake form. Use only targets returned by the one lookup or already named in the conversation. If fewer than three exist, show the real targets without inventing recipients; use the form's built-in free-text input for a different target. If discovery fails or is rate-limited, ask for the target directly without retrying.
6. For forms, use `$answers-ask-user-input` on ChatGPT web; elsewhere, prefer `request_user_input_async`, then `request_user_input`, then `$answers-ask-user-input`. If no supported form can render, ask in chat. Wait for the user to select the destination and target; cancellation ends sharing.
7. After a target is selected, finalize a concise summary from the current artifact context, reusing any summary prepared while access was pending, and apply the source-link guardrail below. Deliver only through the selected connected destination and to the selected recipient or audience:
   - For Slack, export a readable image of the actual requested artifact's key metrics and primary visualization. For an open Data app, first use `list_data_app_cards({})` and capture the selected exact IDs with `get_data_app_card_image` or `get_data_app_card_images`, following [Card images for slides and documents](../../shared/data-app.md#card-images-for-slides-and-documents). Decode the returned base64 into PNG files without printing the bytes, and verify the images match the requested metrics, tab, and filters. Follow the shared [capture priority](../../shared/data-app.md#capture-priority): native Download PNG, then same-card capture. Only if all three capture paths fail or are unavailable, rebuild from verified reviewed data, validate the result, and report the capture blockers and recreated charts only in the final response to the user. Preserve the entire card's labels and marks; do not crop evidence to obtain a landscape preview. Attach additional focused images only when useful. Resolve the selected conversation or thread, then upload the image with `slack_complete_file_upload`, setting `source_file`, `conversation_ids`, `initial_comment`, descriptive `alt_text`, and `thread_ts` when applicable. Put the published or publicly accessible source link in `initial_comment` whenever one exists.
   - For email, documents, team messaging, or another connected destination, use the corresponding provider's available capability and include the published or publicly accessible source link in the email body, document, or message whenever one exists.
   - Never publish an artifact, widen access, broadcast to an unselected audience, or substitute a different destination.
8. Verify delivery through the selected provider. For Slack, verify the image attachment appears in the requested conversation or thread. If delivery cannot be verified, report the exact blocker without claiming success.

## Source-link guardrail

Always include the published Data app's selected-view link or another already-publicly-accessible source link when one is visible in the current context. For Data apps, follow [Sharing selected views](../../shared/data-app.md#sharing-selected-views): keep the supported view parameters in Slack `initial_comment`, email bodies, documents, and other messages, and verify that the delivered link preserves them. For other source links, remove query parameters. Remove fragments and task IDs from all shared links. Reject URLs containing credentials, `file://` URLs, localhost, loopback, link-local or private network addresses, local preview URLs, and unpublished links. Never make extra connector calls, publish the artifact, widen access, or invent a link.
