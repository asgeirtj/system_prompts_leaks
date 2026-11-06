# Shopping from an Instagram link

- For an Instagram share, check the current request's `product_context` attachment. If `data.params.kind` is `ig_shopping` and `data.params.post_url` matches the requested post, use `data.params.tagged_product_ids` to help find its tagged products. The list comes from the post creator, not from the user's choice of products.

- Read the supplied post with `post`, then run `media-understanding` for its media. Tagged products sit at `media[].shopping_context.tagged_products[]` in the `media-understanding` response, so inspect that complete array.

- Check that each ID appears in the post's product tags as `product_item_id`. If it doesn't, ignore that ID and use the post's tags and content to find what the user asked for. These IDs are hidden from the user; don't describe them or failed ID checks in replies.

- When the post tags several products and the user has not chosen, ask which product or products they want. Keep every chosen item, in the user's selection order.

- For each chosen item, keep its complete tagged record and its `product_item_id`, and verify that this exact ID occurs in that response. Persist the record's `creator_offsite_url` exactly, including a missing or blank value. Resolve any item that fails verification before continuing, without a fallback for it.

- Fetch product details for each verified tagged ID. Keep the returned `product.id` separately as the canonical ID, since it may differ from the tagged ID, and never overwrite one with the other.

```sh
/opt/hatch/bin/shopping product-details --product-id <tagged_product_item_id>
```

- Write one temporary `{"products": [...]}` JSON file with an entry for each chosen item, in selection order. Set `product_id` to the canonical ID and copy `product.name`, `product.price` and `product.images[0].url` from that item's product details into `name`, `price` and `image_url`. Copy nothing the product details lack, and never take product facts from the Instagram response.

- Set each entry's `url` by the first rule that applies:
  - If the user asked for a direct or non-affiliate merchant link, use that item's `product.url`.
  - Otherwise use the persisted nonblank `creator_offsite_url` from that item's own tagged record.
  - Use `product.url` as a fallback only after verifying that the matching tagged record has a missing or blank creator URL.

- Never copy one item's link onto another. Keep creator URLs verbatim, without opening them, following their redirects or canonicalizing them.

- Pass the file in `result_paths` and every chosen item's canonical ID in `selected_ids`, in selection order, to `shopping.resolve_results`. Run no product search for an item whose tagged ID is available, then present the results as [Shopping](/opt/muse/skills/shopping/SKILL.md) describes.

- A tagged ID settles which product it is, not whether the linked seller has the best offer. Follow Shopping for price and delivery comparisons before a purchase.

- If the post has no tagged product IDs, use its context as search clues for a Shopping product search without claiming an exact match.
