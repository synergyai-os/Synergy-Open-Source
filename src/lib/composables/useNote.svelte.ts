/**
 * Note Management Composable
 *
 * Manages note state with auto-save, AI detection, and blog export
 * Following Svelte 5 composables pattern
 */

import { browser } from '$app/environment';
import type { ConvexClient } from 'convex/browser';
import { api } from '$lib/convex';

export type NoteState = {
	noteId: string | null;
	title: string;
	content: string; // ProseMirror JSON
	contentMarkdown: string;
	isAIGenerated: boolean;
	isSaving: boolean;
	lastSaved: number | null;
	error: string | null;
};

export function useNote(convexClient: ConvexClient | null, getSessionId: () => string | undefined) {
	// Internal state using single $state object pattern
	const state = $state<NoteState>({
		noteId: null,
		title: '',
		content: '',
		contentMarkdown: '',
		isAIGenerated: false,
		isSaving: false,
		lastSaved: null,
		error: null
	});

	let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Create a new note
	 */
	async function createNote(
		title?: string,
		content?: string,
		isAIGenerated?: boolean
	): Promise<string | null> {
		if (!convexClient || !browser) return null;

		try {
			const sessionId = getSessionId();
			if (!sessionId) {
				throw new Error('Session ID is required');
			}

			state.isSaving = true;
			state.error = null;

			const noteId = await convexClient.mutation(api.notes.createNote, {
				sessionId,
				title,
				content: content || JSON.stringify({ type: 'doc', content: [] }),
				isAIGenerated
			});

			state.noteId = noteId;
			state.title = title || '';
			state.content = content || '';
			state.isAIGenerated = isAIGenerated || false;
			state.lastSaved = Date.now();

			return noteId;
		} catch (err) {
			state.error = err instanceof Error ? err.message : 'Failed to create note';
			return null;
		} finally {
			state.isSaving = false;
		}
	}

	/**
	 * Update note with debouncing
	 */
	function updateNote(updates: Partial<Omit<NoteState, 'noteId' | 'isSaving' | 'error'>>) {
		// Update local state immediately
		Object.assign(state, updates);

		// Clear existing timeout
		if (autoSaveTimeout) {
			clearTimeout(autoSaveTimeout);
		}

		// Set new timeout for auto-save
		autoSaveTimeout = setTimeout(() => {
			saveNote();
		}, 1000); // 1 second debounce
	}

	/**
	 * Save note to database
	 */
	async function saveNote(): Promise<boolean> {
		if (!convexClient || !browser || !state.noteId) return false;

		try {
			const sessionId = getSessionId();
			if (!sessionId) {
				throw new Error('Session ID is required');
			}

			state.isSaving = true;
			state.error = null;

			await convexClient.mutation(api.notes.updateNote, {
				sessionId,
				noteId: state.noteId,
				title: state.title,
				content: state.content,
				contentMarkdown: state.contentMarkdown,
				isAIGenerated: state.isAIGenerated
			});

			state.lastSaved = Date.now();
			return true;
		} catch (err) {
			state.error = err instanceof Error ? err.message : 'Failed to save note';
			return false;
		} finally {
			state.isSaving = false;
		}
	}

	/**
	 * Mark note as AI-generated
	 */
	async function markAsAIGenerated(): Promise<boolean> {
		if (!convexClient || !browser || !state.noteId) return false;

		try {
			const sessionId = getSessionId();
			if (!sessionId) {
				throw new Error('Session ID is required');
			}

			state.isSaving = true;
			state.error = null;

			await convexClient.mutation(api.notes.markAsAIGenerated, {
				sessionId,
				noteId: state.noteId
			});

			state.isAIGenerated = true;
			state.lastSaved = Date.now();
			return true;
		} catch (err) {
			state.error = err instanceof Error ? err.message : 'Failed to mark as AI-generated';
			return false;
		} finally {
			state.isSaving = false;
		}
	}

	/**
	 * Mark note for blog export
	 */
	async function markForBlogExport(slug: string): Promise<boolean> {
		if (!convexClient || !browser || !state.noteId) return false;

		try {
			const sessionId = getSessionId();
			if (!sessionId) {
				throw new Error('Session ID is required');
			}

			state.isSaving = true;
			state.error = null;

			await convexClient.mutation(api.notes.markForBlogExport, {
				sessionId,
				noteId: state.noteId,
				slug
			});

			state.lastSaved = Date.now();
			return true;
		} catch (err) {
			state.error = err instanceof Error ? err.message : 'Failed to mark for blog export';
			return false;
		} finally {
			state.isSaving = false;
		}
	}

	/**
	 * Load note from database
	 */
	function loadNote(noteId: string, noteData: any) {
		state.noteId = noteId;
		state.title = noteData.title || '';
		state.content = noteData.content || '';
		state.contentMarkdown = noteData.contentMarkdown || '';
		state.isAIGenerated = noteData.isAIGenerated || false;
	}

	/**
	 * Clear note state
	 */
	function clear() {
		if (autoSaveTimeout) {
			clearTimeout(autoSaveTimeout);
		}

		state.noteId = null;
		state.title = '';
		state.content = '';
		state.contentMarkdown = '';
		state.isAIGenerated = false;
		state.isSaving = false;
		state.lastSaved = null;
		state.error = null;
	}

	// Return public API with getters (Svelte 5 pattern)
	return {
		get noteId() {
			return state.noteId;
		},
		get title() {
			return state.title;
		},
		get content() {
			return state.content;
		},
		get contentMarkdown() {
			return state.contentMarkdown;
		},
		get isAIGenerated() {
			return state.isAIGenerated;
		},
		get isSaving() {
			return state.isSaving;
		},
		get lastSaved() {
			return state.lastSaved;
		},
		get error() {
			return state.error;
		},
		createNote,
		updateNote,
		saveNote,
		markAsAIGenerated,
		markForBlogExport,
		loadNote,
		clear
	};
}
