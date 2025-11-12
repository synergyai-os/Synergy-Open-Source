import { env } from '$env/dynamic/private';

const WORKOS_BASE_URL = 'https://api.workos.com';

// Note: Environment variable validation moved inside functions to prevent import-time errors
// during build/deployment. Variables are checked when actually used, not when module loads.

/** Validate required WorkOS environment variables are present */
function validateWorkOSConfig() {
	if (!env.WORKOS_CLIENT_ID) {
		throw new Error('WORKOS_CLIENT_ID is not configured.');
	}
	if (!env.WORKOS_API_KEY) {
		throw new Error('WORKOS_API_KEY is not configured.');
	}
	if (!env.WORKOS_REDIRECT_URI) {
		throw new Error('WORKOS_REDIRECT_URI is not configured.');
	}
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

function buildHeaders(includeAuth = false) {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json'
	};

	if (includeAuth) {
		headers.Authorization = `Bearer ${env.WORKOS_API_KEY}`;
	}

	return headers;
}

export async function exchangeAuthorizationCode(options: {
	code: string;
	codeVerifier: string;
}) {
	validateWorkOSConfig();
	console.log('🔍 Calling WorkOS authenticate endpoint...');
	const response = await fetch(`${WORKOS_BASE_URL}/user_management/authenticate`, {
		method: 'POST',
		headers: buildHeaders(),
		body: JSON.stringify({
			client_id: env.WORKOS_CLIENT_ID,
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
		throw new Error(`WorkOS authenticate failed (${response.status}): ${errorText}`);
	}

	const data = (await response.json()) as any;
	console.log('🔍 WorkOS response data:', {
		hasAccessToken: !!data.access_token,
		hasRefreshToken: !!data.refresh_token,
		hasUser: !!data.user,
		hasSession: !!data.session,
		userEmail: data.user?.email
	});

	if (!data.access_token || !data.refresh_token || !data.user) {
		console.error('❌ Missing required fields. Response:', JSON.stringify(data, null, 2));
		throw new Error('WorkOS authenticate response missing required fields.');
	}

	// WorkOS doesn't return a session object from authenticate endpoint
	// Extract session ID from the access token JWT (it's in the "sid" claim)
	let sessionId = 'session_unknown';
	let expiresAt: string | undefined;
	
	try {
		const tokenPayload = data.access_token.split('.')[1];
		const decodedPayload = JSON.parse(Buffer.from(tokenPayload, 'base64').toString());
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
		...data,
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
			client_id: env.WORKOS_CLIENT_ID,
			client_secret: env.WORKOS_API_KEY,
			grant_type: 'refresh_token',
			refresh_token: options.refreshToken
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error('❌ WorkOS refresh failed:', errorText);
		throw new Error(`WorkOS refresh failed (${response.status}): ${errorText}`);
	}

	const data = (await response.json()) as any;
	console.log('🔍 Refresh response:', {
		hasAccessToken: !!data.access_token,
		hasRefreshToken: !!data.refresh_token
	});

	if (!data.access_token || !data.refresh_token) {
		throw new Error('WorkOS refresh response missing required fields.');
	}

	// Extract session info from the new access token
	let sessionId = options.workosSessionId; // Default to existing session ID
	let expiresAt: string | undefined;
	
	try {
		const tokenPayload = data.access_token.split('.')[1];
		const decodedPayload = JSON.parse(Buffer.from(tokenPayload, 'base64').toString());
		sessionId = decodedPayload.sid || sessionId;
		
		if (decodedPayload.exp) {
			expiresAt = new Date(decodedPayload.exp * 1000).toISOString();
		}
	} catch (err) {
		console.warn('⚠️  Could not extract session info from refreshed token');
	}

	const response_with_session: WorkOSRefreshResponse = {
		access_token: data.access_token,
		refresh_token: data.refresh_token,
		expires_in: data.expires_in || 300,
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
		throw new Error(`WorkOS logout failed (${response.status}): ${errorText}`);
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
			client_id: env.WORKOS_CLIENT_ID,
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
		throw new Error(`WorkOS password authentication failed (${response.status}): ${errorText}`);
	}

	const data = (await response.json()) as any;
	console.log('🔍 Password auth response:', {
		hasAccessToken: !!data.access_token,
		hasRefreshToken: !!data.refresh_token,
		hasUser: !!data.user,
		userEmail: data.user?.email
	});

	if (!data.access_token || !data.refresh_token || !data.user) {
		console.error('❌ Missing required fields in password auth response');
		throw new Error('WorkOS password auth response missing required fields.');
	}

	// Extract session info from JWT
	let sessionId = 'unknown';
	let expiresAt: string | undefined;

	try {
		const tokenPayload = data.access_token.split('.')[1];
		const decodedPayload = JSON.parse(Buffer.from(tokenPayload, 'base64').toString());
		sessionId = decodedPayload.sid || 'unknown';

		if (decodedPayload.exp) {
			expiresAt = new Date(decodedPayload.exp * 1000).toISOString();
		}
	} catch (err) {
		console.warn('⚠️  Could not extract session info from token');
	}

	const response_with_session: WorkOSAuthResponse = {
		access_token: data.access_token,
		refresh_token: data.refresh_token,
		expires_in: data.expires_in || 300,
		user: data.user,
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
		throw new Error(`WorkOS user creation failed (${response.status}): ${errorText}`);
	}

	const data = (await response.json()) as any;
	console.log('✅ User created successfully:', data.id);

	return { userId: data.id };
}
