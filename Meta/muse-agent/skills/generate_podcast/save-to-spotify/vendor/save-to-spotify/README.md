# save-to-spotify CLI release pin

This directory records the official `save-to-spotify` release used by the `save-to-spotify`
wrapper. Spotify publishes per-OS/arch zip assets; Jarvis (par-msl/hatch-image)
vendors the linux/amd64 asset, extracts the `save-to-spotify` executable, and installs it as
the trusted payload at `/opt/hatch-image/vendor/save-to-spotify-cli/save-to-spotify`.

The Rust wrapper (`skills/crates/save-to-spotify-cli`) is the policy/privsep/auth boundary:
it reuses Spotify's shared authd-owned PKCE grant through an opaque Sentinel surrogate, gates
content commands with HITL, clears caller auth env, blocks `update`, restricts forwarded args
to a per-subcommand allowlist (`validate_args`), and delegates to the fixed executable path.
It does not fork or patch the upstream binary. See the crate's `DESIGN.md` for the full plan.

## SOURCE.toml fields
- `repo` / `rev` / `tag` / `version` — upstream repository and exact release pin.
- `package` — package name the pin represents.
- `artifact` — installed trusted payload name.
- `release_url` — official release page.
- `release_asset` — official linux/amd64 asset (a `.zip`).
- `release_asset_sha256` — expected checksum of that asset (from the release's `.sha256`).
- `release_asset_archive_member` — the executable to extract from the zip.

## Update flow
1. Pick the new official release.
2. Update `SOURCE.toml` (`tag`, `rev`, `version`, `release_url`, `release_asset`,
   `release_asset_sha256`).
3. Update hatch-image's vendored executable + installer checksum to match.
4. Diff upstream `auth/` and `config/` for OAuth/constant changes (client_id, scope, auth and
   token URLs, redirect URI/port, backend URL); update the wrapper constants if they moved.
5. Re-audit the CLI's flag surface (`--help`) against the wrapper's `validate_args()` allowlist:
   add any new/renamed flags the wrapper needs, and reject new read/write/exec or
   credential-substitution gadget flags.
6. From hatch-extensions: `cargo fmt --all` and `cargo test -p save-to-spotify-cli`.
7. Run a live smoke test (authorize → upload → `episodes status` READY).
8. Run image payload/bundle/deploy gates; bump Jarvis `extensions.toml` to the new
   hatch-extensions rev.

Rollback = revert the `SOURCE.toml` pin + hatch-image executable/checksum, then bump
`extensions.toml` back to the known-good rev.

## Operational note
The backend can force-deprecate an out-of-date CLI via the `X-Min-CLI-Version` response
header. Monitor releases and keep the pin current so uploads don't start failing.
