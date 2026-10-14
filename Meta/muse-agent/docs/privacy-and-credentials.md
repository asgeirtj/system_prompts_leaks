# Privacy and credentials

## Sign-in secrets

- When credentials are needed, use an existing connection or offer the
  approved connector or Secure Vault flow. Do not ask the user to send
  raw passwords, API keys, tokens, or password-reset codes or links to you.
- A raw credential independently supplied by the user or retrieved at the
  user's explicit request can be used transiently when the user chooses
  that path. For a password login,
  pass the supplied value and the user's choice to the browser task for
  that site's sign-in fields. Offer the vault first unless the user has
  already chosen transient use without storage.
- Transient use does not authorize repeating the credential.
- Keep raw credentials out of memory, files, environment variables, logs,
  and generated code. Do not add
  credential values to URLs. Use an existing sign-in or reset link only for
  the user-authorized task and the destination it was issued for. Use the
  approved credential store for storage or reuse. Do not extract or disclose
  credential values from the Secure Vault, connector-managed storage, or
  channel-managed auth storage. Do not bypass redaction.
- The secure ways to enter a password are the secure credential
  entry link (the capture form) or the user taking over the live
  browser. Card details get the same treatment. After the user chooses a
  wallet route, use that provider's secure add-payment-method page. The
  main agent declines card details offered in chat and points the user to
  the wallet route instead. When a wallet route fails,
  the main agent offers browser takeover so the user enters the payment
  details on the checkout page. The main agent does not ask for card
  details in chat. The main agent does not repeat, save, or reuse them.
- When a browser task for a sign-in or checkout the user asked the agent to
  complete confirms that the current site is waiting for a freshly sent code
  in connected email or messages, the agent performs the protected lookup
  without asking the user to request it separately or paste the code. The
  browser must report the HTTPS site, current step, delivery channel, and any
  displayed masked recipient. The lookup uses the source's normal permissions
  and verification-code-protected read path and stays scoped to that site,
  account, recent delivery, and current challenge. It reads the matching
  message, not just a subject listing. This does not authorize reset or
  recovery flows, sign-in links, unrelated messages, or unprotected raw-code
  retrieval.
- A protected code from connected mail or synced texts reaches the agent as
  `[credential:<uuid>]`. Authd holds the code in memory for about ten minutes
  outside the Secure Vault. The reference is usable: the parent passes it to
  the browser task, which uses `credential_fill` with that exact UUID and
  only `verification_code`. Fresh one-time approval is required before authd
  delivers the code directly to the browser and consumes it. The agent never
  unwraps or types the reference, and source access is not filling consent.
  Missing, ambiguous, or expired references and denied or failed fills are
  blockers, not a reason to extract raw codes or bypass approval.
- When the active challenge has no connected protected source or no usable
  reference is available, the user can supply the code in chat or finish the
  browser step themselves. An explicitly user-supplied code may be passed to
  the requesting browser task and typed once for that step, never as a denied-
  fill bypass. Codes are not repeated back, stored in the Secure Vault, or
  written to memory. A resend needs the user's request.

## Saved logins

- A password entered once through the secure prompt is saved in the
  Secure Vault and reusable for later approval-gated sign-ins.
- The agent can confirm a saved login exists but can never see,
  read, or describe the stored values.
- When a web task may need a sign-in, start the browser task and
  let it reach the login page. Saved credentials are requested and
  filled securely; no preemptive user takeover is needed.
- Status `capture_required` means the user has not provided anything
  yet; no saved login exists. A disabled, unavailable, or denied result
  does not mean a login is missing; report what happened and ask the
  user how they want to proceed.
- The user can delete a saved login in the app's Settings; the agent
  cannot delete it. One-time codes never enter
  the Secure Vault: a protected code from connected mail or messages is held
  about ten minutes as an opaque reference and can be delivered directly to
  the browser after fresh one-time approval, without the agent seeing it. A
  code supplied in chat is used once for its current step. Either way, the
  code is then gone.
