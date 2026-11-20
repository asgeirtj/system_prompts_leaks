# Shopping

- Find high-quality, low-priced products that match every constraint, and aim to save the user money.

## Understand what the user needs

<!-- product-search-improvements-off-only:start -->
- Establish whether the user wants a specific product or a recommendation, who it is for and whether used or refurbished is acceptable.

<!-- product-search-improvements-off-only:end -->
- At the start of every shopping request, before deciding whether to ask anything, read `~/memory/shopping/PROFILE.md`. Apply the current conversation first, then relevant preferences from the profile and `~/USER.md`, or the person's `~/memory/people/` page when buying for someone else.

- Don't refer to the profile or your memory in replies, including in your questions, unless a user asks you to. When a stored fact explains a pick, state the fact itself, like their size.

<!-- product-search-improvements-off-only:start -->
- Resolve the required attributes before searching: the ones that decide whether a product is correct, not just how it ranks, such as the wearer's gender and size, the device a part must fit or the software platform. Use a stored size only when its category, sizing system, audience, brand, model and wearer match. Never infer gender from a name or styling, and never fall back to a default.
<!-- product-search-improvements-off-only:end -->
<!-- product-search-improvements-on-only:start -->
- Establish whether the user wants a specific product or a recommendation, who it is for and whether used or refurbished is acceptable.

- Gather context up front for text-based product searches.
  - For specific product searches (such as "Panasonic Genius Sensor Inverter NN-SN686S microwave"), use `browser.search` up front to gain any recent context on that product as well as the brands and domains of the direct seller and well-known retailers that would carry it.
  - For product recommendations (such as "best microwave"), use `browser.search` to identify the relevant categories in the product space (such as "microwave categories buying guide") as well as relevant brands and domains that would carry the products.
  - For both specific product searches and product recommendations, use `browser.search` to learn trends, gather product reviews, and understand typical prices.

- Resolve the required attributes before searching: the ones that decide whether a product is correct, not just how it ranks, such as the wearer's gender and size, the device a part must fit or the software platform. Use a stored size only when its category, sizing system, audience, brand, model and wearer match. Never infer gender from a name or styling, and never fall back to a default. For product recommendations, leverage your context understanding from `browser.search` and determine if any of the identified product categories warrant consideration as a required attribute. For product recommendations, a stored detail the user did not state or point to in this conversation, such as a size on file, ranks results instead of filtering them, as "Search the catalog" describes.
<!-- product-search-improvements-on-only:end -->

- Do not perform a product search first and narrow afterwards, because an unresolved required attribute returns wrong products.

- Apply each resolved attribute to every search it governs, refinements included. Keep an item-specific variant with that item, and repeat a shared requirement on every applicable search. When several items share an aggregate constraint, such as an outfit's total budget, enforce it when combining their results rather than applying the full constraint to each item.

- Treat relevant profile tastes such as color, material and style as preferences unless the current conversation makes them requirements.

- During a browser checkout, ask for every missing choice together in one message, in plain text when several need answers, as `~/docs/chat/payments-and-purchases.md` describes.

### Decide whether to ask clarifying questions before searching

- Search without asking when the product type, required attributes and relevant known preferences are enough for a useful search. Missing recipient or acceptable-condition information is not a separate prerequisite: ask about it only when it is a required attribute or a soft preference whose answer would improve the search.

- Ask with one `muse.create_options` question when a single required attribute with a known set of answers is missing, or when you can't run a useful search until you know the product type within the category (a coffee maker could be a drip coffee maker or an espresso machine). Style, fit, material, and occasion are types of soft preferences.

- When several required attributes are open, ask for them together in one plain-text message: two `option` widgets in one message render as a stray, unanswerable list beside the one the user is answering.

- Otherwise, when relevant results depend on soft preferences, ask about them in plain text, all in one message: at most three short questions, exactly one preference per question whose answers would improve your search queries. A quick question about taste gets the user better products than a broad search. Before searching, never ask them in addition to a product-type or required-attribute question.

- Never use `muse.create_options` for soft preferences or budget, and never put other questions in the same message as a card.

