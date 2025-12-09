import { query } from '../../_generated/server';
import type { Doc } from '../../_generated/dataModel';

/**
 * Assignments domain query scaffold.
 */
export const listAssignments = query({
	args: {},
	handler: async (): Promise<Doc<'assignments'>[]> => {
		// SYOS-707 scaffold: return empty list instead of throwing
		return [];
	}
});
