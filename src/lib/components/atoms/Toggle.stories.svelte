<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Toggle from './Toggle.svelte';

	const { Story } = defineMeta({
		component: Toggle.Root,
		title: 'Design System/Atoms/Toggle',
		tags: ['autodocs'],
		argTypes: {
			pressed: {
				control: { type: 'boolean' }
			},
			disabled: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Default" args={{ pressed: false }}>
	{#snippet template(args)}
		<Toggle.Root
			{...args}
			class="focus-visible:ring-ring border-base text-button hover:bg-hover-solid data-[state=on]:bg-accent-primary inline-flex h-10 items-center justify-center rounded-button border bg-elevated px-2 font-medium text-primary transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-primary"
		>
			Toggle
		</Toggle.Root>
	{/snippet}
</Story>

<Story name="Pressed" args={{ pressed: true }}>
	{#snippet template(args)}
		<Toggle.Root
			{...args}
			class="focus-visible:ring-ring border-base text-button hover:bg-hover-solid data-[state=on]:bg-accent-primary inline-flex h-10 items-center justify-center rounded-button border bg-elevated px-2 font-medium text-primary transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-primary"
		>
			Toggle
		</Toggle.Root>
	{/snippet}
</Story>

<Story name="With Icon" args={{ pressed: false }}>
	{#snippet template(args)}
		<Toggle.Root
			{...args}
			class="focus-visible:ring-ring border-base hover:bg-hover-solid data-[state=on]:bg-accent-primary inline-flex h-10 w-10 items-center justify-center rounded-button border bg-elevated text-primary transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-primary"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				class="h-5 w-5"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
				/>
			</svg>
		</Toggle.Root>
	{/snippet}
</Story>

<Story name="Disabled" args={{ pressed: false, disabled: true }}>
	{#snippet template(args)}
		<Toggle.Root
			{...args}
			class="focus-visible:ring-ring border-base text-button hover:bg-hover-solid data-[state=on]:bg-accent-primary inline-flex h-10 items-center justify-center rounded-button border bg-elevated px-2 font-medium text-primary transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-primary"
		>
			Toggle
		</Toggle.Root>
	{/snippet}
</Story>
