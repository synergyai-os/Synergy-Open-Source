/**
 * Auth helper entrypoint.
 *
 * Guard (SYOS-745): Legacy auth helpers have been removed. Use
 * validateSessionAndGetUserId from sessionValidation.
 */
export { validateSessionAndGetUserId } from './sessionValidation';

// Guard to make the intent obvious in diffs/reviews.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AUTH_HELPER_GUARD = 'use-validateSessionAndGetUserId-only' as const;
