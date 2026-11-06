---
description: Embed social posts and other rich content in a web page, with a working source link when an embed cannot play.
builders: web
---

# Social posts, reels and rich embeds

- Read this when a page should show a social post, reel or other third-party rich content, such as a video, a player or an interactive widget, rather than just link to it.

## What can and cannot be framed

- For Instagram posts, reels and TV, append `/embed/` to the permalink path, giving `https://www.instagram.com/{p|reel|tv}/{id}/embed/`. This is the one sanctioned URL derivation. It renders the post with playback and works for logged-out viewers.

- On other platforms, frame only an official embed endpoint built for it, with YouTube's `/embed/{id}` as the common case. Verify that the framed document actually renders the content for a logged-out viewer before shipping it.

- A platform that blocks framing or puts the embed behind a login gets a link-out card instead. Never try to work around it with a scraped player or a guessed URL.

- The permalinks of the user's own saved or liked Instagram posts come from the Instagram connector. Read `/opt/hatch/connectors/instagram/CONNECTOR.md`: `instagram-cli saved-posts` returns each post's `url`, the permalink the derivation above starts from.

## The markup

- Build a card with a visible permalink anchor as the base layer and the embed iframe on top:

```html
<div class="embed-card"><!-- fixed-height box; reels read best near 9/16 -->
  <iframe src="https://www.instagram.com/reel/{id}/embed/"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          referrerpolicy="no-referrer" loading="lazy" scrolling="no"></iframe>
  <a href="{permalink}" target="_blank" rel="noopener">Watch on Instagram</a>
</div>
```

- Use exactly that `sandbox` token set. It is the standard third-party embed posture: the frame cannot reach your page, and its own links can still open.

- Give the card a fixed height and a neutral skeleton background so the layout does not shift while the frame loads, and let the iframe absolutely fill it.

- Always set `loading="lazy"`. With many embeds on one page, mount each iframe only as it nears the viewport so loading stays responsive.

- Keep the permalink anchor visible under or beside the frame. It is the attribution, and on surfaces that block iframes it is the content.

## Where it renders

- The published artifact page and its share link allow third-party iframes, so the embed plays there. The in-chat preview and some host frames block iframes, and in those views the source link remains.

- Design for both. The embed is an enhancement layered on a link-out card that is complete by itself, never the only content in the slot.

## Media bytes

- Never hotlink platform CDN media (`cdninstagram.com`, `fbcdn.net` and similar) in an `<img>` or `<video>`. Those URLs expire and can stop working after delivery, and the artifact audit rejects them.

- If the card needs a visual before the frame loads, use a neutral skeleton, not a fetched thumbnail.

- Do not extract or play a platform's MP4 directly, since there is no durable URL for it. The embed iframe or the permalink is the playback path.
