import { ConvexHttpClient } from 'convex/browser';
import { env as publicEnv } from '$env/dynamic/public';
import type { Id } from '$lib/convex';
import { decryptSecret, encryptSecret, generateSessionId, hashValue } from './crypto';
import type { ConvexClient } from '$lib/types/convex';

const LOGIN_STATE_TTL_MS = 15 * 60 * 1000; // 15 minutes

if (!publicEnv.PUBLIC_CONVEX_URL) {
	throw new Error('PUBLIC_CONVEX_URL must be configured to use headless WorkOS auth.');
}

function createConvexClient() {
	return new ConvexHttpClient(publicEnv.PUBLIC_CONVEX_URL);
}

export type AuthFlowMode = 'sign-in' | 'sign-up';

export interface LoginStateMetadata {
	codeVerifier: string;
	redirectTo?: string | null;
	flowMode: AuthFlowMode;
	linkAccount: boolean;
	primaryUserId?: Id<'users'> | null;
}

export async function createLoginState(options: {
	state: string;
	codeVerifier: string;
	redirectTo?: string;
	flowMode?: AuthFlowMode;
	linkAccount?: boolean;
	primaryUserId?: Id<'users'>;
	ipAddress?: string;
	userAgent?: string | null;
	now?: number;
}) {
	const client = createConvexClient();
	const now = options.now ?? Date.now();
	// ConvexHttpClient has mutation/query methods but they're not in type definitions
	const convexMutation = (client as unknown as ConvexClient).mutation.bind(client);

	await convexMutation('authSessions:createLoginState', {
		stateHash: hashValue(options.state),
		codeVerifierCiphertext: encryptSecret(options.codeVerifier),
		redirectTo: options.redirectTo,
		flowMode: options.flowMode,
		linkAccount: options.linkAccount ?? false,
		primaryUserId: options.primaryUserId,
		ipAddress: options.ipAddress,
		userAgent: options.userAgent ?? undefined,
		createdAt: now,
		expiresAt: now + LOGIN_STATE_TTL_MS
	});
}

