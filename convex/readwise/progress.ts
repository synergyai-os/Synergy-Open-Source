import type { ActionCtx } from '../_generated/server';
import { internal } from '../_generated/api';
import type { ReadwiseHighlight, ReadwisePaginatedResponse } from '../../src/lib/types/readwise';

export async function initializeProgress(ctx: ActionCtx, userId: string, limit?: number) {
	await ctx.runMutation(internal.syncReadwiseMutations.updateSyncProgressState, {
		userId,
		step: 'Fetching highlights...',
		current: 0,
		total: limit || undefined,
		message: 'Connecting to Readwise...'
	});
}

export async function finalizeSync(ctx: ActionCtx, userId: string) {
	await ctx.runMutation(internal.syncReadwiseMutations.updateLastSyncTime, {
		userId
	});
	await ctx.runMutation(internal.syncReadwiseMutations.updateSyncProgress, {
		userId
	});
}

export async function clearProgress(ctx: ActionCtx, userId: string) {
	try {
		await ctx.runMutation(internal.syncReadwiseMutations.updateSyncProgress, {
			userId
		});
	} catch (clearError) {
		console.error(`[syncReadwise] Error clearing progress:`, clearError);
	}
}

export async function maybeUpdateProgress(
	ctx: ActionCtx,
	userId: string,
	totalChecked: number,
	newCount: number,
	limit: number | undefined,
	response: ReadwisePaginatedResponse<ReadwiseHighlight>,
	highlight: ReadwiseHighlight
) {
	const isLastHighlight =
		!response.next || highlight === response.results[response.results.length - 1];
	if (totalChecked % 10 === 0 || isLastHighlight) {
		await ctx.runMutation(internal.syncReadwiseMutations.updateSyncProgressState, {
			userId,
			step: 'Checking highlights...',
			current: newCount,
			total: limit || undefined,
			message: limit
				? `Checking highlight ${totalChecked}... Found ${newCount} new of ${limit} needed`
				: `Checking highlight ${totalChecked}...`
		});
	}
}
