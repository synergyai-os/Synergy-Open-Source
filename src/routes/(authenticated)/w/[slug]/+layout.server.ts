import { redirect, error } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { LayoutServerLoad } from './$types';

/**
 * Workspace-scoped route layout
 * Resolves workspace slug from URL path and validates user access
 *
 * Pattern: /w/[slug]/circles, /w/[slug]/members, etc.
 */
export const load: LayoutServerLoad = async ({ params, locals, parent, url }) => {
	// Ensure authenticated
	if (!locals.auth.sessionId) {
		throw redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}

	// Get parent data (includes user, sessionId, etc.)
	const parentData = await parent();
	const sessionId = locals.auth.sessionId;
	const slug = params.slug;

	if (!slug) {
		throw error(400, 'Workspace slug is required');
	}

	// Resolve workspace by slug
	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);

	try {
		// Check if getBySlug exists in API (for debugging)
		if (!api.workspaces.getBySlug) {
			console.error('❌ api.workspaces.getBySlug not found in API');
			throw new Error('getBySlug query not available - Convex types may need regeneration');
		}

		const workspace = await client.query(api.workspaces.getBySlug, {
			slug,
			sessionId
		});

		if (!workspace) {
			// Workspace not found or user doesn't have access
			// Redirect to first available workspace or inbox
			const workspaces = parentData.workspaces as Array<{ slug: string }>;
			if (workspaces && workspaces.length > 0) {
				const firstWorkspace = workspaces[0];
				throw redirect(302, `/w/${firstWorkspace.slug}/circles`);
			}
			throw redirect(302, '/inbox');
		}

		// Return workspace data for child routes
		return {
			...parentData,
			workspace,
			workspaceId: workspace.workspaceId,
			workspaceSlug: slug
		};
	} catch (e) {
		// If it's already a redirect, re-throw it
		if (e && typeof e === 'object' && 'status' in e && e.status >= 300 && e.status < 400) {
			throw e;
		}
		// Log the full error for debugging
		console.error('❌ Failed to load workspace by slug:', {
			slug,
			sessionId,
			error: e,
			errorMessage: e instanceof Error ? e.message : String(e),
			errorStack: e instanceof Error ? e.stack : undefined
		});

		// Redirect to first available workspace or inbox
		const workspaces = parentData.workspaces as Array<{ slug: string }>;
		if (workspaces && workspaces.length > 0) {
			const firstWorkspace = workspaces[0];
			throw redirect(302, `/w/${firstWorkspace.slug}/circles`);
		}
		throw redirect(302, '/inbox');
	}
};
