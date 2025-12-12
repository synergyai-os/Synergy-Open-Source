import type { ActionCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { parseIncrementalDate, requireWorkspaceId } from './filters';
import { collectHighlights, processHighlights } from './highlights';
import { clearProgress, finalizeSync, initializeProgress } from './progress';
import { ensureSources } from './sources';

type SyncArgs = {
	userId: Id<'users'>;
	workspaceId?: Id<'workspaces'>;
	apiKey: string;
	updatedAfter?: string;
	updatedBefore?: string;
	limit?: number;
};

export async function withReadwiseSyncHandler(ctx: ActionCtx, args: SyncArgs) {
	const { userId, apiKey, updatedAfter: dateFilter, limit } = args;
	const workspaceId = args.workspaceId ?? (await requireWorkspaceId(ctx, userId));

	try {
		const incrementalAfter = await parseIncrementalDate(
			ctx,
			userId,
			dateFilter,
			limit,
			args.updatedBefore
		);
		const highlightsFilter = limit ? undefined : incrementalAfter;
		await initializeProgress(ctx, userId, limit);

		const highlightsState = await collectHighlights(ctx, {
			userId,
			workspaceId,
			apiKey,
			limit,
			updatedAfter: highlightsFilter,
			updatedBefore: limit ? undefined : args.updatedBefore
		});

		const sourceIdMap = await ensureSources(ctx, {
			userId,
			apiKey,
			workspaceId,
			updatedAfter: limit ? undefined : incrementalAfter,
			updatedBefore: limit ? undefined : args.updatedBefore,
			neededBookIds: highlightsState.neededBookIds
		});

		const processed = await processHighlights(ctx, {
			userId,
			workspaceId,
			sourceIdMap,
			highlightsToProcess: highlightsState.highlightsToProcess
		});

		await finalizeSync(ctx, userId);

		return {
			success: true,
			sourcesCount: highlightsState.neededBookIds.size,
			highlightsCount: processed.processedCount,
			newCount: highlightsState.newCount,
			skippedCount: highlightsState.skippedCount,
			errorsCount: processed.errorCount
		};
	} catch (error) {
		await clearProgress(ctx, userId);
		throw error;
	}
}
