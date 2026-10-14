---
name: "spotify"
description: "Discover, search, and manage Spotify music, podcasts, and playlists, including deleting shows or episodes you created with Save to Spotify."
icon: "spotify"
metadata: { "includeInPrompt": true }
---

# Spotify

## Purpose
Use `spotify-api` to browse personalized Spotify content, search for music and podcasts, manage the user's library and playlists, check saveability of items, and start or control Spotify playback. For new playback during a voice conversation, follow **Voice playback** below instead of calling `spotify-api play`. Use `save-to-spotify` to manage shows and episodes you created through Save to Spotify.

## Voice playback

Use this section only when someone asks to start new music during a voice
conversation. For pause, resume, stop, skip, previous, status, volume,
transfer, queue, login, search, library, or playlist requests, use the
`spotify-api` commands below.

### Choose where to play

Use the first rule that matches:

1. If the user names a playback device other than the device carrying this
   call, such as a phone, computer, TV, speaker, car, or console, or refers to
   another device named earlier with words like "there" or "the same speaker,"
   run `spotify-api devices`. Find the exact device, then use
   `spotify_connect` and its `spotify_device_id`. A specifically named phone
   always uses this rule, even if it carries an app-audio call. If there is no
   clear match, ask which device to use. Never use `auto` for that separate
   named or previously referenced device.
2. Otherwise use `auto` for the device carrying this call. This includes
   "here", "these glasses", "this device", naming that same non-phone calling
   device, "play X", and "play X on Spotify". Spotify is the music service,
   not the device.

### Start the music

Call `muse.music` once with `action` set to `play` and the destination chosen
above. Do not call `spotify-api play`, `spotify-api wearable-play`, or
`muse.device.invoke` for this request.

For `auto`, trusted host code checks the exact device that started this voice
call. If its live tool list contains `music_fulfillment`, the host calls that
command once on that device. If no supported call device can be resolved, the
host uses the active Spotify Connect device. If a resolved device disappears
or loses the command during dispatch, the host stops instead of switching
devices. Do not inspect or call device tools yourself.

If `muse.music` fails, report the failure. Do not try another device or
playback route. If Spotify was disconnected, let the tool show the connection
flow. When the user connects and asks again, call `muse.music` again.

## Tooling
Use the installed CLI directly from `PATH`.

#### Connection
- `spotify-api status` — check OAuth connection status (`status`, `connect_url`, `disconnect_url`)
- `spotify-api disconnect` — disconnect Spotify (may return a confirmation URL)
- `spotify-api authorize-url` — get the active environment's connect URL

#### Browse & Discover
- `spotify-api experience --id <spotify_uri_or_name> [--language <lang>]` — get experience by ID (e.g. artist/album/show page). Large sections may include a `next` URL for more results.
- `spotify-api next-page --url <section_next_url> [--language <lang>]` — fetch the next pagination URL returned as `sections[].next` or `next` by a prior Spotify response. Prefer this over guessing section IDs.

#### Search
- `spotify-api search --query <text> [--search-type TRACKS,ALBUMS,ARTISTS,PLAYLISTS,EPISODES,PODCASTS] [--language <lang>]` — search for content. For an exact song or album lookup, always format the query as `"<song or album> by <artist>"` so missing originals are distinguished from covers and similarly named content. Use `PODCASTS` to find shows (not `SHOWS` which is invalid). Use `experience --id <show_uri>` to list episodes of a found show.
- Search responses include `spotify_search_url` for opening the same query directly in Spotify. When an exact requested item is unavailable, `catalog_fallback.message` is the fully rendered approved response and must be relayed verbatim; the object also provides `requested_content_label`, `requested_content_url`, `artist_name`, and `artist_url`.

