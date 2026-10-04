# Facebook Marketplace

Sell on Facebook Marketplace, and manage what you have listed: create, edit,
publish and delete your own listings, and page through `my-listings`.
For buying (search, item details, seller trust), load the `shopping` skill.

## Workflow

### Step 0: Pasted item or share links

Route pasted links before any search or browser use. When the user pastes
a Facebook Marketplace item link (`facebook.com/marketplace/item/<listing_id>`,
with or without a slug) or a share link (`facebook.com/share/<token>`),
never open it in the browser: those pages sit behind a login wall the
browser cannot pass.

For an item link, fetch the listing directly (needs no linked account):

```sh
facebook-cli marketplace listing details --url '<pasted link>' --out <file>
```

Single-quote the link: never let the shell expand a pasted URL. Supply
exactly one of `--url` or `--listing-id`.

For a share link, decode it first (needs a linked Facebook account):

```sh
facebook-cli link-sharing decode-url --url '<pasted link>'
```

If `original_url` is null, missing, or blank, the link is expired or
invalid: ask the user to paste the marketplace/item link instead. If it
names a `/marketplace/item/<id>` link, pass it to `listing details --url`.
If it names a post, photo, video, or reel URL, follow `references/posts.md`
instead. Anything else is unsupported content, so say so and stop. Never
open a pasted link in the browser.

### Step 1: Parse the user's request

Extract these parameters from natural language:
- **queries**: What they're looking for (required, at least one)
- **max_price**: Maximum budget in dollars (if mentioned)
- **min_price**: Minimum price in dollars (if mentioned)
- **location**: Where to search — there is **no** `--location` flag; geocode the place name to coordinates and pass `--latitude` and `--longitude` together
- **radius_in_miles**: How far to search in miles (if mentioned)
- **limit**: How many results per page (`--limit`; default and max 20 — higher values are capped to 20)
- **sort_by**: How to order results (best_match, price_ascend, price_descend, creation_time_descend, distance_ascend)
- **max_listing_age_in_days**: How recent (e.g., "listed this week" -> 7)
- **allowed_item_conditions**: Item condition filter (new, refurbished, used, etc.; comma-separated)
- **delivery_method**: Delivery preference (local_pickup_only, shipping_only, pickup_and_shipping)
- **category_ids**: Category IDs to filter by (if the user specifies a product category)

### Step 2: Search

Give every call its own `mktemp` file for `--out`, one per page: `--out`
truncates, so a reused path drops the earlier page from the resolver. Step 3
hands the file to the resolver.

```sh
MARKETPLACE_RESULTS_JSON=$(mktemp "${TMPDIR:-/tmp}/facebook-marketplace-search.XXXXXX")
facebook-cli marketplace search --query "<query>" --max-price <price> --limit <n> --out "$MARKETPLACE_RESULTS_JSON"
```

The other examples below omit `--out` for brevity.

With location:  
```sh
facebook-cli marketplace search --query "<query>" --max-price <price> --latitude <lat> --longitude="<lng>" --radius-in-miles <miles> --limit <n>
```

**Important**: For negative longitude values (e.g., western hemisphere), always use `--longitude="-121.8863"` with `=` and quotes. Without `=`, the shell/parser may interpret `-121` as a flag.

With additional filters:  
```sh
facebook-cli marketplace search --query "<query>" --sort-by price_ascend --allowed-item-conditions "new,refurbished" --delivery-method local_pickup_only --max-listing-age-in-days 7
```

Multiple queries:  
```sh
facebook-cli marketplace search --query "primary search" --query "alternate term"
```

With category filtering:  
```sh
facebook-cli marketplace search --query "<query>" --category-id <id1> --category-id <id2>
```

Pagination (cursor-based, max 20 per page):  
```sh
facebook-cli marketplace search --query "<query>" --after "<after_cursor_from_previous_response>"
```
The response carries the next-page cursor at `paging.cursors.after`. Pass it as
`--after` to fetch the next page. When `paging` is absent, there are no more
results.

### Step 3: Present results

The matching listings are in the top-level `data` array. From it, present a shortlist with:
1. **Listing image** — present it through the shopping-results cards described below. Never invent one.
2. **Title** and **Price**
3. **Description snippet** (brief excerpt from the listing description)
4. **Location**
5. **Listing link** — use the resolver marker described below so the exact `product_url` remains clickable
6. Your **recommendation** on best value (lowest price, proximity, condition)

