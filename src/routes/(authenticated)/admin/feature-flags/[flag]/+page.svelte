<script lang="ts">
	import type { PageData } from './$types';
	import { Badge, Button, FormTextarea, ToggleSwitch } from '$lib/components/ui';
	import { browser } from '$app/environment';
	import { getFlagDescription } from '$lib/featureFlags';
	import { api, type Id } from '$lib/convex';
	import { useConvexClient } from 'convex-svelte';

	let { data }: { data: PageData } = $props();

	type Flag = {
		_id: string;
		flag: string;
		description?: string | null;
		enabled: boolean;
		rolloutPercentage?: number;
		allowedUserIds?: string[];
		allowedOrganizationIds?: string[];
		allowedDomains?: string[];
		createdAt: number;
		updatedAt: number;
	};

	type Organization = {
		_id: Id<'organizations'>;
		name: string;
		slug: string;
		createdAt: number;
	};

	const flag = $derived((data.flag || null) as Flag | null);
	const organizations = $derived((data.organizations || []) as Organization[]);
	const sessionId = $derived(data.sessionId || '');
	const impactStats = $derived(data.impactStats || null);

	// Convex client setup
	const convexClient = browser ? useConvexClient() : null;

	// Form state - initialize reactively from flag
	let formDescription = $state('');
	let formEnabled = $state(false);
	let formRolloutPercentage = $state<number | undefined>(undefined);
	let formAllowedOrgIds = $state<string[]>([]);
	let formDomainInput = $state('');

	// Sync form state when flag changes
	$effect(() => {
		formDescription = flag?.description ?? '';
		formEnabled = flag?.enabled ?? false;
		formRolloutPercentage = flag?.rolloutPercentage;
		formAllowedOrgIds = flag?.allowedOrganizationIds ?? [];
		formDomainInput = (flag?.allowedDomains ?? []).join(', ');
	});

	// Organization selector state
	let orgSelectorOpen = $state(false);
	let orgSearchQuery = $state('');
	let orgSelectorTriggerRef: HTMLElement | null = $state(null);
	let orgSelectorDropdownRef: HTMLElement | null = $state(null);

	// Close dropdown when clicking outside
	$effect(() => {
		if (!browser || !orgSelectorOpen) return;

		function handleClickOutside(e: MouseEvent) {
			const target = e.target as HTMLElement;
			if (
				orgSelectorTriggerRef &&
				orgSelectorDropdownRef &&
				!orgSelectorTriggerRef.contains(target) &&
				!orgSelectorDropdownRef.contains(target)
			) {
				orgSelectorOpen = false;
			}
		}

		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	// Loading state
	let saving = $state(false);

	// Filter organizations by search
	const filteredOrganizations = $derived.by(() => {
		if (!orgSearchQuery.trim()) return organizations;
		const query = orgSearchQuery.toLowerCase();
		return organizations.filter(
			(org) => org.name.toLowerCase().includes(query) || org.slug.toLowerCase().includes(query)
		);
	});

	// Use filtered organizations (or all if no search)
	const orgsToDisplay = $derived(filteredOrganizations);

	// Get selected organization names
	const selectedOrgNames = $derived.by(() => {
		return formAllowedOrgIds
			.map((id) => orgsToDisplay.find((org) => org._id === id)?.name)
			.filter(Boolean) as string[];
	});

	// Toggle organization selection
	function toggleOrganization(orgId: Id<'organizations'>) {
		if (formAllowedOrgIds.includes(orgId)) {
			formAllowedOrgIds = formAllowedOrgIds.filter((id) => id !== orgId);
		} else {
			formAllowedOrgIds = [...formAllowedOrgIds, orgId];
		}
	}

	// Parse domain input
	function parseDomains(input: string): string[] {
		return input
			.split(',')
			.map((d) => d.trim())
			.filter((d) => d.length > 0);
	}

	// Save flag changes
	async function handleSave() {
		if (!convexClient || !sessionId || !flag) return;

		saving = true;
		const domains = parseDomains(formDomainInput);

		try {
			await convexClient.mutation(api.featureFlags.upsertFlag, {
				sessionId,
				flag: flag.flag,
				description: formDescription.trim() || undefined,
				enabled: formEnabled,
				rolloutPercentage: formRolloutPercentage,
				allowedUserIds: undefined, // Not editable in UI yet
				allowedOrganizationIds:
					formAllowedOrgIds.length > 0 ? (formAllowedOrgIds as Id<'organizations'>[]) : undefined,
				allowedDomains: domains.length > 0 ? domains : undefined
			});

			// Reload page to get updated data
			if (browser) {
				window.location.reload();
			}
		} catch (error) {
			console.error('Failed to save flag:', error);
			alert('Failed to save changes. Please try again.');
		} finally {
			saving = false;
		}
	}

	// Mock analytics data (until we have real data)
	const mockAnalytics = $derived({
		totalChecks: 1234,
		enabledChecks: 856,
		disabledChecks: 378,
		uniqueUsers: 234,
		avgResponseTime: 12,
		errorRate: 0.02,
		trend: [
			{ date: '2024-01-01', enabled: 120, disabled: 80 },
			{ date: '2024-01-02', enabled: 135, disabled: 75 },
			{ date: '2024-01-03', enabled: 150, disabled: 70 },
			{ date: '2024-01-04', enabled: 145, disabled: 65 },
			{ date: '2024-01-05', enabled: 160, disabled: 60 }
		]
	});

	// Get targeting summary
	function getTargetingSummary(flag: Flag): string {
		const parts: string[] = [];
		if (flag.allowedUserIds?.length) {
			parts.push(
				`${flag.allowedUserIds.length} user${flag.allowedUserIds.length !== 1 ? 's' : ''}`
			);
		}
		if (flag.allowedOrganizationIds?.length) {
			parts.push(
				`${flag.allowedOrganizationIds.length} org${flag.allowedOrganizationIds.length !== 1 ? 's' : ''}`
			);
		}
		if (flag.allowedDomains?.length) {
			parts.push(
				`${flag.allowedDomains.length} domain${flag.allowedDomains.length !== 1 ? 's' : ''}`
			);
		}
		if (flag.rolloutPercentage !== undefined) {
			parts.push(`${flag.rolloutPercentage}% rollout`);
		}
		return parts.length > 0 ? parts.join(', ') : 'No targeting';
	}
</script>

<svelte:head>
	<title>{flag?.flag || 'Feature Flag'} - Admin - SynergyOS</title>
</svelte:head>

{#if !flag}
	<div class="flex h-full flex-col items-center justify-center">
		<p class="mb-2 text-lg font-medium text-secondary">Flag not found</p>
		<a href="/admin/feature-flags" class="text-sm text-accent-primary hover:underline">
			← Back to Feature Flags
		</a>
	</div>
{:else}
	<div class="flex h-full flex-col overflow-hidden">
		<!-- Header -->
		<header
			class="flex h-system-header flex-shrink-0 items-center justify-between border-b border-base px-inbox-container py-system-header"
		>
			<div class="flex items-center gap-4">
				<a
					href="/admin/feature-flags"
					class="flex items-center text-secondary transition-colors hover:text-primary"
					aria-label="Back to Feature Flags"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</a>
				<div>
					<h1 class="text-2xl font-bold text-primary">{flag.flag}</h1>
					{#if getFlagDescription(flag.flag, flag.description)}
						<p class="mt-1 text-sm text-secondary">
							{getFlagDescription(flag.flag, flag.description)}
						</p>
					{/if}
				</div>
			</div>
			<div class="flex items-center gap-2">
				<Badge variant={flag.enabled ? 'default' : 'system'}>
					{flag.enabled ? 'Enabled' : 'Disabled'}
				</Badge>
			</div>
		</header>

		<!-- Main Content -->
		<main class="flex-1 overflow-y-auto px-inbox-container py-system-content">
			<div class="mx-auto max-w-4xl">
				<!-- Card Grid Layout -->
				<div class="flex flex-col gap-6">
					<!-- Overview Stats Card -->
					<div class="rounded-lg border border-base bg-surface p-content-padding">
						<h2 class="mb-4 text-lg font-semibold text-primary">Overview</h2>
						<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
							<div>
								<p class="text-xs text-tertiary">Current Targeting</p>
								<p class="mt-1 text-lg font-semibold text-primary">{getTargetingSummary(flag)}</p>
							</div>
							{#if impactStats}
								{@const impact = impactStats as { estimatedAffected: number; breakdown: unknown }}
								<div>
									<p class="text-xs text-tertiary">Estimated Affected</p>
									<p class="mt-1 text-lg font-semibold text-primary">
										~{impact.estimatedAffected.toLocaleString()} users
									</p>
								</div>
							{/if}
							<div>
								<p class="text-xs text-tertiary">Created</p>
								<p class="mt-1 text-sm font-medium text-primary">
									{new Date(flag.createdAt).toLocaleDateString()}
								</p>
							</div>
							<div>
								<p class="text-xs text-tertiary">Last Updated</p>
								<p class="mt-1 text-sm font-medium text-primary">
									{new Date(flag.updatedAt).toLocaleDateString()}
								</p>
							</div>
						</div>
					</div>

					<!-- Description Card -->
					<div class="rounded-lg border border-base bg-surface p-content-padding">
						<h2 class="mb-4 text-lg font-semibold text-primary">Description</h2>
						<FormTextarea
							label="Description"
							placeholder="Describe what this flag controls..."
							bind:value={formDescription}
							rows={3}
						/>
					</div>

					<!-- Global Toggle Card -->
					<div class="rounded-lg border border-base bg-surface p-content-padding">
						<h2 class="mb-4 text-lg font-semibold text-primary">Status</h2>
						<ToggleSwitch
							checked={formEnabled}
							onChange={(checked) => {
								formEnabled = checked;
							}}
							label="Globally Enabled"
						/>
						<p class="mt-2 text-xs text-secondary">
							When enabled, the flag is active. Configure targeting rules below to control who sees
							it.
						</p>
					</div>

					<!-- Organization Targeting Card -->
					<div class="rounded-lg border border-base bg-surface p-content-padding">
						<h2 class="mb-2 text-lg font-semibold text-primary">Organization Targeting</h2>
						<p class="mb-4 text-xs text-secondary">
							Select which organizations (workspaces) can access this feature flag.
						</p>

						<!-- Selected Organizations Display -->
						{#if selectedOrgNames.length > 0}
							<div class="mb-4 flex flex-wrap gap-2">
								{#each selectedOrgNames as orgName (orgName)}
									<span
										class="inline-flex items-center gap-1 rounded-md bg-accent-primary/10 px-2 py-1 text-xs text-accent-primary"
									>
										{orgName}
										<button
											type="button"
											onclick={() => {
												const org = organizations.find((o) => o.name === orgName);
												if (org) toggleOrganization(org._id);
											}}
											class="hover:text-accent-primary/80"
											aria-label="Remove {orgName}"
										>
											<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</span>
								{/each}
							</div>
						{/if}

						<!-- Organization Selector -->
						<div class="relative">
							<button
								type="button"
								bind:this={orgSelectorTriggerRef}
								onclick={() => {
									orgSelectorOpen = !orgSelectorOpen;
								}}
								class="flex w-full items-center justify-between rounded-input border border-base bg-input px-input-x py-input-y text-sm text-primary transition-colors hover:bg-hover-solid"
							>
								<span class="text-secondary">
									{selectedOrgNames.length > 0
										? `${selectedOrgNames.length} organization${selectedOrgNames.length !== 1 ? 's' : ''} selected`
										: 'Select organizations...'}
								</span>
								<svg
									class="h-4 w-4 text-tertiary transition-transform {orgSelectorOpen
										? 'rotate-180'
										: ''}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</button>
							{#if orgSelectorOpen}
								<div
									bind:this={orgSelectorDropdownRef}
									class="absolute top-full z-50 mt-1 max-h-[300px] min-w-full overflow-y-auto rounded-md border border-base bg-elevated py-1 shadow-lg"
									role="menu"
									tabindex="-1"
									onclick={(e) => e.stopPropagation()}
									onkeydown={(e) => e.stopPropagation()}
								>
									<div class="border-b border-base px-menu-item py-menu-item">
										<input
											type="text"
											bind:value={orgSearchQuery}
											placeholder="Search organizations..."
											class="w-full bg-transparent text-sm text-primary placeholder:text-tertiary focus:outline-none"
											onclick={(e) => e.stopPropagation()}
											onkeydown={(e) => {
												e.stopPropagation();
												// Allow Escape to close
												if (e.key === 'Escape') {
													orgSelectorOpen = false;
												}
											}}
										/>
									</div>
									<div class="px-menu-item py-menu-item text-sm font-semibold text-primary">
										Select Organizations ({orgsToDisplay.length} available)
									</div>
									{#each orgsToDisplay as org (org._id)}
										{@const isSelected = formAllowedOrgIds.includes(org._id)}
										<button
											type="button"
											onclick={(e) => {
												e.stopPropagation();
												if (formAllowedOrgIds.includes(org._id)) {
													formAllowedOrgIds = formAllowedOrgIds.filter((id) => id !== org._id);
												} else {
													formAllowedOrgIds = [...formAllowedOrgIds, org._id];
												}
												// Keep dropdown open after selection
											}}
											class="flex w-full cursor-pointer items-center gap-2 px-menu-item py-menu-item text-left text-sm transition-colors outline-none hover:bg-hover-solid focus:bg-hover-solid {isSelected
												? 'bg-accent-primary/10 text-accent-primary'
												: 'text-primary'}"
										>
											<svg
												class="h-4 w-4 flex-shrink-0 {isSelected ? 'opacity-100' : 'opacity-0'}"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M5 13l4 4L19 7"
												/>
											</svg>
											<span class="flex-1">{org.name}</span>
											<span class="text-xs text-tertiary">{org.slug}</span>
										</button>
									{/each}
								</div>
							{/if}
						</div>
						<p class="mt-3 text-xs text-secondary">
							💡 <strong>Tip:</strong> All members of selected organizations will have access to this
							feature flag.
						</p>
					</div>

					<!-- Email Domain Targeting Card -->
					<div class="rounded-lg border border-base bg-surface p-content-padding">
						<h2 class="mb-2 text-lg font-semibold text-primary">Email Domain Targeting</h2>
						<p class="mb-4 text-xs text-secondary">
							Users with email addresses matching these domains will see the feature.
						</p>
						<input
							id="domain-input"
							type="text"
							bind:value={formDomainInput}
							placeholder="@acme.com, @example.com"
							class="w-full rounded-input border border-base bg-input px-input-x py-input-y text-sm text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
						/>
					</div>

					<!-- Percentage Rollout Card -->
					<div class="rounded-lg border border-base bg-surface p-content-padding">
						<h2 class="mb-2 text-lg font-semibold text-primary">Percentage Rollout</h2>
						<p class="mb-4 text-xs text-secondary">
							Shows the feature to a percentage of users based on a consistent hash.
						</p>
						<div class="flex items-center gap-2">
							<input
								id="rollout-range"
								type="range"
								min="0"
								max="100"
								bind:value={formRolloutPercentage}
								class="flex-1"
							/>
							<input
								id="rollout-number"
								type="number"
								min="0"
								max="100"
								bind:value={formRolloutPercentage}
								placeholder="0"
								class="w-20 rounded-input border border-base bg-input px-input-x py-input-y text-sm text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
							/>
							<span class="text-sm text-secondary">%</span>
						</div>
					</div>

					<!-- Analytics Card -->
					<div class="rounded-lg border border-base bg-surface p-content-padding">
						<h2 class="mb-2 text-lg font-semibold text-primary">Analytics</h2>
						<p class="mb-4 text-xs text-secondary">Usage statistics and performance metrics.</p>

						<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
							<div>
								<p class="text-xs text-tertiary">Total Checks</p>
								<p class="mt-1 text-lg font-semibold text-primary">
									{mockAnalytics.totalChecks.toLocaleString()}
								</p>
								<p class="mt-1 text-xs text-tertiary">Last 7 days</p>
							</div>
							<div>
								<p class="text-xs text-tertiary">Enabled Rate</p>
								<p class="mt-1 text-lg font-semibold text-primary">
									{Math.round((mockAnalytics.enabledChecks / mockAnalytics.totalChecks) * 100)}%
								</p>
								<p class="mt-1 text-xs text-tertiary">
									{mockAnalytics.enabledChecks.toLocaleString()} enabled
								</p>
							</div>
							<div>
								<p class="text-xs text-tertiary">Unique Users</p>
								<p class="mt-1 text-lg font-semibold text-primary">
									{mockAnalytics.uniqueUsers.toLocaleString()}
								</p>
								<p class="mt-1 text-xs text-tertiary">With access</p>
							</div>
							<div>
								<p class="text-xs text-tertiary">Avg Response Time</p>
								<p class="mt-1 text-lg font-semibold text-primary">
									{mockAnalytics.avgResponseTime}ms
								</p>
								<p class="mt-1 text-xs text-tertiary">Evaluation time</p>
							</div>
						</div>

						<!-- Mock Trend Chart -->
						<div class="mt-6 rounded-md border border-base bg-elevated p-4">
							<p class="mb-3 text-sm font-medium text-primary">Usage Trend</p>
							<div class="flex h-24 items-end justify-between gap-1">
								{#each mockAnalytics.trend as day (day.date)}
									{@const maxValue = Math.max(
										...mockAnalytics.trend.map((d) => d.enabled + d.disabled)
									)}
									{@const enabledHeight = (day.enabled / maxValue) * 100}
									{@const disabledHeight = (day.disabled / maxValue) * 100}
									<div class="flex flex-1 flex-col items-center gap-1">
										<div class="flex w-full items-end gap-0.5" style="height: 80px;">
											<div
												class="w-full rounded-t bg-accent-primary/60"
												style="height: {enabledHeight}%"
											></div>
											<div class="w-full rounded-t bg-base" style="height: {disabledHeight}%"></div>
										</div>
										<p class="text-[10px] text-tertiary">
											{new Date(day.date).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric'
											})}
										</p>
									</div>
								{/each}
							</div>
							<div class="mt-3 flex items-center gap-3 text-xs text-secondary">
								<div class="flex items-center gap-1.5">
									<div class="h-2 w-2 rounded bg-accent-primary/60"></div>
									<span>Enabled</span>
								</div>
								<div class="flex items-center gap-1.5">
									<div class="h-2 w-2 rounded bg-base"></div>
									<span>Disabled</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Save Button Card -->
					<div class="rounded-lg border border-base bg-surface p-content-padding">
						<div class="flex items-center justify-end gap-2">
							<Button variant="primary" onclick={handleSave} disabled={saving}>
								{saving ? 'Saving...' : 'Save Changes'}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
{/if}
