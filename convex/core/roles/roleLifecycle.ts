import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { recordCreateHistory, recordUpdateHistory } from '../history';
import { requireQuickEditPermissionForPerson } from '../../infrastructure/rbac/orgChart';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { hasDuplicateRoleName } from './validation';
import { validateRolePurpose, validateRoleDecisionRights } from './rules';
import {
	ensureCircleExists,
	ensureWorkspaceMembership,
	isLeadRole,
	isWorkspaceAdmin,
	requireWorkspacePersonFromSession
} from './roleAccess';

export const create = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		name: v.string(),
		purpose: v.string(),
		decisionRights: v.array(v.string()),
		roleType: v.optional(
			v.union(v.literal('circle_lead'), v.literal('structural'), v.literal('custom'))
		)
	},
	handler: async (ctx, args) => {
		const { workspaceId } = await ensureCircleExists(ctx, args.circleId);
		const personId = await requireWorkspacePersonFromSession(ctx, args.sessionId, workspaceId);
		await ensureWorkspaceMembership(ctx, workspaceId, personId);

		const trimmedName = args.name.trim();
		if (!trimmedName) {
			throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, 'Role name is required');
		}

		// GOV-02: Validate purpose is non-empty
		validateRolePurpose(args.purpose);

		// GOV-03: Validate at least one decision right
		validateRoleDecisionRights(args.decisionRights);

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

		// Manually created roles default to 'custom' type
		const roleType = args.roleType ?? 'custom';

		const now = Date.now();
		const roleId = await ctx.db.insert('circleRoles', {
			circleId: args.circleId,
			workspaceId,
			name: trimmedName,
			roleType,
			purpose: args.purpose,
			decisionRights: args.decisionRights,
			status: 'active',
			isHiring: false,
			createdAt: now,
			updatedAt: now,
			updatedByPersonId: personId
		});

		const newRole = await ctx.db.get(roleId);
		if (newRole) {
			await recordCreateHistory(ctx, 'circleRole', newRole);
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
		decisionRights: v.optional(v.array(v.string())),
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
			decisionRights: v.optional(v.array(v.string())),
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
		decisionRights?: string[];
		representsToParent?: boolean;
	}
) {
	const role = await ctx.db.get(args.circleRoleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
	const personId = await requireWorkspacePersonFromSession(ctx, args.sessionId, workspaceId);
	await ensureWorkspaceMembership(ctx, workspaceId, personId);

	const roleIsLead = await isLeadRole(ctx, args.circleRoleId);
	if (roleIsLead) {
		const personIsAdmin = await isWorkspaceAdmin(ctx, workspaceId, personId);
		if (!personIsAdmin) {
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
		decisionRights?: string[];
		representsToParent?: boolean;
		updatedAt: number;
		updatedByPersonId: Id<'people'>;
	} = {
		updatedAt: Date.now(),
		updatedByPersonId: personId
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
		// GOV-02: Validate purpose is non-empty
		validateRolePurpose(args.purpose);
		updates.purpose = args.purpose;
	}

	if (args.decisionRights !== undefined) {
		// GOV-03: Validate at least one decision right
		validateRoleDecisionRights(args.decisionRights);
		updates.decisionRights = args.decisionRights;
	}

	if (args.representsToParent !== undefined) {
		updates.representsToParent = args.representsToParent;
	}

	await ctx.db.patch(args.circleRoleId, updates);

	const updatedRole = await ctx.db.get(args.circleRoleId);
	if (updatedRole) {
		await recordUpdateHistory(ctx, 'circleRole', role, updatedRole);
	}

	return { success: true };
}

async function updateInlineCircleRole(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		circleRoleId: Id<'circleRoles'>;
		updates: {
			name?: string;
			purpose?: string;
			decisionRights?: string[];
			representsToParent?: boolean;
		};
	}
) {
	const role = await ctx.db.get(args.circleRoleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	const circle = await ctx.db.get(role.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	const personId = await requireWorkspacePersonFromSession(ctx, args.sessionId, circle.workspaceId);
	await requireQuickEditPermissionForPerson(ctx, personId, circle);

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
		updatedByPersonId: personId
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
		// GOV-02: Validate purpose is non-empty
		validateRolePurpose(args.updates.purpose);
		updateData.purpose = args.updates.purpose;
	}

	if (args.updates.decisionRights !== undefined) {
		// GOV-03: Validate at least one decision right
		validateRoleDecisionRights(args.updates.decisionRights);
		updateData.decisionRights = args.updates.decisionRights;
	}

	if (args.updates.representsToParent !== undefined) {
		updateData.representsToParent = args.updates.representsToParent;
	}

	await ctx.db.patch(args.circleRoleId, updateData);

	const afterDoc = await ctx.db.get(args.circleRoleId);
	if (afterDoc) {
		await recordUpdateHistory(ctx, 'circleRole', beforeDoc, afterDoc);
	}

	return { success: true };
}
