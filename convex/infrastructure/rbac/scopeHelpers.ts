/**
 * RBAC Scope Helpers (SYOS-791)
 *
 * Helper functions for checking roles at different scopes:
 * - System-level: hasSystemRole() - platform operations (uses userId)
 * - Workspace-level: hasWorkspaceRole() - org operations (uses personId)
 *
 * @see architecture.md - RBAC Scope Model
 */

import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';

type Ctx = QueryCtx | MutationCtx;

// =============================================================================
// System Role Types
// =============================================================================

/**
 * System-level roles that span ALL workspaces.
 * These roles are used for platform-level operations.
 */
export type SystemRole = 'platform_admin' | 'platform_manager' | 'developer' | 'support';

/**
 * Check if a user has a system-level role.
 *
 * System roles are platform-wide and use userId (not personId).
 * Examples: platform admin console, developer access, support tools.
 *
 * @param ctx - Convex context
 * @param userId - The user to check
 * @param role - The system role to check for
 * @returns true if the user has the specified system role
 *
 * @example
 * ```typescript
 * const isAdmin = await hasSystemRole(ctx, userId, 'platform_admin');
 * if (!isAdmin) throw new Error('Platform admin access required');
 * ```
 */
export async function hasSystemRole(
	ctx: Ctx,
	userId: Id<'users'>,
	role: SystemRole
): Promise<boolean> {
	const systemRole = await ctx.db
		.query('systemRoles')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.filter((q) => q.eq(q.field('role'), role))
		.first();

	return systemRole !== null;
}

/**
 * Require a system-level role, throwing if not present.
 *
 * @param ctx - Convex context
 * @param userId - The user to check
 * @param role - The system role required
 * @throws Error if the user doesn't have the required role
 */
export async function requireSystemRole(
	ctx: Ctx,
	userId: Id<'users'>,
	role: SystemRole
): Promise<void> {
	const hasRole = await hasSystemRole(ctx, userId, role);
	if (!hasRole) {
		throw new Error(`AUTHZ_INSUFFICIENT_RBAC: System role '${role}' required`);
	}
}

/**
 * List all system roles for a user.
 *
 * @param ctx - Convex context
 * @param userId - The user to check
 * @returns Array of system roles the user has
 */
export async function listSystemRoles(ctx: Ctx, userId: Id<'users'>): Promise<SystemRole[]> {
	const roles = await ctx.db
		.query('systemRoles')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();

	return roles.map((r) => r.role as SystemRole);
}

// =============================================================================
// Workspace Role Types
// =============================================================================

/**
 * Workspace-level roles that are scoped to a single workspace.
 * These roles use personId because the same user can have different
 * roles in different workspaces.
 */
export type WorkspaceRole = 'billing_admin' | 'workspace_admin' | 'member';

/**
 * Check if a person has a workspace-level role.
 *
 * Workspace roles are scoped to a single workspace and use personId.
 * This means the same user can be a billing_admin in Workspace A
 * but just a member in Workspace B.
 *
 * @param ctx - Convex context
 * @param personId - The person to check (workspace-scoped identity)
 * @param role - The workspace role to check for
 * @returns true if the person has the specified workspace role
 *
 * @example
 * ```typescript
 * const isBillingAdmin = await hasWorkspaceRole(ctx, personId, 'billing_admin');
 * if (!isBillingAdmin) throw new Error('Billing admin access required');
 * ```
 */
export async function hasWorkspaceRole(
	ctx: Ctx,
	personId: Id<'people'>,
	role: WorkspaceRole
): Promise<boolean> {
	const workspaceRole = await ctx.db
		.query('workspaceRoles')
		.withIndex('by_person', (q) => q.eq('personId', personId))
		.filter((q) => q.eq(q.field('role'), role))
		.first();

	return workspaceRole !== null;
}

/**
 * Require a workspace-level role, throwing if not present.
 *
 * @param ctx - Convex context
 * @param personId - The person to check
 * @param role - The workspace role required
 * @throws Error if the person doesn't have the required role
 */
