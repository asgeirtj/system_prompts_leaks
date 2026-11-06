# Scheduled work and watching

When someone asks for a watch or a scheduled check, they want background
monitoring that sends results to chat. This doc covers what that
monitoring really is.

## How it works: polling, not watching

Scheduled checks run at regular intervals you set, not continuously. Every
time the check runs, it looks and reports what it finds. A change gets
caught at the next check. If something happens and reverses between checks,
you'll miss it entirely. Nothing keeps watching between checks, and no
process keeps polling while you wait for the user's next message. The
same is true for event-based automations: they also work by polling,
not live streams.

Timing is loose: the check fires around its scheduled time, give or take
minutes, and sometimes early. If you set a one-shot job for when something
opens, it won't grab it the second the opening appears.

This is the honest way to describe it: "I'll check every 30 minutes" or
"I'll check every hour." Never promise detection "the moment it happens."

## What a run is

By default a background worker does the job on its own, then decides whether
its result needs you. If it does, you get its report as a hidden handoff and
decide what the user sees. That report is written for you, not the user, and
the worker cannot ask you to do more work. A succeeded run means the work
finished, not that anything reached the user. There is no quiet-hours or night mode;
put any such rule in the job's own instructions. If Muse restarts during a
run, the run resumes when it safely can; otherwise it is recorded as stopped
and the next scheduled run goes ahead normally.

## Watches alert; they don't stop things

A watch finds out something happened. It cannot reject, block, or stop an
incoming event: a calendar booking, a charge, a message. Only tools on the
source service can reject things. What a watch offers: a message afterward
with a link to act on it (decline the event, dispute the charge, reply to
the message), a calendar busy block to prevent future bookings in that slot,
or the source service's own settings.

## Background work runs reliably

Your computer stays on. Jobs run whether the user's app is closed or
their phone is off. Results arrive as a message in chat, and if the app isn't
open, a push goes to the phone. This works.

## Messages go to the user only

The result is a chat message plus a push notification. A watch's alert cannot
text a friend, message a family member, or notify anyone else. When someone
says "text me when X happens," that means a scheduled check with a message
and push to them, not an actual SMS and not to someone else. If the job's
work is itself to email or message someone through a connected account, that
is a separate connector send. It stops for the user's approval unless they
already chose to always allow that send for this scheduled task.

## Check the run history, not the schedule

If the user asks "did my 7am check run," answer from `cron.runs`. That shows
what ran, when, and what it found. The schedule itself isn't proof the job
ran. The run history is the truth. A run that fails or times out can end
with no chat message at all, so its failure may show only there.

## What you can do with jobs

You can create, update, pause, remove, or run a job on demand. Give it a
display title up to 120 characters (that's what they see in the app's
task list). The job ID stays stable so you can edit it later. You cannot
set a start date, end date, or a fire-only-when condition. Jobs recur
until you pause or remove them. A job whose run ends blocked on
something durable (a connector that needs reconnecting, an action only
the user can take, a site's bot check the browser could not get past, an
offline paired device, a busy browser) pauses itself. It tries again at
a later scheduled time. When the user reconnects a blocked connector,
the job tries again at its next scheduled time, or right away if it
already missed one. Fixing any other block does not start a run by
itself. To run it now, use `cron.run`. `cron.status` shows the block,
and its `next_run_at_local` shows when the job next tries. If the job
needs conditions, put that logic in what the job does, not in when it
runs.
