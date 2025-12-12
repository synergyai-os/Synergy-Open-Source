import { internalAction } from '../_generated/server';
import { internal } from '../_generated/api';
import { v } from 'convex/values';
import type { InvariantResult } from './invariants/types';

const severity = v.union(v.literal('critical'), v.literal('warning'));

/**
 * INTERNAL-ONLY: Invariants runner for CI/ops health checks.
 * Auth exemption per architecture.md: "internal endpoints with provably closed access".
 * Not user-facing - no sessionId required.
 */
export const runAll = internalAction({
	args: {
		category: v.optional(v.string()),
		severityFilter: v.optional(severity)
	},
	handler: async (
		ctx,
		args
	): Promise<{
		summary: {
			total: number;
			passed: number;
			failed: number;
			criticalFailed: number;
		};
		allPassed: boolean;
		criticalsPassed: boolean;
		results: InvariantResult[];
	}> => {
		return await ctx.runQuery(internal.admin.invariants.index.runAll, args);
	}
});
