# Feature Flags Analysis

**Date**: 2025-01-27  
**Purpose**: Identify which feature flags are actually active and which can be safely removed

---

## ✅ Active Feature Flags (Actually Used in Code)

### 1. `meetings-module` ⚠️ QUESTIONABLE

- **Status**: Enabled for specific workspaces
- **Usage**:
  - Controls access to `/meetings` page (`src/routes/(authenticated)/w/[slug]/meetings/+page.svelte`)
  - Controls access to `/dashboard` page (`src/routes/(authenticated)/w/[slug]/dashboard/+page.svelte`)
  - Used in module registry (`src/lib/modules/meetings/manifest.ts`)
- **Can Remove?**: ✅ YES - If meetings is a core feature that should always be available, this flag is unnecessary overhead. Feature flags should only be used for:
  - Gradual rollouts of NEW features
  - Experimental features that might need quick disabling
  - Features that aren't core to the product
- **Note**: Meetings appears to be a core feature (meeting management is fundamental). If it's always-on for all workspaces, remove the flag.

### 2. `circles_ui_beta` ⚠️ QUESTIONABLE

- **Status**: Legacy flag check (not yet migrated to module registry)
- **Usage**:
  - Used in `src/routes/(authenticated)/+layout.server.ts` to control circles module data loading
  - Controls sidebar visibility for circles navigation
  - Referenced in scripts (`scripts/update-circles-feature-flag.ts`, `scripts/add-circles-feature-flag.ts`)
- **Can Remove?**: ✅ YES - Circles are CORE functionality:
  - Every workspace automatically gets a root circle (`convex/core/circles/`)
  - Circles are fundamental to the organizational model
  - The `/circles` page doesn't check any flag - it just works
  - The flag only controls UI visibility, not core functionality
- **Note**: Circles are always available - the flag is just controlling UI visibility. Remove it and always show circles navigation.

---

## ⚠️ Legacy/Unused Flags (Can Potentially Be Removed)

### 3. `meeting_module_beta` ⚠️ LEGACY

- **Status**: Legacy flag, replaced by `meetings-module`
- **Usage**:
  - Only referenced in test page (`src/routes/(authenticated)/test-flags/+page.svelte`)
  - Comment in code says: "Legacy flag, replaced by MEETINGS_MODULE flag. Consider removing if no longer needed."
- **Can Remove?**: ✅ YES - Replaced by `meetings-module`, only used in test page

### 4. `meeting_integrations_beta` ⚠️ FUTURE

- **Status**: Phase 3 - Disabled (future rollout)
- **Usage**:
  - Only referenced in test page (`src/routes/(authenticated)/test-flags/+page.svelte`)
  - Comment says: "Status: Phase 3 - Disabled (future rollout)"
- **Can Remove?**: ⚠️ MAYBE - Keep if planning to implement integrations soon, otherwise remove

### 5. `org_module_beta` ⚠️ UNUSED

- **Status**: Phase 1 - Always visible (100% rollout)
- **Usage**:
  - Only referenced in test page (`src/routes/(authenticated)/test-flags/+page.svelte`)
  - Org-chart module manifest shows `featureFlag: null` (always enabled)
  - Comment says: "May be deprecated in favor of default workspace features"
- **Can Remove?**: ✅ YES - Org chart is always enabled, flag is not actually checked anywhere

---

## ❌ Not Yet Implemented (Can Be Removed)

### 6. `notes_prosemirror_beta` ❌ NOT IMPLEMENTED

- **Status**: Not yet implemented
- **Usage**:
  - Only in example code in `useFeatureFlag.svelte.ts` JSDoc
  - Only in constants file, never actually checked
- **Can Remove?**: ✅ YES - Not implemented, no actual usage

### 7. `projects-module` ❌ NOT IMPLEMENTED

- **Status**: 🚧 Planned (not yet implemented)
- **Usage**:
  - Defined in `src/lib/modules/projects/feature-flags.ts`
  - Referenced in `src/lib/modules/projects/manifest.ts`
  - But projects module doesn't exist yet
- **Can Remove?**: ⚠️ MAYBE - Keep if actively developing projects module, otherwise remove

### 8. `inbox_batch_actions_dev` ❌ NOT IMPLEMENTED

- **Status**: Not yet implemented
- **Usage**:
  - Only defined in constants, never checked
  - Description says: "Enables multi-select functionality in the inbox"
- **Can Remove?**: ✅ YES - Not implemented, no actual usage

### 9. `sync_readwise_v2_rollout` ❌ NOT IMPLEMENTED

- **Status**: Not yet implemented
- **Usage**:
  - Only defined in constants, never checked
  - Description says: "Upgrades Readwise integration"
- **Can Remove?**: ✅ YES - Not implemented, no actual usage

---

## 📊 Summary

| Flag                        | Status             | Usage              | Can Remove? |
| --------------------------- | ------------------ | ------------------ | ----------- |
| `meetings-module`           | ⚠️ Questionable    | Production code    | ✅ YES      |
| `circles_ui_beta`           | ⚠️ Questionable    | Layout server      | ✅ YES      |
| `meeting_module_beta`       | ⚠️ Legacy          | Test page only     | ✅ YES      |
| `meeting_integrations_beta` | ⚠️ Future          | Test page only     | ⚠️ Maybe    |
| `org_module_beta`           | ⚠️ Unused          | Test page only     | ✅ YES      |
| `notes_prosemirror_beta`    | ❌ Not implemented | Example code only  | ✅ YES      |
| `projects-module`           | ❌ Not implemented | Defined but unused | ⚠️ Maybe    |
| `inbox_batch_actions_dev`   | ❌ Not implemented | Defined but unused | ✅ YES      |
| `sync_readwise_v2_rollout`  | ❌ Not implemented | Defined but unused | ✅ YES      |

---

## 🧹 Recommended Cleanup Actions

### Safe to Remove Immediately:

1. ✅ `meetings-module` - **Core feature** - If meetings should always be available, remove the flag
2. ✅ `circles_ui_beta` - **Core feature** - Circles are always available, flag only controls UI visibility
3. ✅ `meeting_module_beta` - Replaced by `meetings-module`
4. ✅ `org_module_beta` - Org chart is always enabled
5. ✅ `notes_prosemirror_beta` - Not implemented
6. ✅ `inbox_batch_actions_dev` - Not implemented
7. ✅ `sync_readwise_v2_rollout` - Not implemented

### Check Before Removing:

1. ⚠️ `meeting_integrations_beta` - Keep if planning integrations soon
2. ⚠️ `projects-module` - Keep if actively developing projects module

### Must Keep:

**None** - All flags can potentially be removed if they're controlling core features that should always be available.

---

## 🔍 Verification Steps

Before removing flags, verify:

1. Check Convex database for flag records (may need to archive in DB too)
2. Search codebase for any string references to flag names
3. Check if flags are referenced in admin UI
4. Verify no external systems depend on these flags

---

## 📝 Notes

- **Core vs Feature Flags**: Feature flags should only be used for:
  - New features being rolled out gradually
  - Experimental features that might need quick disabling
  - Features that aren't core to the product
- **Circles & Meetings**: Both appear to be core features:
  - **Circles**: Every workspace has a root circle automatically. Circles are fundamental organizational structure.
  - **Meetings**: Meeting management appears to be a core product feature, not experimental.
- **Recommendation**: If these are core features that should always be available, remove the flags entirely. The overhead of checking flags, managing flag state, and conditional rendering isn't worth it for core features.

- The test page (`/test-flags`) references several flags that aren't actually used in production code
- Some flags are defined but never checked (dead code)
