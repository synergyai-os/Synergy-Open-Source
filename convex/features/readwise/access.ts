import { internal } from '../../_generated/api';
import type { FunctionReference } from 'convex/server';
import type { ActionCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import type { DateRangePreset, FetchFilters } from './filters';
import { parseFilters } from './filters';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

type FetchArgs = {
	sessionId: string;
	workspaceId?: Id<'workspaces'>;
	dateRange?: DateRangePreset;
	customStartDate?: string;
	customEndDate?: string;
	quantity?: 5 | 10 | 25 | 50 | 100 | 250 | 500 | 1000;
};

export async function fetchReadwiseHighlightsHandler(ctx: ActionCtx, args: FetchArgs) {
	const userId = await getUserId(ctx, args.sessionId);
	const apiKey = await getDecryptedKey(ctx, userId);
	const filters = parseFilters(args);
	return runSync(ctx, { userId, workspaceId: args.workspaceId, apiKey, ...filters });
}

async function getUserId(ctx: ActionCtx, sessionId: string): Promise<Id<'users'>> {
	const { userId } = await ctx.runQuery(
		internal.infrastructure.sessionValidation
			.validateSessionAndGetUserIdInternal as FunctionReference<
			'query',
			'internal',
			{ sessionId: string },
			{ userId: Id<'users'>; session: unknown }
		>,
		{ sessionId }
	);
	return userId;
}

async function getDecryptedKey(ctx: ActionCtx, userId: string): Promise<string> {
	const getKeysQuery = internal.core.workspaces.settings
		.getEncryptedKeysInternal as FunctionReference<
		'query',
		'internal',
		{ userId: string },
		{ claudeApiKey: string | null; readwiseApiKey: string | null } | null
	>;
	const encryptedKeys = await ctx.runQuery(getKeysQuery, { userId });
	if (!encryptedKeys?.readwiseApiKey) {
		throw createError(
			ErrorCodes.EXTERNAL_API_KEY_MISSING,
			'Readwise API key not found. Please add it in Settings first.'
		);
	}

	const decryptAction = internal.infrastructure.crypto.decryptApiKey as FunctionReference<
		'action',
		'internal',
		{ encryptedApiKey: string },
		string
	>;
	return ctx.runAction(decryptAction, { encryptedApiKey: encryptedKeys.readwiseApiKey });
}

async function runSync(
	ctx: ActionCtx,
	args: { userId: string; workspaceId?: Id<'workspaces'>; apiKey: string } & FetchFilters
): Promise<unknown> {
	const syncAction = internal.features.readwise.sync.withReadwiseSync as FunctionReference<
		'action',
		'internal',
		{
			userId: string;
			workspaceId?: Id<'workspaces'>;
			apiKey: string;
			updatedAfter?: string;
			updatedBefore?: string;
			limit?: number;
		},
		unknown
	>;
	return ctx.runAction(syncAction, args);
}
