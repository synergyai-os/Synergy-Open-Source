import { internal } from '../_generated/api';
import type { ActionCtx } from '../_generated/server';
import type {
	ReadwiseHighlight,
	ReadwisePaginatedResponse,
	ReadwiseSource
} from '../../src/lib/types/readwise';
import { withRetry } from './jobs';

type HighlightFetchArgs = {
	apiKey: string;
	pageCursor?: string;
	updatedAfter?: string;
	updatedBefore?: string;
};

type BookFetchArgs = {
	apiKey: string;
	pageCursor?: string;
	updatedAfter?: string;
	updatedBefore?: string;
};

export async function fetchHighlightsPage(
	ctx: ActionCtx,
	args: HighlightFetchArgs
): Promise<ReadwisePaginatedResponse<ReadwiseHighlight>> {
	return withRetry(() =>
		ctx.runAction(internal.readwiseApi.fetchHighlights, {
			apiKey: args.apiKey,
			pageCursor: args.pageCursor,
			updatedAfter: args.updatedAfter,
			updatedBefore: args.updatedBefore
		})
	);
}

export async function fetchBooksPage(
	ctx: ActionCtx,
	args: BookFetchArgs
): Promise<ReadwisePaginatedResponse<ReadwiseSource>> {
	return withRetry(() =>
		ctx.runAction(internal.readwiseApi.fetchBooks, {
			apiKey: args.apiKey,
			pageCursor: args.pageCursor,
			updatedAfter: args.updatedAfter,
			updatedBefore: args.updatedBefore
		})
	);
}
