# Facebook Groups

Fetch group details, search groups, and browse posts in Facebook Groups.

## Commands

### Group Details

```bash
facebook-cli groups details --group-id "<id-or-vanity>"
```

`--group-id` accepts either a numeric group FBID or the vanity name from a  
Facebook group URL such as  
`https://www.facebook.com/groups/<group-id-or-vanity>`. Use the path segment
after `/groups/`; do not pass the whole URL.

**Examples:**

```bash
# Fetch by numeric FBID
facebook-cli groups details --group-id "<group-id>"

# Fetch by vanity name
facebook-cli groups details --group-id "<group-vanity-name>"
```

**Response fields:**

- `name`: Group name
- `about`: Group About text
- `visibility`: `OPEN`, `CLOSED`, or `SECRET`
- `history`: Localized creation and name-change history, when visible
- `tags`: Admin-selected group tags
- `rules`: Group rules as title/description objects in admin-defined order
- `member_count`: Approximate member count

Missing groups and groups that are not visible to the linked Facebook account
return the same not-found error.

### Search Groups

```bash
facebook-cli groups search [--keywords <text>] [--role <role>] [--sort-by <sort>] [--status <status>] [--limit <n>] [--after <cursor>]
```

**Options:**
- `--keywords` (optional): Search by name or topic. Omit to list your own groups
- `--role` (optional): Controls search scope:
  - `connected` (default) — only groups you're a member of
  - `admin` — groups where you're an admin
  - `admod` — groups where you're admin or moderator
  - `any` — search connected groups (including private groups) first, then
    public discovery results (requires `--keywords`)
- `--sort-by` (optional): `MOST_RELEVANT`, `LARGEST`, `LAST_VISITED`, `RECENT_ACTIVITY`, `ALPHABETICAL`
- `--status` (optional): `any`, `weekly_active`, `non_archived` (default), `archived`
- `--limit` (optional): Maximum number of results per page (default 25 with  
  `--keywords`, 10 otherwise; max 25)
- `--after` (optional): Cursor from `paging.cursors.after` in the previous
  response. Supported only when `--keywords` is omitted

**Examples:**  
```bash
# List my groups
facebook-cli groups search

# Search for groups about hiking
facebook-cli groups search --keywords "hiking"

# My largest groups
facebook-cli groups search --sort-by LARGEST --limit 5

# Groups I admin
facebook-cli groups search --role admin

# Search connected and public groups
facebook-cli groups search --keywords "hiking" --role any

# Next page while listing memberships
facebook-cli groups search --role connected --after "<cursor_from_previous_response>"
```

**Response:** Each page keeps results in `groups`; `paging.cursors.after` is
present when another page is available.

**Group fields:**
- `group_id`: Numeric group ID
- `name`: Group name
- `member_count`: Number of members
- `privacy`: `Public` or `Private`
- `group_url`: Direct link to the group (e.g. `https://www.facebook.com/groups/<group-id>/`)

### Search Posts in a Group

```bash
facebook-cli groups posts --group-id <id> [--query <text>] [--sort-by <sort>] [--limit <n>] [--after <cursor>] [--min-timestamp <unix>] [--max-timestamp <unix>]
```

**Options:**
- `--group-id` (required): Group ID to search posts in
- `--query` (optional): Text query to filter posts by content
- `--sort-by` (optional): `MOST_RECENT_ACTIVITY` (default), `MOST_REACTS`, `NEW_POSTS`
- `--limit` (optional): Maximum number of results (default 10, max 25)
- `--after` (optional): Pagination cursor from a previous response — pass it to fetch the next page (max page size 20)
- `--min-timestamp` (optional): Lower bound on post time, Unix seconds (exclusive) — only posts newer than this
- `--max-timestamp` (optional): Upper bound on post time, Unix seconds (inclusive) — only posts at or before this

> **Note:** Pagination (`--after`) is only supported with `MOST_RECENT_ACTIVITY` and `NEW_POSTS` (max page size 20). `MOST_REACTS` does not return a pagination cursor, so it can't be paged.

**Examples:**  
```bash
# Recent posts in a group
facebook-cli groups posts --group-id "<group-id>"

# Most popular posts
facebook-cli groups posts --group-id "<group-id>" --sort-by MOST_REACTS --limit 5

# Newest posts first
facebook-cli groups posts --group-id "<group-id>" --sort-by NEW_POSTS --limit 5

# Search for posts about a topic
facebook-cli groups posts --group-id "<group-id>" --query "recipe"

# Next page (pass the cursor from the previous response)
facebook-cli groups posts --group-id "<group-id>" --after "<cursor_from_previous_response>"

# Posts within a time window (Unix seconds)
facebook-cli groups posts --group-id "<group-id>" --min-timestamp 1750000000 --max-timestamp 1752000000
```
