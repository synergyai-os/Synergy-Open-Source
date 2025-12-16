/**
 * ESLint rule: no-userid-in-audit-fields
 *
 * Enforces XDOM-01 and XDOM-02 invariants at the schema level.
 * Prevents audit fields from using v.id('users') instead of v.id('people').
 *
 * **Problem**: Convex queries can't check schema definitions at runtime.
 * Runtime invariants (SYOS-802) only check data records, not schema.
 *
 * **Solution**: This ESLint rule performs static analysis on table definitions
 * to catch violations before they reach production.
 *
 * Rules enforced:
 * - ❌ BLOCKED: Audit fields using v.id('users')
 *   - createdBy, updatedBy, archivedBy, deletedBy, modifiedBy, changedBy
 * - ✅ REQUIRED: Use v.id('people') with *PersonId suffix
 *   - createdByPersonId, updatedByPersonId, archivedByPersonId, etc.
 * - ⚠️  EXCEPTIONS: Infrastructure-level tables (RBAC, branding)
 *
 * @see convex/admin/invariants/INVARIANTS.md - XDOM-01, XDOM-02
 * @see dev-docs/master-docs/architecture.md - Identity Architecture
 * @see SYOS-842 - Schema-level validation implementation
 */

/**
 * Known exceptions: Infrastructure tables that legitimately use userId
 */
const EXCEPTION_PATHS = [
	// RBAC infrastructure (spans workspaces)
	'convex/infrastructure/rbac/',
	// Workspace branding (infrastructure-level)
	'convex/core/workspaces/tables.ts'
];

/**
 * Known exception: Specific fields that legitimately use userId
 */
const EXCEPTION_FIELDS = [
	// Workspace branding updatedBy (infrastructure-level)
	{
		file: 'convex/core/workspaces/tables.ts',
		field: 'updatedBy',
		reason: 'Infrastructure-level branding'
	},
	// Workspace invites (pre-person creation flow)
	{
		file: 'convex/core/workspaces/tables.ts',
		field: 'invitedBy',
		reason: 'Invite flow (pre-person)'
	},
	{
		file: 'convex/core/workspaces/tables.ts',
		field: 'invitedUserId',
		reason: 'Invite target (pre-person)'
	}
];

/**
 * Audit field patterns (createdBy, updatedBy, archivedBy, etc.)
 */
const AUDIT_FIELD_PATTERN = /(created|updated|archived|deleted|modified|changed)By/i;

/**
 * Check if file path matches exception paths
 * @param {string} filePath - File path to check
 * @returns {boolean} True if path is in exceptions
 */
function isExceptionPath(filePath) {
	return EXCEPTION_PATHS.some((exceptionPath) => filePath.includes(exceptionPath));
}

/**
 * Check if specific field is an exception
 * @param {string} filePath - File path
 * @param {string} fieldName - Field name
 * @returns {boolean} True if field is an exception
 */
function isExceptionField(filePath, fieldName) {
	return EXCEPTION_FIELDS.some(
		(exception) => filePath.includes(exception.file) && fieldName === exception.field
	);
}

/**
 * Check if a node is a call to v.id('users')
 * @param {object} node - AST node
 * @returns {boolean} True if node is v.id('users') call
 */
function isVIdUsersCall(node) {
	return (
		node.type === 'CallExpression' &&
		node.callee.type === 'MemberExpression' &&
		node.callee.object.name === 'v' &&
		node.callee.property.name === 'id' &&
		node.arguments.length === 1 &&
		node.arguments[0].type === 'Literal' &&
		node.arguments[0].value === 'users'
	);
}

/**
 * Check if a node is a v.optional() or v.union() wrapping v.id('users')
 * @param {object} node - AST node
 * @returns {boolean} True if node wraps v.id('users')
 */
function wrapsVIdUsers(node) {
	// v.optional(v.id('users'))
	if (
		node.type === 'CallExpression' &&
		node.callee.type === 'MemberExpression' &&
		node.callee.object.name === 'v' &&
		(node.callee.property.name === 'optional' || node.callee.property.name === 'union')
	) {
		// Check first argument
		if (node.arguments.length > 0 && isVIdUsersCall(node.arguments[0])) {
			return true;
		}
		// Recursively check if any argument wraps v.id('users')
		return node.arguments.some((arg) => wrapsVIdUsers(arg));
	}
	return false;
}

/**
 * Check if node represents v.id('users') or wrappers
 * @param {object} node - AST node
 * @returns {boolean} True if node uses v.id('users')
 */
function usesVIdUsers(node) {
	return isVIdUsersCall(node) || wrapsVIdUsers(node);
}

export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Enforce XDOM-01/XDOM-02: audit fields must use personId, not userId',
			category: 'Architecture',
			recommended: true
		},
		messages: {
			auditFieldUsesUserId:
				"Audit field \"{{fieldName}}\" uses v.id('users') instead of v.id('people'). " +
				'All audit fields (createdBy, updatedBy, archivedBy) must use personId. ' +
				'Use "{{fieldName}}PersonId: v.id(\'people\')" instead. ' +
				'See: convex/admin/invariants/INVARIANTS.md (XDOM-01, XDOM-02)',
			auditFieldIncorrectNaming:
				'Audit field "{{fieldName}}" should be renamed to "{{fieldName}}PersonId" to follow naming convention. ' +
				'Use "{{fieldName}}PersonId: v.id(\'people\')" instead. ' +
				'See: convex/admin/invariants/INVARIANTS.md (XDOM-02)'
		},
		schema: [],
		fixable: 'code'
	},
	create(context) {
		const filePath = context.getFilename();

		// Skip if not a Convex table definition file
		if (!filePath.includes('convex/') || !filePath.endsWith('tables.ts')) {
			return {};
		}

		// Skip if file is in exception paths
		if (isExceptionPath(filePath)) {
			return {};
		}

		return {
			/**
			 * Check property definitions in table schemas
			 * Pattern: { createdBy: v.id('users'), ... }
			 */
			Property(node) {
				// Only check properties in object expressions
				if (node.parent.type !== 'ObjectExpression') {
					return;
				}

				// Get property name
				const fieldName = node.key.type === 'Identifier' ? node.key.name : null;
				if (!fieldName) {
					return;
				}

				// Check if this is an audit field
				if (!AUDIT_FIELD_PATTERN.test(fieldName)) {
					return;
				}

				// Check if this specific field is an exception
				if (isExceptionField(filePath, fieldName)) {
					return;
				}

				// Check if property value uses v.id('users')
				if (usesVIdUsers(node.value)) {
					// Check naming: should be *PersonId
					if (!fieldName.endsWith('PersonId')) {
						context.report({
							node: node.key,
							messageId: 'auditFieldIncorrectNaming',
							data: { fieldName }
						});
					}

					// Report userId usage
					context.report({
						node: node.value,
						messageId: 'auditFieldUsesUserId',
						data: { fieldName }
					});
				}
			}
		};
	}
};
