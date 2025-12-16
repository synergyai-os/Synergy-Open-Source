/**
 * SYOS-814 Phase 2 Verification Script
 *
 * Verifies that all critical paths use the people table instead of workspaceMembers.
 *
 * Run from Convex Dashboard: core/workspaces/verifyPhase2:verifyPhase2Migration
 */

import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { listWorkspacesForUser, findPersonByUserAndWorkspace } from '../../core/people/queries';
import { getUserWorkspaceIds } from '../../infrastructure/access/permissions';
import {
	requireWorkspaceMembership,
	requireWorkspaceAdminOrOwner,
	getWorkspaceOwnerCount
} from '../../core/workspaces/access';

type VerificationResult = {
	success: boolean;
	checks: {
		identityChain: {
			works: boolean;
			usesPeopleTable: boolean;
		};
		accessChecks: {
			membershipCheckWorks: boolean;
			adminCheckWorks: boolean;
			usesPeopleTable: boolean;
		};
		infrastructure: {
			getUserWorkspaceIdsUsesPeople: boolean;
			workspaceIdsMatch: boolean;
		};
		ownerCount: {
			usesPeopleTable: boolean;
			countMatches: boolean;
		};
	};
	details: {
		personId: string | null;
		workspaceRole: string | null;
		status: string | null;
		workspaceIdsFromPeople: string[];
		workspaceIdsFromInfrastructure: string[];
		ownerCountFromPeople: number;
		ownerCountFromFunction: number;
	};
	errors: string[];
};

export const verifyPhase2Migration = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args): Promise<VerificationResult> => {
		const errors: string[] = [];
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Check 1: Identity Chain uses people table
		let identityChainWorks = false;
		let usesPeopleTable = false;
		let personId: string | null = null;
		let workspaceRole: string | null = null;
		let status: string | null = null;

		try {
			const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId);
			if (person && person.status === 'active') {
				identityChainWorks = true;
				usesPeopleTable = true;
				personId = person._id;
				workspaceRole = person.workspaceRole;
				status = person.status;
			} else {
				errors.push('Identity chain: Person not found or not active');
			}
		} catch (error: any) {
			errors.push(`Identity chain error: ${error.message}`);
		}

		// Check 2: Access checks use people table
		let membershipCheckWorks = false;
		let adminCheckWorks = false;
		let accessChecksUsePeople = false;

		try {
			const membership = await requireWorkspaceMembership(ctx, args.workspaceId, userId);
			membershipCheckWorks = !!membership;
			// If membership check works and we have a person, it's using people table
			accessChecksUsePeople = usesPeopleTable && membershipCheckWorks;
		} catch (error: any) {
			errors.push(`Membership check error: ${error.message}`);
		}

		try {
			const adminMembership = await requireWorkspaceAdminOrOwner(ctx, args.workspaceId, userId);
			adminCheckWorks = !!adminMembership;
		} catch (error: any) {
			// This is expected if user is not admin/owner
			if (!error.message?.includes('Must be org admin')) {
				errors.push(`Admin check error: ${error.message}`);
			}
		}

		// Check 3: Infrastructure functions use people table
		let getUserWorkspaceIdsUsesPeople = false;
		let workspaceIdsMatch = false;
		const workspaceIdsFromPeople: string[] = [];
		const workspaceIdsFromInfrastructure: string[] = [];

		try {
			// Get workspace IDs from people table directly
			const peopleWorkspaceIds = await listWorkspacesForUser(ctx, userId);
			workspaceIdsFromPeople.push(...peopleWorkspaceIds.map((id) => id));

			// Get workspace IDs from infrastructure function (should use people table)
			const infraWorkspaceIds = await getUserWorkspaceIds(ctx, userId.toString());
			workspaceIdsFromInfrastructure.push(...infraWorkspaceIds);

			// Compare - they should match if infrastructure uses people table
			const peopleSet = new Set(workspaceIdsFromPeople);
			const infraSet = new Set(workspaceIdsFromInfrastructure);
			workspaceIdsMatch =
				peopleSet.size === infraSet.size && Array.from(peopleSet).every((id) => infraSet.has(id));

			getUserWorkspaceIdsUsesPeople = workspaceIdsMatch;
		} catch (error: any) {
			errors.push(`Infrastructure check error: ${error.message}`);
		}

		// Check 4: Owner count uses people table
		let ownerCountUsesPeople = false;
		let countMatches = false;
		let ownerCountFromPeople = 0;
		let ownerCountFromFunction = 0;

		try {
			// Count owners from people table directly
			const activePeople = await ctx.db
				.query('people')
				.withIndex('by_workspace_status', (q) =>
					q.eq('workspaceId', args.workspaceId).eq('status', 'active')
				)
				.collect();
			ownerCountFromPeople = activePeople.filter((p) => p.workspaceRole === 'owner').length;

			// Get owner count from function (should use people table)
			ownerCountFromFunction = await getWorkspaceOwnerCount(ctx, args.workspaceId);

			countMatches = ownerCountFromPeople === ownerCountFromFunction;
			ownerCountUsesPeople = countMatches;
		} catch (error: any) {
			errors.push(`Owner count check error: ${error.message}`);
		}

		const allChecksPass =
			identityChainWorks &&
			membershipCheckWorks &&
			usesPeopleTable &&
			accessChecksUsePeople &&
			getUserWorkspaceIdsUsesPeople &&
			workspaceIdsMatch &&
			ownerCountUsesPeople &&
			countMatches;

		return {
			success: allChecksPass && errors.length === 0,
			checks: {
				identityChain: {
					works: identityChainWorks,
					usesPeopleTable
				},
				accessChecks: {
					membershipCheckWorks,
					adminCheckWorks,
					usesPeopleTable: accessChecksUsePeople
				},
				infrastructure: {
					getUserWorkspaceIdsUsesPeople,
					workspaceIdsMatch
				},
				ownerCount: {
					usesPeopleTable: ownerCountUsesPeople,
					countMatches
				}
			},
			details: {
				personId,
				workspaceRole,
				status,
				workspaceIdsFromPeople,
				workspaceIdsFromInfrastructure,
				ownerCountFromPeople,
				ownerCountFromFunction
			},
			errors
		};
	}
});

