# Source and timing

Run `/opt/hatch/skills/magic-moment/mm transcribe <video> --run <unique-name>`. Keep its source digest, duration, original ASR text, and word timestamps in `~/workspace/.output/<unique-name>/mm_transcript.json`. Use a new run for different footage. Do not edit the ASR file. Supply user corrections through the screenplay's `transcript_correction` object described in `/opt/hatch/skills/magic-moment/guide/story_and_canon.md`.

Anchor each beat to the narrated claim it depicts. Use word timestamps when the wording is unchanged. Inspect the source to time corrected text; do not reuse the old ASR words as if they aligned with the correction. Do not show a result before the narration reaches it.

Use finite nonnegative seconds for `start` and `end`. End each content beat within the measured source duration. The renderer preserves the source and appends the Muse close after the footage ends. The close lasts through the full logo animation and one avatar reaction, then holds the final frame briefly. Do not cut off the speaker's conclusion to make room for the close. Do not promise a thirty-second result from longer footage without a separate user-requested edit.

Treat `end` as the end of the beat's active hold and animation. Content remains in the thread after `end`; later entries push it backward along the arc, shrinking it and increasing its transparency. Typing indicators disappear at `end`. Coverage measures active intervals; it is informational and is not a reason to add filler. Inspect actual visible holds in the rendered video.

Allow a visual at least 0.8 seconds after the preceding beat. Answer a typing indicator with its supported Muse bubble. Keep at most three active beats at once. Inspect every tap transition: no new beat may enter during a tap. Validation resolves eligible image, video, and browser taps before applying this rule; use `tap: false` to opt out.
