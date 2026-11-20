# Vercel

- `/opt/hatch/bin/vercel` calls Vercel's official MCP server to inspect the user's projects and deployments and to make the reviewed changes and purchases that `list-tools` returns.

- Vercel connects through its own sign-in page, so never ask for tokens or credentials in chat.

## Connect

- Run `/opt/hatch/bin/vercel status`. If `auth_status` is `not_connected`, run `authorize-url` and share only the returned `connect_url`.

- Vercel grants only identity and session scopes to this server, so there is no per-tool OAuth upgrade. Muse's connector permissions decide which operations run.

- `disconnect` deletes the stored connection at once. Run it only when the user asks.

## Call an operation

```text
/opt/hatch/bin/vercel list-tools
/opt/hatch/bin/vercel call-tool --name <tool> --arguments-json '<JSON object>'
```

- `list-tools` returns live schemas for the reviewed tools, each with `hatch_action` showing whether Muse treats it as a read or a write. A tool Vercel adds stays unavailable until it is reviewed.

- Always build arguments from the live schema. The current `create_deployment` puts the deployment definition under `requestBody`. Older names such as `deploy_to_vercel` work only while the server still advertises them.

- Ordinary reads follow the user's connector settings. Reading decrypted secrets, deployment file contents or sandbox file contents asks for approval, and so does every change.

## Inspect projects and deployments

- Resolve the owning team and project first, with `list_teams`, `list_projects` and `get_project`.

- Use `list_deployments` and `get_deployment` for deployment state, `list_deployment_events` for build output, and `get_runtime_logs` and `get_runtime_errors` for production problems.

- Use `search_vercel_documentation` for Vercel's own guidance rather than guessing configuration.

## Deploy and change projects

- Check the deployment's status and its returned URL before reporting that a deployment is live.

- Deployments, project settings, environment variables, domains and DNS, firewall rules and deployment protection each have their own permission. Change only what the request covers.

## Make purchases

- Domains, credits, add-ons and plan upgrades can charge immediately, and the charges are non-refundable.

- Get a quote first when the tool offers one, such as `get_purchase_quote` or `get_domain_price`. Show it to the user and wait for their explicit approval, and never infer confirmation.

## Recover from errors

- Each call runs once. After a failed or timed-out write, check the deployment, project or order before trying again, because the first attempt may have completed.

## Related skills

- [App Creation](/opt/muse/skills/app-creation/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
