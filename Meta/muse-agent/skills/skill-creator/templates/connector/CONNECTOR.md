<!--
This is the template for a custom connector doc. Fill it in, then delete every comment like this one before you save.

- Save it as ~/workspace/custom-connectors/custom.<provider>/CONNECTOR.md beside its connector.yaml, using the same lowercase slug you gave `credentials.request_api_access`. The folder, the descriptor `id` and the registered connection then all read custom.<provider>.

- Once the user has finished connecting, /opt/muse/skills/custom-connector-setup/bin/scaffold-connector-docs --provider <provider> copies this template and its descriptor into place with the slug, credential scheme and hosts filled in. It never replaces an existing doc.

- A connector doc teaches how to operate this one service, with exact commands, inputs, outputs, IDs, pagination, limits and recovery. Put the method for a task in a skill and link it under Related skills.

- Supporting Markdown files beside this doc are searchable too. Use them for long operation detail and link them from here.

- To correct a system connector doc instead, write an amendment as /opt/muse/skills/custom-connector-setup/references/amendments.md explains.

Metadata:

- The connector's identity, title, description and listing choices live in connector.yaml beside this file, written from /opt/muse/skills/custom-connector-setup/templates/connector/connector.yaml. This file holds the instructions alone, with no frontmatter.

How to write it:

- Write to the agent in plain second person and start each instruction with the action. Make each instruction a `-` bullet with one blank line between bullets, one idea per bullet, in one to three short sentences.

- Use `#` once for the title and `##` for sections. Put every command in a fenced code block.

- Do not use semicolons, em or en dashes, curly quotes, tables, "Label: text" bullets, "Note:" prefixes or filler. Say "Muse" for the product and "the user" for the person.

- Document only what you ran and saw. Label anything untested as untested, and leave out what you could not verify.
-->

# <Provider Name>

<!--
Write one to three bullets on what the connector reaches, how it authenticates and which helpers exist, each by its full path.
-->

- `custom.<provider>` connects Muse to <Provider Name> through its <REST API or hosted MCP server>. It authenticates with the registered `<auth-scheme>` credential and calls only <api-hosts>.

- Helpers live in `~/workspace/custom-connectors/custom.<provider>/bin/`. <Name each helper and what it does.>

## Connect

<!--
Record the exact setup details for reconnects; the placement cannot be read back later. For an API key, keep `placement` with the value you registered, one of `bearer_header`, `custom_header:<Header-Name>`, `query_param:<name>` or `url_path_segment:<path containing {}>`. For `oauth2_code`, keep the OAuth fields. Delete the fields that do not apply, and never record a key, token or client secret.
-->

- The connection was registered with `credentials.request_api_access` and these details. Reuse them to reconnect. For an OAuth-protected MCP server, add the canonical `resource` from its protected-resource metadata or official docs if missing, and save the updated details:

```json
{
  "provider": "<provider>",
  "auth_scheme": "<auth-scheme>",
  "placement": "<placement>",
  "issuer_domain": "<oauth issuer domain>",
  "authorization_url": "<oauth authorize URL>",
  "token_url": "<oauth token URL>",
  "token_endpoint_auth_method": "<oauth client auth method>",
  "scopes": "<oauth scopes>",
  "resource": "<canonical MCP resource URI; omit when not applicable>",
  "revoke_url": "<oauth revoke URL, when offered>",
  "registration_url": "<oauth dynamic registration URL, when offered>",
  "api_hosts": <api-hosts-json>
}
```

- Before the first change in a conversation, prove access with a harmless read:

```text
python3 ~/workspace/custom-connectors/custom.<provider>/bin/<helper>.py <read-command>
```

## Credentials

<!--
Keep these bullets. They describe how every custom connector authenticates.
-->

- The registered connection holds the credential. Helpers import `/opt/muse/skills/custom-connector-setup/bin/dynamic_credentials.py`, which returns an `hsurr:` surrogate and places it where the provider reads the key. Muse swaps in the real credential only on an approved request to a registered host.

- Never put a key, token, password or cookie in this doc, a helper, a command argument, an environment variable or a log. Never ask the user to paste one in chat.

- Keep redirects disabled on authenticated requests.

- On a 401 or 403, check the request first. Confirm that the helper attached the credential, that the host is registered and that the placement and scopes match.

- Only when a request that carried the credential is still rejected, call `credentials.request_api_access` with the details above and `"reconnect": true`.

## <Operation, named for what it does>

<!--
One section per verified operation, such as "Search records" or "Create an invoice". Give the exact command, the required inputs, the output fields to read, the IDs to keep and how pagination works. Say whether the operation reads or changes data.
-->

- <What the operation does and when to use it.>

```text
python3 ~/workspace/custom-connectors/custom.<provider>/bin/<helper>.py <command> --<flag> <value>
```

- <Inputs, output fields, IDs and pagination.>

## Recover from errors

<!--
The provider's error codes and what to do about each, its documented rate limits, and which calls are safe to retry.
-->

- <Error> means <cause>. <Recovery.>

- After a failed or timed-out change, check the current state with a read before trying again, because the first request may have completed.

## Limits

<!--
What this connector cannot do, the provider limits that are documented facts, and anything you have not verified.
-->

- <What the connector cannot do.>

## Related skills

<!--
Link the skills that use this connector, whether custom skills at ~/workspace/custom-skills/<skill_name>/SKILL.md or system skills at /opt/muse/skills/<dir>/SKILL.md. Add the matching link under each custom skill's Available connectors. Keep the closing bullet exactly as written.
-->

- [<Skill Title>](~/workspace/custom-skills/<skill_name>/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
