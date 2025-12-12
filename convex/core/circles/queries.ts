import { mutation, query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { archiveCircle, restoreCircle } from './circleArchival';
import { ensureWorkspaceMembership, requireWorkspacePersonFromSession } from './circleAccess';
import { listCircles } from './circleList';
import { addCircleMember, getCircleMembers, removeCircleMember } from './circleMembers';
import { createCircleInternal, updateCircleInternal, updateInlineCircle } from './circleLifecycle';

export { getCircleMembers } from './circleMembers';
export { createCoreRolesForCircle } from './circleCoreRoles';

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

export const create = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		name: v.string(),
		purpose: v.optional(v.string()),
		parentCircleId: v.optional(v.id('circles')),
		circleType: v.optional(
			v.union(
				v.literal('hierarchy'),
				v.literal('empowered_team'),
				v.literal('guild'),
				v.literal('hybrid')
			)
		),
		decisionModel: v.optional(
			v.union(
				v.literal('manager_decides'),
				v.literal('team_consensus'),
				v.literal('consent'),
				v.literal('coordination_only')
			)
		)
	},
	handler: async (ctx, args): Promise<Id<'circles'>> => {
		const { circleId } = await createCircleInternal(ctx, args);
		return circleId;
	}
});

export const update = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		name: v.optional(v.string()),
		purpose: v.optional(v.string()),
		parentCircleId: v.optional(v.id('circles'))
	},
	handler: async (ctx, args) => {
		return updateCircleInternal(ctx, args);
	}
});

export const updateInline = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		updates: v.object({
			name: v.optional(v.string()),
			purpose: v.optional(v.string()),
			circleType: v.optional(
				v.union(
					v.literal('hierarchy'),
					v.literal('empowered_team'),
					v.literal('guild'),
					v.literal('hybrid')
				)
			),
			decisionModel: v.optional(
				v.union(
					v.literal('manager_decides'),
					v.literal('team_consensus'),
					v.literal('consent'),
					v.literal('coordination_only')
				)
			)
		})
	},
	handler: async (ctx, args) => {
		return updateInlineCircle(ctx, args);
	}
});

export const archive = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles')
	},
	handler: async (ctx, args) => {
		return archiveCircle(ctx, args);
	}
});

export const restore = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles')
	},
	handler: async (ctx, args) => {
		return restoreCircle(ctx, args);
	}
});

export const addMember = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		memberPersonId: v.id('people')
	},
	handler: async (ctx, args) => {
		return addCircleMember(ctx, args);
	}
});

export const removeMember = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		memberPersonId: v.id('people')
	},
	handler: async (ctx, args) => {
		return removeCircleMember(ctx, args);
	}
});
