---
name: export-bot-template
description: >-
  Create a shareable copy of this bot's setup. Use when the user wants to share
  or export this bot. Not for a team copy of this bot that teammates can
  message; use ConvertToTeam for that when you have it.
---
Not for a team copy of this bot that teammates can message; use ConvertToTeam for that when you have it. Call it with action preview first.

A template is a shareable copy of this bot. You choose which memories, skills, routines, and plugins to include, then pack it with `CreateBotShareJson`.

1. Audience

This user creates Public templates. Do not offer a Team template or ask who can use it. `CreateBotShareJson` may include a predefined scope if the template already exists and is being updated. In that case, use the existing visibility.

2. Read

Read this bot's memories, user skills, routines, and plugins — in that order. After each one, send a short conversational update with counts and names (e.g. "Just read through my routines: standup-summary and pr-babysitter.") Don't paste file contents or a draft.

Memories: `profile.md` and `log/` only. Skip `[episode]` and `[note]` lines; they aren't portable workflow. Don't read user-memory or project shards.

Skills: note the folder slug or frontmatter name and read the job text. Don't use the raw `SKILL.md`.

Routines: note the folder slug and read the job text. Don't copy `automation.json`.

Plugins: installed marketplace ids from SearchPlugins. Usage is this conversation, plus anything a kept routine or skill depends on. An `[episode]` in this chat can name a service you used; it still isn't a memory. Don't grep `log/` or older transcripts for usage.

3. Choose

Keep two decisions separate. Audience is who can use the template: new templates are Public. What to include is personal vs shared: leave out anything that's only this user's private stuff. Public templates should generalize company-internal specifics and keep the workflow. An existing Team template being updated can keep useful team process — repo names, how the team works, etc.

Do not say "scrub" to the user.

Judge each memory, skill, and routine on its own. A convention sitting next to a secret is still a convention.

Regardless of scope, leave out secrets, credentials, people's names, private links, and trade secrets. If a sensitive bit is one part of a useful item, take that bit out and keep the rest (e.g. "send Meg the Monday staffing plan" becomes "send your staffing lead the Monday staffing plan"). Omit only when the sensitive part is the whole item. If a job remains after taking out names, repos, channels, or customers, keep it. Phrases like "the watched repo" or "the team channel" are already generalized — keep those items.

Memories: job or convention facts only, original wording except what you took out.

Skills and routines: include relevant ones with personal details taken out as above.

Plugins: only marketplace ones this bot needs — those used in this conversation or those a kept skill or routine depends on. Don't include tokens, account slots, or secrets. Do not include custom MCP servers. Instead, add a log memory that names the service (URLs are okay but no secrets).

4. Getting started

Author a getting-started skill for the template: the first conversation the imported bot has with its new owner. Create it as one of your skills first — only skills this bot actually has get packed — then include it in `skills` like the others (e.g. named "getting-started") and set `gettingStarted` to its exact name from that list.

Derive it from this bot's own setup, generalized like everything else: one line on what the bot does, then the setup questions whose answers made this bot work — which channels, repos, or services to connect (the ones the kept skills, routines, and plugins need), what to be called, how the new owner's team works — asked one at a time, then what to do with the answers (write memories, create the routines, start the job). Write it as the imported bot talking to its new owner: it asks for their answers, never restates this user's. Keep it short; the template has a size cap.

Skip this step and omit `gettingStarted` only when the template has nothing to set up.

5. Call

Send one short line of what you're keeping vs leaving out (e.g. "Keeping 3 memories, 2 skills, and the Linear plugin; leaving out the personal memories."), then call `CreateBotShareJson`. Don't recap the read updates. Don't paste a draft.

Template descriptions should be short: at most a few sentences. Detailed context belongs in skills, memories, etc., not the description.

They can't edit the review card. If they want a change, they tell you and you call the tool again — don't tell them to edit it themselves.

If anything was a gray area — might be a trade secret, too company-specific, thin plugin evidence — send one short note after the card of what you chose. Don't quote the sensitive part. If nothing was gray, don't add a note.
