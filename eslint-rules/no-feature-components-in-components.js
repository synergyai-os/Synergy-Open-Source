/**
 * ESLint rule: no-feature-components-in-components
 *
 * Prevents feature-specific components from being placed in src/lib/components/.
 * Only atomic building blocks (atoms, molecules, organisms) should be in @components.
 * Feature-specific components belong in modules.
 *
 * Rules:
 * - ❌ BLOCKED: Feature-specific folders in @components (control-panel, dashboard, my-mind)
 * - ✅ ALLOWED: Atomic folders (atoms, molecules, organisms, ui)
 * - ✅ TEMPORARY: ai-tools (will become module, excluded from rule until migration)
 * - ❌ REMOVED: examples folder (not allowed, should be removed)
 *
 * @see dev-docs/2-areas/design/component-architecture.md
 * @see dev-docs/2-areas/architecture/atomic-design-svelte.md
 */

/**
 * Check if folder is a feature-specific folder (should be in modules)
 * @param {string} folderName - Folder name (e.g., "ai-tools", "atoms")
 * @returns {boolean} True if folder is feature-specific
 */
function isFeatureFolder(folderName) {
	// ai-tools excluded temporarily - will become its own module (future work)
	// See: ai-docs/tasks/SYOS-XXX-component-reorganization.md
	const featureFolders = ['control-panel', 'dashboard', 'my-mind'];
	return featureFolders.includes(folderName);
}

/**
 * Check if folder is an allowed atomic folder
 * @param {string} folderName - Folder name (e.g., "atoms", "molecules")
 * @returns {boolean} True if folder is allowed
 */
function isAllowedFolder(folderName) {
	// ui allowed temporarily during migration (will be removed)
	// ai-tools allowed temporarily (will become module)
	const allowedFolders = ['atoms', 'molecules', 'organisms', 'ui', 'ai-tools'];
	return allowedFolders.includes(folderName);
}

export default {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Prevent feature-specific components in @components folder. Only atomic building blocks belong here.',
			category: 'Architecture',
			recommended: true
		},
		messages: {
			featureComponentInComponents:
				'Feature-specific component detected in @components: "{{folderName}}". ' +
				'Feature components belong in modules (e.g., src/lib/modules/{{suggestedModule}}/components/). ' +
				'Only atomic building blocks (atoms, molecules, organisms) should be in @components. ' +
				'See: dev-docs/2-areas/design/component-architecture.md'
		},
		schema: []
	},
	create(context) {
		return {
			Program(node) {
				const filePath = context.getFilename();

				// Only check files in src/lib/components/
				if (!filePath.includes('src/lib/components/')) {
					return;
				}

				// Extract folder name from path
				// Example: "src/lib/components/ai-tools/MetricsForecast.svelte" → "ai-tools"
				const componentsMatch = filePath.match(/src\/lib\/components\/([^/]+)/);
				if (!componentsMatch) {
					return;
				}

				const folderName = componentsMatch[1];

				// Skip if it's an allowed atomic folder
				if (isAllowedFolder(folderName)) {
					return;
				}

				// Check if it's a feature folder
				if (isFeatureFolder(folderName)) {
					// Suggest appropriate module location
					let suggestedModule = 'core';
					if (folderName === 'dashboard') {
						suggestedModule = 'core'; // Or create dashboard module
					}

					context.report({
						node,
						messageId: 'featureComponentInComponents',
						data: {
							folderName,
							suggestedModule
						}
					});
				}
			}
		};
	}
};
