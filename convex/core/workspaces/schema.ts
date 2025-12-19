import { v } from 'convex/values';

/**
 * Activation Issue Type
 *
 * Represents a validation issue that blocks workspace activation (design → active phase).
 *
 * @see SYOS-997: Activation validation query and mutation
 */
export const ActivationIssueValidator = v.object({
	id: v.string(), // Unique ID for React keys
	code: v.string(), // e.g., 'GOV-01', 'GOV-02', 'ORG-10'
	severity: v.literal('error'), // All blocking for now
	entityType: v.union(v.literal('circle'), v.literal('role'), v.literal('workspace')),
	entityId: v.string(), // ID of the problematic entity
	entityName: v.string(), // Human-readable name
	message: v.string(), // "Role 'Developer' is missing decision rights"
	actionType: v.union(
		v.literal('edit_role'),
		v.literal('edit_circle'),
		v.literal('assign_lead'),
		v.literal('create_root')
	),
	actionUrl: v.string() // Direct link to fix the issue
});

export type ActivationIssue = {
	id: string;
	code: string;
	severity: 'error';
	entityType: 'circle' | 'role' | 'workspace';
	entityId: string;
	entityName: string;
	message: string;
	actionType: 'edit_role' | 'edit_circle' | 'assign_lead' | 'create_root';
	actionUrl: string;
};
