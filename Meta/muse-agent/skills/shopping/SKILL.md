---
name: "shopping"
description: "Use for any product or shopping question: find, reverse image search, shopping Instagram/Marketplace links, buy, compare, or evaluate real products with prices, images, and product page URLs, including buying or browsing Facebook Marketplace listings. Use when presenting shopping search results from any source. For shopping intent, load this skill first before any other skills."
metadata:
  includeInPrompt: true
---

# Shopping

You should always aim to save the user money. Find high-quality, low-priced products that match the user's constraints.

## Product search tools

The following are the primary tools for product search:
- Meta catalog search: `meta-catalog-search` enables rapid searches across Meta's product catalog
- Browser product search: `browser.spawn_task` enables slow but thorough searches across the web via an agentic browser; it has universal product coverage; always call it (unless the user explicitly asked only for products from Facebook Marketplace), especially for home goods, and run it in parallel with any other applicable product search tools
- Facebook Marketplace search: `facebook-cli` enables rapid searches for listings on Facebook Marketplace

After selecting products, call `shopping.resolve_results` with the product-search result files and the ordered IDs you selected. When the tool is available, always call it before mentioning products, whether or not the response will also create a widget:

```json
{
  "result_paths": ["<catalog, Marketplace, or browser product-search JSON path>"],
  "selected_ids": ["<selected product, listing, or browser result ID>"]
}
```

The tool resolves and normalizes those selections, returns a `path` for optional widget presentation, and returns `product_citations` markers for the response. This is the single product-resolution and citation path. It does not create or present UI; call `widget.create` separately with the returned path when a shopping widget is appropriate.

### Markers belong to the product, not to the widget

A marker is how you write a product's name anywhere, in every message, for the whole conversation. It is not part of the shopping-results presentation and it is not discharged by having presented one.

So a marker belongs in all of these, not just the roundup:

- an early update naming a pick while a search is still running
- an answer to a follow-up question about a product already on screen ("is that one washable?", "does it fit three lenses?")
- a comparison or a narrowing down to two of the products you already showed
- a status note that names a candidate the search has turned up
- any later turn that comes back to a product, however many messages ago you showed it

Write the marker even when you have already used it earlier in the conversation, and even when the widget above already shows that product. Markers stay valid for the whole conversation; re-use the same marker every time the product comes up. Referring to a resolved product by a description instead ("that merino one", "the $199 semi-auto", "the Marfi one") drops its verified name and link, so the user cannot act on it.

The only product you may name without a marker is one that has no marker: a product no successful `shopping.resolve_results` call returned. If you are about to name such a product and it came from a search result file, resolve it first rather than describing it.

## User Preferences

`~/memory/shopping/PROFILE.md` is the user's durable shopping preferences. Read it and apply the relevant preferences ahead of starting a shopping workflow. A user may not have a profile established yet. If it doesn't exist, proceed as is.

## Required attributes

Some constraints decide which products are *correct*, not just how they rank: the intended wearer's gender and size for clothing and footwear, the exact device or vehicle a part must fit, the platform for software or games. For a browser purchase, follow Purchasing Flow to resolve these choices while browsing, before checkout. For other requests, resolve them before searching.

Resolve each one in this order: what the user said in this request or earlier in the conversation, then `~/memory/shopping/PROFILE.md`, then `~/USER.md` (already in your context), then `muse.memory_search` for durable preferences and sizes. Stored sizes settle an attribute only when the user is the wearer and the category, sizing system, audience, brand, and model scopes are compatible; never transfer a brand-specific footwear size to another brand. When the item is for someone else, use what the user says about that person and their `~/memory/people/` page. Never infer the wearer's gender from the user's name, and never fall back to a default.

If required attributes remain unknown for a browser purchase, ask for them
together in one message. Use plain text when several choices need answers.

