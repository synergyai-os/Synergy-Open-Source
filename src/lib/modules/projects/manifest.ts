/**
 * Projects Module Manifest
 *
 * Projects module provides project and task management functionality:
 * - Task creation and management (standalone or linked to meetings/projects)
 * - Project wrappers around external project management tools
 * - Bi-directional sync with external tools (Linear, Notion, Asana, etc.)
 * - Task assignment (user or role-based)
 *
 * This module is controlled by the 'projects-module' feature flag.
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { ModuleManifest } from '../registry';
import type { ProjectsModuleAPI } from './api';

/**
 * Projects module manifest
 *
 * **Dependencies**: ['core'] (depends on core module for shared utilities)
 * **Feature Flag**: 'projects-module' (workspace-based targeting)
 * **API**: ProjectsModuleAPI (public interface for projects/tasks functionality)
 */
export const projectsModule: ModuleManifest = {
	name: 'projects',
	version: '1.0.0',
	dependencies: ['core'],
	featureFlag: null, // Always enabled - core feature (when implemented)
	api: undefined as ProjectsModuleAPI | undefined // Type reference for API contract
};
