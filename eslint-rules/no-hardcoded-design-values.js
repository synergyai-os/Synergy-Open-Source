/**
 * ESLint rule: no-hardcoded-design-values
 *
 * Prevents hardcoded design values to enforce design token usage.
 * All design values must reference design tokens from design-system.json.
 *
 * Rules:
 * - ❌ BLOCKED: Hardcoded rem/px strings: '1rem', '32px', '2rem'
 * - ❌ BLOCKED: Hardcoded pixel numbers: 16, 48, 32 (when used for dimensions)
 * - ❌ BLOCKED: Hardcoded hex colors: '#3b82f6', '#fff'
 * - ❌ BLOCKED: Hardcoded decimal opacity: 0.5, 0.75 (when used for opacity)
 * - ❌ BLOCKED: Raw Tailwind utilities: px-4, py-2, gap-2, text-2xl, rounded-lg
 * - ✅ ALLOWED: Token utilities: px-button-x, w-icon-sm, bg-accent-primary
 * - ✅ ALLOWED: CSS custom properties: var(--size-icon-sm)
 *
 * @see dev-docs/2-areas/design/design-tokens.md
 * @see .cursor/rules/design-tokens-enforcement.mdc
 */

/**
 * Check if a string value is a hardcoded rem/px value
 * @param {string} value - Value to check (e.g., "1rem", "32px")
 * @returns {boolean} True if hardcoded dimension
 */
function isHardcodedDimension(value) {
	if (typeof value !== 'string') return false;
	return /^\d+(\.\d+)?(rem|px|em)$/.test(value);
}

/**
 * Check if a string value is a hardcoded hex color
 * @param {string} value - Value to check (e.g., "#3b82f6", "#fff")
 * @returns {boolean} True if hardcoded color
 */
function isHardcodedColor(value) {
	if (typeof value !== 'string') return false;
	return /^#[0-9a-fA-F]{3,8}$/.test(value);
}

/**
 * Check if a class string contains raw Tailwind utilities
 * @param {string} classString - Class string (e.g., "px-4 py-2")
 * @returns {Array<string>} Array of violations found
 */
function findRawTailwindUtilities(classString) {
	if (typeof classString !== 'string') return [];

	const violations = [];
	const classes = classString.split(/\s+/);

	// Blocked patterns: px-N, py-N, gap-N, text-Nxl, rounded-xx, w-N, h-N (where N is a number or size)
	const blockedPatterns = [
		/^px-\d+$/, // px-4, px-2
		/^py-\d+$/, // py-2, py-1
		/^p-\d+$/, // p-4
		/^gap-\d+$/, // gap-2, gap-4
		/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/, // text-2xl, text-xl
		/^rounded-(none|sm|md|lg|xl|2xl|3xl|full)$/, // rounded-lg, rounded-xl
		/^w-\d+$/, // w-4, w-16
		/^h-\d+$/, // h-4, h-16
		/^min-w-\d+$/, // min-w-4
		/^min-h-\d+$/, // min-h-4
		/^max-w-\d+$/, // max-w-4
		/^max-h-\d+$/, // max-h-4
		/^bg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+$/, // bg-blue-600
		/^text-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+$/, // text-white
		/^opacity-\d+$/, // opacity-50
		/^font-(sans|serif|mono)$/ // Base fonts (should use semantic: font-heading, font-body, font-code)
	];

	for (const cls of classes) {
		// Skip empty strings
		if (!cls) continue;

		// Check against blocked patterns
		for (const pattern of blockedPatterns) {
			if (pattern.test(cls)) {
				violations.push(cls);
				break;
			}
		}

		// Check for arbitrary values: [value] (e.g., w-[16px], bg-[#fff])
		if (/\[.*?\]/.test(cls)) {
			violations.push(cls);
		}
	}

	return violations;
}

/**
 * Check if a numeric value is likely a hardcoded pixel dimension
 * Context: Only flag if used in dimension-related contexts (width, height, size)
 * @param {number} value - Numeric value
 * @param {string} context - Variable/property name for context
 * @returns {boolean} True if likely hardcoded dimension
 */
function isHardcodedPixelNumber(value, context = '') {
	if (typeof value !== 'number') return false;
	// Common dimension values: 16, 24, 32, 48, 64, etc.
	// Context check: only flag if variable name suggests dimensions
	const isDimensionContext = /width|height|size|dimension|spacing|padding|margin|gap/i.test(
		context
	);
	return isDimensionContext && Number.isInteger(value) && value > 0 && value < 1000;
}

/**
 * Check if a numeric value is likely a hardcoded opacity
 * @param {number} value - Numeric value
 * @param {string} context - Variable/property name for context
 * @returns {boolean} True if likely hardcoded opacity
 */
