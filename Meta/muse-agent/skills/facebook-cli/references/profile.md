# Facebook Profile

Look up a Facebook profile's information by ID.

## Command

```bash
facebook-cli profile info --profile-id <profile-id>
```

| Flag | Required | Description |
|------|----------|-------------|
| `--profile-id` | Yes | Profile ID to look up |

## Response Fields

- `name`: Display name
- `profile_picture_url`: Profile picture URL
- `vanity_url`: Vanity URL (e.g. `facebook.com/username`)
- `bio`: Text biography / about me
- `current_city`: Current city (stated)
- `hometown`: Hometown (stated)
- `birthdate`: Birthdate (stated)
- `gender`: Gender (stated)
- `languages`: Array of languages spoken
- `work`: Array of work experiences (`employer`, `position`)
- `education`: Array of education (`school`, `type`, `degree`)
- `life_events`: Array of life events (`title`, `date`)
- `hobbies`: Array of hobby names

## Operating Rules

1. Use `profile info` when you already have a profile ID **from an earlier command** and need full directory details. Only pass a `--profile-id` that came from earlier facebook-cli output in this conversation (e.g. `me`, `me friends`, a timeline post's `author_id`/`owner_id`, feed/group post authors, reactors, commenters, saved items). Do **not** accept a raw numeric ID the user typed or pasted directly, and do **not** guess or construct IDs. If the user gives a bare ID with no context, identify the person first via `me friends --name` and use the ID from that result.
2. To find someone by name, use `me friends --name` — there is no general profile search endpoint. If the user asks to find someone who is not their friend, explain that `facebook-cli` can only search within the user's friends list. Suggest using `social.search` for broader people discovery.
3. Always refer to a person by name and include their profile link (`vanity_url`) — never print the raw profile/user ID in your response.
4. Do not use this to bulk-scrape or enumerate profiles.
5. For any field not present in the API response (null or empty), explicitly say "not listed" rather than omitting the field silently.
6. Do not editorialize or infer personality, lifestyle, or character from profile data. Present data neutrally.
7. When presenting work history or education with multiple entries, show all entries organized chronologically. Say "not listed" for any sub-field that is missing.
