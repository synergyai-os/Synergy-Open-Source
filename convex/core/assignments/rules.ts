import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { calculateAuthority, getAuthorityContextFromAssignments } from '../authority';
import { requireActivePerson } from '../people/rules';
import { requireCircle } from '../circles/rules';

type AnyCtx = QueryCtx | MutationCtx;

export function isAssignmentActive(assignment: {
	status: string;
	endedAt?: number | null;
}): boolean {
	return assignment.status === 'active' && assignment.endedAt === undefined;
}

export function isAssignmentEnded(assignment: { status: string }): boolean {
	return assignment.status === 'ended';
}

export function hasTermEnded(assignment: { endDate?: number | null }): boolean {
	return (
		assignment.endDate !== undefined &&
		assignment.endDate !== null &&
		assignment.endDate <= Date.now()
	);
}

export async function requireAssignment(ctx: AnyCtx, assignmentId: Id<'assignments'>) {
	const assignment = await ctx.db.get(assignmentId);
	if (!assignment) {
		throw createError(ErrorCodes.ASSIGNMENT_NOT_FOUND, 'Assignment not found');
	}
	return assignment;
}

export async function requireActiveAssignment(ctx: AnyCtx, assignmentId: Id<'assignments'>) {
	const assignment = await requireAssignment(ctx, assignmentId);
	if (!isAssignmentActive(assignment)) {
		throw createError(ErrorCodes.ASSIGNMENT_NOT_FOUND, 'Assignment is not active');
	}
	return assignment;
}

export async function canCreateAssignment(
	ctx: AnyCtx,
	actorPersonId: Id<'people'>,
	circleId: Id<'circles'>
): Promise<boolean> {
	const authority = await getAuthorityForPerson(ctx, actorPersonId, circleId);
	return authority.canAssignRoles;
}

export async function canEndAssignment(
	ctx: AnyCtx,
	actorPersonId: Id<'people'>,
	circleId: Id<'circles'>
): Promise<boolean> {
	const authority = await getAuthorityForPerson(ctx, actorPersonId, circleId);
	return authority.canAssignRoles;
}

async function getAuthorityForPerson(
	ctx: AnyCtx,
	actorPersonId: Id<'people'>,
	circleId: Id<'circles'>
) {
	const circle = await requireCircle(ctx, circleId);
	await requireActivePerson(ctx, actorPersonId);
	const authorityCtx = await getAuthorityContextFromAssignments(ctx, {
		personId: actorPersonId,
		circleId,
		workspaceId: circle.workspaceId
	});
	return calculateAuthority(authorityCtx);
}