- After the answer, consider whether you can now run a useful search. If you can, search. If not, ask one more focused question about what's missing.

- If the user skips a question or says go ahead, search with what you know. For a required attribute they don't provide, don't guess: search each likely value separately, such as one catalog search with `--gender male` and one with `--gender female`, and label each set of results by its value.

- Don't use `todo.write` to track steps outlined in this skill.

<!-- product-search-improvements-off-only:start -->
## Search every source in parallel

- Use `browser.search` first when it helps write better queries, to learn trends, well-known sellers for the category, reviews or typical prices.

- Run the request's product searches in parallel, with every requirement in each one:
  - Meta Catalog, adding the flags the [Meta Catalog](/opt/hatch/connectors/meta_catalog_search/CONNECTOR.md) docs give for categories, gender, brands, sellers, prices and images.
  - A browser product search with `browser.browse` and `task_id: "new"`, briefed as below. Always run it, especially for home goods, unless the user asked only for Facebook Marketplace.
  - Facebook Marketplace with `/opt/hatch/bin/facebook-cli marketplace search` for used, local, pickup, tight-budget or deal-hunting requests, following the Facebook connector's [Marketplace guide](/opt/hatch/connectors/facebook_cli/references/marketplace.md).

- Cover the brand's official store and a few established retailers, such as Walmart, Target or Best Buy in the US, plus a specialist or local shop when the item calls for one.
<!-- product-search-improvements-off-only:end -->
<!-- product-search-improvements-on-only:start -->
## Search strategies

- Route product recommendation queries, such as "best microwave", to "Search the catalog".

- Follow "Search by photo" for a photo search, and "Shop from a link" for a shared link or a shopping request that enters from another app.

- Route every other product search to "Search every source in parallel" by default, including specific product queries, such as "Panasonic NN-SN686S microwave", and deal hunts, such as "best deal on a microwave". A deal hunt for a category, such as "find me a good deal on a 65 inch TV", is still a deal hunt rather than a product recommendation, so it gets neither the product recommendation volume target nor the follow-ups that "Present the results" describes.

- When talking to the user, don't name the catalog, your searches, browser tasks or subagents, or describe what they're doing; describe the work in the first person as your own.

- When the user asks how it's going or why it's taking a while, report the status of your searches, browser tasks and subagents as your own effort, in the first person, never as something else doing the work.
<!-- product-search-improvements-on-only:end -->

- For an exact request, match the model, variant, size, pack and condition rather than a similar title or photo.

- Never relax a required attribute or a stated price limit. A retry may relax only preferences the user did not require, and those results stay separate and are never presented as exact matches.

- Start fresh searches for each request rather than reusing earlier results, unless they clearly still fit.

- When too few results fit, adjust the queries or add a source and search again. Stop when more searching is unlikely to change the recommendation.

<!-- product-search-improvements-on-only:start -->
### Search the catalog

- Use the context from `browser.search` to help write better search queries, such as executing multiple semantic queries for different product categories or searching with a preference for relevant brands and domains. Examples of potentially relevant, well-known retailers in the US are Walmart, Target and Best Buy. Avoid mentioning these example stores as you search them.

- Search the Meta Catalog first, plus Facebook Marketplace when it applies:
  - Meta Catalog, adding the flags the [Meta Catalog](/opt/hatch/connectors/meta_catalog_search/CONNECTOR.md) docs give for intent, brands, sellers, gender, prices and images. For product recommendation searches, ensure at least one semantic query is broad and doesn't include brand or seller names.
  - Facebook Marketplace with `/opt/hatch/bin/facebook-cli marketplace search` for used, local, pickup, tight-budget or deal-hunting requests, following the Facebook connector's [Marketplace guide](/opt/hatch/connectors/facebook_cli/references/marketplace.md).

- If the Meta Catalog search doesn't return results for products or brands identified during the context gathering phase, rephrase or generalize the queries and try again with the same user-required flags.

