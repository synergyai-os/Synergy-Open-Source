import { redirect } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import type { Id } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { LayoutServerLoad } from './$types';
// Initialize module registry (registers all modules)
import '$lib/modules';
import { getEnabledModules, isModuleEnabled } from '$lib/modules/registry';

// Enforce authentication for all routes in this group
export const load: LayoutServerLoad = async ({ locals, url }) => {
	// If user is not authenticated, redirect to login
	if (!locals.auth.sessionId) {
		throw redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
	}

	// Load data server-side for instant rendering (no client-side query delay)
	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	const sessionId = locals.auth.sessionId;

	// ============================================================================
	// STEP 1: Check feature flags FIRST (before any module-specific data loading)
	// ============================================================================
	// CRITICAL: Feature flags must be checked BEFORE loading module-specific data
	// This enables true independent enablement and prevents unnecessary queries
	// Pattern: Use module registry to discover enabled modules
	// See: SYOS-301 (Module Registry), SYOS-303 (Registry Integration)
	// ============================================================================
	// Use module registry to determine which modules are enabled
	let meetingsEnabled = false;
	let circlesEnabled = false; // Legacy flag check (not yet in registry)
	try {
		// Get enabled modules from registry (checks feature flags automatically)
		// Note: enabledModules list is available for future use (e.g., dynamic module loading)
		await getEnabledModules(
			sessionId,
			client as unknown as { query: (query: unknown, args: unknown) => Promise<unknown> }
		);
		meetingsEnabled = await isModuleEnabled(
			'meetings',
			sessionId,
			client as unknown as { query: (query: unknown, args: unknown) => Promise<unknown> }
		);

		// Legacy: Check circles flag directly (not yet migrated to module registry)
		circlesEnabled = (await client.query(api.featureFlags.checkFlag, {
			flag: 'circles_ui_beta',
			sessionId
		})) as boolean;
	} catch (error) {
		console.warn('Failed to load feature flags server-side:', error);
		// Default to false (modules disabled) on error
		meetingsEnabled = false;
		circlesEnabled = false;
	}

	// ============================================================================
	// STEP 2: Load CORE data (always needed, regardless of module flags)
	// ============================================================================
	// Core data is required for all authenticated routes:
	// - Organizations: Workspace menu, organization context
	// - Teams: Sidebar navigation, team context
	// - Permissions: RBAC checks, button visibility
	// - Tags: QuickCreateModal, tagging functionality
	// This data is NOT module-specific and should always load
	// ============================================================================
	// Load organizations and invites for instant workspace menu rendering
	let organizations: unknown[] = [];
	let organizationInvites: unknown[] = [];
	let teamInvites: unknown[] = [];
	let teams: unknown[] = [];
	let permissions: unknown[] = [];
	let tags: unknown[] = [];
	try {
		const [orgsResult, invitesResult, teamInvitesResult] = await Promise.all([
			client.query(api.organizations.listOrganizations, { sessionId }),
			client.query(api.organizations.listOrganizationInvites, { sessionId }),
			client.query(api.teams.listTeamInvites, { sessionId })
		]);
		organizations = orgsResult as unknown[];
		organizationInvites = invitesResult as unknown[];
		teamInvites = teamInvitesResult as unknown[];
	} catch (error) {
		// If queries fail, default to empty arrays (safe fallback)
		// Log error but don't block page load
		console.warn('Failed to load organizations/invites server-side:', error);
	}

	// Determine active organization for teams/permissions preload
	// Priority: URL param (if valid) > first organization (users always have at least one workspace)
	const orgParam = url.searchParams.get('org');
	const orgsList = organizations as Array<{ organizationId: string }>;

	// Redirect to onboarding if user has no organizations (SYOS-209)
	// This check must happen AFTER loading organizations but BEFORE other queries
	if (orgsList.length === 0 && url.pathname !== '/onboarding') {
		throw redirect(302, '/onboarding');
	}

	// Validate orgParam: Only use it if user actually has access to that organization
	// This prevents 500 errors when switching accounts (org param from previous account)
	const validOrgParam =
		orgParam && orgsList.some((org) => org.organizationId === orgParam) ? orgParam : null;
	const activeOrgId = validOrgParam || (orgsList.length > 0 ? orgsList[0].organizationId : null);

	// Log if org param was invalid (for debugging)
	if (orgParam && !validOrgParam) {
		console.warn('Invalid org parameter in URL (user does not have access):', {
			orgParam,
			userOrgs: orgsList.map((org) => org.organizationId),
			fallbackTo: activeOrgId
		});
	}

	// Continue with preloading teams/permissions/tags only if we have organizations
	if (orgsList.length > 0) {
		try {
			// Preload teams for active organization (if available)
			if (activeOrgId) {
				try {
					const teamsResult = await client.query(api.teams.listTeams, {
						sessionId,
						organizationId: activeOrgId as Id<'organizations'>
					});
					teams = teamsResult as unknown[];
				} catch (error) {
					console.warn('Failed to load teams server-side:', error);
				}
			}

			// Preload permissions for active organization context (if available)
			try {
				const permissionsResult = await client.query(api.rbac.permissions.getUserPermissionsQuery, {
					sessionId,
					...(activeOrgId ? { organizationId: activeOrgId as Id<'organizations'> } : {})
				});
				permissions = permissionsResult as unknown[];
			} catch (error) {
				console.warn('Failed to load permissions server-side:', error);
			}

			// Preload tags for QuickCreateModal instant rendering (filtered by active organization)
			try {
				tags = await client.query(api.tags.listAllTags, {
					sessionId,
					...(activeOrgId ? { organizationId: activeOrgId as Id<'organizations'> } : {})
				});
			} catch (error) {
				console.warn('Failed to load tags server-side:', error);
			}
		} catch (error) {
			// If queries fail, default to empty arrays (safe fallback)
			// Log error but don't block page load
			console.warn('Failed to load teams/permissions/tags server-side:', error);
		}
	}

	// ============================================================================
	// STEP 3: Conditionally load MODULE-SPECIFIC data (only if flags enabled)
	// ============================================================================
	// Module-specific data should ONLY load when the module is enabled via feature flag
	// This enables independent enablement and improves performance
	// Pattern: if (moduleEnabled) { load module data }
	// ============================================================================

	// Meetings module data (only load if meetings-module flag enabled)
	const meetingsData: unknown =
		meetingsEnabled && activeOrgId
			? (() => {
					try {
						// TODO: Add meetings-specific data loading here when needed
						// Example:
						// return await client.query(api.meetings.listUpcoming, {
						//   sessionId,
						//   organizationId: activeOrgId as Id<'organizations'>
						// });
						return null;
					} catch (error) {
						console.warn('Failed to load meetings data server-side:', error);
						// Don't block page load if optional module data fails
						return null;
					}
				})()
			: null;

	// Circles module data (only load if circles_ui_beta flag enabled)
	const circlesData: unknown =
		circlesEnabled && activeOrgId
			? (() => {
					try {
						// TODO: Add circles-specific data loading here when needed
						// Example:
						// return await client.query(api.circles.list, {
						//   sessionId,
						//   organizationId: activeOrgId as Id<'organizations'>
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
		organizations,
		organizationInvites,
		teamInvites,
		teams,
		permissions,
		tags,
		// Module-specific data (only loaded if flags enabled)
		meetingsData,
		circlesData
	};
};
