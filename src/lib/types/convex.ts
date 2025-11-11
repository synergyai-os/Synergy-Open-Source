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
	query<Query extends FunctionReference<'query'>>(query: Query, args?: unknown): Promise<unknown>;
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
	syncReadwiseHighlights: FunctionReference<
		'action',
		'public',
		{
			dateRange?: '7d' | '30d' | '90d' | '180d' | '365d' | 'all';
			customStartDate?: string;
			customEndDate?: string;
			quantity?: 5 | 10 | 25 | 50 | 100 | 250 | 500 | 1000;
		}
	>;
	getSyncProgress: FunctionReference<'query', 'public', {}>;
}

// Sync progress type (return type from getSyncProgress)
export type SyncProgress = {
	step: string;
	current: number;
	total?: number;
	message?: string;
} | null;

// Base inbox item structure (from schema)
type BaseInboxItem = {
	_id: string;
	type: 'readwise_highlight' | 'photo_note' | 'manual_text';
	userId: string;
	processed: boolean;
	processedAt?: number;
	createdAt: number;
};

// Readwise highlight with details (return type from getInboxItemWithDetails for readwise_highlight)
export type ReadwiseHighlightWithDetails = BaseInboxItem & {
	type: 'readwise_highlight';
	highlightId: string;
	highlight: {
		_id: string;
		userId: string;
		sourceId: string;
		text: string;
		location?: number;
		locationType?: string;
		note?: string;
		color?: string;
		externalId: string;
		externalUrl: string;
		highlightedAt?: number;
		updatedAt: number;
		createdAt: number;
		lastSyncedAt?: number;
	} | null;
	source: {
		_id: string;
		userId: string;
		authorId: string;
		title: string;
		category: string;
		sourceType: string;
		externalId: string;
		sourceUrl?: string;
		coverImageUrl?: string;
		highlightsUrl?: string;
		asin?: string;
		documentNote?: string;
		numHighlights: number;
		lastHighlightAt?: number;
		updatedAt: number;
		createdAt: number;
	} | null;
	author: {
		_id: string;
		userId: string;
		name: string;
		displayName: string;
		createdAt: number;
	} | null;
	authors: Array<{
		_id: string;
		userId: string;
		name: string;
		displayName: string;
		createdAt: number;
	}>;
	tags: Array<{
		_id: string;
		userId: string;
		name: string;
		displayName: string;
		color?: string;
		createdAt: number;
	}>;
};

// Photo note with details
export type PhotoNoteWithDetails = BaseInboxItem & {
	type: 'photo_note';
	imageFileId?: string;
};

// Manual text with details
export type ManualTextWithDetails = BaseInboxItem & {
	type: 'manual_text';
	text?: string;
};

// Union type for inbox item with details (return type from getInboxItemWithDetails)
export type InboxItemWithDetails =
	| ReadwiseHighlightWithDetails
	| PhotoNoteWithDetails
	| ManualTextWithDetails;

// Sync result type (return type from syncReadwiseHighlights action)
export interface SyncReadwiseResult {
	success: boolean;
	sourcesCount: number;
	highlightsCount: number;
	newCount: number;
	skippedCount: number;
	errorsCount: number;
}
