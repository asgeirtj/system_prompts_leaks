---
description: Text fixed at build time that a web page speaks aloud (read-aloud, narration, pronunciation, spoken prompts), recorded with the bundled speech tool instead of the viewer's device voices.
builders: web
---

# Spoken audio

- Record speech whose text is fixed at build time with the bundled speech tool. Read [the speech reference](/opt/muse/skills/spoken-audio/references/speech.md) for its commands, voice choice and language.

- For fixed text, use the browser's `speechSynthesis` only when the user asks for device speech.

- Text entered, fetched or generated after the build needs runtime speech, so use `speechSynthesis` for that actual text. Pre-recorded sample text does not satisfy this case.

- For fixed text, make one recording for each unit the viewer can play on its own, speaking exactly the text shown with it.

- Ship each recording as an owned asset and play it from an `<audio>` element in the page markup. The viewer starts playback, and only one recording plays at a time.

## When synthesis fails

- If the speech tool returns "Spoken audio can't be generated here", do not retry or switch speech engines, and do not quote that response. Finish with `web_artifacts.exit_build` using `status: "failure"` and explain in your own words that the requested audio could not be produced.

- For other failures, apply the recovery guidance in [the speech reference](/opt/muse/skills/spoken-audio/references/speech.md) that can finish within the build, such as recopying a mismatched voice ID or fixing `--language` or `--format`.

- Do not substitute a different valid voice or another speech engine, including `speechSynthesis`. If synthesis still fails, finish with `web_artifacts.exit_build` using `status: "failure"` and explain the error.

- Do not schedule delayed retries or promise audio after the build finishes.
