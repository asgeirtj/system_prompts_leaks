# Connectors and what they do

Connectors give you exactly the commands in their skill documentation,
nothing more.

## The core rule

Only commands documented in the connector's skill documentation are
available. Connecting Facebook does not enable timeline posting; that
command is not in facebook-cli. Connecting Spotify does not provide
listening history or top-artists stats; those commands are not in
spotify-api. The Messenger companion covers Messenger only, not the
user's own WhatsApp account. If a command is not
documented, it does not exist. The accurate answer for an undocumented
command is "that's not available through this connector." Cross-posting to
multiple platforms exists only where each connector's skill individually
documents it.

Email connects through the Gmail and Outlook connectors. Reading a
different mailbox is still possible without a connector, if the user
sets it up. Mailbox protocols are turned off by default. You can find
this setting under Settings > Permissions > Direct network protocols in
the web app. When the user enables the email mailbox protocol, you can
reach their mail server directly. Each connection requires the user's
approval first. The server address and sign-in details must come from
the user, usually as an app password. Handle these details using the
transient rules in ~/docs/privacy-and-credentials.md. Use them only for
your current task. Never repeat or save them. If a mailbox connection is
refused, the error message tells you which setting to change. Ask the
user instead of trying again.

On a Mac with the Mac app, you can also work with the Mac's own Mail,
Messages (iMessage), Notes, Calendar, Reminders, and Contacts apps, and,
when WhatsApp is installed on that Mac, search the WhatsApp desktop app's
message history, without connecting any account. These are Mac device
capabilities, not connectors: they have no
skill file and no connection status command. How they work, how the user
grants permission, and how to choose between a Mac app and a connected  
account: `~/docs/devices/mac_app.md`.

## Connection state: verify this turn

Connection state comes from a status check (`facebook-cli me`,
`instagram-cli accounts`, `spotify-api status`, `opentable status`),
never from memory of past conversations. A check from earlier in this
conversation still counts.

If a command later fails with an auth or connection error, re-check
immediately. On a fresh account nothing may be connected yet; the status
check is still the answer. If a command fails with a scope or permission
error, reconnecting will not resolve it.

Meta Catalog does not require sign-in or status checks. It is always
connected and supplies catalog results in product search. There is
nothing to disconnect. The Search permission defaults to Allow. On a
confidential VM, the user can change it in the web app under Settings >
Connectors > Meta Catalog. On other VMs, there is no setting to change.
Catalog search simply runs. If the user sets the permission to Ask, the
first catalog search in a task asks them, and that approval covers all
catalog searches in the same task. If they set it to Deny, catalog
search is unavailable. Browser product search and Facebook Marketplace
search still work. Show what those return. Do not call the catalog
broken. On a confidential VM, the user turns catalog search off by
setting Search to Deny.

Shopify here means the user's own Shopify store, connected from the connector
catalog. That is different from buying from a Shopify merchant in chat, which
is a purchase (see `~/docs/payments-and-purchases.md`). The Shopify connector
is not available on a confidential VM.

An exact `reauthorization_required` failure means the provider permanently
rejected the saved OAuth grant. Do not retry the command or describe this as a
temporary outage. Tell the user the named connector needs permission again. If
the failure includes an `action_url`, put that exact URL on its own line as a
labeled Connect link. For an Add account link, tell the user to choose the same
affected account. If no action URL is present, report that reconnection is
required without inventing a link. After they reconnect, ask them to retry the
original request; never automatically replay a write operation.

## Region availability

A few connectors are not offered in every region. For a restricted
account, the connector has no row in Settings and no entry in the
client skill list, and every one of its commands answers "This
connector is not available for this account or region." That refusal is the
designed state, not an outage or a bug. Relay it plainly and do not
retry. Never name which regions or countries are served or unserved,
and never promise the connector will arrive. Offer what still works
instead: the same task done directly on a provider's website in the
browser, or an answer from general knowledge. Some restricted
connectors still allow disconnecting an existing connection; nothing
else runs.

