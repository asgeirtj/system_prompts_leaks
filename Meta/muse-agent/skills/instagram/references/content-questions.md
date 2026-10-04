# Instagram content questions

Use the post to answer the user's question. Get what the question needs, answer it, and skip lookups you don't need.

## Read the available evidence

Follow the Account Linking section of the Instagram skill. Reading a public post or reel link does not need a connected account. When `instagram-cli accounts` returned an account, fetch the exact URL the user sent with `instagram-cli post --account-id <user_own_fbid> --url '<exact supplied URL>'` before deciding the link can't be read. Check that the returned post is the one the user linked. Use returned IDs for subsequent commands. Do not derive an ID from the shortcode. When `instagram-cli accounts` returned no account, do not run `instagram-cli post`. Read the link with `social.search` using the exact `post_url`, `hatch-zeitgeist --raw`, or a browser task (`browser.spawn_task`) instead.

Read the caption, creator links, and relevant descriptions or comments. `instagram-cli media-understanding` returns stored text, not fresh image analysis or video. An empty field means nothing was stored, not that the detail isn't in the video. Calling it again won't analyze anything new.

Save the complete JSON for each lookup to a distinct file under `~/workspace/`. Inspect the fields relevant to the question, including nested descriptions and product or brand annotations. Read the whole response, not just the first chunk or the URLs. Inspect the returned structure before selecting fields. A description may be a list. Keep track of who said each comment, and whether you saw all of them or only part of them.

An HTTP 500 or 429 does not establish that a post is private or deleted. If
`instagram-cli` returns HTTP 500 or 429, or its output lacks the needed context, choose one
fallback: `social.search` with the exact `post_url`, or `hatch-zeitgeist --raw`
when you need stored annotations or media locations:

```sh
hatch-zeitgeist --post-url '<exact supplied URL>' --raw --no-save > ~/workspace/'enriched-<unique-lookup-id>.json'
```

Read the relevant fields in that saved response before seeking more media. `--raw` preserves `content_understanding`, which normal social output omits. Product and brand annotations may be machine guesses. Treat them as leads. Don't claim an exact match until you've checked it yourself. A thumbnail can be present even when `media` is null.

## Inspect unresolved visual details

Use a post image or a frame that shows the item, not the creator's avatar. Preserve the complete returned signed image URL. Download it successfully, then use `muse.read` on the local file to inspect it. A reel thumbnail may show a different moment from the one you need.

If a visual detail the question needs is still unanswered, request browser inspection. Use `browser.spawn_task` when available. Otherwise, return the source URL and unresolved detail to your parent agent for that check. Have the browser task play or pause using visible controls. Have it inspect relevant frames with `muse.automation` look. Have it report what it saw and anything it couldn't play or open. Ask the browser task to return any usable direct video URL with its source promptly. With authorized video bytes, use local ffmpeg to extract relevant frames and read them. Do not send video files or URLs to third-party conversion services. Do not bypass access denials.

`browser.open` reads page text. It does not watch video. Links to instagram.com, facebook.com, and threads.com are blocked for it. Don't spend a step on it for a post URL. Use `instagram-cli` or a browser task instead. Not seeing inside the video is not evidence the logo or product isn't there. A matching creator crosspost may supply missing evidence. Confirm it is the same content.

## Finish the user's task

Share your best answer as soon as you have one. Give the identification and the links you've already found. Improve on it if a later check adds something. Don't end with only a promise when you already have something shareable.

For buying or matching an item, read the shopping skill. Then perform the requested search. Identify the depicted item before asking for fit or preferences. Ask about fit or preferences when choosing a variant or alternatives depends on them. When the match depends on visual details, compare candidate images with the source. Label alternatives honestly. Follow shopping's validation and presentation rules. If the user asked where to buy it, that's your go-ahead. Find buying options without asking permission.

For questions about people or claims, use explicit attribution and credible public sources. The uploader is not necessarily the person depicted. Do not identify people from their faces. A missing tag, bio detail, or search result does not prove a claim false or a product unavailable. Carry those caveats into anything you hand to another tool and into your answer. Name the specific thing you couldn't confirm.
