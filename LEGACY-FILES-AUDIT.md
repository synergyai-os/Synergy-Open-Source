# Legacy Files Audit Report

**Date:** 2025-01-27  
**Status:** Phase 1 Complete ✅ | Phase 2 & 3 Analysis Complete

---

## Phase 1: Dead Files (DELETED ✅)

### Deleted Files

- ✅ `convex/features/inbox/progress.ts` - Empty migration stub
- ✅ `convex/features/inbox/details.ts` - Empty migration stub
- ✅ `convex/features/inbox/enrich.ts` - Empty migration stub
- ✅ `convex/features/inbox/create.ts` - Empty migration stub

**Verification:** `npm run check` passes ✅

---

## Phase 2: Active Compatibility Shims

### 1. `convex/modules/meetings/*` (6 files) - **ACTIVE, NEEDS MIGRATION**

**Status:** 🔴 **184 references across 17 files**

**Files:**

- `convex/modules/meetings/invitations.ts` → re-exports from `../../features/meetings/invitations`
- `convex/modules/meetings/templates.ts` → re-exports from `../../features/meetings/templates`
- `convex/modules/meetings/presence.ts` → re-exports from `../../features/meetings/presence`
- `convex/modules/meetings/meetings.ts` → re-exports from `../../features/meetings/meetings`
- `convex/modules/meetings/index.ts` → re-exports from `../../features/meetings/index`
- `convex/modules/meetings/agendaItems.ts` → re-exports from `../../features/meetings/agendaItems`

**Usage Pattern:**
All references use `api.modules.meetings.*` pattern:

- `api.modules.meetings.meetings.get`
- `api.modules.meetings.meetings.create`
- `api.modules.meetings.templates.list`
- `api.modules.meetings.invitations.createInvitation`
- `api.modules.meetings.presence.getActivePresence`
- `api.modules.meetings.agendaItems.updateNotes`

**Files Using:**

- `src/lib/modules/meetings/composables/*` (multiple composables)
- `src/lib/modules/org-chart/components/proposals/*` (ImportProposalButton, ImportProposalModal)
- Documentation files

**Action Required:**

- Migration ticket needed to update all 184 references from `api.modules.meetings.*` → `api.features.meetings.*`
- After migration, delete entire `convex/modules/meetings/` directory

---

### 2. `convex/features/workspaces/members.ts` - **POTENTIALLY SAFE TO DELETE**

**Status:** 🟡 **No runtime usage found** (only referenced in `_generated/api.d.ts`)

**File Content:**

```typescript
// Thin wrapper for backward compatibility; implementation moved to core/workspaces
export * from '../../core/workspaces/members';
```

**Verification:**

- ✅ No imports of `features/workspaces/members` path found
- ✅ No runtime usage of `api.features.workspaces.members` found
- ⚠️ Only referenced in auto-generated `convex/_generated/api.d.ts`

**Action Required:**

- **Safe to delete** if confirmed no external API consumers depend on `api.features.workspaces.members`
- Check Convex dashboard for any external integrations using this path
- If safe, delete file and verify `npm run check` still passes

---

## Phase 3: Full Legacy Audit

### Re-Export Files (28 files found)

**Legitimate Index Files** (not legacy shims):

- `convex/core/*/index.ts` - Standard domain exports (circles, roles, proposals, people, users, etc.)
- `convex/features/*/index.ts` - Feature module exports
- `convex/core/history/index.ts` - History domain exports
- `src/lib/infrastructure/organizational-model/index.ts` - Frontend module exports

**Legacy Shims** (already identified above):

- `convex/modules/meetings/*` (6 files) - See Phase 2.1
- `convex/features/workspaces/members.ts` - See Phase 2.2

**Helper Re-Exports** (legitimate, not legacy):

- `convex/features/meetings/helpers/meetingQueries.ts` → `./queries`
- `convex/features/meetings/helpers/invitations.ts` → `./invitations/index`
- `convex/features/meetings/helpers/templates.ts` → `./templates/index`
- `convex/features/meetings/helpers/meetingMutations.ts` → `./mutations`

---

### Small Files (<100 bytes) - 16 files

**Legitimate Small Files:**

- `convex/core/users/constants.ts` (3 lines) - `MAX_LINK_DEPTH`, `MAX_TOTAL_ACCOUNTS`
- `convex/core/people/constants.ts` (1 line) - `USER_ID_FIELD`
- `convex/core/assignments/schema.ts` (3 lines) - Type export
- `convex/core/roles/templates/index.ts` (3 lines) - Re-exports
- `convex/http.ts` (2 lines) - Default export wrapper
- `src/lib/index.ts` (1 line) - Placeholder comment
- `convex/features/meetings/helpers/*` (4 files) - Re-exports (legitimate)

**Legacy Shims** (already identified):

- `convex/modules/meetings/*` (6 files) - See Phase 2.1
- `convex/features/workspaces/members.ts` - See Phase 2.2

---

### Migration/Deprecated Comments

Found comments indicating migrations, but **no stub files**:

- `convex/core/circles/triggers.ts` - Comments about deprecated tables
- `convex/core/roles/schema.ts` - Comment about `userCircleRoles` migration
- `convex/core/workspaces/*` - Comments about people table migration
- `convex/features/workspaces/members.ts` - **Backward compatibility comment** (the shim itself)
- `convex/admin/migrateVersionHistory.ts` - Deprecated migration script
- Various migration scripts in `convex/admin/migrations/`

**Note:** These are documentation comments, not stub files. The actual stub files have been deleted or identified above.

---

## Summary Table

| File/Directory                   | Status     | References          | Action                      |
| -------------------------------- | ---------- | ------------------- | --------------------------- |
| `inbox/progress.ts`              | ✅ Deleted | 0                   | Complete                    |
| `inbox/details.ts`               | ✅ Deleted | 0                   | Complete                    |
| `inbox/enrich.ts`                | ✅ Deleted | 0                   | Complete                    |
| `inbox/create.ts`                | ✅ Deleted | 0                   | Complete                    |
| `modules/meetings/*` (6 files)   | 🔴 Active  | 184 refs (17 files) | **Migration ticket needed** |
| `features/workspaces/members.ts` | 🟡 Unused  | 0 runtime           | **Verify & delete**         |

---

## Recommended Next Steps

1. **Immediate:** Verify `convex/features/workspaces/members.ts` can be safely deleted
   - Check Convex dashboard for external API consumers
   - If safe, delete and verify `npm run check` passes

2. **Migration Ticket:** Create ticket to migrate `api.modules.meetings.*` → `api.features.meetings.*`
   - 184 references across 17 files
   - Update all composables and components
   - Delete `convex/modules/meetings/` directory after migration

3. **Future:** Consider deprecation strategy for `convex/modules/` directory
   - Document migration path
   - Add deprecation warnings if needed
   - Plan removal timeline

---

## Files Analyzed

- ✅ 4 dead files deleted
- 🔍 28 re-export files analyzed
- 🔍 16 small files analyzed
- 🔍 Migration comments reviewed
- ✅ All findings documented