#### Filter values
- Valid library/browse filter values are `ALBUMS`, `ARTISTS`, `PLAYLISTS`, `EPISODES`, `PODCASTS`, `SHOWS`, and `PODCASTS_AND_SHOWS`.
- These filter values are content categories, not field projections. Never use field names such as `title`, `items.title`, `sections`, or `items` as `--filter` values.
- `TRACKS` is explicitly rejected for library filtering; use unfiltered `spotify-api library` or `spotify-api search --search-type TRACKS` to find tracks.

#### Library
- `spotify-api library [--filter ALBUMS|ARTISTS|PLAYLISTS|EPISODES|PODCASTS|SHOWS|PODCASTS_AND_SHOWS] [--language <lang>]` — browse user's library. `TRACKS` is not supported as a library filter; use unfiltered `library` or `search --search-type TRACKS` instead.
- `spotify-api save --uri <spotify_uri>` — save item to library (track, album, artist, show, episode, playlist)

#### Delete Save to Spotify shows or episodes
- When the user asks to delete a podcast, show, or episode Muse added through Save to Spotify, use the installed `save-to-spotify` CLI. These are managed by the CLI, not `spotify-api`, `podcasters.spotify.com`, or `creators.spotify.com`.
- If `save-to-spotify` reports that show and episode management is unavailable, explain the limitation directly; do not ask the user to reconnect or retry.
- Always use JSON mode. Start with `save-to-spotify --json shows`; this inventory contains the shows created through Save to Spotify. Match by title and ask the user to disambiguate if more than one show matches.
- Inspect the selected show with `save-to-spotify --json shows get <show-id>`. List its episodes when needed with `save-to-spotify --json episodes --show-id <show-id>` and match episodes by title.
- To delete one episode, resolve its title and owning show unambiguously, then run  
  `save-to-spotify --json episodes delete <episode-id> --show-id <show-id>`.
- To delete the whole show, resolve the show unambiguously and tell the user that all of its episodes will be removed, then run `save-to-spotify --json shows delete <show-id>`. This command deletes the show and its episodes; do not delete each episode first.
- A `{"status":"deleted"}` response means Spotify accepted the deletion, but its listings can take about a minute to update. Poll the relevant inventory every 5–10 seconds for up to 60 seconds: use `episodes --show-id <show-id>` for an episode or `shows` for a show. Confirm completion only after the deleted ID is absent. If it is still listed after 60 seconds, tell the user the deletion was accepted and is still propagating; do not send the delete again.
- Show and episode IDs are internal command handles. Refer to content by title in user-facing replies. A CLI deletion removes the Spotify copy only; it does not delete Muse's local audio or an independently published RSS feed.

#### Collections (Playlists)
- `spotify-api create-collection --name <name>` — create a new playlist
- `spotify-api add-to-collection --collection-uri <uri> --uris <uri1,uri2,...> [--position-type BEFORE_UID|AFTER_UID --position-uid <uid>] [--revision-id <rev>]` — add items to a playlist
- `spotify-api update-collection --collection-uri <uri> --name <new_name>` — rename a playlist

#### Playback Control
- `spotify-api play [--context-uri <uri>] [--uid <uid>] [--target-device-id <id>]` — start playback outside a voice conversation (optionally of a specific album/playlist/context, starting from a specific item UID, on a specific device). For new playback during voice, follow **Voice playback** above and use `muse.music` instead.
- `spotify-api pause` — pause playback on the active device
- `spotify-api resume` — resume paused playback on the active device
- `spotify-api skip` — skip to the next item
- `spotify-api previous` — go to the previous item
- `spotify-api seek --position-ms <ms>` — seek to a position in the currently playing item
- `spotify-api set-volume --volume-percent <0-100> [--target-device-id <id>]` — set playback volume
- `spotify-api transfer --target-device-id <id>` — transfer playback to a different device
- `spotify-api now-playing` — get the current playback state (track, progress, device, etc.)
- `spotify-api devices` — list available Spotify Connect devices
- `spotify-api get-queue` — get the current playback queue
- `spotify-api add-to-queue --item-uri <spotify_uri>` — add an item to the playback queue

