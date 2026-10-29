---
name: devday-guide
description: Help with OpenAI DevDay attendance, onsite logistics, session schedules, personal plans, livestreams, recordings, and DevDay Exchanges. Use for DevDay-specific questions, not general OpenAI API or app development.
---

# DevDay Guide

Help the user attend, follow, or learn from DevDay. Public event questions do not require an API key, Platform account connection, or developer onboarding.

## Verify event information

- Start with [the official DevDay site](https://devday.openai.com/) for the program, attendance FAQ, livestream, recordings, and accessibility information. For regional events, use [DevDay Exchanges](https://events.openai.com/devdayexchange2026) and official links from the DevDay site.
- Match the requested year and city. If a landing page has rolled over to another event, find an official page for the requested edition rather than substituting the latest agenda.
- For onsite questions about September 29, 2026 in San Francisco, read [the bundled attendee guide](references/devday-2026-attendee-guide.md). It contains dated logistics from the event guide, not a live agenda. Use it for check-in, wayfinding, meals, activities, and attendee services; prefer newer official event communications and onsite signage when details change.
- Check current public sources for session schedules, speakers, ticket availability, livestreams, and recordings, and cite the relevant pages. If a detail is only in the bundled guide, attribute it to the September 27 attendee-guide snapshot rather than implying it was verified on the website. Say when a current detail cannot be verified; do not fill gaps from memory.
- Apart from the curated bundled attendee guide, use public, unauthenticated sources for event facts, not employee-only repositories, Slack, Drive, planning documents, or previews. Do not fetch the source planning document at runtime. User-provided registration details can inform their own answer, but are not public event information.
- Preserve the published date, time zone, and overlapping sessions. A programming window is not a list of individual talks, and a venue address does not establish a check-in entrance or room map.

## Shape the answer to the request

- For a specific question, answer directly with the official link. Do not open an agenda or propose a personal plan unless it helps with the request.
- For a schedule, use a compact table of verified times, sessions, and locations. Leave unpublished durations or locations unspecified.
- For a personal plan, use the user's interests and availability; ask a brief follow-up only if it would change the recommendation. Show conflicts and alternatives rather than silently assigning overlapping sessions. Recommendations do not reserve a seat or change registration.
- For onsite help, give the relevant location and service hours. Do not infer walking times, accessible routes, room positions, or access privileges beyond the guide; use onsite signage or event staff for details. LaunchPad recommendations do not book an appointment.
- For "what is on now," check the current date and event-local time. Only call a session ongoing when its published start and end support that claim; before the event, help plan, and after it, look for published recordings.
- For livestreams or recordings, follow official links and distinguish planned coverage from a video that is actually available. Do not invent a transcript or announcements from a session title.
- For building something inspired by a session, use the relevant public docs and available developer skills. Let the user's chosen project drive the handoff rather than forcing an API-key setup or a particular framework.

## Work with the existing DevDay sidebar

When the OpenAI Developers sidebar is available, direct users to its DevDay tab to browse sessions and use its save controls. Do not create a second agenda widget or call tools that are not available in the current session.

Saved selections live in the sidebar; this skill does not have a tool to read or change them. If the user wants advice based on their saved sessions, ask them to share the relevant selection. Do not claim a chat recommendation has been saved, synchronized across devices, or added to a calendar. Do not add a notebook or notes workflow.

If the user wants to share their schedule, direct them to the sidebar's explicit sharing controls when available. Explain that this creates a public schedule link; do not publish a schedule just because the user requested a personal plan.
