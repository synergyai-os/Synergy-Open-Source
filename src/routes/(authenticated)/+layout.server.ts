import { redirect } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import type { Id } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { LayoutServerLoad } from './$types';
// Initialize module registry (registers all modules)
import '$lib/modules';
import { logger } from '$lib/utils/logger';

// Enforce authentication for all routes in this group
export const load: LayoutServerLoad = async ({ locals, url }) => {
	// If user is not authenticated, redirect to login
	if (!locals.auth.sessionId) {
		throw redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
	}

	// Initialize Convex client early (needed for onboarding checks)
	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	const sessionId = locals.auth.sessionId;

	// Load workspaces early to determine activeOrgId for onboarding checks
	let workspaces: unknown[] = [];
	let activeOrgId: string | null = null;
	try {
		workspaces = (await client.query(api.core.workspaces.index.listWorkspaces, {
			sessionId
		})) as unknown[];
		const orgsList = workspaces as Array<{ workspaceId: string }>;
		activeOrgId = orgsList.length > 0 ? orgsList[0].workspaceId : null;
	} catch (error) {
		// If query fails, continue with empty workspaces (will be handled by onboarding checks)
		logger.error('layout', 'Failed to load workspaces for onboarding checks', {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined
		});
	}

	// SYOS-891: Onboarding guards
	// Skip guards for specific routes
	const isOnboardingRoute = url.pathname.startsWith('/onboarding');
	const isAccountRoute = url.pathname.startsWith('/account');
	const isAdminRoute = url.pathname.startsWith('/admin');
	const isTestRoute =
		url.pathname.startsWith('/test') ||
		url.pathname.startsWith('/demo-control-panel') ||
		url.pathname.startsWith('/my-mind');

	// Check onboarding state for guards
	if (isOnboardingRoute) {
		// Reverse guard: prevent completed users from accessing onboarding routes
		try {
			const onboardingState = await client.query(
				api.features.onboarding.index.findOnboardingState,
				{
					sessionId,
					workspaceId: activeOrgId ? (activeOrgId as Id<'workspaces'>) : undefined
				}
			);

			// If user has workspaces and setup is complete, redirect to workspace
			if (
				onboardingState.hasWorkspaces &&
				onboardingState.workspaceSetupComplete &&
				onboardingState.userOnboardingComplete &&
				activeOrgId
			) {
				// Get workspace slug for redirect
				const workspace = (workspaces as Array<{ workspaceId: string; slug: string }>).find(
					(w) => w.workspaceId === activeOrgId
				);
				if (workspace) {
					throw redirect(302, `/w/${workspace.slug}/circles`);
				}
			}
		} catch (error) {
			// If it's already a redirect, re-throw it
			if (error instanceof Response && error.status === 302) {
				throw error;
			}
			// Otherwise log error and continue
			logger.error('layout', 'Failed to check onboarding state for reverse guard', {
				error: error instanceof Error ? error.message : String(error),
				errorString: String(error),
				stack: error instanceof Error ? error.stack : undefined
			});
		}
	} else if (!isAccountRoute && !isAdminRoute && !isTestRoute) {
		// Check onboarding state for all other authenticated routes
		// SECURITY: Fail closed - if check fails, redirect to onboarding
		try {
			const onboardingState = await client.query(
				api.features.onboarding.index.findOnboardingState,
				{
					sessionId,
					workspaceId: activeOrgId ? (activeOrgId as Id<'workspaces'>) : undefined
				}
			);

			// Guard logic (from ticket spec)
			if (!onboardingState.hasWorkspaces) {
				// No workspaces at all → redirect to workspace creation
				throw redirect(302, '/onboarding');
			}

			// SECURITY: If user has workspaces, MUST check onboarding completion
			// If activeOrgId is null but user has workspaces, use first workspace for check
			if (onboardingState.hasWorkspaces) {
				// If we have an active workspace, check its onboarding status
				if (activeOrgId) {
					if (!onboardingState.workspaceSetupComplete) {
						// Current workspace setup not complete → redirect to workspace setup
						throw redirect(302, '/onboarding');
					}

					if (!onboardingState.userOnboardingComplete) {
						// User onboarding not complete → redirect to user onboarding
						throw redirect(302, '/onboarding/welcome');
					}
				} else {
					// User has workspaces but activeOrgId is null (load failed or empty)
					// Re-query workspaces to get first workspace and enforce onboarding
					const orgsList = workspaces as Array<{ workspaceId: string }>;
					let firstWorkspaceId: string | null = null;

					if (orgsList.length > 0) {
						firstWorkspaceId = orgsList[0].workspaceId;
					} else {
						// Initial load failed but user has workspaces - re-query
						try {
							const reQueriedWorkspaces = (await client.query(
								api.core.workspaces.index.listWorkspaces,
								{ sessionId }
							)) as unknown[];
							const reQueriedList = reQueriedWorkspaces as Array<{ workspaceId: string }>;
							if (reQueriedList.length > 0) {
								firstWorkspaceId = reQueriedList[0].workspaceId;
							}
						} catch (reQueryError) {
							// If re-query fails, fail closed - redirect to onboarding
							logger.error('layout', 'Failed to re-query workspaces for onboarding check', {
								error: reQueryError instanceof Error ? reQueryError.message : String(reQueryError)
							});
							throw redirect(302, '/onboarding');
						}
					}

					if (firstWorkspaceId) {
						const firstWorkspaceState = await client.query(
							api.features.onboarding.index.findOnboardingState,
							{
								sessionId,
								workspaceId: firstWorkspaceId as Id<'workspaces'>
							}
						);

						if (!firstWorkspaceState.workspaceSetupComplete) {
							throw redirect(302, '/onboarding');
						}

						if (!firstWorkspaceState.userOnboardingComplete) {
							throw redirect(302, '/onboarding/welcome');
						}
					} else {
						// User has workspaces according to query but can't load them - fail closed
						throw redirect(302, '/onboarding');
					}
				}
			}
		} catch (error) {
			// If it's already a redirect, re-throw it
			if (error instanceof Response && error.status === 302) {
				throw error;
			}
			// SECURITY: Fail closed - if onboarding check fails, redirect to onboarding
			// This prevents users from accessing workspace if check fails
			logger.error('layout', 'Failed to check onboarding state - redirecting to onboarding', {
				error: error instanceof Error ? error.message : String(error),
				errorString: String(error),
				stack: error instanceof Error ? error.stack : undefined
			});
			// Fail closed: redirect to onboarding if check fails
			throw redirect(302, '/onboarding');
		}
	}

	// ============================================================================
	// STEP 1: Core features are always enabled (no feature flags)
	// ============================================================================
	// Meetings and circles are core features - always available
	const meetingsEnabled = true;
	const circlesEnabled = true;

	// ============================================================================
	// STEP 2: Load CORE data (always needed, regardless of module flags)
	// ============================================================================
	// Core data is required for all authenticated routes:
	// - Organizations: Workspace menu, workspace context
	// - Permissions: RBAC checks, button visibility
	// - Tags: QuickCreateModal, tagging functionality
	// This data is NOT module-specific and should always load
	// ============================================================================
	// Load workspace invites (workspaces already loaded above for onboarding checks)
	let workspaceInvites: unknown[] = [];
	let permissions: unknown[] = [];
	let tags: unknown[] = [];
	try {
		// Reload workspaces if earlier load failed, otherwise reuse
		if (workspaces.length === 0) {
			logger.debug('layout', 'Reloading workspaces (previous load failed)', { sessionId });
			workspaces = (await client.query(api.core.workspaces.index.listWorkspaces, {
				sessionId
			})) as unknown[];
			const orgsList = workspaces as Array<{ workspaceId: string }>;
			activeOrgId = orgsList.length > 0 ? orgsList[0].workspaceId : null;
		}

		// Load workspace invites
		workspaceInvites = (await client.query(api.features.invites.index.listWorkspaceInvites, {
			sessionId
		})) as unknown[];

		logger.debug('layout', 'Organizations loaded', {
			orgsCount: workspaces.length,
			invitesCount: workspaceInvites.length,
			orgs: (workspaces as Array<{ workspaceId?: string; name?: string }>).map((o) => ({
				id: o?.workspaceId,
				name: o?.name
			}))
		});
	} catch (error) {
		// If queries fail, default to empty arrays (safe fallback)
		// Log error but don't block page load
		logger.error('layout', 'Failed to load workspaces/invites server-side', {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined
		});
	}

	// Determine active workspace for permissions/tags preload
	// Path-based routing: workspace context comes from route params (/w/[slug]/)
	// For non-workspace routes (like /account), use first workspace for preload
	const orgsList = workspaces as Array<{ workspaceId: string }>;
	if (!activeOrgId && orgsList.length > 0) {
		activeOrgId = orgsList[0].workspaceId;
	}

	// Continue with preloading permissions/tags only if we have workspaces
	if (orgsList.length > 0) {
		try {
			// Preload permissions for active workspace context (if available)
			try {
				const permissionsResult = await client.query(
					api.infrastructure.rbac.permissions.getUserPermissionsQuery,
					{
						sessionId,
						...(activeOrgId ? { workspaceId: activeOrgId as Id<'workspaces'> } : {})
					}
				);
				permissions = permissionsResult as unknown[];
			} catch (error) {
				console.warn('Failed to load permissions server-side:', error);
			}

			// Preload tags for QuickCreateModal instant rendering (filtered by active workspace)
			try {
				tags = await client.query(api.features.tags.index.listAllTags, {
					sessionId,
					...(activeOrgId ? { workspaceId: activeOrgId as Id<'workspaces'> } : {})
				});
			} catch (error) {
				console.warn('Failed to load tags server-side:', error);
			}
		} catch (error) {
			// If queries fail, default to empty arrays (safe fallback)
			// Log error but don't block page load
			console.warn('Failed to load permissions/tags server-side:', error);
		}
	}

	// ============================================================================
	// STEP 3: Load MODULE-SPECIFIC data (core features always enabled)
	// ============================================================================
	// Meetings and circles are core features - load data when workspace is available
	const meetingsData: unknown = activeOrgId
		? (() => {
				try {
					// TODO: Add meetings-specific data loading here when needed
					// Example:
					// return await client.query(api.modules.meetings.meetings.listUpcoming, {
					//   sessionId,
					//   workspaceId: activeOrgId as Id<'workspaces'>
					// });
					return null;
				} catch (error) {
					console.warn('Failed to load meetings data server-side:', error);
					// Don't block page load if optional module data fails
					return null;
				}
			})()
		: null;

	const circlesData: unknown = activeOrgId
		? (() => {
				try {
					// TODO: Add circles-specific data loading here when needed
					// Example:
					// return await client.query(api.core.circles.index.list, {
					//   sessionId,
					//   workspaceId: activeOrgId as Id<'workspaces'>
					// });
					return null;
				} catch (error) {
					console.warn('Failed to load circles data server-side:', error);
					// Don't block page load if optional module data fails
					return null;
				}
			})()
		: null;

	// ============================================================================
	// Load org branding for active workspace (Phase 2: Org Branding)
	// ============================================================================
	let workspaceId: string | null = null;
	let orgBranding: { primaryColor: string; secondaryColor: string; logo?: string } | null = null;

	if (activeOrgId) {
		workspaceId = activeOrgId;
		try {
			const brandingResult = await client.query(api.features.workspaceBranding.index.findBranding, {
				sessionId: locals.auth.sessionId,
				workspaceId: activeOrgId as Id<'workspaces'>
			});
			orgBranding = brandingResult as {
				primaryColor: string;
				secondaryColor: string;
				logo?: string;
			} | null;
		} catch (error) {
			console.warn('Failed to load org branding server-side:', error);
			// Don't block page load if branding query fails
			orgBranding = null;
		}
	}

	// ============================================================================
	// Return data to client
	// ============================================================================
	return {
		user: locals.auth.user,
		isAuthenticated: true,
		// Expose sessionId to client for Convex authentication
		// Security: sessionId is already validated by hooks.server.ts middleware
		// and cryptographically signed - safe to expose for auth purposes
		sessionId,
		// Feature flags loaded server-side for instant rendering
		circlesEnabled,
		meetingsEnabled,
		// Core data (always loaded)
		workspaces,
		workspaceInvites,
		permissions,
		tags,
		// Org branding (Phase 2)
		workspaceId,
		orgBranding,
		// Module-specific data (only loaded if flags enabled)
		meetingsData,
		circlesData
	};
};
