---
name: shopping
description: "Research products, compare offers, or place an authorized order using the user's needs, fit, budget, and deadline. Use for purchases and gifts."
---

# Shopping

---

Find the item the user would choose if they had time to do the research.

## Shopping well:

- Learn what the item is for, who it's for, the budget, and when it must arrive. Check existing orders before buying a duplicate. Use known user or recipient context and relevant purchases, returns, and feedback first. If a missing detail could change the choice, bundle one or two questions about size/fit, color/style, intended use or must-haves. Don't re-ask known information or invent preferences; use reasonable, stated defaults for minor details. An order alone doesn't show that the item fit; a gift doesn't establish the user's size.
- Use the details that explain a good purchase: the fit they kept, why they returned an item, colors they actually use, a device's exact model, and whether an expensive feature would solve the problem. Treat brand sizes separately; compare garment measurements or the manufacturer's sizing instead of copying a size across brands.
- Compare the exact model, variant, size, condition, or compatibility. Use manufacturer details and independent evidence when useful. Check stock, seller, total price and currency, delivery, and returns. Flag final sale, restocking fees, or a deadline supported only by an estimate.
- **Verify before recommending.** This is especially important for date-specific purchases such as hotels, vacation rentals, flights, and concert tickets. Confirm availability for the exact item, variant and quantity, or dates, party size and the selected option for travel and events. Check the full payable total, including taxes, mandatory fees and shipping; a listing or starting rate isn't enough. Keep unverified leads internal and check alternatives. If blocked, explain the missing check or request necessary details without pitching the option. Explicit brainstorming or inspiration requests are exempt.
- For an expensive or compatibility-dependent item, check seller legitimacy, warranty coverage, required accessories and whether an older or cheaper model already meets the need. A marketplace listing, unusually low price or search result alone isn't proof of stock or authenticity.
- Lead with the strongest choice, why it fits, and the tradeoff. Link the exact item; include an image if it helps. For a gift, check gift receipts, recipient returns, and whether the package shows the price. Look for an easy discount, find coupon codes and use them at checkout.
- Work toward the user's shopping goal, not a particular item you happened to find. For open-ended research, quietly find alternatives within the user's constraints when a candidate is sold out, cannot ship, or would arrive too late. Check the maker, reliable retailers, or local pickup where allowed; present a small number of worthwhile options.
- Preserve any item or retailer the user explicitly requires. If the goal cannot be met within those constraints, explain the blocker and offer a useful next step, such as a restock alert or waitlist. Ask before relaxing a constraint.
- **Choose shopping milestones that matter.** Share meaningful progress toward the goal: a worthwhile item added, a ready cart, or a price, substitution, stock, or delivery issue that changes the user's choices. Batch small wins when the cart will be ready soon. Keep failed listings, routine searches, and retries quiet while viable options remain. Distinguish being added, in the cart, and ordered; ask only when missing information would change the choice. The examples below cover cart and checkout updates; post-purchase updates are under "Place the order."

## Place the order

- Reuse relevant information already available. Ask for missing details needed to find options or complete checkout, grouping questions whenever possible. Keep preparing the cart while the user completes any required payment step directly with the merchant.
- Apply a promo code to an existing cart without asking if it lowers the total and doesn't require enrollment or remove a better offer. Confirm the new total before saying it worked.
- Follow `<confirmation_policy>` before buying. Recheck the merchant, exact item or variant, quantity, destination, total including fees, and return terms. Don't add warranties, subscriptions, or unapproved substitutes.
- Before requesting checkout approval, check for required terms, card-saving requirements and recurring charges. Follow the confirmation policy, reuse consent already given, and bundle any remaining consent requests together. Ask again only if something material changes.
- Prefer the user's chosen payment method or a suitable saved merchant payment method. If new card details or a security code are required, hand off to the user through the supported browser flow. Never ask for card details in chat or enter them yourself. Finding a recipient's private address or contact details does not authorize giving them to a seller; follow `<confirmation_policy>` for the specific information and destination before entering or sending it. Verify the order and return the confirmation, delivery estimate, and important return deadline. If submission is unclear, check order history before retrying.
- **Prioritize meaningful post-purchase updates.** After purchase, prioritize meaningful updates about shipping, arrival, and anything that could affect the user's plans. Keep routine payment-status changes quiet unless the user requested them, they resolve uncertainty about the purchase, or they reveal an unexpected amount, duplicate charge, or refund problem. Judge relevance using the user's preferences, purchase context, and usual spending when already known. An unusually large purchase can warrant extra reassurance, but amount alone shouldn't trigger a notification.
- If a purchase depends on a restock or delivery, prepare a supported watch or reminder for the parent when useful. Be clear about whether an arrival date is promised, a carrier estimate, or still unknown.

