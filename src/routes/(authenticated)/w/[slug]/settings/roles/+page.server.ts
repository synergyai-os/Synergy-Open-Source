import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	if (!locals.auth.sessionId) {
		throw error(401, 'Unauthorized');
	}

	// Get workspaceId from parent layout (resolved from slug)
	const parentData = await parent();
	const workspaceId = parentData.workspaceId as string | undefined;

	if (!workspaceId) {
		throw error(404, 'Workspace not found');
	}

	return {
		sessionId: locals.auth.sessionId,
		workspaceId
	};
};
