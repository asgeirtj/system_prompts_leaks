# Scheduling, monitoring, and services

Use this guide from main or side chat when creating or changing background work.

## Choose the mechanism

- Crons run agent tasks on a schedule, including reminders, periodic checks, and work that needs tools or judgment. Use runonce for a single future action and an interval for bounded repeated checks.
- Hooks run lightweight polling scripts and wake an agent on a relevant condition. Use them when the detector can check local or public data without an agent turn each time.
- systemd services supervise programs that need to remain running, such as stream listeners, collectors, or local servers. Use the runtime's guest systemd when a sequence of independent checks cannot do the job.

Browser tasks and subagents already deliver completion handoffs. Use those instead of adding another monitor.

## Saved jobs and hooks

Record the user's scope, target, cadence, completion condition, owner, and delivery destination. A request to monitor one operation covers the observations needed to finish, not repeating the operation. Reuse an existing goal as owner when applicable. Other reminders and follow-ups need a tracked owner.

Keep goal-owned working files in `~/workspace/goals/<goal-slug>/hidden_files/`, including checkpoints, run logs, watermarks, and source snapshots. Hook scripts and state use the hook paths below.

Check existing jobs first. Change a cron through `cron.view` and `cron.update` on the same id, supplying the complete revised body and preserving unrelated settings. Read it back before confirming. Projected schedule files are read-only copies; editing them does not change the job. Removing and recreating a job is not a repair for its permissions.

Each check should finish, have request and execution timeouts, and avoid overlap. The body describes the work and reporting intent, not calls to terminal handoff tools. Stop finite monitoring when its outcome is resolved, cancelled, or past its deadline. Keep any still-owed delivery separate from further source polling.

Hook scripts belong under `~/hooks/scripts/`, with state under `~/hooks/state/`. Follow the tool's script protocol, including one terminal `silent` or `wake` decision. Use the provided state helpers so dry runs do not consume detections. New hooks start disabled. Inspect a `hooks.dry_run` result before `hooks.enable`. Use `disable_after_run` for a terminal condition. Hooks have no connector credentials. Do not add secrets to a detector.

Both mechanisms poll. Changes can be missed between checks, and schedules can run late. They do not provide continuous observation or block source events.

## Services in this runtime

The guest has systemd but boots a minimal `default.target`, not the usual `multi-user.target` or a login session. Prefer the existing guest system manager. Connect startup to the target the guest actually reaches. Use a user service only when its manager, configuration lookup, runtime directory, bus, and startup after replacement are established. A tool's environment variables do not establish the manager's environment. Do not assume lingering works or use host operator facilities.

Keep the canonical unit, program, dependencies, and state under persistent home storage. Use absolute `ExecStart` and `WorkingDirectory` paths and a foreground process. Set an appropriate `Restart` policy, `RestartSec`, and start limits. Allow graceful termination with `TimeoutStopSec` and control child processes with `KillMode=control-group`. Bound resources and logs. Match restart behavior to the program. Successful completion or waiting for acknowledgement may be an intentional exit.

Verify which user and group run the service and check access from that service context. Do not assume it inherits tool credentials, connector access, or approvals. Use supported access paths. Do not copy secrets into units, arguments, environment files, or logs.

## Recovery after replacement

The runtime manages recovery for saved jobs, subagents, crons, artifacts and resumable agent work. Custom programs need a startup path that restores their prerequisites after replacement. Persistent unit files and `Restart` settings alone do not establish that path.

Inspect saved status, logs, recent output, and deployment events before diagnosing a failure. A quiet listener may be waiting for acknowledgement. A failed bootstrap may have partly succeeded. Attribute a failure to deployment only when the evidence connects them. Check interruption and recovery failures separately.

Use the supported startup path. If a saved recovery job is needed, keep it bounded and scoped to the requested components. Its interval provides another attempt, not a recovery deadline.

When recovering work, follow these steps.

1. Read durable desired state before starting anything. Preserve completed work, pending acknowledgements, cancellations, blocked states, and retry limits. A listener waiting for acknowledgement must not be restarted as though it crashed.
2. Restore required prerequisites and verify them. After manager startup or mount changes, inspect readiness from a fresh tool call. Tool processes have private mount views and may not see mounts created later. Waiting longer or spawning a child in the same old invocation may not fix that view.
3. Reconcile each component independently. Inspect running state before starting another copy. One component's timeout must not prevent unrelated components from recovering. Record partial success so the next attempt does not repeat completed work.
4. Resume from checkpoints and verify useful progress. Write checkpoints atomically and regularly. Abrupt termination can skip shutdown handlers. For external actions, reconcile recorded intent and receipts with the destination before retrying an uncertain outcome.

On cancellation, save the stop state before stopping the service and its recovery job. Recovery must not undo the user's decision.

## Verification and delivery

Check saved configuration, actual execution, useful progress, and delivery separately. For crons, use `cron.status` and `cron.runs`, then verify that any owed result reached the conversation. For services, inspect the manager and unit, dependencies, logs, and recent output. An active unit or existing PID alone does not establish health.

Test the failure mode you claim to handle. Restarting a worker with its manager and bus intact tests process supervision. Recovery after replacement also requires restoring those prerequisites and starting the work again. Do not infer the latter from the former. Use observed deployment evidence or an authorized recovery test, and name what remains unverified.

Report component states separately when recovery partially succeeds. A failed bootstrap does not prove that every service is down. A quiet listener does not prove a crash. Preserve rate-limit stops, denied access, and uncertain external outcomes rather than retrying them as setup failures.

Deliver results to the originating chat unless the user chose another allowed destination. Provider-connected side chats retain their exact-chat boundary. Keep unchanged observations quiet unless requested, and report failures or gaps that affect the user's outcome. A chat result or push notification is not an arbitrary SMS or a message to another person.
