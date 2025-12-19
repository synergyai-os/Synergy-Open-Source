<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import type { Id } from '$lib/convex';
	import type { UseOrgChart } from '../composables/useOrgChart.svelte';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import { useCustomFields } from '../composables/useCustomFields.svelte';
	import { useCanEdit } from '../composables/useCanEdit.svelte';
	import { useEditRole } from '../composables/useEditRole.svelte';
	import DetailHeader from './DetailHeader.svelte';
	import { Badge } from '$lib/components/atoms';
	import * as Tooltip from '$lib/components/atoms/Tooltip.svelte';
	import { tooltipContentRecipe, tooltipArrowRecipe } from '$lib/design-system/recipes';
	import CategoryHeader from './CategoryHeader.svelte';
	import InlineEditText from './InlineEditText.svelte';
	import EditPermissionTooltip from './EditPermissionTooltip.svelte';
	import CategoryItemsList from './CategoryItemsList.svelte';
	import StandardDialog from '$lib/components/organisms/StandardDialog.svelte';
	import FormTextarea from '$lib/components/atoms/FormTextarea.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import { Avatar } from '$lib/components/atoms';
	import Text from '$lib/components/atoms/Text.svelte';
	import Icon from '$lib/components/atoms/Icon.svelte';
	import Loading from '$lib/components/atoms/Loading.svelte';
	import StackedPanel, { type PanelContext } from '$lib/components/organisms/StackedPanel.svelte';
	import { EmptyState, ErrorState, TabbedPanel } from '$lib/components/molecules';
	import { useDetailPanelNavigation } from '../composables/useDetailPanelNavigation.svelte';
	import type { IconType } from '$lib/components/atoms/iconRegistry';
	import {
		getLeadAuthorityLevel,
		getAuthorityUI,
		getLeadDescription
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

	// Get workspaceId from context (same pattern as CircleDetailPanel)
	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const workspaceId = $derived(() => {
		if (!workspaces) return undefined;
		return workspaces.activeWorkspaceId ?? undefined;
	});

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

	// Phase-based edit permissions (SYOS-982)
	const editPermission = useCanEdit({
		sessionId: () => sessionId ?? null,
		workspaceId: () => workspaceId() ?? null,
		circleId: () => role?.circleId ?? null
	});

	// Lead roles cannot be edited regardless of permissions
	const canEdit = $derived(isLeadRole ? false : editPermission.canEdit);
	const isDesignPhase = $derived(editPermission.isDesignPhase);

	// Edit reason for tooltip display when canEdit is false
	const editReason = $derived.by(() => {
		if (isLeadRole) {
			return 'Lead roles cannot be edited directly. Edit the Lead role template instead to update all Lead roles across all circles.';
		}
		if (circleQueryError) {
			return 'Unable to verify edit permissions. Please refresh the page.';
		}
		if (!canEdit && !isDesignPhase) {
			return 'Only circle members can propose changes in active workspaces';
		}
		return undefined;
	});

	// Edit mode state
	let isEditMode = $state(false);
	let showDiscardDialog = $state(false);

	// Navigation composable for shared navigation logic
	const navigation = useDetailPanelNavigation({
		orgChart: () => orgChart,
		isEditMode: () => isEditMode,
		isDirty: () => editRole.isDirty,
		onShowDiscardDialog: () => {
			showDiscardDialog = true;
		},
		resetEditMode: () => {
			isEditMode = false;
			editRole.reset();
		}
	});

	// Edit role composable (only used in edit mode)
	// In design phase, direct save is allowed. In active phase, Phase 4 will handle proposal routing.
	const editRole = useEditRole({
		roleId: () => role?.roleId ?? null,
		sessionId: () => sessionId,
		workspaceId: () => workspaceId() ?? null,
		canQuickEdit: () => isDesignPhase
	});

	// Custom fields composable for roles
	const customFields = useCustomFields({
		sessionId: () => sessionId,
		workspaceId: () => workspaceId() ?? undefined,
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

	// Role-specific tabs configuration
	const ROLE_TABS = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'members', label: 'Members', showCount: true },
		{ id: 'documents', label: 'Documents', showCount: true },
		{ id: 'activities', label: 'Activities', showCount: true },
		{ id: 'metrics', label: 'Metrics', showCount: true },
		{ id: 'checklists', label: 'Checklists', showCount: true },
		{ id: 'projects', label: 'Projects', showCount: true }
	];

	// Tab state with dummy counts
	let activeTab = $state('overview' as string);
	const tabCounts = $state({
		overview: 0,
		members: 0,
		documents: 0,
		activities: 0,
		metrics: 0,
		checklists: 0,
		projects: 0
	});

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	function handleEditClick() {
		if (!role) return;
		isEditMode = true;
		editRole.loadRole();
	}

	function handleCancelEdit() {
		if (editRole.isDirty) {
			showDiscardDialog = true;
		} else {
			isEditMode = false;
			editRole.reset();
		}
	}

	function handleConfirmDiscard() {
		editRole.reset();
		isEditMode = false;
		showDiscardDialog = false;
	}

	async function handleSaveDirectly() {
		await editRole.saveDirectly();
		isEditMode = false;
		// Refresh role data by re-selecting
		if (orgChart && role) {
			orgChart.selectRole(role.roleId, 'circle-panel', { skipStackPush: true });
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
		onClose={navigation.handleClose}
		onBreadcrumbClick={navigation.handleBreadcrumbClick}
		{isTopmost}
		iconRenderer={renderBreadcrumbIcon}
	>
		{#snippet children(panelContext)}
			{#if isLoading}
				<!-- Loading State -->
				<Loading message="Loading role details..." />
			{:else if error}
				<!-- Error State -->
				<ErrorState title="Failed to load role" message={String(error)} />
			{:else if role}
				<!-- Header -->
				<DetailHeader
					entityName={isEditMode ? editRole.formValues.name : role.name}
					onClose={navigation.handleClose}
					onBack={panelContext.onBack}
					showBackButton={panelContext.isMobile && panelContext.canGoBack}
					onEdit={isEditMode ? undefined : handleEditClick}
					canEdit={!isEditMode && canEdit}
					{editReason}
					onNameChange={!isEditMode ? handleQuickUpdateRoleName : undefined}
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
				>
					{#snippet authorityBadge()}
						{#if isLeadRole && authorityUI && circle}
							<Tooltip.Provider>
								<Tooltip.Root>
									<Tooltip.Trigger>
										{#snippet child({ props })}
											<span {...props} class="inline-block">
												<Badge variant="default" size="md">
													{authorityUI.badge}
												</Badge>
											</span>
										{/snippet}
									</Tooltip.Trigger>
									<Tooltip.Portal>
										<Tooltip.Content class={tooltipContentRecipe()}>
											<p class="text-button text-primary">
												{getLeadDescription(circle.circleType)}
											</p>
											<Tooltip.Arrow class={tooltipArrowRecipe()} />
										</Tooltip.Content>
									</Tooltip.Portal>
								</Tooltip.Root>
							</Tooltip.Provider>
						{/if}
					{/snippet}
				</DetailHeader>

				<!-- Edit Mode Indicator Bar -->
				{#if isEditMode}
					<div
						class="border-base bg-surface-subtle py-header gap-button px-page flex items-center border-b"
					>
						<Icon type="edit" size="sm" />
						<Text variant="body" size="sm" color="primary" class="font-medium">Edit mode</Text>
					</div>
				{/if}

				<div class="flex h-full flex-col">
					<!-- Content -->
					<div class="flex-1 overflow-y-auto">
						<TabbedPanel
							tabs={ROLE_TABS}
							bind:activeTab
							onTabChange={(tab) => {
								activeTab = tab;
							}}
							{tabCounts}
						>
							{#snippet content(tabId)}
								{#if tabId === 'overview'}
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
													{#if isEditMode}
														<FormTextarea
															label=""
															placeholder="What's the purpose of this role?"
															value={editRole.formValues.purpose}
															oninput={(e) => editRole.setField('purpose', e.currentTarget.value)}
															rows={4}
														/>
													{:else if canEdit}
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
															{@const canEditField = isEditMode || canEdit}
															<CategoryItemsList
																categoryName={field.definition.name}
																{items}
																canEdit={canEditField}
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
															{@const canEditField = isEditMode || canEdit}
															{#if canEditField}
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
								{:else if tabId === 'members'}
									<EmptyState
										icon="users"
										title="No members yet"
										description="Members assigned to this role will appear here. This feature will be available in a future update."
									/>
								{:else if tabId === 'documents'}
									<EmptyState
										icon="file-text"
										title="No documents yet"
										description="Documents related to this role will appear here. This feature will be available in a future update."
									/>
								{:else if tabId === 'activities'}
									<EmptyState
										icon="clock"
										title="No activities yet"
										description="Recent activities and updates for this role will appear here. This feature will be available in a future update."
									/>
								{:else if tabId === 'metrics'}
									<EmptyState
										icon="bar-chart"
										title="No metrics yet"
										description="Performance metrics and analytics for this role will appear here. This feature will be available in a future update."
									/>
								{:else if tabId === 'checklists'}
									<EmptyState
										icon="check-square"
										title="No checklists yet"
										description="Checklists and task lists for this role will appear here. This feature will be available in a future update."
									/>
								{:else if tabId === 'projects'}
									<EmptyState
										icon="briefcase"
										title="No projects yet"
										description="Projects associated with this role will appear here. This feature will be available in a future update."
									/>
								{/if}
							{/snippet}
						</TabbedPanel>
					</div>

					<!-- Footer with Save Actions (Edit Mode Only) -->
					{#if isEditMode}
						<div
							class="border-base py-header gap-button bg-surface px-page sticky bottom-0 z-20 flex items-center justify-end border-t"
						>
							{#if editRole.error}
								<div class="mr-auto">
									<Text variant="body" size="sm" color="error">{editRole.error}</Text>
								</div>
							{/if}
							<Button variant="outline" onclick={handleCancelEdit} disabled={editRole.isSaving}>
								Cancel
							</Button>

							{#if isDesignPhase}
								<!-- Design phase: Direct save for all members -->
								<Button
									variant="primary"
									onclick={handleSaveDirectly}
									disabled={editRole.isSaving || !editRole.isDirty}
								>
									{editRole.isSaving ? 'Saving...' : 'Save'}
								</Button>
							{:else}
								<!-- Active phase: Propose Change flow (or disabled if not member) -->
								{#if !canEdit}
									<div class="mr-auto">
										<Text variant="body" size="sm" color="tertiary">
											Only circle members can propose changes in active workspaces
										</Text>
									</div>
								{:else}
									<Button
										variant="primary"
										onclick={handleSaveDirectly}
										disabled={editRole.isSaving || !editRole.isDirty}
									>
										{editRole.isSaving ? 'Proposing...' : 'Propose Change'}
									</Button>
								{/if}
							{/if}
						</div>
					{/if}
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

	<!-- Confirm Discard Dialog -->
	<StandardDialog
		bind:open={showDiscardDialog}
		title="Discard unsaved changes?"
		description="You have unsaved changes. Are you sure you want to discard them?"
		submitLabel="Discard"
		cancelLabel="Keep Editing"
		variant="danger"
		onsubmit={handleConfirmDiscard}
	/>
{/if}
