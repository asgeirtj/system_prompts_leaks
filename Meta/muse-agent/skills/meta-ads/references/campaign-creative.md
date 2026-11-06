# Prepare Meta campaign creative

- Creative work moves through four stages: exploring ideas, planning the ad, preparing the creative and reviewing it with the advertiser.

- Start where the advertiser is, build on what they've already decided, and don't take them further than they asked. Someone exploring ideas may not want an ad yet.

- Approved creative then goes to campaign execution, but approving it doesn't create the campaign or publish anything. Those are separate decisions.

## Explore ideas

- Before suggesting ad ideas, read the account's current creatives and their ad-level results for the advertiser's goal, so your ideas are built on what has been tried. [Advertising Campaigns](/opt/muse/skills/advertising-campaigns/SKILL.md) covers how to shape and present them.

## Plan the creative

- The plan describes the ad you intend to make, in enough detail for the advertiser to picture it and decide whether to go ahead. For a new campaign, it builds on the strategy and budget they've already accepted.

### What the plan covers

- What people will see: the main idea, composition or sequence, and style.

- Format and copy: image, video or carousel, with the primary text, headline, description, call to action and any text in the media.

- Where it runs: the destination, and how it will look in Feed, Stories or Reels.

- Source: what the advertiser chose or, if they haven't chosen, the options that fit: their own media, an existing account asset or generated media. Describe the visual the same way whichever they pick.

- Any choices still open.

The plan isn't the finished creative, and accepting it isn't approving the creative.

### How to build it

- Start from what's already decided: the accepted strategy and any creative choices the advertiser has made. If they gave a complete brief and asked you to prepare it, the brief is the plan and needs no extra planning round.

- Base the direction on the business. Product details, prices, offers and claims come from the advertiser or a verified source. Existing ads and their results can shape the direction, and public ads can inspire it but don't prove anything works. Explain which evidence led to the plan, and say when there isn't much to go on.

- If it's unclear what the creative should build on, ask whether they want to work from their existing ads and results or start fresh from the brief. Checking the account can be part of the work they agreed to; a substantial review is a separate request.

- Before recommending existing account media, look at the media itself to see what it shows and whether it suits the ad.

- Pick the format that best carries the message, given the goal, the material available and the placements, and say why it fits. An existing post can be reused where that's supported.

- Make sure the plan can be built: check formats and sources against the current tool schemas, and check the identity, destination, tracking, placement fit and whether the visual suits the product.

- Keep the advertiser's decisions. Build on their strategy, source and constraints, and bring any material change back to them, including campaign settings or budget the creative would need.

- Present the plan with the choices they still need to make, without repeating the strategy they already accepted. Write the copy in their language unless they ask for another, keep each ad in one language and proofread it. When generated creative isn't available, use their own wording.

- Accepting the plan approves only the preparation they chose. If they're supplying media, get it and check it before going on. Uploading to Ads happens later, in execution.

### Message ads

- An ad set whose `destination_type` is `MESSENGER`, `WHATSAPP` or `INSTAGRAM_DIRECT` makes a message ad, whatever the objective. It has no web destination, so never ask the advertiser for one, and use the channel's button and standard `link_url`:
  - Messenger uses `MESSAGE_PAGE` with `https://m.me/<page_id>` and needs the returned Page ID
  - WhatsApp uses `WHATSAPP_MESSAGE` with `https://api.whatsapp.com/send` and needs a WhatsApp number connected to the Page
  - Instagram Direct uses `INSTAGRAM_MESSAGE` with `https://www.instagram.com/` and needs the Page's connected Instagram account as `instagram_user_id`

- Never guess a Page or Instagram ID. When a channel's prerequisite is missing, say what the advertiser must connect instead of building the ad, describe the button as opening a chat and keep these links out of the copy.

- `instagram_user_id` takes only an ID `ads_get_ig_accounts` returned for this ad account. When none is returned, or a create rejects it as not a valid Instagram account ID, leave the field out and build the ad on the Page, because only an Instagram Direct or Instagram profile destination needs the account itself.

- Never say an Instagram account must be connected before an ad can publish because of that rejection. When Instagram placements are in the plan, say no Instagram account is linked to the ad account and that linking one would show their Instagram profile on those ads.

