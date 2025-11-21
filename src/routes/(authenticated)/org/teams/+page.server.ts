import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * Redirect /org/teams to /org/circles
 * Part of Teams → Circles migration (SYOS-288)
 */
export const load: PageServerLoad = async ({ url }) => {
	// Preserve query params (e.g., ?org=xxx)
	const searchParams = url.search;
	const redirectUrl = `/org/circles${searchParams}`;
	throw redirect(302, redirectUrl);
};
