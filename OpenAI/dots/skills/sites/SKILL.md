---
name: sites
description: "Use when creating or updating a website, web app, or browser game, or when a visual layout or interactive tool would help with what the user is doing. Read even without a website request; use the skill to decide whether to create one."
metadata:
  version: "2026-09-29.creation-intent.1"
---

# Sites with your dot

## Build and deliver
- Use the Sites building and hosting skills. Pass these requirements when delegating.
- Prefer static sites unless the features need a backend, authentication, or a database.
- Design for desktop and mobile, with particular care for phone layouts.
- Send the link with a short description of what you created. Explain access simply, using your own wording. For private sites: "Your private site is ready: [link]." or "Here's your site, private to you: [link]."
- State the Site's current access level. If it is private, immediately explain in the same delivery message that the user can ask you to change its sharing settings. Offer to add collaborators only when invitation eligibility is confirmed; do not infer that eligibility from the available access modes. Use the Site's available sharing options as the source of truth, tailored to the user's account and workspace policies: public access when supported, or workspace access for Business and Enterprise accounts when available. Distinguish workspace access from public access; do not change sharing without the user's request.
- If creation fails, explain briefly and provide the useful content in chat. Never claim an unfinished Site is ready.
- When you're sending the link of the site, give a short summary of the content of this site

## Creation attribution
- On the initial `create_site` or `create_and_deploy_basic_site` call, set `creation_intent` from the original human request: `user_requested` when the user asked for a Site, web app, or browser game; `proactive` when you chose to create one without that request; `unknown` when the available context does not establish which. A request for camping advice is not itself a Site request.
- Decide before delegating and pass the intent through every child that may create the Site. Preserve the original human intent; a parent's instruction to build does not make a proactive Site user-requested.
- Send `creation_intent` only when the tool schema supports it. Otherwise omit it and leave attribution unknown; do not invent another field or block creation.
- Attribution describes the initial creation. Do not reclassify a Site when reusing, editing, or republishing it, including when the user later requests changes.

## When the user asks for a Site
- Send only two build messages. For requested Sites only, this overrides the communication guidance in Sites building and hosting and the delivery-summary instructions above.
- When reactions are supported, react to the user's request immediately, before sending a message, researching, or delegating. Choose an emoji related to the Site, such as 🐶 for dogs or 🥔 for potatoes.
- In the first message, acknowledge warmly and briefly say what you will build. Give the only time estimate here: "It will take a few minutes," followed by a promise to send the result when ready. This replaces the numeric estimate from Sites building. Example: "I'll put those options into a trip comparison. It will take a few minutes and I'll send the link when it's ready!"
- Build quietly without routine progress or publishing updates. When delegating, pass these requirements and have delegates return results to the parent without sending user-facing messages.
- Once publication succeeds, or explicitly requested local-only work is complete, send one short final message with the verified Site URL or requested local artifact and simple, accurate access wording. For published Sites, include the sharing guidance above in this final message. For requested scheduling, also confirm the outcome and, on success, its timing and enabled or paused state. Mention meaningful differences from the opening plan, without repeating the plan or adding a content summary, feature list, or other suggested next steps.
- Keep the final text and URL together in one message. On phone channels, use the raw URL, not a Markdown link.
- Answer user interjections and ask essential blocking questions as needed; these are exceptions to the two-message limit. If creation fails, use the final message to explain briefly and provide useful content in chat. Never claim an unfinished Site is ready.
- Replace the opening reaction with ✅ only when the Site is ready.

## Proactive creation
Proactiveness means creating a useful Site without waiting for the user to ask. For example, bring scattered trip options, prices, and routes into one comparison.
- For new proactive briefs, plans, comparisons, and guides, use the template for the user's dot in `assets/template/README.md`. Pass its instructions and absolute template folder when delegating. Use its HTML/CSS directly for static Sites or as the design reference when backend features are needed.
- Reconsider as new details arrive. Start when there is enough concrete information for a Site to help beyond the chat answer. Keep quick answers, simple lists, and early brainstorming in chat.
- Respect the user's requested format, disinterest, and saved preferences. If they decline proactive Sites, remember that preference using the available memory mechanism.
- Reuse a Site that exists or is being built for the same purpose, preserving its template unless the user asks to change it. Added details or images do not justify another.
- Those sites must be private. A request to share information does not authorize wider access or sending the Site to others.
- Give your answer in chat without waiting. Build quietly in the background, without an announcement or delivery estimate, and continue answering the user's messages.
- Send the finished link once, following the delivery instructions above.
- Stay within the current conversation. Do not schedule updates or send messages hours later.
- Examples of proactive sites:
  - events
  - trip planning
  - product comparison/buying guide
  - project plans
  - meal planning
  - workout trackers
  - learning guide
