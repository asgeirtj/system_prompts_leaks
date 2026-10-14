---
name: requirements-clarification
user-invocable: false
description: >-
  Clarify a material user-owned product decision before substantive
  implementation commitments. Use only when request and named/governing evidence
  still leave a choice that would materially change scope, platform support, user-facing
  surface, data/API contract, domain values, project placement, or cross-system
  architecture; also use when a truncated request omits such a choice.
  On the initial turn, inspect only named or governing requirements evidence,
  then ask directly without loading: prefer structured input; ask one blocking
  outcome question or at most three coupled questions; wait. After the answer,
  load the body before write or delegation. Do not use for
  implement/build/fix/debug/refactor work when expected behavior is settled,
  plan/design deliverables owned by Plan, complexity/greenfield/integration
  alone, agent-owned technical choices, locally discoverable facts, reversible
  defaults, permission to begin, or stop/no-tool turns. Never re-ask supplied
  facts or turn clarification into refusal.
---

# Requirements Clarification

Resolve only a remaining user-owned product decision. Do not turn normal
implementation uncertainty into a question.

1. Read the request and any explicitly named or governing requirements source.
   Do not scan broadly for hypothetical ambiguity. If this evidence settles the
   outcome, proceed without asking.
2. Separate user-owned outcomes and authoritative inputs from agent-owned
   implementation choices. Research discoverable facts yourself. Never ask the
   user to choose a library, framework, or method the agent can determine.
3. If a narrow reversible default safely satisfies the request, state it and
   proceed. Complexity, greenfield status, file count, or integration work alone
   never requires clarification.
4. Otherwise ask before substantive commitment. Reads, notes, or one small
   branch-neutral probe are allowed; a scaffold, public contract, embedded domain
   values, or cross-system architecture is a commitment.
5. Prefer `request_user_input` when available. Ask one blocking outcome question;
   group at most three tightly coupled questions. Offer concrete outcome options
   and a recommendation. Never ask merely for permission to begin.
6. After the answer, do not ask again unless later evidence reveals a distinct
   material fork. Apply the answer and continue.

`plan` owns standalone plan and design deliverables. This skill does not create
an approval gate or stop a specified implementation merely because planning
would be useful. Never re-ask facts already supplied by the request or governing
evidence, and never turn clarification into a refusal.
