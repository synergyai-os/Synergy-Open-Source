import { action } from '../../_generated/server';
import { v } from 'convex/values';

import { fetchFlashcardsFromSourceHelper } from './importExport';

export const fetchFlashcardsFromSource = action({
	args: {
		sessionId: v.string(),
		text: v.string(),
		sourceTitle: v.optional(v.string()),
		sourceAuthor: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		return fetchFlashcardsFromSourceHelper(ctx, args);
	}
});
