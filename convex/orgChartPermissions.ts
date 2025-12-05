/**
 * Org Chart Permission Helpers
 *
 * Permission checking functions for edit circle feature (SYOS-643).
 * These functions check workspace settings, RBAC permissions, and circle type
 * to determine if users can perform quick edits or approve proposals.
 */

import { query } from './_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { QueryCtx, MutationCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import { hasPermission } from './rbac/permissions';

// ============================================================================
// Types
// ============================================================================

export interface QuickEditResult {
	allowed: boolean;
	reason?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if user has a specific role in a circle
 * @param ctx - Query or mutation context
 * @param userId - User ID to check
 * @param circleId - Circle ID
 * @param roleNames - Array of role names to check (e.g., ['Circle Lead', 'Manager'])
 * @returns true if user has one of the specified roles
 */
async function hasCircleRole(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>,
	circleId: Id<'circles'>,
	roleNames: string[]
): Promise<boolean> {
	// 1. Get all active circle roles for this circle
	const circleRoles = await ctx.db
		.query('circleRoles')
		.withIndex('by_circle_archived', (q) => q.eq('circleId', circleId).eq('archivedAt', undefined))
		.collect();

	// 2. Filter to roles matching the provided names
	const matchingRoles = circleRoles.filter((role) => roleNames.includes(role.name));

	if (matchingRoles.length === 0) {
		return false;
	}

	// 3. Check if user has any of these roles assigned
	for (const role of matchingRoles) {
		const userAssignment = await ctx.db
			.query('userCircleRoles')
			.withIndex('by_user_role', (q) => q.eq('userId', userId).eq('circleRoleId', role._id))
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.first();

		if (userAssignment) {
			return true;
		}
	}

	return false;
}

/**
 * Query: Check if user can perform quick edits on a circle
 * Frontend-friendly wrapper for canQuickEdit
 */
export const canQuickEditQuery = query({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const circle = await ctx.db.get(args.circleId);
		if (!circle) {
			throw new Error('Circle not found');
		}

		return await canQuickEdit(ctx, userId, circle);
	}
});

/**
 * Get effective circle type (defaults to 'hierarchy' if null)
 * @param circle - Circle document
 * @returns Circle type, defaulting to 'hierarchy'
 */
function getEffectiveCircleType(
	circle: Doc<'circles'>
): 'hierarchy' | 'empowered_team' | 'guild' | 'hybrid' {
	return circle.circleType ?? 'hierarchy';
}

/**
 * Check if user is a member of a circle
 * @param ctx - Query or mutation context
 * @param userId - User ID to check
 * @param circleId - Circle ID
 * @returns true if user is an active member of the circle
 */
async function isCircleMember(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>,
	circleId: Id<'circles'>
): Promise<boolean> {
	const member = await ctx.db
		.query('circleMembers')
		.withIndex('by_circle_user', (q) => q.eq('circleId', circleId).eq('userId', userId))
		.first();

	if (!member) return false;
	if (member.archivedAt) return false;
	return true;
}

// ============================================================================
// Quick Edit Permission Checking
// ============================================================================

/**
 * Check if user can perform quick edits on a circle
 *
 * Requirements (ALL must be true):
 * 1. Workspace setting: allowQuickChanges = true
 * 2. RBAC permission: org-chart.edit.quick
 * 3. Circle type allows it:
 *    - hierarchy: user must be Circle Lead or Manager role
 *    - empowered_team: user must be circle member
 *    - guild: NEVER (coordination only)
 *    - hybrid: user must be circle member
 *
 * @param ctx - Query or mutation context
 * @param userId - User ID to check
 * @param circle - Circle document
 * @returns Object with allowed boolean and optional reason
 */
