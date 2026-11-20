# Shopping from Facebook Reels

- `post read` is useful for shopping for products found in a Facebook Reel. [Posts](/opt/hatch/connectors/facebook_cli/references/reading-posts.md) explains how to decode share links.

```sh
/opt/hatch/bin/facebook-cli post read --url '<Reel URL>' --out '<new file>'
```

- `--out '<file>'` requests recommendations for products similar to those in the reel, and to save those recommendations as a local shopping catalog file.

- If the user asks to choose only from products already shown, filter just those by verified attributes. A missing or unclear attribute isn't a match, and if none fit, say so without starting another search. This comes before the fresh-search paths below.

- If the response reveals a hard requirement, reuse its context for fresh searches rather than filtering recommendations or reading the Reel again.

- For a named product, a product type the Reel doesn't feature, or a hard requirement, leave out `--out` and use [Shopping](/opt/muse/skills/shopping/SKILL.md) for fresh searches with every requirement.

```sh
/opt/hatch/bin/facebook-cli post read --url '<Reel URL>'
```

- `shoppable_products` contains detected products. `featured_products` contains system-generated similar-product candidates; this does not mean the creator tagged or recommended those products. Exact matches, current prices and availability need supporting product data.

## Find products

- When shopping from Reels, prioritize the stated requirements and instructions. Apply relevant saved hard requirements even when the user did not repeat them, and let explicit current instructions override conflicting ones.

- Without a hard requirement, use the `--out` recommendations. A soft preference alone keeps those recommendations and their order.

- If a required detail is missing, explain what you couldn't verify.

## Use recommendations

- Without a hard requirement, `featured_products_status` describes the next step:

  - `available`: pass the file and all `ordered_featured_product_ids`, unchanged and in order, to `shopping.resolve_results`. These recommendations are ready to use without extra searches. The summary provides the context; the file goes directly to the resolver.

  - `unavailable`: the IDs are empty and no catalog was written. Search for detected products through Shopping, or ask what the user wants if there is no target. This status does not mean the Reel could not be read or that creator tags are missing.

## Present products

- Fresh searches use Shopping's catalog and browser sources, or catalog sources only when requested.

- After the searches are complete, combine all usable files and selected IDs in one `shopping.resolve_results` call. Present the results together as shopping cards with corresponding citation markers. File paths and the availability of the optional recommendation list are internal search details; omit them from progress updates and final replies.

- Before a purchase, verify the offer and use Shopping's price, delivery and checkout checks.
