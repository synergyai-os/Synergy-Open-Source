import { redirect } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.auth.sessionId) {
		throw redirect(302, '/login');
	}

	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	const sessionId = locals.auth.sessionId;

	// Load system settings
	let settings: unknown = null;
	try {
		settings = await client.query(api.admin.settings.getSystemSettings, { sessionId });
	} catch (error) {
		console.warn('Failed to load system settings:', error);
	}

	return {
		user: locals.auth.user,
		sessionId,
		settings: settings as unknown
	};
};