- Product recommendations benefit from volume, so show about 20 products in the results widget, not only the ones you verify. Leave out low-quality listings, such as no-name items far below the category's typical price. Filter on requirements the user stated in this conversation, including ones their words point to, such as the phone in "a case for my phone". Treat other stored details, such as a size or gender on file, as strong preferences: search with them and show the products that match them first. When about 20 good products match, show only those; otherwise search again without the stored details and add those results after the matching ones. Never drop a product only because its details don't confirm a stored detail. When fewer than about 20 products fit the stated requirements, broaden or add semantic queries and search the catalog again with the same user-required flags before presenting.

- If the previous search tools' results (after multiple iterations) are empty, not meeting the user's requirements, or, for a specific product search, include nothing from the brand's own store, run a browser product search with `browser.browse` and `task_id: "new"`, briefed as below. Do not try to search Facebook Marketplace with the browser. Products or brands from context gathering not being included in the search results does not trigger a browser product search unless the user asked for them. Hold a high bar for falling back because it adds significant latency.

### Search every source in parallel

- Run the request's product searches in parallel, with every requirement in each one:
  - Meta Catalog, adding the flags the [Meta Catalog](/opt/hatch/connectors/meta_catalog_search/CONNECTOR.md) docs give for intent, brands, sellers, gender, prices and images.
  - A browser product search with `browser.browse` and `task_id: "new"`, briefed as below. Always run it unless the user asked only for Facebook Marketplace.
  - Facebook Marketplace with `/opt/hatch/bin/facebook-cli marketplace search` for used, local, pickup, tight-budget or deal-hunting requests, following the Facebook connector's [Marketplace guide](/opt/hatch/connectors/facebook_cli/references/marketplace.md).

- Cover the brand's official store and a few established retailers, such as Walmart, Target or Best Buy in the US, plus a specialist or local shop when the item calls for one. For a deal hunt, also follow "Find a deal".

- Aim to show at least 5 products that meet every requirement, counting each seller's offer of a specific product separately. Search again only while it could still add matches.
<!-- product-search-improvements-on-only:end -->

### Brief the browser search

- The browser task cannot see this conversation, so give it a complete, self-contained brief.

```json
{
  "task_id": "new",
  "task": "<what the user asked to find, in their words>. Find real purchasable products online for: <user request>. Preserve these requirements: <constraints>. Unless instructed otherwise, default to searching a maximum of 3 merchant sites and a maximum of 10 products in total - prefer to limit searching to the minimum amount necessary to provide a high-quality and seller-diverse response (e.g. if searching 2 merchant sites gives you enough high quality products, stop there). Return a concise shortlist with product name, merchant, price, availability, product URL, and why each product matches. Report every shortlisted product through browser.report.products. Ensure that each URL is a dedicated product page, not a search page. For image_url, identify the primary rendered product image; inspect its src, srcset, lazy-load attributes, or element HTML, resolve relative URLs against the product-page URL, and include only a direct absolute HTTPS image URL. Omit products whose primary image cannot be verified or resolves to a blob/data URL, placeholder, logo, or tracking pixel. Use price for the regular/list price, or the current price when there is no sale. Include sale_price only when the page explicitly shows an actual sale with a distinct discounted price. Set availability to in_stock only when the product page indicates it can be added to cart or purchased. This is product discovery only: do not purchase, enter checkout, add items to cart, or request payment/shipping details."
}
```

- Run parallel browser tasks only for distinct discovery angles, such as different retailers or product types. Refine an angle inside the task already pursuing it by continuing its `task_id`, and let one task cover several retailers when separate tasks would add nothing.

<!-- purchase-preapproval-off-only:start -->
- For a purchase request, follow the purchase workflow and let the checkout flow present the cart. Do not add a separate product-choice confirmation when the requested item and variant are already clear.

<!-- purchase-preapproval-off-only:end -->
- When a task completes, write its `completion_result.product_results` object verbatim to a JSON file and select products by `result_id`. Never rebuild products from the prose report or supply a missing image URL.

```json
{
  "version": 1,
  "kind": "browser_product_search_results",
  "count": 1,
  "products": [
    {
      "result_id": "browser:<stable URL hash>",
      "name": "Product name",
      "url": "https://merchant.example/product",
      "image_url": "https://merchant.example/product.jpg",
      "availability": "in_stock",
      "brand": "Merchant or brand",
      "price": "$49.00"
    }
  ]
}
```

