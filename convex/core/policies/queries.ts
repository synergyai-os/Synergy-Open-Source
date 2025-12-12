import { query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Doc } from '../../_generated/dataModel';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';

/**
 * Policies domain query scaffold.
 */
export const listPolicies = query({
	args: { sessionId: v.string() },
	handler: async (ctx, args): Promise<Doc<'policies'>[]> => {
		await validateSessionAndGetUserId(ctx, args.sessionId);
		// SYOS-707 scaffold: return empty list instead of throwing
		return [];
	}
});
