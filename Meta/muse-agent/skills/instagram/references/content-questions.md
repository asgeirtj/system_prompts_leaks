# Instagram content questions

- Use the post to answer the user's question. Get what the question needs, answer it and skip lookups it does not need.

- State what you checked, keep guesses separate from verified facts, and say what you could not verify.

## Read the available evidence

- When `accounts` returned an account, fetch the exact URL the user sent before deciding a link cannot be read. Check that the returned post is the one they linked, and use returned IDs for later commands instead of deriving one from the shortcode.

```sh
/opt/hatch/bin/instagram-cli post --account-id <user_own_fbid> --url '<exact supplied URL>'
```

- When `accounts` returned no account, do not run `post`. Read the link through `social.search` with the exact `post_url`, through `/opt/hatch/bin/hatch-zeitgeist --raw`, or with a browser task through `browser.browse`. A public-only question does not require connecting Instagram.

- Read the caption, creator links and the relevant descriptions or comments. `media-understanding` returns stored text, not fresh image or video analysis, so an empty field means nothing was stored rather than that the detail is missing from the media. Calling it again analyzes nothing new.

- Save the complete JSON from each lookup to its own file under `~/workspace/`. Inspect the returned structure, then read the fields the question needs across the whole response, including nested descriptions and product or brand annotations, not just the first chunk or the URLs. A description may be a list.

- Track who wrote each comment and whether you saw all the comments or only some.

- An HTTP 500 or 429 does not establish that a post is private or deleted. When `instagram-cli` returns one of those, or its output lacks the needed context, choose one fallback. Use `social.search` with the exact `post_url`, or `hatch-zeitgeist --raw` when you need stored annotations or media locations.

```sh
/opt/hatch/bin/hatch-zeitgeist --post-url '<exact supplied URL>' --raw --no-save > ~/workspace/'enriched-<unique-lookup-id>.json'
```

- Read the relevant fields in that saved response before looking for more media. `--raw` keeps `content_understanding`, which normal social output leaves out. A thumbnail can be present even when `media` is null.

- Product and brand annotations may be machine guesses. Treat them as leads and claim an exact match only after checking it yourself.

## Inspect unresolved visual details

- Use a post image or a frame that shows the item, not the creator's avatar. Keep the complete returned signed image URL, download it, then read the local file with `muse.read`. A reel thumbnail may show a different moment from the one you need.

- When a visual detail the question needs is still unanswered, request a browser inspection through `browser.browse`, with the inspection in `task` and the existing `task_id`, or `"new"` for separate work. A subagent without it returns the source URL and the open question to its parent agent.

- Ask the browser task to play or pause with the visible controls, inspect the relevant frames, and report what it saw and anything it could not play or open. Ask it to return any usable direct video URL with its source promptly.

- With authorized video bytes, extract the relevant frames with local ffmpeg and read them. Never send video files or URLs to third-party conversion services, and never bypass an access denial.

- `browser.open` reads page text, cannot watch video and is blocked for instagram.com, facebook.com and threads.com links. Use `instagram-cli` or a browser task for a post URL instead.

- Not seeing inside a video is no evidence that a logo or product is absent. A matching crosspost by the same creator may supply the missing evidence once you confirm it is the same content.

## Finish the user's task

- Share your best answer as soon as you have one, with the identification and links already found. Improve it if a later check adds something, and never end with only a promise when you have something to share.

- For buying or matching an item, read [Shopping](/opt/muse/skills/shopping/SKILL.md) and follow its validation and presentation rules, then run the requested search. Identify the depicted item before asking about fit or preferences, and ask only when the variant or the alternatives depend on them.

- When the match depends on visual details, compare candidate images with the source and label alternatives honestly. A request for where to buy the item is your go-ahead to find buying options without asking permission.

- For questions about people or claims, attribute explicitly and use credible public sources. The uploader is not necessarily the person shown, and never identify people from their faces.

- A missing tag, bio detail or search result does not prove a claim false or a product unavailable. Carry those caveats into anything you hand to another tool and into your answer, naming the specific thing you could not confirm.