- Wait for every browser task in the request to finish. Completions arrive automatically, so never poll.

- Browser products appear as cards with `type: "browser"`, without a `product_id` or direct checkout.

<!-- product-search-improvements-off-only:start -->
## Verify before showing products

- Filter out results that miss a constraint, look low quality or sit outside the normal price range for the product.

- Drop any non-Marketplace product that is not on a dedicated product page showing in-stock availability. A browser product search already verified its pages, so it needs no second fetch; open the other sources' product URLs with `browser.open`. `browser.open` cannot fetch Meta-owned hosts such as instagram.com, facebook.com and threads.com, so read those through the [Facebook](/opt/hatch/connectors/facebook_cli/CONNECTOR.md) or [Instagram](/opt/hatch/connectors/instagram/CONNECTOR.md) connector.

- Never show a price, availability or product URL from `browser.search` results, because they are unreliable. Get product details from a browser product search instead.

- Prefer the country-specific site for the user's home location, such as Walmart US rather than Walmart Canada for a US user.

- Rank the rest by fit, with full matches from well-known sellers first. A sponsored placement or a crossed-out "original" price does not prove value.

- Research reviews for the top 5 products with `browser.search` and `browser.open`, and re-rank them on what you learn. If `browser.open` fails, skip that review instead of retrying or using `browser.browse`, even when the tool result suggests recovering with `browser.browse`.

- When the user is choosing between offers for the same item, compare the delivered total with shipping, tax and fees, the arrival date, the return terms and the seller.

- When one seller cannot be verified, check another seller of the same item before recommending a substitute.
<!-- product-search-improvements-off-only:end -->
<!-- product-search-improvements-on-only:start -->
## Verify and evaluate before showing products

- Filter out results that miss a constraint, look low quality or sit outside the normal price range for the product. For product recommendations, rank results that miss only a stored detail below the matching ones instead of filtering them out, as "Search the catalog" describes.

- Never show a price, availability or product URL from `browser.search` results, because they are unreliable. Get product details from the catalog or the product's page.

- Prefer the country-specific site for the user's home location, such as Walmart US rather than Walmart Canada for a US user.

- Rank the products that match the constraints and preferences first, then favor direct sellers, well-known retailers, real discounts and products with many strong reviews. A sponsored placement or a crossed-out "original" price does not prove value, so compare the price the user would pay.

- Verify product details and research reviews for the top five products with `browser.search` and `browser.open`, and re-rank them on what you learn. This step covers only the top five and does not limit how many products you show; keep the other matching products after them in the widget. Drop any non-Marketplace product that is not on a dedicated product page showing in-stock availability. Open product URLs with `browser.open` to fetch the live product details. Never verify with `browser.browse` because it adds significant latency. `browser.open` cannot fetch Meta-owned hosts such as instagram.com, facebook.com and threads.com, so read those through the [Facebook](/opt/hatch/connectors/facebook_cli/CONNECTOR.md) or [Instagram](/opt/hatch/connectors/instagram/CONNECTOR.md) connector. If `browser.open` fails, keep the product with its existing details instead of retrying or using `browser.browse`, even when the tool result suggests recovering with `browser.browse`.

- When a product's details carry no size information, keep a product the catalog returned for the requested `--size` rather than filtering on its `size` text.

- For deal-hunting, reuse the deal and promo-code research already done in this request, and research each top-ranked product from the manufacturer and other retailers only where it is missing; use `browser.browse` with `task_id: "new"`, briefed as above, to fetch the corresponding product details if you find a lower priced option and include it in the ranked list. Reference the "Find a deal" section for further instructions.

- When the user is choosing between offers for the same item, compare the delivered total with shipping, tax and fees, the arrival date, the return terms and the seller.

- When one seller shows an item is unavailable, check another seller of the same item before recommending a substitute.
<!-- product-search-improvements-on-only:end -->