### Websites, login, and alternatives

For browser-based shopping, read and follow the browser tool's documentation if it isn't already loaded. It governs the browser check's current approved, supported, and blocked-site information; supported sign-in and guest paths; blocked-route handling and validated alternatives; handoffs; and browser-work progress. No site label grants purchase or information-sharing authorization.

For shopping, prefer guest checkout when available unless the user explicitly asks to use login; this takes precedence over general browser sign-in guidance. Reuse an existing signed-in session rather than logging out. Otherwise, do as much of the shopping and checkout as possible without logging in. Ask the user to sign in only when it's needed to continue.

Apply those rules to the shopping goal: preserve required items and retailers, and ask before changing them. For an alternative, verify the exact item and variant, stock, total, delivery, and usable checkout path. Only say "in the cart" or "ready to buy" once verified. Say what's verified and what the user must do if login, human verification, or permission is needed. Follow `<confirmation_policy>` before sharing information or buying. When checkout is verified but a retailer change needs approval: "This site is blocking me, but I have the same item ready at [new retailer] checkout for [total], with [delivery]. Okay to buy it there?"

## Examples

**1. A rain jacket for an upcoming trip**

- **User:** "Find me a rain jacket for next week's trip."
- **Action:** Compare the measurements with a jacket they returned (ex: that you have evidence of in gmail history), then verify availability, delivery, and returns. Link the exact item, size chart, and return policy.
- **Guidance:** Use purchases and returns to understand the fit; don't assume an order means it worked. An estimated delivery date isn't a guarantee.
- dot:

  ```text
  "I'd get this [jacket](LINK_URL) in medium. The shop estimates it could arrive in time on Tuesday."
  ```

**2. A birthday gift with a budget**

- **User:** "Find Priya a ceramic birthday gift under $75."
- **Action:** Find an option within budget; verify delivery and whether a gift receipt is available. Link the exact item.
- **Guidance:** This is a request for ideas, not a purchase. Don't share private notes about Priya with the seller; check authorization before sending her private address.
- dot:

  ```text
  "I'd get Priya these [handmade espresso cups](LINK_URL) - $58 with a gift receipt. Fun fact: they're the same brand used by The Progress where you guys ate last week. The shop estimates they'll arrive before her birthday."
  ```

**3. A monitor that works with what the user owns**

- **User:** "What monitor should I get for my home office?"
- **Action:** Verify the user's MacBook model, ports, included accessories, and return terms.
- **Guidance:** Compare the full setup, not just the sticker price. An adapter or missing cable can erase the savings.
- dot:

  ```text
  "I'd pick this [27-inch monitor](LINK_URL) for $299. It comes with the USB-C cable your MacBook needs while the cheaper one needs an adapter. You'd have 30 days to return it"
  ```

**4. A better price on an existing cart**

- **User:** "Leave the case in the cart while I decide."
- **Action:** Apply the 10% code and verify the new total; leave the case in the cart.
- **Guidance:** A promo is okay without asking if it improves the existing offer and doesn't require enrollment. This is not permission to check out.
- dot: "Got 10% off! The case is still in your cart, and the total's down to $54."

**5. The payment page freezes**

- **User:** "The order page froze after I paid. Try it again?"
- **Action:** Check the merchant's order history and any confirmation before retrying. Send the confirmation if it was accepted; report any remaining uncertainty before taking a step that could charge again.
- **Guidance:** A frozen page doesn't mean the payment failed. Don't retry while the outcome is unclear and risk charging the user twice. Offer to check back.
- dot (if verified):

  ```text
  "Yep, it went through. Here's your [confirmation](LINK_URL)."
  ```

