---
name: gemini-omni-flash-api
description: Use this skill for generative video editing, text-to-video, image- and video-referenced video generation, first-frame-to-video, first-and-last-frame transitions, and video extensions using Gemini Omni 1.2 Flash (gemini-omni-1.2-flash) via the official google-genai SDK. Includes workflows for pre-processing/optimizing high-resolution or long source videos with ffmpeg, stripping audio for full sound regeneration, and handling turn-by-turn video editing and parallel execution.
---

# Gemini Omni Flash Skill

This skill uses the Gemini Omni 1.2 Flash model (`gemini-omni-1.2-flash`) to perform text-to-video generation, image-to-video generation (first-frame and two-frame keyframe transitions), reference-to-video (R2V) generation, video extensions (3s–10s per turn, up to 30s total), and video editing.

> [!WARNING]  
> **Important Regional Restrictions**: Uploading videos to use for video edits, extensions, or references is **NOT** available in the EEA, Switzerland, the United Kingdom, and some US states. If a video-to-video edit completes quickly with empty outputs (`total_output_tokens: 0` or no video content), it is likely due to this restriction.

## Core capabilities

1. **Text to video**: Generating videos (`3s`–`15s`, default `10s`) from a text prompt.
2. **First frame to video**: Generating videos (`3s`–`15s`, default `10s`) from a starting image (`--first-frame`).
3. **First and last frame transition**: Generating videos (`3s`–`10s`) interpolating between a starting image and a final image (`--first-frame` and `--last-frame`; note: `--last-frame` must be used with `--first-frame`).
4. **Video extensions**: Extending existing videos by `3` to `10` seconds per turn (`10s` default), up to a cumulative length of `30` seconds (`--extend` or `--previous-interaction-id`).
5. **Video editing and refinement**: Editing existing videos (uploaded or model-generated source video up to `15` seconds), applying stylistic changes, or performing object addition/removal while keeping everything else consistent.
6. **Reference-to-video (R2V) & image-guided editing/extension**: Guiding new video generation (`3s`–`15s`) with reference images (`--image`, up to 6, including `15s` clips) or reference videos (`--video-reference`, up to 3 for `3s`–`10s` clips and max 1 for `11s`–`15s` clips). **Reference images** (`--image`) also work during **video editing** and **prompt-based video extension**, whereas **only reference videos** (`--video-reference`) are restricted to new video generation.

## Workflow

1. **Analyze request**: Determine the target workflow (text-to-video, first-frame-to-video, two-frame keyframe transition, video extension, video editing, or reference-to-video generation) and inspect any input media assets.
2. **Run SDK scripts**:

   * Directly run the appropriate utility (`scripts/video/generate_video.py` or `scripts/upload_file.py`).
   * Configure settings like `--aspect-ratio` (`16:9` default, `9:16`), `--resolution` (`360p`, `720p` default, `1080p`, `4k`), and `--duration` (integer from `3` to `15` seconds, default `10`; `3` to `10` seconds when combining `--first-frame` and `--last-frame` or extending). *Note: `4k` requests take longer to generate.*

3. **Retrieve and process output**: Outputs are saved to the local filesystem (e.g. `media/`). Report back the completed media path to the user.

## Reference Documentation

