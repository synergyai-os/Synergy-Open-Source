<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const users = $derived(
		(data.users || []) as Array<{
			_id: string;
			email: string;
			name: string | null;
			createdAt: number;
			lastLoginAt: number | null;
		}>
	);
</script>

<svelte:head>
	<title>User Management - Admin - SynergyOS</title>
</svelte:head>

<div class="flex h-full flex-col">
	<!-- Header -->
	<header class="border-sidebar py-system-content border-b px-page">
		<h1 class="text-h2 font-bold text-primary">User Management</h1>
		<p class="mt-form-field-gap text-small text-secondary">View and manage all users</p>
	</header>

	<!-- Main Content -->
	<main class="py-system-content flex-1 overflow-y-auto px-page">
		<div class="overflow-x-auto">
			<table class="w-full border-collapse">
				<thead>
					<tr class="border-sidebar border-b">
						<th class="px-card py-form-field-gap text-small text-left font-semibold text-secondary"
							>Email</th
						>
						<th class="px-card py-form-field-gap text-small text-left font-semibold text-secondary"
							>Name</th
						>
						<th class="px-card py-form-field-gap text-small text-left font-semibold text-secondary"
							>Created</th
						>
						<th class="px-card py-form-field-gap text-small text-left font-semibold text-secondary"
							>Last Login</th
						>
						<th class="px-card py-form-field-gap text-small text-left font-semibold text-secondary"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody>
					{#each users as user (user._id)}
						<tr class="border-sidebar hover:bg-hover-solid border-b">
							<td class="px-card py-form-field-gap text-small text-primary">{user.email}</td>
							<td class="px-card py-form-field-gap text-small text-secondary">{user.name || '-'}</td
							>
							<td class="px-card py-form-field-gap text-label text-tertiary">
								{new Date(user.createdAt).toLocaleDateString()}
							</td>
							<td class="px-card py-form-field-gap text-label text-tertiary">
								{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
							</td>
							<td class="px-card py-form-field-gap">
								<a
									href="/admin/rbac/users/{user._id}"
									class="text-small text-primary hover:underline"
								>
									Manage Roles
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</main>
</div>
