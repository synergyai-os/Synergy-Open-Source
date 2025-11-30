/**
 * Test Utilities for Mocking Convex in Composable Tests
 *
 * Provides mocks for useConvexClient() and useQuery() from convex-svelte
 * Used in browser environment tests (.svelte.test.ts files)
 */

import { vi } from 'vitest';
import type { ConvexClient } from '$lib/types/convex';
import type {
	WorkspaceSummary,
	WorkspaceInvite
} from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';

/**
 * Mock Convex client with configurable mutation responses
 */
export function createMockConvexClient(
	mutations: Record<string, (args: unknown) => Promise<unknown>> = {}
): ConvexClient {
	return {
		query: vi.fn(),
		mutation: vi.fn(async (fnRef: unknown, args: unknown) => {
			// Extract function name from reference (e.g., "workspaces:createWorkspace")
			let fnName = '';
			try {
				fnName = typeof fnRef === 'string' ? fnRef : String(fnRef);
			} catch {
				// If String() fails, try to get a string representation
				fnName = '[unknown mutation]';
			}

			// Check for catch-all handler first
			if (mutations['*']) {
				return mutations['*'](args);
			}

			// Try exact match
			if (mutations[fnName]) {
				return mutations[fnName](args);
			}

			// Try partial match (function refs can have different string representations)
			for (const [key, handler] of Object.entries(mutations)) {
				if (key === '*') continue; // Skip catch-all, already checked
				if (fnName.includes(key) || key.includes(fnName.split(':').pop() || '')) {
					return handler(args);
				}
			}

			return Promise.resolve({});
		}),
		action: vi.fn()
	} as ConvexClient;
}

/**
 * Mock useQuery return value structure
 */
export interface MockQueryResult<T> {
	data: T | undefined;
	isLoading: boolean;
	error: Error | null;
}

/**
 * Create a mock query result
 */
export function createMockQueryResult<T>(
	data: T | undefined = undefined,
	isLoading = false,
	error: Error | null = null
): MockQueryResult<T> {
	return {
		data,
		isLoading,
		error
	};
}

/**
 * Mock workspaces data for tests
 */
export function createMockOrganizations(): WorkspaceSummary[] {
	return [
		{
			workspaceId: 'org-1',
			name: 'Test Organization 1',
			initials: 'TO1',
			slug: 'test-org-1',
			plan: 'free',
			role: 'owner',
			joinedAt: Date.now(),
			memberCount: 1,
			teamCount: 0
		},
		{
			workspaceId: 'org-2',
			name: 'Test Organization 2',
			initials: 'TO2',
			slug: 'test-org-2',
			plan: 'free',
			role: 'member',
			joinedAt: Date.now(),
			memberCount: 2,
			teamCount: 1
		}
	];
}

/**
 * Mock workspace invites data for tests
 */
export function createMockOrganizationInvites(): WorkspaceInvite[] {
	return [
		{
			inviteId: 'invite-1',
			workspaceId: 'org-3',
			organizationName: 'Test Organization 3',
			role: 'member',
			invitedBy: 'user-1',
			invitedByName: 'Test User',
			code: 'INVITE-CODE-1',
			createdAt: Date.now()
		}
	];
}

/**
 * Mock inbox items data for tests
 */
export function createMockInboxItems(): Array<{
	_id: string;
	type: 'readwise_highlight' | 'photo_note' | 'manual_text';
	userId: string;
	processed: boolean;
	createdAt: number;
	title: string;
	snippet: string;
	tags: string[];
}> {
	return [
		{
			_id: 'item-1',
			type: 'readwise_highlight',
			userId: 'user-1',
			processed: false,
			createdAt: Date.now() - 3600000,
			title: 'Test Highlight 1',
			snippet: 'This is a test highlight snippet',
			tags: ['test', 'highlight']
		},
		{
			_id: 'item-2',
			type: 'photo_note',
			userId: 'user-1',
			processed: false,
			createdAt: Date.now() - 7200000,
			title: 'Test Photo Note',
			snippet: 'This is a test photo note',
			tags: ['photo']
		},
		{
			_id: 'item-3',
			type: 'manual_text',
			userId: 'user-1',
			processed: false,
			createdAt: Date.now() - 10800000,
			title: 'Test Manual Text',
			snippet: 'This is a test manual text entry',
			tags: ['manual']
		}
	];
}

/**
 * Mock inbox item with details for tests
 */
