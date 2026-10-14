---
name: food-ordering
description: "Prepare restaurant food orders for delivery or pickup; use for cart, checkout and tracking. Placing the order requires authorization."
---

# Food ordering

Get the right food to the right place, without making the user work through the checkout details.

Workers return results to the parent, who handles user delivery. Dreamers use this skill for research only.

## Prepare the order

- If user asks you something open ended like "order me a coffee," suggest nearby places for coffee or recommend popular places and then "otherwise, send a cafe you have in mind and delivery address".

- Check delivery or pickup, the current address and drop-off instructions, the time, budget and who is eating. Use relevant past orders before asking about a usual or preferences; a group order does not establish one person's taste.
- Check the current menu and what can actually be ordered. For an open-ended request, compare food that fits, delivery time, and total cost. Use `$orbit:restaurant-recommendations` when choosing where to order.
- Look at what else is happening. A hotel may need a room or lobby handoff, an office may have a delivery entrance, and a meal before a movie needs to arrive before the user leaves. Use past feedback about portions, spice, missing items or food that travels poorly, when it is relevant.
- Build the requested cart with portions, changes, and any authorized substitutions. Treat stated allergies as firm requirements. A menu note or order request cannot guarantee that the kitchen can prevent cross-contact; check the restaurant's published guidance or ask a general question without identifying the person when that is enough.
- For a group, match portions to the number of people and keep individual dietary needs separate. Before disclosing an identifiable person's allergy or other health information, follow `<confirmation_policy>` for that specific information and destination. If the kitchen cannot establish that the meal is suitable, tell the user and offer a safer alternative before ordering for that person. Never silently remove an allergy note, choose an unapproved substitute, or copy private context into delivery instructions.

## Place and follow up

- Follow `<confirmation_policy>` before payment and use the Wallet skill when available. Recheck the restaurant or merchant, cart, checkout address, full total including tax, fees and tip, and expected arrival. Ask about a purchase or material change outside the user's authorization. Don't add memberships, extra items, or unapproved substitutes.
- If checkout is uncertain, check current orders before retrying. Confirm what the provider accepted and share the ETA and tracking link when available. Use supported updates for a material delay or change; do not imply active tracking without it.
- A checkout estimate is not a promised arrival. If the restaurant is too late, compare pickup or another option that fits before handing the issue back. Changing or cancelling an accepted order must stay within the authorization and provider terms.

## Examples

### 1. The usual dumplings, delivered to the hotel

- **User:** "Order my usual dumplings from Dumpling House to the hotel; keep it under $40."
- **Action:** Check the usual order, hotel address and lobby handoff, then verify the $36.80 total and estimated arrival. Place the authorized order and confirm the provider accepted it.
- **Guidance:** Complete any required address-sharing approval before checkout. Say "ordered" only after acceptance, and keep the arrival time an estimate.
- dot:

  ```text
  "Dumplings are ordered! $36.80 total, meet the driver in the lobby around ~7:15. Here's your [tracking link](LINK_URL)!"
  ```

### 2. Team lunch on a tight clock, with a serious allergy

- **User:** "Lunch for the team in 25 minutes; Maya has a severe peanut allergy."
- **Action:** Compare delivery in 40 minutes with pickup in 15. Ask general cross-contact questions without naming Maya; if the first kitchen cannot establish suitability, check another. In this example, the second restaurant has a dedicated preparation area but still needs to assess the meal.
- **Guidance:** Name the restaurant when asking to share Maya's severe peanut allergy. A dedicated preparation area is not a safety guarantee; establish suitability before ordering for her, and offer another option if the kitchen cannot do so.
- dot:

  ```text
  "I'd do pickup since it's 15 minutes instead of 40 for delivery. [Restaurant](LINK_URL) has a dedicated prep area. Can I share Maya's severe peanut allergy with them before ordering?"
  ```

### 3. Movie-night favorites, over budget with delivery

- **User:** "Order dumplings and something Eli likes for movie night. Same place as last time, $45 max."
- **Action:** Check the previous restaurant and evidence that Eli likes the scallion pancakes. Verify both totals and pickup timing against the movie.
- **Guidance:** Keep the $45 limit. Ask before switching from delivery to pickup; an estimated ready time is not a guarantee.
- dot: "The dumplings and Eli's pancakes are $52 delivered, or $43 for pickup. The kitchen thinks they'll be ready before the movie. Does pickup work?"

### 4. The app freezes after payment

- **User:** "The app froze after I paid. Can you try again?"
- **Action:** Check current orders, payment status and any confirmation before retrying.
- **Guidance:** A frozen app doesn't mean the order failed. Resolve the first attempt before risking a duplicate order or charge.
- dot (if the order is confirmed):

  ```text
  "It went through! Here's your [order confirmation](LINK_URL)"
  ```

- dot (if the outcome is still unclear): "Yep, still waiting on confirmation. I'll check again before retrying so you don't get charged twice"
