/**
 * Task Form Composable
 *
 * Provides form state and business logic for task management.
 *
 * Features:
 * - Form state management (description, assignee, dueDate)
 * - Business logic (create, update, delete, toggle status)
 * - Validation logic
 * - Utility functions (formatDate, getAssigneeName, etc.)
 */

import { browser } from '$app/environment';
import { useConvexClient } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import { toast } from 'svelte-sonner';
import { DEFAULT_LOCALE, DEFAULT_SHORT_DATE_FORMAT } from '$lib/utils/locale';
import type { UseTaskFormReturn, Task } from '../api';
import type { Task as TaskDoc } from './useTasks.svelte';

export function useTaskForm(params: UseTaskFormOptions): UseTaskFormReturn {
	const convexClient = browser ? useConvexClient() : null;

	// State
	const state = $state({
		isAdding: false,
		editingId: null as Id<'tasks'> | null,
		// Form state
		description: '',
		assigneeType: 'user' as 'user' | 'role',
		assigneeUserId: null as Id<'users'> | null,
		assigneeRoleId: null as Id<'circleRoles'> | null,
		dueDate: null as number | null
	});

	// Reset form
	function resetForm() {
		state.description = '';
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

	// Handle create task
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
			await convexClient?.mutation(api.tasks.create, {
				sessionId: params.sessionId(),
				workspaceId: params.workspaceId(),
				meetingId: params.meetingId(),
				agendaItemId: params.agendaItemId(),
				circleId: params.circleId?.() ?? undefined,
				assigneeType: state.assigneeType,
				assigneeUserId: state.assigneeUserId ?? undefined,
				assigneeRoleId: state.assigneeRoleId ?? undefined,
				description: state.description.trim(),
				dueDate: state.dueDate ?? undefined
			});

			toast.success('Task created');
			resetForm();
		} catch (error) {
			console.error('Failed to create task:', error);
			toast.error('Failed to create task');
		}
	}

	// Handle toggle status
	async function handleToggleStatus(
		taskId: Id<'tasks'>,
		currentStatus: 'todo' | 'in-progress' | 'done'
	) {
		try {
			const newStatus = currentStatus === 'done' ? 'todo' : 'done';
			await convexClient?.mutation(api.tasks.updateStatus, {
				sessionId: params.sessionId(),
				actionItemId: taskId,
				status: newStatus
			});
		} catch (error) {
			console.error('Failed to update status:', error);
			toast.error('Failed to update status');
		}
	}

	// Handle delete
	async function handleDelete(taskId: Id<'tasks'>) {
		if (!confirm('Delete this task?')) return;

		try {
			await convexClient?.mutation(api.tasks.remove, {
				sessionId: params.sessionId(),
				actionItemId: taskId
			});
			toast.success('Task deleted');
		} catch (error) {
			console.error('Failed to delete task:', error);
			toast.error('Failed to delete task');
		}
	}

	// Format date
	function formatDate(timestamp: number): string {
		// Use Date constructor for formatting (not mutated, only used for display)
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		return new Date(timestamp).toLocaleDateString(DEFAULT_LOCALE, DEFAULT_SHORT_DATE_FORMAT);
	}

	// Get assignee name
	function getAssigneeName(item: Task | TaskDoc): string {
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
