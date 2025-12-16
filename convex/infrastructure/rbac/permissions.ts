export type { PermissionSlug, PermissionContext } from './permissions/types';
export { hasPermission, requirePermission, requireSystemAdmin } from './permissions/access';
export {
	listActiveUserRoles,
	createUserRoleAssignment,
	updateUserRoleRevocation
} from './permissions/lifecycle';
export { isSystemAdmin, getUserPermissionsQuery } from './permissions/queries';

// RBAC Scope Model (SYOS-791)
export type { SystemRole, WorkspaceRole } from './scopeHelpers';
export {
	hasSystemRole,
	requireSystemRole,
	listSystemRoles,
	hasWorkspaceRole,
	requireWorkspaceRole,
	listWorkspaceRoles,
	grantSystemRole,
	grantWorkspaceRole,
	revokeSystemRole,
	revokeWorkspaceRole
} from './scopeHelpers';
