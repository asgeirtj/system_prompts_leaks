# TypeScript Web Artifact Runtime

Source for the `@hatch/space-sdk` package consumed by every TypeScript web artifact.

Current TypeScript web artifacts are built by the web artifact builder subagent through the
Rust `web_artifacts.build` tool, which calls `hatch_spaces::build_pipeline::build_space`.
The canonical source root is `workspace/ts-spaces/<slug>`.

## Layout

```
ts-runtime/
├── build.mjs           # produces the local Bun runtime artifacts
├── cloudflare/         # explicit Worker build/typecheck tooling
│   └── tsconfig.worker.base.json
├── sdk/                # @hatch/space-sdk package source
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts    # server-side surface (defineAction, Ctx, ActionsModule, …)
│       └── client.ts   # browser-side surface (createActionClient)
├── base-ui/            # @hatch/base-ui, Base UI's public parts, bundled
├── muse-ui/            # @hatch/muse-ui, the Muse template's components
└── dist/               # gitignored; populated by build.mjs
    ├── space-sdk.tgz   # vendored into each TS web artifact via `file:` dep
    ├── base-ui.tgz     # added to Muse artifacts only, same way
    └── muse-ui.tgz     # likewise; imports @hatch/base-ui
```

## Host appearance and the chat palette

The Muse shell supplies the viewer's light/dark mode and its existing accent
preference. Artifacts built from the `muse` template (`templates/space-ts-muse`
and `templates/space-static-muse`, layered over the base scaffold when a create
names it) follow them; the base scaffolds keep their own `prefers-color-scheme`
tokens. The static overlay carries an inline copy of the listener below, since
a static page loads no SDK. Standard
frames receive `#hatch_theme=..&hatch_accent=..` before first paint; CVM
bundles receive `data-hatch-color-scheme` and `data-hatch-accent` on `<html>`.
The template's head script also accepts the older `?hatch_theme=` signal.
Later changes use the parent-frame message:

```json
{"type":"hatch:space:theme","version":1,"colorScheme":"dark","accentColor":"blue"}
```

`colorScheme` accepts `light` or `dark`. The seven accent names are `blue`,
`green`, `red`, `purple`, `pink`, `orange`, and `monochrome`. The SDK accepts
messages only from the embedding parent and updates the same attributes and
conventional `dark` class without reloading. With no host signal, light/dark
follows the browser and the `muse` template's accent is monochrome.

The `muse` template uses Tailwind-UM (26 families, 11 stops), not the UM Expanded
chat ramps (25 families, 24 stops). Their stop numbers are not interchangeable.
The shell accent is not a chat selection ID, a rendered chat bubble color,
or `avatar.chat_theme_color`. That identity field is a stored selection or
avatar-derived hex; rendered chat colors come from `GET /api/chat/themes`.
The chat API's optional `p3-light`/`p3-dark` triples and its independent
`hatch_um_chat_palette` and `hatch_high_contrast_chat_bubbles` gates do not
change this frame protocol. No chat family name is sent. Following the chat
theme as a Space accent requires a separate coordinated client/API change,
including mappings for Default, Beige, avatar-following, and Blue fallback.

Published Space bundles are not rewritten, and this adds no lazy upgrade.
The `muse` template opts in with `data-hatch-host-theme` on `<html>`.
Without that marker, the SDK installs no theme listeners and keeps its
system-driven fallback styles, even if an edit refreshes the SDK or a CVM
host stamps appearance attributes. Preserve custom styles on edits. The
`muse` template exposes semantic foreground/background pairs through
`globals.css`; custom `@theme` palette overrides remain authoritative over
the bundled P3 ramp values.

## Building

Local Bun runtime artifacts:

```bash
cd hatch-skills/runtime-assets/spaces/ts-runtime
bun build.mjs
```

Output lands at `dist/space-sdk.tgz`. Bundle build wires this into the deployed
bundle so `/opt/muse/assets/spaces/ts-runtime/dist/space-sdk.tgz` exists at
runtime; each scaffolded space's `package.json` references it via
`"@hatch/space-sdk": "file:/opt/muse/assets/spaces/ts-runtime/dist/space-sdk.tgz"`.

## Cloudflare Worker Export

Cloudflare export is intentionally explicit and is not run by normal
`web_artifacts.build` yet:

```bash
cd hatch-skills/runtime-assets/spaces/ts-runtime
bun cloudflare/build-cloudflare.mjs \
  --space-dir "$JARVIS_HOME/workspace/ts-spaces/<slug>" \
  --out-dir /tmp/<slug>-cloudflare
```

The exporter writes:

- `worker.js`: bundled Worker action dispatcher.
- `deploy-manifest.json`: Worker source, client files from `client/dist`, and
  SQL migrations from `drizzle/*.sql`.

### Initial Cloudflare Database Seed

The Cloudflare deploy manifest may include an `initialDbSnapshot` field when a
local VM web artifact is shared to Cloudflare for the first time:

