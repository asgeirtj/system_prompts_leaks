---
name: "printify"
description: "Use Printify to browse catalog data, manage shops and products, and review or create orders."
icon: "printify"
metadata: { "includeInPrompt": false }
---

# Printify (Print on Demand)

## Purpose
Use the `printify` CLI to manage shops, products, uploads, orders, and catalog lookups.

## Tooling
Use the installed CLI directly from `PATH`:

```sh
printify <subcommand> [options]
```

Global flags:
- `--timeout-secs <seconds>` (optional, default 30): HTTP timeout.

Core commands:
- `status`
- `authorize-url`
- `verify`
- `set-token` (reads token from stdin)
- `disconnect`
- `shops`
- `products --shop-id <id> [--product-id <id>]`
- `create-product --shop-id <id> --json '<json>'`
- `update-product --shop-id <id> --product-id <id> --json '<json>'`
- `delete-product --shop-id <id> --product-id <id>`
- `publish-product --shop-id <id> --product-id <id>`
- `orders --shop-id <id> [--order-id <id>]`
- `create-order --shop-id <id> --json '<json>'`
- `upload --file <path>`
- `blueprints [--blueprint-id <id>]`
- `print-providers --blueprint-id <id>`
- `variants --blueprint-id <id> --provider-id <id>`
- `shipping --blueprint-id <id> --provider-id <id>`

JSON output contract:
- `status`: parse `ok`, `status`, `connect_url`, `disconnect_url`, and `reason`
- `authorize-url`: parse `ok`, `authorize_url`, and `connect_url`
- `verify`: parse `ok`, `action`, and `error`
- `set-token`: parse `ok`, `status`, and `reason`
- `disconnect`: parse `ok`, `action`, `config_path`, `removed`
- parse `ok`, `status`, `body`, and `error`
- Read results retain Printify's raw timestamps and add semantic UTC and
  user-local forms for record creation/update and order production,
  fulfillment, delivery, or cancellation times.

## Auth
First-use setup:
1. Run `printify status` to check connection state.
2. If not connected and `connect_url` is present, replace `<connect_url>` with the returned URL and share exactly this Markdown link: `[Connect Printify](<connect_url>)`; do not paste the raw URL separately.
3. If `connect_url` is missing, run `printify authorize-url` and share the returned `connect_url` the same way.
4. The user can generate a token at `https://printify.com/app/account/api`.
5. If the user provides a token through the CLI flow, store it only through `printify set-token`; do not write auth files directly.
6. Run `printify verify` after setup when you need to confirm the token works.
7. Never print the access token in chat output.

## Operating Rules
1. Always check `printify status` before API calls. If not connected, guide the user through the auth setup above.
2. List shops before performing shop-specific operations to get the correct `shop_id`.
3. Confirm with the user before creating, updating, or publishing products. Product deletion may proceed from a clear, unambiguous request without an additional confirmation.
4. Confirm with the user before creating orders (orders may trigger charges).
5. When browsing the catalog, start with `blueprints` then drill into `print-providers` and `variants`.
6. On HTTP 401, tell the user their token may be expired and to generate a new one at `https://printify.com/app/account/api`.
