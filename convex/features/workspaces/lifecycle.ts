import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createCoreRolesForCircle } from '../../core/circles';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { createCircleVersionRecord } from './orgVersion';
import {
	ensureSlugFormat,
	ensureSlugNotReserved,
	ensureUniqueWorkspaceSlug,
	slugifyName
} from './slug';
import { requireWorkspaceAdminOrOwner } from './access';

export const createWorkspace = mutation({
	args: {
		name: v.string(),
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		return createWorkspaceFlow(ctx, { name: args.name, userId });
	}
});

export const recordOrganizationSwitch = mutation({
	args: {
		fromOrganizationId: v.optional(v.id('workspaces')),
		toOrganizationId: v.id('workspaces'),
		availableCircleCount: v.number()
	},
	handler: async () => {
		// Analytics intentionally disabled; keep handler thin to satisfy hygiene rules
		return;
	}
});

export const updateSlug = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		newSlug: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await requireWorkspaceAdminOrOwner(
			ctx,
			args.workspaceId,
			userId,
			'Must be org admin or owner to update slug'
		);

		return updateWorkspaceSlug(ctx, args.workspaceId, args.newSlug);
	}
});

async function createWorkspaceFlow(
	ctx: MutationCtx,
	args: { name: string; userId: Id<'users'> }
): Promise<{ workspaceId: Id<'workspaces'>; slug: string }> {
	const trimmedName = args.name.trim();
	if (!trimmedName) {
		throw createError(ErrorCodes.WORKSPACE_NAME_REQUIRED, 'Organization name is required');
	}

	const slugBase = slugifyName(trimmedName);
	ensureSlugNotReserved(slugBase, 'workspace name');

	const slug = await ensureUniqueWorkspaceSlug(ctx, slugBase);
	const now = Date.now();

	const workspaceId = await ctx.db.insert('workspaces', {
		name: trimmedName,
		slug,
		createdAt: now,
		updatedAt: now,
		plan: 'starter'
	});

	await ctx.db.insert('workspaceMembers', {
		workspaceId,
		userId: args.userId,
		role: 'owner',
		joinedAt: now
	});

	const rootCircleId = await createRootCircle(ctx, workspaceId, args.userId, now);
	await createRootCircleDefaults(ctx, rootCircleId, workspaceId, args.userId, now);

	await ctx.scheduler.runAfter(0, internal.meetingTemplates.seedDefaultTemplatesInternal, {
		workspaceId,
		userId: args.userId
	});

	return { workspaceId, slug };
}

async function createRootCircle(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>,
	now: number
) {
	const rootCircleId = await ctx.db.insert('circles', {
		workspaceId,
		name: 'General Circle',
		slug: 'general-circle',
		parentCircleId: undefined,
		circleType: 'hierarchy',
		decisionModel: 'manager_decides',
		status: 'active',
		createdAt: now,
		updatedAt: now,
		updatedBy: userId
	});

	const rootCircle = await ctx.db.get(rootCircleId);
	await createCircleVersionRecord(ctx, rootCircle);

	return rootCircleId;
}

async function createRootCircleDefaults(
	ctx: MutationCtx,
	rootCircleId: Id<'circles'>,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>,
	now: number
) {
	await createCoreRolesForCircle(ctx, rootCircleId, workspaceId, userId, 'hierarchy');
	await seedCircleItemCategories(ctx, workspaceId, userId, now);
	await seedRoleItemCategories(ctx, workspaceId, userId, now);
}

async function seedCircleItemCategories(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>,
	now: number
) {
	const circleCategories = [
		{ name: 'Purpose', order: 0 },
		{ name: 'Domains', order: 1 },
		{ name: 'Accountabilities', order: 2 },
		{ name: 'Policies', order: 3 },
		{ name: 'Decision Rights', order: 4 },
		{ name: 'Notes', order: 5 }
	];

	for (const category of circleCategories) {
		await ctx.db.insert('circleItemCategories', {
			workspaceId,
			entityType: 'circle',
			name: category.name,
			order: category.order,
			isDefault: true,
			createdAt: now,
			createdBy: userId,
			updatedAt: now
		});
	}
}

async function seedRoleItemCategories(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>,
	now: number
) {
	const roleCategories = [
		{ name: 'Purpose', order: 0 },
		{ name: 'Domains', order: 1 },
		{ name: 'Accountabilities', order: 2 },
		{ name: 'Policies', order: 3 },
		{ name: 'Decision Rights', order: 4 },
		{ name: 'Notes', order: 5 }
	];

	for (const category of roleCategories) {
		await ctx.db.insert('circleItemCategories', {
			workspaceId,
			entityType: 'role',
			name: category.name,
			order: category.order,
			isDefault: true,
			createdAt: now,
			createdBy: userId,
			updatedAt: now
		});
	}
}

export async function updateWorkspaceSlug(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	newSlug: string
) {
	const workspace = await ctx.db.get(workspaceId);
	if (!workspace) {
		throw createError(ErrorCodes.WORKSPACE_NOT_FOUND, 'Workspace not found');
	}

	const trimmedSlug = newSlug.trim().toLowerCase();
	ensureSlugFormat(trimmedSlug);
	ensureSlugNotReserved(trimmedSlug, 'slug');

	const existing = await ctx.db
		.query('workspaces')
		.withIndex('by_slug', (q) => q.eq('slug', trimmedSlug))
		.first();

	if (existing && existing._id !== workspaceId) {
		throw createError(ErrorCodes.WORKSPACE_SLUG_TAKEN, `Slug "${trimmedSlug}" is already taken`);
	}

	if (workspace.slug === trimmedSlug) {
		return { success: true, slug: trimmedSlug };
	}

	await ctx.scheduler.runAfter(0, internal.workspaceAliases.createAlias, {
		workspaceId,
		slug: workspace.slug
	});

	const now = Date.now();
	await ctx.db.patch(workspaceId, {
		slug: trimmedSlug,
		updatedAt: now
	});

	return { success: true, slug: trimmedSlug };
}
