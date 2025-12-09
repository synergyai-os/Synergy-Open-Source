import { query } from '../../_generated/server';
import type { Doc } from '../../_generated/dataModel';

/**
 * Policies domain query scaffold.
 */
export const listPolicies = query({
	args: {},
	handler: async (): Promise<Doc<'policies'>[]> => {
		// SYOS-707 scaffold: return empty list instead of throwing
		return [];
	}
});
