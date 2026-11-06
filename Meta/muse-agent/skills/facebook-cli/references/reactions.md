# Fetching Facebook reactions

- The `post reactions` commands are useful for fetching and analyzing reactions on a Facebook post.

```sh
/opt/hatch/bin/facebook-cli post reactions read --post-id '<post_id from a timeline, feed or group posts>'
```

- Responses include:
  - Total reaction count through `summary.total_count`
  - A list of `reaction_type` and `count` pairs through `summary.reaction_counts`

- The specific list of users who reacted is not available through this command.

- Counts are each post's current reaction totals and cannot be filtered by reaction time.

- When selecting posts by date, state the date range used and explain that the counts are current totals.

## Present reactions

- Include the post's link with every reaction summary. When comparing posts, give each post's reaction counts and link. When listing comments, include each comment's `comment_url`, including in follow-up answers.

- Map common words to reaction types without prompting the user, for example, funny or laughing maps to the Haha reaction type, angry or mad maps to Angry, etc.
