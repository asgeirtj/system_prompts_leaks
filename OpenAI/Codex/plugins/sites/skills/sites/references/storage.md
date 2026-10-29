# Storage

Read when the requested Site needs persistent data or uploads. Use D1 for structured product data and R2 for files. Browser storage is appropriate for device-local preferences, not records expected to survive across devices or sessions.

## Bindings

Declare logical `d1` and `r2` bindings in `.openai/hosting.json`, preserving existing names; the starter normally uses `DB` and `BUCKET`. Leave unused bindings `null`. Sites provisions and connects the hosted resources.

The Vinext starter uses `db/index.ts` for D1 access and `db/schema.ts` for schema declarations. Access R2 server-side through `env` from `cloudflare:workers`.

## Schema Changes

1. Update the schema and run the starter's `npm run db:generate` before building. Inspect and commit the generated SQL and Drizzle metadata with the source.
2. Keep migrations schema-only and bounded. Backfills and seed datasets belong outside migrations. For an ordinary added column, any provided default must be constant; `NOT NULL` requires a non-null constant default. Added references must be nullable with an implicit or explicit null default.
3. Apply pending migrations to local previews using the starter's [local D1 migration commands](../templates/vinext-starter/README.md#local-d1-migrations). Local and hosted databases are separate.
4. Publish through the shared [workflow](../SKILL.md#workflow). Sites applies hosted migrations before uploading the Worker.

Applied SQL, snapshots, and journal entries are immutable; append new migrations for later changes. A failed deployment can still have applied migrations. Repair an identified failed, unapplied migration before publishing a new version; resolve uncertain migration state before changing history.

Use one statement per D1 `prepare()` call and `batch()` for multiple statements. Do not create or alter migration-owned tables during request handling.
