import type { Id } from '$lib/convex';

/**
 * Consolidated auth types for infrastructure/auth module
 *
 * Types extracted from:
 * - sessionStore.ts: AuthFlowMode, LoginStateMetadata, SessionSnapshot, SessionRecord
 * - workos.ts: WorkOSAuthResponse, WorkOSRefreshResponse, WorkOSPasswordAuthResponse
 * - useAuthSession.svelte.ts: LinkedAccountInfo, UseAuthSessionReturn
 */

// ============================================================================
// Session Store Types
// ============================================================================

export type AuthFlowMode = 'sign-in' | 'sign-up';

export interface LoginStateMetadata {
	codeVerifier: string;
	redirectTo?: string | null;
	flowMode: AuthFlowMode;
	linkAccount: boolean;
	primaryUserId?: Id<'users'> | null;
}

export interface SessionSnapshot {
	userId: Id<'users'>;
	workosId: string;
	email: string;
	firstName?: string;
	lastName?: string;
	name?: string;
	activeWorkspace?: {
		type: 'personal' | 'organization';
		id?: string | null;
		name?: string;
	};
}

export interface SessionRecord {
	sessionId: string;
	convexUserId: Id<'users'>;
	workosUserId: string;
	workosSessionId: string;
	accessToken: string;
	refreshToken: string;
	csrfTokenHash: string;
	expiresAt: number;
	createdAt: number;
	lastRefreshedAt?: number;
	lastSeenAt?: number;
	ipAddress?: string;
	userAgent?: string;
	userSnapshot: SessionSnapshot;
}

// ============================================================================
// WorkOS Types
// ============================================================================

export interface WorkOSAuthResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	user: WorkOSUser;
	session: WorkOSSession;
}

export interface WorkOSRefreshResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	session: WorkOSSession;
}

export interface WorkOSPasswordAuthResponse {
	user: WorkOSUser;
	access_token: string;
	refresh_token: string;
	expires_in?: number;
}

interface WorkOSUser {
	id: string;
	email: string;
	first_name?: string;
	last_name?: string;
	email_verified?: boolean;
}

interface WorkOSSession {
	id: string;
	expires_at?: string;
}

// ============================================================================
// Client Composable Types
// ============================================================================

export interface LinkedAccountInfo {
	userId: string;
	email: string;
	name?: string;
	firstName?: string;
	lastName?: string;
	sessionId?: string; // Session ID for querying organizations
}

export interface UseAuthSessionReturn {
	get isLoading(): boolean;
	get isAuthenticated(): boolean;
	get user(): {
		userId: string;
		workosId: string;
		email: string;
		firstName?: string;
		lastName?: string;
		name?: string;
		activeWorkspace?: {
			type: 'personal' | 'organization';
			id: string | null;
			name?: string;
		};
	} | null;
	get error(): string | null;
	get availableAccounts(): LinkedAccountInfo[];
	get activeAccountId(): string | null;
	refresh: () => Promise<void>;
	logout: () => Promise<void>;
	logoutAccount: (targetUserId: string) => Promise<void>;
	switchAccount: (targetUserId: string, redirectTo?: string) => Promise<void>;
}
