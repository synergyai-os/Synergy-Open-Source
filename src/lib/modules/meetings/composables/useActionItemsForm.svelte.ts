/**
 * Action Items Form Composable
 *
 * SYOS-467: Extracts form state and business logic from ActionItemsList component
 *
 * Features:
 * - Form state management (description, type, assignee, dueDate)
 * - Business logic (create, update, delete, toggle status)
 * - Validation logic
 * - Utility functions (formatDate, getAssigneeName, etc.)
 */

import { browser } from '$app/environment';
import { useConvexClient } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import { toast } from 'svelte-sonner';
import type { ActionItem, Member, Role } from './useActionItems.svelte';

interface UseActionItemsFormParams {
	sessionId: () => string;
	meetingId: () => Id<'meetings'>;
	agendaItemId: () => Id<'meetingAgendaItems'>;
	circleId?: () => Id<'circles'> | undefined;
	members: () => Member[];
	roles: () => Role[];
	readonly?: () => boolean;
}

export interface UseActionItemsFormReturn {
	get isAdding(): boolean;
	set isAdding(value: boolean);
	get description(): string;
	set description(value: string);
	get type(): 'next-step' | 'project';
	set type(value: 'next-step' | 'project');
	get assigneeType(): 'user' | 'role';
	set assigneeType(value: 'user' | 'role');
	get assigneeUserId(): Id<'users'> | null;
	set assigneeUserId(value: Id<'users'> | null);
	get assigneeRoleId(): Id<'circleRoles'> | null;
	set assigneeRoleId(value: Id<'circleRoles'> | null);
	get dueDate(): number | null;
	set dueDate(value: number | null);

	startAdding: () => void;
	resetForm: () => void;
	handleCreate: () => Promise<void>;
	handleToggleStatus: (
		id: Id<'meetingActionItems'>,
		currentStatus: 'todo' | 'in-progress' | 'done'
	) => Promise<void>;
	handleDelete: (id: Id<'meetingActionItems'>) => Promise<void>;

	// Utility functions
	formatDate: (timestamp: number) => string;
	getAssigneeName: (item: ActionItem) => string;
	getInitials: (name: string) => string;
	handleDueDateChange: (e: Event) => void;
	timestampToDateInput: (timestamp: number | null) => string;
}

export function useActionItemsForm(params: UseActionItemsFormParams): UseActionItemsFormReturn {
	const convexClient = browser ? useConvexClient() : null;

	// State
	const state = $state({
		isAdding: false,
		editingId: null as Id<'meetingActionItems'> | null,
		// Form state
		description: '',
		type: 'next-step' as 'next-step' | 'project',
		assigneeType: 'user' as 'user' | 'role',
		assigneeUserId: null as Id<'users'> | null,
		assigneeRoleId: null as Id<'circleRoles'> | null,
		dueDate: null as number | null
	});

	// Reset form
	function resetForm() {
		state.description = '';
		state.type = 'next-step';
		state.assigneeType = 'user';
		state.assigneeUserId = null;
		state.assigneeRoleId = null;
		state.dueDate = null;
		state.isAdding = false;
		state.editingId = null;
	}

	// Start adding (show form)
	function startAdding() {
		state.isAdding = true;
	}

	// Handle create action item
	async function handleCreate() {
		if (!state.description.trim()) {
			toast.error('Description is required');
			return;
		}

		// Validate assignee
		if (state.assigneeType === 'user' && !state.assigneeUserId) {
			toast.error('Please select a user');
			return;
		}

		if (state.assigneeType === 'role' && !state.assigneeRoleId) {
			toast.error('Please select a role');
			return;
		}

		try {
			await convexClient?.mutation(api.meetingActionItems.create, {
				sessionId: params.sessionId(),
				meetingId: params.meetingId(),
				agendaItemId: params.agendaItemId(),
				circleId: params.circleId?.() ?? undefined,
				type: state.type,
				assigneeType: state.assigneeType,
				assigneeUserId: state.assigneeUserId ?? undefined,
				assigneeRoleId: state.assigneeRoleId ?? undefined,
				description: state.description.trim(),
				dueDate: state.dueDate ?? undefined
			});

			toast.success('Action item created');
			resetForm();
		} catch (error) {
			console.error('Failed to create action item:', error);
			toast.error('Failed to create action item');
		}
	}

	// Handle toggle status
	async function handleToggleStatus(
		actionItemId: Id<'meetingActionItems'>,
		currentStatus: 'todo' | 'in-progress' | 'done'
	) {
		try {
			const newStatus = currentStatus === 'done' ? 'todo' : 'done';
			await convexClient?.mutation(api.meetingActionItems.updateStatus, {
				sessionId: params.sessionId(),
				actionItemId,
				status: newStatus
			});
		} catch (error) {
			console.error('Failed to update status:', error);
			toast.error('Failed to update status');
		}
	}

	// Handle delete
	async function handleDelete(actionItemId: Id<'meetingActionItems'>) {
		if (!confirm('Delete this action item?')) return;

		try {
			await convexClient?.mutation(api.meetingActionItems.remove, {
				sessionId: params.sessionId(),
				actionItemId
			});
			toast.success('Action item deleted');
		} catch (error) {
			console.error('Failed to delete action item:', error);
			toast.error('Failed to delete action item');
		}
	}

	// Format date
	function formatDate(timestamp: number): string {
		// Use Date constructor for formatting (not mutated, only used for display)
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		return new Date(timestamp).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	// Get assignee name
	function getAssigneeName(item: ActionItem): string {
		const members = params.members();
		const roles = params.roles();

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

	// Get initials for avatar
	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	// Handle due date change (convert to timestamp)
	function handleDueDateChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.value) {
			// Use Date constructor to parse input value (not mutated, immediately converted to timestamp)
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			state.dueDate = new Date(input.value).getTime();
		} else {
			state.dueDate = null;
		}
	}

	// Convert timestamp to date input value (YYYY-MM-DD)
	function timestampToDateInput(timestamp: number | null): string {
		if (!timestamp) return '';
		// Use Date constructor for formatting (not mutated, only used for display)
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		return new Date(timestamp).toISOString().split('T')[0];
	}

	return {
		get isAdding() {
			return state.isAdding;
		},
		set isAdding(value: boolean) {
			state.isAdding = value;
		},
		get description() {
			return state.description;
		},
		set description(value: string) {
			state.description = value;
		},
		get type() {
			return state.type;
		},
		set type(value: 'next-step' | 'project') {
			state.type = value;
		},
		get assigneeType() {
			return state.assigneeType;
		},
		set assigneeType(value: 'user' | 'role') {
			state.assigneeType = value;
		},
		get assigneeUserId() {
			return state.assigneeUserId;
		},
		set assigneeUserId(value: Id<'users'> | null) {
			state.assigneeUserId = value;
		},
		get assigneeRoleId() {
			return state.assigneeRoleId;
		},
		set assigneeRoleId(value: Id<'circleRoles'> | null) {
			state.assigneeRoleId = value;
		},
		get dueDate() {
			return state.dueDate;
		},
		set dueDate(value: number | null) {
			state.dueDate = value;
		},
		startAdding,
		resetForm,
		handleCreate,
		handleToggleStatus,
		handleDelete,
		formatDate,
		getAssigneeName,
		getInitials,
		handleDueDateChange,
		timestampToDateInput
	};
}
