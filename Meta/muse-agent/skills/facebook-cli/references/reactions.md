# Facebook Reactions

Read the reaction summary on Facebook posts.

## Command

```bash
facebook-cli post reactions read --post-id <post-id>
```

**Options:**
- `--post-id` (required): Post ID to read reactions from

The endpoint returns the reaction **summary** only (total count and per-type
counts). An individual reactor list is not available from this command.

## Response Fields

The response carries the aggregates under `summary`:
- `summary.total_count`: Total number of reactions on the post
- `summary.reaction_counts`: Array of `{ reaction_type, count }` — breakdown by type (Like, Love, Wow, Haha, Sad, Angry, Thankful, Care)

`data` is an empty array (no individual reactor list is returned).

## Operating Rules

1. When presenting reactions, include the breakdown by type (Like, Love, Haha, Wow, Sad, Angry) from `summary.reaction_counts`, plus the total from `summary.total_count`. Always include the post permalink — never show raw post IDs. Individual reactor names ("who reacted"/"who liked it") are not available from this command; if the user asks who reacted, say that the reactor list isn't available and offer the per-type counts instead.
2. When the user asks about "recent" or "latest" reactions, always state the date range you used in your response (e.g., "Here are posts with reactions from the past 7 days").
3. When comparing reactions across posts, present clear numerical comparisons grounded in actual data. Include post links for each post being compared.
4. Do not use subjective language like "very popular" or "went viral" without grounding in specific numbers.
5. When the user asks to filter reactions by type using informal terms (e.g., "funny ones", "sad reactions", "the laughing ones"), clarify which Facebook reaction type they mean before proceeding. Map common terms: "funny" / "laughing" → Haha, "sad" → Sad, "angry" / "mad" → Angry, "hearts" / "love" → Love. If the mapping is ambiguous, ask the user to confirm.
