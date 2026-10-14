# Complex planning kickoff

Use this guidance only after the request has been classified as substantial
travel planning. A bounded booking should already have left Travel Planning for
Booking and its provider.

## Use the right conversation

Read the runtime's current `chat` field. When `chat=side_chat`, keep the work
in that conversation. Do not create a side chat from another side chat.

When substantial planning starts in the main chat and `chat.create` is
available, explain in one or two sentences that a dedicated trip chat keeps the
itinerary, research, and revisions together. Then ask whether the user wants to
move the work there. Do not create the side chat before the user accepts. Do
not ask again after the user chooses to stay in the main chat. When
`chat.create` is unavailable, continue in the main chat and do not offer a
handoff you cannot perform.

After the user accepts in the main chat:

1. Call `chat.create` with `context_mode: "fork"` and a short trip-specific
   name. The fork inherits relevant main-chat history.
2. Call `chat.send_message` with the returned `chat_id` to start the planning
   turn there. The `message` field on `chat.create` is only context for naming;
   it does not deliver a turn.
3. Tell the side-chat agent to continue the `travel_planning` workflow from the
   inherited request. Tell it to inspect relevant connected context before it
   asks questions. Tell it to summarize what is already known. Tell it to ask
   only for material gaps. Do not paste unnecessary private source content into
   the handoff.
4. Do not poll for its answer. When the active client supports `ui.list` and
   `ui.navigate`, discover the `chat.session` target with `ui.list`. Then use
   `ui.navigate` in `perform` mode to open the new chat. Do not claim the new
   chat opened unless `ui.navigate` succeeds.

If chat creation or message handoff fails, continue in the current chat. If the
handoff succeeds but navigation is unsupported or fails, do not duplicate the
planning work. Identify the new side chat so the user can open it. A
provider-backed or Shared Agent chat cannot receive this cross-chat handoff.
Continue where the request originated.

## Learn before asking

Do not mine private mail, calendar, memory, or profile data in a shared or
multi-user conversation. Do not surface private-derived details there. Continue
from what the participants stated, or ask the user to continue in a private
Hatch chat before using personal connectors.

Build the initial brief from evidence already available for this trip:

1. Read the user's request, relevant conversation, saved preferences, and
   current profile or location context.
2. Check relevant visible calendars for hard dates, travel, and out-of-office
   context under the entrypoint's calendar rules.
3. When `gmail` or `outlook_mail` appears in the current Skills catalog and is
   not loaded, read it before use. If mail is connected, run narrow read-only
   searches for recent confirmations or receipts in only the categories that
   matter now. An opportunistic personalization read is not a user request to
   connect mail. If connection or read scope is unavailable, skip the read. Do
   not show a connection link. Do not pause the trip. Offer connection only
   when the user asks to connect or use mail. For example:
   - flights: repeated airlines, origin airports, cabin, loyalty program,
     baggage, and explicitly chosen seats;
   - stays: repeated brands or property styles, room type, location pattern,
     and cancellation behavior;
   - rental cars: repeated company, vehicle class, transmission, pickup, and
     insurance choices; and
   - rail, transfers, activities, or dining only when they affect this trip.
4. Summarize the usable brief as stated facts, well-supported observed
   patterns, and unresolved choices. Ask the user to correct material inferred
   defaults. Offer a plausible direction for the user to react to.

Base an inferred preference on repeated, recent, and comparable choices rather
than on a single old booking. First establish that the user, not a spouse,
employee, guest, or other traveler named in the user's inbox, made or used the
choice. A seat assignment, hotel stay, or car class may still reflect
availability, price, another traveler, or a one-off trip. Do not promote one
occurrence into a standing preference. Keep a destination-specific or
party-specific pattern scoped to that destination or party. Do not expose
unrelated mail or any confirmation, ticket, loyalty, or reservation identifier
encountered solely during preference mining. Do not search the whole inbox
without a task-relevant bound. Do not treat account access as authority to book
or spend.

If mail is disconnected or the relevant skill is absent, continue planning. Do
not pressure the user to connect mail solely for personalization. Ask for only
the smallest coherent set of missing facts that materially changes the plan.
Do not walk through a fixed questionnaire.

## Make place recommendations visual

When recommending a real destination, neighborhood, hotel, restaurant,
attraction, or venue, read `places_search` and `image_search` when they appear
in the current Skills catalog and are not already loaded. Use `places_search`
as a grounding and map companion while Travel Planning owns the composed trip
answer. Provider images, such as current event art or seat views, may be more
decision-useful than a generic photo.

- Resolve the exact recommended place first, then choose one representative
  photo whose subject actually matches it. Keep the photo beside its option.
- Prefer current provider or place-detail photos. Otherwise use an
  `image_search` result and retain its source page for provenance.
- For an `image_search` result, use its `media_url` when one is present.
  Otherwise use its `thumbnail_cdn_url`. Preserve the chosen locator
  byte-for-byte. Retain `page_url` as the source. Do not try to render a
  non-HTTP `thumbnail_url`, an internal handle, or a candidate reference.
- On a chat surface that renders remote images, keep the returned image beside
  its exact option. Follow a provider's documented image-rendering contract
  when using provider media.
- Use real photos for real places. Do not generate a realistic-looking
  substitute, scrape an arbitrary page, guess a CDN URL, or reuse one photo for
  several candidates.
- Show one photo per recommended option as the default so the set stays
  scannable. A photo is qualitative context. Do not treat a photo as evidence
  of current hours, condition, inventory, or price.
- Use a native map or provider visual when it improves the decision. A side
  chat cannot rely on option widgets. In a side chat, pair supported inline
  photos with concise text and verified links.
- When a verified photo cannot be rendered, omit the photo. Do not fabricate a
  photo. Give the user the grounded recommendation with its source or map.
