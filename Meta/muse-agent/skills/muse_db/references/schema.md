# PostgreSQL schema for `muse.db`

- Use this index to find the relevant tables. Read their linked files for exact columns, keys and read restrictions before composing SQL.

- Read [query rules](/opt/muse/skills/muse_db/references/querying.md) for the allowed SQL operations and [identifier lookup](/opt/muse/skills/muse_db/references/identifiers.md) for cross-table references.

- `muse.db` accepts one bounded, read-only `SELECT` for diagnosis. Use the purpose-built chat, goal, artifact and connector tools for ordinary tasks.

Generated from migration set `5ad39d1d5a73c31cfbeacfe6e576df4626d913a3c488434f75da6bd1437c617a`.

## Tables

### activity

- [activity.activity_monitor_agent_threads](/opt/muse/skills/muse_db/references/tables/activity.activity_monitor_agent_threads.md). Links agents to their activity threads.

- [activity.activity_monitor_carrier_user_messages](/opt/muse/skills/muse_db/references/tables/activity.activity_monitor_carrier_user_messages.md). Links activity carrier messages to the user messages they represent.

- [activity.activity_monitor_message_threads](/opt/muse/skills/muse_db/references/tables/activity.activity_monitor_message_threads.md). Links messages to activity threads.

- [activity.activity_monitor_runtime_work_threads](/opt/muse/skills/muse_db/references/tables/activity.activity_monitor_runtime_work_threads.md). Links durable runtime work to activity threads.

- [activity.activity_monitor_thread_actions](/opt/muse/skills/muse_db/references/tables/activity.activity_monitor_thread_actions.md). Actions displayed within an activity thread and their agent attribution.

- [activity.activity_monitor_thread_sections](/opt/muse/skills/muse_db/references/tables/activity.activity_monitor_thread_sections.md). Titles, state and ordering of sections within activity threads.

- [activity.activity_monitor_threads](/opt/muse/skills/muse_db/references/tables/activity.activity_monitor_threads.md). Activity thread identity, presentation and current state.

- [activity.feed_entries](/opt/muse/skills/muse_db/references/tables/activity.feed_entries.md). Activity entries shown for work, messages and goals.

### agent

- [agent.agent_ancestors](/opt/muse/skills/muse_db/references/tables/agent.agent_ancestors.md). Ancestor relationships between agents, including distance through the tree.

- [agent.agent_compactions](/opt/muse/skills/muse_db/references/tables/agent.agent_compactions.md). Agent compaction summaries and token counts, with private reasoning withheld.

- [agent.agent_message_token_usage](/opt/muse/skills/muse_db/references/tables/agent.agent_message_token_usage.md). Token usage attributed to an agent and message.

- [agent.agents](/opt/muse/skills/muse_db/references/tables/agent.agents.md). Agent identity, kind, session and parent relationships.

- [agent.chat_preferences](/opt/muse/skills/muse_db/references/tables/agent.chat_preferences.md). Stored chat preferences and the active root agent.

- [agent.compactions](/opt/muse/skills/muse_db/references/tables/agent.compactions.md). Compaction checkpoints and the history ranges they replace.

- [agent.context_item_derived_write_backlog](/opt/muse/skills/muse_db/references/tables/agent.context_item_derived_write_backlog.md). Pending derived writes for context items and their retry state.

- [agent.context_item_fields](/opt/muse/skills/muse_db/references/tables/agent.context_item_fields.md). Flattened fields of readable context items, subject to the listed redactions.

- [agent.context_item_resume_projection](/opt/muse/skills/muse_db/references/tables/agent.context_item_resume_projection.md). Readable context projected for agent resume, with protected items withheld.

- [agent.context_items](/opt/muse/skills/muse_db/references/tables/agent.context_items.md). Ordered readable conversation items, including message and tool references.

- [agent.context_text_segments](/opt/muse/skills/muse_db/references/tables/agent.context_text_segments.md). Text segments belonging to context items, with protected reasoning withheld.

- [agent.message_mailbox](/opt/muse/skills/muse_db/references/tables/agent.message_mailbox.md). Accepted agent submissions, their ordering and routing state.

