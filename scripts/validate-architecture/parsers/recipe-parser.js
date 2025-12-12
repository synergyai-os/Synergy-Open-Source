/**
 * Recipe Parser Utilities
 *
 * Parses CVA recipe files and extracts:
 * - Exported recipes (names)
 * - Class strings from CVA calls
 * - Variant definitions
 *
 * Uses regex-based extraction (simpler, faster than AST for consistent CVA patterns)
 */

import fs from 'fs';
import path from 'path';

/**
 * Extract exported recipe names from a recipe file
 * @param {string} filePath - Path to .recipe.ts file
 * @returns {Array<{ name: string, line: number }>}
 */
export function extractRecipeExports(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');

	// Match: export const buttonRecipe = cva(
	const recipeExportRegex = /export\s+const\s+(\w+Recipe)\s*=/g;

	const recipes = [];
	let match;

	while ((match = recipeExportRegex.exec(content)) !== null) {
		const recipeName = match[1];

		// Find line number
		const matchIndex = match.index;
		let lineNumber = 1;
		let charCount = 0;
		for (const line of lines) {
			charCount += line.length + 1;
			if (charCount > matchIndex) break;
			lineNumber++;
		}

		recipes.push({ name: recipeName, line: lineNumber });
	}

	return recipes;
}

/**
 * Extract all class strings from a recipe file
 * @param {string} filePath - Path to .recipe.ts file
 * @returns {Array<{ classString: string, line: number, context: string }>}
 */
