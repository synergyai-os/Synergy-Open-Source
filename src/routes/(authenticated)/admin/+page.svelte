<script lang="ts">
	import type { PageData } from './$types';

	type SystemStats = {
		users: { total: number; active: number; deleted: number };
		organizations: { total: number };
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
	<header class="border-b border-sidebar px-inbox-container py-system-content">
		<h1 class="text-2xl font-bold text-primary">Admin Dashboard</h1>
		<p class="mt-1 text-sm text-secondary">System administration and management</p>
	</header>

	<!-- Main Content -->
	<main class="flex-1 overflow-y-auto px-inbox-container py-system-content">
		{#if stats}
			<!-- System Statistics -->
			<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div class="rounded-lg border border-sidebar bg-surface p-4">
					<p class="text-xs text-tertiary">Total Users</p>
					<p class="mt-1 text-2xl font-semibold text-primary">{stats.users.total}</p>
					<p class="mt-1 text-xs text-secondary">
						{stats.users.active} active, {stats.users.deleted} deleted
					</p>
				</div>

				<div class="rounded-lg border border-sidebar bg-surface p-4">
					<p class="text-xs text-tertiary">Organizations</p>
					<p class="mt-1 text-2xl font-semibold text-primary">{stats.organizations.total}</p>
				</div>

				<div class="rounded-lg border border-sidebar bg-surface p-4">
					<p class="text-xs text-tertiary">Teams</p>
					<p class="mt-1 text-2xl font-semibold text-primary">{stats.teams.total}</p>
				</div>

				<div class="rounded-lg border border-sidebar bg-surface p-4">
					<p class="text-xs text-tertiary">Role Assignments</p>
					<p class="mt-1 text-2xl font-semibold text-primary">{stats.roleAssignments.active}</p>
					<p class="mt-1 text-xs text-secondary">
						{stats.roleAssignments.revoked} revoked
					</p>
				</div>
			</div>

			<!-- RBAC Statistics -->
			<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="rounded-lg border border-sidebar bg-surface p-4">
					<p class="text-xs text-tertiary">Roles</p>
					<p class="mt-1 text-2xl font-semibold text-primary">{stats.roles.total}</p>
					<p class="mt-1 text-xs text-secondary">
						{stats.roles.system} system, {stats.roles.custom} custom
					</p>
				</div>

				<div class="rounded-lg border border-sidebar bg-surface p-4">
					<p class="text-xs text-tertiary">Permissions</p>
					<p class="mt-1 text-2xl font-semibold text-primary">{stats.permissions.total}</p>
					<p class="mt-1 text-xs text-secondary">
						{stats.permissions.system} system, {stats.permissions.custom} custom
					</p>
				</div>
			</div>
		{/if}

		<!-- Quick Links -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			<a
				href="/admin/rbac"
				class="flex flex-col gap-2 rounded-lg border border-sidebar bg-surface p-4 transition-colors hover:bg-hover-solid"
			>
				<h3 class="font-semibold text-primary">RBAC Management</h3>
				<p class="text-sm text-secondary">Manage roles, permissions, and user-role assignments</p>
			</a>

			<a
				href="/admin/users"
				class="flex flex-col gap-2 rounded-lg border border-sidebar bg-surface p-4 transition-colors hover:bg-hover-solid"
			>
				<h3 class="font-semibold text-primary">User Management</h3>
				<p class="text-sm text-secondary">View and manage all users</p>
			</a>

			<a
				href="/admin/feature-flags"
				class="flex flex-col gap-2 rounded-lg border border-sidebar bg-surface p-4 transition-colors hover:bg-hover-solid"
			>
				<h3 class="font-semibold text-primary">Feature Flags</h3>
				<p class="text-sm text-secondary">
					Manage feature flags for progressive rollouts and A/B testing
				</p>
			</a>

			<a
				href="/admin/settings"
				class="flex flex-col gap-2 rounded-lg border border-sidebar bg-surface p-4 transition-colors hover:bg-hover-solid"
			>
				<h3 class="font-semibold text-primary">System Settings</h3>
				<p class="text-sm text-secondary">Configure system-wide settings</p>
			</a>
		</div>
	</main>
</div>