#### Known unavailable or conditional commands
- `home`, `recommendations`, `check-saved`, `remove`, `section-items`, and `reorder-collection` are not exposed by `spotify-api` because they are unsupported or unreliable with the current Partner API responses/scopes. Use `search`, `library`, `experience`, `next-page`, and playlist create/add/update instead. This does not apply to shows and episodes created through Save to Spotify; delete those with `save-to-spotify` as described above.
- `play` and `add-to-queue` require an active Spotify Connect device; use `spotify-api devices` first and prefer an explicit `--target-device-id` where supported. `set-volume` should also prefer `--target-device-id`.


## Auth
`spotify-api` owns the Spotify connection workflow.

Auth contract:
- Run `spotify-api status` first.
- If not connected, run `spotify-api authorize-url`. Present the returned URL as a hyperlink with the text `[Connect to Spotify](<connect_url>)`; do not show or paste the raw URL.
- If playlist changes stop working after a reconnect, re-link so the token is minted with the latest requested scopes.
- If the user wants to disconnect, run `spotify-api disconnect`. When `disconnect_url` is present, replace `<disconnect_url>` with the returned URL and share only this Markdown link: `[Disconnect Spotify](<disconnect_url>)`; explain that the user must open it to confirm. When no URL is returned and the command succeeds, `spotify-api status` may be used to verify the disconnection.
- Do not pass secrets on the command line.

## Operating Rules
1. Verify connection with `spotify-api status` before `spotify-api` data calls. For Save to Spotify management, start with `save-to-spotify --json shows`; if it reports a token or connection error, ask the user to connect Spotify in Settings → Connections → Spotify, then retry. If it reports that management is unavailable, do not present reconnection as a fix.
2. Browse with `search`, `library`, and `experience`. Extract relevant items; never dump full responses.
3. When a section includes `next`, call `spotify-api next-page --url <next>` to fetch additional pages. Continue following `next` until it is absent or the user has enough results.
4. The documented Save to Spotify show and episode deletions may proceed from a clear, unambiguous user request without an additional confirmation. Do not promise unsupported `spotify-api` cleanup (unsave/remove, playlist deletion, remove-from-playlist, or reordering).
5. Direct `spotify-api` playback requires an active Spotify Connect device. Run `spotify-api devices` or `spotify-api now-playing` first and prefer an explicit `--target-device-id` where supported. Voice playback through `muse.music` with `auto` may instead use the calling device's live `music_fulfillment` capability.
6. Every response referencing existing Spotify content must include a Spotify deep link. Use `spotify_url`, or construct `https://open.spotify.com/{type}/{id}` from `spotify_uri`. A Save to Spotify deletion confirmation is the exception: the resource no longer exists, so name the deleted title without exposing its internal ID or constructing a dead link.
7. Reference Spotify by name ("on Spotify" / "via Spotify") whenever you surface content or confirm an action.
8. Flag explicit content: when `is_explicit: true`, show `[E]` next to the title.
9. After a direct `spotify-api` playback change (`play`, `skip`, `previous`, `resume`), follow up with `now-playing` and name the track plus creator; never confirm with only a device name. For `muse.music`, use its result and do not issue a second playback action.
10. A successful playback response means the action took effect. If playback still errors after CLI retries, surface it once in plain user-facing language. If an action is not available, point the user to the Spotify app rather than speculating.
11. If an exact song or album by an artist is missing from search, or a known Spotify item cannot be resolved for playlist or playback actions, do not substitute a cover, tribute, karaoke, or similarly named item. Relay `catalog_fallback.message` verbatim; it already renders the approved Muse copy with Markdown links to the requested content search and the exact artist page. Do not add a cause, preamble, follow-up, or alternative wording; blame the user's account; suggest reconnecting; or claim the item was removed from Spotify.
