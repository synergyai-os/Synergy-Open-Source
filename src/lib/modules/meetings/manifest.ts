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
import { FeatureFlags } from '$lib/featureFlags';
import type { MeetingsModuleAPI } from './api';

/**
 * Meetings module manifest
 *
 * **Dependencies**: ['core'] (depends on core module for organizations context)
 * **Feature Flag**: 'meetings-module' (organization-based targeting)
 * **API**: MeetingsModuleAPI (public interface for meetings functionality)
 */
export const meetingsModule: ModuleManifest = {
	name: 'meetings',
	version: '1.0.0',
	dependencies: ['core'],
	featureFlag: FeatureFlags.MEETINGS_MODULE, // 'meetings-module'
	api: undefined as MeetingsModuleAPI | undefined // Type reference for API contract
};
