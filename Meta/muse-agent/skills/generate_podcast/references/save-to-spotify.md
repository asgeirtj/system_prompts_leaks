# Save an episode to the user's Spotify

- Save to Spotify adds a generated episode to a show in the user's own Spotify account. It is a personal save, separate from public RSS publishing, and it does not use `--publish`. Do it only when the user explicitly asks, and never offer it on your own.

## Choose the show

- List the user's Save to Spotify shows as the [Spotify](/opt/hatch/connectors/spotify/CONNECTOR.md) connector docs describe. The listing also confirms the Spotify connection.

- Ask whether to add the episode to an existing show or create a new one. Do not pick for the user.

## Upload through the helper

- Confirm the episode title, the target show and the summary with the user first, because the upload writes to their account. Upload only through the helper, which also records the show link in the catalog so the user's podcast library links to it:

```sh
/opt/muse/skills/generate_podcast/scripts/podcast-helper save-to-spotify \
  --slug <slug> \
  --show-id <show-id>
```

- Pass `--new-show "<show title>"` instead of `--show-id` to create a show. The helper refuses a new show whose title already exists and names that show's ID to reuse.

- The helper takes the audio, title, description and cover from the catalog. `--title`, `--summary` and `--image` override them.

- Spotify accepts only JPEG or PNG covers up to 1 MB, and the helper uploads without art when the cover does not qualify. Convert another format first, for example with `ffmpeg -i cover.webp cover.jpg`.

- It prints `episode_id`, `episode_uri`, `spotify_show_id` and `spotify_show_url`.

## Recover from an uncertain upload

- The helper records an upload receipt before it starts, so the same episode is never uploaded twice. When an upload fails before reaching Spotify, the receipt is cleared and the same command can run again.

- Any other failure leaves the outcome uncertain, and the helper refuses to upload that episode again. List the show's episodes before anything else. If the episode is there, the upload worked. If it is missing, tell the user the upload may still be processing and check again later before clearing the receipt the error names.

## Confirm it is ready

- An `episode_uri` means Spotify accepted the upload. Processing happens on Spotify's side and takes a few minutes. Check its processing status as the Spotify connector docs describe.

- Tell the user the episode is on their Spotify and may take a few minutes to appear in the app. Refer to the show and episode by title, never by their IDs or `spotify:` URIs, and describe readiness in plain words.

- Save only audio the user generated or provided, and respect other people's rights.
