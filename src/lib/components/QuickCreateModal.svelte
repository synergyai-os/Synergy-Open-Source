<script lang="ts">
	import { browser } from '$app/environment';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { Dialog, Command } from 'bits-ui';
	import TagSelector from '$lib/components/inbox/TagSelector.svelte';
	import NoteEditorWithDetection from '$lib/components/notes/NoteEditorWithDetection.svelte';
	import KeyboardShortcut from '$lib/components/ui/KeyboardShortcut.svelte';
	import FormInput from '$lib/components/ui/FormInput.svelte';
	import FormTextarea from '$lib/components/ui/FormTextarea.svelte';
	import StatusPill from '$lib/components/ui/StatusPill.svelte';
	import PrioritySelector from '$lib/components/ui/PrioritySelector.svelte';
	import AssigneeSelector from '$lib/components/ui/AssigneeSelector.svelte';
	import ProjectSelector from '$lib/components/ui/ProjectSelector.svelte';
	import MetadataBar from '$lib/components/ui/MetadataBar.svelte';
	import AttachmentButton from '$lib/components/ui/AttachmentButton.svelte';
	import ToggleSwitch from '$lib/components/ui/ToggleSwitch.svelte';
	import ContextSelector from '$lib/components/ui/ContextSelector.svelte';
	// TODO: Uncomment when implementing PostHog tracking
	// import { AnalyticsEventName } from '$lib/analytics/events';

	type ContentType = 'note' | 'flashcard' | 'highlight';

	type Props = {
		open?: boolean;
		triggerMethod?: 'keyboard_n' | 'header_button' | 'footer_button';
		currentView?: 'inbox' | 'flashcards' | 'tags' | 'my_mind' | 'study';
		initialType?: ContentType | null;
	};

	let {
		open = $bindable(false),
		triggerMethod = 'keyboard_n',
		currentView = 'inbox',
		initialType = null,
	}: Props = $props();

	const convexClient = browser ? useConvexClient() : null;

	// Query all available tags
	const allTagsQuery = browser ? useQuery(api.tags.listAllTags, {}) : null;
	const availableTags = $derived(allTagsQuery?.data ?? []);

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
	
	// Note-specific state (for ProseMirror)
	let noteTitle = $state('');
	let noteContent = $state(''); // ProseMirror JSON string
	let noteContentMarkdown = $state(''); // Markdown version
	let noteIsAIGenerated = $state(false);
	
	// Metadata state (UI only - stubbed for now)
	let noteStatus = $state<'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled'>('backlog');
	let notePriority = $state<'none' | 'low' | 'medium' | 'high' | 'urgent'>('none');
	let noteAssignee = $state<{id: string; name: string; initials: string; color: string} | undefined>(undefined);
	let noteProject = $state<{id: string; name: string; icon?: string; color: string} | undefined>(undefined);
	let noteContext = $state<{id: string; name: string; icon: string; type: 'team' | 'template' | 'workspace'} | undefined>({ id: 'pai', name: 'PAI', icon: '🔥', type: 'team' });
	let noteTemplate = $state<{id: string; name: string; icon: string; type: 'team' | 'template' | 'workspace'} | undefined>(undefined);
	let createMore = $state(false);
	let attachmentCount = $state(0);

	// Timing tracking for analytics
	let openedAt = $state(0);
	let typeSelectedAt = $state(0);
	let tagModificationStartedAt = $state(0);

	// Set initial type when modal opens (for quick create shortcuts like 'N')
	$effect(() => {
		console.log('🟣 Modal $effect triggered:', { open, initialType, selectedType });
		if (open) {
			if (initialType) {
				selectedType = initialType;
				typeSelectedAt = Date.now();
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
			openedAt = Date.now();
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
	function handleTypeSelect(type: ContentType, method: 'click' | 'keyboard_c' | 'keyboard_nav') {
		selectedType = type;
		typeSelectedAt = Date.now();

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

		const addedCount = newTagIds.filter((id) => !selectedTagIds.includes(id)).length;
		const removedCount = selectedTagIds.filter((id) => !newTagIds.includes(id)).length;

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
			const tagId = await convexClient.mutation(api.tags.createTag, {
				displayName,
				color,
				parentId,
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
			const now = Date.now();
			let contentLength = 0;

		if (selectedType === 'note') {
			// Use the new notes API for rich text notes
			await convexClient.mutation(api.notes.createNote, {
				title: noteTitle || undefined,
				content: typeof noteContent === 'string' ? noteContent : JSON.stringify(noteContent),
				contentMarkdown: noteContentMarkdown || undefined,
				isAIGenerated: noteIsAIGenerated || undefined,
			});
				
				// If there are tags, we need to link them after creation
				// TODO: Update notes.createNote to accept tagIds parameter
				
				contentLength = noteContent.length;
			} else if (selectedType === 'flashcard') {
				await convexClient.mutation(api.inbox.createFlashcardInInbox, {
					question: question,
					answer: answer,
					tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
				});
				contentLength = question.length + answer.length;
			} else if (selectedType === 'highlight') {
				await convexClient.mutation(api.inbox.createHighlightInInbox, {
					text: content,
					sourceTitle: sourceTitle || undefined,
					note: note || undefined,
					tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
				});
				contentLength = content.length;
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
		typeSelectedAt = 0;
	}

	// Handle modal close (abandonment tracking)
	function handleOpenChange(newOpen: boolean) {
		if (!newOpen && open && browser) {
			// Track abandonment
			const now = Date.now();
			let abandonStage: 'type_selection' | 'tag_assignment' | 'content_entry' = 'type_selection';
			if (selectedType && (content || question || answer)) {
				abandonStage = 'content_entry';
			} else if (selectedType) {
				abandonStage = 'tag_assignment';
			}

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
		// Escape key closes modal
		if (e.key === 'Escape') {
			if (tagComboboxOpen) {
				// Let tag selector handle it
				return;
			}
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
		if (
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.isContentEditable
		) {
			return;
		}

		// Don't intercept if Command palette is open (stage 1)
		// Command handles its own keyboard navigation (↑↓ to navigate, Enter to select)
		if (!selectedType) {
			return;
		}
	}
</script>

<Dialog.Root open={open} onOpenChange={handleOpenChange}>
	<Dialog.Portal>
		<!-- Dramatic Spotlight Overlay: 65% black + backdrop blur -->
		<Dialog.Overlay
			class="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
		/>
		<!-- Command Center Modal: Scale-up animation + dramatic shadow -->
		<Dialog.Content
			class="fixed left-1/2 top-1/2 z-50 max-h-[65vh] w-full max-w-[900px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md bg-elevated border border-base p-0 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
		>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div onkeydown={handleKeyDown} role="dialog" tabindex="-1">
				{#if !selectedType}
					<!-- Command Center -->
					<Command.Root
						class="flex h-full w-full flex-col overflow-hidden rounded-lg bg-elevated border border-base/30 shadow-lg"
					>
						<!-- Search Input with Icon -->
						<div class="flex items-center border-b border-base/50 px-4 py-3">
							<!-- Search Icon -->
							<svg
								class="w-5 h-5 text-tertiary mr-3 flex-shrink-0"
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
								class="placeholder:text-tertiary bg-transparent focus:outline-hidden flex-1 text-base transition-colors focus:ring-0 border-0 p-0"
								placeholder="Type a command or search..."
							/>
						</div>
						<Command.List class="max-h-[280px] overflow-y-auto overflow-x-hidden px-2 pb-2">
							<Command.Viewport>
								<Command.Empty
									class="text-secondary flex w-full items-center justify-center pb-6 pt-8 text-sm"
								>
									No results found.
								</Command.Empty>
								<Command.Group>
									<Command.GroupHeading class="text-tertiary px-3 pb-2 pt-4 text-xs uppercase tracking-wider">
										Create New
									</Command.GroupHeading>
									<Command.GroupItems>
										<Command.Item
											class="rounded-button data-selected:bg-hover-solid outline-hidden flex h-auto cursor-pointer select-none items-center justify-between px-3 py-2.5 text-sm transition-colors"
											onSelect={() => handleTypeSelect('note', 'click')}
											keywords={['note', 'text', 'thought', 'idea', 'write', 'capture']}
										>
											<div class="flex items-center gap-icon">
												<span class="text-xl">📝</span>
												<div class="flex flex-col items-start">
													<span class="font-medium text-primary">Note</span>
													<span class="text-xs text-secondary"
														>Capture a quick thought or idea</span
													>
												</div>
											</div>
											<KeyboardShortcut keys="C" />
										</Command.Item>
										<Command.Item
											class="rounded-button data-selected:bg-hover-solid outline-hidden flex h-auto cursor-pointer select-none items-center justify-between px-3 py-2.5 text-sm transition-colors"
											onSelect={() => handleTypeSelect('flashcard', 'click')}
											keywords={[
												'flashcard',
												'card',
												'question',
												'answer',
												'study',
												'memorize',
												'learn',
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
											class="rounded-button data-selected:bg-hover-solid outline-hidden flex h-auto cursor-pointer select-none items-center justify-between px-3 py-2.5 text-sm transition-colors"
											onSelect={() => handleTypeSelect('highlight', 'click')}
											keywords={[
												'highlight',
												'excerpt',
												'quote',
												'passage',
												'book',
												'article',
												'read',
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
							<div class="flex items-center justify-between px-6 pt-3 pb-3 border-b border-base">
								<div class="flex items-center gap-2">
									<ContextSelector
										context={noteContext}
										onChange={(ctx) => (noteContext = ctx)}
									/>
									<svg class="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
									</svg>
									<ContextSelector
										context={noteTemplate}
										onChange={(tpl) => (noteTemplate = tpl)}
									/>
								</div>
								
								<!-- Top Right Actions -->
								<div class="flex items-center gap-2">
									<button
										type="button"
										class="px-3 py-1.5 text-sm text-secondary hover:text-primary transition-colors"
										onclick={() => {
											// TODO: Implement draft save logic
											console.log('Save as draft clicked');
										}}
									>
										Save as draft
									</button>
									<button
										type="button"
										class="p-1.5 text-tertiary hover:text-secondary transition-colors"
										onclick={() => {
											// TODO: Implement fullscreen logic
											console.log('Fullscreen clicked');
										}}
										aria-label="Fullscreen"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
										</svg>
									</button>
									<button
										type="button"
										class="p-1.5 text-tertiary hover:text-secondary transition-colors"
										onclick={() => handleOpenChange(false)}
										aria-label="Close"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
						
						<div class="flex flex-col gap-content-section {selectedType === 'note' ? '' : 'px-content-padding mt-content-section'}">
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
								placeholder="Add description..."
								showToolbar={false}
								enableAIDetection={false}
								compact={true}
							/>
							
							<!-- Metadata Bar (Linear-style pills) -->
							<div class="px-6 py-3 border-t border-base bg-surface">
								<MetadataBar>
									<StatusPill
										status={noteStatus}
										onChange={(s) => (noteStatus = s)}
									/>
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
								</MetadataBar>
							</div>
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

						<!-- Tag Selector -->
						<div class="flex flex-col gap-2 border-t border-base pt-3 pb-2 {selectedType === 'note' ? 'px-6' : ''} bg-surface">
							<TagSelector
								bind:comboboxOpen={tagComboboxOpen}
								bind:selectedTagIds
								availableTags={availableTags}
								onTagsChange={handleTagsChange}
								onCreateTagWithColor={handleCreateTag}
							/>
						</div>

						<!-- Action Buttons -->
						<div class="flex items-center justify-between gap-3 pt-3 border-t border-base pb-3 {selectedType === 'note' ? 'px-6' : ''} bg-surface">
							{#if selectedType === 'note'}
								<!-- Left: Attachment button -->
								<AttachmentButton
									count={attachmentCount}
									onClick={() => {
										// TODO: Implement attachment logic
										console.log('Attach file clicked');
									}}
								/>
							{:else}
								<div></div>
							{/if}
							
							<!-- Right: Actions -->
							<div class="flex items-center gap-3">
								{#if selectedType === 'note'}
									<ToggleSwitch
										checked={createMore}
										onChange={(checked) => (createMore = checked)}
										label="Create more"
									/>
								{/if}
								<button
									onclick={() => handleOpenChange(false)}
									class="px-3 py-1.5 text-sm text-secondary hover:text-primary transition-colors"
								>
									Cancel
								</button>
								<button
									onclick={handleCreate}
									disabled={isCreating}
									class="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent-primary text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-all font-medium"
								>
									{isCreating ? 'Creating...' : selectedType === 'note' ? 'Create issue' : 'Create'}
									<KeyboardShortcut keys={['Cmd', 'Enter']} />
								</button>
							</div>
						</div>
						</div>
					</div>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