* **Video Generation & Editing (Omni Flash)**: Full parameter reference, duration limits, and prompting patterns at [aistudio.google.com/docs/omni.md](https://aistudio.google.com/docs/omni.md).
* **Interactions API**: All operations and state management for `gemini-omni-1.2-flash` use the [Interactions API](https://aistudio.google.com/docs/interactions-overview.md).
* **Files API**: Input media files (reference images and videos) are uploaded via the [Files API](https://aistudio.google.com/docs/files.md) and polled until `ACTIVE` before passing their URI and MIME type in `interactions.create`.
* **[Gemini API Skill Reference](https://github.com/google-gemini/gemini-skills/blob/main/skills/gemini-api-dev/SKILL.md)**: Platform-wide guidelines, current model specifications, and SDK usage rules for the Gemini API.

## Dependencies and Prerequisites

* **Python SDK (`google-genai`)**: Requires `google-genai >= 2.30.1` (Python) to support the current `interactions` steps schema, output helpers (`interaction.output_video`), and full video output resolution configuration (`360p`, `720p`, `1080p`, `4k`). Install or upgrade using:
  ```bash
  pip install -U google-genai
  ```
* **Python Runtime**: Requires **Python >= 3.10** (for compatibility with modern `google-genai` SDK types and methods).
* **ffmpeg & ffprobe**: `prep_video.py`, `inspect_video.py`, and `generate_video.py` (when stripping audio via `--strip-audio`) require `ffmpeg` and `ffprobe` binaries installed and available in your system `PATH`.
* **API Key**: Set the `GEMINI_API_KEY` environment variable:
  ```bash
  export GEMINI_API_KEY="your-api-key"
  ```

## Available scripts

Use the following Python scripts to upload media with the Files API, prepare input videos with ffmpeg, and generate video outputs using the Interactions API.

1. **[upload_file.py](scripts/upload_file.py)**: Uploads local media (images and videos) to the Files API and polls until `ACTIVE`. If uploading a video larger than 25MB, it prints an informative warning/tip highlighting that Gemini Omni Flash is optimized for editing 10s source videos at 720p/24fps, and recommends pre-processing with `prep_video.py` first to speed up the upload.

   ```bash
   ./scripts/upload_file.py path/to/image.png
   ```

2. **[generate_video.py](scripts/video/generate_video.py)**: Performs end-to-end video generation and downloads the output video. It detects and uploads local media references (images or videos) before calling the Interactions API.

   * **Text to video (3s–15s, default 10s)**:

     ```bash
     ./scripts/video/generate_video.py "A close-up of a cat drinking tea" --duration 12 --output media/cat_tea.mp4
     ```

   * **Output resolution options (`--resolution`)**:

     Gemini Omni 1.2 Flash natively supports four output resolutions across both landscape (`16:9`) and portrait (`9:16`) aspect ratios:
     - `360p`: `640x360` (16:9) or `360x640` (9:16)
     - `720p`: `1280x720` (16:9) or `720x1280` (9:16) — *(default)*
     - `1080p`: `1920x1080` (16:9) or `1080x1920` (9:16)
     - `4k`: `3840x2160` (16:9) or `2160x3840` (9:16)

     ```bash
     # High-definition (1080p)
     ./scripts/video/generate_video.py "A cinematic drone shot over misty mountains at sunrise" --resolution 1080p --output media/mountains_1080p.mp4

     # Ultra-high-definition 4K (Note: 4K requests take longer to generate; pass --timeout if needed)
     ./scripts/video/generate_video.py "A macro shot of a dewdrop on a flower petal in golden sunlight" --resolution 4k --timeout 900 --output media/flower_4k.mp4
     ```

   * **Configurable request timeouts (`--timeout`)**:

     Default HTTP timeout is `600` seconds (10 minutes). For computationally intensive requests — such as generating 15s 4K clips or extending a clip up to the maximum 30s total length — generation can take several minutes. Use `--timeout 900` (or `1200`) to provide an extended execution budget.

   * **First frame to video (`3s`–`15s`)**:

     ```bash
     ./scripts/video/generate_video.py "The waves crash against the shore." --first-frame start.png --duration 12 --output media/waves.mp4
     ```

   * **First and last frame transition (`3s`–`10s` max)**:

     Provide a starting frame and an ending frame to generate a smooth transition between them (`--last-frame` **must** be used together with `--first-frame`, and two-frame keyframe interpolation is capped at `10` seconds):

     ```bash
     ./scripts/video/generate_video.py "A smooth timelapse from sunrise to sunset" --first-frame start.png --last-frame end.png --duration 10 --output media/interpolation.mp4
     ```

   * **Looping video (identical start and end frame, `3s`–`10s`)**:

     ```bash
     ./scripts/video/generate_video.py "A crystal orb spinning continuously in place" --first-frame orb.png --last-frame orb.png --output media/loop.mp4
     ```

   * **Image-referenced video generation (R2V)**:

     Describe how the uploaded reference image(s) should guide the generation in natural language:

     ```bash
     ./scripts/video/generate_video.py "A cybernetic warrior walking through a rain-soaked street in the painterly style of the reference image" --image reference.png --output media/warrior.mp4
     ```

   * **Video-referenced video generation**:

     Provide reference video(s) (`--video-reference` / `-vr`) when generating a **new** video to guide character appearance, object details, or camera/motion style (ideal reference clip duration is ~3s; up to 3 reference videos for `3s`–`10s` clips, and at most **1** reference video for `11s`–`15s` clips; unlike `--image`, `--video-reference` cannot be used for video editing or extension):

     ```bash
     ./scripts/video/generate_video.py "A cellist performing on stage with the expressive camera movement and lighting style of the reference video" --video-reference ref_camera.mp4 --output media/cello.mp4
     ```

   * **Video extension (`3s`–`10s` per turn, up to `30s` total)**:

     ```bash
     ./scripts/video/generate_video.py "The scene continues as the sun sets below the horizon" --extend media/sunset.mp4 --duration 10 --output media/sunset_extended.mp4
     ```

   * **Video extension with reference images**:

     Prompt-based extension (omitting `--task`) supports passing **reference images** (`--image`, up to 6 images) to introduce new characters, objects, or styles into the extended scene (only reference videos `--video-reference` are restricted to new video generation):

     ```bash
     ./scripts/video/generate_video.py "Extend this video: the character shown in the reference image walks into the frame and waves." --extend media/sunset.mp4 --image character.png --output media/sunset_extended_with_ref.mp4
     ```

   * **Video editing (keep original audio, optionally with reference images)**:

     ```bash
     ./scripts/video/generate_video.py "Transform the style to Japanese anime. Keep everything else the same." --video input.mp4 --output media/anime_style.mp4

     # Guide an edit with a reference image (--image works for editing too; only --video-reference is restricted):
     ./scripts/video/generate_video.py "Replace the coat with the red coat from the reference image. Keep everything else the same." --video input.mp4 --image red_coat.png --output media/coat_swap.mp4
     ```

   * **Video editing (regenerate all audio from scratch)**:

     ```bash
     ./scripts/video/generate_video.py "Transform the style to Japanese anime" --video input.mp4 --strip-audio --output media/anime_style_new_audio.mp4
     ```

   * **Turn-by-turn video editing (edit previous interaction)**:

     Edit a prior video generation without re-uploading assets by passing the interaction ID:

     ```bash
     ./scripts/video/generate_video.py "Change the setting to a snowy winter wonderland. Keep everything else the same." --previous-interaction-id "v1_..." --output media/winter_wonderland.mp4
     ```

   * **Turn-by-turn video extension (extend previous interaction)**:

     Extend a prior video generation by `3s`–`10s` by passing the previous interaction ID:

     ```bash
     ./scripts/video/generate_video.py "Extend this video. The character turns around and begins to run." --previous-interaction-id "v1_..." --duration 10 --output media/extended_turn.mp4
     ```

   * **Parallel batch execution (prompts file)**: Run multiple prompts from a line-by-line text file concurrently:

     ```bash
     ./scripts/video/generate_video.py --prompts-file prompts.txt --concurrency 3
     ```

   * **Parallel batch execution (JSON config)**: Execute fully configured, distinct generation and editing jobs in parallel:

     ```bash
     ./scripts/video/generate_video.py --batch jobs.json --concurrency 3
     ```

     *Example `jobs.json`:*

     ```json
     [
       {
         "prompt": "A smooth timelapse from sunrise to sunset.",
         "first_frame": "start.png",
         "last_frame": "end.png",
         "duration": 10,
         "resolution": "1080p",
         "output": "media/interpolation.mp4"
       },
       {
         "prompt": "Extend this video: the character shown in the reference image enters the scene.",
         "extend": "media/sunset.mp4",
         "image": "character.png",
         "duration": 10,
         "output": "media/extended_with_image_ref.mp4"
       },
       {
         "prompt": "A macro shot of a crystal orb refracting cosmic nebula colors.",
         "duration": 15,
         "resolution": "4k",
         "output": "media/nebula_orb_4k.mp4"
       },
       {
         "prompt": "A musician playing cello with the camera motion of the reference video.",
         "video_reference": "cello_ref.mp4",
         "output": "media/cello.mp4"
       },
       {
         "prompt": "Transform the style to Japanese anime. Keep everything else the same.",
         "video": "input.mp4",
         "output": "media/anime_style.mp4",
         "strip_audio": false,
         "aspect_ratio": "16:9"
       }
     ]
     ```

3. **[inspect_video.py](scripts/video/inspect_video.py)**: Inspects a local video file (using `ffprobe`) to check its duration, resolution, frame rate (FPS), audio stream presence, and format details.

   ```bash
   ./scripts/video/inspect_video.py media/output.mp4
   ```

   * To get a pre-parsed, structured JSON summary:

     ```bash
     ./scripts/video/inspect_video.py media/output.mp4 --json
     ```

   * To get the complete, unmodified `ffprobe` raw JSON dump:

     ```bash
     ./scripts/video/inspect_video.py media/output.mp4 --raw
     ```

4. **[prep_video.py](scripts/video/prep_video.py)**: Normalizes, trims, and formats video files for Gemini Omni Flash editing, extension, and reference workflows (defaulting to a `10s` trim; pass `--duration 15` for full `15s` source clips or `--duration 3` for R2V reference clips). It handles timecode-based trimming, optional frame rate conversion, and proportional scaling of large videos (max 1280x720 for landscape, 720x1280 for portrait) to optimize upload times without stretching. If the video is longer than 10 seconds and `--duration` is omitted when run interactively (in a TTY), it prompts the user to select the first 10s, last 10s, or enter a custom timecode (defaulting to the first 10s).

   * **Trim first 10s (default)**:

     ```bash
     ./scripts/video/prep_video.py path/to/source.mp4
     ```

     or explicitly specify the start and duration:

     ```bash
     ./scripts/video/prep_video.py path/to/source.mp4 --start 0 --duration 10
     ```

   * **Trim a 3s reference clip for R2V (`--video-reference`)**:

     ```bash
     ./scripts/video/prep_video.py path/to/source.mp4 --start 0 --duration 3 --output media/ref_3s.mp4
     ```

   * **Trim last 10s** (automatically calculates starting point based on source length):

     ```bash
     ./scripts/video/prep_video.py path/to/source.mp4 --start last
     ```

   * **Trim 10s starting at specific timecode** (MM:SS or HH:MM:SS):

     ```bash
     ./scripts/video/prep_video.py path/to/source.mp4 --start 00:03 --output media/custom.mp4
     ```

   * **Custom frame rate and resolution**:

     ```bash
     ./scripts/video/prep_video.py path/to/source.mp4 --fps 30 --resolution 1920x1080
     ```

   * **Strip audio for audio regeneration**:

     ```bash
     ./scripts/video/prep_video.py path/to/source.mp4 --strip-audio --output media/video_with_no_audio.mp4
     ```

## Audio handling in video editing

When editing a source video that contains audio, you must choose between keeping the original audio or regenerating all audio from scratch.

* **Keep original audio**: By default, Gemini Omni Flash preserves the existing audio layer (though it may modify or adapt it slightly during generation). Use this when the original background music, dialogue, or sound effects are desired.
* **Regenerate all audio from scratch**: If you want Gemini Omni Flash to re-create a brand-new audio layer tailored to the new visual style or prompt, you **must** upload the video with its audio stream stripped out. If any audio stream is present, Gemini Omni Flash will attempt to preserve/modify it instead of starting from scratch.
  * Use `--strip-audio` (or `-a`) when pre-processing with `scripts/video/prep_video.py` or executing `scripts/video/generate_video.py`.
  * This forces Gemini Omni Flash to perform full audio generation.

## Prompting Gemini Omni 1.2 Flash

### Single scene

By default Gemini Omni Flash will try to create a video with a few different shots. It'll attempt to craft an interesting narrative based on the prompt.

If you need the output video to contain a single scene, prompt explicitly for it:

* In a single unbroken scene
* In a single continuous shot
* No scene cuts

For example:

```text
Continuous, unbroken handheld shot of a fluffy tabby cat sitting on a sunny windowsill, looking out into a leafy garden. The cat's tail twitches slowly, and its ears rotate slightly toward ambient noises. Sunbeams illuminate dust motes in the air. Sound design: Gentle breeze, distant bird chirps. No dialogue.
```

### Removing unwanted elements

If the generated video contains things you don't want, include simple negative prompts to avoid them:

* No dialogue
* No embellishments
* No extra sound effects

### Prompts for editing

Simple prompts work best for video editing. Overly descriptive prompts can lead to unintended changes.

Examples of effective editing prompts:

* Make this video anime
* Put a fashionable hat on this person
* Change the lighting to be more dramatic
* Change the text on the sign to say "Omni Flash"

When editing a specific aspect of the video, include `"Keep everything else the same"` to maintain visual consistency:

* **Avoid:** `In the video of the man sitting on the sofa, please add a small black cat that runs from the right side of the screen, jumps onto his lap, and then he starts to stroke its head while looking down.`
  * **Simplify:** `Add a cat that jumps onto his lap, he begins to pet it. Keep everything else the same.`
* **Avoid:** `Please remove the cell phone that the person is holding in their hand and fill in the background so it looks like they are just holding their hand empty.`
  * **Simplify:** `Make the phone invisible. Keep everything else the same.`

### Prompting the audio

By default the model generates an appropriate audio track for a video. Use your prompt to specify the exact soundscape or music style:

* Include calm background music
* The video has a high energy techno beat
* The audio is a low tinny radio broadcast in the background, playing a song

### Timing events

You can prompt for events at specific timestamps using natural language or bracketed timecodes:

* After 3 seconds, a woman enters the scene.
* At 5s the chorus starts in the background audio.
* Every 2s cut to a new frame.
* In a rapid fire sequence, every half a second (12 frames at 24fps) change the scene to a new location.

Timecode syntax example (up to `15s`):

```text
[0-5s] A runner stretches at the starting line in early morning mist
[5-10s] They sprint forward along the wet coastal road
[10-15s] Wide aerial shot as the sun breaks over the cliffs
```

### Meta prompting

You can ask Gemini Omni Flash to pay attention to general qualities or principles of video generation:

* Consider micro-detail, expression and timing to create a rich, detailed, natural scene.
* Be specific in your descriptions of characters and environments, applying costume and production design details.
* Include realistic background activity so the environment feels lived-in.
* Make a rapid-fire video that shows a different rare `[thing]` every 1s with upbeat music and on-screen labels.

### Text in videos

You can prompt to include readable on-screen or diegetic text:

* One word on the screen at a time: "did, you, know, that, Omni, can, do, awesome, text?" Each word appears for 1s with a different animated style. No dialogue.
* There is a street sign that says: "This is an AI generation by Omni", there is a storefront that says: "All you need AI", there's a car with the number plate: "OMNI1.2"

### Prompts for extending a video

With Gemini Omni 1.2 Flash you can extend videos with prompts like `"Extend this video"` or `"The scene continues"` by `3s` to `10s` per turn (`10s` default), up to a cumulative length of `30s`.

Omni creates a continuation that keeps visuals, motion, characters, and audio coherent by using up to the last `10s` of your original video as context. Some final frames of the source clip may be blended to make the transition seamless.

> [!TIP]  
> **Extending with Reference Images (Omit `task`)**: Leave `generation_config.video_config.task` unset when extending via prompt (`"Extend this video..."`). Omitting `task` lets you pass **reference images** (`--image`) alongside the source video to introduce new characters, objects, or styles into the extended clip. Setting `task="extend"` enforces a strict single-video gateway constraint and blocks reference images.

When extending, apply these guidelines:

* Describe how the audio evolves in the extended segment, e.g., `"The music swells into the chorus"`.
* Specify whether the shot continues unbroken or cuts to a new angle with the same characters, e.g., `"Cut to a wide shot showing the same two characters entering the station"`.
* Include reference images (`--image`) when introducing new characters or props into the continuation, e.g., `"Extend this video: the person in the reference image enters through the doorway"`.
* Timestamps in extension prompts are relative to the start of the extended segment (`0s` = start of the extension).

### Video extension & reference constraints

* **Input video & extension duration limits**: Uploaded and model-generated input videos for editing must be `15` seconds or shorter. Video extension can extend uploaded or model-generated videos (including `15`-second clips, using the final `10` seconds as lookback context) by `3s` to `10s` per turn (`10s` default), up to a `30s` cumulative length.
* **Two-frame keyframe cap**: First-and-last-frame interpolation (`--first-frame` + `--last-frame`) supports `3s` to `10s` (`11s`–`15s` requires single-frame, text-to-video, or R2V).
* **Reference images (`--image`) work across generation, editing, and extension**: You can pass up to **6** reference images (including on `15s` clips) for standard reference-to-video (R2V) generation, **video editing** (`--video` or `--previous-interaction-id`), and **prompt-based video extension** (`--extend` or `--previous-interaction-id`, when `--task` is omitted).
* **Only reference videos (`--video-reference`) are restricted**: Unlike reference images, reference videos are supported **only** when generating a new video — **not** during video editing (`--video` or `--previous-interaction-id`) or video extension (`--extend` or `--previous-interaction-id`) — and `11s`–`15s` video generations support at most **1** reference video (up to **3** reference videos for `3s`–`10s` clips; ideal reference clip length is ~`3s`, trim longer clips with `prep_video.py --duration 3`).
* **Spoken dialogue on uploaded videos**: You cannot extend an uploaded video where someone is already speaking in order to add new spoken dialogue (multi-turn voice extension via `previous_interaction_id` is supported).
* **`task` parameter is fallback-only**: Rely on natural-language prompting by default and pass `--task` (`generation_config.video_config.task`) **only** as a fallback when natural-language prompting alone fails to select the intended mode.

### Binding uploaded images and videos with natural language

Gemini Omni 1.2 Flash binds uploaded images and videos to their roles using **natural language** based on their order in `input` — do **not** use deprecated `<FIRST_FRAME>`, `<LAST_FRAME>`, `<IMAGE_REF_N>`, `<VIDEO_REF_N>`, or `[# Sources ...]` prompt tags.

* **Starting frame (`--first-frame`)**: Upload one image followed by your motion prompt, e.g., `"Use this image as the starting frame. The camera slowly pushes in as neon signs flicker on."`
* **Starting and ending keyframes (`--first-frame` + `--last-frame`, up to `10s`)**: Upload the start image first and the end image second, e.g., `"Use the first image as the starting frame and the second image as the final frame, smoothly transitioning from day to night."` (Pass the same image twice for a seamless loop: `"Use this image as both the starting frame and the final frame."`)
* **Multiple reference images (`--image`)**: Upload up to several reference images and refer to them clearly by order or visual content, e.g., `"A studio fashion sequence: the woman from the first image holds the leather bag from the second image while walking across the set shown in the third image. Use the given images as character, prop, and environment references rather than literal starting frames."`
* **Combined image + video references in R2V (`--image` + `--video-reference`)**: Upload the reference image(s) and reference video(s) and describe each asset's role directly, e.g., `"The violinist shown in the reference image performs on a dimly lit stage using the bow movement and camera framing from the reference video."`
