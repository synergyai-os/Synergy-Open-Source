/**
 * Core Module Manifest
 *
 * Core module provides foundational functionality that other modules depend on:
 * - Organizations (workspace switching, org/team management)
 * - Authentication context
 * - Shared utilities and types
 *
 * This module is always enabled (no feature flag required).
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { ModuleManifest } from '../registry';
import type { CoreModuleAPI } from './api';

/**
 * Core module manifest
 *
 * **Dependencies**: None (core module has no dependencies)
 * **Feature Flag**: null (always enabled)
 * **API**: CoreModuleAPI (shared components like TagSelector)
 */
export const coreModule: ModuleManifest = {
	name: 'core',
	version: '1.0.0',
	dependencies: [],
	featureFlag: null, // Always enabled
	api: undefined as CoreModuleAPI | undefined // Type reference for API contract
};
