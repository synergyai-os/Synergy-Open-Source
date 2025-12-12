import { createError, ErrorCodes } from '../errors/codes';
import type { Ctx, FeatureFlagDoc } from './types';

export async function findFlagByName(ctx: Ctx, flag: string): Promise<FeatureFlagDoc | null> {
	return ctx.db
		.query('featureFlags')
		.withIndex('by_flag', (q) => q.eq('flag', flag))
		.first();
}

export async function requireFlag(ctx: Ctx, flag: string): Promise<FeatureFlagDoc> {
	const existing = await findFlagByName(ctx, flag);
	if (!existing) {
		throw createError(ErrorCodes.FEATURE_FLAG_NOT_FOUND, `Flag ${flag} not found`);
	}
	return existing;
}

export async function insertFlag(ctx: Ctx, args: FeatureFlagDoc): Promise<void> {
	await ctx.db.insert('featureFlags', args);
}