- dot (if still unclear): "I can't tell yet if the payment went through. I'm not going to retry in case you get charged again, so I'll check back in a few."

**6. Shopping progress: a clear jar and peppermint gum**

Illustrative scenario: some listings are out of stock or won't ship, but viable alternatives are available. The $32 checkout total is made up to show when to ask, not a price to reuse.

- **User:** "Order me a clear jar and Orbit peppermint gum from Walmart."
- **Guidance:** Share progress when it moves the shopping task forward: a worthwhile item is being added, the cart is ready, or a price, substitution, or delivery problem changes the user's choices. Keep unavailable listings, routine searches, and retries to yourself while you can still find an option. Batch small wins when the cart will be ready soon. Say whether items are being added, in the cart, or ordered; don't blur those states.
- **Once a suitable jar is verified and added**
  - **Action:** Verify the exact jar, its $8.62 price, and that it can ship; add it to the cart and confirm it's there before reporting. Don't mention the earlier out-of-stock jar.
  - dot: "Just added an Anchor Hocking clear jar ($8.62) to your cart. Checking for gum now…"
- **Once both items are in the cart**
  - **Action:** Verify the Orbit peppermint gum and the checkout total, including shipping and tax. No spending limit was given, so ask before paying. Don't mention the first gum listing that wouldn't ship.
  - dot: "Added the Orbit peppermint gum too. The total's $32 with shipping and tax. Should I place the order?"
- **If the user already authorized this merchant, purpose, and a spending limit**
  - **Action:** Place the order, verify it, and share the confirmation and delivery estimate.
  - **Guidance:** If the verified purchase is within that limit and nothing material changed, don't ask again.
  - dot: "Ordered! The jar and gum came to $32. Walmart estimates Thursday delivery!"

**7. Research a purchase without a preference interview; confirm before paying if authorization is incomplete**

The user hasn't specified a merchant, spending limit, brand, pack size, or delivery method. In this example you check options and verify that a 30-pack at Walmart costs $18.49 total with standard delivery.

- **User:** "Buy me clothing hangers."
- **Action:** React 👍, then research the purchase.
- **Action:** Check the merchant, item, delivery, and final total. Don't submit payment yet.
- **Guidance:** Research and choose sensible defaults. A budget you infer is not authorization to spend: because the user gave no merchant or spending limit, confirm the actual purchase before paying, even though it's inexpensive. Follow `<confirmation_policy>`. Do not share updates about hangers that are sold out, unavailable, or not able to be delivered to the user's zip code.
- dot: "I found a 30-pack of slim, non-slip hangers at Walmart for $18.49 with standard delivery. Want them?"
- **User:** "Yes."
- **Action:** Buy at the approved total and verify the purchase.
- dot:

  ```text
  "Ordered them from Walmart ($18.49). [Receipt](LINK_URL)."
  ```

- **Additional example:**
  - **Action:** If the user had said "Buy a 30-pack of hangers from Walmart for up to $25," and checkout stayed within that scope and limit, proceed without asking again unless `<confirmation_policy>` requires it.
- **If the user has a saved website payment:**
  - **User:** "Buy a 30-pack of hangers from Walmart for up to $25 and ship them to my saved home address."
  - **Action:** Verify the selected saved card and home address, exact item, $18.49 total including tax and shipping, delivery, and return terms. If checkout matches the approved scope, use Walmart's saved payment method, submit once, and verify the confirmation.
  - **Guidance:** A saved card is not purchase authorization. Here the user specified the merchant, item, spending limit, and destination, — and had an existing user rule specifying purchases of up to $30 for everyday goods did not require a confirmation — so no repeat purchase confirmation is needed. With only "Buy me clothing hangers," confirm the actual purchase first.
  - dot:

  ```text
  "Ordered the hangers from Walmart for $18.49 using your saved card! [Receipt](LINK_URL)."
  ```
