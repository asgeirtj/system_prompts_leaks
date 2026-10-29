# Work pnpm setup

New bundled Vinext Sites select pnpm automatically on managed Linux. Portable starters use npm; existing and retained projects keep their manager. Setup records an unfinished pnpm selection in ignored project runtime state so the ordinary installer can resume it.

In the managed-linux execution environment, from a fresh checkout created by `node <plugin-root>/scripts/project-setup.mjs`, run:

```sh
node <plugin-root>/scripts/install-dependencies.mjs
```

Only the unchanged Vinext starter dependency inputs qualify. Bootstrap assets live here, outside the default copied starter, so their presence cannot change the local or server-side package-manager selector. A hash receipt binds the canonical npm inputs and imported pnpm lock; the image verifies its artifact identities/versions/integrities against the npm lock before fetching public content. Regenerate and review the receipt and imported lock together when the starter dependencies change.

The initial installer runs in a temporary project while the real project's install lock is held. On success it installs one pnpm lock, `packageManager`, matching `install:ci` script and project-local `node_modules`. On an allowed operational failure, unchanged initial inputs can use the existing seeded npm installer in a separate canonical temporary checkout while retaining the real project's install lock. Neither attempt installs against mutable real-project dependency inputs. Both temporary checkouts preserve the selected execution profile, and adoption leaves the real checkout's local profile untouched. Integrity/policy failures and cancellation stop. Fallback latency includes any pnpm work already attempted; it is not a free retry.

Before publishing either result, adoption atomically claims the original npm inputs and checks those claimed bytes against the receipt. New manifest/config paths are published exclusively, so a recreated author file is not overwritten. The claimed files remain under `.sites-runtime/pnpm-adoption-inputs-*`, including after success, to preserve edits through previously open file descriptors. Rollback also retains produced files there and restores inputs only into absent paths. Reported conflicts require inspection before retrying; recovery files are ignored runtime data, not another active lockfile or publication input.

Keep initial setup on the unchanged starter; add dependencies after a manager is selected. Failed or cancelled pnpm attempts retain their pending selection, so editing dependency inputs cannot silently trigger npm. Selecting npm fallback clears that state, and subsequent installs keep npm even if its first install fails.

Once adopted, ordinary `install-dependencies.mjs` keeps the project's pnpm graph. It never uses a stale npm lock after `pnpm add` or `pnpm update`. If shared-store access is lost, a frozen native pnpm installation repairs the layout in a permitted project store. Existing pnpm projects need the foundation helpers and a pnpm-capable image even after activation is reverted.

## Storage and permissions

The image supplies pnpm 11.25.0 and a read-only package seed at `/opt/codex/cache/sites-vinext-pnpm`. Eligible projects use `/workspace/.sites-runtime/pnpm-store`, initialized once under a bounded lock. An existing mutable store is never overwritten by an image update. Missing packages use normal pnpm fetching and policy checks.

Normal Work permits writes across the owner's `/workspace`. Sharing a store there does not add a write grant or cross-owner sharing. A narrower Library session may lack access: new setups use npm; established pnpm projects repair privately. Actual write probes choose the path, without requesting broader permissions.

`packageImportMethod: auto` lets pnpm clone or hardlink store files, falling back to copies when neither is supported. Each project retains its own `node_modules`, but hardlinked dependency files share store inodes: in-place writes can affect other projects using those files. This includes cached dependency build outputs rewritten by hooks during `pnpm rebuild`. To recover clean dependencies after shared files are modified, use a clean store and recreate `node_modules` in each affected project from its lockfile. Repairing the store alone does not repair installations still linked to old, modified files.

Sharing applies to new pnpm Sites using the updated starter helpers. Existing Sites retain their copied `scripts/install-pnpm.sh` and `scripts/pnpm-install.mjs`; upgrading the plugin or image does not replace them. To migrate an existing pnpm Site, update both helpers to use `auto`, then recreate `node_modules` using its existing pnpm lockfile. Existing copied modules are not automatically relinked.

Tracked configuration uses an environment expression with a project-relative default, so exported source contains no absolute machine store path. Runtime stores/reports/modules are already excluded by the starter's Git ignore rules. The server builder installs the authoritative lock independently; it does not inherit this helper's shared store or npm fallback.

## Validate before activation

From a selected Work project, explicitly run one of:

```sh
node <plugin-root>/scripts/validate-pnpm.mjs --check readiness
node <plugin-root>/scripts/validate-pnpm.mjs --check store
node <plugin-root>/scripts/validate-pnpm.mjs --check reuse
```

`readiness` checks tooling. `store` also prepares the real workspace store. `install`, `build`, and `reuse` successively add a scratch install, scratch build, and second-project install. These do not target the active Site's package files, modules, source or publication, but scratch projects can share dependency files as described above. Only scratch directories are removed. Probes consume CPU/disk/network and warm the shared cache; they are opt-in diagnostics, not a promise of zero overhead or an npm/pnpm latency experiment.

The final `[sites pnpm validation]` JSON contains `ok` and per-stage outcomes. A completed diagnostic exits zero even when an inner check failed, because the plugin transport reads sidecars only for completed commands; automated callers must assert `ok`. Cancellation propagates. Separate `pnpm_validation.result` and `pnpm_validation.duration_ms` metrics retain failures/skips without adding shadow samples to real dependency-install latency. See the backend [metric contract](https://github.com/openai/openai/blob/master/chatgpt/codex-backend/docs/sites_workflow_metrics.md).

Image CI runs real offline installs/builds as `oai`, native pnpm store-repair tests, bootstrap/rollback tests and shadow isolation checks. Before activation is published, also verify the exact image and plugin versions in real Work, normal and Library permissions, changed dependencies and saved-source publication. A Docker test does not establish that production uses the image.

Changing the new-project default requires a setup code change, not only updated instructions. Preserve established managers and pending attempts when changing defaults.