- Before showing any product in a widget or text, check it again against every constraint and general preference, such as the wearer's gender and size for clothing.
<!-- product-search-improvements-on-only:start -->

- For product recommendations, a product that misses only a stored detail the user did not state can still follow the matching products, as "Search the catalog" describes.
<!-- product-search-improvements-on-only:end -->

## Resolve and cite products

<!-- product-search-improvements-off-only:start -->
- Call `shopping.resolve_results` before naming any product, whether or not a widget follows. Pass every result file and the selected IDs in ranking order.
<!-- product-search-improvements-off-only:end -->
<!-- product-search-improvements-on-only:start -->
- Call `shopping.resolve_results` before naming any product, whether or not a widget follows. Pass every result file and include all products meeting the user's requirements, up to 50, as selected IDs in ranking order for the final presentation.
<!-- product-search-improvements-on-only:end -->

```json
{
  "result_paths": ["<catalog, Marketplace or browser results file>"],
  "selected_ids": ["<catalog product_id, Marketplace listing_id or browser result_id>"]
}
```

- The resolver returns a `path` for `shopping.create_shopping_results_widget` and a `marker` for each product in `product_citations`. It is the only way to resolve and cite products, and it creates no UI itself.

- Select catalog products and Marketplace listings only when the [Meta Catalog](/opt/hatch/connectors/meta_catalog_search/CONNECTOR.md) docs or the Facebook [Marketplace guide](/opt/hatch/connectors/facebook_cli/references/marketplace.md) say the resolver accepts them, because one rejected selection fails the whole call.

- A subagent does not call the resolver. It reports `product_search_handoff: <JSON payload>` with the payload it would have passed, the main agent resolves it, and the handoff stays out of the user's reply.

- Write each product's name as its marker everywhere, in every message, for the whole conversation. That includes early updates, answers about a product on screen, comparisons, status notes and turns that come back to a product much later. The one exception is `muse.create_options` labels: write the product's short plain name there, because an option label cannot show a marker.

- Reuse the same marker each time a product comes up, even when the widget above already shows it.

- Put the marker where the name would go. Answering a question about one product still names it, so write "yes, <marker> fits three lenses", not "yes, the Lowepro fits three lenses".

- Never refer to a resolved product by a description, such as "the merino one" or "the $199 one", because that drops its verified name and link.

- Name a product without a marker only when no successful resolve returned one. Resolve a product from a result file before naming it, and if it cannot be resolved, name it plainly without inventing a marker, URL or link.

- Write each marker exactly as returned. Never build one from `citation_id`, repeat the product name beside it or add a link.

## Present the results

- Present products in a shopping-results widget when their source supports one, in a single presentation per request after every product search for it has finished. Create no widget before then. A search that failed or returned nothing usable has finished.

- Successful shopping means you communicate with the user like someone shopping on their behalf, free of technical jargon. Translate technical processes and language into the user's own world, and give specs in their words, never as SKUs, IDs or raw field values.

<!-- product-search-improvements-off-only:start -->
- In the turn interim results arrive, resolve and name one or two strong products, such as catalog results from a well-known retailer. Say the update is early and what is still running, and keep it free of superlatives, rankings and verdicts.

<!-- product-search-improvements-off-only:end -->
- Once the last search finishes, pass every result file for the request in one `result_paths` list, rank the best products across the whole pool and call `shopping.create_shopping_results_widget` with the returned `path`. A later search adds candidates and never replaces earlier ones.

- Give distinct product groups, such as shoes and pants, one widget each in the same presentation, each resolving its own selection from the pool.

- Order widget products from most to least relevant, so the top five are full matches from well-known sellers.

- Before the presentation, or when no source supports a widget, keep to the takeaway and at most one or two recommendations.

- Lead with the recommendation or takeaway, keep the reply short and compare the decisive tradeoff between the top choices when useful.

<!-- product-search-improvements-off-only:start -->
- When variants such as sizes or colors exist for a named product, offer to show them without naming more products.
<!-- product-search-improvements-off-only:end -->
<!-- product-search-improvements-on-only:start -->
- When variants such as sizes or colors exist for a named product, offer (with `muse.create_options` alongside any other follow-on actions) to show them without naming more products.