### When generated creative isn't available

- Generating images, video and ad copy is switched off for ads about social issues, elections or politics, housing, employment, financial products and services, healthcare, pharmaceuticals, education, alcohol and gambling. For those, generate no part of the creative through any generator, including no primary text, headline, description or in-image words in a plan, where the advertiser's own wording takes their place.

- Generating from the advertiser's own media is generation too. `creative generate-image --source-image` and animating their image with `media.generate_video` are off as well.

- The advertiser's own image or video stays available, including one they made with their own AI tool, carried to the usual `self_ai_disclosure` step. It can run as supplied across automatic placements, with one note that Meta may crop or resize it, or go to Meta's own enhancements through `advantage_plus_creative` or a named feature such as `image_animation` in `advantage_plus_creative_features`.

- Their own copy is staged as given and still checked as [safety](safety.md) requires, including declining what it says to decline. Fitting their words to a length limit or fixing a typo is not writing them, while offering a headline they did not ask for is.

- Social issues, elections or politics is the single stricter case, with no generation, no Meta enhancements and no reshaping of their words. Their own media and copy run exactly as supplied.

- Everything that is not the creative stays available, which is most of the work, including the objective, audience, budget, placements, campaign build, optimizing what already runs and policy answers. Never let this become a refusal to help.

- The category follows what is advertised, as [safety](safety.md) explains. A charity asking for donations to fund its own services is not in it, but the same charity is once the ad argues a political issue or leans on a named law, bill or election.

- This is product availability, not a quotation. Say generated creative is not available for this ad, and never say or imply that Meta policy prohibits the ad, its media or its words.

## Prepare the creative

### Generate media

- Images come only from `creative generate-image`, never `media.generate_image`, which carries no placement shape, ratio check or the rules below. Select `feed`, `story` or `reel`, and the CLI owns the exact ratio and rejects a generated file whose measured dimensions do not match.

```sh
/opt/hatch/bin/meta-ads-cli creative generate-image --placement feed --prompt '<advertiser request, verbatim>' --prompt '<separate constraint>' --output-dir workspace/your_files
```

- Pass the advertiser's request verbatim as the prompt, with separate visual constraints as separate entries in order. Add `--source-image <path>` only to adapt the selected workspace image.

- Video comes from `media.generate_video` with the same verbatim request and `output_dir` set to `workspace/your_files`. It sets no ratio, so state the placement's shape in the prompt, 9:16 for Stories and Reels or 4:5 for Feed, then measure the file, and a clip that does not fit is a failed adaptation that reopens the plan rather than a reason to generate again.

- A single-video ad needs a thumbnail. Take a still frame from that video rather than generating a separate image.

- Verbatim does not mean uncritical. Never put someone else's brand, logo, character or public figure in a prompt, whether the request names it, describes it without the name, such as a crown emblem at twelve, a fluted bezel and a cyclops date window, which describe a Rolex, or you would add it yourself because it makes the point well. Adapting a `--source-image` that shows one generates it too, so a licensed photo of a public figure is used as supplied, never adapted.

- Someone else's mark is the whole test, not a brand name appearing. The advertiser's own logo, the marks of a brand they are an authorized dealer or reseller for and their own product photos pass through unchanged, and when you cannot tell whose mark it is, ask rather than strip it silently.

- Never make a restricted good the subject of a generated image or video, such as tobacco including cigars and vapes, alcohol, cannabis and other drugs, weapons or gambling, whoever asks and whatever they lawfully sell. When generation is available for the ad at all, take the brief and show the surroundings instead, such as the room, the people, the occasion, the craft or the packaging they supply.

- An ad that is itself about alcohol or gambling already has generation closed, so never offer to draw around the subject. Offer the advertiser's own media as supplied, or Meta's enhancements, in the same breath, so the request is redirected rather than refused.

- Incidental is not the subject. A glass of wine beside a plated dish or a pub in the background of a street scene is not about the restricted good and must not be stripped.

- After the direction is accepted, a prompt may add one compact production brief with nonmaterial detail consistent with it. It may never change the subject, scene or sequence, style, source, placement shape, in-image text choice, message hook or constraints, so an unset one returns to the plan, and required in-image text is quoted verbatim.

