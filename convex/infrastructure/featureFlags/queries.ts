import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import type { Ctx, FeatureFlagDoc, UserContext } from './types';
import { requireAdmin, getUserContext } from './access';
import { buildDebugInfo, buildMissingFlagDebug } from './debug';
import { buildImpactStats } from './impact';
import {
	createFeatureFlag,
	updateFeatureFlag,
	updateFlagEnabled,
	updateFlagRollout,
	archiveFeatureFlag
} from './lifecycle';
import { findFlagByName } from './store';
import { evaluateFlag, evaluateFlagWithReason } from './targeting';

async function buildFlagResultsForUser(
	ctx: Ctx,
	flags: FeatureFlagDoc[],
	userContext: UserContext
) {
	return Promise.all(
		flags.map(async (flag) => {
			const { result, reason } = await evaluateFlagWithReason(
				{ flagConfig: flag, userContext, flagName: flag.flag },
				ctx
			);
			return {
				flag: flag.flag,
				enabled: flag.enabled,
				result,
				reason: reason ?? ''
			};
		})
	);
}

export const isFlagEnabled = query({
	args: { flag: v.string(), sessionId: v.string() },
	handler: async (ctx, args) => {
		const userContext = await getUserContext(ctx, args.sessionId);
		const flagConfig = await findFlagByName(ctx, args.flag);
		if (!flagConfig || !flagConfig.enabled || !userContext.user) return false;
		return evaluateFlag({ flagConfig, userContext, flagName: args.flag }, ctx);
	}
});

export const getFlagStatuses = query({
	args: { flags: v.array(v.string()), sessionId: v.string() },
	handler: async (ctx, args) => {
		const userContext = await getUserContext(ctx, args.sessionId);
		const user = userContext.user;
		const flagConfigs = await Promise.all(args.flags.map((flag) => findFlagByName(ctx, flag)));

		const results: Record<string, boolean> = {};
		for (let i = 0; i < args.flags.length; i++) {
			const flag = args.flags[i];
			const flagConfig = flagConfigs[i];
			if (!flagConfig || !flagConfig.enabled || !user) {
				results[flag] = false;
				continue;
			}
			results[flag] = await evaluateFlag({ flagConfig, userContext, flagName: flag }, ctx);
		}
		return results;
	}
});

export const listFlags = query({
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.sessionId);
		return ctx.db.query('featureFlags').collect();
	}
});

export const listAllOrganizations = query({
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.sessionId);
		const workspaces = await ctx.db.query('workspaces').collect();
		return workspaces.map((org) => ({
			_id: org._id,
			name: org.name,
			slug: org.slug,
			createdAt: org.createdAt
		}));
	}
});

export const getImpactStats = query({
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.sessionId);
		return buildImpactStats(ctx);
	}
});

export const findFlagsForUser = query({
	args: { sessionId: v.string(), userEmail: v.string() },
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.sessionId);
		const user = await ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', args.userEmail.toLowerCase()))
			.first();
		if (!user) return null;

		const userContext = { userId: user._id, user };
		const allFlags = await ctx.db.query('featureFlags').collect();
		const flags = await buildFlagResultsForUser(ctx, allFlags, userContext);

		return {
			userEmail: args.userEmail,
			userId: user._id,
			flags
		};
	}
});

export const findFlag = query({
	args: { flag: v.string() },
	handler: async (ctx, { flag }) => findFlagByName(ctx, flag)
});

export const getFlagDebugInfo = query({
	args: { flag: v.string(), sessionId: v.string() },
	handler: async (ctx, { flag, sessionId }) => {
		const userContext = await getUserContext(ctx, sessionId);
		const flagConfig = await findFlagByName(ctx, flag);
		if (!flagConfig) return buildMissingFlagDebug(flag, userContext);
		return buildDebugInfo(ctx, flag, flagConfig, userContext);
	}
});

export const createFlag = mutation({
	args: {
		sessionId: v.string(),
		flag: v.string(),
		description: v.optional(v.string()),
		enabled: v.boolean(),
		rolloutPercentage: v.optional(v.number()),
		allowedUserIds: v.optional(v.array(v.id('users'))),
		allowedWorkspaceIds: v.optional(v.array(v.id('workspaces'))),
		allowedDomains: v.optional(v.array(v.string()))
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.sessionId);
		await createFeatureFlag(ctx, args);
	}
});

export const updateFlag = mutation({
	args: {
		sessionId: v.string(),
		flag: v.string(),
		description: v.optional(v.string()),
		enabled: v.boolean(),
		rolloutPercentage: v.optional(v.number()),
		allowedUserIds: v.optional(v.array(v.id('users'))),
		allowedWorkspaceIds: v.optional(v.array(v.id('workspaces'))),
		allowedDomains: v.optional(v.array(v.string()))
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.sessionId);
		await updateFeatureFlag(ctx, args);
	}
});

export const updateFlagState = mutation({
	args: { sessionId: v.string(), flag: v.string(), enabled: v.boolean() },
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.sessionId);
		await updateFlagEnabled(ctx, args.flag, args.enabled);
	}
});

export const updateRollout = mutation({
	args: { sessionId: v.string(), flag: v.string(), percentage: v.number() },
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.sessionId);
		await updateFlagRollout(ctx, args.flag, args.percentage);
	}
});

export const archiveFlag = mutation({
	args: { sessionId: v.string(), flag: v.string() },
	handler: async (ctx, args) => {
		await requireAdmin(ctx, args.sessionId);
		await archiveFeatureFlag(ctx, args.flag);
	}
});
