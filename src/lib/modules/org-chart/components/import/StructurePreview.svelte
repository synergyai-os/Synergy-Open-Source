<!--
  StructurePreview.svelte
  Right panel - live preview of parsed structure with stats and import action
-->
<script lang="ts">
	import { Button, Text } from '$lib/components/atoms';
	import type { ParseResult, ParsedNode } from '../../utils/parseOrgStructure';
	import PreviewTree from './PreviewTree.svelte';

	type CoreTemplate = {
		_id: string;
		name: string;
		description?: string;
		isCore: boolean;
		isRequired?: boolean;
	};

	let {
		result,
		onImport,
		importing,
		workspaceId: _workspaceId,
		coreTemplates = []
	}: {
		result: ParseResult | null;
		onImport: () => Promise<void>;
		importing: boolean;
		workspaceId: string;
		coreTemplates?: CoreTemplate[];
	} = $props();

	const canImport = $derived(result?.success && result.root !== null && result.errors.length === 0);

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

				{#if result.coreRoleWarnings.length > 0}
					<div class="bg-warning-subtle rounded-card border border-warning inset-md mt-fieldGroup">
						<Text variant="body" size="sm" color="warning" class="mb-fieldGroup font-medium">
							⚠️ Core Role Warning{result.coreRoleWarnings.length > 1 ? 's' : ''}
						</Text>
						<ul class="list-inside list-disc space-y-1">
							{#each result.coreRoleWarnings as warning (warning.lineNumber)}
								<li class="text-sm text-warning">
									Line {warning.lineNumber}: {warning.message}
								</li>
							{/each}
						</ul>
						<Text variant="body" size="xs" color="warning" class="mt-fieldGroup">
							💡 Tip: Core roles are automatically created for every circle. Remove these lines to
							avoid duplicates.
						</Text>
					</div>
				{/if}

				{#if result.warnings.length > result.coreRoleWarnings.length}
					<Text variant="body" size="sm" color="warning" class="mt-fieldGroup">
						⚠️ {result.warnings.length - result.coreRoleWarnings.length} other warning{result
							.warnings.length -
							result.coreRoleWarnings.length >
						1
							? 's'
							: ''}
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
