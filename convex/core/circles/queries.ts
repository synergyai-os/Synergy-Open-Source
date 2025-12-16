import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { ensureWorkspaceMembership, requireWorkspacePersonFromSession } from './circleAccess';
import { listCircles } from './circleList';
import { getCircleMembers } from './circleMembers';

export const list = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		return listCircles(ctx, args);
	}
});

export const get = query({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles')
	},
	handler: async (ctx, args) => {
		const circle = await ctx.db.get(args.circleId);
		if (!circle) {
			throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
		}

		const personId = await requireWorkspacePersonFromSession(
			ctx,
			args.sessionId,
			circle.workspaceId
		);
		await ensureWorkspaceMembership(ctx, circle.workspaceId, personId);

		const members = await ctx.db
			.query('circleMembers')
			.withIndex('by_circle_archived', (q) =>
				q.eq('circleId', args.circleId).eq('archivedAt', undefined)
			)
			.collect();

		let parentName: string | undefined;
		if (circle.parentCircleId) {
			const parent = await ctx.db.get(circle.parentCircleId);
			parentName = parent?.name ?? undefined;
		}

		return {
			circleId: circle._id,
			workspaceId: circle.workspaceId,
			name: circle.name,
			slug: circle.slug,
			purpose: circle.purpose,
			parentCircleId: circle.parentCircleId,
			parentName,
			memberCount: members.length,
			circleType: circle.circleType,
			decisionModel: circle.decisionModel,
			createdAt: circle.createdAt,
			updatedAt: circle.updatedAt,
			archivedAt: circle.archivedAt
		};
	}
});

export const getMembers = query({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		return getCircleMembers(ctx, args);
	}
});
