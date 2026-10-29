---
name: agents
description: Build agent apps with the Agents API or Agents SDK. Use when adding tools, sessions, sandboxes, handoffs, guardrails, evals, or deployment.
---

# Agents

## Entry points and runtime

Answer explanations without setup or edits. For existing apps, keep their conventions.

- Use the **Agents API with `environment={"type": "openai_hosted"}` by default**. OpenAI runs the agent, manages its sandbox, and stores session state. A background task or application-hosted function does not require the Agents SDK.
- Use the **Agents SDK** when requested, already used by the app, or needed for a caller-owned agent loop, SDK handoffs, or guardrails. Follow [the SDK workflow](references/agents-sdk.md) after credential setup.
- Agents API sandboxes run `codex exec-server`. Neither path provides a caller-hosted `codex app-server`.

For agent-powered websites, also follow frontend guidance. Other websites and simple AI apps do not need this skill.

## Agents API lifecycle

Use the public [Agents API docs][agents-api-docs] and [quickstart][agents-api-quickstart] for the current contract. Append `.md` or request `Accept: text/markdown` for readable source. If docs are unavailable, report the blocker before implementing the API path; do not substitute private repositories or invent methods.

Use `client.beta.agents` in the public [OpenAI Python SDK][python-sdk] (`openai>=3.13.0`) or [TypeScript SDK][typescript-sdk] (`openai>=7.15.0`). These are package versions, not language requirements. The SDKs add `OpenAI-Beta: agents=v1` automatically and expose typed `agent.session.*` events and `session.environment.id`. Include the header explicitly only for raw HTTP requests. Check installed versions before adapting examples; do not mix preview client methods with the released SDK.

### 1. Prepare the project and access

Work in the current directory and reuse the project's environment. Follow this plugin's `openai-platform-api-key` skill before implementation or execution; it owns credential choices and setup. A configured key or installed plugin does not establish Agents API access. Hosted session creation checks access and provisions the sandbox; for self-hosted setups, check access before starting provider compute.

### 2. Confirm the architecture

Use the request and existing app to choose:

| Decision | Choices and consequence |
| --- | --- |
| Interaction | Stream results or collect them later. Disconnecting the observer does not stop the turn. |
| Application tools | Keep function responders available even when the observer disconnects. |
| Environment | `openai_hosted` by default. Use `none` when the user wants no sandbox, or `self_hosted` for private networks, custom images, or the user's chosen compute. Preserve existing app settings. |

Ask only unanswered questions that affect the build. Use a user-input tool with up to three short questions and the recommended option first, labeled `(Recommended)`. Without that tool, use defaults unless blocked.

OpenAI-hosted sandboxes need no provider setup or executor key. Use this default without asking the user to choose a provider. Verify access and a real command or file operation; report access failures rather than silently switching environments. For `self_hosted`, preserve the user's provider choice or offer local/cloud options from the docs, then follow [sandbox setup](references/sandbox-providers.md).

### 3. Start small

Start with one agent in one runnable Python file unless the user prefers another language or app surface. Keep the requested or existing model; otherwise use the current API quickstart's model and verify project access. Use [the worksheet](references/app-template.md) only for complex apps. Add servers, workers, or storage when the workload needs them, not just because a client may disconnect.

### 4. Implement the complete session flow

- Start with `client.beta.agents.sessions.create(..., input=..., stream=True)` in Python (`stream: true` in TypeScript). Include initial input for `none` and streaming `openai_hosted` creation. For an idle Python session, the `sessions.stream(session_id, input=...)` context manager subscribes before sending a follow-up and can run `tool_handlers`. For active sessions or independently managed workers, use `sessions.events.stream` and submit input separately through `sessions.events.create`.
- Pass top-level `agent_id` for a saved agent. Inline `agent` settings replace supplied fields for this session, not the saved agent.
- Handle required actions by type: function calls need an `agent.session.input.tool_result` submitted through `sessions.events.create(..., events=[...])`, with the pending action's `turn_id` and `call_id`. Await calls when using `AsyncOpenAI` or TypeScript. Self-hosted environment connection requests need an executor; OpenAI handles hosted provisioning and connection. `none` needs no executor.
- Check the intended turn's result, not just `idle`. Surface failed or cancelled turns. If text is missing, retrieve persisted items and turn status. Streams have no replay: reconnect before reconciling saved items.
- Save session and turn IDs. Check the outcome before retrying input. Use idempotency only where the API/SDK supports it, keeping the same key and payload for retries of one message.

For hosted files, use `environment.files` or the environment Files API for inputs. Write results to `/workspace/outputs`, then use `sessions.artifacts.list` and `sessions.artifacts.content` to download the artifact matching the completed turn and path. Workspaces are separate per session.

### 5. Verify and iterate

Test the app and, when authorized, run a bounded live check. Verify search sources and actual file contents, not just successful requests. Report failures and skipped checks; a completed turn does not prove every tool succeeded.

### 6. Deliver and account for resources

Provide the run command, outputs, and test results. Keep resources needed for follow-ups. When finished, download artifacts before deleting the session. Attempt self-hosted sandbox termination separately, even if session cleanup fails or setup only partly succeeded. Report remaining resource IDs without exposing secrets.

On deletion `409`, stop new input, cancel active work if needed, and retry after setup or execution settles. Limit retries; cancellation may not clear a connection wait. Hosted sandbox cleanup runs asynchronously after session deletion.

Use [the evals](references/evals.md) to check skill activation and interaction.

[agents-api-docs]: https://developers.openai.com/api/docs/guides/agents-api/overview
[agents-api-quickstart]: https://developers.openai.com/api/docs/guides/agents-api/quickstart
[python-sdk]: https://github.com/openai/openai-python
[typescript-sdk]: https://github.com/openai/openai-node
