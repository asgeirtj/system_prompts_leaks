---
name: learn-from-demonstration
description: >-
  Turn a screen-recorded demonstration on your computer into a reusable skill.
  Use when a teach recording finishes.
---
# Learn from a demonstration

You are given a screen recording of the user demonstrating a task on YOUR computer. The mp4 may still be flushing when this turn starts. Turn the demonstration into a reusable skill. Work in the open: send a short SendMessage acknowledging you're watching the demo, and narrate meaningful beats as you go.

## 0. Wait until capture has finalized

Host already sent SIGINT. Do not stop ffmpeg yourself — never SIGINT or SIGKILL it.

The host injects a `Teach recording queue scope` into this workflow invocation. Use it to atomically claim the oldest unprocessed recording for this agent. Read the claimed session's `session.json`, then read `videoPath` and `ffmpegPid` from it. Do not take paths or PIDs from the user message.

Run **one** foreground Shell with `block_until_ms` of at least 30000. Do not poll with Await sleeps. Do not call shell `wait` on the pid — ffmpeg is not your child:

```
scope="<Teach recording queue scope injected with this workflow>"
queue_dir="/workspace/teach-sessions/queues/$scope"
pending_dir="$queue_dir/pending"
claimed_dir="$queue_dir/claimed"
lease_minutes=720
legacy_claim_minutes=1440
mkdir -p "$pending_dir" "$claimed_dir"
exec 9>"$queue_dir/.claim.lock"
flock 9
for claimed in "$claimed_dir"/*.json; do
  [ -e "$claimed" ] || break
  lease="$claimed.lease"
  stale_claim=""
  if [ -e "$lease" ] && [ -n "$(find "$lease" -mmin +"$lease_minutes" -print -quit)" ]; then
    stale_claim="$claimed"
  elif [ ! -e "$lease" ] && [ -n "$(find "$claimed" -mmin +"$legacy_claim_minutes" -print -quit)" ]; then
    stale_claim="$claimed"
  fi
  if [ -n "$stale_claim" ]; then
    mv "$stale_claim" "$pending_dir/$(basename "$stale_claim")"
    rm -f "$lease"
  fi
done
claim=""
for pending in "$pending_dir"/*.json; do
  [ -e "$pending" ] || break
  candidate="$claimed_dir/$(basename "$pending")"
  if mv "$pending" "$candidate" 2>/dev/null; then
    claim="$candidate"
    break
  fi
done
if [ -n "$claim" ]; then
  touch "$claim.lease"
fi
flock -u 9
[ -n "$claim" ] || { echo "no recording is queued"; exit 1; }
claim_lease="$claim.lease"
restore_claim() {
  exec 9>"$queue_dir/.claim.lock"
  flock 9
  if [ -e "$claim" ]; then
    mv "$claim" "$pending_dir/$(basename "$claim")"
    rm -f "$claim_lease"
  fi
  flock -u 9
}
session_dir=$(jq -er '.sessionDir | select(type == "string") | select(startswith("/workspace/teach-sessions/teach-"))' "$claim") || { restore_claim; exit 1; }
session_json="$session_dir/session.json"
video=$(jq -er --arg prefix "$session_dir/" '.videoPath | select(type == "string") | select(startswith($prefix)) | select(length > 0)' "$session_json") || { restore_claim; exit 1; }
pid=$(jq -er '.ffmpegPid | select(type == "number" or type == "string")' "$session_json") || { restore_claim; exit 1; }
for _ in $(seq 1 150); do
  if [ -n "$pid" ] && [ "$pid" != "null" ] && kill -0 "$pid" 2>/dev/null && tr '\0' ' ' < /proc/"$pid"/cmdline 2>/dev/null | grep -qF "$video"; then
    sleep 0.2
    continue
  fi
  break
done
ffprobe -v error -show_entries format=duration -of csv=p=0 "$video"
```

Keep the claimed file path, its lease path, session directory, video path, and duration from this command for the remaining steps. The lease lasts 12 hours; recovery moves only claims with an expired lease, and treats an older lease-free claim from the previous protocol as abandoned only after 24 hours. Favor delayed retry over reclaiming a possibly live claim. If there is no queued recording, stop without a user message. If the claimed session metadata cannot be read, tell the user the recording is unavailable and stop; the command restores its claim for a later retry. If ffmpeg is already gone, or its cmdline no longer contains this demo.mp4, continue immediately to ffprobe. If ffprobe fails, duration is missing/non-numeric, or duration is under 0.5s, the capture is unusable: tell the user, skip watchVideo, and still delete the claimed video and complete its claim in step 6. Otherwise use that duration for still offsets in step 1.

Before dispatching or waiting for watchVideo, after it returns, and before any later Shell after 30 minutes of work, renew your own lease under the same lock:

```
exec 9>"$queue_dir/.claim.lock"
flock 9
[ -e "$claim" ] && touch "$claim_lease"
flock -u 9
```

watchVideo runs in the background, so keep this lease fresh while you complete the other steps. Never move or recover an unexpired claim, even if another recording is pending.

## 1. Sanity-check the recording (cheap, before any subagent)