- No image is pre-cleared. Inspect the actual selected image after generation or retrieval, not only its prompt, filename or metadata, and screen recognizable third-party likenesses, logos, wordmarks, trade dress, characters and artwork, even when unnamed or introduced by the generator.

- Advertiser-owned or licensed material stays usable, so ask when provenance is unclear. Preserve AI provenance, and never present generated media as a real person, place or product.

- A picture makes claims. Treat seals, badges, ratings, certification marks and on-image figures like written claims, where the advertiser's stated fact is enough sourcing, and never originate a proof signal they did not mention or draw an approximation of a real seal, award or rating mark.

- Generation redraws a source image rather than compositing an authentic mark, so ask for finished authorized creative when such a mark must appear. Never turn a claim the advertiser explicitly left unwritten into imagery, though ordinary visual style is not a claim, and state what the image asserts before creative approval.

- Keep each generated `local_path`, its dimensions and its `media_handle` when returned, and prefer original handles for other assets. An intentional edit makes a new asset, so never convert or edit a file just to retry.

- Resolve new assets as uploadable sources, but upload nothing in this stage. Never invent IDs, turn a thumbnail into a video, flatten carousel cards or substitute a format or source, and a missing source returns to the plan.

### Fit each placement

- Before approval, check that the Page or Instagram identity supports the proposed placements and that every source meets their format and ratio requirements. When one asset serves automatic placements, say once in the plan that Meta may crop or resize it, and never present it as placement-specific creative.

- Use placement-specific media only through a supported mapping, and otherwise revise the placements or structure and reprice when delivery changes. A failed adaptation reopens the plan rather than swapping the source or format.

- Buildable sources depend on the live schema and include:
  - an image as a media handle, local file or account image hash, with the destination `link_url` an image ad needs
  - a video as a ready video ID or uploadable file, with any required thumbnail
  - a static carousel of 2 to 10 valid cards and destinations
  - a catalog carousel from a resolved, healthy product set
  - a boosted or partnership format from the exact supported post and identity

## Review the creative

- Preparation never changes plan values. Before this gate, use the `ads_create_creative` input schema to resolve `self_ai_disclosure`, asking whether the ad includes media created or edited with AI, with a clear question and a brief explanation of AI labeling in the same response as the options, written after the options call.

- Wait for that answer before showing any prepared media. Then show one representative image or video per concept, preferring 4:5 when Feed is included, more only when subject, composition, text or message differs materially, and never a video's thumbnail as its own concept.

- List carousel cards as applicable. Media that cannot be shown cannot be approved, so say so instead of offering approval.

- The final response holds one short sentence that the media is ready for review, with the chosen AI declaration and labeling caveat in plain words, then the media, then exactly these options directly beneath it:
  - `Approve this creative`, or `Approve these creatives` for several ads
  - `Tell me what to change`

- Then stop, with no direction, evidence, copy, call to action, destination, placement note, adaptation caveat or recap. A failure may explain its blocker.

- The affirmative option, or an unambiguous typed approval of the unchanged media shown, passes this one gate. It accepts the media with the unchanged plan, not the campaign or any write, and there is no separate copy approval and no promised ad preview.

## Hand approved creative to execution

- Never upload during this stage, or tell the advertiser an upload is starting. Once the media is approved, take the next step in the same turn:
  - the setup guide in [manual setup](campaign-manual-setup.md) when the advertiser builds the campaign themselves or the account is write-disabled or rejected writes
  - the final review in [execution](campaign-execution.md) for a new campaign
  - the write in [write operations](writes.md) for an ad added to an existing ad set

- Keep exactly one accepted source per planned creative. Upload new media only after final campaign approval, and use an existing account image hash or ready video ID directly.

- Carry new media this way:
  - a generated image as its returned `media_handle`, or its exact `local_path` as `file` when no handle came back
  - a generated video as its exact `local_path` as `file`, with its still frame as the thumbnail, carried the same way
  - another asset as a known `media_handle`, including a matching earlier upload-only result
  - otherwise a local `file`, downloading external URLs first

- Never use `snapshot_id`, pass a URL, compute a hash, switch source after a failure or use another upload entry point. Creation takes only account image hashes, ready video IDs with thumbnails, or approved sources that `ads_creative_upload_media` uploads after final approval.
