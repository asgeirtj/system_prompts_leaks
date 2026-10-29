# Managed Linux preview

For the `managed-linux` profile, selected only when `SITES_MANAGED_LINUX_CONTAINER=1`.

Read `$control-browser`, then run `sites-preview start <absolute-checkout>` for a checkout beneath `/workspace`. The supervisor owns server startup and one preview per container; do not start a separate server.

The supervisor uses a nonempty `scripts.dev`; otherwise it serves `.openai/hosting.json`'s `static.directory`. For static HTML, create the public directory with `index.html` and set `static.directory` before starting. Preserve Site identity; hosted work must await its persisted ID before manifest edits. Static preview uses the preinstalled live-reload server, with no package installation: HTML/JavaScript edits reload the page; CSS edits refresh stylesheets. The Worker ESM starter has neither preview entrypoint.

Open only `http://terminal.local:4173/` through the cloud browser. This is internal QA, with no user-facing preview; deployed Sites URLs are unreachable from that browser. Reuse the preview through edits, build, and hosting, then run `sites-preview stop`. For failures, use [Troubleshooting](../troubleshooting.md#preview).
