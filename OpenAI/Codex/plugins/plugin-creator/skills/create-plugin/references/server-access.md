# Use an existing MCP server

Inspect the supplied endpoint, provider page, or project configuration. A
provider dashboard URL or website URL is not necessarily an MCP endpoint;
obtain the real endpoint and supported transport from the source or provider
documentation. Preserve an existing server rather than rebuilding it on Sites.

If authentication blocks inspection, use the host's supported connection flow
or open the actual provider sign-in page. Let the user complete credentials,
MFA, and OAuth consent there. Reuse existing sessions; do not extract tokens or
put credentials in chat or plugin files. Continue independent source work while
waiting, then verify access and resume the same inspection. A generic access
error does not justify guessing accounts, auth endpoints, or scopes.

Discover actual tools and schemas through the supported MCP client. If live
access remains unavailable, use the supplied source where sufficient and mark
discovery unverified. Do not invent tools or call a mutating tool merely to
test authentication.

Declare the verified connection in the [plugin package](plugin-packages.md).  
Uploading the package does not deploy the server, authenticate every user, or
complete a public submission's connection and review steps.
