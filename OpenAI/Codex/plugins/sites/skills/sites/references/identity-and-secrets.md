# Identity and Secrets

Read when the Site needs identity, protected routes, or runtime secrets. Sites owns hosted authentication; preserve its integration instead of scaffolding a separate OAuth or session stack.

## Request Identity

Signed-in visitors receive `oai-authenticated-user-id` and `oai-authenticated-user-email`. The ID is stable within a Site and differs across Sites; use it for user-owned records. Email and optional full name are display or contact fields. Private Sites require authenticated access: browser visitors sign in, while non-user callers use [service access](#service-access). Public Sites can receive anonymous requests with neither identity header.

The optional `oai-authenticated-user-full-name` is percent-encoded UTF-8 when `oai-authenticated-user-full-name-encoding` is `percent-encoded-utf-8`. The starter helper decodes it and falls back to email. Browser identity, [app consent](app-integrations.md), and service access below are separate permissions.

## Sign-In

Use the server-only helpers in [`app/chatgpt-auth.ts`](../templates/vinext-starter/app/chatgpt-auth.ts):

- `getChatGPTUser()` returns optional identity. API routes and server actions must reject missing identity when required and authorize each operation server-side.
- `requireChatGPTUser(returnTo)` redirects anonymous visitors from protected server-rendered pages. Mark identity-dependent pages `export const dynamic = "force-dynamic"`. When the return path depends on page parameters, compute it in the page and call the helper from a nested async server component.
- Start sign-in with a normal anchor using `chatGPTSignInPath(returnTo)` and `target="_top"`; use `chatGPTSignOutPath(returnTo)` for sign-out. Return paths must be same-origin relative paths.

Sign-in requires top-level navigation, not fetch, client routing, or prefetch. Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, and `/callback`; do not implement those routes or call AuthAPI directly.

Sign-in establishes identity, not workspace membership. Use Sites access policies or explicit server-side membership checks for workspace restrictions. Confirm supported platform capabilities before adding an external identity provider.

## Service Access

If `get_site` returns `siwc_bypass_bearer_token`, send it only to that Site as `OAI-Sites-Authorization: Bearer <token>`. Dispatch validates and consumes it; it supplies neither a visitor identity nor connected-app consent.

A shared update endpoint on a Site confirmed owner-private can rely on this platform access boundary. Preserve additional authorization for user-owned records or narrower permissions. Public write endpoints need their own authorization. Do not change the Site's audience to make an updater work.

For [unattended work](recurring-updates.md), verify source access separately from permission to write to the Site. If the tool surface omits the credential, inspect supported connection options before concluding access is unavailable; do not create or rotate credentials merely to check. The future task must be able to obtain supported access without the authoring session. Keep credentials out of source, browser code, schedule prompts, and output.

## Secrets

Configure hosted runtime values through native Sites tools. Keep secret values out of source, client bundles, and `.openai/hosting.json`; keep local environment files untracked and document key names only in `.env.example`.

For `OPENAI_API_KEY`, use the `[OpenAI Developers](plugin://openai-developers@openai-curated-remote)` plugin's `openai-platform-api-key` skill and its required approval, then configure the Site secret before deployment. If unavailable, ask the user to enable it.
