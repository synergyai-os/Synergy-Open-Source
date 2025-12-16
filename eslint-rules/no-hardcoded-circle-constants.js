/**
 * ESLint rule: no-hardcoded-circle-constants
 *
 * Prevents hardcoded circle type and decision model string literals.
 * Enforces use of constants from convex/core/circles/constants.ts.
 *
 * Rules:
 * - ❌ BLOCKED: Hardcoded circle types: 'hierarchy', 'empowered_team', 'guild', 'hybrid'
 * - ❌ BLOCKED: Hardcoded decision models: 'manager_decides', 'team_consensus', 'consent', 'coordination_only'
 * - ❌ BLOCKED: Inline union types with hardcoded values
 * - ✅ ALLOWED: Schema literals in tables.ts (required by Convex)
 * - ✅ ALLOWED: Computed properties: [CIRCLE_TYPES.HIERARCHY]
 * - ✅ ALLOWED: Import statements
 * - ✅ ALLOWED: Documentation files (.md, .mdx)
 *
 * @see convex/core/circles/constants.ts
 * @see dev-docs/master-docs/architecture.md (constants.ts pattern)
 */

const CIRCLE_TYPE_VALUES = ['hierarchy', 'empowered_team', 'guild', 'hybrid'];
const DECISION_MODEL_VALUES = ['manager_decides', 'team_consensus', 'consent', 'coordination_only'];

/**
 * Check if a string is a hardcoded circle constant value
 * @param {string} value - String value to check
 * @returns {boolean} True if matches a constant value
 */
function isHardcodedConstant(value) {
	return CIRCLE_TYPE_VALUES.includes(value) || DECISION_MODEL_VALUES.includes(value);
}

/**
 * Check if node is in a computed property (e.g., [CIRCLE_TYPES.HIERARCHY])
 * @param {Object} node - AST node
 * @returns {boolean} True if parent is computed property
 */
function isComputedProperty(node) {
	let current = node.parent;
	let depth = 0;
	while (current && depth < 5) {
		if (current.type === 'Property' && current.computed === true) {
			return true;
		}
		current = current.parent;
		depth++;
	}
	return false;
}

/**
 * Check if node is in a schema literal (tables.ts or schema.ts files)
 * @param {Object} context - ESLint context
 * @param {Object} node - AST node
 * @returns {boolean} True if in schema file
 */
function isSchemaLiteral(context, node) {
	const filename = context.getFilename();
	return (
		filename.includes('tables.ts') ||
		filename.includes('tables.js') ||
		filename.includes('/schema.ts') ||
		filename.includes('/schema.js')
	);
}

/**
 * Check if file is documentation (should allow hardcoded values)
 * @param {Object} context - ESLint context
 * @returns {boolean} True if documentation file
 */
function isDocumentationFile(context) {
	const filename = context.getFilename();
	return filename.endsWith('.md') || filename.endsWith('.mdx');
}

/**
 * Get suggestion for fixing hardcoded value
 * @param {string} value - Hardcoded value
 * @returns {string} Suggested constant name
 */
function getConstantSuggestion(value) {
	const mapping = {
		hierarchy: 'CIRCLE_TYPES.HIERARCHY',
		empowered_team: 'CIRCLE_TYPES.EMPOWERED_TEAM',
		guild: 'CIRCLE_TYPES.GUILD',
		hybrid: 'CIRCLE_TYPES.HYBRID',
		manager_decides: 'DECISION_MODELS.MANAGER_DECIDES',
		team_consensus: 'DECISION_MODELS.TEAM_CONSENSUS',
		consent: 'DECISION_MODELS.CONSENT',
		coordination_only: 'DECISION_MODELS.COORDINATION_ONLY'
	};
	return mapping[value] || value;
}

export default {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Prevent hardcoded circle type and decision model string literals. Use constants from convex/core/circles/constants.ts',
			category: 'Best Practices',
			recommended: true
		},
		messages: {
			hardcodedCircleConstant:
				'Hardcoded constant "{{value}}" detected. Use {{suggestion}} instead. Import from: import { CIRCLE_TYPES, DECISION_MODELS } from "../circles" or "convex/core/circles". See: convex/core/circles/constants.ts',
			hardcodedInUnionType:
				'Hardcoded constant in union type. Use type CircleType or DecisionModel from convex/core/circles/constants.ts instead.'
		},
		schema: []
	},
	create(context) {
		return {
			// Check string literals
			Literal(node) {
				// Skip if not a string
				if (typeof node.value !== 'string') return;

				// Skip documentation files
				if (isDocumentationFile(context)) return;

				// Skip if in schema literal (tables.ts)
				if (isSchemaLiteral(context, node)) return;

				// Skip if in computed property (already using constant)
				if (isComputedProperty(node)) return;

				// Check if value matches a constant
				if (isHardcodedConstant(node.value)) {
					const suggestion = getConstantSuggestion(node.value);
					context.report({
						node,
						messageId: 'hardcodedCircleConstant',
						data: {
							value: node.value,
							suggestion
						}
					});
				}
			},

			// Check union types with hardcoded values
			TSUnionType(node) {
				// Skip documentation files
				if (isDocumentationFile(context)) return;

				// Check if union contains hardcoded circle/decision model values
				const hasHardcodedConstant = node.types.some((typeNode) => {
					if (typeNode.type === 'TSLiteralType' && typeNode.literal) {
						const value = typeNode.literal.value;
						return typeof value === 'string' && isHardcodedConstant(value);
					}
					return false;
				});

				if (hasHardcodedConstant) {
					context.report({
						node,
						messageId: 'hardcodedInUnionType',
						data: {}
					});
				}
			}
		};
	}
};
