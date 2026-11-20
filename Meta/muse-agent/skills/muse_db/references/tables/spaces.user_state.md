# `spaces.user_state`

Artifact favorites, access history and ordering.

- Return to the [table index](/opt/muse/skills/muse_db/references/schema.md) or [query rules](/opt/muse/skills/muse_db/references/querying.md).

## Columns

- `space_slug` uses `text` and is required.

  Local row identifier (primary key).

- `is_favorite` uses `boolean` and is required.

  Default: `false`.

- `accessed_at_ms` uses `bigint` and is nullable.

- `frequency_score` uses `double precision` and is nullable.

- `favorite_order` uses `double precision` and is nullable.

- `last_accessed_at` uses `timestamp with time zone` and is nullable.

- `pinned_at` uses `timestamp with time zone` and is nullable.

- `last_opened_at_ms` uses `bigint` and is nullable.

- `sharing_state` uses `text` and is nullable.

  Recipient choice for a Space shared with this user: pending, accepted, or ignored. Grants no access. NULL means no received-share record; rows with only sharing fields are not navigation history. The choice survives removal from saved Spaces.

- `sharing_revision` uses `uuid` and is nullable.

  Opaque concurrency token for the recipient sharing choice; not a local or central identifier.

- `sharing_saved_shortcode` uses `text` and is nullable.

  Historical saved-Space shortcode recorded when the share was accepted. Matches spaces.spaces.space_slug while the saved reference exists; does not prove current saved membership or sidebar placement.

- `sharing_updated_at_ms` uses `bigint` and is nullable.

  Unix epoch milliseconds of the last recipient sharing choice change.

- `sharing_accept_reported_at_ms` uses `bigint` and is nullable.

  Unix epoch milliseconds when this VM settled its acceptance report for an accepted received share. Settled means the control plane gave a definitive answer, which may have recorded nothing (for example after a save made before the owner listed this recipient), so a value does not prove that the owner sees the acceptance. NULL on an accepted row means the report is unsettled; confidential VMs and shortcodes that are not Cloudflare shares never report and keep NULL. Other rows keep NULL. Acceptances recorded before reporting existed were settled without a report.

## Keys and relationships

- PRIMARY KEY `user_state_pkey` covers `space_slug`.
