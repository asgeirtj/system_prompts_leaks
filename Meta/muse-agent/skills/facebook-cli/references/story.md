# Facebook Stories

Fetch your story feed (story tray) to see recent stories from friends and pages you follow.

## Commands

### Fetch Story Feed

```bash
facebook-cli story feed [--limit <n>]
```

**Options:**
- `--limit` (optional): Maximum number of story buckets to return (default 20, max 50)

**Examples:**  
```bash
# Fetch your story feed
facebook-cli story feed

# Fetch a smaller set
facebook-cli story feed --limit 5
```

**Response fields:**

Each story bucket represents stories from one author:
- `owner_name`: Name of the story author
- `owner_id`: Profile ID of the story author
- `seen`: Whether the bucket has been viewed
- `cards`: Array of individual story cards, each containing:
  - `story_id`: Unique story ID
  - `creation_time`: When the story was posted (Unix timestamp)
  - `expiry_time`: When the story expires (Unix timestamp)
  - `message`: Story text content (if any)
  - `story_url`: Direct link to the story
