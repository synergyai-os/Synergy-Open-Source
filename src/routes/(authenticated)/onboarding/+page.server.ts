import { redirect } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import type { Id } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';

/**
 * Onboarding page server load
 *
 * Handles routing logic:
 * - If user has no workspaces → show "Create Your Organization" page
 * - If user has workspace but setup incomplete → redirect to next incomplete step
 * - If user has workspace and setup complete → redirect to workspace (shouldn't happen due to guards)
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

	// Check onboarding state (general - no specific workspace)
	const onboardingState = await client.query(api.features.onboarding.index.findOnboardingState, {
		sessionId,
		workspaceId: undefined
	});

	// If user has no workspaces, show create workspace page
	if (!onboardingState.hasWorkspaces || !workspaces || workspaces.length === 0) {
		return {
			showCreateWorkspace: true
		};
	}

	// User has workspaces - check setup status for first workspace
	const firstWorkspace = workspaces[0];
	if (!firstWorkspace?.workspaceId) {
		// Edge case: hasWorkspaces is true but no valid workspace
		return {
			showCreateWorkspace: true
		};
	}

	const workspaceId = firstWorkspace.workspaceId as Id<'workspaces'>;

	// Check onboarding state for first workspace
	const workspaceOnboardingState = await client.query(
		api.features.onboarding.index.findOnboardingState,
		{
			sessionId,
			workspaceId
		}
	);

	// If workspace setup is complete, redirect to workspace
	// (This shouldn't happen due to route guards, but handle it gracefully)
	if (workspaceOnboardingState.workspaceSetupComplete && firstWorkspace.slug) {
		throw redirect(302, `/w/${firstWorkspace.slug}/chart`);
	}

	// Workspace exists but setup incomplete - find next step and redirect
	const nextStep = await client.query(api.features.onboarding.index.findNextOnboardingStep, {
		sessionId,
		workspaceId
	});

	// Redirect to the next step in the onboarding flow
	if (nextStep.nextRoute) {
		throw redirect(302, nextStep.nextRoute);
	}

	// Fallback: if no next route, show create workspace (shouldn't happen)
	return {
		showCreateWorkspace: true
	};
};
