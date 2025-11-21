# SYOS-292: Team References Verification Report

**Date**: 2025-01-20  
**Ticket**: SYOS-292 - Final verification and documentation update  
**Status**: ⚠️ **INCOMPLETE** - Team references found

---

## Executive Summary

**Total Team References Found**: ~150+ instances across codebase  
**Critical Issues**: 8 files/components need updates  
**Documentation Issues**: 50+ files need updates  
**Status**: Migration incomplete - team references still exist

---

## 1. Schema & Backend Code

### ✅ Schema (`convex/schema.ts`)

- **Line 764**: Comment: `// Unique identifier (e.g., "admin", "team-lead")` → Should be `"circle-lead"`
- **Line 765**: Comment: `// Display name (e.g., "Admin", "Team Lead")` → Should be `"Circle Lead"`
- **Line 824**: Comment: `// "team", "project", "document", etc.` → Should be `"circle"`

### ❌ RBAC Role Slug (`convex/rbac/seedRBAC.ts`)

- **Line 65-69**: Role slug `"team-lead"` → Should be `"circle-lead"`
- **Line 67**: Display name `"Team Lead"` → Should be `"Circle Lead"`
- **Line 68**: Description mentions "circles" correctly but role name is wrong

### ❌ RBAC Tests (`convex/rbac/permissions.test.ts`)

- **Line 82**: Test name: `"Team Lead can only manage own teams"` → Should be `"Circle Lead can only manage own circles"`
- **Line 85**: Comment: `// Create team lead user` → Should be `circle lead`
- **Line 110**: Comment: `// Assign Team Lead role` → Should be `Circle Lead`
- **Line 114**: Query uses `'team-lead'` slug → Should be `'circle-lead'`
- **Line 128**: Comment: `// Test: Team Lead CAN update their own circle` → Should be `Circle Lead`
- **Line 138**: Comment: `// Test: Team Lead CANNOT update another circle` → Should be `Circle Lead`
- **Line 148**: Comment: `// Test: Team Lead CANNOT create circles` → Should be `Circle Lead`
- **Line 174**: Comment: `// Assign Team Lead AND Billing Admin roles` → Should be `Circle Lead`

### ❌ Email Functions (`convex/email.ts`)

- **Line 497**: Function name: `sendTeamInviteEmail` → Should be `sendCircleInviteEmail`
- **Line 503**: Parameter: `teamName: v.string()` → Should be `circleName`
- **Line 511**: Log message: `"Team invite email suppressed"` → Should be `Circle invite`
- **Line 522**: Email ID: `mock-team-invite-` → Should be `mock-circle-invite-`
- **Line 540**: Subject: `"Join ${args.teamName} team on SynergyOS"` → Should be `circle`
- **Line 547**: HTML title: `"Team Invitation"` → Should be `Circle Invitation`
- **Line 570**: HTML text: `"invited you to join the <strong>${args.teamName}</strong> team"` → Should be `circle`
- **Line 619**: Plain text: `"invited you to join the ${args.teamName} team"` → Should be `circle`
- **Line 622**: Log: `"Team invite email sent"` → Should be `Circle invite`
- **Line 633**: Error: `"Failed to send team invite email"` → Should be `circle invite`

### ⚠️ Comments & Documentation Strings

- **`convex/inbox.ts` Line 16**: Comment mentions "team" context → Should verify if this is acceptable
- **`convex/tags.ts` Line 574-575**: Comments mention "team" ownership → Should be `circle`
- **`convex/permissions.ts` Line 5, 9, 75, 105**: Comments mention "org/team" → Should be `org/circle`
- **`convex/admin/rbac.ts` Line 640**: Comment mentions "org/team scoping" → Should be `org/circle`
- **`convex/posthog.ts` Line 54**: Analytics object has `team` field → Should verify if this is used
- **`convex/seedOrgChart.ts` Lines 216, 221, 227, 232**: Test data names like "Database Team" → **ACCEPTABLE** (example data)
- **`convex/featureFlags.ts` Line 7**: Comment mentions "team members" → Should verify context
- **`convex/meetingTemplates.ts` Line 558**: Comment mentions "team" → Should verify context

---

## 2. Frontend Code

### ❌ **CRITICAL**: `CreateTeamModal.svelte` (`src/lib/modules/core/organizations/components/`)

- **File exists** but references non-existent `useTeams` composable
- **Line 3**: Import: `import type { UseTeams } from '$lib/modules/core/organizations/composables/useTeams.svelte';` → **BROKEN IMPORT**
- **Line 10**: Type: `Pick<UseTeams, 'loading' | 'createTeam'>` → **BROKEN TYPE**
- **Line 25**: Function: `createTeam(name)` → Should be `createCircle`
- **Line 38**: Title: `"Create team"` → Should be `Create circle`
- **Line 40**: Description: `"Teams are groups of people..."` → Should be `Circles`
- **Line 52**: Label: `"Team name *"` → Should be `Circle name`
- **Action**: **DELETE FILE** or **RENAME TO CreateCircleModal.svelte** and update all references

