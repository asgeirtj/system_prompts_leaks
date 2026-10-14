# Compose the story visually

Choose the subject of each scene before choosing its container. Use an actual
artifact for a result, a spatial diagram for a relationship, and a bubble for
an exchange. Give the focal element most of the card's area. Keep the title
short and remove labels that repeat what the viewer can already see.

Use the product palette and Optimistic fonts from
`/opt/hatch/skills/magic-moment/reference/design.md`. Keep a consistent corner
radius and padding rhythm across the video. Change composition when the subject
changes. Use a deliberate dark card for a technical mechanism or a hero metric
when it strengthens the sequence. Give supporting text less weight than the
focal element. Do not use identical title-plus-two-row cards for every topic.

Use these compositions when they fit the evidence:

- Calendar: show a small week grid or time lane with the supported events in
  position. Highlight the available slot or planned activity once. Include
  dates and clock times only when sourced. Use an undated rhythm diagram when
  the narration supports a recurring pattern but no exact schedule.
- Route: give the route line and endpoints room to read. Draw a real map only
  from sourced coordinates. Without coordinates, use a visibly abstract path
  beside the supported route name and distance or duration; omit map tiles,
  street names, compass marks, and a fake location pin.
- Progress: use a chart only when its values are sourced. Distinguish completed
  activity from recommendations with solid versus outlined marks and short
  state labels. Do not turn an intended progression into a performance gain.
- Sync or automation: show the source, a connecting path, and the destination.
  Animate one transfer when the source supports a completed transfer. For a
  skill that was built but has no evidenced execution, reveal the connection
  without a success check or fabricated activity data.
- Artifact: reveal a large complete block of the actual artifact. Crop to the
  relevant content rather than fitting a whole desktop page into a thumbnail.
  Let its own visual identity carry the scene. Use a second crop when the
  narration moves from past records to upcoming work.

Use the HTML examples in  
`/opt/hatch/skills/magic-moment/reference/design-system/story-compositions.html`  
for spatial layout and motion. Adapt their sample content from evidence. These
are explanatory diagrams, not replicas of product screens. Keep recognizable
product controls in the main kit's anatomy.

Animate the narrated change once, then hold the result long enough to read.
Draw a path, highlight a slot, or reveal a recorded entry when that action is
supported. Keep decorative motion still while the viewer reads. Use the
renderer for entrance, exit, and tap motion; do not add another pop to the
whole HTML card.

Plan the sequence as scene, source, focal element, motion, and hold. Preview
with `/opt/hatch/skills/magic-moment/mm preview <screenplay.json>`. Read the
initial, middle, and final card states at their returned phone size. Revise
weak hierarchy, clipped text, and tiny artifact content before the full render.
Review the final encoded video separately because standalone previews do not
prove face clearance, transition spacing, or audio timing.
