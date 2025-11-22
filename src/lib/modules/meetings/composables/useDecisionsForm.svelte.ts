/**
 * Decisions Form Composable
 *
 * SYOS-470: Extracts form state and business logic from DecisionsList component
 *
 * Features:
 * - Form state management (title, description, isAdding, editingId)
 * - Business logic (create, update, delete)
 * - Validation logic
 * - Utility functions (formatTimestamp)
 */

import { browser } from '$app/environment';
import { useConvexClient } from 'convex-svelte';
import { api, type Id } from '$lib/convex';

interface UseDecisionsFormParams {
	sessionId: () => string;
	meetingId: () => Id<'meetings'>;
	agendaItemId: () => Id<'meetingAgendaItems'>;
	readonly?: () => boolean;
}

export interface UseDecisionsFormReturn {
	get isAdding(): boolean;
	get editingId(): Id<'meetingDecisions'> | null;
	get newTitle(): string;
	set newTitle(value: string);
	get newDescription(): string;
	set newDescription(value: string);
	get editTitle(): string;
	set editTitle(value: string);
	get editDescription(): string;
	set editDescription(value: string);
	get hoveredId(): Id<'meetingDecisions'> | null;
	set hoveredId(value: Id<'meetingDecisions'> | null);
	get error(): string | null;
	get isSaving(): boolean;

	startAdding: () => void;
	cancelAdding: () => void;
	handleCreate: () => Promise<void>;
	startEditing: (decision: {
		_id: Id<'meetingDecisions'>;
		title: string;
		description: string;
	}) => void;
	cancelEditing: () => void;
	handleUpdate: (decisionId: Id<'meetingDecisions'>) => Promise<void>;
	handleDelete: (decisionId: Id<'meetingDecisions'>) => Promise<void>;

	// Utility functions
	formatTimestamp: (timestamp: number) => string;
}

export function useDecisionsForm(params: UseDecisionsFormParams): UseDecisionsFormReturn {
	const convexClient = browser ? useConvexClient() : null;

	// State
	const state = $state({
		isAdding: false,
		editingId: null as Id<'meetingDecisions'> | null,
		// Form state
		newTitle: '',
		newDescription: '',
		editTitle: '',
		editDescription: '',
		hoveredId: null as Id<'meetingDecisions'> | null,
		error: null as string | null,
		isSaving: false
	});

	// Start adding (show form)
	function startAdding() {
		state.isAdding = true;
		state.editingId = null;
		state.newTitle = '';
		state.newDescription = '';
		state.error = null;
	}

	// Cancel adding
	function cancelAdding() {
		state.isAdding = false;
		state.newTitle = '';
		state.newDescription = '';
		state.error = null;
	}

	// Handle create decision
	async function handleCreate() {
		if (!params.sessionId() || !convexClient) return;
		if (!state.newTitle.trim()) {
			state.error = 'Title is required';
			return;
		}

		state.isSaving = true;
		state.error = null;

		try {
			await convexClient.mutation(api.meetingDecisions.create, {
				sessionId: params.sessionId(),
				meetingId: params.meetingId(),
				agendaItemId: params.agendaItemId(),
				title: state.newTitle.trim(),
				description: state.newDescription.trim()
			});

			// Reset form
			state.isAdding = false;
			state.newTitle = '';
			state.newDescription = '';
		} catch (err) {
			state.error = err instanceof Error ? err.message : 'Failed to create decision';
		} finally {
			state.isSaving = false;
		}
	}

	// Start editing
	function startEditing(decision: {
		_id: Id<'meetingDecisions'>;
		title: string;
		description: string;
	}) {
		state.editingId = decision._id;
		state.editTitle = decision.title;
		state.editDescription = decision.description;
		state.isAdding = false;
		state.error = null;
	}

	// Cancel editing
	function cancelEditing() {
		state.editingId = null;
		state.editTitle = '';
		state.editDescription = '';
		state.error = null;
	}

	// Handle update decision
	async function handleUpdate(decisionId: Id<'meetingDecisions'>) {
		if (!params.sessionId() || !convexClient) return;
		if (!state.editTitle.trim()) {
			state.error = 'Title is required';
			return;
		}

		state.isSaving = true;
		state.error = null;

		try {
			await convexClient.mutation(api.meetingDecisions.update, {
				sessionId: params.sessionId(),
				decisionId,
				title: state.editTitle.trim(),
				description: state.editDescription.trim()
			});

			// Reset editing state
			state.editingId = null;
			state.editTitle = '';
			state.editDescription = '';
		} catch (err) {
			state.error = err instanceof Error ? err.message : 'Failed to update decision';
		} finally {
			state.isSaving = false;
		}
	}

	// Handle delete
	async function handleDelete(decisionId: Id<'meetingDecisions'>) {
		if (!params.sessionId() || !convexClient) return;

		state.error = null;

		try {
			await convexClient.mutation(api.meetingDecisions.remove, {
				sessionId: params.sessionId(),
				decisionId
			});
		} catch (err) {
			state.error = err instanceof Error ? err.message : 'Failed to delete decision';
		}
	}

	// Format timestamp
	function formatTimestamp(timestamp: number): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;

		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
		});
	}

	return {
		get isAdding() {
			return state.isAdding;
		},
		get editingId() {
			return state.editingId;
		},
		get newTitle() {
			return state.newTitle;
		},
		set newTitle(value: string) {
			state.newTitle = value;
		},
		get newDescription() {
			return state.newDescription;
		},
		set newDescription(value: string) {
			state.newDescription = value;
		},
		get editTitle() {
			return state.editTitle;
		},
		set editTitle(value: string) {
			state.editTitle = value;
		},
		get editDescription() {
			return state.editDescription;
		},
		set editDescription(value: string) {
			state.editDescription = value;
		},
		get hoveredId() {
			return state.hoveredId;
		},
		set hoveredId(value: Id<'meetingDecisions'> | null) {
			state.hoveredId = value;
		},
		get error() {
			return state.error;
		},
		get isSaving() {
			return state.isSaving;
		},
		startAdding,
		cancelAdding,
		handleCreate,
		startEditing,
		cancelEditing,
		handleUpdate,
		handleDelete,
		formatTimestamp
	};
}
