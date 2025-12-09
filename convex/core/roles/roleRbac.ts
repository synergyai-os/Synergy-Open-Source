import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';

export async function handleUserCircleRoleCreated(
	ctx: MutationCtx,
	userCircleRole: {
		_id: Id<'userCircleRoles'>;
		userId: Id<'users'>;
		circleRoleId: Id<'circleRoles'>;
		assignedBy: Id<'users'>;
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
			.query('permissions')
			.withIndex('by_slug', (q) => q.eq('slug', perm.permissionSlug))
			.first();

		if (!permission) {
			continue;
		}

		const rolePermissions = await ctx.db
			.query('rolePermissions')
			.withIndex('by_permission', (q) => q.eq('permissionId', permission._id))
			.collect();

		for (const rolePerm of rolePermissions) {
			const rbacRole = await ctx.db.get(rolePerm.roleId);
			if (!rbacRole) {
				continue;
			}

			const existingRole = await ctx.db
				.query('userRoles')
				.withIndex('by_user_role', (q) =>
					q.eq('userId', userCircleRole.userId).eq('roleId', rbacRole._id)
				)
				.filter((q) =>
					q.and(
						q.eq(q.field('circleId'), circleRole.circleId),
						q.eq(q.field('revokedAt'), undefined)
					)
				)
				.first();

			if (!existingRole) {
				await ctx.db.insert('userRoles', {
					userId: userCircleRole.userId,
					roleId: rbacRole._id,
					workspaceId: circleRole.workspaceId,
					circleId: circleRole.circleId,
					sourceCircleRoleId: userCircleRole._id,
					assignedBy: userCircleRole.assignedBy,
					assignedAt: Date.now()
				});
			}
		}
	}
}

export async function handleUserCircleRoleRemoved(
	ctx: MutationCtx,
	userCircleRoleId: Id<'userCircleRoles'>
): Promise<void> {
	const autoAssignedRoles = await ctx.db
		.query('userRoles')
		.withIndex('by_source_circle_role', (q) => q.eq('sourceCircleRoleId', userCircleRoleId))
		.filter((q) => q.eq(q.field('revokedAt'), undefined))
		.collect();

	for (const ur of autoAssignedRoles) {
		await ctx.db.patch(ur._id, { revokedAt: Date.now() });
	}
}

export async function handleUserCircleRoleRestored(
	ctx: MutationCtx,
	userCircleRoleId: Id<'userCircleRoles'>
): Promise<void> {
	const revokedRoles = await ctx.db
		.query('userRoles')
		.withIndex('by_source_circle_role', (q) => q.eq('sourceCircleRoleId', userCircleRoleId))
		.filter((q) => q.neq(q.field('revokedAt'), undefined))
		.collect();

	for (const ur of revokedRoles) {
		await ctx.db.patch(ur._id, { revokedAt: undefined });
	}

	const userCircleRole = await ctx.db.get(userCircleRoleId);
	if (!userCircleRole) {
		return;
	}

	const circleRole = await ctx.db.get(userCircleRole.circleRoleId);
	if (!circleRole) {
		return;
	}

	const circle = await ctx.db.get(circleRole.circleId);
	if (!circle) {
		return;
	}

	await handleUserCircleRoleCreated(
		ctx,
		{
			_id: userCircleRoleId,
			userId: userCircleRole.userId,
			circleRoleId: userCircleRole.circleRoleId,
			assignedBy: userCircleRole.assignedBy
		},
		{
			templateId: circleRole.templateId,
			circleId: circleRole.circleId,
			workspaceId: circle.workspaceId
		}
	);
}
