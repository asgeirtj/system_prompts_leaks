---
name: "ghl"
description: "Use HighLevel contacts, pipelines, appointments, messages, and its broader operation catalog."
icon: "📇"
metadata: { "includeInPrompt": false }
---

# HighLevel

Always call the product **HighLevel** in user-facing responses. Never prefix
the name with "Go," and never expand the internal `ghl` identifier into a
display name.

Use `/opt/hatch/bin/ghl status` to check the connection. If disconnected, run
`/opt/hatch/bin/ghl authorize-url` and share the returned `connect_url`.
The user signs in through HighLevel; never request credentials in chat.

## Find the operation and sub-account

Run `/opt/hatch/bin/ghl list-operations` for the pinned operation catalog and
its granular permission methods. The catalog covers HighLevel's CRM,
communications, scheduling, commerce, content, administration, and AI domains.

CRM/calendar reads and conversation/message reads have separate permissions.
Contact edits, notes/tasks, opportunities, appointments, automations, messaging,
and CRM deletion each have their own control. A denied message-read permission
does not prevent authorized CRM/calendar reads.

Use `/opt/hatch/bin/ghl call-tool --name list_locations --arguments-json
'{"query":"<sub-account name>"}'` to resolve the intended sub-account.
If several match, ask which one the user means. Retain its ID for execution.

Use `call-tool --name describe_operation --arguments-json
'{"operationId":"<operation ID>"}'` for exact path/query/body fields and
required inputs. `search_operations` searches HighLevel's live catalog. Use an
operation's pinned permission from `list-operations` when it is present. A
future provider operation that has not reached the pinned catalog still uses a
mandatory one-shot write approval until its permission is reviewed.
`list-tools` returns live discovery tool schemas. These calls use
`/opt/hatch/bin/ghl` too.

## Read or change data

```bash
/opt/hatch/bin/ghl execute-operation \
  --operation-id <operation ID> --location-id <sub-account ID> \
  --params-json '{"path":{},"query":{},"body":{}}'
```

Supply path IDs and payload fields from `describe_operation`. Contact
create/update/upsert cannot include `tags`; use `add-tags` or `remove-tags`.
Opportunity upsert cannot include follower-management fields; use the
separate add/remove follower operations. Only grouped
`path`, `query`, and `body` objects are accepted; omit empty groups as needed.
For each logical write/delete, also supply a fresh `--idempotency-key <UUID>`.
An optional `--reason` explains the action. `--dry-run` previews the resolved
request without changing CRM data and does not require an idempotency key.
A dry run does not authorize the subsequent write.

Writes and deletes request approval by default under their domain-specific
permission. Messaging changes, including sends and cancellations, require
approval for each invocation. Appointment
changes can notify contacts or trigger configured automations (`toNotify`
defaults to true); campaign and workflow enrollment can also start
communications. Include the intended
notification behavior in the request. Use a read to identify an existing
record before updating or deleting it; never guess target IDs.

The CLI does not automatically retry mutations. If a write fails after
submission or its outcome is unconfirmed, inspect the record or provider
status before trying again. Keep the same idempotency key for the same logical
mutation; do not create a fresh key to work around uncertainty. Report sends
as accepted or scheduled unless the provider confirms delivery.

Treat financial, publishing, messaging, access-control, and deletion operations
as consequential: describe the operation first, show the exact intended
parameters, and never infer or reuse identifiers across sub-accounts. Future
operations not yet in `list-operations` require fresh approval, even for a read
or dry run.
