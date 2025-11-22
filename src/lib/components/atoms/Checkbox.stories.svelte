<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Checkbox from './Checkbox.svelte';
	import * as Label from './Label.svelte';

	const { Story } = defineMeta({
		component: Checkbox.Root,
		title: 'Design System/Atoms/Checkbox',
		tags: ['autodocs'],
		argTypes: {
			checked: {
				control: { type: 'boolean' }
			},
			disabled: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Default" args={{ checked: false }}>
	{#snippet template(args)}
		<Checkbox.Root {...args}>
			{#snippet children({ checked, indeterminate })}
				<div
					class="flex h-4 w-4 items-center justify-center rounded-input border-2 border-base bg-input transition-colors {checked
						? 'border-accent-primary bg-accent-primary'
						: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
				>
					{#if checked}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-3 w-3 text-primary"
						>
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					{/if}
				</div>
			{/snippet}
		</Checkbox.Root>
	{/snippet}
</Story>

<Story name="Checked" args={{ checked: true }}>
	{#snippet template(args)}
		<Checkbox.Root {...args}>
			{#snippet children({ checked, indeterminate })}
				<div
					class="flex h-4 w-4 items-center justify-center rounded-input border-2 border-base bg-input transition-colors {checked
						? 'border-accent-primary bg-accent-primary'
						: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
				>
					{#if checked}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-3 w-3 text-primary"
						>
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					{/if}
				</div>
			{/snippet}
		</Checkbox.Root>
	{/snippet}
</Story>

<Story name="With Label" args={{ checked: false }}>
	{#snippet template(args)}
		<div class="flex items-center gap-2">
			<Checkbox.Root {...args}>
				{#snippet children({ checked, indeterminate })}
					<div
						class="flex h-4 w-4 items-center justify-center rounded-input border-2 border-base bg-input transition-colors {checked
							? 'border-accent-primary bg-accent-primary'
							: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
					>
						{#if checked}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="h-3 w-3 text-primary"
							>
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						{/if}
					</div>
				{/snippet}
			</Checkbox.Root>
			<Label.Root>Accept terms and conditions</Label.Root>
		</div>
	{/snippet}
</Story>

<Story name="Disabled" args={{ checked: false, disabled: true }}>
	{#snippet template(args)}
		<div class="flex items-center gap-2">
			<Checkbox.Root {...args}>
				{#snippet children({ checked, indeterminate })}
					<div
						class="flex h-4 w-4 items-center justify-center rounded-input border-2 border-base bg-input transition-colors {checked
							? 'border-accent-primary bg-accent-primary'
							: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
					>
						{#if checked}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="h-3 w-3 text-primary"
							>
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						{/if}
					</div>
				{/snippet}
			</Checkbox.Root>
			<Label.Root>Disabled checkbox</Label.Root>
		</div>
	{/snippet}
</Story>

<Story name="Disabled Checked" args={{ checked: true, disabled: true }}>
	{#snippet template(args)}
		<div class="flex items-center gap-2">
			<Checkbox.Root {...args}>
				{#snippet children({ checked, indeterminate })}
					<div
						class="flex h-4 w-4 items-center justify-center rounded-input border-2 border-base bg-input transition-colors {checked
							? 'border-accent-primary bg-accent-primary'
							: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
					>
						{#if checked}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="h-3 w-3 text-primary"
							>
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						{/if}
					</div>
				{/snippet}
			</Checkbox.Root>
			<Label.Root>Disabled checked</Label.Root>
		</div>
	{/snippet}
</Story>
