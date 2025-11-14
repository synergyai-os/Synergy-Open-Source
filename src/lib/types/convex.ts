/**
 * Shared TypeScript types for Convex client and API functions
 * Used across composables to ensure type safety
 */

import type { FunctionReference } from 'convex/server';

// Convex client type - useConvexClient() returns this
// Note: convex-svelte doesn't export a ConvexClient type, so we define a minimal interface
// that matches the actual client's methods. This provides type safety without being overly strict.
// The client methods accept FunctionReference types and return Promises.
// ConvexHttpClient from 'convex/browser' uses string paths, so we support both.
export interface ConvexClient {
	query<Query extends FunctionReference<'query'>>(query: Query, args?: unknown): Promise<unknown>;
	query(path: string, args?: unknown): Promise<unknown>; // For ConvexHttpClient compatibility
	action<Action extends FunctionReference<'action'>>(
		action: Action,
		args?: unknown
	): Promise<unknown>;
	action(path: string, args?: unknown): Promise<unknown>; // For ConvexHttpClient compatibility
	mutation<Mutation extends FunctionReference<'mutation'>>(
		mutation: Mutation,
		args?: unknown
	): Promise<unknown>;
	mutation(path: string, args?: unknown): Promise<unknown>; // For ConvexHttpClient compatibility
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
	getSyncProgress: FunctionReference<'query', 'public', { sessionId: string }>;
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
	type: 'readwise_highlight' | 'photo_note' | 'manual_text' | 'note';
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

// Photo note with details (matches schema)
export type PhotoNoteWithDetails = BaseInboxItem & {
	type: 'photo_note';
	imageFileId: string; // Required in schema
	transcribedText?: string; // Optional OCR result
	source?: string; // Optional source
	ocrStatus?: 'pending' | 'completed' | 'failed'; // Optional OCR status
};

// Manual text with details (matches schema)
export type ManualTextWithDetails = BaseInboxItem & {
	type: 'manual_text';
	text: string; // Required in schema
	bookTitle?: string; // Optional manual attribution
	pageNumber?: number; // Optional page number
};

// Note with details
export type NoteWithDetails = BaseInboxItem & {
	type: 'note';
	title?: string;
	content: string; // ProseMirror JSON
	contentMarkdown?: string;
	isAIGenerated?: boolean;
	aiGeneratedAt?: number;
	blogCategory?: string;
	slug?: string;
	updatedAt?: number;
};

// Union type for inbox item with details (return type from getInboxItemWithDetails)
export type InboxItemWithDetails =
	| ReadwiseHighlightWithDetails
	| PhotoNoteWithDetails
	| ManualTextWithDetails
	| NoteWithDetails;

// Sync result type (return type from syncReadwiseHighlights action)
export interface SyncReadwiseResult {
	success: boolean;
	sourcesCount: number;
	highlightsCount: number;
	newCount: number;
	skippedCount: number;
	errorsCount: number;
}