Pick from stdout only listings with an `image_url` (a `{"withheld": ...}`
object): the resolver fails on a listing without a photo. Do not read the
`--out` file or write an image link: a copied signed URL breaks, and the card
shows the photo. Call `shopping.resolve_results` with the `--out` path and the
`listing_id` values you picked, in display order:

```json
{
  "result_paths": ["<MARKETPLACE_RESULTS_JSON>"],
  "selected_ids": ["listing-id-1", "listing-id-2"]
}
```

Use the returned markers for those listings instead of copying their
`product_url`; the resolver preserves the exact long URLs. Then
call `widget.create` with the returned `path`, `kind: "shopping_results"`, and
`present_now: true`. The widget supplies the browsable result images and links;
inline markers are compact citations and are not a replacement for the visual
cards. Keep the rest of the shortlist and recommendation workflow unchanged.

Search results carry only `seller_id`, **not** a seller display name or ratings.
Don't show a seller name from search output. To present the seller's name/ratings
for finalists, call `marketplace seller-info --listing-id <id>` (Step 5).

### Step 4: Item details (on request)

```sh
facebook-cli marketplace listing details --listing-id <LISTING_ID> --out <file>
```

Present the listing as a card, the same way as Step 3, with the full
description, price and condition, seller info, and creation date.

### Step 5: Seller info (on request)

```sh
facebook-cli marketplace seller-info --listing-id <LISTING_ID>
```

Present: name and follower count, average rating and total ratings, good/bad attribute breakdown.

### Step 6: Saved listings (on request)

```sh
facebook-cli marketplace saved [--keywords <text>] [--limit <n>] [--after <cursor>] --out <file>
```

Lists the user's own saved Marketplace listings. Use `--keywords` to filter by
text and `--after` (the cursor from the previous response) to fetch the next
page. Max page size is 20. Present them as cards, the same way as Step 3.

### Step 7: My listings (on request)

```sh
facebook-cli marketplace my-listings [--status active|pending|sold|draft] [--limit <n>] [--after <cursor>] --out <file>
```

Lists the authenticated viewer's **own** Marketplace listings (both active and
inactive — including drafts and sold items). Use `--status` to filter to a
single state and `--after` (the cursor from the previous response) to fetch the
next page. Default and max page size is 20. Each item has the same shape as a
search result (`listing_id`, `title`, `price`, `location`, `seller_id`,
`product_url`, `creation_date`, `listing_status`, `image_url`, ...). The
response is `{ "data": [ ... ], "paging": { "cursors": { "after": "<cursor>" } } }`;
`paging` is present only when another page exists. This is the entry point for
managing your own inventory — chain a `listing_id` into `marketplace listing
edit` or `marketplace listing delete`.

## CLI Reference

### Search
```
facebook-cli marketplace search [OPTIONS]

Options:
  -q, --query TEXT                 Search query (required, repeatable)
  --limit INTEGER                  Max results per page (default and max 20; higher values are capped to 20)
  --max-price FLOAT                Upper price bound in dollars
  --min-price FLOAT                Lower price bound in dollars
  --latitude FLOAT                 Search center latitude
  --longitude FLOAT                Search center longitude
  --radius-in-miles INTEGER        Search radius in miles
  --max-listing-age-in-days INT    Max listing age in days
  --sort-by [best_match|creation_time_descend|price_ascend|price_descend|distance_ascend]
  --allowed-item-conditions TEXT   Comma-separated conditions (new, refurbished, used, etc.)
  --delivery-method [local_pickup_only|shipping_only|pickup_and_shipping]
  --after TEXT                     Cursor for forward pagination (the `after` cursor from a previous response's paging.cursors.after)
  --category-id TEXT               Category ID filter (repeatable)
  --out PATH                       File for `shopping.resolve_results` (created or truncated)
```

### Item Detail
```
facebook-cli marketplace listing details (--listing-id <LISTING_ID> [...] | --url <ITEM_LINK>) [--out PATH]
```

Supply exactly one of repeatable `--listing-id` or one `--url` item link.
Share links are not accepted here: decode them with `link-sharing
decode-url` first. Needs no linked Facebook account.

### Seller Info
```
facebook-cli marketplace seller-info --listing-id <LISTING_ID>
```

