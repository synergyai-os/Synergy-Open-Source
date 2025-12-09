import { query } from '../../_generated/server';
import type { Doc } from '../../_generated/dataModel';

/**
 * People domain query scaffold.
 */
export const listPeople = query({
	args: {},
	handler: async (): Promise<Doc<'people'>[]> => {
		// SYOS-707 scaffold: return empty list instead of throwing
		return [];
	}
});