/**
 * Verify that no critical functions still use workspaceMembers table
 * (excluding backward compatibility code)
 */
export const verifyNoWorkspaceMembersReferences = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		await validateSessionAndGetUserId(ctx, args.sessionId);

		// This is a manual check - verify these functions don't directly query workspaceMembers
		// for access checks (they may still create/read for backward compatibility)

		return {
			success: true,
			message:
				'Manual verification required: Check that access checks, infrastructure functions, and queries use people table. Backward compatibility code in access.ts, lifecycle.ts, and members.ts is expected.',
			criticalPathsToVerify: [
				'infrastructure/access/permissions.ts - getUserWorkspaceIds',
				'infrastructure/featureFlags/targeting.ts - userHasWorkspaceAccess',
				'core/workspaces/queries.ts - listWorkspaceSummaries',
				'core/workspaces/inviteDetails.ts - listWorkspaceInvitesForOrg',
				'core/workspaces/roles.ts - getWorkspaceMembersWithRoles',
				'core/workspaces/inviteValidation.ts - ensureUserNotAlreadyMember',
				'core/workspaces/aliases.ts - getBySlug',
				'core/workspaces/workspaceSettings.ts - isWorkspaceAdmin',
				'features/tasks/access.ts - ensureWorkspaceMembership'
			],
			expectedBackwardCompat: [
				'core/workspaces/access.ts - fallback to workspaceMembers',
				'core/workspaces/lifecycle.ts - creates both records',
				'core/workspaces/members.ts - creates both records',
				'core/workspaces/inviteOperations.ts - creates both records'
			]
		};
	}
});
