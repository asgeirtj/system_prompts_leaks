# Self-Hosted Sandbox Providers

The provider runs one long-lived `codex exec-server` in an isolated sandbox per session. OpenAI runs the agent. OpenAI-hosted sessions do not need this setup.

After choosing `self_hosted`, use the [provider guides](https://developers.openai.com/api/docs/guides/agents-api/environments/self-hosted#sandbox-providers) and [Cookbook sandbox examples](https://github.com/openai/openai-cookbook/tree/main/examples/agents_api/sandboxes). Choose application-managed provisioning for a simple app; use webhook-managed provisioning when a separate handler should start and reconnect compute. Read the chosen mode and provider README before adapting its example.

## Setup

1. Check provider credentials, network access, and executor-key IP restrictions before provisioning. Use a separate restricted key from the dashboard's [Environment keys](https://platform.openai.com/agents?tab=environments&environment_view=keys), owned by the session's organization, project, and user or service account. It needs `api.agents.environments.connect`; set other permissions to None. Store it as `OPENAI_EXECUTOR_API_KEY` and get approval before passing it to the provider as `CODEX_API_KEY`. Leave the application's `OPENAI_API_KEY` outside the sandbox. The generic API-key setup flow does not configure executor permissions; never ask for a key in chat or include it in images or logs.
2. Call `client.beta.agents.sessions.create` with `environment={"type": "self_hosted", "workspace_directory": "/workspace"}`, using the app's configured workspace if different. Save `session.environment.id` and the unchanged `session.environment.remote_url` for startup and reconnects. Reuse an existing session when continuing work.
3. Reuse a Codex-ready image, or install Node.js and CA certificates, then run `npm install -g @openai/codex@alpha`. Create the configured workspace and allow outbound HTTPS to `api.openai.com` and WebSockets to `codex-cloud-environments.chatgpt.com`. No inbound endpoint is needed. Set resource and lifetime limits; record the sandbox ID for cleanup.
4. Inject only the executor key as `CODEX_API_KEY` and start the executor through the provider's long-running process API:

```bash
codex exec-server \
  --remote "$REMOTE_URL" \
  --environment-id "$ENVIRONMENT_ID"
```

5. Subscribe before input. Check current environment status, registration errors, and actual tool results. Use the event names returned by the deployment; do not wait for replay of a past connection event.

## Reconnect and cleanup

Choose one provisioning owner: the application or a webhook handler. Wake an executor for `environment_connection`, not `function_call`, using the session's requires-action event or the `agent.session.action_required` webhook. Turn creation is too late to wake offline compute.

Handle wakeup separately from the input request: input acceptance can wait for the executor, so the application must continue processing connection requests while submitting input.

Keep compute running between turns unless shutdown is coordinated with new work. Set sandbox lifetime separately from process timeouts. A mid-turn disconnect does not automatically request wakeup or restore a killed command. Check tool results; replacing a sandbox also requires restoring its files.

Export files through the provider, not the hosted artifacts API. Follow [session and sandbox cleanup](../SKILL.md#6-deliver-and-account-for-resources).
