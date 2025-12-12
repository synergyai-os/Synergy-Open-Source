# Migration Scripts - Meetings Essentials Alignment

This directory contains migration scripts to align the codebase with the essentials.md data model.

## Available Migrations

### 1. Migrate Agenda Item Status (Boolean → Enum)

**Script**: `migrate-agenda-status.ts`

**Purpose**: Migrates agenda items from `isProcessed` boolean to `status` enum.

**Run**:

```bash
npx convex run scripts/migrations/migrate-agenda-status.ts
```

**What it does**:

- Converts `isProcessed = true` → `status = 'processed'`
- Converts `isProcessed = false` → `status = 'todo'`
- Converts `isProcessed = null/undefined` → `status = 'todo'`

**Safe to run multiple times**: Yes (skips already migrated items)

### 2. Set Default Recorders

**Script**: `set-default-recorders.ts`

**Purpose**: Sets `recorderId = createdBy` for started meetings without a recorder.

**Run**:

```bash
npx convex run scripts/migrations/set-default-recorders.ts
```

**What it does**:

- For meetings with `startedAt` set but no `recorderId`: sets `recorderId = createdBy`
- Skips meetings that already have a recorder
- Skips meetings that haven't started yet

**Safe to run multiple times**: Yes (skips already migrated meetings)

## Running All Migrations

To run all migrations in sequence:

```bash
npx convex run scripts/migrations/migrate-agenda-status.ts && \
npx convex run scripts/migrations/set-default-recorders.ts
```

## Rollback

There is no automatic rollback. If needed:

1. **Agenda Status**: The old `isProcessed` field is not deleted by migrations, so you can manually revert if needed
2. **Recorders**: The `recorderId` field can be manually cleared if needed

## Post-Migration Steps

After running migrations:

1. Test the application thoroughly
2. Verify data integrity
3. Once confirmed working, run cleanup scripts to remove deprecated fields

## Cleanup

After migrations are complete and tested, you can remove deprecated fields:

- Remove `isProcessed` field from schema (see Phase 5 in implementation-plan.md)
