import type { ActionCtx } from '../../_generated/server';
import { internal } from '../../_generated/api';
import type { ReadwiseHighlight, ReadwisePaginatedResponse } from '../../../src/lib/types/readwise';

export async function initializeProgress(ctx: ActionCtx, personId: Id<'people'>, limit?: number) {
	await ctx.runMutation(internal.features.readwise.mutations.updateSyncProgressState, {
		personId,
		step: 'Fetching highlights...',
		current: 0,
		total: limit || undefined,
		message: 'Connecting to Readwise...'
	});
}

export async function finalizeSync(ctx: ActionCtx, personId: Id<'people'>) {
	const person = await ctx.db.get(personId);
	if (!person || !person.userId) {
		throw new Error('Person not found or missing userId');
	}
	await ctx.runMutation(internal.features.readwise.mutations.updateLastSyncTime, {
		userId: person.userId
	});
	await ctx.runMutation(internal.features.readwise.mutations.updateSyncProgress, {
		personId
	});
}

export async function clearProgress(ctx: ActionCtx, personId: Id<'people'>) {
	try {
		await ctx.runMutation(internal.features.readwise.mutations.updateSyncProgress, {
			personId
		});
	} catch (clearError) {
		console.error(`[syncReadwise] Error clearing progress:`, clearError);
	}
}

export async function maybeUpdateProgress(
	ctx: ActionCtx,
	personId: Id<'people'>,
	totalChecked: number,
	newCount: number,
	limit: number | undefined,
	response: ReadwisePaginatedResponse<ReadwiseHighlight>,
	highlight: ReadwiseHighlight
) {
	const isLastHighlight =
		!response.next || highlight === response.results[response.results.length - 1];
	if (totalChecked % 10 === 0 || isLastHighlight) {
		await ctx.runMutation(internal.features.readwise.mutations.updateSyncProgressState, {
			personId,
			step: 'Checking highlights...',
			current: newCount,
			total: limit || undefined,
			message: limit
				? `Checking highlight ${totalChecked}... Found ${newCount} new of ${limit} needed`
				: `Checking highlight ${totalChecked}...`
		});
	}
}
