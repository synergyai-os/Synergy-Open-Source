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

	// Add timeout to prevent hanging if Convex is slow/unresponsive
	const timeoutMs = Number.parseInt(process.env.CONVEX_QUERY_TIMEOUT_MS || '5000', 10);
	let timeoutId: NodeJS.Timeout | undefined;

	try {
		const timeoutPromise = new Promise<never>((_, reject) => {
			timeoutId = setTimeout(() => {
				reject(new Error('Admin check timeout'));
			}, timeoutMs);
		});

		const isAdmin = (await Promise.race([
			client.query(api.infrastructure.rbac.permissions.isSystemAdmin, {
				sessionId
			}),
			timeoutPromise
		])) as boolean;

		// Clear timeout if query resolved successfully
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		if (!isAdmin) {
			throw error(403, 'System admin access required');
		}
	} catch (err) {
		// Clear timeout if it's still pending (query threw non-timeout error)
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		// If it's already an error, re-throw it
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		// Handle timeout specifically with 504 Gateway Timeout
		if (err instanceof Error && err.message === 'Admin check timeout') {
			console.error('Admin check timed out after', timeoutMs, 'ms');
			throw error(504, 'Gateway Timeout: Admin check timed out');
		}
		// If query fails, deny access (fail closed)
		console.error('Failed to check admin status:', err);
		throw error(403, 'System admin access required');
	}
}