export async function requireWorkspaceRole(
	ctx: Ctx,
	personId: Id<'people'>,
	role: WorkspaceRole
): Promise<void> {
	const hasRole = await hasWorkspaceRole(ctx, personId, role);
	if (!hasRole) {
		throw new Error(`AUTHZ_INSUFFICIENT_RBAC: Workspace role '${role}' required`);
	}
}

/**
 * List all workspace roles for a person.
 *
 * @param ctx - Convex context
 * @param personId - The person to check
 * @returns Array of workspace roles the person has
 */
export async function listWorkspaceRoles(
	ctx: Ctx,
	personId: Id<'people'>
): Promise<WorkspaceRole[]> {
	const roles = await ctx.db
		.query('workspaceRoles')
		.withIndex('by_person', (q) => q.eq('personId', personId))
		.collect();

	return roles.map((r) => r.role as WorkspaceRole);
}

// =============================================================================
// Granting / Revoking Helpers
// =============================================================================

/**
 * Grant a system role to a user.
 *
 * @param ctx - Mutation context
 * @param userId - The user to grant the role to
 * @param role - The system role to grant
 * @param grantedBy - The user who granted this role (optional)
 * @returns The ID of the created systemRoles record
 */
export async function grantSystemRole(
	ctx: MutationCtx,
	userId: Id<'users'>,
	role: SystemRole,
	grantedBy?: Id<'users'>
): Promise<Id<'systemRoles'>> {
	// Check if already has this role
	const existing = await ctx.db
		.query('systemRoles')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.filter((q) => q.eq(q.field('role'), role))
		.first();

	if (existing) {
		return existing._id;
	}

	return ctx.db.insert('systemRoles', {
		userId,
		role,
		grantedAt: Date.now(),
		grantedBy
	});
}

/**
 * Grant a workspace role to a person.
 *
 * @param ctx - Mutation context
 * @param personId - The person to grant the role to
 * @param role - The workspace role to grant
 * @param grantedByPersonId - The person who granted this role (optional)
 * @returns The ID of the created workspaceRoles record
 */
export async function grantWorkspaceRole(
	ctx: MutationCtx,
	personId: Id<'people'>,
	role: WorkspaceRole,
	grantedByPersonId?: Id<'people'>
): Promise<Id<'workspaceRoles'>> {
	// Check if already has this role
	const existing = await ctx.db
		.query('workspaceRoles')
		.withIndex('by_person', (q) => q.eq('personId', personId))
		.filter((q) => q.eq(q.field('role'), role))
		.first();

	if (existing) {
		return existing._id;
	}

	return ctx.db.insert('workspaceRoles', {
		personId,
		role,
		grantedAt: Date.now(),
		grantedByPersonId
	});
}

/**
 * Revoke a system role from a user.
 *
 * @param ctx - Mutation context
 * @param userId - The user to revoke the role from
 * @param role - The system role to revoke
 * @returns true if a role was revoked, false if the user didn't have the role
 */
export async function revokeSystemRole(
	ctx: MutationCtx,
	userId: Id<'users'>,
	role: SystemRole
): Promise<boolean> {
	const existing = await ctx.db
		.query('systemRoles')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.filter((q) => q.eq(q.field('role'), role))
		.first();

	if (!existing) {
		return false;
	}

	await ctx.db.delete(existing._id);
	return true;
}

/**
 * Revoke a workspace role from a person.
 *
 * @param ctx - Mutation context
 * @param personId - The person to revoke the role from
 * @param role - The workspace role to revoke
 * @returns true if a role was revoked, false if the person didn't have the role
 */
export async function revokeWorkspaceRole(
	ctx: MutationCtx,
	personId: Id<'people'>,
	role: WorkspaceRole
): Promise<boolean> {
	const existing = await ctx.db
		.query('workspaceRoles')
		.withIndex('by_person', (q) => q.eq('personId', personId))
		.filter((q) => q.eq(q.field('role'), role))
		.first();

	if (!existing) {
		return false;
	}

	await ctx.db.delete(existing._id);
	return true;
}
