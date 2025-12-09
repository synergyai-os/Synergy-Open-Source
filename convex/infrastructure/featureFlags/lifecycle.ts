import { createError, ErrorCodes } from '../errors/codes';
import type { MutationCtx } from '../_generated/server';
import type { FeatureFlagDoc } from './types';
import { findFlagByName, requireFlag } from './store';
import { ensureValidRolloutPercentage } from './validation';

type UpsertArgs = {
	flag: string;
	description?: string;
	enabled: boolean;
	rolloutPercentage?: number;
	allowedUserIds?: FeatureFlagDoc['allowedUserIds'];
	allowedWorkspaceIds?: FeatureFlagDoc['allowedWorkspaceIds'];
	allowedDomains?: FeatureFlagDoc['allowedDomains'];
};

export async function createFeatureFlag(ctx: MutationCtx, args: UpsertArgs): Promise<void> {
	const existing = await findFlagByName(ctx, args.flag);
	if (existing) {
		throw createError(ErrorCodes.FEATURE_FLAG_ALREADY_EXISTS, `Flag ${args.flag} already exists`);
	}

	const now = Date.now();
	await ctx.db.insert('featureFlags', {
		flag: args.flag,
		description: args.description,
		enabled: args.enabled,
		rolloutPercentage: args.rolloutPercentage,
		allowedUserIds: args.allowedUserIds,
		allowedWorkspaceIds: args.allowedWorkspaceIds,
		allowedDomains: args.allowedDomains,
		createdAt: now,
		updatedAt: now
	});
}

export async function updateFeatureFlag(ctx: MutationCtx, args: UpsertArgs): Promise<void> {
	const existing = await requireFlag(ctx, args.flag);

	await ctx.db.patch(existing._id, {
		description: args.description,
		enabled: args.enabled,
		rolloutPercentage: args.rolloutPercentage,
		allowedUserIds: args.allowedUserIds,
		allowedWorkspaceIds: args.allowedWorkspaceIds,
		allowedDomains: args.allowedDomains,
		updatedAt: Date.now()
	});
}

export async function updateFlagEnabled(
	ctx: MutationCtx,
	flag: string,
	enabled: boolean
): Promise<void> {
	const existing = await requireFlag(ctx, flag);
	await ctx.db.patch(existing._id, { enabled, updatedAt: Date.now() });
}

export async function updateFlagRollout(
	ctx: MutationCtx,
	flag: string,
	percentage: number
): Promise<void> {
	ensureValidRolloutPercentage(percentage);
	const existing = await requireFlag(ctx, flag);
	await ctx.db.patch(existing._id, { rolloutPercentage: percentage, updatedAt: Date.now() });
}

export async function archiveFeatureFlag(ctx: MutationCtx, flag: string): Promise<void> {
	const existing = await requireFlag(ctx, flag);
	await ctx.db.delete(existing._id);
}
