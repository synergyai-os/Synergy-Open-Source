<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const settings = $derived(
		(data.settings || null) as {
			maintenanceMode: boolean;
			registrationEnabled: boolean;
			version: string;
		} | null
	);
</script>

<svelte:head>
	<title>System Settings - Admin - SynergyOS</title>
</svelte:head>

<div class="flex h-full flex-col">
	<!-- Header -->
	<header class="border-b border-sidebar px-inbox-container py-system-content">
		<h1 class="text-2xl font-bold text-primary">System Settings</h1>
		<p class="mt-1 text-sm text-secondary">Configure system-wide settings</p>
	</header>

	<!-- Main Content -->
	<main class="flex-1 overflow-y-auto px-inbox-container py-system-content">
		{#if settings}
			<div class="space-y-6">
				<div class="rounded-lg border border-sidebar bg-surface p-4">
					<h3 class="mb-4 text-lg font-semibold text-primary">System Information</h3>
					<dl class="space-y-2">
						<div class="flex justify-between">
							<dt class="text-secondary">Version</dt>
							<dd class="text-tertiary">{settings.version}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-secondary">Maintenance Mode</dt>
							<dd class="text-tertiary">{settings.maintenanceMode ? 'Enabled' : 'Disabled'}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-secondary">Registration</dt>
							<dd class="text-tertiary">
								{settings.registrationEnabled ? 'Enabled' : 'Disabled'}
							</dd>
						</div>
					</dl>
				</div>

				<div class="rounded-lg border border-sidebar bg-surface p-4">
					<p class="text-sm text-secondary">
						System settings management UI coming soon. For now, settings are managed via database.
					</p>
				</div>
			</div>
		{/if}
	</main>
</div>
