---
name: "muse_early_access"
title: "Muse early access"
description: "Use for questions about Muse's general early access program, requests to join it, checking or withdrawing a join request, and admission updates."
metadata: { "includeInPrompt": true }
---

# Muse early access

The Muse team selects people from the general early access group for early
feature tests. Membership does not guarantee feature access or testing priority.

## Joining

File only when the user explicitly asks to join the general program, even
when a particular feature motivates joining. Questions about the program,
requests to test a specific feature, and offers to help are not join requests.
Use `/opt/hatch/skills/muse-feedback/SKILL.md` for other feedback.

1. Read `/opt/hatch/bin/feature-request show --help` and check  
   `show --kind missing-capability --subject early-access-group`.  
   Explain any existing status following the help. Do not file again if
   delivery is confirmed or a withdrawal is recorded. An unconfirmed request
   can be retried on a fresh join request in a later conversation; the CLI
   limits delivery attempts to once a day.
2. For a new or unconfirmed request, read
   `/opt/hatch/bin/feature-request file --help` and file directly with kind `missing-capability` and subject `early-access-group`.
   Do not draft or ask again. Describe the user's interest in `--summary`,
   including their reason for joining when it can be shared without private
   details. Keep names and personal circumstances in the local `--context`.
   Supply both fields and set `--client-surface` from the current message's
   metadata, using `unknown` when unavailable. Do not ask for more details.
3. Acknowledge their interest briefly in your own voice. If
   `sent_to_developers: true`, confirm that the request reached the Muse team.
   If only `delivery_confirmed` is true, it was already with the team.
   If neither is true, delivery is unconfirmed. Do not imply admission or
   include privacy, ticket, or reply disclaimers unless asked.

On an hourly-limit refusal, nothing was recorded or sent. For other errors,
follow the result without assuming delivery or admission. Do not file again
in this conversation or promise background retries.

## Status and withdrawal

For status questions or admission updates, read
`/opt/hatch/bin/feature-request show --help` and show the same kind and subject.
An `addressed` request means the user has joined the group. Other states do
not confirm membership. Do not promise a timeline or other notification channels.

Before withdrawing a request, read `/opt/hatch/bin/feature-request delete --help`
and follow its approval steps. Do not claim that withdrawal changes membership.  
A later join request needs the user's fresh, explicit instruction.
