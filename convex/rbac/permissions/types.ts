import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';

export type PermissionSlug =
	| 'users.view'
	| 'users.invite'
	| 'users.remove'
	| 'users.change-roles'
	| 'users.manage-profile'
	| 'circles.view'
	| 'circles.create'
	| 'circles.update'
	| 'circles.delete'
	| 'circles.add-members'
	| 'circles.remove-members'
	| 'circles.change-roles'
	| 'workspaces.view-settings'
	| 'workspaces.update-settings'
	| 'workspaces.manage-billing'
	| 'org-chart.edit.quick'
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
