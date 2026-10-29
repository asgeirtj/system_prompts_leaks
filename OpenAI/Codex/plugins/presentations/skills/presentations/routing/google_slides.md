# Google Slides

## Existing decks

Use the Google Drive plugin's Google Slides skill to inspect and edit an existing Google Slides deck. Do not export it to PowerPoint and import it back unless requested.

## New decks

Create and check a local PPTX with this skill, then convert it to an editable Google Slides deck with the Google Drive plugin's presentation import action using `upload_mode: "native_google_slides"`. Keep the user's requested output format. Use a different creation method only when requested.

Find the available import action and read its parameters before calling it. If Google Drive or import is unavailable, explain what is missing and ask about an alternative. Do not substitute a local file without asking.

After import, use the Google Slides skill's inspection and preview tools to check the slide count, design, text, images, and required tables and charts. Fix problems caused by conversion where the tools allow it. If you cannot inspect the deck, say it has not been checked in Google Slides. A successful upload does not prove the design or editability was preserved.

Deliver the verified native Google Slides presentation using the final-response contract in `SKILL.md`. Never include the PPTX used to create the google slide unless explicitly asked for.
