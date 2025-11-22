/**
 * Mock useActionItemsForm composable for Storybook
 * Returns no-op form handlers instead of Convex mutations
 */

import type { Id } from './convex';

interface Member {
	userId: Id<'users'>;
	email: string;
	name: string;
	role: string;
	joinedAt: number;
}

interface Role {
	roleId: Id<'circleRoles'>;
	circleId: Id<'circles'>;
	name: string;
	purpose: string | undefined;
	fillerCount: number;
	createdAt: number;
}

interface ActionItem {
	_id: Id<'meetingActionItems'>;
	assigneeType: 'user' | 'role';
	assigneeUserId?: Id<'users'>;
	assigneeRoleId?: Id<'circleRoles'>;
	[key: string]: unknown;
}

interface UseActionItemsFormProps {
	sessionId: () => string;
	meetingId: () => Id<'meetings'>;
	agendaItemId: () => Id<'meetingAgendaItems'>;
	circleId?: () => Id<'circles'> | undefined;
	members: () => Member[];
	roles: () => Role[];
	readonly: () => boolean;
}

export function useActionItemsForm(props: UseActionItemsFormProps) {
	// Utility functions
	function getAssigneeName(item: ActionItem): string {
		const members = props.members();
		const roles = props.roles();

		if (item.assigneeType === 'user' && item.assigneeUserId) {
			const member = members.find((m) => m.userId === item.assigneeUserId);
			return member?.name || member?.email || 'Unknown User';
		}

		if (item.assigneeType === 'role' && item.assigneeRoleId) {
			const role = roles.find((r) => r.roleId === item.assigneeRoleId);
			return role?.name || 'Unknown Role';
		}

		return 'Unassigned';
	}

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	// Return mock form state and handlers
	return {
		// Form state
		isAdding: false,
		description: '',
		type: 'next-step' as 'next-step' | 'project',
		assigneeType: 'user' as 'user' | 'role',
		assigneeUserId: undefined as Id<'users'> | undefined,
		assigneeRoleId: undefined as Id<'circleRoles'> | undefined,
		dueDate: null as number | null,

		// Form actions
		startAdding: () => {
			console.log('Mock: Start adding action item');
		},
		cancelAdding: () => {
			console.log('Mock: Cancel adding');
		},
		handleCreate: async () => {
			console.log('Mock: Create action item');
		},
		handleToggleStatus: async (actionItemId: Id<'meetingActionItems'>, status: string) => {
			console.log('Mock: Toggle status:', actionItemId, status);
		},
		handleDelete: async (actionItemId: Id<'meetingActionItems'>) => {
			console.log('Mock: Delete action item:', actionItemId);
		},
		handleDueDateChange: (e: Event) => {
			console.log('Mock: Due date changed:', e);
		},
		timestampToDateInput: (timestamp: number | null): string => {
			if (!timestamp) return '';
			return new Date(timestamp).toISOString().split('T')[0];
		},

		// Utility functions
		getAssigneeName,
		getInitials,

		// Validation
		canSubmit: false
	};
}
