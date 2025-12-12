<script lang="ts">
	import { FormTextarea } from '$lib/components/atoms';
	import type { UseQuickCreateForm } from '$lib/modules/core/composables/useQuickCreateForm.svelte';

	type Props = {
		form: UseQuickCreateForm;
	};

	let { form }: Props = $props();
</script>

<FormTextarea
	label="Question"
	placeholder="What do you want to remember?"
	rows={3}
	bind:value={form.question}
/>

<FormTextarea
	label="Answer"
	placeholder="The answer or explanation..."
	rows={3}
	bind:value={form.answer}
/>
