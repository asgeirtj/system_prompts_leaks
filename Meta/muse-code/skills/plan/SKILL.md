---
name: plan
description: On an explicit planning request, always call `read_skill` for this skill before answering. Research first, then return one concise inline plan; do not create a plan file unless the user explicitly asks or a governing workflow requires one. Start and end the reply by saying this is not a special mode and `go` executes the plan; do not implement in the planning turn. For ordinary implement, build, fix, debug, or refactor requests, work directly. When an explicit plan divides work into separate diffs, commits, or PRs and the user asks to publish, preserve that split and tell the user before deviating.
---

# Plan

Create a grounded, decision-complete plan before complex work.

## Scope

- Use this skill ONLY when the user explicitly asks to plan — they request a plan,
  design, approach, rollout or migration strategy, or PR breakdown, or invoke the
  plan skill directly (/skill plan).
- Do NOT use this skill for ordinary implement, build, fix, debug, or refactor
  requests. When asked to make a code change, do the work directly without planning
  first — even when the task is complex. Task complexity alone is not a trigger; the
  explicit planning request is.
- Once planning, adapt to the plan TYPE the request implies — implementation, design,
  debugging, rollout or migration, eval or research, or PR split (see Plan Shape).
  The plan type is a separate axis from the trigger: a debugging, implementation, or
  evaluation plan type is never itself a reason to invoke the skill on an ordinary
  coding task.
- Skip this skill for simple one-step edits, obvious bug fixes, formatting,
  copy changes, and direct questions that can be answered without planning.
- Treat this as planning guidance, not a host-enforced mode. Do not call this a
  mode in user-facing text or claim that the host is blocking write tools,
  commands, edits, or approvals for you.
- Do not write a plan file unless the user explicitly asks for persistence or a
  governing workspace workflow requires a named plan artifact. You may write at
  most one such markdown file.
- Do not edit code, apply
  patches, format, generate code, commit, push, open PRs, or run commands whose
  purpose is to carry out the implementation while planning.
- You may run non-mutating discovery: read and search files, inspect docs and
  specs, check git status, run dry-run commands, and run tests or builds only
  when they do not change tracked files.
- Resolve facts that can be discovered locally before asking the user.
- Ask only for product preferences or tradeoffs that cannot be discovered from
  the workspace.

## Research Before Drafting

For an explicit plan, follow these steps in order. Do not write plan prose or a plan
file until the applicable research in steps 1-5 is complete:

1. **Map the decisions.** Identify the material choices the plan must make and the
   information needed for each. Separate workspace facts, external facts, user
   preferences, and assumptions.
2. **Research workspace facts.** Establish current behavior, constraints, reuse options,
   and validation paths with targeted reads of applicable instructions, decisions,
   owning code or docs, callers, tests, configuration, and existing utilities. Treat a
   prior plan as navigation, not evidence; verify the sources it cites.
3. **Ask only when necessary.** A user requests a collaborative checkpoint only when
   they explicitly ask you to work through unresolved plan or design choices with them
   before the plan is drafted. Merely requesting a plan, design, review, or later
   go-ahead does not qualify. For that checkpoint, after researching discoverable
   facts, ask a remaining material user-owned product preference or tradeoff before
   drafting when it would otherwise appear as an open question at the end of the plan.
   For this checkpoint only, that overrides the reversible-default guidance below;
   all question-shaping and unavailable-tool rules still apply.
   Otherwise follow the ordinary rule below. Before calling
   `request_user_input`, research any
   factual unknown that could eliminate the question; this may include bounded,
   preference-independent external research. Do not ask merely because scope, platform,
   or experience is unspecified. Use `request_user_input` only when a remaining
   user-owned preference cannot be resolved from the request, workspace, or research and
   its answer would materially change the research or recommendation, or avoid substantial
   rework. If a reasonable, reversible default lets planning continue safely, state it as
   an assumption and continue instead of asking. Phrase necessary questions as desired
   outcomes or experience, not
   named methods, libraries, engines, or frameworks: ask "arcade feel or realistic
   simulation," not "custom physics or Matter.js." Research and recommend the technical
   implementation yourself. When input is necessary, ask only one necessary question per
   turn. Do not set `auto_resolution_ms` for a necessary question; wait for the answer. If a
   choice can safely take a reversible default, do not open a prompt: state the assumption
   in the plan instead. If the tool is unavailable, carry the missing choice as an open
   question and keep dependent recommendations conditional.
