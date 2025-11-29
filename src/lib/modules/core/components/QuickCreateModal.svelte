<script lang="ts">
	import { browser } from '$app/environment';
	import type { Id } from '$lib/convex';
	import { Dialog } from 'bits-ui';
	import { useQuickCreateTags } from '$lib/modules/core/composables/useQuickCreateTags.svelte';
	import { useQuickCreateForm } from '$lib/modules/core/composables/useQuickCreateForm.svelte';
	import { KeyboardShortcut, Button } from '$lib/components/atoms';
	import QuickCreateCommandPalette from './QuickCreateCommandPalette.svelte';
	import QuickCreateNoteForm from './QuickCreateNoteForm.svelte';
	import QuickCreateFlashcardForm from './QuickCreateFlashcardForm.svelte';
	import QuickCreateHighlightForm from './QuickCreateHighlightForm.svelte';
	// TODO: Uncomment when implementing PostHog tracking
	// import { AnalyticsEventName } from '$lib/infrastructure/analytics/events';

	type ContentType = 'note' | 'flashcard' | 'highlight';

	type Props = {
		open?: boolean;
		triggerMethod?: 'keyboard_n' | 'header_button' | 'footer_button';
		currentView?: 'inbox' | 'flashcards' | 'tags' | 'my_mind' | 'study';
		initialType?: ContentType | null;
		sessionId?: string; // Required for session validation
		workspaceId?: string | null; // Active workspace ID (for workspace context)
		initialTags?: unknown[]; // Server-side preloaded tags for instant rendering
	};

	let {
		open = $bindable(false),
		triggerMethod: _triggerMethod = 'keyboard_n',
		currentView: _currentView = 'inbox',
		initialType = null,
		sessionId,
		workspaceId = null,
		initialTags = []
	}: Props = $props();

	// Tag query and creation logic extracted to composable (separation of concerns - see SYOS-571)
	const tags = useQuickCreateTags(
		() => sessionId ?? null,
		() => workspaceId ?? null,
		initialTags
	);
	const availableTags = tags.availableTags;

	// Component UI state (not form state)
	let selectedType = $state<ContentType | null>(null);
	let tagComboboxOpen = $state(false);
	let isFullscreen = $state(false);

	// Modal container ref for refocusing after blur
	let modalContainerRef = $state<HTMLDivElement | null>(null);

	// Form state, validation, and mutations extracted to composable (separation of concerns - see SYOS-572)
	const form = useQuickCreateForm(
		() => sessionId ?? null,
		() => workspaceId ?? null,
		() => selectedType
	);

	// Timing tracking for analytics
	// TODO: Re-enable when analytics tracking is needed
	let _openedAt = $state(0);
	let _typeSelectedAt = $state(0);

	// Set initial type when modal opens (for quick create shortcuts like 'N')
	$effect(() => {
		if (open) {
			if (initialType) {
				selectedType = initialType;
				_typeSelectedAt = Date.now();
			}
			// If no initialType, selectedType stays null (shows command palette)
		} else {
			// Reset when modal closes
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
		form.selectedTagIds = newTagIds;

		// TODO: Re-enable when analytics tracking is needed
		// const now = Date.now();
		// const addedCount = newTagIds.filter((id) => !form.selectedTagIds.includes(id)).length;
		// const removedCount = form.selectedTagIds.filter((id) => !newTagIds.includes(id)).length;
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

	// Tag creation handled by composable (see useQuickCreateTags)
	const handleCreateTag = tags.createTag;

	// Form creation handled by composable (see useQuickCreateForm)
	async function handleCreate() {
		const success = await form.handleCreate();
		if (success) {
			// Reset UI state
			selectedType = null;
			open = false;
		}
	}

	// Reset form state (form state handled by composable, UI state reset here)
	function resetForm() {
		form.resetForm();
		selectedType = null;
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
			// 		had_content: !!(form.content || form.question || form.answer),
			// 		had_tags: form.selectedTagIds.length > 0,
			// 	},
			// });

			resetForm();
		}
		open = newOpen;
	}

	// Keyboard shortcuts
	async function handleKeyDown(e: KeyboardEvent) {
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
			await handleCreate();
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
				? 'shadow-dialog fixed inset-0 z-50 h-full w-full overflow-y-auto border-0 bg-elevated p-0'
				: 'border-base max-h-dialog max-w-dialogdefault shadow-dialog fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border bg-elevated p-0'} data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
		>
			<div bind:this={modalContainerRef} onkeydown={handleKeyDown} role="dialog" tabindex="-1">
				{#if !selectedType}
					<QuickCreateCommandPalette onTypeSelect={handleTypeSelect} />
				{:else}
					<!-- Content Entry View -->
					<div class="flex w-full flex-col" data-debug="content-entry">
						{#if selectedType === 'note'}
							<QuickCreateNoteForm
								{form}
								{availableTags}
								onTagsChange={handleTagsChange}
								onCreateTag={handleCreateTag}
								bind:tagComboboxOpen
								{modalContainerRef}
								onClose={() => handleOpenChange(false)}
								onCreate={handleCreate}
								{isFullscreen}
								onFullscreenToggle={() => (isFullscreen = !isFullscreen)}
							/>
						{:else if selectedType === 'flashcard'}
							<div class="px-content-padding pt-content-padding">
								<Dialog.Title class="text-heading-primary mb-heading text-xl font-medium">
									Create Flashcard
								</Dialog.Title>
							</div>
							<div class="mt-content-section gap-content-section px-content-padding flex flex-col">
								<QuickCreateFlashcardForm {form} />
								<!-- Actions Footer -->
								<div class="flex items-center justify-end gap-2 py-2">
									<Button variant="outline" onclick={() => handleOpenChange(false)}>Cancel</Button>
									<Button variant="primary" onclick={handleCreate} disabled={form.isCreating}>
										{form.isCreating ? 'Creating...' : 'Create'}
										<KeyboardShortcut keys={['Cmd', 'Enter']} />
									</Button>
								</div>
							</div>
						{:else if selectedType === 'highlight'}
							<div class="px-content-padding pt-content-padding">
								<Dialog.Title class="text-heading-primary mb-heading text-xl font-medium">
									Create Highlight
								</Dialog.Title>
							</div>
							<div class="mt-content-section gap-content-section px-content-padding flex flex-col">
								<QuickCreateHighlightForm {form} />
								<!-- Actions Footer -->
								<div class="flex items-center justify-end gap-2 py-2">
									<Button variant="outline" onclick={() => handleOpenChange(false)}>Cancel</Button>
									<Button variant="primary" onclick={handleCreate} disabled={form.isCreating}>
										{form.isCreating ? 'Creating...' : 'Create'}
										<KeyboardShortcut keys={['Cmd', 'Enter']} />
									</Button>
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