function isHardcodedOpacity(value, context = '') {
	if (typeof value !== 'number') return false;
	const isOpacityContext = /opacity|alpha|transparent/i.test(context);
	return isOpacityContext && value >= 0 && value <= 1;
}

export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Prevent hardcoded design values to enforce design token usage',
			category: 'Design System',
			recommended: true
		},
		messages: {
			hardcodedDimension:
				'Hardcoded dimension "{{value}}" detected. Use design token utilities instead (e.g., w-icon-sm, px-button-x). See: dev-docs/2-areas/design/design-tokens.md',
			hardcodedColor:
				'Hardcoded color "{{value}}" detected. Use design token utilities instead (e.g., bg-accent-primary, text-primary). See: dev-docs/2-areas/design/design-tokens.md',
			hardcodedPixelNumber:
				'Hardcoded pixel value {{value}} detected in "{{context}}". Use design token utilities instead (e.g., w-icon-sm class). See: dev-docs/2-areas/design/design-tokens.md',
			hardcodedOpacity:
				'Hardcoded opacity {{value}} detected in "{{context}}". Use design token utilities instead (e.g., opacity-disabled). See: dev-docs/2-areas/design/design-tokens.md',
			rawTailwindUtilities:
				'Raw Tailwind utilities detected: {{utilities}}. Use semantic design token utilities instead. See: dev-docs/2-areas/design/design-tokens.md'
		},
		schema: []
	},
	create(context) {
		return {
			// Check string literals for hardcoded dimensions and colors
			Literal(node) {
				if (typeof node.value === 'string') {
					// Check for hardcoded dimensions
					if (isHardcodedDimension(node.value)) {
						context.report({
							node,
							messageId: 'hardcodedDimension',
							data: { value: node.value }
						});
					}

					// Check for hardcoded colors
					if (isHardcodedColor(node.value)) {
						context.report({
							node,
							messageId: 'hardcodedColor',
							data: { value: node.value }
						});
					}
				}

				// Check for hardcoded pixel numbers (with context)
				if (typeof node.value === 'number') {
					let contextName = '';

					// Traverse up the AST to find variable/property name
					let current = node.parent;
					let depth = 0;
					while (current && depth < 10) {
						// VariableDeclarator: const varName = ...
						if (current.type === 'VariableDeclarator' && current.id && current.id.name) {
							contextName = current.id.name;
							break;
						}
						// AssignmentExpression: varName = ...
						if (current.type === 'AssignmentExpression' && current.left && current.left.name) {
							contextName = current.left.name;
							break;
						}
						// Property: { propName: ... }
						if (current.type === 'Property' && current.key && current.key.name) {
							contextName = current.key.name;
							break;
						}
						// JSXAttribute: <svg width={...} />
						if (current.type === 'JSXAttribute' && current.name && current.name.name) {
							contextName = current.name.name;
							break;
						}
						current = current.parent;
						depth++;
					}

					// Check for hardcoded pixel numbers
					if (isHardcodedPixelNumber(node.value, contextName)) {
						context.report({
							node,
							messageId: 'hardcodedPixelNumber',
							data: { value: node.value, context: contextName || 'unknown' }
						});
					}

					// Check for hardcoded opacity
					if (isHardcodedOpacity(node.value, contextName)) {
						context.report({
							node,
							messageId: 'hardcodedOpacity',
							data: { value: node.value, context: contextName || 'unknown' }
						});
					}
				}
			},

			// Check JSX class attributes for raw Tailwind utilities
			JSXAttribute(node) {
				if (node.name.name === 'class' && node.value && node.value.type === 'Literal') {
					const classString = node.value.value;
					const violations = findRawTailwindUtilities(classString);

					if (violations.length > 0) {
						context.report({
							node: node.value,
							messageId: 'rawTailwindUtilities',
							data: { utilities: violations.join(', ') }
						});
					}
				}
			},

			// Check template literals for class strings (Svelte: class={`...`})
			TemplateLiteral(node) {
				const parent = node.parent;
				// Check if this is a class attribute
				if (
					parent.type === 'JSXExpressionContainer' &&
					parent.parent.type === 'JSXAttribute' &&
					parent.parent.name.name === 'class'
				) {
					// Combine all quasi strings
					const classString = node.quasis.map((quasi) => quasi.value.raw).join(' ');
					const violations = findRawTailwindUtilities(classString);

					if (violations.length > 0) {
						context.report({
							node,
							messageId: 'rawTailwindUtilities',
							data: { utilities: violations.join(', ') }
						});
					}
				}
			}
		};
	}
};
