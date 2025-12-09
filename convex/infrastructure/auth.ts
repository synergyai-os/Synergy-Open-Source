/**
 * Auth helper entrypoint.
 *
 * Guard (SYOS-745): Legacy auth helpers have been removed. Use
 * validateSessionAndGetUserId (preferred) or getUserIdFromSession (nullable)
 * from sessionValidation.
 */
export { validateSessionAndGetUserId, getUserIdFromSession } from './sessionValidation';

// Guard to make the intent obvious in diffs/reviews.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AUTH_HELPER_GUARD = 'use-validateSessionAndGetUserId-only' as const;
