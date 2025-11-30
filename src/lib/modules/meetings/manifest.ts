/**
 * Meetings Module Manifest
 *
 * Meetings module provides meeting management functionality:
 * - Meeting creation and editing
 * - Meeting templates
 * - Action items and decisions tracking
 * - Meeting presence tracking
 *
 * This module is controlled by the 'meetings-module' feature flag.
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { ModuleManifest } from '../registry';
import { MeetingsFeatureFlags } from './feature-flags';
import type { MeetingsModuleAPI } from './api';

/**
 * Meetings module manifest
 *
 * **Dependencies**: ['shared-ui'] (depends on shared-ui module for shared utilities)
 * **Feature Flag**: 'meetings-module' (workspace-based targeting)
 * **API**: MeetingsModuleAPI (public interface for meetings functionality)
 */
export const meetingsModule: ModuleManifest = {
	name: 'meetings',
	version: '1.0.0',
	dependencies: ['shared-ui'],
	featureFlag: MeetingsFeatureFlags.MEETINGS_MODULE, // 'meetings-module'
	api: undefined as MeetingsModuleAPI | undefined // Type reference for API contract
};
