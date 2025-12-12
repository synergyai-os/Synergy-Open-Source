<!--
  PreviewTree.svelte
  Recursive component to display parsed org structure tree in preview panel
-->
<script lang="ts">
	import { Text } from '$lib/components/atoms';
	import type { ParsedNode } from '../../utils/parseOrgStructure';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import PreviewTree from './PreviewTree.svelte';

	type CoreTemplate = {
		_id: Id<'roleTemplates'>;
		name: string;
		description?: string;
		isCore: boolean;
		isRequired?: boolean;
	};

	// Extended node type for virtual core roles
	type DisplayNode = ParsedNode & { isAutoCreated?: boolean };

	let {
		node,
		coreTemplates = []
	}: {
		node: ParsedNode;
		coreTemplates?: CoreTemplate[];
	} = $props();

	const icon = node.type === 'circle' ? '⭕' : '👤';
	const typeLabel = node.type === 'circle' ? 'Circle' : 'Role';

	// For circles, create virtual core role nodes
	const coreRoleNodes = $derived((): DisplayNode[] => {
		if (node.type !== 'circle' || coreTemplates.length === 0) return [];
		return coreTemplates.map((template) => ({
			type: 'role' as const,
			name: template.name,
			purpose: template.description,
			depth: node.depth + 1,
			lineNumber: 0, // Virtual node, no line number
			children: [],
			isAutoCreated: true
		}));
	});

	// Combine user-defined children with auto-created core roles
	const allChildren = $derived((): DisplayNode[] => {
		const userChildren: DisplayNode[] = node.children.map((c) => ({ ...c, isAutoCreated: false }));
		const coreRoles = coreRoleNodes();
		// Core roles come first, then user-defined children
		return [...coreRoles, ...userChildren];
	});
</script>

<div class="mb-fieldGroup">
	<!-- Node Header -->
	<div class="gap-fieldGroup flex items-start">
		<span class="text-secondary">{icon}</span>
		<div class="flex-1">
			<Text variant="body" size="sm" class="font-medium">
				{node.name} <span class="text-secondary">({typeLabel})</span>
			</Text>
			{#if node.purpose}
				<Text variant="body" size="sm" color="secondary" class="mt-1">
					{node.purpose}
				</Text>
			{/if}
		</div>
	</div>

	<!-- Children (user-defined + auto-created core roles) -->
	{#if allChildren().length > 0}
		<div class="border-base pl-fieldGroup mt-fieldGroup ml-6 border-l">
			{#each allChildren() as child (child.isAutoCreated ? `auto-${child.name}` : child.lineNumber)}
				{#if child.isAutoCreated}
					<!-- Auto-created core role -->
					<div class="mb-fieldGroup">
						<div class="gap-fieldGroup flex items-start">
							<span class="text-secondary">👤</span>
							<div class="flex-1">
								<Text variant="body" size="sm" class="font-medium">
									{child.name} <span class="text-secondary">(Role)</span>
									<span class="text-tertiary ml-1 text-xs">🤖 Auto-created</span>
								</Text>
								{#if child.purpose}
									<Text variant="body" size="sm" color="secondary" class="mt-1">
										{child.purpose}
									</Text>
								{/if}
							</div>
						</div>
					</div>
				{:else}
					<!-- User-defined node (recursive) -->
					<PreviewTree node={child} {coreTemplates} />
				{/if}
			{/each}
		</div>
	{/if}
</div>
