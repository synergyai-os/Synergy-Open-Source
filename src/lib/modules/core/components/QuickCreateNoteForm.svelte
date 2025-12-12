<script lang="ts">
	import { Button, KeyboardShortcut } from '$lib/components/atoms';
	import { ContextSelector, ToggleSwitch } from '$lib/components/molecules';
	import NoteEditorWithDetection from '$lib/modules/core/components/notes/NoteEditorWithDetection.svelte';
	import QuickCreateMetadataBar from './QuickCreateMetadataBar.svelte';
	import type { UseQuickCreateForm } from '$lib/modules/core/composables/useQuickCreateForm.svelte';
	import type { Tag } from '$lib/modules/core/composables/useQuickCreateTags.svelte';
	import type { Id } from '$lib/convex';

	type Props = {
		form: UseQuickCreateForm;
		availableTags: Tag[];
		onTagsChange: (tagIds: Id<'tags'>[]) => void;
		onCreateTag: (displayName: string, color: string, parentId?: Id<'tags'>) => Promise<Id<'tags'>>;
		tagComboboxOpen: boolean;
		modalContainerRef: HTMLDivElement | null;
		onClose: () => void;
		onCreate: () => Promise<void>;
		isFullscreen: boolean;
		onFullscreenToggle: () => void;
	};

	let {
		form,
		availableTags,
		onTagsChange,
		onCreateTag,
		tagComboboxOpen = $bindable(false),
		modalContainerRef,
		onClose,
		onCreate,
		isFullscreen,
		onFullscreenToggle
	}: Props = $props();

	// Actions Footer (Linear-style) -->
	async function handleCreateClick() {
		await onCreate();
	}
</script>

<!-- Context/Template Selectors + Draft Button (Linear-style top bar) -->
<div class="px-inbox-container flex items-center justify-between py-2">
	<div class="flex items-center gap-2">
		<ContextSelector
			context={form.noteContext}
			onChange={(ctx) => (form.noteContext = ctx)}
			tabIndex={-1}
		/>
		<svg class="h-3 w-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
		</svg>
		<ContextSelector
			context={form.noteTemplate}
			onChange={(tpl) => (form.noteTemplate = tpl)}
			tabIndex={-1}
		/>
	</div>

	<!-- Top Right Actions -->
	<div class="flex items-center gap-2">
		<Button
			variant="outline"
			size="sm"
			onclick={() => {
				// TODO: Implement draft save logic
			}}
		>
			Save as draft
		</Button>
		<Button
			variant="outline"
			iconOnly
			ariaLabel={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
			onclick={onFullscreenToggle}
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
		</Button>
		<Button variant="outline" iconOnly ariaLabel="Close" onclick={onClose}>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</Button>
	</div>
</div>

<!-- Minimal Note Editor - Linear Style -->
<NoteEditorWithDetection
	content={form.noteContent}
	title={form.noteTitle}
	onContentChange={(content: string, markdown: string) => {
		form.noteContent = content;
		form.noteContentMarkdown = markdown;
	}}
	onTitleChange={(title: string) => {
		form.noteTitle = title;
	}}
	onAIFlagged={() => {
		form.noteIsAIGenerated = true;
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

<!-- Metadata Pills + Tags (Linear-style) -->
<QuickCreateMetadataBar {form} {availableTags} {onTagsChange} {onCreateTag} bind:tagComboboxOpen />

<!-- Actions Footer (Linear-style) -->
<div class="px-inbox-container flex items-center justify-end gap-2 py-2">
	<ToggleSwitch
		checked={form.createMore}
		onChange={(checked) => (form.createMore = checked)}
		label="Create more"
	/>
	<Button variant="outline" onclick={onClose}>Cancel</Button>
	<Button variant="primary" onclick={handleCreateClick} disabled={form.isCreating}>
		{form.isCreating ? 'Creating...' : 'Create issue'}
		<KeyboardShortcut keys={['Cmd', 'Enter']} />
	</Button>
</div>
