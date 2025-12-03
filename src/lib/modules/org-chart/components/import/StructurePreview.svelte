<!--
  StructurePreview.svelte
  Right panel - live preview of parsed structure with stats and import action
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { Button, Text } from '$lib/components/atoms';
	import type { ParseResult, ParsedNode } from '../../utils/parseOrgStructure';
	import PreviewTree from './PreviewTree.svelte';
	import type { Id } from '$lib/convex/_generated/dataModel';

	let {
		result,
		onImport,
		importing,
		workspaceId
	}: {
		result: ParseResult | null;
		onImport: () => Promise<void>;
		importing: boolean;
		workspaceId: string;
	} = $props();

	const canImport = $derived(result?.success && result.root !== null && result.errors.length === 0);

	// Query core role templates
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

	const stats = $derived(() => {
		if (!result?.root) return null;

		let circleCount = 0;
		let roleCount = 0;

		function countNodes(node: ParsedNode) {
			if (node.type === 'circle') {
				circleCount++;
			} else {
				roleCount++;
			}
			node.children.forEach(countNodes);
		}

		result.root.children.forEach(countNodes);

		// Core roles are auto-created for each circle (excluding root)
		const coreRoleCount = circleCount * coreTemplates.length;

		return { circleCount, roleCount, coreRoleCount };
	});
</script>

<div class="flex h-full flex-col gap-form">
	<!-- Header -->
	<Text variant="h3">Preview</Text>

	{#if result?.root}
		<!-- Tree Preview -->
		<div class="border-base flex-1 overflow-y-auto rounded-card border bg-surface inset-md">
			<PreviewTree node={result.root} {coreTemplates} />
		</div>

		<!-- Stats -->
		{#if stats()}
			<div class="border-base rounded-card border bg-elevated inset-md">
				<Text variant="body" size="sm" color="secondary">
					Will create: <strong>{stats().circleCount} circles</strong>,
					<strong>{stats().roleCount} roles</strong>
					{#if stats().coreRoleCount > 0}
						, <strong>{stats().coreRoleCount} core roles</strong> (auto-created)
					{/if}
				</Text>

				<div class="flex items-center gap-fieldGroup mt-fieldGroup">
					<span class="bg-warning-subtle rounded-full px-2 py-1 text-xs text-warning">
						📝 Draft
					</span>
					<Text variant="body" size="sm" color="secondary">All items will start as drafts</Text>
				</div>

				{#if result.warnings.length > 0}
					<Text variant="body" size="sm" color="warning" class="mt-fieldGroup">
						⚠️ {result.warnings.length} warning{result.warnings.length > 1 ? 's' : ''}
					</Text>
				{/if}
			</div>
		{/if}
	{:else}
		<div
			class="border-base flex flex-1 items-center justify-center rounded-card border border-dashed"
		>
			<Text variant="body" color="secondary">Enter structure on the left to see preview</Text>
		</div>
	{/if}

	<!-- Actions -->
	<div class="flex justify-end gap-button">
		<Button variant="secondary" onclick={() => history.back()}>Cancel</Button>
		<Button variant="primary" disabled={!canImport || importing} onclick={onImport}>
			{importing ? 'Importing...' : 'Import Structure'}
		</Button>
	</div>
</div>