export async function canQuickEdit(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>,
	circle: Doc<'circles'>
): Promise<QuickEditResult> {
	// 1. Check workspace setting
	const orgSettings = await ctx.db
		.query('workspaceOrgSettings')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', circle.workspaceId))
		.first();

	if (!orgSettings?.allowQuickChanges) {
		return {
			allowed: false,
			reason: 'Quick edits disabled. Use "Edit circle" to create a proposal.'
		};
	}

	// 2. Check RBAC permission
	// Note: 'org-chart.edit.quick' permission exists in database but may not be in PermissionSlug type yet
	const hasPermissionResult = await hasPermission(
		ctx,
		userId,
		'org-chart.edit.quick' as any, // Type assertion - permission exists in DB
		{
			workspaceId: circle.workspaceId,
			circleId: circle._id
		}
	);

	if (!hasPermissionResult) {
		return {
			allowed: false,
			reason: 'Quick edits require Org Designer role.'
		};
	}

	// 3. Check circle type restrictions
	// NOTE: Org Designer (workspace-level RBAC) overrides circle-level restrictions
	// If user has Org Designer, they can edit regardless of circle type (except guilds)
	const circleType = getEffectiveCircleType(circle);

	// Guilds are a hard restriction - no quick edits even for Org Designer
	// This is because guilds have no authority and are coordination-only
	if (circleType === 'guild') {
		return {
			allowed: false,
			reason: 'Guilds are coordination-only. Create a proposal in your home circle.'
		};
	}

	// If user has Org Designer role, skip circle type restrictions
	// Org Designer can edit hierarchy, empowered_team, and hybrid circles
	// Circle type restrictions only apply to users WITHOUT Org Designer role
	return { allowed: true };

	return { allowed: true };
}

/**
 * Require quick edit permission (throws error if not allowed)
 * Use this in mutations that need quick edit permission
 */
export async function requireQuickEditPermission(
	ctx: MutationCtx,
	userId: Id<'users'>,
	circle: Doc<'circles'>
): Promise<void> {
	// 1. Check workspace setting
	const orgSettings = await ctx.db
		.query('workspaceOrgSettings')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', circle.workspaceId))
		.first();

	if (!orgSettings?.allowQuickChanges) {
		throw new Error('Quick edits disabled. Use "Edit circle" to create a proposal.');
	}

	// 2. Check RBAC permission
	const hasPermissionResult = await hasPermission(
		ctx,
		userId,
		'org-chart.edit.quick' as any, // Type assertion - permission exists in DB
		{
			workspaceId: circle.workspaceId,
			circleId: circle._id
		}
	);

	if (!hasPermissionResult) {
		throw new Error('Quick edits require Org Designer role.');
	}

	// 3. Check circle type restrictions
	// NOTE: Org Designer (workspace-level RBAC) overrides circle-level restrictions
	// If user has Org Designer, they can edit regardless of circle type (except guilds)
	const circleType = getEffectiveCircleType(circle);

	// Guilds are a hard restriction - no quick edits even for Org Designer
	// This is because guilds have no authority and are coordination-only
	if (circleType === 'guild') {
		throw new Error('Guilds are coordination-only. Create a proposal in your home circle.');
	}

	// If user has Org Designer role, skip circle type restrictions
	// Org Designer can edit hierarchy, empowered_team, and hybrid circles
	// Circle type restrictions only apply to users WITHOUT Org Designer role
}

// ============================================================================
// Proposal Approval Authority
// ============================================================================

/**
 * Check if user has authority to approve proposals based on circle's decision model
 *
 * @param ctx - Query or mutation context
 * @param userId - User ID to check
 * @param circle - Circle document
 * @param meeting - Meeting document (optional, for recorder checks)
 * @returns true if user has approval authority
 */
export async function checkApprovalAuthority(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>,
	circle: Doc<'circles'>,
	meeting: Doc<'meetings'> | null
): Promise<boolean> {
	const decisionModel = circle.decisionModel ?? 'manager_decides';

	switch (decisionModel) {
		case 'manager_decides':
			// Only Circle Lead/Manager can approve
			return await hasCircleRole(ctx, userId, circle._id, ['Circle Lead', 'Manager']);

		case 'team_consensus':
			// Meeting recorder can approve after consensus reached
			// (UI handles collecting all votes)
			return meeting?.recorderId === userId;

		case 'consent':
			// Meeting recorder can approve when no valid objections
			return meeting?.recorderId === userId;

		case 'coordination_only':
			// Guild - proposals must be approved in home circle
			// This should be handled differently (redirect to home circle)
			return false;

		default:
			return false;
	}
}
