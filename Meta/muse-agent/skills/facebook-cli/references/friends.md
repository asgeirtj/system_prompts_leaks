# Facebook Friends

List and search your Facebook friends by name or profile fields.

## Commands

### List / Search Friends

```bash
# List the first page of close friends (20 per page)
facebook-cli me friends

# Search all friends by name
facebook-cli me friends --name "Sarah"

# Filter by city
facebook-cli me friends --city "San Francisco"

# Filter by workplace
facebook-cli me friends --work "Meta"

# Combine filters (AND by default — all must match)
facebook-cli me friends --city "New York" --work "Google"

# Combine filters with OR (any must match)
facebook-cli me friends --city "Seattle" --education "Stanford" --filter-mode OR

# Friends with birthdays in the next week (default when no number is given)
facebook-cli me friends --birthday-within-days

# Friends with birthdays in the next 30 days (ordered by upcoming birthday)
facebook-cli me friends --birthday-within-days 30

# Fetch the next page (cursor from the previous response's paging.cursors.after)
facebook-cli me friends --after <cursor>
```

| Flag | Required | Description |
|------|----------|-------------|
| `--name` / `-n` | No | Search all friends by name (case-insensitive substring match) |
| `--city` | No | Filter by current city (case-insensitive substring match) |
| `--hometown` | No | Filter by hometown (case-insensitive substring match) |
| `--work` | No | Filter by employer name or position title (case-insensitive substring match) |
| `--education` | No | Filter by school name (case-insensitive substring match) |
| `--filter-mode` | No | How to combine multiple filters: `AND` (default, all must match) or `OR` (any must match) |
| `--json-query` | No | JSON query for SocialGraphSearch (FindPeople format). Uses Social RAG search for interest/topic-based matching. **Not paginated** — returns a single result set with no `paging` cursor, so `--after` has no effect; `--limit` (max 20) still caps the result set. |
| `--birthday-within-days` | No | Return only friends whose birthday falls within the next N days (1–365). **Defaults to 7 (the next week) when passed with no value** (e.g. `--birthday-within-days`); omitting the flag entirely returns the normal friends list. Adds a `birthday_date` field and orders results by upcoming birthday. Privacy-aware (friends who hide their birthday are excluded). When set, the other filters are ignored. |
| `--limit` | No | Maximum number of friends per page (max 20; higher values are capped server-side) |
| `--after` | No | Pagination cursor — pass the `paging.cursors.after` value from the previous response to fetch the next page |

**Output:** JSON with a `data` array plus a `paging` object. Each friend in `data` has `friend_id`, `name`, `profile_url`, and optionally `match_context` (with `groups`, `pages`, `profile_details` explaining why they matched). When `--birthday-within-days` is used, each friend also has `birthday_date` (`YYYY-MM-DD`), and results are ordered by upcoming birthday ascending. Without any filters, returns the first page (20) of close friends — paginate with `--after` for more. With `--json-query`, uses SocialGraphSearch for richer matching.

