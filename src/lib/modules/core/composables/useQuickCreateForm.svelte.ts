/**
 * useQuickCreateForm Composable - Form state, validation, and mutations for QuickCreateModal
 *
 * Extracts form logic from QuickCreateModal component following separation of concerns.
 * Provides form state management, validation, and creation mutations for notes, flashcards, and highlights.
 *
 * Usage:
 * ```typescript
 * const form = useQuickCreateForm(
 *   () => sessionId,
 *   () => workspaceId,
 *   () => selectedType
 * );
 * form.content = 'New content';
 * await form.handleCreate();
 * ```
 *
 * @see dev-docs/2-areas/design/component-architecture.md#L377 - Separation of concerns pattern
 * @see dev-docs/2-areas/patterns/svelte-reactivity.md#L10 - Composables pattern
 */

import { browser } from '$app/environment';
import { useConvexClient } from 'convex-svelte';
import { api } from '$lib/convex';
import type { Id } from '$lib/convex';
import { toast } from 'svelte-sonner';
import { invariant } from '$lib/utils/invariant';

type ContentType = 'note' | 'flashcard' | 'highlight';

export function useQuickCreateForm(
	getSessionId: () => string | null | undefined,
	getWorkspaceId: () => string | null | undefined,
	getSelectedType: () => ContentType | null
) {
	// Svelte 5 pattern: Single $state object with getters
	const state = $state({
		// Form content fields
		content: '',
		question: '',
		answer: '',
		sourceTitle: '',
		note: '',
		// Note-specific fields
		noteTitle: '',
		noteContent: '', // ProseMirror JSON string
		noteContentMarkdown: '', // Markdown version
		noteIsAIGenerated: false,
		// Tags
		selectedTagIds: [] as Id<'tags'>[],
		// Metadata (UI only - stubbed for now)
		noteStatus: 'backlog' as 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled',
		notePriority: 'none' as 'none' | 'low' | 'medium' | 'high' | 'urgent',
		noteAssignee: undefined as
			| { id: string; name: string; initials: string; color: string }
			| undefined,
		noteProject: undefined as
			| { id: string; name: string; icon?: string; color: string }
			| undefined,
		noteContext: { id: 'pai', name: 'PAI', icon: '🔥', type: 'circle' } as
			| { id: string; name: string; icon: string; type: 'circle' | 'template' | 'workspace' }
			| undefined,
		noteTemplate: undefined as
			| { id: string; name: string; icon: string; type: 'circle' | 'template' | 'workspace' }
			| undefined,
		createMore: false,
		attachmentCount: 0,
		// Loading state
		isCreating: false,
		error: null as string | null
	});

	// Get Convex client (only in browser)
	const convexClient = browser ? useConvexClient() : null;

	/**
	 * Reset form state to initial values
	 */
	function resetForm() {
		state.content = '';
		state.question = '';
		state.answer = '';
		state.sourceTitle = '';
		state.note = '';
		state.noteTitle = '';
		state.noteContent = '';
		state.noteContentMarkdown = '';
		state.noteIsAIGenerated = false;
		state.selectedTagIds = [];
		state.noteStatus = 'backlog';
		state.notePriority = 'none';
		state.noteAssignee = undefined;
		state.noteProject = undefined;
		state.noteContext = { id: 'pai', name: 'PAI', icon: '🔥', type: 'circle' };
		state.noteTemplate = undefined;
		state.createMore = false;
		state.attachmentCount = 0;
		state.error = null;
	}

	/**
	 * Handle create action with validation and mutations
	 * Returns true if successful, false otherwise
	 */
	async function handleCreate(): Promise<boolean> {
		if (!convexClient) {
			state.error = 'Convex client not available';
			return false;
		}

		const selectedType = getSelectedType();
		if (!selectedType) {
			state.error = 'No content type selected';
			return false;
		}

		// Validate content based on type
		if (selectedType === 'note' && !state.noteContent.trim()) {
			const errorMessage = 'Note content is required';
			state.error = errorMessage;
			toast.error(errorMessage);
			return false;
		}
		if (selectedType === 'flashcard' && (!state.question.trim() || !state.answer.trim())) {
			const errorMessage = 'Question and answer are required';
			state.error = errorMessage;
			toast.error(errorMessage);
			return false;
		}
		if (selectedType === 'highlight' && !state.content.trim()) {
			const errorMessage = 'Highlight content is required';
			state.error = errorMessage;
			toast.error(errorMessage);
			return false;
		}

		state.isCreating = true;
		state.error = null;

		try {
			const sessionId = getSessionId();
			invariant(sessionId, 'Session ID is required');

			const workspaceId = getWorkspaceId();

			if (selectedType === 'note') {
				// Use the new notes API for rich text notes
				await convexClient.mutation(api.features.notes.index.createNote, {
					sessionId, // Session validation in Convex
					title: state.noteTitle || undefined,
					content:
						typeof state.noteContent === 'string'
							? state.noteContent
							: JSON.stringify(state.noteContent),
					contentMarkdown: state.noteContentMarkdown || undefined,
					isAIGenerated: state.noteIsAIGenerated || undefined,
					workspaceId: (workspaceId as Id<'workspaces'>) || undefined // Pass active workspace context
				});

				// If there are tags, we need to link them after creation
				// TODO: Update notes.createNote to accept tagIds parameter
			} else if (selectedType === 'flashcard') {
				await convexClient.mutation(api.features.inbox.index.createFlashcardInInbox, {
					sessionId,
					question: state.question,
					answer: state.answer,
					tagIds: state.selectedTagIds.length > 0 ? state.selectedTagIds : undefined
				});
			} else if (selectedType === 'highlight') {
				await convexClient.mutation(api.features.inbox.index.createHighlightInInbox, {
					sessionId,
					text: state.content,
					sourceTitle: state.sourceTitle || undefined,
					note: state.note || undefined,
					tagIds: state.selectedTagIds.length > 0 ? state.selectedTagIds : undefined
				});
			}

			// Reset form after successful creation
			resetForm();

			// Show success message based on type
			const typeName =
				selectedType === 'note' ? 'Note' : selectedType === 'flashcard' ? 'Flashcard' : 'Highlight';
			toast.success(`${typeName} created successfully`);

			return true;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create item';
			state.error = errorMessage;
			toast.error(errorMessage);
			return false;
		} finally {
			state.isCreating = false;
		}
	}

	// Return getters/setters (Svelte 5 pattern) and action functions
	return {
		// Form content fields
		get content() {
			return state.content;
		},
		set content(value: string) {
			state.content = value;
		},
		get question() {
			return state.question;
		},
		set question(value: string) {
			state.question = value;
		},
		get answer() {
			return state.answer;
		},
		set answer(value: string) {
			state.answer = value;
		},
		get sourceTitle() {
			return state.sourceTitle;
		},
		set sourceTitle(value: string) {
			state.sourceTitle = value;
		},
		get note() {
			return state.note;
		},
		set note(value: string) {
			state.note = value;
		},
		// Note-specific fields
		get noteTitle() {
			return state.noteTitle;
		},
		set noteTitle(value: string) {
			state.noteTitle = value;
		},
		get noteContent() {
			return state.noteContent;
		},
		set noteContent(value: string) {
			state.noteContent = value;
		},
		get noteContentMarkdown() {
			return state.noteContentMarkdown;
		},
		set noteContentMarkdown(value: string) {
			state.noteContentMarkdown = value;
		},
		get noteIsAIGenerated() {
			return state.noteIsAIGenerated;
		},
		set noteIsAIGenerated(value: boolean) {
			state.noteIsAIGenerated = value;
		},
		// Tags
		get selectedTagIds() {
			return state.selectedTagIds;
		},
		set selectedTagIds(value: Id<'tags'>[]) {
			state.selectedTagIds = value;
		},
		// Metadata
		get noteStatus() {
			return state.noteStatus;
		},
		set noteStatus(value: 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled') {
			state.noteStatus = value;
		},
		get notePriority() {
			return state.notePriority;
		},
		set notePriority(value: 'none' | 'low' | 'medium' | 'high' | 'urgent') {
			state.notePriority = value;
		},
		get noteAssignee() {
			return state.noteAssignee;
		},
		set noteAssignee(
			value: { id: string; name: string; initials: string; color: string } | undefined
		) {
			state.noteAssignee = value;
		},
		get noteProject() {
			return state.noteProject;
		},
		set noteProject(value: { id: string; name: string; icon?: string; color: string } | undefined) {
			state.noteProject = value;
		},
		get noteContext() {
			return state.noteContext;
		},
		set noteContext(
			value:
				| { id: string; name: string; icon: string; type: 'circle' | 'template' | 'workspace' }
				| undefined
		) {
			state.noteContext = value;
		},
		get noteTemplate() {
			return state.noteTemplate;
		},
		set noteTemplate(
			value:
				| { id: string; name: string; icon: string; type: 'circle' | 'template' | 'workspace' }
				| undefined
		) {
			state.noteTemplate = value;
		},
		get createMore() {
			return state.createMore;
		},
		set createMore(value: boolean) {
			state.createMore = value;
		},
		get attachmentCount() {
			return state.attachmentCount;
		},
		set attachmentCount(value: number) {
			state.attachmentCount = value;
		},
		// Loading and error state
		get isCreating() {
			return state.isCreating;
		},
		get error() {
			return state.error;
		},
		// Action functions
		resetForm,
		handleCreate
	};
}

// Export type for component props
export type UseQuickCreateForm = ReturnType<typeof useQuickCreateForm>;
