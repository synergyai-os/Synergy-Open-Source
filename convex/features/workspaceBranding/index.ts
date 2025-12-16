/**
 * Workspace Branding Feature
 *
 * SYOS-855: Extracted from core/workspaces/branding.ts to features/
 *
 * Handles workspace-level branding (colors, logo).
 * This is a feature-level concern, not core organizational truth.
 */

import { mutation, query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { requireWorkspaceAdminOrOwner } from '../../core/workspaces/access';
import { listWorkspacesForUser } from '../../core/people/queries';

export const updateBranding = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		primaryColor: v.string(),
		secondaryColor: v.string(),
		logo: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await ensureBrandingUpdatePermissions(ctx, args.workspaceId, userId);
		await updateBrandingDetails(ctx, args, userId);
		return { success: true };
	}
});

export const findBranding = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		// SYOS-814 Phase 3: Use people table
		const workspaceIds = await listWorkspacesForUser(ctx, userId);
		const isMember = workspaceIds.includes(args.workspaceId);
		if (!isMember) {
			throw createError(
				ErrorCodes.WORKSPACE_ACCESS_DENIED,
				'You are not a member of this workspace'
			);
		}
		const workspace = await ctx.db.get(args.workspaceId);
		if (!workspace) return null;
		return workspace.branding || null;
	}
});

export const getAllOrgBranding = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		return collectBrandingForUser(ctx, userId);
	}
});

// SYOS-814 Phase 3: Migrated to use people table
async function collectBrandingForUser(
	ctx: Parameters<typeof listWorkspacesForUser>[0],
	userId: Id<'users'>
) {
	const workspaceIds = await listWorkspacesForUser(ctx, userId);

	const brandingMap: Record<
		string,
		{ primaryColor: string; secondaryColor: string; logo?: string }
	> = {};

	await Promise.all(
		workspaceIds.map(async (workspaceId) => {
			const workspace = await ctx.db.get(workspaceId);
			if (workspace?.branding) {
				brandingMap[workspaceId] = {
					primaryColor: workspace.branding.primaryColor,
					secondaryColor: workspace.branding.secondaryColor,
					logo: workspace.branding.logo
				};
			}
		})
	);

	return brandingMap;
}

async function ensureBrandingUpdatePermissions(
	ctx: Parameters<typeof requireWorkspaceAdminOrOwner>[0],
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
) {
	await requireWorkspaceAdminOrOwner(
		ctx,
		workspaceId,
		userId,
		'Must be org admin or owner to update branding'
	);
}

async function updateBrandingDetails(
	ctx: Parameters<typeof requireWorkspaceAdminOrOwner>[0],
	args: {
		workspaceId: Id<'workspaces'>;
		primaryColor: string;
		secondaryColor: string;
		logo?: string;
		sessionId: string;
	},
	userId: Id<'users'>
) {
	validateColor(args.primaryColor, 'primaryColor');
	validateColor(args.secondaryColor, 'secondaryColor');

	await ctx.db.patch(args.workspaceId, {
		branding: {
			primaryColor: args.primaryColor,
			secondaryColor: args.secondaryColor,
			logo: args.logo,
			updatedAt: Date.now(),
			updatedBy: userId
		}
	});
}

function validateColor(color: string, field: 'primaryColor' | 'secondaryColor') {
	if (!color.startsWith('oklch(')) {
		throw createError(
			ErrorCodes.VALIDATION_INVALID_FORMAT,
			`${field} must be OKLCH format (e.g., "oklch(55% 0.2 250)")`
		);
	}
}
