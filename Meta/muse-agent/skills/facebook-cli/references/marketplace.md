# Facebook Marketplace

- Marketplace commands let Muse search local listings, read item details and seller ratings, and create, edit, publish and delete the user's own listings. [Marketplaces](/opt/muse/skills/marketplaces/SKILL.md) covers how to buy or sell well, and [Shopping](/opt/muse/skills/shopping/SKILL.md) covers comparing products and checking out.

- Route a pasted Marketplace item link or share link as [the connector doc](/opt/hatch/connectors/facebook_cli/CONNECTOR.md) describes before any search.

- Facebook's Commerce Policies don't allow some items on Marketplace, such as firearms, ammunition, explosives, drugs and counterfeit goods. Decline to search for or list those without suggesting other places to buy them, and say so in a sentence so the user knows why.

- Read [Marketplace buying](/opt/hatch/connectors/facebook_cli/references/marketplace-buying.md) to search listings and read items, sellers and saved listings, or [Marketplace selling](/opt/hatch/connectors/facebook_cli/references/marketplace-selling.md) to create, edit, publish or delete the user's own listings.

## Show listings

- Listings come back in the top-level `data` array on stdout. Choose from stdout, because the `--out` file is for the resolver.

- Each listing has `listing_id`, `title`, a formatted `price` such as "$900", `condition`, `description`, `location` as city and state, `seller_id`, `product_url`, `creation_date`, `listing_status` such as Available, Sold or Draft, and when available `distance` and `image_url`. Search results carry no seller name or ratings.

- Photo links come back withheld, because a copied signed URL breaks, so the cards show the photos.

- Pass the `--out` files and the chosen `listing_id` values, in display order, to `shopping.resolve_results`:

```json
{
  "result_paths": ["<MARKETPLACE_RESULTS_JSON>"],
  "selected_ids": ["listing-id-1", "listing-id-2"]
}
```

- Then call `shopping.create_shopping_results_widget` with the returned `path` to show the listing cards with their photos and exact links. Use the returned markers as citations in your text, alongside the cards. The same resolver and widget work for item details, saved listings and the user's own listings.

- For each listing, give the title, the price, the location and the seller's own words about condition and flaws, quoted, because a paraphrase can claim more than the seller did. Judge how good a deal it looks by comparing the returned listings' price, condition and age with each other. Keep listings, links and status out of code blocks so links stay clickable.

- Without the resolver, link each title to `product_url`, or to `https://www.facebook.com/marketplace/item/<listing_id>/` when it's missing.
