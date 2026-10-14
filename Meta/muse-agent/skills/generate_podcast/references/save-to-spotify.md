# Add a generated episode to the user's Spotify

Reference for the `generate_podcast` skill's "Add to your Spotify" handoff. This is a **personal**
save — an episode the user generated into their **own** Spotify library/show — via the bundled
`save-to-spotify` CLI. It is not RSS feed publishing. Only do this when the user explicitly asks;
never offer it proactively.

## Prefer `podcast-helper save-to-spotify` for the upload
Drive the actual save through `podcast-helper save-to-spotify --slug <slug> [--show-id <id> |
--new-show "<title>"] [--title ...] [--summary ...] [--image ...]`. The helper uploads via the
`save-to-spotify` CLI below **and** records the resulting `spotify_show_url`/`spotify_show_id` into the
manifest feed (and the Postgres catalog), so the show link surfaces on the podcasts library page. It
returns `episode_id`, `episode_uri`, `spotify_show_id`, and `spotify_show_url`. Use the raw CLI
directly for read/status and deletion steps. The rest of this doc describes that underlying CLI.

## Tooling
Always call the bundled wrapper on PATH; never install the Spotify CLI, download binaries, or set
alternate paths. If `save-to-spotify` is missing, report it as a Muse installation issue. Use
`--json` on every call so results are machine-readable; it is a global flag — place it before the
subcommand (`save-to-spotify --json <command>`).

```sh
save-to-spotify --json <command> [options]
```

Commands:
- `save-to-spotify --json shows`
- `save-to-spotify --json shows create --title "<title>" --summary "<desc>"`
- `save-to-spotify --json shows get <show-id>`
- `save-to-spotify --json shows delete <show-id>`
- Uploads are supported only through `podcast-helper save-to-spotify`; the raw wrapper rejects them
  unless the helper has already claimed and fsynced its durable upload receipt.
- `save-to-spotify --json episodes --show-id <show-id>`
- `save-to-spotify --json episodes status <episode-id> --wait`
- `save-to-spotify --json episodes delete <episode-id> --show-id <show-id>`
- `save-to-spotify --json timeline set --episode-id <id> --from-file <timeline.json>`

`update` and `token` are disabled by the wrapper; do not use them.

## Auth (shared Spotify connection — connect in Settings)
The tool reuses the user's existing **Spotify** connection, following the same backend as the `spotify`
playback skill. Gatekeeper-enabled users use authd-owned public PKCE; the existing brokered path remains the
rollback outside the rollout. Connect and disconnect happen in  
**Settings → Connections → Spotify** — this tool issues no connect link, holds no token, and has no
`auth` subcommands. Infer connection state from the commands themselves: if `shows` (or any command)
fails with a "connect Spotify in Settings" / token error, tell the user to **connect Spotify in
Settings → Connections → Spotify**, then retry. Never ask the user for Spotify passwords, client
secrets, or tokens.

## Upload flow
1. `shows` — list existing shows (this also confirms Spotify is connected; on a token error, point the
   user to Settings → Connections → Spotify). Ask whether to reuse one or create a new one
   (`shows create` or `upload --new-show`). Don't silently pick.
2. Run `podcast-helper save-to-spotify ...` — confirm the title, show, and summary with the user first
   (this is an approved write to their account). The helper claims a durable receipt before launch; a
   deterministic wrapper preflight rejection is safe to retry only when the wrapper positively reports that
   no external attempt began. Every other failure leaves the receipt uncertain and blocks a blind retry.
3. `episodes status <episode-id> --wait` — poll until `READY`. Processing is server-side and can take
   a few minutes.
4. Optionally `timeline set --episode-id <id> --from-file timeline.json` once READY.
5. Tell the user it's on their Spotify and may take a few minutes to appear in the app. Use the show
   and episode titles plus plain-language readiness (`ready` or `still processing`); do not quote the
   CLI's raw identifiers or JSON.

## Deletion flow
Shows and episodes created through Save to Spotify are deleted with this CLI. They are not managed in
`podcasters.spotify.com` or `creators.spotify.com`, and `spotify-api` cannot delete them.

1. Run `save-to-spotify --json shows`. Treat this as the authoritative inventory of the user's Save to
   Spotify shows. Match by title; if multiple shows match, ask the user which one they mean.
2. Run `save-to-spotify --json shows get <show-id>` to verify the selected title and episode count.
3. For one episode, run `save-to-spotify --json episodes --show-id <show-id>`, match the requested title,
   confirm the deletion, then run  
   `save-to-spotify --json episodes delete <episode-id> --show-id <show-id>`.
4. For a whole show, confirm the show title and that all its episodes will be removed, then run
   `save-to-spotify --json shows delete <show-id>`. The show command deletes its episodes too; do not
   delete each episode first.
5. Treat `{"status":"deleted"}` as acceptance, not proof that Spotify's listings have converged. Poll
   every 5–10 seconds for up to 60 seconds: query `episodes --show-id <show-id>` after an episode deletion
   or `shows` after a show deletion. The deletion is confirmed only when the deleted ID is absent.
6. If the item is still listed after 60 seconds, tell the user the deletion was accepted and can take
   about a minute to propagate. Do not issue the delete again. Otherwise report the deleted title, not
   the internal ID. Clarify that this removes the Spotify copy only; it does not delete Muse's local
   audio or an independently published RSS feed.

Supported audio: `.mp3`, `.m4a`, `.wav`, `.ogg`. Cover images: **JPEG or PNG only, ≤ 1 MB** — other
formats (e.g. `.webp`) are rejected with `unsupported image extension`; convert first
(`ffmpeg -i cover.webp cover.jpg`) and pass the converted file to `--image`.

**Readiness & retries.** A returned `episode_uri` means Spotify *accepted* the upload; reaching `READY`
is a separate server-side processing step. Spotify occasionally returns `503` or leaves an episode in
`NOT_READY` during backend slowdowns. If it hasn't reached `READY` after several minutes, that's a
Spotify-side stall (not a Muse error): tell the user it was accepted but is still processing on
Spotify's side, and retry the upload later rather than polling indefinitely.

## Rules
1. Always use `save-to-spotify --json`; never install or invoke the Spotify CLI directly.
2. Connect is Settings-only: on a token / "not connected" error, tell the user to connect Spotify in
   Settings → Connections → Spotify, then retry — this tool has no `auth` subcommands or connect link.
3. Confirm title, target show, and summary before `upload` — it writes to the user's account.
4. After `upload`, poll `episodes status --wait` until `READY` before setting a timeline or telling the
   user it's live.
5. Only save audio the user generated or provided; respect third-party rights.
6. Do not use `update` or `token` (disabled).
7. Covers must be JPEG/PNG ≤ 1 MB (convert `.webp` or others first).
8. A returned `episode_uri` = accepted; a `NOT_READY`/`503` that never reaches `READY` is a Spotify-side
   stall — surface it and retry later, don't loop indefinitely.
9. **Never expose internal Spotify identifiers.** Show IDs, episode IDs, and `spotify:show:` /
   `spotify:episode:` URIs are opaque handles used only as arguments to later CLI commands. Never print,
   echo, or mention them in confirmations, upload summaries, readiness updates, or error explanations.
   Refer to shows and episodes by title instead.
10. Confirm every deletion. A show deletion removes all of that show's episodes.
11. Never direct the user to Spotify creator websites for this content; use the CLI inventory and delete
    commands above.
12. Never claim an item disappeared based only on `{"status":"deleted"}`. Verify absence with a bounded
    read loop, or clearly say the accepted deletion is still propagating after the one-minute timeout.
