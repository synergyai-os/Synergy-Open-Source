/**
 * PostHog Type Declarations
 *
 * Extends the Window interface to include the PostHog instance
 * that is attached to window.posthog after initialization.
 */

import type { PostHog } from 'posthog-js';

declare global {
	interface Window {
		posthog?: PostHog;
	}
}

export {};
