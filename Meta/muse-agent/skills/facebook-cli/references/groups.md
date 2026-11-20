# Facebook groups

- Find Facebook Groups the account can access, read their details, and browse their posts. These commands provide context about a Group's purpose, audience, and activity.

## Understand Group privacy

- Group privacy affects both whether people can find the Group and who can see its members and posts.

- Public Groups are discoverable by anyone, and anyone can see their members and posts.

- Discoverable private Groups are discoverable by anyone, but only members can see their members and posts.

- Hidden private Groups and their content are visible only to members.

## Read a group's details

```sh
/opt/hatch/bin/facebook-cli groups details --group-id '<group ID or vanity name>'
```

- Pass a numeric Group ID or the vanity name after `/groups/` in its Facebook URL. For example, in `https://www.facebook.com/groups/weekendhikers/`, the vanity name is `weekendhikers`.

- A successful response includes:
  - `name`: the Group's display name.
  - `audience_label`: localized, contextual display text such as Public or Private group. It has no fixed enum and does not map one-to-one to `visibility`.
  - `audience_description`: a localized explanation of who can find the Group and see its members or posts.
  - `about`: the Group's stated description.
  - `visibility`: the exact privacy value. `OPEN` is public, `CLOSED` is discoverable private, and `SECRET` is hidden private.
  - `history`: the Group creation and name-change summary when available. It is null for Workplace Groups (work accounts) and Community Groups (child Groups inside a Community). Availability depends on Group type, not admin role.
  - `tags`: topic labels chosen by Group admins.
  - `rules`: an ordered list of Group rules set by admins. Each entry contains `title` and `description`. The list may be empty.
  - `member_count`: the exact count below 1,000, otherwise rounded down to the nearest 1,000.

- When `about` is empty, say the Group has no description. Don't guess why it's empty or describe the Group's purpose from its name.

- A missing Group and a Group the account cannot see return the same not-found error.

## Search groups

```sh
/opt/hatch/bin/facebook-cli groups search
/opt/hatch/bin/facebook-cli groups search --keywords 'hiking'
/opt/hatch/bin/facebook-cli groups search --role admin --sort-by LARGEST --limit 5
/opt/hatch/bin/facebook-cli groups search --role admin --sort-by LARGEST --limit 5 --after '<cursor>'
```

- Without `--keywords`, the command lists Groups the account is a member of, including public, discoverable private, and hidden private Groups. It uses `--status non_archived` and `--sort-by LAST_VISITED` ordering (see below) and returns 10 results by default.

- By default, `--keywords` combines and deduplicates two searches: a name search among Groups the account is a member of and a related-keyword search among public Groups. It uses `--status any` and `--sort-by MOST_RELEVANT` ordering (see below) and returns 25 results by default.

- `--role` controls which Groups are included:
  - `any` adds no role-based restriction to the default behavior described above
  - `connected` includes only Groups the account is a member of
  - `admin` includes only Groups the account administers
  - `admod` includes only Groups the account administers or moderates

- `--sort-by` controls result ordering:
  - `MOST_RELEVANT` prioritizes Groups relevant to the keywords. Without `--keywords`, it behaves like `LAST_VISITED`
  - `LARGEST` puts Groups with the largest member counts first
  - `LAST_VISITED` puts Groups the account visited most recently first
  - `RECENT_ACTIVITY` puts Groups with the most recent activity first
  - `ALPHABETICAL` orders Groups by name
  - all values are accepted in both modes, but only `LARGEST` globally reorders combined keyword results

- `--status` controls which Group states are included:
  - `any` applies no archived status or activity filter
  - `weekly_active` includes non-archived Groups created or active within the last seven days
  - `non_archived` excludes archived Groups
  - `archived` includes only archived Groups

- `--limit` overrides the default result count, up to 25.

- The response contains a `groups` list. Each entry includes `id`, `name`, `description`, `member_count`, and `group_url`. Use `id` for later Group commands and `group_url` as the link in the response.

- When more than one Group matches what the user described, name the one you used and mention the others.

- Listings without `--keywords` can continue with `paging.cursors.after`. Pass it as `--after` and keep the same `--role`, `--sort-by`, and `--status` values to continue the listing. `--limit` may change the next page size. Keyword searches return a single result set.

## Read Group posts

```sh
/opt/hatch/bin/facebook-cli groups posts --group-id '<group ID or vanity name>'
/opt/hatch/bin/facebook-cli groups posts --group-id '<group ID or vanity name>' --query 'recipe'
/opt/hatch/bin/facebook-cli groups posts --group-id '<group ID or vanity name>' --query 'recipe' --sort-by NEW_POSTS
/opt/hatch/bin/facebook-cli groups posts --group-id '<group ID or vanity name>' --sort-by MOST_REACTS --limit 5
```

- By default, with `--query`, the command searches post text, orders matches by relevance, and returns up to 20 posts.

- By default, without `--query`, the command lists Group posts ordered by `--sort-by MOST_RECENT_ACTIVITY` (see below) and returns up to 20 posts.

- `--sort-by` overrides the default ordering:
  - `MOST_RECENT_ACTIVITY` puts posts with the latest activity first
  - `NEW_POSTS` puts newly created posts first
  - `MOST_REACTS` puts posts with the most reactions first

- `--min-timestamp` keeps posts strictly after the provided Unix timestamp in seconds, while `--max-timestamp` keeps posts at or before it. The range applies to post creation time when results use relevance ordering or `--sort-by NEW_POSTS`, and to latest activity time when results use `--sort-by MOST_RECENT_ACTIVITY` or `--sort-by MOST_REACTS`.

- `--limit` overrides the default result count, up to 20.

- Relevance ordering, `--sort-by MOST_RECENT_ACTIVITY`, and `--sort-by NEW_POSTS` may return `paging.cursors.after`. `--sort-by MOST_REACTS` returns one page without a cursor. Pass a returned cursor as `--after` to continue with the same Group, query, sort, and time bounds. `--limit` may change the next page size.

- The response contains a `data` list. Each post includes `id`, `content`, `react_count`, `comment_count`, `creation_time`, and `post_url`, which may be null. When available, present each post's date from `source_record_created_at.user_local` rather than the raw `creation_time`, and use `post_url` as the source link.
