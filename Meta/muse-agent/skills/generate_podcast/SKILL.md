---
name: "generate_podcast"
description: "Compose and deliver audio content: a podcast episode, briefing, or narrated summary, with one or more voices, as an MP3. For reading supplied text aloud verbatim, use tts."
metadata: { "includeInPrompt": true }
---

# Generate Podcast

## Purpose
Generate audio content — podcasts, audio briefings, narrated summaries, or any spoken audio. Use this skill for all generated audio, not just podcasts. The `podcast-helper` script handles synthesis, catalog management, cover art generation, and publishing.

## Workflow

### 1. Plan
- **Topic and angle**
- **Speaker names and voices** — **prefer the Meta AI voices by default** (the `MAI_01` and `MAI_03` catalog ids: Warm and Smooth); they are the recommended, production-quality set and the right pick most of the time. Default to Warm (`avocado_v2:MAI_01`) and Smooth (`avocado_v2:MAI_03`). When the topic, tone, or user request steers toward a different catalog voice — an accent, a character fit, or more distinct speakers — it's perfectly fine to pick it from the catalog. The full voice catalog is at `/opt/hatch/skills/voice-selector/voice_source.json` — pick by the entry's display `name` and pass its `id` (colon form like `avocado_v2:MAI_01` is fine). Any number of speakers is supported. ("MAI" is the internal id prefix only — say "Meta AI voices" or display names to the user, never "MAI".)
- **Host names** — give each speaker a real first name (e.g. Alex, Jordan). These are the show's own character names, chosen by you and separate from the voice display names: never label a speaker with a voice name like "Warm" or "Smooth". **Remember the name you give each voice** — record the pairing in `~/MEMORY.md` (e.g. "podcast host Alex = avocado_v2:MAI_01") and, before naming a new host, check there for a name you've already used for that voice. Reuse the same name whenever you use that voice again, so a given voice is always the same character to the user. For a **recurring series**, reuse the same host names and the same voice assignments in every episode so it sounds like the same show — pin them in the cron task body (see Scheduling).
- **Target length** — 5–15 minutes; ~130 words/minute
- **Avoid repeating past episodes** — before settling the topic and angle, run `podcast-helper manifest read` and look at each recent episode's `topics` field (a short summary of what that episode already covered). Steer the new episode toward fresh material or a genuinely new angle rather than re-covering ground. This matters most for a recurring series.

### 2. Write the script
Write the full dialogue. Label each turn with the speaker name followed by a colon:  
```
Alex: Welcome to the podcast. Today we're diving into async Rust.
Jordan: Great topic. Let's start with why async matters.
Alex: The big advantage is zero-cost abstractions...
```

Write the script to a file (e.g. `/tmp/script.txt`).

**The script goes directly to a TTS model — write it in spoken form.** The text will be read aloud exactly as written. Follow these guidelines:

- **Numbers**: write out in full — "one hundred thousand", "forty-two dollars and fifty cents", "three point five percent"
- **Times**: "ten o'clock A M", "three thirty P M", "noon", "midnight"
- **Years**: "twenty twenty-five", "nineteen ninety-nine"
- **Abbreviations**: spell out — "U S A", "A P I" (pronounceable acronyms like "NASA" can stay)
- **URLs**: simplify — "example dot com link" instead of raw URLs
- **Email**: "john at company dot com"
- **Lists/data**: convert to natural sentences, limit to top 3–5 items
- **Punctuation**: use commas for natural pauses. If a sentence runs long, split it into two *complete* sentences — do not clip it into fragments.
- **Never include**: stage directions like `(pause)`, sound effects, markup, emoji, citation numbers like `[1]`, math symbols, or visual separators like `---`

**Write complete, conversational sentences — not headlines.** Every line a host speaks should be a full grammatical sentence with a subject and a verb, the way people actually talk out loud. Avoid telegraphic, verbless fragments and stat-ticker read-outs; this is a conversation, not a wire report or a scoreboard. An occasional short line for emphasis ("Unbelievable.") is fine, but never string clipped fragments together.

