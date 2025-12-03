<!--
  ImportTextarea.svelte
  Left panel - text editor for org structure markup with syntax help and error display
-->
<script lang="ts">
	import { Text } from '$lib/components/atoms';
	import type { ParseError } from '../../utils/parseOrgStructure';

	let {
		value = $bindable(''),
		errors = []
	}: {
		value: string;
		errors: ParseError[];
	} = $props();

	let showHelp = $state(false);

	const syntaxExamples = `# Sales Team Structure
- circle: Sales
  purpose: Drive revenue and customer acquisition
  
  -- role: Sales Director
     purpose: Lead sales strategy and team
  
  -- role: Account Manager
     purpose: Manage customer relationships
  
  -- circle: Sales Operations
     purpose: Enable sales team efficiency
     
     --- role: Sales Ops Lead
         purpose: Optimize sales processes`;
</script>

<div class="flex h-full flex-col gap-form">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<Text variant="h3">Import Structure</Text>
		<button
			onclick={() => (showHelp = !showHelp)}
			class="text-label text-secondary hover:text-primary"
		>
			{showHelp ? '✕ Close Help' : '? Syntax Help'}
		</button>
	</div>

	{#if showHelp}
		<div class="border-base rounded-card border bg-elevated inset-md">
			<Text variant="body" size="sm" color="secondary" class="mb-fieldGroup">
				<strong>Syntax:</strong>
			</Text>
			<pre class="overflow-x-auto text-sm"><code>{syntaxExamples}</code></pre>
		</div>
	{/if}

	<!-- Textarea -->
	<textarea
		bind:value
		placeholder="Paste or type your org structure here..."
		class="border-base flex-1 rounded-input border bg-surface px-input py-input font-mono text-sm focus:border-accent-primary focus:outline-none"
		spellcheck="false"
	></textarea>

	<!-- Errors -->
	{#if errors.length > 0}
		<div class="bg-error-subtle rounded-card border border-error inset-md">
			<Text variant="body" size="sm" color="error" class="mb-fieldGroup font-medium">
				{errors.length} error{errors.length > 1 ? 's' : ''} found:
			</Text>
			<ul class="list-inside list-disc space-y-1">
				{#each errors as error (error.lineNumber)}
					<li class="text-sm text-error">
						Line {error.lineNumber}: {error.message}
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