**Pagination:** results are cursor-paginated (forward-only). `paging.cursors.after` (when present) is the cursor for the next page; its absence means there are no more results. Pass it back via `--after`. (Note: a cursor is only valid for the same filter mode it came from — don't reuse an `after` from one mode after switching filters.) **Exception:** `--json-query` (SocialGraphSearch) is **not paginated** — it returns a single result set with no `paging` cursor, so `--after` has no effect; `--limit` (max 20) still caps how many results come back.

### Upcoming birthdays via `--birthday-within-days`

Use `--birthday-within-days N` to find friends with birthdays in the next N days (1–365). This is the right tool for "whose birthday is coming up?", "any birthdays this week?", or "who should I wish happy birthday?". It uses a privacy-aware birthday lookup, so friends who hide their birthday are excluded.

**Default window:** when the user asks about upcoming birthdays without naming a timeframe, pass the flag with no value — it defaults to the next 7 days (a week). Only pass an explicit number when the user specifies one ("this month" → `30`, "next 90 days" → `90`).

```bash
# Birthdays in the next week (default — no value needed)
facebook-cli me friends --birthday-within-days

# Birthdays in an explicit window
facebook-cli me friends --birthday-within-days 30
```

```json
{
  "data": [
    {
      "friend_id": "123456789",
      "name": "Jane Smith",
      "profile_url": "https://facebook.com/jane.smith",
      "birthday_date": "2026-06-14"
    }
  ],
  "paging": { "cursors": { "after": "<cursor>" } }
}
```

`birthday_date` is in `YYYY-MM-DD` format. Results are ordered by date ascending starting from today, one page at a time (page size 20) — follow `paging.cursors.after` with `--after` for more. The other filters (`--name`, `--city`, `--hometown`, `--work`, `--education`, `--json-query`) are ignored when `--birthday-within-days` is set.

### SocialGraphSearch via `--json-query`

Use `--json-query` to search friends by interests, sports, topics, etc. First get your Facebook ID with `facebook-cli me`, then use it in the `friend_by` filter:

> **No pagination:** `--json-query` returns a single result set with no `paging` cursor, so `--after` has no effect. `--limit` (max 20) still caps how many results are returned; to go beyond that, refine the query filters rather than paging.

```bash
facebook-cli me friends --json-query '{
  "intent": "FindPeople",
  "target": "users",
  "filters": {
    "friend_by": ["YOUR_FB_ID"],
    "topic": ["hiking"]
  }
}'
```

**Important:** Use `topic` as the filter key for interests (NOT `interests`). The `friend_by` value must be the user's Facebook ID from `facebook-cli me`.

#### Supported filters

| Filter | Description | Example | match_context category |
|--------|-------------|---------|----------------------|
| `friend_by` | Facebook ID of viewer (required) | `["YOUR_FB_ID"]` | — |
| `topic` | Interests/topics/hobbies | `["hiking"]`, `["seattle seahawks"]` | groups, pages |
| `sports` | Sports teams/activities | `["pickleball"]`, `["soccer"]` | pages |
| `company` | Employer | `["Meta"]`, `["Google"]` | profile_details |
| `job` | Job title | `["engineer"]` | profile_details |
| `college` | College/university | `["Stanford"]` | profile_details |
| `school` | Any school | `["MIT"]` | profile_details |
| `location` | Current city | `["Seattle"]` | profile_details |
| `hometown` | Hometown | `["Mumbai"]` | profile_details |
| `movies`, `music`, `tv_shows`, `books`, `games`, `podcasts` | Entertainment | `["Inception"]` | pages |

**Mapping user intent to filter key:**
- "friends who like hiking" / "friends interested in cooking" → `topic`
- "friends who play soccer" / "friends into basketball" → `sports`
- "friends who work at Meta" → `company`
- "friends in Seattle" / "friends living in NYC" → `location`
- "friends who went to Stanford" → `college`
- "friends who watch Breaking Bad" → `tv_shows`

#### Response with match context

When using `--json-query`, results include `match_context` explaining why each friend matched. The context strings contain XML-tagged data that should be parsed for display:

```json
{
  "friend_id": "123456789",
  "name": "Jane Smith",
  "profile_url": "https://facebook.com/jane.smith",
  "match_context": {
    "groups": [
      {
        "id": "111222333",
        "context": "<GROUP_NAME>Hiking Enthusiasts</GROUP_NAME><GROUP_DESCRIPTION>A group for open discussion of hiking and backpacking topics...</GROUP_DESCRIPTION>"
      }
    ],
    "pages": [
      {
        "id": "444555666",
        "context": "<PAGE_NAME>Home Cooking Tips</PAGE_NAME><PAGE_CATEGORY>Kitchen/Cooking</PAGE_CATEGORY><PAGE_DESCRIPTION>Easy recipes for home cooks...</PAGE_DESCRIPTION>"
      }
    ],
    "profile_details": [
      {
        "source_id": "777888999",
        "context": "Works at Acme Corp"
      }
    ]
  }
}
```

**Parsing context strings:**
- **groups**: Extract name from `<GROUP_NAME>...</GROUP_NAME>`, description from `<GROUP_DESCRIPTION>...</GROUP_DESCRIPTION>`
- **pages**: Extract name from `<PAGE_NAME>...</PAGE_NAME>`, category from `<PAGE_CATEGORY>...</PAGE_CATEGORY>`
- **profile_details**: Plain text, no XML tags (e.g. "Works at Acme Corp", "Currently located in Seattle, Washington", "Attended school State University")

**Presenting results:** When showing match context to the user, extract the readable names and present them naturally:
- "Jane Smith — member of Hiking Enthusiasts, Trail Runners groups"
- "John Doe — follows Home Cooking Tips, Chef's Table pages"
- "Alex Lee — Works at Acme Corp"

### Your Identity

```bash
facebook-cli me
```

**Output:** JSON with `ok`, `name`, and `profile_id` — your Facebook name and profile ID. This grounds the agent on who the Facebook user is. Use the profile ID with other commands like `profile info --profile-id` (for full profile details) or `timeline fetch --profile-id` (for your posts).

## Operating Rules

1. Use `me friends` to search for people by name or profile fields. There is no general profile search endpoint — `me friends` is the only people lookup.
2. Use the dedicated filter flags (`--city`, `--hometown`, `--work`, `--education`) to filter friends directly — no need to search by name first and then manually filter results.
3. For interest-based friend search (e.g. "which friends like hiking?"), use `--json-query` with a FindPeople template using `topic` as the filter key. Do not scan friends' posts, timelines, groups, or page likes to infer interests.
4. When multiple friends match, list them with distinguishing details (name, city, workplace, profile link) and ask the user to clarify.
5. Always include a profile link (`profile_url`) for each friend in results.
6. After disambiguation, proceed with the original request. If the user asked "show me posts from Liz" and you listed matching friends, once the user picks one (or if only one match exists for a nickname like "Liz" → "Liz Taylor"), fetch and display the posts — do not stop at listing friends.
7. When searching by name, expand common nicknames to their full forms and search for both. For example, "Liz" → also search "Elizabeth"; "Mike" → also search "Michael"; "Bob" → also search "Robert"; "Bill" → also search "William"; "Teddy" → also search "Theodore". Combine results from both searches before presenting to the user.
