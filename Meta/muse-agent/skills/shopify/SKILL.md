---
name: "shopify"
description: >
  Set up and operate a Shopify store with Shopify's official MCP server (the
  installed `shopify` command, NOT the npm Shopify CLI). Use when someone wants
  to sell online, start a store or business, or manage a Shopify store — even
  if they do not say "Shopify": "sell candles online", "open my first store",
  "add products", "check my orders", "set inventory", "make a discount",
  "show my sales". Before connection it can show relevant mock.shop sample
  catalogs, suggest business names, check domains, search shopify.dev, and
  validate GraphQL. The connect flow can create an account and store for a new
  user. Keywords: Shopify MCP, ecommerce, sample products, starter catalog,
  ShopifyQL, first store, create product.
icon: "shopify"
metadata: { "includeInPrompt": false }
---

# Shopify

The installed `shopify` command wraps Shopify's official MCP server. It is not
the Shopify CLI from npm; the only verbs are the four below. Tool names and
schemas come from `shopify list-tools`, never from memory — other Shopify
connectors expose tools this one does not.

```text
shopify status
shopify authorize-url
shopify list-tools
shopify call-tool --name <tool-name> --arguments-json '<JSON object>'
```

## Connecting

1. `shopify status`. If a store is connected, go straight to work.
2. Otherwise `shopify authorize-url` and share **only** the returned
   `connect_url` with the user. Nothing else in that response is for them.
3. When they say they're done, `shopify status`, then
   `call-tool --name get-shop-info` to confirm which store is connected.

Before a store is connected, `search_docs_chunks` (searches https://shopify.dev),
`validate_graphql_codeblocks`, `find-mock-shop-catalogs`, `generate-domain-names`,
and `generate-business-names` work. `get-storefront-generation` is usable only
with a `generationUUID` created by Shopify's storefront-generation widget;
`claim-storefront-preview` is a widget callback and must not be called directly.
Every other tool, including catalog import, needs a store. Do not ask someone
to connect merely to explore sample catalogs, names, domains, or documentation.

## Sample catalogs

When someone is starting a store, offer relevant mock.shop sample catalogs
before asking them to connect:

1. Call `find-mock-shop-catalogs` with what they sell, in their own words. If
   they have not said, ask that one question first.
2. Present the best matches with their descriptions, product and collection
   counts, currency, and `storefrontUrl`. Clearly label each link as the source
   sample storefront, then ask which catalog they want.
3. Once connected, confirm before calling `import-mock-shop-catalog` with the
   selected `subdomain`.
4. Verify the destination records with `search_products` and
   `search_collections`, then report created, reused, skipped, unpublished, or
   partial results and any currency mismatch.

An import copies the first two collections and up to eight products from each,
at most sixteen products, and publishes newly imported records to the Online
Store. Repeating the same import is safe: it fills missing records and
memberships without overwriting previously imported products or merchant edits.
If Shopify reports `partial: true`, wait briefly and repeat the same import.
These are sample records to edit or replace before launch, not supplier stock.

## Users without a store

The same `connect_url` works for someone who has never used Shopify. Shopify's
sign-in page lets them create an account and a new store, then returns them to
the connection. Tell them this up front so they don't go create a store
separately first. Once connected, offer a first-store sequence and take it one
step at a time:

1. `get-shop-info` to learn the store's name, currency, and plan.
2. Import the sample catalog they selected, or use `create-product` for their
   own products (title, description, price, images by URL). Ask what they sell;
   don't invent a catalogue.
3. `create-collection`, then `add-to-collection` to group them.
4. If they track stock, call `get-inventory-levels` before `set-inventory` to
   resolve the inventory item, location, and current quantity.
5. `create-discount` for a launch promotion, only if they want one.

Business-name and domain results may include `signupUrl` links for starting a
store. Use those for exploration; when the user is ready to connect Muse to
their store, share the connector's `connect_url` instead.

Point them at the Shopify admin (the domain from `get-shop-info`) for anything
this server doesn't cover: themes, checkout, payments, shipping, and connecting
or buying domains.

## Common tasks

| Task | Tools |
| --- | --- |
| Store details | `get-shop-info` |
| Business names and available domains | `generate-business-names`, `generate-domain-names` |
| Sample catalogs | `find-mock-shop-catalogs`, then `import-mock-shop-catalog` with the selected `subdomain`; this imports catalog data, not storefront design |
| Storefront previews | `get-storefront-generation` only for a generation already created by Shopify's widget |
| Products | `search_products`, `get-product`, `create-product`, `update-product`, `bulk-update-product-status` |
| Collections | `search_collections`, `get-collection`, `create-collection`, `update-collection`, `add-to-collection` |
| Inventory | `get-inventory-levels`, `set-inventory` |
| Orders and customers | `list-orders`, `get-order`, `list-customers` |
| Discounts | `create-discount` |
| Reports and trends | `run-analytics-query` (ShopifyQL; the description has examples) |
| Anything else in Admin | `graphql_schema` → `validate_graphql_codeblocks` → `graphql_query` or `graphql_mutation`, in that order, every time |
| How Shopify works | `search_docs_chunks` |
| Another store | `switch-shop`, then `get-shop-info` |

## Rules

- Authenticated commands refresh an expired access token automatically. Do not
  tell the user to disconnect and reconnect for ordinary expiry. If Shopify
  reports that the refresh grant was revoked or reauthorization is required,
  run `shopify authorize-url`; do not require a disconnect first unless the
  returned result explicitly says it is necessary.
- Inspect the returned result as well as the command status: Shopify can report
  a tool-level failure inside a successful MCP response.
- Confirm with the user before any tool that writes: create, update, set,
  bulk, discounts, catalog import, preview claims, `graphql_mutation`. Catalog
  import publishes sample products and collections to the Online Store; report
  partial imports and currency mismatches (prices are copied without conversion).
- A catalog import does not change the store name, theme, navigation, homepage
  sections, or pre-existing products. The `storefrontUrl` returned by
  `find-mock-shop-catalogs` previews the source mock catalog, not the destination
  store after import. Never say the destination storefront will look like that
  preview or offer its homepage as proof. After importing, verify the new records
  with `search_products` and `search_collections`, then report that the merchant
  must configure their theme in Shopify Admin if they want the homepage to feature
  the imported catalog.
- `switch-shop` must be followed by another tool call (the requested action,
  or `get-shop-info`) to finish the switch.
- `get-storefront-generation` only polls a `generationUUID` already created by
  Shopify's storefront-generation widget; it cannot start a generation or alter
  an existing store. `claim-storefront-preview` is called only by that widget,
  never directly by the model. Neither tool applies a mock catalog's theme to a
  connected store.
- Muse shows structured data, not Shopify's widgets. Summarize results in
  the reply; don't refer to a card, chart, or preview the user can't see.
