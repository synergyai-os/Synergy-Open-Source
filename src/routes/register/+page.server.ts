import type { PageServerLoad } from './$types';

/**
 * Clear any pending registration cookie when user lands on register page.
 * This ensures a clean state when clicking "Wrong email? Start over" from verify-email.
 *
 * Rationale:
 * - No user record exists until verification succeeds, so cleanup is safe
 * - Verification codes expire naturally (10 minutes)
 * - Cookie expires naturally (15 minutes)
 * - Simple cleanup prevents confusion if user navigates back
 */
export const load: PageServerLoad = async ({ cookies }) => {
	// Clear any pending registration cookie to ensure clean state
	// This is safe because no user record exists until verification succeeds
	cookies.delete('registration_pending', { path: '/' });

	return {};
};
