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
	class="group relative bg-elevated border border-base rounded-lg p-inbox-container hover:border-accent-primary transition-all duration-200 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/30 w-full text-left flex flex-col"
>
	<!-- Collection Name -->
	<div class="flex items-center gap-icon mb-4">
		{#if collection.color && collection.tagId !== 'all'}
			<div
				class="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-base"
				style="background-color: {collection.color};"
			></div>
		{:else}
			<svg
				class="w-5 h-5 text-accent-primary flex-shrink-0"
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
		<h3 class="text-lg font-semibold text-primary group-hover:text-accent-primary transition-colors leading-tight">
			{collection.name}
		</h3>
	</div>

	<!-- Counts -->
	<div class="flex items-center gap-icon text-sm text-secondary">
		<span>{collection.count} card{collection.count !== 1 ? 's' : ''}</span>
		{#if collection.dueCount !== undefined && collection.dueCount > 0}
			<span class="text-accent-primary font-semibold">• {collection.dueCount} due</span>
		{:else if collection.count > 0}
			<span>• All caught up</span>
		{/if}
	</div>
</button>

