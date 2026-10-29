# Agents SDK

Use the Agents SDK when the application owns the agent loop.

## Sources

- Agents SDK guide: https://developers.openai.com/api/docs/guides/agents/sdk
- Sandbox Agents guide: https://developers.openai.com/api/docs/guides/agents/sandboxes
- Python SDK: https://github.com/openai/openai-agents-python
- TypeScript SDK: https://github.com/openai/openai-agents-js
- Agent evals guide: https://developers.openai.com/api/docs/guides/agent-evals
- Deployment Manager: https://github.com/openai/openai-cookbook/tree/main/examples/agents_sdk/deployment_manager

Read the Agents SDK guide before changing an implementation. Read the Sandbox Agents guide before choosing `SandboxAgent`, workspace manifests, capabilities, skills, or a sandbox backend.

Before building, configuring, testing, or running OpenAI-backed code, use the `openai-platform-api-key` skill to configure `OPENAI_API_KEY`. Pure analysis does not require credentials. Never print or commit secret values.

## Build

1. Use the repository's package manager. Prefer Python unless the user asks for TypeScript.
2. Start with one `Agent`, clear instructions, and `Runner.run`.
3. Add `@function_tool` functions for deterministic local actions. Keep side effects narrow and schemas explicit.
4. Add handoffs or specialist agents only when ownership boundaries improve the workflow. For sensitive actions, use SDK-native tool guardrails and `needs_approval=True` rather than performing the action before approval.
5. Use `SandboxAgent` when the agent needs an isolated filesystem, shell, workspace capabilities, snapshots, or provider-managed sandbox sessions. Use a normal `Agent` plus tools for ordinary business workflows.
6. Add a smoke command, sample input, and expected output. For deployable HTTP apps, support `PORT` and expose `/health`.

Reuse the existing project interpreter and model. Diagnose dependency or network failures before changing the project's environment.

Follow the target repository's layout. For a new small Python app, prefer:

```text
<project>/
  agent.py
  main.py
  pyproject.toml
  tests/
  evals/        # only when requested
```

When the source is prior Codex work, first write a compact brief that separates confirmed facts from inferences and open questions. Prefer the newest user direction when sources conflict, then continue into implementation when the user already asked to build.

## Evals

Add evals when requested. Exercise the real agent path rather than mocks where practical.

Read the Agent evals guide before creating platform eval configuration, graders, datasets, or trace grading.

Cover behavior that matters: output shape, required or forbidden tool calls, handoffs, guardrails, approvals, state changes, and known regressions. Avoid exact prose or volatile IDs unless they are contractual.  
Inspect the installed SDK and its tests before choosing deterministic test helpers. Do not invent helper APIs; label illustrative pseudocode clearly.

For a local harness, keep cases, graders, runner code, and generated results separate:

```text
evals/
  cases.jsonl
  graders.py
  run_local.py
  results/
```

The runner should isolate mutable state between cases, validate required environment variables before running, write `evals/results/latest.json`, and fail with a non-zero exit code when required behavior fails.

## Deployment Manager

Use the cookbook Deployment Manager when the user asks to deploy an Agents SDK app locally. Default to `local-docker` unless the app requires another local target.

Use `DEPLOYMENT_MANAGER_ROOT` when configured; otherwise use the cookbook checkout below. If missing, clone `https://github.com/openai/openai-cookbook.git` to `$HOME/code/openai-cookbook`. Preserve changes in an existing checkout.

```bash
MANAGER_DIR="${DEPLOYMENT_MANAGER_ROOT:-$HOME/code/openai-cookbook/examples/agents_sdk/deployment_manager}"
make -C "$MANAGER_DIR" deploy PROJECT_PATH=<absolute-app-path>
```

Verify `$MANAGER_DIR/Makefile` exists before deploying. If overriding `APP_PORT`, select a free host port first.

Useful variants:

```bash
make -C "$MANAGER_DIR" deploy PROJECT_PATH=/path/to/app APP_PORT=8421
make -C "$MANAGER_DIR" deploy PROJECT_PATH=/path/to/app TARGET=local-process
make -C "$MANAGER_DIR" deploy PROJECT_PATH=/path/to/app SANDBOX_BACKEND=docker
```

Use the returned manager and app URLs to verify manager health, app readiness, the primary agent workflow, and any created sessions or containers. If the app has a UI, open it after readiness passes and check the real workflow rather than rendering alone. Report manager-generated files without reverting them.
