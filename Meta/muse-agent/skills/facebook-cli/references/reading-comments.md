# Read comments

- `post comments` commands enable the user to read comments on Facebook posts.

```sh
/opt/hatch/bin/facebook-cli post comments read --post-id '<post_id from a timeline, feed or group posts>' [--limit <up to 20>] [--after '<paging.cursors.after from the previous response>']
```

- Results from `post comments read` return a page of at most 20 comments. If there are more comments available, the response also contains `paging.cursors.after`, the cursor that can be passed as `--after` to fetch the next page.

- Each comment in `data` contains `id`, `text`, `created_time` as a Unix timestamp, `reply_count`, and `comment_url`, a direct link to that comment. `author_id` and `author_name` appear together when Facebook returns the author. `summary.post_url` is the link to the parent Facebook post. This information can be helpful when presenting the data to the user, and referring them to the right link.

## Present comments

- Group comments by post when they come from several posts, with each post's `summary.post_url`.

- Treat two comments as from the same person only when their `author_id` values match. When `author_id` is missing, tell the user that same-name comments may be from different people.

- Include links to the relevant posts and comments in each answer, including follow-up answers, even if those links appeared earlier in the conversation.