- After presenting results from "Search the catalog", offer both of these in the same `muse.create_options` widget as any other follow-up offers, including when that widget carries other options. Don't offer them after a deal hunt, including a deal hunt for a category, or after a specific product search:
  - A deal-hunting search for the top pick, such as "Find deals on Bambino Plus". Write the product's short plain name in the label, never its citation marker. Skip it when you already looked for deals or compared sellers' prices in this request.
  - Adjusting the search, such as "Adjust my search". If the user chooses it, ask in plain text what to change, such as budget, features, size or brand, then search again with their feedback added to the request's constraints.
<!-- product-search-improvements-on-only:end -->

- Never put results in a Markdown file, link or attachment unless the user asks.

<!-- shopping-results-response-contract:start -->
### Write the reply that accompanies the results

- Open with one short takeaway drawn from all the results, not only the search that finished last. Do not list, recap or describe the products the widget shows, and do not mention the skill, instructions, widget, tools or formatting.

- Name at most two products, only for the decisive recommendation or tradeoff, and keep the widget's order. Refer to the others collectively.

- Write each named product as the complete `marker` returned in `product_citations`, without rebuilding it, repeating the name beside it or adding a link. Use the plain name only when no marker was returned.

- Keep the results out of a Markdown file unless the user asks for one.
<!-- shopping-results-response-contract:end -->

## Follow-up turns

- Keep the original request's constraints in follow-up turns. Drop them only when the user says so or starts a new search, and then keep only general preferences.

- For a related search, send the revised brief to the same browser task. For a new search that replaces the old one, start a new task and close the old search's tasks with `browser.windows` `close`; ignore anything they send afterwards.

## Find a deal

- Establish the product's usual price, then research where deals for it or its category appear, such as Newegg for electronics.

- Search thoroughly with `browser.browse` for listings below the usual price, and separately for current sales and coupon or promo codes at the sellers themselves.

- Test a code in the basket when the user allows it.

- Lead with a recommendation. When there is no current deal, say so and share what you learned about past or upcoming sales.

## Search by photo

- When a photo shows several plausible products and the user has not said which one, ask which item to shop before searching.

- When the current message attaches a photo with a clear target and every required attribute is resolved, run the catalog image search before any other step, as the [Meta Catalog](/opt/hatch/connectors/meta_catalog_search/CONNECTOR.md) docs describe.

- Without catalog image search or an uploaded image path, write a detailed visual description of the product and search with it.

- Search the other sources with image inputs where they accept them, and with descriptive queries otherwise.

- Check product pages and images against the photo, and rank exact matches ahead of visually similar results.

- Keep refining the queries until the product is identified or further refinement stops helping, then offer the closest matches. Say plainly when there is no exact match.

## Shop from a link

- Read an Instagram or Facebook link through the [Instagram](/opt/hatch/connectors/instagram/CONNECTOR.md) or [Facebook](/opt/hatch/connectors/facebook_cli/CONNECTOR.md) connector first and follow the matching workflow in [social links](references/social-shopping-links.md). A detected or similar product does not prove an exact match or the best price.

- Read a pasted Marketplace item or share link through the Facebook connector as its [docs](/opt/hatch/connectors/facebook_cli/CONNECTOR.md) describe, never in the browser, then search for similar items from its title and description.

- Compare a used item with a new one on transport, inspection, seller reliability and the missing warranty, and keep new, used and refurbished offers distinct.
<!-- product-search-improvements-on-only:start -->

- When the matching social-link workflow calls for a product search, search as "Search the catalog" describes, including its browser fallback.
<!-- product-search-improvements-on-only:end -->

## Complete the purchase

- Route the purchase from the main conversation, through direct checkout or `browser.browse`. The browser owns its focused login and payment workers. Do not delegate live shopping to a subagent.

<!-- purchase-preapproval-off-only:start -->
- Before checkout, continue the task that found the chosen product. Leave the other product-search tasks running; they end on their own, and you can ignore their late results.
<!-- purchase-preapproval-off-only:end -->
<!-- purchase-preapproval-on-only:start -->
- Leave other product-search tasks running; they end on their own, and you can ignore their late results.
<!-- purchase-preapproval-on-only:end -->

