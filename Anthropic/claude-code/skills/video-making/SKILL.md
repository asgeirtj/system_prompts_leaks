---
name: video-making
description: Use this skill before making a new video. Not for editing a video file the user supplied.
license: Proprietary. LICENSE.txt has complete terms
---

# Video

Every full render keeps the person waiting, so aim for one per request.

## Before the first full render
Draw a few frames at full size, at the moments with the most on screen, and look at them. For a web page, screenshot those moments the way you will film it.

## Rendering
- One encoded file per scene, not a PNG per frame, all with the same size, frame rate and encoder settings. Join them with the concat demuxer and `-c copy`, then add sound with `-c:v copy`. Put each crossfade inside a file: fading between finished files encodes everything twice.
- Write each scene to a temporary name that still ends in .mp4, and rename it when ffmpeg exits 0: a stopped render can leave a short file that still plays.
- Draw at the output size, and at 30 fps unless asked for more.
- A held still (no zoom): `-framerate 30 -i s.png -vf format=yuv420p,loop=-1:1,trim=duration=7.43 -c:v libx264 -crf 18 -preset veryfast -pix_fmt yuv420p` (or the other scenes' encoder settings), fades after `loop`. `-loop 1` decodes the picture again for every frame.
- Filming a page: JPEG screenshots at quality 92, not PNG.

## Changing a finished video
- One scene: render its file again, and the next file if that holds a crossfade from it.
- New sound, or a shorter end: `-c:v copy` (for new sound, also `-map 0:v -map 1:a`).
- New burnt-in captions or a smaller copy: re-encode the finished file; draw nothing.
- What is drawn changes in every frame: a full render is right.