- [agent.recovery_owner_terminal_events](/opt/muse/skills/muse_db/references/tables/agent.recovery_owner_terminal_events.md). Terminal events claimed for a durable recovery owner and generation.

- [agent.recovery_owners](/opt/muse/skills/muse_db/references/tables/agent.recovery_owners.md). Durable ownership and generation of recoverable agent work.

- [agent.runtime_restart_checkpoints](/opt/muse/skills/muse_db/references/tables/agent.runtime_restart_checkpoints.md). Saved agent checkpoints used to resume work after restart.

- [agent.runtime_state](/opt/muse/skills/muse_db/references/tables/agent.runtime_state.md). Current context and event positions for each agent.

- [agent.session_memory_capture_deadlines](/opt/muse/skills/muse_db/references/tables/agent.session_memory_capture_deadlines.md). Pending session memory-capture deadlines and their reasons.

- [agent.sessions](/opt/muse/skills/muse_db/references/tables/agent.sessions.md). Session identity, root request and archival timestamps.

- [agent.subagent_monitor_decisions](/opt/muse/skills/muse_db/references/tables/agent.subagent_monitor_decisions.md). Coordinator decisions about a child agent and the event prompting them.

- [agent.subagent_progress](/opt/muse/skills/muse_db/references/tables/agent.subagent_progress.md). Recorded child-agent progress updates and status.

- [agent.subagent_progress_message_events](/opt/muse/skills/muse_db/references/tables/agent.subagent_progress_message_events.md). Child-agent progress messages routed to a parent.

- [agent.subagent_progress_tool_events](/opt/muse/skills/muse_db/references/tables/agent.subagent_progress_tool_events.md). Child-agent tool progress events routed to a parent.

- [agent.subagent_spawns](/opt/muse/skills/muse_db/references/tables/agent.subagent_spawns.md). Child-agent creation and its parent, message and request attribution.

- [agent.token_usage](/opt/muse/skills/muse_db/references/tables/agent.token_usage.md). Token usage recorded for an agent and request.

- [agent.volatile_context_pins](/opt/muse/skills/muse_db/references/tables/agent.volatile_context_pins.md). Pinned context variants and their history checkpoint positions.

### chat

- [chat.chats](/opt/muse/skills/muse_db/references/tables/chat.chats.md). Canonical chat metadata. chat_id is the existing root session UUID.

- [chat.event_transports](/opt/muse/skills/muse_db/references/tables/chat.event_transports.md). Provider attribution for chat events.

- [chat.message_bindings](/opt/muse/skills/muse_db/references/tables/chat.message_bindings.md). Bindings between provider messages, native conversations and Muse messages.

### device

- [device.calendar_events](/opt/muse/skills/muse_db/references/tables/device.calendar_events.md). Calendar events synchronized from paired devices.

- [device.call_log](/opt/muse/skills/muse_db/references/tables/device.call_log.md). Call-history entries from devices and their recorded direction and timing.

- [device.client_contexts](/opt/muse/skills/muse_db/references/tables/device.client_contexts.md). Client connection, device, session and visible-view context.

- [device.contact_addresses](/opt/muse/skills/muse_db/references/tables/device.contact_addresses.md). Labeled postal addresses belonging to synchronized contacts.

- [device.contact_emails](/opt/muse/skills/muse_db/references/tables/device.contact_emails.md). Labeled email addresses belonging to synchronized contacts.

- [device.contact_phones](/opt/muse/skills/muse_db/references/tables/device.contact_phones.md). Labeled phone numbers belonging to synchronized contacts.

- [device.contacts](/opt/muse/skills/muse_db/references/tables/device.contacts.md). Contacts synchronized from a device, with source identity and names.

- [device.data_sync_state](/opt/muse/skills/muse_db/references/tables/device.data_sync_state.md). Per-device synchronization state, cursor and full-sync range.

- [device.media_upload_batches](/opt/muse/skills/muse_db/references/tables/device.media_upload_batches.md). Claimed batches and pending counts for media-upload processing.

