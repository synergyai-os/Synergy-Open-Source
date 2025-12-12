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
				workspaceId?: string;
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
	<header class="border-sidebar py-system-content px-page border-b">
		<h1 class="text-primary text-2xl font-bold">
			{userDetails?.name || userDetails?.email || 'User'} - Role Assignment
		</h1>
		<p class="text-secondary mt-1 text-sm">Manage roles for this user</p>
	</header>

	<!-- Main Content -->
	<main class="py-system-content px-page flex-1 overflow-y-auto">
		{#if userDetails}
			<!-- Current Roles -->
			<section class="mb-8">
				<h2 class="text-primary mb-4 text-xl font-semibold">Current Roles</h2>
				{#if userDetails.roles.length > 0}
					<div class="space-y-2">
						{#each userDetails.roles as userRole (userRole.userRoleId)}
							<div
								class="border-sidebar bg-surface flex items-center justify-between rounded-lg border p-3"
							>
								<div>
									<p class="text-primary font-medium">{userRole.roleName}</p>
									<p class="text-tertiary text-xs">
										{userRole.workspaceId
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
					<p class="text-secondary text-sm">No roles assigned</p>
				{/if}
			</section>

			<!-- Assign New Role -->
			<section>
				<h2 class="text-primary mb-4 text-xl font-semibold">Assign New Role</h2>
				<div class="border-sidebar bg-surface rounded-lg border p-4">
					<p class="text-secondary mb-4 text-sm">
						Role assignment UI coming soon. For now, use Convex dashboard or API.
					</p>
					<p class="text-tertiary text-xs">
						Available roles: {allRoles.map((r) => r.name).join(', ')}
					</p>
				</div>
			</section>
		{/if}
	</main>
</div>
