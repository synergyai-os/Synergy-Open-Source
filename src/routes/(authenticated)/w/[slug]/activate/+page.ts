import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const parentData = await parent();

	return {
		workspaceSlug: params.slug,
		sessionId: parentData.sessionId,
		workspaceId: parentData.workspaceId
	};
};
