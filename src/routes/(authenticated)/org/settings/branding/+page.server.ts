import { error } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import type { Id } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.auth.sessionId) {
		throw error(401, 'Unauthorized');
	}

	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	const sessionId = locals.auth.sessionId;

	// Get active organization from URL param or first org
	const orgParam = url.searchParams.get('org');
	const organizationsResult = (await client.query(api.organizations.listOrganizations, {
		sessionId
	})) as Array<{ organizationId: string }>;

	if (organizationsResult.length === 0) {
		throw error(404, 'No organizations found');
	}

	const validOrgParam =
		orgParam && organizationsResult.some((org) => org.organizationId === orgParam)
			? orgParam
			: null;
	const activeOrgId = validOrgParam || organizationsResult[0]?.organizationId;

	if (!activeOrgId) {
		throw error(404, 'Organization not found');
	}

	// Check user is org admin/owner (getMembers returns all members, filter by current user)
	const membersResult = (await client.query(api.organizations.getMembers, {
		sessionId,
		organizationId: activeOrgId as Id<'organizations'>
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
	const brandingResult = (await client.query(api.organizations.getBranding, {
		organizationId: activeOrgId as Id<'organizations'>
	})) as { primaryColor: string; secondaryColor: string; logo?: string } | null;

	return {
		sessionId,
		organizationId: activeOrgId,
		orgBranding: brandingResult
	};
};
