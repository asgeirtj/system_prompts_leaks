---
name: "device_data"
title: "Device Data"
description: "Read cached contacts and calendar events from Muse storage. Delete Muse's local copy of either source without modifying paired devices."
metadata: { "includeInPrompt": true }
---

# Device Data

## Purpose

Read cached contacts and calendar events directly from Muse storage, without
contacting the device. Use it when a live read is not possible: the device is
offline, or it does not offer `contacts.search`/`calendar.search`. Delete all
locally stored contacts or calendar data when the user explicitly requests it.
The tool does not contact or mutate a device.

## Commands

```bash
device-data --help
device-data contacts status
device-data contacts --delete-all
device-data contacts search --match-mode ranked \
                            [--query <text> [--phone-label <text>] \
                             [--locale <bcp-47>]] \
                            [--device <node_id>] [--limit <n>] [--offset <n>]
device-data calendar search [--query <text>] [--device <node_id>] \
                            [--start-date <YYYY-MM-DD>] \
                            [--end-date <YYYY-MM-DD>]
device-data calendar --delete-all
```

Both searches default to every eligible paired device. Use `--device` to scope
to one and omit `--query` to list.

Contact search combines literal display-name, phone, and email substring
matches with token-level exact, locale-aware personal-name nickname, and
phonetic name matching. With no locale or an English locale, ranked search
applies OACR-style fuzzy matching only after ordinary name matching returns
nothing for that source device. It compares cleaned query tokens of at least
four characters against the cleaned full name and canonical indexed name
tokens, including simplified name variants, allows one edit, and returns at
most three fuzzy candidates per source device. Explicit non-English locales
retain the existing bounded Unicode full-name edit-distance fallback.
Ranked name evidence feeds the downstream call-authorization policy. Fuzzy,
partial, and phonetic evidence must pass bounded token revalidation before a
complete singleton autodials; literal matches never autodial. Nickname
singletons rely on the explicit locale-selected nickname map. Weak, ambiguous,
incomplete, or unanchored matches still require confirmation.

Ranked results also include `selection_evidence`. Its
`spoken_name_collision_pairs` identifies differently spelled plausible matches
whose full names have strong phonetic coverage in both directions; a nonempty
list sets `requires_spoken_name_clarification`, because spoken input has not
selected between them. Collision entries carry a comma-separated
`spoken_spelling` suitable for distinct TTS pronunciation in either a call or
message clarification.
Each contact includes `phone_selection`, which groups safely equivalent
formatting variants into one destination and reports
`distinct_usable_phone_count` and
`requires_phone_clarification`. When `--phone-label` is present,
`requested_label_match_count` reports how many distinct destinations carry
that label or a recognized equivalent such as `cell` and `mobile`. Each option
includes a TTS-safe `spoken_suffix` for the rare case where labels do not
distinguish the saved lines.

Compound given names match as a unit: under the English default, `Mary Ann`
can find a contact named `Mary`. Pass `--locale` to select the
French, Italian, or Spanish nickname map when the user's locale is known; for
example, `Mamen` finds `María del Carmen` with `--locale es`, and `Coco` finds
`Jean Claude` with `--locale fr`. Language subtags `ar`, `ja`, `zh`, and `ko`
disable nickname matching; every other locale without a dedicated map uses the
English fallback. If the locale is unavailable, omit the flag to use that
English nickname, fuzzy, and spoken-emoji default. Queries containing Chinese,
Japanese, or Korean characters retain the bounded whole-name edit-distance
fallback without requiring locale plumbing. Explicit non-English locales do not
inherit English spoken-emoji labels. Phone matching ignores formatting
and country-code differences when the final seven digits agree, but only for a  
phone-shaped  
query; digits embedded in names or emails do not activate phone matching.
Ranked name search is order-independent, treats apostrophes and
hyphens symmetrically, tolerates repeated or unmatched query words, and reports
coarse `match` evidence (`class`, matched/total tokens, and unmatched tokens).
Results are a single ranked, paginated list; they do not assert that one contact
has been selected. Pass an explicitly requested phone type through
`--phone-label` rather than including it in the name query. Phone numbers are
ordered by the requested label first, then mobile, home, work, other, and custom
labels. Results report `phone_label_matched`; a label miss does not exclude the
contact.
Organization and job title are included when available. Ranked results can be
paged by advancing `offset` by the returned `count` while `has_more` is true.
`search_complete` is false when the scoped contact corpus, bounded
preprocessing, or a ranked result bound overflows, independently from
pagination; inspect
`corpus_overflow`, `preprocessing_overflow`, and `result_overflow` for the
cause. `fuzzy_overflow` separately reports that English fuzzy recovery hit its
non-pageable, per-source confirmation cap; it does not make an otherwise exact
result incomplete.

## Operating Rules

1. Read fresh this turn; never answer a contacts or calendar question from memory.
2. Treat device data as private user data: show only the fields the request needs, and do not infer sensitive attributes from contacts, locations, device names, or communication metadata.
3. Use inclusive `YYYY-MM-DD` bounds for calendar dates, with the same date for
   a single day; all-day result `end_date` values are also inclusive. Read event
   times from the tagged `time` object: `timed` keeps the existing localized
   `start_at` / `end_at` fields and adds their UTC forms plus `user_timezone`,
   the IANA display zone used to render those local values; `all_day` has
   date-only values that must not be timezone-shifted. Both carry
   `start_weekday` / `end_weekday`, already resolved against the value beside
   them; use those and never work a weekday out from the date yourself.
   Contact reads likewise preserve `synced_at` and add semantic
   `contact_synced_at` or `contact_sync_completed_at` UTC/user-local forms.
4. Treat an empty calendar result as authoritative only when `cache.coverage`
   is `complete`. For contacts, `search_complete` covers the bounded corpus and
   ranked result sets, not source freshness; consult contacts status when
   freshness matters and report partial or truncated results.
5. If no record exists, say so. A device calendar is only that phone's view;
   check other connected calendars when relevant.
6. When the user asks to delete contacts or calendar events without naming the
   target, do not infer the target. Confirm that the user means Muse's locally
   stored copy before deleting anything.
7. After the user explicitly requests deletion of Muse's locally stored copy,
   run the command that matches the source:  
   `device-data contacts --delete-all` or  
   `device-data calendar --delete-all`.  
   Do not enumerate record IDs.
8. Both `--delete-all` commands delete the selected source from Muse storage
   across all devices. They delete cached records, source-ledger payloads,
   upload staging, and sync state. They preserve device pairing and every other
   data source. A later device sync can store new records for the deleted
   source.
