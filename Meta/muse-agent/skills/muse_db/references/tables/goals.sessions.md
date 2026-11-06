# `goals.sessions`

Sessions and root agents associated with a goal.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `root_goal_id` uses `text` and is required.

  FK → `goals.goals.goal_id`

- `root_agent_id` uses `text` and is required.

  Soft local reference → `agent.agents.agent_id`.

- `session_id` uses `text` and is required.

  Soft local reference → `agent.sessions.session_id`.

## Keys and relationships

- FOREIGN KEY `sessions_root_goal_id_fkey` covers `root_goal_id`. References [goals.goals](/opt/muse/skills/muse_db/references/tables/goals.goals.md), columns `goal_id`.

- PRIMARY KEY `sessions_pkey` covers `root_goal_id`.
