/**
 * Org Chart Module Manifest
 *
 * Org Chart module provides organizational structure visualization functionality:
 * - Circle hierarchy visualization (bubble chart)
 * - Role management and visualization
 * - Circle and role detail panels
 * - Navigation stack for hierarchical exploration
 *
 * This is CORE functionality - always enabled, no feature flag.
 * Core data (circles, roles, members) is in infrastructure/organizational-model.
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { ModuleManifest } from '../registry';
import type { OrgChartModuleAPI } from './api';

/**
 * Org Chart module manifest
 *
 * **Dependencies**: ['core'] (depends on core module for shared utilities like useNavigationStack)
 * **Feature Flag**: null (always enabled - core functionality)
 * **API**: OrgChartModuleAPI (public interface for org chart functionality)
 */
export const orgChartModule: ModuleManifest = {
	name: 'org-chart',
	version: '1.0.0',
	dependencies: ['core'],
	featureFlag: null, // Always enabled - core functionality
	api: undefined as OrgChartModuleAPI | undefined // Type reference for API contract
};
