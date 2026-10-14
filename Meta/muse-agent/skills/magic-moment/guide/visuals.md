# Choose visuals from the evidence

Read the component index in `/opt/hatch/skills/magic-moment/SKILL.md` and the relevant component in `/opt/hatch/skills/magic-moment/reference/design-system/muse-moments-kit.html`. Choose a component that depicts the supported action and state. Treat all gallery names, values, and sample copy as examples, never evidence. Reuse the real artifact when several narration beats describe different parts of it.

Prefer original media and captures of actual artifacts. Record `provenance: {"kind": "original-media|historical-capture|current-capture|reconstructed-ui|synthetic-illustration", "source": "source path or event and displayed state"}` on each file-backed visual or video. A file path alone establishes neither authenticity nor historical state.

Keep provenance in the screenplay and review files. Do not print verification
labels such as "actual artifact," "historical copy," or test-VM status on the
video. Show the artifact's own name and content. Write visible copy as the product
would. Remove sentences explaining how the video was constructed or reviewed;
let the composition and concise state labels carry those distinctions. When timing matters to the
claim, use its relevant date or a concise state such as "Planned." Do not add
"Live," a sync-success badge, or a completion animation unless the source
supports that state. Omit an unsupported claim instead of covering it with a
technical disclaimer.

Read `/opt/hatch/skills/magic-moment/reference/visual-storytelling.md` before
authoring. Write a short scene plan with each beat's visual focus, component,
source, and motion. Run
`/opt/hatch/skills/magic-moment/mm preview <screenplay.json>` and open every
card's generated preview before committing to a full render. Inspect each
card's initial, middle, and final animation states at its intended size in a
360px-wide video, including its expanded state
when tapped. Fix clipped text, crowded headings, and weak artifact reveals
before rendering again.

When a source artifact is mostly prose, build a designed presentation of its
supported content with a clear focal result and readable supporting details.
Save that presentation as an artifact before capturing it. Preserve the source
facts and record the adaptation in provenance. Do not shrink a full page of
paragraphs into a card or invent data to make a chart look interesting.

Use `/opt/hatch/skills/magic-moment/mm webshots` to find browser captures. Match the source task, URL, and time to the narrated journey before using one. The presence of unrelated captures does not establish that this story used the browser. Use a browser beat only for an evidenced sequence of browser actions.

Use `/opt/hatch/skills/magic-moment/mm snap <document-or-url> --run <name>` for a current capture. This opens a fresh browser context, without the product's cookies, local storage, or state bridge. Inspect the displayed state. Use the supported product browser route when an artifact needs live state; do not treat the default local HTML state as the user's data. When the fresh context shows empty counters or sample state, crop a complete supported block that excludes them or reconstruct the narrated state from saved records and record that provenance. Do not click a mutation control to populate a screenshot. Use `--viewport-height <pixels>` to capture an explicit viewport or capture a complete meaningful block when the page exceeds the size budget; the renderer rejects silent truncation.

Read `/opt/hatch/skills/magic-moment/reference/card-spec.md` for cropping and `/opt/hatch/skills/magic-moment/reference/design.md` for the kit's design rules. Keep sourced content legible at phone scale. Use one content focus per card and remove unsupported fields. Use the kit's shipped Optimistic fonts. Keep authored cards self-contained at 1240px wide, with at least 32px visible type and a 56px primary line. Preserve meaningful inner structure under the one-surface rule in `/opt/hatch/skills/magic-moment/reference/design.md`. Use `tap: true` for a supported reveal that benefits from enlargement; ordinary cards have a 600px height budget and tap cards 1100px.

Author HTML and CSS only. Do not embed scripts, event handlers, iframes, or network dependencies. Reference local media with absolute `file://` paths. The authored capture mode disables page scripts and blocks network requests; real-app snapshot mode explicitly permits scripts. Do not combine authored HTML with `shell` or `hero`; its root supplies the surface.

Include padding and borders within the card's declared width with
`box-sizing: border-box`. Let headings and status labels wrap or stack when
they cannot fit on one line. Check their full text in the rendered preview;
do not hide overflow to make an oversized layout pass.

Time finite CSS actions to finish within the beat. Capture runs on one monotonic timeline through the beat endpoint, so finite actions finish once while ambient loops continue. Do not make a completed action loop. Inspect intermediate states for unintended overlap; a correct final state does not prove the transition works.

Keep the automatic avatar entrance, pinned header, and closing celebration. Use additional avatar media in cards only when the story is about generating that avatar. Preserve the creator's face in the final composition. The renderer uses a fixed overlay region, so verify face overlap visually rather than assuming automatic face detection.
