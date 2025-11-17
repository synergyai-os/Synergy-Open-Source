import { redirect } from '@sveltejs/kit';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$lib/convex';
import type { Id } from '$lib/convex';
import { env } from '$env/dynamic/public';
import type { LayoutServerLoad } from './$types';

// Enforce authentication for all routes in this group
export const load: LayoutServerLoad = async ({ locals, url }) => {
	// If user is not authenticated, redirect to login
	if (!locals.auth.sessionId) {
		throw redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
	}

	// Load data server-side for instant rendering (no client-side query delay)
	const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
	const sessionId = locals.auth.sessionId;

	// Load feature flags
	let circlesEnabled = false;
	let meetingsEnabled = false;
	try {
		[circlesEnabled, meetingsEnabled] = await Promise.all([
			client.query(api.featureFlags.checkFlag, {
				flag: 'circles_ui_beta',
				sessionId
			}),
			client.query(api.featureFlags.checkFlag, {
				flag: 'meetings-module', // SYOS-226: organization-based targeting
				sessionId
			})
		]);
	} catch (error) {
		console.warn('Failed to load feature flags server-side:', error);
	}

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
	// Priority: URL param > first organization > null (personal workspace)
	const orgParam = url.searchParams.get('org');
	const orgsList = organizations as Array<{ organizationId: string }>;

	// Redirect to onboarding if user has no organizations (SYOS-209)
	// This check must happen AFTER loading organizations but BEFORE other queries
	if (orgsList.length === 0 && url.pathname !== '/onboarding') {
		throw redirect(302, '/onboarding');
	}

	const activeOrgId = orgParam || (orgsList.length > 0 ? orgsList[0].organizationId : null);

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

			// Preload tags for QuickCreateModal instant rendering
			try {
				tags = await client.query(api.tags.listAllTags, { sessionId });
			} catch (error) {
				console.warn('Failed to load tags server-side:', error);
			}
		} catch (error) {
			// If queries fail, default to empty arrays (safe fallback)
			// Log error but don't block page load
			console.warn('Failed to load teams/permissions/tags server-side:', error);
		}
	}

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
		// Organizations and invites loaded server-side for instant workspace menu
		organizations,
		organizationInvites,
		teamInvites,
		// Teams loaded server-side for active organization (instant sidebar rendering)
		teams,
		// Permissions loaded server-side for active organization context (instant button visibility)
		permissions,
		// Tags loaded server-side for QuickCreateModal (instant tag dropdown)
		tags
	};
};