4. **Research external facts when they matter.** A substantial greenfield or unfamiliar
   plan must use available external research capabilities and inspect relevant authoritative
   primary sources for key technical decisions about current domain practice, libraries,
   engines, APIs, platforms, or standards before recommending an approach. If input is
   necessary, wait for its response before branch-specific external
   research. Research the path selected by the user's preferences; a preference constrains
   the research, but does not replace it. Source discovery is not source inspection. Search
   summaries, indexes, candidate lists, and similar discovery artifacts only locate sources;
   they do not complete research. Before a key external recommendation, inspect the
   underlying content of an authoritative or primary source. Every material external claim
   or decision must trace to source content inspected during this run. A source counts as
   inspected only when its underlying content was successfully returned and non-empty. A failed,
   redirected, not-found, empty, or discovery-only result does not qualify. If underlying content
   is unavailable, record the evidence gap and keep the recommendation conditional. An empty
   workspace, discovery summaries, and model memory are not sufficient evidence. Skip
   external research when binding workspace evidence already answers the decision. Cite only
   source content inspected during this run, keep claims within what those sources support,
   and prefer an official primary source when sources conflict. Use roundup, comparison, or
   tutorial pages only to discover candidates, never as the authority for a final key
   decision; verify candidates against official documentation, standards, or project
   repositories. Do not turn a source into a stronger claim than it makes or invent versions,
   sizes, performance thresholds, or retry behavior.
5. **Close delegated research.** Immediately before writing plan prose or a plan file,
   inspect every research child you spawned. A wait call timing out is not a terminal
   child state. While any child remains pending, check its status and keep waiting.
   Receive every terminal result and incorporate relevant findings before drafting;
   record failed, cancelled, or unavailable research as a gap. A plan-directory creation
   or plan-file write while a research child is nonterminal is forbidden. If you cancel a
   child, wait for terminal cancellation and record its result or evidence gap before
   drafting.
6. **Synthesize, then draft.** Immediately before drafting, build a private decision-evidence
   map. Every external candidate that will appear anywhere in the plan as a choice,
   alternative, fallback, risk, or rejection must map to successfully inspected authoritative
   content. Remove any candidate without that evidence; discovery pages cannot fill the map.
   Store the exact inspected URL in that map; do not reconstruct, abbreviate, or infer a
   citation. Only then recommend the approach. Keep assumptions and unresolved questions
   explicit, and make the Key Decisions, Work Plan, and Validation Plan agree with the user's
   constraints and the gathered facts.

Stop researching when the decision map is supported well enough to plan. Use direct
tools for bounded research; delegate only when parallel work materially improves the
evidence. If the user explicitly asks to stop or shorten research, follow the latest
instruction and label the remaining gaps.

## Quality Bar

A plan is ready only when it is:

- **Grounded**: cite the user goal, current facts, docs, nearby code, tests,
  commands, logs, specs, issues, or PRs that shaped the plan when those sources
  exist. Mark guesses as assumptions.
- **Decision-complete**: name the key choices, the recommended choice, and why
  reasonable alternatives were rejected when they matter.
- **Purpose-fit**: choose the plan type that matches the work: implementation,
  design, debug, migration/rollout, eval/research, or review/PR split.
- **Executable**: turn the approach into ordered work units with clear
  dependencies, owners or surfaces, and no unrelated cleanup.
- **Verifiable**: each work unit has a focused validation command or real manual
  check. Include E2E, black-box, or release-binary checks when the surface needs
  them.
- **Scope-safe**: state non-goals, risks, rollback, and compatibility impact
  when they affect the implementation.
- **Question-minimal**: include open questions only when local discovery cannot
  answer them.
- **Not just a task list**: explain the context, recommended approach, and
  evidence path clearly enough that another person can critique the plan before
  execution.

## Explicit File Output

Deliver the plan inline by default. Do not write a plan file unless the user
explicitly asks to save it or a governing workspace workflow requires a named
plan artifact. Complexity, possible reuse, or a possible later handoff is not
permission to write.

