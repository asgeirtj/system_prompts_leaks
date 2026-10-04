# Campaign creative

Read this for every planned creative format. The delivery strategy and budget
must already be accepted. Read policy only when the category or content
requires it. Final execution verifies every selected create and upload shape
against its current live input schema.

## Research and present the creative plan once

Read `ads_create_creative` with `describe-tool --input-only` before proposing a
format so the plan uses current fields, enums, and conditional requirements.
Read the selected upload schema too when source compatibility affects the
choice. These schema reads do not authorize upload or creation.

Before proposing creative, inspect only relevant account images, videos, and
creatives, plus Page or Instagram media when applicable. Offer usable returned
assets alongside upload and generation. Inspect media content, not filenames,
labels, or metadata. Follow returned pagination or completeness signals before
claiming that no suitable asset exists; a partial page proves only that none of
the inspected results was suitable. Show a preview before recommending any
existing asset or putting it in the source picker. Recommend one buildable
format from the goal and evidence; never claim an unevidenced performance
advantage. If it requires a material hierarchy or budget change, return to
planning and reprice first.

Keep the plan source-neutral until the advertiser selects a source. Describe
the intended visual outcome rather than asserting that it will be generated,
uploaded, photographed, or reused. Offer every viable source without making one
sound mandatory. Product appearance, attributes, materials, price, offer,
availability, claims, and destination must come from the advertiser or verified
evidence; do not fill gaps from category stereotypes, filenames, or plausible
URLs.

This is where creative-market research belongs. Use `ads_library_search` only
when public examples could change the concept, format, message angle, offer
treatment, visual pattern, or CTA. Make one focused grounded query; if it has no
usable result, simplify once. Inspect at most three relevant returned results or
snapshots total. Public ads prove usage, never performance. Omit the lane when
it cannot change the recommendation, and treat failure as unavailable evidence.
Use only similarly focused external research. Keep raw research and tool names
backstage.

Use `call-tool --agent-output` for these reads and consume returned JSON
directly.

Present one executable creative plan in natural prose containing:

- what the advertiser will see, composition/sequence, style, format, and each
  buildable placement shape;
- exact primary text, headline, description, button, destination, and in-image
  text choice, or the advertiser's own wording where their category leaves the
  words to them; and
- material constraints and only evidence that changed the recommendation.

Do not recap the approved delivery strategy. Create one source-action
`muse.create_options` widget first, then write the complete plan in the final
response with that widget's token after it. Offer
all viable actions: `Upload my own creative`, `Generate this creative`, a
specific suitable account asset when found, and `Revise the creative plan`.
Never emit any part of the plan as commentary or send the picker alone.

A selected generation or account asset accepts this exact plan and authorizes
only that preparation. Upload waits for the advertiser's asset, then completes
or revises the plan before preparation. If the advertiser already chose a
source, show only its matching action and revision. A generic ad request or no
supplied media leaves the source open.

If one consequential creative axis remains open, ask only that choice. Its tap
or an unambiguous typed answer settles only that choice; afterwards present the
complete plan and applicable source actions. Skip the plan gate only for an
equally complete same-context brief with an explicit preparation request.

Privately check creative against goal, optimization, destination/tracking,
compliance, audience, hierarchy, placements, and budget. A material conflict
returns to the earliest affected decision. Prepare only the accepted concept,
format, copy, source, shapes, and constraints; adding one requires a revised
plan. Plan acceptance is not output approval.

## Prepare the accepted sources

Confirm required capability names in the conversation's compact discovery.
Existing Ads references need no upload. A buildable source is:

- image: a media handle, local file, or account-owned image hash, plus the
  destination `link_url` an image ad requires;
- video: an Ads video ID or uploadable asset plus any required thumbnail;
- static carousel: 2–10 valid cards and destinations;
- catalog carousel: a resolved healthy product set; or
- boosted/partnership format: the exact supported post and identity.

**A message ad has no web destination, so never ask the advertiser for one.**
This turns on the ad set's `destination_type` alone, whatever the objective:  
`MESSENGER`, `WHATSAPP`, or `INSTAGRAM_DIRECT` makes it a message ad. Use the
matching button and set `link_url` to the channel's standard value, never an
advertiser answer:

| Channel | Button | `link_url` | Needs |
|---|---|---|---|
| Messenger | `MESSAGE_PAGE` | `https://m.me/<page_id>` | the returned Page ID |
| WhatsApp | `WHATSAPP_MESSAGE` | `https://api.whatsapp.com/send` | a WhatsApp number connected to the Page |
| Instagram Direct | `INSTAGRAM_MESSAGE` | `https://www.instagram.com/` | the Page's connected Instagram account as `instagram_user_id` |

Never guess a Page or Instagram ID. When a channel's prerequisite is missing,
say what the advertiser must connect instead of building the ad. Describe the
button as opening a chat and keep links out of advertiser-facing text.

