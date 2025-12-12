import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import type {
	WorkOSAuthResponse,
	WorkOSRefreshResponse,
	WorkOSPasswordAuthResponse
} from '../types';
import { invariant } from '$lib/utils/invariant';

const WORKOS_BASE_URL = 'https://api.workos.com';

// Note: Environment variable validation moved inside functions to prevent import-time errors
// during build/deployment. Variables are checked when actually used, not when module loads.

export type WorkOSError = Error & { statusCode: number; originalError?: string };

export function createWorkOSError(
	message: string,
	statusCode: number,
	originalError?: string
): WorkOSError {
	const error = new Error(message) as WorkOSError;
	error.name = 'WorkOSError';
	error.statusCode = statusCode;
	if (originalError) {
		error.originalError = originalError;
	}
	return error;
}

export function isWorkOSError(error: unknown): error is WorkOSError {
	if (!error || typeof error !== 'object') {
		return false;
	}

	const candidate = error as Partial<WorkOSError>;
	return candidate.name === 'WorkOSError' && typeof candidate.statusCode === 'number';
}

/** Validate required WorkOS environment variables are present */
function validateWorkOSConfig() {
	invariant(publicEnv.PUBLIC_WORKOS_CLIENT_ID, 'PUBLIC_WORKOS_CLIENT_ID is not configured.');
	invariant(env.WORKOS_API_KEY, 'WORKOS_API_KEY is not configured.');
	invariant(env.WORKOS_REDIRECT_URI, 'WORKOS_REDIRECT_URI is not configured.');
}

interface WorkOSUser {
	id: string;
	email: string;
	first_name?: string;
	last_name?: string;
	email_verified?: boolean;
}

interface _WorkOSSession {
	id: string;
	expires_at?: string;
}

// Re-export types for backward compatibility
export type { WorkOSAuthResponse, WorkOSRefreshResponse, WorkOSPasswordAuthResponse };

function buildHeaders(includeAuth = false) {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json'
	};

	if (includeAuth) {
		headers.Authorization = `Bearer ${env.WORKOS_API_KEY}`;
	}

	return headers;
}

export async function exchangeAuthorizationCode(options: { code: string; codeVerifier: string }) {
	validateWorkOSConfig();
	console.log('🔍 Calling WorkOS authenticate endpoint...');
	const response = await fetch(`${WORKOS_BASE_URL}/user_management/authenticate`, {
		method: 'POST',
		headers: buildHeaders(),
		body: JSON.stringify({
			client_id: publicEnv.PUBLIC_WORKOS_CLIENT_ID,
			client_secret: env.WORKOS_API_KEY,
			code: options.code,
			grant_type: 'authorization_code',
			redirect_uri: env.WORKOS_REDIRECT_URI,
			code_verifier: options.codeVerifier
		})
	});

	console.log('🔍 WorkOS response status:', response.status);

	if (!response.ok) {
		const errorText = await response.text();
		console.error('❌ WorkOS error response:', errorText);
		invariant(false, `WorkOS authenticate failed (${response.status}): ${errorText}`);
	}

	const data = (await response.json()) as unknown;
	// Validate response structure
	invariant(
		typeof data === 'object' &&
			data !== null &&
			'access_token' in data &&
			'refresh_token' in data &&
			'user' in data,
		'WorkOS authenticate response missing required fields.'
	);
	const typedData = data as {
		access_token: string;
		refresh_token: string;
		expires_in?: number;
		user: WorkOSUser;
	};
	console.log('🔍 WorkOS response data:', {
		hasAccessToken: !!typedData.access_token,
		hasRefreshToken: !!typedData.refresh_token,
		hasUser: !!typedData.user,
		userEmail: typedData.user?.email
	});

	invariant(
		typedData.access_token && typedData.refresh_token && typedData.user,
		'WorkOS authenticate response missing required fields.'
	);

	// WorkOS doesn't return a session object from authenticate endpoint
	// Extract session ID from the access token JWT (it's in the "sid" claim)
	let sessionId = 'session_unknown';
	let expiresAt: string | undefined;

	try {
		const tokenPayload = typedData.access_token.split('.')[1];
		const decodedPayload = JSON.parse(Buffer.from(tokenPayload, 'base64').toString()) as {
			sid?: string;
			exp?: number;
		};
		sessionId = decodedPayload.sid || 'session_unknown';

		// Get expiration from JWT (exp is in seconds, convert to ISO string)
		if (decodedPayload.exp) {
			expiresAt = new Date(decodedPayload.exp * 1000).toISOString();
		}

		console.log('🔍 Extracted session ID from JWT:', sessionId);
	} catch (err) {
		console.warn('⚠️  Could not extract session ID from access token:', err);
	}

	// Create a synthetic session object since WorkOS doesn't return one
	const response_with_session: WorkOSAuthResponse = {
		access_token: typedData.access_token,
		refresh_token: typedData.refresh_token,
		expires_in: typedData.expires_in || 300,
		user: typedData.user,
		session: {
			id: sessionId,
			expires_at: expiresAt
		}
	};

	console.log('✅ WorkOS authentication successful, session ID:', sessionId);
	return response_with_session;
}

