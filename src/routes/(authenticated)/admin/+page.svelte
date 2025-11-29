<script lang="ts">
	import type { PageData } from './$types';

	type SystemStats = {
		users: { total: number; active: number; deleted: number };
		workspaces: { total: number };
		teams: { total: number };
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
	<header class="border-sidebar py-system-content border-b px-page">
		<h1 class="text-h2 font-bold text-primary">Admin Dashboard</h1>
		<p class="mt-form-field-gap text-small text-secondary">System administration and management</p>
	</header>

	<!-- Main Content -->
	<main class="py-system-content flex-1 overflow-y-auto px-page">
		{#if stats}
			<!-- System Statistics -->
			<div
				class="mb-content-padding gap-content-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
			>
				<div class="border-sidebar px-card py-card rounded-card border bg-surface">
					<p class="text-label text-tertiary">Total Users</p>
					<p class="mt-form-field-gap text-h2 font-semibold text-primary">{stats.users.total}</p>
					<p class="mt-form-field-gap text-label text-secondary">
						{stats.users.active} active, {stats.users.deleted} deleted
					</p>
				</div>

				<div class="border-sidebar px-card py-card rounded-card border bg-surface">
					<p class="text-label text-tertiary">Organizations</p>
					<p class="mt-form-field-gap text-h2 font-semibold text-primary">
						{stats.workspaces.total}
					</p>
				</div>

				<div class="border-sidebar px-card py-card rounded-card border bg-surface">
					<p class="text-label text-tertiary">Teams</p>
					<p class="mt-form-field-gap text-h2 font-semibold text-primary">{stats.teams.total}</p>
				</div>

				<div class="border-sidebar px-card py-card rounded-card border bg-surface">
					<p class="text-label text-tertiary">Role Assignments</p>
					<p class="mt-form-field-gap text-h2 font-semibold text-primary">
						{stats.roleAssignments.active}
					</p>
					<p class="mt-form-field-gap text-label text-secondary">
						{stats.roleAssignments.revoked} revoked
					</p>
				</div>
			</div>

			<!-- RBAC Statistics -->
			<div class="mb-content-padding gap-content-section grid grid-cols-1 md:grid-cols-2">
				<div class="border-sidebar px-card py-card rounded-card border bg-surface">
					<p class="text-label text-tertiary">Roles</p>
					<p class="mt-form-field-gap text-h2 font-semibold text-primary">{stats.roles.total}</p>
					<p class="mt-form-field-gap text-label text-secondary">
						{stats.roles.system} system, {stats.roles.custom} custom
					</p>
				</div>

				<div class="border-sidebar px-card py-card rounded-card border bg-surface">
					<p class="text-label text-tertiary">Permissions</p>
					<p class="mt-form-field-gap text-h2 font-semibold text-primary">
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
				class="border-sidebar px-card py-card hover:bg-hover-solid flex flex-col gap-2 rounded-card border bg-surface transition-colors"
			>
				<h3 class="font-semibold text-primary">RBAC Management</h3>
				<p class="text-small text-secondary">
					Manage roles, permissions, and user-role assignments
				</p>
			</a>

			<a
				href="/admin/users"
				class="border-sidebar px-card py-card hover:bg-hover-solid flex flex-col gap-2 rounded-card border bg-surface transition-colors"
			>
				<h3 class="font-semibold text-primary">User Management</h3>
				<p class="text-small text-secondary">View and manage all users</p>
			</a>

			<a
				href="/admin/feature-flags"
				class="border-sidebar px-card py-card hover:bg-hover-solid flex flex-col gap-2 rounded-card border bg-surface transition-colors"
			>
				<h3 class="font-semibold text-primary">Feature Flags</h3>
				<p class="text-small text-secondary">
					Manage feature flags for progressive rollouts and A/B testing
				</p>
			</a>

			<a
				href="/admin/settings"
				class="border-sidebar px-card py-card hover:bg-hover-solid flex flex-col gap-2 rounded-card border bg-surface transition-colors"
			>
				<h3 class="font-semibold text-primary">System Settings</h3>
				<p class="text-small text-secondary">Configure system-wide settings</p>
			</a>
		</div>
	</main>
</div>