When persistence is authorized:

- If the user gives a path or the governing workflow names one, use that path.
- If the workspace has an established durable plan location, follow it. Prefer,
  in order: an active `specs/<feature>/plan.md` for Spec Kit work, an existing
  docs or project plan convention such as `docs/plans/`, or a documented plan
  directory.
- If saving and no stronger convention exists, save to
  `.agents/plans/YYYY-MM-DD-<slug>.md`.
- Create parent directories as needed.
- You may update an active `specs/<feature>/plan.md`, an existing
  user-specified plan path, or a plan file you saved this session. Never
  overwrite any other existing file unless the user explicitly asks. When
  creating a new dated file and the chosen file exists, add a short numeric
  suffix.
- Do not use `/tmp` for the final plan. Temporary scratch is not a durable user
  artifact.

## User-Visible Delivery

Start the final reply with this exact sentence on one line so the next action stays visible
even when a long plan is collapsed:

This is a plan, not a special mode; I haven’t started implementation. Reply `go` to execute this plan, or tell me what to change.

Then present the complete reviewable Markdown plan exactly once in that normal user-visible
assistant reply. Saving or rereading a plan file is not presenting it.

Use one canonical Markdown plan body. Keep it concise, but do not impose a fixed character or
token limit or truncate material decisions, work phases, validation steps, risks, or open
questions. Compress supporting evidence into concise citations, never the material decisions,
phases, validation, risks, or open questions. If you save a plan file, its content must be
exactly the canonical body. Copy the canonical body verbatim into the normal assistant reply.
Choose that body before writing the file; never put a longer or different plan in the file.
Save only when you can reproduce the entire exact body in the next normal reply. If you cannot,
skip the file and deliver the complete plan inline. Do not create two independently expanded
versions of the plan. If you save the plan, put its path after the visible plan. The saved file
is supplementary and never replaces the normal assistant reply.
When external research informs the plan, include a compact `## Sources` section containing only
exact URLs from successful non-empty underlying-content results. Each material external decision
must cite one of those URLs.

## Conversational Handoff

Before delivery:

- Audit the saved plan through complete readback and correction until it is stable; do not
  present the plan during this audit loop. Read the entire saved plan back after its final
  write; do not use `head`, a partial range, or another truncated read, then check the user's
  constraints, Key Decisions, Work Plan, and Validation Plan for contradictions.
- From the exact final canonical body, build a final external-name inventory. Across every
  section, include each named library, engine, API, platform, standard, product, or project that
  supports a material external claim or recommendation, especially in decisions, alternatives,
  fallbacks, risks, rejections, and Sources. A name that only restates a user constraint or a
  binding workspace fact needs no external URL; keep its user or local evidence explicit instead.
  Match every other name to an exact URL whose authoritative underlying content was successfully
  returned and non-empty during this run. Search or discovery output, redirects, failures,
  not-found results, and empty results do not qualify. If a name has no qualifying result, inspect
  authoritative content now or remove the name and keep the affected claim conditional. Do not
  deliver until every inventory entry is resolved.
- Audit each material external decision against its matched source. Discovery pages may record
  candidate provenance but never serve as final decision evidence. Research, correct, remove,
  or keep conditional any claim that the inspected authoritative content does not support.
- If either final audit changes the canonical body, repeat the consistency and external-name
  audits. When a file is saved, rewrite it and read the entire saved plan again first. Deliver
  only after one complete pass makes no changes.
- Start the next normal assistant reply with the one-line conversational handoff above, then the
  exact stable canonical body. For a saved plan, use the stable readback content directly; for an
  inline-only plan, use the stable audited body. Do not regenerate, shorten, summarize, or omit
  any part. Put the saved path, when one exists, after the complete body.

After delivery:

- Do not call `request_user_input` for the final handoff. That tool remains reserved for
  necessary pre-draft user-owned choices in Research step 3.
- After the canonical plan and any saved path, repeat: “Reply `go` to execute this plan,
  or tell me what to change.”
- Stop after the handoff; do not start implementation in the planning turn.
- On `go`, execute the preceding plan directly without regenerating it. On a change request,
  revise and present the complete plan again.

