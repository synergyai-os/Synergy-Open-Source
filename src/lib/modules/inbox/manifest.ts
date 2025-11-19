/**
 * Inbox Module Manifest
 *
 * Inbox module provides knowledge collection and organization functionality:
 * - Readwise sync integration
 * - Inbox item management
 * - Tag management
 * - Flashcard generation from highlights
 *
 * This module is always enabled (no feature flag required).
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { ModuleManifest } from '../registry';

/**
 * Inbox module manifest
 *
 * **Dependencies**: ['core'] (depends on core module for organizations context)
 * **Feature Flag**: null (always enabled)
 * **API**: TBD (future - InboxModuleAPI)
 */
export const inboxModule: ModuleManifest = {
	name: 'inbox',
	version: '1.0.0',
	dependencies: ['core'],
	featureFlag: null, // Always enabled
	api: undefined // Future: InboxModuleAPI
};
