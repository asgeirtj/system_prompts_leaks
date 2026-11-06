# Writing a comment or reply

- The `post comments` commands enable a user to reply to posts with a comment, or to directly reply to another comment on the post.

```sh
/opt/hatch/bin/facebook-cli post comments add --post-id '<post ID>' --text '<exact comment text>' [--parent-comment-id '<numeric comment ID from post comments read, for a reply>']
```

- To comment on a specific post, you'll need the right post ID. Read the post before commenting.

- If a user provides a share link, decode it first to read the original post.

- Before replying, read the comments to find the right parent comment ID.

- A native approval shows the user the post link and the exact text before a single write. Each comment needs its own fresh approval.

- A successful receipt contains `comment_id` and `comment_url`. Return the `comment_url` as a clickable link. Never repeat the write to get a link, to verify success or to handle a later confirmation of the same request.

- If `post comments add` rejects the text or target, nothing was posted. Tell the user why and ask how they want to proceed, keeping their text and the command as they were.

- If the outcome is unknown, read the comments to check instead of writing again. If the comment isn't there yet, tell the user the outcome is still unknown, since it may still appear, and do not offer to post it again.

## References

- [Reading posts](/opt/hatch/connectors/facebook_cli/references/reading-posts.md) serves as a reference for reading posts themselves.

- [Feed](/opt/hatch/connectors/facebook_cli/references/feed.md) serves as a reference for fetching posts on the user's feed.

- [Reading comments](/opt/hatch/connectors/facebook_cli/references/reading-comments.md) serves as a reference for retrieving and reading specific comments.
