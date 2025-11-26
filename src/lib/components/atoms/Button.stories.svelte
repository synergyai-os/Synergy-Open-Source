<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';

	const { Story } = defineMeta({
		component: Button,
		title: 'Design System/Atoms/Button',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['primary', 'secondary', 'outline', 'ghost', 'solid']
			},
			size: {
				control: { type: 'select' },
				options: ['sm', 'md', 'lg']
			},
			disabled: {
				control: { type: 'boolean' }
			},
			iconOnly: {
				control: { type: 'boolean' }
			},
			iconType: {
				control: { type: 'select' },
				options: [
					'add',
					'calendar',
					'chevron-right',
					'circles',
					'close',
					'dashboard',
					'delete',
					'download',
					'edit',
					'flashcards',
					'inbox',
					'lightbulb',
					'members',
					'payment',
					'share',
					'study',
					'tags'
				]
			},
			iconPosition: {
				control: { type: 'select' },
				options: ['left', 'right'],
				if: { arg: 'iconType', exists: true },
				description: 'Icon position relative to text (ignored when iconOnly is true)'
			},
			iconOnly: {
				control: { type: 'boolean' },
				if: { arg: 'iconType', exists: true },
				description: 'Show only icon, no text'
			}
		}
	});
</script>

<Story name="Primary" args={{ variant: 'primary', size: 'md' }}>
	{#snippet template(args)}
		{@const isIconOnly = args.iconOnly || false}
		{@const hasIcon = !!args.iconType}
		{#snippet icon()}
			{#if hasIcon}
				<Icon type={args.iconType} size={args.size === 'sm' ? 'sm' : args.size === 'lg' ? 'lg' : 'md'} />
			{/if}
		{/snippet}
		<Button
			variant={args.variant}
			size={args.size}
			disabled={args.disabled}
			iconOnly={isIconOnly}
			ariaLabel={isIconOnly ? (args.ariaLabel || 'Icon button') : undefined}
		>
			{#snippet children()}
				{#if hasIcon}
					{#if isIconOnly}
						{@render icon()}
					{:else}
						<div class="flex items-center gap-button">
							{#if args.iconPosition === 'left' || (!args.iconPosition && hasIcon)}
								{@render icon()}
							{/if}
							<span>Button</span>
							{#if args.iconPosition === 'right'}
								{@render icon()}
							{/if}
						</div>
					{/if}
				{:else}
					Button
				{/if}
			{/snippet}
		</Button>
	{/snippet}
</Story>

<Story name="Secondary" args={{ variant: 'secondary', size: 'md' }}>
	{#snippet template(args)}
		{@const isIconOnly = args.iconOnly || false}
		{@const hasIcon = !!args.iconType}
		{#snippet icon()}
			{#if hasIcon}
				<Icon type={args.iconType} size={args.size === 'sm' ? 'sm' : args.size === 'lg' ? 'lg' : 'md'} />
			{/if}
		{/snippet}
		<Button
			variant={args.variant}
			size={args.size}
			disabled={args.disabled}
			iconOnly={isIconOnly}
			ariaLabel={isIconOnly ? (args.ariaLabel || 'Icon button') : undefined}
		>
			{#snippet children()}
				{#if hasIcon}
					{#if isIconOnly}
						{@render icon()}
					{:else}
						<div class="flex items-center gap-button">
							{#if args.iconPosition === 'left' || (!args.iconPosition && hasIcon)}
								{@render icon()}
							{/if}
							<span>Button</span>
							{#if args.iconPosition === 'right'}
								{@render icon()}
							{/if}
						</div>
					{/if}
				{:else}
					Button
				{/if}
			{/snippet}
		</Button>
	{/snippet}
</Story>

<Story name="Outline" args={{ variant: 'outline', size: 'md' }}>
	{#snippet template(args)}
		{@const isIconOnly = args.iconOnly || false}
		{@const hasIcon = !!args.iconType}
		{#snippet icon()}
			{#if hasIcon}
				<Icon type={args.iconType} size={args.size === 'sm' ? 'sm' : args.size === 'lg' ? 'lg' : 'md'} />
			{/if}
		{/snippet}
		<Button
			variant={args.variant}
			size={args.size}
			disabled={args.disabled}
			iconOnly={isIconOnly}
			ariaLabel={isIconOnly ? (args.ariaLabel || 'Icon button') : undefined}
		>
			{#snippet children()}
				{#if hasIcon}
					{#if isIconOnly}
						{@render icon()}
					{:else}
						<div class="flex items-center gap-button">
							{#if args.iconPosition === 'left' || (!args.iconPosition && hasIcon)}
								{@render icon()}
							{/if}
							<span>Button</span>
							{#if args.iconPosition === 'right'}
								{@render icon()}
							{/if}
						</div>
					{/if}
				{:else}
					Button
				{/if}
			{/snippet}
		</Button>
	{/snippet}
</Story>

<Story name="Ghost" args={{ variant: 'ghost', size: 'md' }}>
	{#snippet template(args)}
		{@const isIconOnly = args.iconOnly || false}
		{@const hasIcon = !!args.iconType}
		{#snippet icon()}
			{#if hasIcon}
				<Icon type={args.iconType} size={args.size === 'sm' ? 'sm' : args.size === 'lg' ? 'lg' : 'md'} />
			{/if}
		{/snippet}
		<Button
			variant={args.variant}
			size={args.size}
			disabled={args.disabled}
			iconOnly={isIconOnly}
			ariaLabel={isIconOnly ? (args.ariaLabel || 'Icon button') : undefined}
		>
			{#snippet children()}
				{#if hasIcon}
					{#if isIconOnly}
						{@render icon()}
					{:else}
						<div class="flex items-center gap-button">
							{#if args.iconPosition === 'left' || (!args.iconPosition && hasIcon)}
								{@render icon()}
							{/if}
							<span>Button</span>
							{#if args.iconPosition === 'right'}
								{@render icon()}
							{/if}
						</div>
					{/if}
				{:else}
					Button
				{/if}
			{/snippet}
		</Button>
	{/snippet}
</Story>

<Story name="Solid" args={{ variant: 'solid', size: 'md' }}>
	{#snippet template(args)}
		{@const isIconOnly = args.iconOnly || false}
		{@const hasIcon = !!args.iconType}
		{#snippet icon()}
			{#if hasIcon}
				<Icon type={args.iconType} size={args.size === 'sm' ? 'sm' : args.size === 'lg' ? 'lg' : 'md'} />
			{/if}
		{/snippet}
		<Button
			variant={args.variant}
			size={args.size}
			disabled={args.disabled}
			iconOnly={isIconOnly}
			ariaLabel={isIconOnly ? (args.ariaLabel || 'Icon button') : undefined}
		>
			{#snippet children()}
				{#if hasIcon}
					{#if isIconOnly}
						{@render icon()}
					{:else}
						<div class="flex items-center gap-button">
							{#if args.iconPosition === 'left' || (!args.iconPosition && hasIcon)}
								{@render icon()}
							{/if}
							<span>Button</span>
							{#if args.iconPosition === 'right'}
								{@render icon()}
							{/if}
						</div>
					{/if}
				{:else}
					Button
				{/if}
			{/snippet}
		</Button>
	{/snippet}
</Story>

<Story name="Small" args={{ variant: 'primary', size: 'sm' }}>
	{#snippet template(args)}
		{#if args.iconType}
			{#snippet icon()}
				<Icon type={args.iconType} size="sm" />
			{/snippet}
		{/if}
		<Button
			variant={args.variant}
			size={args.size}
			disabled={args.disabled}
			iconOnly={args.iconPosition === 'only'}
			ariaLabel={args.iconPosition === 'only' ? 'Icon button' : undefined}
		>
			{#snippet children()}
				{#if args.iconType}
					{#if args.iconPosition === 'only'}
						{@render icon()}
					{:else}
						<div class="flex items-center gap-button">
							{#if args.iconPosition === 'left'}
								{@render icon()}
							{/if}
							<span>Small Button</span>
							{#if args.iconPosition === 'right'}
								{@render icon()}
							{/if}
						</div>
					{/if}
				{:else}
					Small Button
				{/if}
			{/snippet}
		</Button>
	{/snippet}
</Story>

<Story name="Large" args={{ variant: 'primary', size: 'lg' }}>
	{#snippet template(args)}
		{#if args.iconType}
			{#snippet icon()}
				<Icon type={args.iconType} size="lg" />
			{/snippet}
		{/if}
		<Button
			variant={args.variant}
			size={args.size}
			disabled={args.disabled}
			iconOnly={args.iconPosition === 'only'}
			ariaLabel={args.iconPosition === 'only' ? 'Icon button' : undefined}
		>
			{#snippet children()}
				{#if args.iconType}
					{#if args.iconPosition === 'only'}
						{@render icon()}
					{:else}
						<div class="flex items-center gap-button">
							{#if args.iconPosition === 'left'}
								{@render icon()}
							{/if}
							<span>Large Button</span>
							{#if args.iconPosition === 'right'}
								{@render icon()}
							{/if}
						</div>
					{/if}
				{:else}
					Large Button
				{/if}
			{/snippet}
		</Button>
	{/snippet}
</Story>

<Story name="Disabled" args={{ variant: 'primary', size: 'md', disabled: true }}>
	{#snippet template(args)}
		{#if args.iconType}
			{#snippet icon()}
				<Icon type={args.iconType} size="md" />
			{/snippet}
		{/if}
		<Button
			variant={args.variant}
			size={args.size}
			disabled={args.disabled}
			iconOnly={args.iconPosition === 'only'}
			ariaLabel={args.iconPosition === 'only' ? 'Icon button' : undefined}
		>
			{#snippet children()}
				{#if args.iconType}
					{#if args.iconPosition === 'only'}
						{@render icon()}
					{:else}
						<div class="flex items-center gap-button">
							{#if args.iconPosition === 'left'}
								{@render icon()}
							{/if}
							<span>Disabled Button</span>
							{#if args.iconPosition === 'right'}
								{@render icon()}
							{/if}
						</div>
					{/if}
				{:else}
					Disabled Button
				{/if}
			{/snippet}
		</Button>
	{/snippet}
</Story>

<!-- Icon Patterns -->
<Story
	name="With Icon"
	args={{ variant: 'primary', size: 'md', iconType: 'add', iconPosition: 'left' }}
>
	{#snippet template(args)}
		{#snippet icon()}
			<Icon type={args.iconType || 'add'} size="sm" />
		{/snippet}
		<Button variant={args.variant} size={args.size} disabled={args.disabled}>
			{#snippet children()}
				<div class="flex items-center gap-button">
					{#if args.iconPosition === 'left'}
						{@render icon()}
					{/if}
					<span>Button Text</span>
					{#if args.iconPosition === 'right'}
						{@render icon()}
					{/if}
				</div>
			{/snippet}
		</Button>
	{/snippet}
</Story>

<Story
	name="Icon Only"
	args={{ variant: 'ghost', size: 'md', iconOnly: true, iconType: 'add' }}
>
	{#snippet template(args)}
		{#snippet icon()}
			<Icon type={args.iconType || 'add'} size="md" />
		{/snippet}
		<Button
			variant={args.variant}
			size={args.size}
			iconOnly
			ariaLabel="Add item"
			disabled={args.disabled}
		>
			{#snippet children()}
				{@render icon()}
			{/snippet}
		</Button>
	{/snippet}
</Story>

<!-- All Variants with Icons -->
<Story name="All Variants - Icon Left">
	{#snippet template(_args)}
		{#snippet icon()}
			<Icon type="add" size="sm" />
		{/snippet}
		<div class="flex flex-wrap items-center gap-4">
			<Button variant="primary" size="md">
				{#snippet children()}
					<div class="flex items-center gap-button">
						{@render icon()}
						<span>Primary</span>
					</div>
				{/snippet}
			</Button>
			<Button variant="secondary" size="md">
				{#snippet children()}
					<div class="flex items-center gap-button">
						{@render icon()}
						<span>Secondary</span>
					</div>
				{/snippet}
			</Button>
			<Button variant="outline" size="md">
				{#snippet children()}
					<div class="flex items-center gap-button">
						{@render icon()}
						<span>Outline</span>
					</div>
				{/snippet}
			</Button>
			<Button variant="ghost" size="md">
				{#snippet children()}
					<div class="flex items-center gap-button">
						{@render icon()}
						<span>Ghost</span>
					</div>
				{/snippet}
			</Button>
			<Button variant="solid" size="md">
				{#snippet children()}
					<div class="flex items-center gap-button">
						{@render icon()}
						<span>Solid</span>
					</div>
				{/snippet}
			</Button>
		</div>
	{/snippet}
</Story>

<Story name="All Variants - Icon Right">
	{#snippet template(_args)}
		{#snippet icon()}
			<Icon type="chevron-right" size="sm" />
		{/snippet}
		<div class="flex flex-wrap items-center gap-4">
			<Button variant="primary" size="md">
				{#snippet children()}
					<div class="flex items-center gap-button">
						<span>Primary</span>
						{@render icon()}
					</div>
				{/snippet}
			</Button>
			<Button variant="secondary" size="md">
				{#snippet children()}
					<div class="flex items-center gap-button">
						<span>Secondary</span>
						{@render icon()}
					</div>
				{/snippet}
			</Button>
			<Button variant="outline" size="md">
				{#snippet children()}
					<div class="flex items-center gap-button">
						<span>Outline</span>
						{@render icon()}
					</div>
				{/snippet}
			</Button>
			<Button variant="ghost" size="md">
				{#snippet children()}
					<div class="flex items-center gap-button">
						<span>Ghost</span>
						{@render icon()}
					</div>
				{/snippet}
			</Button>
			<Button variant="solid" size="md">
				{#snippet children()}
					<div class="flex items-center gap-button">
						<span>Solid</span>
						{@render icon()}
					</div>
				{/snippet}
			</Button>
		</div>
	{/snippet}
</Story>

<Story name="All Variants - Icon Only">
	{#snippet template(_args)}
		{#snippet icon()}
			<Icon type="add" size="md" />
		{/snippet}
		<div class="flex flex-wrap items-center gap-4">
			<Button variant="primary" iconOnly ariaLabel="Primary" size="md">
				{#snippet children()}
					{@render icon()}
				{/snippet}
			</Button>
			<Button variant="secondary" iconOnly ariaLabel="Secondary" size="md">
				{#snippet children()}
					{@render icon()}
				{/snippet}
			</Button>
			<Button variant="outline" iconOnly ariaLabel="Outline" size="md">
				{#snippet children()}
					{@render icon()}
				{/snippet}
			</Button>
			<Button variant="ghost" iconOnly ariaLabel="Ghost" size="md">
				{#snippet children()}
					{@render icon()}
				{/snippet}
			</Button>
			<Button variant="solid" iconOnly ariaLabel="Solid" size="md">
				{#snippet children()}
					{@render icon()}
				{/snippet}
			</Button>
		</div>
	{/snippet}
</Story>

<Story name="Icon Showcase">
	{#snippet template(_args)}
		<div class="flex flex-col gap-6">
			<!-- Add Icon -->
			<div class="flex items-center gap-4">
				<Button variant="ghost" iconOnly ariaLabel="Add" size="md">
					{#snippet children()}
						<Icon type="add" size="md" />
					{/snippet}
				</Button>
				<Button variant="solid" iconOnly ariaLabel="Add" size="md">
					{#snippet children()}
						<Icon type="add" size="md" />
					{/snippet}
				</Button>
				<span class="text-sm text-secondary">Add</span>
			</div>

			<!-- Edit Icon -->
			<div class="flex items-center gap-4">
				<Button variant="ghost" iconOnly ariaLabel="Edit" size="md">
					{#snippet children()}
						<Icon type="edit" size="md" />
					{/snippet}
				</Button>
				<Button variant="solid" iconOnly ariaLabel="Edit" size="md">
					{#snippet children()}
						<Icon type="edit" size="md" />
					{/snippet}
				</Button>
				<span class="text-sm text-secondary">Edit</span>
			</div>

			<!-- Delete Icon -->
			<div class="flex items-center gap-4">
				<Button variant="ghost" iconOnly ariaLabel="Delete" size="md">
					{#snippet children()}
						<Icon type="delete" size="md" />
					{/snippet}
				</Button>
				<Button variant="solid" iconOnly ariaLabel="Delete" size="md">
					{#snippet children()}
						<Icon type="delete" size="md" />
					{/snippet}
				</Button>
				<span class="text-sm text-secondary">Delete</span>
			</div>

			<!-- Close Icon -->
			<div class="flex items-center gap-4">
				<Button variant="ghost" iconOnly ariaLabel="Close" size="md">
					{#snippet children()}
						<Icon type="delete" size="md" />
					{/snippet}
				</Button>
				<Button variant="solid" iconOnly ariaLabel="Close" size="md">
					{#snippet children()}
						<Icon type="delete" size="md" />
					{/snippet}
				</Button>
				<span class="text-sm text-secondary">Close</span>
			</div>

			<!-- Download Icon -->
			<div class="flex items-center gap-4">
				<Button variant="ghost" iconOnly ariaLabel="Download" size="md">
					{#snippet children()}
						<Icon type="download" size="md" />
					{/snippet}
				</Button>
				<Button variant="solid" iconOnly ariaLabel="Download" size="md">
					{#snippet children()}
						<Icon type="download" size="md" />
					{/snippet}
				</Button>
				<span class="text-sm text-secondary">Download</span>
			</div>

			<!-- Share Icon -->
			<div class="flex items-center gap-4">
				<Button variant="ghost" iconOnly ariaLabel="Share" size="md">
					{#snippet children()}
						<Icon type="share" size="md" />
					{/snippet}
				</Button>
				<Button variant="solid" iconOnly ariaLabel="Share" size="md">
					{#snippet children()}
						<Icon type="share" size="md" />
					{/snippet}
				</Button>
				<span class="text-sm text-secondary">Share</span>
			</div>
		</div>
	{/snippet}
</Story>