- [device.media_upload_events](/opt/muse/skills/muse_db/references/tables/device.media_upload_events.md). Ordered media-upload events and their device and processing lane.

- [device.nodes](/opt/muse/skills/muse_db/references/tables/device.nodes.md). Paired devices, advertised commands and enabled permissions.

- [device.upload_chunks](/opt/muse/skills/muse_db/references/tables/device.upload_chunks.md). Received chunks of a device upload and their payload digests.

- [device.upload_sessions](/opt/muse/skills/muse_db/references/tables/device.upload_sessions.md). Device upload sessions, source types and synchronization mode.

### feed

- [feed.fleet_engagement_contributions](/opt/muse/skills/muse_db/references/tables/feed.fleet_engagement_contributions.md). Versioned local contributions to shared Feed engagement statistics.

- [feed.fleet_engagement_outbox](/opt/muse/skills/muse_db/references/tables/feed.fleet_engagement_outbox.md). Queued Feed engagement counts awaiting publication.

- [feed.fleet_fetch_receipts](/opt/muse/skills/muse_db/references/tables/feed.fleet_fetch_receipts.md). Receipts for fetched shared Feed payloads.

- [feed.fleet_publish_state](/opt/muse/skills/muse_db/references/tables/feed.fleet_publish_state.md). Watermark of published shared Feed contributions.

- [feed.fleet_reaction_outbox](/opt/muse/skills/muse_db/references/tables/feed.fleet_reaction_outbox.md). Queued Feed reactions and delivery retry state.

- [feed.interactions](/opt/muse/skills/muse_db/references/tables/feed.interactions.md). User interactions recorded against Feed units.

- [feed.null_state_seed](/opt/muse/skills/muse_db/references/tables/feed.null_state_seed.md). Completion marker for seeding an empty Feed.

- [feed.preferences_projection](/opt/muse/skills/muse_db/references/tables/feed.preferences_projection.md). Current Feed preferences and the interactions already folded into them.

- [feed.prompt_scope_verdict](/opt/muse/skills/muse_db/references/tables/feed.prompt_scope_verdict.md). Classification of a Feed prompt and the version that produced it.

- [feed.prompt_seed](/opt/muse/skills/muse_db/references/tables/feed.prompt_seed.md). Completion marker for initial Feed prompt seeding.

- [feed.promptless_unit_orders](/opt/muse/skills/muse_db/references/tables/feed.promptless_unit_orders.md). User ordering of Feed units for a prompt and local date.

- [feed.prompts](/opt/muse/skills/muse_db/references/tables/feed.prompts.md). Saved Feed prompts, template values and enabled state.

- [feed.run_steps](/opt/muse/skills/muse_db/references/tables/feed.run_steps.md). Individual Feed generation steps, attempts and agent state.

- [feed.runs](/opt/muse/skills/muse_db/references/tables/feed.runs.md). Feed generation runs, triggering context and edition dates.

- [feed.surface_state](/opt/muse/skills/muse_db/references/tables/feed.surface_state.md). Feed surface initialization and fetch state.

- [feed.units](/opt/muse/skills/muse_db/references/tables/feed.units.md). Generated Feed content and its edition and source prompt.

### goals

- [goals.actions](/opt/muse/skills/muse_db/references/tables/goals.actions.md). Actions attached to goals and their completion state.

- [goals.associations](/opt/muse/skills/muse_db/references/tables/goals.associations.md). Links from goals to other records or resources.

- [goals.briefings](/opt/muse/skills/muse_db/references/tables/goals.briefings.md). Goal briefing locations and opening timestamps.

- [goals.engagement_events](/opt/muse/skills/muse_db/references/tables/goals.engagement_events.md). User engagement events associated with a goal and surface.

- [goals.goals](/opt/muse/skills/muse_db/references/tables/goals.goals.md). User goals, their descriptions and lifecycle state.

- [goals.learning_state](/opt/muse/skills/muse_db/references/tables/goals.learning_state.md). Learning-goal prerequisites, mastery evidence and misconceptions.

