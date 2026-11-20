# Printify

- Printify makes print-on-demand products and ships them for a merchant's shops. Run `/opt/hatch/bin/printify`, which uses the user's Printify personal access token. `--timeout-secs` changes the 30-second default.

## Connect

- Run `status` before any other call. If it is not connected and returns `connect_url`, share exactly `[Connect Printify](<connect_url>)`, without pasting the raw URL separately. If `connect_url` is missing, run `authorize-url` and share its `connect_url` the same way.

- The user creates a token in [Printify's API settings](https://printify.com/app/account/api) and enters it in the connect flow. `set-token` reads a token from stdin and is the only command that stores one, so never pass a token as an argument, write an auth file or repeat a token in chat.

- Run `verify` when you need to confirm the token works. It reports `ok: false` only when no token is stored or Printify answers HTTP 401 or 403, and it also reports `ok: true` when Printify cannot be reached. On HTTP 401, say the token may have expired and that the user can create a new one in the same settings.

- `status` reports `ok` and `status`, plus `connect_url` and sometimes `reason` when Printify is not connected. Run `disconnect` only when the user asks.

```text
/opt/hatch/bin/printify status
/opt/hatch/bin/printify authorize-url
/opt/hatch/bin/printify verify
/opt/hatch/bin/printify disconnect
```

## Find the shop and product

- Run `shops` first to get the right `shop_id` for every shop-specific command.

- Browse the catalog from `blueprints`, optionally with `--blueprint-id`, to `print-providers --blueprint-id ID` and then `variants --blueprint-id ID --provider-id ID`. Read `shipping --blueprint-id ID --provider-id ID` for delivery costs.

## Manage products and orders

```text
/opt/hatch/bin/printify products --shop-id <id> [--product-id <id>]
/opt/hatch/bin/printify create-product --shop-id <id> --json '<json>'
/opt/hatch/bin/printify update-product --shop-id <id> --product-id <id> --json '<json>'
/opt/hatch/bin/printify publish-product --shop-id <id> --product-id <id>
/opt/hatch/bin/printify delete-product --shop-id <id> --product-id <id>
/opt/hatch/bin/printify orders --shop-id <id> [--order-id <id>]
/opt/hatch/bin/printify create-order --shop-id <id> --json '<json>'
/opt/hatch/bin/printify upload --file <path>
```

- Read the current record and the command's `--help` before changing anything, and keep the chosen variants and print provider through to execution.

- Confirm with the user before creating, updating, publishing or deleting a product.

- Confirm before `create-order`, because an order can charge the merchant.

## Check the result

- Read `ok`, `status` and `body`. An HTTP success alone is not an order receipt.

- Read results keep Printify's raw timestamps and add readable UTC and local times for record creation and updates and for order production, fulfillment, delivery and cancellation.

- After an uncertain write, read the product or order before trying again.

## Related skills

- [Store Operations](/opt/muse/skills/store-operations/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
