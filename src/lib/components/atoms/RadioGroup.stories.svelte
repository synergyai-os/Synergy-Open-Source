<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as RadioGroup from './RadioGroup.svelte';
	import * as Label from './Label.svelte';

	const { Story } = defineMeta({
		component: RadioGroup.Root,
		title: 'Design System/Atoms/RadioGroup',
		tags: ['autodocs'],
		argTypes: {
			value: {
				control: { type: 'text' }
			},
			disabled: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Default" args={{ value: 'option1' }}>
	{#snippet template(args)}
		<RadioGroup.Root {...args}>
			<RadioGroup.Item value="option1">
				{#snippet children({ checked })}
					<div class="flex items-center gap-2">
						<div
							class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
								? 'border-accent-primary'
								: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
						>
							{#if checked}
								<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
							{/if}
						</div>
						<Label.Root>Option 1</Label.Root>
					</div>
				{/snippet}
			</RadioGroup.Item>
			<RadioGroup.Item value="option2">
				{#snippet children({ checked })}
					<div class="flex items-center gap-2">
						<div
							class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
								? 'border-accent-primary'
								: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
						>
							{#if checked}
								<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
							{/if}
						</div>
						<Label.Root>Option 2</Label.Root>
					</div>
				{/snippet}
			</RadioGroup.Item>
			<RadioGroup.Item value="option3">
				{#snippet children({ checked })}
					<div class="flex items-center gap-2">
						<div
							class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
								? 'border-accent-primary'
								: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
						>
							{#if checked}
								<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
							{/if}
						</div>
						<Label.Root>Option 3</Label.Root>
					</div>
				{/snippet}
			</RadioGroup.Item>
		</RadioGroup.Root>
	{/snippet}
</Story>

<Story name="Selected" args={{ value: 'option2' }}>
	{#snippet template(args)}
		<RadioGroup.Root {...args}>
			<RadioGroup.Item value="option1">
				{#snippet children({ checked })}
					<div class="flex items-center gap-2">
						<div
							class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
								? 'border-accent-primary'
								: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
						>
							{#if checked}
								<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
							{/if}
						</div>
						<Label.Root>Option 1</Label.Root>
					</div>
				{/snippet}
			</RadioGroup.Item>
			<RadioGroup.Item value="option2">
				{#snippet children({ checked })}
					<div class="flex items-center gap-2">
						<div
							class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
								? 'border-accent-primary'
								: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
						>
							{#if checked}
								<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
							{/if}
						</div>
						<Label.Root>Option 2</Label.Root>
					</div>
				{/snippet}
			</RadioGroup.Item>
			<RadioGroup.Item value="option3">
				{#snippet children({ checked })}
					<div class="flex items-center gap-2">
						<div
							class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
								? 'border-accent-primary'
								: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
						>
							{#if checked}
								<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
							{/if}
						</div>
						<Label.Root>Option 3</Label.Root>
					</div>
				{/snippet}
			</RadioGroup.Item>
		</RadioGroup.Root>
	{/snippet}
</Story>

<Story name="Disabled" args={{ value: 'option1', disabled: true }}>
	{#snippet template(args)}
		<RadioGroup.Root {...args}>
			<RadioGroup.Item value="option1">
				{#snippet children({ checked })}
					<div class="flex items-center gap-2">
						<div
							class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
								? 'border-accent-primary'
								: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
						>
							{#if checked}
								<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
							{/if}
						</div>
						<Label.Root>Option 1</Label.Root>
					</div>
				{/snippet}
			</RadioGroup.Item>
			<RadioGroup.Item value="option2">
				{#snippet children({ checked })}
					<div class="flex items-center gap-2">
						<div
							class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
								? 'border-accent-primary'
								: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
						>
							{#if checked}
								<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
							{/if}
						</div>
						<Label.Root>Option 2</Label.Root>
					</div>
				{/snippet}
			</RadioGroup.Item>
			<RadioGroup.Item value="option3">
				{#snippet children({ checked })}
					<div class="flex items-center gap-2">
						<div
							class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-base transition-colors {checked
								? 'border-accent-primary'
								: ''} {args.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}"
						>
							{#if checked}
								<div class="h-2 w-2 rounded-full bg-accent-primary"></div>
							{/if}
						</div>
						<Label.Root>Option 3</Label.Root>
					</div>
				{/snippet}
			</RadioGroup.Item>
		</RadioGroup.Root>
	{/snippet}
</Story>
