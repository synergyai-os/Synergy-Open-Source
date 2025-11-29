import type { LayoutServerLoad } from './$types';

/**
 * Circles layout - Pass through data, org check happens client-side
 *
 * Note: Organization selection is managed client-side by useWorkspaces composable
 * The org check and redirect happens in the onboarding page component
 */
export const load: LayoutServerLoad = async ({ parent }) => {
	const data = await parent();

	// Just pass through parent data - org check happens client-side
	return {
		...data
	};
};
