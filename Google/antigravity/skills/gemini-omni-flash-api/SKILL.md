---
name: gemini-omni-flash-api
description: Use this skill for generative video editing, text-to-video, image-referenced video generation, first-frame-to-video, first-and-last-frame transitions, and video extensions using Gemini Omni 1.1 Flash (gemini-omni-1.1-flash) via the official google-genai SDK. Includes workflows for pre-processing/optimizing high-resolution or long source videos with ffmpeg, stripping audio for full sound regeneration, and handling turn-by-turn video editing and parallel execution.
---

# Gemini Omni Flash Skill

This skill uses the Gemini Omni 1.1 Flash model (`gemini-omni-1.1-flash`) to perform text to video generation, image to video generation (first frame and last frame transitions), video extensions (up to 40s), and video editing.

> [!WARNING]  
> **Important Regional Restrictions**: Uploading videos to use for video edits or extensions is **NOT** available in the EEA, Switzerland, the United Kingdom, and some US states. If a video-to-video edit completes quickly with empty outputs (`total_output_tokens: 0` or no video content), it is likely due to this restriction.

## Core capabilities

1. **Text to video**: Generating videos from a text prompt.
2. **First frame to video**: Generating videos from a starting image (`--first-frame`).
3. **First and last frame transition**: Generating videos interpolating between a starting image and a final image (`--first-frame` and `--last-frame`; note: `--last-frame` must be used with `--first-frame`).
4. **Video extensions**: Extending existing videos by up to 10 seconds per turn, up to a total length of 40 seconds (`--extend` or `--previous-interaction-id`).
5. **Video editing and refinement**: Editing existing videos (maximum duration 10 seconds), applying stylistic changes, or performing inpainting/outpainting.
6. **Image and video referenced generation**: Using style, character, or object references from images or videos to guide video generation.

## Workflow

1. **Analyze request**: Determine the target task (e.g., first-frame-to-video, first-and-last-frame transition, video extension, reference-guided editing) and identify any input media assets.
2. **Run SDK scripts**:

   * Directly run the appropriate utility (`scripts/video/generate_video.py` or `scripts/upload_file.py`).
   * Configure settings like `--aspect-ratio` (e.g. `16:9`, `9:16`), `--resolution` (`360p`, `720p`, `1080p`, `4k`; default: `720p`), and `--duration` (any integer between `3` and `10` seconds, e.g. `3`, `5`, `10`). *Note: `4k` requests take longer to generate.*

3. **Retrieve and process output**: Outputs are saved to the local filesystem (e.g. `media/`). Report back the completed media path to the user.

## Reference Documentation

