import { internal } from '../_generated/api';
import type { ActionCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';
import type { ReadwiseHighlight } from '../../src/lib/types/readwise';
import { maybeUpdateProgress } from './progress';
import { fetchHighlightsPage } from './fetch';
import { reorderHighlightsByUpdated } from './transform';
import {
	createHighlightIfMissing,
	createInboxItemIfMissing,
	findHighlightIdByExternalId,
	findSourceIdByBookId,
	hasHighlight,
	hasInboxItem
} from './persistence';
import { delay } from './jobs';

type CollectArgs = {
	userId: string;
	apiKey: string;
	updatedAfter?: string;
	updatedBefore?: string;
	limit?: number;
};

export type HighlightCollection = {
	processedCount: number;
	newCount: number;
	skippedCount: number;
	errorCount: number;
	neededBookIds: Set<number>;
	highlightsToProcess: ReadwiseHighlight[];
};

export async function collectHighlights(
	ctx: ActionCtx,
	args: CollectArgs
): Promise<HighlightCollection> {
	const { userId, apiKey, updatedAfter, updatedBefore, limit } = args;
	let newCount = 0;
	let skippedCount = 0;
	let errorCount = 0;
	let pageCursor: string | undefined;
	let totalChecked = 0;
	const neededBookIds = new Set<number>();
	const highlightsToProcess: ReadwiseHighlight[] = [];

	while (true) {
		if (limit && newCount >= limit) break;
		if (limit && newCount < limit) {
			await ctx.runMutation(internal.syncReadwiseMutations.updateSyncProgressState, {
				userId,
				step: 'Fetching highlights...',
				current: newCount,
				total: limit,
				message: `Checking highlights... Found ${newCount} new of ${limit} needed`
			});
		}

		const response = await fetchHighlightsPage(ctx, {
			apiKey,
			pageCursor,
			updatedAfter,
			updatedBefore
		});

		if (!response.results || response.results.length === 0) break;

		const sortedHighlights = reorderHighlightsByUpdated(response.results);

		for (const highlight of sortedHighlights) {
			totalChecked++;
			await maybeUpdateProgress(ctx, userId, totalChecked, newCount, limit, response, highlight);

			try {
				const highlightExists = await hasHighlight(ctx, userId, String(highlight.id));

				let needsImport = !highlightExists;
				if (limit && highlightExists) {
					const existingHighlightId = await findHighlightIdByExternalId(
						ctx,
						userId,
						String(highlight.id)
					);

					if (existingHighlightId) {
						const inboxItemExists = await hasInboxItem(ctx, userId, existingHighlightId);
						needsImport = !inboxItemExists;
					}
				}

				if (!needsImport) {
					skippedCount++;
					continue;
				}

				highlightsToProcess.push(highlight);
				neededBookIds.add(highlight.book_id);
				newCount++;

				if (limit && newCount >= limit) break;
			} catch (error) {
				console.error(`[syncReadwise] Error checking highlight ${highlight.id}:`, error);
				errorCount++;
			}
		}

		if (limit && newCount >= limit) break;
		if (!response.next) break;
		pageCursor = response.next;
		if (pageCursor) await delay();
	}

	return {
		processedCount: totalChecked,
		newCount,
		skippedCount,
		errorCount,
		neededBookIds,
		highlightsToProcess
	};
}

export async function processHighlights(
	ctx: ActionCtx,
	args: {
		userId: string;
		sourceIdMap: Map<number, string>;
		highlightsToProcess: ReadwiseHighlight[];
	}
) {
	const { userId, sourceIdMap, highlightsToProcess } = args;
	let processedCount = 0;
	let errorCount = 0;

	await ctx.runMutation(internal.syncReadwiseMutations.updateSyncProgressState, {
		userId,
		step: 'Importing highlights...',
		current: 0,
		total: highlightsToProcess.length,
		message: `Importing ${highlightsToProcess.length} highlights...`
	});

	let highlightIndex = 0;
	for (const highlight of highlightsToProcess) {
		highlightIndex++;
		if (highlightIndex % 10 === 0 || highlightIndex === highlightsToProcess.length) {
			await ctx.runMutation(internal.syncReadwiseMutations.updateSyncProgressState, {
				userId,
				step: 'Importing highlights...',
				current: highlightIndex,
				total: highlightsToProcess.length,
				message: `Importing highlight ${highlightIndex} of ${highlightsToProcess.length}...`
			});
		}

		try {
			let sourceId: string | null = sourceIdMap.get(highlight.book_id) || null;
			if (!sourceId) {
				sourceId = await findSourceIdByBookId(ctx, userId, String(highlight.book_id));
			}

			if (!sourceId) {
				console.warn(
					`[syncReadwise] Highlight ${highlight.id} references unknown source ${highlight.book_id}, skipping...`
				);
				errorCount++;
				continue;
			}

			const highlightId = await createHighlightIfMissing(ctx, {
				userId,
				sourceId: sourceId as Id<'sources'>,
				readwiseHighlight: highlight
			});

			await createInboxItemIfMissing(ctx, {
				userId,
				highlightId
			});

			processedCount++;
		} catch (error) {
			console.error(`[syncReadwise] Error processing highlight ${highlight.id}:`, error);
			errorCount++;
		}
	}

	return { processedCount, errorCount };
}