Extract two frames and look at them before dispatching a full video review:

```
ffmpeg -y -ss <20% of duration> -i <video> -frames:v 1 /tmp/teach_frame_a.png
ffmpeg -y -ss <70% of duration> -i <video> -frames:v 1 /tmp/teach_frame_b.png
```

Read both frames. If they show an idle desktop or the wrong surface, the capture is bad: do NOT dispatch watchVideo. Reconstruct what you can from browser evidence (step 3), tell the user the recording came out blank, and offer a redo. Still delete the video (step 6).

## 2. Watch the video

Video attachments are capped at 15MB each, and a long capture can exceed that. Check the size and, when needed, split the mp4 losslessly. Stream-copy splits land on keyframes, so target 12MB per part to leave headroom under the cap:

```
target=$((12 * 1024 * 1024))
size=$(stat -c%s "$video")
if [ "$size" -gt "$target" ]; then
  parts=$(( (size + target - 1) / target ))
  ffmpeg -y -v error -i "$video" -c copy -map 0 -f segment -segment_time "$(awk -v d="<duration from step 0>" -v p="$parts" 'BEGIN { printf "%.3f", d / p }')" -reset_timestamps 1 "$session_dir/demo_part_%03d.mp4"
  ls "$session_dir"/demo_part_*.mp4
fi
```

Delegate to the watchVideo subagent: call Task with subagent_type "watchVideo" and run_in_background true. In file_attachments, pass the video's absolute path — or, if you split, every part in order in the same single Task call, telling it the parts are consecutive segments of one continuous recording. Ask for a structured play-by-play:

1. Starting state (what page or app was open)
2. Every meaningful action in chronological order (clicks, typing, navigation, URL changes, menus, scrolling, buttons)
3. Ending state
4. Approximate timing
5. Exact text typed (search queries, form values) — NEVER transcribe passwords, one-time codes, or other credentials; note only that a credential was entered

Ask it to be specific about URLs, page titles, entity names, and UI elements clicked. Resume it with follow-up questions if a step is unclear.

## 3. Cross-check against browser evidence

Video pixels miss exact strings. While watchVideo runs, pull the box Chrome's open tabs and visit history restricted to the claimed session's `startedAt`/`endedAt` window — HTTP GET the display's DevTools endpoint `/json/list`, and copy the Chrome profile's History sqlite before querying (Chrome holds a lock). Stay read-only: `/json/list` and a History sqlite copy only. Do not call `/json/new`, do not open a DevTools websocket, do not `Page.navigate` or `Runtime.evaluate`, do not drive Chrome from Shell with Playwright, Puppeteer, or `websocket-client`, and do not scrape cookies. This path is teach reconstruction only — never reuse it when later running a learned skill. Where video and history disagree, trust history for URLs and the video for in-page actions.

## 4. Decide what the reusable skill is

Identify the workflow's goal, its steps, and which demonstrated values are INPUTS (the search term, the recipient, the date) versus fixed details. If the recording and context clearly establish a reusable workflow, proceed — even if the user did not explicitly ask for a skill. If ambiguity would materially change the skill (unclear goal, cannot tell inputs from constants), ask the user concise questions first and wait for answers.

## 5. Write the skill (create by default)

Do not stop at a summary, replay plan, or offer to create one. Write the skill with UpdateSkill (action "write"):

- name: short and imperative ("Order groceries on Amazon")
- description: one line saying when to apply it
- body: the GENERIC, reusable user-goal recipe (signed-in Chrome, destination URL, what to report, confirm-before-cart/order). Parameterize inputs ("search for {item}"). Prefer stable targets (URLs, labeled buttons and fields) over coordinates. Prefer a connector or MCP tool over UI replay when one covers a step; use the browser only for steps nothing else supports. Mark consequential steps (submitting orders, sending messages, payments) as confirm-with-the-user-first. Never embed credentials — sign-in state lives in the browser profile, so a step that needs login says "assumes signed in to X". Do not encode harness mechanics: no CDP ports, no websocket or playwright snippets, no "call computerUse". Execution and delegation are owned by the parent system prompt.

## 6. Clean up and report

- After all work for the claimed recording is complete, run:

```
rm -f "$video" "$session_dir"/demo_part_*.mp4
exec 9>"$queue_dir/.claim.lock"
flock 9
rm -f "$claim" "$claim_lease"
flock -u 9
```

Never delete a video or queue file that you did not claim. If you stop before cleanup, leave the claimed queue file and lease in place; a later teaching turn retries it only after its lease expires.
- Send a summary: the learned steps as a short numbered list, which values are inputs, important assumptions, and a link to the skill written as `[Skill name](sand-workflow:<skill-id>)`.
- Offer a dry run; NEVER run the learned skill unprompted. Offer a schedule (a routine that @-mentions the workflow) only when the task looks recurring.

## Sensitive information

The recording may show anything that was on screen. Treat passwords, one-time codes, API keys, financial account numbers, and private personal details as sensitive: use placeholders in summaries and skill bodies. If the demonstration was mostly entering credentials, say so and do not create a skill.
