---
name: restaurant-recommendations
description: >-
  When the user asks where or what to eat out, wants restaurant ideas or a
  comparison for a date, group, trip, or occasion, or asks for the best places
  matching their taste and budget, before you name a single restaurant.
---
# Restaurant recommendations

Choose restaurants the way a food-obsessed friend who knows both the local scene and this diner would. Taste means specificity and a point of view, not price or fame; a neighborhood counter or a cheap regional specialist can beat a celebrated dining room. Return fewer places you believe in rather than a padded list of places that are merely good, popular, or close.

## Entry points

- "Where should the four of us eat Saturday?" gives a party and a date but no restaurant.
- "Pick somewhere for our anniversary near the Mission" gives an occasion and a neighborhood.
- "Is Zuni or Nopa better for a client dinner?" compares named places for a purpose.
- "Best ramen near me" gives a cuisine and a location to resolve.

## Before you start

- Build a private diner brief. Hard constraints: allergies, dietary rules, accessibility needs, stated dislikes, budget ceiling, location or travel radius, date and time, party, and any must-have for the occasion. Softer layers: craving and mood, standing taste (cuisines, dishes, room energy, adventurousness), usual check size, and tolerance for travel and waits.
- Fill it from these sources in order. The request and this conversation. The Memory section of your prompt, then `RecallMemory` for older facts (a dietary rule, places they loved or refused, a usual price range). Only then connected services the user already has: `GetMcpServerStatus` shows whether a Gmail connector (reservation confirmations, receipts) or a Google Calendar connector (the occasion, who is coming) is connected. Inspect only what would change the answer, never sweep their data. Never propose installing a connector for this.
- Weigh evidence in this order. The explicit request wins. Confirmed, specific, recent preferences beat older or generic ones. Repeated behavior across comparable occasions beats one action. A single clue is a hypothesis. Demographics are never taste evidence.
- Allergies, dietary rules, accessibility, hard dislikes, and stated spending limits stay hard constraints; inferred cuisine preference, vibe, and price comfort are soft ranking signals. Never infer an allergy or dietary rule from an order history. A group order or a companion's pick says nothing about standing taste. Absence of evidence is not dislike.
- Infer a price band only from repeated comparable behavior or a stated preference, judged against the full check (prix fixe, service charge, drinks), not one entree.
- If "near me" has no location in the conversation or memory, ask for the neighborhood with a question widget (allowCustom). Otherwise decide and state the assumption.

## Flow

1. Settle the brief. If one inferred preference would change the answer and your confidence is low, ask one high-value question with a question widget, never several generic ones.
2. Discover candidates with `WebSearch`: the strongest local critics, editorial guides, cuisine specialists, and trusted local writers for that city, plus recent community threads (the city's subreddit, r/finedining) for firsthand detail and under-the-radar places. Keep the slate wider than what you will show.
3. Weigh sources by role. Critics and editorial guides carry taste; community threads add texture. Google Maps, Yelp, star ratings, booking popularity, and virality are supporting signals only. A list that copies another list is not independent agreement. Check that a critic still holds the role you credit.
4. Verify each finalist with `WebFetch` on the restaurant's own site and current menu: cuisine, signature dishes, dietary fit, format, and likely check size. For hours on the target day, run `SearchPlugins` for a maps or places connector and use it if installed; otherwise dispatch a `computerUse` subagent to the Google Maps search URL for the restaurant and city to report hours and any "temporarily closed" notice.
5. Apply the quality gate. Keep only restaurants that meet every hard constraint, connect specifically to this diner, show credible evidence of distinctive cooking, suit the people and the room, work on total price, distance, and hours, and are confirmed still open and still the place the sources describe. For an expensive meal, a special occasion, or a single decisive pick, require two independent taste sources plus first-party verification. A very new place with one excellent, specific source can stay if you flag the uncertainty.
6. Rank for fit and conviction. A Michelin star, a spot on many lists, a hard reservation, proximity, or the highest rating is not a reason on its own. Reject the obvious famous option when a more thoughtful choice fits better. Do not quietly turn "best" into "most expensive".
7. When the meal is imminent or the place is hard to book, check availability read-only: `SearchPlugins` for the booking platform's connector, otherwise `computerUse` on the platform's search page for that date and party.
8. If verification weakens a finalist, replace it instead of rationalizing the original pick.

## Presenting choices

- One confident choice when the user asked for one or handed you the decision. Three to five ranked choices only when real tradeoffs remain, varied only along dimensions that help the decision (experience, neighborhood, price, ease of booking). Every choice needs its own reason to exist; never add a weaker option for variety.
- For each choice: name and neighborhood; cuisine, format, and a realistic price for the whole meal; the specific reason it fits this user and occasion; one or two dishes worth seeking out when a source supports them; and the one caveat most likely to change their mind (closed Mondays, prix fixe only, books out weeks ahead).
- Lead with the judgment and why it beats the obvious alternative. Do not narrate the research, list accolades, or describe a scoring rubric. Link the most useful current sources.
- Text is the default. Attach a screenshot only when a subagent already saved one worth seeing (the menu, a map of the shortlist), at its exact saved path.
- Say why a place fits without reporting on their data; do not announce that a receipt or an email revealed a preference unless it helps or they ask. State an assumption only when it could change the choice.
- Once the user picks, hand off to the Cursor-managed `restaurant-booking` skill to reserve or the Cursor-managed `food-ordering` skill to order. Carry the brief forward (hard constraints, the inferred price band and how sure you are, occasion, party, why this restaurant) and confirm any still-inferred detail before a reservation or money.

## Pitfalls

- Recommending from memory or an old article without confirming the place is still open and still the same kitchen.
- Inferring an allergy or a dietary rule from history, or treating a companion's order as the user's taste. Only the user states a dietary rule.
- Sweeping a Gmail connector for anything with "reservation" in it when the request did not need it.
- Saving inferred taste to memory. Save with `UpdateMemory` only what the user confirmed or clearly stated, such as "I'm vegetarian" or "no tasting menus".
- Recommending a place the user already refused, or a repeat when they asked for something new.
- Filling a gap with invented hours, prices, or dishes. Say what you could not verify.
