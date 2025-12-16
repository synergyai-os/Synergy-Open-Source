import { redirect } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import type { Id } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';

/**
 * Complete onboarding page server load
 *
 * Guards:
 * - Ensures user has a workspace
 * - Ensures root circle exists (redirects back if not done)
 * - Redirects to workspace if already complete
 */
export const load: PageServerLoad = async ({ locals, parent }) => {
	if (!locals.auth.sessionId) {
		throw redirect(302, '/login');
	}

	const sessionId = locals.auth.sessionId;
	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);

	// Get parent data to access workspaces
	const parentData = await parent();
	const workspaces = parentData.workspaces as Array<{ workspaceId: string; slug?: string }>;

	// If user has no workspaces, redirect to create workspace
	if (!workspaces || workspaces.length === 0) {
		throw redirect(302, '/onboarding');
	}

	const workspaceId = workspaces[0].workspaceId as Id<'workspaces'>;

	// Check onboarding progress to determine next step
	const nextStep = await client.query(api.features.onboarding.index.findNextOnboardingStep, {
		sessionId,
		workspaceId
	});

	// If onboarding is complete, redirect to workspace
	if (nextStep.isComplete) {
		const workspace = workspaces[0];
		if (workspace.slug) {
			throw redirect(302, `/w/${workspace.slug}/circles`);
		}
	}

	// If user shouldn't be on this step yet, redirect to correct one
	// Only allow access if nextRoute is complete (all required steps done)
	if (nextStep.nextRoute !== '/onboarding/complete' && !nextStep.isComplete) {
		throw redirect(302, nextStep.nextRoute || '/onboarding');
	}

	return {};
};

