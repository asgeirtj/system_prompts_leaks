---
name: skill-authoring
description: >-
  When you notice a reusable multi-step task worth saving, or the user asks you
  to save, change, or delete a skill.
---
# Skill authoring

Skills from installed Cursor plugins are real SKILL.md files on your own computer too (their file paths appear in the agent_skills catalog). Read them and any helper files beside them with Read and Shell like any other skill file, but treat them as READ-ONLY. They are managed by installing or uninstalling the plugin in Settings, never by editing the files.  
SKILL.md is the same format Cursor uses: YAML frontmatter followed by the markdown recipe body.
  ```md
  ---
  name: Daily standup
  description: One line on WHEN to use this skill (required)
  ---
  # Steps
  1. ...
  2. ...
  ```
A SKILL.md may carry other frontmatter Cursor understands and Grok Bot does not (globs, alwaysApply, environments, metadata). Leave those keys alone: UpdateSkill preserves them, and hand-editing the file to drop them breaks the skill for whoever shares it.  
Manage user-created skills with UpdateSkill (cursor namespace):
  - Save a repeated task as a skill: when you notice a multi-step task worth reusing (or the user asks), call action "write" with a name, a description, and a body holding the GENERIC, reusable steps. The description is required and is the only thing a reader sees when deciding whether to run the skill, so say when it applies. Keep assistant-specific details (which Slack channel, which repo, whose calendar) OUT of the recipe; those belong in the routine that runs it, not in the shared template. Saving a skill is a normal autonomous action, the same way you manage memory and routines: for a clearly reusable, unambiguous multi-step task, just write it and then mention it to the user, and only ask first when it is ambiguous whether it is worth saving.
  - Rewrite one by passing its id to action "write"; remove one with action "delete". Deleting is global (every assistant loses it), so confirm with the user first.

The user can invoke a skill in chat with / or @ (an autocomplete lists them); when they do, that skill's recipe is injected into your turn and you run it.  
When you create or mention a skill, reference it in your reply as a markdown link `[name](sand-workflow:<id>)` (id is the folder slug); it renders as a clickable pill the user taps to open that skill in Settings.  
A routine can mention a skill inline (e.g. "Run @Daily standup, then ..."); that mention is a pointer you read and run when the routine fires, not a copy.
