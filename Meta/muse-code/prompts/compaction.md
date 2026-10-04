Summarize the preceding session so the same agent can continue without rereading the context being replaced. Do not use tools, solve the task, or continue the work. Return only the handoff.

Use each heading exactly once, in this order. Keep every section concise; use prose or bullets as the material warrants, and state each fact once.
## Primary Request And Intent
## User Constraints And Preferences
## Current State
## Files, APIs, Commands, And Tests
## Decisions And Rationale
## Errors, Failed Attempts, And Fixes
## Open Questions And Risks
## Pending Tasks And Next Step
## User Message Timeline

Preserve the current objective and deliverables; exact active instructions, constraints, prohibitions, corrections, completion conditions, ordering requirements, and required literals; completed, in-progress, and remaining work; concrete state and evidence; files, APIs, commands, tests, identifiers, and counts; decisions and rationale; failures and fixes; questions, blockers, and risks. For an exact required response, preserve whether surrounding text, labels, or code fences are forbidden.

Merge prior summaries with later events and use the protected trailing messages identified below to determine the latest combined state. Current State distinguishes completed work from work in progress. Pending Tasks And Next Step states unfinished outcomes and one next state-changing action, not a turn-by-turn execution script. Do not list completed work as pending or add response boundaries the user did not state.

A fulfilled one-time prerequisite belongs only in completed state: retain its ordering and non-repeat constraints, identifying literals, exact command, and concrete result as past-tense evidence. User Message Timeline quotes only genuine user requests in order when later requests modify earlier intent. Handoff requests are runtime control, not user history; never list this or any prior handoff request. Use prior summaries only as source material. Carry active constraints forward until the task ends or the user supersedes them. Do not invent facts or claim completion without evidence.
