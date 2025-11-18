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

	// Load feature flags
	let flags: unknown[] = [];
	try {
		const flagsResult = await client.query(api.featureFlags.listFlags, { sessionId });
		flags = (flagsResult as unknown[]) ?? [];
	} catch (error) {
		console.warn('Failed to load feature flags:', error);
	}

	return {
		user: locals.auth.user,
		sessionId,
		flags
	};
};
