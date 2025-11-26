<script lang="ts">
	import type { Id } from '$lib/convex';

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
	class="group relative flex w-full flex-col rounded-card border border-base bg-elevated px-inbox-container py-inbox-container text-left transition-all duration-200 hover:border-accent-primary hover:shadow-card-hover"
>
	<!-- Collection Name -->
	<div class="mb-inbox-title flex items-center gap-2">
		{#if collection.color && collection.tagId !== 'all'}
			<div
				class="ring-base size-icon-sm flex-shrink-0 rounded-avatar ring-2"
				style="background-color: {collection.color};"
			></div>
		{:else}
			<svg
				class="size-icon-md flex-shrink-0 text-accent-primary"
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
			class="text-h3 leading-tight font-semibold text-primary transition-colors group-hover:text-accent-primary"
		>
			{collection.name}
		</h3>
	</div>

	<!-- Counts -->
	<div class="flex items-center gap-2 text-small text-secondary">
		<span>{collection.count} card{collection.count !== 1 ? 's' : ''}</span>
		{#if collection.dueCount !== undefined && collection.dueCount > 0}
			<span class="font-semibold text-accent-primary">• {collection.dueCount} due</span>
		{:else if collection.count > 0}
			<span>• All caught up</span>
		{/if}
	</div>
</button>
