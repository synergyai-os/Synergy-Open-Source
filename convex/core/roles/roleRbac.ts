import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { requirePerson } from '../people/rules';

export async function handleUserCircleRoleCreated(
	ctx: MutationCtx,
	userCircleRole: {
		_id: Id<'userCircleRoles'>;
		personId: Id<'people'>;
		circleRoleId: Id<'circleRoles'>;
		assignedByPersonId: Id<'people'>;
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

			// TODO: SYOS-791 - when workspaceRoles moves to personId, remove person->user mapping.
			const person = await requirePerson(ctx, userCircleRole.personId);
			if (!person.userId) {
				// legacy bridge SYOS-791
				continue;
			}

			const assignedByPerson = userCircleRole.assignedByPersonId
				? await ctx.db.get(userCircleRole.assignedByPersonId)
				: null;
			const assignedByUserId =
				assignedByPerson && 'userId' in assignedByPerson ? assignedByPerson.userId : null; // legacy bridge SYOS-791

			const existingRole = await ctx.db
				.query('userRoles') // legacy bridge SYOS-791
				.withIndex('by_user_role', (q) => q.eq('userId', person.userId!).eq('roleId', rbacRole._id)) // legacy bridge SYOS-791
				.filter((q) =>
					q.and(
						q.eq(q.field('circleId'), circleRole.circleId),
						q.eq(q.field('revokedAt'), undefined)
					)
				)
				.first();

			if (!existingRole) {
				await ctx.db.insert('userRoles', {
					userId: person.userId!, // legacy bridge SYOS-791
					roleId: rbacRole._id,
					workspaceId: circleRole.workspaceId,
					circleId: circleRole.circleId,
					sourceCircleRoleId: userCircleRole._id,
					assignedBy: assignedByUserId ?? person.userId!, // legacy bridge SYOS-791
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

	// TODO: SYOS-791 - person->user mapping to be removed when workspaceRoles uses personId
	const person = await requirePerson(ctx, userCircleRole.personId);
	if (!person.userId) {
		// legacy bridge SYOS-791
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
			personId: userCircleRole.personId,
			circleRoleId: userCircleRole.circleRoleId,
			assignedByPersonId: userCircleRole.assignedByPersonId
		},
		{
			templateId: circleRole.templateId,
			circleId: circleRole.circleId,
			workspaceId: circle.workspaceId
		}
	);
}