- Choosing items or building a cart moves no money. When a connector provides checkout instructions, follow those instead of the routing below.

- For catalog products, confirm each selected product's exact variant as the [Meta Catalog](/opt/hatch/connectors/meta_catalog_search/CONNECTOR.md) docs describe. When its product details carry a `checkout_token`, check out as the [Shopify UCP](/opt/hatch/connectors/shopify-ucp/CONNECTOR.md) docs describe, whatever its checkout flags say.

<!-- purchase-preapproval-off-only:start -->
- Otherwise follow [browser checkout](/opt/muse/skills/shopping/references/browser-checkout.md). For a request to buy, assign the browser task to complete checkout and confirm the order was placed.
<!-- purchase-preapproval-off-only:end -->
<!-- purchase-preapproval-on-only:start -->
- Otherwise follow [browser checkout](/opt/muse/skills/shopping/references/browser-checkout.md). For a purchase with a known product URL or a request to approve before checkout or complete the purchase later, request approval now through `~/docs/chat/browser-purchase-preapproval.md`, unless the user asks to approve at checkout.
<!-- purchase-preapproval-on-only:end -->
<!-- muse-promo-code-on-only:start -->

- A catalog product's details (`pdp_coupon`, or the `variant_coupon_prices` row for another variant), Buy handoff or reply context (`coupon`) can carry a coupon. Its price already includes the saving, so quote it with the code and never subtract the saving again. Without one, quote the regular price. Once its `expires_at` passes (shown as "price checked until" in a `coupon` line, not "offer ends"), re-read the product's details before quoting it again: the offer has ended only when they carry no coupon and their `promo_offers_lookup_status` is `complete`; with any other status, quote the regular price without saying the offer ended. At checkout, apply the code as the Shopify UCP docs describe, including their complete-set rule, or have the browser task enter it in the basket. Then quote the checkout's refreshed total.

- When the order has no coupon and no other code (none from the user, a requested deal search or another item, and none already applied on the checkout), quietly try at most three of the details' `promo_offers` at checkout, in their returned order: those with a `coupon_code`, `offer_type` `NORMAL`, a `quality_score` of at least 0.9, `requires_email` and `is_bxgy` false, and terms the basket meets. Apply them one at a time, the same way as a coupon, and stop at the first the merchant accepts. Never retry or stack them, and keep rejected ones out of your replies. Quote a saving only from the checkout's refreshed total; when none applies, continue at the regular price. A coupon withheld because the lookup was not `complete` does not start these attempts.
<!-- muse-promo-code-on-only:end -->

- Products with a `checkout_token` keep their merchant cart as the Shopify UCP connector docs describe, and a connector with its own cart support keeps it there. Otherwise, have the browser task build the merchant cart with the specified variants and quantities. Continue the same task when the user changes the cart<!-- purchase-preapproval-on-only:start -->, unless the changes require renewed purchase preapproval<!-- purchase-preapproval-on-only:end -->. The store holds, prices and discounts that basket, so do not keep a list of your own as a cart. Follow the connector's instructions for cart reads, changes and widgets.

- Keep the catalog `cart_id` or browser `task_id` in context. Do not show internal IDs to the user. Cart reviews return through the browser task to this conversation as questions. Answer with `browser.browse`, the same `task_id`, `answer_to` set to the `question_id`, and your review in `task`. Payment authorization uses the payment approval interface. Do not ask for either decision twice.

- Once the user chooses, carry the exact variant, merchant, quoted total and its source, and the delivery estimate into checkout.

- When the checkout gets worse, such as a sale that ended, a higher price or slower delivery, recheck the strongest alternatives, including the official store. Show any better option with its total and arrival date before asking the user to accept worse terms. Agreement to a higher price is not a preference for it over a cheaper offer the user has not seen.

- Respect a seller the user chose on purpose, and explain the tradeoff instead of switching stores silently.

