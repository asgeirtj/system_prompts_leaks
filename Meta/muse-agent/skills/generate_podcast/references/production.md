# Produce a podcast episode

## Generate the episode

- Choose the host names and synthesis voice IDs with [Cast the hosts](../SKILL.md#cast-the-hosts). In this two-host example, set `HOST_NAME` and `HOST_VOICE_ID` to the main host's name and synthesis voice ID, and `COHOST_NAME` and `COHOST_VOICE_ID` to the co-host's name and synthesis voice ID. Use the same names in the script's speaker labels and the `--speaker` mappings; quote each mapping so names with spaces stay one argument. Voice IDs must be synthesis IDs, not display names, `saved_voice_id` or `profile_id`.

- Run the helper with the script, a title, a description, one `--speaker` per host, a cover prompt and the topics file:

```sh
/opt/muse/skills/generate_podcast/scripts/podcast-helper generate \
  --script /tmp/script.txt \
  --title "How the Tides Work" \
  --description "$HOST_NAME and $COHOST_NAME explain how the moon moves the oceans" \
  --speaker "$HOST_NAME=$HOST_VOICE_ID" \
  --speaker "$COHOST_NAME=$COHOST_VOICE_ID" \
  --cover-prompt "ocean tides under a full moon" \
  --topics-file /tmp/topics.md
```

- For a recurring series, add `--series-id` with the schedule's job ID so its episodes share cover art.

- The helper synthesizes the script, writes `~/workspace/podcasts/<slug>/<slug>.mp3` and records the episode in the catalog. It prints JSON with `slug`, `path`, `duration_secs` and `cover`. When it also published, the JSON adds `feed_url`, `episode_url` and `subscription_links`.

- For a freshly rendered episode, inspect `speakers` for the effective voice IDs and `tts_diagnostics` for substitutions or validation warnings. These TTS fields may be absent when reusing an older episode. If a requested voice became a default, tell the user which voice was used; do not claim the requested voice was honored or change saved preferences.

- Add `--publish` and `--feed-title` only when publishing is authorized, as [publishing and delivery](publishing.md) explains.

- Synthesis follows the conversation's language by default. Pass `--language`, such as `es` or `pt_BR`, only to honor an explicit request, and write the script in that language.

- English sounds best. Other languages can come out rough, so tell the user non-English audio may be imperfect, and try another `--speaker` voice when one sounds wrong for the language.

## Add cover art

- Always pass `--cover-prompt` with a short description of the episode's theme. The helper generates square cover art itself, so do not call `media.generate_image` for a cover.

- With `--series-id`, the first episode generates the cover and later episodes in the series reuse it. Without it, every episode gets its own art.

- Never pass `--cover-image`. Publishing accepts only generated art or the bundled default, so a published episode with `--cover-image` fails. When the user supplies an image, describe it in `--cover-prompt` and tell them you generated a cover from it.

- Without a cover prompt, the helper uses the user's avatar or the bundled default. An avatar cover cannot be published.

## Change a cover

- Regenerate the cover through the helper so the catalog points to a new file:

```sh
/opt/muse/skills/generate_podcast/scripts/podcast-helper update-cover \
  --slug <slug> \
  --cover-prompt "starry night over a mountain lake"
```

- Present the new `cover` path it prints. Never copy, move or rename an image over the old cover path, and never present the old path again, because delivered previews and library rows reference it and clients cache by path.

- In a series, `update-cover` changes only that episode. The show cover, the other episodes and later `--series-id` episodes keep the shared cover.

- An episode that is already published keeps its old art in the public feed, and the result says `already_published`. Publishing it again would duplicate it, so cover changes on a published episode stay local.

## Handle a failed render

- When any part of synthesis fails, the helper stops and returns `ok: false` with the error.

- Most failures are transient. Retry the same command later with the same voices, backing off about 5 minutes, then 10, 30 and 60. Schedule each retry rather than waiting, and tell the user you will deliver the episode once synthesis recovers.

- When the helper returns `generation_trace_id`, pass it as `--retry-generation <generation_trace_id>` on every retry of that generation. Keep that ID across retries; it links the attempts for reliability measurement and does not schedule or perform a retry itself. A new episode or a corrected request starts without this flag.

- If it still fails after the hour-long retry, stop. Cancel the scheduled retry, report the error and suggest trying again later.

- Never swap in a different voice or speech engine to get around a transient failure.

- A `not allowed to use voiceID` error does not clear on retry, because that voice is not permitted. For a newly chosen cast, select another permitted voice from [Podcast preferred voices](podcast_preferred_voices.json), avoiding IDs already assigned to other speakers. Consult the full catalog only for a user-requested voice or voice characteristics, or when the shortlist has run out of distinct voices. If the rejected voice was explicitly requested or belongs to an established series' cast, explain the problem and ask before changing it. Fix an authentication failure or an invalid request rather than retrying it. [The speech reference](/opt/muse/skills/spoken-audio/references/speech.md) explains how to check voice IDs after an opaque HTTP 500.

## Use the other helper commands

- `manifest read` prints the catalog. `episodes` lists each episode with its `slug`, `title`, `path`, `topics`, `cover` and any `feed_url`. `feed` is the show published most recently and `feeds` lists every show.

- `generate-slug --title "<title>"` prints the slug a title produces, which ends with today's date.

- `manifest add-episode` and `manifest update-episode` edit a catalog row by hand. Use them only to repair a record. `generate`, `publish` and `update-cover` keep the catalog consistent on their own.
