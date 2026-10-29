# Agent App Template

Optional worksheet for substantial agent app work, not a required file or questionnaire. Fill only sections that clarify material decisions, using [the skill's lifecycle](../SKILL.md#agents-api-lifecycle) for decision and setup rules. Keep confirmed facts, assumptions, and open questions distinct. Mention environment variable names only; never include secret values.

## Goal

- User request:
- Smallest useful outcome:
- Success criteria:

## Architecture

- Selected runtime: Agents API or Agents SDK
- Model/tool loop owner:
- Why this runtime:
- Interaction: stream/wait or submit and collect later
- Application function responder and its lifetime, if needed:
- Execution environment and provider, if needed:
- Session and sandbox owner:
- Continuity and durability requirements:

## User Workflow

- Primary user:
- Input:
- Action:
- Output or artifact:
- Review or approval step:

## Agent Design

- Agent roles:
- Instructions source:
- Model and runtime settings:
- Function, web search, or MCP tools:
- Structured output:
- State, memory, or persistence:
- Guardrails and approval gates:
- Skills or capability directories:

## Environment Lifecycle

- Workspace contents and writable paths:
- Sandbox provider and resource limits:
- Packages, environment variables, and network access:
- Startup and health checks:
- Recovery or reconnection:
- Resources to preserve for follow-up:
- Artifact export, final cleanup, and partial-failure handling:

## App Surface

- CLI, API, or UI:
- Endpoints or commands:
- Data fixtures:
- Error, loading, and empty states:
- Trace and log visibility:

## Files To Change

- App files:
- Tests and evals:
- Documentation:
- Deployment-generated files expected:

## Verification

- Build and static checks:
- Deterministic tests:
- Agent-path smoke test:
- Follow-up, disconnect, and tool-result recovery checks, if relevant:
- Sandbox lifecycle check:
- Deployment check:
- Eval check:

## Open Questions

- Blocking:
- Non-blocking assumptions:
