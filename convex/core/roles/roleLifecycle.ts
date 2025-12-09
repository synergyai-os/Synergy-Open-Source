import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../../sessionValidation';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { captureCreate, captureUpdate } from '../../orgVersionHistory';
import { requireQuickEditPermission } from '../../orgChartPermissions';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { hasDuplicateRoleName } from './validation';
import {
	ensureCircleExists,
	ensureWorkspaceMembership,
	isLeadRole,
	isWorkspaceAdmin
} from './roleAccess';

export const create = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		name: v.string(),
		purpose: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const { workspaceId } = await ensureCircleExists(ctx, args.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		const trimmedName = args.name.trim();
		if (!trimmedName) {
			throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, 'Role name is required');
		}

		const existingRoles = await ctx.db
			.query('circleRoles')
			.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
			.collect();

		if (hasDuplicateRoleName(trimmedName, existingRoles)) {
			throw createError(
				ErrorCodes.VALIDATION_INVALID_FORMAT,
				'A role with this name already exists in this circle'
			);
		}

		const now = Date.now();
		const roleId = await ctx.db.insert('circleRoles', {
			circleId: args.circleId,
			workspaceId,
			name: trimmedName,
			purpose: args.purpose,
			status: 'active',
			isHiring: false,
			createdAt: now,
			updatedAt: now,
			updatedBy: userId
		});

		const newRole = await ctx.db.get(roleId);
		if (newRole) {
			await captureCreate(ctx, 'circleRole', newRole);
		}

		return { roleId };
	}
});

export const update = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		name: v.optional(v.string()),
		purpose: v.optional(v.string()),
		representsToParent: v.optional(v.boolean())
	},
	handler: async (ctx, args) => updateCircleRole(ctx, args)
});

export const updateInline = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		updates: v.object({
			name: v.optional(v.string()),
			purpose: v.optional(v.string()),
			representsToParent: v.optional(v.boolean())
		})
	},
	handler: async (ctx, args) => updateInlineCircleRole(ctx, args)
});

async function updateCircleRole(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		circleRoleId: Id<'circleRoles'>;
		name?: string;
		purpose?: string;
		representsToParent?: boolean;
	}
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const role = await ctx.db.get(args.circleRoleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
	await ensureWorkspaceMembership(ctx, workspaceId, userId);

	const roleIsLead = await isLeadRole(ctx, args.circleRoleId);
	if (roleIsLead) {
		const userIsAdmin = await isWorkspaceAdmin(ctx, workspaceId, userId);
		if (!userIsAdmin) {
			throw createError(
				ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
				'Circle roles created from Lead template cannot be edited directly. Only workspace admins can edit Lead roles via the role template.'
			);
		}
		throw createError(
			ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
			'Lead roles cannot be edited directly. Edit the Lead role template instead to update all Lead roles across all circles.'
		);
	}

	const updates: {
		name?: string;
		purpose?: string;
		representsToParent?: boolean;
		updatedAt: number;
		updatedBy: Id<'users'>;
	} = {
		updatedAt: Date.now(),
		updatedBy: userId
	};

	if (args.name !== undefined) {
		const trimmedName = args.name.trim();
		if (!trimmedName) {
			throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, 'Role name cannot be empty');
		}

		const existingRoles = await ctx.db
			.query('circleRoles')
			.withIndex('by_circle', (q) => q.eq('circleId', role.circleId))
			.collect();

		if (hasDuplicateRoleName(trimmedName, existingRoles, args.circleRoleId)) {
			throw createError(
				ErrorCodes.VALIDATION_INVALID_FORMAT,
				'A role with this name already exists in this circle'
			);
		}

		updates.name = trimmedName;
	}

	if (args.purpose !== undefined) {
		updates.purpose = args.purpose;
	}

	if (args.representsToParent !== undefined) {
		updates.representsToParent = args.representsToParent;
	}

	await ctx.db.patch(args.circleRoleId, updates);

	const updatedRole = await ctx.db.get(args.circleRoleId);
	if (updatedRole) {
		await captureUpdate(ctx, 'circleRole', role, updatedRole);
	}

	return { success: true };
}

async function updateInlineCircleRole(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		circleRoleId: Id<'circleRoles'>;
		updates: { name?: string; purpose?: string; representsToParent?: boolean };
	}
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const role = await ctx.db.get(args.circleRoleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	const circle = await ctx.db.get(role.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	await requireQuickEditPermission(ctx, userId, circle);

	const roleIsLead = await isLeadRole(ctx, args.circleRoleId);
	if (roleIsLead) {
		throw createError(
			ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
			'Lead roles cannot be edited directly. Edit the Lead role template instead to update all Lead roles across all circles.'
		);
	}

	const beforeDoc = { ...role };

	const updateData: Partial<Doc<'circleRoles'>> = {
		updatedAt: Date.now(),
		updatedBy: userId
	};

	if (args.updates.name !== undefined) {
		const trimmedName = args.updates.name.trim();
		if (!trimmedName) {
			throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, 'Role name cannot be empty');
		}

		const existingRoles = await ctx.db
			.query('circleRoles')
			.withIndex('by_circle', (q) => q.eq('circleId', role.circleId))
			.collect();

		if (hasDuplicateRoleName(trimmedName, existingRoles, args.circleRoleId)) {
			throw createError(
				ErrorCodes.VALIDATION_INVALID_FORMAT,
				'A role with this name already exists in this circle'
			);
		}

		updateData.name = trimmedName;
	}

	if (args.updates.purpose !== undefined) {
		updateData.purpose = args.updates.purpose;
	}

	if (args.updates.representsToParent !== undefined) {
		updateData.representsToParent = args.updates.representsToParent;
	}

	await ctx.db.patch(args.circleRoleId, updateData);

	const afterDoc = await ctx.db.get(args.circleRoleId);
	if (afterDoc) {
		await captureUpdate(ctx, 'circleRole', beforeDoc, afterDoc);
	}

	return { success: true };
}
