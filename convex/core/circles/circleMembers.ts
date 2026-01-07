import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import {
	ensureWorkspaceMembership,
	ensureWorkspacePersonNotArchived,
	requireWorkspacePersonFromSession
} from './circleAccess';
import { requireCircle } from './rules';
import { getPersonById } from '../people/queries';
import { getPersonEmail } from '../people/rules';
import { hasWorkspacePermission } from '../../infrastructure/rbac/permissions';

export async function getCircleMembers(
	ctx: QueryCtx,
	args: {
		sessionId: string;
		circleId: Id<'circles'>;
		includeArchived?: boolean;
	}
) {
	const circle = await requireCircle(ctx, args.circleId);

	const actingPersonId = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		circle.workspaceId
	);

	await ensureWorkspaceMembership(ctx, circle.workspaceId, actingPersonId);

	const memberships = args.includeArchived
		? await ctx.db
				.query('circleMembers')
				.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
				.collect()
		: await ctx.db
				.query('circleMembers')
				.withIndex('by_circle_archived', (q) =>
					q.eq('circleId', args.circleId).eq('archivedAt', undefined)
				)
				.collect();

	const members = await Promise.all(
		memberships.map(async (membership) => {
			const person = await getPersonById(ctx, membership.personId);
			if (!person) return null;

			return {
				personId: membership.personId,
				email: await getPersonEmail(ctx, person),
				displayName: person.displayName,
				status: person.status,
				addedAt: membership.joinedAt,
				addedBy: membership.addedByPersonId
			};
		})
	);

	return members.filter((member): member is NonNullable<typeof member> => member !== null);
}

export async function addCircleMember(
	ctx: MutationCtx,
	args: { sessionId: string; circleId: Id<'circles'>; memberPersonId: Id<'people'> }
) {
	const circle = await requireCircle(ctx, args.circleId);

	const actingPersonId = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		circle.workspaceId
	);

	await ensureWorkspaceMembership(ctx, circle.workspaceId, actingPersonId);
	await ensureWorkspacePersonNotArchived(ctx, circle.workspaceId, args.memberPersonId);

	// Authorization:
	// - Circle members can add other members (existing behavior)
	// - Users with 'circles.members.manage' permission can add members to any circle (admin override)
	const isCircleMember = await ctx.db
		.query('circleMembers')
		.withIndex('by_circle_person', (q) =>
			q.eq('circleId', args.circleId).eq('personId', actingPersonId)
		)
		.first();

	if (!isCircleMember) {
		// Not a circle member - check if they have admin override permission
		const hasPermission = await hasWorkspacePermission(
			ctx,
			actingPersonId,
			'circles.members.manage'
		);
		if (!hasPermission) {
			throw createError(
				ErrorCodes.AUTHZ_NOT_CIRCLE_MEMBER,
				'You must be a circle member or have circles.members.manage permission to add members'
			);
		}
	}

	const existingMembership = await ctx.db
		.query('circleMembers')
		.withIndex('by_circle_person', (q) =>
			q.eq('circleId', args.circleId).eq('personId', args.memberPersonId)
		)
		.first();

	if (existingMembership) {
		throw createError(ErrorCodes.CIRCLE_MEMBER_EXISTS, 'Person is already a member of this circle');
	}

	await ctx.db.insert('circleMembers', {
		circleId: args.circleId,
		personId: args.memberPersonId,
		joinedAt: Date.now(),
		addedByPersonId: actingPersonId
	});

	return { success: true };
}

export async function removeCircleMember(
	ctx: MutationCtx,
	args: { sessionId: string; circleId: Id<'circles'>; memberPersonId: Id<'people'> }
) {
	const circle = await requireCircle(ctx, args.circleId);

	const actingPersonId = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		circle.workspaceId
	);

	await ensureWorkspaceMembership(ctx, circle.workspaceId, actingPersonId);
	await ensureCircleMembership(
		ctx,
		args.circleId,
		actingPersonId,
		ErrorCodes.AUTHZ_NOT_CIRCLE_MEMBER
	);

	const membership = await ctx.db
		.query('circleMembers')
		.withIndex('by_circle_person', (q) =>
			q.eq('circleId', args.circleId).eq('personId', args.memberPersonId)
		)
		.first();

	if (!membership) {
		throw createError(ErrorCodes.CIRCLE_MEMBER_NOT_FOUND, 'Person is not a member of this circle');
	}

	await ctx.db.delete(membership._id);

	return { success: true };
}

async function ensureCircleMembership(
	ctx: QueryCtx | MutationCtx,
	circleId: Id<'circles'>,
	personId: Id<'people'>,
	errorCode: (typeof ErrorCodes)[keyof typeof ErrorCodes]
) {
	const membership = await ctx.db
		.query('circleMembers')
		.withIndex('by_circle_person', (q) => q.eq('circleId', circleId).eq('personId', personId))
		.first();
	if (!membership) {
		throw createError(errorCode, 'You do not have access to this circle');
	}
}
