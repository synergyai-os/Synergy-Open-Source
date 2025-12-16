import { internalQuery } from '../../_generated/server';
import { internal } from '../../_generated/api';
import { v } from 'convex/values';
import type { InvariantResult } from './types';

/**
 * All invariant check functions to run.
 * Uses Convex internal API references for proper function invocation.
 * Keep in sync with INVARIANTS.md (SYOS-803).
 */
const checkRefs = [
	// Identity (9)
	internal.admin.invariants.identity.checkIDENT01,
	internal.admin.invariants.identity.checkIDENT02,
	internal.admin.invariants.identity.checkIDENT03,
	internal.admin.invariants.identity.checkIDENT04,
	internal.admin.invariants.identity.checkIDENT05,
	internal.admin.invariants.identity.checkIDENT06,
	internal.admin.invariants.identity.checkIDENT07,
	internal.admin.invariants.identity.checkIDENT08,
	internal.admin.invariants.identity.checkIDENT09,
	// Organization (9)
	internal.admin.invariants.organization.checkORG01,
	internal.admin.invariants.organization.checkORG02,
	internal.admin.invariants.organization.checkORG03,
	internal.admin.invariants.organization.checkORG04,
	internal.admin.invariants.organization.checkORG05,
	internal.admin.invariants.organization.checkORG06,
	internal.admin.invariants.organization.checkORG07,
	internal.admin.invariants.organization.checkORG08,
	internal.admin.invariants.organization.checkORG09,
	// Circle Membership (4)
	internal.admin.invariants.circleMembership.checkCMEM01,
	internal.admin.invariants.circleMembership.checkCMEM02,
	internal.admin.invariants.circleMembership.checkCMEM03,
	internal.admin.invariants.circleMembership.checkCMEM04,
	// Roles (6)
	internal.admin.invariants.roles.checkROLE01,
	internal.admin.invariants.roles.checkROLE02,
	internal.admin.invariants.roles.checkROLE03,
	internal.admin.invariants.roles.checkROLE04,
	internal.admin.invariants.roles.checkROLE05,
	internal.admin.invariants.roles.checkROLE06,
	// Assignments (6)
	internal.admin.invariants.assignments.checkASSIGN01,
	internal.admin.invariants.assignments.checkASSIGN02,
	internal.admin.invariants.assignments.checkASSIGN03,
	internal.admin.invariants.assignments.checkASSIGN04,
	internal.admin.invariants.assignments.checkASSIGN05,
	internal.admin.invariants.assignments.checkASSIGN06,
	// Legacy Assignments removed (SYOS-815: userCircleRoles table migrated to assignments)
	// Authority (4)
	internal.admin.invariants.authority.checkAUTH01,
	internal.admin.invariants.authority.checkAUTH02,
	internal.admin.invariants.authority.checkAUTH03,
	internal.admin.invariants.authority.checkAUTH04,
	// Proposals (6)
	internal.admin.invariants.proposals.checkPROP01,
	internal.admin.invariants.proposals.checkPROP02,
	internal.admin.invariants.proposals.checkPROP03,
	internal.admin.invariants.proposals.checkPROP04,
	internal.admin.invariants.proposals.checkPROP05,
	internal.admin.invariants.proposals.checkPROP06,
	// History (4)
	internal.admin.invariants.history.checkHIST01,
	internal.admin.invariants.history.checkHIST02,
	internal.admin.invariants.history.checkHIST03,
	internal.admin.invariants.history.checkHIST04,
	// Workspaces (5)
	internal.admin.invariants.workspaces.checkWS01,
	internal.admin.invariants.workspaces.checkWS02,
	internal.admin.invariants.workspaces.checkWS03,
	internal.admin.invariants.workspaces.checkWS04,
	internal.admin.invariants.workspaces.checkWS05,
	// Cross-domain (5)
	internal.admin.invariants.crossDomain.checkXDOM01,
	internal.admin.invariants.crossDomain.checkXDOM02,
	internal.admin.invariants.crossDomain.checkXDOM03,
	internal.admin.invariants.crossDomain.checkXDOM04,
	internal.admin.invariants.crossDomain.checkXDOM05
];

export const runAll = internalQuery({
	args: {
		category: v.optional(v.string()),
		severityFilter: v.optional(v.union(v.literal('critical'), v.literal('warning')))
	},
	handler: async (ctx, args) => {
		const results: InvariantResult[] = [];

		for (const checkRef of checkRefs) {
			const result = (await ctx.runQuery(checkRef, {})) as InvariantResult;

			if (args.category && !result.id.startsWith(args.category)) continue;
			if (args.severityFilter && result.severity !== args.severityFilter) continue;

			results.push(result);
		}

		const failed = results.filter((r) => !r.passed);
		const criticalFailed = failed.filter((r) => r.severity === 'critical');

		return {
			summary: {
				total: results.length,
				passed: results.length - failed.length,
				failed: failed.length,
				criticalFailed: criticalFailed.length
			},
			allPassed: failed.length === 0,
			criticalsPassed: criticalFailed.length === 0,
			results
		};
	}
});

export type { InvariantResult };
