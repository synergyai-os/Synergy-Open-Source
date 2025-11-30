/**
 * Docs Module Manifest
 *
 * Docs module provides documentation rendering functionality:
 * - Markdown file rendering from `/dev-docs` and `/marketing-docs`
 * - Table of contents generation
 * - Breadcrumb navigation
 * - PARA navigation
 * - 404 tracking
 *
 * Access control: RBAC (`docs.view` permission) - no feature flag required.
 * This module is always enabled, but access is controlled via RBAC.
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { ModuleManifest } from '../registry';

/**
 * Docs module manifest
 *
 * **Dependencies**: ['shared-ui'] (depends on shared-ui module for utilities)
 * **Feature Flag**: null (always enabled, RBAC controls access)
 * **API**: None (direct imports used, API contract can be added later if needed)
 */
export const docsModule: ModuleManifest = {
	name: 'docs',
	version: '1.0.0',
	dependencies: ['shared-ui'],
	featureFlag: null, // Always enabled, RBAC controls access
	api: undefined // No API contract yet (direct imports used)
};