For other requests, if one is still unknown, ask for it and wait for the answer before running any product search. Ask about exactly one attribute per turn. When several are open, pick the one that most changes which products are correct (the wearer's gender before their size, the device before the part), ask only that, wait for the reply, then ask the next one in its own turn. For a known, bounded choice, call `muse.create_options` and follow its guidance. Ask open-ended questions in plain text. Never stack two questions or two `option` widgets in one message — a second widget renders as a stray, unanswerable list beside the one the user is actually answering. Do not search first and narrow afterwards: an unresolved required attribute returns wrong products, and offering to filter once they're on screen is too late. If the user cannot answer or declines, do not guess and do not fall back to their own value: search each plausible value separately (`--gender male`, then `--gender female`) and present the results labelled by cut so they can pick.

Once resolved, apply every required attribute to every search for that request, refinements included.

## Workflows

### Product discovery

1. Ensure you fully understand the user's request, resolving every required attribute above before you search.
2. Gather any relevant context that will be useful when writing product search queries. Use `browser.search` to discover trends, well-known sellers for a product category, reviews, or typical prices.
3. Use the relevant search tools to execute product search queries. Always call browser product search (unless the user explicitly asked only for products from Facebook Marketplace, e.g. "couches on marketplace"); run it in parallel with any other applicable product search tools. Include all user constraints in every search; catalog retries may relax only the parameters allowed under Meta Catalog Search below. Don't re-use previous search results unless it makes sense in context; by default always make new searches to get fresh results.
4. Review the search results. Filter out any that don't match the user constraints, aren't high quality, or are outside the normal price distribution for that product. Call `browser.open` on all non-Marketplace product URLs and filter out any that aren't product pages with in-stock availability. `browser.open` cannot fetch Meta first-party links (instagram.com, facebook.com, threads.com/threads.net, and other Meta-owned hosts are blocked for it). Use the platform's native tools for those. Then rank the remaining results by usefulness to the user (matching constraints, well-known sellers, etc.). Prefer the version of each retailer's site for the user's country.
5. If you don't find enough relevant search results, adjust your queries (and potentially your product search tools) and repeat steps 3-4.
6. A request gets one shopping-results presentation, and it comes after every product search for that request has finished. Until then, do not create a `shopping_results` widget. Always mention products in your text responses while you wait for all product searches to finish if there are quality interim results (e.g. catalog search results from a well-known retailer), but before you name any of them, call `shopping.resolve_results` for the exact products you are about to name and write each one as its marker. A marker you already have stays good for the rest of the conversation. Once those products are resolved, mention 1-2 products using product markers as long as the update says it is early and says what is still running. Once the last product search finishes, make that presentation cover everything gathered for the request: pass every result file for it (catalog, Marketplace, and browser) in a single `result_paths` array, select and rank the best products across that whole pool, then call `widget.create` with the returned `path`. That is one widget, unless the request spans distinct product groups: those get one widget each in the same response, each resolving its own selection from that same pool (see Response Formatting). A group split is still one presentation, never a sequence of them over time. A later search adds candidates to the pool; it never replaces the searches that came before it, and the presentation must not be only about the search task that finished last. A search that fails or returns nothing usable has finished: present what the other sources returned rather than withholding the widget. Follow the Response Formatting section below.
7. If the user continues the original query in follow-up turns, maintain the constraints of the original request. Drop constraints only when the user explicitly instructs you to do so or pivots to a new search query, in which case drop all previous constraints that aren't generally applicable or based on high-level user preference. On a pivot, close every active browser search for the old request with `browser.close_task` before starting the new search. Use `browser.list_tasks` if you need the task IDs. Ignore late results from the old request.

Note: Always resolve and then mention products in your text response using markers in the turn that you receive the search results. Don't wait for all the search results to be returned before doing this.

Example: "help me shop for a black sweater"

### Finding deals

1. Identify the typical/baseline price for the product.
2. Research where deals might be found for this specific product or product category e.g. newegg.com often has sales for electronics
3. Use `browser.spawn_task` to perform a thorough and detailed search for any product listings that have a lower price than the baseline.
4. Use `browser.spawn_task` to look for any coupon or promo codes for relevant products.
5. Present the relevant search results to the user. Be succinct and aim to provide a recommendation or takeaway. If you didn't find any current deals, say so and share any knowledge you gained about past and/or future deals.

Example: "find me a deal on a new microwave"

### Reverse image search

1. If the image contains multiple plausible products and the user does not specify which one to shop, ask which item to search for before running a product search.
2. If the current user message attaches an image and asks to shop a clear target, and every required attribute is already resolved, run direct catalog image search before any other step.
3. If direct image search is unavailable or no uploaded image path is available, derive a detailed visual description.
4. Execute searches with the relevant product search tools, using image search inputs when available and descriptive queries otherwise.
5. Verify product pages / images against the original image; rank exact matches ahead of visually similar results.
6. Continue searching and adjusting your queries as necessary in order to identify the product. Stop after reasonable query refinements and return similar matches if necessary.
7. Present the relevant search results to the user. Be honest with the user if you're unable to find an exact match.

### Purchase

Run the purchase workflow on the main agent. Do not hand any part of it to `subagent.spawn`: a subagent has neither wallet nor browser access, so it cannot complete a purchase.

1. Identify the products and any variants or quantities already specified.
2. Close active browser discovery tasks that are no longer relevant with `browser.close_task`. Use `browser.list_tasks` to find their IDs. Ignore late results for those products after purchase begins.
3. Route on the eligibility flags `meta-catalog-search` already returned; do not call `shopping product-details` just to decide the route.
4. For Meta catalog products with `is_agentic_checkout_creation_enabled: true`, call `shopping product-details` once per selected product to pin the exact variant. Then load `/opt/hatch/skills/shopping/references/shopify-ucp.md` and follow its purchase flow.
5. Otherwise, load `/opt/hatch/skills/shopping/references/browser-checkout.md` and follow its handoff flow.

### Cart-building

The user is gathering items to buy later, not buying now. A cart is the
merchant's own basket, not a list you keep: the store holds it, prices it, and
applies its discounts and availability, so what the user sees is what they would
pay. Remembering products yourself gets you none of that.

1. For Meta catalog products with `is_agentic_checkout_creation_enabled: true`, load `/opt/hatch/skills/shopping/references/shopify-ucp.md` and follow its Cart section. Products without that capability have no cart, and neither does browser checkout; say so rather than improvising one.
2. Keep the `cart_id` for the rest of the conversation. It is internal state. Do not show it to the user.
3. Follow the Purchase workflow once the user is ready to check out their cart.

### Shopping Instagram links

1. Use `instagram-cli post` and `instagram-cli media-understanding` to fetch the shopping context for the provided Instagram link.
2. If the shopping context contains multiple products, ask the user which product they want to focus on.
3. If the shopping context contains product IDs, use `shopping product-details --product-id <product id>` to fetch the corresponding product details. Write a temporary `{"products": [...]}` JSON file whose entries copy `product.id`, `product.name`, `product.price`, `product.url`, and `product.images[0].url` verbatim from the product-details response into `product_id`, `price`, `name`, `url`, and `image_url`. Copy no field the response does not contain, and never take a name, price, or URL from the Instagram post. Pass that file and the copied product IDs to `shopping.resolve_results`. Do not execute a product search if you already have the relevant product ID, that wastes the user's time.
4. If the shopping context contains no product IDs, execute the product discovery workflow using the data provided in the shopping context.
5. Surface the found products in the shopping results widget and mention them via product markers in the text response.

## Meta Catalog Search

### Product Shape

```json
{
  "rank": 1,
  "product_id": "Meta catalog product id",
  "url": "product page URL",
  "name": "product title",
  "brand": "brand or merchant name",
  "price": "$49.00",
  "sale_price": "$39.00",
  "description": "product description",
  "image_url": "direct image URL",
  "color": "available or selected color",
  "material": "material when present",
  "pattern": "pattern when present",
  "size": "available or selected size",
  "gender": "gender/audience when present",
  "category": "category when present",
  "rating": "rating and review count when present",
  "is_agentic_checkout_creation_enabled": true,
  "is_agentic_checkout_completion_enabled": true
}
```

### Search

`--query` performs semantic text matching. Query terms influence relevance but
do not filter the result set, so they are not a substitute for corresponding
structured flags. For example, a query for a boy's product can return products
for other genders unless `--gender male` is also passed.

A text call accepts up to eight distinct queries; use only as many as are
useful.

```sh
CATALOG_RESULTS_JSON=$(mktemp "${TMPDIR:-/tmp}/meta-catalog-search.XXXXXX")
meta-catalog-search \
  --query "<product query>" \
  --retries 2 --out "$CATALOG_RESULTS_JSON"

# Preview the first 20 products
jq '.products[0:20] | map(del(.image_url))' "$CATALOG_RESULTS_JSON"

# Stream products
jq '.products[] | select((.sale_price // .price // "") | test("\\$[0-9]")) | del(.image_url)' "$CATALOG_RESULTS_JSON"

# Pick products under a budget
jq '
  [
    .products[]
    | select(.product_id != null and .url != null and .image_url != null)
    | select((.sale_price // .price // "") | test("^\\$[0-9]"))
    | select(((.sale_price // .price) | gsub("[^0-9.]"; "") | tonumber) <= 100)
    | del(.image_url)
  ][0:50]
' "$CATALOG_RESULTS_JSON"
```

When the current user message attaches an image and asks to shop a clear target, start with a direct image search using the uploaded image path from the prompt context:

```sh
CATALOG_RESULTS_JSON=$(mktemp "${TMPDIR:-/tmp}/meta-catalog-search.XXXXXX")
meta-catalog-search --image-path <uploaded_file_path> --retries 2 \
  --out "$CATALOG_RESULTS_JSON"
```

Do not use `--visual-query` instead of `--image-path` on the attaching turn. Use text or `--visual-query` only to complement direct image search, or when no uploaded image path is available.

`product_id` is what `shopping.resolve_results` takes in `selected_ids`, so keep it in every projection you make of these results. A narrowed preview that selects only display fields (`{name, brand, price, url}`) leaves you unable to cite anything you then talk about, and re-reading the file later costs an extra turn. When you narrow, keep `product_id` alongside whatever else you need:

```sh
jq -r '.products[] | [.product_id, .brand, .name, (.sale_price // .price), .size] | @tsv' "$CATALOG_RESULTS_JSON"
```

Constraint flags for the `meta-catalog-search` CLI:
- `--category` for a hard category constraint
- `--gender` for a hard gender/audience constraint resolved under Required attributes. Use exactly `male`, `female`, or `unisex`, preserve it on refinements, and do not infer it from product type or styling. Use `--prefer-gender` instead for a soft preference.
- `--brand` ensures available products from the specified brand are returned and ranked first, with other brands available as backfill. Always specify `--brand` when the user requests results from a specific brand.
- `--domain` ensures available products from the specified seller domain are returned and ranked first, with products from other sellers available as backfill. Always specify `--domain` when the user requests results from a specific seller; pass its canonical hostname without a scheme or path.
- `--boost-brand-seller-website true|false` defaults to `true` and boosts the official seller website associated with each value passed to `--brand`
- `--seller-type direct|secondhand` adds a seller-type ranking preference; the default is `direct`
- `--currency` with `--min-price` / `--max-price` (values in cents) for budget limits
- `--color`, `--material`, `--style`, `--prefer-brand`, `--prefer-gender` for soft preferences

For requests for used, pre-owned, secondhand, thrifted, vintage, or
refurbished inventory, set `--seller-type secondhand` and  
`--boost-brand-seller-website false`.

Apply every requirement in the request and context to every Meta Catalog Search
call, in each query and every applicable structured parameter. Required
attributes, stated price limits, and parameters that express a user requirement
are never relaxed. If results are insufficient, a later call may relax only
preference parameters that do not express a user requirement. Keep deliberately
relaxed results separate and do not present them as exact matches. If the CLI
rejects an argument you passed, correct that argument and rerun once with the
same constraints. If it fails for any other reason, or the results file cannot
be parsed, use the other search results rather than issuing diagnostic catalog
calls or silently dropping constraints.

### Product details

During product selection, before purchase, or when the user asks, it can be beneficial to determine the variants available for a given product, such as different clothing sizes.

For a specific Meta catalog product returned by `meta-catalog-search`, retrieve its corresponding product variant data from the catalog with the following command:

```sh
shopping product-details --product-id "<product_id>"
```

Keep the response's runtime-authored `hatch_telemetry_context` unchanged for
the selected product and pass it whole to the checkout route as described by
the route reference. Never invent, edit, or reuse it for another product.

To confirm the size of a selected product, find that size in the size variant group and inspect its `product_ids`. Keep every non-size selected attribute (such as color) constant. Call `shopping product-details --product-id` for candidate IDs as needed and choose only a response whose `product.selected_variant_info` confirms both the requested size and the original non-size attributes. Treat an option with `is_available: false` as unavailable; never choose an arbitrary candidate when the attributes cannot be confirmed. Use the confirmed response's `product.id` for checkout, not the product ID from the `variant_groups`. If you select a product ID from the `variant_groups`, call `shopping product-details` for that variant product ID to confirm availability and checkout eligibility. Do not expose product IDs or this lookup process to the user.

### Widget

The `shopping_results` widget can be used to surface Meta catalog products in a detailed list-view component. Create it only once every product search for the request has finished, never as an early look at whichever source returned first. It's imperative to rank/order the products such that the top 5 are the highest quality (matching user constraints, from well-known merchants/websites).

```json
{
  "result_paths": ["<CATALOG_RESULTS_JSON>"],
  "selected_ids": ["product-id-1", "product-id-2"]
}
```

Call `widget.create` with the `path` returned by `shopping.resolve_results`:

```json
{
  "kind": "shopping_results",
  "present_now": true,
  "data": {
    "path": "<path returned by shopping.resolve_results>"
  }
}
```

## Browser Product Search

### Search

Call `browser.spawn_task` with a complete search brief:

```json
{
  "task": "<what the user asked to find, in their words>. Find real purchasable products online for: <user request>. Preserve these requirements: <constraints>. Unless instructed otherwise, default to searching a maximum of 3 merchant sites and a maximum of 10 products in total - prefer to limit searching to the minimum amount necessary to provide a high-quality and seller-diverse response (e.g. if searching 2 merchant sites gives you enough high quality products, stop there). Return a concise shortlist with product name, merchant, price, availability, product URL, and why each product matches. Also populate browser_hand_off.product_results with every shortlisted product. Ensure that each URL is a dedicated product page, not a search page. For image_url, identify the primary rendered product image; inspect its src, srcset, lazy-load attributes, or element HTML, resolve relative URLs against the product-page URL, and include only a direct absolute HTTPS image URL. Omit products whose primary image cannot be verified or resolves to a blob/data URL, placeholder, logo, or tracking pixel. Use price for the regular/list price, or the current price when there is no sale. Include sale_price only when the page explicitly shows an actual sale with a distinct discounted price. Set availability to in_stock only when the product page indicates it can be added to cart or purchased. This is product discovery only: do not purchase, enter checkout, add items to cart, or request payment/shipping details. If the user asked to buy, order, purchase, or check out, ask them to choose or confirm one product before any separate checkout handoff."
}
```

Ensure the search brief is complete and self-contained: the browser task cannot see this conversation and receives no information about the user or their request beyond what you put in `task`.

Parallel browser tasks are for distinct discovery angles that improve coverage; follow-up refinements stay within the browser task already pursuing that angle.

Never surface product details (price, availability, product page URLs) from `browser.search` results to the user. They are unreliable. Always use `browser.spawn_task` for product search and fetching product details.

Call `browser.open` on all product URLs returned from the browser product search and filter out any products where the URL isn't a dedicated product page with in-stock availability.

### Product shape

Browser product searches finish asynchronously. When the completion arrives, use the structured
`completion_result.product_results` object rather than reconstructing products from the prose
report. It has this shape:

```json
{
  "version": 1,
  "kind": "browser_product_search_results",
  "count": 2,
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

Do not copy fields out of the prose report or invent a missing image URL.

### Widget

The `shopping_results` widget can surface verified browser products using the generic catalog card
layout. Browser cards deliberately use `type: "browser"`, omit `product_id`, and disable agentic
checkout.

Write `completion_result.product_results` verbatim to a temporary JSON file. Select and rank
products by `result_id`, then resolve them into the presentation payload:

```json
{
  "result_paths": ["<browser completion_result.product_results JSON path>"],
  "selected_ids": [
    "browser:stable-url-hash-1",
    "browser:stable-url-hash-2"
  ]
}
```

Pass catalog or Marketplace result files in the same `result_paths` array when combining sources. Then call `widget.create` with the following payload:

```json
{
  "kind": "shopping_results",
  "present_now": true,
  "data": {
    "path": "<path returned by shopping.resolve_results>"
  }
}
```

If several browser tasks belong to one shopping request, aggregate their completed result files
by passing each file in one `shopping.resolve_results` call. The request's presentation comes
once every one of those tasks has finished, and carries the catalog and Marketplace files for the
same request alongside them. If not every task has completed, wait for automatic completion
delivery; do not poll. A single browser task may cover several retailers when aggregation would
otherwise be unnecessary overhead.

## Marketplace Search

### Printed listing shape

```json
{
  "listing_id": "Marketplace listing id",
  "title": "listing title",
  "location": "city, state location of the listing",
  "price": "$49.00",
  "condition": "condition of the item, e.g., Used (good)",
  "description": "listing description",
  "product_url": "listing URL",
  "image_url": {"withheld": "signed URL; ..."}
}
```

### Search

```sh
MARKETPLACE_RESULTS_JSON=$(mktemp "${TMPDIR:-/tmp}/facebook-marketplace-search.XXXXXX")

facebook-cli marketplace search \
  --query "<natural language item query>" \
  --limit <N> \
  --out "$MARKETPLACE_RESULTS_JSON"
```

With location or local pickup filters:

```sh
facebook-cli marketplace search \
  --query "<item>" \
  --max-price <dollars> \
  --latitude <lat> \
  --longitude="<lng>" \
  --radius-in-miles <miles> \
  --delivery-method local_pickup_only \
  --limit <N> \
  --out "$MARKETPLACE_RESULTS_JSON"
```

The command prints each listing with `image_url` replaced by a `withheld` object. The full payload, including signed photo URLs, goes only to the `--out` file. Pick listings and their `listing_id` values from the printed output. Do not read, print, or `jq` the `--out` file; pass its path unchanged in `result_paths`. To show a listing's photo, select it in `shopping.resolve_results`: its card carries the photo. Select only listings whose printed output has an `image_url`: `shopping.resolve_results` fails the whole call when a selected listing has no photo.

### Listing details

Fetch full details and seller trust signals with `facebook-cli marketplace listing details --listing-id <listing_id>` and `facebook-cli marketplace seller-info --listing-id <listing_id>`. Search results carry only `seller_id` (no seller name), so `seller-info` is how you surface the seller's name, rating, and review count. See `references/backends.md` for the full flag set and pagination.

### Pasted listing links

When the message contains a Marketplace item or share link, do not open it in the browser: those pages sit behind a login wall. Use the facebook-cli to fetch the listing instead: `facebook-cli marketplace listing details --url '<pasted link>'` for item links (needs no linked account), or `facebook-cli link-sharing decode-url --url '<pasted link>'` first for share links (needs a linked account), then pass the decoded item link to `details --url`. Then search similars from the title and description and resolve them with `shopping.resolve_results`.

### Widget

The `shopping_results` widget can be used to surface Marketplace listings in a detailed list-view component. Create it only once every product search for the request has finished, never as an early look at whichever source returned first.

```json
{
  "result_paths": ["<MARKETPLACE_RESULTS_JSON>"],
  "selected_ids": ["listing-id-1", "listing-id-2"]
}
```

Then call `widget.create` with the `path` returned by `shopping.resolve_results`:

```json
{
  "kind": "shopping_results",
  "present_now": true,
  "data": {
    "path": "<path returned by shopping.resolve_results>"
  }
}
```

## Constraints

Before surfacing any products to the user (either via widget or text), double-check that the products match all constraints for the user request and/or general preferences. E.g. for clothing requests, are all the products of the right gender & size for the user request

## Response Formatting

- Prefer presenting products in widgets rather than text when the product search tool supports them, in the one presentation that comes after every search for the request has finished. Any response before that, or any request whose searches support no widget, keeps to the takeaway and at most one or two recommendations.
- Lead with the recommendation or takeaway. Keep the rest of the response succinct and easily scannable. Briefly compare the decisive tradeoff between the top choices when useful.
- Say plainly when an update is early. Any response that names a product before every search is in opens by saying it is early and what is still running ("here are a few initial picks, still running a more thorough search"), and stays provisional throughout: no superlatives, no ranking language, no category verdict, nothing shaped like "the best X is Y". You have not seen the whole pool yet, so you cannot know. A recommendation is earned only once every search has returned and you have reviewed all of it together.
- When presenting products in widgets, pay attention to their order. Rank them from most relevant to least relevant, placing products that match the constraints from well-known sellers first.
- If there is a natural grouping of products in the response (e.g. user asked for shoes & pants), surface those different groups in separate widgets, side by side in that one presentation rather than spread across turns.
- For every product included in `product_citations`, use only the exact complete `marker` value returned by the successful `shopping.resolve_results` call. Put the marker where the product name belongs. Do not construct it from `citation_id`, copy a product name next to it, or invent names, URLs, links, or citation IDs. If a product has no returned marker, only reference it by name.
- If you know that variant (size, color, etc.) data exists for a product named in the text response, offer to surface it if the user is interested, e.g. "Would you like to know what other colors that sweater comes in?" Do not name additional products while making the offer.
- Never surface results in a Markdown file (no link, no preview, no attachment) to the user unless explicitly asked to do so.

### When this turn mentions a product without presenting a widget

This is most turns in a shopping conversation: the early update while a search runs, every follow-up question about something already on screen, every comparison, every later turn that circles back to a product. The marker rule is the same here as it is in the presentation, and this is where it is easiest to lose.

- Write each product as its marker, exactly as `shopping.resolve_results` returned it. This holds no matter how far back the product was resolved.
- Answering a question about one product still names that product, so put its marker where the name would have gone: confirming that a bag fits three lenses reads as "yes, `<marker>` fits three lenses", not "yes, the Lowepro fits three lenses".
- Narrowing the products already on screen down to one or two names each of the ones you keep, so each of those takes its marker. Do not substitute a distinguishing attribute ("the merino one", "the $199 one", "the Brooks pair") because it is shorter.
- A product from a search result file that no successful resolve returned has no marker yet. Resolve it before naming it. If it genuinely cannot be resolved, name it plainly and do not invent a marker, a URL, or a link for it.

<!-- shopping-results-response-contract:start -->  
### When this turn presents a shopping-results widget

These rules apply only to user-facing prose accompanying a shopping-results presentation. Begin directly with the takeaway. Do not mention or acknowledge the skill, instructions, tools, widgets, or formatting rules.

- Do not mention the shopping-results presentation or narrate its contents.
- Never surface the results in a Markdown file unless explicitly requested.
- Do not recap, enumerate, or describe the products already presented.
- Give one short takeaway. Name at most two products, and only when they are needed for the decisive recommendation or tradeoff. Treat those names as the complete allowlist and refer to all other presented products collectively.
- Base the takeaway and any recommendations on all available search results, not only the search task that finished last.
- When multiple products are named, preserve their relative order from the corresponding widget.
- For every named product included in `product_citations`, use only the exact complete `marker` value returned by the successful `shopping.resolve_results` call. Put the marker where the product name belongs. Do not construct it from `citation_id`, copy a product name next to it, or invent names, URLs, links, or citation IDs. If a named product has no returned marker, reference it by name only.

<!-- shopping-results-response-contract:end -->

## Auth
- No user-provided token is required.
- Meta catalog search relies on installed runtime tools and environment-backed access.
- Meta catalog requests use the Meta Catalog connector's read permission.
