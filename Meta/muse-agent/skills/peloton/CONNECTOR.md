# Peloton

- Run `/opt/hatch/bin/peloton` to search Peloton's class catalog and manage the classes on the user's Peloton schedule. It cannot read the user's completed workouts or performance history.

## Connect

```text
/opt/hatch/bin/peloton status
/opt/hatch/bin/peloton authorize-url
```

- Run class reads directly, without a `status` check first. Run `status` when a read returns `not_connected` or the user asks to manage the connection.

- Before creating a link, tell the user that connecting stores a persistent Peloton access token, so Muse keeps access until they disconnect or revoke it in Peloton settings, and wait for their go-ahead. Never show OAuth scope names.

- Run `authorize-url` once and share its `connect_url` as a Connect Peloton link. While the user is connecting, check `status` instead of creating more links.

- Continue when `status` is `connected`. If it is still not connected, say the connection is pending or failed and ask whether to send a new link.

- Token refresh is automatic. If reads keep failing on authentication, check `status` and reconnect.

- `disconnect` revokes access at Peloton and removes the stored connection. Never print client secrets, access tokens or refresh tokens.

## Find classes

```text
/opt/hatch/bin/peloton search-class --query "seated strength" --limit 10 --page 0
/opt/hatch/bin/peloton ride-live --days 7 --exclude-complete true
/opt/hatch/bin/peloton ride-archived --fitness-discipline cycling --duration 1800 --difficulty-level beginner --limit 10 --page 0
/opt/hatch/bin/peloton metadata-mappings
```

- Use `search-class` for natural-language requests, with `--limit 10 --page 0` unless the user wants a different window. Peloton search has no provider pagination, so `--limit` and `--page` only slice one returned set (`pagination_mode: local_window`). Refine the query to find different classes.

- Use `ride-archived` for structured browsing of on-demand classes. Its filters are `--fitness-discipline`, `--duration` in seconds, `--difficulty-level`, `--class-type-id`, `--instructor`, `--super-genre-id`, `--browse-category`, `--has-closed-captions`, `--sort-by` and `--desc`.

- Use `ride-live` for upcoming live classes, normally with `--days 7 --exclude-complete true`. It takes the same discipline, class type, instructor, genre and category filters, plus `--schedule-type` and epoch `--start` and `--end` bounds.

- Take instructor, class type, discipline, equipment, difficulty and format IDs from `metadata-mappings` instead of hardcoding them.

- `--include-raw` and `--include-schema` on `search-class` only help inspect the response shape.

## Present classes

- Class reads return `body.classes[]`. Show them with `widget.create_list_widget`, putting the class title in `title`, the instructor and `duration_minutes` in `subtitle`, and the relevant class time in `tertiary_title`.

- Copy `thumbnail_url` into `image_url`. Make each item a `link` item with the returned `deeplink_url` in `data.url`, or a `generic` item when there is no link.

- Show times from the semantic fields `class_starts_at`, `class_scheduled_start_at`, `class_ends_at` and `class_originally_aired_at` in their user-local form, not the raw epochs.

- Place the returned `embed_token` in the reply and do not repeat the list in prose. If there are no classes, say so. If the widget fails, list each class's title, instructor and duration in short bullets.

- Never show class IDs, class or image URLs, difficulty scores, ratings or rating counts unless the user asks for technical detail. Never build a class URL yourself.

## Manage the schedule

```text
/opt/hatch/bin/peloton schedule-event --ride-id RIDE_ID --scheduled-start-time EPOCH_SECONDS
/opt/hatch/bin/peloton schedule-event --join-token JOIN_TOKEN
/opt/hatch/bin/peloton reschedule-event --join-token JOIN_TOKEN --scheduled-start-time EPOCH_SECONDS
/opt/hatch/bin/peloton delete-scheduled-event --join-token JOIN_TOKEN
/opt/hatch/bin/peloton deeplink --class-id CLASS_ID
```

- Schedule an on-demand class with its ride ID (the class `id`) and an epoch start time, and add a live class with its `join_token`. Moving or removing a scheduled class needs its `join_token`, so keep it from the scheduling response or the class listing.

- A clear request that identifies one class is enough to schedule, move or remove it, with no separate chat confirmation.

- The connector cannot list the user's schedule. After an uncertain failure, ask the user to check their Peloton schedule before trying again so the class is not added twice.

- `deeplink` returns the class page `url` on members.onepeloton.com.

## Related skills

- [Workout Planning](/opt/muse/skills/workout-planning/SKILL.md)

- Use `muse.skill_search` to find other skills and `muse.connector_search` to find other connectors.
