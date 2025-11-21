import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * Redirect /org/teams/[id] to /org/circles/[id]
 * Part of Teams → Circles migration (SYOS-288)
 */
export const load: PageServerLoad = async ({ params, url }) => {
	// Preserve query params (e.g., ?org=xxx)
	const searchParams = url.search;
	const redirectUrl = `/org/circles/${params.id}${searchParams}`;
	throw redirect(302, redirectUrl);
};
