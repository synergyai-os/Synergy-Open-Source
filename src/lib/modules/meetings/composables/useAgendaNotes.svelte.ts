/**
 * Agenda Notes Composable
 *
 * SYOS-222: Manages note-taking for meeting agenda items
 *
 * Features:
 * - Auto-save with debounce (500ms)
 * - Save state tracking (idle/saving/saved/error)
 * - Immediate save on destroy (navigation)
 * - Last-write-wins conflict resolution
 */

import { useConvexClient } from 'convex-svelte';
import { api } from '$lib/convex';
import { untrack } from 'svelte';
import type { Id } from '$lib/convex';

interface UseAgendaNotesParams {
	agendaItemId: () => Id<'meetingAgendaItems'>;
	initialNotes: () => string | undefined;
	sessionId: () => string | undefined;
}

export interface UseAgendaNotesReturn {
	get localNotes(): string;
	set localNotes(value: string);
	get saveState(): 'idle' | 'saving' | 'saved' | 'error';
	get saveError(): string | null;
	handleNotesChange: (content: string, markdown: string) => void;
	saveImmediately: () => Promise<void>;
}

export function useAgendaNotes(params: UseAgendaNotesParams): UseAgendaNotesReturn {
	const convexClient = useConvexClient();

	// State
	const state = $state({
		localNotes: '',
		saveState: 'idle' as 'idle' | 'saving' | 'saved' | 'error',
		saveError: null as string | null,
		lastItemId: undefined as Id<'meetingAgendaItems'> | undefined
	});

	let saveTimeout: ReturnType<typeof setTimeout> | null = null;

	// Sync notes when switching items (ID changes), not on every backend update
	$effect(() => {
		const itemId = params.agendaItemId();
		const notes = params.initialNotes();

		// Only sync if item changed (switching items)
		if (itemId !== state.lastItemId) {
			untrack(() => {
				state.lastItemId = itemId;
				state.localNotes = notes || '';
				state.saveState = 'idle';
			});
		}
	});

	/**
	 * Save notes to backend
	 */
	async function saveNotes(content: string): Promise<void> {
		const sessionId = params.sessionId();
		const agendaItemId = params.agendaItemId();

		if (!sessionId || !agendaItemId) {
			state.saveState = 'error';
			state.saveError = 'Missing session or agenda item ID';
			return;
		}

		try {
			state.saveState = 'saving';
			state.saveError = null;

			await convexClient.mutation(api.features.meetings.agendaItems.updateNotes, {
				sessionId,
				agendaItemId,
				notes: content
			});

			state.saveState = 'saved';

			// Reset to idle after 2 seconds
			setTimeout(() => {
				if (state.saveState === 'saved') {
					state.saveState = 'idle';
				}
			}, 2000);
		} catch (error) {
			state.saveState = 'error';
			state.saveError = error instanceof Error ? error.message : 'Failed to save notes';
			console.error('Failed to save notes:', error);
		}
	}

	/**
	 * Handle content change from editor (debounced save)
	 */
	function handleNotesChange(content: string, _markdown: string): void {
		// Update local state immediately
		state.localNotes = content;

		// Clear existing timeout
		if (saveTimeout) {
			clearTimeout(saveTimeout);
		}

		// Debounce save (500ms)
		saveTimeout = setTimeout(() => {
			void saveNotes(content);
		}, 500);
	}

	/**
	 * Save immediately (for navigation/destroy)
	 */
	async function saveImmediately(): Promise<void> {
		// Cancel debounced save
		if (saveTimeout) {
			clearTimeout(saveTimeout);
			saveTimeout = null;
		}

		// Save immediately if there are unsaved changes
		if (state.saveState !== 'saved') {
			await saveNotes(state.localNotes);
		}
	}

	// Return interface
	return {
		get localNotes() {
			return state.localNotes;
		},
		set localNotes(value: string) {
			state.localNotes = value;
		},
		get saveState() {
			return state.saveState;
		},
		get saveError() {
			return state.saveError;
		},
		handleNotesChange,
		saveImmediately
	};
}
