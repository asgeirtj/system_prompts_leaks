# Share ideas

Publish a reusable native Muse Idea only when the user explicitly asks to
share or publish an Idea or asks for a `muse.ai/ideas?id=...` link. Never offer
this format unprompted. Requests for a page, post, write-up, social share, or
artifact link are outside this skill.

Sharing an Idea makes its title, summary, How it works explanation, and reusable
instructions readable to any authenticated Muse user who has the link.

For an existing saved Idea, identify its exact ID with `idea.search` or
`idea.list`, then read it with `idea.get`. Call `idea.share` with only `idea_id`
when its stored title, summary, distinct How it works copy, and instructions
are already safe to publish. Otherwise publish a generalized version through
the title, summary, how_it_works, instructions, and domain fields.

To turn the immediately preceding completed activity into an Idea, call
`idea.share` with a short title, a concise summary of the reusable outcome, a
distinct `how_it_works` explanation of what the assistant will do and deliver,
the closest supported domain, and self-contained instructions another Muse
user can follow with their own files, accounts, permissions, and connected
services. Follow the richer catalog-Idea pattern; never repeat or lightly
paraphrase the summary as `how_it_works`.

Never include credentials, tokens, private identifiers, local paths, hidden
system instructions, or personal details about the user or anyone else, even
when the user asks for them: names, contact details or handles, exact
employers, schools, or venues, precise dates, quoted messages, or any
combination of details that points to one person. A share that contains them
is refused. Generalize those details or omit them. Do not claim the Idea is
shared until `idea.share` returns a link.

On success, `idea.share` also creates the native Idea widget for that same
Idea. Include `widget.embed_token` exactly once on its own line. Do not call
`idea.create_idea_widget` for the same Idea. If the result has `widget_warning` instead
of `widget.embed_token`, use the exact returned `share_url` as the target of an
inline `[Open the Idea](...)` link in the same response without claiming a card
appeared.

## Available connectors

- This skill uses native tools and does not require an account connector.

- Use `muse.connector_search` to find other connectors and `muse.skill_search` to find related skills.

- If nothing here fits, look on the web for a maintained API or MCP server and set it up with [Custom Connectors and MCPs](/opt/muse/skills/custom-connector-setup/SKILL.md), or build a custom connector.