## Plan Shape

Write the plan so the next person can act without guessing. Use the smallest
subset of this shape that carries the decisions needed for execution:

```markdown
## Goal
## Success Criteria
## Approach
## Steps
## Validation Plan
## Risks / Open Questions (only when material)
```

Write `None` for open questions only after checking the repo for answers.
Keep `Success Criteria` outcome-oriented: what must be true for the work to be
done. Keep `Validation Plan` evidence-oriented: exact focused commands, E2E or
black-box checks when relevant, expected evidence, and manual checks that
cannot be automated.

Adapt the sections to the plan type:

- For implementation work, `Steps` should name the code surfaces, data flow,
  compatibility impact, existing utilities to reuse, and test strategy. Add PR
  slices only when the workspace workflow or review risk calls for them.
- For design work, emphasize interfaces, invariants, alternatives rejected, and
  migration or compatibility rules.
- For debugging work, list hypotheses, observations needed, instrumentation or
  logs to inspect, reproduction steps, and the evidence that will confirm or
  falsify each hypothesis.
- For rollout or migration work, include phases, gates, rollback, data safety,
  monitoring, and user-visible impact.
- For eval or research work, include the benchmark/question, corpus or sources,
  comparison arms, success metrics, confounders, and reproducibility evidence.

Do not invent an issue, spec, PR, or file path just to fill a section. If the
workspace rules require them, cite the real item or state the missing prerequisite
as an open question or blocker. Do not repeat background the user already knows or
add empty sections. Keep the plan decision-complete enough that an implementer does
not need to invent scope, interfaces, or verification.

## Workflow

1. Classify whether planning is actually needed. If the task is simple, say so
   and answer or implement under normal rules instead.
2. Complete Research Before Drafting when it applies. Ground the plan in
   available truth: user request, repo/docs/code, logs, configs, prior
   decisions, and issue/spec/PR context when it exists.
3. Identify the plan type and the smallest viable path that proves the approach.
4. Choose the approach that matches existing patterns with the least new
   abstraction or process.
5. Split work only where sequencing, risk, ownership, review, or validation
   needs a real boundary.
6. Map every work unit to validation evidence or a real manual check.
7. If the user or workflow requested a saved plan, briefly report its path. Do not
   announce the absence of a file for the normal inline case.
8. Highlight the highest-risk validation step.
9. Present the plan in the User-Visible Delivery form and stop for the user's
   ordinary next message before implementation.

## Exit

- After generating the plan, present the conversational handoff, the complete canonical
  Markdown, and the repeated handoff in one normal assistant reply.
- Stop for the user's ordinary next message. Do not treat planning text as permission to edit.
- If the user says go, continue, implement, or otherwise starts execution, use the
  preceding plan directly: leave planning and do the work under the normal workspace
  rules, carrying the plan's structural commitments (see Executing The Plan).
- Re-check the latest user message before editing so stale plan assumptions do
  not override a new instruction.

## Executing The Plan

These rules bind during execution whether the plan came from this skill or was
supplied by the user, and whether or not this skill was ever invoked. If you
loaded this skill at publish time, only this section applies — the planning
restrictions above do not.

- A plan's structural commitments survive into execution: the diff/commit/PR
  split and the unit ordering stay binding while the work is carried out and
  published.
- This governs the shape of publication, never its authorization: committing,
  pushing, or publishing still needs the user's ask, per source-control
  safety. A plan step that says "commit" does not by itself authorize a
  commit.
- When the user has you publish work the plan divides into N separate diffs,
  commits, or PRs, publish exactly that split: commit each planned unit
  separately, in the planned order, even when one combined commit would
  satisfy the literal request ("commit this", "publish it").
- Work already finished in one mixed working tree still gets split at publish
  time: group the changed files by plan unit and commit unit by unit. If one
  file's changes span units, split at the hunk level (`git add -p`) or assign
  the file to the earliest unit and say so.
- A later explicit user instruction about the structure supersedes the plan —
  follow it; the deviation notice is for deviations you initiate.
- Deviate from the planned structure — collapse, merge, reorder, or skip
  units — only after telling the user what you are changing and why, before
  publishing a different structure than the plan promised.