export async function refreshWorkOSSession(options: {
	workosSessionId: string;
	refreshToken: string;
}) {
	validateWorkOSConfig();
	console.log('🔍 Refreshing WorkOS session...');

	const response = await fetch(`${WORKOS_BASE_URL}/user_management/authenticate`, {
		method: 'POST',
		headers: buildHeaders(),
		body: JSON.stringify({
			client_id: publicEnv.PUBLIC_WORKOS_CLIENT_ID,
			client_secret: env.WORKOS_API_KEY,
			grant_type: 'refresh_token',
			refresh_token: options.refreshToken
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error('❌ WorkOS refresh failed:', errorText);
		throw createWorkOSError(
			`WorkOS refresh failed (${response.status}): ${errorText}`,
			response.status,
			errorText
		);
	}

	const data = (await response.json()) as unknown;
	// Validate response structure
	invariant(
		typeof data === 'object' && data !== null && 'access_token' in data && 'refresh_token' in data,
		'WorkOS refresh response missing required fields.'
	);
	const typedData = data as {
		access_token: string;
		refresh_token: string;
		expires_in?: number;
	};
	console.log('🔍 Refresh response:', {
		hasAccessToken: !!typedData.access_token,
		hasRefreshToken: !!typedData.refresh_token
	});

	// Extract session info from the new access token
	let sessionId = options.workosSessionId; // Default to existing session ID
	let expiresAt: string | undefined;

	try {
		const tokenPayload = typedData.access_token.split('.')[1];
		const decodedPayload = JSON.parse(Buffer.from(tokenPayload, 'base64').toString()) as {
			sid?: string;
			exp?: number;
		};
		sessionId = decodedPayload.sid || sessionId;

		if (decodedPayload.exp) {
			expiresAt = new Date(decodedPayload.exp * 1000).toISOString();
		}
	} catch (_err) {
		console.warn('⚠️  Could not extract session info from refreshed token');
	}

	const response_with_session: WorkOSRefreshResponse = {
		access_token: typedData.access_token,
		refresh_token: typedData.refresh_token,
		expires_in: typedData.expires_in || 300,
		session: {
			id: sessionId,
			expires_at: expiresAt
		}
	};

	console.log('✅ WorkOS session refreshed successfully');
	return response_with_session;
}

export async function revokeWorkOSSession(workosSessionId: string) {
	validateWorkOSConfig();
	const response = await fetch(`${WORKOS_BASE_URL}/user_management/sessions/logout`, {
		method: 'POST',
		headers: buildHeaders(true),
		body: JSON.stringify({
			session_id: workosSessionId
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw createWorkOSError(
			`WorkOS logout failed (${response.status}): ${errorText}`,
			response.status,
			errorText
		);
	}
}

/**
 * Headless password authentication - authenticate user directly with email + password
 * No redirect to WorkOS - returns tokens directly
 */
export async function authenticateWithPassword(options: {
	email: string;
	password: string;
	ipAddress?: string;
	userAgent?: string | null;
}): Promise<WorkOSAuthResponse> {
	validateWorkOSConfig();
	console.log('🔍 Authenticating with password for:', options.email);

	const response = await fetch(`${WORKOS_BASE_URL}/user_management/authenticate`, {
		method: 'POST',
		headers: buildHeaders(),
		body: JSON.stringify({
			client_id: publicEnv.PUBLIC_WORKOS_CLIENT_ID,
			client_secret: env.WORKOS_API_KEY,
			grant_type: 'password',
			email: options.email,
			password: options.password,
			ip_address: options.ipAddress,
			user_agent: options.userAgent
		})
	});

	console.log('🔍 WorkOS password auth response status:', response.status);

	if (!response.ok) {
		const errorText = await response.text();
		console.error('❌ WorkOS password auth failed:', errorText);
		throw createWorkOSError(
			`WorkOS password authentication failed (${response.status}): ${errorText}`,
			response.status,
			errorText
		);
	}

	const data = (await response.json()) as unknown;
	// Validate response structure
	invariant(
		typeof data === 'object' &&
			data !== null &&
			'access_token' in data &&
			'refresh_token' in data &&
			'user' in data,
		'WorkOS password auth response missing required fields.'
	);
	const typedData = data as {
		access_token: string;
		refresh_token: string;
		expires_in?: number;
		user: WorkOSUser;
	};
	console.log('🔍 Password auth response:', {
		hasAccessToken: !!typedData.access_token,
		hasRefreshToken: !!typedData.refresh_token,
		hasUser: !!typedData.user,
		userEmail: typedData.user?.email
	});

	// Extract session info from JWT
	let sessionId = 'unknown';
	let expiresAt: string | undefined;

	try {
		const tokenPayload = typedData.access_token.split('.')[1];
		const decodedPayload = JSON.parse(Buffer.from(tokenPayload, 'base64').toString()) as {
			sid?: string;
			exp?: number;
		};
		sessionId = decodedPayload.sid || 'unknown';

		if (decodedPayload.exp) {
			expiresAt = new Date(decodedPayload.exp * 1000).toISOString();
		}
	} catch (_err) {
		console.warn('⚠️  Could not extract session info from token');
	}

	const response_with_session: WorkOSAuthResponse = {
		access_token: typedData.access_token,
		refresh_token: typedData.refresh_token,
		expires_in: typedData.expires_in || 300,
		user: typedData.user,
		session: {
			id: sessionId,
			expires_at: expiresAt
		}
	};

	console.log('✅ Password authentication successful, session ID:', sessionId);
	return response_with_session;
}

/**
 * Create a new user with email and password (headless registration)
 */
/**
 * Check if a user exists in WorkOS by email
 */
export async function getUserByEmail(email: string): Promise<WorkOSUser | null> {
	validateWorkOSConfig();
	console.log('🔍 Checking if user exists:', email);

	const response = await fetch(
		`${WORKOS_BASE_URL}/user_management/users?email=${encodeURIComponent(email)}`,
		{
			method: 'GET',
			headers: buildHeaders(true)
		}
	);

	console.log('🔍 WorkOS get user response status:', response.status);

	if (!response.ok) {
		const errorText = await response.text();
		console.error('❌ WorkOS get user failed:', errorText);
		throw createWorkOSError(
			`WorkOS get user failed (${response.status}): ${errorText}`,
			response.status,
			errorText
		);
	}

	const data = (await response.json()) as unknown;
	// Validate response structure
	if (typeof data !== 'object' || data === null || !('data' in data)) {
		return null;
	}
	const typedData = data as { data?: WorkOSUser[] };
	console.log('🔍 WorkOS get user response:', { usersFound: typedData.data?.length });

	// Return first user if exists, null otherwise
	return typedData.data && typedData.data.length > 0 ? typedData.data[0] : null;
}

export async function createUserWithPassword(options: {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
}): Promise<{ userId: string }> {
	validateWorkOSConfig();
	console.log('🔍 Creating new user:', options.email);

	const response = await fetch(`${WORKOS_BASE_URL}/user_management/users`, {
		method: 'POST',
		headers: buildHeaders(true),
		body: JSON.stringify({
			email: options.email,
			password: options.password,
			first_name: options.firstName,
			last_name: options.lastName,
			email_verified: true // Skip email verification for headless flow
		})
	});

	console.log('🔍 WorkOS create user response status:', response.status);

	if (!response.ok) {
		const errorText = await response.text();
		console.error('❌ WorkOS create user failed:', errorText);
		throw createWorkOSError(
			`WorkOS user creation failed (${response.status}): ${errorText}`,
			response.status,
			errorText
		);
	}

	const data = (await response.json()) as unknown;
	// Validate response structure
	invariant(
		typeof data === 'object' &&
			data !== null &&
			'id' in data &&
			typeof (data as { id: unknown }).id === 'string',
		'WorkOS user creation response missing user ID.'
	);
	const typedData = data as { id: string };
	console.log('✅ User created successfully:', typedData.id);

	return { userId: typedData.id };
}

/**
 * Create a password reset token and optionally send reset email
 * The token is included in the passwordResetUrl as a query parameter
 */
export async function createPasswordReset(options: {
	email: string;
	passwordResetUrl: string;
}): Promise<{ passwordResetId: string }> {
	validateWorkOSConfig();
	console.log('🔍 Creating password reset for:', options.email);

	const response = await fetch(`${WORKOS_BASE_URL}/user_management/password_reset`, {
		method: 'POST',
		headers: buildHeaders(true),
		body: JSON.stringify({
			email: options.email,
			password_reset_url: options.passwordResetUrl
		})
	});

	console.log('🔍 WorkOS password reset response status:', response.status);

	if (!response.ok) {
		const errorText = await response.text();
		console.error('❌ WorkOS password reset creation failed:', errorText);
		throw createWorkOSError(
			`WorkOS password reset failed (${response.status}): ${errorText}`,
			response.status,
			errorText
		);
	}

	const data = (await response.json()) as unknown;
	// Validate response structure
	invariant(
		typeof data === 'object' &&
			data !== null &&
			'id' in data &&
			typeof (data as { id: unknown }).id === 'string',
		'WorkOS password reset response missing reset ID.'
	);
	const typedData = data as { id: string };
	console.log('✅ Password reset created:', typedData.id);

	return { passwordResetId: typedData.id };
}

/**
 * Reset a user's password using a reset token
 */
export async function resetPassword(options: {
	token: string;
	newPassword: string;
}): Promise<{ userId: string }> {
	validateWorkOSConfig();
	console.log('🔍 Resetting password with token');

	const response = await fetch(`${WORKOS_BASE_URL}/user_management/password_reset/confirm`, {
		method: 'POST',
		headers: buildHeaders(true),
		body: JSON.stringify({
			token: options.token,
			new_password: options.newPassword
		})
	});

	console.log('🔍 WorkOS reset password response status:', response.status);

	if (!response.ok) {
		const errorText = await response.text();
		console.error('❌ WorkOS reset password failed:', errorText);

		// Parse structured error response if JSON (WorkOS returns JSON errors)
		let errorMessage = `WorkOS reset password failed (${response.status})`;
		let parsedError: unknown = null;

		try {
			parsedError = JSON.parse(errorText);
			if (
				typeof parsedError === 'object' &&
				parsedError !== null &&
				('error' in parsedError || 'message' in parsedError)
			) {
				const errorObj = parsedError as { error?: string; message?: string; code?: string };
				errorMessage = errorObj.error || errorObj.message || errorMessage;
			}
		} catch {
			// Not JSON, use text as-is
			if (errorText) {
				errorMessage = errorText.length > 200 ? errorText.substring(0, 200) + '...' : errorText;
			}
		}

		// Throw custom error that preserves HTTP status code
		throw createWorkOSError(errorMessage, response.status, errorText);
	}

	const data = (await response.json()) as unknown;
	// Validate response structure
	if (
		typeof data !== 'object' ||
		data === null ||
		!('user' in data) ||
		typeof data.user !== 'object' ||
		data.user === null ||
		!('id' in data.user) ||
		typeof data.user.id !== 'string'
	) {
		invariant(false, 'WorkOS reset password response missing user ID.');
	}
	const typedData = data as { user: { id: string } };
	console.log('✅ Password reset successful for user:', typedData.user.id);

	return { userId: typedData.user.id };
}
