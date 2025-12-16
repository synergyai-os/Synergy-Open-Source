import type { Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import type { CircleType, DecisionModel } from './constants';
import { ensureWorkspaceMembership, requireWorkspacePersonFromSession } from './circleAccess';

export async function listCircles(
	ctx: QueryCtx,
	args: {
		sessionId: string;
		workspaceId: Id<'workspaces'>;
		includeArchived?: boolean;
	}
): Promise<
	Array<{
		circleId: Id<'circles'>;
		workspaceId: Id<'workspaces'>;
		name: string;
		slug: string;
		purpose?: string;
		parentCircleId?: Id<'circles'>;
		parentName: string | null;
		memberCount: number;
		roleCount: number;
		roles: Array<{ roleId: Id<'circleRoles'>; name: string; status: string; isHiring: boolean }>;
		circleType?: CircleType;
		decisionModel?: DecisionModel;
		createdAt: number;
		updatedAt: number;
		archivedAt?: number;
	}>
> {
	const personId = await requireWorkspacePersonFromSession(ctx, args.sessionId, args.workspaceId);

	await ensureWorkspaceMembership(ctx, args.workspaceId, personId);

	const circles = args.includeArchived
		? await ctx.db
				.query('circles')
				.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
				.collect()
		: await ctx.db
				.query('circles')
				.withIndex('by_workspace_archived', (q) =>
					q.eq('workspaceId', args.workspaceId).eq('archivedAt', undefined)
				)
				.collect();

	const results = await Promise.all(
		circles.map(async (circle) => {
			const members = args.includeArchived
				? await ctx.db
						.query('circleMembers')
						.withIndex('by_circle', (q) => q.eq('circleId', circle._id))
						.collect()
				: await ctx.db
						.query('circleMembers')
						.withIndex('by_circle_archived', (q) =>
							q.eq('circleId', circle._id).eq('archivedAt', undefined)
						)
						.collect();

			const roles = args.includeArchived
				? await ctx.db
						.query('circleRoles')
						.withIndex('by_circle', (q) => q.eq('circleId', circle._id))
						.collect()
				: await ctx.db
						.query('circleRoles')
						.withIndex('by_circle_archived', (q) =>
							q.eq('circleId', circle._id).eq('archivedAt', undefined)
						)
						.collect();

			let parentName: string | null = null;
			if (circle.parentCircleId) {
				const parent = await ctx.db.get(circle.parentCircleId);
				parentName = parent?.name ?? null;
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
				roleCount: roles.length,
				roles: roles.map((r) => ({
					roleId: r._id,
					name: r.name,
					status: r.status,
					isHiring: r.isHiring
				})),
				circleType: circle.circleType,
				decisionModel: circle.decisionModel,
				createdAt: circle.createdAt,
				updatedAt: circle.updatedAt,
				archivedAt: circle.archivedAt
			};
		})
	);

	return results;
}