- [goals.momentum_history](/opt/muse/skills/muse_db/references/tables/goals.momentum_history.md). Recorded goal progress assessments and adjustment recommendations.

- [goals.sessions](/opt/muse/skills/muse_db/references/tables/goals.sessions.md). Sessions and root agents associated with a goal.

- [goals.suggestions](/opt/muse/skills/muse_db/references/tables/goals.suggestions.md). Suggestions linking goals to ideas and their current state.

- [goals.thread_actions](/opt/muse/skills/muse_db/references/tables/goals.thread_actions.md). Links between goal conversation threads and goal actions.

- [goals.threads](/opt/muse/skills/muse_db/references/tables/goals.threads.md). Goal conversation threads and their originating requests.

- [goals.updates](/opt/muse/skills/muse_db/references/tables/goals.updates.md). Dated updates to goal descriptions and progress.

### health

- [health.aggregates](/opt/muse/skills/muse_db/references/tables/health.aggregates.md). Provider health measurements aggregated over a specified period and timezone.

- [health.events](/opt/muse/skills/muse_db/references/tables/health.events.md). Health events synchronized from a provider or device.

- [health.record_values](/opt/muse/skills/muse_db/references/tables/health.record_values.md). Named numeric or text values belonging to health records.

- [health.sample_values](/opt/muse/skills/muse_db/references/tables/health.sample_values.md). Named values and units belonging to individual health samples.

- [health.samples](/opt/muse/skills/muse_db/references/tables/health.samples.md). Individual health measurements and their provider identity.

- [health.sleep_sessions](/opt/muse/skills/muse_db/references/tables/health.sleep_sessions.md). Sleep sessions synchronized from a provider or device.

- [health.synced_ranges](/opt/muse/skills/muse_db/references/tables/health.synced_ranges.md). Time ranges covered by synchronization for each health source and category.

- [health.workouts](/opt/muse/skills/muse_db/references/tables/health.workouts.md). Recorded workouts and their provider, device and timing.

### ideas

- [ideas.bandit_arm_state](/opt/muse/skills/muse_db/references/tables/ideas.bandit_arm_state.md). Learning statistics for each idea policy domain and lane.

- [ideas.bandit_fold_state](/opt/muse/skills/muse_db/references/tables/ideas.bandit_fold_state.md). Watermarks for idea-policy learning from events.

- [ideas.bandit_folded_events](/opt/muse/skills/muse_db/references/tables/ideas.bandit_folded_events.md). Events already incorporated into idea-policy learning.

- [ideas.discovery_pool_history](/opt/muse/skills/muse_db/references/tables/ideas.discovery_pool_history.md). Historical snapshots of idea-discovery sources.

- [ideas.discovery_pool_meta](/opt/muse/skills/muse_db/references/tables/ideas.discovery_pool_meta.md). Current metadata for idea-discovery sources.

- [ideas.explore_policy](/opt/muse/skills/muse_db/references/tables/ideas.explore_policy.md). Idea exploration policy settings and versions.

- [ideas.feed_snapshot_cards](/opt/muse/skills/muse_db/references/tables/ideas.feed_snapshot_cards.md). Cards and their ordering within an Ideas snapshot.

- [ideas.feed_snapshot_sections](/opt/muse/skills/muse_db/references/tables/ideas.feed_snapshot_sections.md). Section titles, roles and ordering within an Ideas snapshot.

- [ideas.feed_snapshots](/opt/muse/skills/muse_db/references/tables/ideas.feed_snapshots.md). Ideas snapshot identity, creation time and active state.

- [ideas.icon_embeddings](/opt/muse/skills/muse_db/references/tables/ideas.icon_embeddings.md). Icon description embeddings and the model that generated them.

- [ideas.idea_anchors](/opt/muse/skills/muse_db/references/tables/ideas.idea_anchors.md). Links between ideas and the product entities that represent them.

- [ideas.idea_build_status](/opt/muse/skills/muse_db/references/tables/ideas.idea_build_status.md). Build state and selected items for an idea source.

