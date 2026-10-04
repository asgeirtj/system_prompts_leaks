# Shopping Backends

Load this file only when you need backend-specific filters.

## Facebook Marketplace

Use for local, secondhand, pickup, strict-budget, and deal-hunting requests.

Base search flow:

```sh
MARKETPLACE_RESULTS_JSON=$(mktemp "${TMPDIR:-/tmp}/facebook-marketplace-search.XXXXXX")

facebook-cli marketplace search --query "<item>" --limit <N> --out "$MARKETPLACE_RESULTS_JSON"
```

Useful flags:
- `--max-price`, `--min-price` in dollars
- `--latitude` and `--longitude="<lng>"` together for location search; quote negative coordinates with `=`
- `--radius-in-miles` for local distance
- `--sort-by best_match|price_ascend|price_descend|creation_time_descend|distance_ascend`
- `--allowed-item-conditions new,refurbished,used` for condition filtering
- `--delivery-method local_pickup_only|shipping_only|pickup_and_shipping`
- `--max-listing-age-in-days` for recency
- `--limit <N>` for page size (default and max 20; higher values are capped)
- `--after <cursor>` to continue a search — pass the `paging.cursors.after` value from the previous response (absent `paging` means no more results)

Call `shopping.resolve_results`:

```json
{
  "result_paths": ["<MARKETPLACE_RESULTS_JSON>"],
  "selected_ids": ["listing-id-1", "listing-id-2"]
}
```

The resolver maps Marketplace `listing_id` values into shopping result cards.  
Present the returned `path` with `widget.create` using
`kind: "shopping_results"` and `data.path`.

To present catalog and Marketplace picks together:

```json
{
  "result_paths": ["<CATALOG_RESULTS_JSON>", "<MARKETPLACE_RESULTS_JSON>"],
  "selected_ids": ["catalog-id-1", "listing-id-1"]
}
```

Present the returned `path` with `widget.create` using
`kind: "shopping_results"` and `data.path`.
