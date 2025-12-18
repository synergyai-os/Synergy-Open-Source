<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { useConvexClient } from 'convex-svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import type { Id } from '$lib/convex';
	import type { UseOrgChart } from '../composables/useOrgChart.svelte';
	import { useQuickEditPermission } from '../composables/useQuickEditPermission.svelte';
	import { useCustomFields } from '../composables/useCustomFields.svelte';
	import RoleDetailHeader from './RoleDetailHeader.svelte';
	import CategoryHeader from './CategoryHeader.svelte';
	import InlineEditText from './InlineEditText.svelte';
	import EditPermissionTooltip from './EditPermissionTooltip.svelte';
	import CategoryItemsList from './CategoryItemsList.svelte';
	import { Avatar, Badge } from '$lib/components/atoms';
	import Text from '$lib/components/atoms/Text.svelte';
	import * as Tabs from '$lib/components/atoms/Tabs.svelte';
	import { tabsListRecipe, tabsTriggerRecipe, tabsContentRecipe } from '$lib/design-system/recipes';
	import StackedPanel, { type PanelContext } from '$lib/components/organisms/StackedPanel.svelte';
	import type { IconType } from '$lib/components/atoms/iconRegistry';
	import {
		getLeadAuthorityLevel,
		getAuthorityUI
	} from '$lib/infrastructure/organizational-model/constants';
	import { invariant } from '$lib/utils/invariant';

	let { orgChart }: { orgChart: UseOrgChart | null } = $props();

	// Guard: Don't access orgChart properties if it's null (prevents hydration errors)
	if (!browser || !orgChart) {
		// Return early during SSR or when orgChart is not available
		// This prevents accessing properties on null during hydration
	}

	const role = $derived(orgChart?.selectedRole ?? null);
	const fillers = $derived(orgChart?.selectedRoleFillers ?? []);
	const isOpen = $derived((orgChart?.selectedRoleId ?? null) !== null);
	const selectionSource = $derived(orgChart?.selectionSource ?? null);
	const error = $derived(orgChart?.selectedRoleError ?? null);
	const isLoading = $derived(orgChart?.selectedRoleIsLoading ?? false);

	// Convex client for mutations
	const convexClient = browser ? useConvexClient() : null;
	const sessionId = $derived($page.data.sessionId);

	// Query circle for permission checking (roles belong to circles)
	const circleQuery = $derived(
		browser && role?.circleId && sessionId
			? useQuery(api.core.circles.index.get, () => {
					invariant(role?.circleId && sessionId, 'Role circleId and sessionId required');
					return { sessionId, circleId: role.circleId };
				})
			: null
	);

	const circle = $derived(circleQuery?.data ?? null);
	const circleQueryError = $derived(circleQuery?.error ?? null);

	// Log circle query failures for debugging
	$effect(() => {
		if (circleQueryError && role?.roleId) {
			console.error(
				'[RoleDetailPanel] Circle query failed for role:',
				role.roleId,
				'circleId:',
				role.circleId,
				'error:',
				circleQueryError
			);
		}
	});

	// Check if role is Lead role - Lead roles CANNOT be edited regardless of permissions
	const isLeadRole = $derived(role?.isLeadRole ?? false);

	// Get authority level for Lead role (SYOS-672)
	const authorityLevel = $derived(
		isLeadRole && circle ? getLeadAuthorityLevel(circle.circleType) : null
	);
	const authorityUI = $derived(authorityLevel ? getAuthorityUI(authorityLevel) : null);

	// Check quick edit permission using composable (only if not Lead role)
	const quickEditPermission = useQuickEditPermission({
		circle: () => circle,
		sessionId: () => sessionId,
		allowQuickChanges: () => orgChart?.allowQuickChanges ?? false
	});

	// Combine permission checks: Lead roles are always blocked, otherwise use quickEditPermission
	const canEdit = $derived(
		isLeadRole
			? false
			: circleQueryError
				? false // If circle query failed, don't allow editing
				: quickEditPermission.canEdit
	);

	const editReason = $derived(
		isLeadRole
			? 'Lead roles cannot be edited directly. Edit the Lead role template instead to update all Lead roles across all circles.'
			: circleQueryError
				? 'Unable to verify edit permissions. Please refresh the page.'
				: quickEditPermission.editReason
	);

	// Custom fields composable for roles
	const customFields = useCustomFields({
		sessionId: () => sessionId,
		workspaceId: () => role?.workspaceId ?? undefined,
		entityType: () => 'role',
		entityId: () => role?.roleId ?? null
	});

	// Helper: Get field value as string (for single fields like Purpose)
	function getFieldValueAsString(systemKey: string): string {
		const field = customFields.getFieldBySystemKey(systemKey);
		if (!field || !field.parsedValue) return '';
		return typeof field.parsedValue === 'string' ? field.parsedValue : String(field.parsedValue);
	}

	// Helper: Get field value as array (for multi-item fields like Domains, Accountabilities)
	function getFieldValueAsArray(systemKey: string): string[] {
		const field = customFields.getFieldBySystemKey(systemKey);
		if (!field || !field.parsedValue) return [];
		if (Array.isArray(field.parsedValue)) {
			return field.parsedValue.map((v) => String(v));
		}
		return [];
	}

	// Helper: Check if field has a value (for empty state)
	function hasFieldValue(field: { parsedValue: unknown }): boolean {
		if (!field.parsedValue) return false;
		if (Array.isArray(field.parsedValue)) return field.parsedValue.length > 0;
		if (typeof field.parsedValue === 'string') return field.parsedValue.trim().length > 0;
		return true;
	}

	// Helper: Convert array items to CircleItem format for CategoryItemsList
	// This is a temporary adapter until we migrate CategoryItemsList to work directly with customFields
	function getItemsForCategory(systemKey: string): Array<{
		itemId: string;
		content: string;
		order: number;
		createdAt: number;
		updatedAt: number;
	}> {
		const items = getFieldValueAsArray(systemKey);
		return items.map((content, index) => ({
			itemId: `${systemKey}-${index}` as Id<'circleItems'>, // Temporary ID format
			content,
			order: index,
			createdAt: Date.now(),
			updatedAt: Date.now()
		}));
	}

	// Handler: Update single field value (like Purpose)
	async function handleUpdateSingleField(systemKey: string, value: string): Promise<void> {
		const field = customFields.getFieldBySystemKey(systemKey);
		if (!field) return;
		await customFields.setFieldValue(field.definition._id, value);
	}

	// Handler: Update multi-item field (add item)
	async function handleAddMultiItemField(systemKey: string, content: string) {
		const field = customFields.getFieldBySystemKey(systemKey);
		if (!field) return;
		const currentItems = getFieldValueAsArray(systemKey);
		const updatedItems = [...currentItems, content];
		await customFields.setFieldValue(field.definition._id, updatedItems);
	}

	// Handler: Update multi-item field (update item)
	async function handleUpdateMultiItemField(systemKey: string, index: number, content: string) {
		const field = customFields.getFieldBySystemKey(systemKey);
		if (!field) return;
		const currentItems = getFieldValueAsArray(systemKey);
		const updatedItems = [...currentItems];
		updatedItems[index] = content;
		await customFields.setFieldValue(field.definition._id, updatedItems);
	}

	// Handler: Update multi-item field (delete item)
	async function handleDeleteMultiItemField(systemKey: string, index: number) {
		const field = customFields.getFieldBySystemKey(systemKey);
		if (!field) return;
		const currentItems = getFieldValueAsArray(systemKey);
		const updatedItems = currentItems.filter((_, i) => i !== index);
		await customFields.setFieldValue(field.definition._id, updatedItems);
	}

	// Quick update handler for role (purpose and name)
	async function handleQuickUpdateRole(updates: { name?: string; purpose?: string }) {
		if (!convexClient || !role || !sessionId) return;

		await convexClient.mutation(api.core.roles.index.updateInline, {
			sessionId,
			circleRoleId: role.roleId,
			updates
		});
		// No manual refetch needed - useQuery automatically refetches after mutations
	}

	// Quick update handler for role name (separate for header)
	async function handleQuickUpdateRoleName(name: string) {
		await handleQuickUpdateRole({ name });
	}

	// Check if this role panel is the topmost layer
	const isTopmost = () => {
		if (!orgChart) return false;
		const currentLayer = orgChart.navigationStack.currentLayer;
		return currentLayer?.type === 'role' && currentLayer?.id === orgChart.selectedRoleId;
	};

	// Tab state with dummy counts
	let activeTab = $state(
		'overview' as
			| 'overview'
			| 'members'
			| 'documents'
			| 'activities'
			| 'metrics'
			| 'checklists'
			| 'projects'
	);
	const tabCounts = $state({
		overview: 0,
		members: 0,
		documents: 0,
		activities: 0,
		metrics: 0,
		checklists: 0,
		projects: 0
	});

	function handleClose() {
		if (!orgChart) return;
		// ESC goes back one level (not all the way)
		const previousLayer = orgChart.navigationStack.previousLayer;

		if (previousLayer) {
			// Pop current layer
			orgChart.navigationStack.pop();

			// Navigate to previous layer WITHOUT pushing (we're already there after pop)
			if (previousLayer.type === 'circle') {
				orgChart.selectCircle(previousLayer.id as Id<'circles'>, { skipStackPush: true });
				// Close role panel when going back to circle
				orgChart.selectRole(null, null);
			} else if (previousLayer.type === 'role') {
				orgChart.selectRole(previousLayer.id as Id<'circleRoles'>, 'circle-panel', {
					skipStackPush: true
				});
			}
		} else {
			// No previous layer - close everything
			orgChart.navigationStack.pop();
			orgChart.selectRole(null, null);

			// If opened from chart (not circle panel), also close circle panel
			if (selectionSource === 'chart') {
				orgChart.selectCircle(null);
			}
		}
	}

	function handleBreadcrumbClick(index: number) {
		if (!orgChart) return;
		// Get the target layer to navigate to
		const targetLayer = orgChart.navigationStack.getLayer(index);
		if (!targetLayer) return;

		// Jump to that layer in the stack (this already positions us at the right layer)
		orgChart.navigationStack.jumpTo(index);

		// Re-open the panel for that layer WITHOUT pushing to stack (we're already there)
		if (targetLayer.type === 'circle') {
			orgChart.selectCircle(targetLayer.id as Id<'circles'>, { skipStackPush: true });
			// Close role panel when jumping to circle
			orgChart.selectRole(null, null);
		} else if (targetLayer.type === 'role') {
			orgChart.selectRole(targetLayer.id as Id<'circleRoles'>, 'circle-panel', {
				skipStackPush: true
			});
		}
	}

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	function handleEditRole() {
		if (orgChart && role) {
			orgChart.openEditRole(role.roleId);
		}
	}

	// Icon renderer for breadcrumbs - modules define their own icons
	// Returns IconType for rendering with Icon component (secure, no HTML injection)
	function renderBreadcrumbIcon(layerType: string): IconType | null {
		if (layerType === 'circle') {
			return 'circle';
		} else if (layerType === 'role') {
			return 'user';
		}
		return null;
	}
