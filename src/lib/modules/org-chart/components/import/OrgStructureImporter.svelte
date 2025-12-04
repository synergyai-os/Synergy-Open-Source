<!--
  OrgStructureImporter.svelte
  Main component - Split-pane interface for importing org structures via text markup
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { parseOrgStructure, type ParseResult } from '../../utils/parseOrgStructure';
	import ImportTextarea from './ImportTextarea.svelte';
	import StructurePreview from './StructurePreview.svelte';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import * as AlertDialog from '$lib/components/organisms/AlertDialog.svelte';
	import { Button, Text } from '$lib/components/atoms';

	// Props
	let { workspaceId, rootCircleId, workspaceSlug, targetCircleId } = $props<{
		workspaceId: string;
		rootCircleId: string;
		workspaceSlug: string;
		targetCircleId?: string;
	}>();

	// State
	let textInput = $state('');
	let parseResult = $state<ParseResult | null>(null);
	let importing = $state(false);
	let showConfirmDialog = $state(false);

	// Query core role templates for validation
	const coreTemplatesQuery =
		browser && workspaceId && $page.data.sessionId
			? useQuery(api.roleTemplates.list, () => {
					const sessionId = $page.data.sessionId;
					if (!sessionId) throw new Error('sessionId required');
					return {
						sessionId,
						workspaceId: workspaceId as Id<'workspaces'>
					};
				})
			: null;

	const coreTemplates = $derived.by(() => {
		const data = coreTemplatesQuery?.data;
		if (!data) return [];
		// Combine system and workspace templates, filter for isCore: true
		const allTemplates = [...(data.system ?? []), ...(data.workspace ?? [])];
		return allTemplates.filter((t) => t.isCore === true && !t.archivedAt);
	});

	// Parse text with debouncing - untrack to avoid infinite loops
	let parseTimer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		const input = textInput; // capture in effect
		const templates = coreTemplates; // capture core templates
		if (parseTimer !== undefined) {
			clearTimeout(parseTimer);
		}
		parseTimer = setTimeout(() => {
			if (input.trim()) {
				parseResult = parseOrgStructure(input, templates);
			} else {
				parseResult = null;
			}
		}, 500);
	});

	// Convex client
	const convexClient = browser ? useConvexClient() : null;

	const hasCoreRoleWarnings = $derived((parseResult?.coreRoleWarnings?.length ?? 0) > 0);

	async function handleImport() {
		if (!parseResult?.success || !parseResult.root || !convexClient) return;

		// If there are core role warnings, show confirmation dialog
		if (hasCoreRoleWarnings) {
			showConfirmDialog = true;
			return;
		}

		// Proceed with import
		await performImport();
	}

	// Determine target circle (use targetCircleId if provided, otherwise rootCircleId)
	const effectiveTargetCircleId = $derived(targetCircleId || rootCircleId);

	// Query target circle name if targetCircleId is provided
	const targetCircleQuery =
		browser && targetCircleId && $page.data.sessionId
			? useQuery(api.circles.get, () => {
					const sessionId = $page.data.sessionId;
					if (!sessionId) throw new Error('sessionId required');
					return {
						sessionId,
						circleId: targetCircleId as Id<'circles'>
					};
				})
			: null;

	const targetCircle = $derived(targetCircleQuery?.data ?? null);

	async function performImport() {
		if (!parseResult?.success || !parseResult.root || !convexClient) return;

		showConfirmDialog = false;
		importing = true;
		try {
			await convexClient.mutation(api.orgStructureImport.importOrgStructure, {
				sessionId: $page.data.sessionId,
				workspaceId: workspaceId,
				rootCircleId: effectiveTargetCircleId,
				structure: parseResult.root
			});

			// Success: redirect to org chart
			goto(`/w/${workspaceSlug}/chart`);
		} catch (err) {
			console.error('Import failed:', err);
			const errorMessage =
				err instanceof Error ? err.message : 'Import failed. See console for details.';
			alert(errorMessage);
		} finally {
			importing = false;
		}
	}

	function handleCancelImport() {
		showConfirmDialog = false;
	}
</script>

<div class="flex h-full flex-col gap-section">
	<!-- Banner: Show when importing into a specific circle -->
	{#if targetCircleId && targetCircle}
		<div
			class="border-base rounded-card border bg-subtle px-page py-button text-body text-secondary"
		>
			<span class="font-medium">Importing into:</span>
			{targetCircle.name}
		</div>
	{/if}

	<div class="grid flex-1 grid-cols-2 gap-section">
		<!-- Left: Text Editor -->
		<ImportTextarea bind:value={textInput} errors={parseResult?.errors ?? []} />

		<!-- Right: Live Preview -->
		<StructurePreview
			result={parseResult}
			onImport={handleImport}
			{importing}
			{workspaceId}
			{coreTemplates}
		/>
	</div>
</div>

<!-- Confirmation Dialog for Core Role Warnings -->
<AlertDialog.Root bind:open={showConfirmDialog}>
	<AlertDialog.Portal>
		<AlertDialog.Overlay class="fixed inset-0 z-50 bg-black/50" />
		<AlertDialog.Content
			class="border-base shadow-card-hover p-modal fixed top-[50%] left-[50%] z-50 max-h-[90vh] w-[min(100%,90vw)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card border bg-elevated"
		>
			<AlertDialog.Title>
				<Text variant="h3">⚠️ Core Role Detected</Text>
			</AlertDialog.Title>
			<AlertDialog.Description class="mt-fieldGroup">
				<Text variant="body" color="secondary">
					You're trying to import {parseResult?.coreRoleWarnings.length ?? 0} core role
					{parseResult?.coreRoleWarnings.length === 1 ? '' : 's'}, but these roles are automatically
					created for every circle.
				</Text>
				<div class="mt-fieldGroup">
					<Text variant="body" size="sm" color="secondary" class="font-medium">
						Core roles found:
					</Text>
					<ul class="mt-1 list-inside list-disc space-y-1">
						{#each parseResult?.coreRoleWarnings ?? [] as warning (warning.lineNumber)}
							<li class="text-sm text-secondary">
								Line {warning.lineNumber}: {warning.message.split('.')[0]}
							</li>
						{/each}
					</ul>
				</div>
				<Text variant="body" size="sm" color="warning" class="mt-fieldGroup">
					💡 Tip: Remove these lines from your import to avoid duplicates. Core roles will be
					automatically created.
				</Text>
			</AlertDialog.Description>
			<div class="mt-section flex justify-end gap-button">
				<AlertDialog.Cancel>
					<Button variant="secondary" onclick={handleCancelImport}>Cancel</Button>
				</AlertDialog.Cancel>
				<AlertDialog.Action>
					<Button variant="primary" onclick={performImport}>Import Anyway</Button>
				</AlertDialog.Action>
			</div>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>
