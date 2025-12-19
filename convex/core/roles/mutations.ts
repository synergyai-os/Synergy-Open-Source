/**
 * Roles mutations - write operations
 *
 * All mutation handlers for role operations.
 * Consolidated from fragmented mutation files per architecture.md domain structure.
 */

import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import {
	recordCreateHistory,
	recordUpdateHistory,
	recordArchiveHistory,
	recordRestoreHistory
} from '../history';
import { requireQuickEditPermissionForPerson } from '../authority/quickEdit';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { hasDuplicateRoleName } from './rules';
import { ROLE_TYPES } from './constants';
import {
	ensureCircleExists,
	ensureWorkspaceMembership,
	isLeadRole,
	isWorkspaceAdmin,
	requireWorkspacePersonById,
	requireWorkspacePersonFromSession
} from './roleAccess';
import {
	handleUserCircleRoleCreated,
	handleUserCircleRoleRemoved,
	handleUserCircleRoleRestored
} from './roleRbac';
import { createCustomFieldValuesFromTemplate } from '../../infrastructure/customFields';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Archive a role helper (used internally and by circles domain for cascade archival)
 */
export async function archiveRoleHelper(
	ctx: MutationCtx,
	roleId: Id<'circleRoles'>,
	actorPersonId: Id<'people'>,
	reason: 'direct' | 'cascade' = 'direct'
): Promise<void> {
	const role = await ctx.db.get(roleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	if (role.archivedAt !== undefined) {
		return;
	}

	// GOV-04: Lead role cannot be deleted while circle exists
	if (reason === 'direct' && role.roleType === ROLE_TYPES.CIRCLE_LEAD) {
		const circle = await ctx.db.get(role.circleId);
		if (!circle || circle.archivedAt !== undefined) {
			// Circle is archived or doesn't exist - allow archiving lead role
			// (this happens during cascade archival)
		} else {
			// Circle is active - prevent deleting lead role
			throw createError(
				ErrorCodes.GENERIC_ERROR,
				'GOV-04: Lead role cannot be deleted while circle exists. Every circle must have exactly one lead role.'
			);
		}
	}

	const now = Date.now();

	await ctx.db.patch(roleId, {
		archivedAt: now,
		archivedByPersonId: actorPersonId,
		updatedAt: now,
		updatedByPersonId: actorPersonId
	});

	const archivedRole = await ctx.db.get(roleId);
	if (archivedRole) {
		await recordArchiveHistory(ctx, 'circleRole', role, archivedRole);
	}

	const assignments = await ctx.db
		.query('assignments')
		.withIndex('by_role', (q) => q.eq('roleId', roleId))
		.filter((q) => q.eq(q.field('status'), 'active'))
		.collect();

	for (const assignment of assignments) {
		await ctx.db.patch(assignment._id, {
			status: 'ended',
			endedAt: now,
			endedByPersonId: actorPersonId
		});

		await handleUserCircleRoleRemoved(ctx, assignment._id);
	}
}

/**
 * Update circle role helper
 *
 * Note (SYOS-960): purpose and decisionRights are now stored in customFieldValues.
 * Use customFields mutations to update those fields.
 */
async function updateCircleRole(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		circleRoleId: Id<'circleRoles'>;
		name?: string;
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

/**
 * Update circle role inline helper
 *
 * Note (SYOS-960): purpose and decisionRights are now stored in customFieldValues.
 * Use customFields mutations to update those fields.
 */
async function updateInlineCircleRole(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		circleRoleId: Id<'circleRoles'>;
		updates: {
			name?: string;
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

/**
 * Archive role mutation helper
 */
async function archiveRoleMutation(
	ctx: MutationCtx,
	args: { sessionId: string; circleRoleId: Id<'circleRoles'> }
) {
	const role = await ctx.db.get(args.circleRoleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
	const actorPersonId = await requireWorkspacePersonFromSession(ctx, args.sessionId, workspaceId);
	await ensureWorkspaceMembership(ctx, workspaceId, actorPersonId);

	await archiveRoleHelper(ctx, args.circleRoleId, actorPersonId, 'direct');

	return { success: true };
}

/**
 * Restore role mutation helper
 */
async function restoreRoleMutation(
	ctx: MutationCtx,
	args: { sessionId: string; roleId: Id<'circleRoles'> }
) {
	const role = await ctx.db.get(args.roleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	if (!role.archivedAt) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Role is not archived');
	}

	const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
	const actorPersonId = await requireWorkspacePersonFromSession(ctx, args.sessionId, workspaceId);
	await ensureWorkspaceMembership(ctx, workspaceId, actorPersonId);

	const circle = await ctx.db.get(role.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle no longer exists');
	}
	if (circle.archivedAt) {
		throw createError(
			ErrorCodes.CIRCLE_ARCHIVED,
			'Cannot restore role while circle is archived. Restore circle first.'
		);
	}

	const now = Date.now();
	const oldRole = { ...role };

	let templateId = role.templateId;
	if (templateId) {
		const template = await ctx.db.get(templateId);
		if (!template || template.archivedAt) {
			templateId = undefined;
		}
	}

	await ctx.db.patch(args.roleId, {
		archivedAt: undefined,
		archivedByPersonId: undefined,
		templateId,
		updatedAt: now,
		updatedByPersonId: actorPersonId
	});

	const restoredRole = await ctx.db.get(args.roleId);
	if (restoredRole) {
		await recordRestoreHistory(ctx, 'circleRole', oldRole, restoredRole);
	}

	return { success: true };
}

/**
 * Restore assignment mutation helper
 */
async function restoreAssignmentMutation(
	ctx: MutationCtx,
	args: { sessionId: string; assignmentId: Id<'assignments'> }
) {
	const assignment = await ctx.db.get(args.assignmentId);
	if (!assignment) {
		throw createError(ErrorCodes.ASSIGNMENT_NOT_FOUND, 'Assignment not found');
	}

	if (assignment.status !== 'ended') {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Assignment is not ended');
	}

	const role = await ctx.db.get(assignment.roleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role no longer exists');
	}
	if (role.archivedAt) {
		throw createError(
			ErrorCodes.CIRCLE_ARCHIVED,
			'Cannot restore assignment while role is archived'
		);
	}

	const circle = await ctx.db.get(role.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	const actorPersonId = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		circle.workspaceId
	);
	await ensureWorkspaceMembership(ctx, circle.workspaceId, actorPersonId);

	await requireWorkspacePersonById(ctx, circle.workspaceId, assignment.personId);

	const existingActive = await ctx.db
		.query('assignments')
		.withIndex('by_role_person', (q) =>
			q.eq('roleId', assignment.roleId).eq('personId', assignment.personId)
		)
		.filter((q) => q.eq(q.field('status'), 'active'))
		.first();

	if (existingActive) {
		throw createError(ErrorCodes.ASSIGNMENT_ALREADY_EXISTS, 'User already has this role assigned');
	}

	const _now = Date.now();
	const oldAssignment = { ...assignment };

	await ctx.db.patch(args.assignmentId, {
		status: 'active',
		endedAt: undefined,
		endedByPersonId: undefined
	});

	await handleUserCircleRoleRestored(ctx, args.assignmentId);

	const restoredAssignment = await ctx.db.get(args.assignmentId);
	if (restoredAssignment) {
		await recordRestoreHistory(ctx, 'assignment', oldAssignment, restoredAssignment);
	}

	return { success: true };
}

/**
 * Assign user to role helper
 */
async function assignUserToRole(
	ctx: MutationCtx,
	args: { sessionId: string; circleRoleId: Id<'circleRoles'>; assigneePersonId: Id<'people'> }
): Promise<{ success: true }> {
	const role = await ctx.db.get(args.circleRoleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	const { workspaceId } = await ensureCircleExists(ctx, role.circleId);

	const actorPersonId = await requireWorkspacePersonFromSession(ctx, args.sessionId, workspaceId);
	const targetPersonId = args.assigneePersonId;
	await ensureWorkspaceMembership(ctx, workspaceId, actorPersonId);
	await ensureWorkspaceMembership(ctx, workspaceId, targetPersonId);

	const existingAssignment = await ctx.db
		.query('assignments')
		.withIndex('by_role_person', (q) =>
			q.eq('roleId', args.circleRoleId).eq('personId', targetPersonId)
		)
		.filter((q) => q.eq(q.field('status'), 'active'))
		.first();

	if (existingAssignment) {
		throw createError(
			ErrorCodes.ASSIGNMENT_ALREADY_EXISTS,
			'Person is already assigned to this role'
		);
	}

	const now = Date.now();
	const assignmentId = await ctx.db.insert('assignments', {
		circleId: role.circleId,
		roleId: args.circleRoleId,
		personId: targetPersonId,
		assignedAt: now,
		assignedByPersonId: actorPersonId,
		status: 'active'
	});

	await handleUserCircleRoleCreated(
		ctx,
		{
			_id: assignmentId,
			personId: targetPersonId,
			circleRoleId: args.circleRoleId,
			assignedByPersonId: actorPersonId
		},
		{
			templateId: role.templateId,
			circleId: role.circleId,
			workspaceId
		}
	);

	return { success: true };
}

/**
 * Remove user from role helper
 */
async function removeUserFromRole(
	ctx: MutationCtx,
	args: { sessionId: string; circleRoleId: Id<'circleRoles'>; assigneePersonId: Id<'people'> }
) {
	const role = await ctx.db.get(args.circleRoleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
	const actorPersonId = await requireWorkspacePersonFromSession(ctx, args.sessionId, workspaceId);
	await ensureWorkspaceMembership(ctx, workspaceId, actorPersonId);

	const assignment = await ctx.db
		.query('assignments')
		.withIndex('by_role_person', (q) =>
			q.eq('roleId', args.circleRoleId).eq('personId', args.assigneePersonId)
		)
		.filter((q) => q.eq(q.field('status'), 'active'))
		.first();

	if (!assignment) {
		throw createError(ErrorCodes.ASSIGNMENT_NOT_FOUND, 'Person is not assigned to this role');
	}

	const now = Date.now();
	await ctx.db.patch(assignment._id, {
		status: 'ended',
		endedAt: now,
		endedByPersonId: actorPersonId
	});

	await handleUserCircleRoleRemoved(ctx, assignment._id);

	return { success: true };
}

// ============================================================================
// Mutation Handlers
// ============================================================================

export const create = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		name: v.string(),
		// SYOS-960: Accept field values array instead of purpose/decisionRights
		fieldValues: v.optional(
			v.array(
				v.object({
					systemKey: v.string(),
					values: v.array(v.string())
				})
			)
		),
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
		const roleType = args.roleType ?? ROLE_TYPES.CUSTOM;

		const now = Date.now();
		// Create lean circleRole (no descriptive fields per SYOS-960)
		const roleId = await ctx.db.insert('circleRoles', {
			circleId: args.circleId,
			workspaceId,
			name: trimmedName,
			roleType,
			status: 'active',
			isHiring: false,
			createdAt: now,
			updatedAt: now,
			updatedByPersonId: personId
		});

		// Create customFieldValues if provided (SYOS-960)
		// Validation (GOV-02, GOV-03) happens inside helper (phase-aware - SYOS-996)
		if (args.fieldValues && args.fieldValues.length > 0) {
			const workspace = await ctx.db.get(workspaceId);
			await createCustomFieldValuesFromTemplate(ctx, {
				workspaceId,
				entityType: 'role',
				entityId: roleId,
				templateDefaultFieldValues: args.fieldValues,
				createdByPersonId: personId,
				workspacePhase: workspace?.phase
			});
		}

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
			representsToParent: v.optional(v.boolean())
		})
	},
	handler: async (ctx, args) => updateInlineCircleRole(ctx, args)
});

export const archiveRole = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles')
	},
	handler: async (ctx, args) => archiveRoleMutation(ctx, args)
});

export const restoreRole = mutation({
	args: {
		sessionId: v.string(),
		roleId: v.id('circleRoles')
	},
	handler: async (ctx, args) => restoreRoleMutation(ctx, args)
});

export const restoreAssignment = mutation({
	args: {
		sessionId: v.string(),
		assignmentId: v.id('assignments')
	},
	handler: async (ctx, args) => restoreAssignmentMutation(ctx, args)
});

export const assignUser = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		assigneePersonId: v.id('people')
	},
	handler: async (ctx, args) => assignUserToRole(ctx, args)
});

export const removeUser = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		assigneePersonId: v.id('people')
	},
	handler: async (ctx, args) => removeUserFromRole(ctx, args)
});
