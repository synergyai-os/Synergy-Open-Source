import { error } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { env } from '$env/dynamic/public';

/**
 * Check if user is system admin and throw error(403) if not
 * Use this in admin page load functions to allow error pages to catch the error
 */
export async function requireSystemAdmin(sessionId: string | null): Promise<void> {
	if (!sessionId) {
		throw error(403, 'Authentication required');
	}

	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);

	try {
		const isAdmin = await client.query(api.rbac.permissions.isSystemAdmin, {
			sessionId
		});

		if (!isAdmin) {
			throw error(403, 'System admin access required');
		}
	} catch (err) {
		// If it's already an error, re-throw it
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		// If query fails, deny access (fail closed)
		console.error('Failed to check admin status:', err);
		throw error(403, 'System admin access required');
	}
}
