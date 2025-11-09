// WorkOS authentication is handled entirely by SvelteKit
// Convex functions receive the authenticated user ID from the client

// Helper function to get authenticated user ID
// Compatible with existing code that uses getAuthUserId
export async function getAuthUserId(ctx: any) {
  // Get user identity from Convex auth context
  // This will be set by the client when making authenticated requests
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return identity.subject;
}
