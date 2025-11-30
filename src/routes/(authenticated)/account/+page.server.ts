import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';

/**
 * Account page - User profile, linked accounts, password management
 * No workspace context - this is user-scoped
 */
export const load: PageServerLoad = async ({ locals, parent }) => {
	// Ensure authenticated
	if (!locals.auth.sessionId) {
		return {
			user: null,
			linkedAccounts: []
		};
	}

	// Get parent data (includes user, sessionId, etc.)
	const parentData = await parent();
	const sessionId = locals.auth.sessionId;

	// Load linked accounts
	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	let linkedAccounts: unknown[] = [];
	try {
		linkedAccounts = (await client.query(api.users.listLinkedAccounts, {
			sessionId
		})) as unknown[];
	} catch (error) {
		console.error('Failed to load linked accounts:', error);
	}

	return {
		...parentData,
		linkedAccounts
	};
};

