# Facebook feeds

- These commands help the user catch up on their ranked Facebook feed or posts from friends.

```sh
/opt/hatch/bin/facebook-cli feed newsfeed
/opt/hatch/bin/facebook-cli feed newsfeed --limit 10 --after '<next_cursor>'
/opt/hatch/bin/facebook-cli feed friends --limit 5
```

- `feed newsfeed` returns the ranked newsfeed of organic stories, without ads. `feed friends` returns ranked stories from friends only.

- Both commands return a `social_posts_v1` collection, with at most 10 stories. When `has_next_page` is true, pass `next_cursor` as `--after` to continue with paging.

- Use `post_id` for follow-up reads and `url` to link the story. See [Reading posts](/opt/hatch/connectors/facebook_cli/references/reading-posts.md) for presenting and interpreting post content.

## Present a feed

- Stories are ranked by relevance, so present stories in the same order. For each story, include the `url`.

- Surface each post and story's timestamp so they may judge recency.

- If the user requests a specific time window, select matching stories using those timestamps, preserving their ranked order, and state the window used.

- For requests without a time window, state the window you're using or ask for clarifications.

- If there is another page available to fetch, offer to read more stories.

- Keep a feed browse faithful to the stories. For a requested analysis, be clear in distinguishing your interpretation from the post text and available media descriptions.

## References

- Read [Reading posts](/opt/hatch/connectors/facebook_cli/references/reading-posts.md) when presenting captions and available media context.

- To read comments, use [Comments](/opt/hatch/connectors/facebook_cli/references/reading-comments.md).

- To read reactions, use [Reactions](/opt/hatch/connectors/facebook_cli/references/reactions.md).
