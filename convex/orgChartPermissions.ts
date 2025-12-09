/**
 * Org Chart Permission Helpers
 *
 * Permission checking functions for edit circle feature (SYOS-643).
 * These functions check workspace settings, RBAC permissions, and circle type
 * to determine if users can perform quick edits or approve proposals.
 */

import { query } from './_generated/server';
import { v } from 'convex/values';
import type { QueryCtx, MutationCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import { createError, ErrorCodes } from './infrastructure/errors/codes';
import { validateSessionAndGetUserId } from './sessionValidation';
import { hasPermission } from './rbac/permissions';
import { calculateAuthorityLevel } from './core/authority';

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
 * Check if user has a Lead role in a circle (template-based detection)
 * Lead role = role where template.isRequired === true
 *
 * SYOS-672: Refactored from name-matching to template-based detection
 * @param ctx - Query or mutation context
 * @param userId - User ID to check
 * @param circleId - Circle ID
 * @returns true if user has a Lead role (template.isRequired === true)
 */
async function hasLeadRole(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>,
	circleId: Id<'circles'>
): Promise<boolean> {
	// 1. Get all active circle roles for this circle
	const circleRoles = await ctx.db
		.query('circleRoles')
		.withIndex('by_circle_archived', (q) => q.eq('circleId', circleId).eq('archivedAt', undefined))
		.collect();

	// 2. Check if user has any Lead role (template.isRequired === true)
	for (const role of circleRoles) {
		// Skip roles without templates (not Lead roles)
		if (!role.templateId) continue;

		// Check if template is a Lead template
		const template = await ctx.db.get(role.templateId);
		if (!template || template.isRequired !== true) continue;

		// Check if user has this role assigned
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
 * Query: Check quick edit status for a circle (allowed + reason)
 * Frontend-friendly wrapper for canQuickEdit
 */
export const getQuickEditStatusQuery = query({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const circle = await ctx.db.get(args.circleId);
		if (!circle) {
			throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
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
	const hasPermissionResult = await hasPermission(ctx, userId, 'org-chart.edit.quick', {
		workspaceId: circle.workspaceId,
		circleId: circle._id
	});

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
		throw createError(
			ErrorCodes.GENERIC_ERROR,
			'Quick edits disabled. Use "Edit circle" to create a proposal.'
		);
	}

	// 2. Check RBAC permission
	const hasPermissionResult = await hasPermission(ctx, userId, 'org-chart.edit.quick', {
		workspaceId: circle.workspaceId,
		circleId: circle._id
	});

	if (!hasPermissionResult) {
		throw createError(ErrorCodes.AUTHZ_INSUFFICIENT_RBAC, 'Quick edits require Org Designer role.');
	}

	// 3. Check circle type restrictions
	// NOTE: Org Designer (workspace-level RBAC) overrides circle-level restrictions
	// If user has Org Designer, they can edit regardless of circle type (except guilds)
	const circleType = getEffectiveCircleType(circle);

	// Guilds are a hard restriction - no quick edits even for Org Designer
	// This is because guilds have no authority and are coordination-only
	if (circleType === 'guild') {
		throw createError(
			ErrorCodes.GENERIC_ERROR,
			'Guilds are coordination-only. Create a proposal in your home circle.'
		);
	}

	// If user has Org Designer role, skip circle type restrictions
	// Org Designer can edit hierarchy, empowered_team, and hybrid circles
	// Circle type restrictions only apply to users WITHOUT Org Designer role
}

// ============================================================================
// Proposal Approval Authority
// ============================================================================

/**
 * Check if user has authority to approve proposals based on circle type and authority level
 *
 * SYOS-672: Updated to use authority levels computed from circle type
 * Authority levels:
 * - authority: Lead can approve proposals directly (hierarchy, hybrid)
 * - facilitative: Team approves via consent process (empowered_team)
 * - convening: No approval authority (guild)
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
	// Calculate authority level using isolated calculator (SYOS-692)
	const authorityLevel = calculateAuthorityLevel(circle.circleType);

	// Convening (guild): Never approve here - decisions made in home circles
	if (authorityLevel === 'convening') {
		return false;
	}

	// Facilitative (empowered_team): Consent process - recorder can finalize after consent
	if (authorityLevel === 'facilitative') {
		// Meeting recorder can approve when no valid objections (consent reached)
		return meeting?.recorderId === userId;
	}

	// Authority (hierarchy, hybrid): Lead decides directly
	if (authorityLevel === 'authority') {
		return await hasLeadRole(ctx, userId, circle._id);
	}

	return false;
}
