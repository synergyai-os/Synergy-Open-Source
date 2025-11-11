import { env } from '$env/dynamic/private';

const WORKOS_BASE_URL = 'https://api.workos.com';

if (!env.WORKOS_CLIENT_ID) {
	throw new Error('WORKOS_CLIENT_ID is not configured.');
}

if (!env.WORKOS_API_KEY) {
	throw new Error('WORKOS_API_KEY is not configured.');
}

if (!env.WORKOS_REDIRECT_URI) {
	throw new Error('WORKOS_REDIRECT_URI is not configured.');
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

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`WorkOS authenticate failed (${response.status}): ${errorText}`);
	}

	const data = (await response.json()) as WorkOSAuthResponse;

	if (!data.access_token || !data.refresh_token || !data.user || !data.session) {
		throw new Error('WorkOS authenticate response missing required fields.');
	}

	return data;
}

export async function refreshWorkOSSession(options: {
	workosSessionId: string;
	refreshToken: string;
}) {
	const response = await fetch(
		`${WORKOS_BASE_URL}/user_management/sessions/${options.workosSessionId}/refresh`,
		{
			method: 'POST',
			headers: buildHeaders(true),
			body: JSON.stringify({
				refresh_token: options.refreshToken,
				client_id: env.WORKOS_CLIENT_ID
			})
		}
	);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`WorkOS refresh failed (${response.status}): ${errorText}`);
	}

	const data = (await response.json()) as WorkOSRefreshResponse;

	if (!data.access_token || !data.refresh_token || !data.session) {
		throw new Error('WorkOS refresh response missing required fields.');
	}

	return data;
}

export async function revokeWorkOSSession(workosSessionId: string) {
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
