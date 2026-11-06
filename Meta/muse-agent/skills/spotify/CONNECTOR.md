# Spotify

- `/opt/hatch/bin/spotify-api` searches the Spotify catalog, reads and edits the user's library and playlists, and controls playback on their devices. `/opt/hatch/bin/save-to-spotify` manages the shows and episodes the user created with Save to Spotify. Both use the user's one Spotify connection.

- For a spoken request on a call to start music, a podcast, an episode or an audiobook, follow Voice playback below.

## Connect

- Run `spotify-api status` before data calls. Its `status` is `connected` or `not_connected`.

- When it is not connected, run `spotify-api authorize-url` and share only the link `[Connect to Spotify](<connect_url>)`. Never paste the raw URL.

- If playlist changes stop working after a reconnect, ask the user to connect again so the new grant carries the latest scopes.

- When the user asks to disconnect, run `spotify-api disconnect`. It removes the connection right away and returns `disconnect_outcome: disconnected`, with no link to share. `spotify-api status` confirms the result.

- `save-to-spotify` has no connect command. When it reports a token or "not connected" error, ask the user to connect Spotify in Settings > Connections > Spotify, then retry.

- Never pass credentials on the command line.

## Search and browse

```text
/opt/hatch/bin/spotify-api search --query "<title>" --artist "<artist>" --search-type TRACKS
/opt/hatch/bin/spotify-api experience --id <spotify_uri_or_name>
/opt/hatch/bin/spotify-api next-page --url <next_url>
```

- `--search-type` takes a comma-separated list of `TRACKS`, `ALBUMS`, `ARTISTS`, `PLAYLISTS`, `EPISODES`, `PODCASTS` and `AUDIOBOOKS`. Search shows with `PODCASTS`, because `SHOWS` is invalid in search.

- For an exact song or album, pass `--query "<title>" --artist "<artist>"`. That keeps a missing original apart from a cover or a similar title.

- Make the first search for an audiobook with `--search-type AUDIOBOOKS`. An untyped search can omit audiobooks even when the account has access to them.

- `experience --id` opens an artist, album, playlist or show page. Use it with a show's URI to list the show's episodes.

- When a response section includes `next`, fetch more with `next-page --url <next>` until `next` is absent or the user has enough. It accepts only `https://partner.spotify.dev` URLs, so pass `next` unchanged and never build one or guess a section ID.

- `search`, `library`, `experience` and `next-page` also take `--language <lang>`, which asks Spotify for results in that language.

- Pull out the items the user needs. Never paste a full response into the reply.

## Library and playlists

```text
/opt/hatch/bin/spotify-api library --filter PLAYLISTS
/opt/hatch/bin/spotify-api save --uri <spotify_uri>
/opt/hatch/bin/spotify-api save --current
/opt/hatch/bin/spotify-api create-collection --name "<name>" [--add-current]
/opt/hatch/bin/spotify-api add-to-collection --collection-uri <uri> --uris <uri1,uri2>
/opt/hatch/bin/spotify-api add-to-collection --collection-name "<name>" --current
/opt/hatch/bin/spotify-api update-collection --collection-uri <uri> --name "<new name>"
```

- `library --filter` takes `ALBUMS`, `ARTISTS`, `PLAYLISTS`, `EPISODES`, `PODCASTS`, `SHOWS`, `PODCASTS_AND_SHOWS` or `AUDIOBOOKS`. These are content categories, never field names such as `title` or `items`.

- `TRACKS` is rejected as a library filter. Find tracks with an unfiltered `library` call or `search --search-type TRACKS`.

- `save --uri` saves a track, album, artist, show, episode, audiobook or playlist to the library.

- For the item playing now, such as "like this song" or "add this to my Running playlist", pass `--current`, or `--add-current` to `create-collection`. The command reads what Spotify is playing when it runs, so don't run `now-playing` first. The response names the item and playlist it used.

- `--collection-name` finds one of the user's own playlists by its name, so `library` isn't needed first. Pass the name the user gives, leaving out a trailing "playlist" that only describes it; the lookup already handles a leading "my". When it returns `incomplete`, find the playlist with `library --filter PLAYLISTS` and `next-page`, then pass `--collection-uri`. When it returns `ambiguous`, ask the user which of its `candidates` they mean, then pass that playlist's `--collection-uri` with the same items: the original `--uris`, or the returned `item.uri` as `--uris` in place of `--current`, so a song change in the meantime doesn't add a different track.

- When `create-collection --add-current` returns a `collection` but the add failed, add the returned `item.uri` as `--uris` to that playlist with `--collection-uri`; don't create it again.

- To insert items at a position, add `--position-type BEFORE_UID` or `AFTER_UID` with `--position-uid <uid>` to `add-to-collection`, and pass `--revision-id <rev>` from the latest response.

## Present results

- Include a Spotify link for every item you mention. Use `spotify_url`, or build `https://open.spotify.com/<type>/<id>` from `spotify_uri`. Name Spotify as the source.

- Mark a title with `[E]` when its `is_explicit` is true.

- Search results include `spotify_search_url`, which opens the same search in Spotify.

- When a requested song or album is not in the results, or its lookup returns `not_found`, say plainly that you could not find it and name what you searched for. Never substitute a cover, tribute, karaoke or similarly named track, never blame the account or suggest reconnecting, and never say Spotify removed the item.

## Voice playback

- Use this section only for a spoken request on a call to start new music, a podcast, an episode or an audiobook. For pause, resume, stop, skip, previous, playback status, volume, transfer, queue, sign-in, search, library or playlist requests, and for anything typed, use the other sections.