- [ideas.idea_card_feeds](/opt/muse/skills/muse_db/references/tables/ideas.idea_card_feeds.md). Saved source feeds used to produce idea cards.

- [ideas.idea_dedup](/opt/muse/skills/muse_db/references/tables/ideas.idea_dedup.md). Idea fingerprints and duplicate-to-canonical mappings.

- [ideas.idea_events](/opt/muse/skills/muse_db/references/tables/ideas.idea_events.md). Idea interactions, dismissals and related anchor references.

- [ideas.idea_feedback_state](/opt/muse/skills/muse_db/references/tables/ideas.idea_feedback_state.md). Current user feedback associated with each idea.

- [ideas.idea_install_assets](/opt/muse/skills/muse_db/references/tables/ideas.idea_install_assets.md). Assets prepared for installing or executing an idea.

- [ideas.idea_items](/opt/muse/skills/muse_db/references/tables/ideas.idea_items.md). Ordered items within an idea.

- [ideas.idea_quality](/opt/muse/skills/muse_db/references/tables/ideas.idea_quality.md). Recorded relevance, novelty and feasibility scores for ideas.

- [ideas.idea_sources](/opt/muse/skills/muse_db/references/tables/ideas.idea_sources.md). Source records and provenance associated with ideas.

- [ideas.idea_tags](/opt/muse/skills/muse_db/references/tables/ideas.idea_tags.md). Ordered tags attached to ideas.

- [ideas.ideas](/opt/muse/skills/muse_db/references/tables/ideas.ideas.md). Idea cards, descriptions, rationale and categories.

### ingest

- [ingest.data_source_events](/opt/muse/skills/muse_db/references/tables/ingest.data_source_events.md). Ordered events received from data sources and their origin.

### media

- [media.descriptions](/opt/muse/skills/muse_db/references/tables/media.descriptions.md). Generated media descriptions and the model and version used.

- [media.exif_values](/opt/muse/skills/muse_db/references/tables/media.exif_values.md). Extracted EXIF metadata for media items.

- [media.items](/opt/muse/skills/muse_db/references/tables/media.items.md). Media inventory, source identities, types and file locations.

- [media.locations](/opt/muse/skills/muse_db/references/tables/media.locations.md). Coordinates and geocoding state associated with media.

### memory

- [memory.claims](/opt/muse/skills/muse_db/references/tables/memory.claims.md). Memory claims, supporting quotations and their recorded importance.

- [memory.embedding_models](/opt/muse/skills/muse_db/references/tables/memory.embedding_models.md). Embedding-model names, dimensions and distance metrics.

- [memory.embeddings](/opt/muse/skills/muse_db/references/tables/memory.embeddings.md). Search embeddings associated with memory entries.

- [memory.entries](/opt/muse/skills/muse_db/references/tables/memory.entries.md). Indexed memory entries, source locations and privacy classification.

- [memory.entry_attributes](/opt/muse/skills/muse_db/references/tables/memory.entry_attributes.md). Named attributes attached to memory entries.

- [memory.metadata](/opt/muse/skills/muse_db/references/tables/memory.metadata.md). Memory subsystem metadata and update times.

### podcasts

- [podcasts.episodes](/opt/muse/skills/muse_db/references/tables/podcasts.episodes.md). Generated podcast episodes, descriptions, audio paths and duration.

- [podcasts.feed](/opt/muse/skills/muse_db/references/tables/podcasts.feed.md). Legacy single podcast feed configuration.

- [podcasts.feeds](/opt/muse/skills/muse_db/references/tables/podcasts.feeds.md). Podcast feed identities, publication URLs and linked show information.

### runtime

- [runtime.agent_todo_snapshots](/opt/muse/skills/muse_db/references/tables/runtime.agent_todo_snapshots.md). The agent's own execution checklists and their revisions.

- [runtime.avatar_state](/opt/muse/skills/muse_db/references/tables/runtime.avatar_state.md). Current avatar assets and theme settings.

- [runtime.browser_tasks](/opt/muse/skills/muse_db/references/tables/runtime.browser_tasks.md). Browser tasks, their ownership, session and execution state.

