type JwtPayload = {
	email?: string;
	name?: string;
	tokenIdentifier?: string;
	sub?: string;
	[key: string]: unknown;
};

export type PosthogIdentity = {
	distinctId: string;
	properties: Record<string, unknown>;
};

function decodeBase64Url(input: string): string {
	const padding = input.length % 4 === 0 ? 0 : 4 - (input.length % 4);
	const normalized = `${input.replace(/-/g, '+').replace(/_/g, '/')}${'='.repeat(padding)}`;

	if (typeof atob === 'function') {
		return atob(normalized);
	}

	if (typeof Buffer !== 'undefined') {
		return Buffer.from(normalized, 'base64').toString('utf-8');
	}

	throw new Error('Unable to decode base64 string in current environment');
}

function decodeJwtPayload(token: string): JwtPayload | null {
	const parts = token.split('.');
	if (parts.length < 2) return null;

	try {
		const payloadJson = decodeBase64Url(parts[1]);
		return JSON.parse(payloadJson) as JwtPayload;
	} catch (error) {
		console.warn('Failed to decode auth token for PostHog identity', error);
		return null;
	}
}

export function identityFromToken(token: string | null | undefined): PosthogIdentity | null {
	if (!token) return null;

	const payload = decodeJwtPayload(token);
	if (!payload) return null;

	const distinctId =
		typeof payload.email === 'string' && payload.email.trim().length > 0
			? payload.email
			: typeof payload.tokenIdentifier === 'string' && payload.tokenIdentifier.trim().length > 0
				? payload.tokenIdentifier
				: typeof payload.sub === 'string' && payload.sub.trim().length > 0
					? payload.sub
					: null;

	if (!distinctId) return null;

	const properties: Record<string, unknown> = {};

	if (payload.email) properties.email = payload.email;
	if (payload.name) properties.name = payload.name;
	if (payload.tokenIdentifier) properties.tokenIdentifier = payload.tokenIdentifier;
	if (payload.sub) properties.userId = payload.sub;

	return {
		distinctId,
		properties
	};
}
