/**
 * Test Utilities for Mocking Convex in Composable Tests
 *
 * Provides mocks for useConvexClient() and useQuery() from convex-svelte
 * Used in browser environment tests (.svelte.test.ts files)
 */

import { vi } from 'vitest';
import type { ConvexClient } from '$lib/types/convex';
import type {
	OrganizationSummary,
	OrganizationInvite,
	TeamInvite,
	TeamSummary
} from '$lib/modules/core/organizations/composables/useOrganizations.svelte';

/**
 * Mock Convex client with configurable mutation responses
 */
export function createMockConvexClient(
	mutations: Record<string, (args: unknown) => Promise<unknown>> = {}
): ConvexClient {
	return {
		query: vi.fn(),
		mutation: vi.fn(async (fnRef: unknown, args: unknown) => {
			// Extract function name from reference (e.g., "organizations:createOrganization")
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
 * Mock organizations data for tests
 */
export function createMockOrganizations(): OrganizationSummary[] {
	return [
		{
			organizationId: 'org-1',
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
			organizationId: 'org-2',
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
 * Mock organization invites data for tests
 */
export function createMockOrganizationInvites(): OrganizationInvite[] {
	return [
		{
			inviteId: 'invite-1',
			organizationId: 'org-3',
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
 * Mock team invites data for tests
 */
export function createMockTeamInvites(): TeamInvite[] {
	return [
		{
			inviteId: 'team-invite-1',
			teamId: 'team-1',
			teamName: 'Test Team',
			organizationId: 'org-1',
			organizationName: 'Test Organization 1',
			role: 'member',
			invitedBy: 'user-1',
			invitedByName: 'Test User',
			code: 'TEAM-INVITE-CODE-1',
			createdAt: Date.now()
		}
	];
}

/**
 * Mock teams data for tests
 */
export function createMockTeams(): TeamSummary[] {
	return [
		{
			teamId: 'team-1',
			organizationId: 'org-1',
			name: 'Test Team 1',
			slug: 'test-team-1',
			memberCount: 3,
			role: 'admin',
			joinedAt: Date.now()
		},
		{
			teamId: 'team-2',
			organizationId: 'org-1',
			name: 'Test Team 2',
			slug: 'test-team-2',
			memberCount: 2,
			role: 'member',
			joinedAt: Date.now()
		}
	];
}

/**
 * Global mock state for convex-svelte hooks
 * Used by test files to configure mocks before importing composables
 */
let globalMockClient: ConvexClient | null = null;
let globalQueryResults: {
	organizations?: MockQueryResult<OrganizationSummary[]>;
	organizationInvites?: MockQueryResult<OrganizationInvite[]>;
	teamInvites?: MockQueryResult<TeamInvite[]>;
	teams?: MockQueryResult<TeamSummary[]>;
} = {};

/**
 * Setup mocks for convex-svelte hooks
 * Note: This sets global state that will be used by mocked modules
 */
export function setupConvexMocks(
	mockClient: ConvexClient,
	queryResults: {
		organizations?: MockQueryResult<OrganizationSummary[]>;
		organizationInvites?: MockQueryResult<OrganizationInvite[]>;
		teamInvites?: MockQueryResult<TeamInvite[]>;
		teams?: MockQueryResult<TeamSummary[]>;
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
		return globalQueryResults.organizations ?? createMockQueryResult(createMockOrganizations());
	}
	if (queryName.includes('listOrganizationInvites')) {
		return (
			globalQueryResults.organizationInvites ??
			createMockQueryResult(createMockOrganizationInvites())
		);
	}
	if (queryName.includes('listTeamInvites')) {
		return globalQueryResults.teamInvites ?? createMockQueryResult(createMockTeamInvites());
	}
	if (queryName.includes('listTeams')) {
		return globalQueryResults.teams ?? createMockQueryResult(createMockTeams());
	}

	// Default: return loading state
	return createMockQueryResult(undefined, true);
}
