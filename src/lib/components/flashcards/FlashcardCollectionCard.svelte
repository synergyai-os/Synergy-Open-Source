<script lang="ts">
	import type { Id } from '../../../../convex/_generated/dataModel';

	type Props = {
		collection: {
			tagId: Id<'tags'> | 'all';
			name: string;
			color?: string;
			count: number;
			dueCount?: number;
		};
		onClick: () => void;
	};

	let { collection, onClick }: Props = $props();
</script>

<button
	type="button"
	onclick={onClick}
	class="group relative flex w-full flex-col rounded-lg border border-base bg-elevated p-inbox-container text-left transition-all duration-200 hover:border-accent-primary hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/30"
>
	<!-- Collection Name -->
	<div class="mb-4 flex items-center gap-icon">
		{#if collection.color && collection.tagId !== 'all'}
			<div
				class="ring-base h-4 w-4 flex-shrink-0 rounded-full ring-2"
				style="background-color: {collection.color};"
			></div>
		{:else}
			<svg
				class="h-5 w-5 flex-shrink-0 text-accent-primary"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
				/>
			</svg>
		{/if}
		<h3
			class="text-lg leading-tight font-semibold text-primary transition-colors group-hover:text-accent-primary"
		>
			{collection.name}
		</h3>
	</div>

	<!-- Counts -->
	<div class="flex items-center gap-icon text-sm text-secondary">
		<span>{collection.count} card{collection.count !== 1 ? 's' : ''}</span>
		{#if collection.dueCount !== undefined && collection.dueCount > 0}
			<span class="font-semibold text-accent-primary">• {collection.dueCount} due</span>
		{:else if collection.count > 0}
			<span>• All caught up</span>
		{/if}
	</div>
</button>