- [runtime.chat_event_derived_write_backlog](/opt/muse/skills/muse_db/references/tables/runtime.chat_event_derived_write_backlog.md). Pending derived chat-event writes and their retry state.

- [runtime.checkout_spend_checkpoints](/opt/muse/skills/muse_db/references/tables/runtime.checkout_spend_checkpoints.md). Checkpoints and external references for checkout operations.

- [runtime.checkout_spend_operations](/opt/muse/skills/muse_db/references/tables/runtime.checkout_spend_operations.md). Checkout operation identity, approvals and reconciliation state.

- [runtime.client_rendering_capabilities](/opt/muse/skills/muse_db/references/tables/runtime.client_rendering_capabilities.md). The client's declared support for presentation types.

- [runtime.context_snapshots](/opt/muse/skills/muse_db/references/tables/runtime.context_snapshots.md). Versioned context snapshots and their source watermarks.

- [runtime.dev_notice_watermark](/opt/muse/skills/muse_db/references/tables/runtime.dev_notice_watermark.md). The last developer notice version observed by the runtime.

- [runtime.event_hook_space_owners](/opt/muse/skills/muse_db/references/tables/runtime.event_hook_space_owners.md). Associations between event hooks and owning artifacts.

- [runtime.event_payload_fields](/opt/muse/skills/muse_db/references/tables/runtime.event_payload_fields.md). Flattened fields from recorded runtime events.

- [runtime.events](/opt/muse/skills/muse_db/references/tables/runtime.events.md). Ordered runtime event ledger with request attribution.

- [runtime.execute_resolve_runs](/opt/muse/skills/muse_db/references/tables/runtime.execute_resolve_runs.md). Execution-and-resolution worker runs and terminal decisions.

- [runtime.idea_execution_pending](/opt/muse/skills/muse_db/references/tables/runtime.idea_execution_pending.md). Pending idea activations and their dispatch attribution.

- [runtime.invite_badge_seen_state](/opt/muse/skills/muse_db/references/tables/runtime.invite_badge_seen_state.md). The invite badge version last seen by the user.

- [runtime.maintenance_markers](/opt/muse/skills/muse_db/references/tables/runtime.maintenance_markers.md). Completed maintenance actions and their recorded details.

- [runtime.message_attachments](/opt/muse/skills/muse_db/references/tables/runtime.message_attachments.md). Files and media attached to messages, in display order.

- [runtime.message_reactions](/opt/muse/skills/muse_db/references/tables/runtime.message_reactions.md). Reactions recorded against messages.

- [runtime.messages](/opt/muse/skills/muse_db/references/tables/runtime.messages.md). Stored message roles, text and event references.

- [runtime.product_improvements_preference](/opt/muse/skills/muse_db/references/tables/runtime.product_improvements_preference.md). The user's saved product-improvements preference.

- [runtime.raw_signal_collections](/opt/muse/skills/muse_db/references/tables/runtime.raw_signal_collections.md). Signal collection attempts, source tools and coverage state.

- [runtime.raw_signal_entries](/opt/muse/skills/muse_db/references/tables/runtime.raw_signal_entries.md). Individual source signals within a collection.

- [runtime.requests](/opt/muse/skills/muse_db/references/tables/runtime.requests.md). Request ancestry, origin, transcript surface and work classification.

- [runtime.resources](/opt/muse/skills/muse_db/references/tables/runtime.resources.md). Resources associated with runtime events and their display order.

- [runtime.search_documents](/opt/muse/skills/muse_db/references/tables/runtime.search_documents.md). Search-index entries keyed to their owning records.

- [runtime.skill_invalidation_state](/opt/muse/skills/muse_db/references/tables/runtime.skill_invalidation_state.md). Skill use and pending or delivered instruction-update revisions.

- [runtime.stripe_link_spend_requests](/opt/muse/skills/muse_db/references/tables/runtime.stripe_link_spend_requests.md). Non-secret Stripe Link spend-request state and approved totals.

