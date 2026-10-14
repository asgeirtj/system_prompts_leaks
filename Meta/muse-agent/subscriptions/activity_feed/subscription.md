# Activity Feed

The activity feed is the sidebar-visible log of completed and in-progress work.
Every entry corresponds to a card the user can see on their activity sidebar:
emails sent, files created, web searches, reminders, goals, and other
noteworthy actions. It is not the Feed tab (the personal newspaper of
published feed units); those units are served only by the `feed` and
`feed.units` tools, never by this log.

## When To Use

Use this ledger when you need to know what the user already sees on their
sidebar, when the user references recent activity, or when you want to avoid
redundantly narrating work that is already visible on the sidebar.

## How To Read

Read the activity feed read-only from the daemon sandbox API (no database
access required):

```bash
curl -sS --unix-socket "$JARVIS_SANDBOX_API_SOCK" \
  "http://localhost/activity/recent?limit=10"
```

Query parameters:

- `is_goal` — `true` for goal/activity-thread entries, `false` for simple activity entries; omit for all.
- `activity_type` — filter by kind: `email_sent`, `message_sent`, `file_created`, `file_updated`, `reminder_set`, `web_search`, `task_running`, `goal`.
- `limit` — max entries, newest first by finish-or-created time (default 10, max 100).

The response is `{"ok":true,"result":{"entries":[...]}}`. Each entry has:

- `timestamp` — RFC3339 finish-or-created time.
- `activity_type` — kind of activity (see values above).
- `status` — `success`, `error`, `pending`, `blocked`, or `stopped`.
- `title` — short user-facing title shown on the sidebar card.
- `status_title` — compact status label for the card.
- `subtitle` — longer context line shown below the title.
- `task_label` — optional task label for grouped activity.
- `message_id` — associated message id when the activity originated from a chat turn.

## Query Examples

Recent sidebar activity (non-goal):

```bash
curl -sS --unix-socket "$JARVIS_SANDBOX_API_SOCK" \
  "http://localhost/activity/recent?is_goal=false&limit=10"
```

Recent goals:

```bash
curl -sS --unix-socket "$JARVIS_SANDBOX_API_SOCK" \
  "http://localhost/activity/recent?is_goal=true&limit=10"
```

Activity by type:

```bash
curl -sS --unix-socket "$JARVIS_SANDBOX_API_SOCK" \
  "http://localhost/activity/recent?activity_type=email_sent&limit=10"
```
