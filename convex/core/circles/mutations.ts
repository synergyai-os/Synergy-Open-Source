/**
 * Circles mutations - write operations
 *
 * All mutation handlers for circle operations.
 */

import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import { LEAD_AUTHORITY } from './constants';
import { archiveCircle, restoreCircle } from './circleArchival';
import { addCircleMember, removeCircleMember } from './circleMembers';
import { createCircleInternal, updateCircleInternal, updateInlineCircle } from './circleLifecycle';

export const create = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		name: v.string(),
		purpose: v.optional(v.string()),
		parentCircleId: v.optional(v.id('circles')),
		leadAuthority: v.optional(
			v.union(
				v.literal(LEAD_AUTHORITY.DECIDES),
				v.literal(LEAD_AUTHORITY.FACILITATES),
				v.literal(LEAD_AUTHORITY.CONVENES)
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
			leadAuthority: v.optional(
				v.union(
					v.literal(LEAD_AUTHORITY.DECIDES),
					v.literal(LEAD_AUTHORITY.FACILITATES),
					v.literal(LEAD_AUTHORITY.CONVENES)
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