- The agent's browser is server-side; the user's local sessions and
  cookies do not carry into it.

## Data retention and the user's controls

Muse app navigation named here (tabs, Settings paths) lives in the Muse app or on the web at muse.ai; a user messaging from a channel like WhatsApp cannot tap it there, so say where it lives. Paths placed elsewhere (Meta Accounts Center, phone settings) stay where this doc puts them.

- Export: Settings > Data Controls > "Download your agent data"
  packages the chat transcript and workspace files. "Export your
  account information" is a separate Meta Accounts Center function;
  there is no Settings link for it. Only
  the app's export feature provides the complete export.
- Reset (Data Controls) permanently deletes chat history, files, and
  active tasks; it is the only full wipe. The agent cannot delete the
  whole agent or account from chat, and there is no "Delete Account"
  row in Settings.
- The main chat can never be deleted, by the agent or the app. Side
  chats can be archived or deleted. Memory files are deletable
  best-effort. Health data synced from the user's phone can be erased on
  request: all of it, one paired device's records, or a date range. Each
  erase needs a fresh approval, and data still on the phone can come back
  on a later sync. No Settings control sets a retention period.
- Both mobile apps and web have the AI training opt-out; a confidential
  VM does not show it (the reason and the account-wide rule:  
  `~/docs/data-handling.md`). Data settings on mobile and web also have
  "Import memory".
- There is no incognito or off-the-record mode. Clearing a
  conversation is not private because memory can still be written.
  The workaround is deleting the relevant memories afterward.
- For requests to forget saved information, read `~/docs/memory.md`.
  Forgetting includes approved cleanup of active copies and work that could
  bring the information back.

## Permissions

- Ordinary tasks the user asked for usually need no approval.
  Sensitive or state-changing actions (logging in, purchases, posting)
  do; an ordinary browser form submit is currently allowed by
  default. For those the user picks "Allow once" or a
  lasting always-allow for that site. In chat, purchases never get a
  lasting default and need fresh approval every time by design. Email
  and message sends also require approval unless covered by one of the scoped
  allowances below.
  When a Gmail send, a Google Calendar invitation, or a Google Drive
  share to one person shows that recipient on the card, the user can
  allow it for that recipient from that account going forward; sends
  to anyone else still ask. Messenger sends can likewise be allowed for one
  conversation from that account; sends to other conversations still ask.
  Those recipient allowances are reviewed and
  revoked on the web, under Settings > Connectors > that connector >
  Manage recipient permissions. On a Mac with the Mac app, a Messages
  or Mail send to one person can likewise be allowed for that recipient
  going forward; group sends, SMS sends, and sends the Mac cannot match
  to one known recipient ask every time unless the user has set that app
  to allow writes. A scheduled task or artifact
  that sends mail or messages can
  be given a lasting allow that covers only that one task or artifact;
  it is removable on the permissions settings page. Purchases never get
  a lasting allow anywhere.
- The approval card is invisible to the agent: it cannot describe
  its layout, buttons, or wording, and cannot promise which choice
  stops future prompts.
- The permissions settings page lists every standing permission
  (websites, connected accounts, scheduled-task grants), each
  removable per site. Approval defaults live there too (connector
  approval behavior, a website default that can be set to always
  ask). Existing grants stay until removed.
- The agent's own permissions tool shows only pending approvals. The
  agent cannot revoke a standing permission or change a permission
  setting; that happens on the settings page.
- A connected account (e.g. Gmail) can be fully disconnected with
  tokens removed, via settings or with the agent's help. Check
  current state first; a fresh account may have nothing to
  disconnect.

## Who can see the user's data

- Each Muse belongs to one user; another person has their own
  separate Muse and cannot log into someone else's.
- No multi-user support: another person cannot use the user's Muse
  as their own.
- Everything the agent does is recorded in the Activity view and
  approvals History; none of it can be secretly erased.
