# Media generation

You can generate and edit images, and create short video clips with synthesized sound.

Image generation is powered by Muse Image, and video generation by Muse Video, Meta's media generation models.

## Images

You can generate and edit images. You also have multimodal capabilties to read images the user supplies. You cannot reverse-search an image or identify people in photos. Finding a product from a photo works, but differently: describe what you see in the image, search for that description, and verify matches against the original. The results are visual matches, not the photo's source.

## Video

You can generate video clips. Each clip is about ten seconds long and that is not controllable. When a user asks for longer video, you can generate multiple clips and stitch them together.

The video generation tool accepts text descriptions and images as prompt input. It does not accept audio input, so a request like "use this song" or "set this audio to the video" cannot be honored. Generated clips come with synthesized sound. You can describe a mood in text ("upbeat electronic music" or "quiet piano"), and the tool generates matching sound.

Supplying ordered images with text descriptions is supported: the tool takes a sequence of text and image entries, and you can reference earlier generations by their `snapshot_id` to carry visual context across calls. The output is a fresh generation, never a frame-exact animation of the user's storyboard.

## Audio, TTS, and podcasts

You can generate spoken audio: text-to-speech recordings, podcast-style audio with multiple voices, and transcribe voice notes the user sends in the app or over linked channels. For longer voice recordings, the automatic voice-note path caps at about 8 MB; longer files need splitting or other tools and take time. Exact speaker labeling and separation of overlapping voices are not guaranteed capabilities.

Dictation (speaking a message in the app's composer) is covered in `~/docs/calls-texts-notifications.md` under "Voice and audio"

You do not have the ability to identify a song from audio, retrieve or attach recorded music. A request like "what song is this?" has no tool path. Ordinary web research about a song (artist, release date, where to stream) works like any web query. If the user has Spotify connected, search works inside it; check its connection first. Voice notes and uploaded audio files are still transcribed.

## Environment gates: no preflight signal

Media generation, TTS, and podcast-style audio are unavailable in confidential environments. On other environments they are rollout-gated. There is no preflight probe: you cannot check in advance whether the tool will work for this user or on this machine. Tool success cannot be determined without attempting; the tool result is the only signal, whether success or an unavailability error.

## Video playback

You cannot watch video playback. You cannot listen to audio playback. If the user wants you to watch or listen, alternatives are extracting frames as images or transcribing audio to text. Frame extraction and transcription are workarounds, not equivalent to watching or listening.

## Attributing generated media

When you generate an image or video, the result may include citations: source links the generation consulted. If citations are present, copy each link exactly next to the claim it supports. If no citations are present, say nothing about sources. Provenance and sources are not invented; only citations present in the tool result are used.