```json
{
  "runtime": "hatch-ts-cloudflare-v1",
  "slug": "my-space",
  "name": "My Web Artifact",
  "workerJs": "...",
  "migrations": [],
  "clientFiles": [],
  "initialDbSnapshot": {
    "runtime": "hatch-local-sqlite-snapshot-v1",
    "shortcode": "abc123",
    "slug": "my-space",
    "exportedAtMs": 1725000000000,
    "schemaWatermark": null,
    "payload": {
      "kind": "sqlite_sql",
      "sql": "<sqlite dump sql>"
    }
  }
}
```

`initialDbSnapshot` seeds D1 from a fenced local SQLite snapshot on first
publication. `initialBlobSnapshot` transfers the corresponding objects to R2.
The control plane validates their runtime, shortcode, and slug before upload;
it never overwrites an active database or bucket with a later local seed.
While shared, edits read remote snapshots and deploys apply migrations to D1.
Unshare drains writers and restores both D1 and R2 locally before enabling
local actions. See the [shared-state contract](../../../../docs/spaces-shared-state.md)
for admission, failure, and recovery semantics.

The build generates a Worker tsconfig and typechecks the space's
`server/src/actions.ts` against a Cloudflare-only `@hatch/space-sdk` shim. That
shim exposes the portable `ctx.db` surface backed by D1 and omits `ctx.emit`,
so code using it fails through TypeScript rather than source scanning. It keeps
the `ctx.inference`, `ctx.agent`, `ctx.tool`, and `ctx.executePrivileged` types
so one `actions.ts` serves both runtimes; the typecheck therefore misses those
calls, which fail with 403 on Cloudflare. `SpaceDb` deliberately
does not expose `transaction`.

## Blob Storage

Local TypeScript web artifact actions can use `ctx.blobs` for binary or opaque object
data that does not belong in `ctx.db`: generated images, thumbnails,
exports, attachments, cached API files, snapshots, and large payloads. Use
`ctx.db` for structured/queryable state, and store blob keys or searchable
metadata there when the UI needs to query across blob-backed records.

The local VM runtime initializes blob storage lazily on first use:

```text
<spaceDir>/blobs/objects/<id[0:2]>/<id>   id = sha256(key); sharded
<spaceDir>/blobs/index.sqlite
```

`index.sqlite` tracks `key`, `content_type`, `size_bytes`, `etag`,
`visibility`, `created_at_ms`, `updated_at_ms`, and `object_id`. `etag` is
currently a SHA-256 fingerprint of the stored bytes. Object bytes live under a
hashed, sharded `object_id` path rather than `objects/<key>`, so keys may be
long or contain reserved characters without hitting filesystem name limits;
keys are never used as filesystem paths. Blobs written before this change have
a null `object_id` and are read from the legacy `objects/<key>` path (the
served URL is an opaque base64url token regardless).

Example:

```ts
await ctx.blobs.put("images/avatar.png", bytes, {
  contentType: "image/png",
});
const meta = await ctx.blobs.head("images/avatar.png");
const url = await ctx.blobs.getUrl("images/avatar.png", {
  expiresInSeconds: 600,
});
```

`getUrl()` asks the runtime to mint a fetchable blob URL. Local Muse VM web artifacts
return a document-relative `./blobs/<key>` URL served by the daemon behind
ingress authentication (the owner's bearer or the Space's grant) — relative so
it resolves against the `/spaces/v2/<slug>/` document base whether that sits at
the origin root (prod) or behind a `/backend/<sid>/` reverse-proxy
prefix (annotation rig). Cloudflare web artifacts return a Worker-relative
`./blobs/public/<key>` or `./blobs/private/<key>?token=...` URL backed by the
per-web-artifact R2 bucket bound as `BUCKET`, with HMAC-signed tokens for private
blobs. Stateful downloads require a verified viewer and use `Cache-Control:
no-store`, including blobs marked public within the app. Both Cloudflare and VM
blob responses carry CSP `sandbox` and `nosniff`; attachments can display passive
content but cannot execute scripts with the app's origin or permissions. Do not
navigate an iframe, embed, or object directly to a PDF blob URL: the response
sandbox also blocks the browser's built-in PDF viewer. Generated clients should
render the fetched bytes with PDF.js through `PdfViewer` from
`@hatch/space-sdk/pdf`, which keeps the blob response sandbox intact.

Run the local Cloudflare exporter tests with:

```bash
bun test --timeout 30000 cloudflare/build-cloudflare.test.mjs cloudflare/shared-state.test.ts
```

## Muse icons

`spaces/icons/icons.json.gz` holds every Muse icon and `spaces/icons/aliases.json`
the familiar names that resolve to them. `build.mjs` bundles `dist/icons.js`, which
the artifact build runs for templates that own icons: `resolve` writes a Space's
`client/.generated/icons.ts` from its `@space/icons` imports, and `fill` replaces
`data-icon` placeholders in a staged static page. The SDK tarball carries only
the renderer. See `scripts/assets/xmds-icons/README.md`.

## Muse components

`base-ui/` and `muse-ui/` are the Muse template's packages; see
`muse-ui/README.md`.
