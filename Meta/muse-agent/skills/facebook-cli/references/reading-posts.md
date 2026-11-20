# Reading Facebook posts

- Read Facebook posts the account can access, including posts by other people and in groups. These commands provide context for a shared post or a published update.

## Read a post

```sh
/opt/hatch/bin/facebook-cli post read --post-id '<returned post ID>'
/opt/hatch/bin/facebook-cli post read --url '<canonical Facebook URL>'
```

- Supply one ID or URL. IDs can be numeric or PFBIDs. The response contains text, a permalink and available media context.

- Canonical profile and group post, photo, video and Reel URLs go directly to the reader, including Facebook's mobile URLs. The reader resolves media URLs to their containing post. Standalone media may not have a containing post

- Share links (`/share/<token>/` or `/share/p/<token>/`) need decoding:

```sh
/opt/hatch/bin/facebook-cli link-sharing decode-url --url 'https://www.facebook.com/share/p/<share-token>/'
```

- Pass a returned post or media `original_url` unchanged to the reader. An empty or missing result means the link could not be resolved. Ask for a direct link.

- Explain failed reads using the returned error. Missing and inaccessible content may be indistinguishable

## Present results

- For each post you present, include its author, content and timestamp. Include the clickable returned link in your response.

- When the user requests exact text, preserve the author’s wording.

- The `post_caption` response can also contain a media summary or a provider-written `header_text`. Present those as descriptions.

- The author may be distinct from the timeline owner. When the post comes from someone writing on another person’s wall, surface that information.

- Ground claims about media in returned `media_summary`, `media_ocr` or `video_transcript`. These fields are precomputed and may be missing. Describe only what the available evidence confirms.

- `shoppable_products` provides product context for some videos and Reels. Use the returned attributes when describing what the video shows or promotes. Product identity, price and availability need additional, separate evidence.

## Related readers

- [Group posts](/opt/hatch/connectors/facebook_cli/references/groups.md) for browsing a group.

- [Events](/opt/hatch/connectors/facebook_cli/references/events.md) for event details.

- [Marketplace listings](/opt/hatch/connectors/facebook_cli/references/marketplace.md) for an item's details.

- [Shop a Facebook Reel](/opt/hatch/connectors/facebook_cli/references/shopping-links.md) for products shown in a video or Reel, including when to request recommendations with `--out`.
