<script lang="ts">
	import type { PageData } from './$types';

	type SystemStats = {
		users: { total: number; active: number; deleted: number };
		workspaces: { total: number };
		circles: { total: number };
		roles: { total: number; system: number; custom: number };
		permissions: { total: number; system: number; custom: number };
		roleAssignments: { total: number; active: number; revoked: number };
	};

	let { data }: { data: PageData } = $props();

	const stats = $derived((data.stats as SystemStats | null) ?? null);
</script>

<svelte:head>
	<title>Admin Dashboard - SynergyOS</title>
</svelte:head>

<div class="flex h-full flex-col">
	<!-- Header -->
	<header class="border-sidebar py-system-content px-page border-b">
		<h1 class="text-h2 text-primary font-bold">Admin Dashboard</h1>
		<p class="mt-form-field-gap text-small text-secondary">System administration and management</p>
	</header>

	<!-- Main Content -->
	<main class="py-system-content px-page flex-1 overflow-y-auto">
		{#if stats}
			<!-- System Statistics -->
			<div
				class="mb-content-padding gap-content-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
			>
				<div class="border-sidebar px-card py-card rounded-card bg-surface border">
					<p class="text-label text-tertiary">Total Users</p>
					<p class="mt-form-field-gap text-h2 text-primary font-semibold">{stats.users.total}</p>
					<p class="mt-form-field-gap text-label text-secondary">
						{stats.users.active} active, {stats.users.deleted} deleted
					</p>
				</div>

				<div class="border-sidebar px-card py-card rounded-card bg-surface border">
					<p class="text-label text-tertiary">Organizations</p>
					<p class="mt-form-field-gap text-h2 text-primary font-semibold">
						{stats.workspaces.total}
					</p>
				</div>

				<div class="border-sidebar px-card py-card rounded-card bg-surface border">
					<p class="text-label text-tertiary">Circles</p>
					<p class="mt-form-field-gap text-h2 text-primary font-semibold">{stats.circles.total}</p>
				</div>

				<div class="border-sidebar px-card py-card rounded-card bg-surface border">
					<p class="text-label text-tertiary">Role Assignments</p>
					<p class="mt-form-field-gap text-h2 text-primary font-semibold">
						{stats.roleAssignments.active}
					</p>
					<p class="mt-form-field-gap text-label text-secondary">
						{stats.roleAssignments.revoked} revoked
					</p>
				</div>
			</div>

			<!-- RBAC Statistics -->
			<div class="mb-content-padding gap-content-section grid grid-cols-1 md:grid-cols-2">
				<div class="border-sidebar px-card py-card rounded-card bg-surface border">
					<p class="text-label text-tertiary">Roles</p>
					<p class="mt-form-field-gap text-h2 text-primary font-semibold">{stats.roles.total}</p>
					<p class="mt-form-field-gap text-label text-secondary">
						{stats.roles.system} system, {stats.roles.custom} custom
					</p>
				</div>

				<div class="border-sidebar px-card py-card rounded-card bg-surface border">
					<p class="text-label text-tertiary">Permissions</p>
					<p class="mt-form-field-gap text-h2 text-primary font-semibold">
						{stats.permissions.total}
					</p>
					<p class="mt-form-field-gap text-label text-secondary">
						{stats.permissions.system} system, {stats.permissions.custom} custom
					</p>
				</div>
			</div>
		{/if}

		<!-- Quick Links -->
		<div class="gap-content-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
			<a
				href="/admin/rbac"
				class="border-sidebar px-card py-card hover:bg-hover-solid rounded-card bg-surface flex flex-col gap-2 border transition-colors"
			>
				<h3 class="text-primary font-semibold">RBAC Management</h3>
				<p class="text-small text-secondary">
					Manage roles, permissions, and user-role assignments
				</p>
			</a>

			<a
				href="/admin/users"
				class="border-sidebar px-card py-card hover:bg-hover-solid rounded-card bg-surface flex flex-col gap-2 border transition-colors"
			>
				<h3 class="text-primary font-semibold">User Management</h3>
				<p class="text-small text-secondary">View and manage all users</p>
			</a>

			<a
				href="/admin/feature-flags"
				class="border-sidebar px-card py-card hover:bg-hover-solid rounded-card bg-surface flex flex-col gap-2 border transition-colors"
			>
				<h3 class="text-primary font-semibold">Feature Flags</h3>
				<p class="text-small text-secondary">
					Manage feature flags for progressive rollouts and A/B testing
				</p>
			</a>

			<a
				href="/admin/settings"
				class="border-sidebar px-card py-card hover:bg-hover-solid rounded-card bg-surface flex flex-col gap-2 border transition-colors"
			>
				<h3 class="text-primary font-semibold">System Settings</h3>
				<p class="text-small text-secondary">Configure system-wide settings</p>
			</a>
		</div>
	</main>
</div>
