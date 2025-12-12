import { query } from '../../../_generated/server';
import { v } from 'convex/values';
import { ensureWorkspaceMembership, requireWorkspacePersonFromSession } from '../roleAccess';

export const list = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const personId = await requireWorkspacePersonFromSession(ctx, args.sessionId, args.workspaceId);
		await ensureWorkspaceMembership(ctx, args.workspaceId, personId);

		const workspaceTemplates = args.includeArchived
			? await ctx.db
					.query('roleTemplates')
					.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
					.collect()
			: await ctx.db
					.query('roleTemplates')
					.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
					.filter((q) => q.eq(q.field('archivedAt'), undefined))
					.collect();

		const systemTemplates = args.includeArchived
			? await ctx.db
					.query('roleTemplates')
					.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
					.collect()
			: await ctx.db
					.query('roleTemplates')
					.withIndex('by_workspace', (q) => q.eq('workspaceId', undefined))
					.filter((q) => q.eq(q.field('archivedAt'), undefined))
					.collect();

		return {
			workspace: workspaceTemplates,
			system: systemTemplates
		};
	}
});