export function createMockInboxItemWithDetails() {
	return {
		_id: 'item-1',
		type: 'readwise_highlight' as const,
		userId: 'user-1',
		processed: false,
		createdAt: Date.now() - 3600000,
		title: 'Test Highlight 1',
		snippet: 'This is a test highlight snippet',
		highlightId: 'highlight-1',
		highlight: {
			_id: 'highlight-1',
			userId: 'user-1',
			sourceId: 'source-1',
			text: 'This is the highlight text',
			externalId: 'rw-123',
			externalUrl: 'https://readwise.io/highlight/123',
			highlightedAt: Date.now() - 3600000,
			updatedAt: Date.now() - 3600000,
			createdAt: Date.now() - 3600000
		},
		source: {
			_id: 'source-1',
			userId: 'user-1',
			authorId: 'author-1',
			title: 'Test Book',
			category: 'books',
			sourceType: 'book',
			externalId: 'rw-book-123',
			numHighlights: 10,
			updatedAt: Date.now() - 3600000,
			createdAt: Date.now() - 3600000
		},
		author: {
			_id: 'author-1',
			userId: 'user-1',
			name: 'Test Author',
			createdAt: Date.now() - 3600000
		},
		tags: [
			{
				_id: 'tag-1',
				userId: 'user-1',
				name: 'test',
				createdAt: Date.now() - 3600000
			}
		]
	};
}

/**
 * Mock sync progress for tests
 */
export function createMockSyncProgress() {
	return {
		step: 'Importing highlights...',
		current: 5,
		total: 10,
		message: 'Importing highlight 5 of 10...'
	};
}

/**
 * Global mock state for convex-svelte hooks
 * Used by test files to configure mocks before importing composables
 */
let globalMockClient: ConvexClient | null = null;
let globalQueryResults: {
	workspaces?: MockQueryResult<WorkspaceSummary[]>;
	workspaceInvites?: MockQueryResult<WorkspaceInvite[]>;
	inboxItems?: MockQueryResult<unknown[]>;
	inboxItemWithDetails?: MockQueryResult<unknown>;
	syncProgress?: MockQueryResult<unknown>;
} = {};

/**
 * Setup mocks for convex-svelte hooks
 * Note: This sets global state that will be used by mocked modules
 */
export function setupConvexMocks(
	mockClient: ConvexClient,
	queryResults: {
		workspaces?: MockQueryResult<WorkspaceSummary[]>;
		workspaceInvites?: MockQueryResult<WorkspaceInvite[]>;
		inboxItems?: MockQueryResult<unknown[]>;
		inboxItemWithDetails?: MockQueryResult<unknown>;
		syncProgress?: MockQueryResult<unknown>;
	} = {}
) {
	globalMockClient = mockClient;
	globalQueryResults = queryResults;

	// Also set on globalThis for hoisted mocks
	(globalThis as { __vitestConvexMockClient?: ConvexClient }).__vitestConvexMockClient = mockClient;
	(globalThis as { __vitestConvexQueryResults?: typeof queryResults }).__vitestConvexQueryResults =
		queryResults;
}

/**
 * Get current mock client (for use in mocked modules)
 * Exported for use in setupMocks.svelte.ts
 */
export function __getMockClient(): ConvexClient | null {
	return globalMockClient;
}

/**
 * Get mock query result for a query function
 * Exported for use in setupMocks.svelte.ts
 */
export function __getMockQueryResult(queryFn: unknown): MockQueryResult<unknown> {
	const queryName = String(queryFn);

	if (queryName.includes('listOrganizations')) {
		return globalQueryResults.workspaces ?? createMockQueryResult(createMockOrganizations());
	}
	if (queryName.includes('listOrganizationInvites')) {
		return (
			globalQueryResults.workspaceInvites ?? createMockQueryResult(createMockOrganizationInvites())
		);
	}
	if (queryName.includes('listInboxItems')) {
		return globalQueryResults.inboxItems ?? createMockQueryResult(createMockInboxItems());
	}
	if (queryName.includes('getInboxItemWithDetails')) {
		return (
			globalQueryResults.inboxItemWithDetails ??
			createMockQueryResult(createMockInboxItemWithDetails())
		);
	}
	if (queryName.includes('getSyncProgress')) {
		return globalQueryResults.syncProgress ?? createMockQueryResult(createMockSyncProgress());
	}

	// Default: return loading state
	return createMockQueryResult(undefined, true);
}
