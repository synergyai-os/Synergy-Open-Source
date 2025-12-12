<script lang="ts">
	import { durationInputRecipe } from '$lib/design-system/recipes';

	type Props = {
		id?: string;
		value?: number;
		required?: boolean;
		disabled?: boolean;
		min?: number;
		max?: number;
		class?: string;
	};

	let {
		id,
		value = $bindable(60),
		required = false,
		disabled = false,
		min = 5,
		max = 480,
		class: customClass = ''
	}: Props = $props();

	const inputClasses = $derived([durationInputRecipe(), customClass]);
</script>

<input {id} type="number" {value} {required} {disabled} {min} {max} class={inputClasses} />
