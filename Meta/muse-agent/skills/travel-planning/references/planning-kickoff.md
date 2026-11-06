# Start a substantial trip plan

- Use this guide when the user wants to plan a trip with several decisions. A single booking belongs to its booking skill.

## Choose the conversation

- Read the runtime's current `chat` field, and stay in an existing `side_chat`. For substantial planning in the main chat, offer a dedicated trip chat when `chat.create` is available, explaining that it keeps the itinerary and revisions together. Create it only after the user accepts, and respect a choice to stay.

- After acceptance, call `chat.create` with `context_mode: "fork"` and a short trip name, then start the planning turn with `chat.send_message` using the returned `chat_id`. The `message` field on `chat.create` only helps name the chat and does not send a turn.

- Ask the new chat to continue Trip Planning, check relevant connected context, summarize the known brief and ask only about material gaps. The fork already has the relevant history, so do not copy private material into the message.

- Do not wait for its answer. If the client supports `ui.list` and `ui.navigate`, find the `chat.session` UI target and navigate to the new chat in `perform` mode, and say the chat opened only after navigation succeeds.

- If creating the chat or sending the message fails, continue here. If only navigation fails, name the new chat so the user can open it without repeating the planning work. Provider-backed and Shared Agent chats cannot receive this handoff, so stay where the request started.

## Build the brief from relevant context

- In a shared or group conversation, use only what the participants have said. Do not search private mail, calendars, memory or profiles there, or reveal details from them. Offer to continue in a private Muse chat when personal sources are needed.

- In a private conversation, start with the request, relevant history and known preferences, and check the connected calendars for fixed dates and existing travel.

- If mail is connected with read access, read the Gmail or Outlook Mail connector docs and search narrowly for relevant confirmations. A connector search finds instructions, not the user's messages. Never pause a plan or ask for a mail connection just to personalize it.

- Look for recent, repeated choices by this traveler, such as airlines and airports for flights, room type, location and stated likes for stays, or the company, car class and insurance choice for rental cars. A seat or room assigned by availability, or a booking made for someone else, is not the user's preference.

- Keep context scoped to the trip. A temporary location does not replace the user's home, and a preference seen in one city or travel party carries to another only when the user stated it generally or confirms it.

- Do not expose unrelated mail or identifiers found during this research.

- Summarize the facts, likely preferences and open choices, ask the user to correct any inferred default that matters, give the user a plausible direction to react to, and ask about the few gaps that matter. Access to an account does not authorize bookings or spending.

## Show places clearly

- Resolve each recommended destination, neighborhood, hotel, restaurant or attraction before choosing a photo. Use Place Discovery to check locations, and read the [Image Search skill](/opt/muse/skills/image-search/SKILL.md) before searching for images. A provider's current photos or seat views can be more useful than a generic image.

- Put one representative photo beside its matching option. For an image-search result, choose the image URL and keep its source page as the [Image Search skill](/opt/muse/skills/image-search/SKILL.md) describes, and copy the URL exactly. Never render a non-HTTP thumbnail, an internal handle or a candidate reference.

- Use real photos of real places. Do not generate a substitute, guess a CDN URL or reuse one photo for several options, and omit the photo when no verified image can be shown.

- A photo conveys the place but proves nothing about current hours, availability, price or condition.

- Use a map when geography helps the choice. In a side chat, rely on inline photos, short text and verified links rather than option widgets.
