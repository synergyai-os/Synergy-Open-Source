/**
 * Shared UI Module Manifest
 *
 * Shared UI module provides foundational functionality that other modules depend on:
 * - Shared UI components (TagSelector, Sidebar, AppTopBar, etc.)
 * - Tagging functionality (via useTagging composable)
 * - Global shortcuts (via useGlobalShortcuts composable)
 * - Shared utilities and types
 *
 * This module is always enabled (no feature flag required).
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { ModuleManifest } from '../registry';
import type { CoreModuleAPI } from './api';

/**
 * Shared UI module manifest
 *
 * **Dependencies**: None (shared UI module has no dependencies)
 * **Feature Flag**: null (always enabled)
 * **API**: CoreModuleAPI (shared components like TagSelector)
 */
export const sharedUiModule: ModuleManifest = {
	name: 'shared-ui',
	version: '1.0.0',
	dependencies: [],
	featureFlag: null, // Always enabled
	api: undefined as CoreModuleAPI | undefined // Type reference for API contract
};
