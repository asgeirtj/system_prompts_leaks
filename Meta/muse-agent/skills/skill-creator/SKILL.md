# Custom Connectors and MCPs

## Look for an existing route

- Search with `muse.connector_search` for a system or custom connector that already covers the service or the action, and read its docs.

- Check whether Zapier or Composio already reaches the app through the user's account there. One hub connection can cover many apps.

- Find the provider's official API reference and authentication guide, and look for an official MCP server in its developer docs or GitHub organization. Use `browser.search` to find the pages and `browser.open` to read them.

- Prefer the provider's maintained client or a reputable open-source integration to writing your own. Check its source, permissions, dependencies and recent releases, then pin the version and keep it under `~/workspace/custom-connectors/custom.<provider>/`. Installing a package grants it no credentials or permissions.

## Connect the credential

- Call `credentials.request_api_access` instead of asking for a key, client ID, secret or token in chat. Take its inputs from the provider's docs, not memory. It needs the `provider` slug, the bare `api_hosts`, the `auth_scheme`, and either the `placement` of an API key or the OAuth authorize and token endpoints.

- Report the scheme the docs describe. Muse supports API keys and the OAuth 2.0 authorization code flow, and declines a password login, session cookie, signed request or multi-secret scheme with a reason to pass on. Choose `api_key` when the provider offers both.

- Get the hosts, scheme and placement right the first time. A call to an unlisted host is refused, and the scheme and placement cannot change after setup, so a mistake means a fresh link and the user entering the key again.

- For OAuth, request the least scope the task needs. Supply `registration_url` when the provider supports dynamic client registration, so the user does not have to register an app.

- For an OAuth-protected MCP server, always supply `resource`: its canonical HTTPS resource URI from its OAuth protected-resource metadata or official docs. Preserve the full URI, including its path and trailing slash if present. The resource identifies the MCP server and may be on a different domain from the OAuth issuer. Save it with the connection details for reconnects.

- Every OAuth endpoint must sit on the provider's `issuer_domain` or a subdomain of it. When a provider's endpoints span domains, explain that it cannot be connected this way instead of inventing a workaround.

- Follow the `guidance` the tool returns. It says how to present the link, then you end the reply. The conversation resumes on its own when the user finishes the hosted page.

- A service that only offers a website sign-in is a browser task, not a custom connector.

## Build the helper

- Once connected, run `/opt/muse/skills/custom-connector-setup/bin/scaffold-connector-docs --provider <provider>`. It copies the [connector template](templates/connector/CONNECTOR.md) to `~/workspace/custom-connectors/custom.<provider>/CONNECTOR.md` with the slug, scheme and hosts filled in, and creates `~/workspace/custom-connectors/custom.<provider>/bin/` for helpers. It never replaces an existing doc.

- The credential lives in the registered connection `custom.<provider>`, never in a file. Helpers get a surrogate from `dynamic_credentials.py`, which places it where the provider reads the key. Muse swaps in the real credential only on an approved request to a registered host.

```python
import json, sys, urllib.request
sys.path.insert(0, "/opt/muse/skills/custom-connector-setup/bin")
from dynamic_credentials import add_surrogate_to_request, read_json_response

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args):
        raise RuntimeError("redirect refused, verify the endpoint")

request = urllib.request.Request("https://api.example.com/v1/items")
add_surrogate_to_request(request, "custom.example", allowed_hosts=["api.example.com"])
with urllib.request.build_opener(NoRedirect()).open(request, timeout=30) as response:
    print(json.dumps(read_json_response(response)))
```

- For a key read from a query parameter or the URL path, build the URL with `url_with_surrogate_query_param` or `url_with_surrogate_path_segment` before creating the request.

- Keep keys, tokens, passwords and cookies out of helpers, docs, command arguments, environment variables and logs. Keep redirects disabled on authenticated requests.

- Compile Python helpers with `python3 -m py_compile` before saying they work.

- To reach an MCP server, follow [MCP-backed CLIs](references/mcp-cli.md). Start from the [MCP client template](templates/mcp_client.py), which turns the server's operations into `list-tools` and `call-tool` commands.

## Verify before saving

- Nothing checks the credential when the user saves it, so the first real call is the proof. Run a harmless read against the intended account, then the exact operation the user asked for, and check its result.

- On a 401 or 403, first check that the request carried the credential, that the host is registered and that the placement and scopes match. Call `credentials.request_api_access` again with `reconnect: true` only when a request that carried the credential is still rejected. Reuse the saved details, adding and saving the canonical `resource` for an OAuth-protected MCP server when it is missing.

- After an uncertain write, inspect the current state before retrying. The first request may have completed.

## Save what you learned

- Complete the connector doc from its template with the setup details, verified commands, inputs, outputs, pagination and recovery. Label an operation you have not run as untested, and delete the template comments.

- When the lesson is how to do a task, save it as a skill from the [skill template](templates/skill/SKILL.md) at `~/workspace/custom-skills/<name>/SKILL.md`. Improve the closest custom skill instead of adding a duplicate.

- Link the connector doc under the skill's Available connectors and the skill under the connector's Related skills.

- To correct a system skill or connector doc, write an amendment as [amendments](references/amendments.md) explains. Deployments replace system files and keep custom ones.

- Never store a secret in a connector doc or a skill.

## Available connectors

- [Zapier](/opt/hatch/connectors/zapier/CONNECTOR.md) for running actions in apps the user already connected to Zapier.

- Use `muse.connector_search` to find other connectors and `muse.skill_search` to find related skills.

### When available

- These connectors depend on the user's channel or devices. `muse.connector_search` shows which ones this session has.

- [Composio](/opt/hatch/connectors/composio_mcp/CONNECTOR.md) for running actions in apps the user connected to Composio.

## Alternatives for better results

- Compare an existing connector, a hub, an official API, an MCP server and a browser route on capability, access, reliability and cost. Use the simplest route that does the work well.

- For a one-off task, finish it with `browser.browse` on the provider's website or with a file the user supplies. Offer to build a connector when the user will repeat the work.