### Saved Listings
```
facebook-cli marketplace saved [OPTIONS]

Options:
  --limit INTEGER    Max number of saved listings to return
  --keywords TEXT    Optional keyword filter for saved listings
  --after TEXT       Cursor for forward pagination (pass the after cursor from
                     the previous response to get the next page; max page size 20)
  --out PATH         File for `shopping.resolve_results` (created or truncated)
```

### My Listings
```
facebook-cli marketplace my-listings [OPTIONS]

Options:
  --status [active|pending|sold|draft]
                     Optional status filter; omit to return all your listings
  --limit INTEGER    Max number of listings to return (default and max 20)
  --after TEXT       Cursor for forward pagination (pass the after cursor from
                     the previous response to get the next page; max page size 20)
  --out PATH         File for `shopping.resolve_results` (created or truncated)
```

## Result Schema

### Search Results (JSON)

Cursor-paginated. The matching listings are in the top-level `data` array, and
the next-page cursor (when more results exist) is at `paging.cursors.after`:

```js
{ "data": [ { ...listing... } ], "paging": { "cursors": { "after": "<cursor>" } } }
```

`paging` is omitted when there is no next page. (There is no `total_results` or
echo of the `queries` — those were removed when search moved to standard cursor  
pagination.)

Each listing object in `data`:
- `listing_id` (string) — Listing ID
- `title` (string) — Item title
- `price` (string) — Formatted price (e.g., "$900")
- `condition` (string) — Item condition (e.g., "Used (like new)")
- `description` (string) — Listing description
- `location` (string) — City/state text
- `seller_id` (string) — Seller's user ID (no seller display name is included — fetch it via `seller-info` if needed)
- `product_url` (string) — Direct link to the listing on Facebook
- `creation_date` (string) — When the listing was created (ISO 8601)
- `listing_status` (string) — e.g., "Available", "Sold", "Draft"
- `distance` (string, nullable) — Distance from the search location (e.g., "11 mi")
- `image_url` (object, optional) — `{"withheld": ...}` when the listing has a photo; the resolver's card shows it

There is no `seller_name` in search results — only `seller_id`. (`my-listings`
returns the same shape.)

### Item Detail (JSON)

- `listing_id` (string) — Listing ID
- `title` (string) — Item title
- `description` (string) — Full description text
- `price` (string) — Formatted price (e.g., "$900")
- `currency` (string) — Currency code (e.g., "USD")
- `condition` (string) — Item condition
- `location` (string) — City/state text
- `seller_name` (string) — Seller's display name
- `seller_id` (string) — Seller's user ID
- `created_at` (string) — Creation date (e.g., "2025-02-01 18:30 UTC")
- `url` (string) — Direct link to listing on Facebook
- `image_url` (object, optional) — `{"withheld": ...}` when the listing has a photo; the resolver's card shows it

**Note**: Photos beyond the primary thumbnail are loaded via a separate deferred query and are not included in the item detail response.

### Seller Info (JSON)

- `seller_id` (string) — Seller's user ID
- `name` (string) — Seller's display name
- `followers` (int) — Follower count
- `avg_rating` (string) — Average star rating (e.g., "4.8")
- `total_ratings` (int) — Total number of ratings
- `good_attributes` (string) — Positive feedback summary (e.g., "Item as described (12), Fast communicator (8)")
- `bad_attributes` (string) — Negative feedback summary

## Recommendation Logic

When presenting results, recommend the "best value" by considering:
1. Price relative to similar items in the results
2. Seller trustworthiness (has name, high ratings, many followers)
3. Location (closer is better for local pickup)
4. Fetch item detail for top picks to check condition and description

## The publish gate (READ FIRST before any create/publish)

A listing only goes **live** on Marketplace when **all four** of these are present.
This is the single source of truth — the same gate applies whether the listing
publishes on create or later via `listing publish`:

| # | Publish requirement | Provided by |
|---|---------------------|-------------|
| 1 | **photos** (≥1) | `--photo <path>` (repeatable) |
| 2 | **condition** | `--condition <new\|used_like_new\|used_good\|used_fair\|used\|refurbished>` |
| 3 | **category** | `--category <name-or-id>` |
| 4 | **location** | `--latitude` **and** `--longitude` together |

If **any** of the four is missing, the listing is **saved as a draft, not
published** — even if the user asked to "post" or "list" it. `title` and `price`
are required to create at all, but they are **not** part of the publish gate.

