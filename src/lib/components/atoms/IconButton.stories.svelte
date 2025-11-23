<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import IconButton from './IconButton.svelte';
	import Icon from './Icon.svelte';

	const { Story } = defineMeta({
		component: IconButton,
		title: 'Design System/Atoms/IconButton',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['ghost', 'solid']
			},
			disabled: {
				control: { type: 'boolean' }
			},
			ariaLabel: {
				control: { type: 'text' }
			}
		}
	});
</script>

<Story name="Ghost" args={{ variant: 'ghost', ariaLabel: 'Add item' }}>
	{#snippet template(args)}
		{#snippet addIcon()}
			<Icon size="md">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					class="h-full w-full"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
			</Icon>
		{/snippet}
		<IconButton
			variant={args.variant}
			ariaLabel={args.ariaLabel}
			disabled={args.disabled}
			icon={addIcon}
		/>
	{/snippet}
</Story>

<Story name="Solid" args={{ variant: 'solid', ariaLabel: 'Delete item' }}>
	{#snippet template(args)}
		{#snippet deleteIcon()}
			<Icon size="md">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					class="h-full w-full"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</Icon>
		{/snippet}
		<IconButton
			variant={args.variant}
			ariaLabel={args.ariaLabel}
			disabled={args.disabled}
			icon={deleteIcon}
		/>
	{/snippet}
</Story>

<Story name="Disabled" args={{ variant: 'ghost', disabled: true, ariaLabel: 'Disabled button' }}>
	{#snippet template(args)}
		{#snippet disabledIcon()}
			<Icon size="md">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					class="h-full w-full"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
			</Icon>
		{/snippet}
		<IconButton
			variant={args.variant}
			ariaLabel={args.ariaLabel}
			disabled={args.disabled}
			icon={disabledIcon}
		/>
	{/snippet}
</Story>

<Story name="Group" args={{ variant: 'ghost', ariaLabel: 'Actions' }}>
	{#snippet template(_args)}
		{#snippet editIcon()}
			<Icon size="md">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					class="h-full w-full"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
					/>
				</svg>
			</Icon>
		{/snippet}
		{#snippet deleteIcon()}
			<Icon size="md">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					class="h-full w-full"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					/>
				</svg>
			</Icon>
		{/snippet}
		{#snippet shareIcon()}
			<Icon size="md">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					class="h-full w-full"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
					/>
				</svg>
			</Icon>
		{/snippet}
		<div class="flex gap-2">
			<IconButton variant="ghost" ariaLabel="Edit" icon={editIcon} />
			<IconButton variant="ghost" ariaLabel="Delete" icon={deleteIcon} />
			<IconButton variant="ghost" ariaLabel="Share" icon={shareIcon} />
		</div>
	{/snippet}
</Story>