- [runtime.summaries](/opt/muse/skills/muse_db/references/tables/runtime.summaries.md). Saved runtime summaries keyed by purpose.

- [runtime.tool_calls](/opt/muse/skills/muse_db/references/tables/runtime.tool_calls.md). Recorded tool calls, their inputs, names and execution state.

- [runtime.tool_outputs](/opt/muse/skills/muse_db/references/tables/runtime.tool_outputs.md). Recorded tool results and their call references.

- [runtime.widgets](/opt/muse/skills/muse_db/references/tables/runtime.widgets.md). Widget contents, display text and versioned state.

- [runtime.work_items](/opt/muse/skills/muse_db/references/tables/runtime.work_items.md). Durable work items and their parent, request and session relationships.

- [runtime.workflow_agent_calls](/opt/muse/skills/muse_db/references/tables/runtime.workflow_agent_calls.md). Agent calls made by workflow phases and their replay identities.

- [runtime.workflow_launch_occurrence_aliases](/opt/muse/skills/muse_db/references/tables/runtime.workflow_launch_occurrence_aliases.md). Mappings from workflow launch occurrences to existing runs.

- [runtime.workflow_legacy_launch_occurrence_blocks](/opt/muse/skills/muse_db/references/tables/runtime.workflow_legacy_launch_occurrence_blocks.md). Legacy workflow launch occurrences blocked from duplicate execution.

- [runtime.workflow_phase_runs](/opt/muse/skills/muse_db/references/tables/runtime.workflow_phase_runs.md). Individual workflow phases, ordering and execution state.

- [runtime.workflow_runs](/opt/muse/skills/muse_db/references/tables/runtime.workflow_runs.md). Workflow run identity, launch attribution and execution state.

- [runtime.writer_epoch](/opt/muse/skills/muse_db/references/tables/runtime.writer_epoch.md). The active reliable-volume writer epoch.

### saved

- [saved.item_links](/opt/muse/skills/muse_db/references/tables/saved.item_links.md). Relations from a saved item to other records: the widget, citation or chat message it was saved from, and its attached images, videos and files.

- [saved.items](/opt/muse/skills/muse_db/references/tables/saved.items.md). Anything the user saved (a product, link, post, chat message or note), each once, with notes saying what it was saved for, its status and the agent, chat and turn that saved it.

### scheduler

- [scheduler.cron_mutations](/opt/muse/skills/muse_db/references/tables/scheduler.cron_mutations.md). Recorded changes to scheduled jobs and their request attribution.

- [scheduler.delivery_outbox](/opt/muse/skills/muse_db/references/tables/scheduler.delivery_outbox.md). Scheduled-run results awaiting delivery and their delivery state.

- [scheduler.doctor_run_plans](/opt/muse/skills/muse_db/references/tables/scheduler.doctor_run_plans.md). Maintenance task plans saved for a doctor run.

- [scheduler.doctor_task_state](/opt/muse/skills/muse_db/references/tables/scheduler.doctor_task_state.md). Maintenance task evidence and the last successful run.

- [scheduler.events](/opt/muse/skills/muse_db/references/tables/scheduler.events.md). Scheduler events linked to jobs and runs.

- [scheduler.job_definitions](/opt/muse/skills/muse_db/references/tables/scheduler.job_definitions.md). Versioned scheduled-job definitions and prompt references.

- [scheduler.job_idea_scope](/opt/muse/skills/muse_db/references/tables/scheduler.job_idea_scope.md). Idea provenance attached to scheduled jobs.

- [scheduler.job_runs](/opt/muse/skills/muse_db/references/tables/scheduler.job_runs.md). Individual scheduled job runs, definition version and execution times.

- [scheduler.jobs](/opt/muse/skills/muse_db/references/tables/scheduler.jobs.md). Saved schedules, enabled state and their source identity.

- [scheduler.scheduled_resume_registrations](/opt/muse/skills/muse_db/references/tables/scheduler.scheduled_resume_registrations.md). Scheduled resume registrations and acknowledgement attempts.

- [scheduler.scheduled_resume_state](/opt/muse/skills/muse_db/references/tables/scheduler.scheduled_resume_state.md). Current scheduled resume projection and next registered wake-up.

