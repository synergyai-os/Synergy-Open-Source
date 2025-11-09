import { handleAuth } from '$lib/server/auth';

// Re-export the auth handler as a SvelteKit server endpoint
// This ensures the auth API is accessible at /api/auth
export const GET = handleAuth;
export const POST = handleAuth;