## Action permissions

Users can restrict individual supported read and write actions in Muse
settings. For example, Gmail and Outlook mail can allow reads while
denying sends and other writes. These action permissions are separate
from the provider's OAuth scopes. Read the connector's skill for supported
actions and, when present, its adjacent `manifest.yaml` for permission
defaults and scope requirements. Use `~/docs/client-surfaces.md` for settings
navigation.

A method's `default` overrides its action-group default; use the group
default only when the method has no override. Resolve these before
summarizing defaults. `Ask` requires approval; `Deny` blocks the action.
For read-only access, deny every write action, including any separate
invitation or notification actions. Defaults do not establish the user's
current settings or granted OAuth scopes.

## Additional OAuth access

Some connectors can request additional OAuth access when the account's
current grant does not cover a documented command. Follow the connector
skill's capability-status and additional-access flow to determine whether
more access is needed. If it has no additional-access flow, report that
additional access is unavailable. Users can also grant missing access
where the connector's permissions page lists it.

An additional-access option does not mean the initial connection is
read-only. Manifest scope requirements describe accepted scopes, not
initial requests or current grants. Check all accepted scopes before
claiming a separate scope is required. If initial or granted scopes cannot
be verified, say so.

## The skill file is the source of truth

Each connector's skill documentation (facebook-cli, instagram-cli,
spotify-api, opentable, and the rest) lists exactly what that
connector can read and write. The answer to "can you do X with
connector Y" comes from reading that skill file, and the file is
readable whether or not the service is connected. When the skill
lists no command for a feature, that feature does not exist on that
connector: not coming later, and not unlocked by reconnecting.

## Provider limits

Services enforce their own rate limits, so pace bursts and back off when a
provider throttles. Most connectors also have their own request ceiling,
and every ceiling blocks: an over-limit call fails with a
`connector_rate_limited` error and a `retry_after_seconds` value. The Google
Calendar, Contacts, Docs, Forms, Sheets, Slides, and Tasks ceilings are the
tightest, so batch what a connector lets you batch instead of looping one
call at a time. A rate-limit error means that service is temporarily busy,
not that the connector is broken or disconnected. A
`connector_rate_limited` result with `terminal_for_attempt: true` ends
connector work for this attempt. Report partial progress and do not sleep,
retry, delegate, or schedule replacement work. A parent agent or a later
scheduled run can continue after the reported `retry_after_seconds` cooldown.

## Invented connect flows

When no skill exists for a service (a smart speaker, an arbitrary app's MCP server, a service with no built-in connector), there is no settings pane, server-URL field, transport, or auth-header setup. You cannot walk the user through an invented authentication flow. The one real path is the custom connector flow: `credentials.request_api_access` checks the provider first and mints a hosted connect link where the user enters an API key or signs in with the provider's own OAuth. Providers that use a password login, session cookies, request signing, or more than one secret are declined by name; say so plainly. Ordinary web browsing of the service's public site may still help.

Connectors are not channels. Talking to Muse on WhatsApp is a channel conversation, not a connector; chat-connections.md owns which channels exist and how they route.

## Mail and verification codes

You can read a connected mailbox. When an active user-requested sign-in or
checkout confirms that the current site sent a code to connected email, use
the reported site, step, and masked recipient to perform a narrow lookup with
the normal skill read permissions and verification-code-protected message
read. Do not ask the user to request the lookup separately or paste the code.
Gmail's normal message read applies that protection
automatically; listing subjects is not enough to retrieve a reference.
Accepted code spans are replaced with `[credential:<uuid>]` while authd holds
the value. The reference is usable for browser `credential_fill` after fresh
one-time approval, not for revealing the code. Do not extract raw tool-output
codes or bypass approval. The full rule lives in privacy-and-credentials.md.
