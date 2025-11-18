<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import type { PageData } from './$types';
	import { browser } from '$app/environment';

	let { data }: { data: PageData } = $props();

	const convexClient = browser ? useConvexClient() : null;
	const getSessionId = () => data.sessionId;

	const userDetails = $derived(
		(data.userDetails || null) as {
			_id: string;
			email: string;
			name: string | null;
			roles: Array<{
				userRoleId: string;
				roleId: string;
				roleSlug: string;
				roleName: string;
				organizationId?: string;
				teamId?: string;
			}>;
		} | null
	);

	const allRoles = $derived(
		(data.allRoles || []) as Array<{
			_id: string;
			slug: string;
			name: string;
		}>
	);
</script>

<svelte:head>
	<title>User Role Assignment - Admin - SynergyOS</title>
</svelte:head>

<div class="flex h-full flex-col">
	<!-- Header -->
	<header class="border-b border-sidebar px-inbox-container py-system-content">
		<h1 class="text-2xl font-bold text-primary">
			{userDetails?.name || userDetails?.email || 'User'} - Role Assignment
		</h1>
		<p class="mt-1 text-sm text-secondary">Manage roles for this user</p>
	</header>

	<!-- Main Content -->
	<main class="flex-1 overflow-y-auto px-inbox-container py-system-content">
		{#if userDetails}
			<!-- Current Roles -->
			<section class="mb-8">
				<h2 class="mb-4 text-xl font-semibold text-primary">Current Roles</h2>
				{#if userDetails.roles.length > 0}
					<div class="space-y-2">
						{#each userDetails.roles as userRole (userRole.userRoleId)}
							<div
								class="flex items-center justify-between rounded-lg border border-sidebar bg-surface p-3"
							>
								<div>
									<p class="font-medium text-primary">{userRole.roleName}</p>
									<p class="text-xs text-tertiary">
										{userRole.organizationId
											? 'Organization-scoped'
											: userRole.teamId
												? 'Team-scoped'
												: 'Global'}
									</p>
								</div>
								<button
									class="rounded bg-red-100 px-3 py-1 text-sm text-red-800 hover:bg-red-200"
									onclick={async () => {
										if (!convexClient || !getSessionId()) return;
										try {
											await convexClient.mutation(api.admin.rbac.revokeUserRole, {
												sessionId: getSessionId()!,
												userRoleId: userRole.userRoleId as Id<'userRoles'>
											});
											// Reload page to refresh data
											window.location.reload();
										} catch (error) {
											console.error('Failed to revoke role:', error);
											alert('Failed to revoke role');
										}
									}}
								>
									Revoke
								</button>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-secondary">No roles assigned</p>
				{/if}
			</section>

			<!-- Assign New Role -->
			<section>
				<h2 class="mb-4 text-xl font-semibold text-primary">Assign New Role</h2>
				<div class="rounded-lg border border-sidebar bg-surface p-4">
					<p class="mb-4 text-sm text-secondary">
						Role assignment UI coming soon. For now, use Convex dashboard or API.
					</p>
					<p class="text-xs text-tertiary">
						Available roles: {allRoles.map((r) => r.name).join(', ')}
					</p>
				</div>
			</section>
		{/if}
	</main>
</div>
