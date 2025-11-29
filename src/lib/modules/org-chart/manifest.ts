/**
 * Org Chart Module Manifest
 *
 * Org Chart module provides organizational structure visualization functionality:
 * - Circle hierarchy visualization
 * - Role management and visualization
 * - Circle and role detail panels
 * - Navigation stack for hierarchical exploration
 *
 * This module is controlled by the 'org_module_beta' feature flag.
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { ModuleManifest } from '../registry';
import { OrgChartFeatureFlags } from './feature-flags';
import type { OrgChartModuleAPI } from './api';

/**
 * Org Chart module manifest
 *
 * **Dependencies**: ['core'] (depends on core module for workspaces context)
 * **Feature Flag**: 'org_module_beta' (workspace-based targeting)
 * **API**: OrgChartModuleAPI (public interface for org chart functionality)
 */
export const orgChartModule: ModuleManifest = {
	name: 'org-chart',
	version: '1.0.0',
	dependencies: ['core'],
	featureFlag: OrgChartFeatureFlags.ORG_MODULE_BETA, // 'org_module_beta'
	api: undefined as OrgChartModuleAPI | undefined // Type reference for API contract
};
