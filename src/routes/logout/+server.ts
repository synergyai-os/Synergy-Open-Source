import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ cookies, url }) => {
	// Get the session token before deleting
	const sessionToken = cookies.get('wos-session');

	// Clear both WorkOS session and user cookies locally
	const cookieOptions = {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax' as const
	};
	
	cookies.delete('wos-session', cookieOptions);
	cookies.delete('wos-user', cookieOptions);

	// If we have a session token, redirect to WorkOS logout to end the WorkOS session
	if (sessionToken && env.WORKOS_CLIENT_ID) {
		try {
			// Extract session ID from JWT (it's in the 'sid' claim)
			const payload = JSON.parse(Buffer.from(sessionToken.split('.')[1], 'base64').toString());
			const sessionId = payload.sid;

			// Build WorkOS logout URL
			// This will end the WorkOS session and redirect back to our app
			const workosLogoutUrl = new URL('https://api.workos.com/user_management/sessions/logout');
			workosLogoutUrl.searchParams.set('session_id', sessionId);
			
			// Optional: Specify where to redirect after logout
			const returnUrl = `${url.origin}/`;
			workosLogoutUrl.searchParams.set('return_to', returnUrl);

			// Redirect to WorkOS logout endpoint
			throw redirect(302, workosLogoutUrl.toString());
		} catch (error) {
			// Only catch actual errors, not redirects
			if (error instanceof Error) {
				console.error('Error building logout URL:', error.message);
			}
			// Re-throw redirects
			throw error;
		}
	}

	// No session token, just redirect to homepage
	throw redirect(302, '/');
};

export const POST: RequestHandler = GET;

