/**
 * Algorithm 3: Layout vs Styling Separation Violation Detection
 * 
 * Rule: Recipes handle styling (colors, transitions, borders). Layout stays in components.
 * Exception: Intrinsic component layout (e.g., inline-flex for Button) is allowed in atom recipes
 */

import { extractClassStrings, parseClassString, classifyClass, getRecipeFileName } from '../parsers/recipe-parser.js';
import { findRecipeFiles, getComponentTypeFromRecipe, relativePath } from '../utils/file-finder.js';

/**
 * Detect layout/styling separation violations in a single recipe file
 * @param {string} filePath - Path to recipe file
 * @param {string} rootDir - Project root directory
 * @returns {Array<{
 *   type: 'layout_styling_separation',
 *   class: string,
 *   classification: string,
 *   componentType: string,
 *   file: string,
 *   relativeFile: string,
 *   line: number,
 *   context: string,
 *   suggestion: string
 * }>}
 */
export function detectLayoutStylingViolations(filePath, rootDir) {
	const recipeFileName = getRecipeFileName(filePath);
	const componentType = getComponentTypeFromRecipe(rootDir, recipeFileName);
	const classStrings = extractClassStrings(filePath);
	
	const violations = [];
	
	for (const { classString, line, context } of classStrings) {
		const classes = parseClassString(classString);
		
		for (const { className, baseClass } of classes) {
			const classification = classifyClass(baseClass);
			
			// Composition layout - never allowed in recipes
			if (classification === 'composition_layout') {
				violations.push({
					type: 'layout_styling_separation',
					class: className,
					classification,
					componentType,
					file: filePath,
					relativeFile: relativePath(rootDir, filePath),
					line,
					context,
					suggestion: `Move '${className}' to component template - composition layout belongs in components, not recipes`
				});
				continue;
			}
			
			// Intrinsic layout - only allowed in atoms
			if (classification === 'intrinsic_layout') {
				if (componentType !== 'atom') {
					violations.push({
						type: 'layout_styling_separation',
						class: className,
						classification,
						componentType,
						file: filePath,
						relativeFile: relativePath(rootDir, filePath),
						line,
						context,
						suggestion: `Move '${className}' to component template - intrinsic layout only allowed in atom recipes`
					});
				}
				// If atom - allowed, no violation
				continue;
			}
			
			// Semantic tokens, styling, unknown - all allowed (no violation)
		}
	}
	
	return violations;
}

/**
 * Scan all recipe files for layout/styling violations
 * @param {string} rootDir - Project root directory
 * @returns {Array} Array of violations
 */
export function scanLayoutStyling(rootDir) {
	const recipeFiles = findRecipeFiles(rootDir);
	const allViolations = [];
	
	for (const filePath of recipeFiles) {
		const violations = detectLayoutStylingViolations(filePath, rootDir);
		allViolations.push(...violations);
	}
	
	return allViolations;
}

