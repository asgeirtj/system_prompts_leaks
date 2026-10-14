---
name: "image_search"
description: "Search the web by text query for image URLs and source pages for feeds, artifacts, and visual references. Does not identify a supplied image or person."
metadata: { "includeInPrompt": true }
---

# Image Search

Use the bundled CLI to find public images by text query:

```sh
/opt/hatch/bin/image-search "Golden Gate Bridge at sunset" --max-results 5
```

Optional result language:

```sh
/opt/hatch/bin/image-search "Paris architecture" \
  --max-results 5 \
  --language fr
```

The CLI returns structured results and omits unavailable fields. Interpret the
URLs as follows:

- `media_url` is the public source image locator and the preferred full-image
  URL when present.
- `thumbnail_cdn_url` is Meta's renderable CDN preview and the fallback when
  `media_url` is absent. Treat it as a cache URL, not the sole durable copy of
  an artifact.
- `media_handle` and `candidate_ref` are internal, non-renderable fields. Do
  not fetch, display, or pass them as image URLs.
- `page_url` is the source page. Retain it for provenance or attribution.

The service returns only results with `media_url` or `thumbnail_cdn_url`.
Ignore any result that lacks both renderable URL fields.
Choose the result that best matches the request rather than blindly taking the
first one.

This skill returns locators only: it does not download, upload, or turn an
image into a Muse media reference. A Feed may use a suitable remote image URL.
For an Artifact that needs a durable local copy, pass the chosen locator and
source page through the Artifact's supported media-ingestion path; do not treat
the CDN thumbnail as permanent storage.

For an Artifact, choose a download-safe locator before starting any fetch:

1. Inspect all returned results and prefer an HTTPS `media_url` with no URL
   credentials, query string, or fragment. Preserve result order among those
   simple public URLs.
2. Preflight each candidate like a browser, with a cross-origin referer, then
   fetch one candidate at a time with bounded connect and total timeouts
   (substitute real values for the placeholders):

   ```sh
   curl -fsSLI -A 'Mozilla/5.0' -H 'Accept: image/png,image/jpeg,image/gif,image/webp,image/*;q=0.5' -H 'Referer: <any-https-origin-that-is-not-the-image-host>' '<image-url>'
   curl -fsSL --connect-timeout 10 --max-time 60 -A 'Mozilla/5.0' -H 'Accept: image/png,image/jpeg,image/gif,image/webp,image/*;q=0.5' -o '<dest-file>' '<image-url>'
   ```

   Accept only a final `2xx` whose content type and file magic are an image,  
   then copy those bytes into Artifact-owned storage. Prefer PNG or JPEG:  
   WEBP is fine except in a Word document, and AVIF except on a web page,  
   which refuses it at share time with no retry that fixes it. Convert a HEIC  
   to JPEG anywhere. Reject hotlink-blocked, expiring, redirecting, 403/404,  
   non-image, watermarked, or unstable URLs. The referer matters: a  
   hotlink-protected host serves a plain fetch but refuses requests that look  
   like they come from someone else's page, so a URL that fails this probe  
   breaks after the Artifact ships even though it loads for you today. The  
   same preflight applies to any external image URL an Artifact uses, however  
   it was found.
3. If no simple `media_url` succeeds, consider a query-bearing `media_url` or
   `thumbnail_cdn_url`. Use the returned locator byte-for-byte; never remove or
   rewrite its query string to make it look simpler.

Search-result pre-approval records the returned locator's exact path and query,
so a plain GET/HEAD that uses it byte-for-byte is normally allowed without
another prompt even when it has a query string. Do not keep retrying or
substitute an unrelated local image when a fetch fails.

This is text-to-image search, not reverse-image identification. Do not use it
to identify an unknown person from a supplied photograph.
