# Local preview

For the `portable` profile, selected whenever `SITES_MANAGED_LINUX_CONTAINER` is not `1`, including on Linux devices.

In a visible task with a user-facing preview tool, run the project's dev script or a static HTTP server in a retained session after any required installation. Check that the representative page returns a successful HTTP response, then open the server's printed Local URL with `open_in_codex` or equivalent. Use supported forwarding when execution is remote; loopback on another host is not a device preview.

Reuse the server and Site tab through edits and publication. For a background task or an environment without user-facing preview, start a server only when needed for the work. Request network permissions when required for the server and its readiness check. Stop the owned server during final teardown.
