/**
 * Test Utilities for Mocking PostHog Analytics
 *
 * Mocks PostHog for composable tests
 */

import { vi } from 'vitest';

/**
 * Create a mock PostHog instance
 */
export function createMockPostHog() {
	const capturedEvents: Array<{ event: string; properties?: Record<string, unknown> }> = [];

	return {
		capture: vi.fn((event: string, properties?: Record<string, unknown>) => {
			capturedEvents.push({ event, properties });
		}),
		getCapturedEvents: () => capturedEvents,
		clearCapturedEvents: () => {
			capturedEvents.length = 0;
		}
	};
}

/**
 * Setup PostHog mock
 */
export function setupPostHogMock() {
	const mockPostHog = createMockPostHog();

	vi.mock('posthog-js', () => ({
		default: mockPostHog
	}));

	return mockPostHog;
}
