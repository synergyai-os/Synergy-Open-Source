import type { ConvexHttpClient } from 'convex/browser';
import type { Id } from '$lib/convex';
import { api } from '$lib/convex';

interface ResolveWorkspaceRedirectParams {
	client: ConvexHttpClient;
	sessionId: string;
	activeWorkspaceId?: string | null;
}

/**
 * Resolve the default post-auth redirect for a user.
 * Invariant: every user belongs to at least one workspace with a slug.
 * Throws if no workspace slug can be resolved.
 */
export async function resolveWorkspaceRedirect({
	client,
	sessionId,
	activeWorkspaceId
}: ResolveWorkspaceRedirectParams): Promise<string> {
	const workspaces = (await client.query(api.workspaces.listWorkspaces, {
		sessionId
	})) as Array<{ workspaceId: Id<'workspaces'>; slug?: string }>;

	const activeWorkspace =
		activeWorkspaceId && workspaces.find((w) => w.workspaceId === activeWorkspaceId);
	if (
		activeWorkspace &&
		typeof activeWorkspace.slug === 'string' &&
		activeWorkspace.slug.length > 0
	) {
		return `/w/${activeWorkspace.slug}/inbox`;
	}

	const firstWithSlug = workspaces.find(
		(w): w is { workspaceId: Id<'workspaces'>; slug: string } =>
			typeof w.slug === 'string' && w.slug.length > 0
	);
	if (firstWithSlug) {
		return `/w/${firstWithSlug.slug}/inbox`;
	}

	throw new Error('No workspace with slug available for redirect');
}
