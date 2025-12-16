/**
 * SYOS-814 Test Utilities
 *
 * These queries can be run from:
 * 1. Convex Dashboard → Functions → Run
 * 2. Browser console: `await convex.query('core/workspaces/testUtils:verifyIdentityChain', { sessionId: '...', workspaceId: '...' })`
 *
 * Use these to verify identity chain and access checks work correctly after migration.
 *
 * SYOS-814 Phase 3: Updated to reflect workspaceMembers table removal - all tests now use people table only.
 */

import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import {
	getPersonForSessionAndWorkspace,
	findPersonByUserAndWorkspace
} from '../../core/people/queries';
import {
	requireWorkspaceMembership,
	requireWorkspaceAdminOrOwner,
	getWorkspaceOwnerCount
} from '../../core/workspaces/access';
import type { Id as _Id } from '../../_generated/dataModel';

/**
 * Test 1: Verify Identity Chain Resolution
 *
 * Tests: sessionId → userId → personId → workspaceId
 *
 * Expected result:
 * - personId should exist
 * - person.status should be 'active'
 * - person.workspaceId should match provided workspaceId
 * - person.userId should match the userId from session
 */
export const verifyIdentityChain = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Test the identity chain
		const identityChain = await getPersonForSessionAndWorkspace(
			ctx,
			args.sessionId,
			args.workspaceId
		);

		// Also check direct lookup
		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId);

		return {
			success: true,
			identityChain: {
				sessionId: args.sessionId,
				userId,
				personId: identityChain.person._id,
				workspaceId: identityChain.workspaceId,
				status: identityChain.person.status,
				workspaceRole: identityChain.person.workspaceRole,
				displayName: identityChain.person.displayName
			},
			directLookup: person
				? {
						personId: person._id,
						status: person.status,
						workspaceRole: person.workspaceRole,
						userId: person.userId
					}
				: null,
			verification: {
				personExists: !!person,
				isActive: person?.status === 'active',
				workspaceMatches: person?.workspaceId === args.workspaceId,
				userIdMatches: person?.userId === userId,
				identityChainWorks: !!identityChain.person && identityChain.person.status === 'active'
			}
		};
	}
});

/**
 * Test 2: Verify Access Checks
 *
 * Tests: requireWorkspaceMembership and requireWorkspaceAdminOrOwner
 *
 * Expected result:
 * - Both should succeed (not throw)
 * - Membership should be returned
 * - Role should match person.workspaceRole
 */
export const verifyAccessChecks = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Test membership check
		const membership = await requireWorkspaceMembership(ctx, args.workspaceId, userId);

		// Test admin/owner check (may throw if user is just a member)
		let adminCheckResult: { success: boolean; error?: string; role?: string } = {
			success: false
		};
		try {
			const adminPerson = await requireWorkspaceAdminOrOwner(ctx, args.workspaceId, userId);
			adminCheckResult = {
				success: true,
				role: adminPerson.workspaceRole
			};
		} catch (error: any) {
			adminCheckResult = {
				success: false,
				error: error.message || 'Access denied'
			};
		}

		// Get person for comparison
		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId);

		// SYOS-814 Phase 3: membership is now a person record, not workspaceMembers
		return {
			success: true,
			membershipCheck: {
				passed: !!membership,
				membershipRole: membership.workspaceRole,
				workspaceId: membership.workspaceId,
				userId: membership.userId,
				personId: membership._id
			},
			adminCheck: adminCheckResult,
			personComparison: person
				? {
						personId: person._id,
						personWorkspaceRole: person.workspaceRole,
						rolesMatch: membership.workspaceRole === person.workspaceRole,
						status: person.status
					}
				: null,
			verification: {
				membershipCheckWorks: !!membership,
				rolesConsistent: person ? membership.workspaceRole === person.workspaceRole : false,
				personActive: person?.status === 'active'
			}
		};
	}
});

/**
 * Test 3: Verify People Record Exists
 *
 * Tests: Person record exists for workspace membership
 *
 * SYOS-814 Phase 3: Updated - workspaceMembers table removed, only checking people table
 *
 * Expected result:
 * - Person record should exist
 * - Person should be active
 * - Person should have correct workspaceId and userId
 */
export const verifyPeopleRecord = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get person record
		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId);

		return {
			success: true,
			person: person
				? {
						personId: person._id,
						workspaceId: person.workspaceId,
						userId: person.userId,
						workspaceRole: person.workspaceRole,
						status: person.status,
						displayName: person.displayName,
						joinedAt: person.joinedAt ?? person.invitedAt
					}
				: null,
			verification: {
				personExists: !!person,
				personIsActive: person?.status === 'active',
				workspaceMatches: person?.workspaceId === args.workspaceId,
				userIdMatches: person?.userId === userId
			}
		};
	}
});

/**
 * Test 4: Verify Owner Count
 *
 * Tests: getWorkspaceOwnerCount uses people table
 *
 * Expected result:
 * - Owner count should match number of active people with workspaceRole='owner'
 */
export const verifyOwnerCount = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get owner count (uses people table)
		const ownerCount = await getWorkspaceOwnerCount(ctx, args.workspaceId);

		// Manually count from people table
		const activePeople = await ctx.db
			.query('people')
			.withIndex('by_workspace_status', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('status', 'active')
			)
			.collect();

		const peopleOwnerCount = activePeople.filter((p) => p.workspaceRole === 'owner').length;

		// SYOS-814 Phase 3: workspaceMembers table removed - only comparing people table with function

		return {
			success: true,
			ownerCounts: {
				fromPeopleTable: peopleOwnerCount,
				fromAccessFunction: ownerCount
			},
			verification: {
				peopleTableMatchesFunction: peopleOwnerCount === ownerCount
			},
			details: {
				activePeople: activePeople.map((p) => ({
					personId: p._id,
					workspaceRole: p.workspaceRole,
					status: p.status
				}))
			}
		};
	}
});

/**
 * Test 5: Verify New Workspace Creation
 *
 * Tests: Creating a new workspace creates a people record
 *
 * SYOS-814 Phase 3: Updated - workspaceMembers table removed, only checking people table
 *
 * Note: This is a read-only test. To actually test creation, use the createWorkspace mutation.
 */
export const verifyWorkspaceRecords = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const workspace = await ctx.db.get(args.workspaceId);
		if (!workspace) {
			return {
				success: false,
				error: 'Workspace not found'
			};
		}

		// Get person record
		const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId);

		return {
			success: true,
			workspace: {
				workspaceId: workspace._id,
				name: workspace.name,
				slug: workspace.slug,
				createdAt: workspace.createdAt
			},
			person: person
				? {
						personId: person._id,
						workspaceRole: person.workspaceRole,
						status: person.status,
						displayName: person.displayName,
						createdAt: person.invitedAt,
						joinedAt: person.joinedAt ?? person.invitedAt
					}
				: null,
			verification: {
				personCreated: !!person,
				personIsActive: person?.status === 'active',
				personIsOwner: person?.workspaceRole === 'owner',
				workspaceMatches: person?.workspaceId === args.workspaceId,
				userIdMatches: person?.userId === userId
			}
		};
	}
});
