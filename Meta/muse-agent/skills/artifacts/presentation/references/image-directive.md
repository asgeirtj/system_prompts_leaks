---
description: Choose imagery and frame each generated image for its role in the deck.
---

# Direct slide imagery

- Art-direct every `media.generate_image` prompt for a deck so the imagery reads as one consistent, magazine-grade visual system instead of random stock. The palette values (`primary`, `accent`, `paper`) and the deck's `image_style` come from the StylePlan.

- Source a real subject, such as a company, product, place or person, through the [Image Search skill](/opt/muse/skills/image-search/SKILL.md) instead of generating it. Generate the cover hero by default when its subject depicts nothing real.

- Generate content images only where they illustrate a concept. Metric, statement and financial slides stay typographic or data-driven, so never generate an image just to raise the count.

- Pass the exact `artifact_media_dir` from your build task as `output_dir`, then embed the returned image as a `data:` URI.

## Build the prompt from these parts

- Write each prompt from these parts, in this order, and combine them into one prompt:
  - Medium. Pick one and keep it across every slide: polished editorial photography for real-world or business topics such as a pitch, a quarterly review, travel, products, food or real estate, or a single illustration style (flat vector, watercolor, isometric or 3D render) for playful, children's, gaming, wellness or conceptual topics. Honor the mood in `StylePlan.image_style`.
  - Subject. Name the slide's concrete subject. For a how-to, educational or concept slide, the image must demonstrate that specific concept, such as an actual photo showing leading lines, not a generic related scene.
  - Composition. Decide the image's role first, as described below.
  - Color and value. Grade toward the palette's `primary` and `accent` while keeping a clear, well-exposed focal subject.
  - Quality. Ask for a polished result and a high resolution.
  - Aspect ratio. Request the panel's ratio: tall or portrait for a side panel, 16:9 for a full-bleed cover.
  - Exclusions. No text, letters, numbers, equations, formulas, axis labels, legends, captions, watermarks, logos, dashboards or interface elements, and no clutter in the text zone.

## Frame the image for its role

- For a full-bleed or hero image whose title overlays the photo (a cover, section, statement, closing or full-screen image slide), keep the subject to one side or the upper area. Leave large, calm, low-detail space along at least one side and the lower edge, where titles usually sit. Use the rule of thirds and never put a busy subject dead center where a title lands.

- For a content image in a cell, such as half of a two-column slide, a bento or gallery cell or a lockup's image column, do the opposite. The text sits in a separate panel beside it, so fill the frame with a prominent, roughly centered subject and reserve no empty space, which would crop into the cell as dead space.

## Keep color, value and quality strong

- Grade the image toward the palette so it harmonizes, but keep strong contrast and tonal depth. Never wash it out: no foggy, hazy, overexposed, blown-out, near-white, milky, flat or low-contrast results, and never let the subject fade into the background.

- Match the image's brightness to the slide, rich and low-key on a dark slide and bright with real tonal depth on a light one. A visible, high-contrast subject always wins over blending. Avoid colors that clash with the palette.

- For photography, ask for soft intentional lighting, shallow depth of field, fine detail and sharp focus. For illustration, ask for clean shapes, consistent line weight and a balanced layout.

- Request a long edge of at least 1536 pixels so the image stays crisp across a full-bleed slide, never soft, blurry, upscaled or pixelated.

- Hold a sourced photo to the same bar. Check the downloaded file's pixel size with `gm identify` and reject a candidate below that long edge for hero or full-bleed use rather than upscaling it.

- Render charts through the chart tools and labels as styled HTML. Never generate a logo in place of its real source asset.

## Examples

- A hero, where the title overlays the photo and needs calm space:

> editorial photograph of a misty mountain lake at dawn, subject in the upper-right third with calm empty water and sky in the lower-left for the title, soft golden side light, muted palette grading toward the deck's paper tone, shallow depth of field, fine detail, 16:9

- A content cell, where the text sits beside the image and the subject should fill the frame:

> editorial photograph of a golden retriever puppy in a sunlit meadow, subject filling the frame and centered, soft natural light, shallow depth of field, fine detail, tall 4:5 portrait for a side column
