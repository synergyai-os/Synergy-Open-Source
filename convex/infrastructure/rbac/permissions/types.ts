import type { Id } from '../../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../../_generated/server';

/**
 * Permission Slugs - Minimal Set (8 permissions)
 *
 * Based on SYOS-970 investigation, only these permissions are actively used:
 * - users.invite: Invite new users to workspace
 * - users.change-roles: Change user roles
 * - users.manage-profile: Edit user profiles (own or others)
 * - circles.view: View circle details and members
 * - circles.create: Create new circles
 * - circles.update: Edit circle settings and details
 * - workspaces.manage-billing: Manage billing and subscriptions
 * - docs.view: View documents (dynamically created, now seeded)
 *
 * Removed 9 unused permissions:
 * - users.view (only in tests)
 * - users.remove (never used)
 * - circles.delete (never used)
 * - circles.add-members (never used)
 * - circles.remove-members (never used)
 * - circles.change-roles (never used)
 * - workspaces.view-settings (never used)
 * - workspaces.update-settings (never used)
 */
export type PermissionSlug =
	| 'users.invite'
	| 'users.change-roles'
	| 'users.manage-profile'
	| 'circles.view'
	| 'circles.create'
	| 'circles.update'
	| 'workspaces.manage-billing'
	| 'docs.view';

export interface PermissionContext {
	workspaceId?: Id<'workspaces'>;
	circleId?: Id<'circles'>;
	resourceType?: string;
	resourceId?: string;
	resourceOwnerId?: Id<'users'>;
}

export interface PermissionLogEntry {
	userId: Id<'users'>;
	action: string;
	permissionSlug?: string;
	roleSlug?: string;
	result: 'allowed' | 'denied';
	reason?: string;
	context?: PermissionContext;
}

export interface UserPermission {
	permissionSlug: string;
	scope: 'all' | 'own' | 'none';
	roleSlug: string;
	roleName: string;
}

export type Ctx = QueryCtx | MutationCtx;