- When the device carrying the call lists `music_fulfillment` in its device catalog, follow [wearable playback](references/wearable-playback.md) instead of the rest of this section.

- On other calls, including from glasses without `music_fulfillment`, play through Spotify Connect and never send `device.invoke` with `music_fulfillment` to any device.

- If the caller asks for another service or source, such as Apple Music, say that only Spotify plays here for now, offer to play it on Spotify and run no command.

- Find the item with `spotify-api search`, or `spotify-api library` for the caller's own playlists and saved items. Start it with `spotify-api play --context-uri <uri>`. When the caller names a device, add `--target-device-id` with an ID from `spotify-api devices`. "On Spotify" names the service, not a device.

- Spotify's DJ is a playlist titled "DJ". Find and start it like any other playlist, but start only a result titled exactly "DJ". If the lookup finds only playlists with other titles, say DJ was not found, name the closest one, and ask before starting it. When nothing matches, follow Results below.

### Results

- If the lookup returns `not_found`, say the item was not found on Spotify. Play nothing else.

- If Spotify is not connected, follow Connect above.

- If playback fails, report it once. Do not retry on another device or route.

- After successful new playback on a call, do not run `now-playing`. Say what is playing and where in one short sentence, or stay silent if the call already acknowledged the request.

## Other playback controls

```text
/opt/hatch/bin/spotify-api devices
/opt/hatch/bin/spotify-api play --context-uri <uri> --target-device-id <id>
/opt/hatch/bin/spotify-api now-playing
/opt/hatch/bin/spotify-api add-to-queue --query "<title>" [--artist "<artist>"]
```

- Typed requests start playback with `play`, which also takes `--uid <uid>` to start from one item in the context. Any conversation can use `pause`, `resume`, `skip`, `previous`, `seek --position-ms <ms>`, `set-volume --volume-percent <0 to 100>`, `transfer --target-device-id <id>`, `get-queue` and `add-to-queue --item-uri <uri>`. `add-to-queue --query` finds a song by title and queues Spotify's top match in one step, without a separate `search`; pass `--artist` when the user names one, and name the song from `queued` in the reply.

- `play` and `add-to-queue` need an active Spotify Connect device. `play`, `set-volume` and `transfer` take `--target-device-id`, so prefer passing it over relying on the active device. Run `devices` immediately before setting `--target-device-id` and use an ID from that response. If the list is empty or the named device is missing, ask the user to choose an available device instead of reusing an old ID.

- After a direct playback change with `play`, `skip`, `previous` or `resume`, read `now-playing` and name the track and its creator, never just the device. New playback on a call follows Voice playback instead.

## Recover from errors

- A successful playback response means the change took effect. The CLI already retries server errors, so report a remaining error once in plain words.

- `stale_target_device` and `device_list_unavailable` mean no playback command was sent. Run `devices` and ask the user to choose an available device.

- A result with `previous_command_outcome: unknown` means an earlier command may have worked. Check `now-playing` before doing anything else, and never resend it blindly.

- `not_found` and `not_connected` end that attempt. A timeout can arrive after playback started, so check the result before repeating a command, and never switch devices on the user's behalf.

- When an action is unavailable, point the user to the Spotify app rather than guessing at a workaround.

## Manage Save to Spotify shows and episodes

- Shows and episodes the user created with Save to Spotify are managed only with `save-to-spotify`. `spotify-api`, podcasters.spotify.com and creators.spotify.com cannot manage them. New uploads go through the Podcast Production skill's helper, because the CLI accepts an upload only with the helper's receipt.

```text
/opt/hatch/bin/save-to-spotify --json shows
/opt/hatch/bin/save-to-spotify --json shows get <show-id>
/opt/hatch/bin/save-to-spotify --json episodes --show-id <show-id>
/opt/hatch/bin/save-to-spotify --json episodes status <episode-id> --wait
```

- Put `--json` before the subcommand on every call. `update` and `token` are disabled.

- `shows` is the authoritative list of the user's Save to Spotify shows and also confirms the connection. Match shows and episodes by title, and ask which one the user means when more than one matches.

- `episodes status <episode-id> --wait` waits up to 15 minutes for Spotify to finish processing. `READY` means playable. An episode stuck in `NOT_READY`, or a `503` that never clears, is a delay on Spotify's side. Say it was accepted and is still processing, and check again later.

- If `save-to-spotify` reports that show and episode management is unavailable, explain that directly. Reconnecting will not fix it.

### Delete a show or episode

- To remove one episode, resolve its title and owning show, then run `save-to-spotify --json episodes delete <episode-id> --show-id <show-id>`.

- To remove a whole show, tell the user all of its episodes go with it, then run `save-to-spotify --json shows delete <show-id>`. Do not delete its episodes one by one first.

- A clear request for the exact deletion needs no extra chat confirmation.

- `{"status":"deleted"}` means Spotify accepted the deletion. Check `episodes --show-id` or `shows` every 5 to 10 seconds for up to a minute, and confirm only when the item is gone. If it is still listed, say the deletion was accepted and is still propagating. Never send the delete again.

- Deleting the Spotify copy keeps Muse's local audio and any published RSS feed.

- Refer to shows and episodes by title. Their IDs and `spotify:` URIs are internal handles, so never show them, and do not link to a deleted item.

## Limits

- `home`, `recommendations`, `check-saved`, `remove`, `section-items`, playlist deletion, removing items from a playlist and reordering a playlist are unavailable. Do not promise them.

- `spotify-api` is limited to 300 requests a minute, with bursts of up to 50. Prefer one broad call over many narrow ones.

## Related skills

- [Music](/opt/muse/skills/music-discovery/SKILL.md)

- [Podcast Production](/opt/muse/skills/generate_podcast/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
