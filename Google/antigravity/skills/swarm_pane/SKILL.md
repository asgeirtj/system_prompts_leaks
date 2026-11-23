---
name: swarm_pane
description: >-
  ONLY for the coordinator of an active /swarm session. What the coordinator
  writes so the Swarm UI's Overview can show the swarm's goal, its groups of
  work and a screenshot timeline; load it before you brief and add the first
  workers. Outside /swarm, do not load this.
disable-slash-command: true
---

# The Swarm UI's Overview

The Swarm UI builds its Overview from the board and roster. Two small things
from you make it read well: a plan file, and screenshots your workers flag.

Don't add a narrator; this Overview replaces it. Add one only when the user
asks for it by name.

## Write the plan

Once the workers are added, write  
`<appData>/brain/<your conversation id>/.system_generated/swarm/plan.json`:

```json
{"goal": {"title": "Fix Hub split pane layouts", "line": "Audit, fix, then verify in both themes."},
 "tasks": {"auditor": "Audit split panes across states", "fixer": "Put split panes in one card"},
 "threads": [{"id": "t-split", "title": "Split pane cards", "goal": "Panes share one card with clean headers.",
              "tasks": ["auditor", "fixer"]}]}
```

-   `goal.title` is 4 to 8 words and `goal.line` at most 12.
-   `tasks` names each worker's piece in a few words.
-   `threads` are 1 to 6 groups by the outcome they deliver, never by agent,
    and every worker sits in one.
-   Rewrite the file when you add workers, move work, or the goal changes;
    nothing else. Status, blockers and asks come from the board, so never put
    them here.

## Screenshots for the timeline

When the user asked for a change they can see (UI, layout, visuals), tell each
worker who takes screenshots, in its brief, to flag the ones that show a step
on its own line of the post:

```
Screenshot: <absolute path> | what changed, at most 10 words
```

-   Save them under the worker's own `<appData>/brain/<conversation id>/`
    folder; the UI shows nothing from anywhere else.
-   Same screen, size and theme each time, full window, no crops or diffs.
-   Skip this for backend, infra, data or docs work.