export function extractClassStrings(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');

	const classStrings = [];

	// Match class strings in CVA calls (single quotes, double quotes, backticks)
	// Skip import lines, type definitions, and defaultVariants
	const classRegex = /['"`]([\w\s\-:\/\[\].]+)['"`]/g;

	lines.forEach((line, index) => {
		const lineNumber = index + 1;
		const trimmedLine = line.trim();

		// Skip non-class lines
		if (trimmedLine.startsWith('import')) return;
		if (trimmedLine.startsWith('export type')) return;
		if (trimmedLine.includes('defaultVariants:')) return;
		if (trimmedLine.match(/^\s*(size|variant|padding|fullHeight|disabled|intent):\s*['"`]/)) return;

		let match;
		while ((match = classRegex.exec(line)) !== null) {
			const classString = match[1].trim();

			// Skip single-word variant keys
			if (
				classString.match(
					/^(sm|md|lg|xl|xs|2xl|3xl|true|false|primary|secondary|outline|ghost|solid)$/
				)
			) {
				continue;
			}

			// Must look like CSS classes (has hyphen or space)
			if (!classString.includes('-') && !classString.includes(' ') && !classString.includes(':')) {
				continue;
			}

			classStrings.push({
				classString,
				line: lineNumber,
				context: trimmedLine.slice(0, 50) + (trimmedLine.length > 50 ? '...' : '')
			});
		}
	});

	return classStrings;
}

/**
 * Extract individual classes from a class string
 * @param {string} classString - Space-separated class string
 * @returns {Array<{ className: string, modifier: string | null, baseClass: string }>}
 */
export function parseClassString(classString) {
	const classes = classString.split(/\s+/).filter(Boolean);

	return classes.map((cls) => {
		// Handle modifiers (e.g., hover:bg-primary, disabled:opacity-50)
		const parts = cls.split(':');
		const baseClass = parts[parts.length - 1];
		const modifier = parts.length > 1 ? parts.slice(0, -1).join(':') : null;

		return {
			className: cls,
			modifier,
			baseClass
		};
	});
}

/**
 * Get recipe file name (without extension)
 * @param {string} filePath - Path to recipe file
 * @returns {string}
 */
export function getRecipeFileName(filePath) {
	return path.basename(filePath, '.recipe.ts');
}

/**
 * Extract component name from recipe name
 *
 * Examples:
 * - buttonRecipe → button
 * - workspaceSelectorRecipe → workspaceSelector
 * - formInputLabelRecipe → formInput (if formInput is parent) or formInputLabel
 *
 * @param {string} recipeName - Recipe export name
 * @param {string} parentName - Parent recipe file name (for sub-component detection)
 * @returns {{ componentName: string, isSubComponent: boolean, subComponentName: string | null }}
 */
export function extractComponentFromRecipe(recipeName, parentName) {
	// Remove 'Recipe' suffix
	const withoutRecipe = recipeName.replace(/Recipe$/, '');

	// Check if it matches parent (primary recipe)
	if (withoutRecipe === parentName) {
		return {
			componentName: withoutRecipe,
			isSubComponent: false,
			subComponentName: null
		};
	}

	// Check if it's a sub-component (e.g., formInputLabel for formInput parent)
	if (withoutRecipe.startsWith(parentName)) {
		const suffix = withoutRecipe.slice(parentName.length);
		// Sub-component names start with uppercase (e.g., Label, Icon)
		if (suffix.length > 0 && suffix[0] === suffix[0].toUpperCase()) {
			return {
				componentName: parentName,
				isSubComponent: true,
				subComponentName: suffix
			};
		}
	}

	// Extract embedded component name (e.g., workspaceSelectorAvatar → avatar)
	// This is a potential violation - recipe for different component
	const embeddedMatch = withoutRecipe.match(/[A-Z][a-z]+$/);
	if (embeddedMatch) {
		return {
			componentName: embeddedMatch[0].toLowerCase(),
			isSubComponent: false,
			subComponentName: null,
			isEmbeddedComponent: true
		};
	}

	return {
		componentName: withoutRecipe,
		isSubComponent: false,
		subComponentName: null
	};
}

/**
 * Classify a CSS class for layout/styling separation
 * @param {string} className - CSS class name (without modifier)
 * @returns {'composition_layout' | 'intrinsic_layout' | 'styling' | 'semantic_token' | 'unknown'}
 */
export function classifyClass(className) {
	// Composition layout (NOT allowed in molecule/organism recipes)
	const compositionLayoutPatterns = [
		/^flex$/,
		/^flex-col$/,
		/^flex-row$/,
		/^grid$/,
		/^grid-cols-/,
		/^gap-\d/, // Numeric gap (gap-2, gap-4)
		/^space-[xy]-/,
		/^justify-between$/,
		/^justify-around$/,
		/^justify-evenly$/
	];

	if (compositionLayoutPatterns.some((p) => p.test(className))) {
		return 'composition_layout';
	}

	// Intrinsic layout (allowed in atom recipes only)
	const intrinsicLayoutPatterns = [
		/^inline-flex$/,
		/^items-center$/,
		/^justify-center$/,
		/^flex-shrink-0$/,
		/^self-/
	];

	if (intrinsicLayoutPatterns.some((p) => p.test(className))) {
		return 'intrinsic_layout';
	}

	// Semantic tokens (always allowed)
	const semanticTokenPatterns = [
		/^gap-[a-z]/, // gap-button, gap-form
		/^px-[a-z]/, // px-button
		/^py-[a-z]/, // py-button
		/^p-[a-z]/, // p-card
		/^rounded-[a-z]/, // rounded-button
		/^text-[a-z]/, // text-primary, text-secondary
		/^bg-[a-z]/, // bg-elevated, bg-surface
		/^border-[a-z]/, // border-base
		/^shadow-[a-z]/, // shadow-card
		/^opacity-[a-z]/ // opacity-disabled
	];

	if (semanticTokenPatterns.some((p) => p.test(className))) {
		return 'semantic_token';
	}

	// Styling (always allowed)
	const stylingPatterns = [
		/^transition/,
		/^duration-/,
		/^ease-/,
		/^cursor-/,
		/^font-/,
		/^text-\[/, // Arbitrary values
		/^bg-\[/,
		/^border$/,
		/^border-solid/,
		/^border-dashed/,
		/^truncate/,
		/^whitespace-/,
		/^overflow-/,
		/^pointer-events-/,
		/^outline-/,
		/^ring-/,
		/^animate-/,
		/^transform/,
		/^translate/,
		/^scale/,
		/^rotate/,
		/^hover:/,
		/^focus:/,
		/^active:/,
		/^disabled:/,
		/^group-/,
		/^peer-/
	];

	if (stylingPatterns.some((p) => p.test(className))) {
		return 'styling';
	}

	return 'unknown';
}
