/**
 * Meetings Module Manifest
 *
 * Meetings module provides meeting management functionality:
 * - Meeting creation and editing
 * - Meeting templates
 * - Action items and decisions tracking
 * - Meeting presence tracking
 *
 * This is a core feature - always enabled.
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { ModuleManifest } from '../registry';
import type { MeetingsModuleAPI } from './api';

/**
 * Meetings module manifest
 *
 * **Dependencies**: ['core'] (depends on core module for shared utilities)
 * **Feature Flag**: null (always enabled - core feature)
 * **API**: MeetingsModuleAPI (public interface for meetings functionality)
 */
export const meetingsModule: ModuleManifest = {
	name: 'meetings',
	version: '1.0.0',
	dependencies: ['core'],
	featureFlag: null, // Always enabled - core feature
	api: undefined as MeetingsModuleAPI | undefined // Type reference for API contract
};
