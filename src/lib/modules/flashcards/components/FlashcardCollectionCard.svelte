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
	class="group border-base px-inbox-container py-inbox-container hover:shadow-card-hover rounded-card bg-elevated hover:border-accent-primary relative flex w-full flex-col border text-left transition-all duration-200"
>
	<!-- Collection Name -->
	<div class="mb-inbox-title flex items-center gap-2">
		{#if collection.color && collection.tagId !== 'all'}
			<div
				class="ring-base size-icon-sm rounded-avatar flex-shrink-0 ring-2"
				style="background-color: {collection.color};"
			></div>
		{:else}
			<svg
				class="size-icon-md text-accent-primary flex-shrink-0"
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
			class="text-h3 text-primary group-hover:text-accent-primary leading-tight font-semibold transition-colors"
		>
			{collection.name}
		</h3>
	</div>

	<!-- Counts -->
	<div class="text-small text-secondary flex items-center gap-2">
		<span>{collection.count} card{collection.count !== 1 ? 's' : ''}</span>
		{#if collection.dueCount !== undefined && collection.dueCount > 0}
			<span class="text-accent-primary font-semibold">• {collection.dueCount} due</span>
		{:else if collection.count > 0}
			<span>• All caught up</span>
		{/if}
	</div>
</button>
