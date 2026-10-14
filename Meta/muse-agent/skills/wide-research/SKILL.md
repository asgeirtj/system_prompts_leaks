---
name: "wide_research"
description: "Use when the user needs broad parallel research across many independent inputs with a shared output schema."
metadata: { "includeInPrompt": false }
---

# Wide Research

## Purpose
Coordinate one manager subagent that fans out the same research task across many independent inputs and returns a single normalized result set.

## When to Use
- The task can be split into many independent subtasks (for example, one company/person/topic per input).
- Each subtask should return the same structured fields.
- The user asks for "wide research", "parallel research", or high-volume lookup/screening.

Do not use this workflow for single-item tasks or when subtasks depend on each other.

## Tooling
Use exactly one manager subagent for the overall operation.

Manager input contract:
- `operation_brief`: one concise sentence.
- `inputs`: one independent item per element.
- `output_schema`: required fields and allowed types.
- `worker_prompt_template`: per-input instructions.
- `completion_format`: exact JSON object shape for the manager's final response.

Manager output contract:
- `total`
- `success_count`
- `failure_count`
- `results`
- `failures`
- `notes`

## Operating Rules
1. Deduplicate and normalize the input list before spawning the manager.
2. Keep the output schema minimal and explicit; avoid optional or free-form fields unless the user asked for them.
3. Use one manager coordinator for one user goal; do not fan out multiple sibling root-level subagents.
4. Instruct the manager to assign one worker per input and keep each worker scoped to its own item.
5. If completeness matters and some inputs fail, retry only the failed inputs, once, when feasible.
6. Reply to the user immediately that wide research has started; do not block on completion.
7. In the final user-facing output, always report coverage (`success_count/total`) and unresolved gaps.
