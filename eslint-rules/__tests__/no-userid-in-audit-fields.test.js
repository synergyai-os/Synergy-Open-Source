/**
 * Tests for no-userid-in-audit-fields ESLint rule
 * @see eslint-rules/no-userid-in-audit-fields.js
 */

import { RuleTester } from 'eslint';
import noUseridInAuditFields from '../no-userid-in-audit-fields.js';

const ruleTester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2022,
		sourceType: 'module'
	}
});

ruleTester.run('no-userid-in-audit-fields', noUseridInAuditFields, {
	valid: [
		{
			name: 'Correct: uses v.id("people") for audit fields',
			code: `
				export const myTable = defineTable({
					workspaceId: v.id('workspaces'),
					name: v.string(),
					createdAt: v.number(),
					createdByPersonId: v.id('people'),
					updatedAt: v.number(),
					updatedByPersonId: v.optional(v.id('people')),
					archivedAt: v.optional(v.number()),
					archivedByPersonId: v.optional(v.id('people'))
				});
			`,
			filename: 'convex/core/circles/tables.ts'
		},
		{
			name: 'Correct: uses v.id("people") for changedBy field',
			code: `
				export const historyTable = defineTable({
					workspaceId: v.id('workspaces'),
					changedAt: v.number(),
					changedByPersonId: v.id('people')
				});
			`,
			filename: 'convex/core/history/tables.ts'
		},
		{
			name: 'Allowed: non-audit field with userId (not an audit pattern)',
			code: `
				export const myTable = defineTable({
					workspaceId: v.id('workspaces'),
					ownerId: v.id('users'),
					targetUserId: v.id('users')
				});
			`,
			filename: 'convex/features/example/tables.ts'
		},
		{
			name: 'Exception: RBAC infrastructure tables',
			code: `
				export const userRolesTable = defineTable({
					userId: v.id('users'),
					createdBy: v.id('users')
				});
			`,
			filename: 'convex/infrastructure/rbac/tables.ts'
		},
		{
			name: 'Exception: workspace branding.updatedBy (infrastructure-level)',
			code: `
				export const workspacesTable = defineTable({
					name: v.string(),
					branding: v.optional(v.object({
						primaryColor: v.string(),
						updatedBy: v.id('users')
					}))
				});
			`,
			filename: 'convex/core/workspaces/tables.ts'
		},
		{
			name: 'Non-table file: should be ignored',
			code: `
				const config = {
					createdBy: v.id('users')
				};
			`,
			filename: 'convex/core/circles/queries.ts'
		}
	],
	invalid: [
		{
			name: 'Invalid: createdBy uses v.id("users")',
			code: `
				export const myTable = defineTable({
					workspaceId: v.id('workspaces'),
					name: v.string(),
					createdAt: v.number(),
					createdBy: v.id('users')
				});
			`,
			filename: 'convex/features/projects/tables.ts',
			errors: [
				{
					messageId: 'auditFieldIncorrectNaming',
					data: { fieldName: 'createdBy' }
				},
				{
					messageId: 'auditFieldUsesUserId',
					data: { fieldName: 'createdBy' }
				}
			]
		},
		{
			name: 'Invalid: updatedBy uses v.optional(v.id("users"))',
			code: `
				export const myTable = defineTable({
					workspaceId: v.id('workspaces'),
					updatedAt: v.number(),
					updatedBy: v.optional(v.id('users'))
				});
			`,
			filename: 'convex/features/tasks/tables.ts',
			errors: [
				{
					messageId: 'auditFieldIncorrectNaming',
					data: { fieldName: 'updatedBy' }
				},
				{
					messageId: 'auditFieldUsesUserId',
					data: { fieldName: 'updatedBy' }
				}
			]
		},
		{
			name: 'Invalid: archivedBy uses v.optional(v.id("users"))',
			code: `
				export const myTable = defineTable({
					workspaceId: v.id('workspaces'),
					archivedAt: v.optional(v.number()),
					archivedBy: v.optional(v.id('users'))
				});
			`,
			filename: 'convex/features/customFields/tables.ts',
			errors: [
				{
					messageId: 'auditFieldIncorrectNaming',
					data: { fieldName: 'archivedBy' }
				},
				{
					messageId: 'auditFieldUsesUserId',
					data: { fieldName: 'archivedBy' }
				}
			]
		},
		{
			name: 'Invalid: deletedBy uses v.id("users")',
			code: `
				export const myTable = defineTable({
					workspaceId: v.id('workspaces'),
					deletedAt: v.number(),
					deletedBy: v.id('users')
				});
			`,
			filename: 'convex/core/roles/tables.ts',
			errors: [
				{
					messageId: 'auditFieldIncorrectNaming',
					data: { fieldName: 'deletedBy' }
				},
				{
					messageId: 'auditFieldUsesUserId',
					data: { fieldName: 'deletedBy' }
				}
			]
		},
		{
			name: 'Invalid: modifiedBy uses v.id("users")',
			code: `
				export const myTable = defineTable({
					workspaceId: v.id('workspaces'),
					modifiedAt: v.number(),
					modifiedBy: v.id('users')
				});
			`,
			filename: 'convex/core/proposals/tables.ts',
			errors: [
				{
					messageId: 'auditFieldIncorrectNaming',
					data: { fieldName: 'modifiedBy' }
				},
				{
					messageId: 'auditFieldUsesUserId',
					data: { fieldName: 'modifiedBy' }
				}
			]
		},
		{
			name: 'Invalid: changedBy uses v.id("users")',
			code: `
				export const historyTable = defineTable({
					workspaceId: v.id('workspaces'),
					changedAt: v.number(),
					changedBy: v.id('users')
				});
			`,
			filename: 'convex/core/history/tables.ts',
			errors: [
				{
					messageId: 'auditFieldIncorrectNaming',
					data: { fieldName: 'changedBy' }
				},
				{
					messageId: 'auditFieldUsesUserId',
					data: { fieldName: 'changedBy' }
				}
			]
		},
		{
			name: 'Invalid: multiple violations in same table',
			code: `
				export const myTable = defineTable({
					workspaceId: v.id('workspaces'),
					createdBy: v.id('users'),
					updatedBy: v.optional(v.id('users')),
					archivedBy: v.optional(v.id('users'))
				});
			`,
			filename: 'convex/features/projects/tables.ts',
			errors: [
				{
					messageId: 'auditFieldIncorrectNaming',
					data: { fieldName: 'createdBy' }
				},
				{
					messageId: 'auditFieldUsesUserId',
					data: { fieldName: 'createdBy' }
				},
				{
					messageId: 'auditFieldIncorrectNaming',
					data: { fieldName: 'updatedBy' }
				},
				{
					messageId: 'auditFieldUsesUserId',
					data: { fieldName: 'updatedBy' }
				},
				{
					messageId: 'auditFieldIncorrectNaming',
					data: { fieldName: 'archivedBy' }
				},
				{
					messageId: 'auditFieldUsesUserId',
					data: { fieldName: 'archivedBy' }
				}
			]
		}
	]
});

console.log('✅ All no-userid-in-audit-fields tests passed!');
