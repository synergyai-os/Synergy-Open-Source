import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';

export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const error = url.searchParams.get('error');
	const errorDescription = url.searchParams.get('error_description');
	
	if (error) {
		console.error('❌ WorkOS returned error:', error, errorDescription);
		throw redirect(302, `/login?error=${error}`);
	}
	
	if (!code) {
		console.error('❌ No code received');
		throw redirect(302, '/login?error=no_code');
	}
	
	try {
		// Exchange code for session with WorkOS
		const response = await fetch('https://api.workos.com/user_management/authenticate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				client_id: env.WORKOS_CLIENT_ID,
				client_secret: env.WORKOS_API_KEY,
				code,
				grant_type: 'authorization_code'
			})
		});
		
		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ WorkOS authentication failed:', errorText);
			throw redirect(302, '/login?error=auth_failed');
		}
		
		const data = await response.json();
		
		// Create Convex client for server-side mutation
		const convex = new ConvexHttpClient(publicEnv.PUBLIC_CONVEX_URL);
		
		// Sync user to Convex database
		const convexUserId = await convex.mutation(api.users.syncUserFromWorkOS, {
			workosId: data.user.id,
			email: data.user.email,
			firstName: data.user.first_name,
			lastName: data.user.last_name,
			emailVerified: data.user.email_verified ?? true,
		});
		
		// Set session cookie with access token
		cookies.set('wos-session', data.access_token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});
		
		// Store user data with Convex userId in cookie
		cookies.set('wos-user', JSON.stringify({
			userId: convexUserId,        // Convex user ID (for queries)
			workosId: data.user.id,      // WorkOS user ID (for reference)
			email: data.user.email,
			firstName: data.user.first_name,
			lastName: data.user.last_name
		}), {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});
		
		// Redirect to intended destination or inbox
		const redirectTo = state || '/inbox';
		throw redirect(302, redirectTo);
	} catch (error) {
		// Re-throw redirects (they're not errors in SvelteKit)
		if (error instanceof Response) {
			throw error;
		}
		
		// Log actual errors
		console.error('Auth callback error:', error);
		
		// Redirect to login with error message
		throw redirect(302, '/login?error=callback_failed');
	}
};

