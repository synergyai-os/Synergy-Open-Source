import type { ActionCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { internal } from '../../_generated/api';
import type { FunctionReference } from 'convex/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

export type FetchFilters = {
	updatedAfter?: string;
	updatedBefore?: string;
	limit?: number;
};

export type DateRangePreset = '7d' | '30d' | '90d' | '180d' | '365d' | 'all';

export function parseFilters(args: {
	customStartDate?: string;
	customEndDate?: string;
	dateRange?: DateRangePreset;
	quantity?: number;
}): FetchFilters {
	if (args.customStartDate && args.customEndDate) {
		const endDate = new Date(args.customEndDate);
		endDate.setHours(23, 59, 59, 999);
		return {
			updatedAfter: new Date(args.customStartDate).toISOString(),
			updatedBefore: endDate.toISOString()
		};
	}
	if (args.quantity) return { limit: args.quantity };
	if (args.dateRange && args.dateRange !== 'all') {
		const dayMap: Record<string, number> = {
			'7d': 7,
			'30d': 30,
			'90d': 90,
			'180d': 180,
			'365d': 365
		};
		const days = dayMap[args.dateRange];
		if (days) {
			const date = new Date();
			date.setDate(date.getDate() - days);
			return { updatedAfter: date.toISOString() };
		}
	}
	return {};
}

export async function parseIncrementalDate(
	ctx: ActionCtx,
	userId: string,
	dateFilter: string | undefined,
	limit?: number,
	updatedBefore?: string
): Promise<string | undefined> {
	if (dateFilter || limit || updatedBefore) return dateFilter;

	const getUserSettingsQuery = internal.settings.getUserSettingsForSync as FunctionReference<
		'query',
		'internal',
		{ userId: string },
		{ lastReadwiseSyncAt?: number } | null
	>;
	const userSettings = await ctx.runQuery(getUserSettingsQuery, { userId });
	const lastSyncAt = userSettings?.lastReadwiseSyncAt;
	return lastSyncAt ? new Date(lastSyncAt).toISOString() : undefined;
}

export async function requireWorkspaceId(
	ctx: ActionCtx,
	userId: Id<'users'>
): Promise<Id<'workspaces'>> {
	const getUserOrgIdsQuery = internal.infrastructure.access.permissions
		.getUserOrganizationIdsQuery as FunctionReference<
		'query',
		'internal',
		{ userId: Id<'users'> },
		string[]
	>;
	const workspaceIds = await ctx.runQuery(getUserOrgIdsQuery, { userId });
	if (workspaceIds.length === 0) {
		throw createError(
			ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED,
			'User must belong to at least one workspace'
		);
	}
	return workspaceIds[0] as Id<'workspaces'>;
}