* **Interactions API**: All operations and state management for the Gemini Omni 1.1 Flash model (`gemini-omni-1.1-flash`) are handled via the [Interactions API](https://ai.google.dev/gemini-api/docs/interactions-overview).
* **Files API**: Input media files (such as reference images and videos) must be uploaded via the [Files API](https://ai.google.dev/gemini-api/docs/files) first before being referenced in generations. The uploaded file URI and MIME type are then included in the `interactions.create` input parts array.
* **[Gemini API Skill Reference](https://github.com/google-gemini/gemini-skills/blob/main/skills/gemini-api-dev/SKILL.md)**: Platform-wide guidelines, current model specifications, and SDK usage rules for the Gemini API.

## Dependencies and Prerequisites

* **Python SDK (`google-genai`)**: Requires `google-genai >= 2.19.0` (Python) to support the `interactions` client and full video output resolution configuration (`360p`, `720p`, `1080p`, `4k`). Install or upgrade using:
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

1. **[upload_file.py](scripts/upload_file.py)**: Uploads local media (images and videos) to the Files API and polls until `ACTIVE`. If uploading a video larger than 25MB, it prints an informative warning/tip highlighting that Gemini Omni Flash is optimized for editing 10s videos at 720p/24fps, and recommends pre-processing with `prep_video.py` first to speed up the upload.

   ```bash
   ./scripts/upload_file.py path/to/image.png
   ```

2. **[generate_video.py](scripts/video/generate_video.py)**: Performs end-to-end video generation and downloads the output video. It detects and uploads local media references (images or videos) before calling the Interactions API. Large video assets (>25MB) will trigger informative pre-processing recommendations without blocking the upload.

   * **Text to video**:

     ```bash
     ./scripts/video/generate_video.py "A close-up of a cat drinking tea" --output media/cat_tea.mp4
     ```

   * **Output resolution options (`--resolution`)**:

     Gemini Omni 1.1 Flash natively supports four output resolutions across both landscape (`16:9`) and portrait (`9:16`) aspect ratios:
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

     Default HTTP timeout is `600` seconds (10 minutes). For computationally intensive requests — such as extending a 30s video in 4K by 10s (up to the maximum 40s total video length) — generation can take several minutes. Use `--timeout 900` (or `1200`) to provide an extended execution budget.
   * **First frame to video**:

     ```bash
     ./scripts/video/generate_video.py "The waves crash against the shore." --first-frame start.png --output media/waves.mp4
     ```

   * **First and last frame transition**:

     Provide a starting frame and an ending frame to generate a smooth transition between them (note: `--last-frame` **must** be used together with `--first-frame`):

     ```bash
     ./scripts/video/generate_video.py "A smooth timelapse from sunrise to sunset" --first-frame start.png --last-frame end.png --output media/interpolation.mp4
     ```

   * **Looping video (identical start and end frame)**:

     ```bash
     ./scripts/video/generate_video.py "A crystal orb spinning continuously in place" --first-frame orb.png --last-frame orb.png --output media/loop.mp4
     ```

   * **Image-referenced video generation**:

     ```bash
     ./scripts/video/generate_video.py "A cybernetic warrior in the style of <IMAGE_REF_0>" --image reference.png --output media/warrior.mp4
     ```

   * **Video-referenced video generation**:

     Provide one or more reference videos (`--video-reference` / `-vr`) to guide character, object, or motion style (ideal duration is ~3s, up to 3 reference videos recommended):

     ```bash
     ./scripts/video/generate_video.py "A musician playing cello in the style of <VIDEO_REF_0>" --video-reference ref_dance.mp4 --output media/cello.mp4
     ```

   * **Video extension (extend an existing video)**:

     Extend an existing video by up to 10 seconds (total duration up to 40 seconds):

     ```bash
     ./scripts/video/generate_video.py "The scene continues as the sun sets over the horizon" --extend media/sunset.mp4 --output media/sunset_extended.mp4
     ```

   * **Video extension with reference images and reference videos**:

     Prompt-based extension allows passing reference images and reference videos simultaneously:

     ```bash
     ./scripts/video/generate_video.py "Extend this video. The character in <IMAGE_REF_0> enters dancing like the dancer in <VIDEO_REF_0>." --extend media/sunset.mp4 --image character.png --video-reference dance_ref.mp4 --output media/sunset_extended_with_refs.mp4
     ```

   * **Video editing (keep original audio)**:

     ```bash
     ./scripts/video/generate_video.py "Transform the style to Japanese anime" --video input.mp4 --output media/anime_style.mp4
     ```

   * **Video editing (regenerate all audio from scratch)**:

     ```bash
     ./scripts/video/generate_video.py "Transform the style to Japanese anime" --video input.mp4 --strip-audio --output media/anime_style_new_audio.mp4
     ```

   * **Turn-by-turn video editing (edit previous interaction)**:

     Edit a prior video generation without re-uploading assets by passing the interaction ID:

     ```bash
     ./scripts/video/generate_video.py "Change the setting to a snowy winter wonderland." --previous-interaction-id "v1_..." --output media/winter_wonderland.mp4
     ```

   * **Turn-by-turn video extension (extend previous interaction)**:

     Extend a prior video generation by passing the previous interaction ID:

     ```bash
     ./scripts/video/generate_video.py "Extend this video. The character turns around and begins to run." --previous-interaction-id "v1_..." --output media/extended_turn.mp4
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
         "resolution": "1080p",
         "output": "media/interpolation.mp4"
       },
       {
         "prompt": "Extend this video. The scene continues with the character in <IMAGE_REF_0> dancing like <VIDEO_REF_0>.",
         "extend": "media/sunset.mp4",
         "image": "character.png",
         "video_reference": "dance_ref.mp4",
         "output": "media/extended_with_refs.mp4"
       },
       {
         "prompt": "A macro shot of a crystal orb refracting cosmic nebula colors.",
         "resolution": "4k",
         "output": "media/nebula_orb_4k.mp4"
       },
       {
         "prompt": "A musician playing cello in the style of <VIDEO_REF_0>.",
         "video_reference": "cello_ref.mp4",
         "output": "media/cello.mp4"
       },
       {
         "prompt": "Transform the style to Japanese anime.",
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

4. **[prep_video.py](scripts/video/prep_video.py)**: Normalizes, trims, and formats any video file to fit standard Gemini Omni Flash generation and editing limits. It handles timecode-based trimming, optional frame rate conversion, and proportional scaling of large videos (max 1280x720 for landscape, 720x1280 for portrait) to optimize upload times without stretching. If the video is longer than 10 seconds and the script is run interactively (in a TTY), it prompts the user to select the first 10s, last 10s, or enter a custom timecode (defaulting to the first 10s).

   * **Trim first 10s (default)**:

    ```bash
     ./scripts/video/prep_video.py path/to/source.mp4
     ```

     or explicitly specify the start and duration:

     ```bash
     ./scripts/video/prep_video.py path/to/source.mp4 --start 0 --duration 10
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

## Prompting Gemini Omni Flash

### Single scene

By default Gemini Omni Flash will try to create a video with a few different shots. It'll attempt to craft an interesting narrative based on the prompt.

If you need the output video to contain a single scene, you must prompt for that:

* In a single unbroken scene
* In a single continuous shot
* No scene cuts

For example:

```
Continuous, unbroken handheld shot of a fluffy tabby cat sitting on a sunny windowsill, looking out into a leafy garden. The cat's tail twitches slowly, and its ears rotate slightly toward ambient noises. Sunbeams illuminate dust motes in the air. Sound design: Gentle breeze, distant bird chirps. No dialogue.
```

### Removing unwanted elements

If the generated video contains things you don't want, include simple negative prompts to avoid them:

* No dialogue
* No embellishments
* No extra sound effects

### Prompts for editing

Simple prompts work best for video editing. Overly descriptive prompts can lead to unintended changes.

The following are more examples of simple editing prompts:

* Make this video anime
* Put a fashionable hat on this person
* Change the lighting to be more dramatic
* Change the text on the sign to say "Omni Flash"

When editing a specific aspect of the video, include `"Keep everything else the same"` to maintain visual consistency.

The following are some examples to show how to apply this technique:

* **Avoid:** `In the video of the man sitting on the sofa, please add a small black cat that runs from the right side of the screen, jumps onto his lap, and then he starts to stroke its head while looking down.`
  * **Simplify:** `Add a cat that jumps onto his lap, he begins to pet it. Keep everything else the same.`
* **Avoid:** `Please remove the cell phone that the person is holding in their hand and fill in the background so it looks like they are just holding their hand empty.`
  * **Simplify:** `Make the phone invisible. Keep everything else the same.`

### Prompting the audio

By default the model will try to generate an appropriate audio track for a video. This might not always be what you want. You can use your prompt to describe the type of audio you want. This is especially important if you want music in your video:

* Include calm background music
* The video has a high energy techno beat
* The audio is a low tinny radio broadcast in the background, playing a song

### Timing events

You can prompt for things to happen at specific times in the video, there is no precise syntax needed and you can use natural language. This is especially useful in creating your own scene cuts, rhythm or rapid fire sequences. See the following for examples:

* After 3 seconds, a woman enters the scene.
* At 5s the chorus starts in the background audio.
* Every 2s cut to a new frame.
* In a rapid fire sequence, every half a second (12 frames at 24fps) change the scene to a new location.

You can also use a timecode syntax:

```
[0-3s] A person is walking
[3-6s] They stop and turn around
[6-10s] They start running
```

### Meta prompting

You can ask Gemini Omni Flash to pay attention to general qualities or principles of video generation:

* Consider micro-detail, expression and timing to create a very rich, detailed but entirely natural scene.
* Be extremely detailed in your descriptions of characters and environments. Apply costume design principles to characters. Be very specific about the people, items and objects in the scene.
* Include plenty of appropriate detail in the background elements to make the scene feel realistic and natural.
* Make a rapid fire video that shows a different rare `[thing]` every 1s, upbeat music, include text to label the thing.

### Text in videos

You can prompt to include text in your video and Gemini Omni will render in a way that is correct and readable. If there will be naturally occurring text in your video, even in background elements, it can help to define what it should say.

* One word on the screen at a time: "did, you, know, that, Omni, can, do, awesome, text?" Each word appears for 1s with a different animated style. No dialogue.
* There is a street sign that says: "This is an AI generation by Omni", there is a storefront that says: "All you need AI", there's a car with the number plate: "OMNI1.1"

### Prompts for extending a video

With Gemini Omni 1.1 Flash you can extend videos with prompts like, `"Extend this video"` or `"The scene continues"`. You can extend videos by 10s, up to a total length of 40s.

Omni creates an extension that keeps video, motion, characters and audio coherent by using the last 10s of your original video as context. Some of the final frames in your input video will be edited to make the transition seamless.

> [!TIP]  
> **Extending with References**: Video extensions can be done with a prompt (e.g., `"Extend this video"`, `"The scene continues"`) without setting the API's `task="extend"` parameter. Omitting the `task` parameter allows passing in reference images (`--image`) and reference videos (`--video-reference`) during video extensions to introduce new characters, objects, or styles seamlessly into the extended scene. If `task="extend"` is explicitly set, multimodal references cannot be passed.

When extending, all of this guide's Omni prompting tips still apply:

* Describe the audio in your extended scene, especially if you need it to change, `"The music continues into the chorus"`
* Describe if the scene continues, or if there is a shot cut to a new scene (perhaps with the same characters), `"Show the same characters in the next scene"`
* Include images and videos as references when extending to help keep your outputs accurate, or to introduce new characters, `"The person shown in the reference image enters the scene"`, `"The dog in the reference video <VIDEO_REF_0> jumps onto the sofa"`
* If using timestamps or a timecode syntax, 0s refers to the beginning of the extended part of the video. If extending a 10s video, the scene cut in this prompt will happen after 12s:  `"After 2s cut to a new scene with the same characters"`

### Video extension constraints and guidelines

* **Duration limit**: Input videos for extension must be 10 seconds or less in length when uploading (unless using multi-turn).
* **Spoken dialogue on uploaded videos**: Currently, you cannot extend an uploaded video where someone is talking to add additional dialogue (it is supported if the character remains silent or if the prompt does not add dialogue).
* **Multi-turn voice extension**: Generating spoken dialogue or speech is supported when extending previously generated videos via multi-turn (`previous_interaction_id`).
* **Task parameter recommendation**: We recommend relying primarily on prompting and using the `task="extend"` parameter only when prompting alone does not work and you need to help the model understand which mode it should use, as setting the `task` field adds constraints (such as disabling multimodal reference inputs).

### Using tags in prompts to set image and video roles

You can use tags to bind uploaded media to specific generation roles. This lets you specify whether each image or video is a starting frame, a final frame, or a reference.

#### Simple tags (recommended)

For simple cases where media roles are clear from the prompt, you can bind images and videos to roles directly:

* **`<FIRST_FRAME>`**: use the image as the starting frame of the video, for example: `<FIRST_FRAME> a woman is walking`
* **`<LAST_FRAME>`**: use the image as the final frame of the video to transition to. Must be used with `<FIRST_FRAME>`, for example: `<FIRST_FRAME> <LAST_FRAME> a woman is walking`
* **`<IMAGE_REF_N>`**: use the image as a reference, for example: `in the style of <IMAGE_REF_0> a woman <IMAGE_REF_1> is walking` (combines style reference from the first image and subject reference from the second image). Image references start from 0.
* **`<VIDEO_REF_N>`**: use the video as a character or object reference, for example: `the person in <VIDEO_REF_0> is playing the violin`. Video references also start from 0.

> [!NOTE]  
> **Reference Video Guidelines**:  
> * **Duration**: Ideal reference videos are **~3 seconds**, though longer videos are fine. Use `prep_video.py --duration 3` if you want to trim longer source files down to reference length.  
> * **Quantity**: Up to **3 reference videos** is ideal, though more can also be used.

The following is an example with 6 reference images:

```
[0-3s] A studio fashion sequence. Starting with woman <IMAGE_REF_0>, she is holding <IMAGE_REF_1>
[3-6s] Then we see the man <IMAGE_REF_2> holding <IMAGE_REF_3>
[6-10s] And finally another woman <IMAGE_REF_4> who is holding <IMAGE_REF_5> while walking.
```

#### Declaring sources and references

For more complex cases with multiple media inputs and multiple roles, you can use explicit prefix tags paired with natural language instructions. You should declare these sources and references at the start of your prompt.

  * `[# Sources <FIRST_FRAME>@Image1]` will use the first image as the starting frame.
  * `[# Sources <FIRST_FRAME>@Image1 <LAST_FRAME>@Image2]` will use the first image as the starting frame and the second image as the final frame.
  * `[# Sources <FIRST_FRAME>@Image1 <LAST_FRAME>@Image1]` will use the first image as both the first frame and the last frame, creating a video that loops.
  * `[# Sources <FIRST_FRAME>@Image1] [# References <IMAGE_REF_0>@Image2]` will use the first image as the starting frame and the second image as a reference.
  * `[# Sources <VIDEO_0>@Video1]` will use the video as the primary source video to edit or modify.
  * `[# Sources <PREVIOUS_VIDEO>@Video1]` will use the video from the previous turn to extend.
  * `[# References <IMAGE_REF_0>@Image1]` will use the first image as a reference.
  * `[# References <IMAGE_REF_1>@Image2]` will use the second image as a reference.
  * `[# References <IMAGE_REF_0>@Image1 <IMAGE_REF_1>@Image2]` will use both images as references.
  * `[# References <VIDEO_REF_0>@Video1]` will use the first video as a reference.
  * `[# References <IMAGE_REF_0>@Image1 <VIDEO_REF_0>@Video1]` will use both an image and a video as a reference.

Add guiding instructions at the end of your prompt:

  * For a starting frame: `"Use this image as the starting frame."`
  * For a looping video via start and end frames: `"Use this image as the first frame and the last frame."`
  * For reference images: `"Use the given image(s) as references for video generation. The images should not be used as literal initial frames."`
  * For reference videos: `"Use the given video(s) as references. Do not use them as a source for video editing."`

Some examples of prompts with source and reference declarations:

```
[# Sources <FIRST_FRAME>@Image1] [# References <IMAGE_REF_0>@Image2] a woman <IMAGE_REF_0> is walking. Use Image1 as the starting frame. Use Image2 as a reference for the video generation.
```

```
[# References <IMAGE_REF_0>@Image1 <VIDEO_REF_0>@Video1] The woman in <VIDEO_REF_0> is playing the violin shown in <IMAGE_REF_0>. Use Video1 as a character reference and Image1 as an object reference.
```