### ❌ **CRITICAL**: `InviteMemberModal.svelte` (`src/lib/modules/core/organizations/components/`)

- **Line 18**: Type: `type: 'organization' | 'team'` → Should be `'organization' | 'circle'`
- **Line 19**: Type: `targetId: Id<'organizations'> | Id<'teams'>` → Should be `Id<'circles'>`
- **Line 132**: Variable: `const entityType = type === 'organization' ? 'organization' : 'team'` → Should be `'circle'`

### ❌ `QuickCreateModal.svelte` (`src/lib/modules/core/components/`)

- **Line 109**: Type: `type: 'team' | 'template' | 'workspace'` → Should be `'circle'`
- **Line 110**: Default value: `type: 'team'` → Should be `'circle'`
- **Line 112**: Type definition repeated → Should be `'circle'`

### ❌ `invite/+page.svelte` (`src/routes/invite/`)

- **Line 151**: Text: `"You've been invited to join a team on SynergyOS"` → Should be `circle`
- **Line 157**: Condition: `{#if inviteData.type === 'team'}` → Should be `'circle'`
- **Line 160**: Label: `"Team"` → Should be `Circle`
- **Line 161**: Display: `{inviteData.teamName}` → Should be `circleName`

### ⚠️ Other Frontend References

- **`src/routes/(authenticated)/+layout.svelte` Line 679**: Comment mentions "Create/Join Team" → Should verify if this is UI text
- **`src/lib/modules/core/organizations/composables/useOrganizations.behavior.svelte.test.ts` Line 356**: Test mentions "active team" → Should be `circle`
- **`src/lib/modules/core/organizations/components/OrganizationModals.svelte` Line 48**: Text mentions "product team" → **ACCEPTABLE** (generic English)
- **`src/routes/+page.svelte` Lines 33, 721, 761**: Marketing copy mentions "team" → **ACCEPTABLE** (generic English)
- **`src/routes/settings/permissions-test/+page.svelte` Lines 67, 77, 80, 234, 253**: Test UI mentions "team" → Should be `circle`
- **`src/routes/settings/+page.svelte` Line 509**: Text: `"Team-specific settings"` → Should be `Circle-specific`
- **`src/routes/(authenticated)/tags/+page.svelte` Line 242**: Condition: `tag.ownershipType === 'team'` → Should be `'circle'`
- **`src/lib/modules/meetings/components/SecretarySelector.svelte` Line 19**: Type: `attendeeType: 'user' | 'role' | 'circle' | 'team'` → Should remove `'team'`
- **`src/lib/modules/core/composables/useTagging.svelte.ts` Line 76**: Type: `ownership?: 'user' | 'organization' | 'team'` → Should be `'circle'`
- **`src/lib/infrastructure/analytics/events.ts` Lines 26, 51, 59, 67, 77, 93, 109, 177**: Type definitions include `'team'` → Should be `'circle'`
- **`src/routes/(authenticated)/admin/rbac/+page.svelte` Lines 330, 336, 341, 821, 823, 826, 851**: UI mentions "team" scope → Should be `circle`
- **`src/routes/(authenticated)/admin/rbac/users/[id]/+page.svelte` Line 68**: Text: `"Team-scoped"` → Should be `Circle-scoped`
- **`src/lib/components/ui/ContextSelector.svelte` Line 13**: Type: `type: 'team' | 'template' | 'workspace'` → Should be `'circle'`
- **`src/lib/components/ui/README.md` Line 23**: Documentation mentions "Team selector" → Should be `Circle`

---

## 3. Documentation

### ❌ Architecture Documentation (`dev-docs/2-areas/architecture/system-architecture.md`)

- **Multiple references** to "team" throughout document
- Needs comprehensive review and replacement with "circle"

### ❌ RBAC Documentation (`dev-docs/2-areas/rbac/`)

- **`rbac-architecture.md`**: Extensive team references (50+ instances)
- **`RBAC-SUMMARY.md`**: Team management sections need circle updates
- Role names, permission names, examples all reference teams

### ❌ PostHog Documentation (`dev-docs/2-areas/posthog.md`)

