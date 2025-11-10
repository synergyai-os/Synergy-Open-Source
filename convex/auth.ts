// WorkOS authentication is handled by SvelteKit
// User authentication state is stored in HTTP-only cookies
// Convex functions receive userId from client queries

// Helper function to get authenticated user ID
// Compatible with existing code that uses getAuthUserId
//
// NOTE: This currently returns null because Convex auth context is not set up
// For now, pass userId explicitly in query/mutation args
// Future: Set up Convex JWT authentication to populate ctx.auth
export async function getAuthUserId(ctx: any) {
	// Try to get user identity from Convex auth context
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		return null;
	}
	return identity.subject;
}

// Alternative: Get userId from mutation/query arguments
// Use this pattern until Convex auth is fully configured
export function getUserIdFromArgs(args: { userId?: string }) {
	if (!args.userId) {
		throw new Error('Not authenticated - userId required');
	}
	return args.userId;
}
