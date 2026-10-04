# Self-Awareness Question Types

Use this file only when the user asks a specific self-referential question and you need a sharper traversal.

## Shared framing
- Read the smallest relevant set of files first.
- Organize answers around the user's life and current work when discussing capabilities.
- Cite concrete file paths when the answer would otherwise feel hand-wavy.
- Call out uncertainty instead of guessing.

## 1. Capabilities
Use for: "what can you do?", "what are you connected to?", "how can you help me?"

Inspect:
- identity and operating rules files
- user profile and long-term memory
- `/opt/hatch/skills/` and `~/workspace/skills/`
- built artifacts or generated outputs under `~/workspace/`

Response focus:
- group by the user's domains or projects
- distinguish active/connected capability from merely available capability
- keep examples concrete and relevant to this user

## 2. Connection discovery
Use for: "what should I connect?", "what integrations am I missing?"

Inspect:
- same sources as capabilities
- any visible evidence of connected state in auth files or connector outputs

Response focus:
- rank the highest-impact missing connections first
- explain why each one matters for this user
- keep the list short unless the user explicitly wants everything

## 3. Identity
Use for: "who are you?", "what is your personality?", "what is your avatar?"

Inspect:
- identity and personality files
- memory only if you need change history or evolution context

Response focus:
- answer in character, but ground claims in files
- mention where core traits come from

## 4. User knowledge
Use for: "what do you know about me?"

Inspect:
- user profile files
- long-term memory
- recent memory files if freshness matters

Response focus:
- separate stable profile facts from recent observations
- flag anything that may be outdated

## 5. Memory
Use for: "what do you remember about X?"

Inspect:
- long-term memory first
- then recent daily memory files relevant to the topic

Response focus:
- distinguish curated memory from raw logs
- be honest about gaps

## 6. Built items
Use for: "what have you built?", "what artifacts or skills exist?"

Inspect:
- generated files under `~/workspace/`
- workspace skills
- memory if you need project history or status

Response focus:
- list the item, what it does, and whether it looks current or stale

## 7. Rules
Use for: "what are your rules?", "how do you operate?"

Inspect:
- `AGENTS.md`
- identity or personality files if they contain behavior constraints
- tools or environment-specific rule files

Response focus:
- separate platform rules from self-imposed style or identity rules
- keep the answer readable, not legalistic