- Avoid: `Second assist of the night for Messi. Two one Argentina. Full time. Heartbreak for England.`
- Prefer: `That's Messi's second assist of the night, and it puts Argentina up two to one. When the whistle went, it was heartbreak for England.`

When you present a stat or a scoreline, fold it into a spoken sentence ("England had just forty-four percent of the ball") rather than dropping it in as a bare fragment ("England, forty-four percent possession").

### 3. Generate

**Write a topics summary for dedup.** Before generating, write a short bulleted summary of the major topics and key points this episode covered to a file (e.g. `/tmp/topics.md`) and pass it with `--topics-file`. Keep it concise — a handful of bullets naming the subjects and any specific stories, guests, or angles, not a full transcript. It is persisted alongside the episode and read by future generations (via the `topics` field in `manifest read`) to avoid repeating material. Example:  
```
- Async Rust fundamentals: futures, executors, zero-cost abstractions
- Tokio vs async-std tradeoffs
- Common pitfalls: blocking in async contexts, .await forgetting
```

**Default: generate only, do not publish.** Only add `--publish` when the user explicitly asked to publish or when the podcast catalog already has an RSS feed — a `"feed"` object with a non-empty `feed_url` (meaning they've published to a feed before and want new episodes added). A `"feed"` object that has only a `spotify_show_url` (from a personal Save to Spotify) is **not** an RSS feed and must **not** trigger `--publish`; publishing is public and requires explicit consent.

Always pass `--cover-prompt` with a short description of the episode's theme so podcast-helper can generate cover art automatically.

**Do not pass `--cover-image`.** Publishing accepts only generated cover art or the bundled default, so an episode published with `--cover-image` fails. Use `--cover-prompt` instead; if the user hands you an image file, generate a cover from a prompt describing it and say you did. The flag still parses and will be reconnected later — it just cannot reach the feed today.

**Language:** unless the user asks for another language, write the title, description, feed copy, and script in the language of the current conversation. `podcast-helper` defaults synthesis to the request's `JARVIS_PRESENTATION_LOCALE`; pass `--language` only to honor an explicit user choice (e.g. `--language es`, `--language pt`, or a locale like `pt_BR`). Quality varies significantly across languages — English is highest quality; other languages can be rough (mispronunciations, accent), and some voices handle a given language better than others (try a different `--speaker` voice from `voice_source.json` if one sounds wrong). Tell the user non-English audio may be imperfect. See the `tts` skill's Language section for details.

**One-off episode:**  
```sh
podcast-helper generate \
  --script /tmp/script.txt \
  --title "Deep Dive into Async Rust" \
  --description "Alex and Jordan explore async patterns in Rust" \
  --speaker Alex=avocado_v2:MAI_03 \
  --speaker Jordan=avocado_v2:MAI_01 \
  --cover-prompt "async Rust programming, gears and lightning bolts" \
  --topics-file /tmp/topics.md
```

**Cron/recurring episode** — pass `--series-id` matching the cron job ID so episodes in the same series share cover art:  
```sh
podcast-helper generate \
  --script /tmp/script.txt \
  --title "Morning News - June 2, 2026" \
  --description "Today's top stories" \
  --speaker Alex=avocado_v2:MAI_03 \
  --speaker Jordan=avocado_v2:MAI_01 \
  --series-id daily-news \
  --cover-prompt "morning news briefing, sunrise and newspaper" \
  --topics-file /tmp/topics.md
```

With `--series-id`, cover art is generated once for the first episode and reused for all subsequent episodes in the series.

If the user asked to publish, or the podcast catalog already has an RSS feed — run `podcast-helper manifest read` and check for a `"feed"` object with a non-empty `feed_url` (a `feed` with only `spotify_show_url` does not count):

```sh
podcast-helper generate \
  --script /tmp/script.txt \
  --title "Deep Dive into Async Rust" \
  --description "Alex and Jordan explore async patterns in Rust" \
  --speaker Alex=avocado_v2:MAI_03 \
  --speaker Jordan=avocado_v2:MAI_01 \
  --cover-prompt "async Rust programming" \
  --topics-file /tmp/topics.md \
  --publish --feed-title "Daily with Alex"
```

Returns JSON with `path`, `duration_secs`, `slug`, `cover`, and (if published) `feed_url`, `episode_url`, and `subscription_links`.

### 4. Deliver to chat
Always present the title as plain text above the playable link:  
```
{title}
[{title}](sandbox://workspace/podcasts/{slug}/{slug}.mp3)
```

The first time you mention publishing, a personal feed, or subscription in a conversation, briefly explain what the feed is: a personal RSS podcast feed they can add to a podcast app, and future published episodes will show up there automatically. After that first explanation, use shorter wording.

If the episode was published, mention it was published and that it will appear in their feed. Note that published episodes are public. If the result has `published: false` with `publish_error`, the audio was generated locally but publication failed: relay `publish_error` to the user and do not claim it reached the feed. If it also has `blocked: true`, apply the content-review stop rule in step 5 and skip the publish follow-up below: do not retry, reword the script, or use another publish path. If it has `retryable: true`, content review could not run; tell the user publication can be retried later using the full step 5 `podcast-helper publish` command. Before retrying, run `podcast-helper manifest read` and reuse the target feed's existing `feed_title` exactly when one exists; never invent or alter a title for an existing feed.

After delivering, present applicable follow-ups:
1. **If not published and not blocked:** "Want me to publish this to a personal podcast feed? It's an RSS feed you can add to Apple Podcasts, Overcast, Pocket Casts, or most other podcast players, and future published episodes will show up there automatically. Note: published episodes are public — anyone with the link can listen."
2. **If no cron job exists:** "Generate a new episode every day?"

### 5. Publish (if not done in step 3)

```sh
podcast-helper publish \
  --slug {slug} \
  --feed-title "Daily with Alex" \
  --feed-description "Daily news and tech updates"
```

Returns JSON with `feed_url`, `episode_url`, and `subscription_links`.

Public publishing is content-reviewed. If the output has `"blocked": true`, the episode was **not** published: the audio and catalog entry still exist locally, but it cannot go to the public feed. Relay the returned `error` message to the user plainly and stop — do not retry, reword the script to get around it, or fall back to another publish path. Saving to the user's own Spotify show is unaffected by this review.

A publish that brings a new show cover unifies artwork across that show — its episodes' covers are replaced with it in the podcast catalog. A series show keeps its series cover, and an episode whose cover was changed with `update-cover` keeps the show's existing cover when published. Another feed's episodes keep their own artwork.

After publishing, always re-present the listen link and confirm publication:  
```
{title}
[{title}](sandbox://workspace/podcasts/{slug}/{slug}.mp3)

Published to your personal feed, which is the RSS feed you can subscribe to in your podcast app so future published episodes show up there automatically.
Published episodes are public — anyone with the feed link can listen.
```

### 6. Subscribe (after publishing)
On the first episode published to a feed, present subscription links from the output JSON:

```
Subscribe to your personal feed:

RSS feed URL (copy and paste into any podcast player):
`{subscription_links.rss}`

Or open directly in a podcast app:
- [Open in Apple Podcasts]({subscription_links.apple_podcasts})
- [Open in Overcast]({subscription_links.overcast})
- [Open in Pocket Casts]({subscription_links.pocket_casts})

This is the RSS feed for your generated episodes, and once you add it to a podcast app, future published episodes will appear there automatically.
```


**Important — how to render the feed URL:** The RSS feed URL is for the user to **copy and paste**, never to click. Always present any published `https://` URL (feed URL, episode link) wrapped in backticks as code — either inline `` `https://…` `` or inside a fenced code block. Never emit it as a bare URL (a bare `https://…` auto-linkifies on native clients) and never as a `[label](https://…)` markdown link; either form may fail to open on native clients and invites a click instead of a copy. Do not offer direct episode download links. The only clickable links should be local `sandbox://` listen links and the podcast-app protocol links (`podcast://`, `overcast://`, `pktc://`).

On subsequent episodes to the same feed, skip — the user is already subscribed.

## Feed Organization

**Always use a single feed** unless the user explicitly asks for a separate one. Before publishing, run `podcast-helper manifest read`. `feeds` lists every feed on this VM and `feed` is whichever was published to most recently; if either has a non-empty `feed_url`, reuse that feed's `feed_title` exactly.

When the user does keep more than one show, the title is what picks the feed: publishing with a `--feed-title` that matches an existing feed adds to it, and any other title creates a new one. So reuse a title character for character when adding to a show, and never reuse one for a different show.

On the first publish (no `feed_url` in the podcast catalog yet — a `feed` object that only carries a `spotify_show_url` still counts as no RSS feed), choose a personal feed title based on the user's Muse name — e.g. "Today with Alex", "News with Alex".

## Add to your Spotify (personal, optional)
When the user explicitly asks to put a generated episode on their Spotify, use
`podcast-helper save-to-spotify` to add it to the user's **own** Spotify account. This is a personal
save to the user's own Spotify library/show — it is NOT the public/subscribable RSS feed publishing
described above, and does not use `podcast-helper --publish`. Only do this on an explicit request; do
not offer it proactively.

Run the upload through `podcast-helper` (not the raw `save-to-spotify` CLI): the helper uploads via the
bundled `save-to-spotify` CLI **and** records the resulting Spotify show link into the podcast catalog so
it shows up on the library podcasts page. See `references/save-to-spotify.md` for the underlying CLI,
the connect flow, and rules.

1. **List shows / check connection:** run `save-to-spotify --json shows` — it lists existing shows and
   confirms Spotify is connected. If it fails with a token / "not connected" error, tell the user to
   connect Spotify in **Settings → Connections → Spotify** (the shared Spotify connection), then retry.
   This tool has no `auth` subcommands or connect link. Ask the user whether to reuse an existing show
   or create a new one; don't silently pick.
2. **Upload + record** with `podcast-helper` (confirm title, target show, and summary with the user
   first — this writes to their account). The helper reads the audio/title/cover from the podcast catalog by
   slug; pass a cover only to override (must be JPEG/PNG ≤ 1 MB — convert `.webp`/other formats first):  
   ```sh
   podcast-helper save-to-spotify \
     --slug {slug} \
     [--show-id <id> | --new-show "<show title>"] \
     [--title "{title}"] [--summary "{description}"] [--image {cover}]
   ```
   Returns JSON with `episode_id`, `episode_uri`, `spotify_show_id`, and `spotify_show_url`.
3. **Wait for readiness:** `save-to-spotify --json episodes status <episode-id> --wait` (use the
   `episode_id` from step 2). Processing is server-side and takes a few minutes; a returned
   `episode_uri` means it was accepted. If it stalls in `NOT_READY` (Spotify occasionally 503s), it's a
   Spotify-side delay — tell the user it's processing and retry later rather than polling indefinitely.
4. Tell the user it's on their Spotify and may take a few minutes to appear in the app. Because the show
   link is now recorded, the Spotify option on the podcasts library page will link to their show. Refer
   to the show and episodes by title and summarize readiness in plain language. Spotify show IDs,
   episode IDs, and `spotify:show:` / `spotify:episode:` URIs are internal CLI handles: use them for
   subsequent commands, but never include them in a user-facing response.

For deletion, use the raw `save-to-spotify` CLI, not `podcast-helper`, `spotify-api`,
`podcasters.spotify.com`, or `creators.spotify.com`. Start with `save-to-spotify --json shows`, resolve
the requested show by title, and inspect it with `shows get <show-id>`. Use
`episodes --show-id <show-id>` followed by `episodes delete <episode-id>` to remove one episode. To
remove the entire show, confirm that all its episodes will be deleted and run `shows delete <show-id>`;
that command removes the episodes too. Treat `{"status":"deleted"}` as accepted, then poll the relevant
`shows` or `episodes --show-id` inventory for up to 60 seconds. Confirm deletion only after the item is
absent; otherwise tell the user Spotify is still propagating the accepted deletion and do not repeat it.
Deleting the Spotify copy does not delete local audio or an RSS feed. See
`references/save-to-spotify.md` for the full command flow.

## Cover Art

Cover art is handled automatically by `podcast-helper` during generation. You control it with two flags:

- **`--cover-prompt`** — a short description of the episode theme (e.g. "morning news briefing, sunrise and cityscape"). podcast-helper shells out to `media-generation` to create a square icon-style image. Always provide this.
- **`--series-id`** — groups episodes that share the same cover art. Use the cron job ID for recurring episodes. Without this, each episode gets unique art.

**How artwork flows:**

| Scenario | Behavior |
|----------|----------|
| One-off episode | Unique cover generated per episode from `--cover-prompt` |
| Recurring/cron episode | First episode generates cover; subsequent episodes with same `--series-id` reuse it |
| Published episode | A new show cover replaces that feed's episode covers; a series show, or an episode changed with `update-cover`, keeps the show's cover |

**Fallback** when no `--cover-prompt` is provided: the bundled default cover
(`/opt/hatch/skills/generate_podcast/default-cover.jpg`). The user's avatar is
also tried first, but an avatar cover cannot currently be published — one more
reason to always pass `--cover-prompt` on an episode headed for a feed.

You do NOT need to call `media.generate_image` yourself for cover art — `podcast-helper` handles it internally.

`--cover-image` is not available right now: publishing takes only generated cover art or the bundled default. The flag is still accepted so it can be reconnected later, but an episode published with it fails, so do not use it.

### Changing the cover

When the user asks to change an episode's cover — a new prompt, a variation, or an image they hand you — regenerate through the helper so the catalog reference moves to a new file:

```sh
podcast-helper update-cover \
  --slug {slug} \
  --cover-prompt "starry night sky over a mountain lake"
```

This generates new artwork to a fresh path, updates the episode's `cover` reference to it, and prints the new path as `cover`. Present that new path in chat.

Hard rules:

- **Never overwrite the current cover file.** Do not `cp`, move, or rename a new image over the old cover path, do not call `media.generate_image` for covers, and do not present the old path again after changing its bytes. Already-delivered previews and library rows reference the old file by path, and clients cache by path — rewriting its bytes silently changes what was already shown (or shows stale art), which is the failure this flow exists to prevent.
- **A user-supplied image is a prompt, not a file.** Describe it in `--cover-prompt` and generate (the same rule as `--cover-image` at generation time); publishing still takes only generated art.
- **Series episodes diverge.** `update-cover` changes only that episode in the local catalog; the show cover, the other episodes, and future `--series-id` generations keep the shared series cover. Publishing the edited episode keeps the show's cover too, and the public feed shows that cover (a feed has one cover).
- **Published feeds keep the previous art, and publish refuses repeats.** `podcast-helper publish` refuses an already-published episode, because publishing appends a NEW episode entry (duplicating the episode in every subscriber's feed) while the catalog row forgets the original. So there is no publish path that pushes a cover change: a cover-only refresh does not exist yet, and cover edits on published shows stay local to the catalog and chat.

## Scheduling
When a user asks for a recurring podcast, audio briefing, or scheduled audio content:

1. **Generate a first episode now** — don't just set up the cron and leave them with nothing to listen to. Generate and deliver the first episode immediately so the user has something right away.
2. **Ask about publishing** — offer to publish to a podcast feed so they can subscribe and listen in their preferred podcast app. If they agree, publish the first episode and present subscription links.
3. **Then create the cron job** — set up the recurring schedule.

For recurring podcasts, create a cron job using the `cron` tool. **Always set `timeout_secs: 1800`**.

Example `cron` tool call:  
```json
{
  "action": "add",
  "file_name": "daily-podcast__daily@13:00:00.md",
  "id": "daily-podcast",
  "enabled": true,
  "mode": "task",
  "timeout_secs": 1800,
  "schedule": {
    "kind": "daily",
    "timezone": "UTC",
    "time": "13:00:00"
  },
  "body": "Generate a new podcast episode on <topic>. Follow the generate_podcast skill workflow. Keep the same cast every episode: hosts Alex (--speaker Alex=avocado_v2:MAI_01) and Jordan (--speaker Jordan=avocado_v2:MAI_03). Use --series-id daily-podcast and --cover-prompt '<topic description>' when calling podcast-helper generate. Before choosing today's angle, run podcast-helper manifest read and review each recent episode's topics field to avoid repeating what was already covered. Write a short topics summary to /tmp/topics.md and pass it with --topics-file so future episodes can dedup against it. Publish to the feed after generating."
}
```

Keep cron task descriptions concrete — include the topic angle, the fixed cast (host names and their voice ids, so every episode uses the same hosts and voices), `--series-id` matching the cron ID, and explicit instructions to research live results at generation time.

## Utility Commands

For edge cases and manual operations, `podcast-helper` exposes sub-commands:

- `podcast-helper manifest read` — print the current podcast catalog
- `podcast-helper manifest add-episode --slug ... --title ... --duration-secs ... --path ... --chunk-count ...` — add episode
- `podcast-helper manifest update-episode --slug ... [--episode-url ...] [--feed-url ...]` — update episode
- `podcast-helper update-cover --slug ... --cover-prompt ...` — replace an episode's cover with newly generated art (updates the reference; never overwrites the old file)
- `podcast-helper generate-slug --title "..."` — generate a kebab-case slug with today's date

## Listening to Existing Episodes
If the user asks to listen to a podcast, hear their podcast, or asks about their episodes, read the podcast catalog with `podcast-helper manifest read` and present listen links for the relevant episodes:

`[{title}](sandbox://workspace/podcasts/{slug}/{slug}.mp3)`

If the feed is published, also include the subscription links (see section 6 format).

## Operating Rules
1. Use voices from `/opt/hatch/skills/voice-selector/voice_source.json`, referenced by their catalog `id`. Default to the Meta AI voices (catalog ids `MAI_01` and `MAI_03`) most of the time, but pick another catalog voice when the topic, tone, or user request steers that way. Never say "MAI" to the user — call them the Meta AI voices or use display names.
2. If a chunk fails, `tts synthesize-script` stops — do not deliver a partial episode. Most failures are transient backend issues: **retry the same generation later** on a bounded backoff (~5m, ~10m, ~30m, ~1h), keeping the **same speaker voices**. Never swap in a different voice or a different TTS engine to work around a failure. Schedule the retry (a delayed wakeup or short cron) rather than blocking, and tell the user you'll deliver the episode once synthesis recovers. **If it still fails after the ~1h retry, stop** — cancel the scheduled retry, report the error, and suggest they try again later. (A `... not allowed to use voiceID ...` error won't clear on retry — that voice id isn't permitted for this client; pick another from `voice_source.json` and regenerate. Auth or clear request errors likewise need a fix, not a retry.)
3. On first episode in a new feed, help the user subscribe. On subsequent episodes, skip.
4. **Cron runs:** Follow whatever the cron task description says. If it says to publish, publish without confirmation.
5. **Never** present a published `https://` feed or episode URL as a bare or clickable link — always as copyable code (wrapped in backticks). Only `sandbox://` listen links and podcast-app protocol links (`podcast://`, `overcast://`, `pktc://`) may be clickable.
