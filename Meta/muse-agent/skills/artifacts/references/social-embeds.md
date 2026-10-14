---
description: Embedding social posts and reels (Instagram) and other third-party rich content in a web page. Which platforms can be framed, the exact embed markup, and the link-out degrade for surfaces that block iframes.
builders: web
---

# Social posts, reels, and rich embeds

Read this when a page should show a social post, reel, or other third-party
rich content (a video, a player, an interactive widget) rather than just link
to it.

## What can and cannot be framed

- **Instagram posts, reels, and tv**: append `/embed/` to the permalink path,
  giving `https://www.instagram.com/{p|reel|tv}/{id}/embed/`. This is the one
  sanctioned URL derivation; it renders the post with playback and works for
  logged-out viewers.
- **Other platforms**: frame only an official embed endpoint built for it
  (YouTube's `/embed/{id}` is the common case). Verify the framed document
  actually renders the content for a logged-out viewer before shipping it; a
  platform that blocks framing or login-walls the embed gets a link-out card
  instead, and never try to bypass with a scraped player or a guessed URL.
- **The user's own saved or liked Instagram posts**: their permalinks come
  from the Instagram skill, not from browsing the user's account pages. Read
  `/opt/hatch/skills/instagram/SKILL.md`: `instagram-cli saved-posts` returns each
  post's `url`, the permalink the derivation above starts from.

## The markup

A card with a visible permalink anchor as the base layer, and the embed iframe
on top:

```html
<div class="embed-card"><!-- fixed-height box; reels read best near 9/16 -->
  <iframe src="https://www.instagram.com/reel/{id}/embed/"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          referrerpolicy="no-referrer" loading="lazy" scrolling="no"></iframe>
  <a href="{permalink}" target="_blank" rel="noopener">Watch on Instagram</a>
</div>
```

- Use exactly that `sandbox` token set: it is the standard third-party-embed
  posture (the frame cannot reach your page, and its own links can still open).
- Give the card a fixed height and a neutral skeleton background so the layout
  does not shift while the frame loads, and let the iframe absolutely fill it.
- `loading="lazy"` always; with many embeds on one page, mount each iframe only
  as it scrolls near the viewport — embed documents are heavy.
- Keep the permalink anchor visible under or beside the frame. It is the
  attribution, and on surfaces that block iframes it is the content.

## Where it renders

The published artifact page and its share link allow third-party iframes, so
the embed plays there. The in-chat preview and some host frames block all
iframes; there your card degrades to the anchor. Design for that: the embed is
an enhancement layered on a link-out card that is complete by itself, never the
only content in the slot.

## Media bytes

- Never hotlink platform CDN media (`cdninstagram.com`, `fbcdn.net`, and kin)
  in an `<img>` or `<video>`: those URLs are signed and expiring, the audit
  fails them, and they 403 after you ship. If the card needs a visual before
  the frame loads, use a neutral skeleton, not a fetched thumbnail.
- Do not extract or play a platform's MP4 directly; there is no durable URL
  for it. The embed iframe or the permalink is the playback path.
