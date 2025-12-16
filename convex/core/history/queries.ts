import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { requireWorkspacePersonFromSession } from '../circles/circleAccess';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';

export const getEntityHistory = query({
	args: {
		sessionId: v.string(),
		entityType: v.union(
			v.literal('circle'),
			v.literal('circleRole'),
			v.literal('userCircleRole'),
			v.literal('circleMember')
		),
		entityId: v.string(),
		limit: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		await validateSessionAndGetUserId(ctx, args.sessionId);
		const limit = args.limit ?? 50;

		const history = await ctx.db
			.query('orgVersionHistory')
			.withIndex('by_entity', (q) =>
				q.eq('entityType', args.entityType).eq('entityId', args.entityId)
			)
			.order('desc')
			.take(limit);

		return history;
	}
});

export const getWorkspaceTimeline = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		limit: v.optional(v.number()),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		await requireWorkspacePersonFromSession(ctx, args.sessionId, args.workspaceId);
		const limit = args.limit ?? 100;

		const historyQuery = ctx.db
			.query('orgVersionHistory')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.order('desc');

		const results = await historyQuery.take(limit * 2);

		let filtered = results;

		if (args.startDate !== undefined) {
			filtered = filtered.filter((record) => record.changedAt >= args.startDate!);
		}

		if (args.endDate !== undefined) {
			filtered = filtered.filter((record) => record.changedAt <= args.endDate!);
		}

		return filtered.slice(0, limit);
	}
});

export const getUserChanges = query({
	args: {
		sessionId: v.string(),
		targetPersonId: v.id('people'),
		workspaceId: v.optional(v.id('workspaces')),
		limit: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		if (args.workspaceId) {
			await requireWorkspacePersonFromSession(ctx, args.sessionId, args.workspaceId);
		} else {
			await validateSessionAndGetUserId(ctx, args.sessionId);
		}
		const limit = args.limit ?? 100;

		const userQuery = ctx.db
			.query('orgVersionHistory')
			.withIndex('by_person', (q) => q.eq('changedByPersonId', args.targetPersonId))
			.order('desc');

		const results = await userQuery.take(limit * 2);

		let filtered = results;
		if (args.workspaceId !== undefined) {
			filtered = filtered.filter((record) => record.workspaceId === args.workspaceId);
		}

		return filtered.slice(0, limit);
	}
});
