# Facebook Marketplace Selling

- These commands find, create, edit, publish and delete the user's own Marketplace listings.

## Find the user's listings

```sh
/opt/hatch/bin/facebook-cli marketplace my-listings [--status <active, pending, sold or draft>] [--limit <up to 20>] [--after '<paging.cursors.after from the previous response>'] --out '<new file>'
```

- `my-listings` lists the user's own listings in every state, including drafts and sold items, unless `--status` narrows it. Use it to find the `listing_id` for an edit, publication or deletion, so the user doesn't have to supply an ID. Leave out `--status` when finding a listing to edit, publish or delete, so drafts and sold listings are candidates too.

## Prepare a listing

- `listing create` submits a listing for Marketplace review when it has all four of these, and `listing publish` submits a draft once it has them:
  - at least one photo
  - a condition
  - a category
  - a location as `--latitude` and `--longitude`. At publish, a draft missing only its location can use the seller's saved selling location instead, as `listing publish` below describes.

- Without all four at creation, the listing saves as a draft even if the user asked to post it. Title and price are required to create a listing but don't decide whether it goes live.

- There's no draft-only flag, so a complete listing is always submitted. When the user wants a draft but all four fields are known, keep the proposed listing in chat instead.

- Write the listing from what the user said or what's unambiguous in the conversation. Keep the description short and factual, because invented features, specifications, history or flaws mislead buyers.

- Set the condition when the user stated it, and ask when it's unknown. A photo or the item type doesn't establish the condition.

- Geocode a specific place the user gave, such as a city, ZIP code or address. A region such as the Bay Area isn't a listing location, so ask for a city or ZIP code.

- `--category` takes a category ID or one of these names: `vehicles`, `electronics`, `home`, `furniture`, `clothing`, `apparel`, `entertainment`, `family`, `hobbies`, `specialty`, `classifieds`, `housing`, `free`, `sports`, `outdoor`, `toys`, `games`, `garden`, `pet`, `pets`, `office`, `music`, `instruments`, `bikes`, `bicycles`, `auto-parts` and `miscellaneous`.

- Ask before `listing create` only when something it depends on is unsettled: a detail you'd have to assume, a missing publishing field, or whether the user wants the listing posted or kept as a draft. Ask about just that, and name any missing fields so the user can supply them or keep a draft.

- Otherwise run `listing create` without confirming in chat first. Its approval card shows the title, price, description, condition, category, location, delivery, photos and the initial status, Live or Draft, and the user confirms there. Say in the same message whether the listing will be submitted for review or saved as a draft.

## Create, edit, publish or delete a listing

```sh
/opt/hatch/bin/facebook-cli marketplace listing create --title '<title>' --price <dollars> [--description '<description>'] [--photo '<path>' ...] [--condition <new, used_like_new, used_good, used_fair, used or refurbished>] [--category '<category name or ID>'] [--latitude <latitude> --longitude <longitude>] [--currency <ISO 4217 code, default the user's Marketplace currency>] [--delivery-type <public_meetup, door_pickup or door_dropoff> ...] [--comments-disabled <true or false, default false>]
```

- `listing create` uploads the photos and creates the listing in one step. Report the response `message` as the status: a complete listing is submitted for review and isn't visible to buyers until it passes, and an incomplete one is saved as a draft.

- If it came back as a draft but the user wanted it posted, name the missing fields and offer to add them with `listing edit`, then run `listing publish`.

```sh
/opt/hatch/bin/facebook-cli marketplace listing edit --listing-id '<listing_id>' [--title '<title>'] [--price <dollars>] [--description '<description>'] [--photo '<path>' ... replaces every photo] [--condition <new, used_like_new, used_good, used_fair, used or refurbished>] [--category '<category name or ID>'] [--latitude <latitude> --longitude <longitude>] [--currency <ISO 4217 code, default the listing's currency>] [--delivery-type <public_meetup, door_pickup or door_dropoff> ... replaces every choice] [--comments-disabled <true or false>]
```

- `listing edit` changes the flags you pass and keeps everything else. New photos replace the whole photo set, and new delivery types replace the existing choices. Show each change with its current and new value.

```sh
/opt/hatch/bin/facebook-cli marketplace listing publish --listing-id '<listing_id>'
```

- `listing publish` posts a draft. Check its photos, condition and category through `my-listings` or item details first, and add anything missing through `listing edit` with values the user confirms. When location is the only missing field and item details returns `default_location_label`, publish uses that saved selling location, so tell the user which location it will use. Without that label, add coordinates through `listing edit` first.

- A missing field returns HTTP 400 with `missing_fields`. "Listing published successfully" means the draft was posted, "Publishing did not complete" means it's still a draft, and "Listing is already published" means nothing changed.

```sh
/opt/hatch/bin/facebook-cli marketplace listing delete --listing-id '<listing_id>'
```

- `listing delete` permanently removes the listing, and it can't be undone. When the user has identified one listing, name it with its title and link and run the delete in the same message. The approval card is where they confirm, so asking in chat first makes them confirm twice. When more than one listing could match, show each with its title, price, status and link, and ask which one. Success returns "Listing deleted successfully", and "Listing was already deleted" means nothing changed.

- After each write, give the true status and the listing link as plain text.

## Check buyer messages after publishing

```sh
/opt/hatch/bin/hatch_messenger_cli check
```

- Once a listing is live, run this once for the selling task, after the last listing when publishing several. Drafts can't receive messages, so skip it for a draft.

- [Messenger](/opt/hatch/connectors/messenger_read/CONNECTOR.md) is a separate connection from Facebook. If it isn't connected, run `/opt/hatch/bin/hatch_messenger_cli connect-url` and share `[Connect Messenger](<connect_url>)` so Muse can help with buyer inquiries. If it is, briefly offer to help with buyer messages, and start monitoring or send a message when the user asks.

## Recover from a failed write

- When a create, edit, publish or delete fails, tell the user what you tried, the exact error, why you think it failed and the change you propose, then wait for their review before trying again. A retry with the same or changed values can create a duplicate or publish the wrong details.

- A timeout or unreadable response can leave the outcome unknown, so read the listing through `my-listings` or item details before proposing another write.

- A failed read can run again without approval.