</script>

{#if orgChart}
	<StackedPanel
		{isOpen}
		navigationStack={orgChart.navigationStack}
		onClose={handleClose}
		onBreadcrumbClick={handleBreadcrumbClick}
		{isTopmost}
		iconRenderer={renderBreadcrumbIcon}
	>
		{#snippet children(panelContext)}
			{#if isLoading}
				<!-- Loading State -->
				<div class="flex h-full items-center justify-center">
					<div class="text-center">
						<svg
							class="size-icon-xl text-tertiary mx-auto animate-spin"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						<p class="mt-content-section text-button text-secondary">Loading role details...</p>
						{#if orgChart.selectedRoleId}
							<p class="text-label text-tertiary mt-fieldGroup">
								Role ID: {orgChart.selectedRoleId}
							</p>
						{/if}
					</div>
				</div>
			{:else if error}
				<!-- Error State -->
				<div class="px-page flex h-full items-center justify-center">
					<div class="text-center">
						<p class="text-button text-error font-medium">Failed to load role</p>
						<p class="text-button text-secondary mt-fieldGroup">{String(error)}</p>
						{#if orgChart.selectedRoleId}
							<p class="text-label text-tertiary mt-fieldGroup">
								Role ID: {orgChart.selectedRoleId}
							</p>
						{/if}
					</div>
				</div>
			{:else if role}
				<div class="flex h-full flex-col">
					<!-- Header -->
					<RoleDetailHeader
						roleName={role.name}
						{canEdit}
						{editReason}
						onNameChange={handleQuickUpdateRoleName}
						onClose={handleClose}
						onBack={panelContext.onBack}
						showBackButton={panelContext.isMobile && panelContext.canGoBack}
						onEdit={handleEditRole}
						addMenuItems={[
							{ label: 'Add filler', onclick: () => {} },
							{ label: 'Add accountability', onclick: () => {} },
							{ label: 'Add domain', onclick: () => {} }
						]}
						headerMenuItems={[
							{ label: 'Copy URL', onclick: () => {} },
							{ label: 'Export to PDF', onclick: () => {} },
							{ label: 'Export to spreadsheet', onclick: () => {} },
							{ label: 'Convert role to circle', onclick: () => {} },
							{ label: 'Move role', onclick: () => {} },
							{ label: 'Notifications', onclick: () => {} },
							{ label: 'Settings', onclick: () => {} },
							{ label: 'Delete role', onclick: () => {}, danger: true }
						]}
					/>

					<!-- Content -->
					<div class="flex-1 overflow-y-auto">
						<Tabs.Root bind:value={activeTab}>
							<!-- Navigation Tabs - Sticky at top -->
							<div class="bg-surface px-page sticky top-0 z-10">
								<Tabs.List
									class={[tabsListRecipe(), 'gap-form flex flex-shrink-0 overflow-x-auto']}
								>
									<Tabs.Trigger
										value="overview"
										class={[
											tabsTriggerRecipe({ active: activeTab === 'overview' }),
											'flex-shrink-0'
										]}
									>
										Overview
									</Tabs.Trigger>
									<Tabs.Trigger
										value="members"
										class={[
											tabsTriggerRecipe({ active: activeTab === 'members' }),
											'flex-shrink-0'
										]}
									>
										<span class="gap-button flex items-center">
											<span>Members</span>
											{#if tabCounts.members > 0}
												<span class="text-label text-tertiary">({tabCounts.members})</span>
											{/if}
										</span>
									</Tabs.Trigger>
									<Tabs.Trigger
										value="documents"
										class={[
											tabsTriggerRecipe({ active: activeTab === 'documents' }),
											'flex-shrink-0'
										]}
									>
										<span class="gap-button flex items-center">
											<span>Documents</span>
											{#if tabCounts.documents > 0}
												<span class="text-label text-tertiary">({tabCounts.documents})</span>
											{/if}
										</span>
									</Tabs.Trigger>
									<Tabs.Trigger
										value="activities"
										class={[
											tabsTriggerRecipe({ active: activeTab === 'activities' }),
											'flex-shrink-0'
										]}
									>
										<span class="gap-button flex items-center">
											<span>Activities</span>
											{#if tabCounts.activities > 0}
												<span class="text-label text-tertiary">({tabCounts.activities})</span>
											{/if}
										</span>
									</Tabs.Trigger>
									<Tabs.Trigger
										value="metrics"
										class={[
											tabsTriggerRecipe({ active: activeTab === 'metrics' }),
											'flex-shrink-0'
										]}
									>
										<span class="gap-button flex items-center">
											<span>Metrics</span>
											{#if tabCounts.metrics > 0}
												<span class="text-label text-tertiary">({tabCounts.metrics})</span>
											{/if}
										</span>
									</Tabs.Trigger>
									<Tabs.Trigger
										value="checklists"
										class={[
											tabsTriggerRecipe({ active: activeTab === 'checklists' }),
											'flex-shrink-0'
										]}
									>
										<span class="gap-button flex items-center">
											<span>Checklists</span>
											{#if tabCounts.checklists > 0}
												<span class="text-label text-tertiary">({tabCounts.checklists})</span>
											{/if}
										</span>
									</Tabs.Trigger>
									<Tabs.Trigger
										value="projects"
										class={[
											tabsTriggerRecipe({ active: activeTab === 'projects' }),
											'flex-shrink-0'
										]}
									>
										<span class="gap-button flex items-center">
											<span>Projects</span>
											{#if tabCounts.projects > 0}
												<span class="text-label text-tertiary">({tabCounts.projects})</span>
											{/if}
										</span>
									</Tabs.Trigger>
								</Tabs.List>
							</div>

							<!-- Tab Content -->
							<div class="px-page py-page flex-1 overflow-y-auto">
								<Tabs.Content value="overview" class={tabsContentRecipe()}>
									<!-- Two-Column Layout: Mobile stacks, Desktop side-by-side -->
									<div
										class="grid grid-cols-1 lg:grid-cols-[minmax(400px,1fr)_minmax(400px,500px)]"
										style="gap: clamp(var(--spacing-5), 2.5vw, var(--spacing-10));"
									>
										<!-- Left Column: Overview Details -->
										<div class="gap-section flex min-w-0 flex-col overflow-hidden">
											<!-- Purpose - from customFields only (SYOS-963) -->
											{#if customFields.getFieldBySystemKey('purpose')}
												{@const purposeField = customFields.getFieldBySystemKey('purpose')}
												{@const purposeValue = getFieldValueAsString('purpose')}
												<div>
													<h4
														class="text-button text-tertiary mb-header font-medium tracking-wide uppercase"
													>
														{purposeField.definition.name}
													</h4>
													{#if canEdit}
														<InlineEditText
															value={purposeValue}
															onSave={async (value) =>
																await handleUpdateSingleField('purpose', value)}
															multiline={true}
															placeholder="What's the purpose of this role?"
															maxRows={4}
															size="md"
														/>
													{:else if editReason}
														<EditPermissionTooltip reason={editReason}>
															<div class="text-button text-secondary leading-relaxed break-words">
																{#if purposeValue}
																	{purposeValue}
																{:else}
																	<Text variant="body" size="md" color="tertiary"
																		>No purpose set</Text
																	>
																{/if}
															</div>
														</EditPermissionTooltip>
													{:else}
														<p class="text-button text-secondary leading-relaxed break-words">
															{purposeValue || 'No purpose set'}
														</p>
													{/if}
												</div>
											{/if}

											<!-- Authority Badge (SYOS-672) -->
											{#if isLeadRole && authorityUI}
												<div>
													<h4
														class="text-button text-tertiary mb-header font-medium tracking-wide uppercase"
													>
														Authority
													</h4>
													<div class="gap-button flex items-center">
														<span class="text-button">{authorityUI.emoji}</span>
														<Badge variant="default" size="md">
															{authorityUI.badge}
														</Badge>
													</div>
													{#if authorityLevel === 'authority'}
														<p class="text-label text-secondary mt-fieldGroup">
															This role makes final decisions for this circle.
														</p>
													{:else if authorityLevel === 'facilitative'}
														<p class="text-label text-secondary mt-fieldGroup">
															This role coordinates the team. Team decides together using consent.
														</p>
													{:else if authorityLevel === 'convening'}
														<p class="text-label text-secondary mt-fieldGroup">
															This role schedules meetings. Decisions are made in home circles.
														</p>
													{/if}
												</div>
											{/if}

											<!-- Dynamically render all custom fields -->
											{#each customFields.fields as field (field.definition._id)}
												{@const systemKey = field.definition.systemKey}
												{@const isPurpose = systemKey === 'purpose'}
												{@const isMultiItem = field.definition.fieldType === 'textList'}
												{@const isSingleField = ['text', 'longText'].includes(
													field.definition.fieldType
												)}

												{#if !isPurpose}
													<!-- Skip Purpose - already rendered above -->
													<div>
														<h4
															class="text-button text-tertiary mb-header font-medium tracking-wide uppercase"
														>
															{field.definition.name}
														</h4>
														{#if isMultiItem}
															<!-- Multi-item field (textList type: Domains, Accountabilities, etc.) -->
															{@const items = getItemsForCategory(systemKey ?? '')}
															<CategoryItemsList
																categoryName={field.definition.name}
																{items}
																{canEdit}
																{editReason}
																onCreate={async (content) => {
																	if (systemKey) await handleAddMultiItemField(systemKey, content);
																}}
																onUpdate={async (itemId, content) => {
																	if (systemKey) {
																		const index = parseInt(itemId.split('-')[1] ?? '0');
																		await handleUpdateMultiItemField(systemKey, index, content);
																	}
																}}
																onDelete={async (itemId) => {
																	if (systemKey) {
																		const index = parseInt(itemId.split('-')[1] ?? '0');
																		await handleDeleteMultiItemField(systemKey, index);
																	}
																}}
																placeholder={`Add ${field.definition.name.toLowerCase()}`}
															/>
														{:else if isSingleField}
															<!-- Single-field (text or longText type: Notes, etc.) -->
															{@const value = getFieldValueAsString(systemKey ?? '')}
															{#if canEdit}
																<InlineEditText
																	{value}
																	onSave={async (content) => {
																		if (systemKey)
																			await handleUpdateSingleField(systemKey, content);
																	}}
																	multiline={true}
																	placeholder={`Add ${field.definition.name.toLowerCase()}`}
																	maxRows={4}
																	size="md"
																/>
															{:else if editReason}
																<EditPermissionTooltip reason={editReason}>
																	<div
																		class="text-button text-secondary leading-relaxed break-words"
																	>
																		{#if hasFieldValue(field)}
																			{value}
																		{:else}
																			<Text variant="body" size="md" color="tertiary">
																				No {field.definition.name.toLowerCase()} set
																			</Text>
																		{/if}
																	</div>
																</EditPermissionTooltip>
															{:else}
																<p class="text-button text-secondary leading-relaxed break-words">
																	{hasFieldValue(field)
																		? value
																		: `No ${field.definition.name.toLowerCase()} set`}
																</p>
															{/if}
														{/if}
													</div>
												{/if}
											{/each}
										</div>

										<!-- Right Column: Filled By List -->
										<div
											class="gap-section flex flex-col"
											style="padding-right: var(--spacing-page-x);"
										>
											<!-- Filled By List -->
											<div>
												<CategoryHeader
													variant="plain"
													title="Filled By"
													count={fillers.length}
													onAdd={() => {}}
												/>
												{#if fillers.length > 0}
													<div class="gap-content mb-section flex flex-col">
														{#each fillers as filler (filler.userId)}
															<div
																class="p-card gap-button rounded-card bg-surface flex items-center"
															>
																<Avatar
																	initials={getInitials(filler.name || filler.email)}
																	size="md"
																/>
																<!-- Info -->
																<div class="min-w-0 flex-1">
																	<p class="text-button text-primary truncate font-medium">
																		{filler.name || filler.email}
																	</p>
																	{#if filler.name}
																		<p class="text-label text-secondary truncate">{filler.email}</p>
																	{/if}
																</div>
															</div>
														{/each}
													</div>
												{:else}
													<p class="text-button text-secondary mb-section">
														No one is filling this role yet
													</p>
												{/if}
											</div>
										</div>
									</div>
								</Tabs.Content>

								<Tabs.Content value="members" class={tabsContentRecipe()}>
									<!-- Empty State: Members -->
									<div class="py-page text-center">
										<svg
											class="size-icon-xl text-tertiary mx-auto"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
											/>
										</svg>
										<p class="text-button text-primary mb-header font-medium">No members yet</p>
										<p class="text-button text-secondary mb-header">
											Members assigned to this role will appear here. This feature will be available
											in a future update.
										</p>
									</div>
								</Tabs.Content>

								<Tabs.Content value="documents" class={tabsContentRecipe()}>
									<!-- Empty State: Documents -->
									<div class="py-page text-center">
										<svg
											class="size-icon-xl text-tertiary mx-auto"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											/>
										</svg>
										<p class="text-button text-primary mb-header font-medium">No documents yet</p>
										<p class="text-button text-secondary mb-header">
											Documents related to this role will appear here. This feature will be
											available in a future update.
										</p>
									</div>
								</Tabs.Content>

								<Tabs.Content value="activities" class={tabsContentRecipe()}>
									<!-- Empty State: Activities -->
									<div class="py-page text-center">
										<svg
											class="size-icon-xl text-tertiary mx-auto"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<p class="text-button text-primary mb-header font-medium">No activities yet</p>
										<p class="text-button text-secondary mb-header">
											Recent activities and updates for this role will appear here. This feature
											will be available in a future update.
										</p>
									</div>
								</Tabs.Content>

								<Tabs.Content value="metrics" class={tabsContentRecipe()}>
									<!-- Empty State: Metrics -->
									<div class="py-page text-center">
										<svg
											class="size-icon-xl text-tertiary mx-auto"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
											/>
										</svg>
										<p class="text-button text-primary mb-header font-medium">No metrics yet</p>
										<p class="text-button text-secondary mb-header">
											Performance metrics and analytics for this role will appear here. This feature
											will be available in a future update.
										</p>
									</div>
								</Tabs.Content>

								<Tabs.Content value="checklists" class={tabsContentRecipe()}>
									<!-- Empty State: Checklists -->
									<div class="py-page text-center">
										<svg
											class="size-icon-xl text-tertiary mx-auto"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
											/>
										</svg>
										<p class="text-button text-primary mb-header font-medium">No checklists yet</p>
										<p class="text-button text-secondary mb-header">
											Checklists and task lists for this role will appear here. This feature will be
											available in a future update.
										</p>
									</div>
								</Tabs.Content>

								<Tabs.Content value="projects" class={tabsContentRecipe()}>
									<!-- Empty State: Projects -->
									<div class="py-page text-center">
										<svg
											class="size-icon-xl text-tertiary mx-auto"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
											/>
										</svg>
										<p class="text-button text-primary mb-header font-medium">No projects yet</p>
										<p class="text-button text-secondary mb-header">
											Projects associated with this role will appear here. This feature will be
											available in a future update.
										</p>
									</div>
								</Tabs.Content>
							</div>
						</Tabs.Root>
					</div>
				</div>
			{:else}
				<!-- Empty State - Panel open but no role data -->
				<div class="px-page flex h-full items-center justify-center">
					<div class="text-center">
						<p class="text-button text-secondary">No role selected</p>
					</div>
				</div>
			{/if}
		{/snippet}
	</StackedPanel>
{/if}
