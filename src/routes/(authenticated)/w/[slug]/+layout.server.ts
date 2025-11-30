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
 *
 * Resolution order:
 * 1. Try as current slug → serve page
 * 2. Try as workspace ID → redirect to current slug
 * 3. Try as alias (old slug) → redirect to current slug
 * 4. Not found → redirect to first workspace or onboarding
 */
async function resolveWorkspace(
	client: ConvexHttpClient,
	slugOrId: string,
	sessionId: string
): Promise<{ workspace: any; redirect: boolean; to?: string } | { workspace: null }> {
	// 1. Try as current slug
	let workspace = await client.query(api.workspaces.getBySlug, {
		slug: slugOrId,
		sessionId
	});

	if (workspace) {
		return { workspace, redirect: false };
	}

	// 2. Try as workspace ID (Convex IDs start with specific prefixes)
	// Workspace IDs are typically like "j123abc..." - check if it looks like an ID
	if (slugOrId.length > 10 && /^[a-z0-9]+$/.test(slugOrId)) {
		try {
			workspace = await client.query(api.workspaces.getById, {
				workspaceId: slugOrId as any, // Type assertion needed for Convex ID
				sessionId
			});

			if (workspace) {
				return { workspace, redirect: true, to: workspace.slug };
			}
		} catch (e) {
			// Invalid ID format, continue to alias check
		}
	}

	// 3. Try as alias (old slug)
	const alias = await client.query(api.workspaceAliases.getBySlug, {
		slug: slugOrId,
		sessionId
	});

	if (alias) {
		// Get workspace by ID from alias
		workspace = await client.query(api.workspaces.getById, {
			workspaceId: alias.workspaceId,
			sessionId
		});

		if (workspace) {
			return { workspace, redirect: true, to: workspace.slug };
		}
	}

	// 4. Not found
	return { workspace: null };
}

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

	// Resolve workspace (slug → ID → alias)
	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);

	try {
		const result = await resolveWorkspace(client, slug, sessionId);

		if (!result.workspace) {
			// Workspace not found or user doesn't have access
			// Redirect to first available workspace inbox
			const workspaces = parentData.workspaces as Array<{ slug: string }>;
			if (workspaces && workspaces.length > 0) {
				const firstWorkspace = workspaces[0];
				throw redirect(302, `/w/${firstWorkspace.slug}/inbox`);
			}
			// No workspaces - redirect to onboarding
			throw redirect(302, '/onboarding');
		}

		// If redirect needed (ID or alias), redirect to current slug
		if (result.redirect && result.to) {
			const currentPath = url.pathname;
			const newPath = currentPath.replace(`/w/${slug}`, `/w/${result.to}`);
			throw redirect(301, newPath + url.search); // 301 = permanent redirect
		}

		// Return workspace data for child routes
		return {
			...parentData,
			workspace: result.workspace,
			workspaceId: result.workspace.workspaceId,
			workspaceSlug: result.workspace.slug
		};
	} catch (e) {
		// If it's already a redirect, re-throw it
		if (e && typeof e === 'object' && 'status' in e && e.status >= 300 && e.status < 400) {
			throw e;
		}
		// Log the full error for debugging
		console.error('❌ Failed to load workspace:', {
			slug,
			sessionId,
			error: e,
			errorMessage: e instanceof Error ? e.message : String(e),
			errorStack: e instanceof Error ? e.stack : undefined
		});

		// Redirect to first available workspace inbox
		const workspaces = parentData.workspaces as Array<{ slug: string }>;
		if (workspaces && workspaces.length > 0) {
			const firstWorkspace = workspaces[0];
			throw redirect(302, `/w/${firstWorkspace.slug}/inbox`);
		}
		// No workspaces - redirect to onboarding
		throw redirect(302, '/onboarding');
	}
};
