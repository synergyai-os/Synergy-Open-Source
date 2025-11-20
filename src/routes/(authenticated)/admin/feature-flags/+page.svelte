<script lang="ts">
	import type { PageData } from './$types';
	import { Badge, Tabs, Button, FormInput, FormTextarea, ToggleSwitch } from '$lib/components/ui';
	import { browser } from '$app/environment';
	import { Dialog } from 'bits-ui';
	import { FeatureFlags, getFlagDescription } from '$lib/infrastructure/feature-flags';
	import { api, type Id } from '$lib/convex';
	import { useConvexClient } from 'convex-svelte';
	import { SvelteSet } from 'svelte/reactivity';

	let { data }: { data: PageData } = $props();

	// Tab state
	let activeTab = $state('flags');

	// Search and filter state
	let searchQuery = $state('');
	let statusFilter = $state<'all' | 'enabled' | 'disabled' | 'targeting' | 'no-targeting'>('all');

	// Modal state
	let createModalOpen = $state(false);
	let editModalOpen = $state(false);

	// Form state
	let formFlag = $state('');
	let formDescription = $state('');
	let formEnabled = $state(false);
	let formRolloutPercentage = $state<number | undefined>(undefined);
	let formAllowedUserIds = $state<string[]>([]);
	let formAllowedOrgIds = $state<string[]>([]);
	let formDomainInput = $state('');

	// Debug state
	let debugFlagSelect = $state('');
	let debugResult: DebugResult | null = $state(null);
	let debugLoading = $state(false);

	// Impact state
	let impactStats: ImpactStats | null = $state(null);
	let impactLoading = $state(false);
	let userSearchQuery = $state('');
	let userSearchResult: UserFlagsResult | null = $state(null);
	let userSearchLoading = $state(false);
	// eslint-disable-next-line svelte/no-unnecessary-state-wrap
	let expandedFlags = $state(new SvelteSet<string>());

	// Guidance card state
	let guidanceDismissed = $state(false);
	if (browser) {
		guidanceDismissed = localStorage.getItem('feature-flags-guidance-dismissed') === 'true';
	}

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

	type DebugResult = {
		flag: string;
		userId: string;
		userEmail: string | null;
		flagExists: boolean;
		result: boolean;
		reason: string;
		flagConfig?: {
			enabled: boolean;
			allowedUserIds?: string[];
			allowedOrganizationIds?: string[];
			allowedDomains?: string[];
			rolloutPercentage?: number;
		};
	};

	type ImpactStats = {
		totalUsers: number;
		usersByDomain: Record<string, number>;
		flagImpacts: Array<{
			flag: string;
			enabled: boolean;
			estimatedAffected: number;
			breakdown: {
				byDomain: number;
				byRollout: number;
				byUserIds: number;
				byOrgIds: number;
			};
		}>;
	};

	type UserFlagsResult = {
		userEmail: string;
		userId: string | null;
		flags: Array<{
			flag: string;
			enabled: boolean;
			result: boolean;
			reason: string;
		}>;
	};

	const flags = $derived((data.flags || []) as Flag[]);
	const sessionId = $derived(data.sessionId || '');

	// Convex client setup
	const convexClient = browser ? useConvexClient() : null;

	// Load impact stats when Impact tab is active
	$effect(() => {
		if (browser && activeTab === 'impact' && !impactStats && !impactLoading && sessionId) {
			impactLoading = true;
			convexClient
				?.query(api.featureFlags.getImpactStats, { sessionId })
				.then((stats) => {
					impactStats = stats as ImpactStats;
				})
				.catch((error) => {
					console.error('Failed to load impact stats:', error);
				})
				.finally(() => {
					impactLoading = false;
				});
		}
	});

	// Toggle flag expansion
	function toggleFlagExpansion(flagName: string) {
		const newSet = new SvelteSet(expandedFlags);
		if (newSet.has(flagName)) {
			newSet.delete(flagName);
		} else {
			newSet.add(flagName);
		}
		expandedFlags = newSet;
	}

	// Search for user flags
	async function handleUserSearch() {
		if (!userSearchQuery.trim() || !sessionId) return;

		userSearchLoading = true;
		try {
			const result = await convexClient?.query(api.featureFlags.getFlagsForUser, {
				sessionId,
				userEmail: userSearchQuery.trim()
			});
			userSearchResult = result as UserFlagsResult;
		} catch (error) {
			console.error('Failed to search user flags:', error);
			userSearchResult = null;
		} finally {
			userSearchLoading = false;
		}
	}

	// Get impact breakdown for a flag
	function getFlagImpact(flagName: string) {
		if (!impactStats) return null;
		return impactStats.flagImpacts.find((impact) => impact.flag === flagName);
	}

	// Computed stats
	const totalFlags = $derived(flags.length);
	const enabledFlags = $derived(flags.filter((f) => f.enabled).length);
	const flagsWithTargeting = $derived(
		flags.filter(
			(f) =>
				(f.allowedUserIds?.length ?? 0) > 0 ||
				(f.allowedOrganizationIds?.length ?? 0) > 0 ||
				(f.allowedDomains?.length ?? 0) > 0 ||
				f.rolloutPercentage !== undefined
		).length
	);

	// Filtered flags
	const filteredFlags = $derived.by(() => {
		let result = flags;

		// Apply search filter
		if (searchQuery.trim()) {
			const searchLower = searchQuery.toLowerCase();
			result = result.filter((flag) => flag.flag.toLowerCase().includes(searchLower));
		}

		// Apply status filter
		if (statusFilter === 'enabled') {
			result = result.filter((flag) => flag.enabled);
		} else if (statusFilter === 'disabled') {
			result = result.filter((flag) => !flag.enabled);
		} else if (statusFilter === 'targeting') {
			result = result.filter(
				(flag) =>
					(flag.allowedUserIds?.length ?? 0) > 0 ||
					(flag.allowedOrganizationIds?.length ?? 0) > 0 ||
					(flag.allowedDomains?.length ?? 0) > 0 ||
					flag.rolloutPercentage !== undefined
			);
		} else if (statusFilter === 'no-targeting') {
			result = result.filter(
				(flag) =>
					(flag.allowedUserIds?.length ?? 0) === 0 &&
					(flag.allowedOrganizationIds?.length ?? 0) === 0 &&
					(flag.allowedDomains?.length ?? 0) === 0 &&
					flag.rolloutPercentage === undefined
			);
		}

		return result;
	});

	// Get targeting summary for a flag
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

	// Toggle flag enabled/disabled
	async function handleToggleFlag(flag: Flag, enabled: boolean) {
		if (!convexClient || !sessionId) return;

		try {
			await convexClient.mutation(api.featureFlags.toggleFlag, {
				sessionId,
				flag: flag.flag,
				enabled
			});
			// Optimistic update - reload flags
			if (browser) {
				window.location.reload();
			}
		} catch (error) {
			console.error('Failed to toggle flag:', error);
			alert('Failed to toggle flag. Please try again.');
		}
	}

	// Open create modal
	function openCreateModal() {
		formFlag = '';
		formDescription = '';
		formEnabled = false;
		formRolloutPercentage = undefined;
		formAllowedUserIds = [];
		formAllowedOrgIds = [];
		formDomainInput = '';
		createModalOpen = true;
	}

	// Open edit modal
	function openEditModal(flag: Flag) {
		formFlag = flag.flag;
		formDescription = flag.description ?? '';
		formEnabled = flag.enabled;
		formRolloutPercentage = flag.rolloutPercentage;
		formAllowedUserIds = flag.allowedUserIds ?? [];
		formAllowedOrgIds = flag.allowedOrganizationIds ?? [];
		formDomainInput = (flag.allowedDomains ?? []).join(', ');
		editModalOpen = true;
	}

	// Parse domain input
	function parseDomains(input: string): string[] {
		return input
			.split(',')
			.map((d) => d.trim())
			.filter((d) => d.length > 0);
	}

	// Save flag (create or update)
	async function handleSaveFlag() {
		if (!convexClient || !sessionId) return;

		const domains = parseDomains(formDomainInput);

		try {
			await convexClient.mutation(api.featureFlags.upsertFlag, {
				sessionId,
				flag: formFlag,
				description: formDescription.trim() || undefined,
				enabled: formEnabled,
				rolloutPercentage: formRolloutPercentage,
				allowedUserIds:
					formAllowedUserIds.length > 0 ? (formAllowedUserIds as Id<'users'>[]) : undefined,
				allowedOrganizationIds:
					formAllowedOrgIds.length > 0 ? (formAllowedOrgIds as Id<'organizations'>[]) : undefined,
				allowedDomains: domains.length > 0 ? domains : undefined
			});

			createModalOpen = false;
			editModalOpen = false;

			// Reload flags
			if (browser) {
				window.location.reload();
			}
		} catch (error) {
			console.error('Failed to save flag:', error);
			alert('Failed to save flag. Please try again.');
		}
	}

	// Delete flag
	async function handleDeleteFlag(flag: Flag) {
		if (!convexClient || !sessionId) return;
		if (!confirm(`Are you sure you want to delete the flag "${flag.flag}"?`)) return;

		try {
			await convexClient.mutation(api.featureFlags.deleteFlag, {
				sessionId,
				flag: flag.flag
			});

			// Reload flags
			if (browser) {
				window.location.reload();
			}
		} catch (error) {
			console.error('Failed to delete flag:', error);
			alert('Failed to delete flag. Please try again.');
		}
	}

	// Debug flag evaluation
	async function handleDebugEvaluation() {
		if (!convexClient || !sessionId || !debugFlagSelect) return;

		debugLoading = true;
		debugResult = null;

		try {
			// Note: debugFlagEvaluation uses the current user's sessionId
			// For evaluating other users, we'd need a separate admin debug endpoint
			const result = await convexClient.query(api.featureFlags.debugFlagEvaluation, {
				sessionId,
				flag: debugFlagSelect
			});
			debugResult = result;
		} catch (error) {
			console.error('Failed to debug flag:', error);
			alert('Failed to evaluate flag. Please try again.');
		} finally {
			debugLoading = false;
		}
	}

	function dismissGuidance() {
		guidanceDismissed = true;
		if (browser) {
			localStorage.setItem('feature-flags-guidance-dismissed', 'true');
		}
	}

	// Get available flag names from constants
	const availableFlagNames = $derived(Object.values(FeatureFlags) as string[]);