**Generating the ad's content is not available for every advertiser.** Making a
new image, and writing the ad's words, are both switched off for ads in these
categories: social issues, elections or politics; housing, employment, or
financial products and services; healthcare; pharmaceuticals; education;
alcohol; and gambling. When the ad being built is one of those, generate no part
of the creative: no image, through the Ads wrapper or any other generator, and
no primary text, headline, description or in-image words — not in a creative
plan either, where the advertiser's own wording takes their place. Any other
generated modality this surface gains later, video and audio included, is off on
the same terms.

**What stays available, and you must not withhold it.** An image the advertiser
uploads or already owns is theirs to supply, INCLUDING one they made with an AI
tool of their own — carry it through to the ordinary `self_ai_disclosure` step
rather than treating it as a block. Two routes carry it without generating:
run it as-is across automatic placements and say once that Meta may crop or
resize it, per `## Placement compatibility`; and hand Meta's own enhancements
the job through `advantage_plus_creative` on `ads_create_creative`, or a named
feature such as `image_animation` through `advantage_plus_creative_features`.
🚨 `creative generate-image --source-image` is NOT one of those routes: it
reaches the same generator through the same wrapper, so it is off here exactly
as a prompt-only generation is. Copy they wrote is theirs the same way: stage it
as given, still checked as safety rule 8 requires — that duty does not change,
and neither does declining what rule 8 says to decline. Fitting their words to a
length limit or fixing a typo is not writing them; offering a headline they did
not ask for is.

Everything that is not the creative itself also stays available, and it is most
of the work — the objective, the audience, the budget, the placements, the
campaign build, optimising what already runs, and saying what a retrieved policy
or a field actually requires. This removes creative sources, not their ability
to advertise, so never let it become a refusal to help.

Social issues, elections or politics is the single exception: no generation
there at all, no Meta enhancements, and no reshaping of their words either.
Their own image and their own copy run exactly as supplied.

Which category applies is set by WHAT IS BEING ADVERTISED, not by who the
customer is or which industry the advertiser serves — the same test as safety
rule 9. An agency, consultancy, software or hardware sold TO a regulated
industry is not in it, and neither is a charity asking for donations to fund
its own services. That still turns on the ad, and being a non-profit never
settles it: the same charity is in the category once the ad argues a social or
political issue, or leans on a named law, bill, election or policy fight. A
hospice funding its nurses is out; an appeal built on a named deportation law
is in, even though both only ask for a donation. This is a PRODUCT AVAILABILITY
fact, not a quotation: say what is unavailable here, and never state or imply
that Meta policy or Meta's rules prohibit the ad, the image or the words
(rules 9 and 10).

For each image concept, use an uploaded workspace image or
`meta-ads-cli creative generate-image`, **never the shared `media.generate_image`
surface**. That surface makes a picture; it does not carry the placement shape,
the ratio check, or any of the rules below, and an ad image produced through it
arrives at the upload with nothing behind it. Select `feed`, `story`, or `reel`;
the CLI owns the exact ratio and rejects a generated file whose measured
dimensions do not match it. Pass the advertiser's image request verbatim with
`--prompt`; repeat that flag to preserve separate visual constraints as
chronological text entries. **Verbatim does not mean uncritical**: someone
else's brand, logo, character, or public figure is one of two things you do not
put in the prompt — take the brief and leave the mark out, per "Someone else's
brand is not yours to put in an ad" in `references/writes.md`. That holds
however the mark reaches the prompt. A request that NAMES it is the obvious
case; a request that describes it while withholding the name is the same mark
(a crown emblem at twelve, a fluted bezel and a cyclops date window are a
Rolex), and a mark YOU introduce because it makes the point well is the same
mark again — the advertiser naming no brand is not permission to supply one.  
**Someone else's is the whole test, and it is not satisfied by a brand name
appearing.** An advertiser's own logo, the marks of a
brand they are an authorised dealer or reseller for, and their own product
photography all pass through unchanged — stripping those silently produces a
worse ad than they asked for and tells them nothing. If you cannot tell whose
mark it is from the conversation, ask; do not quietly remove it. If a generation
prompt needs nonmaterial production detail after the complete direction is
accepted, add one separate compact brief derived from research and consistent
with that direction. This may clarify implementation, but it must not invent or
alter the subject, scene or sequence, visual style, source, placement shape,
in-image text choice, message hook, or constraint. If any of those remain unset,
return to the direction gate. Quote required in-image text verbatim. Do not
rewrite the advertiser's words or turn campaign settings into visual
instructions.

