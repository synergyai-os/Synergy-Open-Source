/**
 * Prompt template registry
 * Maps prompt names to their template strings
 */
import { flashcardGenerationTemplate } from './flashcardGeneration';
import { createError, ErrorCodes } from '../infrastructure/errors/codes';

const promptTemplates: Record<string, string> = {
	'flashcard-generation': flashcardGenerationTemplate
};

/**
 * Get nested property from object using dot notation
 * Example: getNestedProperty(obj, 'book.name') => obj.book.name
 * Supports array indices: getNestedProperty(obj, 'items.0.name') => obj.items[0].name
 */
function getNestedProperty(obj: unknown, path: string): string | undefined {
	const parts = path.split('.');
	let value: unknown = obj;

	for (const part of parts) {
		if (value === null || value === undefined) {
			return undefined;
		}
		// Handle array indices (e.g., "items.0.name")
		if (/^\d+$/.test(part)) {
			value = value[parseInt(part, 10)];
		} else {
			value = value[part];
		}
	}

	return value !== undefined && value !== null ? String(value) : undefined;
}

/**
 * Interpolate variables in prompt template
 * Supports: {{variable}}, {{object.property}}, {{array.0.item}}
 * Handles empty values by replacing with empty string (removes placeholder)
 *
 * @param template - Prompt template with {{variable}} placeholders
 * @param variables - Object with variables to interpolate (supports nested objects)
 * @returns Interpolated template string
 */
function interpolateVariables(template: string, variables: Record<string, unknown>): string {
	// Match {{variable}} or {{nested.property}} patterns
	const variablePattern = /\{\{([^}]+)\}\}/g;

	return template.replace(variablePattern, (match, path) => {
		const trimmedPath = path.trim();
		const value = getNestedProperty(variables, trimmedPath);

		if (value === undefined) {
			// Return empty string for undefined values (removes placeholder)
			// This allows optional variables in prompts
			return '';
		}

		return value;
	});
}

/**
 * Load and interpolate a prompt template
 *
 * @param promptName - Name of prompt template (e.g., 'flashcard-generation')
 * @param variables - Object with variables to interpolate (supports nested objects)
 * @returns Interpolated prompt string
 *
 * @example
 * ```typescript
 * const prompt = loadPrompt('flashcard-generation', {
 *   text: 'Some text',
 *   source: { title: 'Book Title', author: 'Author Name' }
 * });
 * ```
 */
export function loadPrompt(promptName: string, variables?: Record<string, unknown>): string {
	// Get template from registry
	const template = promptTemplates[promptName];

	if (!template) {
		throw createError(
			ErrorCodes.GENERIC_ERROR,
			`Prompt template "${promptName}" not found. Available templates: ${Object.keys(promptTemplates).join(', ')}`
		);
	}

	// Remove XML declaration if present (for cleaner output)
	let prompt = template.replace(/<\?xml[^>]*\?>\s*/i, '');

	// Interpolate variables if provided
	if (variables) {
		prompt = interpolateVariables(prompt, variables);
	}

	return prompt;
}

/**
 * Extract all variables from a prompt template (for validation/documentation)
 *
 * @param template - Prompt template string
 * @returns Array of variable names found in template
 *
 * @example
 * ```typescript
 * const template = 'Hello {{name}}, from {{source.title}}';
 * const vars = extractVariables(template);
 * // Returns: ['name', 'source.title']
 * ```
 */
export function extractVariables(template: string): string[] {
	const variablePattern = /\{\{([^}]+)\}\}/g;
	const variables = new Set<string>();
	let match;

	while ((match = variablePattern.exec(template)) !== null) {
		variables.add(match[1].trim());
	}

	return Array.from(variables);
}
