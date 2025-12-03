<!--
  OrgStructureImporter.svelte
  Main component - Split-pane interface for importing org structures via text markup
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { parseOrgStructure, type ParseResult } from '../../utils/parseOrgStructure';
	import ImportTextarea from './ImportTextarea.svelte';
	import StructurePreview from './StructurePreview.svelte';

	// Props
	let { workspaceId, rootCircleId, workspaceSlug } = $props<{
		workspaceId: string;
		rootCircleId: string;
		workspaceSlug: string;
	}>();

	// State
	let textInput = $state('');
	let parseResult = $state<ParseResult | null>(null);
	let importing = $state(false);

	// Parse text with debouncing - untrack to avoid infinite loops
	let parseTimer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		const input = textInput; // capture in effect
		if (parseTimer !== undefined) {
			clearTimeout(parseTimer);
		}
		parseTimer = setTimeout(() => {
			if (input.trim()) {
				parseResult = parseOrgStructure(input);
			} else {
				parseResult = null;
			}
		}, 500);
	});

	// Convex client
	const convexClient = browser ? useConvexClient() : null;

	async function handleImport() {
		if (!parseResult?.success || !parseResult.root || !convexClient) return;

		importing = true;
		try {
			await convexClient.mutation(api.orgStructureImport.importOrgStructure, {
				sessionId: $page.data.sessionId,
				workspaceId: workspaceId,
				rootCircleId: rootCircleId,
				structure: parseResult.root
			});

			// Success: redirect to org chart
			goto(`/w/${workspaceSlug}/chart`);
		} catch (err) {
			console.error('Import failed:', err);
			alert('Import failed. See console for details.');
		} finally {
			importing = false;
		}
	}
</script>

<div class="grid h-full grid-cols-2 gap-section">
	<!-- Left: Text Editor -->
	<ImportTextarea bind:value={textInput} errors={parseResult?.errors ?? []} />

	<!-- Right: Live Preview -->
	<StructurePreview result={parseResult} onImport={handleImport} {importing} {workspaceId} />
</div>
