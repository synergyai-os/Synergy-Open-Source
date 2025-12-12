<script lang="ts">
	import type { Id } from '$lib/convex';
	import { getContext } from 'svelte';
	import type { CoreModuleAPI } from '$lib/modules/core/api';
	import {
		AttachmentButton,
		PrioritySelector,
		AssigneeSelector,
		ProjectSelector
	} from '$lib/components/molecules';
	import { StatusPill } from '$lib/components/atoms';
	import type { UseQuickCreateForm } from '$lib/modules/core/composables/useQuickCreateForm.svelte';
	import type { Tag } from '$lib/modules/core/composables/useQuickCreateTags.svelte';

	type Props = {
		form: UseQuickCreateForm;
		availableTags: Tag[];
		onTagsChange: (tagIds: Id<'tags'>[]) => void;
		onCreateTag: (displayName: string, color: string, parentId?: Id<'tags'>) => Promise<Id<'tags'>>;
		tagComboboxOpen: boolean;
	};

	let {
		form,
		availableTags,
		onTagsChange,
		onCreateTag,
		tagComboboxOpen = $bindable(false)
	}: Props = $props();

	// Get core module API from context for TagSelector (enables loose coupling - see SYOS-308)
	const coreAPI = getContext<CoreModuleAPI | undefined>('core-api');
	const TagSelector = coreAPI?.TagSelector;
</script>

{#if TagSelector}
	<div
		class="border-base px-inbox-container flex items-center gap-2 overflow-x-auto border-b py-1.5"
	>
		<AttachmentButton
			count={form.attachmentCount}
			onClick={() => {
				// TODO: Implement attachment logic
			}}
		/>
		<StatusPill status={form.noteStatus} onChange={(s) => (form.noteStatus = s)} />
		<PrioritySelector priority={form.notePriority} onChange={(p) => (form.notePriority = p)} />
		<AssigneeSelector assignee={form.noteAssignee} onChange={(a) => (form.noteAssignee = a)} />
		<ProjectSelector project={form.noteProject} onChange={(proj) => (form.noteProject = proj)} />
		<TagSelector
			bind:comboboxOpen={tagComboboxOpen}
			bind:selectedTagIds={form.selectedTagIds}
			{onTagsChange}
			{availableTags}
			onCreateTagWithColor={onCreateTag}
			showLabel={false}
		/>
	</div>
{/if}
