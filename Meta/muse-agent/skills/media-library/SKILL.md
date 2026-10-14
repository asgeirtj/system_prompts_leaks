---
name: "media_library"
description: "Search and inspect the user's photo library, including connected device galleries. Use for photo requests and whenever a photo could ground or personalize a response; lookups of uploaded photos are cheap, so check opportunistically and move on if nothing fits."
metadata: { "includeInPrompt": true }
---

# Media Library

## Purpose
Find the user's photos in Jarvis's uploaded library or a connected device gallery. The `media-library` CLI covers uploaded photos only.

## Device Photos

Search connected galleries for explicit gallery requests, or when uploaded or attached images are insufficient for a personal photo request.

1. **Discover.** Call `device.list`, then `device.describe`. Choose a reachable device advertising `photos.search` in `commands`: user-named first, then `is_request_origin`, then another phone. Clarify ambiguity.
2. **Search.** Invoke `photos.search`, narrowing with its advertised filters; albums mean folders. Respect permission denial and retry after required setup succeeds. Follow pagination and report incomplete coverage rather than claiming no matches.
3. **Upload.** Search returns metadata. For viewing or comparison, upload a shortlist using the advertised commands. Wait for completion and account for partial failures; acceptance is not completion.
4. **Locate.** After completion, run `/opt/hatch/bin/media-library recent --limit 20` for paths/IDs. Match capture dates, filenames, and GPS against device results; use `get` for details and date/GPS searches for older or already-uploaded photos. Filenames or recency alone cannot prove identity. Read confidently matched images; report uncertainty rather than guessing paths.

## Tooling
Use `exec` to run `/opt/hatch/bin/media-library <subcommand> [options]` for uploaded photos.

Subcommands:
- `stats` — library overview (total count, date range, description status)
- `search [--query "<terms>"] [--after YYYY-MM-DD] [--before YYYY-MM-DD] [--lat <f64>] [--long <f64>] [--radius <km>] [--has-gps] [--path <prefix>] [--limit N]` — when `--query` is present, FTS ranked by BM25; otherwise structured filtering sorted by taken date
- `recent [--limit N]` — latest uploads by upload time (default 20, max 50)
- `scan [--ids <id1,id2,...>] [--query "<terms>"] [--after YYYY-MM-DD] [--before YYYY-MM-DD] [--limit N]` — richer summaries with full descriptions; requires at least one narrowing option (any of the flags above, including `--limit` alone)
- `get <media_id>` — full detail for one photo (JSON)

Output contract:
- `stats`: plain text with `Total photos`, `Date range`, and description status counts (`ready`, `pending`, `failed`, `rejected`).
- `search`: each result line: `<media_id> | <path> | <date> | [<location> |] <summary_short>`, with optional `match:` snippet below.
- `recent`: same compact format as `search`, without match snippets.
- `scan`: text blocks per item: `media_id`, `path`, `date`, `location`, `summary`, `detail`.
- `get`: JSON with `media_id`, `rel_path`, `mime_type`, `size_bytes`, `taken_at_local`, `taken_at_local_date`, `gps_latitude`, `gps_longitude`, `location_text`, `location_json`, `exif_json`, `description_status`, `description` (nested: `summary_short`, `summary_full`, `people_text`, `activity_text`, `objects_text`, `ocr_text`, `location_hint_text`).

The `path` field in results is relative to the home directory.

## Operating Rules

1. **Workflow.** `stats` on first use → `search` or `recent` → `scan` for richer detail on candidates → `get` for full info → `read` the image only if the user wants to see it or the description is insufficient. Most queries can be answered from descriptions alone.
2. **Stats interpretation.** If total is 0, the uploaded library is empty or not set up yet — mention this briefly and check a connected device gallery, if available, for personal photo requests. If total is low (under ~20), note the library is small. If many are pending, text search will miss undescribed items — prefer `recent` or date-filtered searches instead.
3. **Opportunistic vs primary use.** When the media library may help answer the question, do a quick probe — `stats` plus a `search` or `recent` — and move on if nothing useful comes back. When the user is explicitly asking to find, show, identify, date, or locate a photo, treat the media library as a primary source and iterate harder with multiple searches, `scan`, and `get`.
4. **Uploaded-library searches are cheap local PostgreSQL lookups** (typically milliseconds). Don't hesitate to run many queries — try different terms, filters, and angles until you find what the user is looking for.
5. **FTS semantics.** Bare terms are joined with implicit OR, ranked by BM25 (more matching terms = higher rank). AND/OR/NOT are supported. Terms are prefix-matched after punctuation stripping. Adding more OR terms makes results *broader*, not narrower — to narrow, use AND, date filters, or GPS filters instead.
6. **Start with the user's words**, not guessed content. Broaden with synonyms, context from memory or conversation, or related terms only after direct queries come up short or return irrelevant results.
7. **Location.** Geocoded city/county, state, and country names are in the search index — `search --query "Tokyo"` works. For GPS proximity, call `map.geocode` with the place as `query`, then use the returned coordinates with `search --lat <lat> --long <lon> --radius <km>` (scale: `0.1` for a spot, `5` for a neighborhood, `50` for a metro area).
8. **People.** Use physical descriptions ("woman in red dress"), not names.
9. **Memory.** Cross-reference memory for dates and locations when the user mentions events or trips.
10. **When finding a specific photo**, show what you found and confirm it's the right one.
