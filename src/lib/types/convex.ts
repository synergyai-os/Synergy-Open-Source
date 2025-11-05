/**
 * Shared TypeScript types for Convex client and API functions
 * Used across composables to ensure type safety
 */

import type { FunctionReference } from 'convex/server';

// Convex client type - useConvexClient() returns this
// Note: convex-svelte doesn't export a ConvexClient type, so we define a minimal interface
// that matches the actual client's methods. This provides type safety without being overly strict.
// The client methods accept FunctionReference types and return Promises.
export interface ConvexClient {
	query<Query extends FunctionReference<'query'>>(
		query: Query,
		args?: unknown
	): Promise<unknown>;
	action<Action extends FunctionReference<'action'>>(
		action: Action,
		args?: unknown
	): Promise<unknown>;
	mutation<Mutation extends FunctionReference<'mutation'>>(
		mutation: Mutation,
		args?: unknown
	): Promise<unknown>;
}

// Inbox API functions interface
export interface InboxApi {
	getInboxItemWithDetails: FunctionReference<'query', 'public', { inboxItemId: string }>;
	syncReadwiseHighlights: FunctionReference<'action', 'public', {
		dateRange?: '7d' | '30d' | '90d' | '180d' | '365d' | 'all';
		customStartDate?: string;
		customEndDate?: string;
		quantity?: 5 | 10 | 25 | 50 | 100 | 250 | 500 | 1000;
	}>;
	getSyncProgress: FunctionReference<'query', 'public', {}>;
}

// Sync progress type (return type from getSyncProgress)
export type SyncProgress = {
	step: string;
	current: number;
	total?: number;
	message?: string;
} | null;

// Inbox item type (return type from getInboxItemWithDetails)
// Using any for now since the actual type is complex and depends on item type
// TODO: Create proper union type based on item.type
export type InboxItemWithDetails = any;

// Sync result type (return type from syncReadwiseHighlights action)
export interface SyncReadwiseResult {
	success: boolean;
	sourcesCount: number;
	highlightsCount: number;
	newCount: number;
	skippedCount: number;
	errorsCount: number;
}

