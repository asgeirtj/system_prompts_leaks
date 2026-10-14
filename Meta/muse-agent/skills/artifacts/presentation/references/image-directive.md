---
description: Art direction for every media.generate_image prompt in a deck, so imagery reads as one consistent visual system.
---

# Image generation directive

Every `media.generate_image` prompt for a deck must be **art-directed**, not a bare subject, so the
imagery reads as one consistent, magazine-grade visual system instead of random stock. The
palette values (`primary`, `accent`, `paper`) and the deck's `image_style` come from the
`StylePlan` you were handed.

Build each prompt from these parts, in order, then combine them into one sentence. Set
`media.generate_image`'s `output_dir` to the exact `artifact_media_dir` string from your contract
(never a bare `.src/media/`, which would resolve against the home directory), then embed the
result as a `data:` URI.

1. **Medium**: pick the one that fits the deck and keep it consistent across every slide:
   polished editorial photography for real-world or business topics (pitch, QBR, travel,
   product, food, real estate); a single illustration style (flat vector, watercolor,
   isometric, or 3D render, choose one) for playful, kids, gaming, wellness, or conceptual
   topics. Honor the deck's mood: the `StylePlan.image_style` line.

2. **Subject**: the slide's concrete subject. For a how-to, educational, or concept slide,
   the image must clearly **demonstrate** that specific concept (an actual photo exhibiting
   "leading lines" or "rule of thirds", not a generic related scene) so the slide teaches at a
   glance.

3. **Composition**: decide the image's **role** first, because it sets the framing:
   - **Full-bleed / hero** (cover, section, statement, closing, or full-screen image slide
     where the title/text *overlays* the photo): keep the subject and visual detail to one
     side or the upper area and leave large, calm, low-detail **negative space** along at
     least one side and the lower edge (the usual title zones) so the overlaid title reads
     cleanly. Rule-of-thirds; never a busy subject dead-center where a title lands.
   - **Content / cell** (fills a two-column half, a bento/gallery cell, or a lockup image
     column, where the text sits in a *separate panel beside* the image): do the **opposite**,
     fill the frame with the subject, prominent and roughly centered, and do **not** reserve
     empty negative space. No text overlays it, so reserved space just crops into the cell as
     dead space; a tightly-composed, subject-filling frame crops cleanly under `object-fit:cover`.

4. **Color and value**: grade the image toward the palette (`primary`, `accent`) so it
   harmonizes, **but** keep a clear, well-exposed focal subject with strong contrast and tonal
   depth. **Never wash the image out**: no foggy, hazy, overexposed, blown-out, near-white,
   milky, flat, or low-contrast results, and never let the subject fade into the background.
   Match the image's brightness family to the slide background (rich low-key on a dark slide;
   bright with real tonal depth on a light slide), but a visible high-contrast subject always
   wins over blending. Avoid colors that clash with the palette.

5. **Quality**: polished, never a generic stock look. Photography: soft
   intentional lighting, shallow depth of field, fine detail, sharp focus. Illustration: clean
   shapes, consistent line weight, balanced layout. Request a **high-resolution** image (long
   edge ≥1536px) that stays crisp filling a full-bleed slide, never soft, blurry, upscaled,
   pixelated, or low-detail. A **sourced** photo meets the same bar: verify the downloaded
   file's pixel size (`gm identify`), and a candidate below that long-edge floor is rejected
   for hero or full-bleed use rather than upscaled.

6. **Aspect ratio**: request the panel's ratio: tall/portrait for a side panel, 16:9 for a
   full-bleed cover, so the image fills its container under `object-fit:cover` with minimal
   cropping.

7. **Exclusions**: no text, letters, numbers, equations, formulas, axis labels, legends,
   captions, watermarks, logos, dashboards, or UI in the image (render charts with the
   matplotlib path and any labels as styled HTML instead); no clutter in the text zone.

## Examples

**Hero** (title overlays the photo, so leave negative space):  
> editorial photograph of a misty mountain lake at dawn, subject in the upper-right third with  
> calm empty water and sky in the lower-left for the title, soft golden side light, muted  
> palette grading toward the deck's paper tone, shallow depth of field, fine detail, 16:9

**Content cell** (text sits beside it, so fill the frame):  
> editorial photograph of a golden retriever puppy in a sunlit meadow, subject filling the  
> frame and centered, soft natural light, shallow depth of field, fine detail, tall 4:5  
> portrait for a side column

## When to generate

Generate the cover hero by default when its subject depicts nothing real; when the cover subject
is a real thing (a company, product, place, or person), source it with the image-search skill
instead. Generate content images where they illustrate a concept (see `authoring.md` → Images). Metric, statement, and financial slides stay typographic /
data-driven; do not generate an image just to raise the count.
