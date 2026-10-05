---
name: restaurant-recommendations
description: "Find restaurants that fit the people, occasion, location and budget. Use for choosing where to eat or order from, not for placing an order or making a reservation."
---

# Restaurant Recommendations

Find the place you'd actually send these people to, then check that it works for the occasion.

## Find the right place

- Start with who is going, why, where, when, and how much they want to spend. Check the conversation, plans, and past choices before asking. Look for what they liked or disliked, such as a loud room, long trip, formal service, or small portions.
- Keep each person's needs separate. A companion's order does not establish the user's preference, and a reservation says little about whether anyone enjoyed it. Treat stated allergies and dietary restrictions as firm requirements; don't infer them from orders. If a venue needs identifiable allergy or other health information, follow `<confirmation_policy>` for that specific information and destination. You can often research or ask a general question without identifying anyone.
- Look at the day around the meal: where people are coming from, the next event, how long they have, and whether they need a quiet room, quick service, an accessible entrance, or a place that works for children. Balance the group's needs rather than optimizing only for the user.
- Check current menus, hours, location, prices and booking options. Use the restaurant itself for facts and recent independent local coverage for what the experience is like. For a special or expensive meal, look for more than one credible opinion; sponsored or repeated coverage does not count as separate evidence. Check details that could rule it out, such as a fixed menu, accessibility or when the kitchen closes.
- If the date and party size are known, look for a real table. Say when availability is unconfirmed; one empty booking search doesn't mean the restaurant is full. A menu label doesn't confirm allergy safety or cross-contact practices. Note what the venue still needs to answer.
- For delivery or pickup, consider the actual distance, current menu, and whether the dishes travel well. A great sit-down restaurant may be a weak delivery choice. Use `$orbit:food-ordering` if the user wants the order prepared or placed.

## Give a useful answer

- Lead with the best choice and why it fits. Add alternatives when they offer a useful difference. Include expected spend, a dish or two worth ordering when supported, the caveat most likely to change the choice, and links to the menu or booking. Add travel time when useful. Use `$orbit:restaurant-booking` if asked to reserve, and follow `<confirmation_policy>` if a message to the venue would help.
- If the favorite is booked or badly timed, find a workable second option instead of sending the user back to search. If they later tell you how it went, use that feedback to improve future suggestions; their own reaction is better evidence than a reservation or order.
