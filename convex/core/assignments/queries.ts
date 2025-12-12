import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { requireAssignment } from './rules';

type AnyCtx = QueryCtx | MutationCtx;

type StatusFilter = { status?: 'active' | 'ended' };

export async function getAssignmentById(ctx: AnyCtx, assignmentId: Id<'assignments'>) {
	return requireAssignment(ctx, assignmentId);
}

export async function listAssignmentsForPerson(
	ctx: AnyCtx,
	personId: Id<'people'>,
	options?: StatusFilter
) {
	const query = ctx.db
		.query('assignments')
		.withIndex('by_person', (q) => q.eq('personId', personId));

	if (options?.status) {
		query.filter((q) => q.eq(q.field('status'), options.status));
	}

	return query.collect();
}

export async function listAssignmentsForRole(
	ctx: AnyCtx,
	roleId: Id<'circleRoles'>,
	options?: StatusFilter
) {
	const query = ctx.db.query('assignments').withIndex('by_role', (q) => q.eq('roleId', roleId));

	if (options?.status) {
		query.filter((q) => q.eq(q.field('status'), options.status));
	}

	return query.collect();
}

export async function listAssignmentsInCircle(
	ctx: AnyCtx,
	circleId: Id<'circles'>,
	options?: StatusFilter
) {
	const query = ctx.db
		.query('assignments')
		.withIndex('by_circle', (q) => q.eq('circleId', circleId));

	if (options?.status) {
		query.filter((q) => q.eq(q.field('status'), options.status));
	}

	return query.collect();
}

export async function getActiveAssignmentForRole(ctx: AnyCtx, roleId: Id<'circleRoles'>) {
	return ctx.db
		.query('assignments')
		.withIndex('by_role', (q) => q.eq('roleId', roleId))
		.filter((q) => q.eq(q.field('status'), 'active'))
		.first();
}

export async function hasAnyRoleInCircle(
	ctx: AnyCtx,
	personId: Id<'people'>,
	circleId: Id<'circles'>
): Promise<boolean> {
	const assignment = await ctx.db
		.query('assignments')
		.withIndex('by_circle_person', (q) => q.eq('circleId', circleId).eq('personId', personId))
		.first();

	return !!assignment;
}

export async function isAssignedToRole(
	ctx: AnyCtx,
	personId: Id<'people'>,
	roleId: Id<'circleRoles'>
): Promise<boolean> {
	const assignment = await ctx.db
		.query('assignments')
		.withIndex('by_role_person', (q) => q.eq('roleId', roleId).eq('personId', personId))
		.first();

	return !!assignment && assignment.status === 'active';
}

export async function ensureAssignmentInCircle(
	ctx: AnyCtx,
	assignmentId: Id<'assignments'>,
	circleId: Id<'circles'>
) {
	const assignment = await requireAssignment(ctx, assignmentId);
	if (assignment.circleId !== circleId) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Assignment does not belong to circle');
	}
	return assignment;
}
