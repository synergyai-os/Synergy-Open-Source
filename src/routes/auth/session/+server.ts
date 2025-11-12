import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const { auth } = locals;

	if (!auth?.sessionId || !auth.user) {
		return json(
			{ authenticated: false },
			{
				headers: {
					'Cache-Control': 'no-store'
				}
			}
		);
	}

	return json(
		{
			authenticated: true,
			user: auth.user,
			expiresAt: auth.expiresAt,
			csrfToken: auth.csrfToken
		},
		{
			headers: {
				'Cache-Control': 'no-store'
			}
		}
	);
};
