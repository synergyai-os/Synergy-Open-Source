<script lang="ts">
	import { FormInput, FormTextarea } from '$lib/components/atoms';
	import type { UseQuickCreateForm } from '$lib/modules/core/composables/useQuickCreateForm.svelte';

	type Props = {
		form: UseQuickCreateForm;
	};

	let { form }: Props = $props();
</script>

<FormInput
	label="Source (optional)"
	placeholder="Book, article, or source name..."
	bind:value={form.sourceTitle}
/>

<FormTextarea
	label="Highlight"
	placeholder="Paste or type the highlighted text..."
	rows={4}
	bind:value={form.content}
/>

<FormTextarea
	label="Note (optional)"
	placeholder="Add your thoughts..."
	rows={2}
	bind:value={form.note}
/>
