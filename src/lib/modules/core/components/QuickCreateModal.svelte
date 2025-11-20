<script lang="ts">
	import { browser } from '$app/environment';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import type { Id } from '$lib/convex';
	import { Dialog, Command } from 'bits-ui';
	import { getContext } from 'svelte';
	import type { CoreModuleAPI } from '$lib/modules/core/api';
	import NoteEditorWithDetection from '$lib/components/notes/NoteEditorWithDetection.svelte';
	import {
		KeyboardShortcut,
		FormInput,
		FormTextarea,
		StatusPill,
		PrioritySelector,
		AssigneeSelector,
		ProjectSelector,
		AttachmentButton,
		ToggleSwitch,
		ContextSelector
	} from '$lib/components/ui';
	// TODO: Uncomment when implementing PostHog tracking
	// import { AnalyticsEventName } from '$lib/infrastructure/analytics/events';

	type ContentType = 'note' | 'flashcard' | 'highlight';

	type Props = {
		open?: boolean;
		triggerMethod?: 'keyboard_n' | 'header_button' | 'footer_button';
		currentView?: 'inbox' | 'flashcards' | 'tags' | 'my_mind' | 'study';
		initialType?: ContentType | null;
		sessionId?: string; // Required for session validation
		organizationId?: string | null; // Active organization ID (for workspace context)
		teamId?: string | null; // Active team ID (for workspace context)
		initialTags?: unknown[]; // Server-side preloaded tags for instant rendering
	};

	let {
		open = $bindable(false),
		triggerMethod: _triggerMethod = 'keyboard_n',
		currentView: _currentView = 'inbox',
		initialType = null,
		sessionId,
		organizationId = null,
		teamId = null,
		initialTags = []
	}: Props = $props();

	const convexClient = browser ? useConvexClient() : null;

	// Get core module API from context for TagSelector (enables loose coupling - see SYOS-308)
	const coreAPI = getContext<CoreModuleAPI | undefined>('core-api');
	const TagSelector = coreAPI?.TagSelector;

	// Query all available tags - use server-side initial data immediately, then use query data when available
	const allTagsQuery =
		browser && sessionId
			? useQuery(api.tags.listAllTags, () => {
					if (!sessionId) throw new Error('sessionId required'); // Should not happen due to outer check
					return {
						sessionId,
						...(organizationId ? { organizationId: organizationId as Id<'organizations'> } : {})
					};
				})
			: null;

	// Type matches TagWithHierarchy from convex/tags.ts and Tag type from TagSelector
	type Tag = {
		_id: Id<'tags'>;
		displayName: string;
		color: string;
		parentId?: Id<'tags'>;
		level?: number;
		children?: Tag[];
	};

	const availableTags = $derived(
		allTagsQuery?.data !== undefined ? (allTagsQuery.data as Tag[]) : ((initialTags ?? []) as Tag[])
	);

	// Component state
	let selectedType = $state<ContentType | null>(null);
	let content = $state('');
	let question = $state('');
	let answer = $state('');
	let sourceTitle = $state('');
	let note = $state('');
	let selectedTagIds = $state<Id<'tags'>[]>([]);
	let isCreating = $state(false);
	let tagComboboxOpen = $state(false);

	// Modal container ref for refocusing after blur
	let modalContainerRef = $state<HTMLDivElement | null>(null);

	// Note-specific state (for ProseMirror)
	let noteTitle = $state('');
	let noteContent = $state(''); // ProseMirror JSON string
	let noteContentMarkdown = $state(''); // Markdown version
	let noteIsAIGenerated = $state(false);

	// Metadata state (UI only - stubbed for now)
	let noteStatus = $state<'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled'>('backlog');
	let notePriority = $state<'none' | 'low' | 'medium' | 'high' | 'urgent'>('none');
	let noteAssignee = $state<
		{ id: string; name: string; initials: string; color: string } | undefined
	>(undefined);
	let noteProject = $state<{ id: string; name: string; icon?: string; color: string } | undefined>(
		undefined
	);
	let noteContext = $state<
		{ id: string; name: string; icon: string; type: 'team' | 'template' | 'workspace' } | undefined
	>({ id: 'pai', name: 'PAI', icon: '🔥', type: 'team' });
	let noteTemplate = $state<
		{ id: string; name: string; icon: string; type: 'team' | 'template' | 'workspace' } | undefined
	>(undefined);
	let createMore = $state(false);
	let attachmentCount = $state(0);
	let isFullscreen = $state(false);

	// Timing tracking for analytics
	// TODO: Re-enable when analytics tracking is needed
	let _openedAt = $state(0);
	let _typeSelectedAt = $state(0);
	let tagModificationStartedAt = $state(0);

	// Set initial type when modal opens (for quick create shortcuts like 'N')
	$effect(() => {
		console.log('🟣 Modal $effect triggered:', { open, initialType, selectedType });
		if (open) {
			if (initialType) {
				selectedType = initialType;
				_typeSelectedAt = Date.now();
				console.log('✅ selectedType SET TO:', selectedType);
			} else {
				console.log('⚠️ No initialType - showing command palette');
			}
			// If no initialType, selectedType stays null (shows command palette)
		} else {
			// Reset when modal closes
			console.log('🔴 Modal closed - resetting form');
			resetForm();
		}
	});

	// Track when modal opens
	$effect(() => {
		if (open && browser) {
			_openedAt = Date.now();
			// TODO: Implement PostHog tracking
			// trackEvent({
			// 	name: AnalyticsEventName.QUICK_CREATE_OPENED,
			// 	distinctId: 'user-id',
			// 	properties: {
			// 		scope: 'user',
			// 		trigger_method: triggerMethod,
			// 		has_active_item: false,
			// 		current_view: currentView,
			// 		items_in_view: 0,
			// 	},
			// });
		}
	});

	// Track type selection
	function handleTypeSelect(type: ContentType, _method: 'click' | 'keyboard_c' | 'keyboard_nav') {
		selectedType = type;
		_typeSelectedAt = Date.now();

		// TODO: Implement PostHog tracking
		// if (browser) {
		// 	trackEvent({
		// 		name: AnalyticsEventName.QUICK_CREATE_TYPE_SELECTED,
		// 		distinctId: 'user-id',
		// 		properties: {
		// 			scope: 'user',
		// 			content_type: type,
		// 			selection_method: method,
		// 			time_to_select_ms: typeSelectedAt - openedAt,
		// 		},
		// 	});
		// }
	}

	// Handle tag changes
	async function handleTagsChange(newTagIds: Id<'tags'>[]) {
		const now = Date.now();
		if (tagModificationStartedAt === 0) {
			tagModificationStartedAt = now;
		}

		// TODO: Re-enable when analytics tracking is needed
		// const addedCount = newTagIds.filter((id) => !selectedTagIds.includes(id)).length;
		// const removedCount = selectedTagIds.filter((id) => !newTagIds.includes(id)).length;

		selectedTagIds = newTagIds;

		// TODO: Implement PostHog tracking
		// if (browser && selectedType) {
		// 	trackEvent({
		// 		name: AnalyticsEventName.QUICK_CREATE_TAGS_MODIFIED,
		// 		distinctId: 'user-id',
		// 		properties: {
		// 			scope: 'user',
		// 			content_type: selectedType,
		// 			tags_added_count: addedCount,
		// 			tags_removed_count: removedCount,
		// 			total_tags: newTagIds.length,
		// 			used_tag_search: false,
		// 			created_new_tag: false,
		// 			tag_assignment_time_ms: now - tagModificationStartedAt,
		// 		},
		// 	});
		// }
	}

	// Handle new tag creation
	async function handleCreateTag(
		displayName: string,
		color: string,
		parentId?: Id<'tags'>
	): Promise<Id<'tags'>> {
		if (!convexClient) {
			throw new Error('Convex client not available');
		}

		try {
			if (!sessionId) {
				throw new Error('Session ID is required');
			}

			// If organizationId is available, create as organization tag
			// Otherwise, create as user tag (visible across all orgs)
			const tagId = await convexClient.mutation(api.tags.createTag, {
				sessionId,
				displayName,
				color,
				parentId,
				...(organizationId
					? {
							ownership: 'organization' as const,
							organizationId: organizationId as Id<'organizations'>
						}
					: {})
			});

			// TODO: Implement PostHog tracking
			// if (browser && selectedType) {
			// 	const now = Date.now();
			// 	trackEvent({
			// 		name: AnalyticsEventName.QUICK_CREATE_TAGS_MODIFIED,
			// 		distinctId: 'user-id',
			// 		properties: {
			// 			scope: 'user',
			// 			content_type: selectedType,
			// 			tags_added_count: 1,
			// 			tags_removed_count: 0,
			// 			total_tags: selectedTagIds.length + 1,
			// 			used_tag_search: false,
			// 			created_new_tag: true,
			// 			tag_assignment_time_ms: now - tagModificationStartedAt,
			// 		},
			// 	});
			// }

			return tagId;
		} catch (error) {
			console.error('Failed to create tag:', error);
			throw error;
		}
	}

	// Handle create action
	async function handleCreate() {
		if (!convexClient || !selectedType) return;

		// Validate content based on type
		if (selectedType === 'note' && !noteContent.trim()) return;
		if (selectedType === 'flashcard' && (!question.trim() || !answer.trim())) return;
		if (selectedType === 'highlight' && !content.trim()) return;

		isCreating = true;

		try {
			// TODO: Re-enable when analytics tracking is needed
			// const now = Date.now();
			// let contentLength = 0;

			if (selectedType === 'note') {
				if (!sessionId) {
					throw new Error('Session ID is required');
				}

				// Use the new notes API for rich text notes
				await convexClient.mutation(api.notes.createNote, {
					sessionId, // Session validation in Convex
					title: noteTitle || undefined,
					content: typeof noteContent === 'string' ? noteContent : JSON.stringify(noteContent),
					contentMarkdown: noteContentMarkdown || undefined,
					isAIGenerated: noteIsAIGenerated || undefined,
					organizationId: (organizationId as Id<'organizations'>) || undefined, // Pass active organization context
					teamId: (teamId as Id<'teams'>) || undefined // Pass active team context
				});

				// If there are tags, we need to link them after creation
				// TODO: Update notes.createNote to accept tagIds parameter

				// TODO: Re-enable when analytics tracking is needed
				// contentLength = noteContent.length;
			} else if (selectedType === 'flashcard') {
				if (!sessionId) {
					throw new Error('Session ID is required');
				}

				await convexClient.mutation(api.inbox.createFlashcardInInbox, {
					sessionId,
					question: question,
					answer: answer,
					tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined
				});
				// TODO: Re-enable when analytics tracking is needed
				// contentLength = question.length + answer.length;
			} else if (selectedType === 'highlight') {
				if (!sessionId) {
					throw new Error('Session ID is required');
				}

				await convexClient.mutation(api.inbox.createHighlightInInbox, {
					sessionId,
					text: content,
					sourceTitle: sourceTitle || undefined,
					note: note || undefined,
					tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined
				});
				// TODO: Re-enable when analytics tracking is needed
				// contentLength = content.length;
			}

			// TODO: Implement PostHog tracking
			// if (browser) {
			// 	trackEvent({
			// 		name: AnalyticsEventName.QUICK_CREATE_COMPLETED,
			// 		distinctId: 'user-id',
			// 		properties: {
			// 			scope: 'user',
			// 			content_type: selectedType,
			// 			trigger_method: triggerMethod,
			// 			total_time_ms: now - openedAt,
			// 			type_selection_time_ms: typeSelectedAt - openedAt,
			// 			tag_assignment_time_ms:
			// 				tagModificationStartedAt > 0 ? now - tagModificationStartedAt : 0,
			// 			content_length_chars: contentLength,
			// 			has_tags: selectedTagIds.length > 0,
			// 			tag_count: selectedTagIds.length,
			// 		},
			// 	});
			// }

			// Reset and close
			resetForm();
			open = false;
		} catch (error) {
			console.error('Failed to create item:', error);
		} finally {
			isCreating = false;
		}
	}

	// Reset form state
	function resetForm() {
		selectedType = null;
		content = '';
		question = '';
		answer = '';
		sourceTitle = '';
		note = '';
		noteTitle = '';
		noteContent = '';
		noteContentMarkdown = '';
		noteIsAIGenerated = false;
		selectedTagIds = [];
		tagModificationStartedAt = 0;
		_typeSelectedAt = 0;
		isFullscreen = false;
	}

	// Handle modal close (abandonment tracking)
	function handleOpenChange(newOpen: boolean) {
		if (!newOpen && open && browser) {
			// Track abandonment
			// TODO: Re-enable when analytics tracking is needed
			// const now = Date.now();
			// let abandonStage: 'type_selection' | 'tag_assignment' | 'content_entry' = 'type_selection';
			// if (selectedType && (content || question || answer)) {
			// 	abandonStage = 'content_entry';
			// } else if (selectedType) {
			// 	abandonStage = 'tag_assignment';
			// }

			// TODO: Implement PostHog tracking
			// trackEvent({
			// 	name: AnalyticsEventName.QUICK_CREATE_ABANDONED,
			// 	distinctId: 'user-id',
			// 	properties: {
			// 		scope: 'user',
			// 		content_type: selectedType || undefined,
			// 		abandon_stage: abandonStage,
			// 		time_to_abandon_ms: now - openedAt,
			// 		abandon_method: 'click_outside',
			// 		had_content: !!(content || question || answer),
			// 		had_tags: selectedTagIds.length > 0,
			// 	},
			// });

			resetForm();
		}
		open = newOpen;
	}

	// Keyboard shortcuts
	function handleKeyDown(e: KeyboardEvent) {
		// Escape key - hierarchical behavior
		if (e.key === 'Escape') {
			// Check if any input/component is currently focused
			const activeElement = document.activeElement as HTMLElement;
			const modalElement = e.currentTarget as HTMLElement;

			// If tag combobox is open, let it handle ESC first
			if (tagComboboxOpen) {
				// TagSelector will close and blur, don't close modal
				return;
			}

			// If an input, textarea, or contenteditable is focused, blur it first
			if (
				activeElement &&
				modalElement.contains(activeElement) &&
				(activeElement.tagName === 'INPUT' ||
					activeElement.tagName === 'TEXTAREA' ||
					activeElement.isContentEditable ||
					activeElement.getAttribute('role') === 'textbox')
			) {
				e.preventDefault();
				e.stopPropagation();
				activeElement.blur();

				// Refocus modal container so modal shortcuts (like T) continue working
				setTimeout(() => {
					modalContainerRef?.focus();
				}, 0);
				return;
			}

			// If nothing is focused inside modal, close it
			handleOpenChange(false);
			return;
		}

		// Cmd+Enter to create (when type is selected and content is filled)
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && selectedType) {
			e.preventDefault();
			handleCreate();
			return;
		}

		// Don't intercept if user is typing in any input field
		const target = e.target as HTMLElement;
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
			return;
		}

		// Don't intercept if Command palette is open (stage 1)
		// Command handles its own keyboard navigation (↑↓ to navigate, Enter to select)
		if (!selectedType) {
			return;
		}

		// T key: Open tag selector (only for note type, when tag combobox is not already open)
		if ((e.key === 't' || e.key === 'T') && selectedType === 'note' && !tagComboboxOpen) {
			e.preventDefault();
			tagComboboxOpen = true;
			return;
		}
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Portal>
		<!-- Dramatic Spotlight Overlay: 65% black + backdrop blur -->
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
		/>
		<!-- Command Center Modal: Scale-up animation + dramatic shadow -->
		<Dialog.Content
			class="{isFullscreen
				? 'fixed inset-0 z-50 h-full w-full overflow-y-auto border-0 bg-elevated p-0 shadow-2xl'
				: 'fixed top-1/2 left-1/2 z-50 max-h-[80vh] w-full max-w-[900px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border border-base bg-elevated p-0 shadow-2xl'} data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
		>
			<div bind:this={modalContainerRef} onkeydown={handleKeyDown} role="dialog" tabindex="-1">
				{#if !selectedType}
					<!-- Command Center -->
					<Command.Root
						class="border-base/30 flex h-full w-full flex-col overflow-hidden rounded-lg border bg-elevated shadow-lg"
					>
						<!-- Search Input with Icon -->
						<div class="border-base/50 flex items-center border-b px-4 py-3">
							<!-- Search Icon -->
							<svg
								class="mr-3 h-5 w-5 flex-shrink-0 text-tertiary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
							<Command.Input
								class="flex-1 border-0 bg-transparent p-0 text-base transition-colors placeholder:text-tertiary focus:ring-0 focus:outline-hidden"
								placeholder="Type a command or search..."
							/>
						</div>
						<Command.List class="max-h-[280px] overflow-x-hidden overflow-y-auto px-2 pb-2">
							<Command.Viewport>
								<Command.Empty
									class="flex w-full items-center justify-center pt-8 pb-6 text-sm text-secondary"
								>
									No results found.
								</Command.Empty>
								<Command.Group>
									<Command.GroupHeading
										class="px-3 pt-4 pb-2 text-xs tracking-wider text-tertiary uppercase"
									>
										Create New
									</Command.GroupHeading>
									<Command.GroupItems>
										<Command.Item
											class="flex h-auto cursor-pointer items-center justify-between rounded-button px-3 py-2.5 text-sm outline-hidden transition-colors select-none data-selected:bg-hover-solid"
											onSelect={() => handleTypeSelect('note', 'click')}
											keywords={['note', 'text', 'thought', 'idea', 'write', 'capture']}
										>
											<div class="flex items-center gap-icon">
												<span class="text-xl">📝</span>
												<div class="flex flex-col items-start">
													<span class="font-medium text-primary">Note</span>
													<span class="text-xs text-secondary">Capture a quick thought or idea</span
													>
												</div>
											</div>
											<KeyboardShortcut keys="C" />
										</Command.Item>
										<Command.Item
											class="flex h-auto cursor-pointer items-center justify-between rounded-button px-3 py-2.5 text-sm outline-hidden transition-colors select-none data-selected:bg-hover-solid"
											onSelect={() => handleTypeSelect('flashcard', 'click')}
											keywords={[
												'flashcard',
												'card',
												'question',
												'answer',
												'study',
												'memorize',
												'learn'
											]}
										>
											<div class="flex items-center gap-icon">
												<span class="text-xl">🗂️</span>
												<div class="flex flex-col items-start">
													<span class="font-medium text-primary">Flashcard</span>
													<span class="text-xs text-secondary"
														>Create a question and answer pair</span
													>
												</div>
											</div>
											<KeyboardShortcut keys="F" />
										</Command.Item>
										<Command.Item
											class="flex h-auto cursor-pointer items-center justify-between rounded-button px-3 py-2.5 text-sm outline-hidden transition-colors select-none data-selected:bg-hover-solid"
											onSelect={() => handleTypeSelect('highlight', 'click')}
											keywords={[
												'highlight',
												'excerpt',
												'quote',
												'passage',
												'book',
												'article',
												'read'
											]}
										>
											<div class="flex items-center gap-icon">
												<span class="text-xl">✨</span>
												<div class="flex flex-col items-start">
													<span class="font-medium text-primary">Highlight</span>
													<span class="text-xs text-secondary"
														>Save an excerpt from something you read</span
													>
												</div>
											</div>
											<KeyboardShortcut keys="H" />
										</Command.Item>
									</Command.GroupItems>
								</Command.Group>
							</Command.Viewport>
						</Command.List>
					</Command.Root>
				{:else}
					<!-- Content Entry View -->
					<div class="flex w-full flex-col" data-debug="content-entry">
						{#if selectedType === 'note'}
							<!-- Context/Template Selectors + Draft Button (Linear-style top bar) -->
							<div class="flex items-center justify-between px-inbox-container py-2">
								<div class="flex items-center gap-form-field">
									<ContextSelector
										context={noteContext}
										onChange={(ctx) => (noteContext = ctx)}
										tabIndex={-1}
									/>
									<svg
										class="h-3 w-3 text-gray-300"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 5l7 7-7 7"
										/>
									</svg>
									<ContextSelector
										context={noteTemplate}
										onChange={(tpl) => (noteTemplate = tpl)}
										tabIndex={-1}
									/>
								</div>

								<!-- Top Right Actions -->
								<div class="flex items-center gap-form-field">
									<button
										type="button"
										class="px-inbox-card py-input-y text-sm text-secondary transition-colors hover:text-primary"
										onclick={() => {
											// TODO: Implement draft save logic
											console.log('Save as draft clicked');
										}}
									>
										Save as draft
									</button>
									<button
										type="button"
										class="p-1.5 text-tertiary transition-colors hover:text-secondary"
										onclick={() => (isFullscreen = !isFullscreen)}
										aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
									>
										{#if isFullscreen}
											<!-- Exit Fullscreen Icon -->
											<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
												/>
											</svg>
										{:else}
											<!-- Fullscreen Icon -->
											<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
												/>
											</svg>
										{/if}
									</button>
									<button
										type="button"
										class="p-1.5 text-tertiary transition-colors hover:text-secondary"
										onclick={() => handleOpenChange(false)}
										aria-label="Close"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
							</div>
						{:else}
							<div class="px-content-padding pt-content-padding">
								<Dialog.Title class="text-heading-primary mb-heading text-xl font-medium">
									Create {selectedType === 'flashcard' ? 'Flashcard' : 'Highlight'}
								</Dialog.Title>
							</div>
						{/if}

						<div
							class="flex flex-col gap-content-section {selectedType === 'note'
								? ''
								: 'mt-content-section px-content-padding'}"
						>
							<!-- Content fields based on type -->
							{#if selectedType === 'note'}
								<!-- Minimal Note Editor - Linear Style -->
								<NoteEditorWithDetection
									content={noteContent}
									title={noteTitle}
									onContentChange={(content: string, markdown: string) => {
										noteContent = content;
										noteContentMarkdown = markdown;
									}}
									onTitleChange={(title: string) => {
										noteTitle = title;
									}}
									onAIFlagged={() => {
										noteIsAIGenerated = true;
									}}
									onEscape={() => {
										// Refocus modal container so keyboard shortcuts (T) work after ESC
										setTimeout(() => modalContainerRef?.focus(), 0);
									}}
									placeholder="Add description..."
									showToolbar={false}
									enableAIDetection={false}
									compact={true}
									autoFocus={true}
								/>
							{:else if selectedType === 'flashcard'}
								<FormTextarea
									label="Question"
									placeholder="What do you want to remember?"
									rows={3}
									bind:value={question}
								/>

								<FormTextarea
									label="Answer"
									placeholder="The answer or explanation..."
									rows={3}
									bind:value={answer}
								/>
							{:else if selectedType === 'highlight'}
								<FormInput
									label="Source (optional)"
									placeholder="Book, article, or source name..."
									bind:value={sourceTitle}
								/>

								<FormTextarea
									label="Highlight"
									placeholder="Paste or type the highlighted text..."
									rows={4}
									bind:value={content}
								/>

								<FormTextarea
									label="Note (optional)"
									placeholder="Add your thoughts..."
									rows={2}
									bind:value={note}
								/>
							{/if}

							{#if selectedType === 'note'}
								<!-- Row 1: Metadata Pills + Tags (Linear-style) -->
								{#if TagSelector}
									<div
										class="flex items-center gap-2 overflow-x-auto border-b border-base px-inbox-container py-1.5"
									>
										<AttachmentButton
											count={attachmentCount}
											onClick={() => {
												// TODO: Implement attachment logic
												console.log('Attach file clicked');
											}}
										/>
										<StatusPill status={noteStatus} onChange={(s) => (noteStatus = s)} />
										<PrioritySelector
											priority={notePriority}
											onChange={(p) => (notePriority = p)}
										/>
										<AssigneeSelector
											assignee={noteAssignee}
											onChange={(a) => (noteAssignee = a)}
										/>
										<ProjectSelector
											project={noteProject}
											onChange={(proj) => (noteProject = proj)}
										/>
										<TagSelector
											bind:comboboxOpen={tagComboboxOpen}
											bind:selectedTagIds
											{availableTags}
											onTagsChange={handleTagsChange}
											onCreateTagWithColor={handleCreateTag}
											showLabel={false}
										/>
									</div>
								{/if}
							{/if}

							<!-- Row 2: Actions Only (Linear-style footer) -->
							<div
								class="flex items-center justify-end gap-button-group py-2 {selectedType === 'note'
									? 'px-inbox-container'
									: ''}"
							>
								{#if selectedType === 'note'}
									<ToggleSwitch
										checked={createMore}
										onChange={(checked) => (createMore = checked)}
										label="Create more"
									/>
								{/if}
								<button
									onclick={() => handleOpenChange(false)}
									class="px-inbox-card py-input-y text-sm text-secondary transition-colors hover:text-primary"
								>
									Cancel
								</button>
								<button
									onclick={handleCreate}
									disabled={isCreating}
									class="flex items-center gap-form-field rounded-md bg-accent-primary px-inbox-card py-input-y text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
								>
									{isCreating ? 'Creating...' : selectedType === 'note' ? 'Create issue' : 'Create'}
									<KeyboardShortcut keys={['Cmd', 'Enter']} />
								</button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
