# Shopify

- `/opt/hatch/bin/shopify` connects to Shopify's official merchant MCP service. It is not Shopify's npm development CLI, and other Shopify connectors expose different tools, so take tool names and schemas from `list-tools`, never from memory.

- Checking out Shopify products as a shopper is the separate Shopify UCP connector.

```text
/opt/hatch/bin/shopify status
/opt/hatch/bin/shopify authorize-url
/opt/hatch/bin/shopify list-tools
/opt/hatch/bin/shopify call-tool --name <tool> --arguments-json '<JSON object>'
/opt/hatch/bin/shopify disconnect
```

## Work before a store is connected

- `find-mock-shop-catalogs`, `generate-business-names`, `generate-domain-names`, `search_docs_chunks` and `validate_graphql_codeblocks` work without a store. Let a new merchant explore sample catalogs, names and domains before asking them to connect.

- Show suggested business names and domains as plain text. Never share a returned `signupUrl`, because it starts a separate signup that does not return to this chat. The merchant can use a chosen name during setup and buy a domain in Shopify Admin once the store exists.

## Connect the store

- Run `status`. When no store is connected and the user wants one or asks for something that needs one, run `authorize-url` and share only the returned `connect_url`.

- The same link works for someone who has never used Shopify, because Shopify's sign-in page can create an account and a store and then return to the connection. Say so up front, so the user does not create a store separately first.

- When the user is done, run `status`, then `call-tool --name get-shop-info` to confirm which store is connected, with its currency and plan.

- Authenticated commands refresh an expired token automatically, so do not ask the user to reconnect for ordinary expiry. If a result reports a revoked grant or needs reauthorization, run `authorize-url`, and ask for a disconnect only when the result says it is necessary.

- Run `disconnect` only when the user asks. Never run `exchange-code`, which belongs to the sign-in flow.

## Find the right tool

- Call each of these tools through `call-tool`:

  - Store details with `get-shop-info`. Another store with `switch-shop`, followed by any other call, such as `get-shop-info`, which finishes the switch.

  - Products with `search_products`, `get-product`, `create-product`, `update-product` and `bulk-update-product-status`.

  - Collections with `search_collections`, `get-collection`, `create-collection`, `update-collection` and `add-to-collection`.

  - Inventory with `get-inventory-levels` and `set-inventory`, always reading levels first to resolve the inventory item, location and current quantity.

  - Orders and customers with `list-orders`, `get-order` and `list-customers`.

  - Discounts with `create-discount`, and reports with `run-analytics-query`, whose description includes ShopifyQL examples.

  - Shopify documentation with `search_docs_chunks`.

- For anything else in the admin, or when a dedicated tool lacks a field, call `graphql_schema`, then `validate_graphql_codeblocks`, then `graphql_query` or `graphql_mutation`, in that order every time. Try this route before saying a task cannot be done.

- Themes, checkout, payments and domains need Shopify Admin, at the store domain that `get-shop-info` returns. Point the merchant there when neither a dedicated tool nor the GraphQL route can make the change.

## Change store data

- Confirm with the merchant before any write, including creating, updating or bulk-changing products and collections, setting inventory, creating discounts, importing a catalog and running `graphql_mutation`. A request to create a product does not approve unrelated promotions or catalog changes.

- Inspect the returned result as well as the command status, because Shopify can report a tool failure inside a successful response.

- After a timeout or lost response to a write, check the affected record with a read tool, such as `search_products`, before repeating it. If the outcome cannot be confirmed, report that and stop. Fix and retry only a request that Shopify rejected before applying it.

- Ask what the merchant sells before creating products, and never invent a catalog.

- For a first store, go one step at a time. Read `get-shop-info`, import the chosen sample catalog or create the merchant's own products with title, description, price and image URLs, group them with `create-collection` and `add-to-collection`, set inventory if they track stock and add a launch discount only if they want one.

## Import a sample catalog

- Call `find-mock-shop-catalogs` with what the merchant sells, in their words, and ask that one question first if they have not said. Present the best matches with their descriptions, product and collection counts, currency and `storefrontUrl`, labeling each link as the source sample storefront.

- If nothing fits, ask the merchant to describe the business another way. If the sample-catalog tools are missing from `list-tools` or keep failing, say so and offer to create products with `create-product` instead.

- The sample storefront has no import button. Once the store is connected and the merchant approves, call `import-mock-shop-catalog` with the chosen `subdomain`.

- An import copies the first two collections and up to eight products from each, at most sixteen products, and publishes the new records to the Online Store. Prices are copied without currency conversion, and the records are samples to edit or replace before launch, not supplier stock.

- Repeating the same import is safe and fills in missing records and memberships without overwriting earlier imports or merchant edits. If Shopify reports `partial: true`, wait briefly and repeat it.

- Verify with `search_products` and `search_collections`, then report created, reused, skipped, unpublished or partial results and any currency mismatch.

- The import does not change existing products or copy the theme, homepage, navigation or store name, and `storefrontUrl` previews the source catalog, not the merchant's store. Never say the store will look like that preview, and tell the merchant to set up the theme in Shopify Admin if they want the homepage to feature the catalog.

## Report Shopify Email performance

- Use `run-analytics-query` on `marketing_engagements`. Unless the user gives another period or metric, start with this query:

```text
FROM marketing_engagements SHOW engagements_sends, engagements_clicks, engagements_unique_clicks, engagements_impressions, engagements_fails, engagements_complaints, engagements_unsubscribes GROUP BY marketing_activity_title, marketing_activity_channel SINCE -90d UNTIL today ORDER BY engagements_sends DESC
```

- Run a query the user supplies unchanged. A successful result with `rowCount: 0` means no campaigns matched the period, not a failure. Report email-channel rows unless the user asks for other channels.

## Present results

- Muse shows the returned data, not Shopify's own widgets. Summarize results in the reply, and do not refer to a card, chart or preview the user cannot see.

## Related skills

- [Store Operations](/opt/muse/skills/store-operations/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
