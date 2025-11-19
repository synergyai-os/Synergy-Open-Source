/**
 * ESLint rule: no-cross-module-imports
 *
 * Prevents cross-module imports to enforce module boundaries.
 * Modules should communicate via API contracts, not direct imports.
 *
 * Rules:
 * - ❌ BLOCKED: Cross-module imports (e.g., meetings → inbox)
 * - ✅ ALLOWED: Core module imports (from any module)
 * - ✅ ALLOWED: Same-module imports (e.g., inbox → inbox)
 * - ✅ ALLOWED: Type-only imports (compile-time only)
 * - ✅ ALLOWED: Shared components ($lib/components/ui/, $lib/components/core/)
 * - ✅ ALLOWED: Module API imports (api.ts files)
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 * @see dev-docs/2-areas/architecture/system-architecture.md#6-modularity--module-system
 */

/**
 * Extract module name from file path
 * @param {string} filePath - File path (e.g., "src/lib/modules/inbox/api.ts")
 * @returns {string|null} Module name (e.g., "inbox") or null if not in modules directory
 */
function getModuleFromPath(filePath) {
	const modulesMatch = filePath.match(/src\/lib\/modules\/([^/]+)/);
	return modulesMatch ? modulesMatch[1] : null;
}

/**
 * Extract module name from import path
 * @param {string} importPath - Import path (e.g., "$lib/modules/inbox/api")
 * @returns {string|null} Module name (e.g., "inbox") or null if not a module import
 */
function getModuleFromImport(importPath) {
	const moduleMatch = importPath.match(/\$lib\/modules\/([^/]+)/);
	return moduleMatch ? moduleMatch[1] : null;
}

/**
 * Check if import is allowed
 * @param {string} sourceModule - Source module name (from file path)
 * @param {string} targetModule - Target module name (from import path)
 * @param {boolean} isTypeImport - Whether this is a type-only import
 * @returns {boolean} True if import is allowed
 */
function isImportAllowed(sourceModule, targetModule, isTypeImport) {
	// Type-only imports are always allowed (compile-time only)
	// This allows importing API type contracts for dependency injection
	if (isTypeImport) {
		return true;
	}

	// Core module imports are always allowed
	if (targetModule === 'core') {
		return true;
	}

	// Same-module imports are allowed
	if (sourceModule === targetModule) {
		return true;
	}

	// Cross-module imports are blocked (even API imports)
	// Modules should communicate via dependency injection (getContext), not direct imports
	return false;
}

/**
 * Check if import is from shared components
 * @param {string} importPath - Import path
 * @returns {boolean} True if import is from shared components
 */
function isSharedComponentImport(importPath) {
	return (
		importPath.startsWith('$lib/components/ui/') || importPath.startsWith('$lib/components/core/')
	);
}

export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Prevent cross-module imports to enforce module boundaries',
			category: 'Architecture',
			recommended: true
		},
		messages: {
			crossModuleImport:
				'Cross-module import detected: "{{sourceModule}}" → "{{targetModule}}". ' +
				'Modules should communicate via API contracts. ' +
				'Use dependency injection via context (getContext) or import from core module instead. ' +
				'See: dev-docs/2-areas/architecture/modularity-refactoring-analysis.md'
		},
		schema: []
	},
	create(context) {
		return {
			ImportDeclaration(node) {
				const source = node.source.value;
				const filePath = context.getFilename();

				// Skip if not a module import
				if (!source.includes('$lib/modules/')) {
					return;
				}

				// Skip shared component imports
				if (isSharedComponentImport(source)) {
					return;
				}

				// Extract modules
				const sourceModule = getModuleFromPath(filePath);
				const targetModule = getModuleFromImport(source);

				// Skip if source file is not in a module directory
				if (!sourceModule) {
					return;
				}

				// Skip if import is not from a module directory
				if (!targetModule) {
					return;
				}

				// Check if this is a type-only import
				const isTypeImport =
					node.importKind === 'type' ||
					node.specifiers.every(
						(spec) => spec.type === 'ImportSpecifier' && spec.importKind === 'type'
					);

				// Check if import is allowed
				if (!isImportAllowed(sourceModule, targetModule, isTypeImport)) {
					context.report({
						node: node.source,
						messageId: 'crossModuleImport',
						data: {
							sourceModule,
							targetModule
						}
					});
				}
			}
		};
	}
};