</script>

<svelte:head>
	<title>Feature Flags - Admin - SynergyOS</title>
</svelte:head>

<div class="flex h-full flex-col">
	<!-- Header -->
	<header
		class="flex h-system-header flex-shrink-0 items-center justify-between border-b border-base px-inbox-container py-system-header"
	>
		<div>
			<h1 class="text-2xl font-bold text-primary">Feature Flags</h1>
			<p class="mt-1 text-sm text-secondary">
				Manage feature flags for progressive rollouts and A/B testing
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="primary" onclick={openCreateModal}>Create Flag</Button>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1 overflow-y-auto px-inbox-container py-system-content">
		<!-- Overview Cards -->
		<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
			<button
				type="button"
				onclick={() => {
					activeTab = 'flags';
					statusFilter = 'all';
				}}
				class="rounded-lg border border-base bg-surface p-4 text-left transition-colors hover:bg-hover-solid"
			>
				<p class="text-xs text-tertiary">Total Flags</p>
				<p class="mt-1 text-2xl font-semibold text-primary">{totalFlags}</p>
			</button>

			<button
				type="button"
				onclick={() => {
					activeTab = 'flags';
					statusFilter = 'enabled';
				}}
				class="rounded-lg border border-base bg-surface p-4 text-left transition-colors hover:bg-hover-solid"
			>
				<p class="text-xs text-tertiary">Enabled Flags</p>
				<p class="mt-1 text-2xl font-semibold text-primary">{enabledFlags}</p>
				<p class="mt-1 text-xs text-secondary">
					{totalFlags > 0 ? Math.round((enabledFlags / totalFlags) * 100) : 0}% of total
				</p>
			</button>

			<button
				type="button"
				onclick={() => {
					activeTab = 'flags';
					statusFilter = 'targeting';
				}}
				class="rounded-lg border border-base bg-surface p-4 text-left transition-colors hover:bg-hover-solid"
			>
				<p class="text-xs text-tertiary">Flags with Targeting</p>
				<p class="mt-1 text-2xl font-semibold text-primary">{flagsWithTargeting}</p>
			</button>
		</div>

		<!-- Guidance Card -->
		{#if !guidanceDismissed}
			<div class="mb-6 rounded-lg border border-accent-primary/20 bg-accent-primary/5 p-4">
				<div class="flex items-start justify-between gap-4">
					<div class="flex-1">
						<h3 class="mb-2 text-sm font-semibold text-primary">What are Feature Flags?</h3>
						<p class="mb-2 text-sm text-secondary">
							Feature flags allow you to control feature visibility without deploying new code. Use
							them for progressive rollouts, A/B testing, and emergency rollbacks.
						</p>
						<div class="text-sm text-secondary">
							<p class="mb-1 font-medium">Quick Start:</p>
							<ol class="ml-4 list-decimal space-y-1">
								<li>
									<strong>Create a flag:</strong> Click "Create Flag" → Enter flag name → Enable it →
									Set targeting rules
								</li>
								<li>
									<strong>Target users:</strong> Use domain targeting (e.g., @acme.com) or percentage
									rollout (e.g., 25%)
								</li>
								<li>
									<strong>Test it:</strong> Use the Debug tab to see how flags evaluate for your account
								</li>
							</ol>
						</div>
					</div>
					<button
						type="button"
						onclick={dismissGuidance}
						class="flex-shrink-0 text-tertiary hover:text-primary"
						aria-label="Dismiss guidance"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			</div>
		{/if}

		<!-- Tabs -->
		<Tabs
			tabs={[
				{ value: 'flags', label: `Flags (${flags.length})` },
				{ value: 'impact', label: 'Impact' },
				{ value: 'debug', label: 'Debug' }
			]}
			bind:value={activeTab}
		>
			{#snippet children(tabValue)}
				{#if tabValue === 'flags'}
					<!-- Flags Tab -->
					<div class="flex flex-col gap-6">
						<!-- Search and Filter Bar -->
						<div class="flex items-center gap-2">
							<div class="flex-1">
								<FormInput
									placeholder="Search flags by name..."
									bind:value={searchQuery}
									class="w-full"
								/>
							</div>
							<select
								bind:value={statusFilter}
								class="rounded-input border border-base bg-input px-input-x py-input-y text-sm text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
							>
								<option value="all">All Status</option>
								<option value="enabled">Enabled</option>
								<option value="disabled">Disabled</option>
								<option value="targeting">With Targeting</option>
								<option value="no-targeting">No Targeting</option>
							</select>
						</div>

						<!-- Flags Display -->
						{#if filteredFlags.length === 0}
							<div class="flex flex-col items-center justify-center py-12 text-center">
								<p class="mb-2 text-lg font-medium text-secondary">
									{searchQuery.trim() || statusFilter !== 'all'
										? 'No flags match your filters'
										: 'No flags yet'}
								</p>
								<p class="text-sm text-tertiary">
									{searchQuery.trim() || statusFilter !== 'all'
										? 'Try adjusting your search or filter criteria'
										: 'Create your first flag to get started'}
								</p>
							</div>
						{:else}
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
								{#each filteredFlags as flag (flag._id)}
									<div
										class="group flex flex-col gap-3 rounded-lg border border-base bg-surface p-4 transition-colors hover:border-accent-primary hover:bg-hover-solid"
									>
										<div class="flex items-start justify-between">
											<div class="flex-1">
												<h3 class="font-semibold text-primary">{flag.flag}</h3>
												<p class="mt-1 font-mono text-xs text-tertiary">{flag.flag}</p>
												{#if getFlagDescription(flag.flag, flag.description)}
													<p class="mt-2 text-sm text-secondary">
														{getFlagDescription(flag.flag, flag.description)}
													</p>
												{/if}
											</div>
											<Badge variant={flag.enabled ? 'default' : 'system'}>
												{flag.enabled ? 'Enabled' : 'Disabled'}
											</Badge>
										</div>
										<div class="space-y-1">
											<p class="text-sm text-secondary">
												<strong>Targeting:</strong>
												{getTargetingSummary(flag)}
											</p>
											{#if flag.enabled && getTargetingSummary(flag) === 'No targeting'}
												<p class="text-xs text-tertiary">
													⚠️ Enabled but no targeting rules - flag will be disabled for all users
												</p>
											{/if}
										</div>
										<div class="flex items-center justify-between">
											<ToggleSwitch
												checked={flag.enabled}
												onChange={(checked) => handleToggleFlag(flag, checked)}
												label=""
											/>
											<div class="flex items-center gap-2">
												<a
													href={`/admin/feature-flags/${flag.flag}`}
													class="text-xs text-accent-primary hover:underline"
												>
													View Details
												</a>
												<button
													type="button"
													onclick={() => openEditModal(flag)}
													class="text-xs text-accent-primary hover:underline"
												>
													Quick Edit
												</button>
												<button
													type="button"
													onclick={() => handleDeleteFlag(flag)}
													class="hover:text-destructive text-xs text-secondary hover:underline"
												>
													Delete
												</button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{:else if tabValue === 'impact'}
					<!-- Impact Tab -->
					<div class="flex flex-col gap-6">
						{#if impactLoading}
							<div class="flex flex-col items-center justify-center py-12 text-center">
								<p class="mb-2 text-lg font-medium text-secondary">Loading impact statistics...</p>
							</div>
						{:else if !impactStats}
							<div class="flex flex-col items-center justify-center py-12 text-center">
								<p class="mb-2 text-lg font-medium text-secondary">No impact data available</p>
							</div>
						{:else}
							<!-- Overview Statistics -->
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
								<div class="rounded-lg border border-base bg-surface p-4">
									<p class="text-xs text-tertiary">Total Users</p>
									<p class="mt-1 text-2xl font-semibold text-primary">
										{impactStats.totalUsers.toLocaleString()}
									</p>
									<p class="mt-1 text-xs text-secondary">System-wide user count</p>
								</div>

								<div class="rounded-lg border border-base bg-surface p-4">
									<p class="text-xs text-tertiary">Flags with Impact</p>
									<p class="mt-1 text-2xl font-semibold text-primary">
										{impactStats.flagImpacts.filter((f) => f.enabled && f.estimatedAffected > 0)
											.length}
									</p>
									<p class="mt-1 text-xs text-secondary">
										{flags.length} total flags
									</p>
								</div>

								<div class="rounded-lg border border-base bg-surface p-4">
									<p class="text-xs text-tertiary">Total Affected Users</p>
									<p class="mt-1 text-2xl font-semibold text-primary">
										{impactStats.flagImpacts
											.reduce((sum, f) => sum + f.estimatedAffected, 0)
											.toLocaleString()}
									</p>
									<p class="mt-1 text-xs text-secondary">Estimated across all flags</p>
								</div>

								<div class="rounded-lg border border-base bg-surface p-4">
									<p class="text-xs text-tertiary">Unique Domains</p>
									<p class="mt-1 text-2xl font-semibold text-primary">
										{Object.keys(impactStats.usersByDomain).length}
									</p>
									<p class="mt-1 text-xs text-secondary">Email domains in system</p>
								</div>
							</div>

							<!-- User Search -->
							<div class="rounded-lg border border-base bg-surface p-4">
								<h3 class="mb-4 text-lg font-semibold text-primary">Search User Impact</h3>
								<p class="mb-4 text-sm text-secondary">
									Enter a user email to see which flags affect them and why.
								</p>
								<div class="flex items-center gap-2">
									<FormInput
										placeholder="user@example.com"
										bind:value={userSearchQuery}
										class="flex-1"
										onkeydown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												handleUserSearch();
											}
										}}
									/>
									<Button
										variant="primary"
										onclick={handleUserSearch}
										disabled={userSearchLoading || !userSearchQuery.trim()}
									>
										{userSearchLoading ? 'Searching...' : 'Search'}
									</Button>
								</div>

								{#if userSearchResult}
									<div class="mt-6 rounded-lg border border-base bg-elevated p-4">
										<h4 class="mb-3 text-sm font-semibold text-primary">
											Results for: {userSearchResult.userEmail}
										</h4>
										{#if !userSearchResult.userId}
											<p class="text-sm text-secondary">User not found in system</p>
										{:else}
											{@const enabledFlags = userSearchResult.flags.filter((f) => f.result)}
											{@const disabledFlags = userSearchResult.flags.filter((f) => !f.result)}
											<div class="space-y-3">
												{#if enabledFlags.length > 0}
													<div>
														<p class="mb-2 text-sm font-medium text-primary">
															✅ Enabled Flags ({enabledFlags.length}):
														</p>
														<div class="space-y-2">
															{#each enabledFlags as flagFlag (flagFlag.flag)}
																<div
																	class="rounded-md border border-accent-primary/20 bg-accent-primary/5 p-2"
																>
																	<p class="text-sm font-medium text-primary">{flagFlag.flag}</p>
																	<p class="text-xs text-secondary">{flagFlag.reason}</p>
																</div>
															{/each}
														</div>
													</div>
												{/if}

												{#if disabledFlags.length > 0}
													<div>
														<p class="mb-2 text-sm font-medium text-primary">
															❌ Disabled Flags ({disabledFlags.length}):
														</p>
														<div class="space-y-2">
															{#each disabledFlags as flagFlag (flagFlag.flag)}
																<div class="rounded-md border border-base bg-elevated p-2">
																	<p class="text-sm font-medium text-secondary">{flagFlag.flag}</p>
																	<p class="text-xs text-tertiary">{flagFlag.reason}</p>
																</div>
															{/each}
														</div>
													</div>
												{/if}
											</div>
										{/if}
									</div>
								{/if}
							</div>

							<!-- Flag Impact Breakdown -->
							<div class="space-y-4">
								<h3 class="text-lg font-semibold text-primary">Flag Impact Breakdown</h3>
								{#each flags as flag (flag._id)}
									{@const impact = getFlagImpact(flag.flag)}
									{@const isExpanded = expandedFlags.has(flag.flag)}
									<div class="rounded-lg border border-base bg-surface p-4">
										<div class="flex items-start justify-between">
											<div class="flex-1">
												<div class="flex items-center gap-2">
													<h4 class="font-semibold text-primary">{flag.flag}</h4>
													<Badge variant={flag.enabled ? 'default' : 'system'}>
														{flag.enabled ? 'Enabled' : 'Disabled'}
													</Badge>
												</div>
												{#if getFlagDescription(flag.flag, flag.description)}
													<p class="mt-1 text-sm text-secondary">
														{getFlagDescription(flag.flag, flag.description)}
													</p>
												{/if}
												<p class="mt-1 text-sm text-secondary">
													{getTargetingSummary(flag)}
												</p>
												{#if impact && impact.enabled}
													<p class="mt-2 text-sm font-medium text-primary">
														Estimated affected: ~{impact.estimatedAffected.toLocaleString()} users
													</p>
												{:else if impact && !impact.enabled}
													<p class="mt-2 text-sm text-tertiary">
														Flag is disabled - no users affected
													</p>
												{/if}
											</div>
											{#if impact && impact.enabled && impact.estimatedAffected > 0}
												<button
													type="button"
													onclick={() => toggleFlagExpansion(flag.flag)}
													class="flex-shrink-0 rounded-md p-1 text-tertiary transition-colors hover:text-primary"
													aria-label={isExpanded ? 'Collapse' : 'Expand'}
												>
													<svg
														class="h-5 w-5 transition-transform {isExpanded ? 'rotate-180' : ''}"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M19 9l-7 7-7-7"
														/>
													</svg>
												</button>
											{/if}
										</div>

										{#if isExpanded && impact}
											<div class="mt-4 space-y-3 border-t border-base pt-4">
												<h5 class="text-sm font-semibold text-primary">Impact Breakdown:</h5>
												<div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
													{#if impact.breakdown.byDomain > 0}
														<div class="rounded-md border border-base bg-elevated p-2">
															<p class="text-xs text-tertiary">Domain Targeting</p>
															<p class="mt-1 text-lg font-semibold text-primary">
																{impact.breakdown.byDomain.toLocaleString()}
															</p>
														</div>
													{/if}
													{#if impact.breakdown.byUserIds > 0}
														<div class="rounded-md border border-base bg-elevated p-2">
															<p class="text-xs text-tertiary">User ID Targeting</p>
															<p class="mt-1 text-lg font-semibold text-primary">
																{impact.breakdown.byUserIds.toLocaleString()}
															</p>
														</div>
													{/if}
													{#if impact.breakdown.byOrgIds > 0}
														<div class="rounded-md border border-base bg-elevated p-2">
															<p class="text-xs text-tertiary">Organization Targeting</p>
															<p class="mt-1 text-lg font-semibold text-primary">
																{impact.breakdown.byOrgIds.toLocaleString()}
															</p>
															<p class="mt-1 text-xs text-tertiary">(estimated)</p>
														</div>
													{/if}
													{#if impact.breakdown.byRollout > 0}
														<div class="rounded-md border border-base bg-elevated p-2">
															<p class="text-xs text-tertiary">Percentage Rollout</p>
															<p class="mt-1 text-lg font-semibold text-primary">
																{impact.breakdown.byRollout.toLocaleString()}
															</p>
														</div>
													{/if}
												</div>
												{#if impact.breakdown.byDomain === 0 && impact.breakdown.byUserIds === 0 && impact.breakdown.byOrgIds === 0 && impact.breakdown.byRollout === 0}
													<p class="text-sm text-tertiary">
														⚠️ No targeting rules configured - flag will be disabled for all users
													</p>
												{/if}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{:else if tabValue === 'debug'}
					<!-- Debug Tab -->
					<div class="flex flex-col gap-6">
						<div class="rounded-lg border border-base bg-surface p-4">
							<h3 class="mb-4 text-lg font-semibold text-primary">Debug Flag Evaluation</h3>
							<p class="mb-4 text-sm text-secondary">
								Test how a feature flag evaluates for the current logged-in user. Select a flag to
								see why it's enabled or disabled for you.
							</p>
							<div class="mb-4 rounded-lg border border-accent-primary/20 bg-accent-primary/5 p-3">
								<p class="text-xs text-secondary">
									<strong>💡 How to use:</strong> Select a flag below and click "Evaluate" to see the
									evaluation result, reason, and configuration. This helps debug why flags are enabled
									or disabled.
								</p>
							</div>

							<div class="flex flex-col gap-4">
								<div>
									<label
										for="debug-flag-select"
										class="mb-2 block text-sm font-medium text-primary"
									>
										Feature Flag <span class="text-accent-primary">*</span>
									</label>
									<select
										id="debug-flag-select"
										bind:value={debugFlagSelect}
										class="w-full rounded-input border border-base bg-input px-input-x py-input-y text-sm text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
									>
										<option value="">Select a flag to evaluate...</option>
										{#each flags as flag (flag._id)}
											<option value={flag.flag}>
												{flag.flag}
												{flag.enabled ? '(Enabled)' : '(Disabled)'}
											</option>
										{/each}
									</select>
									<p class="mt-1 text-xs text-tertiary">
										Evaluates the flag for your current user account
									</p>
								</div>

								<Button
									variant="primary"
									onclick={handleDebugEvaluation}
									disabled={debugLoading || !debugFlagSelect}
								>
									{debugLoading ? 'Evaluating...' : 'Evaluate Flag'}
								</Button>
							</div>

							{#if debugResult}
								<div class="mt-6 rounded-lg border border-base bg-elevated p-4">
									<h4 class="mb-3 text-sm font-semibold text-primary">Evaluation Result</h4>
									<div class="space-y-2">
										<div class="flex items-center gap-2">
											<span class="text-sm text-secondary">Result:</span>
											<Badge variant={debugResult.result ? 'default' : 'system'}>
												{debugResult.result ? 'Enabled' : 'Disabled'}
											</Badge>
										</div>
										<div>
											<span class="text-sm text-secondary">Reason:</span>
											<p class="mt-1 text-sm text-primary">{debugResult.reason}</p>
										</div>
										{#if debugResult.flagConfig}
											<div class="mt-4">
												<span class="text-sm font-medium text-secondary">Flag Configuration:</span>
												<pre class="mt-2 rounded-md bg-surface p-2 text-xs text-tertiary">
{JSON.stringify(debugResult.flagConfig, null, 2)}
</pre>
											</div>
										{/if}
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			{/snippet}
		</Tabs>
	</main>
</div>

<!-- Create Flag Modal -->
<Dialog.Root open={createModalOpen} onOpenChange={(value) => (createModalOpen = value)}>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
		/>
		<Dialog.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 max-h-[90vh] w-[min(600px,90vw)] translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-lg border border-base bg-surface text-primary shadow-xl"
		>
			<div class="space-y-6 px-inbox-container py-inbox-container">
				<div class="flex items-center justify-between">
					<div>
						<Dialog.Title class="text-lg font-semibold text-primary"
							>Create Feature Flag</Dialog.Title
						>
						<Dialog.Description class="mt-1 text-sm text-secondary">
							Create a new feature flag to control feature visibility
						</Dialog.Description>
					</div>
					<button
						type="button"
						onclick={() => (createModalOpen = false)}
						class="rounded-md p-1 text-tertiary transition-colors hover:text-primary"
						aria-label="Close"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<div class="space-y-6">
					<!-- Flag Name -->
					<div>
						<label for="create-flag-select" class="mb-2 block text-sm font-medium text-primary">
							Flag Name <span class="text-accent-primary">*</span>
						</label>
						<select
							id="create-flag-select"
							bind:value={formFlag}
							class="w-full rounded-input border border-base bg-input px-input-x py-input-y text-sm text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
						>
							<option value="">Select a predefined flag...</option>
							{#each availableFlagNames as flagName (flagName)}
								<option value={flagName}>{flagName}</option>
							{/each}
						</select>
						<input
							id="create-flag-input"
							type="text"
							bind:value={formFlag}
							placeholder="Or type a custom flag name (e.g., new_feature_beta)"
							class="mt-2 w-full rounded-input border border-base bg-input px-input-x py-input-y text-sm text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
						/>
						<p class="mt-2 text-xs text-secondary">
							<strong>What is this?</strong> A unique identifier for your feature flag. Use
							lowercase with underscores (e.g.,
							<code class="rounded bg-elevated px-1 py-0.5 text-tertiary">notes_editor_v2</code>).
						</p>
					</div>

					<!-- Description -->
					<div>
						<FormTextarea
							label="Description"
							placeholder="Describe what this flag controls and what it enables (e.g., 'Enables the new ProseMirror editor for notes')"
							bind:value={formDescription}
							rows={3}
						/>
						<p class="mt-2 text-xs text-secondary">
							<strong>Why add a description?</strong> Helps team members understand what each flag does
							without needing to check the code. If left empty, we'll use the default description from
							code comments.
						</p>
					</div>

					<!-- Global Toggle -->
					<div class="rounded-lg border border-base bg-elevated p-4">
						<ToggleSwitch
							checked={formEnabled}
							onChange={(checked) => {
								formEnabled = checked;
							}}
							label="Globally Enabled"
						/>
						<p class="mt-2 text-xs text-secondary">
							<strong>What does this do?</strong> When enabled, the flag is active. However, you still
							need to configure targeting rules below to control who sees it. Disabled flags are hidden
							from all users.
						</p>
					</div>

					<!-- Targeting Section -->
					<div class="space-y-4">
						<div class="flex items-center gap-2 border-b border-base pb-2">
							<h4 class="text-sm font-semibold text-primary">Targeting Rules</h4>
							<span class="text-xs text-tertiary">(Optional - choose one or more)</span>
						</div>
						<p class="text-xs text-secondary">
							Targeting rules control who can see this feature. If no rules are set, the flag is
							disabled for everyone (secure by default).
						</p>

						<!-- Rollout Percentage -->
						<div class="rounded-lg border border-base bg-elevated p-4">
							<label for="create-rollout-range" class="mb-2 block text-sm font-medium text-primary">
								Percentage Rollout
							</label>
							<div class="flex items-center gap-2">
								<input
									id="create-rollout-range"
									type="range"
									min="0"
									max="100"
									bind:value={formRolloutPercentage}
									class="flex-1"
								/>
								<input
									id="create-rollout-number"
									type="number"
									min="0"
									max="100"
									bind:value={formRolloutPercentage}
									placeholder="0"
									class="w-20 rounded-input border border-base bg-input px-input-x py-input-y text-sm text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
								/>
								<span class="text-sm text-secondary">%</span>
							</div>
							<p class="mt-2 text-xs text-secondary">
								<strong>How it works:</strong> Shows the feature to a percentage of users based on a
								consistent hash. Same user always gets the same result. Example: 25% means roughly 1
								in 4 users will see it.
							</p>
							<p class="mt-1 text-xs text-tertiary">
								💡 <strong>Use case:</strong> Gradual rollouts (start at 5%, increase to 100% over time)
							</p>
						</div>

						<!-- Domain Targeting -->
						<div class="rounded-lg border border-base bg-elevated p-4">
							<label for="create-domain-input" class="mb-2 block text-sm font-medium text-primary">
								Email Domain Targeting
							</label>
							<input
								id="create-domain-input"
								type="text"
								bind:value={formDomainInput}
								placeholder="@acme.com, @example.com"
								class="w-full rounded-input border border-base bg-input px-input-x py-input-y text-sm text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
							/>
							<p class="mt-2 text-xs text-secondary">
								<strong>How it works:</strong> Users with email addresses matching these domains will
								see the feature. Enter domains with @ symbol, separated by commas.
							</p>
							<p class="mt-1 text-xs text-tertiary">
								💡 <strong>Use case:</strong> Company-specific features (e.g., only @acme.com employees
								see beta features)
							</p>
							{#if formDomainInput}
								<div class="mt-2 flex flex-wrap gap-2">
									{#each parseDomains(formDomainInput) as domain (domain)}
										<span
											class="rounded-md bg-accent-primary/10 px-2 py-1 text-xs text-accent-primary"
										>
											{domain}
										</span>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Info Box -->
						<div class="rounded-lg border border-accent-primary/20 bg-accent-primary/5 p-3">
							<p class="text-xs text-secondary">
								<strong>📋 Targeting Priority:</strong> If multiple targeting rules are set, they work
								as follows:
							</p>
							<ol class="mt-2 ml-4 list-decimal space-y-1 text-xs text-secondary">
								<li>User IDs (if set) - highest priority</li>
								<li>Organization IDs (if set)</li>
								<li>Email domains (if set)</li>
								<li>Percentage rollout (if set) - lowest priority</li>
							</ol>
							<p class="mt-2 text-xs text-tertiary">
								<strong>Note:</strong> User and Organization targeting are not yet available in the UI.
								Use domain targeting or percentage rollout for now.
							</p>
						</div>
					</div>
				</div>

				<div class="flex items-center justify-end gap-2 border-t border-base pt-4">
					<button
						type="button"
						onclick={() => (createModalOpen = false)}
						class="rounded-md border border-base px-3 py-1.5 text-sm font-medium text-secondary hover:text-primary"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={handleSaveFlag}
						class="rounded-md bg-accent-primary px-3 py-1.5 text-sm font-medium text-white"
					>
						Create Flag
					</button>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<!-- Edit Flag Modal -->
<Dialog.Root open={editModalOpen} onOpenChange={(value) => (editModalOpen = value)}>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
		/>
		<Dialog.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 max-h-[90vh] w-[min(600px,90vw)] translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-lg border border-base bg-surface text-primary shadow-xl"
		>
			<div class="space-y-6 px-inbox-container py-inbox-container">
				<div class="flex items-center justify-between">
					<div>
						<Dialog.Title class="text-lg font-semibold text-primary">Edit Feature Flag</Dialog.Title
						>
						<Dialog.Description class="mt-1 text-sm text-secondary">
							Update feature flag configuration
						</Dialog.Description>
					</div>
					<button
						type="button"
						onclick={() => (editModalOpen = false)}
						class="rounded-md p-1 text-tertiary transition-colors hover:text-primary"
						aria-label="Close"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<div class="space-y-6">
					<!-- Flag Name (read-only) -->
					<div>
						<label for="edit-flag-name" class="mb-2 block text-sm font-medium text-primary"
							>Flag Name</label
						>
						<input
							id="edit-flag-name"
							type="text"
							bind:value={formFlag}
							disabled
							class="w-full rounded-input border border-base bg-input px-input-x py-input-y text-sm text-tertiary opacity-50"
						/>
						<p class="mt-1 text-xs text-tertiary">Flag name cannot be changed after creation</p>
					</div>

					<!-- Description -->
					<div>
						<FormTextarea
							label="Description"
							placeholder="Describe what this flag controls and what it enables (e.g., 'Enables the new ProseMirror editor for notes')"
							bind:value={formDescription}
							rows={3}
						/>
						<p class="mt-2 text-xs text-secondary">
							<strong>Why add a description?</strong> Helps team members understand what each flag does
							without needing to check the code. If left empty, we'll use the default description from
							code comments.
						</p>
					</div>

					<!-- Global Toggle -->
					<div class="rounded-lg border border-base bg-elevated p-4">
						<ToggleSwitch
							checked={formEnabled}
							onChange={(checked) => {
								formEnabled = checked;
							}}
							label="Globally Enabled"
						/>
						<p class="mt-2 text-xs text-secondary">
							<strong>What does this do?</strong> When enabled, the flag is active. However, you still
							need to configure targeting rules below to control who sees it. Disabled flags are hidden
							from all users.
						</p>
					</div>

					<!-- Targeting Section -->
					<div class="space-y-4">
						<div class="flex items-center gap-2 border-b border-base pb-2">
							<h4 class="text-sm font-semibold text-primary">Targeting Rules</h4>
							<span class="text-xs text-tertiary">(Optional - choose one or more)</span>
						</div>
						<p class="text-xs text-secondary">
							Targeting rules control who can see this feature. If no rules are set, the flag is
							disabled for everyone (secure by default).
						</p>

						<!-- Rollout Percentage -->
						<div class="rounded-lg border border-base bg-elevated p-4">
							<label for="create-rollout-range" class="mb-2 block text-sm font-medium text-primary">
								Percentage Rollout
							</label>
							<div class="flex items-center gap-2">
								<input
									id="create-rollout-range"
									type="range"
									min="0"
									max="100"
									bind:value={formRolloutPercentage}
									class="flex-1"
								/>
								<input
									id="create-rollout-number"
									type="number"
									min="0"
									max="100"
									bind:value={formRolloutPercentage}
									placeholder="0"
									class="w-20 rounded-input border border-base bg-input px-input-x py-input-y text-sm text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
								/>
								<span class="text-sm text-secondary">%</span>
							</div>
							<p class="mt-2 text-xs text-secondary">
								<strong>How it works:</strong> Shows the feature to a percentage of users based on a
								consistent hash. Same user always gets the same result. Example: 25% means roughly 1
								in 4 users will see it.
							</p>
							<p class="mt-1 text-xs text-tertiary">
								💡 <strong>Use case:</strong> Gradual rollouts (start at 5%, increase to 100% over time)
							</p>
						</div>

						<!-- Domain Targeting -->
						<div class="rounded-lg border border-base bg-elevated p-4">
							<label for="create-domain-input" class="mb-2 block text-sm font-medium text-primary">
								Email Domain Targeting
							</label>
							<input
								id="create-domain-input"
								type="text"
								bind:value={formDomainInput}
								placeholder="@acme.com, @example.com"
								class="w-full rounded-input border border-base bg-input px-input-x py-input-y text-sm text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none"
							/>
							<p class="mt-2 text-xs text-secondary">
								<strong>How it works:</strong> Users with email addresses matching these domains will
								see the feature. Enter domains with @ symbol, separated by commas.
							</p>
							<p class="mt-1 text-xs text-tertiary">
								💡 <strong>Use case:</strong> Company-specific features (e.g., only @acme.com employees
								see beta features)
							</p>
							{#if formDomainInput}
								<div class="mt-2 flex flex-wrap gap-2">
									{#each parseDomains(formDomainInput) as domain (domain)}
										<span
											class="rounded-md bg-accent-primary/10 px-2 py-1 text-xs text-accent-primary"
										>
											{domain}
										</span>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Info Box -->
						<div class="rounded-lg border border-accent-primary/20 bg-accent-primary/5 p-3">
							<p class="text-xs text-secondary">
								<strong>📋 Targeting Priority:</strong> If multiple targeting rules are set, they work
								as follows:
							</p>
							<ol class="mt-2 ml-4 list-decimal space-y-1 text-xs text-secondary">
								<li>User IDs (if set) - highest priority</li>
								<li>Organization IDs (if set)</li>
								<li>Email domains (if set)</li>
								<li>Percentage rollout (if set) - lowest priority</li>
							</ol>
							<p class="mt-2 text-xs text-tertiary">
								<strong>Note:</strong> User and Organization targeting are not yet available in the UI.
								Use domain targeting or percentage rollout for now.
							</p>
						</div>
					</div>
				</div>

				<div class="flex items-center justify-end gap-2 border-t border-base pt-4">
					<button
						type="button"
						onclick={() => (editModalOpen = false)}
						class="rounded-md border border-base px-3 py-1.5 text-sm font-medium text-secondary hover:text-primary"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={handleSaveFlag}
						class="rounded-md bg-accent-primary px-3 py-1.5 text-sm font-medium text-white"
					>
						Save Changes
					</button>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
