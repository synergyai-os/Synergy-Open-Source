<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StandardDialog from './StandardDialog.svelte';
	import { Button } from '$lib/components/atoms';
	import { FormInput } from '$lib/components/molecules';

	const { Story } = defineMeta({
		component: StandardDialog,
		title: 'Design System/Organisms/StandardDialog',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default', 'danger']
			},
			loading: {
				control: { type: 'boolean' }
			},
			disabled: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Form Dialog" args={{ open: false, variant: 'default', loading: false }}>
	{#snippet template(args)}
		{@const open = $state(false)}
		{@const name = $state('')}
		{@const type = $state('example_type')}

		<Button onclick={() => (open = true)}>Add Sub-Circle</Button>

		<StandardDialog
			bind:open
			title="Add Sub-Circle to My New Team"
			description="Create a new sub-circle within this circle."
			submitLabel="Create Circle"
			variant={args.variant}
			loading={args.loading}
			disabled={args.disabled}
			onsubmit={() => {
				console.log('Create:', { name, type });
			}}
		>
			<div class="gap-form flex flex-col">
				<FormInput label="Name" bind:value={name} placeholder="Enter circle name" required />
				<div class="flex flex-col gap-2">
					<label class="text-label text-secondary">Circle Type</label>
					<select
						bind:value={type}
						class="rounded-input border-base bg-surface px-input py-input text-primary border"
					>
						<option value="hierarchy">Hierarchy</option>
						<option value="empowered_team">Empowered Team</option>
						<option value="guild">Guild</option>
						<option value="hybrid">Hybrid</option>
					</select>
				</div>
			</div>
		</StandardDialog>
	{/snippet}
</Story>

<Story name="Confirmation (Danger)" args={{ open: false, variant: 'danger', loading: false }}>
	{#snippet template(args)}
		{@const open = $state(false)}

		<Button onclick={() => (open = true)} variant="outline">Delete Circle</Button>

		<StandardDialog
			bind:open
			title="Delete Circle?"
			description="This action cannot be undone. All roles and assignments will be permanently removed."
			submitLabel="Delete"
			variant={args.variant}
			loading={args.loading}
			onsubmit={() => {
				console.log('Delete confirmed');
			}}
		>
			<p class="text-body text-secondary">
				Are you sure you want to delete this circle? This will:
			</p>
			<ul class="text-body text-secondary ml-4 list-disc">
				<li>Remove all roles in this circle</li>
				<li>Unassign all members</li>
				<li>Delete all proposals</li>
			</ul>
		</StandardDialog>
	{/snippet}
</Story>

<Story name="Dismissible Info" args={{ open: false }}>
	{#snippet template(_args)}
		{@const open = $state(false)}

		<Button onclick={() => (open = true)} variant="outline">About Circles</Button>

		<StandardDialog bind:open title="About Circles" dismissible>
			<div class="gap-content flex flex-col">
				<p class="text-body text-primary">
					<strong>Circles</strong> are organizational units that group related work and responsibilities.
				</p>
				<p class="text-body text-secondary">
					Each circle can have multiple roles, and members can be assigned to fill those roles.
					Circles can be nested to create hierarchical organizational structures.
				</p>
				<p class="text-body text-secondary">
					Circles operate with different governance models: Hierarchy, Empowered Team, Guild, or
					Hybrid.
				</p>
			</div>
		</StandardDialog>
	{/snippet}
</Story>

<Story name="Picker (No Footer)" args={{ open: false }}>
	{#snippet template(_args)}
		{@const open = $state(false)}
		{@const search = $state('')}
		{@const members = $state([
			{ id: '1', name: 'Alice Johnson', role: 'Developer' },
			{ id: '2', name: 'Bob Smith', role: 'Designer' },
			{ id: '3', name: 'Carol Williams', role: 'Product Manager' }
		])}

		<Button onclick={() => (open = true)}>Add Member</Button>

		<StandardDialog bind:open title="Add member to Owner" closable>
			<div class="gap-content flex flex-col">
				<FormInput
					type="search"
					bind:value={search}
					placeholder="Search members..."
					autocomplete="off"
				/>
				<div class="flex flex-col gap-2">
					{#each members.filter((m) => m.name
							.toLowerCase()
							.includes(search.toLowerCase())) as member (member.id)}
						<button
							class="rounded-button border-base px-input py-input hover:bg-hover flex items-center justify-between border text-left"
							onclick={() => {
								console.log('Add member:', member);
								open = false;
							}}
						>
							<div class="flex flex-col">
								<span class="text-body text-primary">{member.name}</span>
								<span class="text-small text-secondary">{member.role}</span>
							</div>
							<Button variant="ghost" size="sm" onclick={() => console.log('Add:', member)}>
								Add
							</Button>
						</button>
					{/each}
				</div>
			</div>
		</StandardDialog>
	{/snippet}
</Story>

<Story name="Loading State" args={{ open: false, loading: true }}>
	{#snippet template(args)}
		{@const open = $state(false)}

		<Button onclick={() => (open = true)}>Submit Form (Loading)</Button>

		<StandardDialog
			bind:open
			title="Processing..."
			description="Your request is being processed."
			submitLabel="Submit"
			loading={args.loading}
			onsubmit={() => {
				console.log('Processing...');
			}}
		>
			<p class="text-body text-secondary">
				This dialog shows the loading state. The submit button has a spinner and is disabled.
			</p>
		</StandardDialog>
	{/snippet}
</Story>

<Story name="Disabled Submit" args={{ open: false, disabled: true }}>
	{#snippet template(args)}
		{@const open = $state(false)}

		<Button onclick={() => (open = true)}>Form with Validation</Button>

		<StandardDialog
			bind:open
			title="Create Account"
			description="Fill in all required fields to continue."
			submitLabel="Create"
			disabled={args.disabled}
			onsubmit={() => {
				console.log('Create account');
			}}
		>
			<p class="text-body text-secondary">
				The submit button is disabled until validation passes. In this example, it's permanently
				disabled for demonstration.
			</p>
		</StandardDialog>
	{/snippet}
</Story>

<Story name="No Close Button" args={{ open: false, closable: false }}>
	{#snippet template(_args)}
		{@const open = $state(false)}

		<Button onclick={() => (open = true)}>Required Action</Button>

		<StandardDialog
			bind:open
			title="Action Required"
			description="You must take action before continuing."
			submitLabel="Acknowledge"
			closable={false}
			onsubmit={() => {
				open = false;
			}}
		>
			<p class="text-body text-secondary">
				This dialog cannot be dismissed by clicking outside or pressing ESC. You must click the
				action button.
			</p>
		</StandardDialog>
	{/snippet}
</Story>
