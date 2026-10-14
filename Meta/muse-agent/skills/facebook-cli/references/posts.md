# Facebook Posts

## Reading a Post

```bash
facebook-cli post read --post-id <post-id>
facebook-cli post read --url '<canonical-facebook-url>'
```

Supply exactly one nonblank `--post-id` or `--url`. IDs may be numeric or bare  
PFBIDs. Output uses the normalized `social_posts_v1` format with the post's text,
permalink, and available media context.

## Reading from a Facebook URL

Resolve Facebook share wrappers such as `/share/<token>/` or
`/share/p/<token>/` before reading the content:

```bash
facebook-cli link-sharing decode-url \
  --url 'https://www.facebook.com/share/p/<share-token>/'
```

The response includes `original_url`. If it is null, missing, or blank, report
that the link could not be resolved and stop. Do not use the share token as an ID.
A decoded URL identifies the content type; it does not confirm that content is
available to the account. The post reader does not decode share links itself.

For an already canonical URL, skip decoding. Pass the complete supplied URL or
decoded `original_url` to `post read --url` for these HTTP(S) URL patterns on
`facebook.com`, `www.facebook.com`, `m.facebook.com`, `mbasic.facebook.com`,
`web.facebook.com`, or `touch.facebook.com`:

| Content | Canonical URL patterns |
| --- | --- |
| Post | `/<profile>/posts/<post-id>` or `/posts/<post-id>` |
| Group post | `/groups/<group>/posts/<post-id>` or `/groups/<group>/permalink/<post-id>` |
| Post permalink | `/story.php?story_fbid=<post-id>` or `/permalink.php?story_fbid=<post-id>` |
| Photo | `/photo.php?fbid=<id>` or `/photo/?fbid=<id>` |
| Video or reel | `/reel/<id>`, `/videos/<id>`, or `/<profile>/videos/<id>` |
| Video query URL | `/watch/?v=<id>` or `/video.php?v=<id>` |

```bash
facebook-cli post read --url '<original_url-from-decoder>'
```

Keep the URL intact, including its query parameters; do not extract an ID or
make a separate media-resolution request. The reader resolves supported
photo/video URLs to their containing post.
Standalone media may have no containing post. A failed read stops the chain:
report the failure without guessing an ID, retrying the media ID as a post ID,
or claiming that the content is readable from the URL alone.

Malformed or unsupported URLs, including undecoded share links, return HTTP 400.  
Supported URLs whose media or post is missing, private, or unreadable return  
HTTP 404. Neither result provides post content.

### Other Entities

Route other entities to their own readers:

- `/groups/<group-id>`: use `groups posts --group-id <group-id>` to browse posts.  
  If the group path contains a name instead of an ID, use `groups search` first.
- `/marketplace/item/<listing-id>`: use `marketplace listing details --url '<decoded-url>'` with the full URL intact.
- Event, game, and unrecognized URLs: report that this URL type is unsupported. Do not
  pass an arbitrary number from the URL to `post read`.

## Browsing a Profile's Timeline

To view recent posts for a profile, use `timeline fetch`:

```bash
facebook-cli timeline fetch --profile-id <profile-id>
```

## Reading Comments or Reactions

```bash
facebook-cli post comments read --post-id <post-id>
facebook-cli post reactions read --post-id <post-id>
```

## Operating Rules

1. When presenting normalized post, feed, or timeline results, include `post_caption` and `url` when present. A feed caption that matches `header_text`, or a caption derived from `media_summary`, is descriptive provider text rather than the author's quoted words. Do not fabricate links or text when these fields are absent.
2. Include the owner's name only when the user isn't asking about a specific person (e.g., browsing a feed). Omit it when the context already makes the author obvious.
3. When summarizing what someone has been up to, ground every claim in a specific post. Do not fabricate or infer activities that are not evidenced by an actual post.
4. Use normalized `media_summary`, `media_ocr`, or `video_transcript` fields when present to provide media context.
5. Media fields are pre-computed and may not be available for all posts. Never claim a post contains specific media content unless one of those fields confirms it.
6. Facebook video and reel posts may also carry shopping context: `shoppable_products` (a list of detected products, each with `product_name` and optional `descriptive_name`, `category`, `item_type`, `brand_name`, `color`, `style`, `gender`, `prominence`), `shoppability`, and `shoppable_product_category`. Use them to answer questions about what is shown or sold in a video instead of inferring products from the caption or transcript. They are absent on posts with no shopping content understanding, and on list endpoints (`profile posts`, `feed`) — only `post read` returns them.