**To publish reliably, gather and pass all four** (location = `--latitude` +
`--longitude` together; there is no `--location` flag). Do **NOT** omit
condition/category/location and assume the server will fill them in — omitting a
publish-gate field risks the listing being silently saved as a **draft** instead
of going live. If you genuinely can't get a field, treat the result as a draft and
tell the user. (The `publish` endpoint separately validates a draft's stored
state and returns `missing_fields` for anything absent; fix those via `listing
edit` and retry — see "Publishing a Draft Listing".)

**Always determine intent first, then state the outcome before acting:**

1. **Decide intent.** Does the user want it (a) **live now** ("post", "publish",
   "list it for sale") or (b) **saved as a draft** ("save a draft", "I'll finish
   it later")? If it's ambiguous, assume they want it live.
2. **Check the gate against what you have.** Before running create (or publish),
   walk the four requirements and identify which are present and which are
   missing.
3. **Tell the user the resulting status explicitly, and name any gaps.** Never
   leave the publish status implicit. Say either:
   - "This **will publish immediately** — all required fields are present." or
   - "This will be **saved as a draft** because it's missing: **`<fields>`**. To
     publish it, provide those, or I can create the draft now and you can add
     them later."  
   Do **not** silently create a draft when the user expected it to go live — call  
   out the missing fields and let them decide.

## Creating a Listing

### Step 1: Gather listing details

First apply "The publish gate" above: confirm the user's intent (draft vs live)
and which of the four publish requirements you have. Then gather:
- **title** (required to create) — item name
- **price** (required to create) — price in dollars (e.g. 25.99)
- **description** — item description. **Use only what the user told you or what is unambiguous from the given context** (e.g. the item name). Do **not** invent features, specs, brand/model details, history, included accessories, flaws, or measurements. A short, plainly factual description is better than an embellished one — leave out anything you'd be guessing.
- **photos** — file paths to photos to attach (uploaded automatically) *(publish gate — required to publish)*
- **condition** — one of: `new`, `used_like_new`, `used_good`, `used_fair`, `used`, `refurbished` *(publish gate — required to publish)*. **Only set this if the user stated the condition** (or it is explicitly clear from context). Do **not** infer or guess condition from photos or the item type. If it's unknown, ask the user; don't pick a value just to satisfy the publish gate (an unconfirmed listing should stay a draft until the user confirms).
- **location** — geographic coordinates, passed as `--latitude` and `--longitude` **together** *(publish gate — required to publish)*. There is **no** `--location`, `--city`, or `--address` flag — geocode the place name (e.g. "San Jose, CA") to a lat/lng pair first, then pass the two numeric flags. Geocode only a specific place the user gave: a city, neighborhood, ZIP code, or address. A region such as "the Bay Area" or "SoCal" is not a listing location; do **not** pick a point inside it. Treat location as missing and ask for a city or ZIP code.
- **category** — category name (e.g. electronics, vehicles, furniture) or raw category ID *(publish gate — required to publish)*
- **currency** — ISO 4217 currency code (e.g. USD, EUR); omit to use the user's marketplace default
- **delivery_types** — delivery methods: `public_meetup`, `door_pickup`, `door_dropoff`

**Draft vs Published:** create auto-publishes only when the full publish gate
(photos, condition, category, location) is satisfied; otherwise the listing is
created as a draft. A draft can later be taken live with `marketplace listing
publish --listing-id <id>` once the missing fields are added via `marketplace
listing edit` (see "Publishing a Draft Listing" below).

**Stay grounded — don't fabricate listing details.** Especially for
`description` and `condition`, use only what the user provided or what is
unambiguous from the given context. Don't embellish the description with
plausible-sounding specs/features, and don't infer a `condition` the user hasn't
confirmed. When a detail isn't clearly known, ask the user or leave it out — a
sparser, accurate listing is better than a fuller, partly-invented one. The
draft-for-confirmation step is a safety net, not a license to guess: the user
shouldn't have to catch and correct details you imagined.

**Category names:** `vehicles`, `electronics`, `home`, `furniture`, `clothing`, `apparel`, `entertainment`, `family`, `hobbies`, `specialty`, `classifieds`, `housing`, `free`, `sports`, `outdoor`, `toys`, `games`, `garden`, `pet`, `pets`, `office`, `music`, `instruments`, `bikes`, `bicycles`, `auto-parts`, `miscellaneous`.

### Step 2: Present a draft for confirmation

Before running any create command, present a clear summary of the listing **and
its resulting publish status** to the user, then ask for confirmation. Mark each
publish-gate field as present (✓) or missing, and state plainly whether it will
go live or be saved as a draft. If any field isn't something the user explicitly
gave you, flag it as an assumption (e.g. "Condition: used_good — please confirm")
rather than presenting it as fact — keep `description` and `condition` grounded
in what's actually known. Example (will publish):

**Listing — will publish immediately (all required fields present):**
- Title: Vintage Oak Desk
- Price: $150.00
- Description: Solid oak desk in great condition, minor scratches on top.
- Condition: used_good ✓
- Category: furniture ✓
- Photos: 2 files attached ✓
- Location: San Jose, CA (37.3382, -121.8863) ✓
- Delivery: public_meetup

"All set to go live. Create and publish it?"

Example (will be a draft):

**Listing — will be saved as a DRAFT (missing: photos, location):**
- Title: Vintage Oak Desk
- Price: $150.00
- Condition: used_good ✓
- Category: furniture ✓
- Photos: ✗ none
- Location: ✗ not set

"This can't go live yet — it's missing **photos** and **location**. Provide those
to publish, or I can save it as a draft for now."

**Never create or edit a listing without explicit user confirmation, and never
state or imply a listing is live unless the full publish gate was satisfied.**

### Step 3: Create

After the user confirms, run the command:

```sh
facebook-cli marketplace listing create --title "Item name" --price 25.99 --description "Details" --condition used_good --category electronics
```

With photos, location, and delivery (publishes immediately):  
```sh
facebook-cli marketplace listing create --title "Item" --price 50 --photo /path/to/photo1.jpg --photo /path/to/photo2.jpg --condition used_good --category furniture --latitude 37.3382 --longitude="-121.8863" --delivery-type public_meetup
```

Photos are uploaded automatically — no separate upload step needed.

### Step 4: Confirm

**Read the `message` field in the response and report the true status — do not
assume it published.** `"Listing created as draft"` means it is **not live**;
`"Listing published successfully"` (or similar) means it is live. If it came back
a draft but the user wanted it live, tell them which publish-gate fields are
still missing and offer to add them via `listing edit` then `listing publish`.
Present the listing ID and product URL as plain text (not in code blocks, so
links render correctly).

### Step 5: Check buyer-message readiness after publication

After the response confirms that the listing is live, immediately run the
following once for the selling flow (after the final result when creating
several listings):

```sh
hatch_messenger_cli check
```

Facebook listing access and Messenger Companion are separate connections. If
Messenger Companion is not connected, run `hatch_messenger_cli connect-url` and
prompt the user to connect it so Muse can monitor and respond to buyer inquiries.
When the response contains `connect_url`, share exactly
`[Connect Messenger](<connect_url>)`, without also pasting the raw URL. Do not
claim that Messenger is connected merely because Facebook is connected.

If Messenger Companion is already connected, do not show a connection prompt.
Briefly offer to monitor or help respond to Marketplace buyer messages, but do
not start monitoring or send a message unless the user asks. A draft cannot
receive buyer inquiries, so defer this check until it is successfully published.

## CLI Reference — Create

```
facebook-cli marketplace listing create [OPTIONS]

Options:
  --title TEXT              Listing title (required)
  --price FLOAT            Price in dollars, e.g. 25.99 (required)
  --description TEXT        Item description
  --condition TEXT          Item condition (new, used_like_new, used_good, used_fair, used, refurbished)
  --category TEXT           Category name (e.g. electronics, vehicles) or raw ID
  --photo PATH             Photo file path to upload and attach (repeatable)
  --latitude FLOAT         Location latitude (pass together with --longitude)
  --longitude FLOAT        Location longitude (pass together with --latitude)
  --currency TEXT           ISO 4217 currency code (defaults to user's marketplace currency)
  --delivery-type TEXT     Delivery method: public_meetup, door_pickup, door_dropoff (repeatable)
```

**Location is `--latitude` + `--longitude` only.** There is no `--location`, `--city`, `--address`, or `--coordinates` flag. Set location by geocoding the place name to a decimal lat/lng pair and passing both numeric flags together (e.g. `--latitude 37.3382 --longitude=-121.8863`). Passing only one of the two does not set a location. Remember the negative-coordinate rule: use the `--flag=value` form for negative longitude/latitude (see Operating Rules).

## Editing a Listing

### Step 1: Identify the listing

The user must provide the listing ID. This can come from a previous create
response or from search results.

### Step 2: Present changes for confirmation

Before running any edit command, present a clear summary of what will change and ask for confirmation. Example:

**Proposed Changes to Listing `<ID>`:**
- Title: Updated Vintage Oak Desk → *was: Vintage Oak Desk*
- Price: $125.00 → *was: $150.00*

"I'll update these fields. Everything else stays the same. Confirm?"

**Never edit a listing without explicit user confirmation.**

### Step 3: Edit

Only the fields you pass are changed; everything else is preserved from the current listing.

```sh
facebook-cli marketplace listing edit --listing-id <LISTING_ID> --title "New title" --price 75
```

Update photos (replaces existing), category, location, or delivery:  
```sh
facebook-cli marketplace listing edit --listing-id <LISTING_ID> --photo /path/to/new1.jpg --photo /path/to/new2.jpg --category furniture --latitude 37.3382 --longitude="-121.8863" --delivery-type public_meetup
```

Photos are uploaded automatically. Latitude and longitude must be provided together.

### Step 4: Confirm

Present the updated listing ID, product URL, and status message to the user as plain text (not in code blocks, so links render correctly).

## CLI Reference — Edit

```
facebook-cli marketplace listing edit [OPTIONS]

Options:
  --listing-id TEXT        Listing ID to edit (required)
  --title TEXT             Updated title
  --price FLOAT           Updated price in dollars, e.g. 25.99
  --description TEXT       Updated description
  --condition TEXT         Updated condition (new, used_like_new, used_good, used_fair, used, refurbished)
  --category TEXT          Updated category name (e.g. electronics, vehicles) or raw ID
  --photo PATH            Photo file path to upload and attach (repeatable, replaces existing)
  --latitude FLOAT        Updated location latitude (with --longitude)
  --longitude FLOAT       Updated location longitude (with --latitude)
  --currency TEXT          ISO 4217 currency code (defaults to listing's current currency)
  --delivery-type TEXT    Delivery method: public_meetup, door_pickup, door_dropoff (repeatable, replaces existing)
```

## Deleting a Listing

Permanently deletes one of the user's own Marketplace listings. **This cannot be
undone** — the listing is removed from Marketplace and cannot be recovered.

### Step 1: Identify the listing

The user must provide the listing ID, or you can list their listings first with
`marketplace my-listings` and use the `listing_id` from the result. Only delete a
listing the user explicitly identified.

### Step 2: Confirm before deleting

Before running the delete command, confirm with the user exactly which listing
will be deleted (show its title and listing link) and that deletion is
permanent. **Never delete a listing without explicit user confirmation.**

### Step 3: Delete

```sh
facebook-cli marketplace listing delete --listing-id <LISTING_ID>
```

### Step 4: Confirm

On success the response is `{ "listing_id": "<id>", "message": "Listing deleted
successfully" }`. Report the outcome to the user as plain text. If it fails
(e.g. the listing was not found or you do not own it), surface the exact error
and do not retry without the user's approval.

## CLI Reference — Delete

```
facebook-cli marketplace listing delete [OPTIONS]

Options:
  --listing-id TEXT        Listing ID to delete (required)
```

## Publishing a Draft Listing

Takes an existing **draft** listing live on Marketplace. This is the companion
to create: `marketplace listing create` saves an incomplete listing as a draft,
and publish takes it live once it has everything required.

### Step 1: Identify the draft

Get the draft's `listing_id` — from a previous `marketplace listing create`
response, or by listing drafts with `marketplace my-listings --status draft`.

### Step 2: Check the publish gate before calling

This command publishes against the **same four-field publish gate** as create
(see "The publish gate" above): **photos, condition, category, location**. Before
calling publish, check the draft's fields (from `my-listings` / `listing
details`) and:
- If a publish-gate field (photos, condition, category, location) is missing,
  **tell the user what's missing first** and add it via `marketplace listing
  edit` (with their confirmation of the values) — don't just fire publish and let
  it bounce.
- Don't assume a field is "already set" — if you didn't pass it on create and
  aren't sure it's present, treat it as missing and supply it before publishing.

### Step 3: Publish

```sh
facebook-cli marketplace listing publish --listing-id <LISTING_ID>
```

If the draft is still missing a publish-gate field, the command fails with HTTP
400 and a `missing_fields` list naming exactly what's absent. That error is
self-explanatory: add the named fields with `marketplace listing edit` (e.g.
`--photo`, `--condition`, `--category`, `--latitude`/`--longitude`), confirm the
values with the user, then retry publish — surface the missing fields to the user
rather than guessing values.

Publishing is **idempotent**: re-publishing an already-live listing returns 200
with `"message": "Listing is already published"` rather than erroring, so retries
are safe.

### Step 4: Confirm

Read the `message`: `"Listing published successfully"` means it is now live;
`"Listing is already published"` means it was live to begin with (safe no-op).
Report the true status and present the `product_url` as plain text (not in a code
block, so it renders as a clickable link). Don't claim it published if the call
errored on missing fields. After either successful live result, follow **Creating
a Listing — Step 5: Check buyer-message readiness after publication**.

## CLI Reference — Publish

```
facebook-cli marketplace listing publish [OPTIONS]

Options:
  --listing-id TEXT        Draft listing ID to publish (required)
```

The draft must have photos, condition, category, and location. On a missing
field the response includes a `missing_fields` array; fix via `listing edit` and
retry. Re-publishing a live listing is a safe no-op success.

## Operating Rules

1. **Always quote `--query` values** — e.g., `--query "road bike 51cm"`. Unquoted multi-word queries break argument parsing.
2. Omit `--limit` for the default page (20), or set `--limit <n>` (max 20; higher values are capped server-side). For "show me more", paginate with `--after` rather than asking for a bigger limit.
3. If the user mentions a city name, convert it to lat/lng before searching.
4. If no location is specified, check stored memories for the user's default location and search radius. If found, use those values and tell the user which defaults you applied (e.g., "Using your default location: San Jose, CA (30-mile radius)"). If no memory exists, omit location params.
5. If the user's request is too vague to form a meaningful search query (e.g., "something nice" without specifying a product type or category), ask a clarifying question before searching. You need at least a specific product type or category to run a useful search.
6. Present prices prominently — buyers care most about price.
7. Present listing images only through the resolved `shopping_results` widget, for search, item details, `saved` and `my-listings`. Never invent image URLs.
8. Always include a clickable listing link. Use the resolver marker. Without the resolver, use the `product_url` field (fall back to `https://www.facebook.com/marketplace/item/<listing_id>/`), or `url` for item details.
9. To get seller ratings, use `marketplace seller-info --listing-id` with the listing ID.
10. Search and my-listings are cursor-paginated: take the next-page cursor from `paging.cursors.after` and pass it as `--after` to fetch more. Absence of `paging` means there are no further results.
11. **Always present a draft before creating or editing a listing, and always confirm before deleting one.** Show the user a clear summary of what will be posted/changed (for create/edit) or which listing will be removed (for delete) and wait for explicit confirmation before running the command. Deletion is permanent and cannot be undone.  
11a. **Publish gate + intent (prevents the #1 confusion).** Before any create or publish, establish draft-vs-live intent, check the publish gate — **all four of photos, condition, category, location must be provided to go live** (location = `--latitude`+`--longitude`, not a `--location` flag; do not omit any expecting the server to default them) — and state the resulting status ("will publish" vs "will be a draft, missing: …") before running the command; afterward, read the response `message` and report the true status. Full details in **"The publish gate (READ FIRST)"** section above.
12. **Never put listing results (URLs, titles, status) in code blocks.** Use plain text so that links render as clickable.
13. **Negative coordinates: use the `--flag=value` form.** Western/southern locations have negative longitude/latitude (e.g. NYC is `-73.97781`). Write `--longitude=-73.97781` (with `=`), not `--longitude -73.97781`. A bare negative value is misread as another flag and the command fails with `error: unexpected argument '-7' found`. The same applies to any numeric flag that can be negative (`--latitude`, `--min-price`, `--max-price`).
14. **Location is only `--latitude` + `--longitude`.** For both search and create/edit, there is no `--location`, `--city`, `--address`, or `--coordinates` flag. Geocode any place name to a decimal lat/lng pair yourself and pass `--latitude` and `--longitude` **together** — never pass a place name to a flag, and never pass just one of the two. For create/edit, the lat/lng pair is what satisfies the "location" requirement for publishing.