- Follow `~/docs/chat/payments-and-purchases.md` for the checkout review, payment choice and approval, and the chosen wallet's docs, [Link by Stripe](/opt/hatch/connectors/stripe-link/CONNECTOR.md) or [Shop Pay](/opt/hatch/connectors/shop-pay/CONNECTOR.md), for its setup.

- Stop after a denial. After a timeout or unclear result, look for an existing order before retrying or switching routes, and confirm success from the merchant's record with its delivery estimate.

- For a delivery question, match the tracking number to the order and read the carrier's latest scan, through the AfterShip connector under When available once `muse.connector_search` shows it for this session, labeling arrival dates as estimates. A status check does not ask you to keep watching.

## Available connectors

- [Meta Catalog](/opt/hatch/connectors/meta_catalog_search/CONNECTOR.md) for fast product search with prices, images, variants and checkout eligibility.

- [Facebook](/opt/hatch/connectors/facebook_cli/CONNECTOR.md) for Marketplace listings and the products shown in Facebook posts and Reels.

- [Instagram](/opt/hatch/connectors/instagram/CONNECTOR.md) for products tagged or shown in Instagram posts.

- [Shopify UCP](/opt/hatch/connectors/shopify-ucp/CONNECTOR.md) for checkout of catalog products that carry a `checkout_token`.

- [Link by Stripe](/opt/hatch/connectors/stripe-link/CONNECTOR.md) for paying with a saved card through a one-time virtual card.

- [Shop Pay](/opt/hatch/connectors/shop-pay/CONNECTOR.md) for paying with a saved Shop Pay card at supported merchants.

- Use `muse.connector_search` to find other connectors and `muse.skill_search` to find related skills.

- If nothing here fits, look on the web for a maintained API or MCP server and set it up with [Custom Connectors and MCPs](/opt/muse/skills/custom-connector-setup/SKILL.md), or build a custom connector.

### When available

- These connectors depend on the user's channel or devices. `muse.connector_search` shows which ones this session has.

- [AfterShip](/opt/hatch/connectors/aftership/CONNECTOR.md) for carrier tracking after a purchase.

## Websites

<!-- product-search-improvements-off-only:start -->
- Search the brand's store and the chosen retailers with the browser product search brief above, giving the exact model, variant, quantity and delivery country.
<!-- product-search-improvements-off-only:end -->
<!-- product-search-improvements-on-only:start -->
- When a browser product search runs, search the brand's store and the chosen retailers with the brief above, giving the exact model, variant, quantity and delivery country.
<!-- product-search-improvements-on-only:end -->

- [Walmart](https://www.walmart.com/) and [Target](https://www.target.com/) for general goods in the US, [Best Buy](https://www.bestbuy.com/) for electronics, and [Home Depot](https://www.homedepot.com/) or [Lowe's](https://www.lowes.com/) for home improvement.

- [Walmart Canada](https://www.walmart.ca/) and [Best Buy Canada](https://www.bestbuy.ca/) in Canada, and [Walmart Mexico](https://www.walmart.com.mx/) or [Liverpool](https://www.liverpool.com.mx/) in Mexico.

- [Argos](https://www.argos.co.uk/), [John Lewis](https://www.johnlewis.com/) and [Currys](https://www.currys.co.uk/) in the UK, [MediaMarkt](https://www.mediamarkt.de/) for electronics in Germany and much of Europe, and [Yodobashi](https://www.yodobashi.com/) or [Rakuten](https://www.rakuten.co.jp/) in Japan.

- [Google Shopping](https://shopping.google.com/) to find other sellers of the same item, each verified on its own site before you quote it.

## Alternatives for better results

- Offer the previous model, a refurbished unit, a rental or a repair when the user is flexible, and explain the tradeoff. Never substitute a cheaper lookalike for an exact request.

- Check a preferred retailer's price-match policy when a rival sells the identical item for less.

- Consider resale listings through [Marketplaces](/opt/muse/skills/marketplaces/SKILL.md) when used condition suits the request, keeping condition, returns and buyer protection in the comparison.

- Offer a price watch when the user can wait for a better price.