**The second is a restricted good.** Do not put one in a generation prompt as
the SUBJECT of the picture: tobacco in any form including cigars and vapes,
alcohol, cannabis and other drugs, weapons, or gambling. That holds whoever is
asking and whatever they lawfully sell — a licensed dispensary, a glassware
brand and a shooting range are all still asking you to draw the restricted
thing. **Only when new generation is available for this ad at all**, which the
category block above decides first, take the brief and shoot around it: the
room, the people, the occasion, the craft, the packaging they supply. When the
ad is itself an alcohol or gambling ad, that block has already closed
generation, so there is no scene to offer and the advertiser's own image is the
only route — never offer to draw around a subject for an ad that may not be
drawn for at all.

**The advertiser's own seed is the exception**, on the terms the category block
sets out above: carried as-is across placements, or handed to Meta's own
enhancements. Offer that route in the same breath, so this redirects the request
rather than refusing it.

**Incidental is not the subject.** A glass of wine beside a plated dish, a pub
in the background of a high-street scene: the picture is not about the
restricted good and you must not strip it out. Judge what the image is OF, not
whether the item appears in frame.

Resolve new assets as uploadable sources, but do not upload them during this
stage; creation uses Ads hashes/IDs. Do not invent IDs, turn a thumbnail into
video, flatten carousel cards, or silently substitute formats or sources. A
missing source returns to the plan. `campaign-execution.md` reuses these current
schemas and fetches the remaining create schemas after media approval, before
rendering the final campaign review.

For generated images, use `meta-ads-cli creative generate-image` with the
accepted `feed`, `story`, or `reel` placement, verbatim advertiser request, and
`--output-dir workspace/your_files`. Repeat `--prompt` for separate constraints;
use `--source-image` only to adapt the selected workspace image. The wrapper
owns dimensions and rejects a wrong ratio.

For image generation, leave someone else's logo, brand, character, public
figure, or recognizable likeness out, including from a remix. This does not ban
using a supplied licensed asset: the advertiser's own marks and authorized
third-party source assets follow `writes.md`; ask when rights are unclear rather
than silently stripping an advertiser's own brand. A compact production brief
may add only nonmaterial detail consistent with the accepted plan. It must not
change subject, scene/sequence, style, source, shape, text, hook, or constraint.
Quote in-image text verbatim.

Retain generated `local_path`, dimensions, and `media_handle` when returned.
Prefer original media handles for other assets and do not convert/edit files
merely to retry. Intentional edits are new assets. Do not upload any candidate
before both creative approval and final campaign approval.

## Placement compatibility

Before approval, verify that the selected Page or Instagram identity supports
the proposed placements and that every source meets their format and aspect-
ratio requirements. When one asset serves automatic placements, state once in
the creative plan that Meta may crop or resize it. Do not imply that one asset
provides placement-specific creative.

Use exact placement-specific media only through a supported mapping. Otherwise
revise the placements or hierarchy and reprice when delivery changes. A failed
adaptation reopens the creative plan rather than silently substituting a source
or format.

## Collect one prepared-media approval

Preparation cannot change plan values. Before this gate, use
`meta-ads-cli describe-tool --name ads_create_creative --input-only` (or its
current result) and resolve `self_ai_disclosure` as directed by the schema.
Give the disclosure choices enough context to stand on their own: include a
clear question and a brief explanation of AI labeling in the final response
that carries the options token, written after the options call.
Use natural wording that fits the conversation.
Wait for the answer before presenting media for approval.

Show one representative image per concept, preferring 4:5 when Feed is present.
Show multiple images only when subject, composition, text, or message differs
materially; aspect ratio alone is not another concept. Attach video or list
carousel cards as applicable. The final response contains one brief declarative
sentence that the prepared media is ready for review, with the chosen AI
declaration and labeling caveat in plain language, then the media, then
exactly these options directly beneath it:

- `Approve this creative` (or `Approve these creatives` for multiple ads)
- `Revise the creative`

Then stop. Add no direction, evidence, copy, CTA, destination, placement note,
adaptation caveat, or other recap. A failure may explain its blocker.

The affirmative option or an unambiguous typed approval of the shown,
unchanged media passes this single creative gate. It accepts the media paired
with the unchanged plan, not the campaign or any write. A revision repeats the
gate. Do not add copy approval or promise a rendered ad preview.

## Carry approved media into execution

Do not upload during this stage. Retain exactly one accepted source per planned
creative for `campaign-execution.md`. Upload approved new media only after final
campaign approval; use an existing account-owned image hash or ready video ID
directly. Carry a new image as:

- generated image: its returned `media_handle`, or its exact `local_path` as
  `file` when no handle was returned;
- other asset: known `media_handle`, including a matching prior upload-only
  result; if needed, read its native `output_path` and match the attachment;
- otherwise a local `file`; download external URLs first.

Never use `snapshot_id`, pass a URL, compute a hash, switch source after
failure, or use another upload entrypoint. Creation takes only account-owned
image hashes, ready video IDs with thumbnails, or approved image sources that
`ads_creative_upload_media` uploads after final approval.