export async function consumeLoginState(state: string) {
	const client = createConvexClient();
	const convexMutation = (client as unknown as ConvexClient).mutation.bind(client);
	const result = (await convexMutation('authSessions:consumeLoginState', {
		stateHash: hashValue(state),
		now: Date.now()
	})) as {
		codeVerifierCiphertext: string;
		redirectTo?: string | null;
		flowMode?: string | null;
		linkAccount?: boolean | null;
		primaryUserId?: Id<'users'> | null;
	} | null;

	if (!result) {
		return null;
	}

	const flowMode = result.flowMode === 'sign-up' ? 'sign-up' : 'sign-in';

	return {
		codeVerifier: decryptSecret(result.codeVerifierCiphertext),
		redirectTo: result.redirectTo ?? undefined,
		flowMode,
		linkAccount: Boolean(result.linkAccount),
		primaryUserId: result.primaryUserId ?? undefined
	};
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

export async function createSessionRecord(options: {
	sessionId?: string;
	convexUserId: Id<'users'>;
	workosUserId: string;
	workosSessionId: string;
	accessToken: string;
	refreshToken: string;
	csrfToken: string;
	expiresAt: number;
	userSnapshot: SessionSnapshot;
	ipAddress?: string;
	userAgent?: string | null;
	now?: number;
}) {
	const client = createConvexClient();
	const sessionId = options.sessionId ?? generateSessionId();
	const now = options.now ?? Date.now();

	const convexMutation = (client as unknown as ConvexClient).mutation.bind(client);
	await convexMutation('authSessions:createSession', {
		sessionId,
		convexUserId: options.convexUserId,
		workosUserId: options.workosUserId,
		workosSessionId: options.workosSessionId,
		accessTokenCiphertext: encryptSecret(options.accessToken),
		refreshTokenCiphertext: encryptSecret(options.refreshToken),
		csrfTokenHash: hashValue(options.csrfToken),
		expiresAt: options.expiresAt,
		createdAt: now,
		ipAddress: options.ipAddress,
		userAgent: options.userAgent ?? undefined,
		userSnapshot: options.userSnapshot
	});

	return sessionId;
}

export async function getSessionRecord(sessionId: string): Promise<SessionRecord | null> {
	const client = createConvexClient();
	const convexQuery = (client as unknown as ConvexClient).query.bind(client);
	const result = (await convexQuery('authSessions:getSessionById', { sessionId })) as {
		sessionId: string;
		convexUserId: Id<'users'>;
		workosUserId: string;
		workosSessionId: string;
		accessTokenCiphertext: string;
		refreshTokenCiphertext: string;
		csrfTokenHash: string;
		expiresAt: number;
		createdAt: number;
		lastRefreshedAt?: number | null;
		lastSeenAt?: number | null;
		ipAddress?: string | null;
		userAgent?: string | null;
		userSnapshot: SessionSnapshot;
	} | null;

	if (!result) {
		return null;
	}

	return {
		sessionId: result.sessionId,
		convexUserId: result.convexUserId,
		workosUserId: result.workosUserId,
		workosSessionId: result.workosSessionId,
		accessToken: decryptSecret(result.accessTokenCiphertext),
		refreshToken: decryptSecret(result.refreshTokenCiphertext),
		csrfTokenHash: result.csrfTokenHash,
		expiresAt: result.expiresAt,
		createdAt: result.createdAt,
		lastRefreshedAt: result.lastRefreshedAt ?? undefined,
		lastSeenAt: result.lastSeenAt ?? undefined,
		ipAddress: result.ipAddress ?? undefined,
		userAgent: result.userAgent ?? undefined,
		userSnapshot: result.userSnapshot
	};
}

export async function getActiveSessionRecordForUser(
	userId: Id<'users'>
): Promise<SessionRecord | null> {
	const client = createConvexClient();
	const convexQuery = (client as unknown as ConvexClient).query.bind(client);
	const result = (await convexQuery('authSessions:getActiveSessionForUser', {
		userId
	})) as {
		sessionId: string;
		expiresAt: number;
	} | null;

	if (!result) {
		return null;
	}

	return getSessionRecord(result.sessionId);
}

export async function updateSessionSecrets(options: {
	sessionId: string;
	newSessionId?: string;
	accessToken?: string;
	refreshToken?: string;
	csrfToken?: string;
	expiresAt?: number;
	lastRefreshedAt?: number;
}) {
	const client = createConvexClient();

	const convexMutation = (client as unknown as ConvexClient).mutation.bind(client);
	await convexMutation('authSessions:updateSessionSecrets', {
		sessionId: options.sessionId,
		newSessionId: options.newSessionId,
		accessTokenCiphertext: options.accessToken ? encryptSecret(options.accessToken) : undefined,
		refreshTokenCiphertext: options.refreshToken ? encryptSecret(options.refreshToken) : undefined,
		csrfTokenHash: options.csrfToken ? hashValue(options.csrfToken) : undefined,
		expiresAt: options.expiresAt,
		lastRefreshedAt: options.lastRefreshedAt
	});
}

export async function touchSession(options: {
	sessionId: string;
	ipAddress?: string;
	userAgent?: string | null;
	now?: number;
}) {
	const client = createConvexClient();
	const convexMutation = (client as unknown as ConvexClient).mutation.bind(client);
	await convexMutation('authSessions:touchSession', {
		sessionId: options.sessionId,
		lastSeenAt: options.now ?? Date.now(),
		ipAddress: options.ipAddress,
		userAgent: options.userAgent ?? undefined
	});
}

export async function invalidateSession(sessionId: string) {
	const client = createConvexClient();
	const convexMutation = (client as unknown as ConvexClient).mutation.bind(client);
	await convexMutation('authSessions:invalidateSession', {
		sessionId,
		revokedAt: Date.now()
	});
}
