import { internal } from '../../_generated/api';
import type { ActionCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import type { ReadwisePaginatedResponse, ReadwiseSource } from '../../../src/lib/types/readwise';
import {
	createAuthorIfMissing,
	createSourceIfMissing,
	createTagIfMissing,
	findSourceIdByBookId,
	linkAuthorToSource,
	linkTagToSource
} from './persistence';
import { fetchBooksPage } from './fetch';
import { parseAuthorNames } from './transform';
import { delay } from './jobs';

type EnsureSourcesArgs = {
	userId: string;
	apiKey: string;
	workspaceId: Id<'workspaces'>;
	updatedAfter?: string;
	updatedBefore?: string;
	neededBookIds: Set<number>;
};

export async function ensureSources(
	ctx: ActionCtx,
	args: EnsureSourcesArgs
): Promise<Map<number, string>> {
	const { userId, apiKey, workspaceId, updatedAfter, updatedBefore, neededBookIds } = args;
	const sourceIdMap = new Map<number, string>();

	if (neededBookIds.size === 0) return sourceIdMap;

	await ctx.runMutation(internal.features.readwise.mutations.updateSyncProgressState, {
		userId,
		step: 'Fetching sources...',
		current: 0,
		total: neededBookIds.size,
		message: `Fetching ${neededBookIds.size} sources...`
	});

	const allSources = await fetchAllBooks(ctx, apiKey, updatedAfter, updatedBefore);
	const neededSources = allSources.filter((source) => neededBookIds.has(source.id));

	await ctx.runMutation(internal.features.readwise.mutations.updateSyncProgressState, {
		userId,
		step: 'Processing sources...',
		current: 0,
		total: neededSources.length,
		message: `Processing ${neededSources.length} sources...`
	});

	let sourceIndex = 0;
	for (const source of neededSources) {
		sourceIndex++;
		if (sourceIndex % 10 === 0 || sourceIndex === neededSources.length) {
			await ctx.runMutation(internal.features.readwise.mutations.updateSyncProgressState, {
				userId,
				step: 'Processing sources...',
				current: sourceIndex,
				total: neededSources.length,
				message: `Processing source ${sourceIndex} of ${neededSources.length}...`
			});
		}

		const existingSourceId = await findSourceIdByBookId(ctx, userId, String(source.id));

		if (existingSourceId) {
			sourceIdMap.set(source.id, existingSourceId);
			continue;
		}

		const authorNames = parseAuthorNames(source.author);
		if (authorNames.length === 0) {
			console.warn(`[syncReadwise] Source ${source.id} has no author, skipping...`);
			continue;
		}

		const primaryAuthorId = await createAuthorIfMissing(ctx, {
			userId,
			authorName: authorNames[0]
		});

		const sourceId = await createSourceIfMissing(ctx, {
			userId,
			primaryAuthorId,
			readwiseSource: source
		});

		sourceIdMap.set(source.id, sourceId);

		for (let i = 1; i < authorNames.length; i++) {
			const authorId = await createAuthorIfMissing(ctx, {
				userId,
				authorName: authorNames[i]
			});

			await linkAuthorToSource(ctx, {
				sourceId,
				authorId
			});
		}

		for (const tag of source.tags || []) {
			const tagId = await createTagIfMissing(ctx, {
				userId,
				workspaceId,
				tagName: tag.name,
				externalId: tag.id
			});

			await linkTagToSource(ctx, {
				sourceId,
				tagId
			});
		}
	}

	return sourceIdMap;
}

async function fetchAllBooks(
	ctx: ActionCtx,
	apiKey: string,
	updatedAfter?: string,
	updatedBefore?: string
): Promise<ReadwiseSource[]> {
	const allBooks: ReadwiseSource[] = [];
	let pageCursor: string | undefined;
	let pageCount = 0;

	while (true) {
		pageCount++;
		console.log(`[syncReadwise] Fetching books page ${pageCount}...`);

		const response: ReadwisePaginatedResponse<ReadwiseSource> = await fetchBooksPage(ctx, {
			apiKey,
			pageCursor,
			updatedAfter,
			updatedBefore
		});

		allBooks.push(...response.results);
		pageCursor = response.next || undefined;

		if (!pageCursor || response.results.length === 0) break;
		if (pageCursor) await delay();
	}

	return allBooks;
}
