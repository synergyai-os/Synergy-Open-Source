import { error } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import type { Id } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	if (!locals.auth.sessionId) {
		throw error(401, 'Unauthorized');
	}

	// Get workspaceId from parent layout (resolved from slug)
	const parentData = await parent();
	const workspaceId = parentData.workspaceId as string | undefined;

	if (!workspaceId) {
		throw error(404, 'Workspace not found');
	}

	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	const sessionId = locals.auth.sessionId;

	// Check user is org admin/owner (listMembers returns all members, filter by current user)
	const membersResult = (await client.query(api.workspaces.listMembers, {
		sessionId,
		workspaceId: workspaceId as Id<'workspaces'>
	})) as Array<{ userId: string; email: string; name: string; role: 'owner' | 'admin' | 'member' }>;

	// Get current user's email from locals
	const currentUserEmail = locals.auth.user?.email;
	if (!currentUserEmail) {
		throw error(401, 'User email not found');
	}

	// Find membership by email (userId might not match, but email should)
	const membership = membersResult.find((m) => m.email === currentUserEmail);

	if (!membership || membership.role === 'member') {
		throw error(403, 'Must be org admin or owner to access branding settings');
	}

	// Load current branding
	const brandingResult = (await client.query(api.workspaces.findBranding, {
		workspaceId: workspaceId as Id<'workspaces'>
	})) as { primaryColor: string; secondaryColor: string; logo?: string } | null;

	return {
		sessionId,
		workspaceId: workspaceId,
		orgBranding: brandingResult
	};
};
