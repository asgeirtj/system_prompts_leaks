# Images and SVG

This page explains more than just `<img src="photos/reef.jpg" alt="…">`. It covers how images move through the system, SVG rules, borders and shadows on images and how those export to PPTX, and what happens when you drop images in the editor. For information about fonts, see the `fonts.md` page.

## How images travel

Every image FILE goes into the artifact's asset store as an upload (Artifact `publish`, `file_path`, `asset:true`; or `upload_asset` where your tool lists that). The slide keeps only the reference that call returns (`/_blob/<id>`), written verbatim as the `src`. The one exception is a design system's picture copied into the deck with its install (`deck-files.md`, "A design system in the deck"): it is not uploaded, and its `src` is its path in the deck, `project/ds/<folder>/<path>`, with no leading `/`. The image data never goes through you and never into a slide: never write a `data:` URI, and never put base64 in a call or a reply. That keeps slide files small.

If you build a `deck.html` with the appifact-slides skill's `scripts/make.ts`, `src` is the file's path, relative to the `.html` file and under its folder or your working folder (each `--assets-from <dir>` adds a folder). The script checks each file, lists the ones to upload (it embeds svg and avif files itself), and takes each url back as `--asset <file>=<url>`. With no asset store, use its `--inline-images` flag, not the empty frames below. The comment at the top of the script lists the flags.

- `png`, `jpg`, `webp`, and `gif` files upload as they are. If a photo is much bigger than it will show on the slide, it is worth shrinking it first to about 2× its box.

- An `svg` file uploads too, and is shown with `<img>`. The store removes scripts, `<style>` blocks, animation, `<foreignObject>` and embedded images from an uploaded SVG. So style it with attributes, or export it as a PNG if it needs those. A small SVG (52 KB or less) can go into the slide as `<svg>` code instead (see SVG below).

- `avif`, `bmp`, and any other type the store refuses: convert the file to png or webp first, then upload that.

- If you can't upload, or the store still refuses a file, do not write the image into the slide yourself. Leave an empty frame where it belongs: `<img alt="what goes here" style="width:…; height:…">` with no `src`. It keeps its box, and the user can fill it in the editor (Add image…). Tell the user which images are missing.

Never use a URL in `src` — for example `src="https://…"`. Nothing fetches URLs. Save the image as a file and upload it.

When you read a slide's file, its `src` values are asset references (`/_blob/<id>`, with or without the leading `/`) or a design system's picture files (`project/ds/<folder>/…`). A slide saved earlier, or one where the editor could not upload, may hold a data URI. Keep every `src` exactly as it is if you edit the slide.

## Video

A slide can hold a short clip: an `.mp4` (H.264) or `.webm` file of 20 MB or less. Upload the clip as an asset the same way, and upload a still frame of it as a picture. Then write the picture as an `<img>` and name the clip on it:

`<img src="/_blob/<still>" data-video="/_blob/<clip>" alt="what it shows" style="width:…; height:…">`

The clip plays, looping, while its slide is presented, and on the deck's page while its frame is selected (a viewer's click selects it). Everywhere else (thumbnails, All slides, every download) the picture is shown, so always give it one; without a still the frame is dark. `<video src="/_blob/<clip>" poster="/_blob/<still>" aria-label="what it shows">` is read as the same thing, saved as the `<img>`. `data-video` takes only the `/_blob/<id>` the upload returned, never a URL or path. A click pauses and plays it. Optional settings: `data-video-sound="on"` plays its sound (muted without it; a clip a person adds has it, and Properties has the switch); when presented, `data-video-start="click"` keeps the picture up until it is clicked (default: with the slide) and `data-video-delay="1.5"` (seconds, 60 at most) makes a clip that starts by itself wait. At most four clips play on one slide. If you edit a slide, keep its `data-video…` attributes as they are.

## SVG

Use SVG when crisp vector art matters — for example logos and diagrams. You can use `<img src="file.svg" alt="…">` or put the `<svg>…</svg>` code right in the slide. See the "Graphics & live embeds" section of `format.md` for more on this. Either way, the slide viewer treats the SVG as a static, sandboxed image:

- Scripts in the SVG never run.
- External references the SVG points to never load.
- SMIL animation in the SVG does not play.
- If an SVG contains `<foreignObject>`, it cannot be rasterized for PPTX export. The export skips that SVG and shows a warning. Plain SVG is rasterized to a PNG.

If you put `<svg>` code directly in the slide, the build checks it:

- No script
- No `on*=` event handlers
- No `<foreignObject>` elements
- No SMIL animation
- No URLs
- The SVG code must be 52 KB or smaller

The markup inside the `<svg>` is kept exactly as you wrote it, and comes back unchanged when you load the slide to edit it. An `aria-label` on the `<svg>` is its description (the image's alt): set one when the graphic carries meaning — a chart, a plan, a map — and leave it off pure decoration.

The slide shows the `<svg>` as an image, which a browser reads as XML. So inside it write a character only as itself (`—`), as its number (`&#8212;`) or as one of XML's five names (`&amp;` `&lt;` `&gt;` `&quot;` `&apos;`): any other `&name;`, or a bare `&`, breaks the whole drawing.

Fonts never load inside an SVG. Any `<text>` elements render in a system font, not the deck's font, and the text gets clipped. So keep diagram labels OUT of the SVG. Paint them as real text over the SVG instead. See the "Labels over an image" section of `layout.md`. The build warns you about every `<text>` element it finds in an `<svg>`.

## Display treatment

View each image and decide how it is best shown. Photos fill their box (`object-fit:cover`). For screenshots and diagrams, fit them inside the box, keeping their original shape (`object-fit:contain`). Put screenshots and diagrams on a contrasting background. Rarely put anything on top of a screenshot or diagram. Diagram labels are the exception.

If you put text on top of an image, protect it the way the deck's direction would — a card, a scrim (`background:rgba(20,20,19,.6)`), or a `backdrop-filter:blur()` panel. Do it the same way every time.

Do not use emoji or draw your own decorative art, unless the user asks for it. Use the images the user gives you, photos from the photo library where SKILL.md allows them (`photo-library.md`), or a line icon (`<x-icon>`) — but use icons sparingly. If the user does not give you any images, a deck with no images and good structure is a fine deliverable. Never make up an image. Never use an image file that you do not have. If an image file is missing, the build will fail.

## Borders and shadows

The `border`, `border-radius`, and `box-shadow` properties work the same way on an `<img>` as they do anywhere else (see reference/styles.md). The editor's Inspector writes these same properties.

When you export to PPTX, borders and shadows on images turn into a picture outline and an outer shadow. PPTX uses its own approximations:

- `dashed` and `dotted` in CSS map to PPTX dash styles.
- `double` in CSS exports as solid.
- The spread part of a `box-shadow` gets folded into the blur.
- A named CSS color is skipped. You will see an export warning.
- Hex color codes and `rgba()` colors convert exactly.

## In the GUI

If you click the Image or video button in the toolbar, it opens a file picker that takes pictures and .mp4, .webm or .mov clips. Both the file picker and dragging-and-dropping an OS file at the pointer upload to the same asset store. If uploads are unavailable, a picture falls back to a downsampled inline copy and a clip is refused. You do not need to place every image.