- [scheduler.terminal_signals](/opt/muse/skills/muse_db/references/tables/scheduler.terminal_signals.md). Terminal signals and messages for completed scheduler runs.

### self_improvement

- [self_improvement.backfill_day_runs](/opt/muse/skills/muse_db/references/tables/self_improvement.backfill_day_runs.md). Per-day historical processing runs for an improvement objective.

- [self_improvement.calculation_records](/opt/muse/skills/muse_db/references/tables/self_improvement.calculation_records.md). Saved improvement calculations and their evidence handles.

- [self_improvement.calibration_records](/opt/muse/skills/muse_db/references/tables/self_improvement.calibration_records.md). Recorded calibration assessments over an evidence window.

- [self_improvement.connector_read_audit](/opt/muse/skills/muse_db/references/tables/self_improvement.connector_read_audit.md). Connector reads, their stated purpose and request attribution.

- [self_improvement.conversation_follow_up_attempts](/opt/muse/skills/muse_db/references/tables/self_improvement.conversation_follow_up_attempts.md). Conversation follow-up decisions and delivery submissions.

- [self_improvement.handoff_dedupe](/opt/muse/skills/muse_db/references/tables/self_improvement.handoff_dedupe.md). Previously emitted improvement handoffs used to avoid duplicates.

- [self_improvement.learning_adoption_events](/opt/muse/skills/muse_db/references/tables/self_improvement.learning_adoption_events.md). Recorded adoption outcomes for learned guidance.

- [self_improvement.leases](/opt/muse/skills/muse_db/references/tables/self_improvement.leases.md). Leases for improvement work and their current ownership.

- [self_improvement.objective_markers](/opt/muse/skills/muse_db/references/tables/self_improvement.objective_markers.md). Named progress markers for improvement objectives.

- [self_improvement.objective_state](/opt/muse/skills/muse_db/references/tables/self_improvement.objective_state.md). Current improvement objective state and source revisions.

- [self_improvement.proactivity_changes](/opt/muse/skills/muse_db/references/tables/self_improvement.proactivity_changes.md). Brief agent-reported completed changes. Delivery acknowledges the ledger without making its entries selection candidates.

- [self_improvement.relationship_briefs](/opt/muse/skills/muse_db/references/tables/self_improvement.relationship_briefs.md). Saved relationship briefings and their linked ideas.

- [self_improvement.runs](/opt/muse/skills/muse_db/references/tables/self_improvement.runs.md). Improvement runs, objective identity and processing phase.

### shell

- [shell.user_state](/opt/muse/skills/muse_db/references/tables/shell.user_state.md). User favorites, access history and ordering for shell items.

### spaces

- [spaces.action_arguments](/opt/muse/skills/muse_db/references/tables/spaces.action_arguments.md). Arguments recorded for an artifact action invocation.

- [spaces.action_invocations](/opt/muse/skills/muse_db/references/tables/spaces.action_invocations.md). Artifact action requests and their transport and order.

- [spaces.action_results](/opt/muse/skills/muse_db/references/tables/spaces.action_results.md). Results or errors from artifact action invocations.

- [spaces.backfill_markers](/opt/muse/skills/muse_db/references/tables/spaces.backfill_markers.md). Completed artifact backfill operations.

- [spaces.file_artifact_identities](/opt/muse/skills/muse_db/references/tables/spaces.file_artifact_identities.md). Stable identities for file artifacts.

- [spaces.proposals](/opt/muse/skills/muse_db/references/tables/spaces.proposals.md). Artifact proposals and their confirmation state.

- [spaces.shares](/opt/muse/skills/muse_db/references/tables/spaces.shares.md). Artifact sharing settings and publication state.

- [spaces.spaces](/opt/muse/skills/muse_db/references/tables/spaces.spaces.md). Artifact inventory, names, source locations and session associations.

- [spaces.user_state](/opt/muse/skills/muse_db/references/tables/spaces.user_state.md). Artifact favorites, access history and ordering.
