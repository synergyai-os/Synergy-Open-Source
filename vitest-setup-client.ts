/// <reference types="@vitest/browser/matchers" />
/// <reference types="@vitest/browser/providers/playwright" />

// Import mocks for browser tests
// This ensures mocks are loaded before any test files
import './tests/composables/test-utils/setupMocks.svelte';
