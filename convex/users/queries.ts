import { v } from 'convex/values';
import { query } from '../_generated/server';
import { requireSessionUserId } from './access';

export const getUserById = query({
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		const userId = await requireSessionUserId(ctx, args.sessionId);
		return await ctx.db.get(userId);
	}
});

export const getUserByWorkosId = query({
	args: { workosId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('users')
			.withIndex('by_workos_id', (q) => q.eq('workosId', args.workosId))
			.first();
	}
});

export const getCurrentUser = query({
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		const userId = await requireSessionUserId(ctx, args.sessionId);
		return await ctx.db.get(userId);
	}
});
