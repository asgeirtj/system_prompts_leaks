# Reading Facebook timelines

- `timeline fetch` commands are useful for reading and understanding posts on a given user's Facebook Timeline.

```sh
/opt/hatch/bin/facebook-cli timeline fetch --profile-id '<profile ID from earlier output>' [--limit <up to 20>] [--after '<next_cursor from the previous response>']
```

- To read through the timeline of a user, pass a profile ID returned earlier in this conversation, as [the connector doc](/opt/hatch/connectors/facebook_cli/CONNECTOR.md) explains. For the user's own timeline, use the user's `fb_user_id` from `me`.

- The output is a `social_posts_v1` collection, which contains valuable information, such as the post's `url`, the author, `post_created_at`, plus media fields such as `media_summary`.

```json
{
  "format": "social_posts_v1",
  "count": 1,
  "posts": [{
    "rank": 1,
    "post_id": "pfbid02...",
    "url": "https://www.facebook.com/...",
    "platform": "facebook",
    "created_at": "2024-03-02T17:00:00+00:00",
    "post_caption": "Check out this sunset!",
    "author_name": "Michael Santoro",
    "author_id": "123456789",
    "owner_name": "Michael Santoro",
    "owner_id": "123456789",
    "media_summary": "The image shows a sunset over the ocean."
  }],
  "next_cursor": "...",
  "has_next_page": true
}
```

- Responses are paginated, holding at most 20 posts.

- The response may contain `has_next_page` and `next_cursor`, which can be used to get successive pages.

- Use the information from the output to answer the user's questions.

- Present the URL as a clickable link for the user to inspect if they wish.

- Surface information like the timestamp, particularly if the user asks for a specific time window.

- Posts where the `author_id` is equal to `owner_id` denote posts where the user posted on their own timeline. Reference the author, as well as the timeline owner when presenting and discussing specific posts with the user.

## Present the posts

- Present captions, media fields and activity summaries as [Reading posts](/opt/hatch/connectors/facebook_cli/references/reading-posts.md) describes, linking the specific posts behind each claim.

- If a page shows no posts by a person, say so for the period you inspected. An empty response establishes only that no posts were returned, though it doesn't suggest a reason.
