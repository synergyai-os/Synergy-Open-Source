/**
 * Inbox Module Manifest
 *
 * Inbox module provides knowledge collection and workspace functionality:
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
import type { InboxModuleAPI } from './api';

/**
 * Inbox module manifest
 *
 * **Dependencies**: ['shared-ui'] (depends on shared-ui module for shared utilities)
 * **Feature Flag**: null (always enabled)
 * **API**: InboxModuleAPI (currently minimal, ready for future expansion)
 */
export const inboxModule: ModuleManifest = {
	name: 'inbox',
	version: '1.0.0',
	dependencies: ['shared-ui'],
	featureFlag: null, // Always enabled
	api: undefined as InboxModuleAPI | undefined // Type reference for API contract
};