- **Line 43**: References `convex/teams.ts` (file doesn't exist) → Should remove
- **Line 56**: Comments about team lifecycle events → Should be circle
- **Lines 277-281**: Analytics events mention teams → Should be circles

### ⚠️ Other Documentation

- **`dev-docs/2-areas/product/product-vision-and-plan.md`**: Mentions "team-owned" content → Should be `circle-owned`
- **`dev-docs/2-areas/patterns/feature-flags.md`**: Mentions "team members" → Should verify context
- **`dev-docs/3-resources/deployment/`**: Multiple "team testing" references → **ACCEPTABLE** (generic English)
- **`dev-docs/testing-workflow.md`**: "Team Training" section → **ACCEPTABLE** (generic English)

---

## 4. Module README Files

### ⚠️ Module Ownership References

- **`src/lib/modules/core/README.md`**: Mentions "Core Team" → **ACCEPTABLE** (team ownership, not feature)
- **`src/lib/modules/org-chart/README.md`**: Mentions "Org Chart Team" → **ACCEPTABLE**
- **`src/lib/modules/meetings/README.md`**: Mentions "Meetings Team" → **ACCEPTABLE**
- **`src/lib/modules/inbox/README.md`**: Mentions "Inbox Team" → **ACCEPTABLE**
- **`src/lib/modules/flashcards/README.md`**: Mentions "Flashcards Team" → **ACCEPTABLE**

**Note**: These are team ownership references (who owns the module), not feature references. These are acceptable.

---

## 5. Test Data & Examples

### ✅ Acceptable (No Change Needed)

- **`convex/seedOrgChart.ts`**: Test data names like "Database Team", "DevOps Team" → **ACCEPTABLE** (example data)
- **`src/lib/modules/org-chart/__tests__/circles.integration.test.ts`**: Test data "Backend Team" → **ACCEPTABLE**
- **`src/lib/modules/meetings/__tests__/meetingActionItems.integration.test.ts`**: Test data "Product Team" → **ACCEPTABLE**
- **Marketing copy**: Generic English "product team", "core team" → **ACCEPTABLE**

---

## 6. Missing Files (Should Not Exist)

### ❌ Files That Should Be Deleted

- **`src/lib/modules/core/organizations/components/CreateTeamModal.svelte`** → Should be deleted or renamed to `CreateCircleModal.svelte`
- **`src/lib/modules/core/organizations/composables/useTeams.svelte.ts`** → Already deleted ✅

---

## 7. Summary by Category

### Critical (Must Fix Immediately)

1. ❌ `CreateTeamModal.svelte` - Broken import, references non-existent composable
2. ❌ `InviteMemberModal.svelte` - Type definitions use `'team'` and `Id<'teams'>`
3. ❌ RBAC role slug `"team-lead"` → Should be `"circle-lead"`
4. ❌ Email function `sendTeamInviteEmail` → Should be `sendCircleInviteEmail`
5. ❌ Schema comments reference "team-lead" → Should be "circle-lead"
6. ❌ Test names and comments reference "Team Lead" → Should be "Circle Lead"

### High Priority (Should Fix)

7. ⚠️ `QuickCreateModal.svelte` - Type uses `'team'` → Should be `'circle'`
8. ⚠️ `invite/+page.svelte` - References team invites → Should be circle invites
9. ⚠️ Analytics type definitions include `'team'` → Should be `'circle'`
10. ⚠️ RBAC UI mentions "team" scope → Should be `circle`

### Medium Priority (Documentation)

11. 📚 Architecture documentation - Extensive team references
12. 📚 RBAC documentation - Team management sections
13. 📚 PostHog documentation - Team lifecycle events

### Low Priority (Acceptable)

- ✅ Generic English "team" in marketing copy
- ✅ Test data names like "Database Team"
- ✅ Module ownership references ("Core Team", "Meetings Team")

---

## 8. Recommended Actions

### Immediate Actions

1. **Delete or rename** `CreateTeamModal.svelte` → `CreateCircleModal.svelte`
2. **Update** `InviteMemberModal.svelte` types: `'team'` → `'circle'`, `Id<'teams'>` → `Id<'circles'>`
3. **Migrate RBAC role**: `"team-lead"` → `"circle-lead"` (requires data migration)
4. **Rename email function**: `sendTeamInviteEmail` → `sendCircleInviteEmail`
5. **Update schema comments**: "team-lead" → "circle-lead"

### Follow-up Actions

6. Update all frontend type definitions (`'team'` → `'circle'`)
7. Update all documentation files
8. Update test names and comments
9. Verify no broken imports after changes

---

## 9. Verification Checklist

- [ ] Schema comments updated
- [ ] RBAC role slug migrated (`team-lead` → `circle-lead`)
- [ ] RBAC tests updated
- [ ] Email functions renamed
- [ ] `CreateTeamModal.svelte` deleted/renamed
- [ ] `InviteMemberModal.svelte` types updated
- [ ] `QuickCreateModal.svelte` types updated
- [ ] `invite/+page.svelte` updated
- [ ] Analytics types updated
- [ ] All frontend references updated
- [ ] Architecture docs updated
- [ ] RBAC docs updated
- [ ] PostHog docs updated
- [ ] No broken imports
- [ ] Tests pass
- [ ] Build succeeds

---

**Next Steps**: Proceed with updates starting with critical issues, then high priority, then documentation.
