import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';

export async function handleUserCircleRoleCreated(
	ctx: MutationCtx,
	assignment: {
		_id: Id<'assignments'>;
		personId: Id<'people'>;
		circleRoleId: Id<'circleRoles'>;
		assignedByPersonId?: Id<'people'>;
	},
	circleRole: {
		templateId?: Id<'roleTemplates'>;
		circleId: Id<'circles'>;
		workspaceId: Id<'workspaces'>;
	}
): Promise<void> {
	if (!circleRole.templateId) {
		return;
	}

	const template = await ctx.db.get(circleRole.templateId);
	if (!template?.rbacPermissions?.length) {
		return;
	}

	for (const perm of template.rbacPermissions) {
		const permission = await ctx.db
			.query('rbacPermissions')
			.withIndex('by_slug', (q) => q.eq('slug', perm.permissionSlug))
			.first();

		if (!permission) {
			continue;
		}

		const rolePermissions = await ctx.db
			.query('rbacRolePermissions')
			.withIndex('by_permission', (q) => q.eq('permissionId', permission._id))
			.collect();

		for (const rolePerm of rolePermissions) {
			const rbacRole = await ctx.db.get(rolePerm.roleId);
			if (!rbacRole) {
				continue;
			}

			// Check if this person already has this workspace role from this circleRole assignment
			const existingRole = await ctx.db
				.query('workspaceRoles')
				.withIndex('by_person', (q) => q.eq('personId', assignment.personId))
				.filter((q) =>
					q.and(
						q.eq(q.field('workspaceId'), circleRole.workspaceId),
						q.eq(q.field('role'), rbacRole.slug),
						q.eq(q.field('sourceCircleRoleId'), assignment._id)
					)
				)
				.first();

			if (!existingRole) {
				await ctx.db.insert('workspaceRoles', {
					personId: assignment.personId,
					workspaceId: circleRole.workspaceId,
					role: rbacRole.slug,
					grantedAt: Date.now(),
					grantedByPersonId: assignment.assignedByPersonId,
					sourceCircleRoleId: assignment._id
				});
			}
		}
	}
}

export async function handleUserCircleRoleRemoved(
	ctx: MutationCtx,
	assignmentId: Id<'assignments'>
): Promise<void> {
	const autoAssignedRoles = await ctx.db
		.query('workspaceRoles')
		.withIndex('by_source_role', (q) => q.eq('sourceCircleRoleId', assignmentId))
		.collect();

	for (const wr of autoAssignedRoles) {
		await ctx.db.delete(wr._id);
	}
}

export async function handleUserCircleRoleRestored(
	ctx: MutationCtx,
	assignmentId: Id<'assignments'>
): Promise<void> {
	const assignment = await ctx.db.get(assignmentId);
	if (!assignment) {
		return;
	}

	const circleRole = await ctx.db.get(assignment.roleId);
	if (!circleRole) {
		return;
	}

	const circle = await ctx.db.get(circleRole.circleId);
	if (!circle) {
		return;
	}

	// Re-create workspace roles by calling the creation handler
	await handleUserCircleRoleCreated(
		ctx,
		{
			_id: assignmentId,
			personId: assignment.personId,
			circleRoleId: assignment.roleId,
			assignedByPersonId: assignment.assignedByPersonId
		},
		{
			templateId: circleRole.templateId,
			circleId: circleRole.circleId,
			workspaceId: circle.workspaceId
		}
	);
}
