import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	// Inherit data from parent layout (session, user, features)
	const parentData = await parent();

	// Verify user is authenticated (required for meeting access)
	if (!parentData.user) {
		throw error(401, 'Unauthorized');
	}

	// Build enabledFeatures array from individual feature flags
	const enabledFeatures: string[] = [];
	if (parentData.circlesEnabled) enabledFeatures.push('circles');
	if (parentData.meetingsEnabled) enabledFeatures.push('meetings');

	return {
		sessionId: parentData.sessionId,
		// Auth pattern: user.userId from locals.auth.user (see session.ts line 148, 364)
		userId: parentData.user.userId,
		enabledFeatures
	};
};
