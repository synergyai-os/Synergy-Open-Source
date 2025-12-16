# Reset Workspace Script

## Purpose

Completely deletes all workspace-related data created during onboarding. This is useful for:

- Testing onboarding flows repeatedly
- Cleaning up test workspaces
- Resetting a workspace to start fresh

## Location

`convex/admin/resetWorkspace.ts`

Follows architecture.md pattern: Admin tooling scripts live in `/convex/admin/`.

## Usage

### Delete a Single Workspace

```bash
# Get your workspace ID first (from Convex dashboard or via query)
npx convex run internal.admin.resetWorkspace.resetWorkspace --arg '{"workspaceId": "s57b31e7stkbyfrdmq5kw3wwf17xd29b"}'
```

**Note:** Args must be passed as JSON using `--arg` flag.

### Delete ALL Workspaces

⚠️ **WARNING: This deletes EVERY workspace in your database!**

```bash
npx convex run internal.admin.resetWorkspace.deleteAllWorkspaces
```

This will:

1. Find all workspaces
2. Delete each workspace and all its data
3. Return a summary of what was deleted

## What Gets Deleted

The script deletes data in dependency order to respect foreign key constraints:

### Phase 1: Child Records

- ✅ `assignments` - Role assignments (references circleId, roleId, personId)
- ✅ `circleMembers` - Circle membership records (references circleId, personId)
- ✅ `customFieldValues` - Custom field values (references customFieldDefinitions)
- ✅ `workspaceRoles` - RBAC workspace roles (references personId, workspaceId)
- ✅ `workspaceInvites` - Workspace invitations (references workspaceId)

### Phase 2: Parent Records

- ✅ `circleRoles` - Circle role definitions (references circleId)
- ✅ `circles` - Circles (references workspaceId)
- ✅ `customFieldDefinitions` - Custom field definitions (references workspaceId)
- ✅ `meetingTemplateSteps` - Meeting template steps (references meetingTemplates)
- ✅ `meetingTemplates` - Meeting templates (references workspaceId)
- ✅ `orgVersionHistory` - Organization version history (references workspaceId)
- ✅ `onboardingProgress` - Onboarding progress tracking (references personId, workspaceId)
- ✅ `workspaceSettings` - Workspace settings (references workspaceId)
- ✅ `workspaceOrgSettings` - Workspace org settings (references workspaceId)
- ✅ `workspaceAliases` - Workspace URL aliases (references workspaceId)
- ✅ `people` - People records (references workspaceId)

### Phase 3: Workspace

- ✅ `workspaces` - The workspace itself

## Validation of Your Original List

Your original list was:

- ✅ workspaces
- ✅ people
- ✅ orgVersionHistory
- ✅ onboardingProgress
- ✅ customFieldDefinitions
- ✅ circles
- ✅ circleRoles
- ✅ meetingTemplateSteps
- ✅ meetingTemplates

**Status:** ✅ All correct! The script includes these plus dependent tables that must be deleted first.

## Additional Tables Deleted

The script also deletes these dependent tables that weren't in your original list:

- `assignments` - Must be deleted before circles/roles/people
- `circleMembers` - Must be deleted before circles
- `customFieldValues` - Must be deleted before customFieldDefinitions
- `workspaceRoles` - Must be deleted before people
- `workspaceInvites` - Workspace invitations
- `workspaceSettings` - Workspace settings
- `workspaceOrgSettings` - Workspace org settings
- `workspaceAliases` - Workspace URL aliases

## Safety

⚠️ **This is a destructive operation!** It permanently deletes all workspace data. There is no undo.

The script:

- Only deletes data for the specified workspace
- Respects foreign key dependencies (deletes children before parents)
- Returns a summary of deleted record counts
- Logs progress to console

## Example Output

```
🗑️  Resetting workspace: j123abc...
  ✅ Deleted 3 assignments
  ✅ Deleted 2 circle members
  ✅ Deleted 0 custom field values
  ✅ Deleted 1 workspace roles
  ✅ Deleted 0 workspace invites
  ✅ Deleted 2 circle roles
  ✅ Deleted 1 circles
  ✅ Deleted 0 custom field definitions
  ✅ Deleted 4 meeting template steps
  ✅ Deleted 1 meeting templates
  ✅ Deleted 5 org version history entries
  ✅ Deleted 1 onboarding progress records
  ✅ Deleted 1 workspace settings
  ✅ Deleted 1 workspace org settings
  ✅ Deleted 0 workspace aliases
  ✅ Deleted 1 people
  ✅ Deleted workspace

✅ Workspace reset complete!
📊 Deletion summary: { assignments: 3, circleMembers: 2, ... }
```
